import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { EditorBridge } from "@10play/tentap-editor";
import type { RootStackParamList } from "../../navigation/StackNavigator";
import { useTheme } from "../../context/ThemeContext";
import { useEditorMode } from "../../hooks/useEditorMode";
import { useDocEditorViewModel, type DocSectionId } from "../../hooks/useDocEditorViewModel";
import { useCopiloto } from "../../hooks/useCopiloto";
import {
  AIToolbar,
  type AIActionType,
  type AIToolbarResult,
} from "../../components/editor/AIToolbar";
import { EditorToolbar } from "../../components/editor/EditorToolbar";
import { SectionNavigator } from "../../components/editor/SectionNavigator";
import { RichTextEditor } from "../../components/editor/RichTextEditor";
import { SeccionCurricular } from "../../components/editor/sections/SeccionCurricular";
import { SeccionDatosGenerales } from "../../components/editor/sections/SeccionDatosGenerales";
import { SeccionEvaluacion } from "../../components/editor/sections/SeccionEvaluacion";
import { SeccionFirmas } from "../../components/editor/sections/SeccionFirmas";
import { SeccionInfoInstitucional } from "../../components/editor/sections/SeccionInfoInstitucional";
import { SeccionObservaciones } from "../../components/editor/sections/SeccionObservaciones";
import { SeccionSesiones } from "../../components/editor/sections/SeccionSesiones";
import type { ActividadesCopiloto } from "../../services/copilotoService";
import type { InstrumentoEvaluacion } from "../../../types/planeacionV2";
import { setGlobalKeyboardDismissHandler } from "../../utils/keyboardDismissController";

type Nav = StackNavigationProp<RootStackParamList, "DocEditor">;
type PageFormat = "a4" | "carta";
type LogoSlotId = "tecnm" | "institucion";

interface LogoSlot {
  id: LogoSlotId;
  label: string;
  uri?: string;
  nombre?: string;
  mimeType?: string;
  sizeBytes?: number;
  maxWidthPx: number;
  maxHeightPx: number;
}

const PAGE_PRESETS: Record<PageFormat, { label: string; width: number; minHeight: number }> = {
  a4: { label: "A4", width: 794, minHeight: 1123 },
  carta: { label: "Carta", width: 816, minHeight: 1056 },
};

const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024;
const MAX_LOGO_SIDE_PX = 1500;
const DEFAULT_LOGO_SLOTS: LogoSlot[] = [
  {
    id: "tecnm",
    label: "Logo izquierdo",
    maxWidthPx: 1300,
    maxHeightPx: 400,
  },
  {
    id: "institucion",
    label: "Logo derecho",
    maxWidthPx: 500,
    maxHeightPx: 500,
  },
];

const formatDraftLabel = (value: string | null): string => {
  if (!value) return "Sin borrador";
  const date = new Date(value);
  return `Borrador: ${date.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}`;
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

const stripRichText = (value?: string): string => {
  if (!value) return "";
  const trimmed = value.trim();
  if (trimmed.startsWith("{")) {
    try {
      const json = JSON.parse(trimmed) as {
        content?: Array<{ content?: Array<{ text?: string }> }>;
      };
      return (json.content || []).reduce<string[]>((acc, node) => {
        for (const child of node.content || []) {
          const text = child.text;
          if (text) acc.push(text);
        }
        return acc;
      }, [])
        .join(" ")
        .trim();
    } catch {
      return value;
    }
  }
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const normalizeEditorInitialContent = (value?: string): string | Record<string, unknown> => {
  if (!value) return "";
  const trimmed = value.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      return JSON.parse(trimmed) as Record<string, unknown>;
    } catch {
      return value;
    }
  }
  return value;
};

const showMessage = (title: string, message: string) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
    return;
  }

  Alert.alert(title, message);
};

const normalizeLogoSlots = (value: unknown): LogoSlot[] => {
  if (!Array.isArray(value)) return DEFAULT_LOGO_SLOTS;
  const byId = new Map(
    value
      .filter((item): item is LogoSlot => Boolean(item && typeof item === "object" && "id" in item))
      .map((item) => [item.id, item])
  );
  return DEFAULT_LOGO_SLOTS.map((slot) => ({
    ...slot,
    ...(byId.get(slot.id) || {}),
  }));
};

const getImageSize = (uri: string): Promise<{ width: number; height: number }> =>
  new Promise((resolve, reject) => {
    Image.getSize(uri, (width, height) => resolve({ width, height }), reject);
  });

