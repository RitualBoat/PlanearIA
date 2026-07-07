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
  getUserFromToken,
  handleCors,
  applyCors,
  errorResponse,
  successResponse,
} = require("../../lib/auth");
const { hasConfiguredProviders, runChatCompletion } = require("../../lib/aiGateway");
const { assertAiUsageLimit } = require("../../lib/aiUsageLimiter");

const OPENAI_TIMEOUT_MS = parseInt(process.env.OPENAI_TIMEOUT_MS || "20000", 10);

const NIVELES_VALIDOS = ["primaria", "secundaria", "preparatoria", "universidad"];

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
    const { prompt, nivelAcademico, contexto = {}, version } = req.body || {};

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

    if (!hasConfiguredProviders()) {
      return errorResponse(res, 500, "No hay proveedores IA configurados en el gateway");
    }

    const targetVersion = Number(version) === 2 ? 2 : 1;
    const tokenUser = getUserFromToken(req);
    const userId = String(tokenUser?.userId || tokenUser?.id || contexto.userId || "server");

    const systemPrompt =
      targetVersion === 2
        ? buildSystemPromptV2(nivelAcademico, contexto)
        : buildSystemPrompt(nivelAcademico, contexto);
    const usage = assertAiUsageLimit(
      req,
      targetVersion === 2 ? "generar_planeacion_v2" : "generar_planeacion"
    );
    const ai = await runChatCompletion({
      systemPrompt,
      userPrompt: prompt,
      temperature: 0.4,
      responseFormatJson: true,
      timeoutMs: OPENAI_TIMEOUT_MS,
    });
    const rawContent = ai.content;
    const generated = extractJson(rawContent);
    const planeacion =
      targetVersion === 2
        ? mapToPlaneacionV2(generated?.planeacion || generated, nivelAcademico, contexto, userId)
        : mapToPlaneacion(generated, nivelAcademico, contexto);

    return successResponse(res, {
      provider: ai.provider,
      model: ai.model,
      usage,
      version: targetVersion,
      planeacion,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      return errorResponse(res, 504, "La generación con IA excedió el tiempo límite");
    }

    if (error?.statusCode === 429) {
      return errorResponse(res, 429, error.message);
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

function buildSystemPromptV2(nivelAcademico, contexto) {
  const nivelTexto = {
    primaria: "Primaria",
    secundaria: "Secundaria",
    preparatoria: "Preparatoria",
    universidad: "Universidad",
  };

  return `Eres un asistente experto en planeaciones didacticas mexicanas y NEM.
Genera una PlaneacionDocumento V2 completa para nivel ${nivelTexto[nivelAcademico]}.

Reglas obligatorias:
1) Responde UNICAMENTE JSON valido, sin markdown ni texto extra.
2) Devuelve este esquema:
{
  "planeacion": {
    "infoInstitucional": {
      "institucion": "string",
      "subsistema": "string",
      "cicloEscolar": "string",
      "lugar": "string"
    },
    "datosGenerales": {
      "maestro": "string",
      "asignatura": "string",
      "fechaInicio": "YYYY-MM-DD",
      "fechaFin": "YYYY-MM-DD",
      "semanas": [number],
      "trimestre": number,
      "grado": "string",
      "grupos": ["string"]
    },
    "elementosCurriculares": {
      "proposito": "string",
      "producto": "string",
      "contenido": "string",
      "pda": "string",
      "campoFormativo": "string",
      "ejeArticulador": "string",
      "rasgosPerfilEgreso": ["string"],
      "instrumentoEvaluacion": "string"
    },
    "sesiones": [
      {
        "numero": number,
        "tipo": "regular|suspension|proyecto_lectura|evaluacion",
        "inicio": "string",
        "desarrollo": "string",
        "cierre": "string",
        "tarea": "string"
      }
    ],
    "evaluacionInicial": {
      "tipo": "escala_valoracion|escala_estimativa|rubrica|lista_cotejo|otro",
      "escala": [{"etiqueta":"string","valor":10}],
      "criterios": [{"descripcion":"string","mejora":"string"}]
    },
    "evaluacionFinal": {
      "tipo": "escala_valoracion|escala_estimativa|rubrica|lista_cotejo|otro",
      "escala": [{"etiqueta":"string","valor":10}],
      "criterios": [{"descripcion":"string","mejora":"string"}]
    },
    "observaciones": [{"texto":"string","categoria":"flexibilidad|usaer|proyecto|general"}],
    "firmas": [{"rol":"string","nombre":"string"}],
    "camposNivel": {}
  }
}
3) Genera entre 3 y 10 sesiones segun el prompt y contexto. Cada sesion debe incluir inicio, desarrollo, cierre y tarea.
4) Usa evaluacion estructurada con criterios observables.
5) Si falta informacion, deja strings vacios o valores razonables sin inventar datos criticos.
6) Respeta este contexto cuando exista: ${JSON.stringify(contexto)}.`;
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

function mapToPlaneacionV2(generated, nivelAcademico, contexto, userId) {
  const now = new Date();
  const nowIso = now.toISOString();
  const today = nowIso.slice(0, 10);
  const datos = generated?.datosGenerales || {};
  const curricular = generated?.elementosCurriculares || {};
  const info = generated?.infoInstitucional || {};
  const maestro = fallback(datos.maestro, contexto.maestro, contexto.docente, "");

  const sesiones = normalizeSesionesV2(generated?.sesiones);

  return {
    id: `ia_v2_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    version: 2,
    userId,
    nivelAcademico,
    infoInstitucional: {
      institucion: fallback(info.institucion, contexto.institucion, ""),
      subsistema: fallback(info.subsistema, contexto.subsistema, ""),
      cicloEscolar: fallback(info.cicloEscolar, contexto.cicloEscolar, ""),
      lugar: fallback(info.lugar, contexto.lugar, ""),
    },
    datosGenerales: {
      maestro,
      asignatura: fallback(datos.asignatura, contexto.asignatura, "Asignatura por definir"),
      fechaInicio: normalizeFechaDateOnly(fallback(datos.fechaInicio, contexto.fechaInicio, contexto.fecha, today)),
      fechaFin: normalizeFechaDateOnly(fallback(datos.fechaFin, contexto.fechaFin, contexto.fecha, today)),
      semanas: toNumberArray(datos.semanas),
      trimestre: Number.isFinite(Number(datos.trimestre)) ? Number(datos.trimestre) : undefined,
      grado: fallback(datos.grado, contexto.grado, "Grado por definir"),
      grupos: toArray(datos.grupos || contexto.grupos || contexto.grupo),
    },
    elementosCurriculares: {
      proposito: fallback(curricular.proposito, generated?.proposito, ""),
      producto: fallback(curricular.producto, generated?.producto, ""),
      contenido: fallback(curricular.contenido, generated?.contenido, generated?.unidadTematica, ""),
      pda: fallback(curricular.pda, generated?.pda, generated?.temaSesion, ""),
      campoFormativo: fallback(curricular.campoFormativo, generated?.campoFormativo, ""),
      ejeArticulador: fallback(curricular.ejeArticulador, generated?.ejeArticulador, ""),
      rasgosPerfilEgreso: toArray(curricular.rasgosPerfilEgreso),
      instrumentoEvaluacion: fallback(curricular.instrumentoEvaluacion, generated?.evaluacion, ""),
    },
    sesiones,
    evaluacionInicial: generated?.evaluacionInicial
      ? normalizeEvaluacionV2(generated.evaluacionInicial)
      : undefined,
    evaluacionFinal: normalizeEvaluacionV2(generated?.evaluacionFinal || generated?.evaluacion),
    observaciones: normalizeObservacionesV2(generated?.observaciones),
    firmas: normalizeFirmasV2(generated?.firmas, maestro),
    contenidoRaw: "",
    camposNivel: typeof generated?.camposNivel === "object" && !Array.isArray(generated.camposNivel)
      ? generated.camposNivel
      : {},
    fechaCreacion: nowIso,
    fechaModificacion: nowIso,
  };
}

function normalizeSesionesV2(value) {
  const input = Array.isArray(value) ? value : [];
  const tipos = new Set(["regular", "suspension", "proyecto_lectura", "evaluacion"]);
  const normalized = input
    .map((item, index) => {
      const tipo = tipos.has(item?.tipo) ? item.tipo : "regular";
      return {
        id: `sesion_${Date.now()}_${index + 1}`,
        numero: Number(item?.numero) || index + 1,
        tipo,
        motivo: fallback(item?.motivo, ""),
        inicio: toRichTextString(fallback(item?.inicio, "")),
        desarrollo: toRichTextString(fallback(item?.desarrollo, "")),
        cierre: toRichTextString(fallback(item?.cierre, "")),
        tarea: toRichTextString(fallback(item?.tarea, "")),
      };
    })
    .slice(0, 12);

  if (normalized.length > 0) return normalized;

  return [
    {
      id: `sesion_${Date.now()}_1`,
      numero: 1,
      tipo: "regular",
      inicio: toRichTextString("Activacion de conocimientos previos."),
      desarrollo: toRichTextString("Desarrollo del tema con actividades guiadas."),
      cierre: toRichTextString("Cierre y retroalimentacion."),
      tarea: toRichTextString(""),
    },
  ];
}

function normalizeEvaluacionV2(value) {
  if (typeof value === "string") {
    return {
      tipo: "otro",
      escala: [],
      criterios: [{ id: `crit_${Date.now()}`, descripcion: value }],
    };
  }

  const tipos = new Set(["escala_valoracion", "escala_estimativa", "rubrica", "lista_cotejo", "otro"]);
  const tipo = tipos.has(value?.tipo) ? value.tipo : "rubrica";
  const escala = Array.isArray(value?.escala)
    ? value.escala
        .map((item) => ({
          etiqueta: fallback(item?.etiqueta, ""),
          valor: Number.isFinite(Number(item?.valor)) ? Number(item.valor) : undefined,
        }))
        .filter((item) => item.etiqueta)
        .slice(0, 6)
    : [];
  const criterios = Array.isArray(value?.criterios)
    ? value.criterios
        .map((item, index) => ({
          id: `crit_${Date.now()}_${index}`,
          descripcion: fallback(item?.descripcion, ""),
          mejora: fallback(item?.mejora, ""),
        }))
        .filter((item) => item.descripcion)
        .slice(0, 10)
    : [];

  return {
    tipo,
    escala,
    criterios: criterios.length
      ? criterios
      : [{ id: `crit_${Date.now()}`, descripcion: "Criterio de evaluacion por completar" }],
  };
}

function normalizeObservacionesV2(value) {
  const input = Array.isArray(value) ? value : [];
  const categorias = new Set(["flexibilidad", "usaer", "proyecto", "general"]);
  const normalized = input
    .map((item) => ({
      texto: fallback(item?.texto, typeof item === "string" ? item : ""),
      categoria: categorias.has(item?.categoria) ? item.categoria : "general",
    }))
    .filter((item) => item.texto)
    .slice(0, 12);
  return normalized.length ? normalized : [{ texto: "", categoria: "general" }];
}

function normalizeFirmasV2(value, maestro) {
  const input = Array.isArray(value) ? value : [];
  const normalized = input
    .map((item) => ({
      rol: fallback(item?.rol, "Docente"),
      nombre: fallback(item?.nombre, ""),
    }))
    .slice(0, 8);
  return normalized.length ? normalized : [{ rol: "Docente", nombre: maestro || "" }];
}

function toRichTextString(plainText = "") {
  return JSON.stringify({
    type: "doc",
    content: plainText
      ? [{ type: "paragraph", content: [{ type: "text", text: plainText }] }]
      : [{ type: "paragraph" }],
  });
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
    return value.flatMap((item) => {
      const text = String(item).trim();
      return text ? [text] : [];
    });
  }
  if (typeof value === "string") {
    return value
      .split("\n")
      .flatMap((item) => {
        const text = item.trim();
        return text ? [text] : [];
      });
  }
  return [];
}

function toNumberArray(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => Number(item)).filter((item) => Number.isFinite(item));
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

function normalizeFechaDateOnly(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }
  return parsed.toISOString().slice(0, 10);
}

function normalizeModalidad(value) {
  const modalidad = String(value || "presencial").toLowerCase();
  if (["presencial", "hibrida", "virtual"].includes(modalidad)) {
    return modalidad;
  }
  return "presencial";
}
