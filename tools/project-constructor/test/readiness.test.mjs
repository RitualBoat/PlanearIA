import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { PACKAGE_ROOT } from '../src/constants.mjs';
import {
  collectReadinessReport,
  readinessInternals,
  runReadinessCheck,
} from '../src/readiness.mjs';

function hash(content) {
  return createHash('sha256').update(content).digest('hex');
}

async function write(root, relative, content) {
  const absolute = path.join(root, ...relative.split('/'));
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, content);
}

async function json(root, relative, value) {
  await write(root, relative, `${JSON.stringify(value, null, 2)}\n`);
}

async function sourceJson(relative) {
  return JSON.parse(await readFile(path.join(PACKAGE_ROOT, ...relative.split('/')), 'utf8'));
}

async function snapshot(root, relative = '') {
  const current = path.join(root, relative);
  const entries = await readdir(current, { withFileTypes: true });
  const output = {};
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const child = path.join(relative, entry.name);
    if (entry.isDirectory()) {
      Object.assign(output, await snapshot(root, child));
    } else {
      output[child.split(path.sep).join('/')] = hash(
        await readFile(path.join(root, child)),
      );
    }
  }
  return output;
}

async function createPolicyFixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'project-constructor-readiness-'));
  t.after(async () => {
    await rm(root, { force: true, recursive: true });
  });
  const policy = await sourceJson('blueprint/core/project-os/readiness-policy.json');
  const profiles = await sourceJson('blueprint/core/project-os/profiles.json');
  const productOs = await sourceJson('blueprint/core/project-os/github/product-os.json');
  await json(root, '.project-os/readiness-policy.json', policy);
  await json(root, '.project-os/profiles.json', profiles);
  await json(root, '.project-os/github/product-os.json', productOs);
  return {
    root,
    policy,
    profiles,
    productOs,
  };
}

function validIssueMetadata(overrides = {}) {
  return {
    schemaVersion: '1.0.0',
    change: 'sample-change',
    execution: 'versioned',
    dependencies: [],
    scope: ['Entregar una capacidad verificable y acotada.'],
    observableCriteria: ['El gate produce evidencia reproducible.'],
    owner: 'engineering-owner',
    risks: ['Un falso verde permitiría propose prematuro.'],
    currentState: {
      summary: 'El estado actual fue verificado.',
      sources: ['tests/current-state.md'],
    },
    surfaces: ['documentation'],
    manualInterventions: [],
    costLicenseReview: {
      status: 'approved',
      owner: 'engineering-owner',
      evidence: 'issue://42#cost-license',
      justification: 'No se introduce un servicio pagado.',
    },
    evidence: {
      automatic: ['openspec-strict'],
      manual: ['review://clarity'],
    },
    rollback: {
      strategy: 'Revertir el commit acotado.',
      trigger: 'El gate detecta una regresión.',
      recovery: 'Reejecutar validaciones después del revert.',
    },
    nonGoals: ['No instalar producto.'],
    exceptions: [],
    ...overrides,
  };
}

function issueBody(metadata, policy) {
  return [
    '## Historia Original',
    '',
    'Como owner quiero un change trazable.',
    '',
    '## Enriquecida',
    '',
    'Contexto y criterios observables.',
    '',
    policy.issueMarker.start,
    JSON.stringify(metadata, null, 2),
    policy.issueMarker.end,
  ].join('\n');
}

function githubRunner({
  issue,
  dependencyStates = {},
  failIssue = false,
  calls = [],
} = {}) {
  return async (_command, args, { id }) => {
    calls.push({ args, id });
    if (id === 'github.issue') {
      if (failIssue) {
        return {
          status: 1,
          stdout: '',
          stderr: 'authentication required',
        };
      }
      return {
        status: 0,
        stdout: JSON.stringify(issue),
        stderr: '',
      };
    }
    if (id.startsWith('github.dependency.')) {
      const number = Number(id.split('.').at(-1));
      return {
        status: 0,
        stdout: JSON.stringify({
          number,
          state: dependencyStates[number] ?? 'CLOSED',
          url: `https://example.test/issues/${number}`,
        }),
        stderr: '',
      };
    }
    return { status: 0, stdout: '{}', stderr: '' };
  };
}

