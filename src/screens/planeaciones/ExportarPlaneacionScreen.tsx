import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Switch,
  Modal,
  Alert,
  Linking,
  Platform,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import * as Sharing from "expo-sharing";
import type { RootStackParamList } from "../../navigation/StackNavigator";
import { usePlaneaciones } from "../../context/PlaneacionesContext";
import { COLORS } from "../../../types";
import {
  exportPlaneacionToPdf,
  exportPlaneacionToDocx,
} from "../../services/planeacionExportService";
import type { PlaneacionDocumento } from "../../../types/planeacionV2";

type Nav = StackNavigationProp<RootStackParamList, "ExportarPlaneacion">;
type ExportarRoute = RouteProp<RootStackParamList, "ExportarPlaneacion">;

type ExportFormat = "pdf" | "docx";

type ExportOptions = {
  portada: boolean;
  infoInstitucional: boolean;
  datosGenerales: boolean;
  curricular: boolean;
  sesiones: boolean;
  evaluacion: boolean;
  observaciones: boolean;
  firmas: boolean;
};

const formatLabel: Record<ExportFormat, string> = {
  pdf: "Archivo PDF (.pdf)",
  docx: "Documento Word (.docx)",
};

const formatIcon: Record<ExportFormat, keyof typeof MaterialIcons.glyphMap> = {
  pdf: "picture-as-pdf",
  docx: "description",
};

const stripHtml = (html?: string | null): string => {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, "").trim();
};

const ExportarPlaneacionScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<ExportarRoute>();
  const { width } = useWindowDimensions();
  const wideLayout = width >= 980;

  const { documentos, obtenerDocumento } = usePlaneaciones();
  const planeacionId = route.params?.planeacionId;
  const planeacion = React.useMemo<PlaneacionDocumento | undefined>(
    () => (planeacionId ? obtenerDocumento(planeacionId) : documentos[0]),
    [documentos, obtenerDocumento, planeacionId]
  );

  const [selectedFormat, setSelectedFormat] = React.useState<ExportFormat>("pdf");
  const [options, setOptions] = React.useState<ExportOptions>({
    portada: true,
    infoInstitucional: true,
    datosGenerales: true,
    curricular: true,
    sesiones: true,
    evaluacion: true,
    observaciones: false,
    firmas: true,
  });
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [exportedFileUri, setExportedFileUri] = React.useState<string>("");
  const [exportedFileName, setExportedFileName] = React.useState<string>("");
  const [exportedFileSize, setExportedFileSize] = React.useState<string>("");

  const showMessage = React.useCallback((title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(message);
      return;
    }

    Alert.alert(title, message);
  }, []);

  const estimatedSize = React.useMemo(() => {
    const optionCount = Object.values(options).filter(Boolean).length;
    const base = selectedFormat === "pdf" ? 1.1 : 0.9;
    return `${(base + optionCount * 0.1).toFixed(1)} MB`;
  }, [options, selectedFormat]);

  const selectedSections = React.useMemo(() => {
    const labels: string[] = [];
    if (options.portada) labels.push("Portada");
    if (options.infoInstitucional) labels.push("Institucion");
    if (options.datosGenerales) labels.push("Datos generales");
    if (options.curricular) labels.push("Elementos curriculares");
    if (options.sesiones) labels.push("Sesiones");
    if (options.evaluacion) labels.push("EvaluaciÃ³n");
    if (options.observaciones) labels.push("Observaciones");
    if (options.firmas) labels.push("Firmas");
    return labels;
  }, [options]);

  const toggleOption = (key: keyof ExportOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExportar = async () => {
    if (!planeacion) {
      showMessage("Exportar", "No se encontrÃ³ la planeaciÃ³n para exportar.");
      return;
    }

    try {
      setIsGenerating(true);

      const result =
        selectedFormat === "pdf"
          ? await exportPlaneacionToPdf(planeacion, options)
          : await exportPlaneacionToDocx(planeacion, options);

      const sizeMb = (result.sizeBytes / (1024 * 1024)).toFixed(1);

      setExportedFileUri(result.uri);
      setExportedFileName(result.name);
      setExportedFileSize(`${sizeMb} MB`);
      setShowSuccess(true);
    } catch (error) {
      showMessage(
        "Exportar",
        error instanceof Error ? error.message : "No se pudo generar el archivo."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCompartir = async () => {
    if (!exportedFileUri) {
      showMessage("Compartir", "Primero exporta un archivo para poder compartirlo.");
      return;
    }

    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        showMessage("Compartir", "Compartir no estÃ¡ disponible en este dispositivo.");
        return;
      }

      await Sharing.shareAsync(exportedFileUri, {
        mimeType:
          selectedFormat === "pdf"
            ? "application/pdf"
            : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        dialogTitle: "Compartir planeaciÃ³n",
      });
    } catch {
      showMessage("Compartir", "No se pudo abrir el menÃº de compartir.");
    }
  };

  const handleOpenFile = async () => {
    if (!exportedFileUri) {
      showMessage("Exportar", "No hay archivo generado para abrir.");
      return;
    }

    try {
      await Linking.openURL(exportedFileUri);
    } catch {
      showMessage("Exportar", "No se pudo abrir el archivo generado.");
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
            <TouchableOpacity style={styles.headerIconButton} onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>

            <View style={styles.headerTitleWrap}>
              <Text style={styles.headerTitle}>Exportar PlaneaciÃ³n</Text>
              <Text style={styles.headerSubtitle}>Genera y comparte en distintos formatos</Text>
            </View>

            <TouchableOpacity style={styles.headerIconButton}>
              <MaterialIcons name="more-vert" size={22} color={COLORS.textTertiary} />
            </TouchableOpacity>
          </View>

          <View style={[styles.mainLayout, wideLayout && styles.mainLayoutWide]}>
            <View style={[styles.leftColumn, wideLayout && styles.leftColumnWide]}>
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Seleccionar formato</Text>

                {(["pdf", "docx"] as ExportFormat[]).map((format) => {
                  const active = selectedFormat === format;
                  return (
                    <TouchableOpacity
                      key={format}
                      style={[styles.formatOption, active && styles.formatOptionActive]}
                      onPress={() => setSelectedFormat(format)}
                      activeOpacity={0.85}
                    >
                      <View style={styles.formatOptionLeft}>
                        <View style={[styles.radio, active && styles.radioActive]} />
                        <MaterialIcons
                          name={formatIcon[format]}
                          size={18}
                          color={format === "pdf" ? "#E53935" : "#2463EB"}
                        />
                        <Text style={[styles.formatText, active && styles.formatTextActive]}>
                          {formatLabel[format]}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Opciones de contenido</Text>

                <View style={styles.switchRow}>
                  <Text style={styles.switchText}>Incluir portada</Text>
                  <Switch value={options.portada} onValueChange={() => toggleOption("portada")} />
                </View>
                <View style={styles.switchRow}>
                  <Text style={styles.switchText}>Incluir informacion institucional</Text>
                  <Switch
                    value={options.infoInstitucional}
                    onValueChange={() => toggleOption("infoInstitucional")}
                  />
                </View>
                <View style={styles.switchRow}>
                  <Text style={styles.switchText}>Incluir datos generales</Text>
                  <Switch
                    value={options.datosGenerales}
                    onValueChange={() => toggleOption("datosGenerales")}
                  />
                </View>
                <View style={styles.switchRow}>
                  <Text style={styles.switchText}>Incluir elementos curriculares</Text>
                  <Switch
                    value={options.curricular}
                    onValueChange={() => toggleOption("curricular")}
                  />
                </View>
                <View style={styles.switchRow}>
                  <Text style={styles.switchText}>Incluir sesiones detalladas</Text>
                  <Switch value={options.sesiones} onValueChange={() => toggleOption("sesiones")} />
                </View>
                <View style={styles.switchRow}>
                  <Text style={styles.switchText}>Incluir rÃºbrica/evaluaciÃ³n</Text>
                  <Switch
                    value={options.evaluacion}
                    onValueChange={() => toggleOption("evaluacion")}
                  />
                </View>
                <View style={styles.switchRow}>
                  <Text style={styles.switchText}>Incluir observaciones</Text>
                  <Switch
                    value={options.observaciones}
                    onValueChange={() => toggleOption("observaciones")}
                  />
                </View>
                <View style={styles.switchRow}>
                  <Text style={styles.switchText}>Incluir firmas</Text>
                  <Switch value={options.firmas} onValueChange={() => toggleOption("firmas")} />
                </View>
              </View>
            </View>

            <View style={[styles.rightColumn, wideLayout && styles.rightColumnWide]}>
              <View style={styles.card}>
                <View style={styles.previewHeaderRow}>
                  <Text style={styles.sectionTitle}>Vista previa</Text>
                  <View style={styles.readyBadge}>
                    <Text style={styles.readyBadgeText}>LISTO PARA EXPORTAR</Text>
                  </View>
                </View>

                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>ASIGNATURA</Text>
                    <Text style={styles.infoValue}>
                      {planeacion?.datosGenerales?.asignatura || "Sin asignatura"}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>GRADO Y GRUPO</Text>
                    <Text style={styles.infoValue}>
                      {planeacion
                        ? `${planeacion.datosGenerales?.grado || ""} ${(planeacion.datosGenerales?.grupos || []).join(", ")}`
                        : "Sin datos"}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>SESIONES</Text>
                    <Text style={styles.infoValue}>
                      {planeacion ? `${planeacion.sesiones?.length || 0} sesiones` : "Sin datos"}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>EVALUACION</Text>
                    <Text style={styles.infoValue}>
                      {planeacion?.evaluacionFinal?.criterios?.length
                        ? `${planeacion.evaluacionFinal.criterios.length} criterios`
                        : "Sin criterios"}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>TEMA PRINCIPAL</Text>
                    <Text style={styles.infoValue}>
                      {stripHtml(planeacion?.elementosCurriculares?.pda) || "Sin tema"}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>TAMAÃ‘O</Text>
                    <Text style={styles.infoValue}>{estimatedSize}</Text>
                  </View>
                </View>

                <View style={styles.previewBody}>
                  <MaterialIcons name="description" size={42} color={COLORS.primary} />
                  <Text style={styles.previewBodyText}>
                    El documento se generarÃ¡ con formato profesional listo para compartir o
                    imprimir.
                  </Text>
                </View>

                <View style={styles.sectionChips}>
                  {selectedSections.map((section) => (
                    <View key={section} style={styles.sectionChip}>
                      <Text style={styles.sectionChipText}>{section}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>

          <View style={[styles.footerActions, wideLayout && styles.footerActionsWide]}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareButton} onPress={handleCompartir}>
              <MaterialIcons name="share" size={20} color={COLORS.textSecondary} />
              <Text style={styles.shareButtonText}>Compartir</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.exportButton} onPress={handleExportar}>
              <MaterialIcons name="download" size={20} color={COLORS.surface} />
              <Text style={styles.exportButtonText}>Exportar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

      <Modal visible={isGenerating} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.loadingCard}>
            <View style={styles.loadingIconCircle}>
              <MaterialIcons name="description" size={34} color={COLORS.primary} />
            </View>
            <Text style={styles.loadingTitle}>Generando archivo...</Text>
            <Text style={styles.loadingSubtitle}>
              Preparando {selectedFormat.toUpperCase()} con las secciones seleccionadas.
            </Text>
            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showSuccess}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccess(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.successCard}>
            <View style={styles.successIconWrap}>
              <MaterialIcons name="check" size={34} color={COLORS.surface} />
            </View>
            <Text style={styles.successTitle}>Â¡PlaneaciÃ³n exportada!</Text>
            <Text style={styles.successSubtitle}>
              El archivo {selectedFormat.toUpperCase()} se generÃ³ correctamente y estÃ¡ listo para
              usarse.
            </Text>

            <View style={styles.fileCard}>
              <MaterialIcons name={formatIcon[selectedFormat]} size={22} color={COLORS.primary} />
              <View style={styles.fileCardTextWrap}>
                <Text style={styles.fileCardTitle} numberOfLines={1}>
                  {exportedFileName ||
                    `Planeacion_${planeacion?.datosGenerales?.asignatura || "sin_asignatura"}.${selectedFormat}`}
                </Text>
                <Text style={styles.fileCardMeta}>
                  {(exportedFileSize || estimatedSize) + " â€¢ Creado ahora mismo"}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.openButton} onPress={handleOpenFile}>
              <Text style={styles.openButtonText}>Abrir archivo</Text>
            </TouchableOpacity>

            <View style={styles.successActionsRow}>
              <TouchableOpacity
                style={styles.successSecondaryButton}
                onPress={() => {
                  setShowSuccess(false);
                  void handleCompartir();
                }}
              >
                <MaterialIcons name="share" size={18} color={COLORS.textSecondary} />
                <Text style={styles.successSecondaryButtonText}>Compartir</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.successSecondaryButton}
                onPress={() => {
                  setShowSuccess(false);
                  navigation.navigate("ListaPlaneaciones");
                }}
              >
                <MaterialIcons name="home" size={18} color={COLORS.textSecondary} />
                <Text style={styles.successSecondaryButtonText}>Volver al inicio</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1 },
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
  headerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
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
  headerTitleWrap: { flex: 1 },
  headerTitle: { fontSize: 30, fontWeight: "800", color: COLORS.text, letterSpacing: -0.4 },
  headerSubtitle: { marginTop: 2, fontSize: 14, color: COLORS.textSecondary },
  mainLayout: { gap: 12 },
  mainLayoutWide: { flexDirection: "row", alignItems: "flex-start" },
  leftColumn: { gap: 12 },
  leftColumnWide: { width: "40%" },
  rightColumn: { gap: 10 },
  rightColumnWide: { width: "60%" },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 10,
  },
  sectionTitle: { fontSize: 24, fontWeight: "800", color: COLORS.text },
  formatOption: {
    minHeight: 52,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "#EDF2F8",
    justifyContent: "center",
  },
  formatOptionActive: {
    backgroundColor: COLORS.borderLight,
    borderWidth: 1,
    borderColor: "#C2D6F2",
  },
  formatOptionLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  radio: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#D6DFEA",
  },
  radioActive: { backgroundColor: COLORS.primary },
  formatText: { fontSize: 16, color: "#3A4A5E", fontWeight: "600" },
  formatTextActive: { color: "#1D2A3A", fontWeight: "700" },
  switchRow: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  switchText: { fontSize: 16, color: "#2F3D4D", fontWeight: "600" },
  previewHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  readyBadge: {
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: COLORS.borderLight,
  },
  readyBadgeText: { color: "#2F5A90", fontSize: 12, fontWeight: "800", letterSpacing: 0.5 },
  infoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  infoItem: { width: "48%", gap: 2 },
  infoLabel: { color: COLORS.textTertiary, fontSize: 11, fontWeight: "800", letterSpacing: 0.8 },
  infoValue: { color: COLORS.text, fontSize: 16, fontWeight: "700" },
  previewBody: {
    borderRadius: 12,
    padding: 20,
    minHeight: 170,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#E8EFF7",
  },
  previewBodyText: { color: COLORS.textDark, fontSize: 15, textAlign: "center", lineHeight: 21 },
  sectionChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  sectionChip: {
    borderRadius: 8,
    backgroundColor: COLORS.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  sectionChipText: { color: COLORS.textDark, fontSize: 12, fontWeight: "700" },
  footerActions: { gap: 10 },
  footerActionsWide: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  cancelButton: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingHorizontal: 24,
    backgroundColor: "transparent",
  },
  cancelButtonText: { color: "#55657D", fontSize: 22, fontWeight: "600" },
  shareButton: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 8,
    flexDirection: "row",
    backgroundColor: "#DDE3EC",
  },
  shareButtonText: { color: COLORS.textSecondary, fontSize: 16, fontWeight: "700" },
  exportButton: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    gap: 8,
    flexDirection: "row",
    backgroundColor: COLORS.primary,
  },
  exportButtonText: { color: COLORS.surface, fontSize: 16, fontWeight: "700" },
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(16, 28, 46, 0.35)",
    padding: 16,
  },
  loadingCard: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    backgroundColor: COLORS.surface,
    gap: 10,
  },
  loadingIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primaryTint,
  },
  loadingTitle: { fontSize: 34, color: "#1D2736", fontWeight: "800", textAlign: "center" },
  loadingSubtitle: {
    fontSize: 16,
    color: COLORS.textDark,
    textAlign: "center",
    lineHeight: 22,
  },
  progressTrack: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D5DFEC",
    overflow: "hidden",
  },
  progressFill: {
    width: "62%",
    height: "100%",
    backgroundColor: COLORS.primary,
  },
  successCard: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 22,
    padding: 22,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    gap: 12,
  },
  successIconWrap: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: "#0BAA74",
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: { fontSize: 34, color: "#111C2B", fontWeight: "800", textAlign: "center" },
  successSubtitle: {
    fontSize: 16,
    lineHeight: 23,
    color: COLORS.textDark,
    textAlign: "center",
  },
  fileCard: {
    width: "100%",
    borderRadius: 14,
    padding: 12,
    backgroundColor: "#EFF4FB",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  fileCardTextWrap: { flex: 1 },
  fileCardTitle: { fontSize: 15, color: COLORS.text, fontWeight: "700" },
  fileCardMeta: { marginTop: 2, color: "#6C7B90", fontSize: 12 },
  openButton: {
    marginTop: 4,
    width: "100%",
    minHeight: 50,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  openButtonText: { color: COLORS.surface, fontSize: 18, fontWeight: "800" },
  successActionsRow: {
    width: "100%",
    flexDirection: "row",
    gap: 8,
  },
  successSecondaryButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: "#E4EAF3",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },
  successSecondaryButtonText: { color: "#566881", fontSize: 16, fontWeight: "700" },
});

export default ExportarPlaneacionScreen;
