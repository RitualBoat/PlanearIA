import { act, renderHook } from "@testing-library/react-native";
import { useCrearGrupoViewModel } from "../../hooks/useCrearGrupoViewModel";

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockCanGoBack = jest.fn();
const mockAgregarGrupo = jest.fn();
const mockActualizarGrupo = jest.fn();
const mockObtenerGrupo = jest.fn();
let mockRouteParams: { modo?: "crear" | "editar"; grupoId?: number } | undefined;

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
    canGoBack: mockCanGoBack,
  }),
  useRoute: () => ({
    params: mockRouteParams,
  }),
}));

jest.mock("../../context/GruposContext", () => ({
  useGruposContext: () => ({
    agregarGrupo: mockAgregarGrupo,
    actualizarGrupo: mockActualizarGrupo,
    obtenerGrupo: mockObtenerGrupo,
  }),
}));

describe("useCrearGrupoViewModel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouteParams = undefined;
    mockAgregarGrupo.mockResolvedValue(undefined);
    mockActualizarGrupo.mockResolvedValue(undefined);
    mockObtenerGrupo.mockReturnValue(undefined);
    mockCanGoBack.mockReturnValue(true);
  });

  it("valida campos requeridos antes de guardar", async () => {
    const { result } = renderHook(() => useCrearGrupoViewModel());

    await act(async () => {
      await result.current.handleCrearGrupo();
    });

    expect(mockAgregarGrupo).not.toHaveBeenCalled();
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

    expect(mockAgregarGrupo).toHaveBeenCalledWith(
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
    // Con la pantalla dentro del stack de Clases, guardar regresa al origen real.
    expect(mockGoBack).toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("sin historial (deep link), guardar aterriza en el landing del hub Clases", async () => {
    mockCanGoBack.mockReturnValue(false);
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

    expect(mockGoBack).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("MainTabs", {
      screen: "ClasesTab",
      params: { screen: "ClassroomHome", params: undefined },
    });
  });

  it("precarga datos en modo editar y actualiza grupo", async () => {
    mockRouteParams = { modo: "editar", grupoId: 10 };
    mockObtenerGrupo.mockReturnValue({
      id: 10,
      nombre: "3o A Secundaria",
      materia: "Pensamiento Matemático III",
      carrera: "ISC",
      semestre: 3,
      periodo: "Agosto - Dic 2024",
      horario: "Lunes y Miércoles 08:00 - 10:00",
    });

    const { result } = renderHook(() => useCrearGrupoViewModel());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.modo).toBe("editar");
    expect(result.current.nombre).toBe("3o A Secundaria");
    expect(result.current.materia).toBe("Pensamiento Matemático III");

    act(() => {
      result.current.setNombre("3o A Secundaria - Actualizado");
    });

    await act(async () => {
      await result.current.handleCrearGrupo();
    });

    expect(mockActualizarGrupo).toHaveBeenCalledWith(
      10,
      expect.objectContaining({
        nombre: "3o A Secundaria - Actualizado",
        materia: "Pensamiento Matemático III",
        semestre: 3,
        periodo: "Agosto - Dic 2024",
      })
    );
    expect(mockAgregarGrupo).not.toHaveBeenCalled();
    expect(mockGoBack).toHaveBeenCalled();
  });
});
