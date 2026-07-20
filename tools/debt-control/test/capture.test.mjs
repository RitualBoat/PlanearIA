import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';

import { capture, assessmentReflected, checkState, contentHash, fingerprint } from '../src/index.mjs';
import { NOW, readJson, tempCopy } from './helpers.mjs';

test('captura registra deuda nueva y el segundo run es no-op sin drift', () => {
  const root = tempCopy('second-run');
  const input = readJson(root, 'input/assessment.json');

  const first = capture({ root, flow: 'change-uno', input, now: NOW });
  assert.equal(first.noop, false);
  assert.equal(first.changes.length, 1);
  assert.equal(first.changes[0].action, 'created');

  const registryAfterFirst = readFileSync(path.join(root, '.project-os/debt/registry.json'), 'utf8');
  const assessmentAfterFirst = readFileSync(path.join(root, '.project-os/debt/assessments/change-uno.json'), 'utf8');

  const second = capture({ root, flow: 'change-uno', input, now: NOW });
  assert.equal(second.noop, true);
  assert.equal(readFileSync(path.join(root, '.project-os/debt/registry.json'), 'utf8'), registryAfterFirst);
  assert.equal(readFileSync(path.join(root, '.project-os/debt/assessments/change-uno.json'), 'utf8'), assessmentAfterFirst);
});

test('la evidencia historica es inmutable: input distinto para el mismo flujo falla', () => {
  const root = tempCopy('second-run');
  const input = readJson(root, 'input/assessment.json');
  capture({ root, flow: 'change-uno', input, now: NOW });

  const altered = { ...input, candidates: [] , result: 'clean' };
  assert.throws(
    () => capture({ root, flow: 'change-uno', input: altered, now: NOW }),
    /inmutable/,
  );
});

test('candidatos refutados y resueltos-previamente no crean deuda', () => {
  const root = tempCopy('refuted-candidates');
  const input = readJson(root, 'input/assessment.json');
  const result = capture({ root, flow: 'change-limpio', input, now: NOW });
  assert.equal(result.result, 'clean');
  const registry = readJson(root, '.project-os/debt/registry.json');
  assert.equal(registry.items.length, 0);
  const state = checkState({ root, now: NOW });
  assert.equal(state.evaluation.plans['plan-a'].budget, 0);
});

test('reaparicion en otro flujo agrega occurrence sin duplicar item', () => {
  const root = tempCopy('second-run');
  const input = readJson(root, 'input/assessment.json');
  capture({ root, flow: 'change-uno', input, now: NOW });
  capture({ root, flow: 'change-dos', input, now: NOW });
  const registry = readJson(root, '.project-os/debt/registry.json');
  assert.equal(registry.items.length, 1);
  assert.equal(registry.items[0].occurrences.length, 2);
});

test('ejecucion parcial: assessment sin registro se detecta y reejecutar converge', () => {
  const root = tempCopy('second-run');
  const input = readJson(root, 'input/assessment.json');

  // Simula la interrupcion: el assessment quedo escrito pero el registro no se actualizo.
  const assessment = { ...input, flow: 'change-uno' };
  mkdirSync(path.join(root, '.project-os/debt/assessments'), { recursive: true });
  writeFileSync(
    path.join(root, '.project-os/debt/assessments/change-uno.json'),
    `${JSON.stringify(assessment, null, 2)}\n`,
    'utf8',
  );

  const state = checkState({ root, now: NOW });
  const partial = state.checks.find((entry) => entry.id === 'assessment-change-uno');
  assert.equal(partial.status, 'FAIL');
  assert.match(partial.summary, /no esta reflejado/);

  const rerun = capture({ root, flow: 'change-uno', input, now: NOW });
  assert.equal(rerun.wroteAssessment, false);
  assert.equal(rerun.wroteRegistry, true);
  const after = checkState({ root, now: NOW });
  assert.equal(after.checks.filter((entry) => entry.status === 'FAIL').length, 0);
});

