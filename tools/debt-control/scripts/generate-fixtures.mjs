#!/usr/bin/env node
// Generador determinista de fixtures. Reejecutarlo produce exactamente los mismos archivos; los
// escenarios cubren los modos GitHub, los limites de presupuesto y los caminos de captura.

import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'test', 'fixtures');

function config(mode, extra = {}) {
  return {
    schemaVersion: 1,
    budget: { threshold: 5, minorUnits: 1, escalatedMinorUnits: 2 },
    triggers: { flowsWithResidualDebt: 5, recurrenceFlows: 3 },
    github: mode === 'off'
      ? { mode: 'off' }
      : { mode, repo: 'example/fixture-repo', remediationLabel: 'debt-remediation', issueTitlePrefix: '[Debt][Saneamiento]' },
    plans: [
      { id: 'plan-a', title: 'Plan A', doc: 'docs/plan-a.md' },
      { id: 'plan-b', title: 'Plan B', doc: 'docs/plan-b.md' },
    ],
    planRouting: { labelMap: { 'feature-a': 'plan-a', 'feature-b': 'plan-b' }, default: 'plan-a' },
    allowlistLabels: ['debt-remediation', 'security', 'incident', 'rollback'],
    ...extra,
  };
}

function item(id, overrides = {}) {
  return {
    id,
    title: overrides.title ?? `Hallazgo ${id}`,
    description: overrides.title ?? `Hallazgo ${id}`,
    category: 'technical-debt',
    severity: 'minor',
    transversal: false,
    critical: false,
    planOwner: 'plan-a',
    artifact: overrides.artifact ?? `src/example-${id.slice(-4)}.mjs`,
    consequence: 'Coste futuro verificable.',
    remediation: 'Correccion acotada pendiente.',
    evidence: [{ type: 'command', ref: 'npm test (salida adjunta)', date: '2026-07-01' }],
    occurrences: [{ flow: 'flow-1', date: '2026-07-01' }],
    issue: null,
    status: 'open',
    exception: null,
    createdAt: '2026-07-01',
    updatedAt: '2026-07-01',
    resolution: null,
    ...overrides,
  };
}

function registry(items) {
  return { schemaVersion: 1, items };
}

function writeFixture(name, files) {
  const dir = path.join(HERE, name);
  rmSync(dir, { recursive: true, force: true });
  for (const [relative, value] of Object.entries(files)) {
    const file = path.join(dir, ...relative.split('/'));
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  }
}

const CFG = '.project-os/debt/config.json';
const REG = '.project-os/debt/registry.json';

// 1. Sin GitHub: modo off con deuda abierta; sync debe reportar SKIP.
writeFixture('github-off', {
  [CFG]: config('off'),
  [REG]: registry([item('debt-aaaaaaaaaa01')]),
});

// 2. GitHub advisory: plan pausado por Major; un runner que falla degrada a WARN.
writeFixture('github-advisory', {
  [CFG]: config('advisory'),
  [REG]: registry([item('debt-aaaaaaaaaa02', { severity: 'major' })]),
});

// 3. GitHub required: mismo estado; sin gh utilizable el resultado es FAIL.
writeFixture('github-required', {
  [CFG]: config('required'),
  [REG]: registry([item('debt-aaaaaaaaaa03', { severity: 'major' })]),
});

// 4. Deuda bajo presupuesto: 4 unidades (4 minors normales); el plan sigue activo.
writeFixture('under-budget', {
  [CFG]: config('off'),
  [REG]: registry([
    item('debt-bbbbbbbbbb01'),
    item('debt-bbbbbbbbbb02'),
    item('debt-bbbbbbbbbb03'),
    item('debt-bbbbbbbbbb04'),
  ]),
});

// 5. Umbral alcanzado: 3 minors normales + 1 minor transversal (2 unidades) = 5.
writeFixture('threshold-reached', {
  [CFG]: config('off'),
  [REG]: registry([
    item('debt-cccccccccc01'),
    item('debt-cccccccccc02'),
    item('debt-cccccccccc03'),
    item('debt-cccccccccc04', { transversal: true }),
  ]),
});

// 6. Major inmediato: una sola entrada Major pausa el plan sin acumulacion.
writeFixture('major-immediate', {
  [CFG]: config('off'),
  [REG]: registry([item('debt-dddddddddd01', { severity: 'major' })]),
});

// 7. Hallazgo repetido: occurrences en 3 flujos distintos disparan recurrencia.
writeFixture('repeated-finding', {
  [CFG]: config('off'),
  [REG]: registry([
    item('debt-eeeeeeeeee01', {
      occurrences: [
        { flow: 'flow-1', date: '2026-07-01' },
        { flow: 'flow-2', date: '2026-07-05' },
        { flow: 'flow-3', date: '2026-07-10' },
      ],
    }),
  ]),
});

// 8. Excepcion expirada: valida en su momento, vencida para --now 2026-07-20.
writeFixture('expired-exception', {
  [CFG]: config('off'),
  [REG]: registry([
    item('debt-ffffffffff01', {
      status: 'accepted-exception',
      exception: {
        reason: 'Se acepta temporalmente por dependencia externa.',
        owner: 'solo-dev',
        approvedBy: 'solo-dev',
        expiresOn: '2026-07-10',
        recovery: 'Reevaluar la dependencia y resolver o refutar.',
      },
    }),
  ]),
});

// 9. Candidatos refutados: assessment de entrada con falsos positivos verificados; capture no debe
// crear deuda ni consumir presupuesto.
writeFixture('refuted-candidates', {
  [CFG]: config('off'),
  [REG]: registry([]),
  'input/assessment.json': {
    schemaVersion: 1,
    date: '2026-07-15',
    kind: 'feature',
    result: 'clean',
    candidates: [
      {
        title: 'Warning de scanner sobre dependencia X',
        artifact: 'package.json#dependencia-x',
        source: 'scanner',
        category: 'false-positive',
        evidence: [{ type: 'command', ref: 'npm ls dependencia-x', date: '2026-07-15' }],
        verification: { method: 'reproduccion local', result: 'la ruta reportada no existe en el arbol actual', date: '2026-07-15' },
      },
      {
        title: 'TODO historico ya corregido',
        artifact: 'src/example-viejo.mjs',
        source: 'comentario historico',
        category: 'technical-debt',
        resolvedPreviously: true,
        evidence: [{ type: 'diff', ref: 'PR #90', date: '2026-07-15' }],
        verification: { method: 'lectura del codigo actual', result: 'el TODO ya no existe', date: '2026-07-15' },
      },
    ],
  },
});

// 10. Segundo run: assessment con deuda nueva; capturar dos veces debe ser no-op la segunda.
writeFixture('second-run', {
  [CFG]: config('off'),
  [REG]: registry([]),
  'input/assessment.json': {
    schemaVersion: 1,
    date: '2026-07-15',
    kind: 'feature',
    result: 'debt',
    candidates: [
      {
        title: 'Atajo temporal en el parser',
        artifact: 'src/parser.mjs',
        source: 'revision adversarial',
        category: 'technical-debt',
        severity: 'minor',
        transversal: false,
        critical: false,
        planOwner: 'plan-a',
        consequence: 'El parser acepta entradas invalidas.',
        remediation: 'Validar la entrada completa.',
        evidence: [{ type: 'review', ref: 'adversarial-review 2026-07-15 hallazgo 3', date: '2026-07-15' }],
        verification: { method: 'reproduccion con input invalido', result: 'acepta entrada invalida', date: '2026-07-15' },
      },
    ],
  },
});

console.log('Fixtures regenerados en', HERE);
