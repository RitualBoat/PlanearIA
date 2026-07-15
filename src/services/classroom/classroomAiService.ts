import type { Alumno, Asistencia, Calificacion, EntregaTarea, Recurso, Tarea } from "../../../types";
import type { BuildClassroomModelResult } from "./classroomModel";
import { isAPIConfigured } from "../../sync/config/apiConfig";
import { apiRequest } from "../../utils/apiClient";

export type ClassroomAiAccion =
  | "sugerir_actividad"
  | "generar_rubrica"
  | "resumir_progreso"
  | "sugerir_retroalimentacion";

export interface ClassroomAiContexto {
  grupo?: {
    id?: number;
    nombre?: string;
    materia?: string;
    periodo?: string;
  };
  resumen?: Partial<BuildClassroomModelResult["resumen"]>;
  alumnos?: Array<Pick<Alumno, "id" | "nombre" | "apellidos" | "estado">>;
  actividades?: Array<Pick<Tarea, "id" | "titulo" | "descripcion" | "tipo" | "estado" | "fechaEntrega" | "valor">>;
  materiales?: Array<Pick<Recurso, "id" | "titulo" | "tipo">>;
  asistencias?: Array<Pick<Asistencia, "alumnoId" | "fecha" | "estado">>;
  calificaciones?: Array<Pick<Calificacion, "alumnoId" | "promedio" | "estado">>;
  entregas?: Array<Pick<EntregaTarea, "tareaId" | "alumnoId" | "estado" | "calificacion" | "calificada">>;
  actividad?: Partial<Tarea>;
  alumno?: Partial<Alumno>;
  calificacion?: string;
  retroalimentacionActual?: string;
  [key: string]: unknown;
}

export interface ClassroomAiUsageInfo {
  limit: number;
  remaining: number;
  resetAt: string;
  mode?: "standard" | "dev" | string;
  warning?: string;
}

export interface ClassroomActividadSugerida {
  titulo: string;
  descripcion: string;
  tipo: "tarea" | "examen" | "proyecto" | "investigacion";
  instrucciones: string;
  criterios: string[];
}

export interface ClassroomRubricaSugerida {
  titulo: string;
  criterios: Array<{
    criterio: string;
    excelente: string;
    satisfactorio: string;
    enProceso: string;
  }>;
}

export interface ClassroomHallazgo {
  tipo: "fortaleza" | "riesgo" | "sugerencia";
  prioridad: "alta" | "media" | "baja";
  descripcion: string;
}

export interface SugerirActividadResultado {
  mensaje: string;
  actividad: ClassroomActividadSugerida;
}

export interface GenerarRubricaResultado {
  mensaje: string;
  rubrica: ClassroomRubricaSugerida;
}

export interface ResumirProgresoResultado {
  mensaje: string;
  resumen: string;
  hallazgos: ClassroomHallazgo[];
}

export interface SugerirRetroalimentacionResultado {
  mensaje: string;
  retroalimentacion: string;
  siguientesPasos: string[];
}

export type ClassroomAiResultado =
  | SugerirActividadResultado
  | GenerarRubricaResultado
  | ResumirProgresoResultado
  | SugerirRetroalimentacionResultado;

export interface ClassroomAiResponse<T extends ClassroomAiResultado = ClassroomAiResultado> {
  provider: "openai" | "openrouter" | "groq" | "together" | "heuristic" | "heuristic_fallback" | string;
  model?: string | null;
  usage?: ClassroomAiUsageInfo;
  accion: ClassroomAiAccion;
  resultado: T;
}

const MAX_RETRIES = 1;