async function createArchiveChange(fixture, {
  change = 'sample-change',
  mutate = (value) => value,
} = {}) {
  const profileById = new Map(
    fixture.profiles.profiles.map((profile) => [profile.id, profile]),
  );
  const surfaces = ['documentation', 'harness-tooling'];
  const validationIds = readinessInternals.activeValidationIds(
    fixture.policy,
    profileById,
    surfaces,
  );
  const evidenceIds = readinessInternals.activeEvidenceRequirements(
    fixture.policy,
    profileById,
    surfaces,
  ).map((entry) => entry.id);
  const readiness = mutate({
    schemaVersion: '1.0.0',
    issue: 42,
    change,
    surfaces,
    validations: validationIds.map((id) => ({
      id,
      status: 'passed',
      evidence: `evidence://validation/${id}`,
      justification: null,
      profileCondition: null,
    })),
    evidence: evidenceIds.map((id) => ({
      id,
      kind: 'manual',
      status: 'verified',
      ref: `evidence://manual/${id}`,
      justification: null,
      profileCondition: null,
    })),
    rollback: {
      strategy: 'Revertir el commit sin tocar trabajo ajeno.',
      status: 'verified',
      evidence: 'evidence://rollback/rehearsal',
      justification: null,
    },
    adversarialReview: {
      status: 'passed',
      ref: 'evidence://review/adversarial',
      blockers: 0,
      majors: 0,
    },
    exceptions: [],
  });
  const root = `openspec/changes/${change}`;
  await write(fixture.root, `${root}/proposal.md`, `# Proposal\n\nIssue #${readiness.issue}.\n`);
  await write(fixture.root, `${root}/design.md`, '# Design\n\nDiseño aprobado.\n');
  await write(fixture.root, `${root}/tasks.md`, '## Tasks\n\n- [x] Implementación con evidencia.\n');
  await write(fixture.root, `${root}/TLDR.md`, '# TLDR\n\nResumen acotado.\n');
  await write(
    fixture.root,
    `${root}/brownfield-baseline.md`,
    '# Brownfield baseline\n\nSuperficie actual y objetivo.\n',
  );
  await write(
    fixture.root,
    `${root}/specs/sample/spec.md`,
    [
      '## ADDED Requirements',
      '',
      '### Requirement: Sample',
      '',
      'The system SHALL be verifiable.',
      '',
      '#### Scenario: Success',
      '',
      '- **WHEN** the gate runs',
      '- **THEN** it reports evidence',
      '',
    ].join('\n'),
  );
  await json(fixture.root, `${root}/readiness.json`, readiness);
  return readiness;
}

test('pre-propose verifica issue, Project, metadata y dependencias sin mutar', async (t) => {
  const fixture = await createPolicyFixture(t);
  const metadata = validIssueMetadata({ dependencies: [7] });
  const remoteIssue = {
    number: 42,
    state: 'OPEN',
    body: issueBody(metadata, fixture.policy),
    projectItems: [{ title: fixture.productOs.project.title }],
    url: 'https://example.test/issues/42',
  };
  const before = await snapshot(fixture.root);
  const report = await collectReadinessReport({
    target: fixture.root,
    phase: 'propose',
    issue: 42,
    runner: githubRunner({ issue: remoteIssue }),
    now: new Date('2026-07-19T12:00:00.000Z'),
  });
  const after = await snapshot(fixture.root);

  assert.equal(report.verdict, 'PASS');
  assert.equal(report.counts.FAIL, 0);
  assert.deepEqual(after, before);
  assert.equal(report.mutationPerformed, false);
});

test('gh no verificable es FAIL y no se convierte en Project PASS', async (t) => {
  const fixture = await createPolicyFixture(t);
  const report = await collectReadinessReport({
    target: fixture.root,
    phase: 'propose',
    issue: 42,
    runner: githubRunner({ failIssue: true }),
  });
  assert.equal(report.verdict, 'FAIL');
  assert.equal(report.results.find((entry) => entry.id === 'github.issue').status, 'FAIL');
  assert.equal(report.results.some((entry) => entry.id === 'github.project-membership'), false);
});

