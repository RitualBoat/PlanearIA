import { act, renderHook } from "@testing-library/react-native";
import { NivelAcademico } from "../../../types/planeacionLegacy";
import { NivelAcademico as NivelAcademicoV2 } from "../../../types/planeacionV2";
import { useCrearPlaneacionViewModel } from "../../hooks/useCrearPlaneacionViewModel";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

const mockNavigate = jest.fn();
const mockFetch = jest.fn();
const mockForceSync = jest.fn();
const mockCrear = jest.fn();

(global as typeof globalThis & { fetch: typeof fetch }).fetch = mockFetch as typeof fetch;

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock("../../sync/config/apiConfig", () => ({
  API_CONFIG: {
    baseUrl: "https://backend.test",
    timeout: 15000,
  },
}));

jest.mock("../../services/auth/authService", () => ({
  getAccessToken: jest.fn(() => Promise.resolve("jwt-test")),
}));

jest.mock("../../context/PlaneacionesContext", () => ({
  usePlaneaciones: () => ({
    crear: mockCrear,
    forceSync: mockForceSync,
  }),
}));

jest.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    usuario: {
      id: "test-user-id",
      nombre: "Usuario Test",
    },
  }),
}));

describe("useCrearPlaneacionViewModel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockForceSync.mockResolvedValue(undefined);
    mockCrear.mockResolvedValue(undefined);
  });

  it("abre modal de nivel y navega al editor al seleccionar nivel", async () => {
    const { result } = renderHook(() => useCrearPlaneacionViewModel());

    // El ViewModel ejecuta efectos async al montar; sin este flush su
    // actualizacion inicial resuelve fuera de act().
    await act(async () => {});

    act(() => {
      result.current.handleCrearDesdeCero();
    });

    expect(result.current.showNivelModal).toBe(true);

    act(() => {
      result.current.handleSeleccionarNivel(NivelAcademico.SECUNDARIA);
    });

    expect(result.current.showNivelModal).toBe(false);
    expect(mockNavigate).toHaveBeenCalledWith("DocEditor", {
      modo: "crear",
      nivelAcademico: NivelAcademicoV2.SECUNDARIA,
    });
  });

  it("genera planeacion con IA y mapea respuesta al modelo", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          planeacion: {
            asignatura: "Matematicas",
            actividades: [
              { tipo: "inicio", descripcion: "Repaso breve", duracion: 10 },
              { tipo: "desarrollo", descripcion: "Resolucion de ejercicios", duracion: 30 },
              { tipo: "cierre", descripcion: "Reflexion final", duracion: 10 },
            ],
          },
        },
      }),
    });

    const { result } = renderHook(() => useCrearPlaneacionViewModel());

    act(() => {
      result.current.setPromptIA("Genera una planeacion de fracciones para 3ro de primaria");
      result.current.setNivelIA(NivelAcademico.PRIMARIA);
    });

    await act(async () => {
      await result.current.handleGenerarConIA();
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "https://backend.test/api/planeaciones/generar",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer jwt-test",
        }),
      })
    );
    expect(mockFetch.mock.calls[0][1].headers).not.toHaveProperty("X-API-Key");

    expect(result.current.iaError).toBe("");
    expect(result.current.planeacionGeneradaIA).not.toBeNull();
    expect(result.current.planeacionGeneradaIA?.nivelAcademico).toBe(NivelAcademico.PRIMARIA);
    expect(result.current.showPreviewModal).toBe(true);
    expect((result.current.planeacionGeneradaIA as any)?.campoFormativo).toBeDefined();
  });

  it("mapea respuesta de preparatoria y completa defaults faltantes", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          planeacion: {
            asignatura: "Fisica",
            competenciasGenericas: ["Piensa critica y reflexivamente"],
            competenciasDisciplinares: ["Explica fenomenos naturales"],
          },
        },
      }),
    });

    const { result } = renderHook(() => useCrearPlaneacionViewModel());

    act(() => {
      result.current.setPromptIA("Genera una planeacion de fisica para preparatoria");
      result.current.setNivelIA(NivelAcademico.PREPARATORIA);
    });

    await act(async () => {
      await result.current.handleGenerarConIA();
    });

    const planeacion = result.current.planeacionGeneradaIA;

    expect(planeacion).not.toBeNull();
    expect(planeacion?.nivelAcademico).toBe(NivelAcademico.PREPARATORIA);
    expect(planeacion?.actividades).toHaveLength(3);
    expect(planeacion?.evaluacion).toBe("Evaluación formativa");
    expect((planeacion as any)?.competenciasGenericas).toEqual(["Piensa critica y reflexivamente"]);
    expect((planeacion as any)?.competenciasDisciplinares).toEqual(["Explica fenomenos naturales"]);
  });

  it("muestra error cuando el backend responde error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false, error: "Error IA" }),
    });

    const { result } = renderHook(() => useCrearPlaneacionViewModel());

    act(() => {
      result.current.setPromptIA("Genera una planeacion valida para secundaria");
    });

    await act(async () => {
      try {
        await result.current.handleGenerarConIA();
      } catch {
        // El ViewModel no debe propagar excepcion al UI.
      }
    });

    expect(result.current.iaError).toBe("Error IA");
  });

  it("guarda y sincroniza la planeacion generada", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          planeacion: {
            asignatura: "Historia",
            actividades: [
              { tipo: "inicio", descripcion: "Inicio", duracion: 10 },
              { tipo: "desarrollo", descripcion: "Desarrollo", duracion: 30 },
              { tipo: "cierre", descripcion: "Cierre", duracion: 10 },
            ],
          },
        },
      }),
    });

    const { result } = renderHook(() => useCrearPlaneacionViewModel());

    act(() => {
      result.current.setPromptIA("Genera una planeacion de historia para secundaria");
    });

    await act(async () => {
      await result.current.handleGenerarConIA();
    });

    await act(async () => {
      await result.current.handleGuardarPlaneacionIA();
    });

    expect(mockCrear).toHaveBeenCalledTimes(1);
    expect(mockForceSync).toHaveBeenCalledTimes(1);
    expect(result.current.showPreviewModal).toBe(false);
  });

  it("abre editor con la planeacion IA generada", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          planeacion: {
            asignatura: "Quimica",
            actividades: [
              { tipo: "inicio", descripcion: "Inicio", duracion: 10 },
              { tipo: "desarrollo", descripcion: "Desarrollo", duracion: 30 },
              { tipo: "cierre", descripcion: "Cierre", duracion: 10 },
            ],
          },
        },
      }),
    });

    const { result } = renderHook(() => useCrearPlaneacionViewModel());

    act(() => {
      result.current.setPromptIA("Genera una planeacion de quimica para preparatoria");
      result.current.setNivelIA(NivelAcademico.PREPARATORIA);
    });

    await act(async () => {
      await result.current.handleGenerarConIA();
    });

    await act(async () => {
      await result.current.handleEditarPlaneacionIA();
    });

    expect(mockCrear).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(
      "DocEditor",
      expect.objectContaining({
        modo: "editar",
        nivelAcademico: NivelAcademicoV2.PREPARATORIA,
      })
    );
  });

  it("expone metadata de plantillas base para galeria local", async () => {
    const { result } = renderHook(() => useCrearPlaneacionViewModel());

    // Mismo flush de los efectos async iniciales del ViewModel.
    await act(async () => {});

    const baseSection = result.current.sections.find((section) => section.id === "base");

    expect(baseSection).toBeTruthy();
    expect(baseSection?.items.length).toBeGreaterThan(0);
    expect(baseSection?.items[0].etiquetas?.length).toBeGreaterThan(0);
    expect(baseSection?.items[0].compatibilidad).toEqual({
      web: true,
      android: true,
      ios: true,
    });
  });

  it("abrir con IA desde selector crea doc V2 y navega a DocEditor", async () => {
    const { result } = renderHook(() => useCrearPlaneacionViewModel());

    await act(async () => {
      await result.current.handleGenerarConIADesdeSelector();
    });

    expect(mockCrear).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(
      "DocEditor",
      expect.objectContaining({
        modo: "editar",
        planeacionId: expect.any(String),
      })
    );
  });
});
