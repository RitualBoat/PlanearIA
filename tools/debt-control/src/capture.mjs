import { existsSync } from 'node:fs';

import { DEBT_CATEGORIES } from './constants.mjs';
import { contentHash, fingerprint } from './fingerprint.mjs';
import { formatErrors, validateAssessment } from './schema.mjs';
import {
  DebtError,
  assessmentPath,
  emptyRegistry,
  loadAssessment,
  loadConfig,
  loadRegistry,
  registryPath,
  writeJsonAtomic,
} from './store.mjs';

function isoDate(now) {
  return now.toISOString().slice(0, 10);
}

function candidateId(candidate) {
  return fingerprint({ category: candidate.category, artifact: candidate.artifact, title: candidate.title });
}

// Para deduplicar, un candidato refutado o resuelto-previamente debe encontrar el item vigente que
// representa; su categoria describe el desenlace, no la identidad, asi que el ID se calcula con la
// categoria de deuda del item existente cuando lo hay.
function matchExisting(registry, candidate) {
  for (const category of [candidate.category, ...DEBT_CATEGORIES, 'optional-improvement']) {
    const id = fingerprint({ category, artifact: candidate.artifact, title: candidate.title });
    const item = registry.items.find((entry) => entry.id === id);
    if (item) return item;
  }
  return null;
}

// Solo muta cuando de verdad agrega: la deteccion de ejecuciones parciales re-simula la aplicacion
// del assessment y depende de que una re-aplicacion sea un no-op byte a byte.
function addOccurrence(item, flow, date) {
  if (!item.occurrences.some((occurrence) => occurrence.flow === flow)) {
    item.occurrences.push({ flow, date });
    item.updatedAt = date;
  }
}

export function applyAssessmentToRegistry({ registry, assessment, now = new Date() }) {
  const date = isoDate(now);
  const flow = assessment.flow;
  const changes = [];

  for (const candidate of assessment.candidates ?? []) {
    const existing = matchExisting(registry, candidate);

    if (candidate.category === 'duplicate') {
      const target = registry.items.find((entry) => entry.id === candidate.duplicateOf);
      if (!target) {
        throw new DebtError(`El candidato duplicado '${candidate.title}' refiere un item inexistente: ${candidate.duplicateOf}.`, {
          recovery: 'Corrige duplicateOf con el id vigente del registro.',
        });
      }
      addOccurrence(target, flow, date);
      changes.push({ action: 'occurrence', id: target.id });
      continue;
    }

    if (candidate.category === 'false-positive') {
      if (existing && existing.status === 'open') {
        existing.status = 'refuted';
        existing.resolution = { flow, evidence: candidate.verification.result };
        existing.updatedAt = date;
        changes.push({ action: 'refuted', id: existing.id });
      } else {
        changes.push({ action: 'refuted-candidate', id: candidateId(candidate) });
      }
      continue;
    }

    if (candidate.resolvedPreviously === true) {
      if (existing && existing.status === 'open') {
        existing.status = 'resolved';
        existing.resolution = { flow, evidence: candidate.verification.result };
        existing.updatedAt = date;
        changes.push({ action: 'resolved', id: existing.id });
      } else {
        changes.push({ action: 'resolved-previously', id: candidateId(candidate) });
      }
      continue;
    }

    // Categorias de deuda y mejoras opcionales: crear item nuevo o registrar reaparicion.
    if (existing) {
      addOccurrence(existing, flow, date);
      changes.push({ action: 'occurrence', id: existing.id });
      continue;
    }
    const id = candidateId(candidate);
    registry.items.push({
      id,
      title: candidate.title,
      description: candidate.description ?? candidate.title,
      category: candidate.category,
      severity: candidate.severity,
      transversal: candidate.transversal ?? false,
      critical: candidate.critical ?? false,
      planOwner: candidate.planOwner,
      artifact: candidate.artifact,
      consequence: candidate.consequence ?? '',
      remediation: candidate.remediation ?? '',
      evidence: candidate.evidence,
      occurrences: [{ flow, date }],
      issue: null,
      status: 'open',
      exception: null,
      createdAt: date,
      updatedAt: date,
      resolution: null,
    });
    changes.push({ action: 'created', id });
  }

  for (const entry of assessment.resolves ?? []) {
    const item = registry.items.find((candidate) => candidate.id === entry.id);
    if (!item) {
      throw new DebtError(`assessment.resolves refiere un item inexistente: ${entry.id}.`, {
        recovery: 'Corrige el id o elimina la resolucion del assessment.',
      });
    }
    if (item.status === 'open' || item.status === 'accepted-exception') {
      item.status = 'resolved';
      item.resolution = { flow, evidence: entry.evidence };
      item.exception = item.exception ?? null;
      item.updatedAt = date;
      changes.push({ action: 'resolved', id: item.id });
    }
  }

  for (const entry of assessment.exceptions ?? []) {
    const item = registry.items.find((candidate) => candidate.id === entry.id);
    if (!item) {
      throw new DebtError(`assessment.exceptions refiere un item inexistente: ${entry.id}.`, {
        recovery: 'Corrige el id o elimina la excepcion del assessment.',
      });
    }
    if (item.status !== 'open' && item.status !== 'accepted-exception') {
      throw new DebtError(`El item ${entry.id} no esta abierto; no admite excepcion.`, {
        recovery: 'Solo items abiertos aceptan excepciones.',
      });
    }
    const exception = {
      reason: entry.reason,
      owner: entry.owner,
      approvedBy: entry.approvedBy,
      expiresOn: entry.expiresOn,
      recovery: entry.recovery,
    };
    if (item.status !== 'accepted-exception' || contentHash(item.exception) !== contentHash(exception)) {
      item.status = 'accepted-exception';
      item.exception = exception;
      item.updatedAt = date;
      changes.push({ action: 'exception', id: item.id });
    }
  }

  return changes;
}

