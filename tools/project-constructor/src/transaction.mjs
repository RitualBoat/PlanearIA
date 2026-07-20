import { randomUUID } from 'node:crypto';
import {
  lstat,
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  unlink,
  writeFile,
} from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';

import {
  EXIT_CODES,
  STATE_RELATIVE_PATH,
  TRANSACTIONS_RELATIVE_PATH,
} from './constants.mjs';
import { ConstructorError } from './errors.mjs';
import { sha256 } from './hash.mjs';
import { stableStringify } from './json.mjs';
import {
  assertNoSymlinkEscape,
  normalizeRelativePath,
  resolveInside,
} from './paths.mjs';
import { stateAbsolutePath } from './state.mjs';

const JOURNAL_FORMAT_VERSION = 1;
const SAFE_TRANSACTION_ID = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,127}$/;

async function readFileSnapshot(path) {
  try {
    const stats = await lstat(path);
    if (!stats.isFile()) {
      throw new ConstructorError(
        'TRANSACTION_PATH_NOT_FILE',
        `La ruta transaccional ${path} no es un archivo regular.`,
      );
    }
    const content = await readFile(path);
    return {
      content,
      exists: true,
      hash: sha256(content),
    };
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return {
        content: null,
        exists: false,
        hash: null,
      };
    }
    throw error;
  }
}

export async function atomicWrite(path, content) {
  await mkdir(dirname(path), { recursive: true });
  const temporary = join(
    dirname(path),
    `.${basename(path)}.project-constructor-${process.pid}-${randomUUID()}.tmp`,
  );

  try {
    await writeFile(temporary, content, { flag: 'wx' });
    await rename(temporary, path);
  } catch (error) {
    await rm(temporary, { force: true }).catch(() => {});
    throw error;
  }
}

function journalRelativePath(transactionId) {
  return `${TRANSACTIONS_RELATIVE_PATH}/${transactionId}/journal.json`;
}

function backupRelativePath(transactionId, target) {
  const digest = sha256(Buffer.from(target, 'utf8'));
  return `${TRANSACTIONS_RELATIVE_PATH}/${transactionId}/backups/${digest}.bak`;
}

function stateBackupRelativePath(transactionId) {
  return `${TRANSACTIONS_RELATIVE_PATH}/${transactionId}/backups/state.json.bak`;
}

function assertTransactionId(transactionId) {
  if (typeof transactionId !== 'string' || !SAFE_TRANSACTION_ID.test(transactionId)) {
    throw new ConstructorError('TRANSACTION_ID_INVALID', 'El ID de transacción no es válido.', {
      details: String(transactionId),
    });
  }
}

async function writeJournal(targetRoot, journal) {
  const path = resolveInside(
    targetRoot,
    journalRelativePath(journal.id),
    'journal de transacción',
  );
  await atomicWrite(path, Buffer.from(stableStringify(journal), 'utf8'));
}

export async function readTransaction(targetRoot, transactionId) {
  assertTransactionId(transactionId);
  const path = resolveInside(targetRoot, journalRelativePath(transactionId));
  let raw;
  try {
    raw = JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    throw new ConstructorError(
      error instanceof SyntaxError ? 'TRANSACTION_JOURNAL_INVALID' : 'TRANSACTION_NOT_FOUND',
      error instanceof SyntaxError
        ? `El journal ${transactionId} no contiene JSON válido.`
        : `No existe el journal ${transactionId}.`,
      {
        details: error.message,
        cause: error,
      },
    );
  }

  if (
    raw.journalFormatVersion !== JOURNAL_FORMAT_VERSION
    || raw.id !== transactionId
    || !Array.isArray(raw.operations)
  ) {
    throw new ConstructorError(
      'TRANSACTION_JOURNAL_SCHEMA',
      `El journal ${transactionId} no cumple el schema soportado.`,
    );
  }
  return raw;
}

