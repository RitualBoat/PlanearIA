import { spawnSync } from 'node:child_process';
import {
  lstat,
  readFile,
  readdir,
} from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { EXIT_CODES } from './constants.mjs';
import { stableStringify } from './json.mjs';
import {
  assertNoSymlinkEscape,
  resolveInside,
} from './paths.mjs';
import { redact } from './report.mjs';

const STATUS = Object.freeze([
  'PASS',
  'FAIL',
  'EXCEPTION',
]);
const STATUS_SET = new Set(STATUS);
const CHANGE_NAME = /^[a-z0-9][a-z0-9-]*$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const FORBIDDEN_METADATA_KEYS = new Set([
  'args',
  'arguments',
  'command',
  'commands',
  'executable',
  'path',
]);
const PLACEHOLDER_PATTERNS = Object.freeze([
  /<[^>\r\n]{1,80}>/,
  /\b(?:TBD|TODO|FIXME|CHANGEME|PLACEHOLDER)\b/i,
  /\b(?:replace|reemplaza|sustituye|completa|conserva)\s+(?:with|con|aqui|aquí|este|esta|the|el|la)\b/i,
  /\[(?:replace|placeholder|todo|complete|completar|sustituir)[^\]\r\n]*\]/i,
]);
const PRE_PROPOSE_SHAPE = Object.freeze({
  schemaVersion: null,
  change: null,
  execution: null,
  dependencies: null,
  currentState: {
    summary: null,
    sources: null,
  },
  scope: null,
  observableCriteria: null,
  owner: null,
  risks: null,
  surfaces: null,
  manualInterventions: [{
    id: null,
    reason: null,
    owner: null,
    status: null,
    evidence: null,
  }],
  costLicenseReview: {
    status: null,
    owner: null,
    evidence: null,
    justification: null,
  },
  evidence: {
    automatic: null,
    manual: null,
  },
  rollback: {
    strategy: null,
    trigger: null,
    recovery: null,
  },
  nonGoals: null,
  exceptions: [{
    field: null,
    reason: null,
    owner: null,
    approvedBy: null,
    expiresOn: null,
    recovery: null,
  }],
});
const ARCHIVE_SHAPE = Object.freeze({
  schemaVersion: null,
  issue: null,
  change: null,
  surfaces: null,
  validations: [{
    id: null,
    status: null,
    evidence: null,
    justification: null,
    profileCondition: null,
  }],
  evidence: [{
    id: null,
    kind: null,
    status: null,
    ref: null,
    justification: null,
    profileCondition: null,
  }],
  rollback: {
    strategy: null,
    status: null,
    evidence: null,
    justification: null,
  },
  adversarialReview: {
    status: null,
    ref: null,
    blockers: null,
    majors: null,
  },
  exceptions: [{
    field: null,
    reason: null,
    owner: null,
    approvedBy: null,
    expiresOn: null,
    recovery: null,
  }],
});
const RUNTIME_BIN = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'bin',
  'project-constructor.mjs',
);

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function nonEmptyStrings(value) {
  return Array.isArray(value)
    && value.length > 0
    && value.every(nonEmptyString)
    && new Set(value).size === value.length;
}

function unexpectedFields(value, shape, prefix = '') {
  if (Array.isArray(shape)) {
    if (!Array.isArray(value)) return [];
    return value.flatMap(
      (entry, index) => unexpectedFields(entry, shape[0], `${prefix}[${index}]`),
    );
  }
  if (!shape || !value || typeof value !== 'object' || Array.isArray(value)) {
    return [];
  }
  const found = [];
  for (const [key, child] of Object.entries(value)) {
    const childPath = prefix ? `${prefix}.${key}` : key;
    if (!Object.hasOwn(shape, key)) {
      found.push(childPath);
      continue;
    }
    found.push(...unexpectedFields(child, shape[key], childPath));
  }
  return found;
}

function placeholderPaths(value, prefix = '') {
  if (Array.isArray(value)) {
    return value.flatMap(
      (entry, index) => placeholderPaths(entry, `${prefix}[${index}]`),
    );
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, child]) => (
      placeholderPaths(child, prefix ? `${prefix}.${key}` : key)
    ));
  }
  if (
    typeof value === 'string'
    && PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(value))
  ) {
    return [prefix || '<root>'];
  }
  return [];
}

function result({
  id,
  status,
  summary,
  cause,
  remediation,
  evidence = {},
}) {
  if (!STATUS_SET.has(status)) {
    throw new TypeError(`Estado readiness no permitido: ${status}.`);
  }
  for (const [key, value] of Object.entries({
    cause,
    id,
    remediation,
    summary,
  })) {
    if (!nonEmptyString(value)) {
      throw new TypeError(`Resultado readiness sin ${key}.`);
    }
  }
  return {
    id,
    status,
    summary,
    cause,
    remediation,
    evidence: redact(evidence),
  };
}

function exceptionFailure(exception, policy, now) {
  const required = policy?.exceptions?.requiredFields ?? [];
  const missing = required.filter((field) => !nonEmptyString(exception?.[field]));
  if (missing.length > 0) {
    return `La excepción omite: ${missing.join(', ')}.`;
  }
  if (!(policy?.exceptions?.allowedFields ?? []).includes(exception.field)) {
    return `El campo ${exception.field ?? '<ausente>'} no admite excepción.`;
  }
  if (!ISO_DATE.test(exception.expiresOn)) {
    return 'expiresOn debe usar ISO YYYY-MM-DD.';
  }
  const expiry = Date.parse(`${exception.expiresOn}T23:59:59.999Z`);
  if (!Number.isFinite(expiry)) {
    return 'expiresOn no representa una fecha real.';
  }
  if (expiry < now.getTime()) {
    return `La excepción venció el ${exception.expiresOn}.`;
  }
  return null;
}

function exceptionFor(exceptions, field, policy, now) {
  const match = (exceptions ?? []).find((entry) => entry?.field === field);
  if (!match) return null;
  const failure = exceptionFailure(match, policy, now);
  return failure ? { failure, match } : { match };
}

function addCheck(
  results,
  {
    id,
    ok,
    pass,
    fail,
    remediation,
    evidence = {},
    exceptions = [],
    exceptionField = null,
    policy,
    now,
  },
) {
  if (ok) {
    results.push(result({
      id,
      status: 'PASS',
      summary: pass,
      cause: pass,
      remediation: 'Ninguna; conserva la evidencia y repite el gate si cambia la fuente.',
      evidence,
    }));
    return;
  }

  const exception = exceptionField
    ? exceptionFor(exceptions, exceptionField, policy, now)
    : null;
  if (exception?.match && !exception.failure) {
    results.push(result({
      id,
      status: 'EXCEPTION',
      summary: `${fail} Excepción temporal vigente.`,
      cause:
        `${exception.match.reason} Owner: ${exception.match.owner}. `
        + `Aprobó: ${exception.match.approvedBy}. Vence: ${exception.match.expiresOn}.`,
      remediation: exception.match.recovery,
      evidence: {
        ...evidence,
        exceptionField,
        expiresOn: exception.match.expiresOn,
      },
    }));
    return;
  }

  results.push(result({
    id,
    status: 'FAIL',
    summary: fail,
    cause: exception?.failure ? `${fail} ${exception.failure}` : fail,
    remediation,
    evidence,
  }));
}

