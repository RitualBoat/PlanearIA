import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";
import {
  type Planeacion,
  type FiltrosPlaneacion,
  type PlaneacionBase,
  type PlaneacionPrimaria,
  type PlaneacionSecundaria,
  type PlaneacionPreparatoria,
  type PlaneacionUniversidad,
  type Actividad,
  NivelAcademico as NivelAcademicoLegacy,
} from "../../types/planeacionLegacy";
import {
  type PlaneacionDocumento,
  type FiltrosPlaneacionV2,
  type Sesion,
  type InstrumentoEvaluacion,
  type Observacion,
  NivelAcademico,
} from "../../types/planeacionV2";
import { migrateV1toV2 } from "../utils/migrateV1toV2";
import {
  enqueueOperation,
  flushQueue,
  getPendingOps,
} from "../sync/services/syncEngine";
import {
  canSyncRemotely,
  reconcileWithPending,
  registerSyncTask,
} from "../sync/services/entitySync";
import { getIsOnline, subscribeConnectivity } from "../sync/services/connectivity";
import { apiRequest } from "../utils/apiClient";
import { STORAGE_KEYS, isAPIConfigured } from "../sync/config/apiConfig";
import logger from "../utils/logger";
import { isNetworkRequestError } from "../utils/networkErrors";

const PLANEACIONES_V2_KEY = "@planearia:planeaciones_v2";
const LAST_SYNC_V2_KEY = "@planearia:last_sync_planeaciones_v2";

interface PlaneacionesContextData {
  documentos: PlaneacionDocumento[];
  planeaciones: Planeacion[];
  planeacionActual: Planeacion | null;
  isLoading: boolean;

  crear: (doc: PlaneacionDocumento) => Promise<void>;
  actualizar: (id: string, updates: Partial<PlaneacionDocumento>) => Promise<void>;
  eliminar: (id: string) => Promise<void>;
  clonar: (id: string) => Promise<void>;
  buscar: (query: string) => PlaneacionDocumento[];
  filtrarDocumentos: (filtros: FiltrosPlaneacionV2) => PlaneacionDocumento[];
  obtenerDocumento: (id: string) => PlaneacionDocumento | undefined;

  agregarPlaneacion: (planeacion: Planeacion | PlaneacionDocumento) => Promise<void>;
  actualizarPlaneacion: (id: string, updates: Partial<Planeacion>) => Promise<void>;
  eliminarPlaneacion: (id: string) => Promise<void>;
  obtenerPlaneacion: (id: string) => Planeacion | undefined;
  clonarPlaneacion: (id: string) => Promise<void>;
  filtrarPlaneaciones: (filtros: FiltrosPlaneacion) => Planeacion[];
  setPlaneacionActual: (planeacion: Planeacion | null) => void;
  limpiarPlaneaciones: () => Promise<void>;
  reloadFromStorage: () => Promise<void>;

  syncStatus: "idle" | "syncing" | "synced" | "error" | "offline";
  isOnline: boolean;
  pendingCount: number;
  lastSync: string | null;
  forceSync: () => Promise<void>;
  isSyncConfigured: boolean;
}

const PlaneacionesContext = createContext<PlaneacionesContextData | undefined>(undefined);

