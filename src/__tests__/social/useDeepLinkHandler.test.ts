import { renderHook } from "@testing-library/react-native";
import { Linking, Alert } from "react-native";
import { useDeepLinkHandler } from "../../hooks/useDeepLinkHandler";

// Mock navigation
const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

// Mock ContactosContext
const mockEnviarSolicitud = jest.fn().mockResolvedValue(undefined);
jest.mock("../../context/ContactosContext", () => ({
  useContactos: () => ({
    enviarSolicitud: mockEnviarSolicitud,
  }),
}));

// Mock AuthContext
let mockIsGuest = false;
const mockUsuario = { id: 1, nombre: "Test", apellidos: "User", fotoPerfil: null };
jest.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    usuario: mockIsGuest ? null : mockUsuario,
    isGuest: mockIsGuest,
  }),
}));

// Mock inviteLinkService
let mockInitialUrl: string | null = null;
let lastUrlListener: ((event: { url: string }) => void) | null = null;

jest.mock("../../services/inviteLinkService", () => ({
  onIncomingLink: (callback: (parsed: any) => void) => {
    // Store the callback so tests can invoke it
    lastUrlListener = (event: { url: string }) => {
      // Simulate parse
      const match = event.url.match(/invite\/([^?]+)(?:\?from=(.+))?$/);
      if (match) callback({ token: match[1], fromUserId: match[2] });
    };
    // Check initial URL
    if (mockInitialUrl) {
      const match = mockInitialUrl.match(/invite\/([^?]+)(?:\?from=(.+))?$/);
      if (match) callback({ token: match[1], fromUserId: match[2] });
    }
    return () => {
      lastUrlListener = null;
    };
  },
  parseInviteUrl: jest.fn(),
}));

jest.spyOn(Alert, "alert");

describe("useDeepLinkHandler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsGuest = false;
    mockInitialUrl = null;
    lastUrlListener = null;
  });

  it("processes initial invite URL on mount", () => {
    mockInitialUrl = "planearia://invite/tok-123?from=user5";
    renderHook(() => useDeepLinkHandler());

    expect(mockEnviarSolicitud).toHaveBeenCalledWith(
      expect.objectContaining({
        paraUsuarioId: "user5",
        mensaje: "Conectado por enlace de invitación",
      })
    );
  });

  it("shows alert for guest users", () => {
    mockIsGuest = true;
    mockInitialUrl = "planearia://invite/tok-456?from=user7";
    renderHook(() => useDeepLinkHandler());

    expect(Alert.alert).toHaveBeenCalledWith(
      "Cuenta requerida",
      expect.any(String),
      expect.any(Array)
    );
    expect(mockEnviarSolicitud).not.toHaveBeenCalled();
  });

  it("navigates to BuscadorPerfiles when no fromUserId", () => {
    mockInitialUrl = "planearia://invite/tok-789";
    renderHook(() => useDeepLinkHandler());

    // El buscador vive en el hub Mas: el hook corre en la raiz y usa forma anidada.
    expect(mockNavigate).toHaveBeenCalledWith("MainTabs", {
      screen: "MasTab",
      params: { screen: "BuscadorPerfiles", params: undefined },
    });
    expect(mockEnviarSolicitud).not.toHaveBeenCalled();
  });

  it("does not process the same token twice", () => {
    mockInitialUrl = "planearia://invite/dup-token?from=user1";
    renderHook(() => useDeepLinkHandler());

    expect(mockEnviarSolicitud).toHaveBeenCalledTimes(1);

    // Simulate same link arriving again
    if (lastUrlListener) {
      lastUrlListener({ url: "planearia://invite/dup-token?from=user1" });
    }
    // Still only called once
    expect(mockEnviarSolicitud).toHaveBeenCalledTimes(1);
  });
});
