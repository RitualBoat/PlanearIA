/**
 * Servicio de Grupos
 * Acceso a datos de grupos: AsyncStorage como fuente local y el motor
 * unificado de sincronizacion (cola + pull) para la nube.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Grupo, GrupoMiembro, RolGrupo } from "../../types";
import { isAPIConfigured } from "../sync/config/apiConfig";
import { getIsOnline } from "../sync/services/connectivity";
import {
  SYNC_ENTITIES,
  queueEntityOperation,
  syncEntity,
} from "../sync/services/entitySync";
import { getPendingOps } from "../sync/services/syncEngine";
import { generateNumericId } from "../utils/generateId";
import logger from "../utils/logger";

const STORAGE_KEY = SYNC_ENTITIES.grupos.storageKey;

export type GrupoSyncStatus = "idle" | "syncing" | "synced" | "error" | "offline";

export interface GruposSyncResult {
  success: boolean;
  uploaded: number;
  downloaded: number;
  errors: string[];
  status: GrupoSyncStatus;
}

export const getPendingGruposCount = async (): Promise<number> => {
  const pending = await getPendingOps(SYNC_ENTITIES.grupos.entity);
  return pending.length;
};

export const getGruposConnectivity = async (): Promise<boolean> => {
  return getIsOnline();
};

/**
 * Sube la cola pendiente y baja la lista autoritativa desde MongoDB,
 * preservando el trabajo offline que sigue en cola.
 */
export const sincronizarGruposConBackend = async (): Promise<GruposSyncResult> => {
  if (!isAPIConfigured()) {
    return { success: true, uploaded: 0, downloaded: 0, errors: [], status: "idle" };
  }

  const outcome = await syncEntity(SYNC_ENTITIES.grupos);

  return {
    success: outcome.ok,
    uploaded: outcome.pushed,
    downloaded: outcome.pulled,
    errors: outcome.ok ? [] : ["No se pudo sincronizar grupos con el backend"],
    status: outcome.ok ? "synced" : "error",
  };
};

/**
 * Interfaz para el servicio de grupos
 */
export interface GruposService {
  obtenerGrupos: () => Promise<Grupo[]>;
  obtenerGrupoPorId: (id: number) => Promise<Grupo | null>;
  guardarGrupo: (grupo: Grupo) => Promise<void>;
  eliminarGrupo: (id: number) => Promise<void>;
}

/**
 * Obtiene todos los grupos desde el almacenamiento local
 */
export const obtenerGrupos = async (): Promise<Partial<Grupo>[]> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);

    if (stored) {
      const grupos: Partial<Grupo>[] = JSON.parse(stored);
      logger.log(`[grupos] Loaded ${grupos.length} from storage`);
      return grupos;
    }

    // No seeded sample data: an empty store means no groups yet. Remote
    // groups (if any) are pulled and merged by sincronizarGruposConBackend.
    return [];
  } catch (error) {
    logger.error("Error obteniendo grupos:", error);
    throw new Error("No se pudieron cargar los grupos");
  }
};

/**
 * Obtiene un grupo específico por ID
 */
const obtenerGrupoPorId = async (id: number): Promise<Partial<Grupo> | null> => {
  try {
    const grupos = await obtenerGrupos();
    return grupos.find((g) => g.id === id) || null;
  } catch (error) {
    logger.error(`Error obteniendo grupo ${id}:`, error);
    return null;
  }
};

/**
 * Guarda la lista completa de grupos en AsyncStorage
 */
export const guardarGrupos = async (grupos: Partial<Grupo>[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(grupos));
    logger.log(`Guardados ${grupos.length} grupos en storage`);
  } catch (error) {
    logger.error("Error guardando grupos:", error);
    throw new Error("No se pudieron guardar los grupos");
  }
};

/**
 * Agrega un nuevo grupo
 */
export const agregarGrupo = async (grupo: Partial<Grupo>): Promise<void> => {
  try {
    const grupos = await obtenerGrupos();
    const nuevoGrupo = {
      ...grupo,
      id: grupo.id ?? generateNumericId(),
      fechaCreacion: grupo.fechaCreacion || new Date(),
      fechaModificacion: new Date().toISOString(),
    };

    await guardarGrupos([...grupos, nuevoGrupo]);
    await queueEntityOperation(SYNC_ENTITIES.grupos, "create", nuevoGrupo);
    logger.log(`Grupo agregado: ${nuevoGrupo.nombre}`);
  } catch (error) {
    logger.error("Error agregando grupo:", error);
    throw new Error("No se pudo agregar el grupo");
  }
};

/**
 * Actualiza un grupo existente
 */
