import assert from 'node:assert/strict';
import {
  FIXTURE_UID,
  GITNEXUS_VERSION,
  assertDiagnosticStatusHealthy,
  buildWindowsGitNexusInvocation,
  findUnexpectedAgentChanges,
  hasFtsDiagnostic,
  hasRepositoryDiagnostic,
  verifyImpactResult,
  verifyQueryResult,
} from './gitNexusFts.mjs';

assert.equal(hasFtsDiagnostic('FTS indexes missing — keyword search degraded.'), true);
assert.equal(hasFtsDiagnostic('Status: up-to-date'), false);
assert.equal(hasRepositoryDiagnostic('Not a git repository.'), true);
assert.equal(hasRepositoryDiagnostic('Repository: C:\\repo'), false);
assert.throws(() => assertDiagnosticStatusHealthy('Not a git repository.'), /repository root/i);
assert.doesNotThrow(() => assertDiagnosticStatusHealthy('Repository: C:\\Planear IA\\PlanearIA\nStatus: stale'));

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
