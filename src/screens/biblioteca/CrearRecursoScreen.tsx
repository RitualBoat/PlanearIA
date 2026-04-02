import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { COLORS, FONT_SIZES } from "../../../types";
import { useCrearRecursoViewModel } from "../../hooks/useCrearRecursoViewModel";

type Nav = StackNavigationProp<RootStackParamList, "CrearRecurso">;
type Route = RouteProp<RootStackParamList, "CrearRecurso">;

const ORIGEN_OPTIONS: { key: "manual" | "ia"; label: string; icon: string }[] = [
  { key: "manual", label: "Propio", icon: "folder" },
  { key: "ia", label: "Generado con IA", icon: "auto-awesome" },
];

const CrearRecursoScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const recursoId = route.params?.recursoId;
  const vm = useCrearRecursoViewModel(recursoId);

  const [tagInput, setTagInput] = useState("");

  const handleAddTag = () => {
    if (tagInput.trim()) {
      vm.addTag(tagInput.trim());
      setTagInput("");
    }
  };

  const getFileIcon = (fileName?: string): string => {
    if (!fileName) return "insert-drive-file";
    const ext = fileName.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "pdf":
        return "picture-as-pdf";
      case "doc":
      case "docx":
        return "description";
      case "xls":
      case "xlsx":
        return "table-chart";
      case "ppt":
      case "pptx":
        return "slideshow";
      case "mp3":
      case "wav":
      case "m4a":
      case "ogg":
        return "audiotrack";
      case "mp4":
      case "mov":
      case "avi":
      case "mkv":
        return "videocam";
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
      case "webp":
        return "image";
      default:
        return "insert-drive-file";
    }
  };

  const getFileIconColor = (fileName?: string): string => {
    if (!fileName) return COLORS.textSecondary;
    const ext = fileName.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "pdf":
        return "#D32F2F";
      case "doc":
      case "docx":
        return "#1565C0";
      case "xls":
      case "xlsx":
        return "#2E7D32";
      case "ppt":
      case "pptx":
        return "#E65100";
      case "mp3":
      case "wav":
      case "m4a":
      case "ogg":
        return "#7B1FA2";
      case "mp4":
      case "mov":
      case "avi":
      case "mkv":
        return "#C62828";
      default:
        return COLORS.textSecondary;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="white" barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Crear Recurso</Text>
          <TouchableOpacity
            onPress={() => {
              void vm.handleGuardar().then(() => {
                if (!vm.isSaving) navigation.goBack();
              });
            }}
          >
            <MaterialIcons name="save" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Type pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tipoPillsScroll}
            contentContainerStyle={styles.tipoPillsContainer}
          >
            {vm.tipoOptions.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.tipoPill, vm.tipo === opt.key && styles.tipoPillActive]}
                onPress={() => vm.setTipo(opt.key)}
              >
                <MaterialIcons
                  name={opt.icon as any}
                  size={16}
                  color={vm.tipo === opt.key ? "white" : COLORS.text}
                />
                <Text
                  style={[styles.tipoPillText, vm.tipo === opt.key && styles.tipoPillTextActive]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Form card */}
          <View style={styles.formCard}>
            {/* Título */}
            <Text style={styles.label}>TÍTULO</Text>
            <TextInput
              style={styles.input}
              value={vm.titulo}
              onChangeText={vm.setTitulo}
              placeholder="Ej: Examen de Álgebra Lineal"
              placeholderTextColor={COLORS.textSecondary}
            />

            {/* Descripción */}
            <Text style={styles.label}>DESCRIPCIÓN</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={vm.descripcion}
              onChangeText={vm.setDescripcion}
              placeholder="Describe el contenido del recurso..."
              placeholderTextColor={COLORS.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            {/* Etiquetas */}
            <Text style={styles.label}>ETIQUETAS</Text>
            <View style={styles.tagsContainer}>
              {vm.tags.map((tag, index) => (
                <View key={`${tag}-${index}`} style={styles.tagChip}>
                  <Text style={styles.tagChipText}>{tag}</Text>
                  <TouchableOpacity onPress={() => vm.removeTag(index)}>
                    <MaterialIcons name="close" size={16} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              ))}
              <View style={styles.tagInputRow}>
                <TextInput
                  style={styles.tagInput}
                  value={tagInput}
                  onChangeText={setTagInput}
                  placeholder="+ Agregar etiqueta"
                  placeholderTextColor={COLORS.primary}
                  onSubmitEditing={handleAddTag}
                  returnKeyType="done"
                />
              </View>
            </View>
          </View>

          {/* Origen del contenido */}
          <View style={styles.origenSection}>
            <Text style={styles.label}>ORIGEN DEL CONTENIDO</Text>
            <View style={styles.origenCardsRow}>
              {ORIGEN_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.origenCard, vm.origen === opt.key && styles.origenCardActive]}
                  onPress={() => vm.setOrigen(opt.key)}
                >
                  <MaterialIcons
                    name={opt.icon as any}
                    size={28}
                    color={vm.origen === opt.key ? COLORS.primary : COLORS.textSecondary}
                  />
                  <Text
                    style={[
                      styles.origenCardText,
                      vm.origen === opt.key && styles.origenCardTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Upload area */}
          {vm.uploadedFile ? (
            <View style={styles.uploadedCard}>
              <View style={styles.uploadedIconContainer}>
                <MaterialIcons
                  name={getFileIcon(vm.uploadedFile.name) as any}
                  size={28}
                  color={getFileIconColor(vm.uploadedFile.name)}
                />
              </View>
              <View style={styles.uploadedInfo}>
                <Text style={styles.uploadedName} numberOfLines={1}>
                  {vm.uploadedFile.name}
                </Text>
                <Text style={styles.uploadedSize}>{vm.uploadedFile.size} · Subido con éxito</Text>
              </View>
              <MaterialIcons name="check-circle" size={24} color={COLORS.success} />
              <TouchableOpacity onPress={() => void vm.handleSelectFile()}>
                <Text style={styles.changeLink}>CAMBIAR</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.uploadArea} onPress={() => void vm.handleSelectFile()}>
              <View style={styles.uploadIconCircle}>
                <MaterialIcons name="cloud-upload" size={28} color={COLORS.primary} />
              </View>
              <Text style={styles.uploadTitle}>Arrastra o selecciona un archivo</Text>
              <Text style={styles.uploadSubtitle}>
                PDF, Word, Excel, PPT, Audio, Video — Máx. 10MB
              </Text>
              <View style={styles.uploadButton}>
                <Text style={styles.uploadButtonText}>Seleccionar Archivo</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* AI suggestion card (show when origen is "ia" or tipo is "examen") */}
          {(vm.origen === "ia" || vm.tipo === "examen") && (
            <View style={styles.aiCard}>
              <MaterialIcons name="auto-awesome" size={24} color={COLORS.primary} />
              <View style={styles.aiCardContent}>
                <Text style={styles.aiCardText}>
                  ¿Quieres que la IA genere preguntas para este examen?
                </Text>
                <TouchableOpacity style={styles.aiButton}>
                  <Text style={styles.aiButtonText}>Generar con IA</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Bottom buttons */}
          <View style={styles.bottomButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, vm.isSaving && styles.saveButtonDisabled]}
              disabled={vm.isSaving}
              onPress={() => {
                void vm.handleGuardar().then(() => {
                  if (!vm.isSaving) navigation.goBack();
                });
              }}
            >
              <Text style={styles.saveButtonText}>
                {vm.isSaving ? "Guardando..." : "Guardar Recurso"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Delete button (edit mode) */}
          {vm.isEditMode && (
            <TouchableOpacity style={styles.deleteButton} onPress={vm.handleEliminar}>
              <MaterialIcons name="delete-outline" size={20} color="#D32F2F" />
              <Text style={styles.deleteButtonText}>Eliminar recurso</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  // Type pills
  tipoPillsScroll: {
    maxHeight: 50,
  },
  tipoPillsContainer: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tipoPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  tipoPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tipoPillText: {
    fontSize: FONT_SIZES.small,
    fontWeight: "600",
    color: COLORS.text,
  },
  tipoPillTextActive: {
    color: "white",
  },
  // Form card
  formCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 16,
    marginHorizontal: 16,
    padding: 20,
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 16,
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
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  // Tags
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    backgroundColor: COLORS.backgroundSoft,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 10,
    padding: 10,
    minHeight: 44,
  },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: `${COLORS.primary}15`,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagChipText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.primary,
    fontWeight: "600",
  },
  tagInputRow: {
    flex: 1,
    minWidth: 100,
  },
  tagInput: {
    fontSize: FONT_SIZES.small,
    color: COLORS.primary,
    padding: 0,
    paddingVertical: 6,
  },
  // Origen
  origenSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  origenCardsRow: {
    flexDirection: "row",
    gap: 12,
  },
  origenCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 14,
    paddingVertical: 20,
    gap: 8,
  },
  origenCardActive: {
    backgroundColor: `${COLORS.primary}10`,
    borderColor: COLORS.primary,
  },
  origenCardText: {
    fontSize: FONT_SIZES.small,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  origenCardTextActive: {
    color: COLORS.primary,
  },
  // Upload area
  uploadArea: {
    marginHorizontal: 16,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: COLORS.borderLight,
    borderRadius: 14,
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
    marginBottom: 16,
    backgroundColor: COLORS.backgroundSoft,
  },
  uploadIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: `${COLORS.primary}10`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: FONT_SIZES.medium,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
    textAlign: "center",
  },
  uploadSubtitle: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  uploadButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  uploadButtonText: {
    color: "white",
    fontSize: FONT_SIZES.small,
    fontWeight: "bold",
  },
  // Uploaded file
  uploadedCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    marginBottom: 16,
  },
  uploadedIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#FFE8E8",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadedInfo: {
    flex: 1,
  },
  uploadedName: {
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
    color: COLORS.text,
  },
  uploadedSize: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  changeLink: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  // AI card
  aiCard: {
    flexDirection: "row",
    marginHorizontal: 16,
    backgroundColor: "#E0F7FA",
    borderRadius: 14,
    padding: 16,
    gap: 12,
    marginBottom: 16,
    alignItems: "flex-start",
  },
  aiCardContent: {
    flex: 1,
  },
  aiCardText: {
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 10,
  },
  aiButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  aiButtonText: {
    color: "white",
    fontSize: FONT_SIZES.small,
    fontWeight: "bold",
  },
  // Bottom buttons
  bottomButtons: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    backgroundColor: COLORS.surface,
  },
  cancelButtonText: {
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
    color: COLORS.text,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "white",
    fontSize: FONT_SIZES.medium,
    fontWeight: "bold",
  },
  // Delete
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
    marginBottom: 20,
  },
  deleteButtonText: {
    color: "#D32F2F",
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
  },
});

export default CrearRecursoScreen;
