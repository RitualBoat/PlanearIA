import { useCallback, useEffect, useState } from "react";
import { classroomFacade, type ClassroomFacade } from "../../services/classroom/classroomFacade";
import type { BuildClassroomModelResult } from "../../services/classroom/classroomModel";
import type { Alumno, Asistencia, Calificacion, EntregaTarea, Recurso, Tarea } from "../../../types";

export interface ClassroomGroupViewModel {
  model: BuildClassroomModelResult | null;
  alumnos: Alumno[];
  actividades: Tarea[];
  entregas: EntregaTarea[];
  asistencias: Asistencia[];
  calificaciones: Calificacion[];
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
  const [actividades, setActividades] = useState<Tarea[]>([]);
  const [entregas, setEntregas] = useState<EntregaTarea[]>([]);
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([]);
  const [materiales, setMateriales] = useState<Recurso[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [
        data,
        alumnosData,
        actividadesData,
        entregasData,
        asistenciasData,
        calificacionesData,
        materialesData,
      ] = await Promise.all([
        facade.getClassroomModel(grupoId),
        facade.getAlumnosByGrupoId(grupoId),
        facade.getActividadesByGrupoId(grupoId),
        facade.getEntregasByGrupoId(grupoId),
        facade.getAsistenciasByGrupoId(grupoId),
        facade.getCalificacionesByGrupoId(grupoId),
        facade.getMaterialesByGrupoId(grupoId),
      ]);
      setModel(data);
      setAlumnos(alumnosData);
      setActividades(actividadesData);
      setEntregas(entregasData);
      setAsistencias(asistenciasData);
      setCalificaciones(calificacionesData);
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
    actividades,
    entregas,
    asistencias,
    calificaciones,
    materiales,
    isLoading,
    error,
    reload,
  };
}
