/**
 * Tests unitarios para syncEngine.ts
 *
 * Cubre:
 *  - enqueueOperation: encola, deduplica updates y borra
 *  - flushQueue: procesa ops, maneja reintentos y MAX_RETRIES
 *  - resolveConflict: Last-Write-Wins
 *  - mergeWithLocal: fusiÃ³n correcta de datos
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  enqueueOperation,
  getPendingOps,
  getFailedOps,
  clearFailedOps,
  flushQueue,
  resolveConflict,
  mergeWithLocal,
  GenericPendingOp,
} from "../../sync/services/syncEngine";

// â”€â”€â”€ Mocks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock NetInfo â€” siempre en lÃ­nea por defecto
jest.mock("@react-native-community/netinfo", () => ({
  fetch: jest.fn(() => Promise.resolve({ isConnected: true, isInternetReachable: true })),
}));

// Mock apiConfig
jest.mock("../../sync/config/apiConfig", () => ({
  API_CONFIG: {
    baseUrl: "https://test.api.com",
    apiSecret: "test-secret",
    timeout: 5000,
  },
  SYNC_CONFIG: {
    debugMode: false,
    maxRetries: 3,
    retryDelay: 100,
  },
  isAPIConfigured: () => true,
}));

// Mock fetch global
const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

// â”€â”€â”€ Utilidades de test â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const ENTITY = "test_entity";
const ENDPOINT = "/api/test";

type TestItem = { id: string; nombre: string; fechaModificacion?: string };

/** Simula que AsyncStorage.getItem devuelve los datos proporcionados */
const mockStorageGet = (data: GenericPendingOp[]) => {
  (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(data));
};

