import assert from 'node:assert/strict';
import {
  FIXTURE_UID,
  FRESH,
  GITNEXUS_VERSION,
  STALE,
  UNCLASSIFIABLE,
  assertDiagnosticStatusHealthy,
  buildWindowsGitNexusInvocation,
  classifyIndexFreshness,
  findUnexpectedAgentChanges,
  hasFtsDiagnostic,
  hasRepositoryDiagnostic,
  verifyImpactResult,
  verifyQueryResult,
} from './gitNexusFts.mjs';

// Salidas reales del CLI fijado, capturadas el 2026-07-19 (evidencia 02-cadenas-estado.txt).
const STALE_STATUS = [
  'Repository: C:\\Planear IA\\PlanearIA',
  "Workspace index: last analyzed on 'development' (re-run gitnexus analyze to follow the current branch)",
  'Indexed commit: cca8116',
  'Current commit: 6b6e23c',
  'Status: ⚠️ stale (re-run gitnexus analyze)',
].join('\n');
const FRESH_STATUS = [
  'Repository: C:\\Planear IA\\PlanearIA',
  'Indexed commit: 1d4dcb0',
  'Current commit: 1d4dcb0',
  'Status: ✅ up-to-date',
].join('\n');

assert.equal(hasFtsDiagnostic('FTS indexes missing — keyword search degraded.'), true);
assert.equal(hasFtsDiagnostic('Status: up-to-date'), false);
assert.equal(hasRepositoryDiagnostic('Not a git repository.'), true);
assert.equal(hasRepositoryDiagnostic('Repository: C:\\repo'), false);
assert.throws(() => assertDiagnosticStatusHealthy('Not a git repository.'), /repository root/i);

// La clasificacion se ancla a la linea Status: y tolera la decoracion del CLI.
assert.equal(classifyIndexFreshness(FRESH_STATUS), FRESH);
assert.equal(classifyIndexFreshness(STALE_STATUS), STALE);
assert.equal(classifyIndexFreshness(''), UNCLASSIFIABLE);
assert.equal(classifyIndexFreshness('Repository: C:\\repo\nIndexed commit: abc1234'), UNCLASSIFIABLE);
assert.equal(classifyIndexFreshness('Status: reindexing in progress'), UNCLASSIFIABLE);
// Afirmar las dos cosas a la vez no es evidencia de nada.
assert.equal(classifyIndexFreshness('Status: up-to-date but stale'), UNCLASSIFIABLE);
// La palabra fuera de la linea de estado no clasifica: una ruta puede contener "stale".
assert.equal(classifyIndexFreshness('Repository: C:\\stale-repo\nStatus: ✅ up-to-date'), FRESH);
assert.equal(
  classifyIndexFreshness('Repository: C:\\up-to-date-backup\nStatus: ⚠️ stale (re-run gitnexus analyze)'),
  STALE,
);

// Un indice stale NO es sano: antes de #112 esta misma ruta con espacios afirmaba lo contrario y
// blindaba el falso verde del doctor.
assert.throws(() => assertDiagnosticStatusHealthy(STALE_STATUS), /stale/i);
assert.throws(() => assertDiagnosticStatusHealthy('Repository: C:\\Planear IA\\PlanearIA'), /classifiable/i);
assert.doesNotThrow(() => assertDiagnosticStatusHealthy(FRESH_STATUS));

const windowsInvocation = buildWindowsGitNexusInvocation(['status']);
assert.equal(windowsInvocation.command, 'C:\\Program Files\\nodejs\\node.exe');
assert.deepEqual(windowsInvocation.args, [
  'C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npx-cli.js',
  '-y',
  `gitnexus@${GITNEXUS_VERSION}`,
  'status',
]);

verifyQueryResult({ definitions: [{ id: 'File:src/hooks/useCrearPlaneacionViewModel.ts' }] });
assert.throws(() => verifyQueryResult({ definitions: [], process_symbols: [] }), /no structural context/i);

verifyImpactResult({ target: { id: FIXTURE_UID }, epistemic: 'exact' });
assert.throws(
  () => verifyImpactResult({ target: { id: FIXTURE_UID }, epistemic: 'estimated' }),
  /must be exact/i,
);

const unexpected = findUnexpectedAgentChanges(
  ' M AGENTS.md\n M .agents/instructions/core.md\n M src/hooks/example.ts',
  ['AGENTS.md'],
);
assert.deepEqual(unexpected, ['.agents/instructions/core.md']);

process.stdout.write('GitNexus FTS verifier unit smoke passed.\n');
