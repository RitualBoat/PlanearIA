import { randomUUID } from 'node:crypto';
import {
  lstat,
  readFile,
  readdir,
} from 'node:fs/promises';

import { ConstructorError } from './errors.mjs';
import { normalizeLf, sha256, sha256Json } from './hash.mjs';
import { stableStringify } from './json.mjs';
import {
  assertNoSymlinkEscape,
  resolveInside,
} from './paths.mjs';
import { preflightTarget } from './preflight.mjs';
import { atomicWrite } from './transaction.mjs';
import {
  checkLocalOpenSpec,
  desiredBlockText,
  findOpsxGeneratedFiles,
  loadOpsxContract,
  rewriteBareOpenSpecCommands,
} from './opsx-check.mjs';

const TRANSACTION_ROOT = '.project-constructor/opsx-transactions';
const ACTIVE_STATUSES = new Set(['applying', 'failed', 'rolling-back']);
const TERMINAL_STATUSES = new Set(['completed', 'rolled-back']);

function transactionRelative(transactionId, suffix) {
  return `${TRANSACTION_ROOT}/${transactionId}/${suffix}`;
}

function backupRelative(transactionId, target) {
  return transactionRelative(
    transactionId,
    `backups/${sha256(Buffer.from(target, 'utf8'))}.bak`,
  );
}

async function snapshot(targetRoot, target) {
  await assertNoSymlinkEscape(targetRoot, target);
  const absolute = resolveInside(targetRoot, target);
  let stats;
  try {
    stats = await lstat(absolute);
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return { content: null, hash: null };
    }
    throw error;
  }
  if (!stats.isFile() || stats.isSymbolicLink()) {
    throw new ConstructorError(
      'OPSX_TARGET_NOT_REGULAR_FILE',
      `${target} debe ser un archivo regular, no un enlace o directorio.`,
    );
  }
  const content = await readFile(absolute);
  return {
    content,
    hash: sha256(content),
  };
}

function count(text, needle) {
  let occurrences = 0;
  let cursor = 0;
  while ((cursor = text.indexOf(needle, cursor)) !== -1) {
    occurrences += 1;
    cursor += needle.length;
  }
  return occurrences;
}

export function applyManagedBlock(text, block) {
  const normalized = normalizeLf(text);
  const startCount = count(normalized, block.start);
  const endCount = count(normalized, block.end);
  const desired = desiredBlockText(block);

  if (startCount === 0 && endCount === 0) {
    const separator = normalized.endsWith('\n\n')
      ? ''
      : normalized.endsWith('\n')
        ? '\n'
        : '\n\n';
    return `${normalized}${separator}${desired}\n`;
  }
  if (startCount !== 1 || endCount !== 1) {
    throw new ConstructorError(
      'OPSX_BLOCK_SHAPE_DRIFT',
      `Los delimitadores de ${block.id} no son únicos.`,
      {
        details: [`start=${startCount}`, `end=${endCount}`],
        remediation:
          'Restaure la salida oficial o resuelva manualmente el bloque; el adaptador no adivina.',
      },
    );
  }

  const startIndex = normalized.indexOf(block.start);
  const endIndex = normalized.indexOf(block.end, startIndex + block.start.length);
  if (endIndex < startIndex) {
    throw new ConstructorError(
      'OPSX_BLOCK_SHAPE_DRIFT',
      `Los delimitadores de ${block.id} están invertidos.`,
    );
  }
  return `${normalized.slice(0, startIndex)}${desired}${normalized.slice(
    endIndex + block.end.length,
  )}`;
}

