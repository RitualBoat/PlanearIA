import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { COLORS, FONT_SIZES } from "../../../types";

/**
 * Tipo para las props de navegación
 */
type CalificacionesScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Calificaciones"
>;

/**
 * Props del componente
 */
interface CalificacionesScreenProps {
  navigation: CalificacionesScreenNavigationProp;
}

/**
 * Pantalla de Calificaciones
 * Permite gestionar las calificaciones de los alumnos
 */
const CalificacionesScreen: React.FC<CalificacionesScreenProps> = ({
  navigation,
}) => {
  /**
   * Navega a registrar calificaciones
   */
  const handleRegistrarCalificaciones = (): void => {
    console.log("Registrar calificaciones");
  };

  /**
   * Navega a ver calificaciones
   */
  const handleVerCalificaciones = (): void => {
    console.log("Ver calificaciones");
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Gestión de Calificaciones</Text>
        <Text style={styles.subtitle}>
          Administra las calificaciones de tus alumnos
        </Text>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.optionCard}
            onPress={handleRegistrarCalificaciones}
            activeOpacity={0.7}
          >
            <View
              style={[styles.iconContainer, { backgroundColor: "#4CAF50" }]}
            >
              <MaterialIcons name="edit-note" size={60} color="white" />
            </View>
            <Text style={styles.optionTitle}>Registrar Calificaciones</Text>
            <Text style={styles.optionDescription}>
              Captura las calificaciones de tus alumnos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionCard}
            onPress={handleVerCalificaciones}
            activeOpacity={0.7}
          >
            <View
              style={[styles.iconContainer, { backgroundColor: "#FF9800" }]}
            >
              <MaterialIcons name="assessment" size={60} color="white" />
            </View>
            <Text style={styles.optionTitle}>Consultar Calificaciones</Text>
            <Text style={styles.optionDescription}>
              Revisa y analiza las calificaciones registradas
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
});

export default CalificacionesScreen;
