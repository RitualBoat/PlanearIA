import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { COLORS, FONT_SIZES } from "../../../types";

/**
 * Tipo para las props de navegación
 */
type CalificacionesScreenNavigationProp = StackNavigationProp<RootStackParamList>;

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
const CalificacionesScreen: React.FC<CalificacionesScreenProps> = ({ navigation }) => {
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
      <StatusBar backgroundColor="#EEF3FA" barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Gestión de Calificaciones</Text>
          <Text style={styles.subtitle}>Administra las calificaciones de tus alumnos</Text>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.optionCard}
              onPress={handleRegistrarCalificaciones}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: "#4CAF50" }]}>
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
              <View style={[styles.iconContainer, { backgroundColor: "#FF9800" }]}>
                <MaterialIcons name="assessment" size={60} color="white" />
              </View>
              <Text style={styles.optionTitle}>Consultar Calificaciones</Text>
              <Text style={styles.optionDescription}>
                Revisa y analiza las calificaciones registradas
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

/**
 * Estilos del componente
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF3FA",
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
});

export default CalificacionesScreen;
