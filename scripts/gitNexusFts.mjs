import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

export const GITNEXUS_VERSION = '1.6.10-rc.23';
export const FIXTURE_UID =
  'Function:src/hooks/useCrearPlaneacionViewModel.ts:useCrearPlaneacionViewModel';
export const FIXTURE_QUERY = 'useCrearPlaneacionViewModel MVVM dependencies';

const FTS_DIAGNOSTIC = /FTS indexes missing|FTS extension unavailable|full-text search degraded/i;
const REPOSITORY_DIAGNOSTIC = /not a git repository/i;
const AGENT_PATH = /^(AGENTS\.md|CLAUDE\.md|\.agents\/|\.codex\/skills\/)/;

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
  const output = runGitNexus(['analyze', '--repair-fts', '--index-only', '--name', 'PlanearIA', '.'], options);
  if (hasFtsDiagnostic(output)) {
    throw new Error('GitNexus repair completed with an FTS diagnostic.');
  }
  process.stdout.write(output);
}

export function verify({ allowedPaths, ...options }) {
  const queryOutput = runGitNexus(['query', '-r', 'PlanearIA', FIXTURE_QUERY], options);
  if (hasFtsDiagnostic(queryOutput)) {
    throw new Error('GitNexus query reported an FTS diagnostic.');
  }
  verifyQueryResult(parseJsonOutput(queryOutput, 'GitNexus query'));

  const impactOutput = runGitNexus(
    ['impact', '-r', 'PlanearIA', '--uid', FIXTURE_UID, '--depth', '3', '--include-tests'],
    options,
  );
  if (hasFtsDiagnostic(impactOutput)) {
    throw new Error('GitNexus impact reported an FTS diagnostic.');
  }
  verifyImpactResult(parseJsonOutput(impactOutput, 'GitNexus impact'));

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
  } else {
    throw new Error('Usage: node scripts/gitNexusFts.mjs <diagnose|repair|verify> [--allow-agent-change <path>]');
  }
}

if (import.meta.url === `file:///${process.argv[1].replaceAll('\\', '/')}`) {
  main();
}
