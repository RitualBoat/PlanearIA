import { Alert } from "react-native";
import { act, renderHook, waitFor } from "@testing-library/react-native";
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
  const planeacionExistente = {
    id: "plan-123",
    nivelAcademico: NivelAcademico.PRIMARIA,
    asignatura: "Español",
    grado: "4°",
    grupo: "A",
    fecha: "2024-06-10T00:00:00.000Z",
    horaInicio: "09:00",
    duracionTotal: 60,
    unidadTematica: "Comprensión lectora",
    temaSesion: "Textos narrativos",
    aprendizajesEsperados: ["Identifica ideas principales"],
    actividades: [
      { tipo: "inicio" as const, descripcion: "Diagnóstico", duracion: 10 },
      { tipo: "desarrollo" as const, descripcion: "Lectura guiada", duracion: 40 },
      { tipo: "cierre" as const, descripcion: "Síntesis", duracion: 10 },
    ],
    recursos: ["Libro de texto"],
    evaluacion: "Rúbrica",
    evidencias: ["Resumen"],
    observaciones: "Sin observaciones",
    fechaCreacion: "2024-06-01T12:00:00.000Z",
    fechaModificacion: "2024-06-01T12:00:00.000Z",
    campoFormativo: "Lenguaje y Comunicación",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRouteParams = {
      nivel: NivelAcademico.PRIMARIA,
      modo: "crear",
    };
    mockObtenerPlaneacion.mockReturnValue(undefined);
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

  it("carga datos existentes en modo editar", async () => {
    mockRouteParams = {
      nivel: NivelAcademico.PRIMARIA,
      modo: "editar",
      planeacionId: "plan-123",
    };
    mockObtenerPlaneacion.mockReturnValue(planeacionExistente);

    const { result } = renderHook(() => useEditorPlaneacionViewModel());

    await waitFor(() => {
      expect(result.current.asignatura).toBe("Español");
      expect(result.current.grado).toBe("4°");
      expect(result.current.temaSesion).toBe("Textos narrativos");
      expect(result.current.campoFormativo).toBe("Lenguaje y Comunicación");
    });
  });

  it("actualiza planeación en modo editar y refresca fechaModificacion", async () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(jest.fn());
    mockRouteParams = {
      nivel: NivelAcademico.PRIMARIA,
      modo: "editar",
      planeacionId: "plan-123",
    };
    mockObtenerPlaneacion.mockReturnValue(planeacionExistente);

    const { result } = renderHook(() => useEditorPlaneacionViewModel());

    await waitFor(() => {
      expect(result.current.temaSesion).toBe("Textos narrativos");
    });

    act(() => {
      result.current.setTemaSesion("Textos informativos");
    });

    await act(async () => {
      await result.current.handleGuardar();
    });

    expect(mockAgregarPlaneacion).not.toHaveBeenCalled();
    expect(mockActualizarPlaneacion).toHaveBeenCalledTimes(1);
    expect(mockActualizarPlaneacion).toHaveBeenCalledWith(
      "plan-123",
      expect.objectContaining({
        id: "plan-123",
        temaSesion: "Textos informativos",
        fechaCreacion: "2024-06-01T12:00:00.000Z",
      })
    );

    const payload = mockActualizarPlaneacion.mock.calls[0][1];
    expect(payload.fechaModificacion).not.toBe(planeacionExistente.fechaModificacion);
    expect(Number.isNaN(Date.parse(payload.fechaModificacion))).toBe(false);
    expect(mockNavigate).toHaveBeenCalledWith("ListaPlaneaciones");
    expect(alertSpy).toHaveBeenCalledWith("Atención", "Planeación actualizada exitosamente");
  });
});
