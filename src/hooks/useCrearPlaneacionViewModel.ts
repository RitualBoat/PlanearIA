import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../navigation/StackNavigator";
import { API_CONFIG } from "../sync/config/apiConfig";
import { useAuth } from "../context/AuthContext";
import { usePlaneaciones } from "../context/PlaneacionesContext";
import { mapResponseToPlaneacion } from "../utils/planeacionMapper";
import { getAccessToken } from "../services/auth";
import {
  buildDocumentoFromPlantilla,
  listPlantillasDocumento,
} from "../services/plantillaDocumentoService";
import {
  NivelAcademico as NivelAcademicoLegacy,
  type Planeacion,
} from "../../types/planeacionLegacy";
import {
  NivelAcademico as NivelAcademicoV2,
  type PlaneacionDocumento,
} from "../../types/planeacionV2";
import type { PlantillaDocumento, SeccionPlantilla } from "../../types/plantillaDocumento";

type Nav = StackNavigationProp<RootStackParamList, "CrearPlaneacion">;

type TemplateSource = "base" | "predeterminada" | "guardada" | "online";

interface TemplateItem {
  id: string;
  source: TemplateSource;
  nombre: string;
  descripcion: string;
  nivelAcademico: NivelAcademicoV2;
  plantilla?: PlantillaDocumento;
  etiquetas?: string[];
  miniaturaUri?: string;
  compatibilidad?: PlantillaDocumento["compatibilidad"];
  disabled?: boolean;
}

export interface TemplateGallerySection {
  id: string;
  title: string;
  items: TemplateItem[];
  emptyText?: string;
}

export interface NivelOptionV2 {
  nivel: NivelAcademicoV2;
  titulo: string;
}

export interface CrearPlaneacionViewModel {
  niveles: NivelOptionV2[];
  nivelSeleccionado: NivelAcademicoV2;
  sections: TemplateGallerySection[];
  selectedTemplateId: string;
  isLoadingPlantillas: boolean;
  isSubmitting: boolean;
  setNivelSeleccionado: (nivel: NivelAcademicoV2) => void;
  seleccionarPlantilla: (templateId: string) => void;
  crearDesdePlantillaSeleccionada: () => Promise<void>;
  handleEscanearPlantilla: () => void;
  handleImportarPlaneacion: () => void;
  handleGenerarConIADesdeSelector: () => Promise<void>;

  // Compatibilidad temporal con flujo IA legacy
  showTemplateModal: boolean;
  showNivelModal: boolean;
  showPreviewModal: boolean;
  promptIA: string;
  nivelIA: NivelAcademicoLegacy;
  isGeneratingIA: boolean;
  iaError: string;
  planeacionGeneradaIA: Planeacion | null;
  setPromptIA: (value: string) => void;
  setNivelIA: (value: NivelAcademicoLegacy) => void;
  handleCrearDesdeCero: () => void;
  handleSeleccionarNivel: (nivel: NivelAcademicoLegacy) => void;
  handleCloseNivelModal: () => void;
  handleCloseModal: () => void;
  handleClosePreview: () => void;
  handleGenerarConIA: () => Promise<void>;
  handleGuardarPlaneacionIA: () => Promise<void>;
  handleEditarPlaneacionIA: () => Promise<void>;
  handleRegenerarPlaneacionIA: () => Promise<void>;
}

const showInfoMessage = (title: string, message: string) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
};

const LEVEL_OPTIONS: NivelOptionV2[] = [
  { nivel: NivelAcademicoV2.PRIMARIA, titulo: "Primaria" },
  { nivel: NivelAcademicoV2.SECUNDARIA, titulo: "Secundaria" },
  { nivel: NivelAcademicoV2.PREPARATORIA, titulo: "Preparatoria" },
  { nivel: NivelAcademicoV2.UNIVERSIDAD, titulo: "Universidad" },
];

