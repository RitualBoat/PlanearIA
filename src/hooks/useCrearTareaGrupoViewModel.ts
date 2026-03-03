import { useState, useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../navigation/StackNavigator";

type Nav = StackNavigationProp<RootStackParamList, "CrearTareaGrupo">;

type TipoTarea = "tarea" | "examen" | "proyecto" | "investigacion";

export interface TipoOption {
  value: TipoTarea;
  label: string;
  icon: string;
}

export interface CrearTareaGrupoViewModel {
  grupoId: number;
  titulo: string;
  descripcion: string;
  tipo: TipoTarea;
  valor: string;
  fechaEntrega: string;
  tipoOptions: TipoOption[];
  setTitulo: (value: string) => void;
  setDescripcion: (value: string) => void;
  setTipo: (value: TipoTarea) => void;
  setValor: (value: string) => void;
  setFechaEntrega: (value: string) => void;
  handleGuardar: () => void;
  handleCancelar: () => void;
}

export const useCrearTareaGrupoViewModel = (
  grupoId: number,
): CrearTareaGrupoViewModel => {
  const navigation = useNavigation<Nav>();
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState<TipoTarea>("tarea");
  const [valor, setValor] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");

  const tipoOptions: TipoOption[] = [
    { value: "tarea", label: "Tarea", icon: "assignment" },
    { value: "examen", label: "Examen", icon: "quiz" },
    { value: "proyecto", label: "Proyecto", icon: "science" },
    { value: "investigacion", label: "Investigación", icon: "search" },
  ];

  const handleGuardar = useCallback(() => {
    // TODO: Integrate with a tareas service
    console.log("[tareas] Saving task:", {
      grupoId,
      titulo,
      descripcion,
      tipo,
      valor,
      fechaEntrega,
    });
    navigation.goBack();
  }, [grupoId, titulo, descripcion, tipo, valor, fechaEntrega, navigation]);

  const handleCancelar = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return {
    grupoId,
    titulo,
    descripcion,
    tipo,
    valor,
    fechaEntrega,
    tipoOptions,
    setTitulo,
    setDescripcion,
    setTipo,
    setValor,
    setFechaEntrega,
    handleGuardar,
    handleCancelar,
  };
};
