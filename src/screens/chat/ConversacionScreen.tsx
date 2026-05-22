import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useConversacionViewModel } from "../../hooks/useConversacionViewModel";
import { usePlaneaciones } from "../../sync/providers/SyncProvider";
import { useRecursos } from "../../context/RecursosContext";
import { Mensaje } from "../../../types";
import type { Planeacion } from "../../../types/planeacion";
import type { Recurso } from "../../../types";

// ─── Design Tokens ───
const DT = {
  primary: "#1676D2",
  primaryDark: "#0C63B8",
  primaryContainer: "#0576d2",
  primaryTint: "#EAF4FF",
  surface: "#FFFFFF",
  surfaceContainerLow: "#f1f4f8",
  surfaceContainer: "#ebeef2",
  background: "#EEF3FA",
  text: "#1E2A3A",
  textSecondary: "#5C6E86",
  textMuted: "#8A97AA",
  border: "#E3EAF4",
  outlineVariant: "#c0c7d4",
  success: "#0D9E70",
  error: "#C62828",
  errorTint: "#FFF1F2",
  warning: "#F58026",
  warningTint: "#FFF8F1",
};

// ─── Message Bubble ───
const MessageBubble: React.FC<{
  mensaje: Mensaje;
  isOwn: boolean;
  formatHora: (fecha: string) => string;
  onRetry?: (id: number) => void;
  onAddToLibrary?: (mensaje: Mensaje) => void;
}> = ({ mensaje, isOwn, formatHora, onRetry, onAddToLibrary }) => {
  const isError = mensaje.estado === "error";

  // File message
  if (mensaje.tipo === "archivo" && mensaje.archivo) {
    return (
      <View style={[styles.bubbleWrap, isOwn ? styles.bubbleWrapRight : styles.bubbleWrapLeft]}>
        <View style={[styles.fileBubble, isOwn ? styles.fileBubbleOwn : styles.fileBubbleOther]}>
          <View style={styles.fileRow}>
            <View
              style={[
                styles.fileIconCircle,
                { backgroundColor: isOwn ? "rgba(255,255,255,0.15)" : DT.primaryTint },
              ]}
            >
              <MaterialIcons name="description" size={20} color={isOwn ? "#FFFFFF" : DT.primary} />
            </View>
            <View style={styles.fileInfo}>
              <Text
                style={[styles.fileName, { color: isOwn ? "#FFFFFF" : DT.text }]}
                numberOfLines={1}
              >
                {mensaje.archivo.nombre}
              </Text>
              <Text
                style={[styles.fileSize, { color: isOwn ? "rgba(255,255,255,0.7)" : DT.textMuted }]}
              >
                {Math.round(mensaje.archivo.tamaño / 1024)} KB ·{" "}
                {mensaje.archivo.formato.toUpperCase()}
              </Text>
            </View>
            {!isOwn && <Text style={styles.fileDownload}>Descargar</Text>}
          </View>
          <Text
            style={[styles.bubbleTime, { color: isOwn ? "rgba(255,255,255,0.7)" : DT.textMuted }]}
          >
            {formatHora(mensaje.fechaCreacion)}
          </Text>
        </View>
      </View>
    );
  }

  // Planeacion message
  if (mensaje.tipo === "planeacion" && mensaje.planeacion) {
    return (
      <View style={[styles.bubbleWrap, isOwn ? styles.bubbleWrapRight : styles.bubbleWrapLeft]}>
        <View style={styles.planeacionBubble}>
          <View style={styles.planeacionHeader}>
            <MaterialIcons name="auto-stories" size={18} color={DT.primary} />
            <Text style={styles.planeacionHeaderText}>PLANEACIÓN COMPARTIDA</Text>
          </View>
          <View style={styles.planeacionBody}>
            <Text style={styles.planeacionTitle}>{mensaje.planeacion.titulo}</Text>
            <Text style={styles.planeacionMeta}>
              {mensaje.planeacion.materia} · {mensaje.planeacion.grado}
            </Text>
            {!isOwn && onAddToLibrary && (
              <TouchableOpacity
                style={styles.addToLibraryBtn}
                onPress={() => onAddToLibrary(mensaje)}
                activeOpacity={0.7}
              >
                <MaterialIcons name="library-add" size={16} color="#FFFFFF" />
                <Text style={styles.addToLibraryText}>Añadir a mi biblioteca</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={[styles.bubbleTime, { paddingHorizontal: 14, paddingBottom: 8 }]}>
            {formatHora(mensaje.fechaCreacion)}
          </Text>
        </View>
      </View>
    );
  }

  // Recurso message
  if (mensaje.tipo === "recurso" && mensaje.recurso) {
    const tipoLabel: Record<string, string> = {
      examen: "Examen",
      presentacion: "Presentación",
      mapa_mental: "Mapa Mental",
      linea_tiempo: "Línea de Tiempo",
      video: "Video",
      documento: "Documento",
      imagen: "Imagen",
      audio: "Audio",
      enlace: "Enlace",
      otro: "Otro",
    };
    return (
      <View style={[styles.bubbleWrap, isOwn ? styles.bubbleWrapRight : styles.bubbleWrapLeft]}>
        <View style={styles.recursoBubble}>
          <View style={styles.recursoHeader}>
            <MaterialIcons name="library-books" size={18} color="#7C3AED" />
            <Text style={styles.recursoHeaderText}>RECURSO COMPARTIDO</Text>
          </View>
          <View style={styles.recursoBody}>
            <Text style={styles.recursoTitle}>{mensaje.recurso.titulo}</Text>
            <Text style={styles.recursoMeta}>
              {tipoLabel[mensaje.recurso.tipo] || mensaje.recurso.tipo}
              {mensaje.recurso.formato ? ` · ${mensaje.recurso.formato.toUpperCase()}` : ""}
            </Text>
            {!isOwn && onAddToLibrary && (
              <TouchableOpacity
                style={styles.addToLibraryBtnRecurso}
                onPress={() => onAddToLibrary(mensaje)}
                activeOpacity={0.7}
              >
                <MaterialIcons name="library-add" size={16} color="#FFFFFF" />
                <Text style={styles.addToLibraryText}>Añadir a mi biblioteca</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={[styles.bubbleTime, { paddingHorizontal: 14, paddingBottom: 8 }]}>
            {formatHora(mensaje.fechaCreacion)}
          </Text>
        </View>
      </View>
    );
  }

  // Text message
  return (
    <View style={[styles.bubbleWrap, isOwn ? styles.bubbleWrapRight : styles.bubbleWrapLeft]}>
      <View
        style={[
          styles.textBubble,
          isOwn ? styles.textBubbleOwn : styles.textBubbleOther,
          isError && styles.textBubbleError,
        ]}
      >
        <Text style={[styles.bubbleText, { color: isOwn ? "#FFFFFF" : DT.text }]}>
          {mensaje.contenido}
        </Text>
        <View style={styles.bubbleFooter}>
          {isError ? (
            <View style={styles.errorRow}>
              <MaterialIcons name="error-outline" size={12} color="rgba(255,255,255,0.7)" />
              <Text style={styles.errorText}>Error al enviar</Text>
              <TouchableOpacity onPress={() => onRetry?.(mensaje.id)}>
                <Text style={styles.retryText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text
                style={[
                  styles.bubbleTime,
                  { color: isOwn ? "rgba(255,255,255,0.7)" : DT.textMuted },
                ]}
              >
                {formatHora(mensaje.fechaCreacion)}
              </Text>
              {isOwn && (
                <MaterialIcons
                  name="done-all"
                  size={12}
                  color={mensaje.estado === "leido" ? "#FFFFFF" : "rgba(255,255,255,0.7)"}
                  style={{ marginLeft: 4 }}
                />
              )}
            </>
          )}
        </View>
      </View>
    </View>
  );
};

// ─── Attach Modal (Bottom Sheet) ───
const AttachModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onPlaneacion: () => void;
  onArchivo: () => void;
  onFoto: () => void;
  onRecurso: () => void;
}> = ({ visible, onClose, onPlaneacion, onArchivo, onFoto, onRecurso }) => (
  <Modal visible={visible} transparent animationType="slide">
    <TouchableOpacity style={styles.attachOverlay} activeOpacity={1} onPress={onClose}>
      <View style={styles.attachSheet}>
        <View style={styles.handleBar} />
        <Text style={styles.attachTitle}>Compartir</Text>
        <View style={styles.attachGrid}>
          <TouchableOpacity style={styles.attachOption} onPress={onPlaneacion} activeOpacity={0.7}>
            <View style={[styles.attachIconCircle, { backgroundColor: DT.primaryTint }]}>
              <MaterialIcons name="auto-stories" size={24} color={DT.primary} />
            </View>
            <Text style={styles.attachLabel}>Planeación</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.attachOption} onPress={onArchivo} activeOpacity={0.7}>
            <View style={[styles.attachIconCircle, { backgroundColor: "#E7F9F3" }]}>
              <MaterialIcons name="upload-file" size={24} color={DT.success} />
            </View>
            <Text style={styles.attachLabel}>Archivo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.attachOption} onPress={onFoto} activeOpacity={0.7}>
            <View style={[styles.attachIconCircle, { backgroundColor: DT.warningTint }]}>
              <MaterialIcons name="photo-camera" size={24} color={DT.warning} />
            </View>
            <Text style={styles.attachLabel}>Foto</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.attachOption} onPress={onRecurso} activeOpacity={0.7}>
            <View style={[styles.attachIconCircle, { backgroundColor: "#F3E8FF" }]}>
              <MaterialIcons name="library-books" size={24} color="#7C3AED" />
            </View>
            <Text style={styles.attachLabel}>Recurso</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.attachCancelBtn} onPress={onClose} activeOpacity={0.7}>
          <Text style={styles.attachCancelText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  </Modal>
);

// ─── Picker Modal (shared for planeaciones and recursos) ───
const PickerModal: React.FC<{
  visible: boolean;
  title: string;
  icon: string;
  iconColor: string;
  items: Array<{ id: string | number; title: string; subtitle: string }>;
  onSelect: (id: string | number) => void;
  onClose: () => void;
}> = ({ visible, title, icon, iconColor, items, onSelect, onClose }) => (
  <Modal visible={visible} transparent animationType="slide">
    <TouchableOpacity style={styles.attachOverlay} activeOpacity={1} onPress={onClose}>
      <View style={styles.pickerSheet}>
        <View style={styles.handleBar} />
        <Text style={styles.attachTitle}>{title}</Text>
        {items.length === 0 ? (
          <View style={styles.pickerEmpty}>
            <Text style={styles.pickerEmptyText}>No hay elementos disponibles</Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => String(item.id)}
            style={styles.pickerList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.pickerItem}
                onPress={() => onSelect(item.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.pickerIconCircle, { backgroundColor: `${iconColor}20` }]}>
                  <MaterialIcons name={icon as any} size={20} color={iconColor} />
                </View>
                <View style={styles.pickerItemInfo}>
                  <Text style={styles.pickerItemTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.pickerItemSubtitle} numberOfLines={1}>
                    {item.subtitle}
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={DT.textMuted} />
              </TouchableOpacity>
            )}
          />
        )}
        <TouchableOpacity style={styles.attachCancelBtn} onPress={onClose} activeOpacity={0.7}>
          <Text style={styles.attachCancelText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  </Modal>
);