const truncate = (value: unknown = "", max = 240): string => {
  const normalized = String(value ?? "").replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 3)}...`;
};

const buildHeuristicResponse = <T extends ClassroomAiResultado>(
  accion: ClassroomAiAccion,
  contexto: ClassroomAiContexto,
  reason?: string,
): ClassroomAiResponse<T> => {
  const fallbackNote = reason ? " Respuesta local temporal mientras se conecta la IA." : " Modo local activado.";
  const materia = contexto.grupo?.materia || "la materia";
  const alumnos = contexto.resumen?.totalAlumnos ?? contexto.alumnos?.length ?? 0;
  const actividades = contexto.resumen?.totalActividades ?? contexto.actividades?.length ?? 0;

  let resultado: ClassroomAiResultado;

  if (accion === "sugerir_actividad") {
    resultado = {
      mensaje: `Actividad local sugerida para ${materia}.${fallbackNote}`,
      actividad: {
        titulo: `Reto aplicado de ${materia}`,
        descripcion: "Actividad breve para generar evidencia revisable dentro del grupo.",
        tipo: "tarea",
        instrucciones:
          "Presenta una situacion cercana al grupo, resuelvela en equipos y entrega una evidencia individual con explicacion breve.",
        criterios: [
          "Comprende el contenido central.",
          "Entrega evidencia clara y completa.",
          "Explica procedimiento o decisiones.",
        ],
      },
    };
  } else if (accion === "generar_rubrica") {
    resultado = {
      mensaje: `Rubrica local generada para ${materia}.${fallbackNote}`,
      rubrica: {
        titulo: "Rubrica base de actividad",
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
      },
    };
  } else if (accion === "resumir_progreso") {
    const asistencia = contexto.resumen?.porcentajeAsistencia ?? 0;
    resultado = {
      mensaje: `Resumen local generado.${fallbackNote}`,
      resumen: `El grupo tiene ${alumnos} alumnos, ${actividades} actividades y asistencia aproximada de ${asistencia}%.`,
      hallazgos: [
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
      ],
    };
  } else {
    const alumno = contexto.alumno?.nombre || "el alumno";
    const actividad = contexto.actividad?.titulo || "la actividad";
    const calificacion = contexto.calificacion ? ` Calificacion registrada: ${contexto.calificacion}.` : "";
    resultado = {
      mensaje: `Retroalimentacion local sugerida.${fallbackNote}`,
      retroalimentacion: `${alumno}, en ${actividad}, identifica una fortaleza de tu entrega y mejora un punto concreto antes de la siguiente revision.${calificacion}`,
      siguientesPasos: [
        "Revisar la evidencia con base en un criterio observable.",
        "Hacer una mejora concreta y volver a entregar si aplica.",
      ],
    };
  }

  return {
    provider: reason ? "heuristic_fallback" : "heuristic",
    model: null,
    accion,
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
        : `Backend IA Classroom no disponible (${response.status}): ${truncate(raw, 120)}`,
    );
  }
};

const requestClassroomAi = async <T extends ClassroomAiResultado>(
  accion: ClassroomAiAccion,
  contexto: ClassroomAiContexto,
): Promise<ClassroomAiResponse<T>> => {
  if (!isAPIConfigured()) {
    return buildHeuristicResponse<T>(accion, contexto, "falta configurar backend IA");
  }

  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const response = await apiRequest("/api/classroom/copiloto", {
        method: "POST",
        body: JSON.stringify({ accion, contexto }),
      });
      const json = await readResponseJson(response);

      if (!response.ok || !json?.success) {
        throw new Error(json?.error || "No se pudo ejecutar IA Classroom.");
      }

      return json.data as ClassroomAiResponse<T>;
    } catch (error) {
      lastError = error;
      if (attempt >= MAX_RETRIES) break;
    }
  }

  const message =
    lastError instanceof Error
      ? lastError.message
      : "No se pudo conectar con IA Classroom. Revisa tu conexion o configuracion del backend.";
  return buildHeuristicResponse<T>(accion, contexto, message);
};

export const sugerirActividadClassroom = (contexto: ClassroomAiContexto) =>
  requestClassroomAi<SugerirActividadResultado>("sugerir_actividad", contexto);

export const generarRubricaClassroom = (contexto: ClassroomAiContexto) =>
  requestClassroomAi<GenerarRubricaResultado>("generar_rubrica", contexto);

export const resumirProgresoClassroom = (contexto: ClassroomAiContexto) =>
  requestClassroomAi<ResumirProgresoResultado>("resumir_progreso", contexto);

export const sugerirRetroalimentacionClassroom = (contexto: ClassroomAiContexto) =>
  requestClassroomAi<SugerirRetroalimentacionResultado>("sugerir_retroalimentacion", contexto);

export const classroomAiService = {
  generarRubricaClassroom,
  resumirProgresoClassroom,
  sugerirActividadClassroom,
  sugerirRetroalimentacionClassroom,
};

export default classroomAiService;
