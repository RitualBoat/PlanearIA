import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PlaneacionDocumento, Sesion } from "../../types/planeacionV2";
import {
  autocompletarSeccion as autocompletarSeccionService,
  generarEvaluacion as generarEvaluacionService,
  mejorarTexto as mejorarTextoService,
  revisarAlineamiento as revisarAlineamientoService,
  sugerirActividades as sugerirActividadesService,
  type AutocompletarSeccionResultado,
  type CopilotoAccion,
  type CopilotoResponse,
  type CopilotoResultado,
  type GenerarEvaluacionResultado,
  type MejorarTextoResultado,
  type RevisarAlineamientoResultado,
  type SugerirActividadesResultado,
} from "../services/copilotoService";

const CACHE_KEY = "@planearia:copiloto_recent_results";
const CACHE_LIMIT = 8;

export interface CopilotoCacheItem {
  id: string;
  accion: CopilotoAccion;
  resultado: CopilotoResultado;
  createdAt: string;
}

export interface UseCopilotoResult {
  isLoading: boolean;
  loadingAction: CopilotoAccion | null;
  resultado: CopilotoResultado | null;
  error: string | null;
  recientes: CopilotoCacheItem[];
  limpiarResultado: () => void;
  sugerirActividades: (
    documento: PlaneacionDocumento,
    sesion?: Sesion
  ) => Promise<CopilotoResponse<SugerirActividadesResultado>>;
  autocompletarSeccion: (
    documento: PlaneacionDocumento,
    seccion: string
  ) => Promise<CopilotoResponse<AutocompletarSeccionResultado>>;
  generarEvaluacion: (
    documento: PlaneacionDocumento
  ) => Promise<CopilotoResponse<GenerarEvaluacionResultado>>;
  revisarAlineamiento: (
    documento: PlaneacionDocumento
  ) => Promise<CopilotoResponse<RevisarAlineamientoResultado>>;
  mejorarTexto: (
    documento: PlaneacionDocumento,
    texto: string,
    seccion?: string
  ) => Promise<CopilotoResponse<MejorarTextoResultado>>;
}

const safeParseCache = (value: string | null): CopilotoCacheItem[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as CopilotoCacheItem[]) : [];
  } catch {
    return [];
  }
};

export const useCopiloto = (): UseCopilotoResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<CopilotoAccion | null>(null);
  const [resultado, setResultado] = useState<CopilotoResultado | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recientes, setRecientes] = useState<CopilotoCacheItem[]>([]);

  useEffect(() => {
    const load = async () => {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      setRecientes(safeParseCache(raw));
    };
    void load();
  }, []);

  const remember = useCallback(async (accion: CopilotoAccion, nextResultado: CopilotoResultado) => {
    const item: CopilotoCacheItem = {
      id: `${accion}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      accion,
      resultado: nextResultado,
      createdAt: new Date().toISOString(),
    };
    const next = [item, ...recientes].slice(0, CACHE_LIMIT);
    setRecientes(next);
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(next));
  }, [recientes]);

  const run = useCallback(
    async <T extends CopilotoResultado>(
      accion: CopilotoAccion,
      task: () => Promise<CopilotoResponse<T>>
    ): Promise<CopilotoResponse<T>> => {
      setIsLoading(true);
      setLoadingAction(accion);
      setError(null);

      try {
        const response = await task();
        setResultado(response.resultado);
        await remember(accion, response.resultado);
        return response;
      } catch (caught) {
        const message =
          caught instanceof Error
            ? caught.message
            : "No se pudo completar la accion del copiloto.";
        setError(message);
        throw new Error(message);
      } finally {
        setIsLoading(false);
        setLoadingAction(null);
      }
    },
    [remember]
  );

  const limpiarResultado = useCallback(() => {
    setResultado(null);
    setError(null);
  }, []);

  const sugerirActividades = useCallback(
    (documento: PlaneacionDocumento, sesion?: Sesion) =>
      run("sugerir_actividades", () => sugerirActividadesService(documento, sesion)),
    [run]
  );

  const autocompletarSeccion = useCallback(
    (documento: PlaneacionDocumento, seccion: string) =>
      run("autocompletar_seccion", () => autocompletarSeccionService(documento, seccion)),
    [run]
  );

  const generarEvaluacion = useCallback(
    (documento: PlaneacionDocumento) =>
      run("generar_evaluacion", () => generarEvaluacionService(documento)),
    [run]
  );

  const revisarAlineamiento = useCallback(
    (documento: PlaneacionDocumento) =>
      run("revisar_alineamiento", () => revisarAlineamientoService(documento)),
    [run]
  );

  const mejorarTexto = useCallback(
    (documento: PlaneacionDocumento, texto: string, seccion?: string) =>
      run("mejorar_texto", () => mejorarTextoService(documento, texto, seccion)),
    [run]
  );

  return {
    isLoading,
    loadingAction,
    resultado,
    error,
    recientes,
    limpiarResultado,
    sugerirActividades,
    autocompletarSeccion,
    generarEvaluacion,
    revisarAlineamiento,
    mejorarTexto,
  };
};

export default useCopiloto;
