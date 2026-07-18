import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppRoutesParamList } from "../navigation/StackNavigator";
import { usePlantillas } from "../context/PlantillasContext";
import type { Plantilla } from "../../types";

type TipoPlantilla = Plantilla["tipo"];
type CategoriaPlantilla = Plantilla["categoria"];

const TIPO_TO_CATEGORIA: Record<TipoPlantilla, CategoriaPlantilla> = {
  examen: "examenes",
  presentacion: "diapositivas",
  mapa_mental: "mapas_mentales",
  linea_tiempo: "otros",
  postal: "postales",
  reporte: "reportes",
  otro: "otros",
};

export interface ContenidoPlantilla {
  instrucciones?: string;
  secciones?: string[];
  preguntas?: string[];
  duracion?: string;
  puntosTotales?: string;
}

export function useEditorPlantillaViewModel() {
  const navigation = useNavigation<StackNavigationProp<AppRoutesParamList>>();
  const route = useRoute<RouteProp<AppRoutesParamList, "EditorPlantilla">>();
  const plantillaId = route.params?.plantillaId;
  const isEditMode = plantillaId != null;

  const { crearPlantilla, actualizarPlantilla, obtenerPlantillaPorId } = usePlantillas();

  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState<TipoPlantilla>("examen");
  const [descripcion, setDescripcion] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [contenido, setContenido] = useState<ContenidoPlantilla>({});
  const [isSaving, setIsSaving] = useState(false);
  const [esBorrador, setEsBorrador] = useState(false);

  // Load existing plantilla in edit mode
  useEffect(() => {
    if (!isEditMode) return;
    const p = obtenerPlantillaPorId(plantillaId);
    if (!p) return;
    setNombre(p.nombre);
    setTipo(p.tipo);
    setDescripcion(p.descripcion);
    setTags(p.tags || []);
    try {
      setContenido(JSON.parse(p.contenido) as ContenidoPlantilla);
    } catch {
      setContenido({});
    }
  }, [plantillaId, isEditMode, obtenerPlantillaPorId]);

  const addTag = useCallback(() => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setTagInput("");
  }, [tagInput, tags]);

  const removeTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  const updateContenido = useCallback((key: keyof ContenidoPlantilla, value: string | string[]) => {
    setContenido((prev) => ({ ...prev, [key]: value }));
  }, []);

  const addSeccion = useCallback(() => {
    setContenido((prev) => ({
      ...prev,
      secciones: [...(prev.secciones || []), ""],
    }));
  }, []);

  const updateSeccion = useCallback((index: number, value: string) => {
    setContenido((prev) => {
      const secciones = [...(prev.secciones || [])];
      secciones[index] = value;
      return { ...prev, secciones };
    });
  }, []);

  const removeSeccion = useCallback((index: number) => {
    setContenido((prev) => {
      const secciones = [...(prev.secciones || [])];
      secciones.splice(index, 1);
      return { ...prev, secciones };
    });
  }, []);

  const handleGuardar = useCallback(async () => {
    if (!nombre.trim()) {
      Alert.alert("Campo requerido", "El nombre de la plantilla es obligatorio.");
      return;
    }
    setIsSaving(true);
    try {
      const categoria = TIPO_TO_CATEGORIA[tipo];
      const contenidoJSON = JSON.stringify(contenido);

      if (isEditMode) {
        await actualizarPlantilla(plantillaId, {
          nombre: nombre.trim(),
          tipo,
          categoria,
          descripcion: descripcion.trim(),
          tags,
          contenido: contenidoJSON,
          fechaModificacion: new Date(),
        });
      } else {
        await crearPlantilla({
          nombre: nombre.trim(),
          tipo,
          categoria,
          descripcion: descripcion.trim(),
          contenido: contenidoJSON,
          tags,
          esDelSistema: false,
          usosCount: 0,
          fechaCreacion: new Date(),
          fechaModificacion: new Date(),
        });
      }
      Alert.alert(
        isEditMode ? "Plantilla actualizada" : "Plantilla creada",
        isEditMode
          ? "Los cambios se han guardado correctamente."
          : "La plantilla se ha creado correctamente.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      Alert.alert("Error", "No se pudo guardar la plantilla.");
    } finally {
      setIsSaving(false);
    }
  }, [
    nombre,
    tipo,
    descripcion,
    tags,
    contenido,
    isEditMode,
    plantillaId,
    crearPlantilla,
    actualizarPlantilla,
    navigation,
  ]);

  const handleGuardarBorrador = useCallback(async () => {
    if (!nombre.trim()) {
      Alert.alert("Campo requerido", "El nombre de la plantilla es obligatorio.");
      return;
    }
    setIsSaving(true);
    try {
      const categoria = TIPO_TO_CATEGORIA[tipo];
      const contenidoJSON = JSON.stringify(contenido);

      if (isEditMode) {
        await actualizarPlantilla(plantillaId, {
          nombre: nombre.trim(),
          tipo,
          categoria,
          descripcion: descripcion.trim(),
          tags: [...tags, "__borrador__"],
          contenido: contenidoJSON,
          fechaModificacion: new Date(),
        });
      } else {
        await crearPlantilla({
          nombre: nombre.trim(),
          tipo,
          categoria,
          descripcion: descripcion.trim(),
          contenido: contenidoJSON,
          tags: [...tags, "__borrador__"],
          esDelSistema: false,
          usosCount: 0,
          fechaCreacion: new Date(),
          fechaModificacion: new Date(),
        });
      }
      Alert.alert("Borrador guardado", "Puedes continuar editando después.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert("Error", "No se pudo guardar el borrador.");
    } finally {
      setIsSaving(false);
    }
  }, [
    nombre,
    tipo,
    descripcion,
    tags,
    contenido,
    isEditMode,
    plantillaId,
    crearPlantilla,
    actualizarPlantilla,
    navigation,
  ]);

  return {
    // State
    nombre,
    setNombre,
    tipo,
    setTipo,
    descripcion,
    setDescripcion,
    tags,
    tagInput,
    setTagInput,
    addTag,
    removeTag,
    contenido,
    updateContenido,
    addSeccion,
    updateSeccion,
    removeSeccion,
    isSaving,
    isEditMode,
    esBorrador,
    setEsBorrador,
    // Actions
    handleGuardar,
    handleGuardarBorrador,
  };
}
