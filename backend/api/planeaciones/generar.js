/**
 * API de generación de planeaciones con IA
 *
 * POST /api/planeaciones/generar
 * Body: {
 *   prompt: string,
 *   nivelAcademico: "primaria" | "secundaria" | "preparatoria" | "universidad",
 *   contexto?: {
 *     asignatura?: string,
 *     grado?: string,
 *     grupo?: string,
 *     fecha?: string,
 *     horaInicio?: string
 *   }
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

const NIVELES_VALIDOS = ["primaria", "secundaria", "preparatoria", "universidad"];

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
    const { prompt, nivelAcademico, contexto = {} } = req.body || {};

    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 10) {
      return errorResponse(
        res,
        400,
        "El campo 'prompt' es requerido y debe tener al menos 10 caracteres"
      );
    }

    if (!nivelAcademico || !NIVELES_VALIDOS.includes(nivelAcademico)) {
      return errorResponse(
        res,
        400,
        "El campo 'nivelAcademico' es requerido y debe ser: primaria, secundaria, preparatoria o universidad"
      );
    }

    if (!OPENAI_API_KEY) {
      return errorResponse(res, 500, "OPENAI_API_KEY no está configurada en variables de entorno");
    }

    const systemPrompt = buildSystemPrompt(nivelAcademico, contexto);
    const rawContent = await generateWithOpenAI(systemPrompt, prompt);
    const generated = extractJson(rawContent);
    const planeacion = mapToPlaneacion(generated, nivelAcademico, contexto);

    return successResponse(res, {
      provider: "openai",
      model: OPENAI_MODEL,
      planeacion,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      return errorResponse(res, 504, "La generación con IA excedió el tiempo límite");
    }

    console.error("❌ Error en /api/planeaciones/generar:", error);
    return errorResponse(res, 500, error.message || "Error al generar planeación con IA");
  }
};

function buildSystemPrompt(nivelAcademico, contexto) {
  const nivelTexto = {
    primaria: "Primaria",
    secundaria: "Secundaria",
    preparatoria: "Preparatoria",
    universidad: "Universidad",
  };

  return `Eres un asistente experto en diseño instruccional para docentes mexicanos.
Genera una planeación didáctica para nivel ${nivelTexto[nivelAcademico]}.

Reglas obligatorias:
1) Responde ÚNICAMENTE JSON válido (sin markdown, sin texto extra).
2) Usa este esquema exacto:
{
  "asignatura": "string",
  "grado": "string",
  "grupo": "string",
  "fecha": "YYYY-MM-DD",
  "horaInicio": "HH:mm",
  "duracionTotal": number,
  "unidadTematica": "string",
  "temaSesion": "string",
  "aprendizajesEsperados": ["string"],
  "actividades": [
    {"tipo":"inicio","descripcion":"string","duracion":number},
    {"tipo":"desarrollo","descripcion":"string","duracion":number},
    {"tipo":"cierre","descripcion":"string","duracion":number}
  ],
  "recursos": ["string"],
  "evaluacion": "string",
  "evidencias": ["string"],
  "observaciones": "string",
  "campoFormativo": "string (solo primaria)",
  "competenciasDisciplinares": ["string"],
  "competenciasGenericas": ["string"],
  "competenciasProfesionales": ["string"],
  "objetivosAprendizaje": ["string"],
  "bibliografia": ["string"],
  "modalidad": "presencial|hibrida|virtual"
}
3) Incluye SIEMPRE las 3 actividades requeridas (inicio/desarrollo/cierre).
4) Si falta información, infiere valores razonables para México.
5) Respeta este contexto cuando exista: ${JSON.stringify(contexto)}.`;
}

async function generateWithOpenAI(systemPrompt, userPrompt) {
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
        temperature: 0.4,
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

function mapToPlaneacion(generated, nivelAcademico, contexto) {
  const now = new Date();
  const nowIso = now.toISOString();
  const defaultFecha = nowIso;

  const aprendizajesEsperados = toArray(generated.aprendizajesEsperados);
  const recursos = toArray(generated.recursos);
  const evidencias = toArray(generated.evidencias);

  const actividades = normalizeActividades(generated.actividades);
  const duracionTotal =
    Number(generated.duracionTotal) || actividades.reduce((sum, a) => sum + a.duracion, 0) || 50;

  const base = {
    id: `ia_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    nivelAcademico,
    asignatura: fallback(generated.asignatura, contexto.asignatura, "Asignatura por definir"),
    grado: fallback(generated.grado, contexto.grado, "Grado por definir"),
    grupo: fallback(generated.grupo, contexto.grupo, ""),
    fecha: normalizeFechaIso(fallback(generated.fecha, contexto.fecha, defaultFecha)),
    horaInicio: fallback(generated.horaInicio, contexto.horaInicio, "08:00"),
    duracionTotal,
    unidadTematica: fallback(generated.unidadTematica, "Unidad temática generada por IA"),
    temaSesion: fallback(generated.temaSesion, "Sesión generada por IA"),
    aprendizajesEsperados,
    actividades,
    recursos,
    evaluacion: fallback(generated.evaluacion, "Evaluación formativa"),
    evidencias,
    observaciones: fallback(generated.observaciones, ""),
    fechaCreacion: nowIso,
    fechaModificacion: nowIso,
  };

  if (nivelAcademico === "primaria") {
    return {
      ...base,
      campoFormativo: fallback(generated.campoFormativo, "Lenguaje y Comunicación"),
    };
  }

  if (nivelAcademico === "secundaria") {
    return {
      ...base,
      competenciasDisciplinares: toArray(generated.competenciasDisciplinares),
    };
  }

  if (nivelAcademico === "preparatoria") {
    return {
      ...base,
      competenciasGenericas: toArray(generated.competenciasGenericas),
      competenciasDisciplinares: toArray(generated.competenciasDisciplinares),
      bibliografia: toArray(generated.bibliografia),
    };
  }

  return {
    ...base,
    competenciasProfesionales: toArray(generated.competenciasProfesionales),
    objetivosAprendizaje: toArray(generated.objetivosAprendizaje),
    bibliografia: toArray(generated.bibliografia),
    modalidad: normalizeModalidad(generated.modalidad),
  };
}

function fallback(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function toArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeActividades(value) {
  const defaults = {
    inicio: { tipo: "inicio", descripcion: "Activación de conocimientos previos", duracion: 10 },
    desarrollo: { tipo: "desarrollo", descripcion: "Desarrollo del tema", duracion: 30 },
    cierre: { tipo: "cierre", descripcion: "Cierre y retroalimentación", duracion: 10 },
  };

  const input = Array.isArray(value) ? value : [];
  const byTipo = {
    inicio: defaults.inicio,
    desarrollo: defaults.desarrollo,
    cierre: defaults.cierre,
  };

  for (const item of input) {
    const tipo = item?.tipo;
    if (!byTipo[tipo]) continue;
    byTipo[tipo] = {
      tipo,
      descripcion: fallback(item.descripcion, byTipo[tipo].descripcion),
      duracion: Number(item.duracion) || byTipo[tipo].duracion,
    };
  }

  return [byTipo.inicio, byTipo.desarrollo, byTipo.cierre];
}

function normalizeFechaIso(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }
  return parsed.toISOString();
}

function normalizeModalidad(value) {
  const modalidad = String(value || "presencial").toLowerCase();
  if (["presencial", "hibrida", "virtual"].includes(modalidad)) {
    return modalidad;
  }
  return "presencial";
}
