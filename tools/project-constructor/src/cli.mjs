import {
  CONSTRUCTOR_VERSION,
  DEFAULT_BLUEPRINT_ROOT,
  EXIT_CODES,
} from './constants.mjs';
import { asConstructorError, ConstructorError } from './errors.mjs';
import { stableStringify } from './json.mjs';
import {
  runBootstrapOrSync,
  runGithubPlan,
  runOpsxAdapt,
  runOpsxCheck,
  runRollback,
} from './commands.mjs';
import { runReadinessCheck } from './readiness.mjs';

const HELP = `project-constructor ${CONSTRUCTOR_VERSION}

Uso:
  project-constructor bootstrap [--target <ruta>] [--dry-run] [--json]
  project-constructor sync [--target <ruta>] [--check|--dry-run] [--json]
  project-constructor doctor [--target <ruta>] [--json]
  project-constructor opsx-adapt [--target <ruta>] [--json]
  project-constructor opsx-check [--target <ruta>] [--json]
  project-constructor readiness-check --phase propose --issue <n> [--target <ruta>] [--json]
  project-constructor readiness-check --phase archive --change <slug> [--run-local] [--target <ruta>] [--json]
  project-constructor rollback --target <ruta> --transaction <id> [--json]
  project-constructor github-plan [--target <ruta>] [--json]

Opciones de fixture:
  --blueprint <ruta>              Usa un blueprint local explícito.
  --inject-failure-after <n>      Interrumpe una mutación después de n archivos.

doctor, github-plan, opsx-check y readiness-check son read-only. opsx-adapt muta solo archivos
generados por OpenSpec bajo su contrato separado. sync --check no escribe ni repara.
`;

function nodeVersionTuple(version) {
  return version.split('.').map((value) => Number(value));
}

function assertSupportedNode() {
  const [major, minor] = nodeVersionTuple(process.versions.node);
  const supported = (major === 20 && minor >= 20)
    || (major === 22 && minor >= 22)
    || major > 22;
  if (!supported) {
    throw new ConstructorError(
      'NODE_VERSION_UNSUPPORTED',
      `Node ${process.versions.node} no cumple ^20.20.0 || >=22.22.0.`,
      {
        remediation:
          'Active Node 20.20.x, Node 22.22 o una versión posterior compatible y vuelva a ejecutar.',
      },
    );
  }
}

function parseArguments(argv) {
  const options = {
    blueprintRoot: DEFAULT_BLUEPRINT_ROOT,
    change: null,
    check: false,
    dryRun: false,
    injectFailureAfter: null,
    issue: null,
    json: false,
    phase: null,
    runLocal: false,
    targetRoot: process.cwd(),
    transactionId: null,
  };
  let command = null;

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--help' || argument === '-h') {
      return { help: true, options };
    }
    if (argument === '--version' || argument === '-v') {
      return { options, version: true };
    }
    if (!argument.startsWith('-') && command === null) {
      command = argument;
      continue;
    }

    const [flag, inlineValue] = argument.split(/=(.*)/s, 2);
    const consume = () => {
      if (inlineValue !== undefined) {
        return inlineValue;
      }
      index += 1;
      if (index >= argv.length || argv[index].startsWith('-')) {
        throw new ConstructorError('CLI_VALUE_REQUIRED', `${flag} requiere un valor.`);
      }
      return argv[index];
    };

    switch (flag) {
      case '--target':
        options.targetRoot = consume();
        break;
      case '--blueprint':
        options.blueprintRoot = consume();
        break;
      case '--transaction':
        options.transactionId = consume();
        break;
      case '--phase':
        options.phase = consume();
        break;
      case '--issue':
        options.issue = consume();
        break;
      case '--change':
        options.change = consume();
        break;
      case '--inject-failure-after':
        options.injectFailureAfter = consume();
        break;
      case '--check':
        options.check = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--json':
        options.json = true;
        break;
      case '--run-local':
        options.runLocal = true;
        break;
      default:
        throw new ConstructorError('CLI_OPTION_UNKNOWN', `Opción desconocida: ${argument}.`);
    }
  }

  if (!command) {
    return { help: true, options };
  }
  if (![
    'bootstrap',
    'doctor',
    'github-plan',
    'opsx-adapt',
    'opsx-check',
    'readiness-check',
    'rollback',
    'sync',
  ].includes(command)) {
    throw new ConstructorError('CLI_COMMAND_UNKNOWN', `Comando desconocido: ${command}.`);
  }
  if (options.check && command !== 'sync') {
    throw new ConstructorError('CLI_CHECK_SCOPE', '--check solo está disponible para sync.');
  }
  if (options.dryRun && !['bootstrap', 'sync'].includes(command)) {
    throw new ConstructorError(
      'CLI_DRY_RUN_SCOPE',
      '--dry-run solo está disponible para bootstrap y sync.',
    );
  }
  if (options.injectFailureAfter && !['bootstrap', 'opsx-adapt', 'sync'].includes(command)) {
    throw new ConstructorError(
      'CLI_INJECT_SCOPE',
      '--inject-failure-after solo está disponible para fixtures de bootstrap/sync.',
    );
  }

  return { command, options };
}

