import React from "react";
import {
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
  useReportesAlumnoViewModel,
  type PeriodoReporteAlumno,
} from "../../hooks/useReportesAlumnoViewModel";

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

const periodos: PeriodoReporteAlumno[] = ["Semana", "Mes", "Bimestre", "Personalizado"];

const estadoLabel: Record<string, string> = {
  aprobado: "Aprobado",
  reprobado: "Reprobado",
  pendiente: "Pendiente",
};

const ReportesAlumnoScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1080;
  const chartWidth = Math.max(300, Math.min(width - 56, 680));

  const {
    alumnoNombre,
    grupoNombre,
    periodo,
    setPeriodo,
    estado,
    errorCodigo,
    estadisticas,
    promedioGrupo,
    diferenciaVsGrupo,
    serieRendimiento,
    tablaCalificaciones,
    tareasResumen,
    recargar,
    exportarReporte,
    goBack,
  } = useReportesAlumnoViewModel();

  const totalEntregadasATiempo = Math.round(
    (estadisticas.indiceEntregasATiempo / 100) * estadisticas.totalEntregasEsperadas
  );
  const totalEntregadasTarde = Math.round(
    (estadisticas.indiceEntregasTarde / 100) * estadisticas.totalEntregasEsperadas
  );
  const totalPendientes = Math.max(
    estadisticas.totalEntregasEsperadas - totalEntregadasATiempo - totalEntregadasTarde,
    0
  );

  const comparativaTitulo = diferenciaVsGrupo >= 0 ? "Liderando el aula" : "Área de oportunidad";
  const comparativaDelta =
    promedioGrupo > 0 ? ((diferenciaVsGrupo / promedioGrupo) * 100).toFixed(0) : "0";

  const handleExportar = () => {
    Alert.alert("Exportar reporte", "Selecciona el formato de exportación", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "PDF",
        onPress: () => {
          void exportarReporte("pdf")
            .then((ok) => {
              if (!ok) throw new Error("No se pudo exportar PDF");
              if (Platform.OS !== "web") {
                Alert.alert("Listo", "Reporte exportado en PDF.");
              }
            })
            .catch(() => {
              Alert.alert("Error", "No se pudo exportar el reporte en PDF.");
            });
        },
      },
      {
        text: "Imagen",
        onPress: () => {
          void exportarReporte("image")
            .then((ok) => {
              if (!ok) throw new Error("No se pudo exportar imagen");
              if (Platform.OS !== "web") {
                Alert.alert("Listo", "Reporte exportado como imagen.");
              }
            })
            .catch(() => {
              Alert.alert("Error", "No se pudo exportar el reporte como imagen.");
            });
        },
      },
    ]);
  };

  const renderBottomTabs = () => (
    <View style={styles.bottomTabs}>
      <TabItem icon="grid-view" label="RESUMEN" />
      <TabItem icon="book" label="MATERIAS" />
      <TabItem icon="insert-chart" label="ANALÍTICA" active />
      <TabItem icon="person" label="PERFIL" />
    </View>
  );

  const renderLoadingMobile = () => (
    <>
      <View style={styles.loadingTopCards}>
        <SkeletonCard />
        <SkeletonCard />
      </View>
      <SkeletonWide />
      <SkeletonLine />
      <SkeletonChart />
      <SkeletonLine />
      <SkeletonList />
      <View style={styles.skeletonSuggestion} />
    </>
  );

  const renderErrorMobile = () => (
    <View style={styles.centerStateWrap}>
      <View style={styles.centerStateCard}>
        <View style={styles.errorIconCircleStrong}>
          <MaterialIcons name="wifi-off" size={44} color={COLORS.error} />
        </View>
        <Text style={styles.centerStateTitle}>No se pudieron cargar las estadísticas</Text>
        <Text style={styles.centerStateText}>
          Hubo un problema al conectar con el servidor de reportes escolares.
        </Text>
        <TouchableOpacity style={styles.retryMainButton} onPress={() => void recargar()}>
          <Text style={styles.retryMainButtonText}>Reintentar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goBack}>
          <Text style={styles.secondaryLink}>Volver al detalle</Text>
        </TouchableOpacity>
        <Text style={styles.errorCode}>CÓDIGO: {errorCodigo}</Text>
      </View>
    </View>
  );

  const renderEmptyMobile = () => (
    <View style={styles.centerStateWrap}>
      <View style={styles.emptyIllustration}>
        <MaterialIcons name="insert-chart" size={58} color="#93C6E8" />
      </View>
      <Text style={styles.emptyTitle}>Sin datos registrados</Text>
      <Text style={styles.emptyText}>
        {alumnoNombre.split(" ")[0]} aún no tiene actividades evaluadas en este periodo para generar
        estadísticas.
      </Text>
      <TouchableOpacity style={styles.retryMainButton} onPress={goBack}>
        <MaterialIcons name="post-add" size={18} color={COLORS.surface} />
        <Text style={styles.retryMainButtonText}>Registrar primera calificación</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSuccessMobile = () => (
    <>
      <View style={styles.periodsRow}>
        {periodos.map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setPeriodo(item)}
            style={[styles.periodChip, periodo === item && styles.periodChipActive]}
          >
            <Text style={[styles.periodChipText, periodo === item && styles.periodChipTextActive]}>
              {item === "Personalizado" ? "Perso" : item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.kpiGridMobile}>
        <View style={styles.kpiCompactCard}>
          <Text style={styles.kpiCompactLabel}>PROMEDIO</Text>
          <Text style={styles.kpiCompactValueBlue}>{estadisticas.promedioGeneral.toFixed(1)}</Text>
        </View>
        <View style={styles.kpiCompactCard}>
          <Text style={styles.kpiCompactLabel}>ASISTENCIA</Text>
          <Text style={styles.kpiCompactValue}>{Math.round(estadisticas.indiceAsistencia)}%</Text>
        </View>
        <View style={styles.kpiCompactCard}>
          <Text style={styles.kpiCompactLabel}>ENTREGAS</Text>
          <Text style={styles.kpiCompactValue}>
            {estadisticas.totalEntregasRealizadas}
            <Text style={styles.kpiCompactSub}>/{estadisticas.totalEntregasEsperadas}</Text>
          </Text>
        </View>
        <View style={styles.kpiCompactCard}>
          <Text style={styles.kpiCompactLabel}>NO ENTREGAS</Text>
          <Text style={styles.kpiCompactValueDanger}>{totalPendientes}</Text>
        </View>
      </View>

      <View style={styles.blockCardMobile}>
        <View style={styles.blockHeader}>
          <Text style={styles.blockTitle}>Progreso mensual</Text>
          <View style={styles.badgeMini}>
            <Text style={styles.badgeMiniText}>Calificaciones</Text>
          </View>
        </View>
        <LineChart
          data={{
            labels: ["SEP", "OCT", "NOV", "DIC"],
            datasets: [{ data: serieRendimiento.map((item) => Number((item / 10).toFixed(1))) }],
          }}
          width={Math.min(width - 38, 520)}
          height={170}
          yAxisSuffix=""
          fromZero
          bezier
          withInnerLines={false}
          chartConfig={chartConfig}
          style={styles.chart}
        />
      </View>

      <View style={styles.comparisonBlueCard}>
        <Text style={styles.comparisonLabel}>RENDIMIENTO VS GRUPO</Text>
        <Text style={styles.comparisonTitle}>{comparativaTitulo}</Text>
        <Text style={styles.comparisonText}>
          Estás {diferenciaVsGrupo >= 0 ? "+" : ""}
          {diferenciaVsGrupo.toFixed(1)} sobre el promedio ({promedioGrupo.toFixed(1)})
        </Text>
        <View style={styles.comparisonBadge}>
          <MaterialIcons name="trending-up" size={18} color={COLORS.surface} />
          <Text style={styles.comparisonBadgeText}>{comparativaDelta}%</Text>
        </View>
      </View>

      <View style={styles.tasksWrapMobile}>
        <View style={styles.progressCircleWrap}>
          <ProgressChart
            data={{ labels: ["Meta"], data: [estadisticas.indiceEntregasATiempo / 100] }}
            width={120}
            height={120}
            strokeWidth={11}
            radius={38}
            hideLegend
            chartConfig={chartConfig}
          />
          <Text style={styles.progressCircleText}>
            {Math.round(estadisticas.indiceEntregasATiempo)}%
          </Text>
          <Text style={styles.progressCircleSub}>META</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.tasksTitle}>Estado de tareas</Text>
          <LegendRow label="A tiempo" value={totalEntregadasATiempo} color="#0A66B6" />
          <LegendRow label="Tarde" value={totalEntregadasTarde} color="#4FD0E8" />
          <LegendRow label="Pendiente" value={totalPendientes} color="#D8DDE5" />
        </View>
      </View>

      <View style={styles.suggestionCard}>
        <View style={styles.suggestionIcon}>
          <MaterialIcons name="auto-awesome" size={20} color="#2FA4D4" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.suggestionTitle}>Sugerencia del Co-Pilot</Text>
          <Text style={styles.suggestionText}>
            {alumnoNombre.split(" ")[0]} destaca en pensamiento lógico. Reforzar con lecturas
            críticas para subir el promedio al siguiente bloque.
          </Text>
        </View>
      </View>
    </>
  );

  const renderDesktop = () => (
    <View style={styles.desktopLayout}>
      <View style={styles.sidebarDesktop}>
        <Text style={styles.brandDesktop}>EduAtelier</Text>
        <SideMenuItem icon="dashboard" label="Dashboard" />
        <SideMenuItem icon="groups" label="Alumnos" active />
        <SideMenuItem icon="class" label="Grupos" />
        <SideMenuItem icon="assessment" label="Reportes" />
      </View>

      <View style={styles.mainDesktop}>
        <View style={styles.headerDesktop}>
          <TouchableOpacity onPress={goBack} style={styles.iconButton}>
            <MaterialIcons name="arrow-back" size={22} color={COLORS.textDark} />
          </TouchableOpacity>
          <Text style={styles.titleDesktop}>Progreso del Alumno</Text>
          <View style={{ flex: 1 }} />
          <Text style={styles.cycleText}>Ciclo Escolar 2023 - 2024</Text>
          <TouchableOpacity onPress={handleExportar} style={styles.iconButton}>
            <MaterialIcons name="calendar-today" size={20} color={COLORS.primaryDark} />
          </TouchableOpacity>
        </View>

        {estado === "loading" ? (
          <View style={styles.desktopSkeletonWrap}>
            <View style={styles.desktopSkeletonLeft} />
            <View style={styles.desktopSkeletonRight} />
          </View>
        ) : null}

        {estado === "error" ? (
          <View style={styles.desktopStateCard}>
            <Text style={styles.centerStateTitle}>No se pudieron cargar las estadísticas</Text>
            <TouchableOpacity style={styles.retryMainButton} onPress={() => void recargar()}>
              <Text style={styles.retryMainButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {estado === "empty" ? (
          <View style={styles.desktopStateCard}>
            <Text style={styles.emptyTitle}>Sin datos registrados</Text>
            <Text style={styles.emptyText}>No hay actividades evaluadas para este periodo.</Text>
          </View>
        ) : null}

        {estado === "success" ? (
          <View style={styles.desktopGrid}>
            <View style={styles.desktopLeftCol}>
              <View style={styles.profileCard}>
                <View style={styles.avatarWrap}>
                  <MaterialIcons name="person" size={42} color={COLORS.primary} />
                </View>
                <Text style={styles.profileName}>{alumnoNombre}</Text>
                <Text style={styles.profileSub}>
                  ID: #{Math.max(1, Math.round(estadisticas.promedioGeneral * 3200))}
                </Text>
                <View style={styles.profileTagsRow}>
                  <BadgeSmall text="DESTACADO" />
                  <BadgeSmall text="DEPORTISTA" pale />
                </View>
              </View>

              <DesktopKpi
                icon="star"
                label="PROMEDIO GENERAL"
                value={estadisticas.promedioGeneral.toFixed(1)}
              />
              <DesktopKpi
                icon="calendar-month"
                label="ASISTENCIA"
                value={`${Math.round(estadisticas.indiceAsistencia)}%`}
              />
              <DesktopKpi
                icon="assignment-turned-in"
                label="ENTREGAS A TIEMPO"
                value={`${totalEntregadasATiempo}/${estadisticas.totalEntregasEsperadas}`}
              />

              <View style={styles.groupCard}>
                <Text style={styles.groupCardTitle}>Comparativa Grupal</Text>
                <Text style={styles.groupMetricLabel}>{alumnoNombre}</Text>
                <View style={styles.progressBarTrack}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${Math.min(100, estadisticas.promedioGeneral * 10)}%` },
                    ]}
                  />
                </View>
                <Text style={styles.groupMetricLabel}>PROMEDIO GRUPO</Text>
                <View style={styles.progressBarTrackGray}>
                  <View
                    style={[
                      styles.progressBarFillGray,
                      { width: `${Math.min(100, promedioGrupo * 10)}%` },
                    ]}
                  />
                </View>
                <Text style={styles.groupCardNote}>
                  Nota del AI: Muestra una constancia excepcional en las entregas de este bloque.
                </Text>
              </View>
            </View>

            <View style={styles.desktopRightCol}>
              <View style={styles.trendCardDesktop}>
                <View style={styles.blockHeader}>
                  <View>
                    <Text style={styles.blockTitle}>Tendencia Histórica</Text>
                    <Text style={styles.smallSub}>Rendimiento académico por bloque</Text>
                  </View>
                  <View style={styles.yearsRow}>
                    <YearChip label="2023" />
                    <YearChip label="2024" active />
                  </View>
                </View>
                <LineChart
                  data={{
                    labels: ["B1", "B2", "B3", "B4"],
                    datasets: [
                      { data: serieRendimiento.map((item) => Number((item / 10).toFixed(1))) },
                    ],
                  }}
                  width={Math.min(chartWidth, 620)}
                  height={220}
                  fromZero
                  withInnerLines={false}
                  chartConfig={chartConfig}
                  style={styles.chart}
                />
              </View>

              <View style={styles.tasksCardDesktop}>
                <View style={styles.blockHeader}>
                  <Text style={styles.blockTitle}>Desglose de Tareas</Text>
                  <View style={styles.legendInline}>
                    <Text style={styles.legendInlineBlue}>● ENTREGADAS</Text>
                    <Text style={styles.legendInlineRed}>● PENDIENTES</Text>
                  </View>
                </View>

                {tareasResumen.length === 0 ? (
                  <Text style={styles.tableEmptyText}>
                    No hay tareas registradas en este periodo.
                  </Text>
                ) : (
                  tareasResumen.map((item) => (
                    <View key={item.id} style={styles.taskRowDesktop}>
                      <View style={styles.taskIconWrap}>
                        <MaterialIcons name="grid-view" size={16} color={COLORS.primaryDark} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.taskTitleDesktop}>{item.titulo}</Text>
                        <Text style={styles.taskSubDesktop}>
                          {item.entregadas} de {item.esperadas} tareas completadas
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.taskScoreDesktop}>{item.promedio.toFixed(1)}</Text>
                        <Text style={styles.taskStatusDesktop}>{item.estado.toUpperCase()}</Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );

  if (isDesktop) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />
        <SafeAreaView style={styles.safeArea}>{renderDesktop()}</SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.iconButton}>
            <MaterialIcons name="arrow-back" size={22} color={COLORS.textDark} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Estadísticas del alumno</Text>
            <Text style={styles.subtitle}>
              {alumnoNombre} • {grupoNombre}
            </Text>
          </View>
          <TouchableOpacity onPress={handleExportar} style={styles.iconButton}>
            <MaterialIcons name="calendar-today" size={20} color={COLORS.primaryDark} />
          </TouchableOpacity>
        </View>

        <WebScrollView style={styles.content} contentContainerStyle={styles.mobileContentContainer}>
          {estado === "loading" ? renderLoadingMobile() : null}
          {estado === "error" ? renderErrorMobile() : null}
          {estado === "empty" ? renderEmptyMobile() : null}
          {estado === "success" ? renderSuccessMobile() : null}
        </WebScrollView>

        {renderBottomTabs()}
      </SafeAreaView>
    </View>
  );
};

const TabItem: React.FC<{
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  active?: boolean;
}> = ({ icon, label, active = false }) => (
  <View style={styles.tabItem}>
    <View style={[styles.tabIconWrap, active && styles.tabIconWrapActive]}>
      <MaterialIcons name={icon} size={18} color={active ? COLORS.primaryDark : "#4E5664"} />
    </View>
    <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
  </View>
);

const LegendRow: React.FC<{ label: string; value: number; color: string }> = ({
  label,
  value,
  color,
}) => (
  <View style={styles.legendRowInline}>
    <Text style={[styles.legendBullet, { color }]}>●</Text>
    <Text style={styles.legendLabelInline}>{label}</Text>
    <Text style={styles.legendValueInline}>{value}</Text>
  </View>
);

const SideMenuItem: React.FC<{
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  active?: boolean;
}> = ({ icon, label, active = false }) => (
  <View style={[styles.sideMenuItem, active && styles.sideMenuItemActive]}>
    <MaterialIcons name={icon} size={17} color={active ? COLORS.primaryDark : COLORS.textDark} />
    <Text style={[styles.sideMenuLabel, active && styles.sideMenuLabelActive]}>{label}</Text>
  </View>
);

const BadgeSmall: React.FC<{ text: string; pale?: boolean }> = ({ text, pale = false }) => (
  <View style={[styles.badgeSmall, pale && styles.badgeSmallPale]}>
    <Text style={[styles.badgeSmallText, pale && styles.badgeSmallTextPale]}>{text}</Text>
  </View>
);

const YearChip: React.FC<{ label: string; active?: boolean }> = ({ label, active = false }) => (
  <View style={[styles.yearChip, active && styles.yearChipActive]}>
    <Text style={[styles.yearChipText, active && styles.yearChipTextActive]}>{label}</Text>
  </View>
);

const DesktopKpi: React.FC<{
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <View style={styles.desktopKpiCard}>
    <View style={styles.desktopKpiIcon}>
      <MaterialIcons name={icon} size={18} color={COLORS.primaryDark} />
    </View>
    <View>
      <Text style={styles.desktopKpiLabel}>{label}</Text>
      <Text style={styles.desktopKpiValue}>{value}</Text>
    </View>
  </View>
);

const SkeletonCard: React.FC = () => (
  <View style={styles.skeletonCard}>
    <View style={styles.skeletonCircle} />
    <View style={styles.skeletonBar} />
    <View style={styles.skeletonBarWide} />
  </View>
);

const SkeletonWide: React.FC = () => (
  <View style={styles.skeletonWide}>
    <View style={styles.skeletonBar} />
    <View style={styles.skeletonBarWide} />
    <View style={styles.skeletonCircleLarge} />
  </View>
);

const SkeletonLine: React.FC = () => <View style={styles.skeletonLine} />;

const SkeletonChart: React.FC = () => <View style={styles.skeletonChart} />;

const SkeletonList: React.FC = () => (
  <View style={styles.skeletonListWrap}>
    <View style={styles.skeletonListRow} />
    <View style={styles.skeletonListRow} />
  </View>
);

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
  title: { fontSize: 38, color: COLORS.text, fontWeight: "800", letterSpacing: -0.4 },
  subtitle: { marginTop: 2, color: COLORS.textTertiary, fontSize: 15, fontWeight: "500" },
  content: { flex: 1 },
  mobileContentContainer: { paddingBottom: 22 },
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
    backgroundColor: "#F1F4F8",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  periodChipActive: { backgroundColor: COLORS.primaryDark, borderColor: COLORS.primaryDark },
  periodChipText: { color: COLORS.textDark, fontWeight: "700" },
  periodChipTextActive: { color: COLORS.surface },
  kpiGridMobile: {
    marginTop: 8,
    paddingHorizontal: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  kpiCompactCard: {
    width: "47%",
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  kpiCompactLabel: { color: "#7C8A9D", fontSize: 12, fontWeight: "800", letterSpacing: 0.7 },
  kpiCompactValue: { marginTop: 6, fontSize: 52, color: COLORS.text, fontWeight: "800" },
  kpiCompactValueBlue: { marginTop: 6, fontSize: 52, color: COLORS.primaryDark, fontWeight: "800" },
  kpiCompactValueDanger: { marginTop: 6, fontSize: 52, color: COLORS.error, fontWeight: "800" },
  kpiCompactSub: { fontSize: 22, color: "#7B8799", fontWeight: "700" },
  blockCardMobile: {
    marginHorizontal: 14,
    marginTop: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 14,
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
  badgeMini: {
    borderRadius: 999,
    backgroundColor: COLORS.primaryTint,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeMiniText: { color: COLORS.primaryDark, fontWeight: "700", fontSize: 12 },
  comparisonBlueCard: {
    marginHorizontal: 14,
    marginTop: 16,
    borderRadius: 18,
    backgroundColor: COLORS.primaryDark,
    padding: 16,
  },
  comparisonLabel: { color: "#83B6E6", fontSize: 12, fontWeight: "800", letterSpacing: 0.8 },
  comparisonTitle: { color: COLORS.surface, fontSize: 46, fontWeight: "800", marginTop: 8 },
  comparisonText: { color: "#BBD8F2", marginTop: 8, lineHeight: 20 },
  comparisonBadge: {
    position: "absolute",
    right: 16,
    top: 22,
    borderRadius: 18,
    backgroundColor: "#3F8DCD",
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  comparisonBadgeText: { marginTop: 4, color: COLORS.surface, fontWeight: "800", fontSize: 24 },
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
  tasksWrapMobile: {
    marginHorizontal: 14,
    marginTop: 16,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  progressCircleWrap: {
    width: 128,
    alignItems: "center",
    justifyContent: "center",
  },
  progressCircleText: {
    position: "absolute",
    top: 42,
    fontSize: 34,
    color: COLORS.text,
    fontWeight: "800",
  },
  progressCircleSub: {
    position: "absolute",
    top: 81,
    fontSize: 11,
    color: "#7C8A9C",
    fontWeight: "800",
  },
  tasksTitle: { color: COLORS.textDark, fontWeight: "800", fontSize: 38 },
  legendRowInline: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  legendBullet: { fontSize: 16, marginRight: 8 },
  legendLabelInline: { flex: 1, color: "#4C607C", fontSize: 25, fontWeight: "600" },
  legendValueInline: { color: "#2F435E", fontWeight: "800", fontSize: 28 },
  suggestionCard: {
    marginHorizontal: 14,
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#DDE8F5",
    backgroundColor: "#F4F8FD",
    padding: 14,
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
  },
  suggestionIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.primaryTint,
    alignItems: "center",
    justifyContent: "center",
  },
  suggestionTitle: { color: COLORS.textDark, fontWeight: "800", fontSize: 31 },
  suggestionText: { marginTop: 4, color: "#52667F", lineHeight: 22, fontSize: 23 },
  tableHeader: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    backgroundColor: COLORS.backgroundSoft,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  tableHeaderText: {
    color: "#5D6F89",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  tableCellText: {
    color: "#1F314A",
    fontSize: 13,
    fontWeight: "600",
  },
  colPeriodo: { flex: 1.2 },
  colPromedio: { flex: 0.8, textAlign: "center" },
  colEstado: { flex: 1, textAlign: "right" },
  tableEmptyText: {
    marginTop: 10,
    color: COLORS.textTertiary,
    fontSize: 14,
  },
  centerStateWrap: { paddingHorizontal: 16, paddingTop: 46, alignItems: "center" },
  centerStateCard: {
    width: "100%",
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    padding: 22,
  },
  centerStateTitle: {
    marginTop: 16,
    color: COLORS.text,
    fontWeight: "800",
    fontSize: 18,
    textAlign: "center",
  },
  centerStateText: {
    marginTop: 10,
    color: "#677A94",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  errorIconCircleStrong: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#F1F3F7",
    alignItems: "center",
    justifyContent: "center",
  },
  retryMainButton: {
    marginTop: 22,
    borderRadius: 999,
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 26,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  retryMainButtonText: { color: COLORS.surface, fontWeight: "800", fontSize: 20 },
  secondaryLink: { marginTop: 16, color: "#2D76B8", fontWeight: "700", fontSize: 16 },
  emptyIllustration: {
    width: 160,
    height: 160,
    borderRadius: 32,
    backgroundColor: "#EAF6FB",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    marginTop: 20,
    fontSize: 44,
    fontWeight: "800",
    color: "#1F2B3C",
  },
  emptyText: {
    marginTop: 8,
    textAlign: "center",
    color: "#5D6F88",
    fontSize: 19,
    lineHeight: 28,
    paddingHorizontal: 8,
  },
  bottomTabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingTop: 8,
    paddingBottom: 8,
  },
  tabItem: { alignItems: "center", gap: 2, minWidth: 64 },
  tabIconWrap: {
    width: 40,
    height: 30,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  tabIconWrapActive: { backgroundColor: "#E8F1FF" },
  tabLabel: { color: "#4F5968", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  tabLabelActive: { color: COLORS.primaryDark },

  loadingTopCards: { marginTop: 10, paddingHorizontal: 14, flexDirection: "row", gap: 10 },
  skeletonCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    minHeight: 108,
  },
  skeletonCircle: { width: 26, height: 26, borderRadius: 13, backgroundColor: COLORS.skeleton },
  skeletonBar: {
    marginTop: 12,
    height: 10,
    borderRadius: 8,
    backgroundColor: COLORS.skeleton,
    width: "58%",
  },
  skeletonBarWide: {
    marginTop: 8,
    height: 14,
    borderRadius: 8,
    backgroundColor: COLORS.skeleton,
    width: "76%",
  },
  skeletonWide: {
    marginTop: 10,
    marginHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    padding: 12,
    minHeight: 95,
  },
  skeletonCircleLarge: {
    position: "absolute",
    right: 14,
    top: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.skeleton,
  },
  skeletonLine: {
    height: 14,
    borderRadius: 8,
    backgroundColor: COLORS.skeleton,
    marginHorizontal: 14,
    marginTop: 16,
    width: "55%",
  },
  skeletonChart: {
    marginHorizontal: 14,
    marginTop: 12,
    height: 190,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  skeletonListWrap: {
    marginTop: 16,
    marginHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    padding: 12,
    gap: 12,
  },
  skeletonListRow: { height: 44, borderRadius: 10, backgroundColor: COLORS.skeleton },
  skeletonSuggestion: {
    marginTop: 18,
    marginHorizontal: 14,
    height: 98,
    borderRadius: 16,
    backgroundColor: "#E4F7FF",
    borderWidth: 1,
    borderColor: "#BDE9FA",
  },

  desktopLayout: { flex: 1, flexDirection: "row" },
  sidebarDesktop: {
    width: 225,
    backgroundColor: COLORS.surfaceHover,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    padding: 16,
    gap: 8,
  },
  brandDesktop: { fontSize: 28, color: "#2F5F9A", fontWeight: "800", marginBottom: 14 },
  sideMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  sideMenuItemActive: { backgroundColor: COLORS.primaryTint },
  sideMenuLabel: { color: COLORS.textDark, fontWeight: "600" },
  sideMenuLabelActive: { color: COLORS.primaryDark, fontWeight: "700" },
  mainDesktop: { flex: 1 },
  headerDesktop: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  titleDesktop: { fontSize: 34, color: COLORS.text, fontWeight: "800", marginLeft: 8 },
  cycleText: { color: "#687A93", marginRight: 8, fontWeight: "600" },
  desktopGrid: { flex: 1, padding: 14, flexDirection: "row", gap: 14 },
  desktopLeftCol: { width: 290, gap: 12 },
  desktopRightCol: { flex: 1, gap: 12 },
  profileCard: {
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    alignItems: "center",
  },
  avatarWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#DFF2FF",
    borderWidth: 3,
    borderColor: "#8CC7EC",
    alignItems: "center",
    justifyContent: "center",
  },
  profileName: { marginTop: 10, fontSize: 24, color: COLORS.textDark, fontWeight: "800" },
  profileSub: { marginTop: 4, color: "#7E8EA5", fontWeight: "600" },
  profileTagsRow: { marginTop: 10, flexDirection: "row", gap: 8 },
  badgeSmall: {
    borderRadius: 999,
    backgroundColor: "#E7F3FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeSmallPale: { backgroundColor: "#DCF4F7" },
  badgeSmallText: { color: COLORS.primaryDark, fontWeight: "800", fontSize: 11 },
  badgeSmallTextPale: { color: "#2A8E97" },
  desktopKpiCard: {
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  desktopKpiIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primaryTint,
    alignItems: "center",
    justifyContent: "center",
  },
  desktopKpiLabel: { color: "#6F8098", fontSize: 11, fontWeight: "800" },
  desktopKpiValue: { marginTop: 2, color: COLORS.text, fontSize: 20, fontWeight: "800" },
  groupCard: {
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  groupCardTitle: { color: COLORS.textDark, fontWeight: "800", fontSize: 20, marginBottom: 8 },
  groupMetricLabel: { color: "#6C7E98", fontSize: 11, fontWeight: "800", marginTop: 4 },
  progressBarTrack: {
    marginTop: 4,
    height: 8,
    borderRadius: 999,
    backgroundColor: COLORS.primaryTint,
  },
  progressBarFill: { height: "100%", borderRadius: 999, backgroundColor: COLORS.primaryDark },
  progressBarTrackGray: {
    marginTop: 4,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#E7ECF3",
  },
  progressBarFillGray: { height: "100%", borderRadius: 999, backgroundColor: "#AAB6C8" },
  groupCardNote: { marginTop: 10, color: "#6C7E98", fontSize: 12, lineHeight: 18 },
  trendCardDesktop: {
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  yearsRow: { flexDirection: "row", gap: 8 },
  yearChip: {
    borderRadius: 999,
    backgroundColor: COLORS.skeleton,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  yearChipActive: { backgroundColor: COLORS.primaryDark },
  yearChipText: { color: "#617590", fontWeight: "700", fontSize: 12 },
  yearChipTextActive: { color: COLORS.surface },
  smallSub: { color: "#7C8CA2", marginTop: 2 },
  tasksCardDesktop: {
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  legendInline: { flexDirection: "row", gap: 10 },
  legendInlineBlue: { color: COLORS.primaryDark, fontWeight: "800", fontSize: 11 },
  legendInlineRed: { color: COLORS.error, fontWeight: "800", fontSize: 11 },
  taskRowDesktop: {
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceHover,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  taskIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#E6F0FB",
    alignItems: "center",
    justifyContent: "center",
  },
  taskTitleDesktop: { color: COLORS.textDark, fontWeight: "700" },
  taskSubDesktop: { marginTop: 2, color: "#7C8CA2", fontSize: 12 },
  taskScoreDesktop: { color: COLORS.textDark, fontWeight: "800", textAlign: "right" },
  taskStatusDesktop: { marginTop: 2, color: COLORS.primaryDark, fontWeight: "800", fontSize: 11 },
  desktopStateCard: {
    margin: 20,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    alignItems: "center",
  },
  desktopSkeletonWrap: { flex: 1, padding: 16, flexDirection: "row", gap: 14 },
  desktopSkeletonLeft: {
    width: 290,
    borderRadius: 16,
    backgroundColor: "#EAF0F8",
  },
  desktopSkeletonRight: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: "#EAF0F8",
  },
  errorCode: { marginTop: 8, color: "#8B95A8", letterSpacing: 0.5, fontWeight: "700" },
});

export default ReportesAlumnoScreen;
