import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { AppRoutesParamList } from "../navigation/StackNavigator";
import { usePlaneaciones } from "../context/PlaneacionesContext";
import { useAuth } from "../context/AuthContext";
import { buildPlaneacionDocumentoBase } from "../utils/createPlaneacionDocumentoBase";
import { buildDocumentoFromPlantilla, getPlantillaDocumento } from "../services/plantillaDocumentoService";
import { buildContenidoRawFromDocumento, ensureDocumentoContenidoRaw } from "../utils/docEditorTemplate";
import { navigateToHub } from "../navigation/navigateToHub";
import type {
  ElementosCurriculares,
  Firma,
  InfoInstitucional,
  InstrumentoEvaluacion,
  Observacion,
  PlaneacionDocumento,
  Sesion,
} from "../../types/planeacionV2";
import { NivelAcademico } from "../../types/planeacionV2";

type DocEditorNav = StackNavigationProp<AppRoutesParamList, "DocEditor">;
type DocEditorRoute = RouteProp<AppRoutesParamList, "DocEditor">;

export type DocSectionId =
  | "info_institucional"
  | "datos_generales"
  | "curricular"
  | "sesiones"
  | "evaluacion"
  | "observaciones"
  | "firmas";

export interface DocSectionProgress {
  id: DocSectionId;
  title: string;
  icon: string;
  completed: boolean;
}

const DOC_DRAFT_PREFIX = "@planearia:doceditor_draft";

const getNow = () => new Date().toISOString();

const parseWithFallback = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const isSessionFilled = (sesion: Sesion): boolean => {
  if (sesion.tipo === "suspension") return Boolean(sesion.motivo?.trim());
  return Boolean(sesion.inicio || sesion.desarrollo || sesion.cierre);
};

const isEvaluacionFilled = (evaluacion?: InstrumentoEvaluacion): boolean => {
  if (!evaluacion) return false;
  const hasCriteria = evaluacion.criterios.some((item) => item.descripcion.trim().length > 0);
  const hasScale = evaluacion.escala.some((item) => item.etiqueta.trim().length > 0);
  return hasCriteria || hasScale;
};

const HISTORY_LIMIT = 30;

interface HistoryState {
  present: PlaneacionDocumento;
  past: PlaneacionDocumento[];
  future: PlaneacionDocumento[];
  isDirty: boolean;
}

type HistoryAction =
  | {
      type: "update";
      updater: (current: PlaneacionDocumento) => PlaneacionDocumento;
      trackHistory: boolean;
      now: string;
    }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "reset"; document: PlaneacionDocumento }
  | { type: "markSaved" };

// Pure history machine (present + undo/redo stacks + dirty flag). Every transition is a
// side-effect-free computation, so React can invoke the reducer more than once (replay /
// StrictMode) without repeating side effects or corrupting the history.
const historyReducer = (state: HistoryState, action: HistoryAction): HistoryState => {
  switch (action.type) {
    case "update": {
      const next = action.updater(state.present);
      if (next === state.present) return state;
      const stamped = { ...next, fechaModificacion: action.now };
      if (!action.trackHistory) {
        return { ...state, present: stamped, isDirty: true };
      }
      const past = [...state.past, state.present];
      if (past.length > HISTORY_LIMIT) past.shift();
      return { present: stamped, past, future: [], isDirty: true };
    }
    case "undo": {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      return {
        present: previous,
        past: state.past.slice(0, -1),
        future: [state.present, ...state.future].slice(0, HISTORY_LIMIT),
        isDirty: true,
      };
    }
    case "redo": {
      if (state.future.length === 0) return state;
      const [next, ...rest] = state.future;
      return {
        present: next,
        past: [...state.past, state.present].slice(-HISTORY_LIMIT),
        future: rest,
        isDirty: true,
      };
    }
    case "reset":
      return { present: action.document, past: [], future: [], isDirty: false };
    case "markSaved":
      return { ...state, isDirty: false };
    default:
      return state;
  }
};

