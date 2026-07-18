import { useState, useCallback, useMemo } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { AppRoutesParamList } from "../navigation/StackNavigator";
import { useMensajes } from "../context/MensajesContext";
import { Conversacion } from "../../types";

export type FiltroChat = "todos" | "no_leidos" | "con_archivos";

export interface ChatViewModel {
  conversaciones: Conversacion[];
  filteredConversaciones: Conversacion[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  filtroActivo: FiltroChat;
  showDeleteModal: boolean;
  conversacionToDelete: Conversacion | null;

  setSearchQuery: (query: string) => void;
  setFiltroActivo: (filtro: FiltroChat) => void;
  onConversacionPress: (conversacion: Conversacion) => void;
  onNuevoChat: () => void;
  onDeleteRequest: (conversacion: Conversacion) => void;
  onConfirmDelete: () => Promise<void>;
  onCancelDelete: () => void;
  onRefresh: () => Promise<void>;
  formatTimestamp: (fecha: string | undefined) => string;
}

export const useChatViewModel = (): ChatViewModel => {
  const navigation = useNavigation<StackNavigationProp<AppRoutesParamList>>();
  const { conversaciones, isLoading, error, eliminarConversacion, refreshMensajes } = useMensajes();

  const [searchQuery, setSearchQuery] = useState("");
  const [filtroActivo, setFiltroActivo] = useState<FiltroChat>("todos");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [conversacionToDelete, setConversacionToDelete] = useState<Conversacion | null>(null);

  const filteredConversaciones = useMemo(() => {
    let result = [...conversaciones];

    // Apply search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.contactoNombre.toLowerCase().includes(q) || c.ultimoMensaje?.toLowerCase().includes(q)
      );
    }

    // Apply tab filter
    if (filtroActivo === "no_leidos") {
      result = result.filter((c) => c.mensajesNoLeidos > 0);
    } else if (filtroActivo === "con_archivos") {
      result = result.filter(
        (c) => c.ultimoMensajeTipo === "archivo" || c.ultimoMensajeTipo === "planeacion"
      );
    }

    return result;
  }, [conversaciones, searchQuery, filtroActivo]);

  const formatTimestamp = useCallback((fecha: string | undefined): string => {
    if (!fecha) return "";
    const date = new Date(fecha);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const dayMs = 86400000;

    if (diff < dayMs && date.getDate() === now.getDate()) {
      return date.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
    }
    if (diff < 2 * dayMs) return "Ayer";

    const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    if (diff < 7 * dayMs) return days[date.getDay()];

    return date.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
  }, []);

  const onConversacionPress = useCallback(
    (conversacion: Conversacion) => {
      navigation.navigate("Conversacion", { conversacionId: conversacion.id });
    },
    [navigation]
  );

  const onNuevoChat = useCallback(() => {
    Alert.alert("Próximamente", "Seleccionar contacto para nuevo chat.");
  }, []);

  const onDeleteRequest = useCallback((conversacion: Conversacion) => {
    setConversacionToDelete(conversacion);
    setShowDeleteModal(true);
  }, []);

  const onConfirmDelete = useCallback(async () => {
    if (conversacionToDelete) {
      await eliminarConversacion(conversacionToDelete.id);
    }
    setShowDeleteModal(false);
    setConversacionToDelete(null);
  }, [conversacionToDelete, eliminarConversacion]);

  const onCancelDelete = useCallback(() => {
    setShowDeleteModal(false);
    setConversacionToDelete(null);
  }, []);

  const onRefresh = useCallback(async () => {
    await refreshMensajes();
  }, [refreshMensajes]);

  return {
    conversaciones,
    filteredConversaciones,
    isLoading,
    error,
    searchQuery,
    filtroActivo,
    showDeleteModal,
    conversacionToDelete,
    setSearchQuery,
    setFiltroActivo,
    onConversacionPress,
    onNuevoChat,
    onDeleteRequest,
    onConfirmDelete,
    onCancelDelete,
    onRefresh,
    formatTimestamp,
  };
};
