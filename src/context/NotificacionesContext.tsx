import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync } from "../services/pushNotificationService";
import { Notificacion, TipoNotificacion } from "../../types";
import { API_CONFIG, isAPIConfigured } from "../sync/config/apiConfig";
import logger from "../utils/logger";
import { useAuth } from "./AuthContext";

const NOTIFICACIONES_STORAGE_KEY = "APP_NOTIFICACIONES_DATA";

// Usuario actual por defecto (se reemplazará con AuthContext en Sprint 8)
const CURRENT_USER_ID = "1";

interface NotificacionesContextData {
  notificaciones: Notificacion[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  marcarComoLeida: (id: number) => Promise<void>;
  marcarTodasComoLeidas: () => Promise<void>;
  eliminarNotificacion: (id: number) => Promise<void>;
  agregarNotificacion: (data: {
    titulo: string;
    mensaje: string;
    tipo: TipoNotificacion;
  }) => Promise<void>;
  refreshNotificaciones: () => Promise<void>;
}

const NotificacionesContext = createContext<NotificacionesContextData | undefined>(undefined);

const MOCK_NOTIFICACIONES: Notificacion[] = [
  {
    id: 1,
    usuarioId: "1",
    titulo: "Nueva solicitud de conexión",
    mensaje: "La Prof. Laura Gómez quiere conectar contigo para colaborar.",
    tipo: "solicitud",
    leida: false,
    fechaCreacion: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 min ago
  },
  {
    id: 2,
    usuarioId: "1",
    titulo: "Nuevo mensaje de chat",
    mensaje: "Prof. Carlos Mendoza: '¿Pudiste revisar el recurso que te compartí?'",
    tipo: "mensaje",
    leida: false,
    fechaCreacion: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
  {
    id: 3,
    usuarioId: "1",
    titulo: "Examen pendiente por calificar",
    mensaje: "El grupo '7A - Matemáticas' tiene 5 exámenes pendientes de revisión.",
    tipo: "tarea",
    leida: false,
    fechaCreacion: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: 4,
    usuarioId: "1",
    titulo: "¡Bienvenido a PlanearIA!",
    mensaje: "Explora la nueva reestructuración de la app. Colabora, comparte y planea de forma ágil.",
    tipo: "sistema",
    leida: true,
    fechaCreacion: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
  }
];

export const NotificacionesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isGuest, actualizarPerfil } = useAuth();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRemoteNotificaciones = async (): Promise<Notificacion[]> => {
    if (!isAPIConfigured()) return [];
    try {
      const response = await fetch(
        `${API_CONFIG.baseUrl}/api/notificaciones?usuarioId=${CURRENT_USER_ID}`,
        {
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": API_CONFIG.apiSecret,
          },
        }
      );
      if (!response.ok) return [];
      const json = await response.json();
      return (json.data?.notificaciones ?? []) as Notificacion[];
    } catch (err) {
      if (__DEV__) logger.error("[NotificacionesContext] Error al obtener del backend:", err);
      return [];
    }
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 1) Cargar datos locales primero para respuesta inmediata
      const stored = await AsyncStorage.getItem(NOTIFICACIONES_STORAGE_KEY);
      const local: Notificacion[] = stored ? JSON.parse(stored) : MOCK_NOTIFICACIONES;
      setNotificaciones(local);

      // 2) Intentar obtener desde backend y fusionar (Last-Write-Wins)
      const remote = await fetchRemoteNotificaciones();
      if (remote.length > 0) {
        const localMap = new Map(local.map((n) => [n.id, n]));
        for (const remoteItem of remote) {
          const localItem = localMap.get(remoteItem.id);
          if (!localItem) {
            localMap.set(remoteItem.id, remoteItem);
          } else {
            // Preferir versión más reciente
            const remoteDate = new Date(remoteItem.fechaCreacion).getTime();
            const localDate = new Date(localItem.fechaCreacion).getTime();
            if (remoteDate >= localDate) localMap.set(remoteItem.id, remoteItem);
          }
        }
        const merged = Array.from(localMap.values()).sort(
          (a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
        );
        setNotificaciones(merged);
        await AsyncStorage.setItem(NOTIFICACIONES_STORAGE_KEY, JSON.stringify(merged));
      } else if (!stored) {
        // Sin backend ni datos locales — usar mock
        await AsyncStorage.setItem(NOTIFICACIONES_STORAGE_KEY, JSON.stringify(MOCK_NOTIFICACIONES));
      }
    } catch {
      setError("Error al cargar notificaciones");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const saveNotificaciones = async (updated: Notificacion[]) => {
    try {
      await AsyncStorage.setItem(NOTIFICACIONES_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Silent fail - offline first
    }
  };

  const marcarComoLeida = useCallback(
    async (id: number) => {
      const updated = notificaciones.map((n) => (n.id === id ? { ...n, leida: true } : n));
      setNotificaciones(updated);
      await saveNotificaciones(updated);
    },
    [notificaciones]
  );

  const marcarTodasComoLeidas = useCallback(async () => {
    const updated = notificaciones.map((n) => ({ ...n, leida: true }));
    setNotificaciones(updated);
    await saveNotificaciones(updated);
    // Sincronizar con backend si está disponible
    if (isAPIConfigured()) {
      fetch(`${API_CONFIG.baseUrl}/api/notificaciones`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": API_CONFIG.apiSecret,
        },
        body: JSON.stringify({ usuarioId: CURRENT_USER_ID, marcarTodas: true }),
      }).catch(() => { /* silent — offline-first */ });
    }
  }, [notificaciones]);

  const eliminarNotificacion = useCallback(
    async (id: number) => {
      const updated = notificaciones.filter((n) => n.id !== id);
      setNotificaciones(updated);
      await saveNotificaciones(updated);
    },
    [notificaciones]
  );

  const agregarNotificacion = useCallback(
    async (data: { titulo: string; mensaje: string; tipo: TipoNotificacion }) => {
      const nueva: Notificacion = {
        id: Date.now(),
        usuarioId: "1", // Usuario logueado por defecto
        titulo: data.titulo,
        mensaje: data.mensaje,
        tipo: data.tipo,
        leida: false,
        fechaCreacion: new Date().toISOString(),
        syncStatus: "pending",
      };
      const updated = [nueva, ...notificaciones];
      setNotificaciones(updated);
      await saveNotificaciones(updated);
    },
    [notificaciones]
  );

  useEffect(() => {
    if (Platform.OS === "web") return;

    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        if (__DEV__) {
          logger.log("Push token registered successfully:", token);
        }
        if (isAuthenticated && !isGuest) {
          actualizarPerfil({ expoPushToken: token }).catch((err) => {
            logger.error("Failed to sync push token with backend:", err);
          });
        }
      }
    });

    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      const { title, body, data } = notification.request.content;
      agregarNotificacion({
        titulo: title || "Notificacion",
        mensaje: body || "",
        tipo: (data?.tipo as TipoNotificacion) || "sistema",
      });
    });

    return () => {
      subscription.remove();
    };
  }, [agregarNotificacion, isAuthenticated, isGuest, actualizarPerfil]);

  const refreshNotificaciones = useCallback(async () => {
    await loadData();
  }, []);

  const unreadCount = notificaciones.filter((n) => !n.leida).length;

  return (
    <NotificacionesContext.Provider
      value={{
        notificaciones,
        unreadCount,
        isLoading,
        error,
        marcarComoLeida,
        marcarTodasComoLeidas,
        eliminarNotificacion,
        agregarNotificacion,
        refreshNotificaciones,
      }}
    >
      {children}
    </NotificacionesContext.Provider>
  );
};

export const useNotificaciones = () => {
  const ctx = useContext(NotificacionesContext);
  if (!ctx) {
    throw new Error("useNotificaciones must be used within NotificacionesProvider");
  }
  return ctx;
};
