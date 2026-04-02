import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Contacto, SolicitudConexion } from "../../types";

const CONTACTOS_STORAGE_KEY = "APP_CONTACTOS_DATA";
const SOLICITUDES_STORAGE_KEY = "APP_SOLICITUDES_DATA";

interface ContactosContextData {
  contactos: Contacto[];
  solicitudes: SolicitudConexion[];
  isLoading: boolean;
  error: string | null;
  agregarContacto: (
    contacto: Omit<Contacto, "id" | "fechaConexion" | "fechaModificacion" | "syncStatus">
  ) => Promise<void>;
  eliminarContacto: (contactoId: number) => Promise<void>;
  enviarSolicitud: (data: {
    deUsuarioId: string;
    deUsuarioNombre: string;
    deUsuarioAvatar?: string;
    deUsuarioMateria?: string;
    deUsuarioInstitucion?: string;
    paraUsuarioId: string;
    mensaje?: string;
  }) => Promise<void>;
  aceptarSolicitud: (solicitudId: number) => Promise<void>;
  rechazarSolicitud: (solicitudId: number) => Promise<void>;
  buscarContactos: (query: string) => Contacto[];
  refreshContactos: () => Promise<void>;
}

const ContactosContext = createContext<ContactosContextData | undefined>(undefined);

export const ContactosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [solicitudes, setSolicitudes] = useState<SolicitudConexion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [storedContactos, storedSolicitudes] = await Promise.all([
        AsyncStorage.getItem(CONTACTOS_STORAGE_KEY),
        AsyncStorage.getItem(SOLICITUDES_STORAGE_KEY),
      ]);
      if (storedContactos) setContactos(JSON.parse(storedContactos));
      if (storedSolicitudes) setSolicitudes(JSON.parse(storedSolicitudes));
    } catch {
      setError("Error al cargar contactos");
    } finally {
      setIsLoading(false);
    }
  };

  const saveContactos = async (updated: Contacto[]) => {
    try {
      await AsyncStorage.setItem(CONTACTOS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Silent fail — offline-first
    }
  };

  const saveSolicitudes = async (updated: SolicitudConexion[]) => {
    try {
      await AsyncStorage.setItem(SOLICITUDES_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Silent fail — offline-first
    }
  };

  const agregarContacto = useCallback(
    async (data: Omit<Contacto, "id" | "fechaConexion" | "fechaModificacion" | "syncStatus">) => {
      const nuevo: Contacto = {
        ...data,
        id: Date.now(),
        fechaConexion: new Date().toISOString(),
        fechaModificacion: new Date().toISOString(),
        syncStatus: "pending",
      };
      const updated = [nuevo, ...contactos];
      setContactos(updated);
      await saveContactos(updated);
    },
    [contactos]
  );

  const eliminarContacto = useCallback(
    async (contactoId: number) => {
      const updated = contactos.filter((c) => c.id !== contactoId);
      setContactos(updated);
      await saveContactos(updated);
    },
    [contactos]
  );

  const enviarSolicitud = useCallback(
    async (data: {
      deUsuarioId: string;
      deUsuarioNombre: string;
      deUsuarioAvatar?: string;
      deUsuarioMateria?: string;
      deUsuarioInstitucion?: string;
      paraUsuarioId: string;
      mensaje?: string;
    }) => {
      const nueva: SolicitudConexion = {
        id: Date.now(),
        ...data,
        estado: "pendiente",
        fechaCreacion: new Date().toISOString(),
        fechaModificacion: new Date().toISOString(),
        syncStatus: "pending",
      };
      const updated = [nueva, ...solicitudes];
      setSolicitudes(updated);
      await saveSolicitudes(updated);
    },
    [solicitudes]
  );

  const aceptarSolicitud = useCallback(
    async (solicitudId: number) => {
      const solicitud = solicitudes.find((s) => s.id === solicitudId);
      if (!solicitud) return;

      // Update solicitud status
      const updatedSolicitudes = solicitudes.map((s) =>
        s.id === solicitudId
          ? {
              ...s,
              estado: "aceptada" as const,
              fechaModificacion: new Date().toISOString(),
              syncStatus: "pending" as const,
            }
          : s
      );
      setSolicitudes(updatedSolicitudes);
      await saveSolicitudes(updatedSolicitudes);

      // Create new contacto from solicitud
      const nuevoContacto: Contacto = {
        id: Date.now(),
        usuarioId: solicitud.deUsuarioId,
        nombre: solicitud.deUsuarioNombre.split(" ")[0] || solicitud.deUsuarioNombre,
        apellidos: solicitud.deUsuarioNombre.split(" ").slice(1).join(" ") || "",
        email: "",
        materia: solicitud.deUsuarioMateria,
        institucion: solicitud.deUsuarioInstitucion,
        avatar: solicitud.deUsuarioAvatar,
        estado: "aceptada",
        enLinea: false,
        fechaConexion: new Date().toISOString(),
        fechaModificacion: new Date().toISOString(),
        syncStatus: "pending",
      };
      const updatedContactos = [nuevoContacto, ...contactos];
      setContactos(updatedContactos);
      await saveContactos(updatedContactos);
    },
    [solicitudes, contactos]
  );

  const rechazarSolicitud = useCallback(
    async (solicitudId: number) => {
      const updated = solicitudes.map((s) =>
        s.id === solicitudId
          ? {
              ...s,
              estado: "rechazada" as const,
              fechaModificacion: new Date().toISOString(),
              syncStatus: "pending" as const,
            }
          : s
      );
      setSolicitudes(updated);
      await saveSolicitudes(updated);
    },
    [solicitudes]
  );

  const buscarContactos = useCallback(
    (query: string) => {
      if (!query.trim()) return contactos;
      const lower = query.toLowerCase();
      return contactos.filter(
        (c) =>
          c.nombre.toLowerCase().includes(lower) ||
          c.apellidos.toLowerCase().includes(lower) ||
          c.materia?.toLowerCase().includes(lower) ||
          c.institucion?.toLowerCase().includes(lower)
      );
    },
    [contactos]
  );

  const refreshContactos = useCallback(async () => {
    await loadData();
  }, []);

  return (
    <ContactosContext.Provider
      value={{
        contactos,
        solicitudes,
        isLoading,
        error,
        agregarContacto,
        eliminarContacto,
        enviarSolicitud,
        aceptarSolicitud,
        rechazarSolicitud,
        buscarContactos,
        refreshContactos,
      }}
    >
      {children}
    </ContactosContext.Provider>
  );
};

export const useContactos = () => {
  const ctx = useContext(ContactosContext);
  if (!ctx) throw new Error("useContactos must be used within ContactosProvider");
  return ctx;
};