test('excepción Project válida permanece EXCEPTION y una vencida falla', async (t) => {
  const fixture = await createPolicyFixture(t);
  const exception = {
    field: 'project-membership',
    reason: 'Project temporalmente no disponible.',
    owner: 'engineering-owner',
    approvedBy: 'project-owner',
    expiresOn: '2026-07-21',
    recovery: 'Agregar el issue al Project y retirar la excepción.',
  };
  const remoteIssue = {
    number: 42,
    state: 'OPEN',
    body: issueBody(validIssueMetadata({ exceptions: [exception] }), fixture.policy),
    projectItems: [],
    url: 'https://example.test/issues/42',
  };
  const active = await collectReadinessReport({
    target: fixture.root,
    phase: 'propose',
    issue: 42,
    runner: githubRunner({ issue: remoteIssue }),
    now: new Date('2026-07-19T12:00:00.000Z'),
  });
  assert.equal(active.verdict, 'EXCEPTION');
  assert.equal(active.counts.FAIL, 0);

  const expired = await collectReadinessReport({
    target: fixture.root,
    phase: 'propose',
    issue: 42,
    runner: githubRunner({ issue: remoteIssue }),
    now: new Date('2026-07-22T00:00:00.000Z'),
  });
  assert.equal(expired.verdict, 'FAIL');
  assert.ok(expired.results.some((entry) => entry.id.startsWith('exception.') && entry.status === 'FAIL'));
});

test('dependencia abierta bloquea propose', async (t) => {
  const fixture = await createPolicyFixture(t);
  const remoteIssue = {
    number: 42,
    state: 'OPEN',
    body: issueBody(validIssueMetadata({ dependencies: [9] }), fixture.policy),
    projectItems: [{ title: fixture.productOs.project.title }],
  };
  const report = await collectReadinessReport({
    target: fixture.root,
    phase: 'propose',
    issue: 42,
    runner: githubRunner({
      issue: remoteIssue,
      dependencyStates: { 9: 'OPEN' },
    }),
  });
  assert.equal(report.verdict, 'FAIL');
  assert.equal(report.results.find((entry) => entry.id === 'issue.dependencies').status, 'FAIL');
});

test('pre-archive exige artefactos, perfiles, evidencia, rollback y review', async (t) => {
  const fixture = await createPolicyFixture(t);
  await createArchiveChange(fixture);
  const before = await snapshot(fixture.root);
  const report = await collectReadinessReport({
    target: fixture.root,
    phase: 'archive',
    change: 'sample-change',
  });
  const after = await snapshot(fixture.root);

  assert.equal(report.verdict, 'PASS');
  assert.equal(report.counts.FAIL, 0);
  assert.deepEqual(after, before);
});

test('tarea y evidencia pendientes bloquean archive', async (t) => {
  const fixture = await createPolicyFixture(t);
  const readiness = await createArchiveChange(fixture);
  await write(
    fixture.root,
    'openspec/changes/sample-change/tasks.md',
    '## Tasks\n\n- [ ] Pendiente sin evidencia.\n',
  );
  readiness.validations[0].status = 'pending';
  readiness.validations[0].evidence = null;
  await json(
    fixture.root,
    'openspec/changes/sample-change/readiness.json',
    readiness,
  );

  const report = await collectReadinessReport({
    target: fixture.root,
    phase: 'archive',
    change: 'sample-change',
  });
  assert.equal(report.verdict, 'FAIL');
  assert.equal(report.results.find((entry) => entry.id === 'change.tasks').status, 'FAIL');
  assert.equal(report.results.find((entry) => entry.id === 'readiness.validations').status, 'FAIL');
});

test('--run-local usa solo runners fijos y conserva salida humana/JSON equivalente', async (t) => {
  const fixture = await createPolicyFixture(t);
  await createArchiveChange(fixture);
  const calls = [];
  const runner = async (_command, _args, context) => {
    calls.push(context.id);
    return { status: 0, stdout: '{"ok":true}', stderr: '' };
  };
  const machine = await runReadinessCheck({
    target: fixture.root,
    phase: 'archive',
    change: 'sample-change',
    runLocal: true,
    json: true,
    runner,
  });
  const human = await runReadinessCheck({
    target: fixture.root,
    phase: 'archive',
    change: 'sample-change',
    runLocal: true,
    json: false,
    runner,
  });
  const parsed = JSON.parse(machine.output);

  assert.equal(parsed.verdict, 'PASS');
  assert.match(human.output, /Veredicto: PASS/);
  assert.deepEqual(
    [...new Set(calls)].sort(),
    [
      'local.constructor-doctor-json',
      'local.constructor-opsx-check',
      'local.constructor-sync-check',
      'local.openspec-strict',
    ],
  );
});

