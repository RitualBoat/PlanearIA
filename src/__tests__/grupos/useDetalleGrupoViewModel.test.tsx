import { act, renderHook } from "@testing-library/react-native";
import { useDetalleGrupoViewModel } from "../../hooks/useDetalleGrupoViewModel";

const mockNavigate = jest.fn();
const mockEliminarGrupo = jest.fn();

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
  useRoute: () => ({
    params: {
      grupoId: 7,
      grupoNombre: "3o A Secundaria",
    },
  }),
}));

jest.mock("../../context/GruposContext", () => ({
  useGruposContext: () => ({
    obtenerGrupo: () => ({ id: 7, cantidadAlumnos: 24 }),
    eliminarGrupo: mockEliminarGrupo,
  }),
}));

describe("useDetalleGrupoViewModel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEliminarGrupo.mockResolvedValue(undefined);
  });

  it("requiere confirmación antes de eliminar", async () => {
    const { result } = renderHook(() => useDetalleGrupoViewModel());

    act(() => {
      result.current.openDeleteModal();
    });

    await act(async () => {
      await result.current.confirmDeleteGrupo();
    });

    expect(mockEliminarGrupo).not.toHaveBeenCalled();
    expect(result.current.deleteError).toContain("Debes confirmar");
  });

  it("elimina el grupo y navega a la lista cuando se confirma", async () => {
    const { result } = renderHook(() => useDetalleGrupoViewModel());

    act(() => {
      result.current.openDeleteModal();
      result.current.toggleDeleteConfirmed();
    });

    await act(async () => {
      await result.current.confirmDeleteGrupo();
    });

    expect(mockEliminarGrupo).toHaveBeenCalledWith(7);
    expect(mockNavigate).toHaveBeenCalledWith("ListaGrupos");
  });
});
