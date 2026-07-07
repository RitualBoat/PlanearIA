import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";
import { useRoute, type RouteProp } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../navigation/StackNavigator";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import WebScrollView from "../../components/WebScrollView";
import { useAlumnos } from "../../context/AlumnosContext";
import { COLORS } from "../../../types";
import {
  buildAlumnoFromDraft,
  type AlumnoImportResult,
  parseAlumnosFromAsset,
} from "../../services/alumnoImportService";

type Nav = StackNavigationProp<RootStackParamList, "ImportarAlumnos">;
type Route = RouteProp<RootStackParamList, "ImportarAlumnos">;

interface ImportarAlumnosScreenProps {
  navigation: Nav;
}

type UiState = "idle" | "processing" | "preview" | "success" | "error";

const ImportarAlumnosScreen: React.FC<ImportarAlumnosScreenProps> = ({ navigation }) => {
  const route = useRoute<Route>();
  const { alumnos, agregarAlumnos } = useAlumnos();
  const grupoId = route.params?.grupoId;
  const grupoNombre = route.params?.grupoNombre;
  const [uiState, setUiState] = useState<UiState>("idle");
  const [result, setResult] = useState<AlumnoImportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const validCount = result?.validRows.length || 0;
  const invalidCount = result?.errorRows.length || 0;

  const previewRows = useMemo(() => {
    return result?.previewRows || [];
  }, [result]);

  const handleDownloadTemplate = () => {
    const message =
      "Plantilla sugerida: columnas Nombre, Apellidos, NumeroControl, Carrera, Email, Telefono, Escuela.";

    if (Platform.OS === "web") {
      window.alert(message);
      return;
    }

    Alert.alert("Descargar plantilla", message);
  };

  const handleSelectFile = async () => {
    try {
      setErrorMessage("");
      setUiState("processing");

      const picked = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
        type: [
          "text/csv",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ],
      });

      if (picked.canceled) {
        setUiState("idle");
        return;
      }

      const asset = picked.assets?.[0];
      if (!asset) {
        throw new Error("No se pudo leer el archivo seleccionado.");
      }

      const parsed = await parseAlumnosFromAsset(asset);
      setResult(parsed);
      setUiState("preview");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo procesar el archivo");
      setUiState("error");
    }
  };

  const handleImportValidRows = async () => {
    if (!result || result.validRows.length === 0) {
      setErrorMessage("No hay filas válidas para importar.");
      setUiState("error");
      return;
    }

    try {
      setIsImporting(true);
      const baseId = Math.max(0, ...alumnos.map((item) => item.id || 0)) + 1;

      const nuevosAlumnos = result.validRows.map((row, index) =>
        buildAlumnoFromDraft(row, baseId + index, grupoId)
      );
      await agregarAlumnos(nuevosAlumnos);

      setUiState("success");
    } catch {
      setErrorMessage("No se pudo completar la importación.");
      setUiState("error");
    } finally {
      setIsImporting(false);
    }
  };

  const resetFlow = () => {
    setUiState("idle");
    setErrorMessage("");
    setResult(null);
    setIsImporting(false);
  };

  const renderIdle = () => (
    <ImportIdleCard
      grupoId={grupoId}
      grupoNombre={grupoNombre}
      onSelectFile={handleSelectFile}
      onDownloadTemplate={handleDownloadTemplate}
    />
  );

  const renderProcessing = () => <ImportProcessingCard />;

  const renderPreview = () => (
    <>
      <View style={styles.fileRow}>
        <View style={styles.fileIconWrap}>
          <MaterialIcons name="description" size={20} color={COLORS.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.fileName}>{result?.fileName}</Text>
        </View>
        <Pressable
          style={({ pressed }) => pressed && { opacity: 0.6 }}
          onPress={() => void handleSelectFile()}
        >
          <Text style={styles.changeFileText}>Cambiar archivo</Text>
        </Pressable>
      </View>

      <Text style={styles.previewTitle}>Vista previa</Text>
      <View style={styles.statsRow}>
        <View style={styles.validBadge}>
          <Text style={styles.validText}>{validCount} Filas válidas</Text>
        </View>
        <View style={styles.invalidBadge}>
          <Text style={styles.invalidText}>{invalidCount} Filas con error</Text>
        </View>
      </View>

      <View style={styles.tableCard}>
        <View style={styles.tableHead}>
          <Text style={[styles.colHead, { flex: 1.1 }]}>Nombre</Text>
          <Text style={[styles.colHead, { flex: 1 }]}>Apellidos</Text>
          <Text style={[styles.colHead, { flex: 1 }]}>No. Control</Text>
        </View>

        {previewRows.map((row, index) => {
          const previewError = result?.errorRows.find((item) => item.draft === row);
          return (
            <View
              key={`${row.numeroControl}-${index}`}
              style={[styles.tableRow, previewError && styles.errorRow]}
            >
              <Text style={[styles.colValue, { flex: 1.1 }]}>{row.nombre || "-"}</Text>
              <Text style={[styles.colValue, { flex: 1 }]}>{row.apellidos || "-"}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.colValue, previewError && styles.errorCellText]}>
                  {row.numeroControl || "-"}
                </Text>
                {previewError ? (
                  <Text style={styles.rowErrorDetail}>{previewError.errors[0]}</Text>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.actionsCard}>
        <View style={styles.actionsRow}>
          <Pressable
            style={({ pressed }) => [styles.cancelButton, pressed && { opacity: 0.6 }]}
            onPress={resetFlow}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.importButton, pressed && { opacity: 0.6 }]}
            onPress={() => void handleImportValidRows()}
            disabled={isImporting || validCount === 0}
          >
            <Text style={styles.importButtonText}>
              {isImporting ? "Importando..." : "Importar alumnos válidos"}
            </Text>
          </Pressable>
        </View>
        <Pressable
          style={({ pressed }) => [styles.linkButton, pressed && { opacity: 0.6 }]}
          onPress={handleDownloadTemplate}
        >
          <Text style={styles.linkButtonText}>Descargar plantilla</Text>
        </Pressable>
      </View>
    </>
  );

  const renderSuccess = () => (
    <View style={styles.card}>
      <View style={[styles.heroIconWrap, { backgroundColor: "#EAF3FF" }]}>
        <MaterialIcons name="check" size={38} color={COLORS.primary} />
      </View>
      <Text style={styles.successTitle}>Importación completada</Text>
      <Text style={styles.cardText}>
        Se han importado {validCount} alumnos nuevos correctamente
        {grupoId ? ` en ${grupoNombre ?? "este grupo"}` : ""}.
      </Text>

      <Pressable
        style={({ pressed }) => [styles.primaryButton, pressed && { opacity: 0.6 }]}
        onPress={() => {
          if (grupoId) {
            navigation.navigate("ClassroomGroup", { grupoId, grupoNombre });
            return;
          }

          navigation.navigate("ListaAlumnos");
        }}
      >
        <Text style={styles.primaryButtonText}>
          {grupoId ? "Volver a la clase" : "Ir a mis alumnos"}
        </Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.secondaryButton, pressed && { opacity: 0.6 }]}
        onPress={resetFlow}
      >
        <Text style={styles.secondaryButtonText}>Importar más alumnos</Text>
      </Pressable>
    </View>
  );

  const renderError = () => (
    <View style={styles.card}>
      <View style={[styles.heroIconWrap, { backgroundColor: "#FEECEC" }]}>
        <MaterialIcons name="error" size={32} color={COLORS.error} />
      </View>
      <Text style={styles.errorTitle}>No se pudo procesar el archivo</Text>
      <Text style={styles.cardText}>
        {errorMessage || "El formato no es soportado o el archivo está dañado."}
      </Text>

      <Pressable
        style={({ pressed }) => [styles.primaryButton, pressed && { opacity: 0.6 }]}
        onPress={() => void handleSelectFile()}
      >
        <Text style={styles.primaryButtonText}>Reintentar</Text>
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.cancelButton, pressed && { opacity: 0.6 }]}
        onPress={resetFlow}
      >
        <Text style={styles.cancelButtonText}>Cancelar</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <WebScrollView style={styles.content}>
          <View style={styles.headerRow}>
            <Pressable
              style={({ pressed }) => [styles.headerIconButton, pressed && { opacity: 0.6 }]}
              onPress={() => navigation.goBack()}
            >
              <MaterialIcons name="arrow-back" size={22} color={COLORS.primary} />
            </Pressable>
            <Text style={styles.headerTitle}>Importar Alumnos</Text>
          </View>

          <Text style={styles.pageTitle}>Carga de Datos</Text>
          <Text style={styles.pageSubtitle}>
            Importa tus alumnos desde archivos CSV o Excel para dar de alta listas completas.
          </Text>

          {uiState === "idle" ? renderIdle() : null}
          {uiState === "processing" ? renderProcessing() : null}
          {uiState === "preview" ? renderPreview() : null}
          {uiState === "success" ? renderSuccess() : null}
          {uiState === "error" ? renderError() : null}
        </WebScrollView>
      </SafeAreaView>
    </View>
  );
};

