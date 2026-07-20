import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

import {
  MANAGED_BLOCK_END,
  MANAGED_BLOCK_START,
  NO_NEW_DEBT_RULE,
  PLAN_MARKER_PREFIX,
} from './constants.mjs';
import { unitsFor } from './policy.mjs';
import { sanitize } from './report.mjs';
import { loadRegistry, registryPath, writeJsonAtomic } from './store.mjs';

// Runner por defecto: gh sin shell. Los tests inyectan un runner simulado; ninguna ruta concatena
// strings hacia un interprete, asi que el contenido de issues y registry es siempre dato inerte.
export function defaultRunner(command, args) {
  try {
    const stdout = execFileSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return { status: 0, stdout: stdout ?? '', stderr: '' };
  } catch (error) {
    return {
      status: typeof error?.status === 'number' ? error.status : 1,
      stdout: error?.stdout?.toString?.() ?? '',
      stderr: `${error?.stderr?.toString?.() ?? ''}${error?.message ?? ''}`,
    };
  }
}

export function planMarker(planId) {
  return `<!-- ${PLAN_MARKER_PREFIX}${planId} -->`;
}

// Neutraliza aperturas de comentario HTML en texto proveniente de items: un titulo que documente los
// marcadores administrados no puede cortar el bloque ni hacer que un issue matchee el plan ajeno.
function inert(value) {
  return sanitize(value).replaceAll('<!--', '<! --');
}

// El modo auto resuelve segun exista el manifest de GitHub del proyecto: con Project OS configurado
// el default recomendado es required; sin el, off. Nunca adivina por red.
export function resolveMode(config, root) {
  const mode = config.github.mode;
  if (mode !== 'auto') return mode;
  const manifest = config.github.projectManifest ?? '.project-os/github/product-os.json';
  return existsSync(path.join(root, ...manifest.split('/'))) ? 'required' : 'off';
}

function severityRank(severity) {
  return { blocker: 0, major: 1, minor: 2 }[severity] ?? 3;
}

export function renderManagedBlock({ config, plan, items, evaluation }) {
  const sorted = [...items].sort((a, b) => severityRank(a.severity) - severityRank(b.severity) || a.id.localeCompare(b.id));
  const lines = [
    MANAGED_BLOCK_START,
    planMarker(plan.id),
    '',
    `## Saneamiento de deuda tecnica: ${plan.title}`,
    '',
    `Regla obligatoria: ${NO_NEW_DEBT_RULE}.`,
    '',
    'Este issue es el gate de saneamiento del plan. Mientras este abierto, el plan queda pausado y el',
    'pre-propose solo admite changes de saneamiento, seguridad, incidentes o rollback.',
    '',
    `- Presupuesto: ${evaluation.plans[plan.id]?.budget ?? 0}/${config.budget.threshold} unidades.`,
    `- Triggers activos: ${(evaluation.plans[plan.id]?.pausedBy ?? []).join(', ') || 'ninguno'}.`,
    '',
    '### Hallazgos abiertos',
    '',
  ];
  for (const item of sorted) {
    lines.push(`- \`${item.id}\` [${item.severity}] (${item.category}, ${unitsFor(item, config)} unidad(es)) ${inert(item.title)}`);
    lines.push(`  - Artefacto: ${inert(item.artifact)}`);
    for (const evidence of item.evidence) {
      lines.push(`  - Evidencia (${evidence.type}, ${evidence.date}): ${inert(evidence.ref)}`);
    }
    if (item.remediation) lines.push(`  - Remediacion candidata: ${inert(item.remediation)}`);
  }
  lines.push(
    '',
    '### Reglas de ejecucion',
    '',
    '- Dividir la implementacion en subchanges cohesivos; este issue agrupa el gate, no fuerza un PR gigante.',
    '- Cada subchange pasa por el flujo SDD completo con revision adversarial o entrevistas adicionales',
    '  hasta resolver todos los Blockers y Majors.',
    '- Ningun hallazgo se cierra sin evidencia; los falsos positivos se refutan explicitamente.',
    '',
    '### Condiciones de reanudacion',
    '',
    '- La deuda objetivo fue resuelta, refutada o aceptada mediante excepcion valida.',
    `- El presupuesto del plan queda por debajo de ${config.budget.threshold} unidades.`,
    '- No quedan Blockers, Majors ni excepciones expiradas.',
    '- La remediacion no introdujo deuda nueva (assessment del flujo de saneamiento sin items confirmados).',
    '',
    MANAGED_BLOCK_END,
  );
  return lines.join('\n');
}

function upsertManagedBlock(body, block) {
  const start = body.indexOf(MANAGED_BLOCK_START);
  const end = body.indexOf(MANAGED_BLOCK_END);
  if (start >= 0 && end > start) {
    return `${body.slice(0, start)}${block}${body.slice(end + MANAGED_BLOCK_END.length)}`;
  }
  return body ? `${body.trimEnd()}\n\n${block}\n` : `${block}\n`;
}

function ghCheck(runner) {
  const version = runner('gh', ['--version']);
  if (version.status !== 0) {
    return { ok: false, cause: 'GitHub CLI (gh) no esta disponible en PATH.', recovery: 'Instala gh o cambia github.mode a advisory/off en config.json.' };
  }
  const auth = runner('gh', ['auth', 'status']);
  if (auth.status !== 0) {
    return { ok: false, cause: 'gh no esta autenticado.', recovery: 'Ejecuta gh auth login o cambia github.mode a advisory/off.' };
  }
  return { ok: true };
}