const baseSectionsForLevel = (nivel: NivelAcademicoV2): SeccionPlantilla[] => {
  const sesionesLabel = nivel === NivelAcademicoV2.UNIVERSIDAD ? "Sesiones del curso" : "Sesiones";
  return [
    { id: "info_inst", tipo: "info_institucional", titulo: "Informacion institucional", visible: true, campos: [] },
    { id: "datos", tipo: "datos_generales", titulo: "Datos generales", visible: true, campos: [] },
    { id: "curricular", tipo: "curricular", titulo: "Elementos curriculares", visible: true, campos: [] },
    { id: "sesiones", tipo: "sesiones", titulo: sesionesLabel, visible: true, campos: [] },
    { id: "evaluacion", tipo: "evaluacion", titulo: "Evaluacion", visible: true, campos: [] },
    { id: "observaciones", tipo: "observaciones", titulo: "Observaciones", visible: true, campos: [] },
    { id: "firmas", tipo: "firmas", titulo: "Firmas", visible: true, campos: [] },
  ];
};

const buildTemplateId = (prefix: string, nivel: NivelAcademicoV2) => `${prefix}_${nivel}`;

const buildSystemTemplate = (
  id: string,
  nombre: string,
  descripcion: string,
  nivelAcademico: NivelAcademicoV2,
  defaults?: Partial<PlaneacionDocumento>,
  metadata?: Pick<PlantillaDocumento, "etiquetas" | "miniaturaUri" | "compatibilidad">
): PlantillaDocumento => {
  const now = new Date().toISOString();
  const nivelEtiqueta =
    nivelAcademico === NivelAcademicoV2.PRIMARIA
      ? "primaria"
      : nivelAcademico === NivelAcademicoV2.SECUNDARIA
        ? "secundaria"
        : nivelAcademico === NivelAcademicoV2.PREPARATORIA
          ? "preparatoria"
          : "universidad";

  return {
    id,
    userId: "system",
    nombre,
    descripcion,
    nivelAcademico,
    origen: "comunidad",
    secciones: baseSectionsForLevel(nivelAcademico),
    defaults: {
      ...defaults,
      elementosCurriculares: {
        proposito: "",
        producto: "",
        contenido: "",
        pda: "",
        campoFormativo: "",
        ejeArticulador: "",
        rasgosPerfilEgreso: [],
        instrumentoEvaluacion: "",
        ...(defaults?.elementosCurriculares || {}),
      },
    },
    etiquetas: metadata?.etiquetas || ["base", nivelEtiqueta, "planeacion"],
    miniaturaUri: metadata?.miniaturaUri,
    compatibilidad: metadata?.compatibilidad || { web: true, android: true, ios: true },
    fechaCreacion: now,
    fechaModificacion: now,
  };
};

const getBaseTemplates = (): PlantillaDocumento[] => {
  const byLevelDefaults: Partial<Record<NivelAcademicoV2, Partial<PlaneacionDocumento>>> = {
    [NivelAcademicoV2.PRIMARIA]: {
      datosGenerales: {
        grado: "3ro",
      } as PlaneacionDocumento["datosGenerales"],
      elementosCurriculares: {
        campoFormativo: "Lenguajes",
        ejeArticulador: "Pensamiento critico",
      } as PlaneacionDocumento["elementosCurriculares"],
      camposNivel: {
        planEstudios: "NEM 2022",
      },
    },
    [NivelAcademicoV2.SECUNDARIA]: {
      datosGenerales: {
        grado: "1ro",
      } as PlaneacionDocumento["datosGenerales"],
      elementosCurriculares: {
        campoFormativo: "Saberes y pensamiento cientifico",
        ejeArticulador: "Interculturalidad critica",
      } as PlaneacionDocumento["elementosCurriculares"],
      camposNivel: {
        planEstudios: "NEM 2022",
      },
    },
    [NivelAcademicoV2.PREPARATORIA]: {
      datosGenerales: {
        grado: "4to semestre",
      } as PlaneacionDocumento["datosGenerales"],
      camposNivel: {
        planEstudios: "Marco Curricular Comun EMS",
      },
    },
    [NivelAcademicoV2.UNIVERSIDAD]: {
      datosGenerales: {
        grado: "4to semestre",
      } as PlaneacionDocumento["datosGenerales"],
      camposNivel: {
        planEstudios: "Programa de asignatura institucional",
      },
    },
  };

  return LEVEL_OPTIONS.map((item) => {
    const defaults = byLevelDefaults[item.nivel] || {};
    return buildSystemTemplate(
      buildTemplateId("base", item.nivel),
      `Plantilla base ${item.titulo}`,
      "Estructura robusta editable en DocEditor con tablas y secciones pedagogicas.",
      item.nivel,
      defaults,
      {
        etiquetas: ["base", item.titulo.toLowerCase(), "doceditor", "word-docs"],
      }
    );
  });
};

