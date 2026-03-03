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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { COLORS, FONT_SIZES } from "../../../types";
import BottomNavBar from "../../components/BottomNavBar";
import { NivelAcademico } from "../../../types/planeacion";

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
  const [showNivelModal, setShowNivelModal] = useState(false);

  /**
   * Opciones de nivel académico
   */
  const nivelesAcademicos = [
    {
      nivel: NivelAcademico.PRIMARIA,
      titulo: "Primaria",
      descripcion: "1° a 6° grado",
      icon: "school",
      color: "#4CAF50",
    },
    {
      nivel: NivelAcademico.SECUNDARIA,
      titulo: "Secundaria",
      descripcion: "1° a 3° grado",
      icon: "menu-book",
      color: "#2196F3",
    },
    {
      nivel: NivelAcademico.PREPARATORIA,
      titulo: "Preparatoria",
      descripcion: "Bachillerato",
      icon: "library-books",
      color: "#FF9800",
    },
    {
      nivel: NivelAcademico.UNIVERSIDAD,
      titulo: "Universidad",
      descripcion: "Licenciatura y posgrado",
      icon: "account-balance",
      color: "#9C27B0",
    },
  ];

  /**
   * Muestra el modal de selección de nivel académico
   */
  const handleCrearDesdeCero = (): void => {
    setShowNivelModal(true);
  };

  /**
   * Navega a la pantalla de edición con el nivel seleccionado
   */
  const handleSeleccionarNivel = (nivel: NivelAcademico): void => {
    setShowNivelModal(false);
    navigation.navigate("EditorPlaneacion", { nivel, modo: "crear" });
  };

  /**
   * Cierra el modal de nivel académico
   */
  const handleCloseNivelModal = (): void => {
    setShowNivelModal(false);
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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={false}
      >
        <SafeAreaView style={styles.safeArea}>
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
            <Text style={styles.modalSubtitle}>
              Elige el nivel educativo para tu planeación
            </Text>

            <ScrollView style={styles.modalContent}>
              {nivelesAcademicos.map((item) => (
                <TouchableOpacity
                  key={item.nivel}
                  style={styles.nivelCard}
                  onPress={() => handleSeleccionarNivel(item.nivel)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.nivelIconContainer,
                      { backgroundColor: item.color },
                    ]}
                  >
                    <MaterialIcons
                      name={item.icon as any}
                      size={40}
                      color="white"
                    />
                  </View>
                  <View style={styles.nivelInfo}>
                    <Text style={styles.nivelTitulo}>{item.titulo}</Text>
                    <Text style={styles.nivelDescripcion}>
                      {item.descripcion}
                    </Text>
                  </View>
                  <MaterialIcons
                    name="chevron-right"
                    size={24}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCloseNivelModal}
            >
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
