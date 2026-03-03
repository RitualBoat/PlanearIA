import { useState, useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../navigation/StackNavigator";
import type { Carrera } from "../../types";

type Nav = StackNavigationProp<RootStackParamList, "CrearGrupo">;

export interface CrearGrupoViewModel {
  nombre: string;
  materia: string;
  carrera: Carrera;
  semestre: string;
  periodo: string;
  horario: string;
  setNombre: (value: string) => void;
  setMateria: (value: string) => void;
  setCarrera: (value: Carrera) => void;
  setSemestre: (value: string) => void;
  setPeriodo: (value: string) => void;
  setHorario: (value: string) => void;
  handleCrearGrupo: () => void;
  handleCancelar: () => void;
}

export const useCrearGrupoViewModel = (): CrearGrupoViewModel => {
  const navigation = useNavigation<Nav>();
  const [nombre, setNombre] = useState("");
  const [materia, setMateria] = useState("");
  const [carrera, setCarrera] = useState<Carrera>("ISC");
  const [semestre, setSemestre] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [horario, setHorario] = useState("");

  const handleCrearGrupo = useCallback(() => {
    // TODO: Integrate with gruposService.agregarGrupo
    console.log("[grupos] Creating group:", {
      nombre,
      materia,
      carrera,
      semestre,
      periodo,
      horario,
    });
    navigation.goBack();
  }, [nombre, materia, carrera, semestre, periodo, horario, navigation]);

  const handleCancelar = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return {
    nombre,
    materia,
    carrera,
    semestre,
    periodo,
    horario,
    setNombre,
    setMateria,
    setCarrera,
    setSemestre,
    setPeriodo,
    setHorario,
    handleCrearGrupo,
    handleCancelar,
  };
};
