import { readFileSync } from 'node:fs';
import path from 'node:path';

import { EXIT_CODES } from './constants.mjs';
import { capture } from './capture.mjs';
import { checkState, preArchiveGate, preProposeGate } from './gates.mjs';
import { defaultRunner, resolveMode, syncGithub } from './github.mjs';
import { recommendContinuity, renderHandoff } from './handoff.mjs';
import { buildReport, check, exitCodeFor, formatHuman } from './report.mjs';
import { DebtError, isConfigured } from './store.mjs';

const USAGE = `Uso: debt-control <comando> [opciones]

Comandos read-only:
  check                                 Estado de presupuesto, triggers y pausas por plan.
  gate --phase pre-propose [--labels a,b]
  gate --phase pre-archive --change <n>
  handoff --plan <id> [--phase <fase>] [--context ok|degraded]

Comandos que mutan estado (explicitos):
  capture --flow <flujo> --input <archivo.json>
  sync                                  Sincroniza issues de saneamiento segun github.mode.
  postfinish                            Red de seguridad tras merge: check + sync.

Opciones comunes: --root <dir> (default cwd), --json, --now <YYYY-MM-DD> (pruebas).`;

function parseArgs(argv) {
  const args = { _: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value.startsWith('--')) {
      const key = value.slice(2);
      const next = argv[index + 1];
      if (next === undefined || next.startsWith('--')) {
        args[key] = true;
      } else {
        args[key] = next;
        index += 1;
      }
    } else {
      args._.push(value);
    }
  }
  return args;
}

