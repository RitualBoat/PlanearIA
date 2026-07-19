import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

export const GITNEXUS_VERSION = '1.6.10-rc.23';
export const FIXTURE_UID =
  'Function:src/hooks/useCrearPlaneacionViewModel.ts:useCrearPlaneacionViewModel';
export const FIXTURE_QUERY = 'useCrearPlaneacionViewModel MVVM dependencies';

const FTS_DIAGNOSTIC = /FTS indexes missing|FTS extension unavailable|full-text search degraded/i;
const REPOSITORY_DIAGNOSTIC = /not a git repository/i;
const AGENT_PATH = /^(AGENTS\.md|CLAUDE\.md|\.agents\/|\.codex\/skills\/)/;

export const FRESH = 'fresh';
export const STALE = 'stale';
export const UNCLASSIFIABLE = 'unclassifiable';

// El CLI decora la linea de estado ("Status: [emoji] up-to-date" / "Status: [emoji] stale (...)"),
// asi que el ancla es la linea, no la palabra: la ruta del repositorio o el mensaje de rama pueden
// contener texto de frescura sin describir el estado del indice.
const STATUS_LINE = /^\s*Status:\s*(.*)$/;

export function classifyIndexFreshness(output) {
  const lines = String(output ?? '').split(/\r?\n/);
  const statusLine = lines.find((line) => STATUS_LINE.test(line));
  if (!statusLine) return UNCLASSIFIABLE;

  const value = statusLine.match(STATUS_LINE)[1];
  const fresh = /\bup-to-date\b/i.test(value);
  const stale = /\bstale\b/i.test(value);
  // Afirmar ambas cosas, o ninguna, no es evidencia de salud: se rechaza en vez de elegir una.
  if (fresh === stale) return UNCLASSIFIABLE;
  return fresh ? FRESH : STALE;
}

export function hasFtsDiagnostic(output) {
  return FTS_DIAGNOSTIC.test(output);
}

export function hasRepositoryDiagnostic(output) {
  return REPOSITORY_DIAGNOSTIC.test(output);
}

export function assertDiagnosticStatusHealthy(output) {
  if (hasFtsDiagnostic(output)) {
    throw new Error('GitNexus status reported an FTS diagnostic. Run npm run gitnexus:repair.');
  }
  if (hasRepositoryDiagnostic(output)) {
    throw new Error('GitNexus status reported that the checkout is not a Git repository. Run the diagnostic from the repository root.');
  }

  const freshness = classifyIndexFreshness(output);
  if (freshness === STALE) {
    throw new Error('GitNexus index is stale against the current checkout. Run npm run gitnexus:repair and then npm run gitnexus:verify.');
  }
  if (freshness === UNCLASSIFIABLE) {
    throw new Error('GitNexus status did not report a classifiable index state. Absence of a known failure is not evidence of health.');
  }
}

export function parseJsonOutput(output, label) {
  try {
    return JSON.parse(output);
  } catch {
    throw new Error(`${label} did not return JSON output.`);
  }
}

export function verifyQueryResult(result) {
  const definitions = Array.isArray(result.definitions) ? result.definitions : [];
  const processSymbols = Array.isArray(result.process_symbols) ? result.process_symbols : [];

  if (definitions.length === 0 && processSymbols.length === 0) {
    throw new Error('GitNexus query returned no structural context for the MVVM fixture.');
  }
}

export function verifyImpactResult(result) {
  if (result?.target?.id !== FIXTURE_UID) {
    throw new Error('GitNexus impact did not resolve the expected ViewModel UID.');
  }

  if (result.epistemic !== 'exact') {
    throw new Error(`GitNexus impact must be exact; received ${String(result.epistemic)}.`);
  }
}

export function findUnexpectedAgentChanges(statusOutput, allowedPaths = []) {
  const allowed = new Set(allowedPaths);
  const changedPaths = statusOutput
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.slice(3).replaceAll('\\', '/'));

  return changedPaths.filter((filePath) => AGENT_PATH.test(filePath) && !allowed.has(filePath));
}

function commandEnvironment() {
  const env = {
    ...process.env,
    GITNEXUS_LBUG_EXTENSION_INSTALL: 'auto',
  };
  const openSslBin = 'C:\\Program Files\\OpenSSL-Win64\\bin';

  if (process.platform === 'win32' && existsSync(openSslBin)) {
    const inheritedPath = env.PATH ?? env.Path ?? '';
    env.PATH = `${openSslBin};C:\\Program Files\\nodejs;${inheritedPath}`;
    env.Path = env.PATH;
  }

  return env;
}

