import React from "react";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { RouteProp } from "@react-navigation/native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../../types";
import type { Recurso } from "../../../types";
import { useRecursos } from "../../context/RecursosContext";
import type { RootStackParamList } from "../../navigation/StackNavigator";

type Navigation = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "DetalleRecursoClassroom">;

interface ClassroomAttachment {
  label: string;
  type: "archivo" | "enlace";
  uri: string;
}

const ATTACHMENTS_TAG_PREFIX = "classroom-attachments:";

const isPlaneacionResource = (recurso: Recurso): boolean =>
  recurso.url?.startsWith("planeacion://") === true ||
  Boolean(recurso.tags?.some((tag) => tag.toLowerCase() === "planeacion"));

const parseClassroomAttachments = (recurso: Recurso): ClassroomAttachment[] => {
  const tag = recurso.tags?.find((item) => item.startsWith(ATTACHMENTS_TAG_PREFIX));
  if (!tag) {
    const fallback = recurso.url || recurso.archivo;
    return fallback
      ? [
          {
            label: recurso.archivo || recurso.url || recurso.titulo,
            type: recurso.url?.startsWith("http") ? "enlace" : "archivo",
            uri: fallback,
          },
        ]
      : [];
  }

  try {
    const raw = decodeURIComponent(tag.replace(ATTACHMENTS_TAG_PREFIX, ""));
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isClassroomAttachment);
  } catch {
    return [];
  }
};

const isClassroomAttachment = (value: unknown): value is ClassroomAttachment => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ClassroomAttachment>;
  return (
    typeof candidate.label === "string" &&
    typeof candidate.uri === "string" &&
    (candidate.type === "archivo" || candidate.type === "enlace")
  );
};

const getResourceIcon = (tipo?: Recurso["tipo"]): keyof typeof MaterialIcons.glyphMap => {
  if (tipo === "video") return "smart-display";
  if (tipo === "audio") return "audiotrack";
  if (tipo === "imagen") return "image";
  if (tipo === "enlace") return "link";
  if (tipo === "presentacion") return "slideshow";
  if (tipo === "examen") return "quiz";
  return "description";
};

const formatDate = (value?: Date | string): string => {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Sin fecha";
  return date.toLocaleDateString();
};

const DetalleRecursoClassroomScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const { grupoId, recursoId } = route.params;
  const { actualizarRecurso, eliminarRecurso, obtenerRecursoPorId } = useRecursos();
  const recurso = obtenerRecursoPorId(recursoId);
  const attachments = React.useMemo(
    () => (recurso ? parseClassroomAttachments(recurso) : []),
    [recurso]
  );
  const visibleTags = React.useMemo(
    () => recurso?.tags?.filter((tag) => !tag.startsWith(ATTACHMENTS_TAG_PREFIX)) ?? [],
    [recurso?.tags]
  );

  const showMessage = React.useCallback((title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n\n${message}`);
      return;
    }
    Alert.alert(title, message);
  }, []);

  const handleOpen = React.useCallback(async () => {
    if (!recurso) return;

    if (isPlaneacionResource(recurso) && recurso.url) {
      navigation.navigate("DocEditor", {
        modo: "editar",
        planeacionId: recurso.url.replace("planeacion://", ""),
      });
      return;
    }

    const target = recurso.url || recurso.archivo;
    if (!target) {
      showMessage("Sin archivo", "Este recurso no tiene archivo o enlace asociado.");
      return;
    }

    const canOpen = await Linking.canOpenURL(target);
    if (!canOpen) {
      showMessage(
        "No se pudo abrir",
        "El enlace o archivo no esta disponible en este dispositivo."
      );
      return;
    }
    await Linking.openURL(target);
  }, [navigation, recurso, showMessage]);

  const handleOpenAttachment = React.useCallback(
    async (attachment: ClassroomAttachment) => {
      const canOpen = await Linking.canOpenURL(attachment.uri);
      if (!canOpen) {
        showMessage(
          "No se pudo abrir",
          "El archivo o enlace no esta disponible en este dispositivo."
        );
        return;
      }
      await Linking.openURL(attachment.uri);
    },
    [showMessage]
  );

  const handleRemoveFromClass = React.useCallback(() => {
    if (!recurso || typeof recurso.id !== "number") return;
    const message = "El recurso seguira existiendo en Biblioteca, pero se quitara de esta clase.";
    const remove = async () => {
      await actualizarRecurso(recurso.id as number, {
        grupoId: undefined,
        unidadId: undefined,
        fechaModificacion: new Date(),
      });
      showMessage("Material quitado", "El recurso ya no aparece en esta clase.");
      const targetGrupoId =
        grupoId ?? (typeof recurso.grupoId === "number" ? recurso.grupoId : undefined);
      if (targetGrupoId) {
        navigation.navigate("ClassroomGroup", { grupoId: targetGrupoId });
      } else {
        navigation.goBack();
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm(`Quitar de la clase\n\n${message}`)) void remove();
      return;
    }

    Alert.alert("Quitar de la clase", message, [
      { text: "Cancelar", style: "cancel" },
      { text: "Quitar", style: "destructive", onPress: () => void remove() },
    ]);
  }, [actualizarRecurso, grupoId, navigation, recurso, showMessage]);

  const handleDelete = React.useCallback(() => {
    if (!recurso || typeof recurso.id !== "number") return;
    const message =
      "Esto eliminara el recurso de Biblioteca y de cualquier clase donde este asignado.";
    const remove = async () => {
      await eliminarRecurso(recurso.id as number);
      showMessage("Recurso eliminado", "El material fue eliminado correctamente.");
      const targetGrupoId =
        grupoId ?? (typeof recurso.grupoId === "number" ? recurso.grupoId : undefined);
      if (targetGrupoId) {
        navigation.navigate("ClassroomGroup", { grupoId: targetGrupoId });
      } else {
        navigation.goBack();
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm(`Eliminar recurso\n\n${message}`)) void remove();
      return;
    }

    Alert.alert("Eliminar recurso", message, [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => void remove() },
    ]);
  }, [eliminarRecurso, grupoId, navigation, recurso, showMessage]);

  if (!recurso) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerBox}>
          <MaterialIcons name="description" size={42} color={COLORS.primary} />
          <Text style={styles.emptyTitle}>No encontramos este recurso</Text>
          <Text style={styles.emptyText}>
            Puede haberse eliminado o estar pendiente de recarga local.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && { opacity: 0.6 }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.primaryButtonText}>Volver</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroller}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={Platform.OS === "web"}
      >
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={22} color="#0F172A" />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>Material</Text>
            <Text style={styles.title}>{recurso.titulo}</Text>
            <Text style={styles.subtitle}>
              {recurso.tipo} - Actualizado: {formatDate(recurso.fechaModificacion)}
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.secondaryButton, pressed && { opacity: 0.6 }]}
            onPress={() =>
              navigation.navigate("AgregarContenidoClassroom", {
                kind: "material",
                modo: "editar",
                recursoId,
                grupoId: grupoId ?? Number(recurso.grupoId),
                unidadId: recurso.unidadId,
              })
            }
          >
            <MaterialIcons name="edit" size={18} color={COLORS.primary} />
            <Text style={styles.secondaryButtonText}>Editar</Text>
          </Pressable>
        </View>

        <View style={styles.viewerCard}>
          <View style={styles.viewerIcon}>
            <MaterialIcons name={getResourceIcon(recurso.tipo)} size={54} color="#FFFFFF" />
          </View>
          <Text style={styles.viewerTitle}>{resolvePreviewTitle(recurso)}</Text>
          <Text style={styles.viewerText}>
            {recurso.descripcion || "Sin descripcion para este material."}
          </Text>
          <Pressable
            style={({ pressed }) => [styles.openButton, pressed && { opacity: 0.6 }]}
            onPress={() => void handleOpen()}
          >
            <MaterialIcons
              name={isPlaneacionResource(recurso) ? "article" : "open-in-new"}
              size={19}
              color="#FFFFFF"
            />
            <Text style={styles.openButtonText}>
              {isPlaneacionResource(recurso) ? "Abrir planeacion" : "Abrir recurso"}
            </Text>
          </Pressable>
        </View>

        {attachments.length ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Adjuntos</Text>
            <Text style={styles.sectionDescription}>
              Archivos y enlaces publicados en esta seccion de Classroom.
            </Text>
            <View style={styles.attachmentsList}>
              {attachments.map((attachment) => (
                <Pressable
                  key={attachment.uri}
                  style={({ pressed }) => [styles.attachmentRow, pressed && { opacity: 0.6 }]}
                  onPress={() => void handleOpenAttachment(attachment)}
                >
                  <View style={styles.attachmentIcon}>
                    <MaterialIcons
                      name={attachment.type === "enlace" ? "link" : "insert-drive-file"}
                      size={20}
                      color={COLORS.primary}
                    />
                  </View>
                  <View style={styles.attachmentCopy}>
                    <Text style={styles.attachmentTitle}>{attachment.label}</Text>
                    <Text style={styles.attachmentMeta}>
                      {attachment.type === "enlace" ? attachment.uri : "Archivo adjunto"}
                    </Text>
                  </View>
                  <MaterialIcons name="open-in-new" size={18} color="#94A3B8" />
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.metaGrid}>
          <MetaCard label="Tipo" value={recurso.tipo} icon="category" />
          <MetaCard label="Acceso" value={recurso.acceso} icon="lock" />
          <MetaCard label="Origen" value={recurso.origen} icon="source" />
          <MetaCard
            label="Formato"
            value={recurso.formato || "Sin formato"}
            icon="insert-drive-file"
          />
        </View>

        {visibleTags.length ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Etiquetas</Text>
            <View style={styles.tagsWrap}>
              {visibleTags.map((tag) => (
                <Text key={tag} style={styles.tag}>
                  {tag}
                </Text>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.actionsRow}>
          <Pressable
            style={({ pressed }) => [styles.outlineButton, pressed && { opacity: 0.6 }]}
            onPress={handleRemoveFromClass}
          >
            <MaterialIcons name="folder-off" size={18} color={COLORS.primary} />
            <Text style={styles.outlineButtonText}>Quitar de clase</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.dangerButton, pressed && { opacity: 0.6 }]}
            onPress={handleDelete}
          >
            <MaterialIcons name="delete-outline" size={18} color="#B91C1C" />
            <Text style={styles.dangerButtonText}>Eliminar recurso</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

function resolvePreviewTitle(recurso: Recurso): string {
  if (isPlaneacionResource(recurso)) return "Planeacion editable";
  if (recurso.tipo === "video") return "Vista de video";
  if (recurso.tipo === "audio") return "Reproductor de audio";
  if (recurso.tipo === "imagen") return "Vista de imagen";
  if (recurso.tipo === "enlace") return "Enlace externo";
  return "Documento de clase";
}

const MetaCard: React.FC<{
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <View style={styles.metaCard}>
    <MaterialIcons name={icon} size={20} color={COLORS.primary} />
    <Text style={styles.metaLabel}>{label}</Text>
    <Text style={styles.metaValue}>{value}</Text>
  </View>
);

const webScrollStyle =
  Platform.OS === "web"
    ? ({ height: "100vh", maxHeight: "100vh", overflowY: "auto" } as object)
    : null;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  scroller: {
    flex: 1,
    ...webScrollStyle,
  },
  content: {
    alignSelf: "center",
    maxWidth: 1080,
    padding: 18,
    paddingBottom: Platform.OS === "web" ? 160 : 110,
    width: "100%",
  },
  centerBox: {
    alignItems: "center",
    flex: 1,
    gap: 10,
    justifyContent: "center",
    padding: 24,
  },
  header: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE8F5",
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    padding: 16,
  },
  backButton: {
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 16,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  headerCopy: {
    flex: 1,
    minWidth: 220,
  },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    color: "#122033",
    fontSize: 26,
    fontWeight: "900",
    marginTop: 4,
  },
  subtitle: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#EAF2FF",
    borderColor: "#CFE0F7",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  viewerCard: {
    alignItems: "center",
    backgroundColor: "#0F172A",
    borderRadius: 26,
    gap: 12,
    marginTop: 16,
    minHeight: 330,
    padding: 28,
  },
  viewerIcon: {
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    height: 96,
    justifyContent: "center",
    width: 96,
  },
  viewerTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    marginTop: 8,
  },
  viewerText: {
    color: "#CBD5E1",
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 680,
    textAlign: "center",
  },
  openButton: {
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  openButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 16,
  },
  metaCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE8F5",
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    minWidth: 180,
    padding: 15,
  },
  metaLabel: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 8,
    textTransform: "uppercase",
  },
  metaValue: {
    color: "#122033",
    fontSize: 15,
    fontWeight: "900",
    marginTop: 3,
    textTransform: "capitalize",
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE8F5",
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 16,
    padding: 16,
  },
  sectionTitle: {
    color: "#122033",
    fontSize: 17,
    fontWeight: "900",
  },
  sectionDescription: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
  },
  attachmentsList: {
    gap: 10,
    marginTop: 14,
  },
  attachmentRow: {
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    padding: 12,
  },
  attachmentIcon: {
    alignItems: "center",
    backgroundColor: "#EAF2FF",
    borderRadius: 999,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  attachmentCopy: {
    flex: 1,
    minWidth: 0,
  },
  attachmentTitle: {
    color: "#122033",
    fontSize: 14,
    fontWeight: "900",
  },
  attachmentMeta: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 2,
  },
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  tag: {
    backgroundColor: "#EAF2FF",
    borderRadius: 999,
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "900",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16,
  },
  outlineButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#CFE0F7",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  outlineButtonText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "900",
  },
  dangerButton: {
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dangerButtonText: {
    color: "#B91C1C",
    fontSize: 13,
    fontWeight: "900",
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
  emptyTitle: {
    color: "#122033",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },
  emptyText: {
    color: "#64748B",
    fontSize: 14,
    textAlign: "center",
  },
});

export default DetalleRecursoClassroomScreen;
