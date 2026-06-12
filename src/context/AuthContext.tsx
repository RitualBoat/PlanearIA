import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SESSION_KEYS } from "../services/auth/sessionStorage";
import * as authService from "../services/auth/authService";
import type { AuthUser, AuthSession, RolUsuario } from "../../types/auth";
import type { RegistroData } from "../services/auth/authService";

// Re-export for consumers that imported from here
export type { RegistroData };

export interface PreferenciasUsuario {
  recibirRecomendaciones: boolean;
  compartirDatos: boolean;
  contenidoAdulto: boolean;
  tema: "claro" | "oscuro" | "sistema";
  tamanoFuente: "pequeno" | "medio" | "grande";
  notificaciones: boolean;
}

export const PREFERENCIAS_DEFAULT: PreferenciasUsuario = {
  recibirRecomendaciones: true,
  compartirDatos: false,
  contenidoAdulto: false,
  tema: "sistema",
  tamanoFuente: "medio",
  notificaciones: true,
};

/**
 * Extended user interface for backward compatibility.
 * AuthContext consumers still see the full Usuario shape;
 * authService works with the leaner AuthUser from types/auth.
 */
export interface Usuario {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  fotoPerfil: string | null;
  biografia: string;
  pais: string;
  rol: RolUsuario;
  permissionsVersion?: number;
  preferencias?: PreferenciasUsuario;
  expoPushToken?: string | null;
  fechaCreacion: string;
  fechaModificacion: string;
}