export const actualizarGrupo = async (id: number, actualizacion: Partial<Grupo>): Promise<void> => {
  try {
    const grupos = await obtenerGrupos();
    const grupoActualizado = grupos.find((g) => g.id === id);

    if (!grupoActualizado) {
      throw new Error("Grupo no encontrado");
    }

    const merged = {
      ...grupoActualizado,
      ...actualizacion,
      id,
      fechaModificacion: new Date().toISOString(),
    };
    const nuevosGrupos = grupos.map((g) => (g.id === id ? merged : g));

    await guardarGrupos(nuevosGrupos);
    await queueEntityOperation(SYNC_ENTITIES.grupos, "update", merged);
    logger.log(`Grupo actualizado: ${id}`);
  } catch (error) {
    logger.error("Error actualizando grupo:", error);
    throw new Error("No se pudo actualizar el grupo");
  }
};

/**
 * Elimina un grupo
 */
export const eliminarGrupo = async (id: number): Promise<void> => {
  try {
    const grupos = await obtenerGrupos();
    const nuevosGrupos = grupos.filter((g) => g.id !== id);

    await guardarGrupos(nuevosGrupos);
    await queueEntityOperation(SYNC_ENTITIES.grupos, "delete", { id });
    logger.log(`Grupo eliminado: ${id}`);
  } catch (error) {
    logger.error("Error eliminando grupo:", error);
    throw new Error("No se pudo eliminar el grupo");
  }
};

/**
 * Invita a un docente al grupo
 */
export const invitarDocenteAGrupo = async (
  grupoId: number,
  colaborador: { usuarioId: string; nombre: string; email: string; avatar?: string; rol: RolGrupo }
): Promise<void> => {
  const grupos = await obtenerGrupos();
  const grupoActual = grupos.find((g) => g.id === grupoId);
  if (!grupoActual) throw new Error("Grupo no encontrado");

  const miembros = grupoActual.miembros || [];
  if (miembros.some((m) => m.usuarioId === colaborador.usuarioId)) {
    throw new Error("El docente ya es miembro o tiene invitación pendiente");
  }

  const nuevoMiembro: GrupoMiembro = {
    ...colaborador,
    estado: "pendiente",
    fechaInvitacion: new Date().toISOString(),
  };

  await actualizarGrupo(grupoId, { miembros: [...miembros, nuevoMiembro] });
};

/**
 * Responde a una invitación de grupo
 */
export const responderInvitacionGrupo = async (
  grupoId: number,
  usuarioId: string,
  aceptar: boolean
): Promise<void> => {
  const grupos = await obtenerGrupos();
  const grupoActual = grupos.find((g) => g.id === grupoId);
  if (!grupoActual) throw new Error("Grupo no encontrado");

  const miembros = grupoActual.miembros || [];
  const miembroIndex = miembros.findIndex((m) => m.usuarioId === usuarioId);

  if (miembroIndex === -1) throw new Error("Invitación no encontrada");

  let nuevosMiembros = [...miembros];
  if (aceptar) {
    nuevosMiembros[miembroIndex] = { ...nuevosMiembros[miembroIndex], estado: "activo" };
  } else {
    nuevosMiembros = nuevosMiembros.filter((m) => m.usuarioId !== usuarioId);
  }

  await actualizarGrupo(grupoId, { miembros: nuevosMiembros });
};

/**
 * Cambia el rol de un miembro
 */
export const cambiarRolDocenteGrupo = async (
  grupoId: number,
  usuarioId: string,
  nuevoRol: RolGrupo
): Promise<void> => {
  const grupos = await obtenerGrupos();
  const grupoActual = grupos.find((g) => g.id === grupoId);
  if (!grupoActual) throw new Error("Grupo no encontrado");

  const miembros = grupoActual.miembros || [];
  const miembroIndex = miembros.findIndex((m) => m.usuarioId === usuarioId);

  if (miembroIndex === -1) throw new Error("Colaborador no encontrado");

  const nuevosMiembros = [...miembros];
  nuevosMiembros[miembroIndex] = { ...nuevosMiembros[miembroIndex], rol: nuevoRol };

  await actualizarGrupo(grupoId, { miembros: nuevosMiembros });
};

/**
 * Elimina a un miembro del grupo
 */
export const eliminarDocenteGrupo = async (
  grupoId: number,
  usuarioId: string
): Promise<void> => {
  const grupos = await obtenerGrupos();
  const grupoActual = grupos.find((g) => g.id === grupoId);
  if (!grupoActual) throw new Error("Grupo no encontrado");

  const miembros = grupoActual.miembros || [];
  const nuevosMiembros = miembros.filter((m) => m.usuarioId !== usuarioId);

  await actualizarGrupo(grupoId, { miembros: nuevosMiembros });
};

/**
 * Filtra grupos por búsqueda (lógica de negocio)
 */
export const filtrarGruposPorBusqueda = (
  grupos: Partial<Grupo>[],
  busqueda: string
): Partial<Grupo>[] => {
  if (!busqueda || busqueda.trim() === "") {
    return grupos;
  }

  const busquedaLower = busqueda.toLowerCase().trim();

  return grupos.filter(
    (grupo) =>
      grupo.nombre?.toLowerCase().includes(busquedaLower) ||
      grupo.materia?.toLowerCase().includes(busquedaLower) ||
      grupo.carrera?.toLowerCase().includes(busquedaLower)
  );
};
