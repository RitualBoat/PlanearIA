/**
 * Copiloto IA para PlaneacionDocumento V2.
 *
 * POST /api/planeaciones/copiloto
 * Body: {
 *   accion: "sugerir_actividades" | "autocompletar_seccion" | "generar_evaluacion" |
 *           "revisar_alineamiento" | "mejorar_texto",
 *   contexto: object,
 *   seleccion?: string,
 *   contenidoDocumento?: PlaneacionDocumento
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
  "sugerir_actividades",
  "autocompletar_seccion",
  "generar_evaluacion",
  "revisar_alineamiento",
  "mejorar_texto",
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
    const { accion, contexto = {}, seleccion = "", contenidoDocumento = null } = req.body || {};

    if (!ACCIONES_VALIDAS.has(accion)) {
      return errorResponse(
        res,
        400,
        "El campo 'accion' debe ser una accion soportada por el copiloto"
      );
    }

    if (!contenidoDocumento && typeof seleccion !== "string") {
      return errorResponse(res, 400, "Incluye 'contenidoDocumento' o 'seleccion' para dar contexto");
    }

    if (!hasConfiguredProviders()) {
      return successResponse(res, {
        provider: "heuristic",
        model: null,
        accion,
        resultado: buildFallbackResult(accion, contexto, seleccion, contenidoDocumento),
      });
    }

    try {
      const usage = assertAiUsageLimit(req, `copiloto_${accion}`);
      const systemPrompt = buildSystemPrompt(accion);
      const userPrompt = buildUserPrompt({ accion, contexto, seleccion, contenidoDocumento });
      const ai = await runChatCompletion({
        systemPrompt,
        userPrompt,
        temperature: 0.35,
        responseFormatJson: true,
        timeoutMs: OPENAI_TIMEOUT_MS,
      });
      const rawContent = ai.content;
      const parsed = extractJson(rawContent);
      const resultado = normalizeResult(accion, parsed?.resultado || parsed, contexto, seleccion, contenidoDocumento);

      return successResponse(res, {
        provider: ai.provider,
        model: ai.model,
        usage,
        accion,
        resultado,
      });
    } catch (aiError) {
      console.warn("Fallback heuristico en /api/planeaciones/copiloto:", aiError);
      if (aiError?.statusCode === 429) {
        return errorResponse(res, 429, aiError.message);
      }
      return successResponse(res, {
        provider: "heuristic_fallback",
        model: null,
        accion,
        resultado: buildFallbackResult(accion, contexto, seleccion, contenidoDocumento),
      });
    }
  } catch (error) {
    if (error?.name === "AbortError") {
      return errorResponse(res, 504, "La accion del copiloto excedio el tiempo limite");
    }

    console.error("Error en /api/planeaciones/copiloto:", error);
    return errorResponse(res, 500, error.message || "Error al ejecutar copiloto IA");
  }
};

function buildSystemPrompt(accion) {
  const schemas = {
    sugerir_actividades: `{
  "resultado": {
    "mensaje": "string",
    "actividades": {
      "inicio": "string",
      "desarrollo": "string",
      "cierre": "string",
      "tarea": "string"
    }
  }
}`,
    autocompletar_seccion: `{
  "resultado": {
    "mensaje": "string",
    "seccion": "string",
    "contenido": "string",
    "campos": [{"id":"string","valor":"string"}]
  }
}`,
    generar_evaluacion: `{
  "resultado": {
    "mensaje": "string",
    "evaluacion": {
      "tipo": "escala_valoracion|escala_estimativa|rubrica|lista_cotejo|otro",
      "escala": [{"etiqueta":"string","valor":10}],
      "criterios": [{"id":"string","descripcion":"string","mejora":"string"}]
    }
  }
}`,
    revisar_alineamiento: `{
  "resultado": {
    "mensaje": "string",
    "resumen": "string",
    "hallazgos": [
      {"tipo":"fortaleza|riesgo|sugerencia","prioridad":"alta|media|baja","descripcion":"string"}
    ]
  }
}`,
    mejorar_texto: `{
  "resultado": {
    "mensaje": "string",
    "textoMejorado": "string",
    "cambios": ["string"]
  }
}`,
  };

  return `Eres el copiloto pedagogico de PlanearIA para docentes mexicanos.
Trabajas sobre PlaneacionDocumento V2: informacion institucional, datos generales, elementos curriculares NEM, sesiones, evaluacion, observaciones y firmas.

Accion solicitada: ${accion}

Reglas obligatorias:
1) Responde unicamente JSON valido, sin markdown.
2) Usa exactamente este contrato:
${schemas[accion]}
3) Mantente alineado a NEM cuando el nivel sea primaria/secundaria.
4) No inventes datos institucionales, grupos o fechas si no existen.
5) La salida debe ser accionable, breve y lista para insertarse en el editor.`;
}

function buildUserPrompt(payload) {
  return `Contexto y documento:\n${JSON.stringify(payload).slice(0, 22000)}`;
}

function extractJson(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No se pudo parsear JSON de la respuesta de IA");
    return JSON.parse(match[0]);
  }
}

function normalizeResult(accion, input, contexto, seleccion, doc) {
  if (!input || typeof input !== "object") {
    return buildFallbackResult(accion, contexto, seleccion, doc);
  }

  if (accion === "sugerir_actividades") {
    return {
      mensaje: text(input.mensaje, "Actividades sugeridas listas para insertar."),
      actividades: {
        inicio: text(input.actividades?.inicio, "Recuperar conocimientos previos con una pregunta detonadora."),
        desarrollo: text(input.actividades?.desarrollo, "Resolver una actividad colaborativa guiada por el docente."),
        cierre: text(input.actividades?.cierre, "Socializar conclusiones y registrar aprendizajes clave."),
        tarea: text(input.actividades?.tarea, ""),
      },
    };
  }

  if (accion === "autocompletar_seccion") {
    return {
      mensaje: text(input.mensaje, "Seccion autocompletada."),
      seccion: text(input.seccion, contexto?.seccion || "curricular"),
      contenido: text(input.contenido, ""),
      campos: Array.isArray(input.campos) ? input.campos.slice(0, 12) : [],
    };
  }

  if (accion === "generar_evaluacion") {
    return {
      mensaje: text(input.mensaje, "Instrumento de evaluacion generado."),
      evaluacion: normalizeEvaluacion(input.evaluacion),
    };
  }

  if (accion === "revisar_alineamiento") {
    return {
      mensaje: text(input.mensaje, "Revision de alineamiento lista."),
      resumen: text(input.resumen, "La planeacion tiene una base coherente; revisa los hallazgos sugeridos."),
      hallazgos: normalizeHallazgos(input.hallazgos),
    };
  }

  return {
    mensaje: text(input.mensaje, "Texto mejorado."),
    textoMejorado: text(input.textoMejorado, improveText(seleccion)),
    cambios: Array.isArray(input.cambios) ? input.cambios.map(String).slice(0, 8) : ["Redaccion mas clara"],
  };
}

function buildFallbackResult(accion, contexto, seleccion, doc) {
  const asignatura = doc?.datosGenerales?.asignatura || contexto?.asignatura || "la asignatura";
  const grado = doc?.datosGenerales?.grado || contexto?.grado || "el grupo";
  const contenido = doc?.elementosCurriculares?.contenido || contexto?.contenido || "el contenido trabajado";

  if (accion === "sugerir_actividades") {
    return {
      mensaje: "Actividades sugeridas con reglas locales.",
      actividades: {
        inicio: `Iniciar con una pregunta detonadora sobre ${contenido} para activar conocimientos previos en ${grado}.`,
        desarrollo: `Organizar equipos para resolver un reto aplicado de ${asignatura}, registrando evidencias y dudas.`,
        cierre: "Cerrar con una puesta en comun, retroalimentacion breve y acuerdos para mejorar.",
        tarea: "Completar una evidencia breve que conecte lo aprendido con una situacion cotidiana.",
      },
    };
  }

  if (accion === "autocompletar_seccion") {
    return {
      mensaje: "Seccion completada con una sugerencia local.",
      seccion: contexto?.seccion || "curricular",
      contenido: `Propuesta: abordar ${contenido} mediante actividades progresivas, colaborativas y contextualizadas.`,
      campos: [],
    };
  }

  if (accion === "generar_evaluacion") {
    return {
      mensaje: "Rubrica generada con reglas locales.",
      evaluacion: normalizeEvaluacion({
        tipo: "rubrica",
        escala: [
          { etiqueta: "Excelente", valor: 10 },
          { etiqueta: "Bueno", valor: 8 },
          { etiqueta: "En proceso", valor: 6 },
        ],
        criterios: [
          { descripcion: "Comprende y explica el contenido central.", mejora: "Usar ejemplos concretos." },
          { descripcion: "Participa en actividades colaborativas.", mejora: "Escuchar y argumentar con respeto." },
          { descripcion: "Entrega evidencia clara y completa.", mejora: "Revisar indicaciones antes de entregar." },
        ],
      }),
    };
  }

  if (accion === "revisar_alineamiento") {
    return {
      mensaje: "Revision local generada.",
      resumen: "La revision encontro puntos a reforzar entre PDA, actividades y evaluacion.",
      hallazgos: [
        {
          tipo: "sugerencia",
          prioridad: "media",
          descripcion: "Verifica que cada actividad produzca evidencia relacionada con el PDA.",
        },
        {
          tipo: "riesgo",
          prioridad: "baja",
          descripcion: "Agrega criterios de evaluacion observables si la rubrica aun esta vacia.",
        },
      ],
    };
  }

  return {
    mensaje: "Texto mejorado con reglas locales.",
    textoMejorado: improveText(seleccion),
    cambios: ["Se ajusto capitalizacion, claridad y cierre de puntuacion."],
  };
}

function normalizeEvaluacion(value) {
  const tipos = new Set(["escala_valoracion", "escala_estimativa", "rubrica", "lista_cotejo", "otro"]);
  const tipo = tipos.has(value?.tipo) ? value.tipo : "rubrica";
  const escala = [];
  if (Array.isArray(value?.escala)) {
    for (const item of value.escala) {
      if (escala.length >= 6) break;
      const etiqueta = text(item?.etiqueta, "");
      if (!etiqueta) continue;
      escala.push({
        etiqueta,
        valor: Number.isFinite(Number(item?.valor)) ? Number(item.valor) : undefined,
      });
    }
  }
  const criterios = [];
  if (Array.isArray(value?.criterios)) {
    for (const [index, item] of value.criterios.entries()) {
      if (criterios.length >= 10) break;
      const descripcion = text(item?.descripcion, "");
      if (!descripcion) continue;
      criterios.push({
        id: text(item?.id, `crit_${Date.now()}_${index}`),
        descripcion,
        mejora: text(item?.mejora, ""),
      });
    }
  }

  return {
    tipo,
    escala,
    criterios: criterios.length ? criterios : [{ id: `crit_${Date.now()}`, descripcion: "Criterio por completar" }],
  };
}

function normalizeHallazgos(value) {
  const validTypes = new Set(["fortaleza", "riesgo", "sugerencia"]);
  const validPriority = new Set(["alta", "media", "baja"]);
  const items = Array.isArray(value) ? value : [];
  const hallazgos = [];

  for (const item of items) {
    if (hallazgos.length >= 8) break;
    const descripcion = text(item?.descripcion, "");
    if (!descripcion) continue;
    hallazgos.push({
      tipo: validTypes.has(item?.tipo) ? item.tipo : "sugerencia",
      prioridad: validPriority.has(item?.prioridad) ? item.prioridad : "media",
      descripcion,
    });
  }

  return hallazgos;
}

function text(value, fallback) {
  const next = String(value || "").trim();
  return next || fallback;
}

function improveText(value) {
  const selected = String(value || "").replace(/\s+/g, " ").trim();
  if (!selected) return "Redacta este apartado con una idea clara, observable y alineada al proposito de aprendizaje.";
  const capitalized = selected.charAt(0).toUpperCase() + selected.slice(1);
  return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;
}
