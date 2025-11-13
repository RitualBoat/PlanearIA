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
type RecursosScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Recursos"
>;

/**
 * Props del componente
 */
interface RecursosScreenProps {
  navigation: RecursosScreenNavigationProp;
}

/**
 * Pantalla de Recursos
 * Permite gestionar los recursos didácticos
 */
const RecursosScreen: React.FC<RecursosScreenProps> = ({ navigation }) => {
  /**
   * Navega a subir recurso
   */
  const handleSubirRecurso = (): void => {
    console.log("Subir nuevo recurso");
  };

  /**
   * Navega a ver recursos
   */
  const handleVerRecursos = (): void => {
    console.log("Ver recursos");
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Gestión de Recursos</Text>
        <Text style={styles.subtitle}>
          Administra materiales y recursos didácticos
        </Text>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.optionCard}
            onPress={handleSubirRecurso}
            activeOpacity={0.7}
          >
            <View
              style={[styles.iconContainer, { backgroundColor: "#4CAF50" }]}
            >
              <MaterialIcons name="cloud-upload" size={60} color="white" />
            </View>
            <Text style={styles.optionTitle}>Subir Recurso</Text>
            <Text style={styles.optionDescription}>
              Agrega nuevos materiales y documentos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionCard}
            onPress={handleVerRecursos}
            activeOpacity={0.7}
          >
            <View
              style={[styles.iconContainer, { backgroundColor: "#00BCD4" }]}
            >
              <MaterialIcons name="folder-open" size={60} color="white" />
            </View>
            <Text style={styles.optionTitle}>Mis Recursos</Text>
            <Text style={styles.optionDescription}>
              Consulta tus materiales guardados
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

export default RecursosScreen;
