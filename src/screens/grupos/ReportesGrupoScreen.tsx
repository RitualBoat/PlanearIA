import React from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LineChart, ProgressChart } from "react-native-chart-kit";
import WebScrollView from "../../components/WebScrollView";
import { COLORS } from "../../../types";
import {
  useReportesGrupoViewModel,
  type PeriodoReporte,
} from "../../hooks/useReportesGrupoViewModel";

const chartConfig = {
  backgroundGradientFrom: COLORS.surface,
  backgroundGradientTo: COLORS.surface,
  color: (opacity = 1) => `rgba(12, 99, 184, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(82, 96, 118, ${opacity})`,
  decimalPlaces: 0,
  propsForDots: {
    r: "4",
    strokeWidth: "2",
    stroke: COLORS.surface,
  },
};

const periodos: PeriodoReporte[] = ["Semana", "Mes", "Bimestre", "Personalizado"];

const ReportesGrupoScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;
  const chartWidth = Math.max(300, Math.min(width - 56, 680));

  const {
    grupoNombre,
    periodo,
    setPeriodo,
    estado,
    errorCodigo,
    estadisticas,
    serieTendencia,
    recargar,
    exportarReporte,
    goBack,
  } = useReportesGrupoViewModel();

  const handleExportar = async () => {
    try {
      const ok = await exportarReporte();
      if (!ok) {
        throw new Error("No se pudo exportar");
      }
      if (Platform.OS !== "web") {
        Alert.alert("Listo", "Reporte exportado correctamente.");
      }
    } catch {
      Alert.alert("Error", "No se pudo exportar el reporte. Intenta nuevamente.");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.iconButton}>
            <MaterialIcons name="arrow-back" size={22} color={COLORS.textDark} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Reportes del Grupo</Text>
            <Text style={styles.subtitle}>{grupoNombre} • Marzo 2026</Text>
          </View>
          <TouchableOpacity onPress={() => void handleExportar()} style={styles.iconButton}>
            <MaterialIcons name="file-download" size={22} color={COLORS.primaryDark} />
          </TouchableOpacity>
        </View>

        <WebScrollView style={styles.content}>
          <View style={styles.periodsRow}>
            {periodos.map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => setPeriodo(item)}
                style={[styles.periodChip, periodo === item && styles.periodChipActive]}
              >
                <Text
                  style={[styles.periodChipText, periodo === item && styles.periodChipTextActive]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {estado === "loading" ? (
            <View style={styles.stateCard}>
              <ActivityIndicator size="large" color={COLORS.primaryDark} />
              <Text style={styles.stateTitle}>Cargando reportes...</Text>
              <Text style={styles.stateText}>Analizando métricas del grupo</Text>
            </View>
          ) : null}

          {estado === "error" ? (
            <View style={styles.stateCard}>
              <View style={styles.errorIconCircle}>
                <MaterialIcons name="error" size={34} color="#D93025" />
              </View>
              <Text style={styles.stateTitle}>Error al cargar los datos</Text>
              <Text style={styles.stateText}>
                No pudimos obtener la información en este momento. Verifica tu conexión.
              </Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => void recargar()}>
                <MaterialIcons name="refresh" size={18} color={COLORS.surface} />
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </TouchableOpacity>
              <Text style={styles.errorCode}>CÓDIGO: {errorCodigo}</Text>
            </View>
          ) : null}

          {estado === "empty" ? (
            <View style={styles.stateCard}>
              <View style={styles.emptyIconCircle}>
                <MaterialIcons name="search-off" size={34} color={COLORS.primaryDark} />
              </View>
              <Text style={styles.stateTitle}>No hay datos en este periodo</Text>
              <Text style={styles.stateText}>
                Intenta cambiar los filtros para ver actividad del grupo.
              </Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => setPeriodo("Bimestre")}>
                <MaterialIcons name="filter-alt" size={18} color={COLORS.surface} />
                <Text style={styles.retryButtonText}>Cambiar filtros</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {estado === "success" ? (
            <>
              <View style={styles.insightCard}>
                <MaterialIcons name="auto-awesome" size={18} color={COLORS.surface} />
                <Text style={styles.insightText}>
                  La aprobación aumentó 4% respecto al mes pasado. La asistencia se mantiene
                  estable.
                </Text>
              </View>

              <View style={[styles.kpiGrid, isDesktop && styles.kpiGridDesktop]}>
                <View style={[styles.kpiCard, styles.kpiBlue]}>
                  <Text style={styles.kpiLabel}>PROMEDIO GENERAL</Text>
                  <Text style={styles.kpiValue}>{estadisticas.promedioGeneral.toFixed(1)}</Text>
                </View>
                <View style={[styles.kpiCard, styles.kpiGreen]}>
                  <Text style={styles.kpiLabel}>APROBACIÓN</Text>
                  <Text style={styles.kpiValue}>{Math.round(estadisticas.indiceAprobacion)}%</Text>
                </View>
                <View style={[styles.kpiCard, styles.kpiOrange]}>
                  <Text style={styles.kpiLabel}>REPROBACIÓN</Text>
                  <Text style={styles.kpiValue}>{Math.round(estadisticas.indiceReprobacion)}%</Text>
                </View>
                <View style={[styles.kpiCard, styles.kpiTeal]}>
                  <Text style={styles.kpiLabel}>ASISTENCIA</Text>
                  <Text style={styles.kpiValue}>{Math.round(estadisticas.indiceAsistencia)}%</Text>
                </View>
              </View>

              <View style={styles.blockCard}>
                <View style={styles.blockHeader}>
                  <Text style={styles.blockTitle}>Asistencia vs Aprobación</Text>
                  <View style={styles.trendBadge}>
                    <Text style={styles.trendBadgeText}>Tendencia</Text>
                  </View>
                </View>
                <LineChart
                  data={{
                    labels: ["Sem 1", "Sem 2", "Sem 3", "Sem 4"],
                    datasets: [
                      { data: serieTendencia },
                      {
                        data: serieTendencia.map((value) => Math.max(value - 6, 0)),
                        color: () => "#28BBD9",
                      },
                    ],
                    legend: ["Asistencia", "Aprobación"],
                  }}
                  width={chartWidth}
                  height={220}
                  yAxisSuffix="%"
                  withInnerLines
                  fromZero
                  bezier
                  chartConfig={chartConfig}
                  style={styles.chart}
                />
              </View>

              <View style={styles.blockCard}>
                <Text style={styles.blockTitle}>Distribución de Entregas</Text>
                <View style={styles.progressWrap}>
                  <ProgressChart
                    data={{
                      labels: ["A tiempo", "Tarde", "No entregadas"],
                      data: [
                        estadisticas.indiceEntregasATiempo / 100,
                        estadisticas.indiceEntregasTarde / 100,
                        estadisticas.indiceNoEntregadas / 100,
                      ],
                    }}
                    width={Math.min(280, chartWidth)}
                    height={180}
                    strokeWidth={15}
                    radius={52}
                    hideLegend
                    chartConfig={{
                      ...chartConfig,
                      color: (opacity = 1) => `rgba(12, 99, 184, ${opacity})`,
                    }}
                  />
                  <Text style={styles.progressCenterText}>
                    {Math.round(estadisticas.indiceEntregasATiempo)}%
                  </Text>
                  <Text style={styles.progressCenterSubText}>A TIEMPO</Text>
                </View>
                <View style={styles.legendRow}>
                  <Text style={styles.legendDotBlue}>● A tiempo</Text>
                  <Text style={styles.legendValue}>
                    {Math.round(estadisticas.indiceEntregasATiempo)}%
                  </Text>
                </View>
                <View style={styles.legendRow}>
                  <Text style={styles.legendDotOrange}>● Tarde</Text>
                  <Text style={styles.legendValue}>
                    {Math.round(estadisticas.indiceEntregasTarde)}%
                  </Text>
                </View>
                <View style={styles.legendRow}>
                  <Text style={styles.legendDotRed}>● No entregadas</Text>
                  <Text style={styles.legendValue}>
                    {Math.round(estadisticas.indiceNoEntregadas)}%
                  </Text>
                </View>
              </View>
            </>
          ) : null}
        </WebScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surfaceTertiary,
  },
  title: { fontSize: 36, color: COLORS.text, fontWeight: "800", letterSpacing: -0.4 },
  subtitle: { marginTop: 2, color: COLORS.textTertiary, fontSize: 16, fontWeight: "500" },
  content: { flex: 1 },
  periodsRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  periodChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    backgroundColor: COLORS.progressTrack,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  periodChipActive: { backgroundColor: COLORS.primaryDark, borderColor: COLORS.primaryDark },
  periodChipText: { color: COLORS.textDark, fontWeight: "700" },
  periodChipTextActive: { color: COLORS.surface },
  insightCard: {
    marginHorizontal: 16,
    backgroundColor: COLORS.primaryDark,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  insightText: { color: COLORS.surface, flex: 1, fontSize: 15, fontWeight: "600", lineHeight: 21 },
  kpiGrid: { paddingHorizontal: 16, paddingTop: 14, gap: 10 },
  kpiGridDesktop: { flexDirection: "row", flexWrap: "wrap" },
  kpiCard: {
    backgroundColor: COLORS.backgroundSoft,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 14,
    padding: 14,
    minHeight: 92,
    justifyContent: "center",
  },
  kpiBlue: { borderLeftWidth: 4, borderLeftColor: COLORS.primaryDark },
  kpiGreen: { borderLeftWidth: 4, borderLeftColor: "#12A05B" },
  kpiOrange: { borderLeftWidth: 4, borderLeftColor: COLORS.amber },
  kpiTeal: { borderLeftWidth: 4, borderLeftColor: "#13A8C4" },
  kpiLabel: { color: COLORS.textTertiary, fontWeight: "700", fontSize: 12, letterSpacing: 0.6 },
  kpiValue: {
    marginTop: 4,
    color: COLORS.text,
    fontSize: 46,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  blockCard: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 14,
  },
  blockHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  blockTitle: { color: COLORS.text, fontWeight: "800", fontSize: 17 },
  trendBadge: {
    backgroundColor: COLORS.border,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  trendBadgeText: { color: COLORS.primaryDark, fontWeight: "700", fontSize: 12 },
  chart: { marginTop: 8, borderRadius: 12 },
  progressWrap: { alignItems: "center", justifyContent: "center", marginTop: 8, minHeight: 190 },
  progressCenterText: {
    position: "absolute",
    top: 74,
    fontSize: 32,
    color: COLORS.text,
    fontWeight: "800",
  },
  progressCenterSubText: {
    position: "absolute",
    top: 112,
    fontSize: 12,
    color: COLORS.textTertiary,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  legendRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  legendValue: { color: COLORS.textDark, fontWeight: "700" },
  legendDotBlue: { color: COLORS.primaryDark, fontWeight: "700" },
  legendDotOrange: { color: COLORS.amber, fontWeight: "700" },
  legendDotRed: { color: COLORS.error, fontWeight: "700" },
  stateCard: {
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    padding: 20,
    gap: 10,
  },
  stateTitle: { color: COLORS.text, fontWeight: "800", fontSize: 22, textAlign: "center" },
  stateText: {
    color: COLORS.textTertiary,
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 340,
  },
  errorIconCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "#FCE8E6",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIconCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  retryButton: {
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  retryButtonText: { color: COLORS.surface, fontWeight: "800", fontSize: 16 },
  errorCode: { marginTop: 8, color: "#8B95A8", letterSpacing: 0.5, fontWeight: "700" },
});

export default ReportesGrupoScreen;