export async function findIncompleteTransaction(targetRoot) {
  const root = resolveInside(targetRoot, TRANSACTIONS_RELATIVE_PATH);
  let directories;
  try {
    directories = await readdir(root, { withFileTypes: true });
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return null;
    }
    throw error;
  }

  const incomplete = [];
  for (const directory of directories
    .filter((entry) => entry.isDirectory() && SAFE_TRANSACTION_ID.test(entry.name))
    .sort((left, right) => left.name.localeCompare(right.name))) {
    const journal = await readTransaction(targetRoot, directory.name);
    if (journal.status === 'applying' || journal.status === 'failed') {
      incomplete.push(journal);
    }
  }

  if (incomplete.length > 1) {
    throw new ConstructorError(
      'MULTIPLE_INCOMPLETE_TRANSACTIONS',
      'Hay más de una transacción incompleta y no es seguro elegir automáticamente.',
      {
        details: incomplete.map((journal) => journal.id),
        remediation: 'Inspeccione los journals y ejecute rollback explícito hasta dejar uno o ninguno.',
      },
    );
  }

  return incomplete[0] ?? null;
}

function newTransactionId() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `tx-${timestamp}-${randomUUID().slice(0, 8)}`;
}

async function createTransaction({
  command,
  plan,
  targetRoot,
}) {
  const id = newTransactionId();
  const stateSnapshot = await readFileSnapshot(stateAbsolutePath(targetRoot));
  const operations = plan.materialItems.map((item) => ({
    afterHash: item.afterHash,
    backup: null,
    beforeHash: item.beforeHash,
    operation: item.operation,
    owner: item.entry.owner,
    source: item.entry.source,
    status: 'pending',
    target: item.target,
  }));
  const journal = {
    blueprintHash: plan.blueprintHash,
    command,
    configurationHash: plan.configurationHash,
    id,
    journalFormatVersion: JOURNAL_FORMAT_VERSION,
    lastError: null,
    operations,
    state: {
      afterHash: null,
      backup: null,
      beforeHash: stateSnapshot.hash,
      status: plan.requiresStateWrite ? 'pending' : 'not-required',
    },
    status: 'applying',
  };

  await writeJournal(targetRoot, journal);
  return journal;
}

function verifyResumeContract(journal, plan) {
  if (
    journal.blueprintHash !== plan.blueprintHash
    || journal.configurationHash !== plan.configurationHash
  ) {
    throw new ConstructorError(
      'TRANSACTION_INPUT_CHANGED',
      `La transacción ${journal.id} no corresponde al blueprint/configuración actuales.`,
      {
        remediation:
          `Ejecute rollback --transaction ${journal.id} o restaure exactamente la entrada original antes de reanudar.`,
      },
    );
  }

  const planByTarget = new Map(plan.items.map((item) => [item.target, item]));
  for (const operation of journal.operations) {
    const item = planByTarget.get(operation.target);
    if (!item) {
      throw new ConstructorError(
        'TRANSACTION_PLAN_CHANGED',
        `La operación ${operation.target} ya no existe en el plan actual.`,
      );
    }
    if (item.afterHash !== operation.afterHash) {
      throw new ConstructorError(
        'TRANSACTION_CONTENT_CHANGED',
        `El contenido planeado de ${operation.target} cambió durante la transacción.`,
      );
    }
  }
}

async function createBackup(targetRoot, transactionId, target, content, explicitPath = null) {
  const relative = explicitPath ?? backupRelativePath(transactionId, target);
  const absolute = resolveInside(targetRoot, relative);
  const existing = await readFileSnapshot(absolute);
  if (existing.exists) {
    if (existing.hash !== sha256(content)) {
      throw new ConstructorError(
        'TRANSACTION_BACKUP_CONFLICT',
        `El backup ${relative} existe con otro hash.`,
      );
    }
    return relative;
  }
  await atomicWrite(absolute, content);
  return relative;
}

async function assertOperationInput(targetRoot, operation) {
  await assertNoSymlinkEscape(targetRoot, operation.target);
  const absolute = resolveInside(targetRoot, operation.target);
  const current = await readFileSnapshot(absolute);
  if (current.hash !== operation.beforeHash) {
    throw new ConstructorError(
      'TRANSACTION_RACE',
      `${operation.target} cambió después del preflight.`,
      {
        details: `esperado=${operation.beforeHash ?? '<missing>'}, actual=${current.hash ?? '<missing>'}`,
        remediation: 'No se escribió esta operación. Revise el cambio concurrente y vuelva a calcular el plan.',
      },
    );
  }
  return current;
}

