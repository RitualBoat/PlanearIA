import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import {
  CONFIG_RELATIVE_PATH,
  CONSTRUCTOR_VERSION,
  DEFAULT_BLUEPRINT_ROOT,
  EXIT_CODES,
  PACKAGE_NAME,
} from './constants.mjs';
import { loadBlueprint } from './blueprint.mjs';
import { ConstructorError } from './errors.mjs';
import { buildGithubPlan } from './github-plan.mjs';
import { materializeHarnessBlueprint } from './harness.mjs';
import { sha256 } from './hash.mjs';
import { readJsonFile, stableStringify } from './json.mjs';
import { runOpsxAdapt } from './opsx-adapt.mjs';
import { runOpsxCheck } from './opsx-check.mjs';
import {
  assertPlanWritable,
  buildPlan,
  publicPlan,
} from './plan.mjs';
import { resolveInside } from './paths.mjs';
import { preflightTarget } from './preflight.mjs';
import {
  readInstalledStateWithMigrations,
  stateNeedsWrite,
} from './state.mjs';
import {
  executePlan,
  findIncompleteTransaction,
  rollbackTransaction,
} from './transaction.mjs';

async function loadConfiguration(targetRoot) {
  return readJsonFile(
    resolveInside(targetRoot, CONFIG_RELATIVE_PATH),
    {
      label: CONFIG_RELATIVE_PATH,
      optional: true,
    },
  );
}

async function loadExternalOwnership(targetRoot, baseBlueprint) {
  const relative = '.project-os/openspec-ownership.json';
  let contract = await readJsonFile(
    resolveInside(targetRoot, relative),
    {
      label: relative,
      optional: true,
    },
  );
  if (contract === null) {
    const seed = baseBlueprint.entries.find((entry) => entry.target === relative);
    if (seed?.content) {
      try {
        contract = JSON.parse(seed.content.toString('utf8'));
      } catch (error) {
        throw new ConstructorError(
          'EXTERNAL_OWNERSHIP_SEED_INVALID',
          `La semilla ${seed.source} no contiene JSON válido.`,
          {
            cause: error,
            details: [error.message],
          },
        );
      }
    }
  }
  if (contract === null) {
    return null;
  }
  if (
    contract.owner !== 'external-openspec'
    || !Array.isArray(contract.generatedGlobs)
    || contract.generatedGlobs.some((glob) => typeof glob !== 'string' || glob === '')
  ) {
    throw new ConstructorError(
      'EXTERNAL_OWNERSHIP_INVALID',
      `${relative} no declara owner external-openspec y generatedGlobs válidos.`,
    );
  }
  const rawCommands = contract.commands ?? {
    update: contract.mutatingCommand,
  };
  const commands = Object.fromEntries(
    Object.entries(rawCommands)
      .filter(([, command]) => typeof command === 'string' && command !== '')
      .sort(([left], [right]) => left.localeCompare(right)),
  );
  return {
    commands,
    generatedGlobs: [...new Set(contract.generatedGlobs)]
      .sort((left, right) => left.localeCompare(right)),
    owner: contract.owner,
  };
}

async function loadBlueprintAndConfiguration({
  blueprintRoot,
  targetRoot,
}) {
  let configuration = await loadConfiguration(targetRoot);
  let baseBlueprint = await loadBlueprint({
    blueprintRoot,
    configuration,
  });

  if (configuration === null) {
    const configSeed = baseBlueprint.entries.find(
      (entry) => entry.target === CONFIG_RELATIVE_PATH,
    );
    if (configSeed?.content) {
      try {
        configuration = JSON.parse(configSeed.content.toString('utf8'));
      } catch (error) {
        throw new ConstructorError(
          'CONFIG_SEED_INVALID',
          `La semilla ${configSeed.source} no contiene JSON válido.`,
          {
            details: error.message,
            cause: error,
          },
        );
      }
      baseBlueprint = await loadBlueprint({
        blueprintRoot,
        configuration,
      });
    }
  }

  return {
    baseBlueprint,
    configuration,
  };
}

function exactPackageEntry() {
  return {
    bin: {
      'create-project-engineering-os': 'bin/project-os.mjs',
      'project-os': 'bin/project-os.mjs',
    },
    dev: true,
    engines: {
      node: '^20.20.0 || >=22.22.0',
    },
    license: 'MIT',
    resolved: `https://registry.npmjs.org/${PACKAGE_NAME}/-/${PACKAGE_NAME}-${CONSTRUCTOR_VERSION}.tgz`,
    version: CONSTRUCTOR_VERSION,
  };
}

