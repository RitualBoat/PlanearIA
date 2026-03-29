import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { COLORS, FONT_SIZES } from "../../../types";
import BottomNavBar from "../../components/BottomNavBar";

/**
 * Tipo para las props de navegación
 */
type PlaneacionesScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Planeaciones"
>;

/**
 * Props del componente
 */
interface PlaneacionesScreenProps {
  navigation: PlaneacionesScreenNavigationProp;
}

/**
 * Pantalla de Planeaciones
 * Muestra las opciones para gestionar planeaciones
 */
const PlaneacionesScreen: React.FC<PlaneacionesScreenProps> = ({
  navigation,
}) => {
  /**
   * Navega a crear nueva planeación
   */
  const handleCrearNueva = (): void => {
    navigation.navigate("CrearPlaneacion");
  };

  /**
   * Función para ver planeaciones guardadas
   */
  const handleVerPlaneaciones = (): void => {
    navigation.navigate("ListaPlaneaciones");
  };

  const handleImportarPlaneacion = (): void => {
    navigation.navigate("ImportarPlaneacion");
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Título */}
          <Text style={styles.title}>Gestión de Planeaciones</Text>
          <Text style={styles.subtitle}>
            Selecciona una opción para continuar
          </Text>

          {/* Opciones */}
          <View style={styles.optionsContainer}>
            {/* Opción 1: Crear Nueva Planeación */}
            <TouchableOpacity
              style={styles.optionCard}
              onPress={handleCrearNueva}
              activeOpacity={0.7}
            >
              <View
                style={[styles.iconContainer, { backgroundColor: "#4CAF50" }]}
              >
                <MaterialIcons name="add-circle" size={60} color="white" />
              </View>
              <Text style={styles.optionTitle}>Crear Nueva Planeación</Text>
              <Text style={styles.optionDescription}>
                Crea una planeación desde cero o usando una plantilla
              </Text>
            </TouchableOpacity>

            {/* Opción 2: Ver Planeaciones */}
            <TouchableOpacity
              style={styles.optionCard}
              onPress={handleVerPlaneaciones}
              activeOpacity={0.7}
            >
              <View
                style={[styles.iconContainer, { backgroundColor: "#2196F3" }]}
              >
                <MaterialIcons name="folder-open" size={60} color="white" />
              </View>
              <Text style={styles.optionTitle}>Mis Planeaciones</Text>
              <Text style={styles.optionDescription}>
                Consulta y edita tus planeaciones guardadas
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionCard}
              onPress={handleImportarPlaneacion}
              activeOpacity={0.7}
            >
              <View
                style={[styles.iconContainer, { backgroundColor: "#1976D2" }]}
              >
                <MaterialIcons name="upload-file" size={60} color="white" />
              </View>
              <Text style={styles.optionTitle}>Importar Planeación</Text>
              <Text style={styles.optionDescription}>
                Importa una planeación desde PDF o DOCX para revisarla antes de guardar
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

      <BottomNavBar currentScreen="Planeaciones" />
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

export default PlaneacionesScreen;
