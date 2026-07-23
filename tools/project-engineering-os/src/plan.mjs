import {
  lstat,
  readFile,
} from 'node:fs/promises';

import { deterministicDiff } from './diff.mjs';
import { ConstructorError } from './errors.mjs';
import { normalizeLf, sha256, sha256Json } from './hash.mjs';
import { sortJson } from './json.mjs';
import {
  assertNoSymlinkEscape,
  pathExists,
  resolveInside,
} from './paths.mjs';
import {
  createNextState,
  stateNeedsWrite,
} from './state.mjs';

function countOccurrences(text, needle) {
  let count = 0;
  let index = 0;
  while ((index = text.indexOf(needle, index)) !== -1) {
    count += 1;
    index += needle.length;
  }
  return count;
}

function managedBlockFromSource(entry) {
  if (!entry.managedSection) {
    return null;
  }

  const text = normalizeLf(entry.content.toString('utf8'));
  const { start, end } = entry.managedSection;
  const startCount = countOccurrences(text, start);
  const endCount = countOccurrences(text, end);

  if (startCount === 1 && endCount === 1) {
    const startIndex = text.indexOf(start);
    const endIndex = text.indexOf(end, startIndex + start.length);
    if (endIndex < startIndex) {
      throw new ConstructorError(
        'MANAGED_SOURCE_MARKERS_INVALID',
        `Los delimitadores de la fuente para ${entry.target} están invertidos.`,
      );
    }
    return text.slice(startIndex, endIndex + end.length);
  }

  if (startCount !== 0 || endCount !== 0) {
    throw new ConstructorError(
      'MANAGED_SOURCE_MARKERS_AMBIGUOUS',
      `La fuente de ${entry.target} contiene delimitadores incompletos o duplicados.`,
    );
  }

  const body = text.endsWith('\n') ? text : `${text}\n`;
  return `${start}\n${body}${end}`;
}

function locateManagedBlock(content, entry) {
  const text = normalizeLf(content.toString('utf8'));
  const { start, end } = entry.managedSection;
  const startCount = countOccurrences(text, start);
  const endCount = countOccurrences(text, end);

  if (startCount !== 1 || endCount !== 1) {
    return {
      error: `se esperaban exactamente dos delimitadores únicos y se encontraron start=${startCount}, end=${endCount}`,
    };
  }

  const startIndex = text.indexOf(start);
  const endIndex = text.indexOf(end, startIndex + start.length);
  if (endIndex < startIndex) {
    return { error: 'el delimitador final aparece antes del inicial' };
  }

  const afterEnd = endIndex + end.length;
  return {
    block: text.slice(startIndex, afterEnd),
    endIndex: afterEnd,
    startIndex,
    text,
  };
}

function replaceManagedBlock(content, entry) {
  const located = locateManagedBlock(content, entry);
  if (located.error) {
    return located;
  }
  const desiredBlock = managedBlockFromSource(entry);
  return {
    after: Buffer.from(
      `${located.text.slice(0, located.startIndex)}${desiredBlock}${located.text.slice(located.endIndex)}`,
      'utf8',
    ),
    currentBlockHash: sha256(Buffer.from(located.block, 'utf8')),
    desiredBlockHash: sha256(Buffer.from(desiredBlock, 'utf8')),
  };
}

