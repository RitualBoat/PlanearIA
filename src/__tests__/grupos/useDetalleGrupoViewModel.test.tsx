import { act, renderHook } from "@testing-library/react-native";
import { useDetalleGrupoViewModel } from "../../hooks/useDetalleGrupoViewModel";

const mockNavigate = jest.fn();
const mockEliminarGrupo = jest.fn();

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn((key: string) => {
    if (key === "@planearia:alumnos") {
      return Promise.resolve(
        JSON.stringify([
          { id: 1, nombre: "Ana", apellidos: "López", grupoId: 7 },
          { id: 2, nombre: "Luis", apellidos: "Pérez", grupoId: 9 },
        ])
      );
    }
    if (key === "@planearia:tareas") {
      return Promise.resolve(
        JSON.stringify([
          { id: 1, titulo: "Tarea 1", grupoId: 7, fechaEntrega: new Date(), valor: 20 },
        ])
      );
    }
    if (key === "@planearia:recursos") {
      return Promise.resolve(
        JSON.stringify([{ id: 1, titulo: "Guía", tipo: "documento", grupoId: 7 }])
      );
    }
    if (key === "@planearia:asistencias") {
      return Promise.resolve(JSON.stringify([{ id: 1, grupoId: 7, estado: "presente" }]));
    }
    if (key === "@planearia:calificaciones") {
      return Promise.resolve(
        JSON.stringify([{ id: 1, grupoId: 7, promedio: 9, estado: "aprobado" }])
      );
    }
    return Promise.resolve(null);
  }),
}));

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