interface ImportIdleCardProps {
  grupoId?: number;
  grupoNombre?: string;
  onSelectFile: () => void;
  onDownloadTemplate: () => void;
}

const ImportIdleCard: React.FC<ImportIdleCardProps> = ({
  grupoId,
  grupoNombre,
  onSelectFile,
  onDownloadTemplate,
}) => (
  <View style={styles.card}>
    <View style={styles.heroIconWrap}>
      <MaterialIcons name="upload-file" size={34} color={COLORS.primary} />
    </View>
    <Text style={styles.cardTitle}>Subir listado de alumnos</Text>
    <Text style={styles.cardText}>
      {grupoId
        ? `Sube CSV o Excel para importar alumnos directamente a ${grupoNombre ?? "este grupo"}.`
        : "Aun no has seleccionado archivo. Sube CSV o Excel para importar alumnos."}
    </Text>

    <Pressable
      style={({ pressed }) => [styles.primaryButton, pressed && { opacity: 0.6 }]}
      onPress={() => void onSelectFile()}
    >
      <MaterialIcons name="file-upload" size={18} color={COLORS.surface} />
      <Text style={styles.primaryButtonText}>Seleccionar archivo</Text>
    </Pressable>

    <Pressable
      style={({ pressed }) => [styles.linkButton, pressed && { opacity: 0.6 }]}
      onPress={onDownloadTemplate}
    >
      <MaterialIcons name="download" size={16} color={COLORS.primary} />
      <Text style={styles.linkButtonText}>Descargar plantilla</Text>
    </Pressable>
  </View>
);

