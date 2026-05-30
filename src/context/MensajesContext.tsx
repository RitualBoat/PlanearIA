import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Conversacion,
  Mensaje,
  TipoMensaje,
  MensajeArchivo,
  MensajePlaneacion,
  MensajeRecurso,
} from "../../types";
import { API_CONFIG, isAPIConfigured } from "../sync/config/apiConfig";
import { mergeWithLocal } from "../sync/services/syncEngine";
import logger from "../utils/logger";
import { isNetworkRequestError } from "../utils/networkErrors";

const CONVERSACIONES_STORAGE_KEY = "APP_CONVERSACIONES_DATA";
const MENSAJES_STORAGE_KEY = "APP_MENSAJES_DATA";

interface MensajesContextData {
  conversaciones: Conversacion[];
  mensajes: Mensaje[];
  isLoading: boolean;
  error: string | null;

  // Conversaciones
  crearConversacion: (data: {
    participantes: string[];
    contactoId: number;
    contactoNombre: string;
    contactoAvatar?: string;
    contactoColor: string;
    contactoEnLinea: boolean;
  }) => Promise<Conversacion>;
  eliminarConversacion: (conversacionId: number) => Promise<void>;
  getConversacion: (conversacionId: number) => Conversacion | undefined;
  getConversacionByContacto: (contactoId: number) => Conversacion | undefined;

  // Mensajes
  enviarMensaje: (data: {
    conversacionId: number;
    remitenteId: string;
    contenido: string;
    tipo: TipoMensaje;
    archivo?: MensajeArchivo;
    planeacion?: MensajePlaneacion;
    recurso?: MensajeRecurso;
  }) => Promise<void>;
  getMensajesDeConversacion: (conversacionId: number) => Mensaje[];
  marcarComoLeido: (conversacionId: number) => void;
  reintentarMensaje: (mensajeId: number) => Promise<void>;

  refreshMensajes: () => Promise<void>;
}

const MensajesContext = createContext<MensajesContextData | undefined>(undefined);

const POLLING_INTERVAL_MS = 5000;

