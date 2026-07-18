import React from "react";
import {
  Pressable,
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { COLORS, FONT_SIZES } from "../../../types";
import { isWeb } from "../../utils/responsive";
import {
  useBreakpoint,
  resolveResponsive,
  type Breakpoint,
} from "../../hooks/useBreakpoint";
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
    handleLoginDesarrollador,
    isDevMode,
  } = useLoginViewModel();

  // Fuente reactiva unica del ancho: al rotar o redimensionar, `breakpoint` cambia y
  // `getStyles` se recalcula, en vez de quedar clavado en el valor tomado al importar.
  const { breakpoint } = useBreakpoint();
  const styles = React.useMemo(() => getStyles(breakpoint), [breakpoint]);

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
            <Pressable
              style={({ pressed }) => [
                styles.loginButton,
                { opacity: isLoading ? 0.6 : 1 },
                pressed && { opacity: 0.6 },
              ]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? "Cargando..." : "Iniciar Sesión"}
              </Text>
            </Pressable>
          </View>
          {/* Enlaces adicionales */}
          <View style={styles.linksContainer}>
            <Pressable
              style={({ pressed }) => pressed && { opacity: 0.6 }}
              onPress={handleForgotPassword}
            >
              <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => pressed && { opacity: 0.6 }}
              onPress={handleRegister}
            >
              <Text style={styles.link}>Registrate</Text>
            </Pressable>
          </View>

          {/* Entrar como invitado */}
          <Pressable
            style={({ pressed }) => [styles.guestButton, pressed && { opacity: 0.7 }]}
            onPress={handleEntrarComoInvitado}
            disabled={isLoading}
          >
            <Text style={styles.guestButtonText}>Entrar como invitado</Text>
          </Pressable>

          {/* Modo desarrollador — solo visible en __DEV__ */}
          {isDevMode && (
            <Pressable
              style={({ pressed }) => [styles.devButton, pressed && { opacity: 0.7 }]}
              onPress={handleLoginDesarrollador}
              disabled={isLoading}
            >
              <Text style={styles.devButtonText}>🛠 Dev Login (Admin)</Text>
            </Pressable>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

/**
 * Estilos del componente. Es una fabrica que recibe el `breakpoint` vigente para que
 * los tamanos dependientes de ancho se reevaluen en cada resize/rotacion. Conserva
 * `COLORS`/`FONT_SIZES` estaticos: migrar el tema en runtime es `tokens-completos`,
 * fuera del alcance de este change. Se exporta para poder probar el reflow por rango.
 */
export const getStyles = (breakpoint: Breakpoint) => StyleSheet.create({
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
    width: resolveResponsive(breakpoint, 120, 140, 160),
    height: resolveResponsive(breakpoint, 120, 140, 160),
    marginBottom: resolveResponsive(breakpoint, 20, 25, 30),
    borderRadius: resolveResponsive(breakpoint, 60, 70, 80),
  },
  title: {
    fontSize: resolveResponsive(breakpoint, FONT_SIZES.xxlarge, FONT_SIZES.xxlarge + 4, FONT_SIZES.xxlarge + 8),
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: resolveResponsive(breakpoint, FONT_SIZES.large, FONT_SIZES.large + 2, FONT_SIZES.large + 4),
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: resolveResponsive(breakpoint, 30, 35, 40),
  },
  formContainer: {
    width: "100%",
    maxWidth: resolveResponsive(breakpoint, 300, 350, 380),
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
  devButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F58026",
    borderStyle: "dashed",
    alignItems: "center",
    backgroundColor: "#FFF8F1",
  },
  devButtonText: {
    color: "#F58026",
    fontSize: FONT_SIZES.small,
    fontWeight: "700",
  },
});
export default LoginScreen;
