import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  enqueueOperation,
  flushQueue,
  getPendingOps,
  GenericPendingOp,
} from "../../sync/services/syncEngine";

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock("@react-native-async-storage/async-storage", () => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn(async (key: string) => store[key] || null),
    setItem: jest.fn(async (key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn(async (key: string) => {
      delete store[key];
    }),
    clear: jest.fn(async () => {
      store = {};
    }),
  };
});

// Mock NetInfo with mutable connection status
let mockIsConnected = true;
jest.mock("@react-native-community/netinfo", () => ({
  fetch: jest.fn(async () => ({
    isConnected: mockIsConnected,
    isInternetReachable: mockIsConnected,
  })),
}));

// Mock fetch global
const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

// Mock apiConfig
jest.mock("../../sync/config/apiConfig", () => ({
  API_CONFIG: {
    baseUrl: "https://test.api.com",
    timeout: 5000,
  },
  SYNC_CONFIG: {
    debugMode: false,
    maxRetries: 5,
    retryDelay: 10,
  },
  isAPIConfigured: () => true,
}));

// ─── Suite de pruebas ─────────────────────────────────────────────────────────

describe("offlineSyncFlow", () => {
  // Los servicios/motor de sync registran su operacion normal via logger en
  // __DEV__; es ruido esperado, se espia y restaura por test.
  let logSpy: jest.SpyInstance;

  beforeEach(async () => {
    logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    jest.clearAllMocks();
    await AsyncStorage.clear();
    mockIsConnected = true;
    mockFetch.mockReset();
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it("retiene operaciones en cola local mientras no hay conexion", async () => {
    // 1) Simular perdida de conexion: el request real falla (NetInfo no es
    //    confiable, la peticion es la prueba de conectividad)
    mockIsConnected = false;
    mockFetch.mockRejectedValue(new Error("Network request failed"));

    // 2) Intentar guardar un nuevo alumno y una calificacion offline
    const nuevoAlumno = { id: "a1", nombre: "Juan Perez" };
    const nuevaCalificacion = { id: "c1", alumnoId: "a1", nota: 10 };

    await enqueueOperation("alumnos", "/api/alumnos", "create", nuevoAlumno);
    await enqueueOperation("calificaciones", "/api/calificaciones", "create", nuevaCalificacion);

    // 3) Intentar sincronizar: nada se procesa, todo queda en cola
    const syncAlumnos = await flushQueue("alumnos");
    const syncCalificaciones = await flushQueue("calificaciones");

    expect(syncAlumnos.processed).toBe(0);
    expect(syncAlumnos.skipped).toBe(1);
    expect(syncCalificaciones.processed).toBe(0);
    expect(syncCalificaciones.skipped).toBe(1);

    // 4) Verificar que las operaciones siguen registradas localmente,
    //    sin consumir reintentos (no fue un rechazo del servidor)
    const pendingAlumnos = await getPendingOps("alumnos");
    const pendingCalificaciones = await getPendingOps("calificaciones");

    expect(pendingAlumnos).toHaveLength(1);
    expect(pendingCalificaciones).toHaveLength(1);
    expect(pendingAlumnos[0].type).toBe("create");
    expect(pendingAlumnos[0].retries).toBe(0);
    expect((pendingAlumnos[0].payload as typeof nuevoAlumno).nombre).toBe("Juan Perez");
  });

  it("vacia la cola y sincroniza con el backend cuando se recupera la conexion", async () => {
    // 1) Simular corte de conexion y encolar
    mockIsConnected = false;
    const nuevoAlumno = { id: "a2", nombre: "Maria Lopez" };
    await enqueueOperation("alumnos", "/api/alumnos", "create", nuevoAlumno);

    // Verificar encolamiento
    const initialPending = await getPendingOps("alumnos");
    expect(initialPending).toHaveLength(1);

    // 2) Simular recuperacion de conexion
    mockIsConnected = true;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: nuevoAlumno }),
    });

    // 3) Ejecutar flush y verificar que se realiza la peticion http
    const syncResult = await flushQueue("alumnos");

    expect(syncResult.success).toBe(true);
    expect(syncResult.processed).toBe(1);
    expect(syncResult.errors).toHaveLength(0);

    // Validar llamada fetch
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [[url, options]] = mockFetch.mock.calls;
    expect(url).toContain("/api/alumnos");
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toEqual(nuevoAlumno);

    // 4) Validar que la cola local quedo completamente vacia
    const finalPending = await getPendingOps("alumnos");
    expect(finalPending).toHaveLength(0);
  });
});
