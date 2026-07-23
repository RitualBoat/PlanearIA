import assert from 'node:assert/strict';
import { test } from 'node:test';

import { validateAssessment, validateConfig, validateRegistry } from '../../src/debt/index.mjs';
import { fixtureRoot, readJson } from './helpers.mjs';

const config = readJson(fixtureRoot('under-budget'), '.project-os/debt/config.json');

test('config y registry de fixtures validan sin errores', () => {
  assert.deepEqual(validateConfig(config), []);
  const registry = readJson(fixtureRoot('under-budget'), '.project-os/debt/registry.json');
  assert.deepEqual(validateRegistry(registry, config), []);
});

test('config invalida nombra el campo exacto', () => {
  const broken = JSON.parse(JSON.stringify(config));
  broken.github.mode = 'siempre';
  broken.budget.threshold = -1;
  broken.planRouting.labelMap['x'] = 'plan-inexistente';
  const errors = validateConfig(broken);
  const paths = errors.map((error) => error.path);
  assert.ok(paths.includes('config.github.mode'));
  assert.ok(paths.includes('config.budget.threshold'));
  assert.ok(paths.includes('config.planRouting.labelMap.x'));
});

test('un item con categoria fuera de las siete canonicas falla', () => {
  const registry = readJson(fixtureRoot('under-budget'), '.project-os/debt/registry.json');
  registry.items[0].category = 'mejora-random';
  const errors = validateRegistry(registry, config);
  assert.ok(errors.some((error) => error.path.endsWith('.category')));
});

test('estados terminales exigen resolucion trazable e ids duplicados fallan', () => {
  const registry = readJson(fixtureRoot('under-budget'), '.project-os/debt/registry.json');
  registry.items[0].status = 'resolved';
  registry.items[1].id = registry.items[2].id;
  const errors = validateRegistry(registry, config);
  assert.ok(errors.some((error) => error.path.endsWith('.resolution')));
  assert.ok(errors.some((error) => /id duplicado/.test(error.message)));
});

test('un assessment exige verificacion por candidato y coherencia clean/debt', () => {
  const base = {
    schemaVersion: 1,
    flow: 'change-x',
    date: '2026-07-20',
    kind: 'feature',
    result: 'clean',
    candidates: [{
      title: 'Hallazgo sin verificar',
      artifact: 'src/x.mjs',
      source: 'scanner',
      category: 'technical-debt',
      severity: 'minor',
      transversal: false,
      critical: false,
      planOwner: 'plan-a',
      evidence: [{ type: 'log', ref: 'salida', date: '2026-07-20' }],
    }],
  };
  const errors = validateAssessment(base, config);
  assert.ok(errors.some((error) => error.path.endsWith('.verification')));
  assert.ok(errors.some((error) => error.path === 'assessment.result'));

  const clean = { ...base, candidates: [] };
  assert.deepEqual(validateAssessment(clean, config), []);
});

test('una excepcion incompleta o sin fecha ISO falla', () => {
  const assessment = {
    schemaVersion: 1,
    flow: 'change-x',
    date: '2026-07-20',
    kind: 'remediation',
    result: 'clean',
    candidates: [],
    exceptions: [{ id: 'debt-aaaaaaaaaa01', reason: 'x', owner: 'x', approvedBy: '', expiresOn: '20-07-2026', recovery: 'x' }],
  };
  const errors = validateAssessment(assessment, config);
  assert.ok(errors.some((error) => error.path.endsWith('.approvedBy')));
  assert.ok(errors.some((error) => error.path.endsWith('.expiresOn')));
});
