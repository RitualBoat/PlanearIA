import assert from 'node:assert/strict';
import { test } from 'node:test';

import { evaluate, resolvePlanForLabels, hasAllowlistedLabel, unitsFor } from '../src/index.mjs';
import { loadConfig, loadRegistry } from '../src/store.mjs';
import { fixtureRoot, NOW } from './helpers.mjs';

function stateOf(name) {
  const root = fixtureRoot(name);
  const config = loadConfig(root);
  const registry = loadRegistry(root, config);
  return { config, registry, evaluation: evaluate({ config, registry, now: NOW }) };
}

test('bajo presupuesto: 4 unidades no pausan el plan', () => {
  const { evaluation } = stateOf('under-budget');
  assert.equal(evaluation.plans['plan-a'].budget, 4);
  assert.equal(evaluation.plans['plan-a'].paused, false);
  assert.deepEqual(evaluation.pausedPlans, []);
});

test('umbral alcanzado: 5 unidades pausan solo el plan afectado', () => {
  const { evaluation } = stateOf('threshold-reached');
  assert.equal(evaluation.plans['plan-a'].budget, 5);
  assert.equal(evaluation.plans['plan-a'].paused, true);
  assert.ok(evaluation.plans['plan-a'].pausedBy.includes('budget-threshold'));
  assert.equal(evaluation.plans['plan-b'].paused, false);
});

test('minor transversal vale 2 unidades y minor normal 1', () => {
  const { config, registry } = stateOf('threshold-reached');
  const transversal = registry.items.find((item) => item.transversal);
  const normal = registry.items.find((item) => !item.transversal);
  assert.equal(unitsFor(transversal, config), 2);
  assert.equal(unitsFor(normal, config), 1);
});

test('major inmediato: bloquea sin acumulacion', () => {
  const { evaluation } = stateOf('major-immediate');
  assert.equal(evaluation.plans['plan-a'].paused, true);
  assert.deepEqual(evaluation.plans['plan-a'].pausedBy, ['blocker-major']);
  assert.equal(evaluation.plans['plan-a'].budget, 0);
});

test('hallazgo repetido en 3 flujos dispara recurrencia', () => {
  const { evaluation } = stateOf('repeated-finding');
  assert.ok(evaluation.plans['plan-a'].pausedBy.includes('recurrence'));
});

test('excepcion expirada dispara saneamiento y vuelve a contar unidades', () => {
  const { evaluation } = stateOf('expired-exception');
  assert.ok(evaluation.plans['plan-a'].pausedBy.includes('expired-exception'));
  assert.equal(evaluation.plans['plan-a'].budget, 1);
});

test('excepcion vigente no pausa ni consume presupuesto', () => {
  const root = fixtureRoot('expired-exception');
  const config = loadConfig(root);
  const registry = loadRegistry(root, config);
  const before = new Date('2026-07-05T12:00:00.000Z');
  const evaluation = evaluate({ config, registry, now: before });
  assert.equal(evaluation.plans['plan-a'].paused, false);
  assert.equal(evaluation.plans['plan-a'].budget, 0);
});

test('deuda transversal critica pausa todos los planes', () => {
  const { config, registry } = stateOf('major-immediate');
  registry.items[0].transversal = true;
  registry.items[0].critical = true;
  const evaluation = evaluate({ config, registry, now: NOW });
  assert.equal(evaluation.plans['plan-a'].paused, true);
  assert.equal(evaluation.plans['plan-b'].paused, true);
  assert.equal(evaluation.globalTriggers.length, 1);
});

test('cinco flujos con deuda residual disparan el trigger de flujos', () => {
  const { config, registry } = stateOf('under-budget');
  registry.items.forEach((item, index) => {
    item.occurrences = [{ flow: `flow-${index + 1}`, date: '2026-07-01' }];
  });
  registry.items[0].occurrences.push({ flow: 'flow-5', date: '2026-07-02' });
  const evaluation = evaluate({ config, registry, now: NOW });
  assert.equal(evaluation.plans['plan-a'].flowsWithResidualDebt, 5);
  assert.ok(evaluation.plans['plan-a'].pausedBy.includes('flows-with-debt'));
});

test('ruteo por labels: primera label mapeada gana, default cubre el resto', () => {
  const { config } = stateOf('under-budget');
  assert.equal(resolvePlanForLabels(config, [{ name: 'feature-b' }]), 'plan-b');
  assert.equal(resolvePlanForLabels(config, ['sin-mapa']), 'plan-a');
  assert.ok(hasAllowlistedLabel(config, [{ name: 'security' }]));
  assert.equal(hasAllowlistedLabel(config, ['feature-a']), false);
});
