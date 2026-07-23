import { NO_NEW_DEBT_RULE } from './constants.mjs';
import { unitsFor } from './policy.mjs';
import { sanitize } from './report.mjs';

function severityRank(severity) {
  return { blocker: 0, major: 1, minor: 2 }[severity] ?? 3;
}

// Recomendacion determinista de continuidad. Mismo chat solo para correcciones pequenas, locales y
// previas al archive con contexto declarado sano; todo lo demas exige tarea nueva con handoff.
export function recommendContinuity({ phase, evaluation, planId, contextHealth = 'unknown' }) {
  const reasons = [];
  const plan = planId ? evaluation?.plans?.[planId] : null;
  const openItems = plan ? plan.openItems.length : 0;
  const hasBlocking = Boolean(plan?.triggers.some((trigger) => trigger.id === 'blocker-major'));
  const hasGlobal = (evaluation?.globalTriggers?.length ?? 0) > 0;

  if (phase !== 'pre-archive') reasons.push(`fase '${phase}': el saneamiento o cierre tardio exige contexto propio`);
  if (hasBlocking) reasons.push('hay Blockers/Majors abiertos que requieren revision independiente');
  if (hasGlobal) reasons.push('hay deuda transversal critica: el alcance cruza planes');
  if (plan?.paused) reasons.push(`el plan '${planId}' esta pausado: corresponde ejecutar el issue de saneamiento`);
  if (openItems > 2) reasons.push(`${openItems} hallazgos abiertos superan una correccion puntual`);
  if (contextHealth !== 'ok') reasons.push(`contexto declarado '${contextHealth}': un chat nuevo parte de fuentes canonicas`);

  if (reasons.length === 0) {
    return {
      recommendation: 'same-task',
      reasons: [
        'la correccion es pequena, local y previa al archive',
        'no hay Blockers, Majors ni deuda transversal',
        'el contexto declarado esta sano',
      ],
    };
  }
  return { recommendation: 'new-task', reasons };
}

// Prompt de relevo renderizado solo desde datos canonicos (config + registry + evaluation). Sin
// timestamps implicitos: la misma entrada produce el mismo texto, y todo secreto queda redactado.
export function renderHandoff({ config, registry, evaluation, planId, repo = null, branchHint = null }) {
  const plan = config.plans.find((entry) => entry.id === planId);
  const planState = evaluation.plans[planId];
  if (!plan || !planState) {
    throw new Error(`Plan desconocido para handoff: ${planId}`);
  }
  const items = registry.items
    .filter((item) => item.status === 'open' && item.planOwner === planId)
    .sort((a, b) => severityRank(a.severity) - severityRank(b.severity) || a.id.localeCompare(b.id));
  const issueNumbers = [...new Set(items.map((item) => item.issue).filter(Boolean))];
  const issueLine = issueNumbers.length
    ? issueNumbers.map((number) => `#${number}`).join(', ')
    : 'PENDIENTE: aun no existe issue de saneamiento sincronizado; ejecuta project-os debt sync.';

  const lines = [
    '# Prompt de relevo: saneamiento de deuda tecnica',
    '',
    `Actua como implementador del saneamiento de deuda del plan "${plan.title}".`,
    '',
    '## Objetivo',
    '',
    `Resolver, refutar con evidencia o excepcionar formalmente la deuda abierta del plan '${plan.id}'`,
    'hasta cumplir las condiciones de reanudacion. Regla obligatoria durante todo el trabajo:',
    `${NO_NEW_DEBT_RULE}.`,
    '',
    '## Estado real (fuente: .project-os/debt/)',
    '',
    `- Issue de saneamiento: ${issueLine}`,
    `- Plan: ${plan.id}${plan.doc ? ` (${plan.doc})` : ''}`,
    `- Presupuesto: ${planState.budget}/${planState.threshold} unidades.`,
    `- Triggers activos: ${planState.pausedBy.join(', ') || 'ninguno'}.`,
    ...(repo ? [`- Repositorio: ${repo}`] : []),
    ...(branchHint ? [`- Convencion de rama: ${branchHint}`] : []),
    '',
    '## Hallazgos a atacar',
    '',
  ];
  for (const item of items) {
    lines.push(`- \`${item.id}\` [${item.severity}] (${item.category}, ${unitsFor(item, config)} unidad(es)) ${sanitize(item.title)}`);
    lines.push(`  - Artefacto: ${sanitize(item.artifact)}`);
    if (item.consequence) lines.push(`  - Consecuencia: ${sanitize(item.consequence)}`);
    for (const evidence of item.evidence) {
      lines.push(`  - Evidencia (${evidence.type}, ${evidence.date}): ${sanitize(evidence.ref)}`);
    }
    if (item.remediation) lines.push(`  - Remediacion candidata: ${sanitize(item.remediation)}`);
  }
  lines.push(
    '',
    '## Alcance y no objetivos',
    '',
    '- Alcance: unicamente los hallazgos listados; dividir en subchanges cohesivos si el lote no cabe en uno.',
    '- No objetivos: refactors fuera de los artefactos listados, features nuevas, resolver deuda de otros planes.',
    '- Prohibido cerrar hallazgos sin evidencia o borrar registro/assessments para "reanudar".',
    '',
    '## Gates y validacion',
    '',
    '- Cada subchange sigue el flujo SDD completo (issue -> enrich -> propose -> apply -> QA -> adversarial review -> archive).',
    '- Antes de archivar: capturar assessment con project-os debt capture (kind: remediation) y pasar el gate de archive.',
    '- Verificacion de estado: project-os debt check --json; la reanudacion exige todas sus condiciones en verde.',
    '',
    '## Rollback',
    '',
    '- Cada subchange declara su rollback en readiness.json; revertir el PR correspondiente no borra el registro de deuda.',
    '',
    '## Criterio de retorno',
    '',
    '- Deuda objetivo resuelta, refutada o con excepcion valida; presupuesto bajo el umbral; sin Blockers,',
    '  Majors ni excepciones expiradas; la remediacion no introdujo deuda nueva.',
    '- Al cumplirse, project-os debt check reporta el plan activo y el trabajo pausado puede retomarse.',
  );
  return lines.join('\n');
}
