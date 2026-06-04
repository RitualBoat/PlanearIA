import { useCallback, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { Alumno, EntregaTarea } from "../../types";
import type { RootStackParamList } from "../navigation/StackNavigator";
import { useAlumnos } from "../context/AlumnosContext";
import { useEntregables } from "../context/EntregablesContext";
import { CLASSROOM_STORAGE_KEYS } from "../services/classroom/classroomStorage";
import { sugerirRetroalimentacionClassroom } from "../services/classroom/classroomAiService";
import logger from "../utils/logger";

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
  estado: "pendiente" | "entregada" | "tarde" | "calificada";
  archivo?: string;
  calificada: boolean;
}

export interface CalificarEntregasViewModel {
  tareaId: number;
  grupoId: number;
  tituloTarea: string;
  calificacionMaxima: number;
  entregas: Entrega[];
  calificaciones: Record<number, Calificacion>;
  isSaving: boolean;
  isSuggestingFeedback: number | null;
  updateCalificacion: (
    alumnoId: number,
    field: keyof Calificacion,
    value: string,
  ) => void;
  handleGuardarCalificaciones: () => void;
  handleSugerirRetroalimentacion: (alumnoId: number) => void;
  handleCancelar: () => void;
}

const readStoredEntregas = async (): Promise<EntregaTarea[]> => {
  const raw = await AsyncStorage.getItem(CLASSROOM_STORAGE_KEYS.entregas);
  if (!raw) return [];

  const parsed = JSON.parse(raw) as unknown;
  return Array.isArray(parsed) ? (parsed as EntregaTarea[]) : [];
};

const writeStoredEntregas = async (entregas: EntregaTarea[]): Promise<void> => {
  await AsyncStorage.setItem(CLASSROOM_STORAGE_KEYS.entregas, JSON.stringify(entregas));
};

const buildAlumnoName = (alumno: Alumno): string =>
  `${alumno.nombre ?? ""} ${alumno.apellidos ?? ""}`.trim() || `Alumno ${alumno.id}`;

const getNextEntregaId = (entregas: EntregaTarea[]): number =>
  entregas.reduce((max, entrega) => Math.max(max, Number(entrega.id) || 0), 0) + 1;