const ImportProcessingCard: React.FC = () => (
  <View style={styles.card}>
    <ActivityIndicator size="large" color={COLORS.primary} />
    <Text style={styles.cardTitle}>Procesando archivo y validando datos...</Text>
    <View style={styles.progressTrack}>
      <View style={styles.progressFill} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 110 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  headerIconButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitle: { color: COLORS.primary, fontSize: 30, fontWeight: "800" },
  pageTitle: { color: COLORS.text, fontSize: 48, fontWeight: "800", marginBottom: 6 },
  pageSubtitle: { color: COLORS.textSecondary, fontSize: 30, lineHeight: 40, marginBottom: 12 },
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  heroIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 999,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { color: COLORS.text, fontSize: 34, fontWeight: "800", textAlign: "center" },
  cardText: { color: COLORS.textSecondary, fontSize: 25, textAlign: "center", lineHeight: 34 },
  primaryButton: {
    minHeight: 50,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    width: "100%",
  },
  primaryButtonText: { color: COLORS.surface, fontSize: 22, fontWeight: "800" },
  linkButton: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  linkButtonText: { color: COLORS.primary, fontSize: 20, fontWeight: "700" },
  progressTrack: {
    width: "100%",
    height: 8,
    borderRadius: 999,
    backgroundColor: COLORS.border,
    overflow: "hidden",
  },
  progressFill: {
    width: "60%",
    height: "100%",
    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },
  fileRow: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  fileIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primaryTint,
    alignItems: "center",
    justifyContent: "center",
  },
  fileName: { color: COLORS.text, fontSize: 20, fontWeight: "700" },
  changeFileText: { color: COLORS.primary, fontSize: 18, fontWeight: "700" },
  previewTitle: { color: COLORS.text, fontSize: 38, fontWeight: "800", marginBottom: 8 },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  validBadge: {
    backgroundColor: COLORS.successTint,
    borderWidth: 1,
    borderColor: COLORS.success,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  validText: { color: COLORS.success, fontSize: 16, fontWeight: "800" },
  invalidBadge: {
    backgroundColor: "#FFE8E8",
    borderWidth: 1,
    borderColor: "#F2C6C6",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  invalidText: { color: COLORS.dangerDark, fontSize: 16, fontWeight: "800" },
  tableCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 12,
  },
  tableHead: {
    flexDirection: "row",
    backgroundColor: COLORS.background,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
  },
  colHead: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textTransform: "uppercase",
    fontWeight: "800",
  },
  tableRow: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
    gap: 6,
  },
  errorRow: { backgroundColor: "#FFF3F3" },
  colValue: { color: COLORS.text, fontSize: 18, fontWeight: "600" },
  errorCellText: { color: COLORS.dangerDark, fontWeight: "700" },
  rowErrorDetail: { color: COLORS.dangerDark, fontSize: 14, marginTop: 2 },
  actionsCard: {
    backgroundColor: COLORS.primaryTint,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  actionsRow: { flexDirection: "row", gap: 10 },
  cancelButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: { color: COLORS.textSecondary, fontSize: 20, fontWeight: "800" },
  importButton: {
    flex: 1.6,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  importButtonText: { color: COLORS.surface, fontSize: 20, fontWeight: "800" },
  successTitle: { color: COLORS.text, fontSize: 45, fontWeight: "800", textAlign: "center" },
  secondaryButton: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    width: "100%",
  },
  secondaryButtonText: { color: COLORS.textSecondary, fontSize: 20, fontWeight: "700" },
  errorTitle: { color: COLORS.text, fontSize: 45, fontWeight: "800", textAlign: "center" },
});

export default ImportarAlumnosScreen;
