import { useState, useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../navigation/StackNavigator";
import type { Carrera } from "../../types";
import { useGruposContext } from "../context/GruposContext";

type Nav = StackNavigationProp<RootStackParamList, "CrearGrupo">;

export interface CrearGrupoViewModel {
  nombre: string;
  materia: string;
  carrera: Carrera;
  semestre: string;
  periodo: string;
  horario: string;
  validationError: string;
  isSaving: boolean;
  setNombre: (value: string) => void;
  setMateria: (value: string) => void;
  setCarrera: (value: Carrera) => void;
  setSemestre: (value: string) => void;
  setPeriodo: (value: string) => void;
  setHorario: (value: string) => void;
  handleCrearGrupo: () => Promise<void>;
  handleCancelar: () => void;
}

export const useCrearGrupoViewModel = (): CrearGrupoViewModel => {
  const navigation = useNavigation<Nav>();
  const { agregarGrupo } = useGruposContext();
  const [nombre, setNombre] = useState("");
  const [materia, setMateria] = useState("");
  const [carrera, setCarrera] = useState<Carrera>("ISC");
  const [semestre, setSemestre] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [horario, setHorario] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const getValidationError = useCallback((): string => {
    if (!nombre.trim()) return "El nombre del grupo es obligatorio.";
    if (!materia.trim()) return "La materia es obligatoria.";
    if (!semestre.trim()) return "El semestre es obligatorio.";
    if (!periodo.trim()) return "El periodo es obligatorio.";

    const semestreNumero = Number(semestre);
    if (!Number.isInteger(semestreNumero) || semestreNumero < 1 || semestreNumero > 12) {
      return "El semestre debe ser un número entre 1 y 12.";
    }

    return "";
  }, [nombre, materia, semestre, periodo]);

  const handleCrearGrupo = useCallback(async () => {
    const error = getValidationError();
    if (error) {
      setValidationError(error);
      return;
    }

    try {
      setIsSaving(true);
      setValidationError("");

      await agregarGrupo({
        nombre: nombre.trim(),
        materia: materia.trim(),
        carrera,
        semestre: Number(semestre),
        periodo: periodo.trim(),
        horario: horario.trim() || undefined,
        cantidadAlumnos: 0,
        estado: "activo",
        profesorId: 1,
        fechaCreacion: new Date(),
      });

      navigation.navigate("ListaGrupos");
    } catch {
      setValidationError("No se pudo guardar el grupo. Intenta nuevamente.");
    } finally {
      setIsSaving(false);
    }
  }, [getValidationError, nombre, materia, carrera, semestre, periodo, horario, navigation]);

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
    validationError,
    isSaving,
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
