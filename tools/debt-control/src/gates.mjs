import { DEBT_CATEGORIES } from './constants.mjs';
import { assessmentReflected } from './capture.mjs';
import { evaluate, hasAllowlistedLabel, resolvePlanForLabels } from './policy.mjs';
import { check } from './report.mjs';
import { formatErrors, validateAssessment } from './schema.mjs';
import { DebtError, isConfigured, listAssessments, loadAssessment, loadConfig, loadRegistry } from './store.mjs';

const NOT_CONFIGURED = 'El motor de deuda no esta configurado (.project-os/debt/config.json ausente).';

function loadState(root) {
  const config = loadConfig(root);
  const registry = loadRegistry(root, config);
  return { config, registry };
}

// Gate pre-propose: bloquea nuevos changes de producto de un plan pausado. Con deuda transversal
// critica el bloqueo aplica a todos los planes. La allowlist admite saneamiento, seguridad,
// incidentes y rollback. Sin configuracion, SKIP explicito: nunca exito implicito.
export function preProposeGate({ root, labels = [], now = new Date() }) {
  if (!isConfigured(root)) {
    return check('debt-pre-propose', 'SKIP', NOT_CONFIGURED);
  }
  let state;
  try {
    state = loadState(root);
  } catch (error) {
    return check('debt-pre-propose', 'FAIL', error.message, error instanceof DebtError ? error.recovery : null);
  }
  const { config, registry } = state;
  const evaluation = evaluate({ config, registry, now });

  if (hasAllowlistedLabel(config, labels)) {
    return check('debt-pre-propose', 'PASS', 'El issue lleva una label de saneamiento/seguridad/incidente/rollback permitida durante una pausa.');
  }

  if (evaluation.globalTriggers.length) {
    const detail = evaluation.globalTriggers.map((trigger) => trigger.detail).join('; ');
    return check(
      'debt-pre-propose',
      'FAIL',
      `Deuda transversal critica pausa todos los planes: ${detail}`,
      'Ejecuta el issue de saneamiento (o refuta la deuda con evidencia) antes de proponer nuevos changes de producto.',
    );
  }

  const planId = resolvePlanForLabels(config, labels);
  if (!planId) {
    return check('debt-pre-propose', 'PASS', 'El issue no rutea a ningun plan con politica de deuda; no hay pausa aplicable.');
  }
  const plan = evaluation.plans[planId];
  if (plan?.paused) {
    const triggers = plan.triggers.map((trigger) => `${trigger.id} (${trigger.detail})`).join('; ');
    return check(
      'debt-pre-propose',
      'FAIL',
      `El plan '${planId}' esta pausado por deuda: ${triggers}`,
      `Ejecuta el issue de saneamiento del plan o etiqueta el issue con una label permitida (${(config.allowlistLabels ?? []).join(', ')}) si es saneamiento/seguridad/incidente/rollback.`,
    );
  }
  return check('debt-pre-propose', 'PASS', `El plan '${planId}' no tiene triggers de deuda activos.`);
}

