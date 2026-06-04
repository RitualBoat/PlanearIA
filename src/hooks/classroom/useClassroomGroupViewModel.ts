import { useCallback, useEffect, useState } from "react";
import { classroomFacade, type ClassroomFacade } from "../../services/classroom/classroomFacade";
import type { BuildClassroomModelResult } from "../../services/classroom/classroomModel";

export interface ClassroomGroupViewModel {
  model: BuildClassroomModelResult | null;
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useClassroomGroupViewModel(
  grupoId: number,
  facade: ClassroomFacade = classroomFacade,
): ClassroomGroupViewModel {
  const [model, setModel] = useState<BuildClassroomModelResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await facade.getClassroomModel(grupoId);
      setModel(data);
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
    isLoading,
    error,
    reload,
  };
}

