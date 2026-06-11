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
import type { UnidadClassroom } from "../../../types/unidadClassroom";
import {
  CLASSROOM_STORAGE_KEYS,
  classroomStorage,
  type ClassroomStoragePort,
} from "./classroomStorage";

export type ClassroomRepositoryDataset = Required<Omit<ClassroomDataset, "grupo">> & {
  grupos: Array<Partial<Grupo>>;
};

export interface ClassroomRepository {
  readDataset(): Promise<ClassroomRepositoryDataset>;
  listGrupos(): Promise<Array<Partial<Grupo>>>;
  getDatasetByGrupoId(grupoId: ID): Promise<ClassroomDataset | null>;
  getUnidadesByGrupoId(grupoId: ID): Promise<UnidadClassroom[]>;
  createUnidad(grupoId: ID, nombre: string): Promise<UnidadClassroom>;
  updateUnidad(id: string, cambios: Partial<UnidadClassroom>): Promise<UnidadClassroom | null>;
  deleteUnidad(id: string): Promise<void>;
  replaceAlumnos(alumnos: Alumno[]): Promise<void>;
  getAlumnosByGrupoId(grupoId: ID): Promise<Alumno[]>;
  getActividadesByGrupoId(grupoId: ID): Promise<Tarea[]>;
  getMaterialesByGrupoId(grupoId: ID): Promise<Recurso[]>;
  getAsistenciasByGrupoId(grupoId: ID): Promise<Asistencia[]>;
  getCalificacionesByGrupoId(grupoId: ID): Promise<Calificacion[]>;
  getEntregasByGrupoId(grupoId: ID): Promise<EntregaTarea[]>;
}

export function createClassroomRepository(
  storage: ClassroomStoragePort = classroomStorage,
): ClassroomRepository {
  const readDataset = async (): Promise<ClassroomRepositoryDataset> => {
    const [
      grupos,
      unidades,
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
      storage.readArray<UnidadClassroom>(CLASSROOM_STORAGE_KEYS.unidades),
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
      unidades,
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
      unidades: data.unidades
        .filter((item) => item.grupoId === grupoId)
        .sort((a, b) => a.posicion - b.posicion),
      alumnos: data.alumnos.filter((item) => item.grupoId === grupoId),
      actividades,
      materiales: data.materiales.filter((item) => item.grupoId === grupoId),
      asistencias: data.asistencias.filter((item) => item.grupoId === grupoId),
      calificaciones: data.calificaciones.filter((item) => item.grupoId === grupoId),
      entregas: data.entregas.filter((item) => actividadIds.has(item.tareaId)),
    };
  };

  return {
    readDataset,

    async listGrupos() {
      return storage.readArray<Partial<Grupo>>(CLASSROOM_STORAGE_KEYS.grupos);
    },

    async getDatasetByGrupoId(grupoId) {
      return buildDatasetByGrupoId(grupoId);
    },

    async getUnidadesByGrupoId(grupoId) {
      const data = await readDataset();
      return data.unidades
        .filter((item) => item.grupoId === grupoId)
        .sort((a, b) => a.posicion - b.posicion);
    },

    async createUnidad(grupoId, nombre) {
      const unidades = await storage.readArray<UnidadClassroom>(CLASSROOM_STORAGE_KEYS.unidades);
      const now = new Date().toISOString();
      const nextPosition = unidades.filter((item) => item.grupoId === grupoId).length;
      const unidad: UnidadClassroom = {
        id: `unidad_${grupoId}_${Date.now()}`,
        grupoId,
        nombre,
        posicion: nextPosition,
        colapsada: false,
        fechaCreacion: now,
        fechaModificacion: now,
        syncStatus: "pending",
      };
      await storage.writeArray(CLASSROOM_STORAGE_KEYS.unidades, [...unidades, unidad]);
      return unidad;
    },

    async updateUnidad(id, cambios) {
      const unidades = await storage.readArray<UnidadClassroom>(CLASSROOM_STORAGE_KEYS.unidades);
      let updated: UnidadClassroom | null = null;
      const next = unidades.map((unidad) => {
        if (unidad.id !== id) return unidad;
        updated = {
          ...unidad,
          ...cambios,
          id: unidad.id,
          fechaModificacion: new Date().toISOString(),
          syncStatus: cambios.syncStatus ?? "pending",
        };
        return updated;
      });
      await storage.writeArray(CLASSROOM_STORAGE_KEYS.unidades, next);
      return updated;
    },

    async deleteUnidad(id) {
      const unidades = await storage.readArray<UnidadClassroom>(CLASSROOM_STORAGE_KEYS.unidades);
      await storage.writeArray(
        CLASSROOM_STORAGE_KEYS.unidades,
        unidades.filter((unidad) => unidad.id !== id),
      );
    },

    async replaceAlumnos(alumnos) {
      await storage.writeArray(CLASSROOM_STORAGE_KEYS.alumnos, alumnos);
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

export const classroomRepository = createClassroomRepository();

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
