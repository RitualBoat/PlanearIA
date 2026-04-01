import { useState, useCallback, useMemo, useEffect } from "react";
import type { Grupo } from "../../types";

export interface UseGrupoNotasResult {
  grupoNotas: string;
  notasUltimaEdicion: string;
  notasEstado: "sin-cambios" | "cambios-sin-guardar" | "guardando" | "guardado" | "error";
  notasError: string;
  setGrupoNotas: (value: string) => void;
  guardarNotasGrupo: () => Promise<void>;
  descartarCambiosNotas: () => void;
}

export const useGrupoNotas = (
  grupoId: number,
  grupo: Partial<Grupo> | undefined,
  actualizarGrupo: (id: number, data: Partial<Grupo>) => Promise<void>
): UseGrupoNotasResult => {
  const [savedGrupoNotas, setSavedGrupoNotas] = useState("");
  const [grupoNotas, setGrupoNotasState] = useState("");
  const [notasActualizadoEn, setNotasActualizadoEn] = useState<string | null>(null);
  const [notasEstado, setNotasEstado] = useState<
    "sin-cambios" | "cambios-sin-guardar" | "guardando" | "guardado" | "error"
  >("sin-cambios");
  const [notasError, setNotasError] = useState("");

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

  useEffect(() => {
    const notasGuardadas = typeof grupo?.notasPersonales === "string" ? grupo.notasPersonales : "";
    const notasActualizadas =
      typeof grupo?.notasActualizadoEn === "string" ? grupo.notasActualizadoEn : null;

    setSavedGrupoNotas(notasGuardadas);
    setGrupoNotasState(notasGuardadas);
    setNotasActualizadoEn(notasActualizadas);
    setNotasEstado("sin-cambios");
    setNotasError("");
  }, [grupo?.id, grupo?.notasPersonales, grupo?.notasActualizadoEn]);

  const setGrupoNotas = useCallback(
    (value: string) => {
      setGrupoNotasState(value);
      setNotasEstado(value === savedGrupoNotas ? "sin-cambios" : "cambios-sin-guardar");
      setNotasError("");
    },
    [savedGrupoNotas]
  );

  const descartarCambiosNotas = useCallback(() => {
    setGrupoNotasState(savedGrupoNotas);
    setNotasEstado("sin-cambios");
    setNotasError("");
  }, [savedGrupoNotas]);

  const guardarNotasGrupo = useCallback(async () => {
    if (grupoNotas === savedGrupoNotas) {
      setNotasEstado("sin-cambios");
      return;
    }

    try {
      setNotasEstado("guardando");
      setNotasError("");
      const nowIso = new Date().toISOString();

      await actualizarGrupo(grupoId, {
        notasPersonales: grupoNotas,
        notasActualizadoEn: nowIso,
      });

      setSavedGrupoNotas(grupoNotas);
      setNotasActualizadoEn(nowIso);
      setNotasEstado("guardado");
    } catch {
      setNotasEstado("error");
      setNotasError("No se pudieron guardar las notas. Intenta nuevamente.");
    }
  }, [actualizarGrupo, grupoId, grupoNotas, savedGrupoNotas]);

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