const getPredeterminedTemplates = (): PlantillaDocumento[] => {
  return [
    buildSystemTemplate(
      "pred_primaria_proyecto",
      "Proyecto por semanas (Primaria)",
      "Plantilla con enfoque por proyecto y seguimiento semanal.",
      NivelAcademicoV2.PRIMARIA,
      {
        datosGenerales: {
          grado: "4to",
        } as PlaneacionDocumento["datosGenerales"],
        camposNivel: {
          enfoque: "ABP",
          numeroSesionesSugeridas: 8,
        },
      },
      {
        etiquetas: ["proyecto", "abp", "primaria"],
      }
    ),
    buildSystemTemplate(
      "pred_secu_laboratorio",
      "Secuencia de laboratorio (Secundaria)",
      "Plantilla para sesiones practicas con criterios de evaluacion.",
      NivelAcademicoV2.SECUNDARIA,
      {
        datosGenerales: {
          grado: "2do",
        } as PlaneacionDocumento["datosGenerales"],
        camposNivel: {
          enfoque: "laboratorio",
          numeroSesionesSugeridas: 6,
        },
      },
      {
        etiquetas: ["laboratorio", "secundaria", "experimentacion"],
      }
    ),
    buildSystemTemplate(
      "pred_prep_competencias",
      "Planeacion por competencias (Preparatoria)",
      "Plantilla orientada a competencias y evidencias.",
      NivelAcademicoV2.PREPARATORIA,
      {
        camposNivel: {
          enfoque: "competencias",
          numeroSesionesSugeridas: 5,
        },
      },
      {
        etiquetas: ["competencias", "preparatoria", "evidencias"],
      }
    ),
    buildSystemTemplate(
      "pred_uni_unidad",
      "Unidad didactica universitaria",
      "Plantilla para curso universitario por unidades y sesiones.",
      NivelAcademicoV2.UNIVERSIDAD,
      {
        camposNivel: {
          enfoque: "unidad_didactica",
          numeroSesionesSugeridas: 10,
        },
      },
      {
        etiquetas: ["universidad", "unidad", "planeacion"],
      }
    ),
  ];
};

const mapLegacyToV2Nivel = (nivel: NivelAcademicoLegacy): NivelAcademicoV2 => {
  if (nivel === NivelAcademicoLegacy.SECUNDARIA) return NivelAcademicoV2.SECUNDARIA;
  if (nivel === NivelAcademicoLegacy.PREPARATORIA) return NivelAcademicoV2.PREPARATORIA;
  if (nivel === NivelAcademicoLegacy.UNIVERSIDAD) return NivelAcademicoV2.UNIVERSIDAD;
  return NivelAcademicoV2.PRIMARIA;
};

const toRichTextString = (plainText = ""): string => {
  return JSON.stringify({
    type: "doc",
    content: plainText
      ? [
          {
            type: "paragraph",
            content: [{ type: "text", text: plainText }],
          },
        ]
      : [{ type: "paragraph" }],
  });
};

