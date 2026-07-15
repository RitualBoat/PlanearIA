import { apiRequest } from "../utils/apiClient";
import { isAPIConfigured } from "../sync/config/apiConfig";
import type { InstrumentoEvaluacion, PlaneacionDocumento, Sesion } from "../../types/planeacionV2";

export type CopilotoAccion =
  | "sugerir_actividades"
  | "autocompletar_seccion"
  | "generar_evaluacion"
  | "revisar_alineamiento"
  | "mejorar_texto";

export interface CopilotoContexto {
  seccion?: string;
  asignatura?: string;
  grado?: string;
  nivelAcademico?: string;
  contenido?: string;
  pda?: string;
  sesionNumero?: number;
  [key: string]: unknown;
}

export interface CopilotoRequest {
  accion: CopilotoAccion;
  contexto?: CopilotoContexto;
  seleccion?: string;
  contenidoDocumento?: PlaneacionDocumento;
}

export interface ActividadesCopiloto {
  inicio: string;
  desarrollo: string;
  cierre: string;
  tarea?: string;
}

export interface SugerirActividadesResultado {
  mensaje: string;
  actividades: ActividadesCopiloto;
}

export interface AutocompletarSeccionResultado {
  mensaje: string;
  seccion: string;
  contenido: string;
  campos?: Array<{ id: string; valor: string }>;
}

export interface GenerarEvaluacionResultado {
  mensaje: string;
  evaluacion: InstrumentoEvaluacion;
}

export interface HallazgoAlineamiento {
  tipo: "fortaleza" | "riesgo" | "sugerencia";
  prioridad: "alta" | "media" | "baja";
  descripcion: string;
}

export interface RevisarAlineamientoResultado {
  mensaje: string;
  resumen: string;
  hallazgos: HallazgoAlineamiento[];
}

export interface MejorarTextoResultado {
  mensaje: string;
  textoMejorado: string;
  cambios: string[];
}

export type CopilotoResultado =
  | SugerirActividadesResultado
  | AutocompletarSeccionResultado
  | GenerarEvaluacionResultado
  | RevisarAlineamientoResultado
  | MejorarTextoResultado;

export interface AiUsageInfo {
  limit: number;
  remaining: number;
  resetAt: string;
  mode?: "standard" | "dev" | string;
  warning?: string;
}

export interface CopilotoResponse<T extends CopilotoResultado = CopilotoResultado> {
  provider: "openai" | "openrouter" | "groq" | "together" | "heuristic" | "heuristic_fallback" | string;
  model?: string | null;
  usage?: AiUsageInfo;
  accion: CopilotoAccion;
  resultado: T;
}

const MAX_RETRIES = 1;

const readableTextFromUnknown = (value: unknown): string => {
  if (value == null) return "";

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "";

    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        return readableTextFromUnknown(JSON.parse(trimmed) as unknown);
      } catch {
        return trimmed.replace(/<[^>]+>/g, " ");
      }
    }

    return trimmed.replace(/<[^>]+>/g, " ");
  }

  if (Array.isArray(value)) {
    return value
      .flatMap((item) => {
        const text = readableTextFromUnknown(item);
        return text ? [text] : [];
      })
      .join(" ");
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.text === "string") return record.text;
    if (Array.isArray(record.content)) {
      return record.content
        .flatMap((item) => {
          const text = readableTextFromUnknown(item);
          return text ? [text] : [];
        })
        .join(" ");
    }
  }

  return String(value);
};

