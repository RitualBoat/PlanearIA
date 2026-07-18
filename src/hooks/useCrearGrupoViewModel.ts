import { useState, useCallback, useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RouteProp } from "@react-navigation/native";
import type { AppRoutesParamList } from "../navigation/StackNavigator";
import type { Carrera } from "../../types";
import { useGruposContext } from "../context/GruposContext";
import { goBackOrHubLanding } from "../navigation/navigateToHub";

type Nav = StackNavigationProp<AppRoutesParamList, "CrearGrupo">;
type Route = RouteProp<AppRoutesParamList, "CrearGrupo">;

export interface CrearGrupoViewModel {
  modo: "crear" | "editar";
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
  const route = useRoute<Route>();
  const { agregarGrupo, actualizarGrupo, obtenerGrupo } = useGruposContext();

  const modo = route.params?.modo === "editar" ? "editar" : "crear";
  const grupoId = route.params?.grupoId;
  const [nombre, setNombre] = useState("");
  const [materia, setMateria] = useState("");
  const [carrera, setCarrera] = useState<Carrera>("ISC");
  const [semestre, setSemestre] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [horario, setHorario] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (modo !== "editar" || typeof grupoId !== "number") {
      return;
    }

    const grupo = obtenerGrupo(grupoId);
    if (!grupo) {
      setValidationError("No se encontró el grupo para editar.");
      return;
    }

    setNombre(grupo.nombre ?? "");
    setMateria(grupo.materia ?? "");
    setCarrera((grupo.carrera as Carrera) ?? "ISC");
    setSemestre(String(grupo.semestre ?? ""));
    setPeriodo(grupo.periodo ?? "");
    setHorario(grupo.horario ?? "");
  }, [modo, grupoId, obtenerGrupo]);

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

      const payload = {
        nombre: nombre.trim(),
        materia: materia.trim(),
        carrera,
        semestre: Number(semestre),
        periodo: periodo.trim(),
        horario: horario.trim() || undefined,
      };

      if (modo === "editar") {
        if (typeof grupoId !== "number") {
          setValidationError("No se pudo identificar el grupo a editar.");
          return;
        }

        await actualizarGrupo(grupoId, payload);
      } else {
        await agregarGrupo({
          ...payload,
          cantidadAlumnos: 0,
          estado: "activo",
          profesorId: 1,
          fechaCreacion: new Date(),
        });
      }

      // Con la pantalla dentro del stack de Clases, el origen real (Classroom
      // o la lista de grupos) esta en el historial; el antiguo parametro que
      // forzaba un destino fijo ya no existe.
      goBackOrHubLanding(navigation, "ClasesTab");
    } catch {
      setValidationError("No se pudo guardar el grupo. Intenta nuevamente.");
    } finally {
      setIsSaving(false);
    }
  }, [
    getValidationError,
    nombre,
    materia,
    carrera,
    semestre,
    periodo,
    horario,
    modo,
    grupoId,
    actualizarGrupo,
    agregarGrupo,
    navigation,
  ]);

  const handleCancelar = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return {
    modo,
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
