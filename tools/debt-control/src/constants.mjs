export const CONFIG_SCHEMA_VERSION = 1;
export const REGISTRY_SCHEMA_VERSION = 1;
export const ASSESSMENT_SCHEMA_VERSION = 1;

export const DEBT_DIR = '.project-os/debt';
export const CONFIG_FILE = 'config.json';
export const REGISTRY_FILE = 'registry.json';
export const ASSESSMENTS_DIR = 'assessments';

// Las siete categorias canonicas. Un hallazgo residual termina exactamente en una.
export const CATEGORIES = Object.freeze([
  'defect',
  'technical-debt',
  'external-risk',
  'decision-required',
  'optional-improvement',
  'false-positive',
  'duplicate',
]);

// Solo estas categorias representan deuda real: bloquean o consumen presupuesto segun severidad.
export const DEBT_CATEGORIES = Object.freeze([
  'defect',
  'technical-debt',
  'external-risk',
  'decision-required',
]);

export const SEVERITIES = Object.freeze(['blocker', 'major', 'minor']);

export const ITEM_STATUSES = Object.freeze([
  'open',
  'resolved',
  'refuted',
  'duplicate',
  'accepted-exception',
]);

export const ASSESSMENT_KINDS = Object.freeze(['feature', 'remediation', 'baseline']);
export const ASSESSMENT_RESULTS = Object.freeze(['clean', 'debt']);

export const GITHUB_MODES = Object.freeze(['required', 'advisory', 'off', 'auto']);

export const CHECK_STATUSES = Object.freeze(['PASS', 'FAIL', 'WARN', 'SKIP']);

export const TRIGGERS = Object.freeze({
  BUDGET_THRESHOLD: 'budget-threshold',
  FLOWS_WITH_DEBT: 'flows-with-debt',
  RECURRENCE: 'recurrence',
  EXPIRED_EXCEPTION: 'expired-exception',
  CRITICAL_TRANSVERSAL: 'critical-transversal',
  BLOCKER_MAJOR: 'blocker-major',
  // No es un sexto disparador de saneamiento: mantiene la pausa cuando un flujo de saneamiento
  // introdujo deuda confirmada nueva, implementando la condicion de reanudacion de la politica.
  REMEDIATION_NEW_DEBT: 'remediation-new-debt',
});

// Horizonte maximo de una excepcion: una expiracion absurdamente lejana seria una excepcion
// permanente de facto, que la politica prohibe.
export const MAX_EXCEPTION_DAYS = 365;

export const EXCEPTION_FIELDS = Object.freeze([
  'reason',
  'owner',
  'approvedBy',
  'expiresOn',
  'recovery',
]);

export const EXIT_CODES = Object.freeze({
  ok: 0,
  fail: 1,
  usage: 2,
});

export const PLAN_MARKER_PREFIX = 'debt-control:plan:';
export const MANAGED_BLOCK_START = '<!-- debt-control:managed:start -->';
export const MANAGED_BLOCK_END = '<!-- debt-control:managed:end -->';

// La regla obligatoria que todo issue de saneamiento impone.
export const NO_NEW_DEBT_RULE = 'NO GENERAR MAS DEUDA TECNICA';
