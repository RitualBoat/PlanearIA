import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useSesionesViewModel } from "../../hooks/useSesionesViewModel";

const mockGoBack = jest.fn();
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ goBack: mockGoBack }),
}));

jest.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ token: "tok" }),
}));

const mockListar = jest.fn();
const mockRevocar = jest.fn();
const mockCerrarOtras = jest.fn();
jest.mock("../../services/auth/authService", () => ({
  listarSesiones: (...args: unknown[]) => mockListar(...args),
  revocarSesion: (...args: unknown[]) => mockRevocar(...args),
  cerrarOtrasSesiones: (...args: unknown[]) => mockCerrarOtras(...args),
}));

const sesiones = [
  { id: "s1", current: true },
  { id: "s2", current: false },
];

describe("useSesionesViewModel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockListar.mockResolvedValue({ success: true, sesiones });
    mockRevocar.mockResolvedValue({ success: true });
    mockCerrarOtras.mockResolvedValue({ success: true });
  });

  it("loads sessions on mount", async () => {
    const { result } = renderHook(() => useSesionesViewModel());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockListar).toHaveBeenCalledWith("tok");
    expect(result.current.sesiones).toHaveLength(2);
  });

  it("removes a session when revoked", async () => {
    const { result } = renderHook(() => useSesionesViewModel());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.revocar("s2");
    });

    expect(mockRevocar).toHaveBeenCalledWith("tok", "s2");
    expect(result.current.sesiones.map((s) => s.id)).toEqual(["s1"]);
  });

  it("keeps only the current session after closing the rest", async () => {
    const { result } = renderHook(() => useSesionesViewModel());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.cerrarOtras();
    });

    expect(mockCerrarOtras).toHaveBeenCalledWith("tok");
    expect(result.current.sesiones).toEqual([{ id: "s1", current: true }]);
  });

  it("surfaces an error when listing fails", async () => {
    mockListar.mockResolvedValueOnce({ success: false, error: "boom" });
    const { result } = renderHook(() => useSesionesViewModel());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe("boom");
  });
});
