import { useState, useCallback, useMemo, useEffect } from "react";
import { Alert } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../navigation/StackNavigator";
import { useMensajes } from "../context/MensajesContext";
import { usePlaneaciones } from "../sync/providers/SyncProvider";
import { useRecursos } from "../context/RecursosContext";
import { Conversacion, Mensaje, TipoMensaje } from "../../types";
import type { Planeacion } from "../../types/planeacionLegacy";
import type { Recurso } from "../../types";

export interface ConversacionViewModel {
  conversacion: Conversacion | undefined;
  mensajes: Mensaje[];
  isLoading: boolean;
  textoMensaje: string;
  showAttachModal: boolean;
  showPickerPlaneacion: boolean;
  showPickerRecurso: boolean;
  planeacionesDisponibles: Planeacion[];
  recursosDisponibles: Recurso[];
  currentUserId: string;

  setTextoMensaje: (texto: string) => void;
  onEnviarMensaje: () => Promise<void>;
  onAdjuntar: () => void;
  onCerrarAdjuntar: () => void;
  onAdjuntarPlaneacion: () => void;
  onAdjuntarArchivo: () => void;
  onAdjuntarFoto: () => void;
  onAdjuntarRecurso: () => void;
  onSeleccionarPlaneacion: (planeacion: Planeacion) => Promise<void>;
  onSeleccionarRecurso: (recurso: Recurso) => Promise<void>;
  onCerrarPickerPlaneacion: () => void;
  onCerrarPickerRecurso: () => void;
  onReintentarMensaje: (mensajeId: number) => Promise<void>;
  onGoBack: () => void;
  formatHora: (fecha: string) => string;
  isMensajePropio: (mensaje: Mensaje) => boolean;
}

export const useConversacionViewModel = (): ConversacionViewModel => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "Conversacion">>();
  const conversacionId = route.params?.conversacionId;

  const {
    getConversacion,
    getMensajesDeConversacion,
    enviarMensaje,
    marcarComoLeido,
    reintentarMensaje,
    isLoading,
  } = useMensajes();

  const { planeaciones } = usePlaneaciones();
  const { recursos } = useRecursos();

  const [textoMensaje, setTextoMensaje] = useState("");
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [showPickerPlaneacion, setShowPickerPlaneacion] = useState(false);
  const [showPickerRecurso, setShowPickerRecurso] = useState(false);

  // Current user ID — in a real app this would come from AuthContext
  const currentUserId = "user-ana-garcia";

  const conversacion = useMemo(
    () => (conversacionId ? getConversacion(conversacionId) : undefined),
    [conversacionId, getConversacion]
  );

  const mensajes = useMemo(
    () => (conversacionId ? getMensajesDeConversacion(conversacionId) : []),
    [conversacionId, getMensajesDeConversacion]
  );

  // Mark messages as read when entering the conversation
  useEffect(() => {
    if (conversacionId && conversacion && conversacion.mensajesNoLeidos > 0) {
      marcarComoLeido(conversacionId);
    }
  }, [conversacionId]);

  const onEnviarMensaje = useCallback(async () => {
    const texto = textoMensaje.trim();
    if (!texto || !conversacionId) return;

    setTextoMensaje("");
    await enviarMensaje({
      conversacionId,
      remitenteId: currentUserId,
      contenido: texto,
      tipo: "texto",
    });
  }, [textoMensaje, conversacionId, enviarMensaje, currentUserId]);

  const onAdjuntar = useCallback(() => {
    setShowAttachModal(true);
  }, []);

  const onCerrarAdjuntar = useCallback(() => {
    setShowAttachModal(false);
  }, []);

  const onAdjuntarPlaneacion = useCallback(() => {
    setShowAttachModal(false);
    if (planeaciones.length === 0) {
      Alert.alert("Sin planeaciones", "No tienes planeaciones para compartir. Crea una primero.");
      return;
    }
    setShowPickerPlaneacion(true);
  }, [planeaciones]);

  const onAdjuntarArchivo = useCallback(() => {
    setShowAttachModal(false);
    Alert.alert("Próximamente", "Adjuntar archivo se implementará próximamente.");
  }, []);

  const onAdjuntarFoto = useCallback(() => {
    setShowAttachModal(false);
    Alert.alert("Próximamente", "Adjuntar foto se implementará próximamente.");
  }, []);

  const onAdjuntarRecurso = useCallback(() => {
    setShowAttachModal(false);
    if (recursos.length === 0) {
      Alert.alert("Sin recursos", "No tienes recursos para compartir. Crea uno primero.");
      return;
    }
    setShowPickerRecurso(true);
  }, [recursos]);

  const onSeleccionarPlaneacion = useCallback(
    async (planeacion: Planeacion) => {
      if (!conversacionId) return;
      setShowPickerPlaneacion(false);
      await enviarMensaje({
        conversacionId,
        remitenteId: currentUserId,
        contenido: "",
        tipo: "planeacion",
        planeacion: {
          planeacionId: planeacion.id,
          titulo: planeacion.temaSesion || planeacion.asignatura,
          materia: planeacion.asignatura,
          grado: planeacion.grado,
        },
      });
    },
    [conversacionId, enviarMensaje, currentUserId]
  );

  const onSeleccionarRecurso = useCallback(
    async (recurso: Recurso) => {
      if (!conversacionId) return;
      setShowPickerRecurso(false);
      await enviarMensaje({
        conversacionId,
        remitenteId: currentUserId,
        contenido: "",
        tipo: "recurso",
        recurso: {
          recursoId: recurso.id as number,
          titulo: recurso.titulo,
          tipo: recurso.tipo,
          formato: recurso.formato,
        },
      });
    },
    [conversacionId, enviarMensaje, currentUserId]
  );

  const onCerrarPickerPlaneacion = useCallback(() => {
    setShowPickerPlaneacion(false);
  }, []);

  const onCerrarPickerRecurso = useCallback(() => {
    setShowPickerRecurso(false);
  }, []);

  const onReintentarMensaje = useCallback(
    async (mensajeId: number) => {
      await reintentarMensaje(mensajeId);
    },
    [reintentarMensaje]
  );

  const onGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const formatHora = useCallback((fecha: string): string => {
    const date = new Date(fecha);
    return date.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
  }, []);

  const isMensajePropio = useCallback(
    (mensaje: Mensaje): boolean => mensaje.remitenteId === currentUserId,
    [currentUserId]
  );

  return {
    conversacion,
    mensajes,
    isLoading,
    textoMensaje,
    showAttachModal,
    showPickerPlaneacion,
    showPickerRecurso,
    planeacionesDisponibles: planeaciones,
    recursosDisponibles: recursos,
    currentUserId,
    setTextoMensaje,
    onEnviarMensaje,
    onAdjuntar,
    onCerrarAdjuntar,
    onAdjuntarPlaneacion,
    onAdjuntarArchivo,
    onAdjuntarFoto,
    onAdjuntarRecurso,
    onSeleccionarPlaneacion,
    onSeleccionarRecurso,
    onCerrarPickerPlaneacion,
    onCerrarPickerRecurso,
    onReintentarMensaje,
    onGoBack,
    formatHora,
    isMensajePropio,
  };
};