// ─── Main Screen ───
const ConversacionScreen: React.FC = () => {
  const vm = useConversacionViewModel();
  const { agregarPlaneacion } = usePlaneaciones();
  const { crearRecurso } = useRecursos();
  const flatListRef = useRef<FlatList>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (vm.mensajes.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [vm.mensajes.length]);

  const getInitials = (nombre: string): string => {
    const parts = nombre?.split(" ") || [];
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return nombre?.substring(0, 2).toUpperCase() || "?";
  };

  const handleAddToLibrary = async (mensaje: Mensaje) => {
    try {
      if (mensaje.tipo === "planeacion" && mensaje.planeacion) {
        // Create a minimal planeacion object and add to library
        const planeacion = {
          id: mensaje.planeacion.planeacionId,
          nivelAcademico: "primaria",
          asignatura: mensaje.planeacion.materia,
          grado: mensaje.planeacion.grado,
          grupo: "",
          fecha: new Date().toISOString(),
          horaInicio: "08:00",
          duracionTotal: 60,
          unidadTematica: "",
          temaSesion: mensaje.planeacion.titulo,
          aprendizajesEsperados: [],
          actividades: [],
          recursos: [],
          evaluacion: "",
          evidencias: [],
          observaciones: `Compartida por chat el ${new Date().toLocaleDateString("es-MX")}`,
          fechaCreacion: new Date().toISOString(),
          fechaModificacion: new Date().toISOString(),
        } as any;
        await agregarPlaneacion(planeacion);
        Alert.alert("Añadido", "La planeación se agregó a tu biblioteca.");
      } else if (mensaje.tipo === "recurso" && mensaje.recurso) {
        await crearRecurso({
          titulo: mensaje.recurso.titulo,
          tipo: (mensaje.recurso.tipo as any) || "otro",
          descripcion: `Compartido por chat el ${new Date().toLocaleDateString("es-MX")}`,
          tags: ["compartido"],
          asignadoComoTarea: false,
          acceso: "privado",
          origen: "manual",
          profesorId: vm.currentUserId,
          versionActual: 1,
          formato: mensaje.recurso.formato,
          fechaCreacion: new Date(),
          fechaModificacion: new Date(),
        });
        Alert.alert("Añadido", "El recurso se agregó a tu biblioteca.");
      }
    } catch {
      Alert.alert("Error", "No se pudo agregar a tu biblioteca. Intenta de nuevo.");
    }
  };

  const planeacionItems = vm.planeacionesDisponibles.map((p) => ({
    id: p.id,
    title: p.temaSesion || p.asignatura,
    subtitle: `${p.asignatura} · ${p.grado}`,
  }));

  const recursoItems = vm.recursosDisponibles.map((r) => ({
    id: r.id as number,
    title: r.titulo,
    subtitle: `${r.tipo}${r.formato ? ` · ${r.formato.toUpperCase()}` : ""}`,
  }));

  const renderMessage = ({ item }: { item: Mensaje }) => (
    <MessageBubble
      mensaje={item}
      isOwn={vm.isMensajePropio(item)}
      formatHora={vm.formatHora}
      onRetry={vm.onReintentarMensaje}
      onAddToLibrary={handleAddToLibrary}
    />
  );

  if (!vm.conversacion) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyConvContainer}>
          <MaterialIcons name="chat-bubble-outline" size={64} color="#c0c7d4" />
          <Text style={styles.emptyConvText}>Conversación no encontrada</Text>
          <TouchableOpacity onPress={vm.onGoBack}>
            <Text style={styles.emptyConvLink}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const canSend = vm.textoMensaje.trim().length > 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={styles.chatHeader}>
          <TouchableOpacity style={styles.chatHeaderBtn} onPress={vm.onGoBack} activeOpacity={0.7}>
            <MaterialIcons name="arrow-back" size={24} color={DT.text} />
          </TouchableOpacity>
          <View
            style={[
              styles.chatHeaderAvatar,
              { backgroundColor: vm.conversacion.contactoColor || "#4A90D9" },
            ]}
          >
            <Text style={styles.chatHeaderAvatarText}>
              {getInitials(vm.conversacion.contactoNombre)}
            </Text>
          </View>
          <View style={styles.chatHeaderInfo}>
            <Text style={styles.chatHeaderName} numberOfLines={1}>
              {vm.conversacion.contactoNombre}
            </Text>
            {vm.conversacion.contactoEnLinea ? (
              <View style={styles.chatHeaderOnlineRow}>
                <View style={styles.chatHeaderOnlineDot} />
                <Text style={styles.chatHeaderOnlineText}>En línea</Text>
              </View>
            ) : (
              <Text style={styles.chatHeaderOfflineText}>Desconectado</Text>
            )}
          </View>
          <TouchableOpacity style={styles.chatHeaderBtn} activeOpacity={0.7}>
            <MaterialIcons name="more-vert" size={22} color={DT.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <View style={styles.messagesArea}>
          {vm.mensajes.length === 0 ? (
            <View style={styles.emptyMsgContainer}>
              <View
                style={[
                  styles.emptyMsgAvatar,
                  { backgroundColor: vm.conversacion.contactoColor || "#4A90D9" },
                ]}
              >
                <Text style={styles.emptyMsgAvatarText}>
                  {getInitials(vm.conversacion.contactoNombre)}
                </Text>
              </View>
              <Text style={styles.emptyMsgName}>{vm.conversacion.contactoNombre}</Text>
              <Text style={styles.emptyMsgHint}>Envía un mensaje para iniciar la conversación</Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={vm.mensajes}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderMessage}
              contentContainerStyle={styles.messagesList}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            />
          )}
        </View>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TouchableOpacity
            style={styles.inputAttachBtn}
            onPress={vm.onAdjuntar}
            activeOpacity={0.7}
          >
            <MaterialIcons name="attach-file" size={22} color={DT.textSecondary} />
          </TouchableOpacity>
          <TextInput
            style={styles.inputField}
            placeholder="Escribe un mensaje..."
            placeholderTextColor={DT.textMuted}
            value={vm.textoMensaje}
            onChangeText={vm.setTextoMensaje}
            multiline
            maxLength={2000}
            onSubmitEditing={canSend ? vm.onEnviarMensaje : undefined}
          />
          <TouchableOpacity
            style={[
              styles.inputSendBtn,
              canSend ? styles.inputSendBtnActive : styles.inputSendBtnDisabled,
            ]}
            onPress={canSend ? vm.onEnviarMensaje : undefined}
            activeOpacity={canSend ? 0.7 : 1}
            disabled={!canSend}
          >
            <MaterialIcons name="send" size={20} color={canSend ? "#FFFFFF" : "#c0c7d4"} />
          </TouchableOpacity>
        </View>

        {/* Attach Modal */}
        <AttachModal
          visible={vm.showAttachModal}
          onClose={vm.onCerrarAdjuntar}
          onPlaneacion={vm.onAdjuntarPlaneacion}
          onArchivo={vm.onAdjuntarArchivo}
          onFoto={vm.onAdjuntarFoto}
          onRecurso={vm.onAdjuntarRecurso}
        />

        {/* Planeacion Picker */}
        <PickerModal
          visible={vm.showPickerPlaneacion}
          title="Compartir Planeación"
          icon="auto-stories"
          iconColor={DT.primary}
          items={planeacionItems}
          onSelect={(id) => {
            const p = vm.planeacionesDisponibles.find((pl) => pl.id === id);
            if (p) vm.onSeleccionarPlaneacion(p);
          }}
          onClose={vm.onCerrarPickerPlaneacion}
        />

        {/* Recurso Picker */}
        <PickerModal
          visible={vm.showPickerRecurso}
          title="Compartir Recurso"
          icon="library-books"
          iconColor="#7C3AED"
          items={recursoItems}
          onSelect={(id) => {
            const r = vm.recursosDisponibles.find((rc) => rc.id === id);
            if (r) vm.onSeleccionarRecurso(r);
          }}
          onClose={vm.onCerrarPickerRecurso}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ConversacionScreen;

