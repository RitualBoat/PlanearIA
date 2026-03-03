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
import { COLORS, FONT_SIZES } from "../../../types";
import BottomNavBar from "../../components/BottomNavBar";
import { useCuentaViewModel } from "../../hooks/useCuentaViewModel";

/**
 * Pantalla de Cuenta y Seguridad (View)
 * Solo JSX y StyleSheet - la logica vive en useCuentaViewModel
 */
const CuentaScreen: React.FC = () => {
  const { handleEditarPerfil, handleCambiarContrasena, handleCerrarSesion } =
    useCuentaViewModel();

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Cuenta y Seguridad</Text>
          <Text style={styles.subtitle}>
            Gestiona tu información personal y configuración
          </Text>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.optionCard}
              onPress={handleEditarPerfil}
              activeOpacity={0.7}
            >
              <View
                style={[styles.iconContainer, { backgroundColor: "#2196F3" }]}
              >
                <MaterialIcons name="person" size={60} color="white" />
              </View>
              <Text style={styles.optionTitle}>Editar Perfil</Text>
              <Text style={styles.optionDescription}>
                Actualiza tu información personal
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionCard}
              onPress={handleCambiarContrasena}
              activeOpacity={0.7}
            >
              <View
                style={[styles.iconContainer, { backgroundColor: "#FF9800" }]}
              >
                <MaterialIcons name="lock" size={60} color="white" />
              </View>
              <Text style={styles.optionTitle}>Cambiar Contraseña</Text>
              <Text style={styles.optionDescription}>
                Actualiza tu contraseña de acceso
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionCard, styles.logoutCard]}
              onPress={handleCerrarSesion}
              activeOpacity={0.7}
            >
              <View
                style={[styles.iconContainer, { backgroundColor: "#F44336" }]}
              >
                <MaterialIcons name="logout" size={60} color="white" />
              </View>
              <Text style={[styles.optionTitle, styles.logoutTitle]}>
                Cerrar Sesión
              </Text>
              <Text style={styles.optionDescription}>
                Sal de tu cuenta de forma segura
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

      <BottomNavBar currentScreen="Cuenta" />
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
  logoutCard: {
    borderWidth: 1,
    borderColor: "#F44336",
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
  logoutTitle: {
    color: "#F44336",
  },
  optionDescription: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
});

export default CuentaScreen;
