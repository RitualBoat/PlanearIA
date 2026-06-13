import {
  agregarGrupo,
  guardarGrupos,
  obtenerGrupos,
  sincronizarGruposConBackend,
} from "../../services/gruposService";

// API is configured (deployed scenario).
jest.mock("../../sync/config/apiConfig", () => ({
  isAPIConfigured: () => true,
  SYNC_CONFIG: { debugMode: false },
}));

// Authenticated session: sync requires a real token.
jest.mock("../../services/auth", () => ({
  getAccessToken: jest.fn().mockResolvedValue("test-jwt-token"),
}));

// NetInfo reports NOT connected, mimicking unreliable web connectivity.
// The fix must still attempt the real request instead of gating on this.
jest.mock("@react-native-community/netinfo", () => ({
  fetch: jest.fn().mockResolvedValue({ isConnected: false, isInternetReachable: false }),
  addEventListener: jest.fn(() => jest.fn()),
}));

const mockApiRequest = jest.fn();
jest.mock("../../utils/apiClient", () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}));

const storage: Record<string, string> = {};
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn((key: string) => Promise.resolve(storage[key] ?? null)),
  setItem: jest.fn((key: string, value: string) => {
    storage[key] = value;
    return Promise.resolve();
  }),
  removeItem: jest.fn((key: string) => {
    delete storage[key];
    return Promise.resolve();
  }),
}));

function okJson(data: unknown) {
  return { ok: true, json: async () => data, text: async () => "" };
}

describe("gruposService sync (web/offline-flaky)", () => {
  beforeEach(async () => {
    Object.keys(storage).forEach((key) => delete storage[key]);
    await guardarGrupos([]);
    mockApiRequest.mockReset();
  });

  it("pushes a new group to the backend even when NetInfo says offline", async () => {
    mockApiRequest.mockResolvedValue(okJson({ data: { action: "created" } }));

    await agregarGrupo({ nombre: "Clase A", materia: "Mate" });

    const postCall = mockApiRequest.mock.calls.find(
      ([endpoint, opts]) => endpoint === "/api/grupos" && (opts as RequestInit)?.method === "POST"
    );
    expect(postCall).toBeDefined();
    const body = JSON.parse((postCall![1] as RequestInit).body as string);
    expect(body.nombre).toBe("Clase A");
  });

  it("pulls remote groups and stores them locally (cross-device)", async () => {
    // First call: process pending (none). Then GET returns a remote group.
    mockApiRequest.mockResolvedValue(
      okJson({ data: { grupos: [{ id: 99, nombre: "Clase remota" }] } })
    );

    const result = await sincronizarGruposConBackend();

    expect(result.downloaded).toBe(1);
    const local = await obtenerGrupos();
    expect(local.map((g) => g.id)).toContain(99);
  });

  it("enqueues the operation when the request fails, then keeps working offline-first", async () => {
    mockApiRequest.mockRejectedValue(new Error("network down"));

    // Should not throw to the caller.
    await expect(agregarGrupo({ nombre: "Clase B", materia: "Mate" })).resolves.toBeUndefined();

    const local = await obtenerGrupos();
    expect(local.some((g) => g.nombre === "Clase B")).toBe(true);
  });
});
