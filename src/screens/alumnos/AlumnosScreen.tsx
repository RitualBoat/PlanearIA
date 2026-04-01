import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { COLORS, FONT_SIZES } from "../../../types";
import BottomNavBar from "../../components/BottomNavBar";

/**
 * Tipo para las props de navegación
 */
type AlumnosScreenNavigationProp = StackNavigationProp<RootStackParamList, "ListaAlumnos">;

/**
 * Props del componente
 */
interface AlumnosScreenProps {
  navigation: AlumnosScreenNavigationProp;
}

/**
 * Pantalla de Alumnos
 * Permite gestionar la información de los alumnos
 */
const AlumnosScreen: React.FC<AlumnosScreenProps> = ({ navigation }) => {
  /**
   * Navega a agregar nuevo alumno
   */
  const handleAgregarAlumno = (): void => {
    navigation.navigate("CrearAlumno");
  };

  /**
   * Navega a ver lista de alumnos
   */
  const handleVerAlumnos = (): void => {
    navigation.navigate("ListaAlumnos");
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />
      <BottomNavBar currentScreen="Alumnos" showBackButton={false} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Gestión de Alumnos</Text>
          <Text style={styles.subtitle}>Administra la información de tus estudiantes</Text>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.optionCard}
              onPress={handleAgregarAlumno}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: COLORS.success }]}>
                <MaterialIcons name="person-add" size={60} color="white" />
              </View>
              <Text style={styles.optionTitle}>Agregar Alumno</Text>
              <Text style={styles.optionDescription}>
                Registra un nuevo estudiante en el sistema
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionCard}
              onPress={handleVerAlumnos}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: COLORS.primaryLight }]}>
                <MaterialIcons name="groups" size={60} color="white" />
              </View>
              <Text style={styles.optionTitle}>Mis Alumnos</Text>
              <Text style={styles.optionDescription}>
                Consulta y edita la información de tus alumnos
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

export default AlumnosScreen;
