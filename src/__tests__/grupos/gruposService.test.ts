import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  agregarGrupo,
  actualizarGrupo,
  eliminarGrupo,
  guardarGrupos,
  obtenerGrupos,
} from "../../services/gruposService";

jest.mock("../../sync/config/apiConfig", () => ({
  API_CONFIG: {
    baseUrl: "",
    timeout: 1000,
  },
  SYNC_CONFIG: { debugMode: false },
  isAPIConfigured: () => false,
}));

// entitySync imports getAccessToken directly from authService (no barrel).
jest.mock("../../services/auth/authService", () => ({
  getAccessToken: jest.fn().mockResolvedValue(null),
}));

jest.mock("@react-native-community/netinfo", () => ({
  fetch: jest.fn().mockResolvedValue({ isConnected: true, isInternetReachable: true }),
  addEventListener: jest.fn(() => jest.fn()),
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

describe("gruposService", () => {
  // Los servicios/motor de sync registran su operacion normal via logger en
  // __DEV__; es ruido esperado, se espia y restaura por test.
  let logSpy: jest.SpyInstance;

  beforeEach(async () => {
    logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    Object.keys(storage).forEach((key) => delete storage[key]);
    await guardarGrupos([]);
    jest.clearAllMocks();
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it("persiste un grupo nuevo en AsyncStorage", async () => {
    await agregarGrupo({
      nombre: "7A - Matematicas",
      materia: "Matematicas",
      carrera: "ISC",
      semestre: 7,
      periodo: "Enero-Junio 2026",
      estado: "activo",
      cantidadAlumnos: 0,
      profesorId: 1,
      fechaCreacion: new Date(),
    });

    const grupos = await obtenerGrupos();

    expect(grupos).toHaveLength(1);
    // Cross-device-safe ids are timestamp-based, not sequential
    expect(typeof grupos[0].id).toBe("number");
    expect(grupos[0].nombre).toBe("7A - Matematicas");
    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });

  it("actualiza datos del grupo y los persiste", async () => {
    await guardarGrupos([
      {
        id: 1,
        nombre: "7A",
        materia: "Matematicas",
        carrera: "ISC",
        semestre: 7,
        periodo: "Enero-Junio 2026",
        estado: "activo",
        cantidadAlumnos: 0,
        profesorId: 1,
        fechaCreacion: new Date(),
      },
    ]);

    await actualizarGrupo(1, { nombre: "7A - Actualizado", cantidadAlumnos: 32 });

    const grupos = await obtenerGrupos();
    expect(grupos[0].nombre).toBe("7A - Actualizado");
    expect(grupos[0].cantidadAlumnos).toBe(32);
  });

  it("elimina grupo y persiste la eliminación", async () => {
    await guardarGrupos([
      {
        id: 1,
        nombre: "7A",
        materia: "Matematicas",
        carrera: "ISC",
        semestre: 7,
        periodo: "Enero-Junio 2026",
        estado: "activo",
        cantidadAlumnos: 0,
        profesorId: 1,
        fechaCreacion: new Date(),
      },
    ]);

    await eliminarGrupo(1);

    const grupos = await obtenerGrupos();
    expect(grupos).toHaveLength(0);
  });
});
