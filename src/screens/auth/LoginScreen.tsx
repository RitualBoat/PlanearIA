import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { COLORS, FONT_SIZES } from "../../../types";
import { isWeb, responsive } from "../../utils/responsive";
import { useLoginViewModel } from "../../hooks/useLoginViewModel";

const loginImage = require("../../../assets/PlanearIA.png");

/**
 * Pantalla de inicio de sesion (View)
 * Solo JSX y StyleSheet - la logica vive en useLoginViewModel
 */
const LoginScreen: React.FC = () => {
  const {
    formData,
    isLoading,
    updateFormData,
    handleLogin,
    handleForgotPassword,
    handleRegister,
    handleEntrarComoInvitado,
  } = useLoginViewModel();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        {/* Contenedor centrado para web */}
        <View style={styles.loginCard}>
          {/* Logo de la aplicacion */}
          <Image source={loginImage} style={styles.loginImage} />
          {/* titulo */}
          <Text style={styles.title}>Sistema de Planeaciones</Text>
          <Text style={styles.subtitle}>PlanearIA</Text>

          {/* formulario */}
          <View style={styles.formContainer}>
            {/* Campo de usuario */}
            <TextInput
              style={styles.input}
              placeholder="Usuario"
              placeholderTextColor={COLORS.textSecondary}
              value={formData.username}
              onChangeText={(text) => updateFormData("username", text)}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            {/* Campo de contraseña */}
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor={COLORS.textSecondary}
              value={formData.password}
              onChangeText={(text) => updateFormData("password", text)}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            {/* Boton de iniciar sesion */}
            <TouchableOpacity
              style={[styles.loginButton, { opacity: isLoading ? 0.6 : 1 }]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? "Cargando..." : "Iniciar Sesión"}
              </Text>
            </TouchableOpacity>
          </View>
          {/* Enlaces adicionales */}
          <View style={styles.linksContainer}>
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={styles.link}>Registrate</Text>
            </TouchableOpacity>
          </View>

          {/* Entrar como invitado */}
          <TouchableOpacity
            style={styles.guestButton}
            onPress={handleEntrarComoInvitado}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Text style={styles.guestButtonText}>Entrar como invitado</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
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
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loginCard: {
    width: "100%",
    maxWidth: isWeb() ? 450 : 400,
    backgroundColor: isWeb() ? COLORS.surface : "transparent",
    borderRadius: isWeb() ? 16 : 0,
    padding: isWeb() ? 40 : 20,
    alignItems: "center",
    ...(isWeb() && {
      boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
    }),
  },
  loginImage: {
    width: responsive(120, 140, 160),
    height: responsive(120, 140, 160),
    marginBottom: responsive(20, 25, 30),
    borderRadius: responsive(60, 70, 80),
  },
  title: {
    fontSize: responsive(FONT_SIZES.xxlarge, FONT_SIZES.xxlarge + 4, FONT_SIZES.xxlarge + 8),
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: responsive(FONT_SIZES.large, FONT_SIZES.large + 2, FONT_SIZES.large + 4),
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: responsive(30, 35, 40),
  },
  formContainer: {
    width: "100%",
    maxWidth: responsive(300, 350, 380),
  },
  input: {
    height: 50,
    borderColor: COLORS.textSecondary,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: FONT_SIZES.medium,
    backgroundColor: COLORS.surface,
    color: COLORS.text,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    boxShadow: "0px 2px 3.84px rgba(26, 26, 26, 0.25)",
  },
  loginButtonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.medium,
    fontWeight: "bold",
  },
  linksContainer: {
    marginTop: 30,
    alignItems: "center",
    gap: 15,
  },
  linkText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.medium,
  },
  link: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.medium,
    textDecorationLine: "underline",
  },
  guestButton: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
    alignItems: "center",
  },
  guestButtonText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
  },
});
export default LoginScreen;
