import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { OAUTH_INTERACTIVE_REQUIRED } from './lib/mcpFailureClassification.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STATUS = new Set(['PASS', 'FAIL', 'WARN', 'SKIP']);

function npmCommand(platform = process.platform) {
  return platform === 'win32' ? 'npm.cmd' : 'npm';
}

function sanitize(value = '') {
  return String(value)
    .replace(/(Bearer|token|secret|password|passwd|pwd|key)=?[A-Za-z0-9._~+/=-]+/gi, '$1=[redacted]')
    .replace(/mongodb(\+srv)?:\/\/[^@\s]+@/gi, 'mongodb$1://[redacted]@');
}

function loadConfig(root) {
  return JSON.parse(readFileSync(path.join(root, 'harness-doctor.config.json'), 'utf8'));
}

function execute(command, args, { cwd = ROOT } = {}) {
  const execution = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    // Windows requires a shell to execute npm.cmd. Every command/argument in this runner is fixed in source.
    shell: process.platform === 'win32' && /\.(cmd|bat)$/i.test(command),
  });
  return { status: execution.status ?? 1, stdout: execution.stdout ?? '', stderr: execution.stderr ?? '', error: execution.error?.message ?? '' };
}

function outputOf(execution) {
  return sanitize(`${execution.stdout ?? ''}${execution.stderr ?? ''}${execution.error ?? ''}`.trim());
}

function result(id, status, summary, remediation = null) {
  if (!STATUS.has(status)) throw new Error(`Unsupported doctor status: ${status}`);
  return { id, status, summary, remediation };
}

function commandFailure(id, label, execution, remediation) {
  const evidence = outputOf(execution);
  return result(id, 'FAIL', `${label} no pudo validarse${evidence ? `: ${evidence.slice(-240)}` : '.'}`, remediation);
}

function parseJsonDocument(output) {
  const start = output.indexOf('{');
  const end = output.lastIndexOf('}');
  if (start < 0 || end < start) return null;
  try { return JSON.parse(output.slice(start, end + 1)); } catch { return null; }
}

function isGitNexusFailure(output, patterns) {
  return patterns.some((pattern) => output.toLowerCase().includes(pattern.toLowerCase()));
}

function checkNodeNpm(run, npm) {
  const execution = run(npm, ['--version']);
  if (execution.status !== 0) return commandFailure('node-npm', 'npm', execution, 'Reinstala Node/npm compatible y ejecuta npm ci.');
  return result('node-npm', 'PASS', `Node ${process.version}; npm ${outputOf(execution)}.`);
}

function checkGit(run) {
  const root = run('git', ['rev-parse', '--show-toplevel']);
  if (root.status !== 0) return commandFailure('git-worktree', 'Git', root, 'Abre el doctor desde un checkout Git valido.');
  const status = run('git', ['status', '--porcelain']);
  if (status.status !== 0) return commandFailure('git-worktree', 'El estado Git', status, 'Repara el checkout antes de iniciar un change.');
  return outputOf(status) ? result('git-worktree', 'WARN', 'Repositorio Git valido con cambios locales.', 'Clasifica o aisla los cambios antes de iniciar otro change.') : result('git-worktree', 'PASS', 'Repositorio Git valido y working tree limpio.');
}

function checkOpenSpec(run, npm) {
  const execution = run(npm, ['run', 'openspec:check']);
  return execution.status === 0 ? result('openspec', 'PASS', 'OpenSpec local y artefactos validos.') : commandFailure('openspec', 'OpenSpec', execution, 'Ejecuta npm ci y corrige openspec:check antes de continuar.');
}

function checkProjects(run, config) {
  const execution = run('gh', ['project', 'list', '--owner', config.project.owner, '--format', 'json']);
  if (execution.status !== 0) return commandFailure('github-projects', 'GitHub Projects', execution, 'Ejecuta gh auth refresh -h github.com -s read:project,project.');
  const projects = parseJsonDocument(outputOf(execution))?.projects ?? [];
  if (!projects.some((project) => project.title === config.project.title)) return result('github-projects', 'FAIL', `No se encontro el Project ${config.project.title}.`, 'Verifica owner, scopes read:project/project y visibilidad del Project.');
  return result('github-projects', 'PASS', `Project ${config.project.title} visible.`);
}

function checkGitNexus(run, npm, config) {
  const execution = run(npm, ['run', 'gitnexus:diagnose']);
  const output = outputOf(execution);
  if (execution.status !== 0 || isGitNexusFailure(output, config.gitNexusFailurePatterns)) return result('gitnexus', 'FAIL', 'GitNexus no ofrece una ruta estructural primaria sana.', 'Revisa npm run gitnexus:diagnose y ejecuta npm run gitnexus:repair solo como accion separada.');
  return result('gitnexus', 'PASS', 'GitNexus no reporta diagnosticos de salud conocidos.');
}

