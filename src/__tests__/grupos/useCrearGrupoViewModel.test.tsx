import { act, renderHook } from "@testing-library/react-native";
import { useCrearGrupoViewModel } from "../../hooks/useCrearGrupoViewModel";
import { agregarGrupo } from "../../services/gruposService";

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
}));

jest.mock("../../services/gruposService", () => ({
  agregarGrupo: jest.fn(),
}));

describe("useCrearGrupoViewModel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (agregarGrupo as jest.Mock).mockResolvedValue(undefined);
  });

  it("valida campos requeridos antes de guardar", async () => {
    const { result } = renderHook(() => useCrearGrupoViewModel());

    await act(async () => {
      await result.current.handleCrearGrupo();
    });

    expect(agregarGrupo).not.toHaveBeenCalled();
    expect(result.current.validationError).toBe("El nombre del grupo es obligatorio.");
  });

  it("guarda grupo y navega a lista", async () => {
    const { result } = renderHook(() => useCrearGrupoViewModel());

    act(() => {
      result.current.setNombre("7A - Matemáticas Avanzadas");
      result.current.setMateria("Matemáticas Avanzadas");
      result.current.setCarrera("ISC");
      result.current.setSemestre("7");
      result.current.setPeriodo("Enero-Junio 2026");
      result.current.setHorario("Lun-Mie-Vie 7:00-9:00");
    });

    await act(async () => {
      await result.current.handleCrearGrupo();
    });

    expect(agregarGrupo).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: "7A - Matemáticas Avanzadas",
        materia: "Matemáticas Avanzadas",
        carrera: "ISC",
        semestre: 7,
        periodo: "Enero-Junio 2026",
        horario: "Lun-Mie-Vie 7:00-9:00",
        estado: "activo",
      })
    );
    expect(mockNavigate).toHaveBeenCalledWith("ListaGrupos");
  });
});