function nowFrom(args) {
  if (!args.now) return new Date();
  const parsed = new Date(`${args.now}T12:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) throw new DebtError(`--now invalido: ${args.now}`, { recovery: 'Usa formato YYYY-MM-DD.' });
  return parsed;
}

function emit(report, args, write) {
  write(args.json ? JSON.stringify(report, null, 2) : formatHuman(report));
  return exitCodeFor(report);
}

export function runCli(argv, { cwd = process.cwd(), runner = defaultRunner, write = (text) => process.stdout.write(`${text}\n`) } = {}) {
  const args = parseArgs(argv);
  const command = args._[0];
  const root = path.resolve(cwd, args.root ?? '.');

  try {
    const now = nowFrom(args);

    if (command === 'check') {
      const state = checkState({ root, now });
      const report = buildReport('check', state.checks, {
        evaluation: state.evaluation,
      });
      return emit(report, args, write);
    }

    if (command === 'gate') {
      if (args.phase === 'pre-propose') {
        const labels = typeof args.labels === 'string' ? args.labels.split(',').map((label) => label.trim()).filter(Boolean) : [];
        const result = preProposeGate({ root, labels, now });
        return emit(buildReport('gate:pre-propose', [result]), args, write);
      }
      if (args.phase === 'pre-archive') {
        if (typeof args.change !== 'string') throw new DebtError('gate --phase pre-archive exige --change <nombre>.', { recovery: USAGE });
        const results = preArchiveGate({ root, change: args.change, now });
        return emit(buildReport('gate:pre-archive', results), args, write);
      }
      throw new DebtError('gate exige --phase pre-propose o pre-archive.', { recovery: USAGE });
    }

    if (command === 'capture') {
      if (typeof args.flow !== 'string' || typeof args.input !== 'string') {
        throw new DebtError('capture exige --flow <flujo> y --input <archivo.json>.', { recovery: USAGE });
      }
      let input;
      try {
        input = JSON.parse(readFileSync(path.resolve(root, args.input), 'utf8'));
      } catch (error) {
        throw new DebtError(`No se pudo leer el input: ${error.message}`, { recovery: 'Verifica la ruta y que el archivo sea JSON valido.' });
      }
      const result = capture({ root, flow: args.flow, input, now });
      const summary = result.noop
        ? `Captura idempotente: '${result.flow}' ya estaba registrado (no-op, sin drift).`
        : `Assessment '${result.flow}' capturado (${result.result}); cambios: ${result.changes.map((change) => `${change.action}:${change.id}`).join(', ') || 'ninguno'}.`;
      return emit(buildReport('capture', [check('capture', 'PASS', summary)], { capture: result }), args, write);
    }

    if (command === 'sync' || command === 'postfinish') {
      const state = checkState({ root, now });
      if (!state.config) {
        return emit(buildReport(command, state.checks), args, write);
      }
      const sync = syncGithub({
        root,
        config: state.config,
        registry: state.registry,
        evaluation: state.evaluation,
        runner,
        persistIssueRefs: command !== 'postfinish',
      });
      let stateChecks = state.checks;
      if (command === 'postfinish') {
        // Una pausa ya reconocida (issue existente y sync sin cambios, o modos advisory/off con
        // registro local) degrada a WARN visible: el cierre no debe fallar por deuda conocida en
        // cada merge posterior. La primera deteccion (issue creado ahora) y todo fallo de sync en
        // modo required conservan FAIL.
        const syncFailed = sync.checks.some((entry) => entry.status === 'FAIL');
        const createdNow = new Set(
          sync.checks
            .filter((entry) => entry.id.startsWith('github-issue-') && /creado/.test(entry.summary))
            .map((entry) => entry.id.slice('github-issue-'.length)),
        );
        stateChecks = state.checks.map((entry) => {
          if (!entry.id.startsWith('plan-') || entry.status !== 'FAIL') return entry;
          if (syncFailed || createdNow.has(entry.id.slice('plan-'.length))) return entry;
          return {
            ...entry,
            status: 'WARN',
            summary: `${entry.summary} Pausa ya reconocida en el expediente (modo ${sync.mode}); el merge de este cierre no se revierte.`,
          };
        });
      }
      const checks = command === 'postfinish' ? [...stateChecks, ...sync.checks] : sync.checks;
      return emit(buildReport(command, checks, { githubMode: sync.mode, evaluation: state.evaluation }), args, write);
    }

    if (command === 'handoff') {
      if (!isConfigured(root)) {
        return emit(buildReport('handoff', [check('handoff', 'SKIP', 'El motor de deuda no esta configurado (.project-os/debt/config.json ausente).')]), args, write);
      }
      const state = checkState({ root, now });
      if (!state.config) return emit(buildReport('handoff', state.checks), args, write);
      const planId = typeof args.plan === 'string' ? args.plan : null;
      if (!planId) throw new DebtError('handoff exige --plan <id>.', { recovery: USAGE });
      const continuity = recommendContinuity({
        phase: typeof args.phase === 'string' ? args.phase : 'remediation',
        evaluation: state.evaluation,
        planId,
        contextHealth: typeof args.context === 'string' ? args.context : 'unknown',
      });
      const prompt = renderHandoff({
        config: state.config,
        registry: state.registry,
        evaluation: state.evaluation,
        planId,
        repo: state.config.github.repo ?? null,
        branchHint: state.config.branchHint ?? null,
      });
      const report = buildReport('handoff', [
        check('continuity', 'PASS', `Recomendacion: ${continuity.recommendation} (${continuity.reasons.join('; ')}).`),
      ], { continuity, prompt });
      if (args.json) {
        write(JSON.stringify(report, null, 2));
      } else {
        write(formatHuman(report));
        write('');
        write(prompt);
      }
      return exitCodeFor(report);
    }

    write(USAGE);
    return EXIT_CODES.usage;
  } catch (error) {
    const recovery = error instanceof DebtError && error.recovery ? `\nRecuperacion: ${error.recovery}` : '';
    write(`debt-control ${command ?? ''}: FAIL - ${error.message}${recovery}`);
    return error instanceof DebtError ? EXIT_CODES.usage : EXIT_CODES.fail;
  }
}
