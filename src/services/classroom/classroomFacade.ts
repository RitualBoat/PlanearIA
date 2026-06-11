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

export function createClassroomFacade(
  storageOrRepository?: ClassroomStoragePort | ClassroomRepository,
): ClassroomFacade {
  const repository = isClassroomRepository(storageOrRepository)
    ? storageOrRepository
    : storageOrRepository
      ? createClassroomRepository(storageOrRepository)
      : classroomRepository;

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
      return repository.createUnidad(grupoId, nombre);
    },

    async updateUnidad(id, cambios) {
      return repository.updateUnidad(id, cambios);
    },

    async deleteUnidad(id) {
      return repository.deleteUnidad(id);
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

export const classroomFacade = createClassroomFacade();

function isClassroomRepository(value?: ClassroomStoragePort | ClassroomRepository): value is ClassroomRepository {
  return Boolean(value && "readDataset" in value && "getDatasetByGrupoId" in value);
}
