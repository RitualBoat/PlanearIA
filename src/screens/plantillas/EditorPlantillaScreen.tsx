import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { COLORS } from "../../../types";
import { useEditorPlantillaViewModel } from "../../hooks/useEditorPlantillaViewModel";
import { isWeb } from "../../utils/responsive";

type TipoOption = {
  id: "examen" | "presentacion" | "mapa_mental" | "linea_tiempo" | "postal" | "reporte" | "otro";
  label: string;
  icon: string;
  color: string;
};

const TIPO_OPTIONS: TipoOption[] = [
  { id: "examen", label: "Examen", icon: "quiz", color: COLORS.warning },
  { id: "presentacion", label: "Presentación", icon: "play-circle-filled", color: COLORS.primary },
  { id: "mapa_mental", label: "Mapa Mental", icon: "dashboard-customize", color: COLORS.purple },
  { id: "postal", label: "Postal", icon: "mail", color: COLORS.teal },
  { id: "reporte", label: "Reporte", icon: "assessment", color: COLORS.success },
  { id: "linea_tiempo", label: "Línea de Tiempo", icon: "timeline", color: "#FF5722" },
  { id: "otro", label: "Otro", icon: "description", color: "#757575" },
];

const EditorPlantillaScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const vm = useEditorPlantillaViewModel();

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.surface} barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => !vm.isSaving && navigation.goBack()} activeOpacity={0.7}>
            <MaterialIcons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {vm.isEditMode ? "Editar Plantilla" : "Nueva Plantilla"}
          </Text>
          <TouchableOpacity onPress={vm.handleGuardar} disabled={vm.isSaving} activeOpacity={0.7}>
            <MaterialIcons
              name="check"
              size={26}
              color={vm.isSaving ? COLORS.textTertiary : COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Tipo selector pills */}
            <Text style={styles.sectionLabel}>TIPO DE PLANTILLA</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tipoRow}
            >
              {TIPO_OPTIONS.map((opt) => {
                const isActive = vm.tipo === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[
                      styles.tipoPill,
                      isActive && { backgroundColor: `${opt.color}18`, borderColor: opt.color },
                    ]}
                    onPress={() => vm.setTipo(opt.id)}
                    activeOpacity={0.8}
                  >
                    <MaterialIcons
                      name={opt.icon as any}
                      size={18}
                      color={isActive ? opt.color : COLORS.textTertiary}
                    />
                    <Text
                      style={[
                        styles.tipoPillText,
                        isActive && { color: opt.color, fontWeight: "700" },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Form card */}
            <View style={styles.formCard}>
              {/* Nombre */}
              <Text style={styles.fieldLabel}>Nombre *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Examen parcial de Matemáticas"
                value={vm.nombre}
                onChangeText={vm.setNombre}
                placeholderTextColor={COLORS.textTertiary}
              />

              {/* Descripción */}
              <Text style={styles.fieldLabel}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                placeholder="Describe brevemente esta plantilla..."
                value={vm.descripcion}
                onChangeText={vm.setDescripcion}
                placeholderTextColor={COLORS.textTertiary}
                multiline
                numberOfLines={3}
              />

              {/* Tags */}
              <Text style={styles.fieldLabel}>Etiquetas</Text>
              <View style={styles.tagInputRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Agregar etiqueta"
                  value={vm.tagInput}
                  onChangeText={vm.setTagInput}
                  onSubmitEditing={vm.addTag}
                  placeholderTextColor={COLORS.textTertiary}
                  returnKeyType="done"
                />
                <TouchableOpacity style={styles.addTagBtn} onPress={vm.addTag} activeOpacity={0.8}>
                  <MaterialIcons name="add" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              {vm.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {vm.tags
                    .filter((t) => t !== "__borrador__")
                    .map((tag) => (
                      <View key={tag} style={styles.tagChip}>
                        <Text style={styles.tagChipText}>{tag}</Text>
                        <TouchableOpacity onPress={() => vm.removeTag(tag)}>
                          <MaterialIcons name="close" size={14} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                      </View>
                    ))}
                </View>
              )}
            </View>

            {/* Content card */}
            <View style={styles.formCard}>
              <Text style={styles.sectionLabel}>CONTENIDO</Text>

              {/* Instructions */}
              <Text style={styles.fieldLabel}>Instrucciones</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                placeholder="Instrucciones generales de la plantilla..."
                value={vm.contenido.instrucciones || ""}
                onChangeText={(v) => vm.updateContenido("instrucciones", v)}
                placeholderTextColor={COLORS.textTertiary}
                multiline
                numberOfLines={4}
              />

              {/* Sections */}
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Secciones</Text>
                <TouchableOpacity onPress={vm.addSeccion} activeOpacity={0.7}>
                  <MaterialIcons name="add-circle-outline" size={22} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
              {(vm.contenido.secciones || []).map((sec, i) => (
                <View key={i} style={styles.seccionRow}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder={`Sección ${i + 1}`}
                    value={sec}
                    onChangeText={(v) => vm.updateSeccion(i, v)}
                    placeholderTextColor={COLORS.textTertiary}
                  />
                  <TouchableOpacity onPress={() => vm.removeSeccion(i)} style={{ marginLeft: 8 }}>
                    <MaterialIcons name="remove-circle-outline" size={22} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              ))}

              {/* Exam-specific fields */}
              {vm.tipo === "examen" && (
                <>
                  <Text style={styles.fieldLabel}>Duración</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: 60 minutos"
                    value={vm.contenido.duracion || ""}
                    onChangeText={(v) => vm.updateContenido("duracion", v)}
                    placeholderTextColor={COLORS.textTertiary}
                  />
                  <Text style={styles.fieldLabel}>Puntos totales</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: 100"
                    value={vm.contenido.puntosTotales || ""}
                    onChangeText={(v) => vm.updateContenido("puntosTotales", v)}
                    placeholderTextColor={COLORS.textTertiary}
                    keyboardType="numeric"
                  />
                </>
              )}
            </View>

            {/* Bottom actions */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.btnSecondary}
                onPress={vm.handleGuardarBorrador}
                disabled={vm.isSaving}
                activeOpacity={0.8}
              >
                <MaterialIcons name="save-alt" size={18} color={COLORS.primary} />
                <Text style={styles.btnSecondaryText}>
                  {vm.isSaving ? "Guardando..." : "Guardar borrador"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnPrimary, vm.isSaving && styles.btnDisabled]}
                onPress={vm.handleGuardar}
                disabled={vm.isSaving}
                activeOpacity={0.8}
              >
                <MaterialIcons name="check-circle" size={18} color="#FFFFFF" />
                <Text style={styles.btnPrimaryText}>
                  {vm.isSaving
                    ? "Guardando..."
                    : vm.isEditMode
                      ? "Guardar cambios"
                      : "Crear plantilla"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1 },
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.text },
  // Scroll
  scrollContent: { paddingHorizontal: 16, paddingBottom: isWeb() ? 28 : 110, paddingTop: 12 },
  // Section label
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textTertiary,
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 4,
  },
  // Tipo pills
  tipoRow: { gap: 8, paddingBottom: 14 },
  tipoPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.surface,
  },
  tipoPillText: { fontSize: 13, color: COLORS.textSecondary },
  // Form card
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textSecondary,
    letterSpacing: 0.4,
    marginBottom: 6,
    marginTop: 14,
  },
  fieldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.backgroundSoft,
  },
  inputMultiline: { minHeight: 90, textAlignVertical: "top" },
  // Tags
  tagInputRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  addTagBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  tagsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: `${COLORS.primary}14`,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagChipText: { fontSize: 12, fontWeight: "600", color: COLORS.primary },
  // Secciones
  seccionRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  // Actions
  actionsRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  btnSecondary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
  },
  btnSecondaryText: { fontSize: 14, fontWeight: "600", color: COLORS.primary },
  btnPrimary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
  },
  btnPrimaryText: { fontSize: 14, fontWeight: "600", color: "#FFFFFF" },
  btnDisabled: { opacity: 0.6 },
});

export default EditorPlantillaScreen;
