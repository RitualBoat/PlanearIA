import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
  Pressable,
  SafeAreaView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { COLORS, FONT_SIZES } from "../../../types";
import BottomNavBar from "../../components/BottomNavBar";

/**
 * Tipo para las props de navegación
 */
type CrearPlaneacionScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "CrearPlaneacion"
>;

/**
 * Props del componente
 */
interface CrearPlaneacionScreenProps {
  navigation: CrearPlaneacionScreenNavigationProp;
}

/**
 * Pantalla para crear una nueva planeación
 * Ofrece dos opciones: crear desde cero o generar con plantilla
 */
const CrearPlaneacionScreen: React.FC<CrearPlaneacionScreenProps> = ({
  navigation,
}) => {
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  /**
   * Maneja la creación desde cero
   */
  const handleCrearDesdeCero = (): void => {
    console.log("Crear planeación desde cero");
    // Aquí se navegará a la pantalla de edición manual
  };

  /**
   * Muestra el modal de selección de parámetros para plantilla
   */
  const handleGenerarPlantilla = (): void => {
    setShowTemplateModal(true);
  };

  /**
   * Cierra el modal de plantilla
   */
  const handleCloseModal = (): void => {
    setShowTemplateModal(false);
  };

  /**
   * Genera la plantilla con IA según los parámetros seleccionados
   */
  const handleGenerarConIA = (): void => {
    console.log("Generando plantilla con IA");
    setShowTemplateModal(false);
    // Aquí se llamará a la IA y se navegará a la pantilla editable
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Título */}
          <Text style={styles.title}>Crear Nueva Planeación</Text>
          <Text style={styles.subtitle}>
            Elige cómo deseas crear tu planeación
          </Text>

          {/* Opciones */}
          <View style={styles.optionsContainer}>
            {/* Opción 1: Crear desde cero */}
            <TouchableOpacity
              style={styles.optionCard}
              onPress={handleCrearDesdeCero}
              activeOpacity={0.7}
            >
              <View
                style={[styles.iconContainer, { backgroundColor: "#FF9800" }]}
              >
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
              onPress={handleGenerarPlantilla}
              activeOpacity={0.7}
            >
              <View
                style={[styles.iconContainer, { backgroundColor: "#9C27B0" }]}
              >
                <MaterialIcons name="auto-awesome" size={60} color="white" />
              </View>
              <Text style={styles.optionTitle}>Generar con IA</Text>
              <Text style={styles.optionDescription}>
                Genera una plantilla automáticamente usando inteligencia
                artificial
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

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
            <Text style={styles.modalSubtitle}>
              Selecciona los parámetros para tu planeación
            </Text>

            <ScrollView style={styles.modalContent}>
              {/* Aquí irían los campos de selección */}
              <View style={styles.parameterSection}>
                <Text style={styles.parameterLabel}>Materia</Text>
                <TouchableOpacity style={styles.parameterInput}>
                  <Text style={styles.parameterText}>Seleccionar materia</Text>
                  <MaterialIcons
                    name="arrow-drop-down"
                    size={24}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.parameterSection}>
                <Text style={styles.parameterLabel}>Carrera</Text>
                <TouchableOpacity style={styles.parameterInput}>
                  <Text style={styles.parameterText}>Seleccionar carrera</Text>
                  <MaterialIcons
                    name="arrow-drop-down"
                    size={24}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.parameterSection}>
                <Text style={styles.parameterLabel}>Semestre</Text>
                <TouchableOpacity style={styles.parameterInput}>
                  <Text style={styles.parameterText}>Seleccionar semestre</Text>
                  <MaterialIcons
                    name="arrow-drop-down"
                    size={24}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.parameterSection}>
                <Text style={styles.parameterLabel}>Periodo</Text>
                <TouchableOpacity style={styles.parameterInput}>
                  <Text style={styles.parameterText}>Seleccionar periodo</Text>
                  <MaterialIcons
                    name="arrow-drop-down"
                    size={24}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Botones del modal */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCloseModal}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.generateButton]}
                onPress={handleGenerarConIA}
              >
                <Text style={styles.generateButtonText}>Generar</Text>
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
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
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
    elevation: 4,
    shadowColor: COLORS.text,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
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
});

export default CrearPlaneacionScreen;
