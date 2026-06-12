import { renderHook, act } from "@testing-library/react-native";
import { useCuentaViewModel } from "../../hooks/useCuentaViewModel";

let platformOS = "web";
jest.mock("react-native", () => ({
  Platform: { OS: "web" },
  Alert: { alert: jest.fn() },
}));

const mockDispatch = jest.fn();
const mockReset = jest.fn((cfg: unknown) => ({ type: "RESET", payload: cfg }));
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ dispatch: mockDispatch, navigate: jest.fn() }),
  CommonActions: { reset: (cfg: unknown) => mockReset(cfg) },
}));

const mockLogout = jest.fn().mockResolvedValue(undefined);
interface AuthState {
  usuario: unknown;
  isAuthenticated: boolean;
  isGuest: boolean;
  logout: jest.Mock;
  eliminarCuenta: jest.Mock;
}
let mockAuthState: AuthState;
jest.mock("../../context/AuthContext", () => ({
  useAuth: () => mockAuthState,
}));

jest.mock("../../utils/logger", () => ({
  __esModule: true,
  default: { log: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}));

// react-native is mocked above; keep Platform.OS in sync per test.
const rn = jest.requireMock("react-native") as { Platform: { OS: string } };

function setPlatform(os: string) {
  platformOS = os;
  rn.Platform.OS = os;
}

describe("useCuentaViewModel.handleCerrarSesion", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthState = {
      usuario: { id: 1, nombre: "Ana" },
      isAuthenticated: true,
      isGuest: false,
      logout: mockLogout,
      eliminarCuenta: jest.fn(),
    };
    setPlatform("web");
  });

  it("guest goes straight to Login without logging out (Bug #b)", () => {
    mockAuthState.isGuest = true;
    const { result } = renderHook(() => useCuentaViewModel());

    act(() => result.current.handleCerrarSesion());

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockReset).toHaveBeenCalledWith(
      expect.objectContaining({ routes: [{ name: "Login" }] })
    );
    expect(mockLogout).not.toHaveBeenCalled();
  });

  it("authenticated user logs out and resets to Login on web", async () => {
    const { result } = renderHook(() => useCuentaViewModel());

    await act(async () => {
      result.current.handleCerrarSesion();
      await Promise.resolve();
    });

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockReset).toHaveBeenCalledWith(
      expect.objectContaining({ routes: [{ name: "Login" }] })
    );
  });
});