async function materializeUpgradeIdentity({
  blueprint,
  previousState,
  targetRoot,
}) {
  if (!previousState) {
    throw new ConstructorError(
      'UPGRADE_STATE_REQUIRED',
      'upgrade requiere un bootstrap previo con state verificable.',
      {
        remediation: 'Ejecuta bootstrap con la versión ya fijada antes de solicitar upgrade.',
      },
    );
  }
  const targets = ['package.json', 'package-lock.json'];
  const current = {};
  for (const target of targets) {
    const absolute = resolveInside(targetRoot, target);
    let raw;
    try {
      raw = await readFile(absolute);
    } catch (error) {
      throw new ConstructorError(
        'UPGRADE_IDENTITY_FILE_MISSING',
        `upgrade requiere ${target}.`,
        {
          cause: error,
          remediation: `Restaura ${target} antes de reintentar; no se generará desde datos incompletos.`,
        },
      );
    }
    let value;
    try {
      value = JSON.parse(raw.toString('utf8'));
    } catch (error) {
      throw new ConstructorError('UPGRADE_IDENTITY_JSON_INVALID', `${target} no contiene JSON válido.`, {
        cause: error,
      });
    }
    current[target] = { raw, value };
  }

  const manifest = structuredClone(current['package.json'].value);
  const declared =
    manifest.devDependencies?.[PACKAGE_NAME]
    ?? manifest.dependencies?.[PACKAGE_NAME]
    ?? null;
  if (
    declared !== null
    && declared !== previousState.packageVersion
    && declared !== CONSTRUCTOR_VERSION
  ) {
    throw new ConstructorError(
      'UPGRADE_DEPENDENCY_COLLISION',
      `${PACKAGE_NAME} fue editado fuera de la release registrada.`,
      {
        details: `state=${previousState.packageVersion}, manifest=${declared}`,
        remediation: 'Adopta, restaura o excluye esa edición mediante una decisión explícita antes del upgrade.',
      },
    );
  }
  manifest.devDependencies = {
    ...(manifest.devDependencies ?? {}),
    [PACKAGE_NAME]: CONSTRUCTOR_VERSION,
  };
  if (manifest.dependencies?.[PACKAGE_NAME]) {
    delete manifest.dependencies[PACKAGE_NAME];
    if (Object.keys(manifest.dependencies).length === 0) delete manifest.dependencies;
  }

  const lock = structuredClone(current['package-lock.json'].value);
  if (!lock.packages?.['']) {
    throw new ConstructorError(
      'UPGRADE_LOCKFILE_SHAPE',
      'package-lock.json no usa el formato v3 soportado.',
      {
        remediation: 'Regenera y revisa un lockfile v3 con npm antes del upgrade.',
      },
    );
  }
  lock.packages[''].devDependencies = {
    ...(lock.packages[''].devDependencies ?? {}),
    [PACKAGE_NAME]: CONSTRUCTOR_VERSION,
  };
  lock.packages[`node_modules/${PACKAGE_NAME}`] = exactPackageEntry();

  const desiredByTarget = {
    'package.json': Buffer.from(stableStringify(manifest), 'utf8'),
    'package-lock.json': Buffer.from(stableStringify(lock), 'utf8'),
  };
  const entries = blueprint.entries.map((entry) => (
    targets.includes(entry.target)
      ? {
          ...entry,
          content: desiredByTarget[entry.target],
          owner: 'constructor',
          source: `upgrade:${entry.target}#${PACKAGE_NAME}@${CONSTRUCTOR_VERSION}`,
          sourceHash: sha256(desiredByTarget[entry.target]),
        }
      : entry
  ));
  const state = structuredClone(previousState);
  const previousRecords = {};
  for (const target of targets) {
    if (!state.files?.[target]) {
      throw new ConstructorError(
        'UPGRADE_IDENTITY_OWNER_MISSING',
        `${target} no tiene ownership registrado.`,
        {
          remediation: 'Ejecuta primero sync y revisa la adopción del archivo antes del upgrade.',
        },
      );
    }
    previousRecords[target] = structuredClone(state.files[target]);
    state.files[target] = {
      ...state.files[target],
      hash: sha256(current[target].raw),
      owner: 'constructor',
    };
  }
  return {
    blueprint: { ...blueprint, entries },
    previousState: state,
    previousRecords,
    targets,
  };
}

