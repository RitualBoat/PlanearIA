import { useCallback, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { Alumno, ComentarioAlumno } from "../../types";
import type { RootStackParamList } from "../navigation/StackNavigator";
import { API_CONFIG, isAPIConfigured } from "../sync/config/apiConfig";

const COMENTARIOS_STORAGE_KEY = "@planearia:comentarios_alumno";
const ALUMNOS_STORAGE_KEY = "@planearia:alumnos";

type Nav = StackNavigationProp<RootStackParamList, "NotasAlumno">;
type Route = RouteProp<RootStackParamList, "NotasAlumno">;

export type EstadoNotasAlumno = "loading" | "success" | "empty" | "error";
export type FiltroNotasAlumno = "todas" | "recientes" | "importantes";
export type CategoriaNotaAlumno = "academico" | "conductual" | "logro";

export interface NotaAlumnoItem extends ComentarioAlumno {
  fechaDate: Date;
}

interface SyncResult {
  ok: boolean;
}

const parseArray = <T>(raw: string | null): T[] => {
  if (!raw) return [];
  const parsed = JSON.parse(raw) as unknown;
  return Array.isArray(parsed) ? (parsed as T[]) : [];
};

const apiRequest = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "X-API-Key": API_CONFIG.apiSecret,
    ...options.headers,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

  try {
    const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

const syncComentarioRemoto = async (
  type: "create" | "update" | "delete",
  payload: Partial<ComentarioAlumno>
): Promise<SyncResult> => {
  if (!isAPIConfigured()) {
    return { ok: true };
  }

  try {
    if (type === "delete") {
      await apiRequest(`/api/comentarios-alumno?id=${payload.id}`, { method: "DELETE" });
      return { ok: true };
    }

    await apiRequest("/api/comentarios-alumno", {
      method: type === "create" ? "POST" : "PUT",
      body: JSON.stringify(payload),
    });

    return { ok: true };
  } catch {
    return { ok: false };
  }
};

const toDate = (value: unknown): Date => {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") return new Date(value);
  return new Date();
};

const normalizeNota = (item: ComentarioAlumno): NotaAlumnoItem => ({
  ...item,
  fechaDate: toDate(item.fecha),
});

export interface UseNotasAlumnoViewModel {
  alumnoId: number;
  alumnoNombre: string;
  grupoNombre: string;
  estado: EstadoNotasAlumno;
  errorCodigo: string;
  guardando: boolean;
  notaDraft: string;
  categoria: CategoriaNotaAlumno;
  filtro: FiltroNotasAlumno;
  notas: NotaAlumnoItem[];
  totalNotas: number;
  notaEnEdicionId: number | null;
  contador: number;
  maxCaracteres: number;
  syncMensaje: string;
  setNotaDraft: (value: string) => void;
  setCategoria: (value: CategoriaNotaAlumno) => void;
  setFiltro: (value: FiltroNotasAlumno) => void;
  guardarNota: () => Promise<boolean>;
  iniciarEdicion: (notaId: number) => void;
  cancelarEdicion: () => void;
  eliminarNota: (notaId: number) => Promise<void>;
  recargar: () => Promise<void>;
  goBack: () => void;
}

export const useNotasAlumnoViewModel = (): UseNotasAlumnoViewModel => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();

  const { alumnoId, alumnoNombre: alumnoNombreParam } = route.params;

  const [alumnoNombre, setAlumnoNombre] = useState(alumnoNombreParam || "Alumno");
  const [grupoNombre, setGrupoNombre] = useState("Grupo sin asignar");
  const [estado, setEstado] = useState<EstadoNotasAlumno>("loading");
  const [errorCodigo, setErrorCodigo] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [notaDraft, setNotaDraftState] = useState("");
  const [categoria, setCategoria] = useState<CategoriaNotaAlumno>("academico");
  const [filtro, setFiltro] = useState<FiltroNotasAlumno>("todas");
  const [notasAlumno, setNotasAlumno] = useState<NotaAlumnoItem[]>([]);
  const [notasGlobales, setNotasGlobales] = useState<ComentarioAlumno[]>([]);
  const [notaEnEdicionId, setNotaEnEdicionId] = useState<number | null>(null);
  const [syncMensaje, setSyncMensaje] = useState("");

  const maxCaracteres = 500;

  const setNotaDraft = useCallback(
    (value: string) => {
      if (value.length <= maxCaracteres) {
        setNotaDraftState(value);
      }
    },
    [maxCaracteres]
  );

  const hydrateFromStorage = useCallback(async () => {
    const [alumnosRaw, comentariosRaw] = await Promise.all([
      AsyncStorage.getItem(ALUMNOS_STORAGE_KEY),
      AsyncStorage.getItem(COMENTARIOS_STORAGE_KEY),
    ]);

    const alumnos = parseArray<Alumno>(alumnosRaw);
    const comentarios = parseArray<ComentarioAlumno>(comentariosRaw);

    const alumno = alumnos.find((item) => item.id === alumnoId);
    if (alumno) {
      const fullName = `${alumno.nombre || ""} ${alumno.apellidos || ""}`.trim();
      setAlumnoNombre(fullName.length > 0 ? fullName : alumnoNombreParam || "Alumno");
      setGrupoNombre(alumno.grupoId ? `Grupo ${alumno.grupoId}` : "Grupo sin asignar");
    }

    const filtradas = comentarios
      .filter((item) => item.alumnoId === alumnoId)
      .map((item) => normalizeNota(item))
      .sort((a, b) => b.fechaDate.getTime() - a.fechaDate.getTime());

    setNotasGlobales(comentarios);
    setNotasAlumno(filtradas);
    setEstado(filtradas.length > 0 ? "success" : "empty");
  }, [alumnoId, alumnoNombreParam]);

  const recargar = useCallback(async () => {
    try {
      setEstado("loading");
      setErrorCodigo("");
      await hydrateFromStorage();
    } catch {
      setErrorCodigo("503_ATELIER_SYNC");
      setEstado("error");
    }
  }, [hydrateFromStorage]);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  const notasFiltradas = useMemo(() => {
    if (filtro === "todas") return notasAlumno;

    if (filtro === "recientes") {
      const now = Date.now();
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      return notasAlumno.filter((item) => now - item.fechaDate.getTime() <= sevenDaysMs);
    }

    return notasAlumno.filter((item) => item.tipo === "logro" || item.tipo === "area_mejora");
  }, [filtro, notasAlumno]);

  const persistNotas = useCallback(
    async (nextNotasGlobales: ComentarioAlumno[]) => {
      await AsyncStorage.setItem(COMENTARIOS_STORAGE_KEY, JSON.stringify(nextNotasGlobales));

      const nextAlumnoNotas = nextNotasGlobales
        .filter((item) => item.alumnoId === alumnoId)
        .map((item) => normalizeNota(item))
        .sort((a, b) => b.fechaDate.getTime() - a.fechaDate.getTime());

      setNotasGlobales(nextNotasGlobales);
      setNotasAlumno(nextAlumnoNotas);
      setEstado(nextAlumnoNotas.length > 0 ? "success" : "empty");
    },
    [alumnoId]
  );

  const guardarNota = useCallback(async (): Promise<boolean> => {
    const texto = notaDraft.trim();
    if (texto.length === 0) {
      return false;
    }

    setGuardando(true);
    setSyncMensaje("");

    try {
      const nowDate = new Date();
      const nowIso = nowDate.toISOString();
      let nextNotasGlobales = [...notasGlobales];

      if (notaEnEdicionId) {
        nextNotasGlobales = nextNotasGlobales.map((item) =>
          item.id === notaEnEdicionId
            ? {
                ...item,
                comentario: texto,
                tipo: categoria,
                fecha: nowDate,
              }
            : item
        );

        await persistNotas(nextNotasGlobales);
        const syncResult = await syncComentarioRemoto("update", {
          id: notaEnEdicionId,
          alumnoId,
          comentario: texto,
          tipo: categoria,
          fecha: nowDate,
        });

        if (!syncResult.ok) {
          setSyncMensaje(
            "Tus cambios locales están a salvo. Se sincronizarán cuando haya conexión."
          );
        }
      } else {
        const nextId =
          nextNotasGlobales.reduce((maxId, item) => Math.max(maxId, Number(item.id) || 0), 0) + 1;

        const nuevaNota: ComentarioAlumno = {
          id: nextId,
          alumnoId,
          grupoId: 0,
          profesorId: 1,
          comentario: texto,
          tipo: categoria,
          privado: true,
          fecha: nowDate,
        };

        nextNotasGlobales.push(nuevaNota);

        await persistNotas(nextNotasGlobales);
        const syncResult = await syncComentarioRemoto("create", nuevaNota);

        if (!syncResult.ok) {
          setSyncMensaje("Tus borradores locales están a salvo. Se sincronizarán al reconectar.");
        }
      }

      setNotaDraftState("");
      setNotaEnEdicionId(null);
      setCategoria("academico");
      return true;
    } catch {
      setErrorCodigo("503_ATELIER_SYNC");
      setEstado("error");
      return false;
    } finally {
      setGuardando(false);
    }
  }, [alumnoId, categoria, notaDraft, notaEnEdicionId, notasGlobales, persistNotas]);

  const iniciarEdicion = useCallback(
    (notaId: number) => {
      const nota = notasAlumno.find((item) => item.id === notaId);
      if (!nota) return;
      setNotaEnEdicionId(notaId);
      setNotaDraftState(nota.comentario);
      if (nota.tipo === "conductual" || nota.tipo === "logro" || nota.tipo === "academico") {
        setCategoria(nota.tipo);
      } else {
        setCategoria("academico");
      }
    },
    [notasAlumno]
  );

  const cancelarEdicion = useCallback(() => {
    setNotaEnEdicionId(null);
    setNotaDraftState("");
    setCategoria("academico");
  }, []);

  const eliminarNota = useCallback(
    async (notaId: number) => {
      setSyncMensaje("");
      const next = notasGlobales.filter((item) => item.id !== notaId);
      await persistNotas(next);
      const syncResult = await syncComentarioRemoto("delete", { id: notaId });
      if (!syncResult.ok) {
        setSyncMensaje("Los cambios se guardaron localmente. Se sincronizarán más tarde.");
      }

      if (notaEnEdicionId === notaId) {
        cancelarEdicion();
      }
    },
    [cancelarEdicion, notaEnEdicionId, notasGlobales, persistNotas]
  );

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return {
    alumnoId,
    alumnoNombre,
    grupoNombre,
    estado,
    errorCodigo,
    guardando,
    notaDraft,
    categoria,
    filtro,
    notas: notasFiltradas,
    totalNotas: notasAlumno.length,
    notaEnEdicionId,
    contador: notaDraft.length,
    maxCaracteres,
    syncMensaje,
    setNotaDraft,
    setCategoria,
    setFiltro,
    guardarNota,
    iniciarEdicion,
    cancelarEdicion,
    eliminarNota,
    recargar,
    goBack,
  };
};
