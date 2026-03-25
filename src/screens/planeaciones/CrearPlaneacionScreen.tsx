import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { COLORS, FONT_SIZES } from "../../../types";
import BottomNavBar from "../../components/BottomNavBar";
import GenerarPlaneacionIAForm from "../../components/GenerarPlaneacionIAForm";
import { useCrearPlaneacionViewModel } from "../../hooks/useCrearPlaneacionViewModel";
import type { RootStackParamList } from "../../navigation/StackNavigator";

/**
 * Pantalla para crear una nueva planeación (View)
 * Solo JSX y StyleSheet - la logica vive en useCrearPlaneacionViewModel
 */
const CrearPlaneacionScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const {
    showTemplateModal,
    showNivelModal,
    showPreviewModal,
    promptIA,
    nivelIA,
    isGeneratingIA,
    iaError,
    planeacionGeneradaIA,
    nivelesAcademicos,
    setPromptIA,
    setNivelIA,
    handleCrearDesdeCero,
    handleSeleccionarNivel,
    handleCloseNivelModal,
    handleGenerarPlantilla,
    handleCloseModal,
    handleClosePreview,
    handleGenerarConIA,
    handleGuardarPlaneacionIA,
    handleEditarPlaneacionIA,
    handleRegenerarPlaneacionIA,
  } = useCrearPlaneacionViewModel();

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={false}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Título */}
          <Text style={styles.title}>Crear Nueva Planeación</Text>
          <Text style={styles.subtitle}>Elige cómo deseas crear tu planeación</Text>

          {/* Opciones */}
          <View style={styles.optionsContainer}>
            {/* Opción 1: Crear desde cero */}
            <TouchableOpacity
              style={styles.optionCard}
              onPress={handleCrearDesdeCero}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: "#FF9800" }]}>
                <MaterialIcons name="edit" size={60} color="white" />
              </View>
              <Text style={styles.optionTitle}>Crear desde Cero</Text>
              <Text style={styles.optionDescription}>
                Crea tu planeación manualmente llenando todos los campos
              </Text>
            </TouchableOpacity>

            {/* Opción 2: Generar con plantilla */}
            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => navigation.navigate("GenerarPlaneacionIA")}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: "#9C27B0" }]}>
                <MaterialIcons name="auto-awesome" size={60} color="white" />
              </View>
              <Text style={styles.optionTitle}>Generar con IA</Text>
              <Text style={styles.optionDescription}>
                Genera una plantilla automáticamente usando inteligencia artificial
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ScrollView>

      {/* Modal para seleccionar nivel académico */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showNivelModal}
        onRequestClose={handleCloseNivelModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Selecciona el Nivel Académico</Text>
            <Text style={styles.modalSubtitle}>Elige el nivel educativo para tu planeación</Text>

            <ScrollView style={styles.modalContent}>
              {nivelesAcademicos.map((item) => (
                <TouchableOpacity
                  key={item.nivel}
                  style={styles.nivelCard}
                  onPress={() => handleSeleccionarNivel(item.nivel)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.nivelIconContainer, { backgroundColor: item.color }]}>
                    <MaterialIcons name={item.icon as any} size={40} color="white" />
                  </View>
                  <View style={styles.nivelInfo}>
                    <Text style={styles.nivelTitulo}>{item.titulo}</Text>
                    <Text style={styles.nivelDescripcion}>{item.descripcion}</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.closeButton} onPress={handleCloseNivelModal}>
              <Text style={styles.closeButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal para seleccionar parámetros de plantilla */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showTemplateModal}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Generar Plantilla con IA</Text>
            <Text style={styles.modalSubtitle}>Escribe tu prompt y selecciona nivel académico</Text>

            <ScrollView style={styles.modalContent}>
              <GenerarPlaneacionIAForm
                prompt={promptIA}
                nivelSeleccionado={nivelIA}
                isGenerating={isGeneratingIA}
                errorMessage={iaError}
                onChangePrompt={setPromptIA}
                onSelectNivel={setNivelIA}
                onGenerate={handleGenerarConIA}
              />
            </ScrollView>

            {/* Botones del modal */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCloseModal}
                disabled={isGeneratingIA}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showPreviewModal}
        onRequestClose={handleClosePreview}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Vista previa de planeación IA</Text>
            <Text style={styles.modalSubtitle}>Revisa antes de guardar</Text>

            <ScrollView style={styles.modalContent}>
              <View style={styles.previewCard}>
                <Text style={styles.previewTitle}>
                  {planeacionGeneradaIA?.temaSesion || "Sin tema"}
                </Text>
                <Text style={styles.previewLine}>
                  <Text style={styles.previewLabel}>Asignatura: </Text>
                  {planeacionGeneradaIA?.asignatura || "-"}
                </Text>
                <Text style={styles.previewLine}>
                  <Text style={styles.previewLabel}>Grado/Grupo: </Text>
                  {planeacionGeneradaIA?.grado || "-"} {planeacionGeneradaIA?.grupo || ""}
                </Text>
                <Text style={styles.previewLine}>
                  <Text style={styles.previewLabel}>Nivel: </Text>
                  {planeacionGeneradaIA?.nivelAcademico || "-"}
                </Text>
                <Text style={styles.previewLine}>
                  <Text style={styles.previewLabel}>Actividades: </Text>
                  {planeacionGeneradaIA?.actividades?.length || 0}
                </Text>
                <Text style={styles.previewLine}>
                  <Text style={styles.previewLabel}>Evaluación: </Text>
                  {planeacionGeneradaIA?.evaluacion || "-"}
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalButtonsColumn}>
              <TouchableOpacity
                style={[styles.modalButton, styles.generateButton]}
                onPress={handleGuardarPlaneacionIA}
                disabled={isGeneratingIA}
              >
                <Text style={styles.generateButtonText}>Guardar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.editButton]}
                onPress={handleEditarPlaneacionIA}
                disabled={isGeneratingIA}
              >
                <Text style={styles.editButtonText}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleRegenerarPlaneacionIA}
                disabled={isGeneratingIA}
              >
                <Text style={styles.cancelButtonText}>Regenerar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleClosePreview}
                disabled={isGeneratingIA}
              >
                <Text style={styles.cancelButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomNavBar currentScreen="Crear Planeación" />
    </View>
  );
};