async function preparePlan({
  blueprintRoot,
  readOnly,
  targetRoot,
  upgradeIdentity = false,
}) {
  const preflight = await preflightTarget(targetRoot, {
    writable: !readOnly,
  });
  const {
    baseBlueprint,
    configuration,
  } = await loadBlueprintAndConfiguration({
    blueprintRoot,
    targetRoot: preflight.target,
  });
  let blueprint = await materializeHarnessBlueprint({
    baseBlueprint,
    targetRoot: preflight.target,
  });
  const externalOwnership = await loadExternalOwnership(
    preflight.target,
    baseBlueprint,
  );
  const stateResult = await readInstalledStateWithMigrations(preflight.target);
  let previousState = stateResult.state;
  let upgradePreviousRecords = {};
  let upgradeTargets = [];
  if (upgradeIdentity) {
    const upgrade = await materializeUpgradeIdentity({
      blueprint,
      previousState,
      targetRoot: preflight.target,
    });
    blueprint = upgrade.blueprint;
    previousState = upgrade.previousState;
    upgradePreviousRecords = upgrade.previousRecords;
    upgradeTargets = upgrade.targets;
  }
  const incompleteTransaction = await findIncompleteTransaction(preflight.target);
  const plan = await buildPlan({
    blueprint,
    configuration,
    previousState,
    stateMigrations: stateResult.migrations,
    resumeJournal: incompleteTransaction,
    targetRoot: preflight.target,
  });
  for (const target of upgradeTargets) {
    const item = plan.items.find((candidate) => candidate.target === target);
    if (item) {
      item.entry.owner = 'project';
      if (item.stateRecord) {
        item.stateRecord = {
          ...upgradePreviousRecords[target],
          hash: item.afterHash,
          owner: 'project',
        };
      }
    }
    if (plan.proposedState.files[target]) {
      plan.proposedState.files[target] = {
        ...upgradePreviousRecords[target],
        hash: item?.afterHash ?? plan.proposedState.files[target].hash,
        owner: 'project',
      };
    }
  }
  if (upgradeTargets.length > 0) {
    plan.requiresStateWrite = stateNeedsWrite(stateResult.state, plan.proposedState);
    plan.summary.stateUpdate = plan.requiresStateWrite;
    plan.hasDrift = (
      plan.materialItems.length > 0
      || plan.requiresStateWrite
      || plan.conflicts.length > 0
    );
  }

  return {
    baseBlueprint,
    blueprint,
    configuration,
    externalOwnership,
    incompleteTransaction,
    plan,
    preflight,
    previousState,
    stateMigrations: stateResult.migrations,
    upgradeTargets,
  };
}

export async function runBootstrapOrSync({
  blueprintRoot = DEFAULT_BLUEPRINT_ROOT,
  check = false,
  command,
  dryRun = false,
  injectFailureAfter = null,
  targetRoot = process.cwd(),
}) {
  if (!['bootstrap', 'sync'].includes(command)) {
    throw new ConstructorError('COMMAND_INVALID', `Comando mutante desconocido: ${command}.`);
  }

  const prepared = await preparePlan({
    blueprintRoot: resolve(blueprintRoot),
    readOnly: check || dryRun,
    targetRoot: resolve(targetRoot),
  });
  const planView = publicPlan(prepared.plan, prepared.externalOwnership);
  const incomplete = prepared.incompleteTransaction?.id ?? null;

  if (check || dryRun) {
    const hasDrift = prepared.plan.hasDrift || incomplete !== null;
    return {
      command,
      dryRun: true,
      exitCode: check && hasDrift ? EXIT_CODES.drift : EXIT_CODES.success,
      incompleteTransaction: incomplete,
      mode: check ? 'check' : 'dry-run',
      mutationPerformed: false,
      plan: {
        ...planView,
        hasDrift,
      },
      status: hasDrift ? 'DRIFT' : 'IN_SYNC',
    };
  }

  await assertPlanWritable(prepared.preflight.target, prepared.plan);
  const transaction = await executePlan({
    command,
    injectFailureAfter,
    plan: prepared.plan,
    resumeJournal: prepared.incompleteTransaction,
    targetRoot: prepared.preflight.target,
  });
  const isInSync = transaction.transactionId === null;

  return {
    command,
    exitCode: EXIT_CODES.success,
    incompleteTransaction: null,
    mode: 'apply',
    mutationPerformed: transaction.transactionId !== null,
    plan: planView,
    status: isInSync ? 'IN_SYNC' : 'APPLIED',
    transaction,
  };
}

