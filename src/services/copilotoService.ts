import { apiRequest } from "../utils/apiClient";
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

export interface CopilotoResponse<T extends CopilotoResultado = CopilotoResultado> {
  provider: "openai" | "heuristic" | "heuristic_fallback";
  model?: string | null;
  accion: CopilotoAccion;
  resultado: T;
}

const MAX_RETRIES = 1;

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
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const response = await apiRequest("/api/planeaciones/copiloto", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const json = await response.json();

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
  throw new Error(message);
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

export const copilotoService = {
  sugerirActividades,
  autocompletarSeccion,
  generarEvaluacion,
  revisarAlineamiento,
  mejorarTexto,
};

export default copilotoService;
