import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { capture, preArchiveGate, preProposeGate } from '../src/index.mjs';
import { NOW, readJson, tempCopy, fixtureRoot } from './helpers.mjs';

test('pre-propose: SKIP explicito sin motor configurado', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'debt-control-unconfigured-'));
  const result = preProposeGate({ root, labels: [], now: NOW });
  assert.equal(result.status, 'SKIP');
  assert.match(result.summary, /no esta configurado/);
});

test('pre-propose: plan pausado bloquea features y la allowlist permite saneamiento', () => {
  const root = fixtureRoot('threshold-reached');
  const blocked = preProposeGate({ root, labels: ['feature-a'], now: NOW });
  assert.equal(blocked.status, 'FAIL');
  assert.match(blocked.summary, /pausado/);
  assert.ok(blocked.recovery);

  const allowed = preProposeGate({ root, labels: ['feature-a', 'debt-remediation'], now: NOW });
  assert.equal(allowed.status, 'PASS');

  const otherPlan = preProposeGate({ root, labels: ['feature-b'], now: NOW });
  assert.equal(otherPlan.status, 'PASS');
});

test('pre-propose: deuda transversal critica bloquea todos los planes', () => {
  const root = tempCopy('major-immediate');
  const registry = readJson(root, '.project-os/debt/registry.json');
  registry.items[0].transversal = true;
  registry.items[0].critical = true;
  writeFileSync(path.join(root, '.project-os/debt/registry.json'), `${JSON.stringify(registry, null, 2)}\n`, 'utf8');

  const result = preProposeGate({ root, labels: ['feature-b'], now: NOW });
  assert.equal(result.status, 'FAIL');
  assert.match(result.summary, /transversal critica/);
});

test('pre-archive: falla sin assessment y pasa con cierre clean', () => {
  const root = tempCopy('refuted-candidates');
  const missing = preArchiveGate({ root, change: 'change-limpio', now: NOW });
  assert.equal(missing[0].status, 'FAIL');
  assert.match(missing[0].recovery, /capture/);

  capture({ root, flow: 'change-limpio', input: readJson(root, 'input/assessment.json'), now: NOW });
  const results = preArchiveGate({ root, change: 'change-limpio', now: NOW });
  assert.ok(results.every((entry) => entry.status === 'PASS'));
});

test('pre-archive: un Blocker/Major confirmado del flujo bloquea el archive', () => {
  const root = tempCopy('refuted-candidates');
  const assessment = {
    schemaVersion: 1,
    date: '2026-07-20',
    kind: 'feature',
    result: 'debt',
    candidates: [{
      title: 'Perdida de datos al sincronizar',
      artifact: 'src/sync/queue.mjs',
      source: 'revision adversarial',
      category: 'defect',
      severity: 'major',
      transversal: false,
      critical: false,
      planOwner: 'plan-a',
      evidence: [{ type: 'repro', ref: 'pasos 1-3 reproducidos', date: '2026-07-20' }],
      verification: { method: 'reproduccion', result: 'se pierde el ultimo item de la cola', date: '2026-07-20' },
    }],
  };
  mkdirSync(path.join(root, '.project-os/debt/assessments'), { recursive: true });
  capture({ root, flow: 'change-roto', input: assessment, now: NOW });
  const results = preArchiveGate({ root, change: 'change-roto', now: NOW });
  const gate = results.find((entry) => entry.id === 'debt-gate');
  assert.equal(gate.status, 'FAIL');
  assert.match(gate.summary, /major/i);
});

test('pre-archive: deuda nueva sobre plan pausado falla salvo remediation', () => {
  const root = tempCopy('threshold-reached');
  const newDebt = {
    schemaVersion: 1,
    date: '2026-07-20',
    kind: 'feature',
    result: 'debt',
    candidates: [{
      title: 'Otro atajo en plan pausado',
      artifact: 'src/otro.mjs',
      source: 'revision',
      category: 'technical-debt',
      severity: 'minor',
      transversal: false,
      critical: false,
      planOwner: 'plan-a',
      evidence: [{ type: 'review', ref: 'hallazgo 1', date: '2026-07-20' }],
      verification: { method: 'lectura', result: 'atajo presente', date: '2026-07-20' },
    }],
  };
  capture({ root, flow: 'change-en-pausa', input: newDebt, now: NOW });
  const results = preArchiveGate({ root, change: 'change-en-pausa', now: NOW });
  const gate = results.find((entry) => entry.id === 'debt-gate');
  assert.equal(gate.status, 'FAIL');
  assert.match(gate.summary, /plan pausado/);

  const remediation = { ...newDebt, kind: 'remediation' };
  capture({ root, flow: 'saneamiento-pausa', input: remediation, now: NOW });
  const remediationResults = preArchiveGate({ root, change: 'saneamiento-pausa', now: NOW });
  const remediationGate = remediationResults.find((entry) => entry.id === 'debt-gate');
  assert.equal(remediationGate.status, 'PASS');
});
