import { Planeacion as PlaneacionV1 } from "../../types/planeacion";
import {
  PlaneacionDocumento,
  NivelAcademico,
  Sesion,
  InstrumentoEvaluacion,
} from "../../types/planeacionV2";

/**
 * Migra un documento de planeación del modelo V1 (plano/legacy)
 * al modelo estructurado V2 (multi-sesión/pedagógico).
 *
 * @param v1 Documento en formato V1
 * @param userId Identificador del usuario creador (para aislamiento)
 */
export const migrateV1toV2 = (
  v1: PlaneacionV1,
  userId: string = ""
): PlaneacionDocumento => {
  // 1. Mapeo de Nivel Académico
  let nivelV2 = NivelAcademico.PRIMARIA;
  if (v1.nivelAcademico === "secundaria") {
    nivelV2 = NivelAcademico.SECUNDARIA;
  } else if (v1.nivelAcademico === "preparatoria") {
    nivelV2 = NivelAcademico.PREPARATORIA;
  } else if (v1.nivelAcademico === "universidad") {
    nivelV2 = NivelAcademico.UNIVERSIDAD;
  }

  // 2. Mapeo de sesiones (actividades)
  let sesiones: Sesion[] = [];

  // Si es universitario y tiene semanas configuradas
  if (
    v1.nivelAcademico === "universidad" &&
    "semanas" in v1 &&
    Array.isArray(v1.semanas) &&
    v1.semanas.length > 0
  ) {
    sesiones = v1.semanas.map((sem, idx) => {
      const num = sem.numero || idx + 1;
      
      const inicioHtml = sem.objetivos && sem.objetivos.length > 0
        ? `<p><strong>Objetivos:</strong></p><ul>${sem.objetivos.map(o => `<li>${o}</li>`).join("")}</ul>`
        : "";

      const desarrolloHtml = sem.actividadesPresenciales && sem.actividadesPresenciales.length > 0
        ? sem.actividadesPresenciales.map(act => `<p><strong>${act.metodologia || "Actividad"}:</strong> ${act.descripcion} (${act.duracion} min)</p>`).join("")
        : "";

      const cierreHtml = sem.actividadesAutonomas && sem.actividadesAutonomas.length > 0
        ? `<p><strong>Actividades Autónomas:</strong></p><ul>${sem.actividadesAutonomas.map(a => `<li>${a}</li>`).join("")}</ul>`
        : "";

      return {
        id: `session_${num}`,
        numero: num,
        tipo: "regular",
        inicio: inicioHtml,
        desarrollo: desarrolloHtml,
        cierre: cierreHtml,
        tarea: sem.entregables || undefined,
      };
    });
  } else {
    // Para primaria, secundaria, preparatoria o universidad simple (1 sola sesión/semana)
    const inicioAct = v1.actividades?.find(a => a.tipo === "inicio");
    const desAct = v1.actividades?.find(a => a.tipo === "desarrollo");
    const cieAct = v1.actividades?.find(a => a.tipo === "cierre");

    sesiones = [
      {
        id: "session_1",
        numero: 1,
        tipo: "regular",
        inicio: inicioAct ? `<p>${inicioAct.descripcion}</p>` : "",
        desarrollo: desAct ? `<p>${desAct.descripcion}</p>` : "",
        cierre: cieAct ? `<p>${cieAct.descripcion}</p>` : "",
      },
    ];
  }

  // 3. Mapeo de campos curriculares específicos de V1
  let campoFormativo = "";
  if (v1.nivelAcademico === "primaria" && "campoFormativo" in v1) {
    campoFormativo = v1.campoFormativo || "";
  }

  // 4. Mapeo del instrumento de evaluación
  let evaluacionFinal: InstrumentoEvaluacion | undefined;
  if (v1.evaluacion) {
    evaluacionFinal = {
      tipo: "otro",
      escala: [],
      criterios: [
        {
          id: "crit_1",
          descripcion: v1.evaluacion,
        },
      ],
    };
  }

  // 5. Mapeo de observaciones
  const observaciones = v1.observaciones
    ? [
        {
          texto: v1.observaciones,
          categoria: "general" as const,
        },
      ]
    : [];

  return {
    id: v1.id,
    version: 2,
    userId,
    nivelAcademico: nivelV2,
    infoInstitucional: {
      institucion: "",
      cicloEscolar: "",
    },
    datosGenerales: {
      maestro: "",
      asignatura: v1.asignatura || "",
      fechaInicio: v1.fecha || new Date().toISOString(),
      fechaFin: v1.fecha || new Date().toISOString(),
      semanas: [],
      grado: v1.grado || "",
      grupos: v1.grupo ? [v1.grupo] : [],
    },
    elementosCurriculares: {
      proposito: v1.aprendizajesEsperados ? v1.aprendizajesEsperados.join("\n") : "",
      producto: v1.evidencias ? v1.evidencias.join(", ") : undefined,
      contenido: v1.unidadTematica || "",
      pda: v1.temaSesion || "",
      campoFormativo,
      ejeArticulador: "",
      rasgosPerfilEgreso: [],
      instrumentoEvaluacion: v1.evaluacion,
    },
    sesiones,
    evaluacionFinal,
    observaciones,
    firmas: [],
    fechaCreacion: v1.fechaCreacion || new Date().toISOString(),
    fechaModificacion: v1.fechaModificacion || new Date().toISOString(),
  };
};
