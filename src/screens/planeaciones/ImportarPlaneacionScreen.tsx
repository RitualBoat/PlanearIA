import React, { useMemo } from "react";
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  Alert,
  Platform,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as DocumentPicker from "expo-document-picker";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { COLORS } from "../../../types";
import type { AppRoutesParamList } from "../../navigation/StackNavigator";
import { usePlaneaciones } from "../../context/PlaneacionesContext";
import {
  buildPlaneacionFromImportDraft,
  parseImportedPlaneacionFile,
  type PlaneacionImportDraft,
} from "../../services/planeacionImportService";

type Nav = StackNavigationProp<AppRoutesParamList, "ImportarPlaneacion">;

const ImportarPlaneacionScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { agregarPlaneacion, forceSync } = usePlaneaciones();
  const { width } = useWindowDimensions();

  const [selectedFileName, setSelectedFileName] = React.useState<string | null>(null);
  const [selectedFileType, setSelectedFileType] = React.useState<string | null>(null);
  const [selectedFileAsset, setSelectedFileAsset] =
    React.useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [importDraft, setImportDraft] = React.useState<PlaneacionImportDraft | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [importError, setImportError] = React.useState<string | null>(null);

  const wideLayout = width >= 980;

  const actividadesPreview = useMemo(() => {
    if (importDraft?.actividades?.length) {
      return importDraft.actividades.map((item, index) => ({
        id: String(index + 1).padStart(2, "0"),
        titulo: item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1),
        descripcion: item.descripcion,
      }));
    }

    return [
      {
        id: "01",
        titulo: "Inicio",
        descripcion: "Activación de conocimientos previos.",
      },
      {
        id: "02",
        titulo: "Desarrollo",
        descripcion: "Desarrollo del tema con actividades guiadas.",
      },
      {
        id: "03",
        titulo: "Cierre",
        descripcion: "Cierre y retroalimentación.",
      },
    ];
  }, [importDraft]);

  const previewSubject = React.useMemo(() => {
    if (importDraft?.asignatura) return importDraft.asignatura;
    if (!selectedFileName) return "Matemáticas Aplicadas";
    return selectedFileName
      .replace(/\.(pdf|docx|doc)$/i, "")
      .replace(/[-_]+/g, " ")
      .trim();
  }, [importDraft, selectedFileName]);

  const showPendingMessage = () => {
    Alert.alert("Importar planeación", "Opciones avanzadas disponibles en próximas tareas.");
  };

  const handleSelectFile = async () => {
    try {
      setImportError(null);
      setImportDraft(null);

      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets?.[0];
      if (!asset?.name) {
        setImportError("No se pudo leer el archivo seleccionado.");
        return;
      }

      const isValidExtension = /\.(pdf|docx|doc)$/i.test(asset.name);
      if (!isValidExtension) {
        setImportError("Formato no compatible. Usa PDF o DOCX.");
        return;
      }

      setSelectedFileName(asset.name);
      setSelectedFileType(asset.mimeType || "Documento");
      setSelectedFileAsset(asset);
      setIsProcessing(true);

      const parsed = await parseImportedPlaneacionFile(asset);
      setImportDraft(parsed);
      setIsProcessing(false);
    } catch (error) {
      setIsProcessing(false);
      setImportError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al seleccionar o procesar el archivo."
      );
    }
  };

  const handleImportarYContinuar = async () => {
    if (!selectedFileName) {
      Alert.alert("Importar planeación", "Selecciona primero un archivo PDF o DOCX.");
      return;
    }

    if (!importDraft || !selectedFileAsset) {
      Alert.alert(
        "Importar planeación",
        "No hay contenido procesado todavía. Intenta seleccionar nuevamente el archivo."
      );
      return;
    }

    try {
      setIsProcessing(true);
      setImportError(null);

      const planeacionImportada = buildPlaneacionFromImportDraft(
        importDraft,
        selectedFileAsset.name
      );

      await agregarPlaneacion(planeacionImportada);
      await forceSync();

      setIsProcessing(false);

      if (Platform.OS === "web") {
        window.alert("Planeación importada, guardada y sincronizada correctamente.");
      } else {
        Alert.alert(
          "Importar planeación",
          "Planeación importada, guardada y sincronizada correctamente."
        );
      }

      navigation.navigate("ListaPlaneaciones");
    } catch (error) {
      setIsProcessing(false);
      setImportError(
        error instanceof Error
          ? error.message
          : "No se pudo guardar o sincronizar la planeación importada."
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerRow}>
            <Pressable
              style={({ pressed }) => [styles.headerIconButton, pressed && { opacity: 0.8 }]}
              onPress={() => navigation.goBack()}
              accessibilityLabel="Regresar"
            >
              <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
            </Pressable>

            <View style={styles.headerTitleWrap}>
              <Text style={styles.headerTitle}>Importar Planeación</Text>
              <Text style={styles.headerSubtitle}>Importa desde PDF o DOCX</Text>
            </View>

            <Pressable
              style={({ pressed }) => [styles.headerIconButton, pressed && { opacity: 0.8 }]}
              onPress={showPendingMessage}
            >
              <MaterialIcons name="more-vert" size={22} color={COLORS.textTertiary} />
            </Pressable>
          </View>

          <View style={[styles.mainLayout, wideLayout && styles.mainLayoutWide]}>
            <View style={[styles.leftColumn, wideLayout && styles.leftColumnWide]}>
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Seleccionar archivo</Text>

                <View style={styles.uploadZone}>
                  <View style={styles.uploadIconCircle}>
                    <MaterialIcons name="upload-file" size={28} color={COLORS.primary} />
                  </View>
                  <Text style={styles.uploadTitle}>Arrastra o selecciona un archivo</Text>
                  <Text style={styles.uploadSubtitle}>Formatos permitidos: PDF, DOCX</Text>
                </View>

                <Pressable
                  style={({ pressed }) => [styles.primaryButton, pressed && { opacity: 0.9 }]}
                  onPress={handleSelectFile}
                >
                  <MaterialIcons name="add" size={20} color={COLORS.surface} />
                  <Text style={styles.primaryButtonText}>Seleccionar archivo</Text>
                </Pressable>

                {selectedFileName ? (
                  <View style={styles.selectedFileCard}>
                    <MaterialIcons name="description" size={18} color={COLORS.primary} />
                    <View style={styles.selectedFileTextWrap}>
                      <Text style={styles.selectedFileName}>{selectedFileName}</Text>
                      <Text style={styles.selectedFileMeta}>{selectedFileType || "Documento"}</Text>
                    </View>
                  </View>
                ) : null}

                <View style={styles.formatChipsRow}>
                  <View style={styles.formatChip}>
                    <MaterialIcons name="picture-as-pdf" size={16} color={COLORS.primary} />
                    <Text style={styles.formatChipText}>PDF</Text>
                  </View>
                  <View style={styles.formatChip}>
                    <MaterialIcons name="description" size={16} color={COLORS.primary} />
                    <Text style={styles.formatChipText}>DOCX</Text>
                  </View>
                </View>
              </View>

              {importError ? (
                <View style={styles.errorCard}>
                  <MaterialIcons name="warning-amber" size={24} color={COLORS.danger} />
                  <Text style={styles.errorText}>{importError}</Text>
                </View>
              ) : null}

              <View style={styles.card}>
                <View style={styles.stateRow}>
                  <View style={styles.stateIconCircle}>
                    <MaterialIcons
                      name={
                        isProcessing ? "sync" : selectedFileName ? "check-circle" : "hourglass-top"
                      }
                      size={22}
                      color={
                        isProcessing
                          ? COLORS.primary
                          : selectedFileName
                            ? "#0BA5A5"
                            : COLORS.textTertiary
                      }
                    />
                  </View>
                  <View style={styles.stateTextWrap}>
                    <Text style={styles.stateTitle}>
                      {isProcessing
                        ? "Procesando archivo..."
                        : selectedFileName
                          ? "Archivo listo"
                          : "Esperando archivo"}
                    </Text>
                    <Text style={styles.stateSubtitle}>
                      {isProcessing
                        ? "Extrayendo contenido..."
                        : selectedFileName
                          ? "Se cargó correctamente para vista previa"
                          : "Selecciona PDF o DOCX para continuar"}
                    </Text>
                  </View>
                </View>

                <View style={styles.stateRowMuted}>
                  <View style={[styles.stateIconCircle, styles.stateIconCircleMuted]}>
                    <MaterialIcons name="check-circle" size={22} color="#0BA5A5" />
                  </View>
                  <View style={styles.stateTextWrap}>
                    <Text style={styles.stateTitleMuted}>Contenido extraído</Text>
                    <Text style={styles.stateSubtitleMuted}>
                      {selectedFileName
                        ? "Vista previa inicial generada"
                        : "Disponible despues de seleccionar archivo"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={[styles.rightColumn, wideLayout && styles.rightColumnWide]}>
              <View style={styles.previewHeaderRow}>
                <Text style={styles.previewHeaderTitle}>Vista previa</Text>
                <View style={styles.badgeDraft}>
                  <Text style={styles.badgeDraftText}>BORRADOR</Text>
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.fieldLabel}>ASIGNATURA</Text>
                <View style={styles.fieldValueCardAccent}>
                  <Text style={styles.fieldValueText}>
                    {previewSubject || "Matemáticas Aplicadas"}
                  </Text>
                </View>

                <Text style={styles.fieldLabel}>GRADO Y GRUPO</Text>
                <View style={styles.fieldValueCard}>
                  <Text style={styles.fieldValueText}>
                    {importDraft?.grado || ""}
                    {importDraft?.grado && importDraft?.grupo ? " - " : ""}
                    {importDraft?.grupo || "Por completar"}
                  </Text>
                </View>

                <Text style={styles.fieldLabel}>TEMA DE LA SESIÓN</Text>
                <View style={styles.fieldValueCard}>
                  <Text style={styles.fieldValueText}>
                    {importDraft?.temaSesion || "Por completar"}
                  </Text>
                </View>

                <View style={styles.structureTitleRow}>
                  <MaterialIcons
                    name="format-list-bulleted"
                    size={18}
                    color={COLORS.textTertiary}
                  />
                  <Text style={styles.structureTitle}>Estructura de Actividades</Text>
                </View>

                {actividadesPreview.map((item) => (
                  <View key={item.id} style={styles.activityCard}>
                    <View style={styles.activityIndexCircle}>
                      <Text style={styles.activityIndexText}>{item.id}</Text>
                    </View>
                    <View style={styles.activityTextWrap}>
                      <Text style={styles.activityTitle}>{item.titulo}</Text>
                      <Text style={styles.activityDesc}>{item.descripcion}</Text>
                    </View>
                  </View>
                ))}

                <View style={styles.dualInfoRow}>
                  <View style={styles.infoMiniCardWarm}>
                    <Text style={styles.miniCardTitle}>Evaluación</Text>
                    <Text style={styles.miniCardText}>
                      {importDraft?.evaluacion || "Por completar"}
                    </Text>
                  </View>
                  <View style={styles.infoMiniCardCool}>
                    <Text style={styles.miniCardTitle}>Recursos</Text>
                    <Text style={styles.miniCardText}>
                      {importDraft?.recursos?.length
                        ? importDraft.recursos.slice(0, 2).join(", ")
                        : "Por completar"}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoNotice}>
                  <MaterialIcons name="info" size={20} color={COLORS.primary} />
                  <Text style={styles.infoNoticeText}>
                    {importDraft
                      ? `Se extrajeron ${importDraft.sourceTextLength} caracteres. Los campos vacíos quedan listos para edición manual.`
                      : "Puedes ajustar estos datos antes de guardar definitivamente en tu repositorio."}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={[styles.footerActions, wideLayout && styles.footerActionsWide]}>
            <Pressable
              style={({ pressed }) => [
                styles.primaryButtonLarge,
                (!selectedFileName || isProcessing) && styles.primaryButtonLargeDisabled,
                pressed && { opacity: 0.9 },
              ]}
              onPress={handleImportarYContinuar}
              disabled={!selectedFileName || isProcessing}
            >
              <MaterialIcons name="save-alt" size={22} color={COLORS.surface} />
              <Text style={styles.primaryButtonLargeText}>Importar y continuar</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.cancelButton, pressed && { opacity: 0.8 }]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </Pressable>
          </View>
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
  scrollContent: {
    width: "100%",
    maxWidth: 1240,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 110,
    gap: 12,
    flexGrow: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  mainLayout: {
    gap: 12,
  },
  mainLayoutWide: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  leftColumn: {
    gap: 12,
  },
  leftColumnWide: {
    width: "35%",
  },
  rightColumn: {
    gap: 10,
  },
  rightColumnWide: {
    width: "65%",
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 10,
    boxShadow: "0px 12px 22px rgba(18, 44, 86, 0.08)",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
  },
  uploadZone: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#BFD0E4",
    borderRadius: 14,
    minHeight: 175,
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    gap: 7,
    backgroundColor: COLORS.backgroundSoft,
  },
  uploadIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DFF1FF",
  },
  uploadTitle: {
    textAlign: "center",
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
  },
  uploadSubtitle: {
    textAlign: "center",
    color: COLORS.textTertiary,
    fontSize: 13,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryButtonText: {
    color: COLORS.surface,
    fontSize: 15,
    fontWeight: "700",
  },
  selectedFileCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D4E5F7",
    backgroundColor: COLORS.backgroundSoft,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  selectedFileTextWrap: {
    flex: 1,
    gap: 1,
  },
  selectedFileName: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
  },
  selectedFileMeta: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  formatChipsRow: {
    flexDirection: "row",
    gap: 10,
  },
  formatChip: {
    borderRadius: 16,
    paddingVertical: 7,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.primaryTint,
  },
  formatChipText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "700",
  },
  errorCard: {
    borderWidth: 1,
    borderColor: "#F6C4CB",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFF7F7",
  },
  errorText: {
    flex: 1,
    color: COLORS.dangerDark,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },
  stateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stateRowMuted: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    opacity: 0.72,
  },
  stateIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primaryTint,
  },
  stateIconCircleMuted: {
    backgroundColor: "#DEF6F5",
  },
  stateTextWrap: {
    flex: 1,
  },
  stateTitle: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: "700",
  },
  stateSubtitle: {
    marginTop: 1,
    fontSize: 13,
    color: COLORS.textTertiary,
  },
  stateTitleMuted: {
    fontSize: 15,
    color: COLORS.textDark,
    fontWeight: "700",
  },
  stateSubtitleMuted: {
    marginTop: 1,
    fontSize: 13,
    color: COLORS.textTertiary,
  },
  previewHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  previewHeaderTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "800",
  },
  badgeDraft: {
    borderRadius: 10,
    backgroundColor: "#DFF1FF",
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  badgeDraftText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
  },
  fieldLabel: {
    color: COLORS.textTertiary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  fieldValueCard: {
    borderRadius: 12,
    backgroundColor: COLORS.backgroundSoft,
    minHeight: 50,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  fieldValueCardAccent: {
    borderRadius: 12,
    backgroundColor: COLORS.backgroundSoft,
    minHeight: 50,
    paddingHorizontal: 12,
    justifyContent: "center",
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  fieldValueText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "600",
  },
  structureTitleRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  structureTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
  },
  activityCard: {
    borderRadius: 12,
    backgroundColor: COLORS.backgroundSoft,
    padding: 10,
    flexDirection: "row",
    gap: 10,
  },
  activityIndexCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  activityIndexText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: "700",
  },
  activityTextWrap: {
    flex: 1,
    gap: 1,
  },
  activityTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
  },
  activityDesc: {
    color: COLORS.textDark,
    fontSize: 12,
    lineHeight: 17,
  },
  dualInfoRow: {
    flexDirection: "row",
    gap: 8,
  },
  infoMiniCardWarm: {
    flex: 1,
    borderRadius: 12,
    padding: 10,
    backgroundColor: "#FFF4E8",
    gap: 4,
  },
  infoMiniCardCool: {
    flex: 1,
    borderRadius: 12,
    padding: 10,
    backgroundColor: COLORS.primaryTint,
    gap: 4,
  },
  miniCardTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
  },
  miniCardText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  infoNotice: {
    borderRadius: 12,
    padding: 11,
    backgroundColor: COLORS.primaryTint,
    flexDirection: "row",
    gap: 8,
  },
  infoNoticeText: {
    flex: 1,
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
  },
  footerActions: {
    gap: 10,
  },
  footerActionsWide: {
    flexDirection: "row",
    alignItems: "center",
  },
  primaryButtonLarge: {
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    flex: 1,
  },
  primaryButtonLargeDisabled: {
    opacity: 0.6,
  },
  primaryButtonLargeText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: "700",
  },
  cancelButton: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D6E0EE",
    backgroundColor: COLORS.surface,
    paddingHorizontal: 24,
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: "700",
  },
});

export default ImportarPlaneacionScreen;