function checkCodeGraph(run, npm) {
  const execution = run(npm, ['run', 'mcp:test', '--', 'codegraph', '--timeout=10000']);
  const report = parseJsonDocument(outputOf(execution));
  if (execution.status !== 0 || !report?.ok || !report.results?.some((item) => item.name === 'codegraph' && item.ok)) return commandFailure('codegraph', 'CodeGraph MCP', execution, 'Revisa la configuracion CodeGraph o usa la ruta de recuperacion documentada.');
  return result('codegraph', 'PASS', 'CodeGraph MCP responde como fallback lineado.');
}

function checkScript(run, npm, id, args, summary, remediation) {
  const execution = run(npm, args);
  return execution.status === 0 ? result(id, 'PASS', summary) : commandFailure(id, summary, execution, remediation);
}

function checkMcpSmoke(run, npm, config) {
  const execution = run(npm, ['run', 'mcp:test']);
  const report = parseJsonDocument(outputOf(execution));
  // El codigo de salida del smoke no decide aqui: sigue siendo distinto de cero mientras un servidor no
  // complete tools/list. Un reporte ilegible si es un fallo real, porque no hay evidencia que clasificar.
  if (!Array.isArray(report?.results) || report.results.length === 0) return commandFailure('mcp-smoke', 'El smoke MCP activo', execution, 'Ejecuta npm run mcp:test y corrige el servidor activo indicado.');

  const allowlist = new Set(config.oauthInteractiveServers ?? []);
  const pendingOauth = [];
  const broken = [];
  for (const item of report.results) {
    if (item.ok) continue;
    // Fuera de la allowlist, un OAuth pendiente probado sigue siendo FAIL: degradarlo exige decision humana.
    if (item.classification === OAUTH_INTERACTIVE_REQUIRED && allowlist.has(item.name)) pendingOauth.push(item.name);
    else broken.push(item.name);
  }
  if (broken.length > 0) return commandFailure('mcp-smoke', `El smoke MCP activo (${broken.join(', ')})`, execution, 'Ejecuta npm run mcp:test y corrige el servidor activo indicado.');

  const limitations = [];
  if (pendingOauth.length > 0) limitations.push(`${pendingOauth.join(', ')} requiere consentimiento OAuth interactivo y no expuso sus herramientas en esta sesion`);
  const declaredOnly = report.results.filter((item) => item.note?.includes('Complete auth and tool listing')).map((item) => item.name);
  if (declaredOnly.length > 0) limitations.push(`${declaredOnly.join(', ')} requiere OAuth en un cliente MCP compatible`);
  if (limitations.length === 0) return result('mcp-smoke', 'PASS', 'Todos los MCP activos completaron el smoke.');
  return result('mcp-smoke', 'WARN', `MCP activo responde; ${limitations.join('; ')}.`, pendingOauth.length > 0 ? `Autoriza ${pendingOauth.join(', ')} en una sesion MCP interactiva si una tarea lo necesita; el smoke conserva ok:false hasta entonces.` : null);
}

function checkExpo(run, npm) {
  const execution = run(npm, ['exec', '--yes=false', '--', 'expo', 'install', '--check']);
  return execution.status === 0 ? result('expo-compatibility', 'PASS', 'Las dependencias Expo son compatibles con la version instalada.') : commandFailure('expo-compatibility', 'La compatibilidad Expo', execution, 'Ejecuta npm exec --yes=false -- expo install --check y alinea solo las dependencias recomendadas por el SDK actual.');
}

export function runDoctor({ root = ROOT, config = loadConfig(root), run = execute, npm = npmCommand() } = {}) {
  const checks = [
    checkNodeNpm(run, npm), checkGit(run), checkOpenSpec(run, npm), checkProjects(run, config), checkGitNexus(run, npm, config), checkCodeGraph(run, npm),
    checkScript(run, npm, 'harness-parity', ['run', 'agent:harness:check'], 'Los espejos del harness estan en paridad.', 'Ejecuta npm run agent:harness:sync y revisa el diff generado.'),
    checkScript(run, npm, 'mcp-parity', ['run', 'mcp:parity'], 'Los MCP activos estan en paridad.', 'Ejecuta npm run agent:harness:sync y corrige el MCP activo indicado.'),
    checkMcpSmoke(run, npm, config), checkExpo(run, npm), ...config.retiredTools.map((tool) => result(tool.id, tool.status, tool.summary, tool.remediation)),
  ];
  checks.sort((left, right) => config.checkOrder.indexOf(left.id) - config.checkOrder.indexOf(right.id));
  const counts = Object.fromEntries([...STATUS].map((status) => [status, checks.filter((check) => check.status === status).length]));
  return { ok: counts.FAIL === 0, counts, checks };
}

export function formatReport(report) {
  const lines = [`Harness doctor: ${report.ok ? 'PASS' : 'FAIL'}`];
  for (const check of report.checks) {
    lines.push(`${check.status.padEnd(4)} ${check.id}: ${check.summary}`);
    if (check.remediation) lines.push(`      Recuperacion: ${check.remediation}`);
  }
  return lines.join('\n');
}

if (import.meta.url === `file:///${process.argv[1].replaceAll('\\', '/')}`) {
  const report = runDoctor();
  process.stdout.write(`${process.argv.includes('--json') ? JSON.stringify(report, null, 2) : formatReport(report)}\n`);
  process.exitCode = report.ok ? 0 : 1;
}
