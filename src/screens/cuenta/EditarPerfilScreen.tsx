import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { COLORS, FONT_SIZES } from "../../../types";
import { isWeb } from "../../utils/responsive";
import { useEditarPerfilViewModel } from "../../hooks/useEditarPerfilViewModel";
import { useAuth } from "../../context/AuthContext";

const EditarPerfilScreen: React.FC = () => {
  const vm = useEditarPerfilViewModel();
  const navigation = useNavigation();
  const { usuario } = useAuth();

  const initials = usuario
    ? `${usuario.nombre?.[0] || ""}${usuario.apellidos?.[0] || ""}`.toUpperCase()
    : "U";

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header bar */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackBtn}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar Perfil</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            {/* Avatar */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    "Próximamente",
                    "Esta función se implementará en una próxima actualización."
                  )
                }
              >
                <Text style={styles.changePhotoText}>Cambiar foto</Text>
              </TouchableOpacity>
            </View>

            {/* Error */}
            {vm.error ? (
              <View style={styles.errorContainer}>
                <MaterialIcons name="error-outline" size={16} color={COLORS.error} />
                <Text style={styles.errorText}>{vm.error}</Text>
              </View>
            ) : null}

            {/* Form */}
            <View style={styles.formContainer}>
              <Text style={styles.label}>NOMBRE *</Text>
              <TextInput
                style={styles.input}
                value={vm.nombre}
                onChangeText={vm.setNombre}
                placeholder="Tu nombre"
                placeholderTextColor={COLORS.textTertiary}
                autoCapitalize="words"
                editable={!vm.isLoading}
              />

              <Text style={styles.label}>APELLIDOS</Text>
              <TextInput
                style={styles.input}
                value={vm.apellidos}
                onChangeText={vm.setApellidos}
                placeholder="Tus apellidos"
                placeholderTextColor={COLORS.textTertiary}
                autoCapitalize="words"
                editable={!vm.isLoading}
              />

              <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
              <View style={[styles.input, styles.inputDisabled]}>
                <Text style={styles.disabledText}>{vm.email}</Text>
                <MaterialIcons name="lock" size={18} color="#B0BEC5" />
              </View>

              <Text style={styles.label}>BIOGRAFÍA</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={vm.biografia}
                onChangeText={vm.setBiografia}
                placeholder="Cuéntanos un poco sobre ti..."
                placeholderTextColor={COLORS.textTertiary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                editable={!vm.isLoading}
              />
            </View>

            {/* Actions — stacked */}
            <View style={styles.actionsColumn}>
              <TouchableOpacity
                style={[styles.saveButton, vm.isLoading && styles.saveButtonDisabled]}
                onPress={vm.handleGuardar}
                disabled={vm.isLoading}
                activeOpacity={0.85}
              >
                {vm.isLoading ? (
                  <ActivityIndicator color={COLORS.surface} size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Guardar cambios</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={vm.handleCancelar}
                activeOpacity={0.85}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <Text style={styles.footerText}>PLANEARIA • CONFIGURACIÓN DE CUENTA SEGURA</Text>
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
    fontSize: FONT_SIZES.xlarge,
    fontWeight: "800",
    color: COLORS.text,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: isWeb() ? 28 : 110,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 450,
    alignSelf: "center",
    ...(isWeb()
      ? { boxShadow: "0px 4px 20px rgba(0,0,0,0.06)" }
      : {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.06,
          shadowRadius: 20,
          elevation: 4,
        }),
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 8,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 3,
    borderColor: COLORS.surface,
    ...(isWeb()
      ? { boxShadow: "0px 4px 12px rgba(22,118,210,0.3)" }
      : {
          shadowColor: COLORS.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 8,
        }),
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.surface,
  },
  changePhotoText: {
    fontSize: FONT_SIZES.small,
    fontWeight: "600",
    color: COLORS.primary,
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
  },
  errorText: {
    fontSize: 13,
    color: COLORS.error,
    flex: 1,
  },
  formContainer: {
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textSecondary,
    marginTop: 12,
    marginBottom: 4,
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
  },
  inputDisabled: {
    backgroundColor: "#ECEFF4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  disabledText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    flex: 1,
  },
  textArea: {
    minHeight: 100,
  },
  actionsColumn: {
    gap: 12,
    marginTop: 28,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.medium,
    fontWeight: "700",
  },
  cancelButton: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    paddingVertical: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  footerText: {
    marginTop: 32,
    textAlign: "center",
    fontSize: 12,
    color: "#B0BEC5",
    letterSpacing: 0.8,
    marginBottom: 20,
  },
});

export default EditarPerfilScreen;
