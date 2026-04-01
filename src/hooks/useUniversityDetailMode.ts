import { useState, useCallback } from "react";
import { Platform, Alert } from "react-native";
import type { ConfiguracionCurso, SemanaUniversitaria, Evaluacion } from "../../types/planeacion";

export interface UseUniversityDetailModeResult {
  modoDetallado: boolean;
  configuracionCurso: ConfiguracionCurso;
  semanas: SemanaUniversitaria[];
  evaluaciones: Evaluacion[];
  semanasVersion: number;
  setConfiguracionCurso: (v: ConfiguracionCurso) => void;
  setEvaluaciones: (v: Evaluacion[]) => void;
  setModoDetallado: (v: boolean) => void;
  setSemanas: (v: SemanaUniversitaria[]) => void;
  toggleModoDetallado: () => void;
  cambiarDuracionCurso: (d: 12 | 16 | 18) => void;
  actualizarSemana: (semana: SemanaUniversitaria) => void;
  eliminarSemana: (numero: number) => void;
  clonarSemana: (numero: number) => void;
}

const confirmar = (titulo: string, mensaje: string, onConfirm: () => void) => {
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
};

export const useUniversityDetailMode = (): UseUniversityDetailModeResult => {
  const [modoDetallado, setModoDetallado] = useState(false);
  const [configuracionCurso, setConfiguracionCurso] = useState<ConfiguracionCurso>({
    duracionSemanas: 16,
    horasTeoricas: 3,
    horasPracticas: 2,
    horasAutonomas: 5,
    creditos: 8,
    modalidad: "presencial",
  });
  const [semanas, setSemanas] = useState<SemanaUniversitaria[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [semanasVersion, setSemanasVersion] = useState(0);

  const inicializarSemanas = useCallback((duracion: number) => {
    const nuevas: SemanaUniversitaria[] = [];
    for (let i = 1; i <= duracion; i++) {
      nuevas.push({
        numero: i,
        unidadTematica: "",
        temas: [""],
        objetivos: [""],
        actividadesPresenciales: [{ descripcion: "", duracion: 120, metodologia: "" }],
        actividadesAutonomas: [""],
        recursos: [""],
      });
    }
    setSemanas(nuevas);
  }, []);

  const cambiarDuracionCurso = useCallback(
    (nuevaDuracion: 12 | 16 | 18) => {
      const config = { ...configuracionCurso, duracionSemanas: nuevaDuracion };
      setConfiguracionCurso(config);

      if (nuevaDuracion > semanas.length) {
        const nuevas = [...semanas];
        for (let i = semanas.length + 1; i <= nuevaDuracion; i++) {
          nuevas.push({
            numero: i,
            unidadTematica: "",
            temas: [""],
            objetivos: [""],
            actividadesPresenciales: [{ descripcion: "", duracion: 120, metodologia: "" }],
            actividadesAutonomas: [""],
            recursos: [""],
          });
        }
        setSemanas([...nuevas]);
        setSemanasVersion((v) => v + 1);
      } else if (nuevaDuracion < semanas.length) {
        confirmar(
          "Reducir duración",
          `Esto eliminará las semanas ${nuevaDuracion + 1} a ${semanas.length}. ¿Continuar?`,
          () => {
            setSemanas([...semanas.slice(0, nuevaDuracion)]);
            setSemanasVersion((v) => v + 1);
          }
        );
      }
    },
    [configuracionCurso, semanas]
  );

  const toggleModoDetallado = useCallback(() => {
    if (!modoDetallado) {
      inicializarSemanas(configuracionCurso.duracionSemanas);
      setModoDetallado(true);
    } else {
      confirmar(
        "Cambiar a modo simple",
        "Esto descartará la planificación semanal detallada. ¿Continuar?",
        () => {
          setModoDetallado(false);
          setSemanas([]);
          setEvaluaciones([]);
        }
      );
    }
  }, [modoDetallado, configuracionCurso.duracionSemanas, inicializarSemanas]);

  const actualizarSemana = useCallback(
    (semana: SemanaUniversitaria) => {
      const nuevas = semanas.map((s) => (s.numero === semana.numero ? { ...semana } : { ...s }));
      setSemanas([...nuevas]);
      setSemanasVersion((v) => v + 1);
    },
    [semanas]
  );

  const eliminarSemana = useCallback(
    (numero: number) => {
      confirmar("Eliminar semana", `¿Estás seguro de eliminar la semana ${numero}?`, () => {
        const nuevas = semanas
          .filter((s) => s.numero !== numero)
          .map((s, idx) => ({ ...s, numero: idx + 1 }));
        setSemanas([...nuevas]);
        setConfiguracionCurso((prev) => ({
          ...prev,
          duracionSemanas: nuevas.length as 12 | 16 | 18,
        }));
        setSemanasVersion((v) => v + 1);
      });
    },
    [semanas]
  );

  const clonarSemana = useCallback(
    (numero: number) => {
      const src = semanas.find((s) => s.numero === numero);
      if (src) {
        const nueva: SemanaUniversitaria = { ...src, numero: numero + 1 };
        const nuevas = [
          ...semanas.slice(0, numero),
          nueva,
          ...semanas.slice(numero).map((s) => ({ ...s, numero: s.numero + 1 })),
        ];
        setSemanas([...nuevas]);
        setConfiguracionCurso((prev) => ({
          ...prev,
          duracionSemanas: nuevas.length as 12 | 16 | 18,
        }));
        setSemanasVersion((v) => v + 1);
      }
    },
    [semanas]
  );

  return {
    modoDetallado,
    configuracionCurso,
    semanas,
    evaluaciones,
    semanasVersion,
    setConfiguracionCurso,
    setEvaluaciones,
    setModoDetallado,
    setSemanas,
    toggleModoDetallado,
    cambiarDuracionCurso,
    actualizarSemana,
    eliminarSemana,
    clonarSemana,
  };
};