const splitLines = (value: string | undefined): string[] => {
  if (!value) return [];
  return value
    .split(/\n|;/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const stripRichText = (value: string | undefined): string => {
  if (!value) return "";
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const toNivelV2 = (nivel: NivelAcademicoLegacy): NivelAcademico => {
  if (nivel === NivelAcademicoLegacy.SECUNDARIA) return NivelAcademico.SECUNDARIA;
  if (nivel === NivelAcademicoLegacy.PREPARATORIA) return NivelAcademico.PREPARATORIA;
  if (nivel === NivelAcademicoLegacy.UNIVERSIDAD) return NivelAcademico.UNIVERSIDAD;
  return NivelAcademico.PRIMARIA;
};

const ensureSesion = (doc: PlaneacionDocumento, numero: number): Sesion => {
  const existing = doc.sesiones.find((s) => s.numero === numero);
  if (existing) return existing;
  return {
    id: `session_${numero}_${Date.now()}`,
    numero,
    tipo: "regular",
    inicio: "",
    desarrollo: "",
    cierre: "",
    tarea: "",
  };
};

const toLegacyFromV2 = (doc: PlaneacionDocumento): Planeacion => {
  const sesion1 = doc.sesiones.find((s) => s.numero === 1) ?? doc.sesiones[0];
  const observaciones = (doc.observaciones || [])
    .map((obs) => obs.texto)
    .filter(Boolean)
    .join("\n");

  const recursos = Array.isArray(doc.camposNivel?.recursos)
    ? (doc.camposNivel?.recursos as string[])
    : [];

  const evaluacionTexto =
    doc.elementosCurriculares.instrumentoEvaluacion ||
    doc.evaluacionFinal?.criterios?.map((c) => c.descripcion).join("; ") ||
    "";

  const base: PlaneacionBase = {
    id: doc.id,
    nivelAcademico:
      (doc.nivelAcademico as unknown as NivelAcademicoLegacy) || NivelAcademicoLegacy.PRIMARIA,
    asignatura: doc.datosGenerales.asignatura || "",
    grado: doc.datosGenerales.grado || "",
    grupo: doc.datosGenerales.grupos?.[0] || "",
    fecha: doc.datosGenerales.fechaInicio || doc.fechaCreacion,
    horaInicio:
      (typeof doc.camposNivel?.horaInicio === "string"
        ? (doc.camposNivel.horaInicio as string)
        : "") || "08:00",
    duracionTotal:
      typeof doc.camposNivel?.duracionTotal === "number"
        ? (doc.camposNivel.duracionTotal as number)
        : 50,
    unidadTematica: doc.elementosCurriculares.contenido || "",
    temaSesion: doc.elementosCurriculares.pda || doc.elementosCurriculares.contenido || "",
    aprendizajesEsperados: splitLines(doc.elementosCurriculares.proposito),
    actividades: [
      { tipo: "inicio", descripcion: stripRichText(sesion1?.inicio), duracion: 10 },
      { tipo: "desarrollo", descripcion: stripRichText(sesion1?.desarrollo), duracion: 30 },
      { tipo: "cierre", descripcion: stripRichText(sesion1?.cierre), duracion: 10 },
    ],
    recursos,
    evaluacion: evaluacionTexto,
    evidencias: doc.elementosCurriculares.producto
      ? splitLines(doc.elementosCurriculares.producto)
      : [],
    observaciones,
    fechaCreacion: doc.fechaCreacion,
    fechaModificacion: doc.fechaModificacion,
  };

  if (doc.nivelAcademico === NivelAcademico.PRIMARIA) {
    const plan: PlaneacionPrimaria = {
      ...base,
      nivelAcademico: NivelAcademicoLegacy.PRIMARIA,
      campoFormativo: doc.elementosCurriculares.campoFormativo || "",
      ejeTransversal:
        typeof doc.camposNivel?.ejeTransversal === "string"
          ? (doc.camposNivel.ejeTransversal as string)
          : undefined,
    };
    return plan;
  }

  if (doc.nivelAcademico === NivelAcademico.SECUNDARIA) {
    const plan: PlaneacionSecundaria = {
      ...base,
      nivelAcademico: NivelAcademicoLegacy.SECUNDARIA,
      competenciasDisciplinares: Array.isArray(doc.camposNivel?.competenciasDisciplinares)
        ? (doc.camposNivel.competenciasDisciplinares as string[])
        : [],
      productoFinal:
        typeof doc.camposNivel?.productoFinal === "string"
          ? (doc.camposNivel.productoFinal as string)
          : undefined,
    };
    return plan;
  }

  if (doc.nivelAcademico === NivelAcademico.PREPARATORIA) {
    const plan: PlaneacionPreparatoria = {
      ...base,
      nivelAcademico: NivelAcademicoLegacy.PREPARATORIA,
      competenciasGenericas: Array.isArray(doc.camposNivel?.competenciasGenericas)
        ? (doc.camposNivel.competenciasGenericas as string[])
        : [],
      competenciasDisciplinares: Array.isArray(doc.camposNivel?.competenciasDisciplinares)
        ? (doc.camposNivel.competenciasDisciplinares as string[])
        : [],
      bibliografia: Array.isArray(doc.camposNivel?.bibliografia)
        ? (doc.camposNivel.bibliografia as string[])
        : undefined,
    };
    return plan;
  }

  const plan: PlaneacionUniversidad = {
    ...base,
    nivelAcademico: NivelAcademicoLegacy.UNIVERSIDAD,
    competenciasProfesionales: Array.isArray(doc.camposNivel?.competenciasProfesionales)
      ? (doc.camposNivel.competenciasProfesionales as string[])
      : [],
    objetivosAprendizaje: Array.isArray(doc.camposNivel?.objetivosAprendizaje)
      ? (doc.camposNivel.objetivosAprendizaje as string[])
      : [],
    bibliografia: Array.isArray(doc.camposNivel?.bibliografia)
      ? (doc.camposNivel.bibliografia as string[])
      : [],
    modalidad:
      (doc.camposNivel?.modalidad as "presencial" | "hibrida" | "virtual" | undefined) ||
      "presencial",
    configuracionCurso:
      doc.camposNivel?.configuracionCurso && typeof doc.camposNivel.configuracionCurso === "object"
        ? (doc.camposNivel.configuracionCurso as PlaneacionUniversidad["configuracionCurso"])
        : undefined,
    semanas:
      Array.isArray(doc.camposNivel?.semanas) && doc.camposNivel.semanas.length > 0
        ? (doc.camposNivel.semanas as PlaneacionUniversidad["semanas"])
        : undefined,
    evaluaciones:
      Array.isArray(doc.camposNivel?.evaluaciones) && doc.camposNivel.evaluaciones.length > 0
        ? (doc.camposNivel.evaluaciones as PlaneacionUniversidad["evaluaciones"])
        : undefined,
  };
  return plan;
};

const toV2FromLegacy = (planeacion: Planeacion, userId: string): PlaneacionDocumento => {
  const migrated = migrateV1toV2(planeacion, userId);

  const camposNivel: Record<string, unknown> = {
    horaInicio: planeacion.horaInicio,
    duracionTotal: planeacion.duracionTotal,
    recursos: planeacion.recursos || [],
  };

  if (planeacion.nivelAcademico === NivelAcademicoLegacy.PRIMARIA) {
    camposNivel.ejeTransversal = (planeacion as PlaneacionPrimaria).ejeTransversal;
  } else if (planeacion.nivelAcademico === NivelAcademicoLegacy.SECUNDARIA) {
    camposNivel.competenciasDisciplinares =
      (planeacion as PlaneacionSecundaria).competenciasDisciplinares || [];
    camposNivel.productoFinal = (planeacion as PlaneacionSecundaria).productoFinal;
  } else if (planeacion.nivelAcademico === NivelAcademicoLegacy.PREPARATORIA) {
    camposNivel.competenciasGenericas =
      (planeacion as PlaneacionPreparatoria).competenciasGenericas || [];
    camposNivel.competenciasDisciplinares =
      (planeacion as PlaneacionPreparatoria).competenciasDisciplinares || [];
    camposNivel.bibliografia = (planeacion as PlaneacionPreparatoria).bibliografia || [];
  } else if (planeacion.nivelAcademico === NivelAcademicoLegacy.UNIVERSIDAD) {
    const u = planeacion as PlaneacionUniversidad;
    camposNivel.competenciasProfesionales = u.competenciasProfesionales || [];
    camposNivel.objetivosAprendizaje = u.objetivosAprendizaje || [];
    camposNivel.bibliografia = u.bibliografia || [];
    camposNivel.modalidad = u.modalidad || "presencial";
    camposNivel.configuracionCurso = u.configuracionCurso;
    camposNivel.semanas = u.semanas;
    camposNivel.evaluaciones = u.evaluaciones;
  }

  return {
    ...migrated,
    version: 2,
    userId,
    nivelAcademico: toNivelV2(planeacion.nivelAcademico),
    camposNivel,
  };
};

const normalizeInputToV2 = (
  input: Planeacion | PlaneacionDocumento,
  userId: string
): PlaneacionDocumento => {
  if ("version" in input && input.version === 2) {
    return {
      ...input,
      version: 2,
      userId: input.userId || userId,
      fechaCreacion: input.fechaCreacion || new Date().toISOString(),
      fechaModificacion: input.fechaModificacion || new Date().toISOString(),
    };
  }
  return toV2FromLegacy(input as Planeacion, userId);
};

const normalizeEvaluacion = (value: string): InstrumentoEvaluacion | undefined => {
  const text = value.trim();
  if (!text) return undefined;
  return {
    tipo: "otro",
    escala: [],
    criterios: [{ id: `crit_${Date.now()}`, descripcion: text }],
  };
};

const normalizeObservaciones = (value: string): Observacion[] => {
  const lines = splitLines(value);
  return lines.map((texto) => ({ texto, categoria: "general" }));
};

const patchDocumentWithLegacyUpdates = (
  current: PlaneacionDocumento,
  updates: Partial<Planeacion>
): PlaneacionDocumento => {
  const next: PlaneacionDocumento = {
    ...current,
    datosGenerales: { ...current.datosGenerales },
    elementosCurriculares: { ...current.elementosCurriculares },
    sesiones: current.sesiones.map((s) => ({ ...s })),
    observaciones: current.observaciones.map((o) => ({ ...o })),
    camposNivel: { ...(current.camposNivel || {}) },
  };

  if (typeof updates.asignatura === "string") next.datosGenerales.asignatura = updates.asignatura;
  if (typeof updates.grado === "string") next.datosGenerales.grado = updates.grado;
  if (typeof updates.grupo === "string")
    next.datosGenerales.grupos = updates.grupo ? [updates.grupo] : [];
  if (typeof updates.fecha === "string") {
    next.datosGenerales.fechaInicio = updates.fecha;
    next.datosGenerales.fechaFin = updates.fecha;
  }
  if (typeof updates.horaInicio === "string")
    next.camposNivel = { ...next.camposNivel, horaInicio: updates.horaInicio };
  if (typeof updates.duracionTotal === "number")
    next.camposNivel = { ...next.camposNivel, duracionTotal: updates.duracionTotal };
  if (typeof updates.unidadTematica === "string")
    next.elementosCurriculares.contenido = updates.unidadTematica;
  if (typeof updates.temaSesion === "string") next.elementosCurriculares.pda = updates.temaSesion;
  if (Array.isArray(updates.aprendizajesEsperados))
    next.elementosCurriculares.proposito = updates.aprendizajesEsperados.join("\n");
  if (Array.isArray(updates.recursos))
    next.camposNivel = { ...next.camposNivel, recursos: updates.recursos };
  if (typeof updates.evaluacion === "string") {
    next.elementosCurriculares.instrumentoEvaluacion = updates.evaluacion;
    next.evaluacionFinal = normalizeEvaluacion(updates.evaluacion);
  }
  if (Array.isArray(updates.evidencias))
    next.elementosCurriculares.producto = updates.evidencias.join("\n");
  if (typeof updates.observaciones === "string")
    next.observaciones = normalizeObservaciones(updates.observaciones);

  if (Array.isArray(updates.actividades) && updates.actividades.length > 0) {
    const sesion = ensureSesion(next, 1);
    const byType = new Map<Actividad["tipo"], Actividad>();
    updates.actividades.forEach((a) => byType.set(a.tipo, a));

    const patchedSesion: Sesion = {
      ...sesion,
      inicio: byType.get("inicio")?.descripcion || sesion.inicio || "",
      desarrollo: byType.get("desarrollo")?.descripcion || sesion.desarrollo || "",
      cierre: byType.get("cierre")?.descripcion || sesion.cierre || "",
    };

    next.sesiones = next.sesiones.some((s) => s.id === sesion.id)
      ? next.sesiones.map((s) => (s.id === sesion.id ? patchedSesion : s))
      : [...next.sesiones, patchedSesion];
  }

  if (typeof (updates as PlaneacionPrimaria).campoFormativo === "string") {
    next.elementosCurriculares.campoFormativo = (updates as PlaneacionPrimaria).campoFormativo;
  }

  if (Array.isArray((updates as PlaneacionSecundaria).competenciasDisciplinares)) {
    next.camposNivel = {
      ...next.camposNivel,
      competenciasDisciplinares: (updates as PlaneacionSecundaria).competenciasDisciplinares,
    };
  }

  if (Array.isArray((updates as PlaneacionPreparatoria).competenciasGenericas)) {
    next.camposNivel = {
      ...next.camposNivel,
      competenciasGenericas: (updates as PlaneacionPreparatoria).competenciasGenericas,
    };
  }

  if (Array.isArray((updates as PlaneacionUniversidad).competenciasProfesionales)) {
    next.camposNivel = {
      ...next.camposNivel,
      competenciasProfesionales: (updates as PlaneacionUniversidad).competenciasProfesionales,
    };
  }

  if (Array.isArray((updates as PlaneacionUniversidad).objetivosAprendizaje)) {
    next.camposNivel = {
      ...next.camposNivel,
      objetivosAprendizaje: (updates as PlaneacionUniversidad).objetivosAprendizaje,
    };
  }

  if (Array.isArray((updates as PlaneacionUniversidad).bibliografia)) {
    next.camposNivel = {
      ...next.camposNivel,
      bibliografia: (updates as PlaneacionUniversidad).bibliografia,
    };
  }

  if (typeof (updates as PlaneacionUniversidad).modalidad === "string") {
    next.camposNivel = {
      ...next.camposNivel,
      modalidad: (updates as PlaneacionUniversidad).modalidad,
    };
  }

  next.fechaModificacion = new Date().toISOString();
  return next;
};

const sanitizeServerDoc = (raw: any): PlaneacionDocumento => {
  const { _id, ...rest } = raw || {};
  return rest as PlaneacionDocumento;
};

export const PlaneacionesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { usuario, isLoading: authLoading } = useAuth();
  const userId = String(usuario?.id ?? "guest");

  const [documentos, setDocumentos] = useState<PlaneacionDocumento[]>([]);
  const [planeacionActual, setPlaneacionActual] = useState<Planeacion | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced" | "error" | "offline">(
    "idle"
  );
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const isSyncConfigured = isAPIConfigured();

  const refreshPendingCount = useCallback(async () => {
    const pending = await getPendingOps<PlaneacionDocumento>("planeaciones");
    setPendingCount(pending.length);
  }, []);

  const saveLocal = useCallback(async (docs: PlaneacionDocumento[]) => {
    await AsyncStorage.setItem(PLANEACIONES_V2_KEY, JSON.stringify(docs));
  }, []);

  const loadFromStorage = useCallback(async () => {
    setIsLoading(true);
    try {
      const [v2Raw, legacyRaw, syncRaw] = await Promise.all([
        AsyncStorage.getItem(PLANEACIONES_V2_KEY),
        AsyncStorage.getItem(STORAGE_KEYS.PLANEACIONES),
        AsyncStorage.getItem(LAST_SYNC_V2_KEY),
      ]);

      const v2Parsed = v2Raw ? (JSON.parse(v2Raw) as Array<PlaneacionDocumento | Planeacion>) : [];
      const legacyParsed = legacyRaw ? (JSON.parse(legacyRaw) as Planeacion[]) : [];

      let docs: PlaneacionDocumento[] = [];

      if (v2Parsed.length > 0) {
        docs = v2Parsed.map((item) =>
          normalizeInputToV2(item as Planeacion | PlaneacionDocumento, userId)
        );
      } else if (legacyParsed.length > 0) {
        docs = legacyParsed.map((item) => toV2FromLegacy(item, userId));
      }

      docs = docs
        .map((doc) => ({ ...doc, userId: doc.userId || userId, version: 2 as const }))
        .filter((doc) => doc.userId === userId);

      await saveLocal(docs);
      setDocumentos(docs);
      setLastSync(syncRaw);
      await refreshPendingCount();
    } catch (error) {
      logger.error("[planeaciones-context] Error cargando storage", error);
      setDocumentos([]);
    } finally {
      setIsLoading(false);
    }
  }, [refreshPendingCount, saveLocal, userId]);

  const upsertLocalAndQueue = useCallback(
    async (
      nextDocs: PlaneacionDocumento[],
      type: "create" | "update" | "delete",
      payload: PlaneacionDocumento | { id: string; userId: string }
    ) => {
      await saveLocal(nextDocs);
      setDocumentos(nextDocs);
      await enqueueOperation("planeaciones", "/api/planeaciones", type, payload);
      await refreshPendingCount();
    },
    [refreshPendingCount, saveLocal]
  );

  const applyRemoteList = useCallback(
    async (remoteDocs: PlaneacionDocumento[]): Promise<boolean> => {
      // Full-list reconcile: the server list is authoritative except for
      // docs with queued local work, so cross-device deletes propagate
      const pending = await getPendingOps("planeaciones");
      const next = reconcileWithPending(documentos, remoteDocs, pending);
      const changed = JSON.stringify(next) !== JSON.stringify(documentos);
      if (changed) {
        await saveLocal(next);
        setDocumentos(next);
      }
      return changed;
    },
    [documentos, saveLocal]
  );

  const runSync = useCallback(async (): Promise<{
    ok: boolean;
    changed: boolean;
    pushed: number;
    pulled: number;
  }> => {
    const outcome = { entity: "planeaciones", ok: true, changed: false, pushed: 0, pulled: 0 };

    if (authLoading || !isSyncConfigured || !(await canSyncRemotely())) {
      setSyncStatus("idle");
      return outcome;
    }

    const connected = await getIsOnline();
    setIsOnline(connected);

    try {
      setSyncStatus("syncing");

      const flushResult = await flushQueue("planeaciones");
      outcome.pushed = flushResult.processed;
      if (!flushResult.success || flushResult.skipped > 0) {
        outcome.ok = false;
      }

      // Full list (not incremental) so deletes on other devices propagate
      const response = await apiRequest("/api/planeaciones?limit=500", { method: "GET" });

      if (response.ok) {
        const data = await response.json();
        const remote = Array.isArray(data?.data?.planeaciones)
          ? (data.data.planeaciones as any[]).map(sanitizeServerDoc)
          : [];
        const normalizedRemote = remote
          .map((doc) => normalizeInputToV2(doc, userId))
          .filter((doc) => doc.userId === userId);
        outcome.pulled = normalizedRemote.length;
        outcome.changed = await applyRemoteList(normalizedRemote);

        const now = new Date().toISOString();
        await AsyncStorage.setItem(LAST_SYNC_V2_KEY, now);
        setLastSync(now);
      } else {
        outcome.ok = false;
      }

      await refreshPendingCount();
      setSyncStatus(outcome.ok ? "synced" : "error");
    } catch (error) {
      outcome.ok = false;
      if (isNetworkRequestError(error)) {
        logger.debug("[planeaciones-context] Backend no disponible en forceSync, modo offline.");
        setIsOnline(false);
        setSyncStatus("offline");
        return outcome;
      }
      logger.error("[planeaciones-context] Error en forceSync", error);
      setSyncStatus("error");
    }

    return outcome;
  }, [authLoading, isSyncConfigured, applyRemoteList, refreshPendingCount, userId]);

  const forceSync = useCallback(async () => {
    await runSync();
  }, [runSync]);

  const crear = useCallback(
    async (doc: PlaneacionDocumento) => {
      const now = new Date().toISOString();
      const normalized = normalizeInputToV2(
        {
          ...doc,
          version: 2,
          userId,
          fechaCreacion: doc.fechaCreacion || now,
          fechaModificacion: now,
        },
        userId
      );
      const nextDocs = [...documentos.filter((item) => item.id !== normalized.id), normalized];
      await upsertLocalAndQueue(nextDocs, "create", normalized);
    },
    [documentos, upsertLocalAndQueue, userId]
  );

  const actualizar = useCallback(
    async (id: string, updates: Partial<PlaneacionDocumento>) => {
      const current = documentos.find((doc) => doc.id === id);
      if (!current) return;

      const updated: PlaneacionDocumento = {
        ...current,
        ...updates,
        version: 2,
        userId: current.userId || userId,
        fechaModificacion: new Date().toISOString(),
      };

      const nextDocs = documentos.map((doc) => (doc.id === id ? updated : doc));
      await upsertLocalAndQueue(nextDocs, "update", updated);
    },
    [documentos, upsertLocalAndQueue, userId]
  );

  const eliminar = useCallback(
    async (id: string) => {
      const current = documentos.find((doc) => doc.id === id);
      if (!current) return;
      const nextDocs = documentos.filter((doc) => doc.id !== id);
      await upsertLocalAndQueue(nextDocs, "delete", {
        id: current.id,
        userId: current.userId || userId,
      });
      if (planeacionActual?.id === id) setPlaneacionActual(null);
    },
    [documentos, planeacionActual?.id, upsertLocalAndQueue, userId]
  );

  const clonar = useCallback(
    async (id: string) => {
      const current = documentos.find((doc) => doc.id === id);
      if (!current) return;
      const now = new Date().toISOString();
      const cloned: PlaneacionDocumento = {
        ...current,
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        version: 2,
        userId,
        fechaCreacion: now,
        fechaModificacion: now,
        elementosCurriculares: {
          ...current.elementosCurriculares,
          pda: `${current.elementosCurriculares.pda || "Planeación"} (Copia)`,
        },
      };
      await crear(cloned);
    },
    [crear, documentos, userId]
  );

  const buscar = useCallback(
    (query: string): PlaneacionDocumento[] => {
      const q = query.trim().toLowerCase();
      if (!q) return documentos;
      return documentos.filter((doc) => {
        const values = [
          doc.datosGenerales.asignatura,
          doc.datosGenerales.grado,
          doc.elementosCurriculares.pda,
          doc.elementosCurriculares.contenido,
          doc.elementosCurriculares.proposito,
          ...doc.observaciones.map((obs) => obs.texto),
        ];
        return values.some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(q)
        );
      });
    },
    [documentos]
  );

  const filtrarDocumentos = useCallback(
    (filtros: FiltrosPlaneacionV2): PlaneacionDocumento[] => {
      return documentos.filter((doc) => {
        if (filtros.nivelAcademico && doc.nivelAcademico !== filtros.nivelAcademico) return false;
        if (
          filtros.asignatura &&
          !doc.datosGenerales.asignatura.toLowerCase().includes(filtros.asignatura.toLowerCase())
        )
          return false;
        if (filtros.grado && doc.datosGenerales.grado !== filtros.grado) return false;
        if (filtros.maestro && doc.datosGenerales.maestro !== filtros.maestro) return false;
        if (filtros.fechaInicio && doc.datosGenerales.fechaInicio < filtros.fechaInicio)
          return false;
        if (filtros.fechaFin && doc.datosGenerales.fechaFin > filtros.fechaFin) return false;
        if (filtros.busqueda && buscar(filtros.busqueda).every((item) => item.id !== doc.id))
          return false;
        return true;
      });
    },
    [buscar, documentos]
  );

  const planeaciones = useMemo(() => documentos.map(toLegacyFromV2), [documentos]);

  const obtenerDocumento = useCallback(
    (id: string): PlaneacionDocumento | undefined => documentos.find((doc) => doc.id === id),
    [documentos]
  );

  const agregarPlaneacion = useCallback(
    async (planeacion: Planeacion | PlaneacionDocumento) => {
      const doc = normalizeInputToV2(planeacion, userId);
      await crear(doc);
    },
    [crear, userId]
  );

  const actualizarPlaneacion = useCallback(
    async (id: string, updates: Partial<Planeacion>) => {
      const current = documentos.find((doc) => doc.id === id);
      if (!current) return;
      const patched = patchDocumentWithLegacyUpdates(current, updates);
      await actualizar(id, patched);
    },
    [actualizar, documentos]
  );

  const eliminarPlaneacion = useCallback(
    async (id: string) => {
      await eliminar(id);
    },
    [eliminar]
  );

  const obtenerPlaneacion = useCallback(
    (id: string): Planeacion | undefined => {
      const doc = obtenerDocumento(id);
      return doc ? toLegacyFromV2(doc) : undefined;
    },
    [obtenerDocumento]
  );

  const clonarPlaneacion = useCallback(
    async (id: string) => {
      await clonar(id);
    },
    [clonar]
  );

  const filtrarPlaneaciones = useCallback(
    (filtros: FiltrosPlaneacion): Planeacion[] => {
      return planeaciones.filter((p) => {
        if (filtros.nivelAcademico && p.nivelAcademico !== filtros.nivelAcademico) return false;
        if (
          filtros.asignatura &&
          !p.asignatura.toLowerCase().includes(filtros.asignatura.toLowerCase())
        )
          return false;
        if (filtros.grado && p.grado !== filtros.grado) return false;
        if (filtros.fechaInicio && p.fecha < filtros.fechaInicio) return false;
        if (filtros.fechaFin && p.fecha > filtros.fechaFin) return false;
        return true;
      });
    },
    [planeaciones]
  );

  const limpiarPlaneaciones = useCallback(async () => {
    setDocumentos([]);
    setPlaneacionActual(null);
    await AsyncStorage.removeItem(PLANEACIONES_V2_KEY);
    await refreshPendingCount();
  }, [refreshPendingCount]);

  const reloadFromStorage = useCallback(async () => {
    await loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (authLoading) return;
    loadFromStorage();
  }, [authLoading, loadFromStorage]);

  // Connectivity for the local badge; the global orchestrator owns the
  // sync cadence (startup, login, reconnect, polling)
  useEffect(() => {
    const unsubscribe = subscribeConnectivity((connected) => {
      setIsOnline(connected);
      if (!connected) setSyncStatus("offline");
    });
    return unsubscribe;
  }, []);

  // Planeaciones joins the orchestrator's sync cycle as a custom task
  useEffect(() => {
    return registerSyncTask("planeaciones", async () => {
      const outcome = await runSync();
      return { entity: "planeaciones", ...outcome };
    });
  }, [runSync]);

  useEffect(() => {
    const interval = setInterval(() => {
      void refreshPendingCount();
    }, 5000);
    return () => clearInterval(interval);
  }, [refreshPendingCount]);

  const value: PlaneacionesContextData = {
    documentos,
    planeaciones,
    planeacionActual,
    isLoading,
    crear,
    actualizar,
    eliminar,
    clonar,
    buscar,
    filtrarDocumentos,
    obtenerDocumento,
    agregarPlaneacion,
    actualizarPlaneacion,
    eliminarPlaneacion,
    obtenerPlaneacion,
    clonarPlaneacion,
    filtrarPlaneaciones,
    setPlaneacionActual,
    limpiarPlaneaciones,
    reloadFromStorage,
    syncStatus,
    isOnline,
    pendingCount,
    lastSync,
    forceSync,
    isSyncConfigured,
  };

  return <PlaneacionesContext.Provider value={value}>{children}</PlaneacionesContext.Provider>;
};

export const usePlaneaciones = (): PlaneacionesContextData => {
  const context = useContext(PlaneacionesContext);
  if (!context) {
    throw new Error("usePlaneaciones debe usarse dentro de PlaneacionesProvider");
  }
  return context;
};

export const useSyncPlaneaciones = usePlaneaciones;
