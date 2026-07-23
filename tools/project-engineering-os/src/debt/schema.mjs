import {
  ASSESSMENT_KINDS,
  ASSESSMENT_RESULTS,
  ASSESSMENT_SCHEMA_VERSION,
  CATEGORIES,
  CONFIG_SCHEMA_VERSION,
  DEBT_CATEGORIES,
  EXCEPTION_FIELDS,
  GITHUB_MODES,
  ITEM_STATUSES,
  REGISTRY_SCHEMA_VERSION,
  SEVERITIES,
} from './constants.mjs';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const PLAN_ID = /^[a-z0-9][a-z0-9-]*$/;
const ITEM_ID = /^debt-[0-9a-f]{12}$/;

function push(errors, path, message) {
  errors.push({ path, message });
}

function requireString(errors, value, path) {
  if (typeof value !== 'string' || value.trim() === '') {
    push(errors, path, 'debe ser un texto no vacio');
    return false;
  }
  return true;
}

function requireIsoDate(errors, value, path) {
  if (typeof value !== 'string' || !ISO_DATE.test(value) || Number.isNaN(Date.parse(value))) {
    push(errors, path, 'debe ser una fecha ISO YYYY-MM-DD valida');
    return false;
  }
  return true;
}

function requireEnum(errors, value, allowed, path) {
  if (!allowed.includes(value)) {
    push(errors, path, `debe ser uno de: ${allowed.join(', ')}`);
    return false;
  }
  return true;
}

export function validateException(exception, path, errors) {
  if (typeof exception !== 'object' || exception === null) {
    push(errors, path, 'debe ser un objeto de excepcion');
    return;
  }
  for (const field of EXCEPTION_FIELDS) {
    if (field === 'expiresOn') requireIsoDate(errors, exception[field], `${path}.${field}`);
    else requireString(errors, exception[field], `${path}.${field}`);
  }
}

export function isExceptionExpired(exception, now) {
  const expiry = Date.parse(`${exception?.expiresOn}T23:59:59.999Z`);
  return Number.isNaN(expiry) || expiry < now.getTime();
}

function validateEvidenceList(errors, evidence, path, { required = true } = {}) {
  if (!Array.isArray(evidence) || (required && evidence.length === 0)) {
    push(errors, path, required ? 'debe ser una lista con al menos una evidencia' : 'debe ser una lista');
    return;
  }
  evidence.forEach((entry, index) => {
    if (typeof entry !== 'object' || entry === null) {
      push(errors, `${path}[${index}]`, 'debe ser un objeto {type, ref, date}');
      return;
    }
    requireString(errors, entry.type, `${path}[${index}].type`);
    requireString(errors, entry.ref, `${path}[${index}].ref`);
    requireIsoDate(errors, entry.date, `${path}[${index}].date`);
  });
}

export function validateConfig(config) {
  const errors = [];
  if (typeof config !== 'object' || config === null) {
    push(errors, 'config', 'config.json debe contener un objeto');
    return errors;
  }
  if (config.schemaVersion !== CONFIG_SCHEMA_VERSION) {
    push(errors, 'config.schemaVersion', `debe ser ${CONFIG_SCHEMA_VERSION}`);
  }
  const budget = config.budget;
  if (typeof budget !== 'object' || budget === null) push(errors, 'config.budget', 'debe declarar threshold y unidades');
  else {
    for (const field of ['threshold', 'minorUnits', 'escalatedMinorUnits']) {
      if (!Number.isInteger(budget[field]) || budget[field] < 0) {
        push(errors, `config.budget.${field}`, 'debe ser un entero no negativo');
      }
    }
  }
  const triggers = config.triggers;
  if (typeof triggers !== 'object' || triggers === null) push(errors, 'config.triggers', 'debe declarar flowsWithResidualDebt y recurrenceFlows');
  else {
    for (const field of ['flowsWithResidualDebt', 'recurrenceFlows']) {
      if (!Number.isInteger(triggers[field]) || triggers[field] < 1) {
        push(errors, `config.triggers.${field}`, 'debe ser un entero positivo');
      }
    }
  }
  const github = config.github;
  if (typeof github !== 'object' || github === null) push(errors, 'config.github', 'debe declarar mode');
  else {
    requireEnum(errors, github.mode, GITHUB_MODES, 'config.github.mode');
    if (github.mode !== 'off') {
      requireString(errors, github.remediationLabel, 'config.github.remediationLabel');
      requireString(errors, github.issueTitlePrefix, 'config.github.issueTitlePrefix');
    }
  }
  if (!Array.isArray(config.plans) || config.plans.length === 0) {
    push(errors, 'config.plans', 'debe declarar al menos un plan');
  } else {
    const seen = new Set();
    config.plans.forEach((plan, index) => {
      if (typeof plan !== 'object' || plan === null) {
        push(errors, `config.plans[${index}]`, 'debe ser un objeto {id, title, doc}');
        return;
      }
      if (typeof plan.id !== 'string' || !PLAN_ID.test(plan.id)) {
        push(errors, `config.plans[${index}].id`, 'debe usar kebab-case');
      } else if (seen.has(plan.id)) {
        push(errors, `config.plans[${index}].id`, `plan duplicado: ${plan.id}`);
      } else {
        seen.add(plan.id);
      }
      requireString(errors, plan.title, `config.plans[${index}].title`);
    });
  }
  const routing = config.planRouting;
  if (typeof routing !== 'object' || routing === null) {
    push(errors, 'config.planRouting', 'debe declarar labelMap y default');
  } else {
    const planIds = new Set((config.plans ?? []).map((plan) => plan?.id));
    if (typeof routing.labelMap !== 'object' || routing.labelMap === null) {
      push(errors, 'config.planRouting.labelMap', 'debe ser un objeto label -> plan');
    } else {
      for (const [label, planId] of Object.entries(routing.labelMap)) {
        if (!planIds.has(planId)) push(errors, `config.planRouting.labelMap.${label}`, `apunta a un plan no declarado: ${planId}`);
      }
    }
    if (routing.default !== null && routing.default !== undefined && !planIds.has(routing.default)) {
      push(errors, 'config.planRouting.default', `apunta a un plan no declarado: ${routing.default}`);
    }
  }
  if (!Array.isArray(config.allowlistLabels)) {
    push(errors, 'config.allowlistLabels', 'debe ser una lista de labels permitidas durante una pausa');
  }
  return errors;
}

