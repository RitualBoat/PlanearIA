import { useState, useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../navigation/StackNavigator";

type Nav = StackNavigationProp<RootStackParamList, "CalificarEntregas">;

interface Calificacion {
  alumnoId: number;
  calificacion: string;
  retroalimentacion: string;
}

interface Entrega {
  id: number;
  alumnoId: number;
  nombre: string;
}

export interface CalificarEntregasViewModel {
  tareaId: number;
  grupoId: number;
  entregas: Entrega[];
  calificaciones: Record<number, Calificacion>;
  updateCalificacion: (
    alumnoId: number,
    field: keyof Calificacion,
    value: string,
  ) => void;
  handleGuardarCalificaciones: () => void;
  handleCancelar: () => void;
}

export const useCalificarEntregasViewModel = (
  tareaId: number,
  grupoId: number,
): CalificarEntregasViewModel => {
  const navigation = useNavigation<Nav>();

  // TODO: Load from a service instead of hardcoded data
  const entregas: Entrega[] = [
    { id: 1, alumnoId: 1, nombre: "Juan Pérez García" },
    { id: 2, alumnoId: 2, nombre: "María López Martínez" },
    { id: 3, alumnoId: 4, nombre: "Ana Torres Silva" },
  ];

  const [calificaciones, setCalificaciones] = useState<
    Record<number, Calificacion>
  >({});

  const updateCalificacion = useCallback(
    (alumnoId: number, field: keyof Calificacion, value: string) => {
      setCalificaciones((prev) => ({
        ...prev,
        [alumnoId]: {
          ...(prev[alumnoId] || {
            alumnoId,
            calificacion: "",
            retroalimentacion: "",
          }),
          [field]: value,
        },
      }));
    },
    [],
  );

  const handleGuardarCalificaciones = useCallback(() => {
    // TODO: Integrate with a calificaciones service
    console.log("[calificaciones] Saving:", calificaciones);
    navigation.goBack();
  }, [calificaciones, navigation]);

  const handleCancelar = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return {
    tareaId,
    grupoId,
    entregas,
    calificaciones,
    updateCalificacion,
    handleGuardarCalificaciones,
    handleCancelar,
  };
};
