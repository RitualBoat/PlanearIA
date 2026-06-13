import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { classroomFacade, type ClassroomFacade } from "../../services/classroom/classroomFacade";
import type { BuildClassroomModelResult } from "../../services/classroom/classroomModel";
import { onSyncEvent } from "../../sync/services/syncEvents";

const CLASSROOM_SYNC_ENTITIES = new Set([
  "grupos",
  "unidades",
  "alumnos",
  "entregables",
  "recursos",
  "asistencias",
  "calificaciones",
]);

export interface ClassroomHomeViewModel {
  classrooms: BuildClassroomModelResult[];
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
  totalGrupos: number;
  totalAlumnos: number;
  totalPendientes: number;
  reload: () => Promise<void>;
}

export function useClassroomHomeViewModel(
  facade: ClassroomFacade = classroomFacade,
): ClassroomHomeViewModel {
  const [classrooms, setClassrooms] = useState<BuildClassroomModelResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  const reload = useCallback(async () => {
    try {
      // Spinner only on first load; background syncs refresh silently
      if (!hasLoadedRef.current) setIsLoading(true);
      setError(null);
      const data = await facade.listGruposResumen();
      setClassrooms(data);
      hasLoadedRef.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar Classroom");
    } finally {
      setIsLoading(false);
    }
  }, [facade]);

  useEffect(() => {
    void reload();
  }, [reload]);

  // Refresh when the sync orchestrator pulls classroom data from the cloud
  useEffect(() => {
    return onSyncEvent((event) => {
      if (event.type === "entity-updated" && CLASSROOM_SYNC_ENTITIES.has(event.entity)) {
        void reload();
      }
    });
  }, [reload]);

  const totalAlumnos = useMemo(
    () => classrooms.reduce((total, item) => total + item.resumen.totalAlumnos, 0),
    [classrooms],
  );

  const totalPendientes = useMemo(
    () => classrooms.reduce((total, item) => total + item.pendientes.length, 0),
    [classrooms],
  );

  return {
    classrooms,
    isLoading,
    error,
    isEmpty: !isLoading && classrooms.length === 0,
    totalGrupos: classrooms.length,
    totalAlumnos,
    totalPendientes,
    reload,
  };
}

