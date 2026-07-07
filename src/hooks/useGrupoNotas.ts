import { useState, useCallback, useMemo } from "react";
import type { Grupo } from "../../types";

type NotasEstado = "sin-cambios" | "cambios-sin-guardar" | "guardando" | "guardado" | "error";

interface GrupoNotasDraft {
  grupoNotas: string;
  savedGrupoNotas: string;
  notasActualizadoEn: string | null;
  notasEstado: NotasEstado;
  notasError: string;
}

export interface UseGrupoNotasResult {
  grupoNotas: string;
  notasUltimaEdicion: string;
  notasEstado: NotasEstado;
  notasError: string;
  setGrupoNotas: (value: string) => void;
  guardarNotasGrupo: () => Promise<void>;
  descartarCambiosNotas: () => void;
}

const createNotasDraft = (
  savedGrupoNotas: string,
  notasActualizadoEn: string | null,
  notasEstado: NotasEstado = "sin-cambios",
  notasError = ""
): GrupoNotasDraft => ({
  grupoNotas: savedGrupoNotas,
  savedGrupoNotas,
  notasActualizadoEn,
  notasEstado,
  notasError,
});

export const useGrupoNotas = (
  grupoId: number,
  grupo: Partial<Grupo> | undefined,
  actualizarGrupo: (id: number, data: Partial<Grupo>) => Promise<void>
): UseGrupoNotasResult => {
  const source = useMemo(() => {
    const savedGrupoNotas = typeof grupo?.notasPersonales === "string" ? grupo.notasPersonales : "";
    const notasActualizadoEn =
      typeof grupo?.notasActualizadoEn === "string" ? grupo.notasActualizadoEn : null;

    return {
      key: JSON.stringify([grupo?.id ?? grupoId, savedGrupoNotas, notasActualizadoEn]),
      savedGrupoNotas,
      notasActualizadoEn,
    };
  }, [grupo?.id, grupo?.notasActualizadoEn, grupo?.notasPersonales, grupoId]);

  const [draftsBySource, setDraftsBySource] = useState<Record<string, GrupoNotasDraft>>({});
  const draft =
    draftsBySource[source.key] ?? createNotasDraft(source.savedGrupoNotas, source.notasActualizadoEn);
  const { grupoNotas, savedGrupoNotas, notasActualizadoEn, notasEstado, notasError } = draft;

  const notasUltimaEdicion = useMemo(() => {
    if (!notasActualizadoEn) return "Sin ediciones";

    const fecha = new Date(notasActualizadoEn);
    if (Number.isNaN(fecha.getTime())) return "Sin ediciones";

    return fecha.toLocaleString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [notasActualizadoEn]);

  const setGrupoNotas = useCallback(
    (value: string) => {
      setDraftsBySource((prev) => ({
        ...prev,
        [source.key]: {
          ...draft,
          grupoNotas: value,
          notasEstado: value === savedGrupoNotas ? "sin-cambios" : "cambios-sin-guardar",
          notasError: "",
        },
      }));
    },
    [draft, savedGrupoNotas, source.key]
  );

  const descartarCambiosNotas = useCallback(() => {
    setDraftsBySource((prev) => ({
      ...prev,
      [source.key]: createNotasDraft(savedGrupoNotas, notasActualizadoEn),
    }));
  }, [notasActualizadoEn, savedGrupoNotas, source.key]);

  const guardarNotasGrupo = useCallback(async () => {
    if (grupoNotas === savedGrupoNotas) {
      setDraftsBySource((prev) => ({
        ...prev,
        [source.key]: { ...draft, notasEstado: "sin-cambios", notasError: "" },
      }));
      return;
    }

    try {
      setDraftsBySource((prev) => ({
        ...prev,
        [source.key]: { ...draft, notasEstado: "guardando", notasError: "" },
      }));
      const nowIso = new Date().toISOString();

      await actualizarGrupo(grupoId, {
        notasPersonales: grupoNotas,
        notasActualizadoEn: nowIso,
      });

      setDraftsBySource((prev) => ({
        ...prev,
        [source.key]: {
          grupoNotas,
          savedGrupoNotas: grupoNotas,
          notasActualizadoEn: nowIso,
          notasEstado: "guardado",
          notasError: "",
        },
      }));
    } catch {
      setDraftsBySource((prev) => ({
        ...prev,
        [source.key]: {
          ...draft,
          notasEstado: "error",
          notasError: "No se pudieron guardar las notas. Intenta nuevamente.",
        },
      }));
    }
  }, [actualizarGrupo, draft, grupoId, grupoNotas, savedGrupoNotas, source.key]);

  return {
    grupoNotas,
    notasUltimaEdicion,
    notasEstado,
    notasError,
    setGrupoNotas,
    guardarNotasGrupo,
    descartarCambiosNotas,
  };
};
