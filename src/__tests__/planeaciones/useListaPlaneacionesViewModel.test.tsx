import { Alert } from "react-native";
import { act, renderHook } from "@testing-library/react-native";
import { useListaPlaneacionesViewModel } from "../../hooks/useListaPlaneacionesViewModel";

const mockNavigate = jest.fn();
const mockEliminarPlaneacion = jest.fn().mockResolvedValue(undefined);
const mockFiltrarPlaneaciones = jest.fn();
const mockPlaneaciones: any[] = [];

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
    mockFiltrarPlaneaciones.mockReturnValue(mockPlaneaciones);
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
});