const truncate = (value: unknown = "", max = 240): string => {
  const normalized = readableTextFromUnknown(value).replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 3)}...`;
};
const localEvaluacion = (documento?: PlaneacionDocumento): InstrumentoEvaluacion => ({
  tipo: "rubrica",
  escala: [
    { etiqueta: "Excelente", valor: 100 },
    { etiqueta: "Satisfactorio", valor: 85 },
    { etiqueta: "En proceso", valor: 70 },
    { etiqueta: "Requiere apoyo", valor: 60 },
  ],
  criterios: [
    {
      id: `crit_${Date.now()}_comprension`,
      descripcion: `Comprende y aplica el contenido ${documento?.elementosCurriculares.contenido || "central"} de la planeacion.`,
      mejora: "Revisar ejemplos guiados y explicar el procedimiento con sus propias palabras.",
    },
    {
      id: `crit_${Date.now()}_producto`,
      descripcion: `Elabora el producto o evidencia esperado${documento?.elementosCurriculares.producto ? `: ${documento.elementosCurriculares.producto}` : "."}`,
      mejora: "Completar la evidencia con claridad, orden y relacion con el PDA.",
    },
    {
      id: `crit_${Date.now()}_participacion`,
      descripcion: "Participa de forma colaborativa y argumenta sus decisiones durante las actividades.",
      mejora: "Aportar ideas, escuchar a sus companeros y justificar sus respuestas.",
    },
  ],
});

const buildHeuristicResponse = <T extends CopilotoResultado>(
  payload: CopilotoRequest,
  reason?: string
): CopilotoResponse<T> => {
  const doc = payload.contenidoDocumento;
  const asignatura = doc?.datosGenerales.asignatura || payload.contexto?.asignatura || "la asignatura";
  const grado = doc?.datosGenerales.grado || payload.contexto?.grado || "el grupo";
  const contenido = readableTextFromUnknown(doc?.elementosCurriculares.contenido || payload.contexto?.contenido) || "el contenido central";
  const pda = readableTextFromUnknown(doc?.elementosCurriculares.pda || payload.contexto?.pda) || "el aprendizaje esperado";
  const fallbackNote = reason ? " Respuesta local temporal mientras se conecta la IA en la nube." : " Modo local activado.";

  let resultado: CopilotoResultado;

  if (payload.accion === "sugerir_actividades") {
    resultado = {
      mensaje: `Sugerencia local para ${asignatura}.${fallbackNote}`,
      actividades: {
        inicio: `Activar saberes previos sobre ${contenido} con una pregunta detonadora y una breve lluvia de ideas.`,
        desarrollo: `Organizar al grupo ${grado} en equipos para resolver una situacion relacionada con ${pda}. Cada equipo registra procedimiento, dudas y evidencia.`,
        cierre: "Socializar hallazgos, recuperar errores frecuentes y cerrar con una autoevaluacion breve.",
        tarea: `Traer un ejemplo cotidiano donde se observe ${contenido}.`,
      },
    };
  } else if (payload.accion === "mejorar_texto") {
    const base = truncate(payload.seleccion || contenido);
    resultado = {
      mensaje: `Texto mejorado localmente.${fallbackNote}`,
      textoMejorado: base
        ? `${base}\n\nVersion mejorada: se precisa el objetivo didactico, se explicita la evidencia esperada y se conecta con el PDA para facilitar la evaluacion.`
        : `Se propone redactar esta seccion vinculando contenido, PDA, actividad observable y evidencia de aprendizaje.`,
      cambios: [
        "Se clarifico la intencion pedagogica.",
        "Se agrego conexion con el PDA.",
        "Se sugirio evidencia observable.",
      ],
    };
  } else if (payload.accion === "generar_evaluacion") {
    resultado = {
      mensaje: `Rubrica local generada para ${asignatura}.${fallbackNote}`,
      evaluacion: localEvaluacion(doc),
    };
  } else if (payload.accion === "revisar_alineamiento") {
    resultado = {
      mensaje: `Revision local completada.${fallbackNote}`,
      resumen: "La planeacion tiene una base usable; conviene revisar que contenido, PDA, actividades y evaluacion apunten a la misma evidencia.",
      hallazgos: [
        {
          tipo: "fortaleza",
          prioridad: "media",
          descripcion: `La planeacion ya identifica asignatura (${asignatura}) y grupo (${grado}).`,
        },
        {
          tipo: "sugerencia",
          prioridad: "alta",
          descripcion: "Asegura que cada actividad produzca una evidencia evaluable vinculada al PDA.",
        },
        {
          tipo: "riesgo",
          prioridad: "media",
          descripcion: "Si la rubrica no usa los mismos criterios que las actividades, la evaluacion puede sentirse desconectada.",
        },
      ],
    };
  } else {
    resultado = {
      mensaje: `Autocompletado local para ${payload.contexto?.seccion || "la seccion"}.${fallbackNote}`,
      seccion: String(payload.contexto?.seccion || "general"),
      contenido: `Completa esta seccion describiendo ${contenido}, su relacion con ${pda}, actividades observables y evidencia esperada.`,
    };
  }

  return {
    provider: reason ? "heuristic_fallback" : "heuristic",
    model: null,
    accion: payload.accion,
    resultado: resultado as T,
  };
};

const readResponseJson = async (response: Response): Promise<Record<string, any>> => {
  const raw = await response.text();
  if (!raw.trim()) return {};
  try {
    return JSON.parse(raw) as Record<string, any>;
  } catch {
    throw new Error(
      response.ok
        ? `El backend respondio texto no JSON: ${truncate(raw, 120)}`
        : `Backend IA no disponible (${response.status}): ${truncate(raw, 120)}`
    );
  }
};

const buildContextFromDocumento = (
  documento: PlaneacionDocumento,
  extra: CopilotoContexto = {}
): CopilotoContexto => ({
  nivelAcademico: documento.nivelAcademico,
  asignatura: documento.datosGenerales.asignatura,
  grado: documento.datosGenerales.grado,
  contenido: documento.elementosCurriculares.contenido,
  pda: documento.elementosCurriculares.pda,
  ...extra,
});

const requestCopiloto = async <T extends CopilotoResultado>(
  payload: CopilotoRequest
): Promise<CopilotoResponse<T>> => {
  if (!isAPIConfigured()) {
    return buildHeuristicResponse<T>(payload, "falta configurar EXPO_PUBLIC_API_URL o backend IA");
  }

  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const response = await apiRequest("/api/planeaciones/copiloto", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const json = await readResponseJson(response);

      if (!response.ok || !json?.success) {
        throw new Error(json?.error || "No se pudo ejecutar el copiloto IA.");
      }

      return json.data as CopilotoResponse<T>;
    } catch (error) {
      lastError = error;
      if (attempt >= MAX_RETRIES) break;
    }
  }

  const message =
    lastError instanceof Error
      ? lastError.message
      : "No se pudo conectar con el copiloto IA. Revisa tu conexion o configuracion del backend.";
  return buildHeuristicResponse<T>(payload, message);
};

export const sugerirActividades = async (
  documento: PlaneacionDocumento,
  sesion?: Sesion
): Promise<CopilotoResponse<SugerirActividadesResultado>> => {
  return requestCopiloto<SugerirActividadesResultado>({
    accion: "sugerir_actividades",
    contexto: buildContextFromDocumento(documento, {
      seccion: "sesiones",
      sesionNumero: sesion?.numero,
    }),
    seleccion: [sesion?.inicio, sesion?.desarrollo, sesion?.cierre].filter(Boolean).join("\n"),
  contenidoDocumento: documento,
  });
};
export const autocompletarSeccion = async (
  documento: PlaneacionDocumento,
  seccion: string
): Promise<CopilotoResponse<AutocompletarSeccionResultado>> => {
  return requestCopiloto<AutocompletarSeccionResultado>({
    accion: "autocompletar_seccion",
    contexto: buildContextFromDocumento(documento, { seccion }),
    contenidoDocumento: documento,
  });
};

export const generarEvaluacion = async (
  documento: PlaneacionDocumento
): Promise<CopilotoResponse<GenerarEvaluacionResultado>> => {
  return requestCopiloto<GenerarEvaluacionResultado>({
    accion: "generar_evaluacion",
    contexto: buildContextFromDocumento(documento, { seccion: "evaluacion" }),
    contenidoDocumento: documento,
  });
};

export const revisarAlineamiento = async (
  documento: PlaneacionDocumento
): Promise<CopilotoResponse<RevisarAlineamientoResultado>> => {
  return requestCopiloto<RevisarAlineamientoResultado>({
    accion: "revisar_alineamiento",
    contexto: buildContextFromDocumento(documento, { seccion: "revision" }),
    contenidoDocumento: documento,
  });
};

export const mejorarTexto = async (
  documento: PlaneacionDocumento,
  texto: string,
  seccion?: string
): Promise<CopilotoResponse<MejorarTextoResultado>> => {
  return requestCopiloto<MejorarTextoResultado>({
    accion: "mejorar_texto",
    contexto: buildContextFromDocumento(documento, { seccion }),
    seleccion: texto,
    contenidoDocumento: documento,
  });
};
