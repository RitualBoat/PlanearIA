import { Alert } from "react-native";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { NivelAcademico } from "../../../types/planeacion";
import { useListaPlaneacionesViewModel } from "../../hooks/useListaPlaneacionesViewModel";

const mockNavigate = jest.fn();
const mockEliminarPlaneacion = jest.fn().mockResolvedValue(undefined);
const mockFiltrarPlaneaciones = jest.fn();
let mockPlaneaciones: any[] = [];

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock("../../sync/providers/SyncProvider", () => ({
  usePlaneaciones: () => ({
    planeaciones: mockPlaneaciones,
    filtrarPlaneaciones: mockFiltrarPlaneaciones,
    eliminarPlaneacion: mockEliminarPlaneacion,
    clonarPlaneacion: jest.fn(),
  }),
}));

describe("useListaPlaneacionesViewModel - eliminación", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPlaneaciones = [
      {
        id: "p1",
        nivelAcademico: NivelAcademico.PRIMARIA,
        asignatura: "Matemáticas",
        grado: "3°",
      },
      {
        id: "p2",
        nivelAcademico: NivelAcademico.SECUNDARIA,
        asignatura: "Historia",
        grado: "1°",
      },
    ];

    mockFiltrarPlaneaciones.mockImplementation((filtros: any) => {
      return mockPlaneaciones.filter((item) => {
        if (filtros.nivelAcademico && item.nivelAcademico !== filtros.nivelAcademico) {
          return false;
        }
        if (
          filtros.asignatura &&
          !item.asignatura.toLowerCase().includes(String(filtros.asignatura).toLowerCase())
        ) {
          return false;
        }
        if (filtros.grado && item.grado !== filtros.grado) {
          return false;
        }
        return true;
      });
    });
  });

  it("muestra diálogo de confirmación al eliminar", () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(jest.fn());
    const { result } = renderHook(() => useListaPlaneacionesViewModel());

    act(() => {
      result.current.handleEliminar("plan-1");
    });

    expect(alertSpy).toHaveBeenCalledWith(
      "Eliminar Planeación",
      "¿Estás seguro de que deseas eliminar esta planeación? Esta acción no se puede deshacer.",
      expect.arrayContaining([
        expect.objectContaining({ text: "Cancelar", style: "cancel" }),
        expect.objectContaining({ text: "Confirmar" }),
      ])
    );
  });

  it("elimina al confirmar", async () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(jest.fn());
    const { result } = renderHook(() => useListaPlaneacionesViewModel());

    act(() => {
      result.current.handleEliminar("plan-2");
    });

    const firstCallArgs = alertSpy.mock.calls[0];
    const buttons = (firstCallArgs[2] || []) as Array<{
      text?: string;
      onPress?: () => void | Promise<void>;
    }>;
    const confirmButton = buttons.find((button) => button.text === "Confirmar");

    await act(async () => {
      await confirmButton?.onPress?.();
    });

    expect(mockEliminarPlaneacion).toHaveBeenCalledWith("plan-2");
    expect(alertSpy).toHaveBeenCalledWith("Eliminada", "Planeación eliminada correctamente");
  });

  it("no elimina al cancelar", async () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(jest.fn());
    const { result } = renderHook(() => useListaPlaneacionesViewModel());

    act(() => {
      result.current.handleEliminar("plan-3");
    });

    const firstCallArgs = alertSpy.mock.calls[0];
    const buttons = (firstCallArgs[2] || []) as Array<{
      text?: string;
      onPress?: () => void | Promise<void>;
    }>;
    const cancelButton = buttons.find((button) => button.text === "Cancelar");

    await act(async () => {
      await cancelButton?.onPress?.();
    });

    expect(mockEliminarPlaneacion).not.toHaveBeenCalled();
  });

  it("aplica filtros por nivel", async () => {
    const { result } = renderHook(() => useListaPlaneacionesViewModel());

    act(() => {
      result.current.setFiltroNivel(NivelAcademico.SECUNDARIA);
    });

    act(() => {
      result.current.aplicarFiltros();
    });

    await waitFor(() => {
      expect(result.current.planeacionesFiltradas).toHaveLength(1);
      expect(result.current.planeacionesFiltradas[0].id).toBe("p2");
    });
  });

  it("aplica búsqueda por asignatura", async () => {
    const { result } = renderHook(() => useListaPlaneacionesViewModel());

    act(() => {
      result.current.setFiltroAsignatura("mate");
    });

    act(() => {
      result.current.aplicarFiltros();
    });

    await waitFor(() => {
      expect(result.current.planeacionesFiltradas).toHaveLength(1);
      expect(result.current.planeacionesFiltradas[0].id).toBe("p1");
    });
  });

  it("navega a pantalla de exportación", () => {
    const { result } = renderHook(() => useListaPlaneacionesViewModel());

    act(() => {
      result.current.handleExportar("p2");
    });

    expect(mockNavigate).toHaveBeenCalledWith("ExportarPlaneacion", {
      planeacionId: "p2",
    });
  });
});