async function readTargetFile(targetRoot, target) {
  await assertNoSymlinkEscape(targetRoot, target);
  const absolutePath = resolveInside(targetRoot, target);
  let stats;
  try {
    stats = await lstat(absolutePath);
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

  if (!stats.isFile()) {
    throw new ConstructorError(
      'TARGET_COLLISION_NOT_FILE',
      `La ruta planeada ${target} existe pero no es un archivo regular.`,
      {
        remediation: 'Mueva la ruta o cambie explícitamente el destino del blueprint.',
      },
    );
  }

  const content = await readFile(absolutePath);
  return {
    content,
    exists: true,
    hash: sha256(content),
  };
}

function resumeOperationFor(resumeJournal, target) {
  return resumeJournal?.operations?.find((operation) => operation.target === target) ?? null;
}

function isResumeApplied(resumeOperation, currentHash, desiredHash) {
  return (
    ['applied', 'pending'].includes(resumeOperation?.status)
    && resumeOperation.afterHash === currentHash
    && desiredHash === currentHash
  );
}

function makeItem({
  after,
  before,
  entry,
  operation,
  reason,
  stateRecord,
  tracked = true,
}) {
  const beforeHash = before === null ? null : sha256(before);
  const afterHash = after === null ? null : sha256(after);
  const material = ['create', 'delete', 'update'].includes(operation);
  const conflict = operation === 'conflict';

  return {
    afterHash,
    beforeHash,
    conflict,
    desiredContent: after,
    diff: material || conflict
      ? deterministicDiff({
        after,
        before,
        owner: entry.owner,
        source: entry.source,
        target: entry.target,
      })
      : null,
    entry,
    material,
    operation,
    reason,
    stateRecord,
    target: entry.target,
    tracked,
  };
}

function conflictItem(entry, current, reason) {
  return makeItem({
    after: entry.content,
    before: current.content,
    entry,
    operation: 'conflict',
    reason,
    stateRecord: null,
  });
}

function recordFor(entry, afterHash, extra = {}) {
  return sortJson({
    hash: afterHash,
    id: entry.id,
    owner: entry.owner,
    source: entry.source,
    sourceHash: entry.sourceHash,
    ...extra,
  });
}

async function planConstructorEntry({
  current,
  entry,
  resumeJournal,
  stateRecord,
}) {
  const desiredHash = sha256(entry.content);
  const resumeOperation = resumeOperationFor(resumeJournal, entry.target);

  if (!current.exists) {
    if (stateRecord && stateRecord.owner !== entry.owner) {
      return conflictItem(entry, current, 'el owner instalado no coincide con el blueprint');
    }
    return makeItem({
      after: entry.content,
      before: null,
      entry,
      operation: 'create',
      reason: stateRecord
        ? 'el archivo administrado fue eliminado'
        : 'el destino no existe',
      stateRecord: recordFor(entry, desiredHash),
    });
  }

  if (isResumeApplied(resumeOperation, current.hash, desiredHash)) {
    return makeItem({
      after: current.content,
      before: current.content,
      entry,
      operation: 'resume-applied',
      reason: 'la transacción incompleta demuestra este hash',
      stateRecord: recordFor(entry, desiredHash),
    });
  }

  if (!stateRecord) {
    return conflictItem(entry, current, 'la ruta preexistente no tiene ownership registrado');
  }

  if (stateRecord.owner !== 'constructor') {
    return conflictItem(entry, current, `el estado asigna owner ${stateRecord.owner}`);
  }
  if (current.hash !== stateRecord.hash) {
    return conflictItem(entry, current, 'el archivo administrado cambió después del último render');
  }
  if (current.hash === desiredHash) {
    return makeItem({
      after: current.content,
      before: current.content,
      entry,
      operation: 'noop',
      reason: 'el hash ya coincide',
      stateRecord: recordFor(entry, desiredHash),
    });
  }

  return makeItem({
    after: entry.content,
    before: current.content,
    entry,
    operation: 'update',
    reason: 'la fuente canónica cambió y el archivo instalado sigue intacto',
    stateRecord: recordFor(entry, desiredHash),
  });
}

async function planProjectEntry({
  current,
  entry,
  resumeJournal,
  stateRecord,
}) {
  const desiredHash = sha256(entry.content);
  const resumeOperation = resumeOperationFor(resumeJournal, entry.target);

  if (!current.exists) {
    if (stateRecord) {
      return makeItem({
        after: null,
        before: null,
        entry,
        operation: 'preserve-missing',
        reason: 'el proyecto posee el archivo y decidió retirarlo',
        stateRecord: {
          ...stateRecord,
          hash: null,
        },
      });
    }
    return makeItem({
      after: entry.content,
      before: null,
      entry,
      operation: 'create',
      reason: 'semilla inicial project-owned',
      stateRecord: recordFor(entry, desiredHash, { seeded: true }),
    });
  }

  if (!stateRecord) {
    if (isResumeApplied(resumeOperation, current.hash, desiredHash)) {
      return makeItem({
        after: current.content,
        before: current.content,
        entry,
        operation: 'resume-applied',
        reason: 'la transacción incompleta demuestra esta semilla',
        stateRecord: recordFor(entry, current.hash, { seeded: true }),
      });
    }
    return conflictItem(entry, current, 'la semilla project-owned colisiona con contenido preexistente');
  }

  if (stateRecord.owner !== entry.owner) {
    return conflictItem(entry, current, `el estado asigna owner ${stateRecord.owner}`);
  }

  return makeItem({
    after: current.content,
    before: current.content,
    entry,
    operation: 'preserve',
    reason: 'el proyecto posee el contenido después de la semilla inicial',
    stateRecord: recordFor(entry, current.hash, {
      seeded: stateRecord.seeded !== false,
    }),
  });
}

async function planOverlayEntry({
  current,
  entry,
  resumeJournal,
  stateRecord,
}) {
  if (!entry.managedSection) {
    return planProjectEntry({
      current,
      entry: {
        ...entry,
        owner: 'human-overlay',
      },
      resumeJournal,
      stateRecord,
    });
  }

  const desiredBlock = managedBlockFromSource(entry);
  const desiredBlockHash = sha256(Buffer.from(desiredBlock, 'utf8'));
  const resumeOperation = resumeOperationFor(resumeJournal, entry.target);

  if (!current.exists) {
    const text = normalizeLf(entry.content.toString('utf8'));
    const sourceHasMarkers = text.includes(entry.managedSection.start)
      && text.includes(entry.managedSection.end);
    const desired = sourceHasMarkers
      ? entry.content
      : Buffer.from(`${desiredBlock}\n`, 'utf8');
    const desiredHash = sha256(desired);

    if (stateRecord) {
      return makeItem({
        after: desired,
        before: null,
        entry,
        operation: 'create',
        reason: 'el archivo con overlay administrado fue eliminado',
        stateRecord: recordFor(entry, desiredHash, {
          managedHash: desiredBlockHash,
        }),
      });
    }

    return makeItem({
      after: desired,
      before: null,
      entry,
      operation: 'create',
      reason: 'el destino con overlay no existe',
      stateRecord: recordFor(entry, desiredHash, {
        managedHash: desiredBlockHash,
      }),
    });
  }

  const replacement = replaceManagedBlock(current.content, entry);
  if (replacement.error) {
    return conflictItem(entry, current, replacement.error);
  }

  if (
    isResumeApplied(resumeOperation, current.hash, resumeOperation?.afterHash)
    && replacement.currentBlockHash === desiredBlockHash
  ) {
    return makeItem({
      after: current.content,
      before: current.content,
      entry,
      operation: 'resume-applied',
      reason: 'la transacción incompleta demuestra el bloque administrado',
      stateRecord: recordFor(entry, current.hash, {
        managedHash: desiredBlockHash,
      }),
    });
  }

  if (!stateRecord) {
    return conflictItem(entry, current, 'el bloque preexistente no tiene ownership registrado');
  }
  if (stateRecord.owner !== 'human-overlay') {
    return conflictItem(entry, current, `el estado asigna owner ${stateRecord.owner}`);
  }
  if (replacement.currentBlockHash !== stateRecord.managedHash) {
    return conflictItem(entry, current, 'el bloque administrado fue editado después del último render');
  }
  if (replacement.currentBlockHash === desiredBlockHash) {
    return makeItem({
      after: current.content,
      before: current.content,
      entry,
      operation: 'preserve',
      reason: 'el bloque coincide; el contenido humano externo se conserva',
      stateRecord: recordFor(entry, current.hash, {
        managedHash: desiredBlockHash,
      }),
    });
  }

  return makeItem({
    after: replacement.after,
    before: current.content,
    entry,
    operation: 'update',
    reason: 'solo cambia el bloque delimitado bajo ownership del constructor',
    stateRecord: recordFor(entry, sha256(replacement.after), {
      managedHash: desiredBlockHash,
    }),
  });
}

async function planExternalEntry({ current, entry }) {
  return makeItem({
    after: current.content,
    before: current.content,
    entry,
    operation: current.exists ? 'external-present' : 'external-missing',
    reason: current.exists
      ? 'la ruta existe y permanece bajo ownership de OpenSpec'
      : 'la ruta será creada o validada por la CLI local de OpenSpec',
    stateRecord: recordFor(entry, current.hash, {
      present: current.exists,
    }),
  });
}

async function planActiveEntry(context) {
  const current = await readTargetFile(context.targetRoot, context.entry.target);
  switch (context.entry.owner) {
    case 'constructor':
      return planConstructorEntry({ ...context, current });
    case 'human-overlay':
      return planOverlayEntry({ ...context, current });
    case 'project':
      return planProjectEntry({ ...context, current });
    case 'external-openspec':
      return planExternalEntry({ ...context, current });
    default:
      throw new ConstructorError(
        'OWNER_UNREACHABLE',
        `Owner no implementado: ${context.entry.owner}.`,
      );
  }
}

async function planStaleEntry(targetRoot, target, record, resumeJournal) {
  const entry = {
    content: null,
    id: record.id ?? target,
    owner: record.owner,
    source: record.source ?? null,
    sourceHash: record.sourceHash ?? null,
    target,
  };
  const current = await readTargetFile(targetRoot, target);
  const resumeOperation = resumeOperationFor(resumeJournal, target);

  if (record.owner === 'constructor') {
    if (!current.exists) {
      if (
        ['applied', 'pending'].includes(resumeOperation?.status)
        && resumeOperation.afterHash === null
      ) {
        return makeItem({
          after: null,
          before: null,
          entry,
          operation: 'resume-applied',
          reason: 'la transacción incompleta demuestra la eliminación administrada',
          stateRecord: null,
          tracked: false,
        });
      }
      return makeItem({
        after: null,
        before: null,
        entry,
        operation: 'stale-absent',
        reason: 'la ruta retirada ya no existe',
        stateRecord: null,
        tracked: false,
      });
    }
    if (current.hash !== record.hash) {
      return makeItem({
        after: null,
        before: current.content,
        entry,
        operation: 'conflict',
        reason: 'la ruta retirada contiene cambios posteriores',
        stateRecord: {
          ...record,
          orphaned: true,
        },
        tracked: false,
      });
    }
    return makeItem({
      after: null,
      before: current.content,
      entry,
      operation: 'delete',
      reason: 'la fuente retiró un archivo constructor-owned aún intacto',
      stateRecord: null,
      tracked: false,
    });
  }

  return makeItem({
    after: current.content,
    before: current.content,
    entry,
    operation: 'orphan-preserve',
    reason: 'la fuente retiró la entrada, pero su owner no permite borrado automático',
    stateRecord: {
      ...record,
      hash: current.hash,
      orphaned: true,
    },
    tracked: false,
  });
}

export async function buildPlan({
  blueprint,
  configuration = null,
  previousState,
  resumeJournal = null,
  stateMigrations = [],
  targetRoot,
}) {
  const configurationHash = sha256Json(configuration ?? {
    activeProfiles: blueprint.activeProfiles,
  });
  const items = [];
  const activeTargets = new Set();

  for (const entry of blueprint.entries) {
    activeTargets.add(entry.target);
    const item = await planActiveEntry({
      entry,
      previousState,
      resumeJournal,
      stateRecord: previousState?.files?.[entry.target] ?? null,
      targetRoot,
    });
    items.push(item);
  }

  for (const target of Object.keys(previousState?.files ?? {}).sort((left, right) => left.localeCompare(right))) {
    if (!activeTargets.has(target)) {
      items.push(await planStaleEntry(
        targetRoot,
        target,
        previousState.files[target],
        resumeJournal,
      ));
    }
  }

  items.sort((left, right) => left.target.localeCompare(right.target));
  const files = {};
  for (const item of items) {
    if (item.stateRecord) {
      files[item.target] = item.stateRecord;
    }
  }

  const proposedState = createNextState({
    blueprint,
    configurationHash,
    files,
    previousState,
    transactionId: previousState?.lastTransaction ?? null,
  });
  const requiresStateWrite = stateNeedsWrite(previousState, proposedState);
  const conflicts = items.filter((item) => item.conflict);
  const materialItems = items.filter((item) => item.material);
  const contentMigrations = previousState
    && previousState.blueprintHash !== blueprint.blueprintHash
    ? [{
      from: previousState.blueprintHash,
      id: 'blueprint-content-refresh',
      kind: 'content',
      reversibleBy: 'transaction-rollback',
      to: blueprint.blueprintHash,
    }]
    : [];
  const migrations = [...stateMigrations, ...contentMigrations];

  return {
    blueprintHash: blueprint.blueprintHash,
    configurationHash,
    conflicts,
    hasDrift: materialItems.length > 0 || requiresStateWrite || conflicts.length > 0,
    items,
    materialItems,
    migrations,
    proposedState,
    requiresStateWrite,
    rollbackPoint: previousState?.lastTransaction ?? 'pre-bootstrap',
    summary: {
      conflicts: conflicts.length,
      creates: items.filter((item) => item.operation === 'create').length,
      deletes: items.filter((item) => item.operation === 'delete').length,
      preserves: items.filter((item) => [
        'external-missing',
        'external-present',
        'noop',
        'orphan-preserve',
        'preserve',
        'preserve-missing',
        'resume-applied',
        'stale-absent',
      ].includes(item.operation)).length,
      stateUpdate: requiresStateWrite,
      updates: items.filter((item) => item.operation === 'update').length,
    },
  };
}

export function publicPlan(plan, externalOwnership = null) {
  return {
    blueprintHash: plan.blueprintHash,
    configurationHash: plan.configurationHash,
    externalOwnership,
    hasDrift: plan.hasDrift,
    migrations: plan.migrations,
    operations: plan.items.map((item) => ({
      afterHash: item.afterHash,
      beforeHash: item.beforeHash,
      diff: item.diff,
      operation: item.operation,
      owner: item.entry.owner,
      reason: item.reason,
      source: item.entry.source,
      target: item.target,
    })),
    summary: plan.summary,
    rollbackPoint: plan.rollbackPoint,
    validations: [
      'git-root-and-writability',
      'blueprint-schema-and-sources',
      'ownership-and-hashes',
      'harness-capability-and-mcp-parity',
      'transaction-journal-and-state-schema',
    ],
  };
}

export async function assertPlanWritable(targetRoot, plan) {
  if (plan.conflicts.length > 0) {
    throw new ConstructorError(
      'PLAN_CONFLICT',
      'El preflight detectó colisiones; no se escribió ningún destino.',
      {
        details: plan.conflicts.map((item) => `${item.target}: ${item.reason}`),
        remediation:
          'Preserve el archivo como overlay, cambie el destino o resuelva/adopte explícitamente su ownership.',
      },
    );
  }

  for (const item of plan.materialItems) {
    await assertNoSymlinkEscape(targetRoot, item.target);
    const absolute = resolveInside(targetRoot, item.target);
    if (item.operation === 'create' && await pathExists(absolute)) {
      throw new ConstructorError(
        'PLAN_CHANGED_AFTER_PREFLIGHT',
        `${item.target} apareció después del preflight.`,
        {
          remediation: 'Revise la colisión y vuelva a calcular el plan.',
        },
      );
    }
  }
}
