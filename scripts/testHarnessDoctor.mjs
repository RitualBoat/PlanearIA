import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { buildWindowsBatchCommand, runDoctor } from './harnessDoctor.mjs';
import { OAUTH_INTERACTIVE_REQUIRED, UNCLASSIFIED_FAILURE, classifyFailure, configuredEndpoint } from './lib/mcpFailureClassification.mjs';

const config = {
  project: { owner: 'RitualBoat', title: 'PlanearIA Product OS' },
  checkOrder: ['node-npm', 'git-worktree', 'openspec', 'github-projects', 'gitnexus', 'codegraph', 'harness-parity', 'mcp-parity', 'mcp-smoke', 'expo-compatibility', 'graphify'],
  oauthInteractiveServers: ['expo'],
  gitNexusFailurePatterns: ['Not a git repository', 'FTS indexes missing', 'query returned no structural context', 'impact did not resolve the expected'],
  retiredTools: [{ id: 'graphify', status: 'SKIP', summary: 'Graphify retirado/manual; no forma parte del harness activo.', remediation: null }],
};

const FIGMA_NOTE = 'Remote OAuth/HTTP server config present. Complete auth and tool listing inside an MCP client that supports this remote server.';
const EXPO_ENDPOINT = 'https://mcp.expo.dev/mcp';
// Evidencia real capturada con `npm run mcp:test -- expo --timeout=40000`.
const EXPO_OAUTH_STDERR = [
  't\n[23948] \nPlease authorize this client by visiting:\n',
  'https://mcp.expo.dev/oauth/authorize?response_type=code&client_id=bff449e9-08e1-4e81-8994-ee9ccb0199c6&code_challenge=r_J5CUGABeRDcA4Z&code_challenge_method=S256&redirect_uri=http%3A%2F%2Flocalhost%3A36566%2Foauth%2Fcallback&state=1a467a87&scope=mcp%3Aaccess&resource=https%3A%2F%2Fmcp.expo.dev%2Fmcp\n\n',
  '[23948] Browser opened automatically.\n[23948] Authentication required. Initializing auth...\n',
].join('');

function smokeReport(results) {
  return JSON.stringify({ ok: results.every((item) => item.ok), results });
}

const healthyResults = [{ name: 'codegraph', ok: true }, { name: 'figma', ok: true, note: FIGMA_NOTE }];
const mcpReport = smokeReport(healthyResults);

assert.equal(buildWindowsBatchCommand('npm.cmd', ['run', 'openspec:check']), 'npm.cmd run openspec:check');
assert.throws(() => buildWindowsBatchCommand('npm.cmd', ['run', 'mcp:test&whoami']), /token inseguro/);

// Salidas reales del CLI fijado, capturadas el 2026-07-19 (evidencia 02-cadenas-estado.txt).
const FRESH_STATUS = 'Repository: C:\\repo\nIndexed commit: 1d4dcb0\nCurrent commit: 1d4dcb0\nStatus: ✅ up-to-date';
const STALE_STATUS = 'Repository: C:\\repo\nIndexed commit: cca8116\nCurrent commit: 6b6e23c\nStatus: ⚠️ stale (re-run gitnexus analyze)';
const STRUCTURAL_OK = 'GitNexus structural verification passed.';
const STRUCTURAL_EMPTY = 'GitNexus query returned no structural context for the MVVM fixture.';

function isStructuralCall(args) {
  return args.includes('structural');
}