export interface DocEditorViewModel {
  documento: PlaneacionDocumento;
  isLoading: boolean;
  isSaving: boolean;
  isDirty: boolean;
  draftSavedAt: string | null;
  activeSectionId: DocSectionId;
  sectionsProgress: DocSectionProgress[];
  canUndo: boolean;
  canRedo: boolean;
  setActiveSectionId: (sectionId: DocSectionId) => void;
  setInfoInstitucional: (next: InfoInstitucional) => void;
  setDatosGenerales: (next: PlaneacionDocumento["datosGenerales"]) => void;
  setCurricular: (next: ElementosCurriculares) => void;
  setSesiones: (next: Sesion[]) => void;
  setEvaluacion: (next: { evaluacionInicial?: InstrumentoEvaluacion; evaluacionFinal?: InstrumentoEvaluacion }) => void;
  setObservaciones: (next: Observacion[]) => void;
  setFirmas: (next: Firma[]) => void;
  setCamposNivel: (next: Record<string, unknown>) => void;
  setContenidoRaw: (next: string) => void;
  regenerarContenidoRawDesdeCampos: () => void;
  guardarDocumento: (options?: { salir?: boolean }) => Promise<void>;
  undo: () => void;
  redo: () => void;
}

export const useDocEditorViewModel = (): DocEditorViewModel => {
  const navigation = useNavigation<DocEditorNav>();
  const route = useRoute<DocEditorRoute>();
  const { usuario } = useAuth();
  const { crear, actualizar, obtenerDocumento } = usePlaneaciones();

  const params = route.params;
  const mode = params?.modo || "crear";
  const sourceDocId = params?.planeacionId;
  const sourcePlantillaId = params?.plantillaId;
  const targetNivel = params?.nivelAcademico;
  const routeInstanceKey = route.key;
  const userId = String(usuario?.id ?? "guest");

  const [history, dispatch] = useReducer(
    historyReducer,
    undefined,
    (): HistoryState => ({
      present: buildPlaneacionDocumentoBase({
        nivelAcademico: targetNivel || NivelAcademico.PRIMARIA,
        userId: String(usuario?.id ?? "guest"),
        usuario: usuario || undefined,
      }),
      past: [],
      future: [],
      isDirty: false,
    })
  );
  const { present: documento, past, future, isDirty } = history;
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<DocSectionId>("info_institucional");
  const isHydratingRef = useRef(true);
  const lastDraftSerializedRef = useRef("");

  const draftKey = useMemo(() => {
    const ref =
      sourceDocId ||
      sourcePlantillaId ||
      (mode === "crear"
        ? `create_${routeInstanceKey}`
        : `${mode}_${targetNivel || NivelAcademico.PRIMARIA}`);
    return `${DOC_DRAFT_PREFIX}:${ref}`;
  }, [mode, routeInstanceKey, sourceDocId, sourcePlantillaId, targetNivel]);

  const updateDoc = useCallback(
    (updater: (current: PlaneacionDocumento) => PlaneacionDocumento, trackHistory = true) => {
      dispatch({ type: "update", updater, trackHistory, now: getNow() });
    },
    []
  );

  useEffect(() => {
    const boot = async () => {
      setIsLoading(true);
      const fallback = buildPlaneacionDocumentoBase({
        nivelAcademico: targetNivel || NivelAcademico.PRIMARIA,
        userId,
        usuario: usuario || undefined,
      });

      let nextDocument = fallback;

      if (mode === "editar" && sourceDocId) {
        const existing = obtenerDocumento(sourceDocId);
        if (existing) {
          nextDocument = existing;
        }
      } else if (mode === "plantilla" && sourcePlantillaId) {
        const plantilla = await getPlantillaDocumento(sourcePlantillaId, userId);
        if (plantilla) {
          nextDocument = buildDocumentoFromPlantilla(plantilla, {
            userId,
            usuario: usuario || undefined,
          });
        }
      }

      dispatch({ type: "reset", document: ensureDocumentoContenidoRaw(nextDocument) });

      const draft = parseWithFallback<PlaneacionDocumento | null>(await AsyncStorage.getItem(draftKey), null);
      if (
        draft?.id &&
        (draft.id === sourceDocId || draft.plantillaId === sourcePlantillaId || mode === "crear")
      ) {
        const hydratedDraft = ensureDocumentoContenidoRaw(draft);
        dispatch({ type: "reset", document: hydratedDraft });
        lastDraftSerializedRef.current = JSON.stringify(hydratedDraft);
      } else {
        const hydratedDoc = ensureDocumentoContenidoRaw(nextDocument);
        dispatch({ type: "reset", document: hydratedDoc });
        lastDraftSerializedRef.current = JSON.stringify(hydratedDoc);
      }

      setDraftSavedAt(null);
      isHydratingRef.current = false;
      setIsLoading(false);
    };

    void boot();
  }, [
    draftKey,
    mode,
    obtenerDocumento,
    sourceDocId,
    sourcePlantillaId,
    targetNivel,
    userId,
    usuario?.apellidos,
    usuario?.id,
    usuario?.nombre,
  ]);

  useEffect(() => {
    if (isHydratingRef.current) return;
    if (!isDirty) return;
    const interval = setInterval(() => {
      const run = async () => {
        const serialized = JSON.stringify(documento);
        if (lastDraftSerializedRef.current === serialized) return;
        await AsyncStorage.setItem(draftKey, serialized);
        lastDraftSerializedRef.current = serialized;
        setDraftSavedAt(getNow());
      };
      void run();
    }, 30000);

    return () => clearInterval(interval);
  }, [documento, draftKey, isDirty]);

  const guardarDocumento = useCallback(async (options?: { salir?: boolean }) => {
    try {
      setIsSaving(true);
      const exists = Boolean(obtenerDocumento(documento.id));
      if (exists) {
        await actualizar(documento.id, documento);
      } else {
        await crear(documento);
      }
      await AsyncStorage.removeItem(draftKey);
      lastDraftSerializedRef.current = "";
      dispatch({ type: "markSaved" });
      setDraftSavedAt(getNow());
      if (options?.salir) {
        // DocEditor vive en la raiz; la biblioteca, dentro del hub Office.
        navigateToHub(navigation, "OfficeTab", "Contenido");
      }
    } finally {
      setIsSaving(false);
    }
  }, [actualizar, crear, documento, draftKey, navigation, obtenerDocumento]);

  const undo = useCallback(() => {
    dispatch({ type: "undo" });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: "redo" });
  }, []);

  const sectionsProgress: DocSectionProgress[] = useMemo(() => {
    return [
      {
        id: "info_institucional",
        title: "Institucion",
        icon: "business",
        completed: Boolean(
          documento.infoInstitucional.institucion.trim() && documento.infoInstitucional.cicloEscolar.trim()
        ),
      },
      {
        id: "datos_generales",
        title: "Datos",
        icon: "badge",
        completed: Boolean(documento.datosGenerales.asignatura.trim() && documento.datosGenerales.grado.trim()),
      },
      {
        id: "curricular",
        title: "Curricular",
        icon: "school",
        completed: Boolean(documento.elementosCurriculares.contenido.trim() && documento.elementosCurriculares.pda.trim()),
      },
      {
        id: "sesiones",
        title: "Sesiones",
        icon: "calendar-today",
        completed: documento.sesiones.length > 0 && documento.sesiones.some(isSessionFilled),
      },
      {
        id: "evaluacion",
        title: "Evaluacion",
        icon: "fact-check",
        completed: isEvaluacionFilled(documento.evaluacionFinal),
      },
      {
        id: "observaciones",
        title: "Observaciones",
        icon: "sticky-note-2",
        completed: documento.observaciones.some((item) => item.texto.trim().length > 0),
      },
      {
        id: "firmas",
        title: "Firmas",
        icon: "draw",
        completed: documento.firmas.some((item) => item.nombre.trim().length > 0),
      },
    ];
  }, [documento]);

  return {
    documento,
    isLoading,
    isSaving,
    isDirty,
    draftSavedAt,
    activeSectionId,
    sectionsProgress,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    setActiveSectionId,
    setInfoInstitucional: (next) => updateDoc((current) => ({ ...current, infoInstitucional: next })),
    setDatosGenerales: (next) => updateDoc((current) => ({ ...current, datosGenerales: next })),
    setCurricular: (next) => updateDoc((current) => ({ ...current, elementosCurriculares: next })),
    setSesiones: (next) => updateDoc((current) => ({ ...current, sesiones: next })),
    setEvaluacion: (next) =>
      updateDoc((current) => ({
        ...current,
        evaluacionInicial: next.evaluacionInicial,
        evaluacionFinal: next.evaluacionFinal,
      })),
    setObservaciones: (next) => updateDoc((current) => ({ ...current, observaciones: next })),
    setFirmas: (next) => updateDoc((current) => ({ ...current, firmas: next })),
    setCamposNivel: (next) => updateDoc((current) => ({ ...current, camposNivel: next })),
    setContenidoRaw: (next) =>
      updateDoc(
        (current) => {
          if (current.contenidoRaw === next) return current;
          return {
            ...current,
            contenidoRaw: next,
          };
        },
        false
      ),
    regenerarContenidoRawDesdeCampos: () =>
      updateDoc((current) => ({
        ...current,
        contenidoRaw: buildContenidoRawFromDocumento(current),
      })),
    guardarDocumento,
    undo,
    redo,
  };
};

export default useDocEditorViewModel;
