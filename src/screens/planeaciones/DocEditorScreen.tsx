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
import { AIToolbar, EditorToolbar, SectionNavigator } from "../../components/editor";
import {
  SeccionCurricular,
  SeccionDatosGenerales,
  SeccionEvaluacion,
  SeccionFirmas,
  SeccionInfoInstitucional,
  SeccionObservaciones,
  SeccionSesiones,
} from "../../components/editor/sections";

type Nav = StackNavigationProp<RootStackParamList, "DocEditor">;

const formatDraftLabel = (value: string | null): string => {
  if (!value) return "Sin borrador";
  const date = new Date(value);
  return `Borrador: ${date.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}`;
};

const DocEditorScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const editorMode = useEditorMode();
  const vm = useDocEditorViewModel();
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
          disabled={vm.isSaving}
          onAction={async (action) =>
            `Accion "${action}" registrada. La integracion real del copiloto se conecta en Fase 6.`
          }
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


