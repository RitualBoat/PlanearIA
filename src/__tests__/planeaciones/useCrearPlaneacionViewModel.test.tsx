import { act, renderHook } from "@testing-library/react-native";
import { NivelAcademico } from "../../../types/planeacion";
import { useCrearPlaneacionViewModel } from "../../hooks/useCrearPlaneacionViewModel";

const mockNavigate = jest.fn();
const mockFetch = jest.fn();
const mockAgregarPlaneacion = jest.fn();
const mockObtenerPlaneacion = jest.fn();
const mockForceSync = jest.fn();

(global as typeof globalThis & { fetch: typeof fetch }).fetch = mockFetch as typeof fetch;

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock("../../sync/config/apiConfig", () => ({
  API_CONFIG: {
    baseUrl: "https://backend.test",
    apiSecret: "test-secret",
    timeout: 15000,
  },
}));

jest.mock("../../sync/providers/SyncProvider", () => ({
  usePlaneaciones: () => ({
    agregarPlaneacion: mockAgregarPlaneacion,
    obtenerPlaneacion: mockObtenerPlaneacion,
    forceSync: mockForceSync,
  }),
}));

describe("useCrearPlaneacionViewModel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockObtenerPlaneacion.mockReturnValue(undefined);
    mockForceSync.mockResolvedValue(undefined);
    mockAgregarPlaneacion.mockResolvedValue(undefined);
  });

  it("abre modal de nivel y navega al editor al seleccionar nivel", () => {
    const { result } = renderHook(() => useCrearPlaneacionViewModel());

    act(() => {
      result.current.handleCrearDesdeCero();
    });

    expect(result.current.showNivelModal).toBe(true);

    act(() => {
      result.current.handleSeleccionarNivel(NivelAcademico.SECUNDARIA);
    });

    expect(result.current.showNivelModal).toBe(false);
    expect(mockNavigate).toHaveBeenCalledWith("EditorPlaneacion", {
      nivel: NivelAcademico.SECUNDARIA,
      modo: "crear",
    });
  });

  it("genera planeación con IA y mapea respuesta al modelo", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          planeacion: {
            asignatura: "Matemáticas",
            actividades: [
              { tipo: "inicio", descripcion: "Repaso breve", duracion: 10 },
              { tipo: "desarrollo", descripcion: "Resolución de ejercicios", duracion: 30 },
              { tipo: "cierre", descripcion: "Reflexión final", duracion: 10 },
            ],
          },
        },
      }),
    });

    const { result } = renderHook(() => useCrearPlaneacionViewModel());

    act(() => {
      result.current.setPromptIA("Genera una planeación de fracciones para 3ro de primaria");
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
          "X-API-Key": "test-secret",
        }),
      })
    );

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
            asignatura: "Física",
            competenciasGenericas: ["Piensa crítica y reflexivamente"],
            competenciasDisciplinares: ["Explica fenómenos naturales"],
          },
        },
      }),
    });

    const { result } = renderHook(() => useCrearPlaneacionViewModel());

    act(() => {
      result.current.setPromptIA("Genera una planeación de física para preparatoria");
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
    expect((planeacion as any)?.competenciasGenericas).toEqual(["Piensa crítica y reflexivamente"]);
    expect((planeacion as any)?.competenciasDisciplinares).toEqual(["Explica fenómenos naturales"]);
  });

  it("muestra error cuando el backend responde error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false, error: "Error IA" }),
    });

    const { result } = renderHook(() => useCrearPlaneacionViewModel());

    act(() => {
      result.current.setPromptIA("Genera una planeación válida para secundaria");
    });

    await act(async () => {
      try {
        await result.current.handleGenerarConIA();
      } catch {
        // El ViewModel nunca debe propagar excepción al UI
      }
    });

    expect(result.current.iaError).toBe("Error IA");
  });

  it("guarda y sincroniza la planeación generada", async () => {
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
      result.current.setPromptIA("Genera una planeación de historia para secundaria");
    });

    await act(async () => {
      await result.current.handleGenerarConIA();
    });

    await act(async () => {
      await result.current.handleGuardarPlaneacionIA();
    });

    expect(mockAgregarPlaneacion).toHaveBeenCalledTimes(1);
    expect(mockForceSync).toHaveBeenCalledTimes(1);
    expect(result.current.showPreviewModal).toBe(false);
  });

  it("abre editor con la planeación IA generada", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          planeacion: {
            asignatura: "Química",
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
      result.current.setPromptIA("Genera una planeación de química para preparatoria");
      result.current.setNivelIA(NivelAcademico.PREPARATORIA);
    });

    await act(async () => {
      await result.current.handleGenerarConIA();
    });

    await act(async () => {
      await result.current.handleEditarPlaneacionIA();
    });

    expect(mockAgregarPlaneacion).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(
      "EditorPlaneacion",
      expect.objectContaining({
        nivel: NivelAcademico.PREPARATORIA,
        modo: "editar",
      })
    );
  });
});