const applyIAResultToDocument = (doc: PlaneacionDocumento, planeacion: Planeacion): PlaneacionDocumento => {
  const byType = new Map<string, { descripcion?: string }>();
  (planeacion.actividades || []).forEach((item) => {
    byType.set(item.tipo, item);
  });

  const sesiones = [...doc.sesiones];
  if (sesiones[0]) {
    sesiones[0] = {
      ...sesiones[0],
      inicio: toRichTextString(byType.get("inicio")?.descripcion || ""),
      desarrollo: toRichTextString(byType.get("desarrollo")?.descripcion || ""),
      cierre: toRichTextString(byType.get("cierre")?.descripcion || ""),
      tarea: toRichTextString(""),
    };
  }

  return {
    ...doc,
    datosGenerales: {
      ...doc.datosGenerales,
      asignatura: planeacion.asignatura || doc.datosGenerales.asignatura,
      grado: planeacion.grado || doc.datosGenerales.grado,
      grupos: planeacion.grupo ? [planeacion.grupo] : doc.datosGenerales.grupos,
    },
    elementosCurriculares: {
      ...doc.elementosCurriculares,
      contenido: planeacion.unidadTematica || doc.elementosCurriculares.contenido,
      pda: planeacion.temaSesion || doc.elementosCurriculares.pda,
      proposito:
        Array.isArray(planeacion.aprendizajesEsperados) && planeacion.aprendizajesEsperados.length > 0
          ? planeacion.aprendizajesEsperados.join("\n")
          : doc.elementosCurriculares.proposito,
      producto:
        Array.isArray(planeacion.evidencias) && planeacion.evidencias.length > 0
          ? planeacion.evidencias.join("\n")
          : doc.elementosCurriculares.producto,
      instrumentoEvaluacion: planeacion.evaluacion || doc.elementosCurriculares.instrumentoEvaluacion,
    },
    sesiones,
    camposNivel: {
      ...doc.camposNivel,
      recursos: planeacion.recursos || [],
    },
    fechaModificacion: new Date().toISOString(),
  };
};

