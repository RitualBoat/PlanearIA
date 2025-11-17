import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  SafeAreaView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { CommonActions } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { COLORS, FONT_SIZES } from "../../../types";
import BottomNavBar from "../../components/BottomNavBar";

/**
 * Tipo para las props de navegación
 */
type CuentaScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Cuenta"
>;

/**
 * Props del componente
 */
interface CuentaScreenProps {
  navigation: CuentaScreenNavigationProp;
}

/**
 * Pantalla de Cuenta y Seguridad
 * Permite gestionar la configuración del usuario
 */
const CuentaScreen: React.FC<CuentaScreenProps> = ({ navigation }) => {
  /**
   * Navega a editar perfil
   */
  const handleEditarPerfil = (): void => {
    console.log("Editar perfil");
  };

  /**
   * Navega a cambiar contraseña
   */
  const handleCambiarContrasena = (): void => {
    console.log("Cambiar contraseña");
  };

  /**
   * Maneja el cierre de sesión
   */
  const handleCerrarSesion = (): void => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro de que deseas cerrar sesión?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Cerrar Sesión",
        style: "destructive",
        onPress: () => {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "Login" }],
            })
          );
        },
      },
    ]);
  };

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
    elevation: 4,
    shadowColor: COLORS.text,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
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