function run(command, args, { cwd = process.cwd(), env = commandEnvironment() } = {}) {
  const result = spawnSync(command, args, {
    cwd,
    env,
    encoding: 'utf8',
    shell: false,
  });
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed with exit ${String(result.status)}.\n${output}`);
  }

  return output;
}

function gitCommand() {
  return process.platform === 'win32' ? 'C:\\Program Files\\Git\\cmd\\git.exe' : 'git';
}

function repositoryRoot(cwd) {
  return run(gitCommand(), ['rev-parse', '--show-toplevel'], { cwd }).trim();
}

export function buildWindowsGitNexusInvocation(args) {
  return {
    command: 'C:\\Program Files\\nodejs\\node.exe',
    args: ['C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npx-cli.js', '-y', `gitnexus@${GITNEXUS_VERSION}`, ...args],
  };
}

function runGitNexus(args, options = {}) {
  const cwd = repositoryRoot(options.cwd ?? process.cwd());
  const runOptions = { ...options, cwd };
  if (process.platform === 'win32') {
    const invocation = buildWindowsGitNexusInvocation(args);
    return run(
      invocation.command,
      invocation.args,
      runOptions,
    );
  }

  return run('npx', ['-y', `gitnexus@${GITNEXUS_VERSION}`, ...args], runOptions);
}

function readAllowedAgentPaths(args) {
  const allowedPaths = [];
  const remaining = [];

  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--allow-agent-change') {
      const path = args[index + 1];
      if (!path) {
        throw new Error('--allow-agent-change requires a path.');
      }
      allowedPaths.push(path.replaceAll('\\', '/'));
      index += 1;
    } else {
      remaining.push(args[index]);
    }
  }

  if (remaining.length > 0) {
    throw new Error(`Unknown arguments: ${remaining.join(' ')}`);
  }

  return allowedPaths;
}

export function diagnose(options) {
  const output = runGitNexus(['status'], options);
  assertDiagnosticStatusHealthy(output);
  process.stdout.write(output);
}

export function repair(options) {
  // Reindexa en vez de reparar solo FTS: la ruta --repair-fts termina en exito y deja el indice
  // stale, de modo que la recuperacion prometia una frescura que no entregaba (#112). --index-only
  // se conserva porque es la bandera que impide que analyze escriba en los archivos de agente.
  const output = runGitNexus(['analyze', '--index-only', '--name', 'PlanearIA', '.'], options);
  if (hasFtsDiagnostic(output)) {
    throw new Error('GitNexus repair completed with an FTS diagnostic.');
  }

  const statusOutput = runGitNexus(['status'], options);
  if (classifyIndexFreshness(statusOutput) !== FRESH) {
    throw new Error('GitNexus repair finished but the index is still not fresh. Review npm run gitnexus:diagnose.');
  }

  process.stdout.write(output);
}

// Fuente unica de "estructuralmente sano": la comparten `verify` y el doctor del harness para que no
// puedan derivar hacia dos definiciones distintas.
export function runStructuralVerification(options = {}) {
  const queryOutput = runGitNexus(['query', '-r', 'PlanearIA', FIXTURE_QUERY], options);
  if (hasFtsDiagnostic(queryOutput)) {
    return { ok: false, reason: 'GitNexus query reported an FTS diagnostic.' };
  }
  try {
    verifyQueryResult(parseJsonOutput(queryOutput, 'GitNexus query'));
  } catch (error) {
    return { ok: false, reason: error.message };
  }

  const impactOutput = runGitNexus(
    ['impact', '-r', 'PlanearIA', '--uid', FIXTURE_UID, '--depth', '3', '--include-tests'],
    options,
  );
  if (hasFtsDiagnostic(impactOutput)) {
    return { ok: false, reason: 'GitNexus impact reported an FTS diagnostic.' };
  }
  try {
    verifyImpactResult(parseJsonOutput(impactOutput, 'GitNexus impact'));
  } catch (error) {
    return { ok: false, reason: error.message };
  }

  return { ok: true, reason: null };
}

export function verify({ allowedPaths, ...options }) {
  const structural = runStructuralVerification(options);
  if (!structural.ok) {
    throw new Error(structural.reason);
  }

  // El guardia de archivos de agente vive solo aqui: es una preocupacion de paridad del harness, no
  // de salud del indice, y el doctor ya la cubre en su check harness-parity.
  const statusOutput = run(gitCommand(), ['status', '--porcelain'], options);
  const unexpectedAgentChanges = findUnexpectedAgentChanges(statusOutput, allowedPaths);
  if (unexpectedAgentChanges.length > 0) {
    throw new Error(`Unexpected agent instruction changes: ${unexpectedAgentChanges.join(', ')}`);
  }

  process.stdout.write('GitNexus FTS verification passed.\n');
}

function main() {
  const [mode, ...args] = process.argv.slice(2);
  const allowedPaths = readAllowedAgentPaths(args);

  if (mode === 'diagnose') {
    diagnose({});
  } else if (mode === 'repair') {
    repair({});
  } else if (mode === 'verify') {
    verify({ allowedPaths });
  } else if (mode === 'structural') {
    // Plomeria interna del doctor: expone la verificacion estructural sin el guardia de archivos de
    // agente de `verify`. No se publica como script de npm para no ofrecer una segunda ruta de
    // recuperacion al agente que lea package.json.
    const structural = runStructuralVerification({});
    if (!structural.ok) {
      throw new Error(structural.reason);
    }
    process.stdout.write('GitNexus structural verification passed.\n');
  } else {
    throw new Error('Usage: node scripts/gitNexusFts.mjs <diagnose|repair|verify|structural> [--allow-agent-change <path>]');
  }
}

if (import.meta.url === `file:///${process.argv[1].replaceAll('\\', '/')}`) {
  main();
}
