import assert from 'node:assert/strict';
import { test } from 'node:test';

import { checkState, syncGithub, planMarker, renderManagedBlock } from '../src/index.mjs';
import { NOW, readJson, tempCopy } from './helpers.mjs';

function failingRunner() {
  return { status: 1, stdout: '', stderr: 'gh: not logged in' };
}

// Runner simulado con estado: emula gh issue list/create/edit sin red.
function makeMockGithub() {
  const issues = [];
  const calls = [];
  let nextNumber = 100;
  const runner = (command, args) => {
    calls.push([command, ...args]);
    assert.equal(command, 'gh');
    if (args[0] === '--version') return { status: 0, stdout: 'gh version test', stderr: '' };
    if (args[0] === 'auth') return { status: 0, stdout: 'Logged in', stderr: '' };
    if (args[0] === 'issue' && args[1] === 'list') {
      return { status: 0, stdout: JSON.stringify(issues.filter((issue) => issue.state === 'open')), stderr: '' };
    }
    if (args[0] === 'issue' && args[1] === 'create') {
      const title = args[args.indexOf('--title') + 1];
      const body = args[args.indexOf('--body') + 1];
      const number = nextNumber;
      nextNumber += 1;
      issues.push({ number, title, body, url: `https://example.test/issues/${number}`, state: 'open' });
      return { status: 0, stdout: `https://example.test/issues/${number}`, stderr: '' };
    }
    if (args[0] === 'issue' && args[1] === 'edit') {
      const number = Number(args[2]);
      const body = args[args.indexOf('--body') + 1];
      const issue = issues.find((entry) => entry.number === number);
      issue.body = body;
      return { status: 0, stdout: '', stderr: '' };
    }
    throw new Error(`Llamada gh no esperada: ${args.join(' ')}`);
  };
  return { issues, calls, runner };
}

test('modo off reporta SKIP y no invoca gh', () => {
  const root = tempCopy('github-off');
  const state = checkState({ root, now: NOW });
  const result = syncGithub({ root, config: state.config, registry: state.registry, evaluation: state.evaluation, runner: () => { throw new Error('no debe llamarse'); } });
  assert.equal(result.mode, 'off');
  assert.equal(result.checks[0].status, 'SKIP');
});

test('modo advisory degrada a WARN cuando gh no esta utilizable', () => {
  const root = tempCopy('github-advisory');
  const state = checkState({ root, now: NOW });
  const result = syncGithub({ root, config: state.config, registry: state.registry, evaluation: state.evaluation, runner: failingRunner });
  assert.equal(result.checks[0].status, 'WARN');
  assert.match(result.checks[0].summary, /advisory/i);
});

test('modo required produce FAIL con recuperacion cuando gh no esta utilizable', () => {
  const root = tempCopy('github-required');
  const state = checkState({ root, now: NOW });
  const result = syncGithub({ root, config: state.config, registry: state.registry, evaluation: state.evaluation, runner: failingRunner });
  assert.equal(result.checks[0].status, 'FAIL');
  assert.ok(result.checks[0].recovery);
});

test('required crea un issue idempotente por plan pausado y reejecutar es no-op', () => {
  const root = tempCopy('github-required');
  const state = checkState({ root, now: NOW });
  const mock = makeMockGithub();

  const first = syncGithub({ root, config: state.config, registry: state.registry, evaluation: state.evaluation, runner: mock.runner });
  assert.equal(first.checks.every((entry) => entry.status === 'PASS'), true);
  assert.equal(mock.issues.length, 1);
  assert.ok(mock.issues[0].body.includes(planMarker('plan-a')));
  assert.ok(mock.issues[0].body.includes('NO GENERAR MAS DEUDA TECNICA'));
  assert.ok(mock.issues[0].body.includes('subchanges cohesivos'));

  // El registro guarda la referencia del issue para trazabilidad.
  const registry = readJson(root, '.project-os/debt/registry.json');
  assert.equal(registry.items[0].issue, 100);

  const editsBefore = mock.calls.filter((call) => call.includes('edit')).length;
  const state2 = checkState({ root, now: NOW });
  const second = syncGithub({ root, config: state2.config, registry: state2.registry, evaluation: state2.evaluation, runner: mock.runner });
  assert.equal(mock.issues.length, 1);
  assert.equal(mock.calls.filter((call) => call.includes('edit')).length, editsBefore);
  assert.ok(second.checks.some((entry) => /no-op/.test(entry.summary)));
});

test('la sincronizacion actualiza el bloque administrado preservando texto ajeno', () => {
  const root = tempCopy('github-required');
  const state = checkState({ root, now: NOW });
  const mock = makeMockGithub();
  syncGithub({ root, config: state.config, registry: state.registry, evaluation: state.evaluation, runner: mock.runner });

  // Un humano agrega notas fuera del bloque administrado y el estado cambia.
  mock.issues[0].body = `Notas humanas arriba.\n\n${mock.issues[0].body}\n\nNotas humanas abajo.`;
  const registry = readJson(root, '.project-os/debt/registry.json');
  registry.items[0].severity = 'blocker';
  const evaluation = checkState({ root, now: NOW }).evaluation;
  evaluation.plans['plan-a'].paused = true;

  const result = syncGithub({ root, config: state.config, registry, evaluation, runner: mock.runner });
  assert.ok(result.checks.every((entry) => entry.status === 'PASS'));
  assert.ok(mock.issues[0].body.startsWith('Notas humanas arriba.'));
  assert.ok(mock.issues[0].body.trimEnd().endsWith('Notas humanas abajo.'));
  assert.ok(mock.issues[0].body.includes('[blocker]'));
});

test('el contenido hostil del registro queda como dato inerte del cuerpo', () => {
  const root = tempCopy('github-required');
  const state = checkState({ root, now: NOW });
  state.registry.items[0].title = 'Hallazgo con $(rm -rf /) y `backticks`';
  const block = renderManagedBlock({
    config: state.config,
    plan: state.config.plans[0],
    items: state.registry.items,
    evaluation: state.evaluation,
  });
  assert.ok(block.includes('$(rm -rf /)'));
});
