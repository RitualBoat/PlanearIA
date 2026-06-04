import { useCallback, useEffect, useMemo, useState } from "react";
import { classroomFacade, type ClassroomFacade } from "../../services/classroom/classroomFacade";
import type { BuildClassroomModelResult } from "../../services/classroom/classroomModel";

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

  const reload = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await facade.listGruposResumen();
      setClassrooms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar Classroom");
    } finally {
      setIsLoading(false);
    }
  }, [facade]);

  useEffect(() => {
    void reload();
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

