import React, { useState } from "react";
import { Alert, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, type RouteProp } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../navigation/StackNavigator";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import WebScrollView from "../../components/WebScrollView";
import { useAlumnos } from "../../context/AlumnosContext";
import { COLORS } from "../../../types";
import {
  exportarAlumnosArchivo,
  type AlumnoExportFormat,
} from "../../services/alumnoExportService";

type Nav = StackNavigationProp<RootStackParamList, "ExportarAlumnos">;
type Route = RouteProp<RootStackParamList, "ExportarAlumnos">;

interface ExportarAlumnosScreenProps {
  navigation: Nav;
}

const ExportarAlumnosScreen: React.FC<ExportarAlumnosScreenProps> = ({ navigation }) => {
  const route = useRoute<Route>();
  const { alumnos } = useAlumnos();
  const grupoId = route.params?.grupoId;
  const grupoNombre = route.params?.grupoNombre;
  const alumnosExportables = grupoId
    ? alumnos.filter((alumno) => alumno.grupoId === grupoId)
    : alumnos;
  const [selectedFormat, setSelectedFormat] = useState<AlumnoExportFormat>("excel");
  const [isExporting, setIsExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const handleExport = async () => {
    if (alumnosExportables.length === 0) {
      const msg = grupoId
        ? "No hay alumnos vinculados a este grupo para exportar."
        : "No hay alumnos registrados para exportar.";
      if (Platform.OS === "web") {
        window.alert(msg);
      } else {
        Alert.alert("Sin datos", msg);
      }
      return;
    }

    try {
      setIsExporting(true);
      await exportarAlumnosArchivo({ alumnos: alumnosExportables, formato: selectedFormat });
      setExported(true);
    } catch {
      const msg = "No se pudo generar el archivo. Intenta de nuevo.";
      if (Platform.OS === "web") {
        window.alert(msg);
      } else {
        Alert.alert("Error", msg);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const formatOptions: { key: AlumnoExportFormat; label: string; icon: string; desc: string }[] = [
    {
      key: "excel",
      label: "Excel (.xlsx)",
      icon: "table-chart",
      desc: "Hoja de cálculo editable con datos completos.",
    },
    {
      key: "pdf",
      label: "PDF",
      icon: "picture-as-pdf",
      desc: "Documento listo para imprimir o compartir.",
    },
  ];

  if (exported) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />
        <SafeAreaView style={styles.safeArea}>
          <WebScrollView style={styles.content}>
            <View style={styles.headerRow}>
              <TouchableOpacity style={styles.headerIconButton} onPress={() => navigation.goBack()}>
                <MaterialIcons name="arrow-back" size={22} color={COLORS.primary} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Exportar Alumnos</Text>
            </View>

            <View style={styles.card}>
              <View style={[styles.heroIconWrap, { backgroundColor: "#EAF3FF" }]}>
                <MaterialIcons name="check" size={38} color={COLORS.primary} />
              </View>
              <Text style={styles.successTitle}>Exportación lista</Text>
              <Text style={styles.cardText}>
                Se exportaron {alumnosExportables.length} alumnos en formato{" "}
                {selectedFormat === "excel" ? "Excel" : "PDF"}.
              </Text>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                  setExported(false);
                }}
              >
                <Text style={styles.primaryButtonText}>Exportar de nuevo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
                <Text style={styles.secondaryButtonText}>Volver</Text>
              </TouchableOpacity>
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
        <WebScrollView style={styles.content}>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.headerIconButton} onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back" size={22} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Exportar Alumnos</Text>
          </View>

          <Text style={styles.pageTitle}>Exportar Datos</Text>
          <Text style={styles.pageSubtitle}>
            {grupoId
              ? `Genera un archivo solo con los alumnos de ${grupoNombre ?? "este grupo"}.`
              : "Genera un archivo con la lista completa de tus alumnos registrados."}
          </Text>

          <View style={styles.statsCard}>
            <MaterialIcons name="people" size={24} color={COLORS.primary} />
            <Text style={styles.statsText}>
              {alumnosExportables.length}{" "}
              {alumnosExportables.length === 1 ? "alumno" : "alumnos"}{" "}
              {grupoId ? "en esta clase" : "registrados"}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Formato de exportación</Text>

          {formatOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.formatCard,
                selectedFormat === option.key && styles.formatCardSelected,
              ]}
              onPress={() => setSelectedFormat(option.key)}
              activeOpacity={0.85}
            >
              <View style={styles.formatRow}>
                <View
                  style={[
                    styles.formatIconWrap,
                    selectedFormat === option.key && styles.formatIconWrapSelected,
                  ]}
                >
                  <MaterialIcons
                    name={option.icon as keyof typeof MaterialIcons.glyphMap}
                    size={22}
                    color={selectedFormat === option.key ? COLORS.surface : COLORS.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.formatLabel}>{option.label}</Text>
                  <Text style={styles.formatDesc}>{option.desc}</Text>
                </View>
                <View style={[styles.radio, selectedFormat === option.key && styles.radioSelected]}>
                  {selectedFormat === option.key && <View style={styles.radioDot} />}
                </View>
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[styles.primaryButton, isExporting && styles.buttonDisabled]}
            onPress={() => void handleExport()}
            disabled={isExporting}
          >
            <MaterialIcons name="file-download" size={18} color={COLORS.surface} />
            <Text style={styles.primaryButtonText}>
              {isExporting ? "Generando archivo..." : "Exportar alumnos"}
            </Text>
          </TouchableOpacity>
        </WebScrollView>
      </SafeAreaView>
    </View>
  );
};

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
  statsCard: {
    backgroundColor: COLORS.primaryTint,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  statsText: { color: COLORS.primary, fontSize: 22, fontWeight: "700" },
  sectionTitle: { color: COLORS.text, fontSize: 28, fontWeight: "800", marginBottom: 10 },
  formatCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  formatCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryTint,
  },
  formatRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  formatIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.primaryTint,
    alignItems: "center",
    justifyContent: "center",
  },
  formatIconWrapSelected: {
    backgroundColor: COLORS.primary,
  },
  formatLabel: { color: COLORS.text, fontSize: 22, fontWeight: "700" },
  formatDesc: { color: COLORS.textSecondary, fontSize: 18, marginTop: 2 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: COLORS.primary,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
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
    marginTop: 8,
  },
  primaryButtonText: { color: COLORS.surface, fontSize: 22, fontWeight: "800" },
  buttonDisabled: { opacity: 0.6 },
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
  successTitle: { color: COLORS.text, fontSize: 45, fontWeight: "800", textAlign: "center" },
  cardText: { color: COLORS.textSecondary, fontSize: 25, textAlign: "center", lineHeight: 34 },
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
});

export default ExportarAlumnosScreen;
