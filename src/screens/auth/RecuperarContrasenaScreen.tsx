import React, { useState, useRef } from "react";
import {
  Pressable,
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { COLORS, FONT_SIZES } from "../../../types";
import { isWeb } from "../../utils/responsive";
import { useRecuperarContrasenaViewModel } from "../../hooks/useRecuperarContrasenaViewModel";

const RecuperarContrasenaScreen: React.FC = () => {
  const vm = useRecuperarContrasenaViewModel();
  const navigation = useNavigation();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const digitRefs = useRef<(TextInput | null)[]>([]);

  const stepConfig = {
    email: {
      icon: "email" as const,
      title: "Recuperar contraseña",
      subtitle: "Ingresa tu email y te enviaremos un código de verificación",
    },
    codigo: {
      icon: "pin" as const,
      title: "Verificar código",
      subtitle: `Ingresa el código de 6 dígitos enviado a ${vm.email}`,
    },
    nueva: {
      icon: "lock-reset" as const,
      title: "Nueva contraseña",
      subtitle: "Crea una nueva contraseña segura para tu cuenta",
    },
  };

  const current = stepConfig[vm.step];

  const digits = vm.code.padEnd(6, "").split("").slice(0, 6);

  const handleDigitChange = (text: string, index: number) => {
    const newDigits = [...digits];
    newDigits[index] = text.replace(/[^0-9]/g, "").slice(-1);
    vm.setCode(newDigits.join(""));
    if (text && index < 5) {
      digitRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !digits[index] && index > 0) {
      digitRefs.current[index - 1]?.focus();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header bar */}
        <View style={styles.headerBar}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.headerBackBtn, pressed && { opacity: 0.6 }]}
          >
            <MaterialIcons name="arrow-back" size={24} color={COLORS.text} />
          </Pressable>
          <Text style={styles.headerTitle}>PlanearIA</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.iconCircle}>
              <MaterialIcons name={current.icon} size={36} color={COLORS.surface} />
            </View>
            <Text style={styles.title}>{current.title}</Text>
            <Text style={styles.subtitle}>{current.subtitle}</Text>

            {/* Step indicators */}
            <View style={styles.stepsRow}>
              {(["email", "codigo", "nueva"] as const).map((s, i) => (
                <View
                  key={s}
                  style={[
                    styles.stepDot,
                    (vm.step === s ||
                      (vm.step === "codigo" && i === 0) ||
                      (vm.step === "nueva" && i <= 1)) &&
                      styles.stepDotActive,
                  ]}
                />
              ))}
            </View>

            {/* Error */}
            {vm.error ? (
              <View style={styles.errorContainer}>
                <MaterialIcons name="error-outline" size={16} color={COLORS.error} />
                <Text style={styles.errorText}>{vm.error}</Text>
              </View>
            ) : null}

            {/* Step: email */}
            {vm.step === "email" && (
              <View style={styles.formContainer}>
                <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
                <TextInput
                  style={styles.input}
                  placeholder="nombre@ejemplo.com"
                  value={vm.email}
                  onChangeText={vm.setEmail}
                  placeholderTextColor={COLORS.textTertiary}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                  editable={!vm.isLoading}
                />
                <Pressable
                  style={({ pressed }) => [
                    styles.primaryButton,
                    vm.isLoading && styles.primaryButtonDisabled,
                    pressed && { opacity: 0.85 },
                  ]}
                  onPress={vm.handleEnviarCodigo}
                  disabled={vm.isLoading}
                >
                  {vm.isLoading ? (
                    <ActivityIndicator color={COLORS.surface} size="small" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Enviar código</Text>
                  )}
                </Pressable>
              </View>
            )}

            {/* Step: código */}
            {vm.step === "codigo" && (
              <View style={styles.formContainer}>
                <Text style={styles.label}>CÓDIGO DE VERIFICACIÓN</Text>
                <View style={styles.digitsRow}>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <TextInput
                      key={i}
                      ref={(ref) => {
                        digitRefs.current[i] = ref;
                      }}
                      style={styles.digitBox}
                      value={digits[i] || ""}
                      onChangeText={(text) => handleDigitChange(text, i)}
                      onKeyPress={(e) => handleDigitKeyPress(e, i)}
                      placeholderTextColor={COLORS.textTertiary}
                      keyboardType="number-pad"
                      maxLength={1}
                      editable={!vm.isLoading}
                      selectTextOnFocus
                    />
                  ))}
                </View>
                <Pressable
                  style={({ pressed }) => [
                    styles.primaryButton,
                    vm.isLoading && styles.primaryButtonDisabled,
                    pressed && { opacity: 0.85 },
                  ]}
                  onPress={vm.handleVerificarCodigo}
                  disabled={vm.isLoading}
                >
                  <Text style={styles.primaryButtonText}>Verificar código</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [styles.resendButton, pressed && { opacity: 0.7 }]}
                  onPress={vm.handleEnviarCodigo}
                  disabled={vm.isLoading}
                >
                  <Text style={styles.resendText}>
                    ¿No recibiste el código?{" "}
                    <Text style={{ color: COLORS.primary, fontWeight: "600" }}>Reenviar</Text>
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Step: nueva contraseña */}
            {vm.step === "nueva" && (
              <View style={styles.formContainer}>
                <Text style={styles.label}>NUEVA CONTRASEÑA</Text>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Mínimo 8 caracteres"
                    value={vm.newPassword}
                    onChangeText={vm.setNewPassword}
                    placeholderTextColor={COLORS.textTertiary}
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                    editable={!vm.isLoading}
                  />
                  <Pressable
                    style={({ pressed }) => [styles.eyeButton, pressed && { opacity: 0.6 }]}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                    <MaterialIcons
                      name={showNewPassword ? "visibility" : "visibility-off"}
                      size={22}
                      color={COLORS.textTertiary}
                    />
                  </Pressable>
                </View>
                <Text style={styles.label}>CONFIRMAR CONTRASEÑA</Text>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Repite tu contraseña"
                    value={vm.confirmPassword}
                    onChangeText={vm.setConfirmPassword}
                    placeholderTextColor={COLORS.textTertiary}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    editable={!vm.isLoading}
                  />
                  <Pressable
                    style={({ pressed }) => [styles.eyeButton, pressed && { opacity: 0.6 }]}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <MaterialIcons
                      name={showConfirmPassword ? "visibility" : "visibility-off"}
                      size={22}
                      color={COLORS.textTertiary}
                    />
                  </Pressable>
                </View>
                <Pressable
                  style={({ pressed }) => [
                    styles.primaryButton,
                    vm.isLoading && styles.primaryButtonDisabled,
                    pressed && { opacity: 0.85 },
                  ]}
                  onPress={vm.handleResetear}
                  disabled={vm.isLoading}
                >
                  {vm.isLoading ? (
                    <ActivityIndicator color={COLORS.surface} size="small" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Cambiar contraseña</Text>
                  )}
                </Pressable>

                <View style={styles.infoNote}>
                  <MaterialIcons name="info-outline" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.infoNoteText}>
                    La contraseña debe tener al menos 8 caracteres, incluyendo una letra mayúscula y
                    un número
                  </Text>
                </View>
              </View>
            )}

            {/* Footer link */}
            <Pressable
              style={({ pressed }) => [styles.footerLink, pressed && { opacity: 0.6 }]}
              onPress={() => vm.step === "email" && vm.handleVolver()}
            >
              <Text style={styles.footerLinkText}>
                <Text style={styles.footerLinkAccent}>Volver a inicio de sesión</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
  },
  headerBackBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: "700",
    color: COLORS.primary,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 28,
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    alignItems: "center",
    ...(isWeb()
      ? { boxShadow: "0px 4px 20px rgba(0,0,0,0.08)" }
      : {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 20,
          elevation: 6,
        }),
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  title: {
    fontSize: FONT_SIZES.xxlarge,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  stepsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
    width: "100%",
  },
  stepDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.borderLight,
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFEBEE",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    width: "100%",
  },
  errorText: {
    fontSize: 13,
    color: COLORS.error,
    flex: 1,
  },
  formContainer: {
    width: "100%",
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textSecondary,
    marginBottom: 4,
    marginTop: 8,
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
    backgroundColor: COLORS.backgroundSoft,
    marginBottom: 4,
  },
  digitsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginVertical: 12,
  },
  digitBox: {
    width: 48,
    height: 48,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    borderRadius: 12,
    backgroundColor: COLORS.backgroundSoft,
    textAlign: "center",
    fontSize: FONT_SIZES.xlarge,
    fontWeight: "700",
    color: COLORS.text,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.medium,
    fontWeight: "700",
  },
  resendButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  resendText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  footerLink: {
    marginTop: 20,
  },
  footerLinkText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
  },
  footerLinkAccent: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  passwordWrapper: {
    position: "relative",
    width: "100%",
  },
  passwordInput: {
    paddingRight: 44,
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    top: 12,
    padding: 2,
  },
  infoNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 4,
  },
  infoNoteText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    flex: 1,
  },
});

export default RecuperarContrasenaScreen;
