import { act, renderHook } from "@testing-library/react-native";
import { NivelAcademico } from "../../../types/planeacion";
import { useCrearPlaneacionViewModel } from "../../hooks/useCrearPlaneacionViewModel";

const mockNavigate = jest.fn();
const mockFetch = jest.fn();

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

describe("useCrearPlaneacionViewModel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    expect((result.current.planeacionGeneradaIA as any)?.campoFormativo).toBeDefined();
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
});
