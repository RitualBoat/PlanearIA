const ALLOWED_STATUSES = new Set(["PASS", "FAIL", "WARN", "SKIP"]);

const SECRET_PATTERNS = [
  /\b(Bearer)\s+[A-Za-z0-9._~+/=-]+/gi,
  /\b(gh[pousr]_[A-Za-z0-9]{16,})\b/g,
  /\b(sk-[A-Za-z0-9_-]{12,})\b/g,
  /\b((?:api[_-]?key|token|password|secret)\s*[=:]\s*)[^\s,;]+/gi,
];

function redactString(value) {
  return SECRET_PATTERNS.reduce(
    (current, pattern) => current.replace(pattern, (_match, prefix = "") => `${prefix}[REDACTED]`),
    value,
  );
}

export function redact(value) {
  if (typeof value === "string") {
    return redactString(value);
  }
  if (Array.isArray(value)) {
    return value.map(redact);
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        /(?:value|token|password|secret|apiKey)/i.test(key) && typeof entry === "string"
          ? "[REDACTED]"
          : redact(entry),
      ]),
    );
  }
  return value;
}

export function result({
  id,
  profile = "universal",
  status,
  summary,
  cause,
  remediation,
  evidence = {},
}) {
  if (!ALLOWED_STATUSES.has(status)) {
    throw new TypeError(`Estado de doctor no permitido para ${id ?? "resultado sin id"}: ${status}`);
  }
  for (const [field, value] of Object.entries({ id, profile, summary, cause, remediation })) {
    if (typeof value !== "string" || value.trim() === "") {
      throw new TypeError(`Campo obligatorio inválido en resultado de doctor: ${field}`);
    }
  }
  return {
    id,
    profile,
    status,
    summary,
    cause,
    remediation,
    evidence: redact(evidence),
  };
}

export function createReport(results, schemaVersion = "1.0.0") {
  const normalized = [];
  for (const candidate of results) {
    try {
      normalized.push(result(candidate));
    } catch (error) {
      normalized.push(
        result({
          id: `doctor.internal.${normalized.length + 1}`,
          status: "FAIL",
          summary: "El doctor recibió un resultado inválido",
          cause: error instanceof Error ? error.message : "Error interno no clasificable",
          remediation: "Corrige el probe para que use PASS, FAIL, WARN o SKIP y todos los campos requeridos.",
          evidence: {},
        }),
      );
    }
  }

  const counts = Object.fromEntries(
    [...ALLOWED_STATUSES].map((status) => [
      status,
      normalized.filter((entry) => entry.status === status).length,
    ]),
  );
  return {
    schemaVersion,
    verdict: counts.FAIL > 0 ? "FAIL" : "PASS",
    counts,
    results: normalized,
  };
}

function evidenceText(evidence) {
  if (!evidence || Object.keys(evidence).length === 0) {
    return "sin evidencia adicional";
  }
  return JSON.stringify(evidence);
}

export function formatHuman(report) {
  const lines = [
    `Project Constructor Doctor ${report.schemaVersion}`,
    `Veredicto: ${report.verdict} | PASS ${report.counts.PASS} | FAIL ${report.counts.FAIL} | WARN ${report.counts.WARN} | SKIP ${report.counts.SKIP}`,
  ];
  for (const entry of report.results) {
    lines.push(
      "",
      `[${entry.status}] ${entry.id} (${entry.profile})`,
      `  ${entry.summary}`,
      `  Causa: ${entry.cause}`,
      `  Evidencia: ${evidenceText(entry.evidence)}`,
      `  Recuperación: ${entry.remediation}`,
    );
  }
  return `${lines.join("\n")}\n`;
}

export function formatJson(report) {
  return `${JSON.stringify(report, null, 2)}\n`;
}

export function reportExitCode(report) {
  return report.verdict === "FAIL" ? 1 : 0;
}

export const DOCTOR_STATUSES = Object.freeze([...ALLOWED_STATUSES]);
