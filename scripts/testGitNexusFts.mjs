import assert from 'node:assert/strict';
import {
  FIXTURE_UID,
  findUnexpectedAgentChanges,
  hasFtsDiagnostic,
  verifyImpactResult,
  verifyQueryResult,
} from './gitNexusFts.mjs';

assert.equal(hasFtsDiagnostic('FTS indexes missing — keyword search degraded.'), true);
assert.equal(hasFtsDiagnostic('Status: up-to-date'), false);

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