function createReport(phase, results) {
  const counts = Object.fromEntries(
    STATUS.map((status) => [
      status,
      results.filter((entry) => entry.status === status).length,
    ]),
  );
  const verdict = counts.FAIL > 0
    ? 'FAIL'
    : counts.EXCEPTION > 0
      ? 'EXCEPTION'
      : 'PASS';
  return {
    schemaVersion: '1.0.0',
    phase,
    verdict,
    ok: counts.FAIL === 0,
    mutationPerformed: false,
    counts,
    results,
  };
}

export function formatReadinessHuman(report) {
  const lines = [
    `Project OS readiness ${report.schemaVersion}`,
    `Fase: ${report.phase}`,
    `Veredicto: ${report.verdict} | PASS ${report.counts.PASS} | FAIL ${report.counts.FAIL} | EXCEPTION ${report.counts.EXCEPTION}`,
    'Mutación: no',
  ];
  for (const entry of report.results) {
    lines.push(
      '',
      `[${entry.status}] ${entry.id}`,
      `  ${entry.summary}`,
      `  Causa: ${entry.cause}`,
      `  Evidencia: ${JSON.stringify(entry.evidence)}`,
      `  Recuperación: ${entry.remediation}`,
    );
  }
  return `${lines.join('\n')}\n`;
}

function normalizeExecution(execution) {
  return {
    status: execution?.status ?? execution?.exitCode ?? (execution?.ok ? 0 : 1),
    stdout: execution?.stdout ?? '',
    stderr: execution?.stderr ?? '',
    error: execution?.error?.message ?? execution?.error ?? '',
  };
}

export function spawnReadOnly(command, args, { cwd } = {}) {
  const execution = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    env: {
      ...process.env,
      CI: 'true',
      NO_COLOR: '1',
    },
    shell: false,
    timeout: 60_000,
    windowsHide: true,
  });
  return normalizeExecution(execution);
}

