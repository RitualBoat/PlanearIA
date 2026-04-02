import { useState, useCallback, useEffect } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../navigation/StackNavigator";
import { useEntregables } from "../context/EntregablesContext";
import { useGruposContext } from "../context/GruposContext";
import type { Tarea } from "../../types";
import logger from "../utils/logger";

type Nav = StackNavigationProp<RootStackParamList, "CrearTareaGrupo">;

type TipoTarea = "tarea" | "examen" | "proyecto" | "investigacion";

export interface TipoOption {
  value: TipoTarea;
  label: string;
}

export interface CrearTareaGrupoViewModel {
  grupoId: number;
  grupoNombre: string;
  isEditMode: boolean;
  titulo: string;
  descripcion: string;
  tipo: TipoTarea;
  valor: string;
  fechaAsignacion: string;
  fechaEntrega: string;
  permitirEntregaTardia: boolean;
  fechaLimiteEntregaTardia: string;
  notas: string;
  isSaving: boolean;
  tipoOptions: TipoOption[];
  showFechaAsignacionPicker: boolean;
  showFechaEntregaPicker: boolean;
  showFechaLimitePicker: boolean;
  setTitulo: (value: string) => void;
  setDescripcion: (value: string) => void;
  setTipo: (value: TipoTarea) => void;
  setValor: (value: string) => void;
  setFechaAsignacion: (value: string) => void;
  setFechaEntrega: (value: string) => void;
  setPermitirEntregaTardia: (value: boolean) => void;
  setFechaLimiteEntregaTardia: (value: string) => void;
  setNotas: (value: string) => void;
  setShowFechaAsignacionPicker: (v: boolean) => void;
  setShowFechaEntregaPicker: (v: boolean) => void;
  setShowFechaLimitePicker: (v: boolean) => void;
  onFechaAsignacionChange: (event: unknown, date?: Date) => void;
  onFechaEntregaChange: (event: unknown, date?: Date) => void;
  onFechaLimiteChange: (event: unknown, date?: Date) => void;
  handleGuardar: () => void;
  handleCancelar: () => void;
  handleEliminar: () => void;
}

