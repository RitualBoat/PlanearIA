import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { COLORS, FONT_SIZES } from "../../../types";
import GenerarPlaneacionIAForm from "../../components/GenerarPlaneacionIAForm";
import { useCrearPlaneacionViewModel } from "../../hooks/useCrearPlaneacionViewModel";

const GenerarPlaneacionIAScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
    promptIA,
    nivelIA,
    isGeneratingIA,
    iaError,
    planeacionGeneradaIA,
    setPromptIA,
    setNivelIA,
    handleGenerarConIA,
    handleGuardarPlaneacionIA,
  } = useCrearPlaneacionViewModel();

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Regresar"
          >
            <MaterialIcons name="arrow-back" size={26} color={COLORS.text} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Generar Planeación</Text>

          <View style={styles.iconButton}>
            <MaterialIcons name="auto-awesome" size={22} color={COLORS.primary} />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          bounces={false}
        >
          <Text style={styles.sectionCaption}>INSTRUCCIONES PARA LA IA</Text>

          <GenerarPlaneacionIAForm
            prompt={promptIA}
            nivelSeleccionado={nivelIA}
            isGenerating={isGeneratingIA}
            errorMessage={iaError}
            onChangePrompt={setPromptIA}
            onSelectNivel={setNivelIA}
            onGenerate={handleGenerarConIA}
          />

          {isGeneratingIA ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingText}>Generando vista previa...</Text>
            </View>
          ) : null}

          {planeacionGeneradaIA ? (
            <View style={styles.previewSection}>
              <View style={styles.previewHeaderRow}>
                <Text style={styles.previewTitle}>Vista Previa</Text>
                <View style={styles.previewLine} />
              </View>

              <View style={styles.blockCardHighlighted}>
                <Text style={styles.blockLabel}>OBJETIVO</Text>
                <Text style={styles.blockText}>
                  {planeacionGeneradaIA.aprendizajesEsperados?.[0] || "Objetivo generado por IA."}
                </Text>
              </View>

              <Text style={styles.blockLabel}>ACTIVIDADES</Text>
              {planeacionGeneradaIA.actividades.map((actividad, index) => (
                <View style={styles.activityCard} key={`${actividad.tipo}_${index}`}>
                  <Text style={styles.activityIndex}>{String(index + 1).padStart(2, "0")}</Text>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>
                      {actividad.tipo.charAt(0).toUpperCase() + actividad.tipo.slice(1)}
                    </Text>
                    <Text style={styles.activityDesc}>{actividad.descripcion}</Text>
                  </View>
                </View>
              ))}

              <View style={styles.resourcesCard}>
                <Text style={styles.blockLabel}>RECURSOS</Text>
                {planeacionGeneradaIA.recursos.length > 0 ? (
                  planeacionGeneradaIA.recursos.map((recurso, index) => (
                    <Text style={styles.resourceItem} key={`${recurso}_${index}`}>
                      • {recurso}
                    </Text>
                  ))
                ) : (
                  <Text style={styles.resourceItem}>• Recursos sugeridos por IA</Text>
                )}
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleGuardarPlaneacionIA}>
                <MaterialIcons name="save" size={20} color={COLORS.surface} />
                <Text style={styles.saveButtonText}>Guardar Planeación</Text>
              </TouchableOpacity>

              <Text style={styles.warningText}>
                La IA puede cometer errores. Revisa siempre el contenido pedagógico.
              </Text>
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingTop: 4,
    paddingBottom: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: "700",
    color: COLORS.text,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingBottom: 30,
    gap: 14,
  },
  sectionCaption: {
    marginTop: 8,
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.small,
  },
  previewSection: {
    marginTop: 10,
    gap: 12,
  },
  previewHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  previewTitle: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: "700",
    color: COLORS.text,
  },
  previewLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.secondary,
  },
  blockCardHighlighted: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    padding: 14,
    gap: 6,
  },
  blockLabel: {
    fontSize: FONT_SIZES.small,
    color: COLORS.primary,
    fontWeight: "800",
    letterSpacing: 1,
  },
  blockText: {
    fontSize: FONT_SIZES.large,
    color: COLORS.text,
    fontStyle: "italic",
    lineHeight: 28,
  },
  activityCard: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.textSecondary + "22",
  },
  activityIndex: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.xlarge,
    fontWeight: "800",
    width: 28,
    textAlign: "center",
  },
  activityContent: {
    flex: 1,
    gap: 4,
  },
  activityTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZES.large,
    fontWeight: "700",
  },
  activityDesc: {
    color: COLORS.text,
    fontSize: FONT_SIZES.medium,
    lineHeight: 24,
  },
  resourcesCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  resourceItem: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.large,
    lineHeight: 28,
    fontWeight: "600",
  },
  saveButton: {
    marginTop: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  saveButtonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.xlarge,
    fontWeight: "700",
  },
  warningText: {
    textAlign: "center",
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.medium,
    fontStyle: "italic",
    marginTop: 2,
  },
});

export default GenerarPlaneacionIAScreen;