async function execute(runner, command, args, context) {
  try {
    return normalizeExecution(await runner(command, args, context));
  } catch (error) {
    return {
      status: 1,
      stdout: '',
      stderr: '',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function readJson(relativeRoot, relativePath) {
  const absolute = resolveInside(relativeRoot, relativePath, relativePath);
  await assertNoSymlinkEscape(relativeRoot, relativePath);
  const raw = await readFile(absolute, 'utf8');
  return JSON.parse(raw);
}

function pointerValue(value, pointer) {
  if (!nonEmptyString(pointer) || !pointer.startsWith('/')) return undefined;
  return pointer
    .slice(1)
    .split('/')
    .map((segment) => segment.replaceAll('~1', '/').replaceAll('~0', '~'))
    .reduce((current, segment) => current?.[segment], value);
}

function parseIssueMetadata(body, policy) {
  const startMarker = policy?.issueMarker?.start;
  const endMarker = policy?.issueMarker?.end;
  if (!nonEmptyString(startMarker) || !nonEmptyString(endMarker)) {
    throw new Error('La política no declara markers de issue válidos.');
  }
  const start = body.indexOf(startMarker);
  const end = body.indexOf(endMarker, start + startMarker.length);
  if (start < 0 || end < 0 || end <= start) {
    throw new Error('Falta el bloque project-os-readiness:pre-propose completo.');
  }
  const raw = body.slice(start + startMarker.length, end).trim();
  return JSON.parse(raw);
}

function missingFields(value, fields) {
  return (fields ?? []).filter((field) => {
    const candidate = value?.[field];
    return candidate === undefined
      || candidate === null
      || (typeof candidate === 'string' && candidate.trim() === '');
  });
}

function forbiddenMetadataKeys(value, prefix = '') {
  if (Array.isArray(value)) {
    return value.flatMap((entry, index) => forbiddenMetadataKeys(entry, `${prefix}[${index}]`));
  }
  if (!value || typeof value !== 'object') return [];
  const found = [];
  for (const [key, child] of Object.entries(value)) {
    const childPath = prefix ? `${prefix}.${key}` : key;
    if (FORBIDDEN_METADATA_KEYS.has(key)) found.push(childPath);
    found.push(...forbiddenMetadataKeys(child, childPath));
  }
  return found;
}

function containsLiteralSecret(value, key = '') {
  if (Array.isArray(value)) {
    return value.some((entry) => containsLiteralSecret(entry, key));
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).some(
      ([childKey, child]) => containsLiteralSecret(child, childKey),
    );
  }
  if (typeof value !== 'string') return false;
  if (/\b(?:Bearer\s+[A-Za-z0-9._~+/=-]+|gh[pousr]_[A-Za-z0-9]{16,}|sk-[A-Za-z0-9_-]{12,})\b/i.test(value)) {
    return true;
  }
  const assignment = value.match(
    /\b(?:api[_-]?key|password|secret|token|credential)\s*[=:]\s*([^\s,;]+)/i,
  );
  if (
    assignment
    && !/^(?:\$\{?[A-Z][A-Z0-9_]*\}?|env:[A-Z][A-Z0-9_]*)$/.test(assignment[1])
  ) {
    return true;
  }
  if (!/(?:api.?key|password|secret|token|credential)/i.test(key)) return false;
  return !/^(?:\$\{?[A-Z][A-Z0-9_]*\}?|env:[A-Z][A-Z0-9_]*)$/.test(value);
}

function profileMap(profileCatalog) {
  return new Map(
    (profileCatalog?.profiles ?? []).map((profile) => [profile.id, profile]),
  );
}

function sameValues(left, right) {
  return Array.isArray(left)
    && Array.isArray(right)
    && left.length === right.length
    && left.every((value, index) => value === right[index]);
}

function validateRuntimeConfiguration(policy, profilesData, productOs) {
  const failures = [];
  if (policy?.schemaVersion !== '1.0.0') failures.push('policy.schemaVersion');
  if (!sameValues(policy?.statusVocabulary, STATUS)) failures.push('statusVocabulary');
  if (
    policy?.issueMarker?.start !== '<!-- project-os-readiness:pre-propose'
    || policy?.issueMarker?.end !== 'project-os-readiness:pre-propose -->'
  ) {
    failures.push('issueMarker');
  }
  if (
    policy?.projectMembership?.required !== true
    || policy?.projectMembership?.projectManifest !== '.project-os/github/product-os.json'
    || policy?.projectMembership?.projectTitlePointer !== '/project/title'
    || policy?.projectMembership?.unverifiedStatus !== 'FAIL'
    || policy?.projectMembership?.exceptionField !== 'project-membership'
  ) {
    failures.push('projectMembership');
  }
  if (
    policy?.phases?.propose?.requiredIssueState !== 'OPEN'
    || !nonEmptyStrings(policy?.phases?.propose?.requiredSections)
    || !nonEmptyStrings(policy?.phases?.propose?.requiredMetadataFields)
    || policy?.phases?.propose?.requireDependenciesClosed !== true
    || policy?.phases?.propose?.remoteUnverifiedStatus !== 'FAIL'
  ) {
    failures.push('phases.propose');
  }
  if (
    policy?.phases?.archive?.changeRoot !== 'openspec/changes'
    || !nonEmptyStrings(policy?.phases?.archive?.requiredFiles)
    || policy?.phases?.archive?.requiredSpecPattern !== 'specs/*/spec.md'
    || !nonEmptyStrings(policy?.phases?.archive?.requiredMetadataFields)
    || !nonEmptyStrings(policy?.phases?.archive?.requiredValidationIds)
    || !nonEmptyStrings(policy?.phases?.archive?.requiredEvidenceIds)
    || policy?.phases?.archive?.manualEvidenceIdsFromProfileCatalog !== true
    || policy?.phases?.archive?.requireTasksComplete !== true
    || policy?.phases?.archive?.requireIssueTraceability !== true
    || policy?.phases?.archive?.requireAdversarialReview !== true
    || policy?.phases?.archive?.remoteUnverifiedStatus !== 'FAIL'
  ) {
    failures.push('phases.archive');
  }
  if (
    !sameValues(policy?.exceptions?.allowedFields, [
      'project-membership',
      'manual-evidence',
    ])
    || !nonEmptyStrings(policy?.exceptions?.requiredFields)
    || !nonEmptyStrings(policy?.exceptions?.nonWaivable)
    || policy?.exceptions?.expirationFormat !== 'YYYY-MM-DD'
    || policy?.exceptions?.exceptionCountsAsPass !== false
  ) {
    failures.push('exceptions');
  }
  const profiles = profileMap(profilesData);
  const profileIds = [...profiles.keys()];
  const activeProfiles = (profilesData?.profiles ?? [])
    .filter((profile) => profile.active)
    .map((profile) => profile.id)
    .sort();
  if (
    profilesData?.schemaVersion !== '1.0.0'
    || profiles.size === 0
    || profiles.size !== (profilesData?.profiles ?? []).length
    || profileIds.some((id) => !CHANGE_NAME.test(id))
    || !sameValues([...(profilesData?.active ?? [])].sort(), activeProfiles)
    || !sameValues(activeProfiles, ['documentation', 'harness-tooling'])
    || profilesData?.activationPolicy?.implicitActivation !== false
    || profilesData?.activationPolicy?.toolPresenceDoesNotActivateProfile !== true
    || profilesData?.activationPolicy?.decisionArtifactRequiredForConditionalProfiles !== true
    || profilesData?.activationPolicy?.naRequiresDeclaredConditionAndJustification !== true
  ) {
    failures.push('profiles');
  }
  for (const profile of profilesData?.profiles ?? []) {
    if (
      !nonEmptyString(profile?.activationRequires)
      || !nonEmptyStrings(profile?.automaticValidations)
      || !nonEmptyStrings(profile?.manualEvidence)
      || !nonEmptyStrings(profile?.negativeCases)
      || !nonEmptyString(profile?.rollback)
      || !nonEmptyStrings(profile?.naConditions)
      || !nonEmptyString(profile?.closureGate)
    ) {
      failures.push(`profiles.${profile?.id ?? '<unknown>'}`);
    }
  }
  const runners = new Set([
    null,
    'openspec-strict',
    'constructor-sync-check',
    'constructor-opsx-check',
    'constructor-doctor-json',
  ]);
  const catalog = policy?.validationCatalog?.entries;
  const catalogIds = Array.isArray(catalog) ? catalog.map((entry) => entry?.id) : [];
  if (
    policy?.validationCatalog?.metadataMayDeclareCommands !== false
    || policy?.validationCatalog?.profileSource !== '.project-os/profiles.json'
    || !Array.isArray(catalog)
    || catalog.length === 0
    || new Set(catalogIds).size !== catalogIds.length
    || catalog.some((entry) => (
      !CHANGE_NAME.test(entry?.id ?? '')
      || !nonEmptyStrings(entry?.profiles)
      || entry.profiles.some((profile) => !profiles.has(profile))
      || !runners.has(entry.runner)
    ))
  ) {
    failures.push('validationCatalog');
  }
  if (
    productOs?.schemaVersion !== '1.0.0'
    || productOs?.mode !== 'dry-run'
    || productOs?.remoteMutationDuringBootstrap !== false
    || !nonEmptyString(productOs?.project?.title)
  ) {
    failures.push('productOs');
  }
  return [...new Set(failures)].sort();
}

function validateIssueMetadata(metadata, policy, profiles) {
  const failures = [];
  const phase = policy.phases.propose;
  const missing = missingFields(metadata, phase.requiredMetadataFields);
  if (missing.length > 0) failures.push(`faltan campos: ${missing.join(', ')}`);
  const unexpected = unexpectedFields(metadata, PRE_PROPOSE_SHAPE);
  if (unexpected.length > 0) {
    failures.push(`campos fuera del contrato: ${unexpected.join(', ')}`);
  }
  if (metadata?.schemaVersion !== policy.schemaVersion) {
    failures.push(`schemaVersion debe ser ${policy.schemaVersion}`);
  }
  if (!CHANGE_NAME.test(metadata?.change ?? '')) failures.push('change debe usar kebab-case');
  if (metadata?.execution !== 'versioned') failures.push('execution debe ser versioned');
  if (!nonEmptyStrings(metadata?.scope)) {
    failures.push('scope debe declarar al menos un resultado incluido');
  }
  if (!nonEmptyStrings(metadata?.observableCriteria)) {
    failures.push('observableCriteria debe declarar criterios verificables');
  }
  if (!nonEmptyString(metadata?.owner)) {
    failures.push('owner debe identificar una persona o rol responsable');
  }
  if (!nonEmptyStrings(metadata?.risks)) {
    failures.push('risks debe declarar al menos un riesgo o el riesgo residual explícito');
  }
  if (
    !Array.isArray(metadata?.dependencies)
    || !metadata.dependencies.every((entry) => Number.isInteger(entry) && entry > 0)
    || new Set(metadata.dependencies).size !== metadata.dependencies.length
  ) {
    failures.push('dependencies debe contener números de issue positivos y únicos');
  }
  if (
    !nonEmptyString(metadata?.currentState?.summary)
    || !nonEmptyStrings(metadata?.currentState?.sources)
  ) {
    failures.push('currentState requiere summary y sources verificables');
  }
  if (
    !Array.isArray(metadata?.surfaces)
    || metadata.surfaces.length === 0
    || metadata.surfaces.some((surface) => !profiles.has(surface))
    || new Set(metadata.surfaces).size !== metadata.surfaces.length
  ) {
    failures.push('surfaces debe usar perfiles conocidos, no vacíos y únicos');
  }
  if (!Array.isArray(metadata?.manualInterventions)) {
    failures.push('manualInterventions debe ser un array');
  } else if (metadata.manualInterventions.some((entry) => (
    !entry
    || typeof entry !== 'object'
    || !CHANGE_NAME.test(entry.id ?? '')
    || !nonEmptyString(entry.reason)
    || !nonEmptyString(entry.owner)
    || !['pending', 'approved', 'not-applicable'].includes(entry.status)
    || !Object.hasOwn(entry, 'evidence')
    || (entry.evidence !== null && !nonEmptyString(entry.evidence))
  ))) {
    failures.push('manualInterventions contiene una entrada fuera del contrato v1');
  }
  if (
    !metadata?.costLicenseReview
    || !['pending', 'approved', 'not-applicable'].includes(metadata.costLicenseReview.status)
    || !nonEmptyString(metadata.costLicenseReview.owner)
    || !Object.hasOwn(metadata.costLicenseReview, 'evidence')
    || (
      metadata.costLicenseReview.evidence !== null
      && !nonEmptyString(metadata.costLicenseReview.evidence)
    )
    || !nonEmptyString(metadata.costLicenseReview.justification)
  ) {
    failures.push('costLicenseReview no cumple el contrato v1');
  }
  if (
    !nonEmptyStrings(metadata?.evidence?.automatic)
    || !nonEmptyStrings(metadata?.evidence?.manual)
  ) {
    failures.push('evidence debe declarar expectativas automáticas y manuales');
  }
  if (
    !nonEmptyString(metadata?.rollback?.strategy)
    || !nonEmptyString(metadata?.rollback?.trigger)
    || !nonEmptyString(metadata?.rollback?.recovery)
  ) {
    failures.push('rollback requiere strategy, trigger y recovery');
  }
  if (!nonEmptyStrings(metadata?.nonGoals)) {
    failures.push('nonGoals debe declarar al menos un no objetivo');
  }
  if (!Array.isArray(metadata?.exceptions)) {
    failures.push('exceptions debe ser un array');
  }
  return failures;
}

function manualInterventionsReady(interventions) {
  if (!Array.isArray(interventions)) return false;
  return interventions.every((entry) => {
    if (
      !CHANGE_NAME.test(entry?.id ?? '')
      || !nonEmptyString(entry?.reason)
      || !nonEmptyString(entry?.owner)
      || !Object.hasOwn(entry, 'evidence')
    ) {
      return false;
    }
    if (entry.status === 'approved') return nonEmptyString(entry.evidence);
    return entry.status === 'not-applicable'
      && (entry.evidence === null || nonEmptyString(entry.evidence));
  });
}

function costLicenseReady(review) {
  if (
    !review
    || !['approved', 'not-applicable'].includes(review.status)
    || !nonEmptyString(review.owner)
    || !nonEmptyString(review.justification)
    || !Object.hasOwn(review, 'evidence')
  ) {
    return false;
  }
  return review.status !== 'approved' || nonEmptyString(review.evidence);
}

async function proposeReport({
  root,
  issue,
  now,
  policy,
  profiles,
  productOs,
  runner,
}) {
  const results = [];
  if (!Number.isInteger(Number(issue)) || Number(issue) < 1) {
    addCheck(results, {
      id: 'issue.identity',
      ok: false,
      pass: 'Issue válido.',
      fail: '--issue debe ser un entero positivo.',
      remediation: 'Ejecuta el gate con --issue <número> para un issue abierto y enriquecido.',
      policy,
      now,
    });
    return createReport('propose', results);
  }

  const response = await execute(
    runner,
    'gh',
    [
      'issue',
      'view',
      String(issue),
      '--json',
      'number,state,body,projectItems,url',
    ],
    { cwd: root, id: 'github.issue' },
  );
  if (response.status !== 0) {
    addCheck(results, {
      id: 'github.issue',
      ok: false,
      pass: 'Issue remoto verificable.',
      fail: 'No se pudo verificar el issue remoto.',
      remediation:
        'Instala/autentica gh manualmente con scopes aprobados y repite el gate; no abras OAuth desde el checker.',
      evidence: {
        exitCode: response.status,
        detail: `${response.stderr}${response.error}`.slice(-300),
      },
      policy,
      now,
    });
    return createReport('propose', results);
  }

  let remoteIssue;
  try {
    remoteIssue = JSON.parse(response.stdout);
  } catch {
    addCheck(results, {
      id: 'github.issue-json',
      ok: false,
      pass: 'GitHub devolvió JSON válido.',
      fail: 'La respuesta de GitHub no es JSON válido.',
      remediation: 'Actualiza gh o revisa el proxy/salida sin publicar credenciales.',
      policy,
      now,
    });
    return createReport('propose', results);
  }

  addCheck(results, {
    id: 'issue.identity',
    ok: Number(remoteIssue.number) === Number(issue),
    pass: `Issue #${issue} verificado.`,
    fail: 'La identidad remota no coincide con --issue.',
    remediation: 'Corrige el número y vuelve a consultar el issue; la identidad no admite excepción.',
    evidence: { issue: remoteIssue.number, url: remoteIssue.url },
    policy,
    now,
  });
  addCheck(results, {
    id: 'issue.state',
    ok: remoteIssue.state === policy.phases.propose.requiredIssueState,
    pass: 'El issue permanece abierto.',
    fail: `El issue debe estar ${policy.phases.propose.requiredIssueState}.`,
    remediation: 'Reabre el issue o selecciona uno abierto antes de propose.',
    evidence: { state: remoteIssue.state },
    policy,
    now,
  });
  const body = remoteIssue.body ?? '';
  for (const section of policy.phases.propose.requiredSections ?? []) {
    addCheck(results, {
      id: `issue.section.${slug(section)}`,
      ok: body.includes(section),
      pass: `${section} está presente.`,
      fail: `Falta la sección ${section}.`,
      remediation: 'Conserva la historia original y completa la sección enriquecida del template.',
      policy,
      now,
    });
  }

  let metadata;
  try {
    metadata = parseIssueMetadata(body, policy);
    addCheck(results, {
      id: 'metadata.parse',
      ok: true,
      pass: 'El bloque de metadata contiene JSON válido.',
      fail: 'El bloque de metadata es inválido.',
      remediation: 'Corrige el bloque delimitado sin cambiar sus markers.',
      policy,
      now,
    });
  } catch (error) {
    addCheck(results, {
      id: 'metadata.parse',
      ok: false,
      pass: 'Metadata válida.',
      fail: error instanceof Error ? error.message : 'Metadata inválida.',
      remediation:
        'Copia el ejemplo pre-propose, sustituye placeholders y conserva ambos markers.',
      policy,
      now,
    });
    return createReport('propose', results);
  }

  const metadataFailures = validateIssueMetadata(metadata, policy, profiles);
  addCheck(results, {
    id: 'metadata.contract',
    ok: metadataFailures.length === 0,
    pass: 'La metadata DoR cumple el contrato v1.',
    fail: metadataFailures.join('; ') || 'La metadata DoR no cumple el contrato.',
    remediation: 'Corrige los campos con el schema pre-propose antes de crear el change.',
    evidence: { change: metadata.change, surfaces: metadata.surfaces },
    policy,
    now,
  });

  const placeholders = placeholderPaths(metadata);
  addCheck(results, {
    id: 'metadata.placeholders',
    ok: placeholders.length === 0,
    pass: 'La metadata contiene valores concretos y no conserva placeholders.',
    fail: `La metadata conserva placeholders en: ${placeholders.join(', ')}.`,
    remediation: 'Sustituye cada placeholder por evidencia o una decisión concreta antes de propose.',
    evidence: { fields: placeholders },
    policy,
    now,
  });

  const forbidden = forbiddenMetadataKeys(metadata);
  addCheck(results, {
    id: 'metadata.command-injection',
    ok: forbidden.length === 0,
    pass: 'La metadata no declara comandos ni rutas ejecutables.',
    fail: `La metadata contiene campos prohibidos: ${forbidden.join(', ')}.`,
    remediation: 'Elimina command/commands/executable/path/args; usa solo IDs del catálogo fijo.',
    policy,
    now,
  });
  addCheck(results, {
    id: 'metadata.secrets',
    ok: !containsLiteralSecret(metadata),
    pass: 'No se detectaron secretos literales en metadata.',
    fail: 'La metadata parece contener una credencial literal.',
    remediation: 'Retira y rota la credencial; registra solo nombres de variables o referencias redactadas.',
    policy,
    now,
  });
  addCheck(results, {
    id: 'metadata.manual-interventions',
    ok: manualInterventionsReady(metadata.manualInterventions),
    pass: 'Las intervenciones manuales están aprobadas o justificadas como no aplicables.',
    fail: 'Hay intervenciones manuales pendientes o sin owner/evidencia.',
    remediation: 'Completa el gate humano y registra owner/estado/evidencia; no lo conviertas en un change ficticio.',
    policy,
    now,
  });
  addCheck(results, {
    id: 'metadata.cost-license',
    ok: costLicenseReady(metadata.costLicenseReview),
    pass: 'Costos y licencias están aprobados o justificados como no aplicables.',
    fail: 'La revisión de costos/licencias permanece pendiente o incompleta.',
    remediation: 'Obtén la decisión humana y registra owner, justificación y evidencia cuando se apruebe.',
    policy,
    now,
  });

  const exceptions = Array.isArray(metadata.exceptions) ? metadata.exceptions : [];
  const projectTitle = pointerValue(
    productOs,
    policy.projectMembership.projectTitlePointer,
  );
  const membership = Array.isArray(remoteIssue.projectItems)
    && remoteIssue.projectItems.some((item) => item?.title === projectTitle);
  addCheck(results, {
    id: 'github.project-membership',
    ok: membership,
    pass: `El issue pertenece a ${projectTitle}.`,
    fail: `No se verificó pertenencia a ${projectTitle ?? 'Product OS'}.`,
    remediation: 'Agrega el issue al Project aprobado y repite el gate read-only.',
    exceptions,
    exceptionField: policy.projectMembership.exceptionField,
    evidence: {
      expectedProject: projectTitle,
      visibleProjects: (remoteIssue.projectItems ?? []).map((item) => item?.title).filter(Boolean),
    },
    policy,
    now,
  });

  const dependencyStates = [];
  if (Array.isArray(metadata.dependencies)) {
    for (const dependency of metadata.dependencies) {
      const dependencyResponse = await execute(
        runner,
        'gh',
        ['issue', 'view', String(dependency), '--json', 'number,state,url'],
        { cwd: root, id: `github.dependency.${dependency}` },
      );
      if (dependencyResponse.status !== 0) {
        dependencyStates.push({ number: dependency, state: 'UNKNOWN' });
        continue;
      }
      try {
        const parsed = JSON.parse(dependencyResponse.stdout);
        dependencyStates.push({
          number: parsed.number,
          state: parsed.state,
          url: parsed.url,
        });
      } catch {
        dependencyStates.push({ number: dependency, state: 'UNKNOWN' });
      }
    }
  }
  addCheck(results, {
    id: 'issue.dependencies',
    ok:
      Array.isArray(metadata.dependencies)
      && dependencyStates.length === metadata.dependencies.length
      && dependencyStates.every((entry) => entry.state === 'CLOSED'),
    pass: 'Todas las dependencias declaradas están cerradas.',
    fail: 'Hay dependencias abiertas o no verificables.',
    remediation: 'Cierra las dependencias o corrige su lista; este campo no admite falso verde.',
    evidence: { dependencies: dependencyStates },
    policy,
    now,
  });

  for (const [index, exception] of exceptions.entries()) {
    const failure = exceptionFailure(exception, policy, now);
    results.push(result({
      id: `exception.${index + 1}.${exception?.field ?? 'unknown'}`,
      status: failure ? 'FAIL' : 'EXCEPTION',
      summary: failure ? 'Excepción inválida.' : 'Excepción temporal válida y visible.',
      cause: failure
        ?? `${exception.reason} Owner: ${exception.owner}. Aprobó: ${exception.approvedBy}. Vence: ${exception.expiresOn}.`,
      remediation: failure ? 'Corrige o elimina la excepción.' : exception.recovery,
      evidence: {
        field: exception?.field,
        expiresOn: exception?.expiresOn,
      },
    }));
  }
  return createReport('propose', results);
}

function slug(value) {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function notApplicableAllowed(entry, relevantProfiles) {
  if (
    entry?.status !== 'not-applicable'
    || !nonEmptyString(entry.justification)
    || !nonEmptyString(entry.profileCondition)
    || relevantProfiles.length === 0
  ) {
    return false;
  }
  return relevantProfiles.every((profile) => {
    const conditions = profile?.naConditions ?? [];
    return conditions.includes(entry.profileCondition)
      && !conditions.some((condition) => /^N\/A is not allowed/i.test(condition));
  });
}

function activeValidationIds(policy, profiles, surfaces) {
  const ids = new Set(policy.phases.archive.requiredValidationIds ?? []);
  for (const entry of policy.validationCatalog.entries ?? []) {
    if ((entry.profiles ?? []).some((profile) => surfaces.includes(profile))) {
      ids.add(entry.id);
    }
  }
  for (const surface of surfaces) {
    for (const validation of profiles.get(surface)?.automaticValidations ?? []) {
      ids.add(validation);
    }
  }
  return [...ids].sort();
}

function activeEvidenceRequirements(policy, profiles, surfaces) {
  const requirements = new Map(
    (policy.phases.archive.requiredEvidenceIds ?? []).map((id) => [
      id,
      {
        id,
        profiles: surfaces.map((surface) => profiles.get(surface)).filter(Boolean),
      },
    ]),
  );
  if (policy.phases.archive.manualEvidenceIdsFromProfileCatalog) {
    for (const surface of surfaces) {
      const profile = profiles.get(surface);
      for (const label of profile?.manualEvidence ?? []) {
        const id = slug(label);
        if (!requirements.has(id)) {
          requirements.set(id, { id, label, profiles: [profile] });
        }
      }
    }
  }
  return [...requirements.values()].sort((left, right) => left.id.localeCompare(right.id));
}

async function regularNonEmptyFile(root, relativePath) {
  await assertNoSymlinkEscape(root, relativePath);
  const absolute = resolveInside(root, relativePath, relativePath);
  const stats = await lstat(absolute);
  if (!stats.isFile()) return { ok: false, content: '' };
  const content = await readFile(absolute, 'utf8');
  return { ok: content.trim().length > 0, content };
}

async function inspectSpecs(root, relativeChangeRoot) {
  const specsRelative = `${relativeChangeRoot}/specs`;
  await assertNoSymlinkEscape(root, specsRelative);
  const specsRoot = resolveInside(root, specsRelative, 'specs del change');
  let entries;
  try {
    entries = await readdir(specsRoot, { withFileTypes: true });
  } catch {
    return { ok: false, files: [], failures: ['falta specs/'] };
  }
  const files = [];
  const failures = [];
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    if (!entry.isDirectory() || entry.isSymbolicLink()) continue;
    const relative = `${specsRelative}/${entry.name}/spec.md`;
    try {
      const inspected = await regularNonEmptyFile(root, relative);
      if (!inspected.ok) {
        failures.push(`${relative} no es un spec regular y no vacío`);
        continue;
      }
      if (
        !/\bSHALL\b/.test(inspected.content)
        || !/\*\*WHEN\*\*/.test(inspected.content)
        || !/\*\*THEN\*\*/.test(inspected.content)
      ) {
        failures.push(`${relative} no contiene SHALL y escenario WHEN/THEN`);
      }
      files.push(relative);
    } catch {
      failures.push(`${relative} no pudo verificarse de forma segura`);
    }
  }
  if (files.length === 0) failures.push('no existe ninguna delta spec');
  return { ok: failures.length === 0, files, failures };
}

function localRunnerSpec(id, root, change) {
  const openspec = path.join(
    root,
    'node_modules',
    '@fission-ai',
    'openspec',
    'bin',
    'openspec.js',
  );
  const specs = {
    'openspec-strict': {
      command: process.execPath,
      args: [openspec, 'validate', change, '--strict', '--no-interactive'],
    },
    'constructor-sync-check': {
      command: process.execPath,
      args: [RUNTIME_BIN, 'sync', '--target', root, '--check', '--json'],
    },
    'constructor-opsx-check': {
      command: process.execPath,
      args: [RUNTIME_BIN, 'opsx-check', '--target', root, '--json'],
    },
    'constructor-doctor-json': {
      command: process.execPath,
      args: [RUNTIME_BIN, 'doctor', '--target', root, '--json'],
    },
  };
  return specs[id] ?? null;
}

function nullableText(value) {
  return value === null || nonEmptyString(value);
}

function hasFields(value, fields) {
  return Boolean(value)
    && typeof value === 'object'
    && !Array.isArray(value)
    && fields.every((field) => Object.hasOwn(value, field));
}

function validateArchiveMetadata(metadata, policy, change, profiles) {
  const failures = [];
  const phase = policy.phases.archive;
  const missing = missingFields(metadata, phase.requiredMetadataFields);
  if (missing.length > 0) failures.push(`faltan campos: ${missing.join(', ')}`);
  const unexpected = unexpectedFields(metadata, ARCHIVE_SHAPE);
  if (unexpected.length > 0) {
    failures.push(`campos fuera del contrato: ${unexpected.join(', ')}`);
  }
  if (metadata?.schemaVersion !== policy.schemaVersion) {
    failures.push(`schemaVersion debe ser ${policy.schemaVersion}`);
  }
  if (metadata?.change !== change) failures.push('change no coincide con el argumento');
  if (!Number.isInteger(metadata?.issue) || metadata.issue < 1) {
    failures.push('issue debe ser un entero positivo');
  }
  if (
    !Array.isArray(metadata?.surfaces)
    || metadata.surfaces.length === 0
    || new Set(metadata.surfaces).size !== metadata.surfaces.length
    || metadata.surfaces.some((surface) => !profiles.has(surface))
  ) {
    failures.push('surfaces debe contener perfiles conocidos y únicos');
  }
  if (
    !Array.isArray(metadata?.validations)
    || metadata.validations.length === 0
    || metadata.validations.some((entry) => (
      !hasFields(entry, ['id', 'status', 'evidence', 'justification', 'profileCondition'])
      || !CHANGE_NAME.test(entry.id ?? '')
      || !['pending', 'passed', 'failed', 'not-applicable'].includes(entry.status)
      || !nullableText(entry.evidence)
      || !nullableText(entry.justification)
      || !nullableText(entry.profileCondition)
    ))
  ) {
    failures.push('validations no cumple el contrato v1');
  }
  if (
    !Array.isArray(metadata?.evidence)
    || metadata.evidence.length === 0
    || metadata.evidence.some((entry) => (
      !hasFields(entry, ['id', 'kind', 'status', 'ref', 'justification', 'profileCondition'])
      || !CHANGE_NAME.test(entry.id ?? '')
      || !['automatic', 'manual'].includes(entry.kind)
      || !['pending', 'verified', 'failed', 'not-applicable'].includes(entry.status)
      || !nullableText(entry.ref)
      || !nullableText(entry.justification)
      || !nullableText(entry.profileCondition)
    ))
  ) {
    failures.push('evidence no cumple el contrato v1');
  }
  if (
    !hasFields(metadata?.rollback, ['strategy', 'status', 'evidence', 'justification'])
    || !nonEmptyString(metadata.rollback.strategy)
    || !['pending', 'verified', 'not-applicable'].includes(metadata.rollback.status)
    || !nullableText(metadata.rollback.evidence)
    || !nullableText(metadata.rollback.justification)
  ) {
    failures.push('rollback no cumple el contrato v1');
  }
  if (
    !hasFields(metadata?.adversarialReview, ['status', 'ref', 'blockers', 'majors'])
    || !['pending', 'passed', 'failed'].includes(metadata.adversarialReview.status)
    || !nullableText(metadata.adversarialReview.ref)
    || !Number.isInteger(metadata.adversarialReview.blockers)
    || metadata.adversarialReview.blockers < 0
    || !Number.isInteger(metadata.adversarialReview.majors)
    || metadata.adversarialReview.majors < 0
  ) {
    failures.push('adversarialReview no cumple el contrato v1');
  }
  if (
    !Array.isArray(metadata?.exceptions)
    || metadata.exceptions.some((entry) => (
      !hasFields(entry, ['field', 'reason', 'owner', 'approvedBy', 'expiresOn', 'recovery'])
    ))
  ) {
    failures.push('exceptions no cumple el contrato v1');
  }
  return failures;
}

async function archiveReport({
  root,
  change,
  now,
  policy,
  profiles,
  runner,
  runLocal,
}) {
  const results = [];
  if (!CHANGE_NAME.test(change ?? '')) {
    addCheck(results, {
      id: 'change.identity',
      ok: false,
      pass: 'Change válido.',
      fail: '--change debe usar kebab-case sin segmentos de ruta.',
      remediation: 'Usa el nombre de un change activo dentro de openspec/changes.',
      policy,
      now,
    });
    return createReport('archive', results);
  }

  const phase = policy.phases.archive;
  const relativeChangeRoot = `${phase.changeRoot}/${change}`;
  let changeRootValid = false;
  try {
    await assertNoSymlinkEscape(root, relativeChangeRoot);
    const stats = await lstat(resolveInside(root, relativeChangeRoot, 'change'));
    changeRootValid = stats.isDirectory();
  } catch {
    changeRootValid = false;
  }
  addCheck(results, {
    id: 'change.root',
    ok: changeRootValid,
    pass: `Change confinado a ${relativeChangeRoot}.`,
    fail: 'El change no existe, no es directorio o escapa de openspec/changes.',
    remediation: 'Usa un change activo regular y elimina symlinks o rutas externas.',
    policy,
    now,
  });
  if (!changeRootValid) return createReport('archive', results);

  const artifactContents = new Map();
  const artifactFailures = [];
  for (const file of phase.requiredFiles ?? []) {
    const relative = `${relativeChangeRoot}/${file}`;
    try {
      const inspected = await regularNonEmptyFile(root, relative);
      if (!inspected.ok) {
        artifactFailures.push(file);
      } else {
        artifactContents.set(file, inspected.content);
      }
    } catch {
      artifactFailures.push(file);
    }
  }
  addCheck(results, {
    id: 'change.artifacts',
    ok: artifactFailures.length === 0,
    pass: 'Los artefactos OpenSpec/readiness requeridos son archivos regulares y no vacíos.',
    fail: `Faltan o son inválidos: ${artifactFailures.join(', ') || 'artefactos requeridos'}.`,
    remediation: 'Completa proposal, design, tasks, TLDR, brownfield baseline y readiness sin symlinks.',
    evidence: {
      required: phase.requiredFiles,
      invalid: artifactFailures,
    },
    policy,
    now,
  });

  const specs = await inspectSpecs(root, relativeChangeRoot);
  addCheck(results, {
    id: 'change.specs',
    ok: specs.ok,
    pass: 'Las delta specs incluyen SHALL y escenarios WHEN/THEN.',
    fail: specs.failures.join('; '),
    remediation: `Crea al menos una delta conforme a ${phase.requiredSpecPattern ?? 'specs/*/spec.md'} y valida OpenSpec strict.`,
    evidence: { files: specs.files },
    policy,
    now,
  });

  const tasks = artifactContents.get('tasks.md') ?? '';
  const pendingTasks = tasks.match(/^- \[ \].*$/gm) ?? [];
  const completedTasks = tasks.match(/^- \[[xX]\].*$/gm) ?? [];
  addCheck(results, {
    id: 'change.tasks',
    ok: pendingTasks.length === 0 && completedTasks.length > 0,
    pass: `tasks.md registra ${completedTasks.length} tareas completas y ninguna pendiente.`,
    fail: pendingTasks.length > 0
      ? `Persisten ${pendingTasks.length} tareas pendientes.`
      : 'tasks.md no contiene tareas completadas verificables.',
    remediation: 'Completa tareas con evidencia; el gate nunca marca checkboxes automáticamente.',
    evidence: {
      completed: completedTasks.length,
      pending: pendingTasks.length,
    },
    policy,
    now,
  });

  let metadata;
  try {
    metadata = JSON.parse(artifactContents.get('readiness.json') ?? '');
  } catch {
    metadata = null;
  }
  const metadataFailures = metadata
    ? validateArchiveMetadata(metadata, policy, change, profiles)
    : ['readiness.json no contiene JSON válido'];
  const baseContract = metadataFailures.length === 0;
  addCheck(results, {
    id: 'readiness.contract',
    ok: baseContract,
    pass: 'readiness.json cumple identidad y shape v1.',
    fail: metadataFailures.join('; '),
    remediation: 'Parte del ejemplo pending, completa referencias reales y conserva schemaVersion/identidad.',
    policy,
    now,
  });
  if (!metadata) return createReport('archive', results);

  const placeholders = placeholderPaths(metadata);
  addCheck(results, {
    id: 'readiness.placeholders',
    ok: placeholders.length === 0,
    pass: 'readiness.json contiene evidencia concreta y no conserva placeholders.',
    fail: `readiness.json conserva placeholders en: ${placeholders.join(', ')}.`,
    remediation: 'Sustituye cada placeholder por una referencia o decisión concreta antes de archive.',
    evidence: { fields: placeholders },
    policy,
    now,
  });

  const forbidden = forbiddenMetadataKeys(metadata);
  addCheck(results, {
    id: 'readiness.command-injection',
    ok: forbidden.length === 0,
    pass: 'readiness.json no declara comandos ni rutas ejecutables.',
    fail: `readiness.json contiene campos prohibidos: ${forbidden.join(', ')}.`,
    remediation: 'Elimina comandos/rutas/args y usa solo IDs del catálogo fijo.',
    policy,
    now,
  });
  addCheck(results, {
    id: 'readiness.secrets',
    ok: !containsLiteralSecret(metadata),
    pass: 'readiness.json no contiene secretos literales detectables.',
    fail: 'readiness.json parece contener una credencial literal.',
    remediation: 'Retira y rota la credencial; conserva solo referencias redactadas.',
    policy,
    now,
  });

  const proposal = artifactContents.get('proposal.md') ?? '';
  const issueTrace = proposal.includes(`#${metadata.issue}`)
    || proposal.includes(`/issues/${metadata.issue}`);
  addCheck(results, {
    id: 'readiness.issue-traceability',
    ok: issueTrace,
    pass: `proposal.md enlaza al issue #${metadata.issue}.`,
    fail: 'proposal.md no enlaza al issue declarado por readiness.json.',
    remediation: 'Corrige la identidad o agrega la referencia del issue al proposal.',
    policy,
    now,
  });

  const unknownSurfaces = (metadata.surfaces ?? []).filter((surface) => !profiles.has(surface));
  addCheck(results, {
    id: 'readiness.surfaces',
    ok: unknownSurfaces.length === 0 && metadata.surfaces?.length > 0,
    pass: 'Todas las superficies usan perfiles declarados.',
    fail: `Superficies ausentes o desconocidas: ${unknownSurfaces.join(', ') || '<vacío>'}.`,
    remediation: 'Usa IDs de .project-os/profiles.json y activa perfiles solo mediante decisión aprobada.',
    evidence: { surfaces: metadata.surfaces },
    policy,
    now,
  });

  const catalog = new Map(
    (policy.validationCatalog.entries ?? []).map((entry) => [entry.id, entry]),
  );
  const requiredValidations = activeValidationIds(
    policy,
    profiles,
    metadata.surfaces ?? [],
  );
  const validationEntries = Array.isArray(metadata.validations) ? metadata.validations : [];
  const validationIds = validationEntries.map((entry) => entry?.id);
  const duplicateValidations = validationIds.filter(
    (id, index) => id && validationIds.indexOf(id) !== index,
  );
  const missingValidations = requiredValidations.filter((id) => !validationIds.includes(id));
  const unknownValidations = validationIds.filter((id) => !catalog.has(id));
  const invalidValidations = [];
  for (const entry of validationEntries) {
    const catalogEntry = catalog.get(entry?.id);
    const applicable = (catalogEntry?.profiles ?? [])
      .filter((profile) => metadata.surfaces?.includes(profile))
      .map((profile) => profiles.get(profile))
      .filter(Boolean);
    const passed = entry?.status === 'passed' && nonEmptyString(entry.evidence);
    if (!passed && !notApplicableAllowed(entry, applicable)) {
      invalidValidations.push(entry?.id ?? '<sin-id>');
    }
  }
  addCheck(results, {
    id: 'readiness.validations',
    ok:
      missingValidations.length === 0
      && unknownValidations.length === 0
      && duplicateValidations.length === 0
      && invalidValidations.length === 0,
    pass: 'Validaciones requeridas declaradas con PASS evidenciado o N/A permitido.',
    fail:
      `missing=${missingValidations.join(',') || '-'}; `
      + `unknown=${unknownValidations.join(',') || '-'}; `
      + `duplicate=${[...new Set(duplicateValidations)].join(',') || '-'}; `
      + `pending/invalid=${invalidValidations.join(',') || '-'}.`,
    remediation: 'Ejecuta cada validación, registra evidencia o usa una condición N/A exacta del perfil.',
    evidence: { required: requiredValidations },
    policy,
    now,
  });

  const evidenceEntries = Array.isArray(metadata.evidence) ? metadata.evidence : [];
  const evidenceRequirements = activeEvidenceRequirements(
    policy,
    profiles,
    metadata.surfaces ?? [],
  );
  const evidenceIds = evidenceEntries.map((entry) => entry?.id);
  const evidenceRequirementById = new Map(
    evidenceRequirements.map((requirement) => [requirement.id, requirement]),
  );
  const duplicateEvidence = evidenceIds.filter(
    (id, index) => id && evidenceIds.indexOf(id) !== index,
  );
  const missingEvidence = [];
  const invalidEvidence = [];
  for (const requirement of evidenceRequirements) {
    const entry = evidenceEntries.find((candidate) => candidate?.id === requirement.id);
    if (!entry) {
      missingEvidence.push(requirement.id);
      continue;
    }
    const verified = entry.status === 'verified' && nonEmptyString(entry.ref);
    if (!verified && !notApplicableAllowed(entry, requirement.profiles)) {
      invalidEvidence.push(requirement.id);
    }
  }
  for (const entry of evidenceEntries) {
    const verified = entry?.status === 'verified' && nonEmptyString(entry.ref);
    const relevantProfiles = evidenceRequirementById.get(entry?.id)?.profiles
      ?? (metadata.surfaces ?? []).map((surface) => profiles.get(surface)).filter(Boolean);
    if (!verified && !notApplicableAllowed(entry, relevantProfiles)) {
      if (!invalidEvidence.includes(entry?.id)) invalidEvidence.push(entry?.id ?? '<sin-id>');
    }
  }
  addCheck(results, {
    id: 'readiness.evidence',
    ok:
      missingEvidence.length === 0
      && invalidEvidence.length === 0
      && duplicateEvidence.length === 0,
    pass: 'Evidencia automática/manual proporcional está verificada.',
    fail:
      `missing=${missingEvidence.join(',') || '-'}; `
      + `duplicate=${[...new Set(duplicateEvidence)].join(',') || '-'}; `
      + `pending/invalid=${invalidEvidence.join(',') || '-'}.`,
    remediation: 'Registra refs verificables por perfil; la evidencia de una superficie activa no admite excepción.',
    evidence: {
      required: evidenceRequirements.map((entry) => entry.id),
    },
    policy,
    now,
  });

  const rollbackReady = nonEmptyString(metadata.rollback?.strategy)
    && metadata.rollback?.status === 'verified'
    && nonEmptyString(metadata.rollback?.evidence);
  addCheck(results, {
    id: 'readiness.rollback',
    ok: rollbackReady,
    pass: 'Rollback verificado con estrategia y evidencia.',
    fail: 'Rollback permanece pendiente, N/A o sin evidencia.',
    remediation: 'Ensaya o verifica la recuperación y registra su evidencia antes de archive.',
    policy,
    now,
  });
  const review = metadata.adversarialReview;
  const reviewReady = review?.status === 'passed'
    && nonEmptyString(review.ref)
    && review.blockers === 0
    && review.majors === 0;
  addCheck(results, {
    id: 'readiness.adversarial-review',
    ok: reviewReady,
    pass: 'Revisión adversarial independiente sin Blockers ni Majors.',
    fail: 'La revisión adversarial falta, falló o conserva Blockers/Majors.',
    remediation: 'Ejecuta revisión desde contexto limpio, corrige Blockers/Majors y registra el ref.',
    policy,
    now,
  });

  const exceptions = Array.isArray(metadata.exceptions) ? metadata.exceptions : [];
  for (const [index, exception] of exceptions.entries()) {
    const failure = exceptionFailure(exception, policy, now);
    results.push(result({
      id: `exception.${index + 1}.${exception?.field ?? 'unknown'}`,
      status: failure ? 'FAIL' : 'EXCEPTION',
      summary: failure ? 'Excepción inválida.' : 'Excepción temporal válida y visible.',
      cause: failure
        ?? `${exception.reason} Owner: ${exception.owner}. Aprobó: ${exception.approvedBy}. Vence: ${exception.expiresOn}.`,
      remediation: failure ? 'Corrige o elimina la excepción.' : exception.recovery,
      evidence: {
        field: exception?.field,
        expiresOn: exception?.expiresOn,
      },
    }));
  }

  if (runLocal) {
    for (const id of requiredValidations) {
      const runnerId = catalog.get(id)?.runner;
      if (!runnerId) continue;
      const runnerSpec = localRunnerSpec(runnerId, root, change);
      if (!runnerSpec) {
        addCheck(results, {
          id: `local.${id}`,
          ok: false,
          pass: `${id} reejecutado.`,
          fail: `Runner fijo desconocido: ${runnerId}.`,
          remediation: 'Actualiza la política y runtime mediante un change; metadata no puede aportar comandos.',
          policy,
          now,
        });
        continue;
      }
      const execution = await execute(
        runner,
        runnerSpec.command,
        runnerSpec.args,
        { cwd: root, id: `local.${runnerId}` },
      );
      addCheck(results, {
        id: `local.${id}`,
        ok: execution.status === 0,
        pass: `${id} terminó correctamente mediante runner fijo.`,
        fail: `${id} falló mediante runner fijo.`,
        remediation: `Corrige ${id} y repite --run-local; no declares comandos en readiness.json.`,
        evidence: {
          exitCode: execution.status,
          detail: `${execution.stdout}${execution.stderr}${execution.error}`.slice(-400),
          runner: runnerId,
        },
        policy,
        now,
      });
    }
  }
  return createReport('archive', results);
}

function configurationFailure(phase, error) {
  return createReport(phase, [
    result({
      id: 'readiness.configuration',
      status: 'FAIL',
      summary: 'No se pudo cargar la política de readiness.',
      cause: error instanceof Error ? error.message : String(error),
      remediation: 'Restaura .project-os/readiness-policy.json, product-os y profiles desde la fuente canónica.',
    }),
  ]);
}

export async function collectReadinessReport({
  target,
  targetRoot,
  phase,
  issue,
  change,
  runLocal = false,
  runner = spawnReadOnly,
  now = new Date(),
} = {}) {
  const root = path.resolve(targetRoot ?? target ?? process.cwd());
  if (!['propose', 'archive'].includes(phase)) {
    return createReport(phase ?? 'unknown', [
      result({
        id: 'readiness.phase',
        status: 'FAIL',
        summary: '--phase debe ser propose o archive.',
        cause: 'No se recibió una fase soportada.',
        remediation: 'Usa readiness-check --phase propose --issue <n> o --phase archive --change <slug>.',
      }),
    ]);
  }
  if (
    (phase === 'propose' && (change !== undefined && change !== null || runLocal))
    || (phase === 'archive' && issue !== undefined && issue !== null)
  ) {
    return createReport(phase, [
      result({
        id: 'readiness.arguments',
        status: 'FAIL',
        summary: 'Los argumentos no corresponden a la fase.',
        cause: phase === 'propose'
          ? 'propose acepta --issue y no acepta --change/--run-local.'
          : 'archive acepta --change y no acepta --issue.',
        remediation: phase === 'propose'
          ? 'Usa --phase propose --issue <n>.'
          : 'Usa --phase archive --change <slug> [--run-local].',
      }),
    ]);
  }

  let policy;
  let profilesData;
  let productOs;
  try {
    policy = await readJson(root, '.project-os/readiness-policy.json');
    profilesData = await readJson(root, policy.validationCatalog.profileSource);
    productOs = await readJson(root, policy.projectMembership.projectManifest);
  } catch (error) {
    return configurationFailure(phase, error);
  }
  const profiles = profileMap(profilesData);
  const configurationFailures = validateRuntimeConfiguration(
    policy,
    profilesData,
    productOs,
  );
  if (configurationFailures.length > 0) {
    return configurationFailure(
      phase,
      new Error(
        `Policy/profiles/Product OS no cumplen el contrato runtime v1: ${configurationFailures.join(', ')}.`,
      ),
    );
  }

  if (phase === 'propose') {
    return proposeReport({
      root,
      issue,
      now,
      policy,
      profiles,
      productOs,
      runner,
    });
  }
  return archiveReport({
    root,
    change,
    now,
    policy,
    profiles,
    runner,
    runLocal,
  });
}

export async function runReadinessCheck(options = {}) {
  const report = await collectReadinessReport(options);
  return {
    ...report,
    exitCode: report.ok ? EXIT_CODES.success : EXIT_CODES.drift,
    output: options.json
      ? stableStringify(report)
      : formatReadinessHuman(report),
  };
}

export const readinessInternals = Object.freeze({
  activeEvidenceRequirements,
  activeValidationIds,
  containsLiteralSecret,
  exceptionFailure,
  forbiddenMetadataKeys,
  localRunnerSpec,
  parseIssueMetadata,
  placeholderPaths,
  slug,
  unexpectedFields,
  validateRuntimeConfiguration,
});