export async function buildOpsxAdaptPlan(targetRoot, contract) {
  const generatedFiles = await findOpsxGeneratedFiles(targetRoot, contract);
  const generatedSet = new Set(generatedFiles);
  const missingGlobs = contract.generatedGlobs.filter((glob, index) => (
    !generatedFiles.some((target) => contract.matchers[index].test(target))
  ));
  const requiredTargets = contract.managedBlocks
    .filter((block) => block.required)
    .flatMap((block) => block.targets);
  const missingTargets = requiredTargets.filter((target) => !generatedSet.has(target));
  if (missingGlobs.length > 0 || missingTargets.length > 0) {
    throw new ConstructorError(
      'OPSX_GENERATED_FILES_MISSING',
      'Faltan superficies oficiales de OpenSpec; opsx-adapt no las genera.',
      {
        details: [
          ...missingGlobs.map((glob) => `glob: ${glob}`),
          ...missingTargets.map((target) => `target: ${target}`),
        ],
        remediation: `Ejecute \`${contract.commands.init}\` y vuelva a ejecutar opsx-adapt.`,
      },
    );
  }

  const blocksByTarget = new Map();
  for (const block of contract.managedBlocks) {
    for (const target of block.targets) {
      blocksByTarget.set(target, block);
    }
  }

  const operations = [];
  for (const target of generatedFiles) {
    const before = await snapshot(targetRoot, target);
    let afterText = rewriteBareOpenSpecCommands(
      before.content.toString('utf8'),
      contract.commandRewrite.to,
    );
    const block = blocksByTarget.get(target);
    if (block) {
      afterText = applyManagedBlock(afterText, block);
    }
    const after = Buffer.from(normalizeLf(afterText), 'utf8');
    const afterHash = sha256(after);
    if (afterHash !== before.hash) {
      operations.push({
        after,
        afterHash,
        before: before.content,
        beforeHash: before.hash,
        target,
      });
    }
  }
  return {
    contractHash: sha256Json({
      commandRewrite: contract.commandRewrite,
      generatedGlobs: contract.generatedGlobs,
      managedBlocks: contract.managedBlocks.map((block) => ({
        content: block.content,
        end: block.end,
        id: block.id,
        start: block.start,
        targets: block.targets,
        workflow: block.workflow,
      })),
      version: contract.version,
    }),
    generatedFiles,
    operations,
  };
}

async function writeJournal(targetRoot, journal) {
  journal.updatedAt = new Date().toISOString();
  await atomicWrite(
    resolveInside(targetRoot, transactionRelative(journal.id, 'journal.json')),
    Buffer.from(stableStringify(journal), 'utf8'),
  );
}

async function readJournal(targetRoot, transactionId) {
  const relative = transactionRelative(transactionId, 'journal.json');
  let journal;
  try {
    journal = JSON.parse(await readFile(resolveInside(targetRoot, relative), 'utf8'));
  } catch (error) {
    throw new ConstructorError(
      'OPSX_TRANSACTION_CORRUPT',
      `No se puede leer ${relative}.`,
      {
        cause: error,
        details: [error.message],
      },
    );
  }
  if (
    journal?.schemaVersion !== '1.0.0'
    || journal.id !== transactionId
    || journal.command !== 'opsx-adapt'
    || !Array.isArray(journal.operations)
    || (
      !ACTIVE_STATUSES.has(journal.status)
      && !TERMINAL_STATUSES.has(journal.status)
    )
  ) {
    throw new ConstructorError(
      'OPSX_TRANSACTION_CORRUPT',
      `${relative} no cumple el contrato de journal OPSX.`,
    );
  }
  return journal;
}

async function rollbackJournal(targetRoot, journal) {
  const restore = [];
  for (const operation of [...journal.operations].reverse()) {
    const current = await snapshot(targetRoot, operation.target);
    if (current.hash === operation.beforeHash) {
      continue;
    }
    if (current.hash !== operation.afterHash) {
      throw new ConstructorError(
        'OPSX_ROLLBACK_CONFLICT',
        `${operation.target} cambió después de la ejecución parcial.`,
        {
          remediation:
            'Preserve la edición y restaure manualmente el hash esperado antes de reintentar.',
        },
      );
    }
    const backup = await readFile(resolveInside(targetRoot, operation.backup));
    if (sha256(backup) !== operation.beforeHash) {
      throw new ConstructorError(
        'OPSX_BACKUP_INVALID',
        `El backup de ${operation.target} no coincide con su hash.`,
      );
    }
    restore.push({ content: backup, operation });
  }

  journal.status = 'rolling-back';
  await writeJournal(targetRoot, journal);
  for (const item of restore) {
    await atomicWrite(
      resolveInside(targetRoot, item.operation.target),
      item.content,
    );
    item.operation.status = 'rolled-back';
    await writeJournal(targetRoot, journal);
  }
  journal.status = 'rolled-back';
  await writeJournal(targetRoot, journal);
}

async function recoverIncompleteTransactions(targetRoot) {
  const root = resolveInside(targetRoot, TRANSACTION_ROOT);
  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
  const recovered = [];
  for (const entry of entries
    .filter((candidate) => candidate.isDirectory())
    .sort((left, right) => right.name.localeCompare(left.name))) {
    const journal = await readJournal(targetRoot, entry.name);
    if (ACTIVE_STATUSES.has(journal.status)) {
      await rollbackJournal(targetRoot, journal);
      recovered.push(journal.id);
    }
  }
  return recovered;
}

