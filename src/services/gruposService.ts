/**
 * Servicio de Grupos
 * Maneja el acceso a datos de grupos (API, AsyncStorage, etc.)
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { Grupo, GrupoMiembro, RolGrupo } from "../../types";
import { isAPIConfigured } from "../sync/config/apiConfig";
import { apiRequest } from "../utils/apiClient";
import logger from "../utils/logger";

const STORAGE_KEY = "@planearia:grupos";
const PENDING_SYNC_KEY = "@planearia:grupos_pending_ops";

type GrupoOperationType = "create" | "update" | "delete";

interface GrupoPendingOperation {
  id: string;
  type: GrupoOperationType;
  data: Partial<Grupo>;
  timestamp: string;
  retries: number;
}

export type GrupoSyncStatus = "idle" | "syncing" | "synced" | "error" | "offline";

export interface GruposSyncResult {
  success: boolean;
  uploaded: number;
  downloaded: number;
  errors: string[];
  status: GrupoSyncStatus;
}

const generateOperationId = (): string =>
  `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

const checkConnectivity = async (): Promise<boolean> => {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected === true && state.isInternetReachable !== false;
  } catch {
    return false;
  }
};

// Uses the shared apiClient so every grupos request carries the JWT
// (Authorization header). The previous local apiRequest only sent X-API-Key,
// which bypassed per-user isolation and left grupos un-attributed.

const getPendingSyncOperations = async (): Promise<GrupoPendingOperation[]> => {
  const data = await AsyncStorage.getItem(PENDING_SYNC_KEY);
  return data ? (JSON.parse(data) as GrupoPendingOperation[]) : [];
};

const savePendingSyncOperations = async (operations: GrupoPendingOperation[]): Promise<void> => {
  await AsyncStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(operations));
};

const enqueuePendingOperation = async (
  type: GrupoOperationType,
  data: Partial<Grupo>
): Promise<void> => {
  const pending = await getPendingSyncOperations();

  const filtered = pending.filter((op) => {
    if (type === "delete" && op.data.id === data.id) {
      return false;
    }
    if (type === "update" && op.type === "update" && op.data.id === data.id) {
      return false;
    }
    return true;
  });

  filtered.push({
    id: generateOperationId(),
    type,
    data,
    timestamp: new Date().toISOString(),
    retries: 0,
  });

  await savePendingSyncOperations(filtered);
};

const executeRemoteOperation = async (
  type: GrupoOperationType,
  data: Partial<Grupo>
): Promise<void> => {
  if (type === "delete") {
    if (data.id === undefined) {
      throw new Error("ID de grupo requerido para eliminar");
    }
    const response = await apiRequest(`/api/grupos?id=${data.id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`DELETE /api/grupos falló: ${response.status} ${text}`);
    }
    return;
  }

  const method = type === "create" ? "POST" : "PUT";
  const response = await apiRequest("/api/grupos", {
    method,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${method} /api/grupos falló: ${response.status} ${text}`);
  }
};

const syncSingleOperation = async (
  type: GrupoOperationType,
  data: Partial<Grupo>
): Promise<void> => {
  if (!isAPIConfigured()) return;

  // Offline-first by attempt, not by pre-check: NetInfo is unreliable on web,
  // so try the real request and only enqueue when it actually fails.
  try {
    await executeRemoteOperation(type, data);
  } catch {
    await enqueuePendingOperation(type, data);
  }
};

export const getPendingGruposCount = async (): Promise<number> => {
  const pending = await getPendingSyncOperations();
  return pending.length;
};

export const getGruposConnectivity = async (): Promise<boolean> => {
  return checkConnectivity();
};

const processPendingOperations = async (): Promise<{
  uploaded: number;
  errors: string[];
}> => {
  const pending = await getPendingSyncOperations();

  if (pending.length === 0) {
    return { uploaded: 0, errors: [] };
  }

  const keep: GrupoPendingOperation[] = [];
  const errors: string[] = [];
  let uploaded = 0;

  for (const op of pending) {
    try {
      await executeRemoteOperation(op.type, op.data);
      uploaded += 1;
    } catch (error) {
      const retries = op.retries + 1;
      errors.push(`${op.type} grupo ${String(op.data.id ?? "sin-id")}: ${String(error)}`);

      if (retries < 3) {
        keep.push({ ...op, retries });
      }
    }
  }

  await savePendingSyncOperations(keep);
  return { uploaded, errors };
};

export const sincronizarGruposConBackend = async (): Promise<GruposSyncResult> => {
  const baseResult: GruposSyncResult = {
    success: true,
    uploaded: 0,
    downloaded: 0,
    errors: [],
    status: "idle",
  };

  if (!isAPIConfigured()) {
    return baseResult;
  }

  // Do not gate the pull/push on NetInfo (unreliable on web). Attempt the
  // requests; genuine network failures fall through to the catch below.
  try {
    const pendingResult = await processPendingOperations();

    const response = await apiRequest("/api/grupos?limit=200", {
      method: "GET",
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`GET /api/grupos falló: ${response.status} ${text}`);
    }

    const payload = await response.json();
    const gruposRemotos = (payload?.data?.grupos ?? []) as Partial<Grupo>[];
    await guardarGrupos(gruposRemotos);

    return {
      success: pendingResult.errors.length === 0,
      uploaded: pendingResult.uploaded,
      downloaded: gruposRemotos.length,
      errors: pendingResult.errors,
      status: pendingResult.errors.length === 0 ? "synced" : "error",
    };
  } catch (error) {
    return {
      success: false,
      uploaded: 0,
      downloaded: 0,
      errors: [String(error)],
      status: "error",
    };
  }
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
 * En producción, esto haría una llamada a la API
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
    logger.error(" Error obteniendo grupos:", error);
    throw new Error("No se pudieron cargar los grupos");
  }
};

/**
 * Obtiene un grupo específico por ID
 */
