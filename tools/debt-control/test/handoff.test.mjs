import assert from 'node:assert/strict';
import { test } from 'node:test';

import { checkState, recommendContinuity, renderHandoff } from '../src/index.mjs';
import { NOW, fixtureRoot, tempCopy, readJson } from './helpers.mjs';
import { writeFileSync } from 'node:fs';
import path from 'node:path';

test('el prompt de relevo es reproducible y contiene las secciones obligatorias', () => {
  const state = checkState({ root: fixtureRoot('threshold-reached'), now: NOW });
  const render = () => renderHandoff({
    config: state.config,
    registry: state.registry,
    evaluation: state.evaluation,
    planId: 'plan-a',
    repo: 'example/fixture-repo',
  });
  const prompt = render();
  assert.equal(prompt, render());
  for (const section of ['## Objetivo', '## Estado real', '## Hallazgos a atacar', '## Alcance y no objetivos', '## Gates y validacion', '## Rollback', '## Criterio de retorno']) {
    assert.ok(prompt.includes(section), `falta seccion ${section}`);
  }
  assert.ok(prompt.includes('NO GENERAR MAS DEUDA TECNICA'));
  assert.ok(prompt.includes('PENDIENTE: aun no existe issue de saneamiento'));
});

test('el prompt redacta secretos presentes en la evidencia', () => {
  const root = tempCopy('threshold-reached');
  const registry = readJson(root, '.project-os/debt/registry.json');
  registry.items[0].evidence[0].ref = 'curl -H "Authorization: Bearer abc123SECRETO" https://user:pass@example.test/api';
  writeFileSync(path.join(root, '.project-os/debt/registry.json'), `${JSON.stringify(registry, null, 2)}\n`, 'utf8');
  const state = checkState({ root, now: NOW });
  const prompt = renderHandoff({
    config: state.config,
    registry: state.registry,
    evaluation: state.evaluation,
    planId: 'plan-a',
  });
  assert.ok(!prompt.includes('abc123SECRETO'));
  assert.ok(!prompt.includes('user:pass@'));
  assert.ok(prompt.includes('[redacted]'));
});

test('recomendacion: misma tarea solo para correccion pequena pre-archive con contexto sano', () => {
  const under = checkState({ root: fixtureRoot('under-budget'), now: NOW });
  // 4 items abiertos superan una correccion puntual -> tarea nueva.
  const batch = recommendContinuity({ phase: 'pre-archive', evaluation: under.evaluation, planId: 'plan-a', contextHealth: 'ok' });
  assert.equal(batch.recommendation, 'new-task');

  const small = {
    ...under.evaluation,
    plans: {
      ...under.evaluation.plans,
      'plan-a': { ...under.evaluation.plans['plan-a'], openItems: ['debt-bbbbbbbbbb01'], paused: false, triggers: [] },
    },
  };
  const same = recommendContinuity({ phase: 'pre-archive', evaluation: small, planId: 'plan-a', contextHealth: 'ok' });
  assert.equal(same.recommendation, 'same-task');
  assert.ok(same.reasons.length >= 1);

  const degraded = recommendContinuity({ phase: 'pre-archive', evaluation: small, planId: 'plan-a', contextHealth: 'degraded' });
  assert.equal(degraded.recommendation, 'new-task');
});

test('recomendacion: saneamiento, blockers o pausa exigen tarea nueva con razones', () => {
  const paused = checkState({ root: fixtureRoot('threshold-reached'), now: NOW });
  const result = recommendContinuity({ phase: 'remediation', evaluation: paused.evaluation, planId: 'plan-a', contextHealth: 'ok' });
  assert.equal(result.recommendation, 'new-task');
  assert.ok(result.reasons.some((reason) => /pausado/.test(reason)));

  const major = checkState({ root: fixtureRoot('major-immediate'), now: NOW });
  const blocking = recommendContinuity({ phase: 'pre-archive', evaluation: major.evaluation, planId: 'plan-a', contextHealth: 'ok' });
  assert.equal(blocking.recommendation, 'new-task');
  assert.ok(blocking.reasons.some((reason) => /Blockers\/Majors/.test(reason)));
});
