import { useState, useCallback, useMemo } from "react";
import { Alert } from "react-native";
import { useContactos } from "../context/ContactosContext";
import { useAuth } from ".//useAuth";
import { Contacto, SolicitudConexion } from "../../types";

export type SocialTab = "contactos" | "solicitudes" | "buscar";

export function useSocialViewModel() {
  const {
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
  } = useContactos();
  const { usuario, isGuest } = useAuth();

  const [activeTab, setActiveTab] = useState<SocialTab>("contactos");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedContacto, setSelectedContacto] = useState<Contacto | null>(null);
  const [solicitudesSubTab, setSolicitudesSubTab] = useState<"recibidas" | "enviadas">("recibidas");

  // Derived data
  const userId = usuario?.id?.toString() || "";
  const userName = usuario ? `${usuario.nombre} ${usuario.apellidos}` : "Invitado";

  const filteredContactos = useMemo(() => {
    if (!searchQuery.trim()) return contactos;
    return buscarContactos(searchQuery);
  }, [contactos, searchQuery, buscarContactos]);

  const solicitudesRecibidas = useMemo(
    () => solicitudes.filter((s) => s.paraUsuarioId === userId && s.estado === "pendiente"),
    [solicitudes, userId]
  );

  const solicitudesEnviadas = useMemo(
    () => solicitudes.filter((s) => s.deUsuarioId === userId && s.estado === "pendiente"),
    [solicitudes, userId]
  );

  const stats = useMemo(
    () => ({
      totalContactos: contactos.length,
      totalGrupos: 0, // Placeholder — will be wired to GruposContext later
      pendientes: solicitudesRecibidas.length,
    }),
    [contactos.length, solicitudesRecibidas.length]
  );

  // Handlers
  const handleTabChange = useCallback((tab: SocialTab) => {
    setActiveTab(tab);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refreshContactos();
    setIsRefreshing(false);
  }, [refreshContactos]);

  const handleAceptarSolicitud = useCallback(
    async (solicitudId: number) => {
      if (isGuest) {
        Alert.alert("Cuenta requerida", "Inicia sesión para gestionar solicitudes.");
        return;
      }
      await aceptarSolicitud(solicitudId);
    },
    [isGuest, aceptarSolicitud]
  );

  const handleRechazarSolicitud = useCallback(
    async (solicitudId: number) => {
      if (isGuest) {
        Alert.alert("Cuenta requerida", "Inicia sesión para gestionar solicitudes.");
        return;
      }
      await rechazarSolicitud(solicitudId);
    },
    [isGuest, rechazarSolicitud]
  );

  const handleEliminarContacto = useCallback(
    async (contactoId: number) => {
      if (isGuest) {
        Alert.alert("Cuenta requerida", "Inicia sesión para gestionar contactos.");
        return;
      }
      Alert.alert("Eliminar contacto", "¿Estás seguro de eliminar este contacto?", [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => eliminarContacto(contactoId),
        },
      ]);
    },
    [isGuest, eliminarContacto]
  );

  const handleEnviarSolicitud = useCallback(
    async (paraUsuarioId: string, mensaje?: string) => {
      if (isGuest) {
        Alert.alert("Cuenta requerida", "Inicia sesión para enviar solicitudes.");
        return;
      }
      await enviarSolicitud({
        deUsuarioId: userId,
        deUsuarioNombre: userName,
        paraUsuarioId,
        mensaje,
      });
    },
    [isGuest, userId, userName, enviarSolicitud]
  );

  const handleSelectContacto = useCallback((contacto: Contacto | null) => {
    setSelectedContacto(contacto);
  }, []);

  return {
    // State
    activeTab,
    searchQuery,
    isLoading,
    isRefreshing,
    error,
    selectedContacto,
    solicitudesSubTab,

    // Data
    contactos: filteredContactos,
    solicitudesRecibidas,
    solicitudesEnviadas,
    stats,
    userId,
    userName,
    isGuest,

    // Handlers
    handleTabChange,
    setSearchQuery,
    handleRefresh,
    handleAceptarSolicitud,
    handleRechazarSolicitud,
    handleEliminarContacto,
    handleEnviarSolicitud,
    handleSelectContacto,
    setSolicitudesSubTab,
  };
}
