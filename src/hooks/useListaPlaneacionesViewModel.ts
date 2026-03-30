import { useState, useEffect, useCallback } from "react";
import { Platform, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../navigation/StackNavigator";
import { NivelAcademico, Planeacion, FiltrosPlaneacion } from "../../types/planeacion";
import { usePlaneaciones } from "../sync/providers/SyncProvider";

type Nav = StackNavigationProp<RootStackParamList, "ListaPlaneaciones">;

export interface ListaPlaneacionesViewModel {
  planeaciones: Planeacion[];
  planeacionesFiltradas: Planeacion[];
  showFiltros: boolean;
  menuVisible: string | null;
  filtroNivel: NivelAcademico | undefined;
  filtroAsignatura: string;
  filtroGrado: string;

  setShowFiltros: (value: boolean) => void;
  setMenuVisible: (value: string | null) => void;
  setFiltroNivel: (value: NivelAcademico | undefined) => void;
  setFiltroAsignatura: (value: string) => void;
  setFiltroGrado: (value: string) => void;

  aplicarFiltros: () => void;
  limpiarFiltros: () => void;
  formatearFecha: (fecha: string) => string;
  getColorNivel: (nivel: NivelAcademico) => string;
  getTextoNivel: (nivel: NivelAcademico) => string;
  handleEditar: (planeacion: Planeacion) => void;
  handleClonar: (planeacionId: string) => Promise<void>;
  handleEliminar: (planeacionId: string) => void;
  handleExportar: (planeacionId: string) => void;
  handleCrearNueva: () => void;
}

export const useListaPlaneacionesViewModel = (): ListaPlaneacionesViewModel => {
  const navigation = useNavigation<Nav>();
  const { planeaciones, filtrarPlaneaciones, eliminarPlaneacion, clonarPlaneacion } =
    usePlaneaciones();

  const [planeacionesFiltradas, setPlaneacionesFiltradas] = useState<Planeacion[]>(planeaciones);
  const [showFiltros, setShowFiltros] = useState(false);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [filtroNivel, setFiltroNivel] = useState<NivelAcademico | undefined>(undefined);
  const [filtroAsignatura, setFiltroAsignatura] = useState("");
  const [filtroGrado, setFiltroGrado] = useState("");

  useEffect(() => {
    aplicarFiltrosInternal();
  }, [planeaciones]);

  const aplicarFiltrosInternal = useCallback(() => {
    const filtros: FiltrosPlaneacion = {
      nivelAcademico: filtroNivel,
      asignatura: filtroAsignatura || undefined,
      grado: filtroGrado || undefined,
    };
    const resultado = filtrarPlaneaciones(filtros);
    setPlaneacionesFiltradas(resultado);
  }, [filtroNivel, filtroAsignatura, filtroGrado, filtrarPlaneaciones]);

  const aplicarFiltros = useCallback(() => {
    aplicarFiltrosInternal();
    setShowFiltros(false);
  }, [aplicarFiltrosInternal]);

  const limpiarFiltros = useCallback(() => {
    setFiltroNivel(undefined);
    setFiltroAsignatura("");
    setFiltroGrado("");
    setPlaneacionesFiltradas(planeaciones);
    setShowFiltros(false);
  }, [planeaciones]);

  const formatearFecha = useCallback((fecha: string): string => {
    const date = new Date(fecha);
    return date.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, []);

  const getColorNivel = useCallback((nivel: NivelAcademico): string => {
    const colores = {
      [NivelAcademico.PRIMARIA]: "#4CAF50",
      [NivelAcademico.SECUNDARIA]: "#2196F3",
      [NivelAcademico.PREPARATORIA]: "#FF9800",
      [NivelAcademico.UNIVERSIDAD]: "#9C27B0",
    };
    return colores[nivel];
  }, []);

  const getTextoNivel = useCallback((nivel: NivelAcademico): string => {
    const textos = {
      [NivelAcademico.PRIMARIA]: "Primaria",
      [NivelAcademico.SECUNDARIA]: "Secundaria",
      [NivelAcademico.PREPARATORIA]: "Preparatoria",
      [NivelAcademico.UNIVERSIDAD]: "Universidad",
    };
    return textos[nivel];
  }, []);

  const confirmar = useCallback((titulo: string, mensaje: string, onConfirm: () => void) => {
    if (Platform.OS === "web") {
      if (window.confirm(`${titulo}\n\n${mensaje}`)) {
        onConfirm();
      }
    } else {
      Alert.alert(titulo, mensaje, [
        { text: "Cancelar", style: "cancel" },
        { text: "Confirmar", onPress: onConfirm },
      ]);
    }
  }, []);

  const showMessage = useCallback((title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(message);
    } else {
      Alert.alert(title, message);
    }
  }, []);

  const handleEditar = useCallback(
    (planeacion: Planeacion) => {
      setMenuVisible(null);
      navigation.navigate("EditorPlaneacion", {
        nivel: planeacion.nivelAcademico,
        modo: "editar",
        planeacionId: planeacion.id,
      });
    },
    [navigation]
  );

  const handleClonar = useCallback(
    async (planeacionId: string) => {
      setMenuVisible(null);
      try {
        await clonarPlaneacion(planeacionId);
        showMessage("Éxito", "Planeación clonada exitosamente");
      } catch {
        showMessage("Error", "No se pudo clonar la planeación");
      }
    },
    [clonarPlaneacion, showMessage]
  );

  const handleEliminar = useCallback(
    (planeacionId: string) => {
      setMenuVisible(null);
      confirmar(
        "Eliminar Planeación",
        "¿Estás seguro de que deseas eliminar esta planeación? Esta acción no se puede deshacer.",
        async () => {
          try {
            await eliminarPlaneacion(planeacionId);
            showMessage("Eliminada", "Planeación eliminada correctamente");
          } catch {
            showMessage("Error", "No se pudo eliminar la planeación");
          }
        }
      );
    },
    [eliminarPlaneacion, confirmar, showMessage]
  );

  const handleExportar = useCallback(
    (planeacionId: string) => {
      setMenuVisible(null);
      navigation.navigate("ExportarPlaneacion", { planeacionId });
    },
    [navigation]
  );

  const handleCrearNueva = useCallback(() => {
    navigation.navigate("CrearPlaneacion");
  }, [navigation]);

  return {
    planeaciones,
    planeacionesFiltradas,
    showFiltros,
    menuVisible,
    filtroNivel,
    filtroAsignatura,
    filtroGrado,
    setShowFiltros,
    setMenuVisible,
    setFiltroNivel,
    setFiltroAsignatura,
    setFiltroGrado,
    aplicarFiltros,
    limpiarFiltros,
    formatearFecha,
    getColorNivel,
    getTextoNivel,
    handleEditar,
    handleClonar,
    handleEliminar,
    handleExportar,
    handleCrearNueva,
  };
};