export const useCalificarEntregasViewModel = (
  tareaId: number,
  grupoId: number,
): CalificarEntregasViewModel => {
  const navigation = useNavigation<Nav>();
  const { alumnos } = useAlumnos();
  const { obtenerEntregablePorId } = useEntregables();
  const tarea = obtenerEntregablePorId(tareaId);
  const alumnosGrupo = useMemo(() => alumnos.filter((alumno) => alumno.grupoId === grupoId), [alumnos, grupoId]);
  const [storedEntregas, setStoredEntregas] = useState<EntregaTarea[]>([]);
  const [calificaciones, setCalificaciones] = useState<Record<number, Calificacion>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSuggestingFeedback, setIsSuggestingFeedback] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const entregas = (await readStoredEntregas()).filter((entrega) => entrega.tareaId === tareaId);
        if (!mounted) return;

        setStoredEntregas(entregas);
        setCalificaciones(
          entregas.reduce<Record<number, Calificacion>>((acc, entrega) => {
            acc[entrega.alumnoId] = {
              alumnoId: entrega.alumnoId,
              calificacion: entrega.calificacion != null ? String(entrega.calificacion) : "",
              retroalimentacion: entrega.retroalimentacion ?? "",
            };
            return acc;
          }, {}),
        );
      } catch (error) {
        logger.error("[calificaciones] Error loading entregas:", error);
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [tareaId]);

  const entregas = useMemo<Entrega[]>(
    () =>
      alumnosGrupo.map((alumno) => {
        const entrega = storedEntregas.find((item) => item.alumnoId === alumno.id);
        return {
          id: entrega?.id ?? alumno.id,
          alumnoId: alumno.id,
          nombre: buildAlumnoName(alumno),
          estado: entrega?.estado ?? "pendiente",
          archivo: entrega?.archivo,
          calificada: entrega?.calificada ?? false,
        };
      }),
    [alumnosGrupo, storedEntregas],
  );

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
    const save = async () => {
      setIsSaving(true);

      try {
        const current = await readStoredEntregas();
        let nextId = getNextEntregaId(current);
        const next = [...current];

        for (const entregaView of entregas) {
          const calificacion = calificaciones[entregaView.alumnoId];
          if (!calificacion) continue;

          const value = Number(calificacion.calificacion.replace(",", "."));
          const hasScore = Number.isFinite(value);
          const hasFeedback = calificacion.retroalimentacion.trim().length > 0;
          if (!hasScore && !hasFeedback) continue;

          const existingIndex = next.findIndex(
            (item) => item.tareaId === tareaId && item.alumnoId === entregaView.alumnoId,
          );
          const existing = existingIndex >= 0 ? next[existingIndex] : undefined;
          const payload: EntregaTarea = {
            id: existing?.id ?? nextId++,
            tareaId,
            alumnoId: entregaView.alumnoId,
            fechaEntrega: existing?.fechaEntrega ?? new Date(),
            archivo: existing?.archivo,
            comentarioAlumno: existing?.comentarioAlumno,
            calificacion: hasScore ? value : existing?.calificacion,
            calificada: hasScore,
            retroalimentacion: calificacion.retroalimentacion.trim() || existing?.retroalimentacion,
            estado: hasScore ? "calificada" : existing?.estado ?? "pendiente",
            intentos: existing?.intentos ?? 0,
          };

          if (existingIndex >= 0) {
            next[existingIndex] = payload;
          } else {
            next.push(payload);
          }
        }

        await writeStoredEntregas(next);
        setStoredEntregas(next.filter((entrega) => entrega.tareaId === tareaId));

        if (Platform.OS === "web") {
          window.alert("Calificaciones guardadas\n\nLas entregas quedaron actualizadas localmente.");
        } else {
          Alert.alert("Calificaciones guardadas", "Las entregas quedaron actualizadas localmente.");
        }

        navigation.goBack();
      } catch (error) {
        logger.error("[calificaciones] Error saving entregas:", error);
        const message = "No se pudieron guardar las calificaciones locales.";
        if (Platform.OS === "web") {
          window.alert(`Error\n\n${message}`);
        } else {
          Alert.alert("Error", message);
        }
      } finally {
        setIsSaving(false);
      }
    };

    void save();
  }, [calificaciones, entregas, navigation, tareaId]);

  const handleSugerirRetroalimentacion = useCallback(
    (alumnoId: number) => {
      const run = async () => {
        const alumno = alumnosGrupo.find((item) => item.id === alumnoId);
        const entrega = storedEntregas.find((item) => item.alumnoId === alumnoId);
        const calificacion = calificaciones[alumnoId];

        setIsSuggestingFeedback(alumnoId);
        try {
          const response = await sugerirRetroalimentacionClassroom({
            grupo: { id: grupoId },
            actividad: tarea,
            alumno,
            calificacion: calificacion?.calificacion,
            retroalimentacionActual: calificacion?.retroalimentacion,
            entregas: entrega
              ? [
                  {
                    tareaId: entrega.tareaId,
                    alumnoId: entrega.alumnoId,
                    estado: entrega.estado,
                    calificacion: entrega.calificacion,
                    calificada: entrega.calificada,
                  },
                ]
              : [],
          });
          const warning = response.usage?.warning ? `${response.usage.warning}\n\n` : "";
          const suggestion = response.resultado.retroalimentacion;
          const message = `${warning}${response.resultado.mensaje}\n\n${suggestion}\n\nRevisa antes de guardar.`;

          if (Platform.OS === "web") {
            if (window.confirm(`${message}\n\n¿Insertar esta sugerencia en el campo editable?`)) {
              updateCalificacion(alumnoId, "retroalimentacion", suggestion);
            }
            return;
          }

          Alert.alert("Retroalimentacion IA", message, [
            { text: "Cerrar", style: "cancel" },
            {
              text: "Insertar",
              onPress: () => updateCalificacion(alumnoId, "retroalimentacion", suggestion),
            },
          ]);
        } catch (error) {
          logger.error("[calificaciones] Error suggesting feedback:", error);
          const message = error instanceof Error ? error.message : "No se pudo sugerir retroalimentacion.";
          if (Platform.OS === "web") {
            window.alert(`IA Classroom no disponible\n\n${message}`);
          } else {
            Alert.alert("IA Classroom no disponible", message);
          }
        } finally {
          setIsSuggestingFeedback(null);
        }
      };

      void run();
    },
    [alumnosGrupo, calificaciones, grupoId, storedEntregas, tarea, updateCalificacion],
  );

  const handleCancelar = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return {
    tareaId,
    grupoId,
    tituloTarea: tarea?.titulo ?? "Actividad",
    calificacionMaxima: tarea?.calificacionMaxima ?? 10,
    entregas,
    calificaciones,
    isSaving,
    isSuggestingFeedback,
    updateCalificacion,
    handleGuardarCalificaciones,
    handleSugerirRetroalimentacion,
    handleCancelar,
  };
};
