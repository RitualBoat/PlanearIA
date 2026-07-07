/**
 * API de mejora de planeaciones con IA
 *
 * POST /api/planeaciones/mejorar
 * Body: {
 *   planeacion: Planeacion,
 *   maxSugerencias?: number
 * }
 */
const {
  validateAuth,
  handleCors,
  applyCors,
  errorResponse,
  successResponse,
} = require("../../lib/auth");
const { hasConfiguredProviders, runChatCompletion } = require("../../lib/aiGateway");
const { assertAiUsageLimit } = require("../../lib/aiUsageLimiter");

const OPENAI_TIMEOUT_MS = parseInt(process.env.OPENAI_TIMEOUT_MS || "20000", 10);
const MAX_SUGERENCIAS_DEFAULT = 8;

module.exports = async (req, res) => {
  applyCors(req, res);

  if (handleCors(req, res)) return;

  const auth = validateAuth(req);
  if (!auth.valid) {
    return errorResponse(res, 401, auth.error);
  }

  if (req.method !== "POST") {
    return errorResponse(res, 405, `Method ${req.method} not allowed`);
  }

  try {
    const { planeacion, maxSugerencias } = req.body || {};

    if (!planeacion || typeof planeacion !== "object") {
      return errorResponse(res, 400, "El campo 'planeacion' es requerido y debe ser un objeto");
    }

    const maxItems = normalizeMaxSugerencias(maxSugerencias);

    if (!hasConfiguredProviders()) {
      return successResponse(res, {
        provider: "heuristic",
        model: null,
        sugerencias: buildFallbackSuggestions(planeacion, maxItems),
      });
    }

    const systemPrompt = buildSystemPrompt(maxItems);
    const userPrompt = buildUserPrompt(planeacion, maxItems);

    const usage = assertAiUsageLimit(req, "mejorar_planeacion");
    const ai = await runChatCompletion({
      systemPrompt,
      userPrompt,
      temperature: 0.3,
      responseFormatJson: true,
      timeoutMs: OPENAI_TIMEOUT_MS,
    });
    const parsed = extractJson(ai.content);
    const sugerencias = normalizeSugerencias(parsed?.sugerencias, planeacion, maxItems);

    return successResponse(res, {
      provider: ai.provider,
      model: ai.model,
      usage,
      sugerencias,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      return errorResponse(res, 504, "La mejora con IA excedió el tiempo límite");
    }

    if (error?.statusCode === 429) {
      return errorResponse(res, 429, error.message);
    }

    console.error("❌ Error en /api/planeaciones/mejorar:", error);
    return errorResponse(res, 500, error.message || "Error al mejorar la planeación con IA");
  }
};

function buildSystemPrompt(maxItems) {
  return `Eres un corrector experto en redacción pedagógica para docentes mexicanos.
Analiza una planeación y propón mejoras concretas en ortografía, redacción y calidad del contenido didáctico.

Reglas obligatorias:
1) Responde SOLO JSON válido, sin markdown ni texto adicional.
2) Devuelve este esquema exacto:
{
  "sugerencias": [
    {
      "campo": "string",
      "categoria": "ortografia|redaccion|contenido",
      "original": "string",
      "mejorado": "string",
      "justificacion": "string"
    }
  ]
}
3) Genera máximo ${maxItems} sugerencias.
4) Cada sugerencia debe ser accionable y mantener intención pedagógica original.
5) No inventes datos críticos (fechas, grupos, asignaturas) si no hay error evidente.`;
}

function buildUserPrompt(planeacion, maxItems) {
  return `Analiza esta planeación y retorna hasta ${maxItems} sugerencias:\n${JSON.stringify(
    planeacion
  )}`;
}

function extractJson(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("No se pudo parsear JSON de la respuesta de IA");
    }
    return JSON.parse(match[0]);
  }
}

function normalizeSugerencias(input, planeacion, maxItems) {
  const validCategories = new Set(["ortografia", "redaccion", "contenido"]);
  const items = Array.isArray(input) ? input : [];

  const normalized = items
    .flatMap((item) => {
      const campo = String(item?.campo || "").trim();
      const original = toShortText(item?.original);
      const mejorado = toShortText(item?.mejorado);
      const categoria = String(item?.categoria || "").toLowerCase();
      const justificacion = toShortText(item?.justificacion);

      if (!campo || !original || !mejorado || original === mejorado) {
        return [];
      }

      return [
        {
          campo,
          categoria: validCategories.has(categoria) ? categoria : "redaccion",
          original,
          mejorado,
          justificacion: justificacion || "Mejora sugerida por IA",
        },
      ];
    })
    .slice(0, maxItems);

  if (normalized.length > 0) {
    return normalized;
  }

  return buildFallbackSuggestions(planeacion, maxItems);
}

function buildFallbackSuggestions(planeacion, maxItems) {
  const suggestions = [];

  const temaOriginal = toShortText(planeacion?.temaSesion);
  const temaMejorado = improveSentence(temaOriginal);
  if (temaOriginal && temaMejorado && temaOriginal !== temaMejorado) {
    suggestions.push({
      campo: "temaSesion",
      categoria: "redaccion",
      original: temaOriginal,
      mejorado: temaMejorado,
      justificacion: "Se ajusta la redacción para mayor claridad.",
    });
  }

  const evaluacionOriginal = toShortText(planeacion?.evaluacion);
  const evaluacionMejorada = improveSentence(evaluacionOriginal);
  if (evaluacionOriginal && evaluacionMejorada && evaluacionOriginal !== evaluacionMejorada) {
    suggestions.push({
      campo: "evaluacion",
      categoria: "ortografia",
      original: evaluacionOriginal,
      mejorado: evaluacionMejorada,
      justificacion: "Se corrigen detalles de ortografía y puntuación.",
    });
  }

  const actividades = Array.isArray(planeacion?.actividades) ? planeacion.actividades : [];
  for (let i = 0; i < actividades.length; i += 1) {
    if (suggestions.length >= maxItems) break;

    const descripcionOriginal = toShortText(actividades[i]?.descripcion);
    const descripcionMejorada = improveSentence(descripcionOriginal);

    if (descripcionOriginal && descripcionMejorada && descripcionOriginal !== descripcionMejorada) {
      suggestions.push({
        campo: `actividades[${i}].descripcion`,
        categoria: "contenido",
        original: descripcionOriginal,
        mejorado: descripcionMejorada,
        justificacion: "Se mejora precisión didáctica y legibilidad.",
      });
    }
  }

  return suggestions.slice(0, maxItems);
}

function improveSentence(value) {
  if (!value) return "";

  const singleSpaces = value.replace(/\s+/g, " ").trim();
  if (!singleSpaces) return "";

  const capitalized = singleSpaces.charAt(0).toUpperCase() + singleSpaces.slice(1);
  const withPeriod = /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;

  return withPeriod;
}

function toShortText(value) {
  if (value === undefined || value === null) return "";
  const text = String(value).trim();
  return text.slice(0, 800);
}

function normalizeMaxSugerencias(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return MAX_SUGERENCIAS_DEFAULT;
  return Math.max(1, Math.min(15, Math.floor(parsed)));
}
