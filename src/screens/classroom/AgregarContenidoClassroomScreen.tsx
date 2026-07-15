import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { RouteProp } from "@react-navigation/native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../../types";
import type { Recurso, Tarea } from "../../../types";
import { useEntregables } from "../../context/EntregablesContext";
import { useRecursos } from "../../context/RecursosContext";
import type { RootStackParamList } from "../../navigation/StackNavigator";

type Navigation = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "AgregarContenidoClassroom">;
type AssignmentKind = "material" | "actividad";

interface UploadedFile {
  mimeType?: string;
  name: string;
  size?: number;
  uri: string;
}

interface ClassroomAttachment {
  label: string;
  type: "archivo" | "enlace";
  uri: string;
}

const ATTACHMENTS_TAG_PREFIX = "classroom-attachments:";
const NOTES_MARKER = "\n\nNotas docentes: ";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "audio/*",
  "video/*",
  "image/*",
];

const inferRecursoTipo = (file?: UploadedFile, link?: string): Recurso["tipo"] => {
  if (link?.trim()) return "enlace";
  const mime = file?.mimeType ?? "";
  const ext = file?.name.split(".").pop()?.toLowerCase();
  if (mime.startsWith("video/") || ["mp4", "mov", "avi", "mkv"].includes(ext ?? "")) return "video";
  if (mime.startsWith("audio/") || ["mp3", "wav", "m4a", "ogg"].includes(ext ?? "")) return "audio";
  if (mime.startsWith("image/") || ["png", "jpg", "jpeg", "gif", "webp"].includes(ext ?? ""))
    return "imagen";
  if (mime.includes("presentation") || ["ppt", "pptx"].includes(ext ?? "")) return "presentacion";
  return "documento";
};

const buildAttachments = (files: UploadedFile[], links: string[]): ClassroomAttachment[] => [
  ...files.map((file) => ({
    label: file.name,
    type: "archivo" as const,
    uri: file.uri,
  })),
  ...links.map((url, index) => ({
    label: `Enlace ${index + 1}`,
    type: "enlace" as const,
    uri: url,
  })),
];

const encodeAttachmentsTag = (attachments: ClassroomAttachment[]): string =>
  `${ATTACHMENTS_TAG_PREFIX}${encodeURIComponent(JSON.stringify(attachments))}`;

const parseAttachmentsFromTags = (recurso: Recurso): ClassroomAttachment[] => {
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
    const parsed = JSON.parse(
      decodeURIComponent(tag.replace(ATTACHMENTS_TAG_PREFIX, ""))
    ) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isClassroomAttachment);
  } catch {
    return [];
  }
};

const parseTaskAttachments = (items?: string[]): ClassroomAttachment[] =>
  (items ?? []).map((item, index) => {
    const clean = item.replace(/^(archivo|enlace):\s*/i, "").trim();
    const isLink = /^https?:\/\//i.test(clean);
    return {
      label: clean || `Adjunto ${index + 1}`,
      type: isLink ? "enlace" : "archivo",
      uri: clean || item,
    };
  });

const isClassroomAttachment = (value: unknown): value is ClassroomAttachment => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ClassroomAttachment>;
  return (
    typeof candidate.label === "string" &&
    typeof candidate.uri === "string" &&
    (candidate.type === "archivo" || candidate.type === "enlace")
  );
};