export function validateItem(item, path, errors, planIds) {
  if (typeof item !== 'object' || item === null) {
    push(errors, path, 'debe ser un objeto item');
    return;
  }
  if (typeof item.id !== 'string' || !ITEM_ID.test(item.id)) {
    push(errors, `${path}.id`, 'debe tener la forma debt-<12 hex>');
  }
  requireString(errors, item.title, `${path}.title`);
  requireString(errors, item.artifact, `${path}.artifact`);
  requireEnum(errors, item.category, DEBT_CATEGORIES.concat('optional-improvement'), `${path}.category`);
  requireEnum(errors, item.severity, SEVERITIES, `${path}.severity`);
  requireEnum(errors, item.status, ITEM_STATUSES, `${path}.status`);
  if (typeof item.transversal !== 'boolean') push(errors, `${path}.transversal`, 'debe ser booleano');
  if (typeof item.critical !== 'boolean') push(errors, `${path}.critical`, 'debe ser booleano');
  if (typeof item.planOwner !== 'string' || (planIds && !planIds.has(item.planOwner))) {
    push(errors, `${path}.planOwner`, 'debe referir un plan declarado en config.plans');
  }
  validateEvidenceList(errors, item.evidence, `${path}.evidence`);
  if (!Array.isArray(item.occurrences) || item.occurrences.length === 0) {
    push(errors, `${path}.occurrences`, 'debe registrar al menos un occurrence {flow, date}');
  } else {
    item.occurrences.forEach((occurrence, index) => {
      requireString(errors, occurrence?.flow, `${path}.occurrences[${index}].flow`);
      requireIsoDate(errors, occurrence?.date, `${path}.occurrences[${index}].date`);
    });
  }
  requireIsoDate(errors, item.createdAt, `${path}.createdAt`);
  requireIsoDate(errors, item.updatedAt, `${path}.updatedAt`);
  if (item.status === 'accepted-exception') {
    validateException(item.exception, `${path}.exception`, errors);
  } else if (item.exception !== null && item.exception !== undefined) {
    validateException(item.exception, `${path}.exception`, errors);
  }
  if (['resolved', 'refuted', 'duplicate'].includes(item.status)) {
    if (typeof item.resolution !== 'object' || item.resolution === null) {
      push(errors, `${path}.resolution`, `estado ${item.status} exige resolucion trazable {flow, evidence}`);
    } else {
      requireString(errors, item.resolution.flow, `${path}.resolution.flow`);
      requireString(errors, item.resolution.evidence, `${path}.resolution.evidence`);
    }
  }
}

export function validateRegistry(registry, config) {
  const errors = [];
  if (typeof registry !== 'object' || registry === null) {
    push(errors, 'registry', 'registry.json debe contener un objeto');
    return errors;
  }
  if (registry.schemaVersion !== REGISTRY_SCHEMA_VERSION) {
    push(errors, 'registry.schemaVersion', `debe ser ${REGISTRY_SCHEMA_VERSION}`);
  }
  if (!Array.isArray(registry.items)) {
    push(errors, 'registry.items', 'debe ser una lista');
    return errors;
  }
  const planIds = config ? new Set((config.plans ?? []).map((plan) => plan?.id)) : null;
  const seen = new Set();
  registry.items.forEach((item, index) => {
    validateItem(item, `registry.items[${index}]`, errors, planIds);
    if (typeof item?.id === 'string') {
      if (seen.has(item.id)) push(errors, `registry.items[${index}].id`, `id duplicado: ${item.id}`);
      seen.add(item.id);
    }
  });
  return errors;
}

