import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../navigation/StackNavigator";
import { usePlaneaciones } from "../sync/providers/SyncProvider";
import { useAuth } from "../context/AuthContext";
import { buildPlaneacionDocumentoBase } from "../utils/createPlaneacionDocumentoBase";
import { buildDocumentoFromPlantilla, getPlantillaDocumento } from "../services/plantillaDocumentoService";
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

type DocEditorNav = StackNavigationProp<RootStackParamList, "DocEditor">;
type DocEditorRoute = RouteProp<RootStackParamList, "DocEditor">;

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
  guardarDocumento: () => Promise<void>;
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
  const userId = String(usuario?.id ?? "guest");

  const [documento, setDocumento] = useState<PlaneacionDocumento>(() =>
    buildPlaneacionDocumentoBase({
      nivelAcademico: targetNivel || NivelAcademico.PRIMARIA,
      userId: String(usuario?.id ?? "guest"),
      usuario: usuario || undefined,
    })
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<DocSectionId>("info_institucional");
  const [past, setPast] = useState<PlaneacionDocumento[]>([]);
  const [future, setFuture] = useState<PlaneacionDocumento[]>([]);
  const isHydratingRef = useRef(true);

  const draftKey = useMemo(() => {
    const ref = sourceDocId || sourcePlantillaId || `${mode}_${targetNivel || NivelAcademico.PRIMARIA}`;
    return `${DOC_DRAFT_PREFIX}:${ref}`;
  }, [mode, sourceDocId, sourcePlantillaId, targetNivel]);

  const pushHistory = (current: PlaneacionDocumento) => {
    setPast((prev) => {
      const next = [...prev, current];
      if (next.length > 30) next.shift();
      return next;
    });
    setFuture([]);
  };

  const updateDoc = useCallback(
    (updater: (current: PlaneacionDocumento) => PlaneacionDocumento, trackHistory = true) => {
      setDocumento((current) => {
        if (trackHistory) pushHistory(current);
        const next = updater(current);
        return {
          ...next,
          fechaModificacion: getNow(),
        };
      });
      setIsDirty(true);
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

      setDocumento(nextDocument);

      const draft = parseWithFallback<PlaneacionDocumento | null>(await AsyncStorage.getItem(draftKey), null);
      if (
        draft?.id &&
        (draft.id === sourceDocId || draft.plantillaId === sourcePlantillaId || mode === "crear")
      ) {
        setDocumento(draft);
      } else {
        setDocumento(nextDocument);
      }

      setPast([]);
      setFuture([]);
      setIsDirty(false);
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
    const interval = setInterval(() => {
      const run = async () => {
        await AsyncStorage.setItem(draftKey, JSON.stringify(documento));
        setDraftSavedAt(getNow());
      };
      void run();
    }, 30000);

    return () => clearInterval(interval);
  }, [documento, draftKey]);

  const guardarDocumento = useCallback(async () => {
    try {
      setIsSaving(true);
      const exists = Boolean(obtenerDocumento(documento.id));
      if (exists) {
        await actualizar(documento.id, documento);
      } else {
        await crear(documento);
      }
      await AsyncStorage.removeItem(draftKey);
      setIsDirty(false);
      setDraftSavedAt(getNow());
      navigation.goBack();
    } finally {
      setIsSaving(false);
    }
  }, [actualizar, crear, documento, draftKey, navigation, obtenerDocumento]);

  const undo = useCallback(() => {
    setPast((prevPast) => {
      if (prevPast.length === 0) return prevPast;
      const previous = prevPast[prevPast.length - 1];
      setFuture((prevFuture) => [documento, ...prevFuture].slice(0, 30));
      setDocumento(previous);
      setIsDirty(true);
      return prevPast.slice(0, -1);
    });
  }, [documento]);

  const redo = useCallback(() => {
    setFuture((prevFuture) => {
      if (prevFuture.length === 0) return prevFuture;
      const [next, ...rest] = prevFuture;
      setPast((prevPast) => [...prevPast, documento].slice(-30));
      setDocumento(next);
      setIsDirty(true);
      return rest;
    });
  }, [documento]);

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
    guardarDocumento,
    undo,
    redo,
  };
};

export default useDocEditorViewModel;