function healthyRun(calls, mcpStdout = mcpReport, mcpStatus = 0) {
  return (command, args) => {
    calls.push([command, ...args]);
    if (command === 'gh') return { status: 0, stdout: JSON.stringify({ projects: [{ title: 'PlanearIA Product OS' }] }) };
    if (command === 'git' && args[0] === 'status') return { status: 0, stdout: '' };
    if (command === 'git') return { status: 0, stdout: 'C:/repo' };
    if (args.includes('gitnexus:diagnose')) return { status: 0, stdout: FRESH_STATUS };
    if (isStructuralCall(args)) return { status: 0, stdout: STRUCTURAL_OK };
    // El doctor invoca el smoke dos veces: acotado a codegraph para el fallback lineado y completo para
    // mcp-smoke. Cada invocacion recibe su propio reporte para no cruzar los fixtures.
    if (args.includes('mcp:test') && args.includes('codegraph')) return { status: 0, stdout: smokeReport([{ name: 'codegraph', ok: true }]) };
    if (args.includes('mcp:test')) return { status: mcpStatus, stdout: mcpStdout };
    return { status: 0, stdout: 'ok' };
  };
}

// El smoke sale con codigo distinto de cero mientras un servidor no complete tools/list; el doctor clasifica
// por evidencia, no por ese codigo.
function doctorWithSmoke(results) {
  return runDoctor({ config, npm: 'npm', run: healthyRun([], smokeReport(results), results.every((item) => item.ok) ? 0 : 1) });
}

function smokeCheck(results) {
  return doctorWithSmoke(results).checks.find((check) => check.id === 'mcp-smoke');
}

const calls = [];
const healthy = runDoctor({ config, run: healthyRun(calls), npm: 'npm' });
assert.equal(healthy.ok, true);
assert.deepEqual(healthy.checks.map((check) => check.id), config.checkOrder);
assert.equal(healthy.checks.find((check) => check.id === 'mcp-smoke').status, 'WARN');
assert.equal(healthy.checks.find((check) => check.id === 'graphify').status, 'SKIP');
assert.equal(calls.some((call) => call.join(' ').toLowerCase().includes('graphify')), false);

// El caso sano ejercita la ruta completa: frescura clasificada y verificacion estructural resuelta.
assert.equal(healthy.checks.find((check) => check.id === 'gitnexus').status, 'PASS');
assert.equal(calls.some((call) => isStructuralCall(call)), true);

function gitNexusCheck(diagnose, structural = { status: 0, stdout: STRUCTURAL_OK }, calls = []) {
  const report = runDoctor({
    config,
    npm: 'npm',
    run: (command, args) => {
      if (command === 'npm' && args.includes('gitnexus:diagnose')) {
        calls.push([command, ...args]);
        return diagnose;
      }
      if (isStructuralCall(args)) {
        calls.push([command, ...args]);
        return structural;
      }
      return healthyRun([])(command, args);
    },
  });
  return { report, check: report.checks.find((item) => item.id === 'gitnexus') };
}

const falseGreen = gitNexusCheck({ status: 0, stdout: 'Not a git repository' });
assert.equal(falseGreen.report.ok, false);
assert.equal(falseGreen.check.status, 'FAIL');

// #112: un indice stale nunca puede pasar, y no se degrada a WARN para conservar el verde agregado.
const staleIndex = gitNexusCheck({ status: 0, stdout: STALE_STATUS });
assert.equal(staleIndex.check.status, 'FAIL');
assert.equal(staleIndex.report.ok, false);
assert.match(staleIndex.check.summary, /stale/i);
assert.match(staleIndex.check.remediation, /gitnexus:repair/);
assert.match(staleIndex.check.remediation, /gitnexus:verify/);

// Una salida que no permite clasificar la frescura falla: la ausencia de una firma de error
// conocida no es evidencia de salud.
for (const stdout of ['', 'ok', 'Repository: C:\\repo\nIndexed commit: abc1234']) {
  const unclassifiable = gitNexusCheck({ status: 0, stdout });
  assert.equal(unclassifiable.check.status, 'FAIL');
  assert.equal(unclassifiable.report.ok, false);
}

// Indice fresco cuyo fixture estructural no resuelve: tampoco pasa.
const brokenStructural = gitNexusCheck({ status: 0, stdout: FRESH_STATUS }, { status: 1, stdout: STRUCTURAL_EMPTY });
assert.equal(brokenStructural.check.status, 'FAIL');
assert.match(brokenStructural.check.summary, /estructural/i);

