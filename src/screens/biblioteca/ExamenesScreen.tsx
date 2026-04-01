import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { COLORS, FONT_SIZES } from "../../../types";
import logger from "../../utils/logger";

/**
 * Tipo para las props de navegación
 */
type ExamenesScreenNavigationProp = StackNavigationProp<RootStackParamList, "Examenes">;

/**
 * Props del componente
 */
interface ExamenesScreenProps {
  navigation: ExamenesScreenNavigationProp;
}

/**
 * Pantalla de Exámenes
 * Permite crear exámenes con IA, plantillas o manualmente
 */
const ExamenesScreen: React.FC<ExamenesScreenProps> = ({ navigation }) => {
  const handleCrearConIA = (): void => {
    logger.log("Crear examen con IA");
  };

  const handleUsarPlantilla = (): void => {
    logger.log("Usar plantilla de examen");
  };

  const handleCrearManual = (): void => {
    logger.log("Crear examen manualmente");
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Crear Examen</Text>
          <Text style={styles.subtitle}>Elige cómo quieres crear tu examen</Text>

          <View style={styles.optionsContainer}>
            {/* Opción IA */}
            <TouchableOpacity
              style={styles.optionCard}
              onPress={handleCrearConIA}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: "#9C27B020" }]}>
                <MaterialIcons name="auto-awesome" size={60} color={COLORS.purple} />
              </View>
              <Text style={styles.optionTitle}>Generar con IA</Text>
              <Text style={styles.optionDescription}>
                La IA creará preguntas basadas en tus temas
              </Text>
            </TouchableOpacity>

            {/* Opción Plantillas */}
            <TouchableOpacity
              style={styles.optionCard}
              onPress={handleUsarPlantilla}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: "#2196F320" }]}>
                <MaterialIcons name="dashboard" size={60} color={COLORS.primaryLight} />
              </View>
              <Text style={styles.optionTitle}>Usar Plantilla</Text>
              <Text style={styles.optionDescription}>
                Elige una plantilla prediseñada y personalízala
              </Text>
            </TouchableOpacity>

            {/* Opción Manual */}
            <TouchableOpacity
              style={styles.optionCard}
              onPress={handleCrearManual}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: "#4CAF5020" }]}>
                <MaterialIcons name="edit" size={60} color={COLORS.success} />
              </View>
              <Text style={styles.optionTitle}>Crear Manualmente</Text>
              <Text style={styles.optionDescription}>
                Crea tu examen desde cero con editor completo
              </Text>
            </TouchableOpacity>
          </View>

          {/* Vista previa: opcion de asignacion */}
          <View style={styles.infoSection}>
            <MaterialIcons name="info" size={24} color={COLORS.primary} />
            <Text style={styles.infoText}>
              Al crear un examen, podrás elegir entre guardarlo en tu biblioteca o asignarlo
              directamente a un grupo
            </Text>
          </View>

          {/* Preview de la futura funcionalidad */}
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>Próximamente disponible:</Text>
            <View style={styles.previewOption}>
              <MaterialIcons name="save" size={20} color={COLORS.textSecondary} />
              <Text style={styles.previewText}>Solo guardar en Mis Recursos</Text>
            </View>
            <View style={styles.previewOption}>
              <MaterialIcons name="assignment-turned-in" size={20} color={COLORS.textSecondary} />
              <Text style={styles.previewText}>Guardar y asignar a un grupo</Text>
            </View>
          </View>
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
  scrollContent: {
    width: "100%",
    maxWidth: 960,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 110,
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
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    alignItems: "center",
    boxShadow: "0px 10px 22px rgba(33, 60, 109, 0.08)",
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
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  // Estilos para preview
  infoSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${COLORS.primary}10`,
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZES.small,
    color: COLORS.text,
    lineHeight: 20,
  },
  previewCard: {
    backgroundColor: COLORS.surfaceTertiary,
    padding: 20,
    borderRadius: 10,
    marginTop: 15,
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderStyle: "dashed",
  },
  previewTitle: {
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 15,
  },
  previewOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 10,
  },
  previewText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
  },
});

export default ExamenesScreen;