function humanPlan(result) {
  const lines = [
    `[${result.status}] ${result.command}`,
    `Modo: ${result.mode ?? 'read-only'}`,
    `Mutación: ${result.mutationPerformed ? 'sí' : 'no'}`,
  ];
  if (result.incompleteTransaction) {
    lines.push(`Transacción incompleta: ${result.incompleteTransaction}`);
  }
  if (result.plan?.summary) {
    const summary = result.plan.summary;
    lines.push(
      `Plan: create=${summary.creates}, update=${summary.updates}, delete=${summary.deletes}, conflict=${summary.conflicts}, state=${summary.stateUpdate ? 'update' : 'stable'}`,
    );
    for (const operation of result.plan.operations.filter((item) => item.diff)) {
      lines.push('', operation.diff);
    }
  }
  if (result.transaction?.transactionId) {
    lines.push(`Transacción: ${result.transaction.transactionId}`);
  }
  return `${lines.join('\n')}\n`;
}

function humanRollback(result) {
  return [
    `[${result.status}] rollback`,
    `Transacción: ${result.transactionId}`,
    `Restauraciones: ${result.restored}`,
    '',
  ].join('\n');
}

function humanGithubPlan(result) {
  const plan = result.plan;
  const lines = [
    '[PLANNED] github-plan',
    `Fuente: ${plan.source}`,
    'Mutación: no',
    `Estado remoto: ${plan.remote.status}`,
  ];
  for (const [kind, values] of Object.entries(plan.resources)) {
    lines.push(`${kind}: ${values.length}`);
  }
  lines.push(`Gates manuales: ${plan.manualGates.length}`, '');
  return lines.join('\n');
}

async function runDoctorDynamic(options) {
  let module;
  try {
    module = await import('./doctor.mjs');
  } catch (error) {
    if (error?.code === 'ERR_MODULE_NOT_FOUND') {
      throw new ConstructorError(
        'DOCTOR_MODULE_MISSING',
        'El módulo doctor no está incluido en este runtime.',
        {
          remediation: 'Restaure el paquete completo del constructor y vuelva a ejecutar.',
          cause: error,
      },
    );
  }
  if (
    command !== 'readiness-check'
    && (
      options.phase !== null
      || options.issue !== null
      || options.change !== null
      || options.runLocal
    )
  ) {
    throw new ConstructorError(
      'CLI_READINESS_SCOPE',
      '--phase, --issue, --change y --run-local solo están disponibles para readiness-check.',
    );
  }
    throw error;
  }

  if (typeof module.runDoctor !== 'function') {
    throw new ConstructorError(
      'DOCTOR_CONTRACT_INVALID',
      'doctor.mjs debe exportar runDoctor(options).',
    );
  }
  return module.runDoctor({
    json: options.json,
    target: options.targetRoot,
    targetRoot: options.targetRoot,
  });
}

function write(value, stream = process.stdout) {
  stream.write(value);
}

export async function runCli(argv = process.argv.slice(2)) {
  let jsonRequested = argv.includes('--json');
  try {
    assertSupportedNode();
    const parsed = parseArguments(argv);
    jsonRequested = parsed.options.json;
    if (parsed.help) {
      write(HELP);
      return EXIT_CODES.success;
    }
    if (parsed.version) {
      write(`${CONSTRUCTOR_VERSION}\n`);
      return EXIT_CODES.success;
    }

    let result;
    switch (parsed.command) {
      case 'bootstrap':
      case 'sync':
        result = await runBootstrapOrSync({
          ...parsed.options,
          command: parsed.command,
        });
        break;
      case 'rollback':
        result = await runRollback(parsed.options);
        break;
      case 'github-plan':
        result = await runGithubPlan(parsed.options);
        break;
      case 'opsx-check':
        result = await runOpsxCheck(parsed.options);
        break;
      case 'opsx-adapt':
        result = await runOpsxAdapt(parsed.options);
        break;
      case 'doctor':
        result = await runDoctorDynamic(parsed.options);
        break;
      case 'readiness-check':
        result = await runReadinessCheck(parsed.options);
        break;
      default:
        throw new ConstructorError('CLI_COMMAND_UNREACHABLE', 'Comando no implementado.');
    }

    if (typeof result?.output === 'string') {
      write(result.output);
    } else if (jsonRequested) {
      write(stableStringify(result));
    } else if (parsed.command === 'rollback') {
      write(humanRollback(result));
    } else if (parsed.command === 'github-plan') {
      write(humanGithubPlan(result));
    } else if (parsed.command === 'opsx-check') {
      write(`${result.checks.map((item) => (
        `[${item.status}] ${item.id}: ${item.summary}${item.remediation ? `\n  Recuperación: ${item.remediation}` : ''}`
      )).join('\n')}\n`);
    } else if (parsed.command !== 'doctor') {
      write(humanPlan(result));
    }
    return result?.exitCode ?? EXIT_CODES.success;
  } catch (rawError) {
    const error = asConstructorError(rawError);
    const payload = {
      cause: error.message,
      code: error.code,
      details: error.details,
      remediation: error.remediation,
      status: 'FAIL',
    };
    if (jsonRequested) {
      write(stableStringify(payload), process.stderr);
    } else {
      write(
        [
          `[FAIL] ${error.code}: ${error.message}`,
          ...error.details.map((detail) => `- ${detail}`),
          error.remediation ? `Recuperación: ${error.remediation}` : null,
          '',
        ].filter((line) => line !== null).join('\n'),
        process.stderr,
      );
      if (process.env.PROJECT_CONSTRUCTOR_DEBUG === '1' && error.stack) {
        write(`${error.stack}\n`, process.stderr);
      }
    }
    return error.exitCode ?? EXIT_CODES.invalid;
  }
}

export { HELP };
