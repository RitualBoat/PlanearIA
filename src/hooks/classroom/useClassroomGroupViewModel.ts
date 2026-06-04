import { useCallback, useEffect, useState } from "react";
import { classroomFacade, type ClassroomFacade } from "../../services/classroom/classroomFacade";
import type { BuildClassroomModelResult } from "../../services/classroom/classroomModel";
import type { Alumno, Recurso } from "../../../types";

export interface ClassroomGroupViewModel {
  model: BuildClassroomModelResult | null;
  alumnos: Alumno[];
  materiales: Recurso[];
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useClassroomGroupViewModel(
  grupoId: number,
  facade: ClassroomFacade = classroomFacade,
): ClassroomGroupViewModel {
  const [model, setModel] = useState<BuildClassroomModelResult | null>(null);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [materiales, setMateriales] = useState<Recurso[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [data, alumnosData, materialesData] = await Promise.all([
        facade.getClassroomModel(grupoId),
        facade.getAlumnosByGrupoId(grupoId),
        facade.getMaterialesByGrupoId(grupoId),
      ]);
      setModel(data);
      setAlumnos(alumnosData);
      setMateriales(materialesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar el grupo");
    } finally {
      setIsLoading(false);
    }
  }, [facade, grupoId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    model,
    alumnos,
    materiales,
    isLoading,
    error,
    reload,
  };
}
