import { useState, useCallback, useEffect } from "react";
import { Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import type { Recurso } from "../../types";
import { useRecursos } from "../context/RecursosContext";

type RecursoTipo = Recurso["tipo"];
type RecursoOrigen = Recurso["origen"];

interface UploadedFile {
  name: string;
  size: string;
  uri: string;
  mimeType?: string;
  sizeBytes?: number;
}

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "audio/*",
  "video/*",
  "image/*",
];

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const inferTipoFromMime = (mimeType?: string, fileName?: string): RecursoTipo | null => {
  if (mimeType) {
    if (mimeType.startsWith("audio/")) return "audio";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("image/")) return "imagen";
    if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return "presentacion";
  }
  if (fileName) {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (ext === "pptx" || ext === "ppt") return "presentacion";
    if (ext === "mp3" || ext === "wav" || ext === "m4a" || ext === "ogg") return "audio";
    if (ext === "mp4" || ext === "mov" || ext === "avi" || ext === "mkv") return "video";
    if (ext === "png" || ext === "jpg" || ext === "jpeg" || ext === "gif" || ext === "webp")
      return "imagen";
  }
  return "documento";
};

export interface CrearRecursoViewModel {
  titulo: string;
  setTitulo: (v: string) => void;
  descripcion: string;
  setDescripcion: (v: string) => void;
  tipo: RecursoTipo;
  setTipo: (v: RecursoTipo) => void;
  origen: RecursoOrigen;
  setOrigen: (v: RecursoOrigen) => void;
  tags: string[];
  addTag: (tag: string) => void;
  removeTag: (index: number) => void;
  uploadedFile: UploadedFile | null;
  setUploadedFile: (f: UploadedFile | null) => void;
  handleSelectFile: () => Promise<void>;
  isSaving: boolean;
  isEditMode: boolean;
  handleGuardar: () => Promise<void>;
  handleEliminar: () => void;
  tipoOptions: { key: RecursoTipo; label: string; icon: string }[];
}

const TIPO_OPTIONS: { key: RecursoTipo; label: string; icon: string }[] = [
  { key: "documento", label: "Documento", icon: "description" },
  { key: "examen", label: "Examen", icon: "quiz" },
  { key: "presentacion", label: "Presentación", icon: "slideshow" },
  { key: "mapa_mental", label: "Mapa Mental", icon: "account-tree" },
  { key: "linea_tiempo", label: "Línea de Tiempo", icon: "timeline" },
  { key: "audio", label: "Audio", icon: "audiotrack" },
  { key: "video", label: "Video", icon: "videocam" },
];

export const useCrearRecursoViewModel = (recursoId?: number): CrearRecursoViewModel => {
  const { crearRecurso, actualizarRecurso, eliminarRecurso, obtenerRecursoPorId } = useRecursos();

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState<RecursoTipo>("documento");
  const [origen, setOrigen] = useState<RecursoOrigen>("manual");
  const [tags, setTags] = useState<string[]>([]);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const isEditMode = recursoId != null;

  useEffect(() => {
    if (recursoId == null) return;
    const existing = obtenerRecursoPorId(recursoId);
    if (!existing) return;
    setTitulo(existing.titulo);
    setDescripcion(existing.descripcion);
    setTipo(existing.tipo);
    setOrigen(existing.origen);
    setTags(existing.tags ?? []);
    if (existing.archivo) {
      setUploadedFile({
        name: existing.archivo,
        size: existing.tamaño ? `${(existing.tamaño / (1024 * 1024)).toFixed(1)} MB` : "",
        uri: existing.url ?? "",
      });
    }
  }, [recursoId, obtenerRecursoPorId]);

  const addTag = useCallback(
    (tag: string) => {
      const trimmed = tag.trim();
      if (trimmed && !tags.includes(trimmed)) {
        setTags((prev) => [...prev, trimmed]);
      }
    },
    [tags]
  );

  const removeTag = useCallback((index: number) => {
    setTags((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSelectFile = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ALLOWED_TYPES,
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

      // Get file info for size if not available from picker
      let sizeBytes = asset.size ?? 0;
      if (!sizeBytes && asset.uri) {
        const info = await FileSystem.getInfoAsync(asset.uri);
        if (info.exists && "size" in info) {
          sizeBytes = info.size;
        }
      }

      if (sizeBytes > MAX_SIZE) {
        Alert.alert(
          "Archivo demasiado grande",
          `El archivo seleccionado (${formatFileSize(sizeBytes)}) excede el límite de 10 MB.`
        );
        return;
      }

      setUploadedFile({
        name: asset.name,
        size: formatFileSize(sizeBytes),
        uri: asset.uri,
        mimeType: asset.mimeType ?? undefined,
        sizeBytes,
      });

      // Auto-detect tipo from file type
      const inferredTipo = inferTipoFromMime(asset.mimeType ?? undefined, asset.name);
      if (inferredTipo && tipo === "documento") {
        setTipo(inferredTipo);
      }

      // Auto-fill titulo if empty
      if (!titulo.trim()) {
        const nameWithoutExt = asset.name.replace(/\.[^.]+$/, "");
        setTitulo(nameWithoutExt);
      }
    } catch {
      Alert.alert("Error", "No se pudo seleccionar el archivo");
    }
  }, [tipo, titulo]);

  const handleGuardar = useCallback(async () => {
    if (!titulo.trim()) {
      Alert.alert("Error", "El título del recurso es obligatorio");
      return;
    }

    setIsSaving(true);
    try {
      const now = new Date();
      const ext = uploadedFile?.name?.split(".").pop()?.toLowerCase();
      const recursoData: Omit<Recurso, "id"> = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        tipo,
        origen,
        tags,
        archivo: uploadedFile?.name,
        url: uploadedFile?.uri,
        acceso: "privado",
        asignadoComoTarea: false,
        profesorId: 1,
        versionActual: 1,
        tamaño: uploadedFile?.sizeBytes,
        formato: ext,
        fechaCreacion: now,
        fechaModificacion: now,
      };

      if (isEditMode) {
        await actualizarRecurso(recursoId!, {
          ...recursoData,
          fechaModificacion: now,
        });
        Alert.alert("Listo", "Recurso actualizado correctamente");
      } else {
        await crearRecurso(recursoData);
        Alert.alert("Listo", "Recurso guardado correctamente");
      }
    } catch {
      Alert.alert("Error", "No se pudo guardar el recurso");
    } finally {
      setIsSaving(false);
    }
  }, [
    titulo,
    descripcion,
    tipo,
    origen,
    tags,
    uploadedFile,
    isEditMode,
    recursoId,
    crearRecurso,
    actualizarRecurso,
  ]);

  const handleEliminar = useCallback(() => {
    if (recursoId == null) return;
    Alert.alert("Eliminar recurso", "¿Estás seguro de que deseas eliminar este recurso?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          await eliminarRecurso(recursoId);
        },
      },
    ]);
  }, [recursoId, eliminarRecurso]);

  return {
    titulo,
    setTitulo,
    descripcion,
    setDescripcion,
    tipo,
    setTipo,
    origen,
    setOrigen,
    tags,
    addTag,
    removeTag,
    uploadedFile,
    setUploadedFile,
    handleSelectFile,
    isSaving,
    isEditMode,
    handleGuardar,
    handleEliminar,
    tipoOptions: TIPO_OPTIONS,
  };
};