/**
 * Estilos del componente
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    paddingTop: 10,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 8,
    marginTop: 10,
  },
  subtitle: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 30,
  },
  optionsContainer: {
    gap: 20,
  },
  optionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 15,
    padding: 25,
    alignItems: "center",
    boxShadow: "0px 2px 8px rgba(26, 26, 26, 0.2)",
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  optionTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 8,
    textAlign: "center",
  },
  optionDescription: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 15,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },
  modalContent: {
    maxHeight: 400,
  },
  parameterSection: {
    marginBottom: 15,
  },
  parameterLabel: {
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  parameterInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.textSecondary + "40",
  },
  parameterText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 10,
  },
  modalButtonsColumn: {
    marginTop: 20,
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
  },
  generateButton: {
    backgroundColor: COLORS.primary,
  },
  generateButtonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
  },
  editButton: {
    backgroundColor: COLORS.primary + "22",
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  editButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
  },
  previewCard: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.textSecondary + "33",
    gap: 6,
  },
  previewTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 6,
  },
  previewLine: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
    lineHeight: 20,
  },
  previewLabel: {
    fontWeight: "700",
    color: COLORS.text,
  },
  nivelCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.textSecondary + "20",
  },
  nivelIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  nivelInfo: {
    flex: 1,
  },
  nivelTitulo: {
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  nivelDescripcion: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
  },
  closeButton: {
    alignSelf: "center",
    marginTop: 15,
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
  },
  closeButtonText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
  },
});

export default CrearPlaneacionScreen;
