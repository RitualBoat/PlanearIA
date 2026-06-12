jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

jest.mock("../../sync/config/apiConfig", () => ({
  API_CONFIG: {
    baseUrl: "https://test.api.com",
    apiSecret: "test-secret",
    timeout: 5000,
  },
  isAPIConfigured: jest.fn(() => true),
}));

const mockSessionStorage = {
  getToken: jest.fn().mockResolvedValue(null),
  setToken: jest.fn().mockResolvedValue(undefined),
  removeToken: jest.fn().mockResolvedValue(undefined),
  clearTokens: jest.fn().mockResolvedValue(undefined),
};

jest.mock("../../services/auth/sessionStorage", () => ({
  __esModule: true,
  sessionStorage: {
    getToken: (key: string) => mockSessionStorage.getToken(key),
    setToken: (key: string, value: string) =>
      mockSessionStorage.setToken(key, value),
    removeToken: (key: string) => mockSessionStorage.removeToken(key),
    clearTokens: () => mockSessionStorage.clearTokens(),
  },
  SESSION_KEYS: {
    ACCESS_TOKEN: "planearia.secure.access_token",
    REFRESH_TOKEN: "planearia.secure.refresh_token",
    USER: "@planearia:auth_user",
    IS_GUEST: "@planearia:is_guest",
  },
  LEGACY_SESSION_KEYS: {
    TOKEN: "@planearia:auth_token",
    USER: "@planearia:auth_user",
    IS_GUEST: "@planearia:is_guest",
  },
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  restoreSession,
  login,
  registro,
  logout,
  loginComoInvitado,
  loginComoDesarrollador,
  refreshAccessToken,
  getAccessToken,
} from "../../services/auth/authService";

const KEYS = {
  ACCESS_TOKEN: "planearia.secure.access_token",
  REFRESH_TOKEN: "planearia.secure.refresh_token",
  USER: "@planearia:auth_user",
  IS_GUEST: "@planearia:is_guest",
};

const fakeUsuario = {
  id: 42,
  nombre: "Test",
  apellidos: "User",
  email: "test@example.com",
  rol: "docente",
  permissionsVersion: 1,
};

function mockSuccessResponse(data: Record<string, unknown>) {
  mockFetch.mockResolvedValueOnce({
    json: async () => ({ success: true, data }),
  });
}

function mockErrorResponse(error: string) {
  mockFetch.mockResolvedValueOnce({
    json: async () => ({ success: false, error }),
  });
}

describe("authService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionStorage.getToken.mockResolvedValue(null);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
  });

  describe("restoreSession", () => {
    it("returns null when no user is stored", async () => {
      const session = await restoreSession();
      expect(session).toBeNull();
    });

    it("restores a guest session", async () => {
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === KEYS.USER) return JSON.stringify(fakeUsuario);
        if (key === KEYS.IS_GUEST) return "true";
        return null;
      });
      const session = await restoreSession();
      expect(session).not.toBeNull();
      expect(session!.isGuest).toBe(true);
      expect(session!.user.nombre).toBe("Test");
    });

    it("restores a token-based session", async () => {
      mockSessionStorage.getToken.mockImplementation((key: string) => {
        if (key === KEYS.ACCESS_TOKEN) return "access-jwt";
        if (key === KEYS.REFRESH_TOKEN) return "refresh-abc";
        return null;
      });
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === KEYS.USER) return JSON.stringify(fakeUsuario);
        return null;
      });
      const session = await restoreSession();
      expect(session).not.toBeNull();
      expect(session!.isGuest).toBe(false);
      expect(session!.tokens.accessToken).toBe("access-jwt");
      expect(session!.tokens.refreshToken).toBe("refresh-abc");
    });

    it("returns null if token is missing for non-guest", async () => {
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === KEYS.USER) return JSON.stringify(fakeUsuario);
        return null;
      });
      const session = await restoreSession();
      expect(session).toBeNull();
    });
  });

  describe("login", () => {
    it("persists session on success", async () => {
      mockSuccessResponse({
        accessToken: "jwt-123",
        refreshToken: "refresh-456",
        tokens: {
          accessToken: "jwt-123",
          refreshToken: "refresh-456",
          expiresAt: "2026-12-31T00:00:00Z",
          refreshExpiresAt: "2027-01-14T00:00:00Z",
        },
        usuario: fakeUsuario,
      });
      const result = await login("test@example.com", "password123");
      expect(result.success).toBe(true);
      expect(result.session).toBeDefined();
      expect(result.session!.tokens.accessToken).toBe("jwt-123");
      expect(mockSessionStorage.setToken).toHaveBeenCalledWith(KEYS.ACCESS_TOKEN, "jwt-123");
      expect(mockSessionStorage.setToken).toHaveBeenCalledWith(KEYS.REFRESH_TOKEN, "refresh-456");
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(KEYS.USER, expect.any(String));
    });

    it("returns error on failed login", async () => {
      mockErrorResponse("Credenciales invalidas.");
      const result = await login("bad@example.com", "wrong");
      expect(result.success).toBe(false);
      expect(result.error).toBe("Credenciales invalidas.");
      expect(mockSessionStorage.setToken).not.toHaveBeenCalled();
    });

    it("handles network failure", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));
      const result = await login("test@example.com", "password");
      expect(result.success).toBe(false);
      expect(result.error).toContain("servidor");
    });
  });

  describe("registro", () => {
    it("persists session on success", async () => {
      mockSuccessResponse({
        token: "new-jwt",
        usuario: { ...fakeUsuario, id: 99 },
      });
      const result = await registro({
        nombre: "Nuevo",
        email: "nuevo@example.com",
        password: "pass123",
      });
      expect(result.success).toBe(true);
      expect(result.session!.user.id).toBe(99);
    });
  });

  describe("logout", () => {
    it("clears local session", async () => {
      await logout("some-token");
      expect(mockSessionStorage.clearTokens).toHaveBeenCalled();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(KEYS.USER);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(KEYS.IS_GUEST);
    });

    it("attempts server-side revocation without blocking", async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ success: true }),
      });
      await logout("token-to-revoke");
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe("loginComoInvitado", () => {
    it("creates a local guest session with no tokens", async () => {
      const session = await loginComoInvitado();
      expect(session.isGuest).toBe(true);
      expect(session.user.id).toBe(-1);
      expect(session.user.rol).toBe("usuario");
      expect(session.tokens.accessToken).toBe("");
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(KEYS.IS_GUEST, "true");
    });
  });

  describe("loginComoDesarrollador", () => {
    it("creates a local dev session with dev token", async () => {
      const session = await loginComoDesarrollador();
      expect(session.isGuest).toBe(false);
      expect(session.user.rol).toBe("dev");
      expect(session.user.email).toBe("dev@planearia.local");
      expect(session.tokens.accessToken).toBe("dev-token-local-testing-only");
      expect(mockSessionStorage.setToken).toHaveBeenCalledWith(
        KEYS.ACCESS_TOKEN,
        "dev-token-local-testing-only"
      );
    });
  });

  describe("refreshAccessToken", () => {
    it("returns null when no refresh token is stored", async () => {
      const result = await refreshAccessToken();
      expect(result).toBeNull();
    });

    it("returns new session on successful refresh", async () => {
      mockSessionStorage.getToken.mockImplementation((key: string) => {
        if (key === KEYS.REFRESH_TOKEN) return "old-refresh";
        if (key === KEYS.ACCESS_TOKEN) return "old-access";
        return null;
      });
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === KEYS.USER) return JSON.stringify(fakeUsuario);
        return null;
      });
      mockSuccessResponse({
        tokens: {
          accessToken: "new-access",
          refreshToken: "new-refresh",
          expiresAt: "2026-12-31T00:00:00Z",
          refreshExpiresAt: "2027-01-14T00:00:00Z",
        },
      });
      const result = await refreshAccessToken();
      expect(result).not.toBeNull();
      expect(result!.tokens.accessToken).toBe("new-access");
      expect(mockSessionStorage.setToken).toHaveBeenCalledWith(KEYS.ACCESS_TOKEN, "new-access");
    });

    it("returns null on failed refresh", async () => {
      mockSessionStorage.getToken.mockImplementation((key: string) => {
        if (key === KEYS.REFRESH_TOKEN) return "expired-refresh";
        return null;
      });
      mockErrorResponse("Token expirado.");
      const result = await refreshAccessToken();
      expect(result).toBeNull();
    });
  });

  describe("getAccessToken", () => {
    it("delegates to sessionStorage", async () => {
      mockSessionStorage.getToken.mockResolvedValueOnce("stored-token");
      const token = await getAccessToken();
      expect(token).toBe("stored-token");
      expect(mockSessionStorage.getToken).toHaveBeenCalledWith(KEYS.ACCESS_TOKEN);
    });
  });
});
