/**
 * Auth service: single point of contact for all auth I/O.
 *
 * Centralizes API calls, token storage, and session lifecycle.
 * AuthContext delegates to this service instead of making direct
 * fetch calls or touching storage directly.
 */

import { API_CONFIG, isAPIConfigured } from "../../sync/config/apiConfig";
import { normalizeRole, AUTH_PERMISSIONS_VERSION } from "../../../types/auth";
import { sessionStorage, SESSION_KEYS } from "./sessionStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AuthUser, AuthTokens, AuthSession, RolUsuario } from "../../../types/auth";

// -- Types --

export interface AuthResult {
  success: boolean;
  error?: string;
}

export interface LoginResult extends AuthResult {
  session?: AuthSession;
}

export interface RegistroData {
  nombre: string;
  apellidos?: string;
  email: string;
  password: string;
}

/** Shape the backend returns for login/registro/refresh */
interface BackendAuthResponse {
  success: boolean;
  error?: string;
  /** True when the request never reached the backend (offline/server down) */
  networkError?: boolean;
  data?: {
    accessToken?: string;
    refreshToken?: string;
    token?: string; // legacy single-token field
    tokens?: {
      accessToken: string;
      refreshToken: string;
      expiresAt: string;
      refreshExpiresAt: string;
    };
    usuario?: Record<string, unknown>;
    valid?: boolean;
    userId?: number | string;
    email?: string;
    sessionId?: string;
  };
}

// -- Internal helpers --

