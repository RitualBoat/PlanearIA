/**
 * Servicio de Grupos
 * Maneja el acceso a datos de grupos (API, AsyncStorage, etc.)
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { Grupo } from "../../types";
import { API_CONFIG, isAPIConfigured } from "../sync/config/apiConfig";
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

const apiRequest = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "X-API-Key": API_CONFIG.apiSecret,
    ...options.headers,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

  try {
    const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

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

  const isOnline = await checkConnectivity();
  if (!isOnline) {
    await enqueuePendingOperation(type, data);
    return;
  }

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

  const isOnline = await checkConnectivity();
  if (!isOnline) {
    return { ...baseResult, success: false, status: "offline" };
  }

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
    // Primero intentar cargar desde AsyncStorage
    const stored = await AsyncStorage.getItem(STORAGE_KEY);

    if (stored) {
      const grupos: Partial<Grupo>[] = JSON.parse(stored);
      logger.log(`[grupos] Loaded ${grupos.length} from storage`);
      return grupos;
    }

    // Si no hay datos guardados, devolver datos de ejemplo
    // En producción, aquí se haría una llamada a la API
    const gruposDefault: Partial<Grupo>[] = [
      {
        id: 1,
        nombre: "7A - Matemáticas Avanzadas",
        materia: "Matemáticas Avanzadas",
        carrera: "ISC",
        semestre: 7,
        cantidadAlumnos: 28,
        estado: "activo",
        periodo: "Enero-Junio 2024",
      },
      {
        id: 2,
        nombre: "5B - Programación Web",
        materia: "Programación Web",
        carrera: "ITICS",
        semestre: 5,
        cantidadAlumnos: 32,
        estado: "activo",
        periodo: "Enero-Junio 2024",
      },
      {
        id: 3,
        nombre: "3A - Estructuras de Datos",
        materia: "Estructuras de Datos",
        carrera: "ISC",
        semestre: 3,
        cantidadAlumnos: 25,
        estado: "activo",
        periodo: "Enero-Junio 2024",
      },
    ];

    // Guardar los datos de ejemplo en storage
    await guardarGrupos(gruposDefault);

    return gruposDefault;
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
