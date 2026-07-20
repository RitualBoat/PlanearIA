import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { runCli } from '../src/index.mjs';
import { fixtureRoot, tempCopy } from './helpers.mjs';

function run(argv, cwd, runner) {
  const outputs = [];
  const code = runCli(argv, { cwd, runner, write: (text) => outputs.push(text) });
  return { code, text: outputs.join('\n') };
}

// Mock minimo de gh con estado, para probar postfinish de extremo a extremo sin red.
function ghMock() {
  const issues = [];
  let next = 200;
  return (command, args) => {
    if (args[0] === '--version' || args[0] === 'auth') return { status: 0, stdout: 'ok', stderr: '' };
    if (args[0] === 'issue' && args[1] === 'list') return { status: 0, stdout: JSON.stringify(issues), stderr: '' };
    if (args[0] === 'issue' && args[1] === 'create') {
      const body = args[args.indexOf('--body') + 1];
      issues.push({ number: next, title: args[args.indexOf('--title') + 1], body, url: `https://example.test/issues/${next}`, state: 'open' });
      next += 1;
      return { status: 0, stdout: issues.at(-1).url, stderr: '' };
    }
    if (args[0] === 'issue' && args[1] === 'edit') {
      const issue = issues.find((entry) => entry.number === Number(args[2]));
      issue.body = args[args.indexOf('--body') + 1];
      return { status: 0, stdout: '', stderr: '' };
    }
    throw new Error(`gh no esperado: ${args.join(' ')}`);
  };
}

test('check humano y JSON comparten veredicto, causa y recuperacion', () => {
  const root = fixtureRoot('threshold-reached');
  const human = run(['check', '--now', '2026-07-20'], root);
  const json = run(['check', '--now', '2026-07-20', '--json'], root);
  assert.equal(human.code, 1);
  assert.equal(json.code, 1);
  const parsed = JSON.parse(json.text);
  assert.equal(parsed.verdict, 'FAIL');
  assert.ok(human.text.startsWith('debt-control check: FAIL'));
  for (const entry of parsed.checks) {
    assert.ok(human.text.includes(`${entry.id}: ${entry.summary.split('\n')[0]}`));
    if (entry.recovery) assert.ok(human.text.includes(entry.recovery.split('\n')[0]));
  }
});

test('check en repositorio sin motor reporta SKIP con exit 0', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'debt-control-cli-'));
  const result = run(['check'], root);
  assert.equal(result.code, 0);
  assert.ok(result.text.includes('SKIP'));
});

test('gate pre-archive exige --change y reporta uso invalido con exit 2', () => {
  const result = run(['gate', '--phase', 'pre-archive'], fixtureRoot('under-budget'));
  assert.equal(result.code, 2);
  assert.match(result.text, /--change/);
});

test('capture desde CLI escribe estado y postfinish en modo off hace SKIP de GitHub', () => {
  const root = tempCopy('second-run');
  const captured = run(['capture', '--flow', 'change-uno', '--input', 'input/assessment.json', '--now', '2026-07-20'], root);
  assert.equal(captured.code, 0);
  assert.match(captured.text, /capturado/);

  const postfinish = run(['postfinish', '--now', '2026-07-20', '--json'], root);
  const parsed = JSON.parse(postfinish.text);
  assert.equal(parsed.githubMode, 'off');
  assert.ok(parsed.checks.some((entry) => entry.id === 'github-sync' && entry.status === 'SKIP'));
});

test('postfinish: la primera deteccion de una pausa falla y la pausa reconocida degrada a WARN', () => {
  const root = tempCopy('github-required');
  const runner = ghMock();

  const first = run(['postfinish', '--now', '2026-07-20', '--json'], root, runner);
  assert.equal(first.code, 1);
  const parsedFirst = JSON.parse(first.text);
  assert.ok(parsedFirst.checks.some((entry) => entry.id === 'plan-plan-a' && entry.status === 'FAIL'));
  assert.ok(parsedFirst.checks.some((entry) => entry.id === 'github-issue-plan-a' && /creado/.test(entry.summary)));
  assert.ok(parsedFirst.checks.some((entry) => entry.id === 'github-refs' && entry.status === 'WARN'));

  const second = run(['postfinish', '--now', '2026-07-20', '--json'], root, runner);
  assert.equal(second.code, 0);
  const parsedSecond = JSON.parse(second.text);
  assert.equal(parsedSecond.verdict, 'WARN');
  const plan = parsedSecond.checks.find((entry) => entry.id === 'plan-plan-a');
  assert.equal(plan.status, 'WARN');
  assert.match(plan.summary, /Pausa ya reconocida/);
});

test('postfinish: un fallo de sync en modo required conserva el FAIL del plan', () => {
  const root = tempCopy('github-required');
  const failing = () => ({ status: 1, stdout: '', stderr: 'gh: not logged in' });
  const result = run(['postfinish', '--now', '2026-07-20', '--json'], root, failing);
  assert.equal(result.code, 1);
  const parsed = JSON.parse(result.text);
  assert.ok(parsed.checks.some((entry) => entry.id === 'plan-plan-a' && entry.status === 'FAIL'));
  assert.ok(parsed.checks.some((entry) => entry.id === 'github-sync' && entry.status === 'FAIL'));
});

test('handoff imprime recomendacion y prompt desde datos canonicos', () => {
  const result = run(['handoff', '--plan', 'plan-a', '--phase', 'remediation', '--now', '2026-07-20'], fixtureRoot('threshold-reached'));
  assert.equal(result.code, 0);
  assert.match(result.text, /Recomendacion: new-task/);
  assert.match(result.text, /Prompt de relevo/);
});

test('comando desconocido imprime uso con exit 2', () => {
  const result = run(['nada'], fixtureRoot('under-budget'));
  assert.equal(result.code, 2);
  assert.match(result.text, /Uso: debt-control/);
});
