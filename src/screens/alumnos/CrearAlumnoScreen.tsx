import React from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import WebScrollView from "../../components/WebScrollView";
import CarreraSelector from "../../components/CarreraSelector";
import { useCrearAlumnoViewModel, type CarreraOption } from "../../hooks/useCrearAlumnoViewModel";
import type { RootStackParamList } from "../../navigation/StackNavigator";
import { useAlumnos } from "../../context/AlumnosContext";
import { COLORS } from "../../../types";

type Nav = StackNavigationProp<RootStackParamList, "CrearAlumno">;
type Route = RouteProp<RootStackParamList, "CrearAlumno">;

type SaveViewState = "form" | "success" | "sync-error";

const CrearAlumnoScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { width } = useWindowDimensions();
  const { obtenerAlumno } = useAlumnos();
  const modo = route.params?.modo || "crear";
  const alumnoId = route.params?.alumnoId;
  const grupoId = route.params?.grupoId;
  const alumnoEdicion = alumnoId ? obtenerAlumno(alumnoId) : undefined;
  const isDesktopWeb = Platform.OS === "web" && width >= 1080;
  const isCreateMode = modo === "crear";

  const [saveView, setSaveView] = React.useState<SaveViewState>("form");
  const [savedAlumnoId, setSavedAlumnoId] = React.useState<number | null>(null);
  const [showValidationBanner, setShowValidationBanner] = React.useState(false);

  const {
    nombre,
    apellidos,
    numeroControl,
    carrera,
    escuela,
    especialidad,
    email,
    telefono,
    errors,
    isSaving,
    canSubmit,
    setNombre,
    setApellidos,
    setNumeroControl,
    setCarrera,
    setEscuela,
    setEspecialidad,
    setEmail,
    setTelefono,
    cargarFormularioDesdeAlumno,
    guardarAlumno,
    resetForm,
  } = useCrearAlumnoViewModel();

  React.useEffect(() => {
    if (modo !== "editar") return;

    if (!alumnoEdicion) {
      Alert.alert("Error", "No se encontro el alumno para editar.");
      navigation.goBack();
      return;
    }

    cargarFormularioDesdeAlumno(alumnoEdicion);
  }, [alumnoEdicion, cargarFormularioDesdeAlumno, modo, navigation]);

  React.useEffect(() => {
    if (!showValidationBanner) return;
    if (Object.keys(errors).length === 0) {
      setShowValidationBanner(false);
    }
  }, [errors, showValidationBanner]);

  const handleCancelar = () => {
    if (saveView !== "form") {
      setSaveView("form");
      return;
    }

    Alert.alert("Descartar cambios", "Se descartaran los cambios no guardados.", [
      { text: "Seguir editando", style: "cancel" },
      {
        text: "Descartar",
        style: "destructive",
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  const handleGuardar = async () => {
    const result = await guardarAlumno({
      modo,
      alumnoId,
      grupoId,
      originalAlumno: alumnoEdicion,
    });

    if (!result.ok) {
      setShowValidationBanner(true);
      return;
    }

    setSavedAlumnoId(result.alumnoId ?? null);

    if (result.syncOk === false) {
      setSaveView("sync-error");
      return;
    }

    setSaveView("success");
  };

  const handlePrimaryAfterSuccess = () => {
    if (savedAlumnoId) {
      navigation.navigate("DetalleAlumno", { alumnoId: savedAlumnoId });
      return;
    }

    navigation.navigate("ListaAlumnos");
  };

  const handleRegisterAnother = () => {
    resetForm();
    setSavedAlumnoId(null);
    setSaveView("form");
    setShowValidationBanner(false);
  };

  if (saveView === "success") {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />
        <SafeAreaView style={styles.safeArea}>
          <WebScrollView contentContainerStyle={styles.successContainer}>
            <View style={styles.successBannerCard}>
              <View style={styles.successBannerIcon}>
                <MaterialIcons name="check-circle" size={28} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.successBannerTitle}>
                  {isCreateMode ? "Listo Alumno creado correctamente" : "Todo listo"}
                </Text>
                <Text style={styles.successBannerText}>
                  {isCreateMode
                    ? "El perfil fue guardado en la base de datos escolar."
                    : "Alumno actualizado correctamente en su registro escolar."}
                </Text>
              </View>
            </View>

            <View style={styles.successDataCard}>
              <Text style={styles.successSectionTitle}>INFORMACION PERSONAL</Text>
              <FieldReadonly label="Nombre completo" value={`${nombre} ${apellidos}`.trim()} />

              <View style={styles.successGridRow}>
                <FieldReadonlyCompact label="Numero de control" value={numeroControl || "-"} />
                <FieldReadonlyCompact label="Carrera" value={carrera || "-"} />
              </View>

              <FieldReadonly label="Correo institucional" value={email || "No definido"} />

              <Pressable
                style={({ pressed }) => [styles.primaryActionBtn, pressed && { opacity: 0.6 }]}
                onPress={handlePrimaryAfterSuccess}
              >
                <MaterialIcons name="person" size={18} color={COLORS.surface} />
                <Text style={styles.primaryActionBtnText}>Volver al detalle</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.secondaryActionBtn, pressed && { opacity: 0.6 }]}
                onPress={handleRegisterAnother}
              >
                <MaterialIcons name="person-add" size={18} color={COLORS.primary} />
                <Text style={styles.secondaryActionBtnText}>Registrar otro</Text>
              </Pressable>
            </View>

            {isCreateMode ? (
              <View style={styles.suggestionsWrap}>
                <Text style={styles.suggestionsTitle}>Sugerencias para el nuevo alumno</Text>
                <SuggestionRow
                  icon="menu-book"
                  title="Asignar Plan de Lectura"
                  subtitle="Nivel intermedio sugerido"
                />
                <SuggestionRow
                  icon="contact-mail"
                  title="Enviar ficha a padres"
                  subtitle="Notificacion de alta exitosa"
                />
              </View>
            ) : null}
          </WebScrollView>
        </SafeAreaView>
      </View>
    );
  }

  if (saveView === "sync-error") {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />
        <SafeAreaView style={styles.safeArea}>
          <WebScrollView contentContainerStyle={styles.errorContainer}>
            <View style={styles.errorBanner}>
              <MaterialIcons name="wifi-off" size={20} color={COLORS.error} />
              <View style={{ flex: 1 }}>
                <Text style={styles.errorTitle}>No se pudo guardar la informacion</Text>
                <Text style={styles.errorTextLarge}>
                  El servidor no respondio a tiempo. Tus cambios locales no se han perdido.
                </Text>
              </View>
            </View>

            <View style={styles.errorDataCard}>
              <Text style={styles.errorDataName}>{`${nombre} ${apellidos}`.trim()}</Text>
              <Text style={styles.errorDataMeta}>ID: #{numeroControl || "S/N"}</Text>
              <FieldReadonly label="Nombre(s)" value={nombre} />
              <FieldReadonly label="Apellidos" value={apellidos} />
              <FieldReadonly label="Correo" value={email || "No definido"} />
            </View>

            <View style={styles.errorActionsCard}>
              <Text style={styles.errorActionsTitle}>Acciones Requeridas</Text>
              <Text style={styles.errorActionsText}>
                Hubo un problema de sincronizacion. Puedes intentar guardar de nuevo o descartar
                cambios actuales.
              </Text>

              <Pressable
                style={({ pressed }) => [styles.primaryActionBtn, pressed && { opacity: 0.6 }]}
                onPress={() => void handleGuardar()}
              >
                <MaterialIcons name="refresh" size={18} color={COLORS.surface} />
                <Text style={styles.primaryActionBtnText}>Reintentar</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.linkButton, pressed && { opacity: 0.6 }]}
                onPress={handleCancelar}
              >
                <Text style={styles.linkButtonText}>Cancelar</Text>
              </Pressable>
            </View>
          </WebScrollView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerBar}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.headerBackBtn, pressed && { opacity: 0.6 }]}
          >
            <MaterialIcons name="arrow-back" size={22} color="#1C72BA" />
          </Pressable>
          <View style={styles.headerCopyWrap}>
            <Text style={styles.headerTitle}>
              {isCreateMode ? "Crear alumno" : "Editar Alumno"}
            </Text>
            <Text style={styles.headerSubtitle}>Registra un nuevo estudiante en tu grupo</Text>
          </View>
          {modo === "editar" ? (
            <View style={styles.modePill}>
              <Text style={styles.modePillText}>MODO EDICION</Text>
            </View>
          ) : null}
        </View>

        <View style={isDesktopWeb ? styles.webWrapper : styles.mobileWrapper}>
          <WebScrollView style={styles.formScroll} contentContainerStyle={styles.formScrollContent}>
            {showValidationBanner ? (
              <View style={styles.validationBanner}>
                <MaterialIcons name="error" size={20} color={COLORS.error} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.validationTitle}>Por favor revisa los errores</Text>
                  <Text style={styles.validationText}>
                    Faltan campos obligatorios marcados con asterisco (*).
                  </Text>
                </View>
              </View>
            ) : null}

            {isCreateMode && !isDesktopWeb ? (
              <View style={styles.miniIntroCard}>
                <Text style={styles.miniIntroTitle}>Expediente Academico</Text>
                <Text style={styles.miniIntroText}>
                  Asegurate de capturar los datos oficiales para reportes IA.
                </Text>
                <View style={styles.miniIntroIconWrap}>
                  <MaterialIcons name="person-add" size={20} color={COLORS.primary} />
                </View>
              </View>
            ) : null}

            <View style={[styles.formCard, isDesktopWeb && styles.formCardWeb]}>
              <SectionTitle text={isCreateMode ? "Informacion Personal" : "Datos Personales"} />

              <FormField
                label="Nombre*"
                value={nombre}
                onChangeText={setNombre}
                error={errors.nombre}
              />
              <FormField
                label="Apellidos*"
                value={apellidos}
                onChangeText={setApellidos}
                error={errors.apellidos}
              />

              <SectionTitle text={isCreateMode ? "Datos Academicos" : "Informacion Academica"} />

              <FormField
                label="Numero de Control*"
                value={numeroControl}
                onChangeText={setNumeroControl}
                error={errors.numeroControl}
              />

              <CarreraSelector
                value={carrera}
                onChange={(value) => setCarrera(value as CarreraOption)}
                error={errors.carrera}
              />

              <FormField label="Escuela" value={escuela} onChangeText={setEscuela} />
              <FormField label="Especialidad" value={especialidad} onChangeText={setEspecialidad} />

              <SectionTitle text="Contacto" />
              <FormField
                label="Correo Electronico"
                value={email}
                onChangeText={setEmail}
                error={errors.email}
              />
              <FormField label="Telefono" value={telefono} onChangeText={setTelefono} />

              <Pressable
                style={({ pressed }) => [
                  styles.saveButton,
                  (!canSubmit || isSaving) && styles.saveButtonDisabled,
                  pressed && { opacity: 0.6 },
                ]}
                disabled={!canSubmit || isSaving}
                onPress={() => void handleGuardar()}
              >
                {isSaving ? (
                  <>
                    <ActivityIndicator size="small" color={COLORS.surface} />
                    <Text style={styles.saveButtonText}>Guardando...</Text>
                  </>
                ) : (
                  <>
                    <MaterialIcons name="save" size={16} color={COLORS.surface} />
                    <Text style={styles.saveButtonText}>
                      {isCreateMode ? "Guardar alumno" : "Guardar cambios"}
                    </Text>
                  </>
                )}
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.cancelAction, pressed && { opacity: 0.6 }]}
                onPress={handleCancelar}
              >
                <Text style={styles.cancelActionText}>Cancelar</Text>
              </Pressable>
            </View>
          </WebScrollView>

          {isDesktopWeb && isCreateMode ? (
            <View style={styles.webRightPanel}>
              <View style={styles.tipCard}>
                <Text style={styles.tipCardTitle}>Consejo del Maestro</Text>
                <Text style={styles.tipCardText}>
                  Asegurate de que el Numero de Control sea unico para este estudiante.
                </Text>
                <View style={styles.tipImagePlaceholder}>
                  <MaterialIcons name="auto-awesome" size={36} color="#2C5D8C" />
                </View>
              </View>

              <View style={styles.requiredCard}>
                <Text style={styles.requiredTitle}>Campos Obligatorios</Text>
                <Text style={styles.requiredItem}>• Nombre del estudiante</Text>
                <Text style={styles.requiredItem}>• Apellidos completos</Text>
                <Text style={styles.requiredItem}>• Numero de control oficial</Text>
                <Text style={styles.requiredItem}>• Carrera tecnica o ingenieria</Text>
              </View>
            </View>
          ) : null}
        </View>
      </SafeAreaView>
    </View>
  );
};