test('resolves cierra items con trazabilidad y assessmentReflected lo reconoce', () => {
  const root = tempCopy('second-run');
  const input = readJson(root, 'input/assessment.json');
  capture({ root, flow: 'change-uno', input, now: NOW });
  const registry = readJson(root, '.project-os/debt/registry.json');
  const id = registry.items[0].id;

  const remediation = {
    schemaVersion: 1,
    date: '2026-07-20',
    kind: 'remediation',
    result: 'clean',
    candidates: [],
    resolves: [{ id, evidence: 'PR #999 con tests que validan la entrada' }],
  };
  const result = capture({ root, flow: 'saneamiento-uno', input: remediation, now: NOW });
  assert.deepEqual(result.changes, [{ action: 'resolved', id }]);
  const after = readJson(root, '.project-os/debt/registry.json');
  assert.equal(after.items[0].status, 'resolved');
  assert.equal(after.items[0].resolution.flow, 'saneamiento-uno');
  assert.ok(assessmentReflected({ registry: after, assessment: { ...remediation, flow: 'saneamiento-uno' } }));
});

test('las excepciones se aplican via capture y quedan validadas', () => {
  const root = tempCopy('second-run');
  const input = readJson(root, 'input/assessment.json');
  capture({ root, flow: 'change-uno', input, now: NOW });
  const registry = readJson(root, '.project-os/debt/registry.json');
  const id = registry.items[0].id;

  const withException = {
    schemaVersion: 1,
    date: '2026-07-20',
    kind: 'remediation',
    result: 'clean',
    candidates: [],
    exceptions: [{
      id,
      reason: 'Dependencia externa sin fix disponible.',
      owner: 'solo-dev',
      approvedBy: 'solo-dev',
      expiresOn: '2026-09-30',
      recovery: 'Reevaluar al publicarse la correccion upstream.',
    }],
  };
  capture({ root, flow: 'excepcion-uno', input: withException, now: NOW });
  const after = readJson(root, '.project-os/debt/registry.json');
  assert.equal(after.items[0].status, 'accepted-exception');
  assert.equal(after.items[0].exception.expiresOn, '2026-09-30');
  const state = checkState({ root, now: NOW });
  assert.equal(state.evaluation.plans['plan-a'].budget, 0);
});

test('una excepcion con expiracion mas alla del horizonte maximo es rechazada', () => {
  const root = tempCopy('second-run');
  const input = readJson(root, 'input/assessment.json');
  capture({ root, flow: 'change-uno', input, now: NOW });
  const registry = readJson(root, '.project-os/debt/registry.json');
  const id = registry.items[0].id;
  const permanent = {
    schemaVersion: 1,
    date: '2026-07-20',
    kind: 'remediation',
    result: 'clean',
    candidates: [],
    exceptions: [{ id, reason: 'x', owner: 'x', approvedBy: 'x', expiresOn: '9999-12-31', recovery: 'x' }],
  };
  assert.throws(() => capture({ root, flow: 'excepcion-permanente', input: permanent, now: NOW }), /permanente de facto/);
});

test('el fingerprint es estable ante mayusculas y espacios', () => {
  const base = fingerprint({ category: 'technical-debt', artifact: 'src/parser.mjs', title: 'Atajo temporal en el parser' });
  const variant = fingerprint({ category: 'technical-debt', artifact: ' SRC/parser.mjs ', title: 'atajo  temporal en el PARSER' });
  assert.equal(base, variant);
  assert.match(base, /^debt-[0-9a-f]{12}$/);
  assert.notEqual(base, fingerprint({ category: 'defect', artifact: 'src/parser.mjs', title: 'Atajo temporal en el parser' }));
});

test('contentHash canonico ignora el orden de claves', () => {
  assert.equal(contentHash({ a: 1, b: [1, 2] }), contentHash({ b: [1, 2], a: 1 }));
});
