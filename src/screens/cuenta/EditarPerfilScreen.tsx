import React, { useState, useCallback } from "react";
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
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useEditarPerfilViewModel } from "../../hooks/useEditarPerfilViewModel";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import Toast from "../../components/Toast";
import ConfirmDialog from "../../components/ConfirmDialog";
import PhotoPickerModal from "../../components/PhotoPickerModal";

const COUNTRIES = [
  { flag: "🇲🇽", name: "México" },
  { flag: "🇨🇴", name: "Colombia" },
  { flag: "🇦🇷", name: "Argentina" },
  { flag: "🇨🇱", name: "Chile" },
  { flag: "🇵🇪", name: "Perú" },
  { flag: "🇪🇨", name: "Ecuador" },
  { flag: "🇪🇸", name: "España" },
  { flag: "🇺🇸", name: "Estados Unidos" },
];

const EditarPerfilScreen: React.FC = () => {
  const vm = useEditarPerfilViewModel();
  const navigation = useNavigation();
  const { usuario } = useAuth();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const initials = usuario
    ? `${usuario.nombre?.[0] || ""}${usuario.apellidos?.[0] || ""}`.toUpperCase()
    : "U";

  const currentFlag = COUNTRIES.find((c) => c.name === vm.pais)?.flag || "🇲🇽";

  const handleCancel = useCallback(() => {
    if (vm.isDirty) {
      setShowDiscardDialog(true);
    } else {
      navigation.goBack();
    }
  }, [vm.isDirty, navigation]);

  const handlePhotoAction = useCallback((action: string) => {
    Alert.alert("Próximamente", "Esta función se implementará en una próxima actualización.");
  }, []);

  const photoOptions = [
    { icon: "photo-camera", label: "Tomar foto", onPress: () => handlePhotoAction("camera") },
    {
      icon: "photo-library",
      label: "Elegir de galería",
      onPress: () => handlePhotoAction("gallery"),
    },
    {
      icon: "delete",
      label: "Eliminar foto actual",
      onPress: () => handlePhotoAction("delete"),
      destructive: true,
    },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header bar */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            onPress={handleCancel}
            style={styles.headerAction}
            accessibilityRole="button"
            accessibilityLabel="Cancelar"
          >
            <MaterialIcons name="close" size={20} color={colors.onSurfaceVariant} />
            <Text style={[styles.headerActionText, { color: colors.onSurfaceVariant }]}>
              Cancelar
            </Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Editar Perfil</Text>
          <TouchableOpacity
            onPress={vm.handleGuardar}
            disabled={vm.isLoading || !vm.isDirty}
            style={styles.headerAction}
            accessibilityRole="button"
            accessibilityLabel="Guardar"
          >
            {vm.isLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text
                style={[
                  styles.headerSaveText,
                  { color: vm.isDirty ? colors.primary : colors.onSurfaceVariant },
                ]}
              >
                Guardar
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.card, { maxWidth: width >= 768 ? 560 : 500 }]}>
            {/* Cover photo */}
            <View style={styles.coverSection}>
              <LinearGradient
                colors={["#004580", "#005da8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.coverGradient}
              />
              <TouchableOpacity
                style={styles.changeCoverBtn}
                onPress={() => handlePhotoAction("cover")}
                accessibilityRole="button"
                accessibilityLabel="Cambiar portada"
              >
                <MaterialIcons name="photo-camera" size={16} color={colors.onSurface} />
                <Text style={[styles.changeCoverText, { color: colors.onSurface }]}>
                  Cambiar portada
                </Text>
              </TouchableOpacity>
            </View>

            {/* Avatar overlapping cover */}
            <View style={styles.avatarEditWrap}>
              <View style={[styles.avatarCircle, { borderColor: colors.background }]}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <TouchableOpacity
                style={styles.avatarEditBtn}
                onPress={() => setShowPhotoPicker(true)}
                accessibilityRole="button"
                accessibilityLabel="Cambiar foto de perfil"
              >
                <MaterialIcons name="add-a-photo" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              {/* Nombre */}
              <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>NOMBRE(S)</Text>
              <View style={{ position: "relative" }}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: vm.nombreError ? "#ba1a1a" : colors.outlineVariant,
                      backgroundColor: colors.surfaceContainerLowest,
                    },
                    vm.nombreError && styles.inputError,
                  ]}
                  value={vm.nombre}
                  onChangeText={vm.setNombre}
                  placeholder="Ej: Ana Sofía"
                  placeholderTextColor={colors.onSurfaceVariant}
                  autoCapitalize="words"
                  editable={!vm.isLoading}
                  accessibilityLabel="Nombre"
                />
                {vm.nombreError ? (
                  <View style={styles.inputErrorIcon}>
                    <MaterialIcons name="error" size={20} color="#ba1a1a" />
                  </View>
                ) : null}
              </View>
              {vm.nombreError ? <Text style={styles.fieldError}>{vm.nombreError}</Text> : null}

              {/* Apellidos */}
              <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>APELLIDOS</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: colors.outlineVariant,
                    backgroundColor: colors.surfaceContainerLowest,
                  },
                ]}
                value={vm.apellidos}
                onChangeText={vm.setApellidos}
                placeholder="Ej: Martínez López"
                placeholderTextColor={colors.onSurfaceVariant}
                autoCapitalize="words"
                editable={!vm.isLoading}
                accessibilityLabel="Apellidos"
              />

              {/* Biografía */}
              <View style={styles.labelRow}>
                <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>BIOGRAFÍA</Text>
                <Text
                  style={[
                    styles.charCounter,
                    {
                      color:
                        vm.bioCharCount >= vm.bioMaxLength ? "#ba1a1a" : colors.onSurfaceVariant,
                    },
                  ]}
                >
                  {vm.bioCharCount}/{vm.bioMaxLength}
                </Text>
              </View>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    borderColor: colors.outlineVariant,
                    backgroundColor: colors.surfaceContainerLowest,
                  },
                ]}
                value={vm.biografia}
                onChangeText={vm.setBiografia}
                placeholder="Cuéntanos sobre ti..."
                placeholderTextColor={colors.onSurfaceVariant}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={vm.bioMaxLength}
                editable={!vm.isLoading}
                accessibilityLabel="Biografía"
              />

              {/* Email (locked) */}
              <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>EMAIL</Text>
              <View
                style={[
                  styles.input,
                  styles.inputDisabled,
                  {
                    backgroundColor: colors.surfaceContainerLow,
                    borderColor: colors.outlineVariant,
                  },
                ]}
              >
                <MaterialIcons name="lock" size={16} color={colors.onSurfaceVariant} />
                <Text style={[styles.disabledText, { color: colors.onSurfaceVariant }]}>
                  {vm.email}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <MaterialIcons name="info-outline" size={14} color={colors.onSurfaceVariant} />
                <Text style={[styles.infoText, { color: colors.onSurfaceVariant }]}>
                  Para cambiar tu email, ve a Configuración {">"} Cuenta
                </Text>
              </View>

              {/* País */}
              <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>PAÍS</Text>
              <TouchableOpacity
                style={[
                  styles.input,
                  styles.selectField,
                  {
                    borderColor: colors.outlineVariant,
                    backgroundColor: colors.surfaceContainerLowest,
                  },
                ]}
                onPress={() => setShowCountryPicker(!showCountryPicker)}
                accessibilityRole="button"
                accessibilityLabel={`País: ${vm.pais}`}
              >
                <Text style={styles.selectEmoji}>{currentFlag}</Text>
                <Text style={[styles.selectText, { color: colors.onSurface }]}>{vm.pais}</Text>
                <MaterialIcons
                  name={showCountryPicker ? "expand-less" : "expand-more"}
                  size={22}
                  color={colors.onSurfaceVariant}
                />
              </TouchableOpacity>
              {showCountryPicker && (
                <View
                  style={[
                    styles.countryList,
                    {
                      backgroundColor: colors.surfaceContainerLowest,
                      borderColor: colors.outlineVariant,
                    },
                  ]}
                >
                  {COUNTRIES.map((c) => (
                    <TouchableOpacity
                      key={c.name}
                      style={[
                        styles.countryItem,
                        vm.pais === c.name && { backgroundColor: `${colors.primary}10` },
                      ]}
                      onPress={() => {
                        vm.setPais(c.name);
                        setShowCountryPicker(false);
                      }}
                    >
                      <Text style={styles.selectEmoji}>{c.flag}</Text>
                      <Text style={[styles.countryName, { color: colors.onSurface }]}>
                        {c.name}
                      </Text>
                      {vm.pais === c.name && (
                        <MaterialIcons name="check" size={18} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Submit button */}
            <TouchableOpacity
              style={[styles.submitBtn, (!vm.isDirty || vm.isLoading) && styles.submitBtnDisabled]}
              onPress={vm.handleGuardar}
              disabled={vm.isLoading || !vm.isDirty}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Actualizar Perfil"
            >
              <LinearGradient
                colors={vm.isDirty ? ["#004580", "#005da8"] : ["#c0c7d4", "#c0c7d4"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.submitGradient}
              >
                {vm.isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitText}>Actualizar Perfil</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Toast notifications */}
      <Toast
        visible={vm.saveSuccess}
        message="Perfil actualizado correctamente"
        type="success"
        onDismiss={vm.dismissSuccess}
      />
      <Toast
        visible={vm.saveError}
        message={vm.error || "No pudimos guardar tu perfil. Intenta de nuevo."}
        type="error"
        onDismiss={vm.dismissError}
      />

      {/* Discard changes dialog */}
      <ConfirmDialog
        visible={showDiscardDialog}
        icon="edit-off"
        title="¿Descartar cambios?"
        message="Tienes cambios sin guardar. ¿Estás seguro de que deseas salir?"
        confirmLabel="Descartar"
        cancelLabel="Seguir editando"
        destructive
        onConfirm={() => {
          setShowDiscardDialog(false);
          navigation.goBack();
        }}
        onCancel={() => setShowDiscardDialog(false)}
      />

      {/* Photo picker */}
      <PhotoPickerModal
        visible={showPhotoPicker}
        options={photoOptions}
        onClose={() => setShowPhotoPicker(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 4,
  },
  headerActionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  headerSaveText: {
    fontSize: 14,
    fontWeight: "700",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Platform.OS === "web" ? 28 : 110,
  },
  card: {
    width: "100%",
    alignSelf: "center",
  },
  /* Cover photo */
  coverSection: {
    height: 140,
    position: "relative",
  },
  coverGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  changeCoverBtn: {
    position: "absolute",
    bottom: 12,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.85)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  changeCoverText: {
    fontSize: 12,
    fontWeight: "600",
  },
  /* Avatar */
  avatarEditWrap: {
    alignItems: "flex-start",
    marginTop: -36,
    marginLeft: 20,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#005da8",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  avatarEditBtn: {
    position: "absolute",
    bottom: 0,
    left: 48,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#005da8",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  /* Form */
  formContainer: {
    paddingHorizontal: 20,
    gap: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 6,
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  charCounter: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 16,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#181c20",
  },
  inputError: {
    borderColor: "#ba1a1a",
    borderWidth: 2,
  },
  inputErrorIcon: {
    position: "absolute",
    right: 12,
    top: 12,
  },
  fieldError: {
    fontSize: 12,
    fontWeight: "500",
    color: "#ba1a1a",
    marginTop: 4,
    marginLeft: 2,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  inputDisabled: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  disabledText: {
    fontSize: 15,
    flex: 1,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
    marginLeft: 2,
  },
  infoText: {
    fontSize: 12,
    fontStyle: "italic",
  },
  selectField: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  selectEmoji: {
    fontSize: 18,
  },
  selectText: {
    flex: 1,
    fontSize: 15,
  },
  countryList: {
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 4,
    overflow: "hidden",
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  countryName: {
    flex: 1,
    fontSize: 14,
  },
  /* Submit */
  submitBtn: {
    marginHorizontal: 20,
    marginTop: 28,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitGradient: {
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 12,
    ...Platform.select({
      web: { boxShadow: "0px 4px 12px rgba(0, 69, 128, 0.15)" } as any,
      default: {
        shadowColor: "#004580",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 4,
      },
    }),
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});

export default EditarPerfilScreen;