const SectionTitle: React.FC<{ text: string }> = ({ text }) => (
  <View style={styles.sectionTitleWrap}>
    <View style={styles.sectionAccent} />
    <Text style={styles.sectionTitleText}>{text}</Text>
  </View>
);

const FormField: React.FC<{
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
}> = ({ label, value, onChangeText, error }) => (
  <View style={styles.fieldWrap}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, error ? styles.inputError : null]}
      value={value}
      onChangeText={onChangeText}
      placeholderTextColor="#98A8BE"
    />
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);

const FieldReadonly: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.readonlyField}>
    <Text style={styles.readonlyLabel}>{label}</Text>
    <Text style={styles.readonlyValue}>{value || "-"}</Text>
  </View>
);

const FieldReadonlyCompact: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.readonlyCompactField}>
    <Text style={styles.readonlyLabel}>{label}</Text>
    <Text style={styles.readonlyValue}>{value || "-"}</Text>
  </View>
);

const SuggestionRow: React.FC<{
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle: string;
}> = ({ icon, title, subtitle }) => (
  <Pressable style={({ pressed }) => [styles.suggestionRow, pressed && { opacity: 0.6 }]}>
    <MaterialIcons name={icon} size={20} color="#2E74B5" />
    <View style={{ flex: 1 }}>
      <Text style={styles.suggestionTitle}>{title}</Text>
      <Text style={styles.suggestionSubtitle}>{subtitle}</Text>
    </View>
    <MaterialIcons name="chevron-right" size={20} color="#7B8EA8" />
  </Pressable>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1 },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    backgroundColor: "#F5F9FE",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  headerBackBtn: { width: 28, alignItems: "center", justifyContent: "center" },
  headerCopyWrap: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#25384F" },
  headerSubtitle: { marginTop: 2, fontSize: 13, color: "#6A7E97" },
  modePill: {
    backgroundColor: "#7EE7FF",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  modePillText: { fontSize: 10, fontWeight: "800", color: "#0A6D9B" },
  webWrapper: { flex: 1, flexDirection: "row", padding: 12, gap: 14 },
  mobileWrapper: { flex: 1 },
  formScroll: { flex: 1 },
  formScrollContent: { padding: 10, paddingBottom: 22 },
  validationBanner: {
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0B8B8",
    backgroundColor: "#FDE3E3",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  validationTitle: { color: "#BF1F1A", fontWeight: "800", fontSize: 15 },
  validationText: { color: "#BF1F1A", marginTop: 2, lineHeight: 18 },
  miniIntroCard: {
    borderRadius: 12,
    backgroundColor: "#DDEBFF",
    borderWidth: 1,
    borderColor: "#C7DCF8",
    padding: 14,
    marginBottom: 12,
  },
  miniIntroTitle: { color: "#365E89", fontWeight: "800", fontSize: 20, maxWidth: 220 },
  miniIntroText: { color: "#4D6F94", marginTop: 6, lineHeight: 19, maxWidth: 220 },
  miniIntroIconWrap: {
    position: "absolute",
    right: 14,
    top: 14,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#C5DCF8",
    alignItems: "center",
    justifyContent: "center",
  },
  formCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.surface,
    padding: 14,
  },
  formCardWeb: { maxWidth: 760, width: "100%" },
  sectionTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
    marginBottom: 10,
  },
  sectionAccent: { width: 4, height: 24, backgroundColor: "#1A75BE", borderRadius: 2 },
  sectionTitleText: {
    color: "#5B6E86",
    fontSize: 16,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  fieldWrap: { marginBottom: 10 },
  label: {
    color: "#6A7D98",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceHover,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    color: COLORS.textDark,
  },
  inputError: {
    borderColor: "#DB3B33",
    backgroundColor: "#FFF6F6",
  },
  selectorButton: {
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceHover,
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectorButtonError: { borderColor: "#DB3B33", backgroundColor: "#FFF6F6" },
  selectorText: { color: COLORS.textDark, fontSize: 15 },
  errorText: { color: "#C12620", fontSize: 12, fontWeight: "700", marginTop: 4 },
  saveButton: {
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: "#1774C5",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    paddingVertical: 13,
  },
  saveButtonDisabled: { backgroundColor: "#8EB8E3" },
  saveButtonText: { color: COLORS.surface, fontWeight: "800", fontSize: 16 },
  cancelAction: { alignItems: "center", paddingVertical: 12 },
  cancelActionText: { color: "#246FB2", fontWeight: "700", fontSize: 16 },
  webRightPanel: { width: 300, gap: 12 },
  tipCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    backgroundColor: "#E7EDF7",
    padding: 12,
  },
  tipCardTitle: { fontSize: 24, fontWeight: "800", color: "#2C4059" },
  tipCardText: { marginTop: 8, color: "#5F738D", lineHeight: 20 },
  tipImagePlaceholder: {
    marginTop: 12,
    borderRadius: 10,
    backgroundColor: "#C6D5EA",
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  requiredCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BFD4EC",
    backgroundColor: "#D9E9FC",
    padding: 12,
  },
  requiredTitle: { color: "#2666A6", fontWeight: "800", marginBottom: 8, fontSize: 16 },
  requiredItem: { color: "#2F5F8E", marginBottom: 5, lineHeight: 18 },
  successContainer: { padding: 14, paddingBottom: 24 },
  successBannerCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#C4DBF7",
    backgroundColor: "#E9F3FF",
    padding: 14,
    flexDirection: "row",
    gap: 10,
  },
  successBannerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#D4E8FF",
    alignItems: "center",
    justifyContent: "center",
  },
  successBannerTitle: { color: "#1970B8", fontSize: 18, fontWeight: "800" },
  successBannerText: { marginTop: 4, color: "#486A8E", lineHeight: 20 },
  successDataCard: {
    marginTop: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.surface,
    padding: 14,
  },
  successSectionTitle: { color: "#1F74BA", fontWeight: "800", marginBottom: 8 },
  successGridRow: { flexDirection: "row", gap: 10 },
  readonlyField: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceHover,
    padding: 12,
    marginBottom: 10,
  },
  readonlyCompactField: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceHover,
    padding: 12,
    marginBottom: 10,
  },
  readonlyLabel: { color: "#7A8EA9", fontSize: 12, fontWeight: "700" },
  readonlyValue: { marginTop: 4, color: COLORS.textDark, fontSize: 16, fontWeight: "800" },
  primaryActionBtn: {
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: "#1774C5",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    paddingVertical: 13,
  },
  primaryActionBtnText: { color: COLORS.surface, fontWeight: "800", fontSize: 16 },
  secondaryActionBtn: {
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: "#EFF3F9",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    paddingVertical: 13,
  },
  secondaryActionBtnText: { color: "#1E6CB0", fontWeight: "800", fontSize: 16 },
  suggestionsWrap: { marginTop: 18, gap: 10 },
  suggestionsTitle: { color: "#2D3F58", fontSize: 26, fontWeight: "800" },
  suggestionRow: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.surfaceHover,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  suggestionTitle: { color: "#2E4F73", fontWeight: "800" },
  suggestionSubtitle: { color: "#6D7F99", marginTop: 2 },
  errorContainer: { padding: 14, paddingBottom: 24, gap: 12 },
  errorBanner: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0B8B8",
    backgroundColor: "#FDE3E3",
    padding: 12,
    flexDirection: "row",
    gap: 10,
  },
  errorTitle: { color: "#B92A24", fontWeight: "800", fontSize: 18 },
  errorTextLarge: { marginTop: 4, color: "#9C3F3A", lineHeight: 20 },
  errorDataCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.surface,
    padding: 12,
  },
  errorDataName: { color: "#4D5C71", fontSize: 20, fontWeight: "800" },
  errorDataMeta: { marginTop: 3, color: "#7E90A8", marginBottom: 8 },
  errorActionsCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.backgroundSoft,
    padding: 12,
  },
  errorActionsTitle: { color: "#2B3C54", fontSize: 20, fontWeight: "800" },
  errorActionsText: { marginTop: 8, color: "#5D6F87", lineHeight: 20 },
  linkButton: { alignSelf: "center", padding: 8, marginTop: 6 },
  linkButtonText: { color: "#246FB2", fontWeight: "700", fontSize: 16 },
});

export default CrearAlumnoScreen;