export const obtenerGrupoPorId = async (id: number): Promise<Partial<Grupo> | null> => {
  try {
    const grupos = await obtenerGrupos();
    return grupos.find((g) => g.id === id) || null;
  } catch (error) {
    logger.error(` Error obteniendo grupo ${id}:`, error);
    return null;
  }
};

/**
 * Guarda la lista completa de grupos en AsyncStorage
 */
export const guardarGrupos = async (grupos: Partial<Grupo>[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(grupos));
    logger.log(` Guardados ${grupos.length} grupos en storage`);
  } catch (error) {
    logger.error(" Error guardando grupos:", error);
    throw new Error("No se pudieron guardar los grupos");
  }
};

/**
 * Agrega un nuevo grupo
 */
export const agregarGrupo = async (grupo: Partial<Grupo>): Promise<void> => {
  try {
    const grupos = await obtenerGrupos();
    const nuevoId = Math.max(...grupos.map((g) => g.id || 0), 0) + 1;
    const nuevoGrupo = {
      ...grupo,
      id: nuevoId,
      fechaCreacion: grupo.fechaCreacion || new Date(),
    };

    await guardarGrupos([...grupos, nuevoGrupo]);
    await syncSingleOperation("create", nuevoGrupo);
    logger.log(` Grupo agregado: ${nuevoGrupo.nombre}`);
  } catch (error) {
    logger.error(" Error agregando grupo:", error);
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

    const merged = { ...grupoActualizado, ...actualizacion, id };
    const nuevosGrupos = grupos.map((g) => (g.id === id ? merged : g));

    await guardarGrupos(nuevosGrupos);
    await syncSingleOperation("update", merged);
    logger.log(` Grupo actualizado: ${id}`);
  } catch (error) {
    logger.error(" Error actualizando grupo:", error);
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
    await syncSingleOperation("delete", { id });
    logger.log(` Grupo eliminado: ${id}`);
  } catch (error) {
    logger.error(" Error eliminando grupo:", error);
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