const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const formatDateInput = (value?: Date | string): string => {
  const date = value ? new Date(value) : new Date();
  if (!Number.isFinite(date.getTime())) return "";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const parseDateInput = (value: string): Date | null => {
  const [dd, mm, yyyy] = value.split("/");
  if (!dd || !mm || !yyyy) return null;
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  return Number.isFinite(date.getTime()) ? date : null;
};

const buildInstructions = (description: string, notes: string): string => {
  const base = description || "Actividad asignada desde Classroom.";
  return notes.trim() ? `${base}${NOTES_MARKER}${notes.trim()}` : base;
};

const extractNotasFromInstructions = (instructions?: string): string => {
  if (!instructions?.includes(NOTES_MARKER)) return "";
  return instructions.split(NOTES_MARKER).slice(1).join(NOTES_MARKER).trim();
};

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return "Tamano no disponible";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const AgregarContenidoClassroomScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const {
    grupoId,
    kind: initialKind,
    modo = "crear",
    recursoId,
    tareaId,
    unidadId,
    unidadNombre,
  } = route.params;
  const { actualizarEntregable, crearEntregable, obtenerEntregablePorId } = useEntregables();
  const { actualizarRecurso, crearRecurso, obtenerRecursoPorId } = useRecursos();
  const [kind, setKind] = useState<AssignmentKind>(initialKind ?? "material");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [puntos, setPuntos] = useState("100");
  const [fechaAsignacion, setFechaAsignacion] = useState(formatDateInput(new Date()));
  const [fechaEntrega, setFechaEntrega] = useState(formatDateInput(addDays(new Date(), 7)));
  const [permitirEntregaTardia, setPermitirEntregaTardia] = useState(false);
  const [fechaLimiteEntregaTardia, setFechaLimiteEntregaTardia] = useState(
    formatDateInput(addDays(new Date(), 10))
  );
  const [notas, setNotas] = useState("");
  const [linkDraft, setLinkDraft] = useState("");
  const [links, setLinks] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const sectionLabel = unidadNombre || "Seccion seleccionada";
  const isEditMode = modo === "editar";

  React.useEffect(() => {
    if (!isEditMode) return;

    if (tareaId) {
      const tarea = obtenerEntregablePorId(tareaId);
      if (!tarea) return;
      setKind("actividad");
      setTitulo(tarea.titulo);
      setDescripcion(tarea.descripcion || tarea.instrucciones || "");
      setPuntos(String(tarea.calificacionMaxima ?? tarea.valor ?? 100));
      setFechaAsignacion(formatDateInput(tarea.fechaAsignacion));
      setFechaEntrega(formatDateInput(tarea.fechaEntrega));
      setPermitirEntregaTardia(tarea.permitirEntregaTardia ?? false);
      setFechaLimiteEntregaTardia(
        formatDateInput(tarea.fechaLimiteEntregaTardia ?? addDays(new Date(tarea.fechaEntrega), 3))
      );
      setNotas(extractNotasFromInstructions(tarea.instrucciones));
      const attachments = parseTaskAttachments(tarea.recursosNecesarios);
      setLinks(
        attachments.reduce<string[]>((acc, attachment) => {
          if (attachment.type === "enlace") acc.push(attachment.uri);
          return acc;
        }, [])
      );
      setUploadedFiles(
        attachments.reduce<{ name: string; uri: string }[]>((acc, attachment) => {
          if (attachment.type === "archivo") acc.push({ name: attachment.label, uri: attachment.uri });
          return acc;
        }, [])
      );
      return;
    }

    if (recursoId) {
      const recurso = obtenerRecursoPorId(recursoId);
      if (!recurso) return;
      setKind("material");
      setTitulo(recurso.titulo);
      setDescripcion(recurso.descripcion || "");
      const attachments = parseAttachmentsFromTags(recurso);
      setUploadedFiles(
        attachments.reduce<{ name: string; uri: string }[]>((acc, attachment) => {
          if (attachment.type === "archivo") acc.push({ name: attachment.label, uri: attachment.uri });
          return acc;
        }, [])
      );
      setLinks(
        attachments.reduce<string[]>((acc, attachment) => {
          if (attachment.type === "enlace") acc.push(attachment.uri);
          return acc;
        }, [])
      );
    }
  }, [isEditMode, obtenerEntregablePorId, obtenerRecursoPorId, recursoId, tareaId]);

  const showMessage = React.useCallback((title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n\n${message}`);
      return;
    }
    Alert.alert(title, message);
  }, []);

  const handleSelectFile = React.useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: true,
      type: ALLOWED_TYPES,
    });

    if (result.canceled || !result.assets?.length) return;

    const nextFiles = result.assets.map((asset) => ({
      mimeType: asset.mimeType ?? undefined,
      name: asset.name,
      size: asset.size ?? undefined,
      uri: asset.uri,
    }));
    setUploadedFiles((prev) => [...prev, ...nextFiles]);

    if (!titulo.trim()) {
      setTitulo(nextFiles[0].name.replace(/\.[^.]+$/, ""));
    }
  }, [titulo]);

  const handleAddLink = React.useCallback(() => {
    const cleanLink = linkDraft.trim();
    if (!cleanLink) return;
    if (!/^https?:\/\//i.test(cleanLink)) {
      showMessage("Enlace invalido", "Usa un enlace que empiece con http:// o https://.");
      return;
    }
    setLinks((prev) => (prev.includes(cleanLink) ? prev : [...prev, cleanLink]));
    setLinkDraft("");
  }, [linkDraft, showMessage]);

  const handleSave = React.useCallback(async () => {
    const cleanTitle = titulo.trim();
    const cleanDescription = descripcion.trim();
    const cleanLinkDraft = linkDraft.trim();
    const nextLinks = cleanLinkDraft ? [...links, cleanLinkDraft] : links;
    const attachments = buildAttachments(uploadedFiles, nextLinks);
    const hasAttachment = attachments.length > 0;

    if (!cleanTitle) {
      showMessage("Titulo requerido", "Ponle un nombre al contenido antes de asignarlo.");
      return;
    }

    if (!hasAttachment) {
      showMessage("Adjunto requerido", "Sube un archivo o pega un enlace antes de asignarlo.");
      return;
    }

    if (cleanLinkDraft && !/^https?:\/\//i.test(cleanLinkDraft)) {
      showMessage("Enlace invalido", "Usa un enlace que empiece con http:// o https://.");
      return;
    }

    const score = Number(puntos.replace(",", "."));
    if (kind === "actividad" && (!Number.isFinite(score) || score < 0 || score > 100)) {
      showMessage("Ponderacion invalida", "Usa una ponderacion entre 0 y 100 puntos.");
      return;
    }
    const parsedAsignacion = parseDateInput(fechaAsignacion);
    const parsedEntrega = parseDateInput(fechaEntrega);
    const parsedLimiteTardia = parseDateInput(fechaLimiteEntregaTardia);
    if (kind === "actividad" && (!parsedAsignacion || !parsedEntrega)) {
      showMessage(
        "Fechas invalidas",
        "Usa fechas con formato dd/mm/aaaa para asignacion y entrega."
      );
      return;
    }
    if (kind === "actividad" && permitirEntregaTardia && !parsedLimiteTardia) {
      showMessage("Fecha limite invalida", "Usa una fecha limite tardia con formato dd/mm/aaaa.");
      return;
    }

    try {
      setIsSaving(true);
      const now = new Date();
      const firstFile = uploadedFiles[0];
      const firstLink = nextLinks[0];

      if (kind === "actividad") {
        const instrucciones = buildInstructions(cleanDescription, notas);
        const actividad: Omit<Tarea, "id"> = {
          titulo: cleanTitle,
          descripcion: cleanDescription,
          tipo: "tarea",
          grupoId,
          unidadId,
          fechaAsignacion: parsedAsignacion ?? now,
          fechaEntrega: parsedEntrega ?? addDays(now, 7),
          valor: score,
          instrucciones,
          recursosNecesarios: attachments.map(
            (attachment) => `${attachment.type}: ${attachment.label}`
          ),
          estado: "asignada",
          calificacionMaxima: score,
          profesorId: 1,
          permitirEntregaTardia,
          fechaLimiteEntregaTardia: permitirEntregaTardia
            ? (parsedLimiteTardia ?? undefined)
            : undefined,
        };
        if (isEditMode && tareaId) {
          await actualizarEntregable(tareaId, actividad);
        } else {
          await crearEntregable(actividad);
        }
      } else {
        const tipo = inferRecursoTipo(firstFile, firstLink);
        const recurso: Omit<Recurso, "id"> = {
          titulo: cleanTitle,
          descripcion: cleanDescription,
          tipo,
          archivo: firstFile?.name,
          url: firstFile?.uri || firstLink || undefined,
          grupoId,
          unidadId,
          asignadoComoTarea: false,
          tags: ["classroom", tipo, encodeAttachmentsTag(attachments)],
          fechaCreacion: now,
          fechaModificacion: now,
          tamaño: uploadedFiles.reduce((total, file) => total + (file.size ?? 0), 0) || undefined,
          formato: firstFile?.name.split(".").pop()?.toLowerCase(),
          acceso: "privado",
          origen: "manual",
          profesorId: 1,
          versionActual: 1,
        };
        if (isEditMode && recursoId) {
          await actualizarRecurso(recursoId, recurso);
        } else {
          await crearRecurso(recurso);
        }
      }

      showMessage(
        isEditMode ? "Contenido actualizado" : "Contenido asignado",
        `"${cleanTitle}" ya aparece en ${sectionLabel}.`
      );
      navigation.navigate("ClassroomGroup", { grupoId });
    } finally {
      setIsSaving(false);
    }
  }, [
    actualizarEntregable,
    actualizarRecurso,
    crearEntregable,
    crearRecurso,
    descripcion,
    fechaAsignacion,
    fechaEntrega,
    fechaLimiteEntregaTardia,
    grupoId,
    isEditMode,
    kind,
    linkDraft,
    links,
    navigation,
    notas,
    permitirEntregaTardia,
    puntos,
    recursoId,
    sectionLabel,
    showMessage,
    tareaId,
    titulo,
    unidadId,
    uploadedFiles,
  ]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroller}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
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
            <Text style={styles.eyebrow}>
              {isEditMode ? "Editar en Classroom" : "Asignar a Classroom"}
            </Text>
            <Text style={styles.title}>{sectionLabel}</Text>
            <Text style={styles.subtitle}>
              Sube un archivo o comparte un enlace. Canva/Genially se conectara despues.
            </Text>
          </View>
        </View>

        <View style={styles.kindTabs}>
          <KindButton
            active={kind === "material"}
            disabled={isEditMode}
            icon="menu-book"
            label="Material"
            onPress={() => setKind("material")}
          />
          <KindButton
            active={kind === "actividad"}
            disabled={isEditMode}
            icon="assignment"
            label="Actividad evaluable"
            onPress={() => setKind("actividad")}
          />
        </View>

        <View style={styles.formCard}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Lectura introductoria"
            placeholderTextColor="#94A3B8"
            value={titulo}
            onChangeText={setTitulo}
          />

          <Text style={styles.label}>Descripcion</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            placeholder="Indicaciones breves para tus alumnos"
            placeholderTextColor="#94A3B8"
            textAlignVertical="top"
            value={descripcion}
            onChangeText={setDescripcion}
          />

          {kind === "actividad" ? (
            <>
              <Text style={styles.label}>Ponderacion</Text>
              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                placeholder="0-100"
                placeholderTextColor="#94A3B8"
                value={puntos}
                onChangeText={setPuntos}
              />
              <View style={styles.datesGrid}>
                <View style={styles.dateField}>
                  <Text style={styles.label}>Fecha de asignacion</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="dd/mm/aaaa"
                    placeholderTextColor="#94A3B8"
                    value={fechaAsignacion}
                    onChangeText={setFechaAsignacion}
                  />
                </View>
                <View style={styles.dateField}>
                  <Text style={styles.label}>Fecha de entrega</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="dd/mm/aaaa"
                    placeholderTextColor="#94A3B8"
                    value={fechaEntrega}
                    onChangeText={setFechaEntrega}
                  />
                </View>
              </View>
              <View style={styles.toggleRow}>
                <View style={styles.toggleCopy}>
                  <Text style={styles.toggleTitle}>Permitir entrega tardia</Text>
                  <Text style={styles.toggleText}>
                    Si se activa, los envios posteriores quedan marcados para revision.
                  </Text>
                </View>
                <Switch value={permitirEntregaTardia} onValueChange={setPermitirEntregaTardia} />
              </View>
              {permitirEntregaTardia ? (
                <>
                  <Text style={styles.label}>Fecha limite tardia</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="dd/mm/aaaa"
                    placeholderTextColor="#94A3B8"
                    value={fechaLimiteEntregaTardia}
                    onChangeText={setFechaLimiteEntregaTardia}
                  />
                </>
              ) : null}
              <Text style={styles.label}>Notas adicionales</Text>
              <TextInput
                style={styles.input}
                placeholder="Recordatorios internos para el docente"
                placeholderTextColor="#94A3B8"
                value={notas}
                onChangeText={setNotas}
              />
            </>
          ) : null}
        </View>

        <View style={styles.actionGrid}>
          <Pressable
            style={({ pressed }) => [styles.actionCard, pressed && { opacity: 0.6 }]}
            onPress={() => void handleSelectFile()}
          >
            <View style={styles.actionIcon}>
              <MaterialIcons name="upload-file" size={26} color="#FFFFFF" />
            </View>
            <Text style={styles.actionTitle}>Importar desde dispositivo</Text>
            <Text style={styles.actionDescription}>
              PDF, imagen, audio, video, documento o presentacion.
            </Text>
          </Pressable>

          <View style={[styles.actionCard, styles.disabledCard]}>
            <View style={[styles.actionIcon, styles.disabledIcon]}>
              <MaterialIcons name="palette" size={26} color="#64748B" />
            </View>
            <Text style={styles.actionTitle}>Importar desde Canva/Genially</Text>
            <Text style={styles.actionDescription}>
              Proximamente: asignar varios recursos creados en el modulo visual.
            </Text>
          </View>
        </View>

        {uploadedFiles.length ? (
          <View style={styles.attachmentsStack}>
            {uploadedFiles.map((file) => (
              <View key={file.uri} style={styles.attachmentCard}>
                <MaterialIcons name="insert-drive-file" size={22} color={COLORS.primary} />
                <View style={styles.attachmentCopy}>
                  <Text style={styles.attachmentTitle}>{file.name}</Text>
                  <Text style={styles.attachmentMeta}>{formatFileSize(file.size)}</Text>
                </View>
                <Pressable
                  style={({ pressed }) => pressed && { opacity: 0.6 }}
                  onPress={() =>
                    setUploadedFiles((prev) => prev.filter((f) => f.uri !== file.uri))
                  }
                >
                  <MaterialIcons name="close" size={20} color="#64748B" />
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.formCard}>
          <Text style={styles.label}>Enlace</Text>
          <View style={styles.linkRow}>
            <TextInput
              autoCapitalize="none"
              keyboardType="url"
              style={[styles.input, styles.linkInput]}
              placeholder="https://..."
              placeholderTextColor="#94A3B8"
              value={linkDraft}
              onChangeText={setLinkDraft}
            />
            <Pressable
              style={({ pressed }) => [styles.addLinkButton, pressed && { opacity: 0.6 }]}
              onPress={handleAddLink}
            >
              <MaterialIcons name="add-link" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
          {links.length ? (
            <View style={styles.linkList}>
              {links.map((item, index) => (
                <View key={item} style={styles.linkPill}>
                  <MaterialIcons name="link" size={16} color={COLORS.primary} />
                  <Text style={styles.linkText} numberOfLines={1}>
                    {item}
                  </Text>
                  <Pressable
                    style={({ pressed }) => pressed && { opacity: 0.6 }}
                    onPress={() =>
                      setLinks((prev) => prev.filter((_, itemIndex) => itemIndex !== index))
                    }
                  >
                    <MaterialIcons name="close" size={16} color="#64748B" />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}
          <Text style={styles.helperText}>
            Puedes agregar varios enlaces y combinarlos con archivos.
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            isSaving ? styles.buttonDisabled : null,
            pressed && { opacity: 0.6 },
          ]}
          onPress={() => void handleSave()}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <MaterialIcons name="check" size={20} color="#FFFFFF" />
          )}
          <Text style={styles.saveButtonText}>
            {isSaving ? "Guardando..." : isEditMode ? "Guardar cambios" : "Asignar a la seccion"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const KindButton: React.FC<{
  active: boolean;
  disabled?: boolean;
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
}> = ({ active, disabled = false, icon, label, onPress }) => (
  <Pressable
    style={({ pressed }) => [
      styles.kindButton,
      active ? styles.kindButtonActive : null,
      disabled ? styles.kindButtonDisabled : null,
      pressed && { opacity: 0.6 },
    ]}
    onPress={onPress}
    disabled={disabled}
  >
    <MaterialIcons name={icon} size={18} color={active ? COLORS.primary : "#64748B"} />
    <Text style={[styles.kindButtonText, active ? styles.kindButtonTextActive : null]}>
      {label}
    </Text>
  </Pressable>
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
    maxWidth: 920,
    padding: 18,
    paddingBottom: Platform.OS === "web" ? 160 : 110,
    width: "100%",
  },
  header: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE8F5",
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
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
    fontSize: 25,
    fontWeight: "900",
    marginTop: 4,
  },
  subtitle: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
  },
  kindTabs: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE8F5",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
    padding: 8,
  },
  kindButton: {
    alignItems: "center",
    borderRadius: 14,
    flexDirection: "row",
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  kindButtonActive: {
    backgroundColor: "#EAF2FF",
  },
  kindButtonDisabled: {
    opacity: 0.72,
  },
  kindButtonText: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "900",
  },
  kindButtonTextActive: {
    color: COLORS.primary,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE8F5",
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 14,
    padding: 16,
  },
  label: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 8,
    marginTop: 10,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderColor: "#CBD5E1",
    borderRadius: 12,
    borderWidth: 1,
    color: "#122033",
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  textArea: {
    minHeight: 92,
  },
  datesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  dateField: {
    flex: 1,
    minWidth: 180,
  },
  toggleRow: {
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
    padding: 12,
  },
  toggleCopy: {
    flex: 1,
  },
  toggleTitle: {
    color: "#122033",
    fontSize: 14,
    fontWeight: "900",
  },
  toggleText: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 2,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 14,
  },
  actionCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE8F5",
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    minWidth: 240,
    padding: 18,
  },
  disabledCard: {
    opacity: 0.68,
  },
  actionIcon: {
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  disabledIcon: {
    backgroundColor: "#E2E8F0",
  },
  actionTitle: {
    color: "#122033",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 13,
  },
  actionDescription: {
    color: "#64748B",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },
  attachmentCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE8F5",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    padding: 14,
  },
  attachmentsStack: {
    gap: 10,
    marginTop: 14,
  },
  attachmentCopy: {
    flex: 1,
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
  helperText: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 8,
  },
  linkRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  linkInput: {
    flex: 1,
  },
  addLinkButton: {
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  linkList: {
    gap: 8,
    marginTop: 10,
  },
  linkPill: {
    alignItems: "center",
    backgroundColor: "#EAF2FF",
    borderRadius: 999,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  linkText: {
    color: COLORS.primary,
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
  },
  saveButton: {
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 16,
    paddingVertical: 14,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  buttonDisabled: {
    opacity: 0.65,
  },
});

export default AgregarContenidoClassroomScreen;