async function applyOperation({
  item,
  journal,
  operation,
  targetRoot,
}) {
  const current = await assertOperationInput(targetRoot, operation);
  const absolute = resolveInside(targetRoot, operation.target);

  if (current.exists) {
    operation.backup = await createBackup(
      targetRoot,
      journal.id,
      operation.target,
      current.content,
    );
    await writeJournal(targetRoot, journal);
  }

  if (operation.operation === 'delete') {
    await unlink(absolute);
  } else {
    await atomicWrite(absolute, item.desiredContent);
  }

  const written = await readFileSnapshot(absolute);
  if (written.hash !== operation.afterHash) {
    throw new ConstructorError(
      'TRANSACTION_WRITE_VERIFY_FAILED',
      `La verificación posterior de ${operation.target} no coincide.`,
    );
  }
  operation.status = 'applied';
  await writeJournal(targetRoot, journal);
}

function parseInjectedFailure(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new ConstructorError(
      'INJECT_FAILURE_INVALID',
      '--inject-failure-after debe ser un entero positivo.',
    );
  }
  return parsed;
}

async function applyState({
  journal,
  nextState,
  targetRoot,
}) {
  const absolute = stateAbsolutePath(targetRoot);
  const current = await readFileSnapshot(absolute);
  const content = Buffer.from(stableStringify(nextState), 'utf8');
  const desiredHash = sha256(content);
  if (current.hash !== journal.state.beforeHash) {
    if (
      current.hash === desiredHash
      && ['applied', 'pending'].includes(journal.state.status)
    ) {
      journal.state.afterHash = desiredHash;
      journal.state.status = 'applied';
      await writeJournal(targetRoot, journal);
      return;
    }
    throw new ConstructorError(
      'TRANSACTION_STATE_RACE',
      `${STATE_RELATIVE_PATH} cambió durante la transacción.`,
    );
  }

  if (current.exists && journal.state.backup === null) {
    journal.state.backup = await createBackup(
      targetRoot,
      journal.id,
      STATE_RELATIVE_PATH,
      current.content,
      stateBackupRelativePath(journal.id),
    );
    await writeJournal(targetRoot, journal);
  }

  await atomicWrite(absolute, content);
  journal.state.afterHash = desiredHash;
  journal.state.status = 'applied';
  await writeJournal(targetRoot, journal);
}

function itemForOperation(plan, operation) {
  const item = plan.items.find((candidate) => candidate.target === operation.target);
  if (!item) {
    throw new ConstructorError(
      'TRANSACTION_ITEM_MISSING',
      `No existe contenido planeado para ${operation.target}.`,
    );
  }
  return item;
}

