import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Notificacion, TipoNotificacion } from "../../types";

const NOTIFICACIONES_STORAGE_KEY = "APP_NOTIFICACIONES_DATA";

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
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const stored = await AsyncStorage.getItem(NOTIFICACIONES_STORAGE_KEY);
      if (stored) {
        setNotificaciones(JSON.parse(stored));
      } else {
        // Inicializar con mock data y guardarla
        setNotificaciones(MOCK_NOTIFICACIONES);
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
