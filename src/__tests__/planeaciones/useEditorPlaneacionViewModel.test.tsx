import { Alert } from "react-native";
import { act, renderHook } from "@testing-library/react-native";
import { NivelAcademico } from "../../../types/planeacion";
import { useEditorPlaneacionViewModel } from "../../hooks/useEditorPlaneacionViewModel";

const mockNavigate = jest.fn();
const mockAgregarPlaneacion = jest.fn().mockResolvedValue(undefined);
const mockActualizarPlaneacion = jest.fn().mockResolvedValue(undefined);
const mockObtenerPlaneacion = jest.fn();

let mockRouteParams = {
  nivel: NivelAcademico.PRIMARIA,
  modo: "crear" as const,
};

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
  useRoute: () => ({ params: mockRouteParams }),
}));

jest.mock("../../sync/providers/SyncProvider", () => ({
  usePlaneaciones: () => ({
    agregarPlaneacion: mockAgregarPlaneacion,
    actualizarPlaneacion: mockActualizarPlaneacion,
    obtenerPlaneacion: mockObtenerPlaneacion,
  }),
}));

describe("useEditorPlaneacionViewModel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouteParams = {
      nivel: NivelAcademico.PRIMARIA,
      modo: "crear",
    };
  });

  it("valida campos requeridos antes de guardar", async () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(jest.fn());
    const { result } = renderHook(() => useEditorPlaneacionViewModel());

    await act(async () => {
      await result.current.handleGuardar();
    });

    expect(alertSpy).toHaveBeenCalledWith("Atención", "Por favor ingresa la asignatura");
    expect(mockAgregarPlaneacion).not.toHaveBeenCalled();
  });

  it("guarda en contexto y navega a lista", async () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(jest.fn());
    const { result } = renderHook(() => useEditorPlaneacionViewModel());

    act(() => {
      result.current.setAsignatura("Matemáticas");
      result.current.setGrado("3°");
      result.current.setTemaSesion("Fracciones equivalentes");
      result.current.setCampoFormativo("Pensamiento Matemático");
    });

    await act(async () => {
      await result.current.handleGuardar();
    });

    expect(mockAgregarPlaneacion).toHaveBeenCalledTimes(1);
    expect(mockAgregarPlaneacion).toHaveBeenCalledWith(
      expect.objectContaining({
        nivelAcademico: NivelAcademico.PRIMARIA,
        asignatura: "Matemáticas",
        grado: "3°",
        temaSesion: "Fracciones equivalentes",
        campoFormativo: "Pensamiento Matemático",
      })
    );
    expect(mockNavigate).toHaveBeenCalledWith("ListaPlaneaciones");
    expect(alertSpy).toHaveBeenCalledWith("Atención", "Planeación guardada exitosamente");
  });
});