function findRemediationIssue({ runner, config, planId }) {
  const args = ['issue', 'list', '--state', 'open', '--label', config.github.remediationLabel, '--json', 'number,title,body,url', '--limit', '50'];
  if (config.github.repo) args.push('--repo', config.github.repo);
  const listed = runner('gh', args);
  if (listed.status !== 0) {
    throw new Error(`gh issue list fallo: ${sanitize(listed.stderr).slice(-200)}`);
  }
  let issues;
  try {
    issues = JSON.parse(listed.stdout || '[]');
  } catch {
    throw new Error('gh issue list devolvio una salida no JSON.');
  }
  return issues.find((issue) => (issue.body ?? '').includes(planMarker(planId))) ?? null;
}

// Sincronizacion idempotente: un issue por plan pausado, identificado por marcador. Reejecutar sin
// cambios de estado no edita nada. Devuelve checks PASS/FAIL/WARN/SKIP sin falsos verdes.
// `persistIssueRefs: false` evita escribir los backrefs en registry.json: postfinish corre sobre la
// rama protegida ya mergeada y no debe dejar cambios sin commitear; el siguiente `debt:sync` en una
// rama de trabajo los persiste.
export function syncGithub({ root, config, registry, evaluation, runner = defaultRunner, log = () => {}, persistIssueRefs = true }) {
  const mode = resolveMode(config, root);
  const checks = [];
  if (mode === 'off') {
    checks.push({ id: 'github-sync', status: 'SKIP', summary: 'github.mode=off: se conserva solo el registro local.' });
    return { mode, checks, mutatedRegistry: false };
  }

  const degrade = (cause, recovery) => ({
    id: 'github-sync',
    status: mode === 'required' ? 'FAIL' : 'WARN',
    summary: mode === 'required'
      ? `Modo required sin GitHub utilizable: ${cause}`
      : `Modo advisory: ${cause} El expediente local queda como fuente; sincroniza manualmente.`,
    recovery,
  });

  const health = ghCheck(runner);
  if (!health.ok) {
    checks.push(degrade(health.cause, health.recovery));
    return { mode, checks, mutatedRegistry: false };
  }

  const pausedPlans = config.plans.filter((plan) => evaluation.plans[plan.id]?.paused);
  if (!pausedPlans.length) {
    checks.push({ id: 'github-sync', status: 'PASS', summary: 'Sin planes pausados: no se requieren issues de saneamiento.' });
    return { mode, checks, mutatedRegistry: false };
  }

  let mutatedRegistry = false;
  for (const plan of pausedPlans) {
    const openItems = registry.items.filter((item) => item.status === 'open' && item.planOwner === plan.id);
    const block = renderManagedBlock({ config, plan, items: openItems, evaluation });
    try {
      const existing = findRemediationIssue({ runner, config, planId: plan.id });
      let issueNumber;
      let issueUrl;
      if (!existing) {
        const title = `${config.github.issueTitlePrefix} ${plan.title}`;
        const args = ['issue', 'create', '--title', title, '--body', `${block}\n`, '--label', config.github.remediationLabel];
        if (config.github.repo) args.push('--repo', config.github.repo);
        const created = runner('gh', args);
        if (created.status !== 0) throw new Error(`gh issue create fallo: ${sanitize(created.stderr).slice(-200)}`);
        const found = findRemediationIssue({ runner, config, planId: plan.id });
        issueNumber = found?.number ?? null;
        issueUrl = found?.url ?? created.stdout.trim();
        checks.push({ id: `github-issue-${plan.id}`, status: 'PASS', summary: `Issue de saneamiento creado para ${plan.id}: ${issueUrl}` });
      } else {
        issueNumber = existing.number;
        issueUrl = existing.url;
        const nextBody = upsertManagedBlock(existing.body ?? '', block);
        if (nextBody === existing.body) {
          checks.push({ id: `github-issue-${plan.id}`, status: 'PASS', summary: `Issue #${existing.number} ya refleja el estado (no-op).` });
        } else {
          const args = ['issue', 'edit', String(existing.number), '--body', nextBody];
          if (config.github.repo) args.push('--repo', config.github.repo);
          const edited = runner('gh', args);
          if (edited.status !== 0) throw new Error(`gh issue edit fallo: ${sanitize(edited.stderr).slice(-200)}`);
          checks.push({ id: `github-issue-${plan.id}`, status: 'PASS', summary: `Issue #${existing.number} actualizado idempotentemente.` });
        }
      }
      if (issueNumber) {
        for (const item of openItems) {
          if (item.issue !== issueNumber) {
            item.issue = issueNumber;
            mutatedRegistry = true;
          }
        }
      }
      log(`plan ${plan.id}: issue ${issueUrl ?? 'sin url'}`);
    } catch (error) {
      checks.push(degrade(error.message, 'Revisa autenticacion/permisos de gh y reintenta debt-control sync.'));
    }
  }

  if (mutatedRegistry && persistIssueRefs) writeJsonAtomic(registryPath(root), registry);
  if (mutatedRegistry && !persistIssueRefs) {
    checks.push({
      id: 'github-refs',
      status: 'WARN',
      summary: 'Hay referencias de issue nuevas sin persistir en registry.json (ejecucion post-merge sobre rama protegida).',
      recovery: 'Ejecuta npm run debt:sync desde una rama de trabajo para persistir los backrefs via PR.',
    });
  }
  return { mode, checks, mutatedRegistry };
}

export function refreshRegistry(root, config) {
  return loadRegistry(root, config);
}
