import { CHECK_STATUSES, EXIT_CODES } from './constants.mjs';

// Redaccion de secretos antes de emitir cualquier texto hacia prompts, issues o logs. Cubre palabras
// clave con separador (=, : o espacio), prefijos de token conocidos (GitHub, AWS, JWT) y credenciales
// embebidas en URLs. Preferimos redactar de mas a filtrar de menos.
export function sanitize(value = '') {
  return String(value)
    .replace(/\b(gh[pousr]_|github_pat_)[A-Za-z0-9_]{8,}/g, '[redacted]')
    .replace(/\bAKIA[0-9A-Z]{16}\b/g, '[redacted]')
    .replace(/\beyJ[A-Za-z0-9_-]{10,}(?:\.[A-Za-z0-9_-]+){1,2}/g, '[redacted]')
    .replace(/\b(Bearer|token|secret|password|passwd|pwd|api[-_]?key|key)([=:]\s*|\s+)[A-Za-z0-9._~+/=-]{6,}/gi, '$1$2[redacted]')
    .replace(/mongodb(\+srv)?:\/\/[^@\s]+@/gi, 'mongodb$1://[redacted]@')
    .replace(/(https?|postgres(?:ql)?|redis|amqp):\/\/[^@\s/]+@/gi, '$1://[redacted]@');
}

export function check(id, status, summary, recovery = null) {
  if (!CHECK_STATUSES.includes(status)) throw new Error(`Estado de check no soportado: ${status}`);
  return { id, status, summary: sanitize(summary), recovery: recovery ? sanitize(recovery) : null };
}

// Una sola fuente de veredicto: la salida humana se deriva de la misma estructura que el JSON, asi
// que ambas no pueden divergir en PASS/FAIL/WARN/SKIP, causa ni recuperacion.
export function buildReport(command, checks, extra = {}) {
  const counts = Object.fromEntries(CHECK_STATUSES.map((status) => [status, checks.filter((entry) => entry.status === status).length]));
  const ok = counts.FAIL === 0;
  return {
    command,
    ok,
    verdict: ok ? (counts.WARN > 0 ? 'WARN' : 'PASS') : 'FAIL',
    counts,
    checks,
    ...extra,
  };
}

export function formatHuman(report) {
  const lines = [`project-os debt ${report.command}: ${report.verdict}`];
  for (const entry of report.checks) {
    lines.push(`${entry.status.padEnd(5)} ${entry.id}: ${entry.summary}`);
    if (entry.recovery) lines.push(`      Recuperacion: ${entry.recovery}`);
  }
  return lines.join('\n');
}

export function exitCodeFor(report) {
  return report.ok ? EXIT_CODES.ok : EXIT_CODES.fail;
}
