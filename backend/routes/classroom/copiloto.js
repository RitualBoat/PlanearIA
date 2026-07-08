/**
 * Copiloto IA para Classroom.
 *
 * POST /api/classroom/copiloto
 * Body: {
 *   accion: "sugerir_actividad" | "generar_rubrica" |
 *           "resumir_progreso" | "sugerir_retroalimentacion",
 *   contexto: object
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

const OPENAI_TIMEOUT_MS = parseInt(process.env.OPENAI_TIMEOUT_MS || "25000", 10);

const ACCIONES_VALIDAS = new Set([
  "sugerir_actividad",
  "generar_rubrica",
  "resumir_progreso",
  "sugerir_retroalimentacion",
]);

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
    const { accion, contexto = {} } = req.body || {};

    if (!ACCIONES_VALIDAS.has(accion)) {
      return errorResponse(res, 400, "El campo 'accion' debe ser una accion IA Classroom soportada");
    }

    if (!contexto || typeof contexto !== "object") {
      return errorResponse(res, 400, "Incluye 'contexto' como objeto");
    }

    if (!hasConfiguredProviders()) {
      return successResponse(res, {
        provider: "heuristic",
        model: null,
        accion,
        resultado: buildFallbackResult(accion, contexto),
      });
    }

    try {
      const usage = assertAiUsageLimit(req, `classroom_${accion}`);
      const ai = await runChatCompletion({
        systemPrompt: buildSystemPrompt(accion),
        userPrompt: buildUserPrompt({ accion, contexto }),
        temperature: 0.35,
        maxTokens: 1300,
        responseFormatJson: true,
        timeoutMs: OPENAI_TIMEOUT_MS,
      });
      const parsed = extractJson(ai.content);
      const resultado = normalizeResult(accion, parsed?.resultado || parsed, contexto);

      return successResponse(res, {
        provider: ai.provider,
        model: ai.model,
        usage,
        accion,
        resultado,
      });
    } catch (aiError) {
      console.warn("Fallback heuristico en /api/classroom/copiloto:", aiError);
      if (aiError?.statusCode === 429) {
        return errorResponse(res, 429, aiError.message);
      }

      return successResponse(res, {
        provider: "heuristic_fallback",
        model: null,
        accion,
        resultado: buildFallbackResult(accion, contexto),
      });
    }
  } catch (error) {
    if (error?.name === "AbortError") {
      return errorResponse(res, 504, "La accion IA de Classroom excedio el tiempo limite");
    }

    console.error("Error en /api/classroom/copiloto:", error);
    return errorResponse(res, 500, error.message || "Error al ejecutar IA Classroom");
  }
};

function buildSystemPrompt(accion) {
  const schemas = {
    sugerir_actividad: `{
  "resultado": {
    "mensaje": "string",
    "actividad": {
      "titulo": "string",
      "descripcion": "string",
      "tipo": "tarea|examen|proyecto|investigacion",
      "instrucciones": "string",
      "criterios": ["string"]
    }
  }
}`,
    generar_rubrica: `{
  "resultado": {
    "mensaje": "string",
    "rubrica": {
      "titulo": "string",
      "criterios": [
        {"criterio":"string","excelente":"string","satisfactorio":"string","enProceso":"string"}
      ]
    }
  }
}`,
    resumir_progreso: `{
  "resultado": {
    "mensaje": "string",
    "resumen": "string",
    "hallazgos": [
      {"tipo":"fortaleza|riesgo|sugerencia","prioridad":"alta|media|baja","descripcion":"string"}
    ]
  }
}`,
    sugerir_retroalimentacion: `{
  "resultado": {
    "mensaje": "string",
    "retroalimentacion": "string",
    "siguientesPasos": ["string"]
  }
}`,
  };

  return `Eres el copiloto pedagogico de PlanearIA para Classroom.
Ayudas a docentes a planear actividades, rubricas, seguimiento y retroalimentacion.

Accion solicitada: ${accion}

Reglas obligatorias:
1) Responde unicamente JSON valido, sin markdown.
2) Usa exactamente este contrato:
${schemas[accion]}
3) No califiques automaticamente ni sustituyas el criterio docente.
4) No inventes datos personales ni informacion que no este en el contexto.
5) Prioriza sugerencias accionables, breves, inclusivas y de bajo costo.
6) El docente debe revisar todo antes de guardar o compartir.`;
}

function buildUserPrompt(payload) {
  return `Contexto Classroom:\n${JSON.stringify(payload).slice(0, 22000)}`;
}

function extractJson(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No se pudo parsear JSON de la respuesta de IA Classroom");
    return JSON.parse(match[0]);
  }
}

function normalizeResult(accion, input, contexto) {
  if (!input || typeof input !== "object") {
    return buildFallbackResult(accion, contexto);
  }

  if (accion === "sugerir_actividad") {
    return {
      mensaje: text(input.mensaje, "Actividad sugerida lista para revisar."),
      actividad: normalizeActividad(input.actividad),
    };
  }

  if (accion === "generar_rubrica") {
    return {
      mensaje: text(input.mensaje, "Rubrica sugerida lista para revisar."),
      rubrica: normalizeRubrica(input.rubrica),
    };
  }

  if (accion === "resumir_progreso") {
    return {
      mensaje: text(input.mensaje, "Resumen de progreso generado."),
      resumen: text(input.resumen, "El grupo tiene informacion suficiente para revisar asistencia, entregas y calificaciones."),
      hallazgos: normalizeHallazgos(input.hallazgos),
    };
  }

  return {
    mensaje: text(input.mensaje, "Retroalimentacion sugerida."),
    retroalimentacion: text(input.retroalimentacion, fallbackFeedback(contexto)),
    siguientesPasos: normalizeStringList(input.siguientesPasos, [
      "Revisar la evidencia con el alumno.",
      "Acordar una mejora concreta para la siguiente entrega.",
    ]),
  };
}

function buildFallbackResult(accion, contexto) {
  if (accion === "sugerir_actividad") {
    return {
      mensaje: "Actividad sugerida con reglas locales.",
      actividad: normalizeActividad({
        titulo: `Actividad aplicada: ${contexto?.grupo?.materia || "tema de clase"}`,
        descripcion: "Actividad breve para convertir el contenido actual en evidencia revisable.",
        tipo: "tarea",
        instrucciones:
          "Presenta un problema o situacion del contexto del grupo, resuelvelo en equipos y entrega una evidencia individual breve.",
        criterios: [
          "Comprende el contenido central.",
          "Entrega evidencia clara y completa.",
          "Explica su procedimiento o decisiones.",
        ],
      }),
    };
  }

  if (accion === "generar_rubrica") {
    return {
      mensaje: "Rubrica generada con reglas locales.",
      rubrica: normalizeRubrica({
        titulo: "Rubrica base para actividad de clase",
        criterios: [
          {
            criterio: "Comprension del contenido",
            excelente: "Explica y aplica el contenido con ejemplos claros.",
            satisfactorio: "Explica la idea principal con apoyo minimo.",
            enProceso: "Requiere guia para identificar la idea central.",
          },
          {
            criterio: "Evidencia entregada",
            excelente: "Entrega completa, ordenada y alineada a instrucciones.",
            satisfactorio: "Entrega suficiente con detalles menores por mejorar.",
            enProceso: "Entrega incompleta o poco conectada con la consigna.",
          },
          {
            criterio: "Participacion",
            excelente: "Colabora, argumenta y escucha activamente.",
            satisfactorio: "Participa cuando se le solicita.",
            enProceso: "Requiere apoyo para integrarse al trabajo.",
          },
        ],
      }),
    };
  }

  if (accion === "resumir_progreso") {
    const alumnos = Number(contexto?.resumen?.totalAlumnos || 0);
    const actividades = Number(contexto?.resumen?.totalActividades || 0);
    const asistencia = Number(contexto?.resumen?.porcentajeAsistencia || 0);

    return {
      mensaje: "Resumen local generado.",
      resumen: `El grupo tiene ${alumnos} alumnos, ${actividades} actividades y asistencia aproximada de ${asistencia}%.`,
      hallazgos: normalizeHallazgos([
        {
          tipo: asistencia < 80 ? "riesgo" : "fortaleza",
          prioridad: asistencia < 80 ? "alta" : "media",
          descripcion:
            asistencia < 80
              ? "La asistencia esta por debajo de 80%; conviene revisar ausencias recurrentes."
              : "La asistencia general parece estable con los datos disponibles.",
        },
        {
          tipo: "sugerencia",
          prioridad: "media",
          descripcion: "Revisa actividades pendientes antes de capturar calificaciones finales.",
        },
      ]),
    };
  }

  return {
    mensaje: "Retroalimentacion sugerida con reglas locales.",
    retroalimentacion: fallbackFeedback(contexto),
    siguientesPasos: [
      "Pedir al alumno que corrija una evidencia concreta.",
      "Revisar nuevamente con un criterio observable.",
    ],
  };
}

function normalizeActividad(value) {
  const tipos = new Set(["tarea", "examen", "proyecto", "investigacion"]);
  return {
    titulo: text(value?.titulo, "Actividad de clase"),
    descripcion: text(value?.descripcion, "Actividad sugerida para revisar antes de guardar."),
    tipo: tipos.has(value?.tipo) ? value.tipo : "tarea",
    instrucciones: text(value?.instrucciones, "Revisa la consigna y adapta instrucciones al grupo."),
    criterios: normalizeStringList(value?.criterios, ["Entrega completa", "Comprension del contenido"]),
  };
}

function normalizeRubrica(value) {
  const criterios = Array.isArray(value?.criterios) ? value.criterios : [];
  return {
    titulo: text(value?.titulo, "Rubrica sugerida"),
    criterios: criterios
      .reduce((acc, item) => {
        const criterio = text(item?.criterio, "");
        if (!criterio) return acc;
        acc.push({
          criterio,
          excelente: text(item?.excelente, ""),
          satisfactorio: text(item?.satisfactorio, ""),
          enProceso: text(item?.enProceso, ""),
        });
        return acc;
      }, [])
      .slice(0, 6),
  };
}

function normalizeHallazgos(value) {
  const validTypes = new Set(["fortaleza", "riesgo", "sugerencia"]);
  const validPriority = new Set(["alta", "media", "baja"]);
  const items = Array.isArray(value) ? value : [];

  return items
    .reduce((acc, item) => {
      const descripcion = text(item?.descripcion, "");
      if (!descripcion) return acc;
      acc.push({
        tipo: validTypes.has(item?.tipo) ? item.tipo : "sugerencia",
        prioridad: validPriority.has(item?.prioridad) ? item.prioridad : "media",
        descripcion,
      });
      return acc;
    }, [])
    .slice(0, 8);
}

function normalizeStringList(value, fallback) {
  const items = Array.isArray(value)
    ? value.flatMap((item) => {
        const itemText = text(item, "");
        return itemText ? [itemText] : [];
      })
    : [];
  return items.length ? items.slice(0, 8) : fallback;
}

function fallbackFeedback(contexto) {
  const alumno = contexto?.alumno?.nombre || "el alumno";
  const tarea = contexto?.actividad?.titulo || "la actividad";
  return `${alumno}, revisa ${tarea}: identifica una fortaleza de tu entrega y mejora un punto concreto antes de la siguiente revision.`;
}

function text(value, fallback) {
  const next = String(value || "").trim();
  return next || fallback;
}