export const MensajesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const appStateRef = useRef<AppStateStatus>("active");
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Arrancar y suspender polling según estado de la app ───────────────────
  useEffect(() => {
    loadData();

    const subscription = AppState.addEventListener("change", (nextState) => {
      appStateRef.current = nextState;
      if (nextState === "active") {
        startPolling();
      } else {
        stopPolling();
      }
    });

    startPolling();

    return () => {
      subscription.remove();
      stopPolling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startPolling = () => {
    if (pollingRef.current) return; // ya activo
    pollingRef.current = setInterval(() => {
      if (appStateRef.current === "active") {
        fetchRemoteConversaciones().catch(() => { /* silent */ });
      }
    }, POLLING_INTERVAL_MS);
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  /**
   * Descarga conversaciones desde el backend y las fusiona con datos locales.
   * Last-Write-Wins por fechaModificacion.
   */
  const fetchRemoteConversaciones = async () => {
    if (!isAPIConfigured()) return;
    try {
      const response = await fetch(
        `${API_CONFIG.baseUrl}/api/mensajes?tipo=conversaciones`,
        {
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": API_CONFIG.apiSecret,
          },
        }
      );
      if (!response.ok) return;
      const json = await response.json();
      const remoteConvs: Conversacion[] = json.data?.conversaciones ?? [];
      if (remoteConvs.length === 0) return;

      setConversaciones((local) => {
        const merged = mergeWithLocal(local, remoteConvs);
        // Guardar en storage sin bloquear el render
        AsyncStorage.setItem(CONVERSACIONES_STORAGE_KEY, JSON.stringify(merged)).catch(() => {});
        return merged;
      });
    } catch (err) {
      if (!__DEV__) return;
      if (isNetworkRequestError(err)) {
        logger.debug("[MensajesContext] Backend no disponible, polling omitido.");
        return;
      }
      logger.warn("[MensajesContext] Polling no pudo actualizar conversaciones:", err);
    }
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [storedConv, storedMsg] = await Promise.all([
        AsyncStorage.getItem(CONVERSACIONES_STORAGE_KEY),
        AsyncStorage.getItem(MENSAJES_STORAGE_KEY),
      ]);
      if (storedConv) setConversaciones(JSON.parse(storedConv));
      if (storedMsg) setMensajes(JSON.parse(storedMsg));
    } catch {
      setError("Error al cargar mensajes");
    } finally {
      setIsLoading(false);
    }
  };

  const saveConversaciones = async (updated: Conversacion[]) => {
    try {
      await AsyncStorage.setItem(CONVERSACIONES_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Silent fail — offline-first
    }
  };

  const saveMensajes = async (updated: Mensaje[]) => {
    try {
      await AsyncStorage.setItem(MENSAJES_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Silent fail — offline-first
    }
  };

  const crearConversacion = useCallback(
    async (data: {
      participantes: string[];
      contactoId: number;
      contactoNombre: string;
      contactoAvatar?: string;
      contactoColor: string;
      contactoEnLinea: boolean;
    }): Promise<Conversacion> => {
      const nueva: Conversacion = {
        id: Date.now(),
        participantes: data.participantes,
        contactoId: data.contactoId,
        contactoNombre: data.contactoNombre,
        contactoAvatar: data.contactoAvatar,
        contactoColor: data.contactoColor,
        contactoEnLinea: data.contactoEnLinea,
        mensajesNoLeidos: 0,
        fechaCreacion: new Date().toISOString(),
        fechaModificacion: new Date().toISOString(),
        syncStatus: "pending",
      };
      const updated = [nueva, ...conversaciones];
      setConversaciones(updated);
      await saveConversaciones(updated);
      return nueva;
    },
    [conversaciones]
  );

  const eliminarConversacion = useCallback(
    async (conversacionId: number) => {
      const updatedConv = conversaciones.filter((c) => c.id !== conversacionId);
      const updatedMsg = mensajes.filter((m) => m.conversacionId !== conversacionId);
      setConversaciones(updatedConv);
      setMensajes(updatedMsg);
      await Promise.all([saveConversaciones(updatedConv), saveMensajes(updatedMsg)]);
    },
    [conversaciones, mensajes]
  );

  const getConversacion = useCallback(
    (conversacionId: number) => conversaciones.find((c) => c.id === conversacionId),
    [conversaciones]
  );

  const getConversacionByContacto = useCallback(
    (contactoId: number) => conversaciones.find((c) => c.contactoId === contactoId),
    [conversaciones]
  );

  const enviarMensaje = useCallback(
    async (data: {
      conversacionId: number;
      remitenteId: string;
      contenido: string;
      tipo: TipoMensaje;
      archivo?: MensajeArchivo;
      planeacion?: MensajePlaneacion;
      recurso?: MensajeRecurso;
    }) => {
      const nuevoMensaje: Mensaje = {
        id: Date.now(),
        conversacionId: data.conversacionId,
        remitenteId: data.remitenteId,
        contenido: data.contenido,
        tipo: data.tipo,
        archivo: data.archivo,
        planeacion: data.planeacion,
        recurso: data.recurso,
        estado: "enviado",
        fechaCreacion: new Date().toISOString(),
        fechaModificacion: new Date().toISOString(),
        syncStatus: "pending",
      };

      const updatedMsg = [...mensajes, nuevoMensaje];
      setMensajes(updatedMsg);

      // Update conversation's last message
      const previewText =
        data.tipo === "archivo"
          ? `📎 ${data.archivo?.nombre ?? "Archivo"}`
          : data.tipo === "planeacion"
            ? `📋 ${data.planeacion?.titulo ?? "Planeación"}`
            : data.tipo === "recurso"
              ? `📚 ${data.recurso?.titulo ?? "Recurso"}`
              : data.contenido;

      const updatedConv = conversaciones.map((c) =>
        c.id === data.conversacionId
          ? {
              ...c,
              ultimoMensaje: previewText,
              ultimoMensajeTipo: data.tipo,
              fechaUltimoMensaje: nuevoMensaje.fechaCreacion,
              fechaModificacion: nuevoMensaje.fechaCreacion,
            }
          : c
      );
      // Move conversation to top
      const convIndex = updatedConv.findIndex((c) => c.id === data.conversacionId);
      if (convIndex > 0) {
        const [conv] = updatedConv.splice(convIndex, 1);
        updatedConv.unshift(conv);
      }

      setConversaciones(updatedConv);
      await Promise.all([saveMensajes(updatedMsg), saveConversaciones(updatedConv)]);
    },
    [mensajes, conversaciones]
  );

  const getMensajesDeConversacion = useCallback(
    (conversacionId: number) =>
      mensajes
        .filter((m) => m.conversacionId === conversacionId)
        .sort((a, b) => new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime()),
    [mensajes]
  );

  const marcarComoLeido = useCallback(
    (conversacionId: number) => {
      const updatedConv = conversaciones.map((c) =>
        c.id === conversacionId ? { ...c, mensajesNoLeidos: 0 } : c
      );
      setConversaciones(updatedConv);
      saveConversaciones(updatedConv);

      const updatedMsg = mensajes.map((m) =>
        m.conversacionId === conversacionId && m.estado === "entregado"
          ? { ...m, estado: "leido" as const }
          : m
      );
      setMensajes(updatedMsg);
      saveMensajes(updatedMsg);
    },
    [conversaciones, mensajes]
  );

  const reintentarMensaje = useCallback(
    async (mensajeId: number) => {
      const updatedMsg = mensajes.map((m) =>
        m.id === mensajeId
          ? { ...m, estado: "enviado" as const, syncStatus: "pending" as const }
          : m
      );
      setMensajes(updatedMsg);
      await saveMensajes(updatedMsg);
    },
    [mensajes]
  );

  const refreshMensajes = useCallback(async () => {
    await loadData();
    await fetchRemoteConversaciones();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MensajesContext.Provider
      value={{
        conversaciones,
        mensajes,
        isLoading,
        error,
        crearConversacion,
        eliminarConversacion,
        getConversacion,
        getConversacionByContacto,
        enviarMensaje,
        getMensajesDeConversacion,
        marcarComoLeido,
        reintentarMensaje,
        refreshMensajes,
      }}
    >
      {children}
    </MensajesContext.Provider>
  );
};

export const useMensajes = (): MensajesContextData => {
  const context = useContext(MensajesContext);
  if (!context) {
    throw new Error("useMensajes debe ser usado dentro de MensajesProvider");
  }
  return context;
};
