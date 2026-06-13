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
  buildClassroomActividadReciente,
  buildClassroomGrupo,
  buildClassroomModel,
  buildClassroomPendientes,
  buildClassroomResumen,
  type BuildClassroomModelResult,
} from "./classroomModel";
import type { ClassroomStoragePort } from "./classroomStorage";
import {
  classroomRepository,
  createClassroomRepository,
  type ClassroomRepository,
} from "./classroomRepository";
import { SYNC_ENTITIES, queueEntityOperation } from "../../sync/services/entitySync";

export interface ClassroomFacade {
  listGrupos(): Promise<Array<Partial<Grupo>>>;
  listGruposResumen(): Promise<BuildClassroomModelResult[]>;
  getDatasetByGrupoId(grupoId: ID): Promise<ClassroomDataset | null>;
  getClassroomModel(grupoId: ID): Promise<BuildClassroomModelResult | null>;
  getUnidadesByGrupoId(grupoId: ID): Promise<UnidadClassroom[]>;
  createUnidad(grupoId: ID, nombre: string): Promise<UnidadClassroom>;
  updateUnidad(id: string, cambios: Partial<UnidadClassroom>): Promise<UnidadClassroom | null>;
  deleteUnidad(id: string): Promise<void>;
  getAlumnosByGrupoId(grupoId: ID): Promise<Alumno[]>;
  getActividadesByGrupoId(grupoId: ID): Promise<Tarea[]>;
  getMaterialesByGrupoId(grupoId: ID): Promise<Recurso[]>;
  getAsistenciasByGrupoId(grupoId: ID): Promise<Asistencia[]>;
  getCalificacionesByGrupoId(grupoId: ID): Promise<Calificacion[]>;
  getEntregasByGrupoId(grupoId: ID): Promise<EntregaTarea[]>;
}

export interface ClassroomFacadeOptions {
  /** Push unidades mutations to the backend queue (app singleton only) */
  syncRemote?: boolean;
}

export function createClassroomFacade(
  storageOrRepository?: ClassroomStoragePort | ClassroomRepository,
  options: ClassroomFacadeOptions = {},
): ClassroomFacade {
  const repository = isClassroomRepository(storageOrRepository)
    ? storageOrRepository
    : storageOrRepository
      ? createClassroomRepository(storageOrRepository)
      : classroomRepository;

  const syncRemote = options.syncRemote ?? false;

  return {
    async listGrupos() {
      return repository.listGrupos();
    },

    async listGruposResumen() {
      const grupos = await repository.listGrupos();
      const models = await Promise.all(
        grupos
          .filter((grupo): grupo is Pick<Grupo, "id"> & Partial<Grupo> => typeof grupo.id === "number")
          .map((grupo) => repository.getDatasetByGrupoId(grupo.id)),
      );

      return models.filter((dataset): dataset is ClassroomDataset => Boolean(dataset)).map((dataset) => ({
        grupo: buildClassroomGrupo(dataset),
        resumen: buildClassroomResumen(dataset),
        actividadReciente: buildClassroomActividadReciente(dataset),
        pendientes: buildClassroomPendientes(dataset),
      }));
    },

    async getDatasetByGrupoId(grupoId) {
      return repository.getDatasetByGrupoId(grupoId);
    },

    async getClassroomModel(grupoId) {
      const dataset = await repository.getDatasetByGrupoId(grupoId);
      return dataset ? buildClassroomModel(dataset) : null;
    },

    async getUnidadesByGrupoId(grupoId) {
      return repository.getUnidadesByGrupoId(grupoId);
    },

    async createUnidad(grupoId, nombre) {
      const unidad = await repository.createUnidad(grupoId, nombre);
      if (syncRemote) {
        await queueEntityOperation(SYNC_ENTITIES.unidades, "create", unidad);
      }
      return unidad;
    },

    async updateUnidad(id, cambios) {
      const updated = await repository.updateUnidad(id, cambios);
      if (syncRemote && updated) {
        await queueEntityOperation(SYNC_ENTITIES.unidades, "update", updated);
      }
      return updated;
    },

    async deleteUnidad(id) {
      await repository.deleteUnidad(id);
      if (syncRemote) {
        await queueEntityOperation(SYNC_ENTITIES.unidades, "delete", { id });
      }
    },

    async getAlumnosByGrupoId(grupoId) {
      return repository.getAlumnosByGrupoId(grupoId);
    },

    async getActividadesByGrupoId(grupoId) {
      return repository.getActividadesByGrupoId(grupoId);
    },

    async getMaterialesByGrupoId(grupoId) {
      return repository.getMaterialesByGrupoId(grupoId);
    },

    async getAsistenciasByGrupoId(grupoId) {
      return repository.getAsistenciasByGrupoId(grupoId);
    },

    async getCalificacionesByGrupoId(grupoId) {
      return repository.getCalificacionesByGrupoId(grupoId);
    },

    async getEntregasByGrupoId(grupoId) {
      return repository.getEntregasByGrupoId(grupoId);
    },
  };
}

export const classroomFacade = createClassroomFacade(undefined, { syncRemote: true });

function isClassroomRepository(value?: ClassroomStoragePort | ClassroomRepository): value is ClassroomRepository {
  return Boolean(value && "readDataset" in value && "getDatasetByGrupoId" in value);
}