const formatDate = (date: Date): string => {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const parseDate = (str: string): Date | null => {
  if (!str) return null;
  const parts = str.split("/");
  if (parts.length !== 3) return null;
  const [dd, mm, yyyy] = parts;
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  return isNaN(d.getTime()) ? null : d;
};

export const useCrearTareaGrupoViewModel = (
  grupoId: number,
  entregableId?: number
): CrearTareaGrupoViewModel => {
  const navigation = useNavigation<Nav>();
  const { crearEntregable, actualizarEntregable, eliminarEntregable, obtenerEntregablePorId } =
    useEntregables();
  const { obtenerGrupo } = useGruposContext();

  const isEditMode = entregableId != null;
  const grupo = obtenerGrupo(grupoId);
  const grupoNombre = grupo ? `${grupo.nombre ?? ""} - ${grupo.materia ?? ""}` : `Grupo ${grupoId}`;

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState<TipoTarea>("tarea");
  const [valor, setValor] = useState("100");
  const [fechaAsignacion, setFechaAsignacion] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [permitirEntregaTardia, setPermitirEntregaTardia] = useState(false);
  const [fechaLimiteEntregaTardia, setFechaLimiteEntregaTardia] = useState("");
  const [notas, setNotas] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [showFechaAsignacionPicker, setShowFechaAsignacionPicker] = useState(false);
  const [showFechaEntregaPicker, setShowFechaEntregaPicker] = useState(false);
  const [showFechaLimitePicker, setShowFechaLimitePicker] = useState(false);

  const tipoOptions: TipoOption[] = [
    { value: "tarea", label: "Tarea" },
    { value: "examen", label: "Examen" },
    { value: "proyecto", label: "Proyecto" },
  ];

  // Load existing data in edit mode
  useEffect(() => {
    if (!isEditMode || !entregableId) return;
    const existing = obtenerEntregablePorId(entregableId);
    if (!existing) return;

    setTitulo(existing.titulo);
    setDescripcion(existing.descripcion ?? existing.instrucciones ?? "");
    setTipo(existing.tipo);
    setValor(String(existing.valor));
    if (existing.fechaAsignacion) {
      setFechaAsignacion(formatDate(new Date(existing.fechaAsignacion)));
    }
    if (existing.fechaEntrega) {
      setFechaEntrega(formatDate(new Date(existing.fechaEntrega)));
    }
    setPermitirEntregaTardia(existing.permitirEntregaTardia ?? false);
    if (existing.fechaLimiteEntregaTardia) {
      setFechaLimiteEntregaTardia(formatDate(new Date(existing.fechaLimiteEntregaTardia)));
    }
    if (existing.recursosNecesarios?.length) {
      setNotas(existing.recursosNecesarios[0]);
    }
  }, [isEditMode, entregableId, obtenerEntregablePorId]);

  const onFechaAsignacionChange = useCallback((_event: unknown, date?: Date) => {
    setShowFechaAsignacionPicker(false);
    if (date) setFechaAsignacion(formatDate(date));
  }, []);

  const onFechaEntregaChange = useCallback((_event: unknown, date?: Date) => {
    setShowFechaEntregaPicker(false);
    if (date) setFechaEntrega(formatDate(date));
  }, []);

  const onFechaLimiteChange = useCallback((_event: unknown, date?: Date) => {
    setShowFechaLimitePicker(false);
    if (date) setFechaLimiteEntregaTardia(formatDate(date));
  }, []);

  const handleGuardar = useCallback(async () => {
    if (!titulo.trim()) {
      Alert.alert("Campo requerido", "El título es obligatorio.");
      return;
    }
    if (!valor.trim() || isNaN(Number(valor))) {
      Alert.alert("Campo requerido", "Ingresa un valor numérico válido.");
      return;
    }

    setIsSaving(true);
    try {
      const now = new Date();
      const entregableData: Omit<Tarea, "id"> = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        tipo,
        grupoId,
        fechaAsignacion: parseDate(fechaAsignacion) ?? now,
        fechaEntrega: parseDate(fechaEntrega) ?? now,
        valor: Number(valor),
        instrucciones: descripcion.trim(),
        estado: "asignada",
        calificacionMaxima: Number(valor),
        profesorId: 1,
        permitirEntregaTardia,
        fechaLimiteEntregaTardia: permitirEntregaTardia
          ? (parseDate(fechaLimiteEntregaTardia) ?? undefined)
          : undefined,
        recursosNecesarios: notas.trim() ? [notas.trim()] : undefined,
      };

      let syncOk: boolean;
      if (isEditMode && entregableId) {
        const result = await actualizarEntregable(entregableId, entregableData);
        syncOk = result.syncOk;
        logger.log("[entregables] Updated:", { entregableId, syncOk });
      } else {
        const result = await crearEntregable(entregableData);
        syncOk = result.syncOk;
        logger.log("[entregables] Created:", { syncOk });
      }

      if (!syncOk) {
        Alert.alert(
          "Guardado local",
          "El entregable se guardó localmente. Se sincronizará cuando haya conexión."
        );
      }
      navigation.goBack();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudo guardar el entregable";
      Alert.alert("Error", msg);
    } finally {
      setIsSaving(false);
    }
  }, [
    titulo,
    descripcion,
    tipo,
    grupoId,
    valor,
    fechaAsignacion,
    fechaEntrega,
    permitirEntregaTardia,
    fechaLimiteEntregaTardia,
    notas,
    crearEntregable,
    actualizarEntregable,
    isEditMode,
    entregableId,
    navigation,
  ]);

  const handleEliminar = useCallback(() => {
    if (!isEditMode || !entregableId) return;
    Alert.alert(
      "Eliminar entregable",
      "¿Estás seguro de que deseas eliminar este entregable? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await eliminarEntregable(entregableId);
              navigation.goBack();
            } catch (err) {
              const msg = err instanceof Error ? err.message : "No se pudo eliminar el entregable";
              Alert.alert("Error", msg);
            }
          },
        },
      ]
    );
  }, [isEditMode, entregableId, eliminarEntregable, navigation]);

  const handleCancelar = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return {
    grupoId,
    grupoNombre,
    isEditMode,
    titulo,
    descripcion,
    tipo,
    valor,
    fechaAsignacion,
    fechaEntrega,
    permitirEntregaTardia,
    fechaLimiteEntregaTardia,
    notas,
    isSaving,
    tipoOptions,
    showFechaAsignacionPicker,
    showFechaEntregaPicker,
    showFechaLimitePicker,
    setTitulo,
    setDescripcion,
    setTipo,
    setValor,
    setFechaAsignacion,
    setFechaEntrega,
    setPermitirEntregaTardia,
    setFechaLimiteEntregaTardia,
    setNotas,
    setShowFechaAsignacionPicker,
    setShowFechaEntregaPicker,
    setShowFechaLimitePicker,
    onFechaAsignacionChange,
    onFechaEntregaChange,
    onFechaLimiteChange,
    handleGuardar,
    handleCancelar,
    handleEliminar,
  };
};
