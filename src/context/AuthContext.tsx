import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_CONFIG } from "../sync/config/apiConfig";
import type { RolUsuario } from "../../types";

const AUTH_TOKEN_KEY = "@planearia:auth_token";
const AUTH_USER_KEY = "@planearia:auth_user";
const AUTH_GUEST_KEY = "@planearia:is_guest";

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

export interface Usuario {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  fotoPerfil: string | null;
  biografia: string;
  pais: string;
  rol: RolUsuario;
  preferencias?: PreferenciasUsuario;
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
  registro: (data: RegistroData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  verificarToken: () => Promise<boolean>;
  actualizarPerfil: (
    data: Partial<Pick<Usuario, "nombre" | "apellidos" | "biografia" | "pais">>
  ) => Promise<{ success: boolean; error?: string }>;
  actualizarPreferencias: (
    preferencias: Partial<PreferenciasUsuario>
  ) => Promise<{ success: boolean; error?: string }>;
  eliminarCuenta: (password: string) => Promise<{ success: boolean; error?: string }>;
}

export interface RegistroData {
  nombre: string;
  apellidos?: string;
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

async function authRequest(body: Record<string, unknown>): Promise<{
  ok: boolean;
  data?: { token: string; usuario: Usuario; valid?: boolean; userId?: number; email?: string };
  error?: string;
}> {
  try {
    const res = await fetch(`${API_CONFIG.baseUrl}/api/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_CONFIG.apiSecret,
      },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (json.success) {
      return { ok: true, data: json.data };
    }
    return { ok: false, error: json.error || "Error desconocido" };
  } catch {
    return { ok: false, error: "No se pudo conectar al servidor." };
  }
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  // Restaurar sesión al montar
  useEffect(() => {
    (async () => {
      try {
        const [storedToken, storedUser, storedGuest] = await Promise.all([
          AsyncStorage.getItem(AUTH_TOKEN_KEY),
          AsyncStorage.getItem(AUTH_USER_KEY),
          AsyncStorage.getItem(AUTH_GUEST_KEY),
        ]);
        if (storedGuest === "true" && storedUser) {
          setUsuario(JSON.parse(storedUser) as Usuario);
          setIsGuest(true);
        } else if (storedToken && storedUser) {
          setToken(storedToken);
          setUsuario(JSON.parse(storedUser) as Usuario);
        }
      } catch {
        // no-op
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const persistSession = useCallback(async (t: string, u: Usuario) => {
    setToken(t);
    setUsuario(u);
    await Promise.all([
      AsyncStorage.setItem(AUTH_TOKEN_KEY, t),
      AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(u)),
    ]);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await authRequest({ action: "login", email, password });
      if (result.ok && result.data) {
        await persistSession(result.data.token, result.data.usuario);
        return { success: true };
      }
      return { success: false, error: result.error };
    },
    [persistSession]
  );

  const registro = useCallback(
    async (data: RegistroData) => {
      const result = await authRequest({ action: "registro", ...data });
      if (result.ok && result.data) {
        await persistSession(result.data.token, result.data.usuario);
        return { success: true };
      }
      return { success: false, error: result.error };
    },
    [persistSession]
  );

  const logout = useCallback(async () => {
    setToken(null);
    setUsuario(null);
    setIsGuest(false);
    await Promise.all([
      AsyncStorage.removeItem(AUTH_TOKEN_KEY),
      AsyncStorage.removeItem(AUTH_USER_KEY),
      AsyncStorage.removeItem(AUTH_GUEST_KEY),
    ]);
  }, []);

  const loginComoInvitado = useCallback(async () => {
    const guestUser: Usuario = {
      id: -1,
      nombre: "Invitado",
      apellidos: "",
      email: "",
      fotoPerfil: null,
      biografia: "",
      pais: "México",
      rol: "usuario" as RolUsuario,
      fechaCreacion: new Date().toISOString(),
      fechaModificacion: new Date().toISOString(),
    };
    setUsuario(guestUser);
    setIsGuest(true);
    setToken(null);
    await Promise.all([
      AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(guestUser)),
      AsyncStorage.setItem(AUTH_GUEST_KEY, "true"),
      AsyncStorage.removeItem(AUTH_TOKEN_KEY),
    ]);
  }, []);

  const verificarToken = useCallback(async (): Promise<boolean> => {
    if (!token) return false;
    const result = await authRequest({ action: "verificar" });
    if (!result.ok) {
      await logout();
      return false;
    }
    return true;
  }, [token, logout]);

  const actualizarPerfil = useCallback(
    async (data: Partial<Pick<Usuario, "nombre" | "apellidos" | "biografia" | "pais">>) => {
      try {
        const res = await fetch(`${API_CONFIG.baseUrl}/api/auth`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": API_CONFIG.apiSecret,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action: "actualizar_perfil", ...data }),
        });
        const json = await res.json();
        if (json.success && json.data?.usuario) {
          const updatedUser = json.data.usuario as Usuario;
          setUsuario(updatedUser);
          await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));
          return { success: true };
        }
        return { success: false, error: json.error || "Error al actualizar perfil." };
      } catch {
        return { success: false, error: "No se pudo conectar al servidor." };
      }
    },
    [token]
  );

  const eliminarCuenta = useCallback(
    async (password: string) => {
      try {
        const res = await fetch(`${API_CONFIG.baseUrl}/api/auth`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": API_CONFIG.apiSecret,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action: "eliminar_cuenta", password }),
        });
        const json = await res.json();
        if (json.success) {
          await logout();
          return { success: true };
        }
        return { success: false, error: json.error || "Error al eliminar cuenta." };
      } catch {
        return { success: false, error: "No se pudo conectar al servidor." };
      }
    },
    [token, logout]
  );

  const actualizarPreferencias = useCallback(
    async (preferencias: Partial<PreferenciasUsuario>) => {
      try {
        const res = await fetch(`${API_CONFIG.baseUrl}/api/auth`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": API_CONFIG.apiSecret,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action: "actualizar_preferencias", preferencias }),
        });
        const json = await res.json();
        if (json.success) {
          const updatedUser = usuario
            ? {
                ...usuario,
                preferencias: {
                  ...PREFERENCIAS_DEFAULT,
                  ...usuario.preferencias,
                  ...json.data.preferencias,
                },
              }
            : null;
          setUsuario(updatedUser);
          if (updatedUser) {
            await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));
          }
          return { success: true };
        }
        return { success: false, error: json.error || "Error al actualizar preferencias." };
      } catch {
        return { success: false, error: "No se pudo conectar al servidor." };
      }
    },
    [token, usuario]
  );

  const value: AuthContextData = {
    usuario,
    token,
    isLoading,
    isAuthenticated: (!!token && !!usuario) || isGuest,
    isGuest,
    login,
    loginComoInvitado,
    registro,
    logout,
    verificarToken,
    actualizarPerfil,
    actualizarPreferencias,
    eliminarCuenta,
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
