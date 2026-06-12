/**
 * Escanea una planeacion PDF/DOCX ya convertida a texto y extrae su estructura
 * como PlantillaDocumento V2.
 *
 * POST /api/planeaciones/escanear-plantilla
 * Body: {
 *   textoRaw: string,
 *   nivelAcademico?: "primaria" | "secundaria" | "preparatoria" | "universidad"
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

const OPENAI_TIMEOUT_MS = parseInt(process.env.OPENAI_TIMEOUT_MS || "25000", 10);
const MAX_TEXT_CHARS = 18000;

const NIVELES_VALIDOS = ["primaria", "secundaria", "preparatoria", "universidad"];
const SECCIONES_VALIDAS = new Set([
  "info_institucional",
  "datos_generales",
  "curricular",
  "sesiones",
  "evaluacion",
  "observaciones",
  "firmas",
  "custom",
]);
const CAMPOS_VALIDOS = new Set([
  "text",
  "richtext",
  "number",
  "date",
  "select",
  "multiselect",
  "table",
  "checkbox_list",
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
    const { textoRaw, nivelAcademico } = req.body || {};
    const text = String(textoRaw || "").trim();

    if (text.length < 30) {
      return errorResponse(
        res,
        400,
        "El campo 'textoRaw' es requerido y debe tener al menos 30 caracteres"
      );
    }

    const nivel = normalizeNivel(nivelAcademico) || inferNivel(text);
    const tokenUser = getUserFromToken(req);
    const userId = String(tokenUser?.userId || tokenUser?.id || "server");

    if (!hasConfiguredProviders()) {
      const plantilla = buildFallbackPlantilla(text, nivel, userId);
      return successResponse(res, {
        provider: "heuristic",
        model: null,
        plantilla,
      });
    }

    try {
      const usage = assertAiUsageLimit(req, "escanear_plantilla");
      const systemPrompt = buildSystemPrompt(nivel);
      const userPrompt = buildUserPrompt(text);
      const ai = await runChatCompletion({
        systemPrompt,
        userPrompt,
        temperature: 0.2,
        responseFormatJson: true,
        timeoutMs: OPENAI_TIMEOUT_MS,
      });
      const rawContent = ai.content;
      const parsed = extractJson(rawContent);
      const plantilla = normalizePlantilla(parsed?.plantilla || parsed, nivel, userId, text);

      return successResponse(res, {
        provider: ai.provider,
        model: ai.model,
        usage,
        plantilla,
      });
    } catch (aiError) {
      console.warn("Fallback heuristico en /api/planeaciones/escanear-plantilla:", aiError);
      if (aiError?.statusCode === 429) {
        return errorResponse(res, 429, aiError.message);
      }
      const plantilla = buildFallbackPlantilla(text, nivel, userId);

      return successResponse(res, {
        provider: "heuristic_fallback",
        model: null,
        plantilla,
      });
    }
  } catch (error) {
    if (error?.name === "AbortError") {
      return errorResponse(res, 504, "El escaneo de plantilla excedio el tiempo limite");
    }

    console.error("Error en /api/planeaciones/escanear-plantilla:", error);
    return errorResponse(res, 500, error.message || "Error al escanear plantilla");
  }
};

function buildSystemPrompt(nivelAcademico) {
  return `Eres un analista experto en planeaciones didacticas mexicanas.
Tu tarea es leer texto extraido de un PDF/DOCX y convertir SOLO LA ESTRUCTURA del documento en una PlantillaDocumento reutilizable.

Reglas obligatorias:
1) Responde unicamente JSON valido, sin markdown ni explicaciones.
2) Devuelve este esquema exacto:
{
  "plantilla": {
    "nombre": "string",
    "descripcion": "string",
    "nivelAcademico": "${nivelAcademico}",
    "secciones": [
      {
        "id": "snake_case",
        "tipo": "info_institucional|datos_generales|curricular|sesiones|evaluacion|observaciones|firmas|custom",
        "titulo": "string",
        "visible": true,
        "campos": [
          {
            "id": "snake_case",
            "etiqueta": "string",
            "tipo": "text|richtext|number|date|select|multiselect|table|checkbox_list",
            "requerido": true,
            "opciones": ["string"],
            "valorDefecto": "string"
          }
        ]
      }
    ],
    "defaults": {
      "infoInstitucional": {},
      "datosGenerales": {},
      "elementosCurriculares": {},
      "sesiones": [],
      "evaluacionFinal": {},
      "observaciones": [],
      "firmas": [],
      "camposNivel": {}
    }
  }
}
3) No inventes contenido curricular especifico si el documento no lo trae; usa campos vacios en defaults.
4) Detecta secciones reales del formato: institucion, datos generales, curriculum NEM, sesiones, evaluacion, observaciones, firmas y cualquier bloque custom.
5) Usa nombres de campos claros para docentes y preserva opciones de listas/checklists cuando aparezcan.
6) Si el documento tiene tablas, representalas como campos tipo "table".`;
}

function buildUserPrompt(text) {
  return `Texto extraido del documento:\n${text.slice(0, MAX_TEXT_CHARS)}`;
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

function normalizePlantilla(input, nivelAcademico, userId, sourceText) {
  const now = new Date().toISOString();
  const secciones = normalizeSecciones(input?.secciones);

  return {
    id: toId("plantilla"),
    userId,
    nombre: toShortText(input?.nombre, inferTemplateName(sourceText)),
    descripcion: toShortText(
      input?.descripcion,
      "Plantilla generada automaticamente a partir de un documento importado."
    ),
    nivelAcademico: normalizeNivel(input?.nivelAcademico) || nivelAcademico,
    origen: "escaner",
    secciones: secciones.length ? secciones : buildDefaultSecciones(sourceText),
    defaults: normalizeDefaults(input?.defaults, sourceText),
    fechaCreacion: now,
    fechaModificacion: now,
  };
}

function normalizeSecciones(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((section, index) => {
      const tipo = SECCIONES_VALIDAS.has(section?.tipo) ? section.tipo : "custom";
      const titulo = toShortText(section?.titulo, humanize(tipo));
      const campos = normalizeCampos(section?.campos);

      return {
        id: slug(section?.id || titulo || `seccion_${index + 1}`),
        tipo,
        titulo,
        visible: section?.visible !== false,
        campos,
      };
    })
    .filter((section) => section.titulo && section.campos.length > 0)
    .slice(0, 12);
}

function normalizeCampos(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((field, index) => {
      const tipo = CAMPOS_VALIDOS.has(field?.tipo) ? field.tipo : "text";
      const etiqueta = toShortText(field?.etiqueta, `Campo ${index + 1}`);

      return {
        id: slug(field?.id || etiqueta || `campo_${index + 1}`),
        etiqueta,
        tipo,
        requerido: Boolean(field?.requerido),
        opciones: Array.isArray(field?.opciones)
          ? field.opciones.map((item) => String(item).trim()).filter(Boolean).slice(0, 20)
          : undefined,
        valorDefecto:
          typeof field?.valorDefecto === "string" ? field.valorDefecto.trim().slice(0, 600) : undefined,
      };
    })
    .filter((field) => field.etiqueta)
    .slice(0, 30);
}

function normalizeDefaults(value, sourceText) {
  const defaults = value && typeof value === "object" ? value : {};
  return {
    infoInstitucional: objectOrEmpty(defaults.infoInstitucional),
    datosGenerales: objectOrEmpty(defaults.datosGenerales),
    elementosCurriculares: objectOrEmpty(defaults.elementosCurriculares),
    sesiones: Array.isArray(defaults.sesiones) ? defaults.sesiones.slice(0, 20) : [],
    evaluacionInicial: defaults.evaluacionInicial,
    evaluacionFinal: defaults.evaluacionFinal,
    observaciones: Array.isArray(defaults.observaciones) ? defaults.observaciones.slice(0, 20) : [],
    firmas: Array.isArray(defaults.firmas) ? defaults.firmas.slice(0, 10) : inferFirmas(sourceText),
    camposNivel: objectOrEmpty(defaults.camposNivel),
  };
}

function buildFallbackPlantilla(text, nivelAcademico, userId) {
  const now = new Date().toISOString();
  return {
    id: toId("plantilla"),
    userId,
    nombre: inferTemplateName(text),
    descripcion: "Plantilla detectada con reglas locales. Puedes ajustarla antes de usarla.",
    nivelAcademico,
    origen: "escaner",
    secciones: buildDefaultSecciones(text),
    defaults: normalizeDefaults({}, text),
    fechaCreacion: now,
    fechaModificacion: now,
  };
}

function buildDefaultSecciones(text) {
  const detected = detectSectionTitles(text);
  const base = [
    {
      id: "info_institucional",
      tipo: "info_institucional",
      titulo: "Informacion institucional",
      visible: true,
      campos: [
        campo("institucion", "Institucion", "text", true),
        campo("subsistema", "Subsistema", "text", false),
        campo("ciclo_escolar", "Ciclo escolar", "text", true),
        campo("lugar", "Lugar", "text", false),
      ],
    },
    {
      id: "datos_generales",
      tipo: "datos_generales",
      titulo: "Datos generales",
      visible: true,
      campos: [
        campo("maestro", "Docente", "text", true),
        campo("asignatura", "Asignatura", "text", true),
        campo("grado", "Grado", "text", true),
        campo("grupos", "Grupos", "multiselect", false),
        campo("fecha_inicio", "Fecha de inicio", "date", true),
        campo("fecha_fin", "Fecha de cierre", "date", true),
      ],
    },
    {
      id: "curricular",
      tipo: "curricular",
      titulo: "Elementos curriculares",
      visible: true,
      campos: [
        campo("proposito", "Proposito", "richtext", true),
        campo("contenido", "Contenido", "richtext", true),
        campo("pda", "PDA o aprendizaje esperado", "richtext", true),
        campo("campo_formativo", "Campo formativo", "text", false),
        campo("eje_articulador", "Eje articulador", "text", false),
        campo("producto", "Producto o evidencia", "richtext", false),
      ],
    },
    {
      id: "sesiones",
      tipo: "sesiones",
      titulo: "Sesiones",
      visible: true,
      campos: [
        campo("inicio", "Inicio", "richtext", true),
        campo("desarrollo", "Desarrollo", "richtext", true),
        campo("cierre", "Cierre", "richtext", true),
        campo("tarea", "Tarea", "richtext", false),
      ],
    },
    {
      id: "evaluacion",
      tipo: "evaluacion",
      titulo: "Evaluacion",
      visible: true,
      campos: [
        campo("instrumento", "Instrumento", "select", true, [
          "Rubrica",
          "Lista de cotejo",
          "Escala de valoracion",
          "Escala estimativa",
        ]),
        campo("criterios", "Criterios", "table", true),
      ],
    },
    {
      id: "observaciones",
      tipo: "observaciones",
      titulo: "Observaciones",
      visible: true,
      campos: [campo("observaciones", "Observaciones", "richtext", false)],
    },
    {
      id: "firmas",
      tipo: "firmas",
      titulo: "Firmas",
      visible: true,
      campos: [
        campo("firma_docente", "Firma docente", "text", false),
        campo("firma_coordinacion", "Firma coordinacion", "text", false),
      ],
    },
  ];

  const customSections = detected
    .filter((title) => !base.some((section) => sameWords(section.titulo, title)))
    .slice(0, 4)
    .map((title) => ({
      id: slug(title),
      tipo: "custom",
      titulo: title,
      visible: true,
      campos: [campo(slug(title), title, "richtext", false)],
    }));

  return [...base, ...customSections];
}

function campo(id, etiqueta, tipo, requerido, opciones) {
  return {
    id,
    etiqueta,
    tipo,
    requerido,
    opciones,
  };
}

function detectSectionTitles(text) {
  const titles = [];
  const lines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length >= 4 && line.length <= 80);

  for (const line of lines) {
    const looksLikeTitle =
      /^[A-ZÁÉÍÓÚÑ0-9\s().:-]+$/.test(line) ||
      /^(datos|informacion|información|elementos|sesion|sesión|evaluacion|evaluación|observaciones|firmas|proposito|propósito|contenido)/i.test(line);
    if (looksLikeTitle && !titles.some((title) => sameWords(title, line))) {
      titles.push(cleanTitle(line));
    }
  }

  return titles;
}

function inferNivel(text) {
  const lower = text.toLowerCase();
  if (lower.includes("universidad") || lower.includes("licenciatura")) return "universidad";
  if (lower.includes("preparatoria") || lower.includes("bachillerato")) return "preparatoria";
  if (lower.includes("secundaria")) return "secundaria";
  return "primaria";
}

function normalizeNivel(value) {
  const nivel = String(value || "").toLowerCase();
  return NIVELES_VALIDOS.includes(nivel) ? nivel : null;
}

function inferTemplateName(text) {
  const firstSubject = readLabelValue(text, ["asignatura", "materia", "campo formativo"]);
  if (firstSubject) return `Plantilla ${firstSubject}`;
  return "Plantilla escaneada";
}

function inferFirmas(text) {
  const lower = text.toLowerCase();
  const firmas = [{ rol: "Docente", nombre: "" }];
  if (lower.includes("coordinador") || lower.includes("coordinadora")) {
    firmas.unshift({ rol: "Coordinacion academica", nombre: "" });
  }
  return firmas;
}

function readLabelValue(text, labels) {
  const escaped = labels.map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const match = text.match(new RegExp(`(?:${escaped})\\s*[:\\-]\\s*(.+)`, "i"));
  return match?.[1]?.split("\n")?.[0]?.trim()?.slice(0, 80) || "";
}

function objectOrEmpty(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function toId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function toShortText(value, fallback) {
  const text = String(value || "").trim();
  return (text || fallback).slice(0, 160);
}

function slug(value) {
  const normalized = String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return normalized || toId("campo");
}

function humanize(value) {
  return String(value || "Seccion").replace(/_/g, " ");
}

function cleanTitle(value) {
  const text = String(value || "")
    .replace(/[:.-]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

function sameWords(a, b) {
  return slug(a) === slug(b);
}