export async function executePlan({
  command,
  injectFailureAfter = null,
  plan,
  resumeJournal = null,
  targetRoot,
}) {
  if (plan.conflicts.length > 0) {
    throw new ConstructorError('PLAN_CONFLICT', 'No se puede ejecutar un plan con conflictos.');
  }

  if (
    plan.materialItems.length === 0
    && !plan.requiresStateWrite
    && resumeJournal === null
  ) {
    return {
      changes: 0,
      resumed: false,
      transactionId: null,
    };
  }

  const injectedAfter = parseInjectedFailure(
    injectFailureAfter ?? process.env.PROJECT_CONSTRUCTOR_FAIL_AFTER,
  );
  const journal = resumeJournal ?? await createTransaction({
    command,
    plan,
    targetRoot,
  });
  const resumed = resumeJournal !== null;
  verifyResumeContract(journal, plan);

  const nextState = {
    ...plan.proposedState,
    lastTransaction: journal.id,
  };
  let appliedThisInvocation = 0;

  try {
    for (const operation of journal.operations) {
      const item = itemForOperation(plan, operation);

      if (operation.status === 'applied') {
        const current = await readFileSnapshot(resolveInside(targetRoot, operation.target));
        if (current.hash !== operation.afterHash) {
          throw new ConstructorError(
            'TRANSACTION_RESUME_CONFLICT',
            `${operation.target} cambió después de la ejecución parcial.`,
            {
              remediation:
                `Restaure el hash escrito o ejecute rollback --transaction ${journal.id} después de preservar su edición.`,
            },
          );
        }
        continue;
      }

      const interruptedWrite = await readFileSnapshot(
        resolveInside(targetRoot, operation.target),
      );
      if (interruptedWrite.hash === operation.afterHash) {
        operation.status = 'applied';
        await writeJournal(targetRoot, journal);
        continue;
      }

      await applyOperation({
        item,
        journal,
        operation,
        targetRoot,
      });
      appliedThisInvocation += 1;

      if (injectedAfter !== null && appliedThisInvocation >= injectedAfter) {
        throw new ConstructorError(
          'INJECTED_FAILURE',
          `Fallo de fixture inyectado después de ${appliedThisInvocation} operación(es).`,
          {
            exitCode: EXIT_CODES.transaction,
            remediation:
              `Reejecute el mismo comando para reanudar o use rollback --transaction ${journal.id}.`,
          },
        );
      }
    }

    if (journal.state.status === 'pending') {
      await applyState({
        journal,
        nextState,
        targetRoot,
      });
    } else if (journal.state.status === 'applied') {
      const currentState = await readFileSnapshot(stateAbsolutePath(targetRoot));
      if (currentState.hash !== journal.state.afterHash) {
        throw new ConstructorError(
          'TRANSACTION_RESUME_STATE_CONFLICT',
          `${STATE_RELATIVE_PATH} cambió después de la ejecución parcial.`,
        );
      }
    }

    journal.lastError = null;
    journal.status = 'completed';
    await writeJournal(targetRoot, journal);
    return {
      changes: journal.operations.length + (journal.state.status === 'applied' ? 1 : 0),
      resumed,
      transactionId: journal.id,
    };
  } catch (error) {
    journal.lastError = {
      code: error?.code ?? 'UNEXPECTED_ERROR',
      message: error?.message ?? String(error),
    };
    journal.status = 'failed';
    await writeJournal(targetRoot, journal).catch(() => {});
    if (error instanceof ConstructorError) {
      if (!error.remediation) {
        error.remediation =
          `Reejecute el mismo comando para reanudar o use rollback --transaction ${journal.id}.`;
      }
      error.details = [...error.details, `transaction=${journal.id}`];
      throw error;
    }
    throw new ConstructorError(
      'TRANSACTION_FAILED',
      'La transacción se interrumpió y quedó registrada.',
      {
        cause: error,
        details: [`transaction=${journal.id}`, error.message],
        exitCode: EXIT_CODES.transaction,
        remediation:
          `Reejecute el mismo comando para reanudar o use rollback --transaction ${journal.id}.`,
      },
    );
  }
}

async function assertRollbackFile(targetRoot, operation) {
  const absolute = resolveInside(targetRoot, operation.target);
  const current = await readFileSnapshot(absolute);

  if (operation.operation === 'delete') {
    if (current.exists) {
      throw new ConstructorError(
        'ROLLBACK_CONFLICT',
        `${operation.target} reapareció después de la eliminación registrada.`,
      );
    }
  } else if (current.hash !== operation.afterHash) {
    throw new ConstructorError(
      'ROLLBACK_CONFLICT',
      `${operation.target} cambió después de la transacción.`,
      {
        details: `esperado=${operation.afterHash}, actual=${current.hash ?? '<missing>'}`,
      },
    );
  }

  if (operation.beforeHash !== null) {
    if (!operation.backup) {
      throw new ConstructorError(
        'ROLLBACK_BACKUP_MISSING',
        `La operación ${operation.target} no registra backup.`,
      );
    }
    const backup = await readFileSnapshot(resolveInside(targetRoot, operation.backup));
    if (backup.hash !== operation.beforeHash) {
      throw new ConstructorError(
        'ROLLBACK_BACKUP_INVALID',
        `El backup de ${operation.target} no coincide con su hash registrado.`,
      );
    }
  }
}

