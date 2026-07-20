import { DEBT_CATEGORIES, TRIGGERS } from './constants.mjs';
import { isExceptionExpired } from './schema.mjs';

export function distinctFlows(item) {
  return new Set((item.occurrences ?? []).map((occurrence) => occurrence.flow)).size;
}

export function isRecurrent(item) {
  return distinctFlows(item) >= 2;
}

export function unitsFor(item, config) {
  if (!DEBT_CATEGORIES.includes(item.category)) return 0;
  if (item.severity !== 'minor') return 0;
  return isRecurrent(item) || item.transversal
    ? config.budget.escalatedMinorUnits
    : config.budget.minorUnits;
}

function isOpenDebt(item) {
  return item.status === 'open' && DEBT_CATEGORIES.includes(item.category);
}

function isCriticalTransversal(item) {
  return isOpenDebt(item) && item.transversal && (item.critical || item.severity === 'blocker');
}

// Evaluacion pura del registro contra la politica. No lee disco ni muta nada: el estado de pausa es
// una funcion derivada, no un flag editable. `remediationFlows` (Set de nombres de flujo con
// assessment kind=remediation) permite derivar si un saneamiento introdujo deuda nueva.
export function evaluate({ config, registry, now = new Date(), remediationFlows = new Set() }) {
  const items = registry.items ?? [];
  const openDebt = items.filter(isOpenDebt);
  const expiredExceptions = items.filter(
    (item) => item.status === 'accepted-exception' && item.exception && isExceptionExpired(item.exception, now),
  );
  const criticalTransversal = items.filter(isCriticalTransversal);

  const plans = {};
  for (const plan of config.plans) {
    const planOpen = openDebt.filter((item) => item.planOwner === plan.id);
    const planExpired = expiredExceptions.filter((item) => item.planOwner === plan.id);
    const budget = planOpen.reduce((total, item) => total + unitsFor(item, config), 0)
      + planExpired.reduce((total, item) => total + unitsFor(item, config), 0);
    const flows = new Set(planOpen.flatMap((item) => (item.occurrences ?? []).map((occurrence) => occurrence.flow)));
    const recurrentItems = planOpen.filter((item) => distinctFlows(item) >= config.triggers.recurrenceFlows);
    const blockersMajors = planOpen.filter((item) => item.severity === 'blocker' || item.severity === 'major');

    const triggers = [];
    if (blockersMajors.length) {
      triggers.push({ id: TRIGGERS.BLOCKER_MAJOR, detail: `Blocker/Major abiertos: ${blockersMajors.map((item) => item.id).join(', ')}` });
    }
    if (budget >= config.budget.threshold) {
      triggers.push({ id: TRIGGERS.BUDGET_THRESHOLD, detail: `Presupuesto ${budget}/${config.budget.threshold} unidades` });
    }
    if (flows.size >= config.triggers.flowsWithResidualDebt) {
      triggers.push({ id: TRIGGERS.FLOWS_WITH_DEBT, detail: `${flows.size} flujos SDD con deuda residual abierta` });
    }
    if (recurrentItems.length) {
      triggers.push({ id: TRIGGERS.RECURRENCE, detail: `Hallazgos repetidos en ${config.triggers.recurrenceFlows}+ flujos: ${recurrentItems.map((item) => item.id).join(', ')}` });
    }
    if (planExpired.length) {
      triggers.push({ id: TRIGGERS.EXPIRED_EXCEPTION, detail: `Excepciones vencidas: ${planExpired.map((item) => item.id).join(', ')}` });
    }
    // NO GENERAR MAS DEUDA TECNICA: un item abierto nacido en un flujo de saneamiento mantiene la
    // pausa aunque el presupuesto haya bajado del umbral; la reanudacion no procede con deuda nueva.
    const bornInRemediation = planOpen.filter((item) => remediationFlows.has(item.occurrences?.[0]?.flow));
    if (bornInRemediation.length) {
      triggers.push({
        id: TRIGGERS.REMEDIATION_NEW_DEBT,
        detail: `El saneamiento introdujo deuda nueva sin resolver: ${bornInRemediation.map((item) => item.id).join(', ')}`,
      });
    }

    plans[plan.id] = {
      id: plan.id,
      title: plan.title,
      budget,
      threshold: config.budget.threshold,
      remaining: Math.max(0, config.budget.threshold - budget),
      openItems: planOpen.map((item) => item.id),
      flowsWithResidualDebt: flows.size,
      triggers,
      paused: triggers.length > 0,
      pausedBy: triggers.map((trigger) => trigger.id),
    };
  }

  const globalTriggers = [];
  if (criticalTransversal.length) {
    globalTriggers.push({
      id: TRIGGERS.CRITICAL_TRANSVERSAL,
      detail: `Deuda transversal critica abierta: ${criticalTransversal.map((item) => item.id).join(', ')}`,
    });
    for (const plan of Object.values(plans)) {
      plan.paused = true;
      if (!plan.pausedBy.includes(TRIGGERS.CRITICAL_TRANSVERSAL)) plan.pausedBy.push(TRIGGERS.CRITICAL_TRANSVERSAL);
    }
  }

  return {
    plans,
    globalTriggers,
    pausedPlans: Object.values(plans).filter((plan) => plan.paused).map((plan) => plan.id),
    openDebtCount: openDebt.length,
    expiredExceptionIds: expiredExceptions.map((item) => item.id),
    criticalTransversalIds: criticalTransversal.map((item) => item.id),
  };
}

// Ruteo de un issue hacia su plan duenio por labels; la primera label mapeada gana en el orden del
// labelMap declarado, y sin coincidencia se usa el default (que puede ser null).
export function resolvePlanForLabels(config, labels) {
  const names = (labels ?? []).map((label) => (typeof label === 'string' ? label : label?.name)).filter(Boolean);
  for (const [label, planId] of Object.entries(config.planRouting.labelMap ?? {})) {
    if (names.includes(label)) return planId;
  }
  return config.planRouting.default ?? null;
}

export function hasAllowlistedLabel(config, labels) {
  const names = (labels ?? []).map((label) => (typeof label === 'string' ? label : label?.name)).filter(Boolean);
  return (config.allowlistLabels ?? []).some((label) => names.includes(label));
}

// Condiciones de reanudacion para reportarlas una a una; el plan reanuda cuando todas se cumplen.
// Derivadas de la misma evaluacion que decide la pausa, para que no puedan divergir.
export function resumeConditions({ config, evaluation, planId }) {
  const plan = evaluation.plans[planId];
  if (!plan) return [{ ok: false, detail: `Plan desconocido: ${planId}` }];
  const lacks = (id) => !plan.triggers.some((trigger) => trigger.id === id);
  return [
    { ok: lacks(TRIGGERS.BLOCKER_MAJOR), detail: 'Sin Blockers ni Majors abiertos del plan' },
    { ok: plan.budget < config.budget.threshold, detail: `Presupuesto ${plan.budget} por debajo del umbral ${config.budget.threshold}` },
    { ok: lacks(TRIGGERS.EXPIRED_EXCEPTION), detail: 'Sin excepciones expiradas' },
    { ok: evaluation.criticalTransversalIds.length === 0, detail: 'Sin deuda transversal critica abierta' },
    { ok: lacks(TRIGGERS.REMEDIATION_NEW_DEBT), detail: 'La remediacion no introdujo deuda confirmada nueva' },
  ];
}