// La firma semantica invalida el resultado aunque el subproceso termine con codigo cero.
const structuralExitZero = gitNexusCheck({ status: 0, stdout: FRESH_STATUS }, { status: 0, stdout: STRUCTURAL_EMPTY });
assert.equal(structuralExitZero.check.status, 'FAIL');

// Indice fresco y funcional: la unica combinacion que aprueba.
const healthyGitNexus = gitNexusCheck({ status: 0, stdout: FRESH_STATUS });
assert.equal(healthyGitNexus.check.status, 'PASS');

// La comprobacion es read-only en todos los desenlaces: nunca repara ni reindexa.
const mutationCalls = [];
for (const diagnose of [{ status: 0, stdout: FRESH_STATUS }, { status: 0, stdout: STALE_STATUS }, { status: 0, stdout: 'ok' }]) {
  gitNexusCheck(diagnose, { status: 0, stdout: STRUCTURAL_OK }, mutationCalls);
}
assert.equal(mutationCalls.length > 0, true);
for (const call of mutationCalls) {
  const rendered = call.join(' ');
  assert.equal(/analyze|--repair-fts|--index-only|gitnexus:repair/.test(rendered), false, rendered);
}

const inaccessibleProject = runDoctor({
  config,
  npm: 'npm',
  run: (command, args) => command === 'gh' ? { status: 1, stderr: 'token=private-value' } : healthyRun([])(command, args),
});
const projectCheck = inaccessibleProject.checks.find((check) => check.id === 'github-projects');
assert.equal(projectCheck.status, 'FAIL');
assert.equal(projectCheck.summary.includes('private-value'), false);

const missingCommand = runDoctor({
  config,
  npm: 'npm',
  run: (command, args) => command === 'npm' && args[0] === '--version' ? { status: 1, error: 'spawn npm ENOENT' } : healthyRun([])(command, args),
});
assert.equal(missingCommand.checks.find((check) => check.id === 'node-npm').status, 'FAIL');

// Caso 1: MCP autenticado y respondiente.
const authenticated = smokeCheck([{ name: 'codegraph', ok: true }, { name: 'expo', ok: true, initialized: true, toolCount: 4 }]);
assert.equal(authenticated.status, 'PASS');

// Caso 2: OAuth interactivo requerido en un servidor de la allowlist.
const expoPending = { name: 'expo', ok: false, initialized: false, classification: OAUTH_INTERACTIVE_REQUIRED, stderr: EXPO_OAUTH_STDERR, error: 'Process exited with code 1' };
const oauthRequired = doctorWithSmoke([{ name: 'codegraph', ok: true }, expoPending]);
const oauthCheck = oauthRequired.checks.find((check) => check.id === 'mcp-smoke');
assert.equal(oauthCheck.status, 'WARN');
assert.equal(oauthRequired.ok, true);
assert.match(oauthCheck.summary, /expo/);
assert.match(oauthCheck.remediation, /sesion MCP interactiva/);
// El WARN no puede afirmar que las herramientas quedaron verificadas.
assert.match(oauthCheck.summary, /no expuso sus herramientas/);

// Caso 3: MCP realmente roto.
const broken = smokeCheck([{ name: 'codegraph', ok: false, initialized: false, classification: UNCLASSIFIED_FAILURE, error: 'spawn codegraph ENOENT' }]);
assert.equal(broken.status, 'FAIL');
assert.match(broken.summary, /codegraph/);

// El sintoma terminal no altera la clasificacion: timeout y exit distinto de cero dan el mismo WARN.
const timedOut = smokeCheck([{ ...expoPending, error: 'Timed out after 45000ms' }]);
assert.equal(timedOut.status, 'WARN');
assert.equal(timedOut.summary, smokeCheck([expoPending]).summary);