// ─── Styles ───
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: DT.surface,
  },
  // Chat Header
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: DT.surface,
    borderBottomWidth: 1,
    borderBottomColor: DT.border,
    gap: 10,
  },
  chatHeaderBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: DT.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  chatHeaderAvatar: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  chatHeaderAvatarText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatHeaderName: {
    fontSize: 15,
    fontWeight: "700",
    color: DT.text,
  },
  chatHeaderOnlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  chatHeaderOnlineDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: DT.success,
  },
  chatHeaderOnlineText: {
    fontSize: 11,
    color: DT.success,
  },
  chatHeaderOfflineText: {
    fontSize: 11,
    color: DT.textMuted,
  },
  // Messages Area
  messagesArea: {
    flex: 1,
    backgroundColor: DT.background,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 8,
  },
  // Bubble common
  bubbleWrap: {
    marginBottom: 6,
  },
  bubbleWrapLeft: {
    alignItems: "flex-start",
  },
  bubbleWrapRight: {
    alignItems: "flex-end",
  },
  textBubble: {
    maxWidth: 280,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  textBubbleOther: {
    backgroundColor: DT.surface,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    ...Platform.select({
      web: { boxShadow: "0px 2px 8px rgba(0,72,132,0.04)" } as any,
      default: {
        shadowColor: "#004884",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 1,
      },
    }),
  },
  textBubbleOwn: {
    backgroundColor: DT.primary,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    ...Platform.select({
      web: { boxShadow: "0px 2px 8px rgba(22,118,210,0.15)" } as any,
      default: {
        shadowColor: DT.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 2,
      },
    }),
  },
  textBubbleError: {
    backgroundColor: DT.error,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },
  bubbleFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  bubbleTime: {
    fontSize: 10,
    color: DT.textMuted,
  },
  // Error in bubble
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  errorText: {
    fontSize: 10,
    color: "rgba(255,255,255,0.7)",
  },
  retryText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
    textDecorationLine: "underline",
    marginLeft: 4,
  },
  // File bubble
  fileBubble: {
    maxWidth: 280,
    borderRadius: 16,
    padding: 12,
  },
  fileBubbleOther: {
    backgroundColor: DT.surface,
    borderBottomLeftRadius: 4,
  },
  fileBubbleOwn: {
    backgroundColor: DT.primary,
    borderBottomRightRadius: 4,
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  fileIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "700",
  },
  fileSize: {
    fontSize: 12,
    marginTop: 2,
  },
  fileDownload: {
    fontSize: 13,
    fontWeight: "700",
    color: DT.primary,
  },
  // Planeacion bubble
  planeacionBubble: {
    maxWidth: 280,
    backgroundColor: DT.surface,
    borderRadius: 16,
    overflow: "hidden",
  },
  planeacionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: DT.primaryTint,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  planeacionHeaderText: {
    fontSize: 12,
    fontWeight: "700",
    color: DT.primary,
  },
  planeacionBody: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  planeacionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: DT.text,
  },
  planeacionMeta: {
    fontSize: 13,
    color: DT.textSecondary,
    marginTop: 4,
  },
  planeacionLink: {
    fontSize: 14,
    fontWeight: "700",
    color: DT.primary,
    marginTop: 8,
  },
  // Recurso bubble
  recursoBubble: {
    maxWidth: 280,
    backgroundColor: DT.surface,
    borderRadius: 16,
    overflow: "hidden",
  },
  recursoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F3E8FF",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  recursoHeaderText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#7C3AED",
  },
  recursoBody: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  recursoTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: DT.text,
  },
  recursoMeta: {
    fontSize: 13,
    color: DT.textSecondary,
    marginTop: 4,
  },
  // Add to library button
  addToLibraryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: DT.primary,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginTop: 10,
  },
  addToLibraryBtnRecurso: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#7C3AED",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginTop: 10,
  },
  addToLibraryText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  // Empty conversation
  emptyConvContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: DT.background,
  },
  emptyConvText: {
    fontSize: 18,
    fontWeight: "600",
    color: DT.textMuted,
    marginTop: 12,
  },
  emptyConvLink: {
    fontSize: 15,
    fontWeight: "700",
    color: DT.primary,
    marginTop: 12,
  },
  // Empty messages
  emptyMsgContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyMsgAvatar: {
    width: 64,
    height: 64,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyMsgAvatarText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  emptyMsgName: {
    fontSize: 17,
    fontWeight: "700",
    color: DT.text,
    marginTop: 12,
    textAlign: "center",
  },
  emptyMsgHint: {
    fontSize: 14,
    color: DT.textMuted,
    marginTop: 16,
    textAlign: "center",
    maxWidth: 260,
  },
  // Input Bar
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: DT.surface,
    borderTopWidth: 1,
    borderTopColor: DT.border,
    gap: 8,
  },
  inputAttachBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: DT.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
  },
  inputField: {
    flex: 1,
    backgroundColor: DT.surfaceContainerLow,
    borderRadius: 20,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 15,
    color: DT.text,
  },
  inputSendBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  inputSendBtnActive: {
    backgroundColor: DT.primary,
  },
  inputSendBtnDisabled: {
    backgroundColor: DT.surfaceContainer,
  },
  // Attach Modal
  attachOverlay: {
    flex: 1,
    backgroundColor: "rgba(19, 30, 49, 0.42)",
    justifyContent: "flex-end",
  },
  attachSheet: {
    backgroundColor: DT.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 999,
    backgroundColor: DT.outlineVariant,
    alignSelf: "center",
    marginTop: 8,
  },
  attachTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: DT.text,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  attachGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 12,
  },
  attachOption: {
    width: "47%",
    backgroundColor: DT.surfaceContainerLow,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  attachIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  attachLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: DT.text,
    marginTop: 8,
  },
  attachCancelBtn: {
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  attachCancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: DT.textSecondary,
  },
  // Picker Modal
  pickerSheet: {
    backgroundColor: DT.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "60%",
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
  },
  pickerList: {
    maxHeight: 300,
  },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: DT.border,
  },
  pickerIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  pickerItemInfo: {
    flex: 1,
  },
  pickerItemTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: DT.text,
  },
  pickerItemSubtitle: {
    fontSize: 13,
    color: DT.textSecondary,
    marginTop: 2,
  },
  pickerEmpty: {
    padding: 32,
    alignItems: "center",
  },
  pickerEmptyText: {
    fontSize: 15,
    color: DT.textMuted,
  },
});
