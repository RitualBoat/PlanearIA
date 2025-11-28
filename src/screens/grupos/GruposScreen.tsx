import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
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
type GruposScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Grupos"
>;

/**
 * Props del componente
 */
interface GruposScreenProps {
  navigation: GruposScreenNavigationProp;
}

/**
 * Pantalla principal de Grupos
 * Menú central para gestionar grupos de alumnos
 */
const GruposScreen: React.FC<GruposScreenProps> = ({ navigation }) => {
  /**
   * Navega a crear nuevo grupo
   */
  const handleCrearGrupo = (): void => {
    navigation.navigate("CrearGrupo");
  };

  /**
   * Navega a ver lista de grupos
   */
  const handleVerGrupos = (): void => {
    navigation.navigate("ListaGrupos");
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Gestión de Grupos</Text>
          <Text style={styles.subtitle}>
            Administra tus grupos, alumnos, calificaciones y más
          </Text>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.optionCard}
              onPress={handleCrearGrupo}
              activeOpacity={0.7}
            >
              <View
                style={[styles.iconContainer, { backgroundColor: "#4CAF50" }]}
              >
                <MaterialIcons name="group-add" size={60} color="white" />
              </View>
              <Text style={styles.optionTitle}>Crear Nuevo Grupo</Text>
              <Text style={styles.optionDescription}>
                Crea un nuevo grupo de alumnos para una materia
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionCard}
              onPress={handleVerGrupos}
              activeOpacity={0.7}
            >
              <View
                style={[styles.iconContainer, { backgroundColor: "#2196F3" }]}
              >
                <MaterialIcons name="groups" size={60} color="white" />
              </View>
              <Text style={styles.optionTitle}>Mis Grupos</Text>
              <Text style={styles.optionDescription}>
                Consulta y gestiona tus grupos existentes
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

      <BottomNavBar currentScreen="Grupos" />
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
});

export default GruposScreen;