// OAuth pendiente fuera de la allowlist sigue en FAIL.
assert.equal(smokeCheck([{ ...expoPending, name: 'vercel' }]).status, 'FAIL');

// Un fallo real no queda enmascarado por un OAuth pendiente permitido en paralelo.
const mixed = smokeCheck([expoPending, { name: 'context7', ok: false, classification: UNCLASSIFIED_FAILURE, error: 'Process exited with code 1' }]);
assert.equal(mixed.status, 'FAIL');
assert.match(mixed.summary, /context7/);

// El WARN por nota de un MCP declarado por transporte url se conserva y convive con el WARN por evidencia.
const both = smokeCheck([{ name: 'figma', ok: true, note: FIGMA_NOTE }, expoPending]);
assert.equal(both.status, 'WARN');
assert.match(both.summary, /figma/);
assert.match(both.summary, /expo/);

// Un reporte ilegible es un fallo real: no hay evidencia que clasificar.
assert.equal(runDoctor({ config, npm: 'npm', run: healthyRun([], 'mcp test: crashed before reporting', 1) }).checks.find((check) => check.id === 'mcp-smoke').status, 'FAIL');

// Un fallo de paridad imprime JSON valido sin results[]: es FAIL, no un WARN por ausencia de fallos.
const parityFailure = JSON.stringify({ ok: false, universal: ['expo'], missingCodex: ['expo'], forbidden: [] });
assert.equal(runDoctor({ config, npm: 'npm', run: healthyRun([], parityFailure, 1) }).checks.find((check) => check.id === 'mcp-smoke').status, 'FAIL');

// Un servidor con nota de transporte url no se nombra dos veces si ademas llegara clasificado.
const notedAndPending = smokeCheck([{ name: 'figma', ok: true, note: FIGMA_NOTE }, expoPending]);
assert.equal((notedAndPending.summary.match(/figma/g) ?? []).length, 1);

// Clasificador: la evidencia exigida es conjunta y atada al endpoint configurado.
assert.equal(configuredEndpoint({ command: 'npx', args: ['-y', 'mcp-remote', EXPO_ENDPOINT] }), EXPO_ENDPOINT);
assert.equal(classifyFailure({ stderr: EXPO_OAUTH_STDERR, initialized: false, endpoint: EXPO_ENDPOINT }), OAUTH_INTERACTIVE_REQUIRED);
// Origen distinto del endpoint configurado: no es prueba valida.
assert.equal(classifyFailure({ stderr: EXPO_OAUTH_STDERR, initialized: false, endpoint: 'https://mcp.vercel.com' }), UNCLASSIFIED_FAILURE);
// Sin prompt de autorizacion no hay degradacion, aunque la salida mencione autorizacion.
assert.equal(classifyFailure({ stderr: 'Error: authorize handler crashed', initialized: false, endpoint: EXPO_ENDPOINT }), UNCLASSIFIED_FAILURE);
// Un servidor que llego a inicializar y luego fallo no es OAuth pendiente.
assert.equal(classifyFailure({ stderr: EXPO_OAUTH_STDERR, initialized: true, endpoint: EXPO_ENDPOINT }), UNCLASSIFIED_FAILURE);

// La evidencia reportada no expone secretos.
const leaked = smokeCheck([{ name: 'context7', ok: false, classification: UNCLASSIFIED_FAILURE, error: 'token=private-value' }]);
assert.equal(leaked.summary.includes('private-value'), false);

const integration = spawnSync(process.execPath, ['scripts/harnessDoctor.mjs', '--json'], { cwd: process.cwd(), encoding: 'utf8' });
const live = JSON.parse(integration.stdout);
assert.equal(integration.status, live.ok ? 0 : 1, integration.stderr || integration.stdout);
assert.equal(live.checks.find((check) => check.id === 'graphify').status, 'SKIP');
assert.deepEqual(live.checks.map((check) => check.id), config.checkOrder);

process.stdout.write('Harness doctor tests passed.\n');