interface AuthContextData {
  usuario: Usuario | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginComoInvitado: () => Promise<void>;
  loginComoDesarrollador: () => Promise<void>;
  registro: (data: RegistroData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  verificarToken: () => Promise<boolean>;
  actualizarPerfil: (
    data: Partial<Pick<Usuario, "nombre" | "apellidos" | "biografia" | "pais" | "expoPushToken">>
  ) => Promise<{ success: boolean; error?: string }>;
  actualizarPreferencias: (
    preferencias: Partial<PreferenciasUsuario>
  ) => Promise<{ success: boolean; error?: string }>;
  eliminarCuenta: (password: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

/** Convert AuthUser (from service) to full Usuario (for UI) */
function toUsuario(user: AuthUser, existing?: Usuario | null): Usuario {
  const now = new Date().toISOString();
  return {
    id: typeof user.id === "number" ? user.id : Number(user.id) || 0,
    nombre: user.nombre,
    apellidos: user.apellidos || existing?.apellidos || "",
    email: user.email,
    fotoPerfil: existing?.fotoPerfil ?? null,
    biografia: existing?.biografia || "",
    pais: existing?.pais || "Mexico",
    rol: user.rol,
    permissionsVersion: user.permissionsVersion,
    preferencias: existing?.preferencias,
    expoPushToken: existing?.expoPushToken,
    fechaCreacion: existing?.fechaCreacion || now,
    fechaModificacion: now,
  };
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Schedule token refresh ~1 min before expiry
  const scheduleRefresh = useCallback((expiresAt?: string) => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    if (!expiresAt) return;

    const expiresMs = new Date(expiresAt).getTime();
    const nowMs = Date.now();
    // Refresh 60s before expiry, minimum 10s from now
    const delayMs = Math.max(expiresMs - nowMs - 60_000, 10_000);

    refreshTimerRef.current = setTimeout(async () => {
      const refreshed = await authService.refreshAccessToken();
      if (refreshed) {
        applySession(refreshed);
      } else {
        // Refresh failed -- force re-login
        setToken(null);
        setUsuario(null);
        setIsGuest(false);
        await authService.logout();
      }
    }, delayMs);
  }, []);

  const applySession = useCallback(
    (session: AuthSession) => {
      const u = toUsuario(session.user, usuario);
      setUsuario(u);
      setToken(session.tokens.accessToken || null);
      setIsGuest(session.isGuest ?? false);
      if (!session.isGuest) {
        scheduleRefresh(session.tokens.expiresAt);
      }
    },
    [usuario, scheduleRefresh]
  );

  // Restore session on mount
  useEffect(() => {
    (async () => {
      try {
        const session = await authService.restoreSession();
        if (session) {
          applySession(session);
        }
      } catch {
        // no-op
      } finally {
        setIsLoading(false);
      }
    })();
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loginHandler = useCallback(
    async (email: string, password: string) => {
      const result = await authService.login(email, password);
      if (result.success && result.session) {
        applySession(result.session);
        return { success: true };
      }
      return { success: false, error: result.error };
    },
    [applySession]
  );

  const registroHandler = useCallback(
    async (data: RegistroData) => {
      const result = await authService.registro(data);
      if (result.success && result.session) {
        applySession(result.session);
        return { success: true };
      }
      return { success: false, error: result.error };
    },
    [applySession]
  );

  const logoutHandler = useCallback(async () => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    await authService.logout(token);
    setToken(null);
    setUsuario(null);
    setIsGuest(false);
  }, [token]);

  const loginComoInvitadoHandler = useCallback(async () => {
    const session = await authService.loginComoInvitado();
    applySession(session);
  }, [applySession]);

  const loginComoDesarrolladorHandler = useCallback(async () => {
    const session = await authService.loginComoDesarrollador();
    applySession(session);
  }, [applySession]);

  const verificarTokenHandler = useCallback(async (): Promise<boolean> => {
    if (!token) return false;
    const valid = await authService.verificarToken(token);
    if (!valid) {
      // Try refresh before giving up
      const refreshed = await authService.refreshAccessToken();
      if (refreshed) {
        applySession(refreshed);
        return true;
      }
      await logoutHandler();
      return false;
    }
    return true;
  }, [token, applySession, logoutHandler]);

  const actualizarPerfilHandler = useCallback(
    async (data: Partial<Pick<Usuario, "nombre" | "apellidos" | "biografia" | "pais" | "expoPushToken">>) => {
      if (!token) return { success: false, error: "No autenticado." };
      const result = await authService.actualizarPerfil(token, data as Record<string, unknown>);
      if (result.success && result.user) {
        setUsuario((prev) => toUsuario(result.user!, prev));
      }
      return { success: result.success, error: result.error };
    },
    [token]
  );

  const eliminarCuentaHandler = useCallback(
    async (password: string) => {
      if (!token) return { success: false, error: "No autenticado." };
      const result = await authService.eliminarCuenta(token, password);
      if (result.success) {
        if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
        setToken(null);
        setUsuario(null);
        setIsGuest(false);
      }
      return { success: result.success, error: result.error };
    },
    [token]
  );

  const actualizarPreferenciasHandler = useCallback(
    async (preferencias: Partial<PreferenciasUsuario>) => {
      if (!token) return { success: false, error: "No autenticado." };
      const result = await authService.actualizarPreferencias(
        token,
        preferencias as Record<string, unknown>
      );
      if (result.success) {
        setUsuario((prev) => {
          if (!prev) return prev;
          const updated = {
            ...prev,
            preferencias: {
              ...PREFERENCIAS_DEFAULT,
              ...prev.preferencias,
              ...(result.preferencias as Partial<PreferenciasUsuario>),
            },
          };
          AsyncStorage.setItem(SESSION_KEYS.USER, JSON.stringify(updated));
          return updated;
        });
      }
      return { success: result.success, error: result.error };
    },
    [token]
  );

  const value: AuthContextData = {
    usuario,
    token,
    isLoading,
    isAuthenticated: (!!token && !!usuario) || isGuest,
    isGuest,
    login: loginHandler,
    loginComoInvitado: loginComoInvitadoHandler,
    loginComoDesarrollador: loginComoDesarrolladorHandler,
    registro: registroHandler,
    logout: logoutHandler,
    verificarToken: verificarTokenHandler,
    actualizarPerfil: actualizarPerfilHandler,
    actualizarPreferencias: actualizarPreferenciasHandler,
    eliminarCuenta: eliminarCuentaHandler,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextData {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
