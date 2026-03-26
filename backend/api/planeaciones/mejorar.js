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

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const OPENAI_TIMEOUT_MS = parseInt(process.env.OPENAI_TIMEOUT_MS || "20000", 10);
const MAX_SUGERENCIAS_DEFAULT = 8;

module.exports = async (req, res) => {
  applyCors(res);

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

    if (!OPENAI_API_KEY) {
      return errorResponse(res, 500, "OPENAI_API_KEY no está configurada en variables de entorno");
    }

    const systemPrompt = buildSystemPrompt(maxItems);
    const userPrompt = buildUserPrompt(planeacion, maxItems);

    const rawContent = await improveWithOpenAI(systemPrompt, userPrompt);
    const parsed = extractJson(rawContent);
    const sugerencias = normalizeSugerencias(parsed?.sugerencias, planeacion, maxItems);

    return successResponse(res, {
      provider: "openai",
      model: OPENAI_MODEL,
      sugerencias,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      return errorResponse(res, 504, "La mejora con IA excedió el tiempo límite");
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

async function improveWithOpenAI(systemPrompt, userPrompt) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
      signal: controller.signal,
    });

    const data = await response.json();

    if (!response.ok) {
      const msg = data?.error?.message || `Error OpenAI (${response.status})`;
      throw new Error(msg);
    }

    const content = data?.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      throw new Error("La IA no devolvió contenido utilizable");
    }

    return content;
  } finally {
    clearTimeout(timeoutId);
  }
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
    .map((item) => {
      const campo = String(item?.campo || "").trim();
      const original = toShortText(item?.original);
      const mejorado = toShortText(item?.mejorado);
      const categoria = String(item?.categoria || "").toLowerCase();
      const justificacion = toShortText(item?.justificacion);

      if (!campo || !original || !mejorado || original === mejorado) {
        return null;
      }

      return {
        campo,
        categoria: validCategories.has(categoria) ? categoria : "redaccion",
        original,
        mejorado,
        justificacion: justificacion || "Mejora sugerida por IA",
      };
    })
    .filter(Boolean)
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