export async function runUpgrade({
  apply = false,
  blueprintRoot = DEFAULT_BLUEPRINT_ROOT,
  check = false,
  commandRunner = undefined,
  injectFailureAfter = null,
  openPr = false,
  targetRoot = process.cwd(),
}) {
  if (openPr && (!apply || check)) {
    throw new ConstructorError(
      'UPGRADE_PR_MODE_INVALID',
      '--open-pr exige upgrade --apply.',
      {
        remediation: 'Ejecuta primero --check y después --apply --open-pr.',
      },
    );
  }
  if (apply === check) {
    throw new ConstructorError(
      'UPGRADE_MODE_REQUIRED',
      'upgrade exige exactamente uno de --check o --apply.',
      {
        remediation: 'Previsualiza con --check y ejecuta después con --apply.',
      },
    );
  }
  if (openPr) {
    const { runUpgradePullRequest } = await import('./git-upgrade-pr.mjs');
    return runUpgradePullRequest({
      applyUpgrade: () => runUpgrade({
        apply: true,
        blueprintRoot,
        check: false,
        injectFailureAfter,
        openPr: false,
        targetRoot,
      }),
      runner: commandRunner,
      targetRoot: resolve(targetRoot),
    });
  }
  const prepared = await preparePlan({
    blueprintRoot: resolve(blueprintRoot),
    readOnly: check,
    targetRoot: resolve(targetRoot),
    upgradeIdentity: true,
  });
  const planView = publicPlan(prepared.plan, prepared.externalOwnership);
  const incomplete = prepared.incompleteTransaction?.id ?? null;
  if (check) {
    const hasDrift = prepared.plan.hasDrift || incomplete !== null;
    return {
      command: 'upgrade',
      dryRun: true,
      exitCode: hasDrift ? EXIT_CODES.drift : EXIT_CODES.success,
      incompleteTransaction: incomplete,
      migrations: prepared.plan.migrations,
      mode: 'check',
      mutationPerformed: false,
      plan: { ...planView, hasDrift },
      rollback: incomplete
        ? `project-os rollback --target . --transaction ${incomplete}`
        : 'La aplicación creará un journal con rollback explícito.',
      status: hasDrift ? 'DRIFT' : 'IN_SYNC',
      targetVersion: CONSTRUCTOR_VERSION,
    };
  }
  await assertPlanWritable(prepared.preflight.target, prepared.plan);
  const transaction = await executePlan({
    command: 'upgrade',
    injectFailureAfter,
    plan: prepared.plan,
    resumeJournal: prepared.incompleteTransaction,
    targetRoot: prepared.preflight.target,
  });
  return {
    command: 'upgrade',
    exitCode: EXIT_CODES.success,
    incompleteTransaction: null,
    migrations: prepared.plan.migrations,
    mode: 'apply',
    mutationPerformed: transaction.transactionId !== null,
    plan: planView,
    rollback: transaction.transactionId
      ? `project-os rollback --target . --transaction ${transaction.transactionId}`
      : null,
    status: transaction.transactionId === null ? 'IN_SYNC' : 'APPLIED',
    targetVersion: CONSTRUCTOR_VERSION,
    transaction,
  };
}

export async function runRollback({
  targetRoot = process.cwd(),
  transactionId,
}) {
  if (!transactionId) {
    throw new ConstructorError(
      'ROLLBACK_TRANSACTION_REQUIRED',
      'rollback requiere --transaction <id>.',
    );
  }

  const preflight = await preflightTarget(resolve(targetRoot), {
    writable: true,
  });
  const result = await rollbackTransaction({
    targetRoot: preflight.target,
    transactionId,
  });

  return {
    command: 'rollback',
    exitCode: EXIT_CODES.success,
    mutationPerformed: !result.wasAlreadyRolledBack,
    status: result.wasAlreadyRolledBack ? 'ALREADY_ROLLED_BACK' : 'ROLLED_BACK',
    ...result,
  };
}

export async function runGithubPlan({
  blueprintRoot = DEFAULT_BLUEPRINT_ROOT,
  targetRoot = process.cwd(),
}) {
  const preflight = await preflightTarget(resolve(targetRoot), {
    writable: false,
  });
  const {
    baseBlueprint,
  } = await loadBlueprintAndConfiguration({
    blueprintRoot: resolve(blueprintRoot),
    targetRoot: preflight.target,
  });
  const plan = await buildGithubPlan({
    baseBlueprint,
    targetRoot: preflight.target,
  });
  return {
    command: 'github-plan',
    exitCode: EXIT_CODES.success,
    mutationPerformed: false,
    plan,
    status: 'PLANNED',
  };
}

export { runOpsxAdapt, runOpsxCheck };