async function executeOpsxPlan({
  contractHash,
  injectFailureAfter,
  operations,
  targetRoot,
}) {
  if (operations.length === 0) {
    return null;
  }
  const transactionId = `${Date.now()}-${randomUUID()}`;
  const createdAt = new Date().toISOString();
  const journal = {
    command: 'opsx-adapt',
    contractHash,
    createdAt,
    id: transactionId,
    lastError: null,
    operations: operations.map((operation) => ({
      afterHash: operation.afterHash,
      backup: backupRelative(transactionId, operation.target),
      beforeHash: operation.beforeHash,
      status: 'pending',
      target: operation.target,
    })),
    schemaVersion: '1.0.0',
    status: 'applying',
    updatedAt: createdAt,
  };

  for (let index = 0; index < operations.length; index += 1) {
    await atomicWrite(
      resolveInside(targetRoot, journal.operations[index].backup),
      operations[index].before,
    );
  }
  await writeJournal(targetRoot, journal);

  let applied = 0;
  try {
    for (let index = 0; index < operations.length; index += 1) {
      const operation = operations[index];
      const current = await snapshot(targetRoot, operation.target);
      if (current.hash !== operation.beforeHash) {
        throw new ConstructorError(
          'OPSX_CHANGED_AFTER_PREFLIGHT',
          `${operation.target} cambió después del preflight.`,
        );
      }
      await atomicWrite(resolveInside(targetRoot, operation.target), operation.after);
      const written = await snapshot(targetRoot, operation.target);
      if (written.hash !== operation.afterHash) {
        throw new ConstructorError(
          'OPSX_WRITE_VERIFICATION_FAILED',
          `${operation.target} no coincide después de escribir.`,
        );
      }
      journal.operations[index].status = 'applied';
      applied += 1;
      await writeJournal(targetRoot, journal);
      if (injectFailureAfter !== null && applied >= injectFailureAfter) {
        throw new ConstructorError(
          'OPSX_INJECTED_FAILURE',
          `Fallo de fixture inyectado después de ${applied} archivo(s).`,
        );
      }
    }
    journal.status = 'completed';
    await writeJournal(targetRoot, journal);
    return {
      changes: operations.length,
      transactionId,
    };
  } catch (error) {
    journal.lastError = {
      code: error?.code ?? 'OPSX_ADAPT_FAILED',
      message: error instanceof Error ? error.message : String(error),
    };
    journal.status = 'failed';
    await writeJournal(targetRoot, journal);
    await rollbackJournal(targetRoot, journal);
    throw error;
  }
}

export async function runOpsxAdapt({
  injectFailureAfter = null,
  targetRoot = process.cwd(),
} = {}) {
  const preflight = await preflightTarget(targetRoot, { writable: true });
  const recoveredTransactions = await recoverIncompleteTransactions(preflight.target);
  const contract = await loadOpsxContract(preflight.target);
  const local = await checkLocalOpenSpec(preflight.target, contract);
  if (local.status !== 'PASS') {
    throw new ConstructorError(
      'OPSX_LOCAL_CLI_UNAVAILABLE',
      local.summary,
      {
        details: [local.cause],
        remediation: local.remediation,
      },
    );
  }
  const plan = await buildOpsxAdaptPlan(preflight.target, contract);
  const parsedFailureAfter = injectFailureAfter === null
    ? null
    : Number.parseInt(String(injectFailureAfter), 10);
  if (
    parsedFailureAfter !== null
    && (!Number.isInteger(parsedFailureAfter) || parsedFailureAfter < 1)
  ) {
    throw new ConstructorError(
      'OPSX_INJECT_VALUE_INVALID',
      '--inject-failure-after requiere un entero positivo.',
    );
  }
  const transaction = await executeOpsxPlan({
    contractHash: plan.contractHash,
    injectFailureAfter: parsedFailureAfter,
    operations: plan.operations,
    targetRoot: preflight.target,
  });
  return {
    command: 'opsx-adapt',
    exitCode: 0,
    mutationPerformed: transaction !== null || recoveredTransactions.length > 0,
    plan: {
      contractHash: plan.contractHash,
      generatedFileCount: plan.generatedFiles.length,
      operations: plan.operations.map((operation) => ({
        afterHash: operation.afterHash,
        beforeHash: operation.beforeHash,
        operation: 'update',
        owner: 'external-openspec',
        target: operation.target,
      })),
      summary: {
        conflicts: 0,
        creates: 0,
        deletes: 0,
        preserves: plan.generatedFiles.length - plan.operations.length,
        stateUpdate: false,
        updates: plan.operations.length,
      },
    },
    recoveredTransactions,
    mode: 'apply',
    status: transaction === null ? 'IN_SYNC' : 'APPLIED',
    transaction,
  };
}
