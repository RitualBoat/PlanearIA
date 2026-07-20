import { resolve } from 'node:path';

import {
  CONFIG_RELATIVE_PATH,
  DEFAULT_BLUEPRINT_ROOT,
  EXIT_CODES,
} from './constants.mjs';
import { loadBlueprint } from './blueprint.mjs';
import { ConstructorError } from './errors.mjs';
import { buildGithubPlan } from './github-plan.mjs';
import { materializeHarnessBlueprint } from './harness.mjs';
import { readJsonFile } from './json.mjs';
import { runOpsxAdapt } from './opsx-adapt.mjs';
import { runOpsxCheck } from './opsx-check.mjs';
import {
  assertPlanWritable,
  buildPlan,
  publicPlan,
} from './plan.mjs';
import { resolveInside } from './paths.mjs';
import { preflightTarget } from './preflight.mjs';
import { readInstalledStateWithMigrations } from './state.mjs';
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

async function preparePlan({
  blueprintRoot,
  readOnly,
  targetRoot,
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
  const blueprint = await materializeHarnessBlueprint({
    baseBlueprint,
    targetRoot: preflight.target,
  });
  const externalOwnership = await loadExternalOwnership(
    preflight.target,
    baseBlueprint,
  );
  const stateResult = await readInstalledStateWithMigrations(preflight.target);
  const previousState = stateResult.state;
  const incompleteTransaction = await findIncompleteTransaction(preflight.target);
  const plan = await buildPlan({
    blueprint,
    configuration,
    previousState,
    stateMigrations: stateResult.migrations,
    resumeJournal: incompleteTransaction,
    targetRoot: preflight.target,
  });

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