// Gate pre-archive: exige assessment del flujo (aunque sea clean) y bloquea Blockers/Majors del
// flujo, deuda transversal critica global y deuda nueva sobre un plan pausado desde changes ajenos
// al saneamiento.
export function preArchiveGate({ root, change, now = new Date() }) {
  if (!isConfigured(root)) {
    return [check('debt-gate', 'SKIP', NOT_CONFIGURED)];
  }
  const checks = [];
  let state;
  try {
    state = loadState(root);
  } catch (error) {
    return [check('debt-gate', 'FAIL', error.message, error instanceof DebtError ? error.recovery : null)];
  }
  const { config, registry } = state;

  let assessment;
  try {
    assessment = loadAssessment(root, change);
  } catch (error) {
    return [check('debt-gate', 'FAIL', error.message, error instanceof DebtError ? error.recovery : null)];
  }
  const errors = validateAssessment(assessment, config);
  if (errors.length) {
    return [check('debt-gate', 'FAIL', `El assessment de '${change}' no cumple el esquema:\n${formatErrors(errors)}`, 'Corrige el assessment y vuelve a capturarlo.')];
  }
  checks.push(check('debt-assessment', 'PASS', `Assessment de '${change}' presente y valido (resultado: ${assessment.result}).`));

  const confirmed = (assessment.candidates ?? []).filter(
    (candidate) => candidate.resolvedPreviously !== true && DEBT_CATEGORIES.includes(candidate.category),
  );
  const blocking = confirmed.filter((candidate) => candidate.severity === 'blocker' || candidate.severity === 'major');
  if (blocking.length) {
    checks.push(check(
      'debt-gate',
      'FAIL',
      `El flujo confirma Blockers/Majors abiertos: ${blocking.map((candidate) => `${candidate.title} [${candidate.severity}]`).join('; ')}`,
      'Corrige los hallazgos en este mismo change (spec primero si cambia comportamiento) o refutalos con evidencia antes de archivar.',
    ));
    return checks;
  }

  const evaluation = evaluate({ config, registry, now });
  if (evaluation.globalTriggers.length) {
    checks.push(check(
      'debt-gate',
      'FAIL',
      `Hay deuda transversal critica abierta: ${evaluation.globalTriggers.map((trigger) => trigger.detail).join('; ')}`,
      'Resuelve o refuta la deuda critica antes de archivar cualquier change.',
    ));
    return checks;
  }

  if (assessment.kind !== 'remediation') {
    const pausedWithNewDebt = confirmed.filter((candidate) => evaluation.plans[candidate.planOwner]?.paused);
    if (pausedWithNewDebt.length) {
      checks.push(check(
        'debt-gate',
        'FAIL',
        `El change agrega deuda confirmada a un plan pausado: ${pausedWithNewDebt.map((candidate) => candidate.title).join('; ')}`,
        'Un plan pausado solo admite saneamiento; resuelve la deuda o reclasifica el change como remediation con evidencia.',
      ));
      return checks;
    }
  }

  checks.push(check('debt-gate', 'PASS', 'Sin Blockers/Majors del flujo ni deuda critica transversal abierta.'));
  return checks;
}

// Estado global read-only: presupuesto, triggers y pausas por plan.
export function checkState({ root, now = new Date() }) {
  if (!isConfigured(root)) {
    return { checks: [check('debt-config', 'SKIP', NOT_CONFIGURED)], evaluation: null, config: null, registry: null };
  }
  let state;
  try {
    state = loadState(root);
  } catch (error) {
    return {
      checks: [check('debt-config', 'FAIL', error.message, error instanceof DebtError ? error.recovery : null)],
      evaluation: null,
      config: null,
      registry: null,
    };
  }
  const { config, registry } = state;
  const evaluation = evaluate({ config, registry, now });
  const checks = [check('debt-config', 'PASS', `Politica y registro validos (${registry.items.length} item(s)).`)];

  for (const plan of Object.values(evaluation.plans)) {
    if (plan.paused) {
      checks.push(check(
        `plan-${plan.id}`,
        'FAIL',
        `Plan pausado (${plan.budget}/${plan.threshold} unidades): ${plan.triggers.map((trigger) => trigger.detail).join('; ') || 'pausa por deuda transversal critica'}`,
        'Ejecuta el issue de saneamiento del plan; la reanudacion exige evidencia, no edicion del registro.',
      ));
    } else {
      checks.push(check(
        `plan-${plan.id}`,
        'PASS',
        `Plan activo: ${plan.budget}/${plan.threshold} unidades, ${plan.flowsWithResidualDebt} flujo(s) con deuda abierta.`,
      ));
    }
  }

  // Un assessment capturado que no es no-op al re-aplicarse delata una ejecucion parcial
  // (interrumpida entre assessment y registry) que debe converger reejecutando capture.
  for (const { flow, assessment } of listAssessments(root)) {
    const errors = validateAssessment(assessment, config);
    if (errors.length) {
      checks.push(check(
        `assessment-${flow}`,
        'FAIL',
        `assessments/${flow}.json no cumple el esquema:\n${formatErrors(errors)}`,
        'Corrige o restaura el assessment desde el control de versiones.',
      ));
      continue;
    }
    if (!assessmentReflected({ registry, assessment })) {
      checks.push(check(
        `assessment-${flow}`,
        'FAIL',
        `El assessment '${flow}' no esta reflejado por completo en el registro (captura interrumpida).`,
        `Reejecuta: debt-control capture --flow ${flow} --input ${'.project-os/debt/assessments/' + flow + '.json'} para converger.`,
      ));
    }
  }

  return { checks, evaluation, config, registry };
}