// Captura idempotente por contenido: mismo input -> no-op; input distinto para un flujo capturado ->
// FAIL sin tocar la evidencia historica; interrupcion entre assessment y registry -> reejecutar
// converge porque la aplicacion al registro tambien es idempotente (occurrences por flujo unico).
export function capture({ root, flow, input, now = new Date() }) {
  const config = loadConfig(root);
  const assessment = { ...input, flow, schemaVersion: input.schemaVersion ?? 1 };
  const errors = validateAssessment(assessment, config);
  if (errors.length) {
    throw new DebtError(`El assessment no cumple el esquema:\n${formatErrors(errors)}`, {
      recovery: 'Corrige el archivo de entrada antes de capturar.',
    });
  }

  const existing = loadAssessment(root, flow, { optional: true });
  if (existing && contentHash(existing) !== contentHash(assessment)) {
    throw new DebtError(`El flujo '${flow}' ya tiene un assessment distinto; la evidencia historica es inmutable.`, {
      recovery: 'Usa otro identificador de flujo o revisa el assessment existente antes de reintentar.',
    });
  }

  const registry = existsSync(registryPath(root)) ? loadRegistry(root, config) : emptyRegistry();
  const before = contentHash(registry);
  const changes = applyAssessmentToRegistry({ registry, assessment, now });
  const after = contentHash(registry);

  const wroteAssessment = !existing;
  if (wroteAssessment) writeJsonAtomic(assessmentPath(root, flow), assessment);
  const wroteRegistry = before !== after;
  if (wroteRegistry) writeJsonAtomic(registryPath(root), registry);

  return {
    flow,
    noop: !wroteAssessment && !wroteRegistry,
    wroteAssessment,
    wroteRegistry,
    changes,
    result: assessment.result,
  };
}

// Un assessment esta reflejado cuando re-aplicarlo sobre una copia del registro es un no-op.
// Se usa la fecha del propio assessment para que la simulacion no invente drift por dia actual.
export function assessmentReflected({ registry, assessment }) {
  const copy = JSON.parse(JSON.stringify(registry));
  const before = contentHash(copy);
  try {
    applyAssessmentToRegistry({ registry: copy, assessment, now: new Date(`${assessment.date}T00:00:00.000Z`) });
  } catch {
    return false;
  }
  return contentHash(copy) === before;
}