const buildSectionText = (
  sectionId: DocSectionId,
  vm: ReturnType<typeof useDocEditorViewModel>
): string => {
  const doc = vm.documento;
  if (sectionId === "curricular") {
    return [
      doc.elementosCurriculares.proposito,
      doc.elementosCurriculares.contenido,
      doc.elementosCurriculares.pda,
      doc.elementosCurriculares.producto,
    ]
      .filter(Boolean)
      .join("\n");
  }
  if (sectionId === "sesiones") {
    return doc.sesiones
      .map((sesion) =>
        [sesion.inicio, sesion.desarrollo, sesion.cierre, sesion.tarea]
          .map(stripRichText)
          .join("\n")
      )
      .join("\n\n");
  }
  if (sectionId === "evaluacion") {
    return doc.evaluacionFinal?.criterios.map((criterio) => criterio.descripcion).join("\n") || "";
  }
  if (sectionId === "observaciones") {
    return doc.observaciones.map((item) => item.texto).join("\n");
  }
  return `${doc.datosGenerales.asignatura} ${doc.datosGenerales.grado}`.trim();
};

const sectionIdToCopiloto = (sectionId: DocSectionId): string => {
  if (sectionId === "info_institucional") return "info_institucional";
  if (sectionId === "datos_generales") return "datos_generales";
  if (sectionId === "curricular") return "curricular";
  if (sectionId === "sesiones") return "sesiones";
  if (sectionId === "evaluacion") return "evaluacion";
  if (sectionId === "observaciones") return "observaciones";
  return "firmas";
};

const DocEditorScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { width: viewportWidth } = useWindowDimensions();
  const { colors } = useTheme();
  const editorMode = useEditorMode();
  const vm = useDocEditorViewModel();
  const copiloto = useCopiloto();
  const [activeInlineEditor, setActiveInlineEditor] = useState<EditorBridge | null>(null);
  const [mobileView, setMobileView] = useState<"documento" | "formulario">("documento");
  const [desktopView, setDesktopView] = useState<"mixto" | "documento" | "formulario">("mixto");
  const [isFullscreenDoc, setIsFullscreenDoc] = useState(false);
  const [pageFormat, setPageFormat] = useState<PageFormat>("a4");
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const isMobileMode = editorMode.mode === "mobile";
  const isWeb = Platform.OS === "web";
  const lastEditorPayloadRef = useRef(vm.documento.contenidoRaw || "");
  const skipUnsavedPromptRef = useRef(false);
  const saveFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const logoSlots = useMemo(
    () => normalizeLogoSlots(vm.documento.camposNivel?.plantillaLogos),
    [vm.documento.camposNivel?.plantillaLogos]
  );

  useEffect(() => {
    lastEditorPayloadRef.current = vm.documento.contenidoRaw || "";
  }, [vm.documento.contenidoRaw]);

  useEffect(() => {
    if (isWeb || !isMobileMode) return undefined;
    const handler = () => activeInlineEditor?.blur?.();
    setGlobalKeyboardDismissHandler(handler);
    return () => {
      setGlobalKeyboardDismissHandler(null);
    };
  }, [activeInlineEditor, isMobileMode, isWeb]);

  useEffect(() => {
    return () => {
      if (saveFeedbackTimerRef.current) {
        clearTimeout(saveFeedbackTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isWeb) return undefined;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!vm.isDirty || skipUnsavedPromptRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isWeb, vm.isDirty]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (event) => {
      if (!vm.isDirty || skipUnsavedPromptRef.current) return;
      (event as { preventDefault?: () => void }).preventDefault?.();

      const continueNavigation = () => {
        skipUnsavedPromptRef.current = true;
        navigation.dispatch(event.data.action);
      };

      if (isWeb) {
        if (window.confirm("Tienes cambios sin guardar. ¿Quieres salir sin guardar?")) {
          continueNavigation();
        }
        return;
      }

      Alert.alert(
        "Cambios sin guardar",
        "Guarda la planeacion antes de salir o descarta los cambios.",
        [
          { text: "Seguir editando", style: "cancel" },
          { text: "Salir sin guardar", style: "destructive", onPress: continueNavigation },
        ]
      );
    });

    return () => {
      unsubscribe();
    };
  }, [isWeb, navigation, vm.isDirty]);

  const showSaveFeedback = useCallback((message: string) => {
    setSaveFeedback(message);
    if (saveFeedbackTimerRef.current) {
      clearTimeout(saveFeedbackTimerRef.current);
    }
    saveFeedbackTimerRef.current = setTimeout(() => {
      setSaveFeedback(null);
    }, 3200);
  }, []);

  const handleSaveDocument = useCallback(
    async (salir = false) => {
      try {
        if (salir) skipUnsavedPromptRef.current = true;
        await vm.guardarDocumento({ salir });
        if (!salir) showSaveFeedback("Planeacion guardada correctamente.");
      } catch (caught) {
        skipUnsavedPromptRef.current = false;
        showMessage(
          "No se pudo guardar",
          caught instanceof Error ? caught.message : "Intenta nuevamente."
        );
      }
    },
    [showSaveFeedback, vm]
  );

  const handleEditorContentChange = useCallback(
    (content: Record<string, unknown>) => {
      const serialized = JSON.stringify(content);
      if (lastEditorPayloadRef.current === serialized) return;
      lastEditorPayloadRef.current = serialized;
      vm.setContenidoRaw(serialized);
    },
    [vm]
  );

  const sections = useMemo(
    () =>
      vm.sectionsProgress.map((section) => ({
        id: section.id,
        title: section.title,
        icon: section.icon as keyof typeof MaterialIcons.glyphMap,
        completed: section.completed,
      })),
    [vm.sectionsProgress]
  );

  const replaceLogo = useCallback(
    async (slotId: LogoSlotId) => {
      try {
        const result = await DocumentPicker.getDocumentAsync({
          copyToCacheDirectory: true,
          multiple: false,
          type: ["image/png", "image/jpeg"],
        });

        if (result.canceled) return;
        const asset = result.assets?.[0];
        if (!asset?.uri) throw new Error("No se pudo leer la imagen seleccionada.");
        const mimeType = asset.mimeType || "";
        if (mimeType && !["image/png", "image/jpeg", "image/jpg"].includes(mimeType)) {
          throw new Error("Usa imagen PNG o JPG.");
        }
        if (asset.size && asset.size > MAX_LOGO_SIZE_BYTES) {
          throw new Error("El logo debe pesar menos de 2 MB.");
        }

        const dimensions = await getImageSize(asset.uri);
        if (Math.max(dimensions.width, dimensions.height) > MAX_LOGO_SIDE_PX) {
          throw new Error("El logo debe medir menos de 1500 px en cualquiera de sus lados.");
        }

        const nextSlots = logoSlots.map((slot) =>
          slot.id === slotId
            ? {
                ...slot,
                uri: asset.uri,
                nombre: asset.name,
                mimeType: mimeType || "image",
                sizeBytes: asset.size,
              }
            : slot
        );

        vm.setCamposNivel({
          ...(vm.documento.camposNivel || {}),
          plantillaLogos: nextSlots,
        });
      } catch (caught) {
        showMessage(
          "Logo no valido",
          caught instanceof Error ? caught.message : "No se pudo cargar el logo."
        );
      }
    },
    [logoSlots, vm]
  );

  const handleAIAction = async (action: AIActionType): Promise<AIToolbarResult> => {
    if (action === "sugerir") {
      const targetSession =
        vm.documento.sesiones.find((sesion) => sesion.tipo === "regular") ||
        vm.documento.sesiones[0];
      const response = await copiloto.sugerirActividades(vm.documento, targetSession);
      const { actividades } = response.resultado;
      return {
        title: "Actividades sugeridas",
        message: response.resultado.mensaje,
        detail: `Inicio: ${actividades.inicio.slice(0, 90)}...`,
        warning: response.usage?.warning,
        insertLabel: "Insertar en sesion",
        payload: { kind: "actividades", actividades },
      };
    }

    if (action === "mejorar") {
      const selectedText = buildSectionText(vm.activeSectionId, vm);
      const response = await copiloto.mejorarTexto(vm.documento, selectedText, vm.activeSectionId);
      return {
        title: "Texto mejorado",
        message: response.resultado.mensaje,
        detail: response.resultado.textoMejorado.slice(0, 220),
        warning: response.usage?.warning,
        insertLabel: "Aplicar mejora",
        payload: {
          kind: "texto",
          sectionId: vm.activeSectionId,
          texto: response.resultado.textoMejorado,
        },
      };
    }

    if (action === "rubrica") {
      const response = await copiloto.generarEvaluacion(vm.documento);
      return {
        title: "Rubrica generada",
        message: response.resultado.mensaje,
        detail: `${response.resultado.evaluacion.criterios.length} criterios listos para evaluacion final.`,
        warning: response.usage?.warning,
        insertLabel: "Insertar rubrica",
        payload: {
          kind: "evaluacion",
          evaluacion: response.resultado.evaluacion,
        },
      };
    }

    if (action === "autocompletar") {
      const seccion = sectionIdToCopiloto(vm.activeSectionId);
      const response = await copiloto.autocompletarSeccion(vm.documento, seccion);
      return {
        title: "Seccion autocompletada",
        message: response.resultado.mensaje,
        detail: response.resultado.contenido.slice(0, 220),
        warning: response.usage?.warning,
        insertLabel: "Insertar completado",
        payload: {
          kind: "autocompletar",
          sectionId: vm.activeSectionId,
          contenido: response.resultado.contenido,
        },
      };
    }

    const response = await copiloto.revisarAlineamiento(vm.documento);
    return {
      title: "Revision de alineamiento",
      message: response.resultado.resumen,
      detail: response.resultado.hallazgos
        .map((item) => `${item.prioridad}: ${item.descripcion}`)
        .join("\n"),
      warning: response.usage?.warning,
    };
  };

  const handleInsertAIResult = async (result: AIToolbarResult) => {
    const payload = result.payload as
      | { kind: "actividades"; actividades: ActividadesCopiloto }
      | { kind: "texto"; sectionId: DocSectionId; texto: string }
      | { kind: "autocompletar"; sectionId: DocSectionId; contenido: string }
      | { kind: "evaluacion"; evaluacion: InstrumentoEvaluacion }
      | undefined;

    if (!payload) return;

    if (payload.kind === "actividades") {
      const targetId =
        vm.documento.sesiones.find((sesion) => sesion.tipo === "regular")?.id ||
        vm.documento.sesiones[0]?.id;
      if (!targetId) return;
      vm.setSesiones(
        vm.documento.sesiones.map((sesion) =>
          sesion.id === targetId
            ? {
                ...sesion,
                inicio: toRichTextString(payload.actividades.inicio),
                desarrollo: toRichTextString(payload.actividades.desarrollo),
                cierre: toRichTextString(payload.actividades.cierre),
                tarea: toRichTextString(payload.actividades.tarea || ""),
              }
            : sesion
        )
      );
      vm.setActiveSectionId("sesiones");
      return;
    }

    if (payload.kind === "evaluacion") {
      vm.setEvaluacion({
        evaluacionInicial: vm.documento.evaluacionInicial,
        evaluacionFinal: payload.evaluacion,
      });
      vm.setActiveSectionId("evaluacion");
      return;
    }

    if (payload.kind === "texto") {
      if (payload.sectionId === "curricular") {
        vm.setCurricular({
          ...vm.documento.elementosCurriculares,
          proposito: payload.texto,
        });
        return;
      }

      if (payload.sectionId === "observaciones") {
        vm.setObservaciones([{ texto: payload.texto, categoria: "general" }]);
        return;
      }

      if (payload.sectionId === "sesiones") {
        const targetId = vm.documento.sesiones[0]?.id;
        if (!targetId) return;
        vm.setSesiones(
          vm.documento.sesiones.map((sesion) =>
            sesion.id === targetId
              ? { ...sesion, desarrollo: toRichTextString(payload.texto) }
              : sesion
          )
        );
      }
    }

    if (payload.kind === "autocompletar") {
      if (payload.sectionId === "curricular") {
        vm.setCurricular({
          ...vm.documento.elementosCurriculares,
          proposito: payload.contenido,
        });
        return;
      }

      if (payload.sectionId === "observaciones") {
        vm.setObservaciones([{ texto: payload.contenido, categoria: "general" }]);
        return;
      }

      if (payload.sectionId === "sesiones") {
        const targetId = vm.documento.sesiones[0]?.id;
        if (!targetId) return;
        vm.setSesiones(
          vm.documento.sesiones.map((sesion) =>
            sesion.id === targetId
              ? { ...sesion, desarrollo: toRichTextString(payload.contenido) }
              : sesion
          )
        );
      }
    }
  };

  const renderSection = (sectionId: DocSectionId) => {
    const commonProps = {
      mode: editorMode.mode,
    };

    if (sectionId === "info_institucional") {
      return (
        <SeccionInfoInstitucional
          value={vm.documento.infoInstitucional}
          onChange={vm.setInfoInstitucional}
          {...commonProps}
        />
      );
    }

    if (sectionId === "datos_generales") {
      return (
        <SeccionDatosGenerales
          value={vm.documento.datosGenerales}
          onChange={vm.setDatosGenerales}
          {...commonProps}
        />
      );
    }

    if (sectionId === "curricular") {
      return (
        <SeccionCurricular
          value={vm.documento.elementosCurriculares}
          onChange={vm.setCurricular}
          {...commonProps}
          onSuggestPda={async () => {
            return "PDA sugerido: desarrollar habilidades de analisis y expresion con actividades colaborativas.";
          }}
        />
      );
    }

    if (sectionId === "sesiones") {
      return (
        <SeccionSesiones
          sesiones={vm.documento.sesiones}
          onChange={vm.setSesiones}
          {...commonProps}
          onActiveEditor={setActiveInlineEditor}
        />
      );
    }

    if (sectionId === "evaluacion") {
      return (
        <SeccionEvaluacion
          evaluacionInicial={vm.documento.evaluacionInicial}
          evaluacionFinal={vm.documento.evaluacionFinal}
          onChange={vm.setEvaluacion}
        />
      );
    }

    if (sectionId === "observaciones") {
      return (
        <SeccionObservaciones value={vm.documento.observaciones} onChange={vm.setObservaciones} />
      );
    }

    return (
      <SeccionFirmas
        value={vm.documento.firmas}
        defaultNombre={vm.documento.datosGenerales.maestro}
        onChange={vm.setFirmas}
      />
    );
  };

  if (vm.isLoading) {
    return (
      <SafeAreaView style={[styles.loaderScreen, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  const contentSections = isMobileMode
    ? [vm.activeSectionId]
    : (vm.sectionsProgress.map((item) => item.id) as DocSectionId[]);
  const currentPagePreset = PAGE_PRESETS[pageFormat];
  const pageWidth = isWeb
    ? Math.min(currentPagePreset.width, Math.max(320, viewportWidth - (isFullscreenDoc ? 72 : 220)))
    : "100%";

  const showDocumentCanvas = isFullscreenDoc
    ? true
    : isMobileMode
      ? mobileView === "documento"
      : desktopView !== "formulario";
  const showStructuredFields = isFullscreenDoc
    ? false
    : isMobileMode
      ? mobileView === "formulario"
      : desktopView !== "documento";

  return (
    <SafeAreaView
      style={[
        styles.screen,
        { backgroundColor: colors.background },
        isWeb && styles.webScreen,
        isFullscreenDoc && styles.fullscreenScreen,
      ]}
      edges={["top", "left", "right"]}
    >
      <View
        style={[
          styles.header,
          {
            borderBottomColor: colors.borderLight,
            backgroundColor: colors.surfaceContainerLowest,
          },
        ]}
      >
        <Pressable style={styles.iconAction} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={22} color={colors.onSurface} />
        </Pressable>
        <View style={styles.headerMeta}>
          <Text style={[styles.title, { color: colors.onSurface }]}>DocEditor</Text>
          <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
            {vm.documento.datosGenerales.asignatura || "Sin asignatura"} |{" "}
            {vm.documento.datosGenerales.grado || "Sin grado"}
          </Text>
          <Text style={[styles.draftLabel, { color: colors.onSurfaceVariant }]}>
            {formatDraftLabel(vm.draftSavedAt)}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            style={[
              styles.saveButton,
              {
                backgroundColor: vm.isSaving ? colors.surfaceContainerHigh : colors.primary,
              },
            ]}
            onPress={() => {
              void handleSaveDocument(false);
            }}
            disabled={vm.isSaving}
          >
            {vm.isSaving ? (
              <ActivityIndicator size="small" color={colors.surface} />
            ) : (
              <MaterialIcons name="save" size={18} color={colors.surface} />
            )}
            <Text style={[styles.saveButtonText, { color: colors.surface }]}>Guardar</Text>
          </Pressable>
          <Pressable
            style={[
              styles.saveExitButton,
              {
                borderColor: colors.borderLight,
                backgroundColor: colors.surfaceContainerLow,
                opacity: vm.isSaving ? 0.6 : 1,
              },
            ]}
            onPress={() => {
              void handleSaveDocument(true);
            }}
            disabled={vm.isSaving}
          >
            <MaterialIcons name="exit-to-app" size={17} color={colors.onSurfaceVariant} />
            <Text style={[styles.saveExitButtonText, { color: colors.onSurfaceVariant }]}>
              Guardar y salir
            </Text>
          </Pressable>
        </View>
      </View>

      {saveFeedback ? (
        <View
          style={[
            styles.saveFeedback,
            {
              borderBottomColor: colors.borderLight,
              backgroundColor: colors.successTint,
            },
          ]}
        >
          <MaterialIcons name="check-circle" size={16} color={colors.success} />
          <Text style={[styles.saveFeedbackText, { color: colors.textDark }]}>{saveFeedback}</Text>
        </View>
      ) : null}

      {!isFullscreenDoc ? (
        <View style={styles.toolbarStack}>
          <EditorToolbar
            editor={activeInlineEditor}
            mode={editorMode.mode}
            disabled={vm.isSaving}
          />
          <AIToolbar
            mode={editorMode.mode}
            disabled={vm.isSaving || copiloto.isLoading}
            iaStatusText={
              copiloto.isBackendConfigured
                ? "IA en nube configurada."
                : "Modo local temporal: configura backend para IA en nube."
            }
            onAction={handleAIAction}
            onInsertResult={handleInsertAIResult}
          />
          <View style={styles.undoRow}>
            <Pressable
              style={[
                styles.undoButton,
                {
                  borderColor: colors.borderLight,
                  backgroundColor: colors.surfaceContainerLow,
                  opacity: vm.canUndo ? 1 : 0.45,
                },
              ]}
              disabled={!vm.canUndo}
              onPress={vm.undo}
            >
              <MaterialIcons name="undo" size={16} color={colors.onSurfaceVariant} />
              <Text style={[styles.undoButtonText, { color: colors.onSurfaceVariant }]}>Undo</Text>
            </Pressable>
            <Pressable
              style={[
                styles.undoButton,
                {
                  borderColor: colors.borderLight,
                  backgroundColor: colors.surfaceContainerLow,
                  opacity: vm.canRedo ? 1 : 0.45,
                },
              ]}
              disabled={!vm.canRedo}
              onPress={vm.redo}
            >
              <MaterialIcons name="redo" size={16} color={colors.onSurfaceVariant} />
              <Text style={[styles.undoButtonText, { color: colors.onSurfaceVariant }]}>Redo</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        enabled={!isWeb && isMobileMode}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          style={[styles.body, isWeb && styles.webBody, isFullscreenDoc && styles.fullscreenBody]}
        >
          {isMobileMode ? (
            <View style={styles.mobileViewTabs}>
              <Pressable
                style={[
                  styles.mobileViewTab,
                  mobileView === "documento" && {
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => setMobileView("documento")}
              >
                <Text
                  style={[
                    styles.mobileViewTabText,
                    {
                      color: mobileView === "documento" ? colors.surface : colors.onSurfaceVariant,
                    },
                  ]}
                >
                  Documento
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.mobileViewTab,
                  mobileView === "formulario" && {
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => setMobileView("formulario")}
              >
                <Text
                  style={[
                    styles.mobileViewTabText,
                    {
                      color: mobileView === "formulario" ? colors.surface : colors.onSurfaceVariant,
                    },
                  ]}
                >
                  Formulario
                </Text>
              </Pressable>
            </View>
          ) : null}
          {!isMobileMode ? (
            <View style={styles.desktopViewTabs}>
              {(["mixto", "documento", "formulario"] as const).map((item) => {
                const active = desktopView === item;
                const label =
                  item === "mixto" ? "Mixto" : item === "documento" ? "Documento" : "Formulario";
                return (
                  <Pressable
                    key={item}
                    style={[
                      styles.desktopViewTab,
                      {
                        borderColor: active ? colors.primary : colors.borderLight,
                        backgroundColor: active ? colors.primary : colors.surfaceContainerLow,
                      },
                    ]}
                    onPress={() => setDesktopView(item)}
                  >
                    <Text
                      style={[
                        styles.desktopViewTabText,
                        { color: active ? colors.surface : colors.onSurfaceVariant },
                      ]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              isWeb && styles.webScrollContent,
              isFullscreenDoc && styles.fullscreenScrollContent,
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={isFullscreenDoc || isWeb}
            style={[styles.scrollView, isWeb && styles.webScrollView]}
            nestedScrollEnabled
          >
            {showDocumentCanvas ? (
              <View
                style={[
                  styles.documentCard,
                  isFullscreenDoc && styles.fullscreenDocumentCard,
                  {
                    borderColor: colors.borderLight,
                    backgroundColor: colors.surfaceContainerLowest,
                  },
                ]}
              >
                <View style={styles.documentHeader}>
                  <View>
                    <Text style={[styles.documentTitle, { color: colors.onSurface }]}>
                      Documento
                    </Text>
                    <Text style={[styles.documentSubtitle, { color: colors.onSurfaceVariant }]}>
                      Edicion principal tipo Word/Docs.
                    </Text>
                  </View>
                  <Pressable
                    style={[
                      styles.syncButton,
                      {
                        borderColor: colors.borderLight,
                        backgroundColor: colors.surfaceContainerLow,
                      },
                    ]}
                    onPress={vm.regenerarContenidoRawDesdeCampos}
                  >
                    <MaterialIcons name="sync" size={15} color={colors.onSurfaceVariant} />
                    <Text style={[styles.syncButtonText, { color: colors.onSurfaceVariant }]}>
                      Sincronizar plantilla
                    </Text>
                  </Pressable>
                </View>
                <View style={styles.documentControlsRow}>
                  <View style={styles.pageFormatRow}>
                    {(Object.keys(PAGE_PRESETS) as PageFormat[]).map((item) => {
                      const active = pageFormat === item;
                      return (
                        <Pressable
                          key={item}
                          style={[
                            styles.pageFormatChip,
                            {
                              borderColor: active ? colors.primary : colors.borderLight,
                              backgroundColor: active ? colors.primary : colors.surfaceContainerLow,
                            },
                          ]}
                          onPress={() => setPageFormat(item)}
                        >
                          <Text
                            style={[
                              styles.pageFormatText,
                              { color: active ? colors.surface : colors.onSurfaceVariant },
                            ]}
                          >
                            {PAGE_PRESETS[item].label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <Pressable
                    style={[
                      styles.fullscreenToggle,
                      {
                        borderColor: colors.borderLight,
                        backgroundColor: colors.surfaceContainerLow,
                      },
                    ]}
                    onPress={() => setIsFullscreenDoc((prev) => !prev)}
                  >
                    <MaterialIcons
                      name={isFullscreenDoc ? "fullscreen-exit" : "fullscreen"}
                      size={16}
                      color={colors.onSurfaceVariant}
                    />
                    <Text style={[styles.fullscreenToggleText, { color: colors.onSurfaceVariant }]}>
                      {isFullscreenDoc ? "Salir pantalla completa" : "Pantalla completa"}
                    </Text>
                  </Pressable>
                </View>
                <View
                  style={[
                    styles.documentWorkspace,
                    {
                      backgroundColor: colors.surfaceContainerLow,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.documentPage,
                      {
                        borderColor: colors.borderLight,
                        backgroundColor: colors.surface,
                        minHeight: currentPagePreset.minHeight,
                        width: pageWidth,
                        maxWidth: isWeb ? currentPagePreset.width : 820,
                      },
                    ]}
                  >
                    <View style={styles.logoHeader}>
                      {logoSlots.map((slot) => (
                        <View key={slot.id} style={styles.logoSlot}>
                          {slot.uri ? (
                            <Image
                              source={{ uri: slot.uri }}
                              style={styles.logoImage}
                              resizeMode="contain"
                            />
                          ) : (
                            <View
                              style={[styles.logoPlaceholder, { borderColor: colors.borderLight }]}
                            >
                              <Text
                                style={[
                                  styles.logoPlaceholderText,
                                  { color: colors.onSurfaceVariant },
                                ]}
                              >
                                {slot.label}
                              </Text>
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                    <RichTextEditor
                      mode={editorMode.mode}
                      minHeight={Math.max(460, currentPagePreset.minHeight - 84)}
                      initialContent={normalizeEditorInitialContent(vm.documento.contenidoRaw)}
                      onEditorReady={setActiveInlineEditor}
                      onChange={handleEditorContentChange}
                    />
                  </View>
                </View>
              </View>
            ) : null}

            {showStructuredFields ? (
              <View style={styles.formSection}>
                <View
                  style={[
                    styles.logoPanel,
                    {
                      borderColor: colors.borderLight,
                      backgroundColor: colors.surfaceContainerLowest,
                    },
                  ]}
                >
                  <Text style={[styles.logoPanelTitle, { color: colors.onSurface }]}>
                    Logos del documento
                  </Text>
                  <Text style={[styles.logoPanelText, { color: colors.onSurfaceVariant }]}>
                    PNG/JPG, maximo 2 MB y 1500 px por lado.
                  </Text>
                  <View style={styles.logoControlsRow}>
                    {logoSlots.map((slot) => (
                      <View
                        key={slot.id}
                        style={[
                          styles.logoControlCard,
                          {
                            borderColor: colors.borderLight,
                            backgroundColor: colors.surfaceContainerLow,
                          },
                        ]}
                      >
                        <Text style={[styles.logoControlTitle, { color: colors.onSurface }]}>
                          {slot.label}
                        </Text>
                        <Text style={[styles.logoControlMeta, { color: colors.onSurfaceVariant }]}>
                          {slot.nombre || "Sin imagen"}
                        </Text>
                        <Pressable
                          style={[
                            styles.logoReplaceButton,
                            {
                              borderColor: colors.borderLight,
                              backgroundColor: colors.surfaceContainerLowest,
                            },
                          ]}
                          onPress={() => {
                            void replaceLogo(slot.id);
                          }}
                        >
                          <MaterialIcons name="image" size={16} color={colors.onSurfaceVariant} />
                          <Text
                            style={[styles.logoReplaceText, { color: colors.onSurfaceVariant }]}
                          >
                            Reemplazar
                          </Text>
                        </Pressable>
                      </View>
                    ))}
                  </View>
                </View>
                <SectionNavigator
                  sections={sections}
                  activeSectionId={vm.activeSectionId}
                  onSectionChange={(sectionId) => vm.setActiveSectionId(sectionId as DocSectionId)}
                  mode={editorMode.mode}
                />
                {contentSections.map((sectionId) => (
                  <View key={sectionId} style={styles.sectionBlock}>
                    {renderSection(sectionId)}
                  </View>
                ))}
              </View>
            ) : null}
            <View style={{ height: 28 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  webScreen: {
    height: "100vh" as never,
    maxHeight: "100vh" as never,
    overflow: "hidden" as never,
  },
  fullscreenScreen: {
    position: Platform.OS === "web" ? ("fixed" as never) : "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 9999,
  },
  loaderScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    minHeight: 72,
    borderBottomWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconAction: {
    width: 34,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
  },
  headerMeta: {
    flex: 1,
    minHeight: 50,
    justifyContent: "center",
  },
  headerActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "600",
  },
  draftLabel: {
    fontSize: 11,
  },
  saveButton: {
    borderRadius: 10,
    minHeight: 36,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  saveButtonText: {
    fontSize: 13,
    fontWeight: "700",
  },
  saveExitButton: {
    borderWidth: 1,
    borderRadius: 10,
    minHeight: 36,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  saveExitButtonText: {
    fontSize: 12,
    fontWeight: "800",
  },
  saveFeedback: {
    minHeight: 34,
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  saveFeedbackText: {
    fontSize: 12,
    fontWeight: "700",
  },
  toolbarStack: {
    padding: 12,
    paddingBottom: 8,
    gap: 8,
  },
  keyboardContainer: {
    flex: 1,
  },
  undoRow: {
    flexDirection: "row",
    gap: 8,
  },
  undoButton: {
    borderWidth: 1,
    borderRadius: 999,
    minHeight: 32,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  undoButtonText: {
    fontSize: 12,
    fontWeight: "700",
  },
  body: {
    flex: 1,
    paddingHorizontal: 12,
  },
  webBody: {
    minHeight: 0,
  },
  fullscreenBody: {
    paddingHorizontal: 0,
  },
  scrollView: {
    flex: 1,
  },
  webScrollView: {
    height: "100%" as never,
    overflow: "scroll" as never,
  },
  scrollContent: {
    paddingTop: 10,
    paddingBottom: Platform.OS === "web" ? 110 : 22,
    gap: 10,
    flexGrow: 1,
  },
  webScrollContent: {
    minHeight: "100%" as never,
    paddingBottom: 160,
  },
  fullscreenScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 48,
  },
  mobileViewTabs: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  mobileViewTab: {
    flex: 1,
    minHeight: 34,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "transparent",
  },
  mobileViewTabText: {
    fontSize: 12,
    fontWeight: "700",
  },
  desktopViewTabs: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  desktopViewTab: {
    minHeight: 34,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  desktopViewTabText: {
    fontSize: 12,
    fontWeight: "700",
  },
  documentCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  fullscreenDocumentCard: {
    borderRadius: 0,
    borderWidth: 0,
    minHeight: "100%",
  },
  documentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  documentSubtitle: {
    fontSize: 12,
    fontWeight: "600",
  },
  syncButton: {
    minHeight: 32,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  syncButtonText: {
    fontSize: 12,
    fontWeight: "700",
  },
  documentControlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  pageFormatRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pageFormatChip: {
    minHeight: 30,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  pageFormatText: {
    fontSize: 12,
    fontWeight: "700",
  },
  fullscreenToggle: {
    minHeight: 32,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  fullscreenToggleText: {
    fontSize: 12,
    fontWeight: "700",
  },
  documentWorkspace: {
    borderRadius: 10,
    padding: Platform.OS === "web" ? 24 : 12,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  documentPage: {
    borderRadius: 8,
    borderWidth: 1,
    padding: Platform.OS === "web" ? 20 : 14,
  },
  logoHeader: {
    minHeight: 54,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  logoSlot: {
    width: 86,
    height: 44,
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  logoPlaceholder: {
    flex: 1,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  logoPlaceholderText: {
    fontSize: 9,
    fontWeight: "700",
    textAlign: "center",
  },
  logoPanel: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  logoPanelTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  logoPanelText: {
    fontSize: 12,
    lineHeight: 17,
  },
  logoControlsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  logoControlCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    minWidth: 180,
    flex: 1,
    gap: 6,
  },
  logoControlTitle: {
    fontSize: 12,
    fontWeight: "800",
  },
  logoControlMeta: {
    fontSize: 11,
  },
  logoReplaceButton: {
    minHeight: 32,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  logoReplaceText: {
    fontSize: 12,
    fontWeight: "700",
  },
  formSection: {
    gap: 10,
  },
  sectionBlock: {
    gap: 8,
  },
});

export default DocEditorScreen;
