import React, { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { EditorBridge } from "@10play/tentap-editor";
import type { RootStackParamList } from "../../navigation/StackNavigator";
import { useTheme } from "../../context/ThemeContext";
import { useEditorMode } from "../../hooks/useEditorMode";
import { useDocEditorViewModel, type DocSectionId } from "../../hooks/useDocEditorViewModel";
import { useCopiloto } from "../../hooks/useCopiloto";
import { AIToolbar, EditorToolbar, SectionNavigator } from "../../components/editor";
import type { AIActionType, AIToolbarResult } from "../../components/editor";
import {
  SeccionCurricular,
  SeccionDatosGenerales,
  SeccionEvaluacion,
  SeccionFirmas,
  SeccionInfoInstitucional,
  SeccionObservaciones,
  SeccionSesiones,
} from "../../components/editor/sections";
import type { ActividadesCopiloto } from "../../services/copilotoService";
import type { InstrumentoEvaluacion } from "../../../types/planeacionV2";

type Nav = StackNavigationProp<RootStackParamList, "DocEditor">;

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
      const json = JSON.parse(trimmed) as { content?: Array<{ content?: Array<{ text?: string }> }> };
      return (json.content || [])
        .flatMap((node) => node.content || [])
        .map((node) => node.text || "")
        .join(" ")
        .trim();
    } catch {
      return value;
    }
  }
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
};

const buildSectionText = (sectionId: DocSectionId, vm: ReturnType<typeof useDocEditorViewModel>): string => {
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
      .map((sesion) => [sesion.inicio, sesion.desarrollo, sesion.cierre, sesion.tarea].map(stripRichText).join("\n"))
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

const DocEditorScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const editorMode = useEditorMode();
  const vm = useDocEditorViewModel();
  const copiloto = useCopiloto();
  const [activeInlineEditor, setActiveInlineEditor] = useState<EditorBridge | null>(null);

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

  const handleAIAction = async (action: AIActionType): Promise<AIToolbarResult> => {
    if (action === "sugerir") {
      const targetSession = vm.documento.sesiones.find((sesion) => sesion.tipo === "regular") || vm.documento.sesiones[0];
      const response = await copiloto.sugerirActividades(vm.documento, targetSession);
      const { actividades } = response.resultado;
      return {
        title: "Actividades sugeridas",
        message: response.resultado.mensaje,
        detail: `Inicio: ${actividades.inicio.slice(0, 90)}...`,
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
        insertLabel: "Insertar rubrica",
        payload: {
          kind: "evaluacion",
          evaluacion: response.resultado.evaluacion,
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
    };
  };

  const handleInsertAIResult = async (result: AIToolbarResult) => {
    const payload = result.payload as
      | { kind: "actividades"; actividades: ActividadesCopiloto }
      | { kind: "texto"; sectionId: DocSectionId; texto: string }
      | { kind: "evaluacion"; evaluacion: InstrumentoEvaluacion }
      | undefined;

    if (!payload) return;

    if (payload.kind === "actividades") {
      const targetId =
        vm.documento.sesiones.find((sesion) => sesion.tipo === "regular")?.id || vm.documento.sesiones[0]?.id;
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
          sesion.id === targetId ? { ...sesion, desarrollo: toRichTextString(payload.texto) } : sesion
        )
      );
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
      return <SeccionObservaciones value={vm.documento.observaciones} onChange={vm.setObservaciones} />;
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

  const contentSections =
    editorMode.mode === "mobile"
      ? [vm.activeSectionId]
      : (vm.sectionsProgress.map((item) => item.id) as DocSectionId[]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
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
        <Pressable
          style={[
            styles.saveButton,
            {
              backgroundColor: vm.isSaving ? colors.surfaceContainerHigh : colors.primary,
            },
          ]}
          onPress={() => {
            void vm.guardarDocumento();
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
      </View>

      <View style={styles.toolbarStack}>
        <EditorToolbar editor={activeInlineEditor} mode={editorMode.mode} disabled={vm.isSaving} />
        <AIToolbar
          mode={editorMode.mode}
          disabled={vm.isSaving || copiloto.isLoading}
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

      <View style={styles.body}>
        <SectionNavigator
          sections={sections}
          activeSectionId={vm.activeSectionId}
          onSectionChange={(sectionId) => vm.setActiveSectionId(sectionId as DocSectionId)}
          mode={editorMode.mode}
        />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {contentSections.map((sectionId) => (
            <View key={sectionId} style={styles.sectionBlock}>
              {renderSection(sectionId)}
            </View>
          ))}
          <View style={{ height: 28 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
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
  toolbarStack: {
    padding: 12,
    paddingBottom: 8,
    gap: 8,
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
  scrollContent: {
    paddingTop: 10,
    paddingBottom: 22,
    gap: 10,
  },
  sectionBlock: {
    gap: 8,
  },
});

export default DocEditorScreen;