async function restoreOperation(targetRoot, operation) {
  const absolute = resolveInside(targetRoot, operation.target);
  if (operation.beforeHash === null) {
    const current = await readFileSnapshot(absolute);
    if (current.exists) {
      await unlink(absolute);
    }
    return;
  }

  const backup = await readFile(resolveInside(targetRoot, operation.backup));
  await atomicWrite(absolute, backup);
}

async function assertRollbackState(targetRoot, journal) {
  if (journal.state.status !== 'applied') {
    return;
  }
  const current = await readFileSnapshot(stateAbsolutePath(targetRoot));
  if (current.hash !== journal.state.afterHash) {
    throw new ConstructorError(
      'ROLLBACK_STATE_CONFLICT',
      `${STATE_RELATIVE_PATH} cambió después de la transacción.`,
    );
  }

  if (journal.state.beforeHash !== null) {
    if (!journal.state.backup) {
      throw new ConstructorError('ROLLBACK_STATE_BACKUP_MISSING', 'El estado previo no tiene backup.');
    }
    const backup = await readFileSnapshot(resolveInside(targetRoot, journal.state.backup));
    if (backup.hash !== journal.state.beforeHash) {
      throw new ConstructorError(
        'ROLLBACK_STATE_BACKUP_INVALID',
        'El backup del estado previo no coincide con su hash.',
      );
    }
  }
}

async function restoreState(targetRoot, journal) {
  if (journal.state.status !== 'applied') {
    return;
  }
  const absolute = stateAbsolutePath(targetRoot);
  if (journal.state.beforeHash === null) {
    await unlink(absolute);
  } else {
    const backup = await readFile(resolveInside(targetRoot, journal.state.backup));
    await atomicWrite(absolute, backup);
  }
}

export async function rollbackTransaction({
  targetRoot,
  transactionId,
}) {
  const journal = await readTransaction(targetRoot, transactionId);
  if (journal.status === 'rolled-back') {
    return {
      restored: 0,
      transactionId,
      wasAlreadyRolledBack: true,
    };
  }
  if (!['applying', 'completed', 'failed', 'rolling-back'].includes(journal.status)) {
    throw new ConstructorError(
      'ROLLBACK_STATUS_INVALID',
      `La transacción ${transactionId} tiene estado ${journal.status}.`,
    );
  }

  const applied = journal.operations.filter((operation) => operation.status === 'applied');
  const conflicts = [];
  for (const operation of applied) {
    try {
      await assertRollbackFile(targetRoot, operation);
    } catch (error) {
      conflicts.push(error.message);
    }
  }
  try {
    await assertRollbackState(targetRoot, journal);
  } catch (error) {
    conflicts.push(error.message);
  }

  if (conflicts.length > 0) {
    throw new ConstructorError(
      'ROLLBACK_CONFLICT',
      'El rollback se detuvo antes de modificar archivos porque hay cambios posteriores.',
      {
        details: conflicts,
        remediation: 'Preserve las ediciones, restaure los hashes esperados o revierta manualmente.',
      },
    );
  }

  journal.status = 'rolling-back';
  await writeJournal(targetRoot, journal);

  await restoreState(targetRoot, journal);
  if (journal.state.status === 'applied') {
    journal.state.status = 'rolled-back';
    await writeJournal(targetRoot, journal);
  }
  for (const operation of [...applied].reverse()) {
    await restoreOperation(targetRoot, operation);
    operation.status = 'rolled-back';
    await writeJournal(targetRoot, journal);
  }
  journal.status = 'rolled-back';
  journal.lastError = null;
  await writeJournal(targetRoot, journal);

  return {
    restored: applied.length + (journal.state.status === 'rolled-back' ? 1 : 0),
    transactionId,
    wasAlreadyRolledBack: false,
  };
}

export function transactionJournalRelativePath(transactionId) {
  assertTransactionId(transactionId);
  return normalizeRelativePath(journalRelativePath(transactionId));
}
