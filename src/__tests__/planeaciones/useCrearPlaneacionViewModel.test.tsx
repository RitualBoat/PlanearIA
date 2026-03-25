import { act, renderHook } from "@testing-library/react-native";
import { NivelAcademico } from "../../../types/planeacion";
import { useCrearPlaneacionViewModel } from "../../hooks/useCrearPlaneacionViewModel";

const mockNavigate = jest.fn();

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
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
});