async function authFetch(
  body: Record<string, unknown>,
  token?: string | null
): Promise<BackendAuthResponse> {
  if (!API_CONFIG.baseUrl) {
    return {
      success: false,
      error:
        "Falta configurar EXPO_PUBLIC_API_URL en el frontend. Revisa las variables de entorno y redeploy.",
    };
  }

  if (!API_CONFIG.apiSecret) {
    return {
      success: false,
      error:
        "Falta configurar EXPO_PUBLIC_API_SECRET en el frontend. Debe coincidir con API_SECRET del backend.",
    };
  }

  if (!isAPIConfigured()) {
    return {
      success: false,
      error:
        "La API no esta configurada correctamente para este entorno. Revisa EXPO_PUBLIC_API_URL y EXPO_PUBLIC_API_SECRET.",
    };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-API-Key": API_CONFIG.apiSecret,
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

  try {
    const res = await fetch(`${API_CONFIG.baseUrl}/api/auth`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    return (await res.json()) as BackendAuthResponse;
  } catch (error) {
    const message =
      error instanceof Error && error.name === "AbortError"
        ? "El servidor no respondio a tiempo."
        : "No se pudo conectar al servidor. Revisa que la URL del backend y CORS permitan este frontend.";
    return { success: false, error: message, networkError: true };
  } finally {
    clearTimeout(timeoutId);
  }
}

function extractTokens(data: BackendAuthResponse["data"]): AuthTokens | null {
  if (!data) return null;

  // Prefer structured tokens object, fall back to flat fields, then legacy
  const accessToken =
    data.tokens?.accessToken || data.accessToken || data.token || null;
  const refreshToken =
    data.tokens?.refreshToken || data.refreshToken || null;

  if (!accessToken) return null;

  return {
    accessToken,
    refreshToken: refreshToken || undefined,
    tokenType: "Bearer",
    expiresAt: data.tokens?.expiresAt,
    refreshExpiresAt: data.tokens?.refreshExpiresAt,
  };
}

function extractUser(data: BackendAuthResponse["data"]): AuthUser | null {
  const raw = data?.usuario;
  if (!raw) return null;

  const rol = (raw.rol || raw.role || "docente") as RolUsuario;

  return {
    id: (raw.id ?? raw.userId ?? raw._id) as number | string,
    nombre: String(raw.nombre || ""),
    apellidos: raw.apellidos ? String(raw.apellidos) : undefined,
    email: String(raw.email || ""),
    rol,
    canonicalRole: normalizeRole(rol),
    permissionsVersion:
      typeof raw.permissionsVersion === "number"
        ? raw.permissionsVersion
        : AUTH_PERMISSIONS_VERSION,
  };
}

// -- Session persistence --

async function persistSession(session: AuthSession): Promise<void> {
  const promises: Promise<void>[] = [];

  if (session.tokens.accessToken) {
    promises.push(
      sessionStorage.setToken(
        SESSION_KEYS.ACCESS_TOKEN,
        session.tokens.accessToken
      )
    );
  }
  if (session.tokens.refreshToken) {
    promises.push(
      sessionStorage.setToken(
        SESSION_KEYS.REFRESH_TOKEN,
        session.tokens.refreshToken
      )
    );
  }

  // User data and guest flag in AsyncStorage (non-sensitive)
  promises.push(
    AsyncStorage.setItem(SESSION_KEYS.USER, JSON.stringify(session.user))
  );

  if (session.isGuest) {
    promises.push(AsyncStorage.setItem(SESSION_KEYS.IS_GUEST, "true"));
  } else {
    promises.push(AsyncStorage.removeItem(SESSION_KEYS.IS_GUEST));
  }

  await Promise.all(promises);
}

async function clearSession(): Promise<void> {
  await Promise.all([
    sessionStorage.clearTokens(),
    AsyncStorage.removeItem(SESSION_KEYS.USER),
    AsyncStorage.removeItem(SESSION_KEYS.IS_GUEST),
  ]);
}

// -- Public API --

/**
 * Restore session from local storage on app mount.
 * Returns null if no valid session is found.
 */
export async function restoreSession(): Promise<AuthSession | null> {
  try {
    const [accessToken, refreshToken, userJson, guestFlag] = await Promise.all([
      sessionStorage.getToken(SESSION_KEYS.ACCESS_TOKEN),
      sessionStorage.getToken(SESSION_KEYS.REFRESH_TOKEN),
      AsyncStorage.getItem(SESSION_KEYS.USER),
      AsyncStorage.getItem(SESSION_KEYS.IS_GUEST),
    ]);

    if (!userJson) return null;

    const user = JSON.parse(userJson) as AuthUser;
    const isGuest = guestFlag === "true";

    // Guest sessions have no tokens
    if (isGuest) {
      return { user, tokens: { accessToken: "", tokenType: "Bearer" }, isGuest, permissionsVersion: user.permissionsVersion ?? AUTH_PERMISSIONS_VERSION };
    }

    // Token-based session requires at least an access token
    if (!accessToken) return null;

    return {
      user,
      tokens: {
        accessToken,
        refreshToken: refreshToken || undefined,
        tokenType: "Bearer",
      },
      isGuest: false,
      permissionsVersion: user.permissionsVersion ?? AUTH_PERMISSIONS_VERSION,
    };
  } catch {
    return null;
  }
}

export async function login(
  email: string,
  password: string
): Promise<LoginResult> {
  const res = await authFetch({ action: "login", email, password });
  if (!res.success || !res.data) {
    return { success: false, error: res.error || "Error de autenticacion." };
  }

  const tokens = extractTokens(res.data);
  const user = extractUser(res.data);
  if (!tokens || !user) {
    return { success: false, error: "Respuesta invalida del servidor." };
  }

  const session: AuthSession = {
    user,
    tokens,
    sessionId: res.data.sessionId,
    isGuest: false,
    permissionsVersion: user.permissionsVersion ?? AUTH_PERMISSIONS_VERSION,
  };

  await persistSession(session);
  return { success: true, session };
}

export async function registro(data: RegistroData): Promise<LoginResult> {
  const res = await authFetch({ action: "registro", ...data });
  if (!res.success || !res.data) {
    return { success: false, error: res.error || "Error al registrar." };
  }

  const tokens = extractTokens(res.data);
  const user = extractUser(res.data);
  if (!tokens || !user) {
    return { success: false, error: "Respuesta invalida del servidor." };
  }

  const session: AuthSession = {
    user,
    tokens,
    sessionId: res.data.sessionId,
    isGuest: false,
    permissionsVersion: user.permissionsVersion ?? AUTH_PERMISSIONS_VERSION,
  };

  await persistSession(session);
  return { success: true, session };
}

export interface RefreshResult {
  session: AuthSession | null;
  /** True when the backend was unreachable: keep the session, retry later */
  networkError: boolean;
}

/**
 * Refresh the access token using the stored refresh token.
 * Distinguishes a server rejection (re-login required) from a network
 * failure (offline grace: the session must survive airplane mode and
 * backend outages).
 */
export async function refreshSession(): Promise<RefreshResult> {
  const refreshToken = await sessionStorage.getToken(SESSION_KEYS.REFRESH_TOKEN);
  if (!refreshToken) return { session: null, networkError: false };

  const currentAccessToken = await sessionStorage.getToken(SESSION_KEYS.ACCESS_TOKEN);
  const res = await authFetch(
    { action: "refresh", refreshToken },
    currentAccessToken
  );

  if (res.networkError) {
    return { session: null, networkError: true };
  }

  if (!res.success || !res.data) return { session: null, networkError: false };

  const tokens = extractTokens(res.data);
  const user = extractUser(res.data);
  if (!tokens) return { session: null, networkError: false };

  // If backend didn't return user, keep existing local user
  let sessionUser = user;
  if (!sessionUser) {
    const userJson = await AsyncStorage.getItem(SESSION_KEYS.USER);
    if (userJson) {
      sessionUser = JSON.parse(userJson) as AuthUser;
    }
  }
  if (!sessionUser) return { session: null, networkError: false };

  const session: AuthSession = {
    user: sessionUser,
    tokens,
    sessionId: res.data.sessionId,
    isGuest: false,
    permissionsVersion: sessionUser.permissionsVersion ?? AUTH_PERMISSIONS_VERSION,
  };

  await persistSession(session);
  return { session, networkError: false };
}

/**
 * Legacy contract: new session or null. Prefer refreshSession() to react
 * to offline conditions without dropping the local session.
 */
export async function refreshAccessToken(): Promise<AuthSession | null> {
  const result = await refreshSession();
  return result.session;
}

export async function logout(token?: string | null): Promise<void> {
  // Attempt server-side revocation, but don't block on failure
  if (token) {
    const refreshToken = await sessionStorage.getToken(SESSION_KEYS.REFRESH_TOKEN);
    authFetch({ action: "logout", refreshToken }, token).catch(() => {});
  }
  await clearSession();
}

export type TokenVerification = "valid" | "invalid" | "unreachable";

/**
 * Three-state verification: a network failure is NOT an invalid token.
 * Callers must keep the session alive when the backend is unreachable.
 */
export async function verificarTokenDetallado(token: string): Promise<TokenVerification> {
  const res = await authFetch({ action: "verificar" }, token);
  if (res.success === true) return "valid";
  if (res.networkError) return "unreachable";
  return "invalid";
}

export async function verificarToken(token: string): Promise<boolean> {
  const result = await verificarTokenDetallado(token);
  return result === "valid";
}

export async function actualizarPerfil(
  token: string,
  data: Record<string, unknown>
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  const res = await authFetch({ action: "actualizar_perfil", ...data }, token);
  if (!res.success) {
    return { success: false, error: res.error || "Error al actualizar perfil." };
  }
  const user = extractUser(res.data);
  if (user) {
    await AsyncStorage.setItem(SESSION_KEYS.USER, JSON.stringify(user));
  }
  return { success: true, user: user || undefined };
}

export async function actualizarPreferencias(
  token: string,
  preferencias: Record<string, unknown>
): Promise<{ success: boolean; preferencias?: Record<string, unknown>; error?: string }> {
  const res = await authFetch({ action: "actualizar_preferencias", preferencias }, token);
  if (!res.success) {
    return { success: false, error: res.error || "Error al actualizar preferencias." };
  }
  return {
    success: true,
    preferencias: (res.data as Record<string, unknown>)?.preferencias as Record<string, unknown> | undefined,
  };
}

export async function eliminarCuenta(
  token: string,
  password: string
): Promise<AuthResult> {
  const res = await authFetch({ action: "eliminar_cuenta", password }, token);
  if (!res.success) {
    return { success: false, error: res.error || "Error al eliminar cuenta." };
  }
  await clearSession();
  return { success: true };
}

/**
 * Create a local-only guest session (no server call).
 */
export async function loginComoInvitado(): Promise<AuthSession> {
  const user: AuthUser = {
    id: -1,
    nombre: "Invitado",
    email: "",
    rol: "usuario",
    canonicalRole: "alumno",
    permissionsVersion: AUTH_PERMISSIONS_VERSION,
  };

  const session: AuthSession = {
    user,
    tokens: { accessToken: "", tokenType: "Bearer" },
    isGuest: true,
    permissionsVersion: AUTH_PERMISSIONS_VERSION,
  };

  await persistSession(session);
  return session;
}

/**
 * Create a local-only dev session (__DEV__ only, no server call).
 */
export async function loginComoDesarrollador(): Promise<AuthSession> {
  const user: AuthUser = {
    id: 9999,
    nombre: "Dev",
    apellidos: "Admin",
    email: "dev@planearia.local",
    rol: "dev",
    canonicalRole: "dev",
    permissionsVersion: AUTH_PERMISSIONS_VERSION,
  };

  const session: AuthSession = {
    user,
    tokens: {
      accessToken: "dev-token-local-testing-only",
      tokenType: "Bearer",
    },
    isGuest: false,
    permissionsVersion: AUTH_PERMISSIONS_VERSION,
  };

  await persistSession(session);
  return session;
}

/**
 * Read the current access token from secure storage.
 * Used by apiClient to attach Authorization header.
 */
export async function getAccessToken(): Promise<string | null> {
  return sessionStorage.getToken(SESSION_KEYS.ACCESS_TOKEN);
}

// -- Active sessions --

export interface SesionActiva {
  id: string;
  current: boolean;
  createdAt?: string;
  lastUsedAt?: string;
  expiresAt?: string;
  userAgent?: string;
}

export async function listarSesiones(
  token: string
): Promise<{ success: boolean; sesiones?: SesionActiva[]; error?: string }> {
  const res = await authFetch({ action: "listar_sesiones" }, token);
  if (!res.success) {
    return { success: false, error: res.error || "No se pudieron cargar las sesiones." };
  }
  const sesiones = (res.data as unknown as { sessions?: SesionActiva[] })?.sessions ?? [];
  return { success: true, sesiones };
}

export async function revocarSesion(token: string, sessionId: string): Promise<AuthResult> {
  const res = await authFetch({ action: "revocar_sesion", sessionId }, token);
  return { success: res.success, error: res.error };
}

/** Revoke every session except the current one. */
export async function cerrarOtrasSesiones(token: string): Promise<AuthResult> {
  const res = await authFetch({ action: "revocar_sesion", all: true }, token);
  return { success: res.success, error: res.error };
}