export const useCrearPlaneacionViewModel = (): CrearPlaneacionViewModel => {
  const navigation = useNavigation<Nav>();
  const { usuario } = useAuth();
  const { crear, forceSync } = usePlaneaciones();

  const [nivelSeleccionado, setNivelSeleccionado] = useState<NivelAcademicoV2>(NivelAcademicoV2.PRIMARIA);
  const [selectedTemplateId, setSelectedTemplateId] = useState(buildTemplateId("base", NivelAcademicoV2.PRIMARIA));
  const [plantillasGuardadas, setPlantillasGuardadas] = useState<PlantillaDocumento[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPlantillas, setIsLoadingPlantillas] = useState(false);

  // Compatibilidad temporal con flujo IA legacy
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showNivelModal, setShowNivelModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [promptIA, setPromptIA] = useState("");
  const [nivelIA, setNivelIA] = useState<NivelAcademicoLegacy>(NivelAcademicoLegacy.PRIMARIA);
  const [isGeneratingIA, setIsGeneratingIA] = useState(false);
  const [iaError, setIaError] = useState("");
  const [planeacionGeneradaIA, setPlaneacionGeneradaIA] = useState<Planeacion | null>(null);
  const [iaDocId, setIaDocId] = useState<string | null>(null);

  const templatesBase = useMemo(() => getBaseTemplates(), []);
  const templatesPredetermined = useMemo(() => getPredeterminedTemplates(), []);

  useEffect(() => {
    let isMounted = true;

    const loadPlantillas = async () => {
      setIsLoadingPlantillas(true);
      try {
        const items = await listPlantillasDocumento(String(usuario?.id ?? "guest"));
        if (isMounted) setPlantillasGuardadas(items);
      } finally {
        if (isMounted) setIsLoadingPlantillas(false);
      }
    };

    void loadPlantillas();

    return () => {
      isMounted = false;
    };
  }, [usuario?.id]);

  const onlineTemplates = useMemo<TemplateItem[]>(
    () => [
      {
        id: "online_galeria",
        source: "online",
        nombre: "Galeria online de plantillas",
        descripcion: "Explora plantillas estilo Canva. Se completa en Fase 10.",
        nivelAcademico: nivelSeleccionado,
        etiquetas: ["galeria", "online", "fase10"],
        compatibilidad: { web: true, android: true, ios: true },
        disabled: true,
      },
    ],
    [nivelSeleccionado]
  );

  const currentTemplates = useMemo(() => {
    const base = templatesBase.filter((item) => item.nivelAcademico === nivelSeleccionado);
    const predetermined = templatesPredetermined.filter((item) => item.nivelAcademico === nivelSeleccionado);
    const saved = plantillasGuardadas.filter((item) => item.nivelAcademico === nivelSeleccionado);
    return { base, predetermined, saved };
  }, [nivelSeleccionado, plantillasGuardadas, templatesBase, templatesPredetermined]);

  const sections = useMemo<TemplateGallerySection[]>(() => {
    return [
      {
        id: "base",
        title: "Plantilla default",
        items: currentTemplates.base.map((plantilla) => ({
          id: plantilla.id,
          source: "base",
          nombre: plantilla.nombre,
          descripcion: plantilla.descripcion || "Plantilla base del sistema.",
          nivelAcademico: plantilla.nivelAcademico,
          etiquetas: plantilla.etiquetas,
          miniaturaUri: plantilla.miniaturaUri,
          compatibilidad: plantilla.compatibilidad,
          plantilla,
        })),
      },
      {
        id: "predeterminadas",
        title: "Mas plantillas predeterminadas",
        items: currentTemplates.predetermined.map((plantilla) => ({
          id: plantilla.id,
          source: "predeterminada",
          nombre: plantilla.nombre,
          descripcion: plantilla.descripcion || "Plantilla predeterminada.",
          nivelAcademico: plantilla.nivelAcademico,
          etiquetas: plantilla.etiquetas,
          miniaturaUri: plantilla.miniaturaUri,
          compatibilidad: plantilla.compatibilidad,
          plantilla,
        })),
      },
      {
        id: "guardadas",
        title: "Plantillas guardadas",
        items: currentTemplates.saved.map((plantilla) => ({
          id: plantilla.id,
          source: "guardada",
          nombre: plantilla.nombre,
          descripcion: plantilla.descripcion || "Plantilla escaneada o personalizada.",
          nivelAcademico: plantilla.nivelAcademico,
          etiquetas: plantilla.etiquetas,
          miniaturaUri: plantilla.miniaturaUri,
          compatibilidad: plantilla.compatibilidad,
          plantilla,
        })),
        emptyText: "Todavia no tienes plantillas guardadas para este nivel.",
      },
      {
        id: "online",
        title: "Plantillas online",
        items: onlineTemplates,
      },
    ];
  }, [currentTemplates.base, currentTemplates.predetermined, currentTemplates.saved, onlineTemplates]);

  useEffect(() => {
    const allIds = sections.flatMap((section) => section.items.map((item) => item.id));
    if (allIds.includes(selectedTemplateId)) return;

    const fallbackId = buildTemplateId("base", nivelSeleccionado);
    setSelectedTemplateId(fallbackId);
  }, [nivelSeleccionado, sections, selectedTemplateId]);

  const templateById = useMemo(() => {
    const map = new Map<string, TemplateItem>();
    sections.forEach((section) => {
      section.items.forEach((item) => map.set(item.id, item));
    });
    return map;
  }, [sections]);

  const seleccionarPlantilla = useCallback(
    (templateId: string) => {
      const selected = templateById.get(templateId);
      if (!selected) return;
      if (selected.disabled || selected.source === "online") {
        showInfoMessage("Plantillas online", "La galeria online se completa en la Fase 10.");
        return;
      }
      setSelectedTemplateId(templateId);
    },
    [templateById]
  );

  const crearDesdePlantillaSeleccionada = useCallback(async () => {
    const selected = templateById.get(selectedTemplateId);
    if (!selected) return;

    if (!selected.plantilla) {
      showInfoMessage("Plantillas", "Selecciona una plantilla valida para continuar.");
      return;
    }

    setIsSubmitting(true);
    try {
      const doc = buildDocumentoFromPlantilla(selected.plantilla, {
        userId: String(usuario?.id ?? "guest"),
        usuario,
      });
      await crear(doc);
      navigation.navigate("DocEditor", {
        modo: "editar",
        planeacionId: doc.id,
        nivelAcademico: doc.nivelAcademico,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [crear, navigation, selectedTemplateId, templateById, usuario]);

  const handleEscanearPlantilla = useCallback(() => {
    navigation.navigate("EscanerPlantilla");
  }, [navigation]);

  const handleImportarPlaneacion = useCallback(() => {
    navigation.navigate("ImportarPlaneacion");
  }, [navigation]);

  const handleGenerarConIADesdeSelector = useCallback(async () => {
    const selected = templateById.get(selectedTemplateId);
    if (!selected) return;

    if (!selected.plantilla) {
      showInfoMessage("Plantillas", "Selecciona una plantilla valida para continuar.");
      return;
    }

    setIsSubmitting(true);
    try {
      const doc = buildDocumentoFromPlantilla(selected.plantilla, {
        userId: String(usuario?.id ?? "guest"),
        usuario,
      });
      await crear(doc);
      navigation.navigate("DocEditor", {
        modo: "editar",
        planeacionId: doc.id,
        nivelAcademico: doc.nivelAcademico,
      });
      showInfoMessage(
        "Copiloto IA",
        "Documento creado. Usa la barra de Copiloto IA dentro del editor para sugerir, mejorar, crear rubricas y revisar."
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [crear, navigation, selectedTemplateId, templateById, usuario]);

  const handleCloseNivelModal = useCallback(() => {
    setShowNivelModal(false);
  }, []);

  const handleCrearDesdeCero = useCallback(() => {
    setShowNivelModal(true);
  }, []);

  const handleSeleccionarNivel = useCallback(
    (nivel: NivelAcademicoLegacy) => {
      setShowNivelModal(false);
      navigation.navigate("DocEditor", {
        modo: "crear",
        nivelAcademico: mapLegacyToV2Nivel(nivel),
      });
    },
    [navigation]
  );

  const handleCloseModal = useCallback(() => {
    setShowTemplateModal(false);
  }, []);

  const handleClosePreview = useCallback(() => {
    setShowPreviewModal(false);
  }, []);

  const handleGenerarConIA = useCallback(async () => {
    const prompt = promptIA.trim();

    if (!prompt) {
      setIaError("Escribe un prompt para generar la planeacion.");
      return;
    }

    if (prompt.length < 10) {
      setIaError("El prompt debe tener al menos 10 caracteres.");
      return;
    }

    if (!API_CONFIG.baseUrl) {
      setIaError("No hay URL de backend configurada para generar con IA.");
      return;
    }

    if (!API_CONFIG.apiSecret) {
      setIaError("Falta configurar EXPO_PUBLIC_API_SECRET para usar la generacion con IA.");
      return;
    }

    setIaError("");
    setIsGeneratingIA(true);

    try {
      const token = await getAccessToken();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

      const response = await fetch(`${API_CONFIG.baseUrl}/api/planeaciones/generar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": API_CONFIG.apiSecret,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          prompt,
          nivelAcademico: nivelIA,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const payload = await response.json();

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error || "No se pudo generar la planeacion con IA.");
      }

      const planeacionGenerada = mapResponseToPlaneacion(payload?.data?.planeacion, nivelIA, prompt);
      setPlaneacionGeneradaIA(planeacionGenerada);
      setIaDocId(null);
      setShowTemplateModal(false);
      setShowPreviewModal(true);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error inesperado al generar la planeacion.";
      setIaError(errorMessage);
    } finally {
      setIsGeneratingIA(false);
    }
  }, [nivelIA, promptIA]);

  const ensurePlaneacionIAGuardada = useCallback(async (): Promise<{ docId: string; nivel: NivelAcademicoV2 } | null> => {
    if (!planeacionGeneradaIA) {
      setIaError("No hay una planeacion generada.");
      return null;
    }

    const nivelV2 = mapLegacyToV2Nivel(planeacionGeneradaIA.nivelAcademico as NivelAcademicoLegacy);
    const selectedTemplate = templateById.get(selectedTemplateId)?.plantilla;
    const fallbackTemplate =
      templatesBase.find((item) => item.nivelAcademico === nivelV2) || templatesBase[0];

    const templateToUse =
      selectedTemplate && selectedTemplate.nivelAcademico === nivelV2 ? selectedTemplate : fallbackTemplate;

    if (!templateToUse) {
      setIaError("No se encontro una plantilla base para crear el documento.");
      return null;
    }

    if (iaDocId) {
      return { docId: iaDocId, nivel: nivelV2 };
    }

    const baseDoc = buildDocumentoFromPlantilla(templateToUse, {
      userId: String(usuario?.id ?? "guest"),
      usuario,
    });
    const completedDoc = applyIAResultToDocument(baseDoc, planeacionGeneradaIA);

    await crear(completedDoc);
    setIaDocId(completedDoc.id);
    return { docId: completedDoc.id, nivel: completedDoc.nivelAcademico };
  }, [crear, iaDocId, planeacionGeneradaIA, selectedTemplateId, templateById, templatesBase, usuario]);

  const handleGuardarPlaneacionIA = useCallback(async () => {
    try {
      const created = await ensurePlaneacionIAGuardada();
      if (!created) return;

      await forceSync();
      setShowPreviewModal(false);
      setShowTemplateModal(false);
      showInfoMessage("Planeacion IA", "Planeacion guardada y sincronizada correctamente.");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "No se pudo guardar/sincronizar la planeacion generada.";
      setIaError(errorMessage);
    }
  }, [ensurePlaneacionIAGuardada, forceSync]);

  const handleEditarPlaneacionIA = useCallback(async () => {
    try {
      const created = await ensurePlaneacionIAGuardada();
      if (!created) return;

      setShowPreviewModal(false);
      setShowTemplateModal(false);

      navigation.navigate("DocEditor", {
        modo: "editar",
        planeacionId: created.docId,
        nivelAcademico: created.nivel,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "No se pudo abrir el editor de la planeacion generada.";
      setIaError(errorMessage);
    }
  }, [ensurePlaneacionIAGuardada, navigation]);

  const handleRegenerarPlaneacionIA = useCallback(async () => {
    setShowPreviewModal(false);
    await handleGenerarConIA();
  }, [handleGenerarConIA]);

  return {
    niveles: LEVEL_OPTIONS,
    nivelSeleccionado,
    sections,
    selectedTemplateId,
    isLoadingPlantillas,
    isSubmitting,
    setNivelSeleccionado,
    seleccionarPlantilla,
    crearDesdePlantillaSeleccionada,
    handleEscanearPlantilla,
    handleImportarPlaneacion,
    handleGenerarConIADesdeSelector,
    showTemplateModal,
    showNivelModal,
    showPreviewModal,
    promptIA,
    nivelIA,
    isGeneratingIA,
    iaError,
    planeacionGeneradaIA,
    setPromptIA,
    setNivelIA,
    handleCrearDesdeCero,
    handleSeleccionarNivel,
    handleCloseNivelModal,
    handleCloseModal,
    handleClosePreview,
    handleGenerarConIA,
    handleGuardarPlaneacionIA,
    handleEditarPlaneacionIA,
    handleRegenerarPlaneacionIA,
  };
};

export default useCrearPlaneacionViewModel;
