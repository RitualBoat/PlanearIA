import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { COLORS, FONT_SIZES } from "../../../types";
import { useRegistroViewModel } from "../../hooks/useRegistroViewModel";
import WebScrollView from "../../components/WebScrollView";

const RegistroScreen: React.FC = () => {
  const { formData, isLoading, errors, updateField, handleRegistro, handleIrALogin } =
    useRegistroViewModel();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isWideWeb = Platform.OS === "web" && width >= 768;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        enabled={Platform.OS !== "web"}
      >
        {/* Header bar */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>PlanearIA</Text>
          <View style={{ width: 32 }} />
        </View>

        <WebScrollView
          contentContainerStyle={[
            styles.scrollContent,
            isWideWeb && styles.scrollContentCentered,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.card, isWideWeb ? styles.cardWeb : styles.cardCompact]}>
            {/* Header */}
            <View style={styles.iconCircle}>
              <MaterialIcons name="person-add" size={36} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>Crear cuenta</Text>
            <Text style={styles.subtitle}>Regístrate para comenzar a usar PlanearIA</Text>

            {/* Form */}
            <View style={styles.formContainer}>
              {/* Nombre */}
              <Text style={styles.label}>Nombre *</Text>
              <TextInput
                style={[styles.input, errors.nombre ? styles.inputError : null]}
                placeholder="Tu nombre"
                value={formData.nombre}
                onChangeText={(v) => updateField("nombre", v)}
                placeholderTextColor={COLORS.textTertiary}
                autoCapitalize="words"
                editable={!isLoading}
              />
              {errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}

              {/* Apellidos */}
              <Text style={styles.label}>Apellidos</Text>
              <TextInput
                style={styles.input}
                placeholder="Tus apellidos"
                value={formData.apellidos}
                onChangeText={(v) => updateField("apellidos", v)}
                placeholderTextColor={COLORS.textTertiary}
                autoCapitalize="words"
                editable={!isLoading}
              />

              {/* Email */}
              <Text style={styles.label}>Correo electrónico *</Text>
              <TextInput
                style={[styles.input, errors.email ? styles.inputError : null]}
                placeholder="correo@ejemplo.com"
                value={formData.email}
                onChangeText={(v) => updateField("email", v)}
                placeholderTextColor={COLORS.textTertiary}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                editable={!isLoading}
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

              {/* Contraseña */}
              <Text style={styles.label}>Contraseña *</Text>
              <TextInput
                style={[styles.input, errors.password ? styles.inputError : null]}
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChangeText={(v) => updateField("password", v)}
                placeholderTextColor={COLORS.textTertiary}
                secureTextEntry
                autoCapitalize="none"
                editable={!isLoading}
              />
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

              {/* Confirmar Contraseña */}
              <Text style={styles.label}>Confirmar contraseña *</Text>
              <TextInput
                style={[styles.input, errors.confirmPassword ? styles.inputError : null]}
                placeholder="Repite tu contraseña"
                value={formData.confirmPassword}
                onChangeText={(v) => updateField("confirmPassword", v)}
                placeholderTextColor={COLORS.textTertiary}
                secureTextEntry
                autoCapitalize="none"
                editable={!isLoading}
              />
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}

              {/* Términos */}
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => updateField("aceptaTerminos", !formData.aceptaTerminos)}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name={formData.aceptaTerminos ? "check-box" : "check-box-outline-blank"}
                  size={22}
                  color={formData.aceptaTerminos ? COLORS.primary : COLORS.textTertiary}
                />
                <Text style={styles.checkboxLabel}>
                  Acepto los{" "}
                  <Text
                    style={styles.link}
                    onPress={() => (navigation as any).navigate("Terminos")}
                  >
                    términos y condiciones
                  </Text>
                </Text>
              </TouchableOpacity>
              {errors.aceptaTerminos && (
                <Text style={styles.errorText}>{errors.aceptaTerminos}</Text>
              )}

              {/* Botón Registro */}
              <TouchableOpacity
                style={[styles.registerButton, { opacity: isLoading ? 0.6 : 1 }]}
                onPress={handleRegistro}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <Text style={styles.registerButtonText}>
                  {isLoading ? "Creando cuenta..." : "Crear cuenta"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Link a login */}
            <View style={styles.linksContainer}>
              <Text style={styles.linkLabel}>¿Ya tienes cuenta?</Text>
              <TouchableOpacity onPress={handleIrALogin}>
                <Text style={styles.link}>Inicia sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </WebScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backButton: { padding: 4 },
  headerTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: "800",
    color: COLORS.primary,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  scrollContentCentered: {
    justifyContent: "center",
  },
  card: {
    width: "100%",
    maxWidth: 450,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    alignItems: "center",
  },
  cardWeb: {
    padding: 40,
    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.08)",
  },
  cardCompact: {
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${COLORS.primary}14`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: FONT_SIZES.xxlarge,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  formContainer: { width: "100%" },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textSecondary,
    letterSpacing: 0.3,
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
    backgroundColor: COLORS.backgroundSoft,
  },
  inputError: { borderColor: COLORS.error },
  errorText: { fontSize: 12, color: COLORS.error, marginTop: 2 },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
  },
  checkboxLabel: { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
  registerButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 20,
    alignItems: "center",
  },
  registerButtonText: { color: "#FFFFFF", fontSize: FONT_SIZES.medium, fontWeight: "bold" },
  linksContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 20,
  },
  linkLabel: { fontSize: FONT_SIZES.small, color: COLORS.textSecondary },
  link: { fontSize: FONT_SIZES.small, color: COLORS.primary, fontWeight: "600" },
});

export default RegistroScreen;