test('metadata no puede inyectar comandos y los reportes redactan credenciales', async (t) => {
  const fixture = await createPolicyFixture(t);
  const metadata = validIssueMetadata({
    command: 'rm -rf .',
    evidence: {
      automatic: ['openspec-strict'],
      manual: ['token=super-secreto'],
    },
  });
  const remoteIssue = {
    number: 42,
    state: 'OPEN',
    body: issueBody(metadata, fixture.policy),
    projectItems: [{ title: fixture.productOs.project.title }],
  };
  const resultValue = await runReadinessCheck({
    target: fixture.root,
    phase: 'propose',
    issue: 42,
    json: true,
    runner: githubRunner({ issue: remoteIssue }),
  });
  assert.equal(resultValue.verdict, 'FAIL');
  assert.equal(
    resultValue.results.find((entry) => entry.id === 'metadata.command-injection').status,
    'FAIL',
  );
  assert.equal(
    resultValue.results.find((entry) => entry.id === 'metadata.secrets').status,
    'FAIL',
  );
  assert.doesNotMatch(resultValue.output, /super-secreto/);
});

test('pre-propose rechaza placeholders y campos fuera del schema aunque lo demás parezca completo', async (t) => {
  const fixture = await createPolicyFixture(t);
  const metadata = validIssueMetadata({
    scope: ['<REPLACE_WITH_APPROVED_SCOPE>'],
    costLicenseReview: {
      status: 'approved',
      owner: 'engineering-owner',
      evidence: 'issue://42#cost-license',
      justification: 'No se introduce un servicio pagado.',
      note: 'campo no permitido',
    },
  });
  const remoteIssue = {
    number: 42,
    state: 'OPEN',
    body: issueBody(metadata, fixture.policy),
    projectItems: [{ title: fixture.productOs.project.title }],
  };
  const report = await collectReadinessReport({
    target: fixture.root,
    phase: 'propose',
    issue: 42,
    runner: githubRunner({ issue: remoteIssue }),
  });

  assert.equal(report.verdict, 'FAIL');
  assert.equal(
    report.results.find((entry) => entry.id === 'metadata.contract').status,
    'FAIL',
  );
  assert.equal(
    report.results.find((entry) => entry.id === 'metadata.placeholders').status,
    'FAIL',
  );
});

test('pre-archive rechaza placeholders y propiedades adicionales en readiness', async (t) => {
  const fixture = await createPolicyFixture(t);
  await createArchiveChange(fixture, {
    mutate: (readiness) => ({
      ...readiness,
      rollback: {
        ...readiness.rollback,
        evidence: '<PLACEHOLDER>',
        command: 'git reset --hard',
      },
    }),
  });
  const report = await collectReadinessReport({
    target: fixture.root,
    phase: 'archive',
    change: 'sample-change',
  });

  assert.equal(report.verdict, 'FAIL');
  assert.equal(
    report.results.find((entry) => entry.id === 'readiness.contract').status,
    'FAIL',
  );
  assert.equal(
    report.results.find((entry) => entry.id === 'readiness.placeholders').status,
    'FAIL',
  );
  assert.equal(
    report.results.find((entry) => entry.id === 'readiness.command-injection').status,
    'FAIL',
  );
});

test('configuración alterada falla cerrada antes de consultar GitHub', async (t) => {
  const fixture = await createPolicyFixture(t);
  fixture.policy.projectMembership.unverifiedStatus = 'WARN';
  await json(
    fixture.root,
    '.project-os/readiness-policy.json',
    fixture.policy,
  );
  const calls = [];
  const report = await collectReadinessReport({
    target: fixture.root,
    phase: 'propose',
    issue: 42,
    runner: githubRunner({ calls }),
  });

  assert.equal(report.verdict, 'FAIL');
  assert.equal(report.results[0].id, 'readiness.configuration');
  assert.equal(calls.length, 0);
});
