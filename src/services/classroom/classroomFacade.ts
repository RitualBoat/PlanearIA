import type {
  Alumno,
  Asistencia,
  Calificacion,
  EntregaTarea,
  Grupo,
  ID,
  Recurso,
  Tarea,
} from "../../../types";
import type { ClassroomDataset } from "../../../types/classroom";
import {
  buildClassroomActividadReciente,
  buildClassroomGrupo,
  buildClassroomModel,
  buildClassroomPendientes,
  buildClassroomResumen,
  type BuildClassroomModelResult,
} from "./classroomModel";
import {
  CLASSROOM_STORAGE_KEYS,
  classroomStorage,
  type ClassroomStoragePort,
} from "./classroomStorage";

export interface ClassroomFacade {
  listGrupos(): Promise<Array<Partial<Grupo>>>;
  listGruposResumen(): Promise<BuildClassroomModelResult[]>;
  getDatasetByGrupoId(grupoId: ID): Promise<ClassroomDataset | null>;
  getClassroomModel(grupoId: ID): Promise<BuildClassroomModelResult | null>;
  getAlumnosByGrupoId(grupoId: ID): Promise<Alumno[]>;
  getActividadesByGrupoId(grupoId: ID): Promise<Tarea[]>;
  getMaterialesByGrupoId(grupoId: ID): Promise<Recurso[]>;
  getAsistenciasByGrupoId(grupoId: ID): Promise<Asistencia[]>;
  getCalificacionesByGrupoId(grupoId: ID): Promise<Calificacion[]>;
  getEntregasByGrupoId(grupoId: ID): Promise<EntregaTarea[]>;
}

export function createClassroomFacade(
  storage: ClassroomStoragePort = classroomStorage,
): ClassroomFacade {
  const readDataset = async (): Promise<Required<Omit<ClassroomDataset, "grupo">> & {
    grupos: Array<Partial<Grupo>>;
  }> => {
    const [
      grupos,
      alumnos,
      tareas,
      tareasLegacy,
      recursos,
      asistencias,
      calificaciones,
      entregas,
      entregasLegacy,
    ] = await Promise.all([
      storage.readArray<Partial<Grupo>>(CLASSROOM_STORAGE_KEYS.grupos),
      storage.readArray<Alumno>(CLASSROOM_STORAGE_KEYS.alumnos),
      storage.readArray<Tarea>(CLASSROOM_STORAGE_KEYS.tareas),
      storage.readArray<Tarea>(CLASSROOM_STORAGE_KEYS.tareasLegacy),
      storage.readArray<Recurso>(CLASSROOM_STORAGE_KEYS.recursos),
      storage.readArray<Asistencia>(CLASSROOM_STORAGE_KEYS.asistencias),
      storage.readArray<Calificacion>(CLASSROOM_STORAGE_KEYS.calificaciones),
      storage.readArray<EntregaTarea>(CLASSROOM_STORAGE_KEYS.entregas),
      storage.readArray<EntregaTarea>(CLASSROOM_STORAGE_KEYS.entregasLegacy),
    ]);

    return {
      grupos,
      alumnos,
      actividades: mergeById(tareas, tareasLegacy).filter(isTarea),
      materiales: recursos,
      asistencias,
      calificaciones,
      entregas: mergeById(entregas, entregasLegacy).filter(isEntregaTarea),
    };
  };

  const buildDatasetByGrupoId = async (grupoId: ID): Promise<ClassroomDataset | null> => {
    const data = await readDataset();
    const grupo = data.grupos.find((item) => item.id === grupoId);

    if (!grupo?.id) {
      return null;
    }

    const actividades = data.actividades.filter((item) => item.grupoId === grupoId);
    const actividadIds = new Set(actividades.map((item) => item.id));

    return {
      grupo: grupo as Pick<Grupo, "id"> & Partial<Grupo>,
      alumnos: data.alumnos.filter((item) => item.grupoId === grupoId),
      actividades,
      materiales: data.materiales.filter((item) => item.grupoId === grupoId),
      asistencias: data.asistencias.filter((item) => item.grupoId === grupoId),
      calificaciones: data.calificaciones.filter((item) => item.grupoId === grupoId),
      entregas: data.entregas.filter((item) => actividadIds.has(item.tareaId)),
    };
  };

  return {
    async listGrupos() {
      return storage.readArray<Partial<Grupo>>(CLASSROOM_STORAGE_KEYS.grupos);
    },

    async listGruposResumen() {
      const grupos = await storage.readArray<Partial<Grupo>>(CLASSROOM_STORAGE_KEYS.grupos);
      const models = await Promise.all(
        grupos
          .filter((grupo): grupo is Pick<Grupo, "id"> & Partial<Grupo> => typeof grupo.id === "number")
          .map((grupo) => buildDatasetByGrupoId(grupo.id)),
      );

      return models.filter((dataset): dataset is ClassroomDataset => Boolean(dataset)).map((dataset) => ({
        grupo: buildClassroomGrupo(dataset),
        resumen: buildClassroomResumen(dataset),
        actividadReciente: buildClassroomActividadReciente(dataset),
        pendientes: buildClassroomPendientes(dataset),
      }));
    },

    async getDatasetByGrupoId(grupoId) {
      return buildDatasetByGrupoId(grupoId);
    },

    async getClassroomModel(grupoId) {
      const dataset = await buildDatasetByGrupoId(grupoId);
      return dataset ? buildClassroomModel(dataset) : null;
    },

    async getAlumnosByGrupoId(grupoId) {
      const dataset = await buildDatasetByGrupoId(grupoId);
      return dataset?.alumnos ?? [];
    },

    async getActividadesByGrupoId(grupoId) {
      const dataset = await buildDatasetByGrupoId(grupoId);
      return dataset?.actividades ?? [];
    },

    async getMaterialesByGrupoId(grupoId) {
      const dataset = await buildDatasetByGrupoId(grupoId);
      return dataset?.materiales ?? [];
    },

    async getAsistenciasByGrupoId(grupoId) {
      const dataset = await buildDatasetByGrupoId(grupoId);
      return dataset?.asistencias ?? [];
    },

    async getCalificacionesByGrupoId(grupoId) {
      const dataset = await buildDatasetByGrupoId(grupoId);
      return dataset?.calificaciones ?? [];
    },

    async getEntregasByGrupoId(grupoId) {
      const dataset = await buildDatasetByGrupoId(grupoId);
      return dataset?.entregas ?? [];
    },
  };
}

export const classroomFacade = createClassroomFacade();

function mergeById<T extends { id: ID }>(primary: T[], fallback: T[]): T[] {
  const seen = new Set<ID>();
  const result: T[] = [];

  for (const item of [...primary, ...fallback]) {
    if (seen.has(item.id)) {
      continue;
    }

    seen.add(item.id);
    result.push(item);
  }

  return result;
}

function isTarea(value: Tarea | unknown): value is Tarea {
  return (
    typeof value === "object" &&
    value !== null &&
    "grupoId" in value &&
    "fechaAsignacion" in value &&
    "fechaEntrega" in value
  );
}

function isEntregaTarea(value: EntregaTarea | unknown): value is EntregaTarea {
  return (
    typeof value === "object" &&
    value !== null &&
    "tareaId" in value &&
    "alumnoId" in value &&
    "calificada" in value
  );
}