export function validateCandidate(candidate, path, errors, planIds) {
  if (typeof candidate !== 'object' || candidate === null) {
    push(errors, path, 'debe ser un objeto candidato');
    return;
  }
  requireString(errors, candidate.title, `${path}.title`);
  requireString(errors, candidate.artifact, `${path}.artifact`);
  requireString(errors, candidate.source, `${path}.source`);
  if (!requireEnum(errors, candidate.category, CATEGORIES, `${path}.category`)) return;
  validateEvidenceList(errors, candidate.evidence, `${path}.evidence`);
  if (typeof candidate.verification !== 'object' || candidate.verification === null) {
    push(errors, `${path}.verification`, 'todo candidato exige verificacion {method, result, date} antes de clasificarse');
  } else {
    requireString(errors, candidate.verification.method, `${path}.verification.method`);
    requireString(errors, candidate.verification.result, `${path}.verification.result`);
    requireIsoDate(errors, candidate.verification.date, `${path}.verification.date`);
  }
  const isDebt = DEBT_CATEGORIES.includes(candidate.category) || candidate.category === 'optional-improvement';
  if (isDebt && candidate.resolvedPreviously !== true) {
    requireEnum(errors, candidate.severity, SEVERITIES, `${path}.severity`);
    if (typeof candidate.planOwner !== 'string' || (planIds && !planIds.has(candidate.planOwner))) {
      push(errors, `${path}.planOwner`, 'debe referir un plan declarado en config.plans');
    }
    if (typeof candidate.transversal !== 'boolean') push(errors, `${path}.transversal`, 'debe ser booleano');
    if (typeof candidate.critical !== 'boolean') push(errors, `${path}.critical`, 'debe ser booleano');
  }
  if (candidate.category === 'duplicate' && !ITEM_ID.test(candidate.duplicateOf ?? '')) {
    push(errors, `${path}.duplicateOf`, 'un duplicate debe referir el id debt-<12 hex> del item vigente');
  }
}

export function validateAssessment(assessment, config) {
  const errors = [];
  if (typeof assessment !== 'object' || assessment === null) {
    push(errors, 'assessment', 'el assessment debe ser un objeto');
    return errors;
  }
  if (assessment.schemaVersion !== ASSESSMENT_SCHEMA_VERSION) {
    push(errors, 'assessment.schemaVersion', `debe ser ${ASSESSMENT_SCHEMA_VERSION}`);
  }
  requireString(errors, assessment.flow, 'assessment.flow');
  requireIsoDate(errors, assessment.date, 'assessment.date');
  requireEnum(errors, assessment.kind, ASSESSMENT_KINDS, 'assessment.kind');
  requireEnum(errors, assessment.result, ASSESSMENT_RESULTS, 'assessment.result');
  const planIds = config ? new Set((config.plans ?? []).map((plan) => plan?.id)) : null;
  if (!Array.isArray(assessment.candidates)) {
    push(errors, 'assessment.candidates', 'debe ser una lista (vacia cuando el cierre es clean)');
  } else {
    assessment.candidates.forEach((candidate, index) => {
      validateCandidate(candidate, `assessment.candidates[${index}]`, errors, planIds);
    });
    const confirmed = assessment.candidates.filter(
      (candidate) => candidate?.resolvedPreviously !== true
        && (DEBT_CATEGORIES.includes(candidate?.category) || candidate?.category === 'optional-improvement'),
    );
    if (assessment.result === 'clean' && confirmed.length > 0) {
      push(errors, 'assessment.result', 'un cierre clean no puede confirmar candidatos con deuda');
    }
    if (assessment.result === 'debt' && confirmed.length === 0) {
      push(errors, 'assessment.result', 'un cierre debt exige al menos un candidato confirmado');
    }
  }
  if (assessment.resolves !== undefined) {
    if (!Array.isArray(assessment.resolves)) {
      push(errors, 'assessment.resolves', 'debe ser una lista {id, evidence}');
    } else {
      assessment.resolves.forEach((entry, index) => {
        if (!ITEM_ID.test(entry?.id ?? '')) push(errors, `assessment.resolves[${index}].id`, 'debe referir un id debt-<12 hex>');
        requireString(errors, entry?.evidence, `assessment.resolves[${index}].evidence`);
      });
    }
  }
  if (assessment.exceptions !== undefined) {
    if (!Array.isArray(assessment.exceptions)) {
      push(errors, 'assessment.exceptions', 'debe ser una lista {id, reason, owner, approvedBy, expiresOn, recovery}');
    } else {
      assessment.exceptions.forEach((entry, index) => {
        if (!ITEM_ID.test(entry?.id ?? '')) push(errors, `assessment.exceptions[${index}].id`, 'debe referir un id debt-<12 hex>');
        validateException(entry, `assessment.exceptions[${index}]`, errors);
      });
    }
  }
  return errors;
}

export function formatErrors(errors) {
  return errors.map((error) => `${error.path}: ${error.message}`).join('\n');
}
