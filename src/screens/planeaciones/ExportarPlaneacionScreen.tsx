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
import type { RootStackParamList } from "../../navigation/StackNavigator";
import { usePlaneaciones } from "../../sync/providers/SyncProvider";
import {
  exportPlaneacionToPdf,
  exportPlaneacionToDocx,
} from "../../services/planeacionExportService";

type Nav = StackNavigationProp<RootStackParamList, "ExportarPlaneacion">;
type ExportarRoute = RouteProp<RootStackParamList, "ExportarPlaneacion">;

type ExportFormat = "pdf" | "docx" | "xlsx";

type ExportOptions = {
  portada: boolean;
  actividades: boolean;
  evaluacion: boolean;
  observaciones: boolean;
};

const formatLabel: Record<ExportFormat, string> = {
  pdf: "Archivo PDF (.pdf)",
  docx: "Documento Word (.docx)",
  xlsx: "Hoja de cálculo Excel (.xlsx)",
};

const formatIcon: Record<ExportFormat, keyof typeof MaterialIcons.glyphMap> = {
  pdf: "picture-as-pdf",
  docx: "description",
  xlsx: "table-chart",
};

const ExportarPlaneacionScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<ExportarRoute>();
  const { width } = useWindowDimensions();
  const wideLayout = width >= 980;

  const { planeaciones, obtenerPlaneacion } = usePlaneaciones();
  const planeacionId = route.params?.planeacionId;
  const planeacion = planeacionId ? obtenerPlaneacion(planeacionId) : planeaciones[0];

  const [selectedFormat, setSelectedFormat] = React.useState<ExportFormat>("pdf");
  const [options, setOptions] = React.useState<ExportOptions>({
    portada: true,
    actividades: true,
    evaluacion: true,
    observaciones: false,
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
    const base = selectedFormat === "pdf" ? 1.1 : selectedFormat === "docx" ? 0.9 : 0.7;
    return `${(base + optionCount * 0.1).toFixed(1)} MB`;
  }, [options, selectedFormat]);

  const selectedSections = React.useMemo(() => {
    const labels: string[] = [];
    if (options.portada) labels.push("Portada");
    if (options.actividades) labels.push("Actividades");
    if (options.evaluacion) labels.push("Evaluación");
    if (options.observaciones) labels.push("Observaciones");
    return labels;
  }, [options]);

  const toggleOption = (key: keyof ExportOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExportar = async () => {
    if (!planeacion) {
      showMessage("Exportar", "No se encontró la planeación para exportar.");
      return;
    }

    try {
      setIsGenerating(true);

      const result =
        selectedFormat === "pdf"
          ? await exportPlaneacionToPdf(planeacion, options)
          : selectedFormat === "docx"
            ? await exportPlaneacionToDocx(planeacion, options)
            : null;

      if (!result) {
        showMessage("Exportar", "Excel se habilitará en la siguiente tarea.");
        return;
      }

      const sizeMb = (result.sizeBytes / (1024 * 1024)).toFixed(1);

      setExportedFileUri(result.uri);
      setExportedFileName(result.name);
      setExportedFileSize(`${sizeMb} MB`);
      setShowSuccess(true);
    } catch (error) {
      showMessage(
        "Exportar",
        error instanceof Error ? error.message : "No se pudo generar el archivo PDF.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCompartir = () => {
    showMessage("Compartir", "La hoja de compartir se habilitará en la siguiente tarea.");
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
      <StatusBar backgroundColor="#EEF3FA" barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.headerIconButton} onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back" size={24} color="#1676D2" />
            </TouchableOpacity>

            <View style={styles.headerTitleWrap}>
              <Text style={styles.headerTitle}>Exportar Planeación</Text>
              <Text style={styles.headerSubtitle}>Genera y comparte en distintos formatos</Text>
            </View>

            <TouchableOpacity style={styles.headerIconButton}>
              <MaterialIcons name="more-vert" size={22} color="#7A8BA3" />
            </TouchableOpacity>
          </View>

          <View style={[styles.mainLayout, wideLayout && styles.mainLayoutWide]}>
            <View style={[styles.leftColumn, wideLayout && styles.leftColumnWide]}>
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Seleccionar formato</Text>

                {(["pdf", "docx", "xlsx"] as ExportFormat[]).map((format) => {
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
                          color={
                            format === "pdf" ? "#E53935" : format === "docx" ? "#2463EB" : "#16A34A"
                          }
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
                  <Text style={styles.switchText}>Incluir actividades detalladas</Text>
                  <Switch
                    value={options.actividades}
                    onValueChange={() => toggleOption("actividades")}
                  />
                </View>
                <View style={styles.switchRow}>
                  <Text style={styles.switchText}>Incluir rúbrica/evaluación</Text>
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
                      {planeacion?.asignatura || "Sin asignatura"}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>GRADO Y GRUPO</Text>
                    <Text style={styles.infoValue}>
                      {planeacion
                        ? `${planeacion.grado} ${planeacion.grupo ? `- ${planeacion.grupo}` : ""}`
                        : "Sin datos"}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>TEMA PRINCIPAL</Text>
                    <Text style={styles.infoValue}>{planeacion?.temaSesion || "Sin tema"}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>TAMAÑO</Text>
                    <Text style={styles.infoValue}>{estimatedSize}</Text>
                  </View>
                </View>

                <View style={styles.previewBody}>
                  <MaterialIcons name="description" size={42} color="#1676D2" />
                  <Text style={styles.previewBodyText}>
                    El documento se generará con formato profesional listo para compartir o
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
              <MaterialIcons name="share" size={20} color="#5C6E86" />
              <Text style={styles.shareButtonText}>Compartir</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.exportButton} onPress={handleExportar}>
              <MaterialIcons name="download" size={20} color="#FFFFFF" />
              <Text style={styles.exportButtonText}>Exportar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

      <Modal visible={isGenerating} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.loadingCard}>
            <View style={styles.loadingIconCircle}>
              <MaterialIcons name="description" size={34} color="#1676D2" />
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
              <MaterialIcons name="check" size={34} color="#FFFFFF" />
            </View>
            <Text style={styles.successTitle}>¡Planeación exportada!</Text>
            <Text style={styles.successSubtitle}>
              El archivo {selectedFormat.toUpperCase()} se generó correctamente y está listo para
              usarse.
            </Text>

            <View style={styles.fileCard}>
              <MaterialIcons name={formatIcon[selectedFormat]} size={22} color="#1676D2" />
              <View style={styles.fileCardTextWrap}>
                <Text style={styles.fileCardTitle} numberOfLines={1}>
                  {exportedFileName || `Planeacion_${planeacion?.asignatura || "sin_asignatura"}.${selectedFormat}`}
                </Text>
                <Text style={styles.fileCardMeta}>
                  {(exportedFileSize || estimatedSize) + " • Creado ahora mismo"}
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
                  handleCompartir();
                }}
              >
                <MaterialIcons name="share" size={18} color="#5C6E86" />
                <Text style={styles.successSecondaryButtonText}>Compartir</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.successSecondaryButton}
                onPress={() => {
                  setShowSuccess(false);
                  navigation.navigate("Planeaciones");
                }}
              >
                <MaterialIcons name="home" size={18} color="#5C6E86" />
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
  container: { flex: 1, backgroundColor: "#EEF3FA" },
  safeArea: { flex: 1 },
  scrollContent: {
    width: "100%",
    maxWidth: 1240,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 110,
    gap: 12,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3EAF4",
  },
  headerTitleWrap: { flex: 1 },
  headerTitle: { fontSize: 30, fontWeight: "800", color: "#1E2A3A", letterSpacing: -0.4 },
  headerSubtitle: { marginTop: 2, fontSize: 14, color: "#5C6E86" },
  mainLayout: { gap: 12 },
  mainLayoutWide: { flexDirection: "row", alignItems: "flex-start" },
  leftColumn: { gap: 12 },
  leftColumnWide: { width: "40%" },
  rightColumn: { gap: 10 },
  rightColumnWide: { width: "60%" },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E3EAF4",
    padding: 14,
    gap: 10,
  },
  sectionTitle: { fontSize: 24, fontWeight: "800", color: "#1E2A3A" },
  formatOption: {
    minHeight: 52,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "#EDF2F8",
    justifyContent: "center",
  },
  formatOptionActive: { backgroundColor: "#DCE8F8", borderWidth: 1, borderColor: "#C2D6F2" },
  formatOptionLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  radio: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#D6DFEA",
  },
  radioActive: { backgroundColor: "#1676D2" },
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
    backgroundColor: "#DCE8F8",
  },
  readyBadgeText: { color: "#2F5A90", fontSize: 12, fontWeight: "800", letterSpacing: 0.5 },
  infoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  infoItem: { width: "48%", gap: 2 },
  infoLabel: { color: "#6B7D96", fontSize: 11, fontWeight: "800", letterSpacing: 0.8 },
  infoValue: { color: "#1E2A3A", fontSize: 16, fontWeight: "700" },
  previewBody: {
    borderRadius: 12,
    padding: 20,
    minHeight: 170,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#E8EFF7",
  },
  previewBodyText: { color: "#4D5D74", fontSize: 15, textAlign: "center", lineHeight: 21 },
  sectionChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  sectionChip: {
    borderRadius: 8,
    backgroundColor: "#EEF3FA",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  sectionChipText: { color: "#4D5D74", fontSize: 12, fontWeight: "700" },
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
  shareButtonText: { color: "#5C6E86", fontSize: 16, fontWeight: "700" },
  exportButton: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    gap: 8,
    flexDirection: "row",
    backgroundColor: "#1676D2",
  },
  exportButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
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
    backgroundColor: "#FFFFFF",
    gap: 10,
  },
  loadingIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF4FF",
  },
  loadingTitle: { fontSize: 34, color: "#1D2736", fontWeight: "800", textAlign: "center" },
  loadingSubtitle: {
    fontSize: 16,
    color: "#4D5D74",
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
    backgroundColor: "#1676D2",
  },
  successCard: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 22,
    padding: 22,
    backgroundColor: "#FFFFFF",
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
    color: "#4D5D74",
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
  fileCardTitle: { fontSize: 15, color: "#1E2A3A", fontWeight: "700" },
  fileCardMeta: { marginTop: 2, color: "#6C7B90", fontSize: 12 },
  openButton: {
    marginTop: 4,
    width: "100%",
    minHeight: 50,
    borderRadius: 12,
    backgroundColor: "#1676D2",
    alignItems: "center",
    justifyContent: "center",
  },
  openButtonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "800" },
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
