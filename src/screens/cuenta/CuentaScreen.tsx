import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { COLORS } from "../../../types";
import { useCuentaViewModel } from "../../hooks/useCuentaViewModel";
import { isWeb } from "../../utils/responsive";

/**
 * Pantalla de Cuenta y Seguridad (View)
 * Solo JSX y StyleSheet - la logica vive en useCuentaViewModel
 */
const CuentaScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const wideLayout = width >= 920;

  const { handleEditarPerfil, handleCambiarContrasena, handleCerrarSesion } =
    useCuentaViewModel();

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#EEF3FA" barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerBlock}>
            <Text style={styles.title}>Configuración</Text>
            <Text style={styles.subtitle}>Administra tu perfil, seguridad y preferencias de la cuenta.</Text>
          </View>

          <View style={[styles.quickPanel, wideLayout && styles.quickPanelWide]}>
            <View style={styles.quickCard}>
              <Text style={styles.quickValue}>100%</Text>
              <Text style={styles.quickLabel}>Perfil completo</Text>
            </View>
            <View style={styles.quickCard}>
              <Text style={styles.quickValue}>2</Text>
              <Text style={styles.quickLabel}>Alertas activas</Text>
            </View>
            <View style={styles.quickCard}>
              <Text style={styles.quickValue}>Pro</Text>
              <Text style={styles.quickLabel}>Plan actual</Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>CUENTA Y SEGURIDAD</Text>

          <View style={[styles.optionsContainer, wideLayout && styles.optionsContainerWide]}>
            <TouchableOpacity
              style={[styles.optionCard, wideLayout && styles.optionCardWide]}
              onPress={handleEditarPerfil}
              activeOpacity={0.85}
            >
              <View style={[styles.iconContainer, { backgroundColor: "#1676D2" }]}>
                <MaterialIcons name="person" size={28} color="#FFFFFF" />
              </View>
              <Text style={styles.optionTitle}>Editar Perfil</Text>
              <Text style={styles.optionDescription}>
                Actualiza tu nombre, avatar y datos personales.
              </Text>
              <View style={styles.optionFooter}>
                <Text style={styles.optionCta}>Editar datos</Text>
                <MaterialIcons name="arrow-forward" size={18} color="#1676D2" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionCard, wideLayout && styles.optionCardWide]}
              onPress={handleCambiarContrasena}
              activeOpacity={0.85}
            >
              <View style={[styles.iconContainer, { backgroundColor: "#F59E0B" }]}>
                <MaterialIcons name="lock" size={28} color="#FFFFFF" />
              </View>
              <Text style={styles.optionTitle}>Cambiar Contraseña</Text>
              <Text style={styles.optionDescription}>
                Refuerza la seguridad de tu cuenta de acceso.
              </Text>
              <View style={styles.optionFooter}>
                <Text style={styles.optionCta}>Actualizar clave</Text>
                <MaterialIcons name="arrow-forward" size={18} color="#1676D2" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionCard, styles.logoutCard, wideLayout && styles.optionCardWide]}
              onPress={handleCerrarSesion}
              activeOpacity={0.85}
            >
              <View style={[styles.iconContainer, { backgroundColor: "#D34553" }]}>
                <MaterialIcons name="logout" size={28} color="#FFFFFF" />
              </View>
              <Text style={[styles.optionTitle, styles.logoutTitle]}>
                Cerrar Sesión
              </Text>
              <Text style={styles.optionDescription}>
                Sal de tu cuenta de forma segura
              </Text>
              <View style={styles.optionFooter}>
                <Text style={[styles.optionCta, styles.logoutTitle]}>Salir ahora</Text>
                <MaterialIcons name="arrow-forward" size={18} color="#D34553" />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.tipCard}>
            <MaterialIcons name="verified-user" size={18} color="#0B6F86" />
            <Text style={styles.tipText}>
              Tip de seguridad: cambia tu contraseña periódicamente y evita usar la misma en otros servicios.
            </Text>
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
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: isWeb() ? 28 : 110,
    gap: 14,
    width: "100%",
    alignSelf: "center",
    maxWidth: 1220,
  },
  headerBlock: {
    gap: 2,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#1E2A3A",
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 15,
    color: "#5C6E86",
  },
  quickPanel: {
    gap: 10,
  },
  quickPanelWide: {
    flexDirection: "row",
  },
  quickCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E3EAF4",
    padding: 14,
    flex: 1,
  },
  quickValue: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1E2A3A",
    lineHeight: 36,
  },
  quickLabel: {
    marginTop: 2,
    fontSize: 13,
    color: "#6B7D96",
    fontWeight: "600",
  },
  sectionLabel: {
    marginTop: 4,
    fontSize: 13,
    color: "#5D6F86",
    fontWeight: "800",
    letterSpacing: 1.1,
  },
  optionsContainer: {
    gap: 12,
  },
  optionsContainerWide: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  optionCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E3EAF4",
    gap: 8,
    boxShadow: "0px 10px 22px rgba(33, 60, 109, 0.08)",
  },
  optionCardWide: {
    width: "49%",
  },
  logoutCard: {
    borderWidth: 1,
    borderColor: "#F6C4CB",
    backgroundColor: "#FFF9FA",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E2A3A",
  },
  logoutTitle: {
    color: "#D34553",
  },
  optionDescription: {
    fontSize: 14,
    color: "#5C6E86",
    lineHeight: 20,
  },
  optionFooter: {
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E8EEF6",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionCta: {
    color: "#1676D2",
    fontSize: 14,
    fontWeight: "700",
  },
  tipCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BBE7F0",
    backgroundColor: "#EAF8FB",
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: "#0B6F86",
    lineHeight: 18,
  },
});

export default CuentaScreen;