// â”€â”€â”€ Suite de pruebas â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe("syncEngine", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
  });

  // â”€â”€â”€ enqueueOperation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  describe("enqueueOperation", () => {
    it("encola una operaciÃ³n de creaciÃ³n correctamente", async () => {
      const item: TestItem = { id: "abc", nombre: "Test" };
      await enqueueOperation(ENTITY, ENDPOINT, "create", item);

      const [[, saved]] = (AsyncStorage.setItem as jest.Mock).mock.calls;
      const queue: GenericPendingOp[] = JSON.parse(saved as string);
      expect(queue).toHaveLength(1);
      expect(queue[0].type).toBe("create");
      expect(queue[0].entity).toBe(ENTITY);
      expect(queue[0].retries).toBe(0);
      expect(queue[0].failed).toBe(false);
    });

    it("deduplica operaciones update del mismo id", async () => {
      const existingOp: GenericPendingOp<TestItem> = {
        opId: "op_1",
        entity: ENTITY,
        type: "update",
        endpoint: ENDPOINT,
        payload: { id: "xyz", nombre: "Viejo" },
        createdAt: new Date().toISOString(),
        retries: 0,
        failed: false,
      };
      mockStorageGet([existingOp]);

      const updatedItem: TestItem = { id: "xyz", nombre: "Nuevo" };
      await enqueueOperation(ENTITY, ENDPOINT, "update", updatedItem);

      const setItemCalls = (AsyncStorage.setItem as jest.Mock).mock.calls;
      const lastCall = setItemCalls[setItemCalls.length - 1];
      const queue: GenericPendingOp[] = JSON.parse(lastCall[1] as string);

      // Solo debe quedar una entrada (la nueva)
      expect(queue).toHaveLength(1);
      expect((queue[0].payload as TestItem).nombre).toBe("Nuevo");
    });

    it("una operaciÃ³n delete elimina operaciones previas del mismo id", async () => {
      const existingOp: GenericPendingOp<TestItem> = {
        opId: "op_2",
        entity: ENTITY,
        type: "update",
        endpoint: ENDPOINT,
        payload: { id: "del1", nombre: "Item a borrar" },
        createdAt: new Date().toISOString(),
        retries: 0,
        failed: false,
      };
      mockStorageGet([existingOp]);

      await enqueueOperation(ENTITY, ENDPOINT, "delete", { id: "del1" } as TestItem);

      const setItemCalls = (AsyncStorage.setItem as jest.Mock).mock.calls;
      const lastCall = setItemCalls[setItemCalls.length - 1];
      const queue: GenericPendingOp[] = JSON.parse(lastCall[1] as string);
      expect(queue).toHaveLength(1);
      expect(queue[0].type).toBe("delete");
    });
  });

  // â”€â”€â”€ flushQueue â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  describe("flushQueue", () => {
    it("procesa operaciones exitosas y devuelve resultado correcto", async () => {
      const op: GenericPendingOp<TestItem> = {
        opId: "flush_op_1",
        entity: ENTITY,
        type: "create",
        endpoint: ENDPOINT,
        payload: { id: "f1", nombre: "Flush Test" },
        createdAt: new Date().toISOString(),
        retries: 0,
        failed: false,
      };
      mockStorageGet([op]);
      mockFetch.mockResolvedValueOnce({ ok: true });

      const result = await flushQueue(ENTITY);

      expect(result.processed).toBe(1);
      expect(result.skipped).toBe(0);
      expect(result.errors).toHaveLength(0);
      expect(result.success).toBe(true);
    });

    it("reencola la operaciÃ³n cuando el servidor devuelve error (< MAX_RETRIES)", async () => {
      const op: GenericPendingOp<TestItem> = {
        opId: "retry_op_1",
        entity: ENTITY,
        type: "update",
        endpoint: ENDPOINT,
        payload: { id: "r1", nombre: "Retry" },
        createdAt: new Date().toISOString(),
        retries: 0,
        failed: false,
      };
      mockStorageGet([op]);
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await flushQueue(ENTITY);

      expect(result.processed).toBe(0);
      expect(result.skipped).toBe(1);

      // Verificar que se reencola con retries+1
      const setItemCalls = (AsyncStorage.setItem as jest.Mock).mock.calls;
      const persistedQueue: GenericPendingOp[] = JSON.parse(
        setItemCalls[setItemCalls.length - 1][1] as string
      );
      expect(persistedQueue[0].retries).toBe(1);
      expect(persistedQueue[0].failed).toBe(false);
    });

    it("mueve operaciÃ³n a fallidas cuando supera MAX_RETRIES (5)", async () => {
      const op: GenericPendingOp<TestItem> = {
        opId: "max_retry_op",
        entity: ENTITY,
        type: "create",
        endpoint: ENDPOINT,
        payload: { id: "mr1", nombre: "Max Retry" },
        createdAt: new Date().toISOString(),
        retries: 4, // 4 intentos previos â†’ el prÃ³ximo fallo llega a 5
        failed: false,
      };
      mockStorageGet([op]);
      // Para failed ops (getItem para FAILED_OPS_KEY)
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify([op]));
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null); // failed ops vacÃ­o
      mockFetch.mockRejectedValueOnce(new Error("Persistent error"));

      const result = await flushQueue(ENTITY);

      expect(result.errors).toHaveLength(1);
      expect(result.success).toBe(false);
    });

    it("conserva la cola sin consumir reintentos cuando no hay conectividad", async () => {
      // Limpia mockResolvedValueOnce sin consumir de tests anteriores
      (AsyncStorage.getItem as jest.Mock).mockReset();
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const op: GenericPendingOp<TestItem> = {
        opId: "offline_op",
        entity: ENTITY,
        type: "create",
        endpoint: ENDPOINT,
        payload: { id: "o1", nombre: "Offline" },
        createdAt: new Date().toISOString(),
        retries: 0,
        failed: false,
      };
      mockStorageGet([op]);
      // El request es la prueba real de conectividad (NetInfo no es confiable)
      mockFetch.mockRejectedValueOnce(new Error("Network request failed"));

      const result = await flushQueue(ENTITY);

      expect(result.processed).toBe(0);
      expect(result.skipped).toBe(1);

      // La operacion sigue en cola, intacta (sin retry consumido)
      const setItemCalls = (AsyncStorage.setItem as jest.Mock).mock.calls;
      const persistedQueue: GenericPendingOp[] = JSON.parse(
        setItemCalls[setItemCalls.length - 1][1] as string
      );
      expect(persistedQueue).toHaveLength(1);
      expect(persistedQueue[0].retries).toBe(0);
      expect(persistedQueue[0].failed).toBe(false);
    });
  });

  // â”€â”€â”€ resolveConflict â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  describe("resolveConflict", () => {
    it("elige el documento con fecha mÃ¡s reciente", () => {
      const local: TestItem = {
        id: "c1",
        nombre: "Local",
        fechaModificacion: "2026-01-01T10:00:00.000Z",
      };
      const remote: TestItem = {
        id: "c1",
        nombre: "Remote",
        fechaModificacion: "2026-01-01T11:00:00.000Z",
      };

      const winner = resolveConflict(local, remote);
      expect(winner.nombre).toBe("Remote");
    });

    it("elige el local cuando es mÃ¡s reciente que el remoto", () => {
      const local: TestItem = {
        id: "c2",
        nombre: "Local Nuevo",
        fechaModificacion: "2026-06-15T12:00:00.000Z",
      };
      const remote: TestItem = {
        id: "c2",
        nombre: "Remote Viejo",
        fechaModificacion: "2026-06-14T08:00:00.000Z",
      };

      const winner = resolveConflict(local, remote);
      expect(winner.nombre).toBe("Local Nuevo");
    });

    it("elige el local cuando no hay fechas de modificaciÃ³n", () => {
      const local: TestItem = { id: "c3", nombre: "Local" };
      const remote: TestItem = { id: "c3", nombre: "Remote" };
      const winner = resolveConflict(local, remote);
      expect(winner.nombre).toBe("Local");
    });
  });

  // â”€â”€â”€ mergeWithLocal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  describe("mergeWithLocal", () => {
    it("agrega elementos remotos no presentes en local", () => {
      const local: TestItem[] = [{ id: "1", nombre: "Uno" }];
      const remote: TestItem[] = [{ id: "2", nombre: "Dos" }];

      const merged = mergeWithLocal(local, remote);
      expect(merged).toHaveLength(2);
    });

    it("conserva la versiÃ³n mÃ¡s reciente en caso de conflicto", () => {
      const local: TestItem[] = [
        { id: "1", nombre: "Viejo", fechaModificacion: "2026-01-01T00:00:00Z" },
      ];
      const remote: TestItem[] = [
        { id: "1", nombre: "Nuevo", fechaModificacion: "2026-06-01T00:00:00Z" },
      ];

      const merged = mergeWithLocal(local, remote);
      expect(merged).toHaveLength(1);
      expect(merged[0].nombre).toBe("Nuevo");
    });

    it("conserva elementos locales cuando no existe contraparte remota", () => {
      const local: TestItem[] = [{ id: "unique", nombre: "Solo Local" }];
      const remote: TestItem[] = [];

      const merged = mergeWithLocal(local, remote);
      expect(merged).toHaveLength(1);
      expect(merged[0].nombre).toBe("Solo Local");
    });
  });

  // â”€â”€â”€ getFailedOps y clearFailedOps â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  describe("getFailedOps y clearFailedOps", () => {
    it("retorna array vacÃ­o cuando no hay operaciones fallidas", async () => {
      (AsyncStorage.getItem as jest.Mock).mockReset();
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const failed = await getFailedOps();
      expect(failed).toEqual([]);
    });

    it("clearFailedOps elimina la clave de AsyncStorage", async () => {
      await clearFailedOps();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith("@planearia:failed_ops_v2");
    });
  });
});
