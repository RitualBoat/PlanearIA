import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Animated,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Modal,
  TextInput,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { isWeb } from "../../utils/responsive";
import AnimatedTopPill from "../../components/AnimatedTopPill";
import {
  useGruposDashboardViewModel,
  GrupoMiniStats,
  AlertaAlumno,
  QuickActionType,
} from "../../hooks/useGruposDashboardViewModel";
import { useGruposContext } from "../../context/GruposContext";
import type { Grupo } from "../../../types";

// ─── Stitch Design Tokens (4.1.1) ───
const DT = {
  primary: "#002f5a",
  primaryContainer: "#004580",
  primaryFixed: "#d4e3ff",
  primaryFixedDim: "#a4c8ff",
  onPrimaryContainer: "#85b4f6",
  surface: "#f7f9ff",
  surfaceLowest: "#ffffff",
  surfaceLow: "#f1f4fa",
  surfaceContainer: "#ebeef4",
  surfaceHigh: "#e5e8ee",
  surfaceHighest: "#dfe3e8",
  onSurface: "#181c20",
  onSurfaceVariant: "#424750",
  outline: "#727781",
  outlineVariant: "#c2c6d1",
  secondary: "#1b6d24",
  secondaryContainer: "#a0f499",
  onSecondaryContainer: "#207128",
  tertiary: "#4f2100",
  tertiaryContainer: "#713200",
  onTertiaryContainer: "#f69b63",
  error: "#ba1a1a",
  errorContainer: "#ffdad6",
  errorIcon: "#C62828",
  errorTint: "#FFF1F2",
  warningBanner: "#FFF5E9",
  warningBorder: "#F5D7B0",
  warningText: "#B87424",
  toastSuccessBg: "#E7F9F3",
  toastSuccessBorder: "#B8EAD8",
  toastSuccessIcon: "#0D9E70",
  toastErrorBg: "#FFF1F2",
  toastErrorBorder: "#F2C6C6",
  toastErrorIcon: "#C62828",
  skeleton: "#EDF1F7",
  text: "#1E2A3A",
  textSecondary: "#5C6E86",
  textMuted: "#6B7D96",
  shadow: "rgba(0,69,128,0.06)",
  shadowLift: "rgba(33,60,109,0.12)",
  overlay: "rgba(19,30,49,0.42)",
};

type GruposDashboardNavigationProp = StackNavigationProp<RootStackParamList, "Grupos">;

interface GruposDashboardScreenProps {
  navigation: GruposDashboardNavigationProp;
}

// ─── GrupoSelectorModal ───

interface GrupoSelectorModalProps {
  visible: boolean;
  title: string;
  grupos: GrupoMiniStats[];
  onSelect: (grupoId: number) => void;
  onClose: () => void;
}

const GrupoSelectorModal: React.FC<GrupoSelectorModalProps> = ({
  visible,
  title,
  grupos,
  onSelect,
  onClose,
}) => {
  const [search, setSearch] = useState("");

  const filtered = grupos.filter(
    (g) =>
      g.nombre.toLowerCase().includes(search.toLowerCase()) ||
      g.materia.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          <View style={modalStyles.handle} />
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>{title}</Text>
            <TouchableOpacity style={modalStyles.closeBtn} onPress={onClose}>
              <MaterialIcons name="close" size={20} color={DT.onSurfaceVariant} />
            </TouchableOpacity>
          </View>
          <View style={modalStyles.searchWrap}>
            <MaterialIcons name="search" size={20} color={DT.outline} />
            <TextInput
              style={modalStyles.searchInput}
              placeholder="Buscar grupo..."
              placeholderTextColor={DT.outline}
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <ScrollView style={modalStyles.list}>
            {filtered.map((grupo) => (
              <TouchableOpacity
                key={grupo.id}
                style={modalStyles.grupoItem}
                onPress={() => {
                  setSearch("");
                  onSelect(grupo.id);
                }}
                activeOpacity={0.7}
              >
                <View style={modalStyles.grupoAvatar}>
                  <Text style={modalStyles.grupoAvatarText}>
                    {grupo.nombre.substring(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View style={modalStyles.grupoInfo}>
                  <Text style={modalStyles.grupoName}>{grupo.nombre}</Text>
                  <Text style={modalStyles.grupoMeta}>{grupo.materia}</Text>
                </View>
                <View style={modalStyles.grupoBadge}>
                  <Text style={modalStyles.grupoBadgeText}>{grupo.cantidadAlumnos}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={22} color={DT.outline} />
              </TouchableOpacity>
            ))}
            {filtered.length === 0 && (
              <Text style={modalStyles.noResults}>No se encontraron grupos</Text>
            )}
          </ScrollView>
          <View style={modalStyles.footer}>
            <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose}>
              <Text style={modalStyles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ─── CompararGruposModal ───

interface CompararGruposModalProps {
  visible: boolean;
  grupos: GrupoMiniStats[];
  onClose: () => void;
}

const CompararGruposModal: React.FC<CompararGruposModalProps> = ({ visible, grupos, onClose }) => {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(
    new Set(grupos.slice(0, 3).map((g) => g.id))
  );

  const toggleGrupo = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 2) next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selected = grupos.filter((g) => selectedIds.has(g.id));

  const getBestValue = (key: "promedio" | "asistencia", list: GrupoMiniStats[]) => {
    if (list.length === 0) return -1;
    return Math.max(...list.map((g) => g[key]));
  };

  const bestProm = getBestValue("promedio", selected);
  const bestAsis = getBestValue("asistencia", selected);
  const minPend = selected.length > 0 ? Math.min(...selected.map((g) => g.pendientes)) : -1;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={compareStyles.overlay}>
        <View style={compareStyles.sheet}>
          <View style={compareStyles.handle} />
          <View style={[compareStyles.row, compareStyles.headerRowBg]}>
            <View>
              <Text style={compareStyles.title}>Comparar Grupos</Text>
              <Text style={compareStyles.subtitle}>Análisis comparativo de rendimiento</Text>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={compareStyles.chips}>
            {grupos.map((g) => (
              <TouchableOpacity
                key={g.id}
                style={[compareStyles.chip, selectedIds.has(g.id) && compareStyles.chipSelected]}
                onPress={() => toggleGrupo(g.id)}
              >
                <Text
                  style={[
                    compareStyles.chipText,
                    selectedIds.has(g.id) && compareStyles.chipTextSelected,
                  ]}
                >
                  {g.nombre}
                </Text>
                <MaterialIcons
                  name={selectedIds.has(g.id) ? "close" : "add"}
                  size={16}
                  color={selectedIds.has(g.id) ? "#FFF" : DT.onSurfaceVariant}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView style={compareStyles.tableWrap}>
            {/* Table Header */}
            <View style={[compareStyles.row, compareStyles.headerRowBg]}>
              <View style={compareStyles.metricCell}>
                <Text style={compareStyles.metricLabel}>MÉTRICA</Text>
              </View>
              {selected.map((g) => (
                <View key={g.id} style={compareStyles.valueCell}>
                  <Text style={compareStyles.colHeader} numberOfLines={1}>
                    {g.nombre}
                  </Text>
                </View>
              ))}
            </View>

            {/* Alumnos */}
            <View style={compareStyles.row}>
              <View style={compareStyles.metricCell}>
                <Text style={compareStyles.metricText}>Alumnos</Text>
              </View>
              {selected.map((g) => (
                <View key={g.id} style={compareStyles.valueCell}>
                  <Text style={compareStyles.valueText}>{g.cantidadAlumnos}</Text>
                </View>
              ))}
            </View>

            {/* Promedio */}
            <View style={compareStyles.row}>
              <View style={compareStyles.metricCell}>
                <Text style={compareStyles.metricText}>Promedio</Text>
              </View>
              {selected.map((g) => (
                <View key={g.id} style={compareStyles.valueCell}>
                  <Text
                    style={[
                      compareStyles.valueText,
                      g.promedio === bestProm && compareStyles.bestValue,
                    ]}
                  >
                    {g.promedio.toFixed(1)}
                  </Text>
                </View>
              ))}
            </View>

            {/* Asistencia */}
            <View style={compareStyles.row}>
              <View style={compareStyles.metricCell}>
                <Text style={compareStyles.metricText}>Asistencia</Text>
              </View>
              {selected.map((g) => (
                <View key={g.id} style={compareStyles.valueCell}>
                  <Text
                    style={[
                      compareStyles.valueText,
                      g.asistencia === bestAsis && compareStyles.bestValue,
                    ]}
                  >
                    {g.asistencia}%
                  </Text>
                </View>
              ))}
            </View>

            {/* Pendientes */}
            <View style={compareStyles.row}>
              <View style={compareStyles.metricCell}>
                <Text style={compareStyles.metricText}>Pendientes</Text>
              </View>
              {selected.map((g) => (
                <View key={g.id} style={compareStyles.valueCell}>
                  <Text
                    style={[
                      compareStyles.valueText,
                      g.pendientes === minPend && compareStyles.bestValue,
                    ]}
                  >
                    {g.pendientes}
                  </Text>
                </View>
              ))}
            </View>

            {/* Mini bars */}
            <View style={compareStyles.barsSection}>
              <Text style={compareStyles.barsSectionTitle}>Comparativa Visual</Text>
              {selected.map((g) => (
                <View key={g.id} style={compareStyles.barRow}>
                  <Text style={compareStyles.barLabel} numberOfLines={1}>
                    {g.nombre}
                  </Text>
                  <View style={compareStyles.barTrack}>
                    <View
                      style={[
                        compareStyles.barFill,
                        {
                          width: `${Math.min(g.promedio * 10, 100)}%`,
                          backgroundColor: DT.primaryContainer,
                        },
                      ]}
                    />
                  </View>
                  <Text style={compareStyles.barValue}>{g.promedio.toFixed(1)}</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={compareStyles.footerRow}>
            <LinearGradient
              colors={[DT.primaryContainer, "#005da8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={compareStyles.exportBtn}
            >
              <TouchableOpacity style={compareStyles.exportBtnInner} activeOpacity={0.8}>
                <MaterialIcons name="ios-share" size={18} color="#FFF" />
                <Text style={compareStyles.exportBtnText}>Exportar</Text>
              </TouchableOpacity>
            </LinearGradient>
            <TouchableOpacity style={compareStyles.closeBtn} onPress={onClose}>
              <Text style={compareStyles.closeBtnText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ─── Main Screen ───

const GruposDashboardScreen: React.FC<GruposDashboardScreenProps> = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const wideLayout = width >= 920;
  const { grupos } = useGruposContext();

  const { isLoading, error, isEmpty, kpis, gruposConStats, alertas, quickActions, recargar } =
    useGruposDashboardViewModel();

  const [selectorVisible, setSelectorVisible] = useState(false);
  const [selectorAction, setSelectorAction] = useState<QuickActionType | null>(null);
  const [compareVisible, setCompareVisible] = useState(false);

  const scrollY = React.useRef(new Animated.Value(0)).current;
  const mobilePillOpacity = scrollY.interpolate({
    inputRange: [0, 22, 56],
    outputRange: [1, 0.55, 0],
    extrapolate: "clamp",
  });
  const mobilePillTranslateY = scrollY.interpolate({
    inputRange: [0, 56],
    outputRange: [0, -16],
    extrapolate: "clamp",
  });

  const handleQuickAction = useCallback(
    (actionId: QuickActionType) => {
      if (gruposConStats.length === 0) return;
      if (gruposConStats.length === 1) {
        navigateAction(actionId, gruposConStats[0].id);
        return;
      }
      setSelectorAction(actionId);
      setSelectorVisible(true);
    },
    [gruposConStats]
  );

  const navigateAction = useCallback(
    (actionId: QuickActionType, grupoId: number) => {
      const grupo = grupos.find((g) => g.id === grupoId);
      if (!grupo) return;

      switch (actionId) {
        case "calificar":
          navigation.navigate("CapturarCalificaciones", { grupoId });
          break;
        case "tarea":
          navigation.navigate("CrearTareaGrupo", { grupoId });
          break;
        case "reportes":
          navigation.navigate("ReportesGrupo", { grupoId, grupoNombre: grupo.nombre || "" });
          break;
        case "asistencia":
          navigation.navigate("RegistrarAsistencia", { grupoId });
          break;
      }
    },
    [grupos, navigation]
  );

  const handleSelectorSelect = useCallback(
    (grupoId: number) => {
      setSelectorVisible(false);
      if (selectorAction) {
        navigateAction(selectorAction, grupoId);
      }
    },
    [selectorAction, navigateAction]
  );

  const handleGrupoPress = useCallback(
    (grupoId: number) => {
      const grupo = grupos.find((g) => g.id === grupoId);
      if (!grupo) return;
      navigation.navigate("DetalleGrupo", { grupoId, grupoNombre: grupo.nombre || "" });
    },
    [grupos, navigation]
  );

  const handleCrearGrupo = useCallback(() => {
    navigation.navigate("CrearGrupo");
  }, [navigation]);

  const handleAlertaPress = useCallback(
    (alumnoId: number, nombre: string, apellidos: string) => {
      navigation.navigate("ReportesAlumno", {
        alumnoId,
        alumnoNombre: `${nombre} ${apellidos}`,
      });
    },
    [navigation]
  );

  const getSelectorTitle = (): string => {
    switch (selectorAction) {
      case "calificar":
        return "Calificar — Selecciona un grupo";
      case "tarea":
        return "Asignar Tarea — Selecciona un grupo";
      case "reportes":
        return "Reportes — Selecciona un grupo";
      case "asistencia":
        return "Asistencia — Selecciona un grupo";
      default:
        return "Selecciona un grupo";
    }
  };

  // ─── Empty State ───
  if (isEmpty) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={DT.surface} barStyle="dark-content" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrap}>
              <MaterialIcons name="groups" size={64} color={DT.outlineVariant} />
            </View>
            <Text style={styles.emptyTitle}>Aún no tienes grupos</Text>
            <Text style={styles.emptySubtitle}>
              Crea tu primer grupo para comenzar a gestionar tus clases
            </Text>
            <TouchableOpacity
              style={styles.emptyPrimaryBtn}
              onPress={handleCrearGrupo}
              activeOpacity={0.85}
            >
              <MaterialIcons name="add" size={18} color="#FFF" />
              <Text style={styles.emptyPrimaryBtnText}>Crear mi primer grupo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.emptySecondaryBtn} activeOpacity={0.7}>
              <Text style={styles.emptySecondaryBtnText}>Importar desde archivo</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ─── Loading State (Skeleton) ───
  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={DT.surface} barStyle="dark-content" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.skeletonContent}>
            <View style={styles.skeletonPill} />
            <View style={styles.skeletonKpiGrid}>
              {[0, 1, 2, 3].map((i) => (
                <View key={i} style={styles.skeletonKpi} />
              ))}
            </View>
            <View style={styles.skeletonChart} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.skeletonActionsRow}
            >
              {[0, 1, 2, 3].map((i) => (
                <View key={i} style={styles.skeletonAction} />
              ))}
            </ScrollView>
            {[0, 1, 2].map((i) => (
              <View key={i} style={styles.skeletonGrupo} />
            ))}
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ─── Error State ───
  if (error) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={DT.surface} barStyle="dark-content" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.errorContainer}>
            <View style={styles.errorIconWrap}>
              <MaterialIcons name="error-outline" size={64} color={DT.errorIcon} />
            </View>
            <Text style={styles.errorTitle}>No se pudieron cargar los datos</Text>
            <Text style={styles.errorMessage}>
              Ocurrió un error al obtener la información de tus grupos
            </Text>
            <TouchableOpacity style={styles.retryBtn} onPress={recargar} activeOpacity={0.85}>
              <MaterialIcons name="refresh" size={20} color="#FFF" />
              <Text style={styles.retryBtnText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ─── Dashboard ───
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={DT.surface} barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea}>
        <Animated.ScrollView
          contentContainerStyle={[styles.scrollContent, wideLayout && styles.scrollContentWide]}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
            useNativeDriver: true,
          })}
          scrollEventThrottle={16}
        >
          {/* Section 1: Header Pill */}
          <View style={styles.headerBlock}>
            <Animated.View
              style={{
                opacity: mobilePillOpacity,
                transform: [{ translateY: mobilePillTranslateY }],
              }}
            >
              <AnimatedTopPill
                icon="groups"
                title="Mis Grupos"
                subtitle="Panel de control docente"
              />
            </Animated.View>
          </View>

          {/* Section 2: Sync Badges */}
          <View style={styles.badgesRow}>
            <View style={[styles.badge, styles.badgeSync]}>
              <MaterialIcons name="cloud-done" size={14} color={DT.onSecondaryContainer} />
              <Text style={[styles.badgeText, { color: DT.onSecondaryContainer }]}>
                Sincronizado
              </Text>
            </View>
            <View style={[styles.badge, styles.badgeInfo]}>
              <Text style={[styles.badgeText, { color: DT.primaryContainer }]}>
                {kpis.gruposActivos} grupos activos
              </Text>
            </View>
          </View>

          {wideLayout ? (
            // ─── Desktop: 2-column layout ───
            <View style={styles.desktopGrid}>
              <View style={styles.desktopMain}>
                {renderKPIs(kpis, wideLayout)}
                {renderChart(wideLayout)}
                {renderGruposList(gruposConStats, handleGrupoPress, wideLayout)}
                {gruposConStats.length >= 2 && (
                  <TouchableOpacity
                    style={styles.compareBtn}
                    onPress={() => setCompareVisible(true)}
                    activeOpacity={0.8}
                  >
                    <MaterialIcons name="compare-arrows" size={18} color={DT.primaryContainer} />
                    <Text style={styles.compareBtnText}>Comparar Grupos</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.desktopSidebar}>
                {renderQuickActions(quickActions, handleQuickAction, true)}
                {renderAlertas(alertas, handleAlertaPress)}
                {renderTipCard()}
              </View>
            </View>
          ) : (
            // ─── Mobile: vertical stack ───
            <>
              {renderKPIs(kpis, wideLayout)}
              {renderChart(wideLayout)}
              {renderQuickActions(quickActions, handleQuickAction, false)}
              {renderGruposList(gruposConStats, handleGrupoPress, wideLayout)}
              {gruposConStats.length >= 2 && (
                <TouchableOpacity
                  style={styles.compareBtn}
                  onPress={() => setCompareVisible(true)}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="compare-arrows" size={18} color={DT.primaryContainer} />
                  <Text style={styles.compareBtnText}>Comparar Grupos</Text>
                </TouchableOpacity>
              )}
              {alertas.length > 0 && renderAlertas(alertas, handleAlertaPress)}
              {renderTipCard()}
            </>
          )}
        </Animated.ScrollView>
      </SafeAreaView>

      <GrupoSelectorModal
        visible={selectorVisible}
        title={getSelectorTitle()}
        grupos={gruposConStats}
        onSelect={handleSelectorSelect}
        onClose={() => setSelectorVisible(false)}
      />

      {gruposConStats.length >= 2 && (
        <CompararGruposModal
          visible={compareVisible}
          grupos={gruposConStats}
          onClose={() => setCompareVisible(false)}
        />
      )}
    </View>
  );
};

// ─── Render Sections ───

const renderKPIs = (
  kpis: {
    totalAlumnos: number;
    promedioGeneral: number;
    indiceAsistencia: number;
    entregasPendientes: number;
  },
  wideLayout: boolean
) => {
  const items = [
    {
      label: "Total Alumnos",
      value: String(kpis.totalAlumnos),
      color: DT.primaryContainer,
      icon: "school" as const,
    },
    {
      label: "Promedio Gral",
      value: kpis.promedioGeneral.toFixed(1),
      color: DT.secondary,
      icon: "trending-up" as const,
    },
    {
      label: "Asistencia",
      value: `${kpis.indiceAsistencia}%`,
      color: DT.onTertiaryContainer,
      icon: "check-circle" as const,
    },
    {
      label: "Pendientes",
      value: String(kpis.entregasPendientes),
      color: DT.error,
      icon: "assignment-late" as const,
    },
  ];

  return (
    <View style={[styles.kpiGrid, wideLayout && styles.kpiGridWide]}>
      {items.map((item) => (
        <View key={item.label} style={[styles.kpiCard, { borderLeftColor: item.color }]}>
          <View style={styles.kpiLabelRow}>
            <Text style={styles.kpiLabel}>{item.label.toUpperCase()}</Text>
            <MaterialIcons name={item.icon} size={18} color={item.color} />
          </View>
          <Text style={[styles.kpiValue, { color: DT.primaryContainer }]}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
};

const renderChart = (wideLayout: boolean) => {
  const bars = [
    { h1: 60, h2: 80 },
    { h1: 70, h2: 85 },
    { h1: 82, h2: 92 },
    { h1: 75, h2: 88 },
  ];

  return (
    <View style={[styles.chartCard, wideLayout && styles.chartCardWide]}>
      <View style={styles.chartHeader}>
        <View>
          <Text style={styles.chartTitle}>Rendimiento Global</Text>
          <Text style={styles.chartSubtitle}>Últimas semanas</Text>
        </View>
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: DT.primaryContainer }]} />
            <Text style={styles.legendText}>Aprob.</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: DT.surfaceHigh }]} />
            <Text style={styles.legendText}>Asist.</Text>
          </View>
        </View>
      </View>
      <View style={[styles.chartBars, wideLayout && { height: 180 }]}>
        {bars.map((bar, i) => (
          <View key={i} style={styles.chartBarGroup}>
            <View
              style={[
                styles.chartBar,
                { height: `${bar.h1}%`, backgroundColor: DT.primaryContainer },
              ]}
            />
            <View
              style={[styles.chartBar, { height: `${bar.h2}%`, backgroundColor: DT.surfaceHigh }]}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

const renderQuickActions = (
  actions: { id: string; label: string; icon: string; color: string; bgColor: string }[],
  onPress: (id: QuickActionType) => void,
  isDesktop: boolean
) => {
  if (isDesktop) {
    return (
      <View style={styles.quickActionsDesktop}>
        <Text style={styles.quickActionsDesktopTitle}>ACCIONES RÁPIDAS</Text>
        {actions.map((action, index) => {
          const isFirst = index === 0;
          if (isFirst) {
            return (
              <LinearGradient
                key={action.id}
                colors={[DT.primaryContainer, "#005da8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.quickActionDesktopGradient}
              >
                <TouchableOpacity
                  style={styles.quickActionDesktopGradientInner}
                  onPress={() => onPress(action.id as QuickActionType)}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name={action.icon as any} size={22} color="#FFF" />
                  <Text style={styles.quickActionDesktopGradientLabel}>{action.label}</Text>
                  <MaterialIcons name="chevron-right" size={20} color="rgba(255,255,255,0.7)" />
                </TouchableOpacity>
              </LinearGradient>
            );
          }
          return (
            <TouchableOpacity
              key={action.id}
              style={styles.quickActionDesktopItem}
              onPress={() => onPress(action.id as QuickActionType)}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionDesktopIcon, { backgroundColor: DT.surfaceLowest }]}>
                <MaterialIcons name={action.icon as any} size={22} color={DT.primaryContainer} />
              </View>
              <Text style={styles.quickActionDesktopLabel}>{action.label}</Text>
              <MaterialIcons name="chevron-right" size={20} color={DT.outline} />
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.sectionLabel}>ACCIONES RÁPIDAS</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickActionsScroll}
      >
        {actions.map((action, index) => (
          <TouchableOpacity
            key={action.id}
            style={styles.quickActionBtn}
            onPress={() => onPress(action.id as QuickActionType)}
            activeOpacity={0.7}
          >
            {index === 0 ? (
              <LinearGradient
                colors={[DT.primaryContainer, "#005da8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.quickActionIconGradient}
              >
                <MaterialIcons name={action.icon as any} size={24} color="#FFF" />
              </LinearGradient>
            ) : (
              <View style={styles.quickActionIcon}>
                <MaterialIcons name={action.icon as any} size={24} color={DT.primaryContainer} />
              </View>
            )}
            <Text style={styles.quickActionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const renderGruposList = (
  gruposConStats: GrupoMiniStats[],
  onPress: (id: number) => void,
  wideLayout: boolean
) => {
  return (
    <View style={styles.gruposSection}>
      <View style={styles.gruposSectionHeader}>
        <Text style={styles.sectionLabel}>MIS GRUPOS</Text>
        <View style={styles.grupoCountBadge}>
          <Text style={styles.grupoCountText}>{gruposConStats.length}</Text>
        </View>
      </View>
      <View style={styles.gruposList}>
        {gruposConStats.map((grupo) => (
          <TouchableOpacity
            key={grupo.id}
            style={[styles.grupoCard, wideLayout && styles.grupoCardWide]}
            onPress={() => onPress(grupo.id)}
            activeOpacity={0.8}
          >
            <View style={styles.grupoCardHeader}>
              <View style={styles.grupoCardLeft}>
                <View style={styles.grupoCardAvatar}>
                  <Text style={styles.grupoCardAvatarText}>
                    {grupo.nombre.substring(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.grupoCardName}>{grupo.nombre}</Text>
                  <Text style={styles.grupoCardMeta}>
                    {grupo.materia} · {grupo.cantidadAlumnos} alumnos
                  </Text>
                </View>
              </View>
              <View style={styles.grupoCardBadge}>
                <Text style={styles.grupoCardBadgeText}>
                  {grupo.estado === "activo" ? "AL DÍA" : "REPASO"}
                </Text>
              </View>
            </View>
            <View style={styles.grupoCardStats}>
              <View style={styles.grupoCardStat}>
                <Text style={styles.grupoCardStatLabel}>Promedio</Text>
                <Text style={styles.grupoCardStatValue}>{grupo.promedio.toFixed(1)}</Text>
              </View>
              <View style={styles.grupoCardStat}>
                <Text style={styles.grupoCardStatLabel}>Asistencia</Text>
                <Text style={styles.grupoCardStatValue}>{grupo.asistencia}%</Text>
              </View>
              <View style={styles.grupoCardStat}>
                <Text style={styles.grupoCardStatLabel}>Pendientes</Text>
                <Text
                  style={[
                    styles.grupoCardStatValue,
                    grupo.pendientes > 0 && { color: DT.onTertiaryContainer },
                  ]}
                >
                  {grupo.pendientes}
                </Text>
              </View>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(grupo.asistencia, 100)}%`,
                    backgroundColor: DT.secondary,
                  },
                ]}
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const renderAlertas = (
  alertas: AlertaAlumno[],
  onAlertaPress: (alumnoId: number, nombre: string, apellidos: string) => void
) => {
  if (alertas.length === 0) return null;

  const getBorderColor = (tipo: string) => {
    switch (tipo) {
      case "critico":
        return DT.error;
      case "alerta":
        return DT.onTertiaryContainer;
      default:
        return DT.primaryContainer;
    }
  };

  return (
    <View style={styles.alertasSection}>
      <View style={styles.alertasHeader}>
        <Text style={styles.sectionLabel}>ATENCIÓN REQUERIDA</Text>
        <View style={styles.alertaCountBadge}>
          <Text style={styles.alertaCountText}>{alertas.length}</Text>
        </View>
      </View>
      {alertas.map((alerta, index) => (
        <TouchableOpacity
          key={`${alerta.alumnoId}-${index}`}
          style={[styles.alertaCard, { borderLeftColor: getBorderColor(alerta.tipo) }]}
          onPress={() => onAlertaPress(alerta.alumnoId, alerta.nombre, alerta.apellidos)}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.alertaAvatar,
              {
                backgroundColor:
                  alerta.tipo === "critico" ? "rgba(186,26,26,0.1)" : "rgba(246,155,99,0.2)",
              },
            ]}
          >
            <MaterialIcons
              name={alerta.tipo === "critico" ? "warning" : "info"}
              size={20}
              color={getBorderColor(alerta.tipo)}
            />
          </View>
          <View style={styles.alertaInfo}>
            <Text style={styles.alertaName}>
              {alerta.nombre} {alerta.apellidos}
            </Text>
            <Text style={styles.alertaGrupo}>{alerta.grupoNombre}</Text>
            <View
              style={[
                styles.alertaBadge,
                {
                  backgroundColor:
                    alerta.tipo === "critico" ? DT.errorTint : "rgba(246,155,99,0.15)",
                },
              ]}
            >
              <Text
                style={[
                  styles.alertaBadgeText,
                  {
                    color: getBorderColor(alerta.tipo),
                  },
                ]}
              >
                {alerta.mensaje}
              </Text>
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={20} color={DT.outline} />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const renderTipCard = () => (
  <LinearGradient
    colors={[DT.primary, DT.primaryContainer]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.tipCardDashboard}
  >
    <View style={styles.tipCardInner}>
      <MaterialIcons name="lightbulb" size={20} color="rgba(255,255,255,0.8)" />
      <Text style={styles.tipCardOverline}>CONSEJO DEL DÍA</Text>
    </View>
    <Text style={styles.tipCardDesc}>
      Usa las acciones rápidas para gestionar tus grupos sin entrar al detalle de cada uno.
    </Text>
  </LinearGradient>
);

// ─── Styles ───

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DT.surface,
  },
  safeArea: {
    flex: 1,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 54,
    paddingBottom: isWeb() ? 28 : 110,
    gap: 16,
    width: "100%",
    alignSelf: "center",
    maxWidth: 1220,
  },
  scrollContentWide: {
    paddingHorizontal: 32,
  },
  headerBlock: {
    marginBottom: 2,
  },

  // Badges
  badgesRow: {
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeSync: {
    backgroundColor: "rgba(160,244,153,0.2)",
    borderWidth: 1,
    borderColor: "rgba(160,244,153,0.4)",
  },
  badgeInfo: {
    backgroundColor: "rgba(212,227,255,0.3)",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
  },

  // KPIs
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  kpiGridWide: {
    flexWrap: "nowrap",
  },
  kpiCard: {
    flex: 1,
    minWidth: "46%",
    backgroundColor: DT.surfaceLowest,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    boxShadow: `0px 2px 8px ${DT.shadow}`,
  },
  kpiLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: DT.onSurfaceVariant,
    letterSpacing: 1.2,
  },
  kpiValue: {
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 32,
  },

  // Chart
  chartCard: {
    backgroundColor: DT.surfaceLowest,
    borderRadius: 16,
    padding: 20,
    boxShadow: `0px 2px 8px ${DT.shadow}`,
  },
  chartCardWide: {
    padding: 28,
    borderRadius: 24,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: DT.primaryContainer,
  },
  chartSubtitle: {
    fontSize: 12,
    color: DT.onSurfaceVariant,
    marginTop: 2,
  },
  chartLegend: {
    flexDirection: "row",
    gap: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 10,
    fontWeight: "700",
    color: DT.onSurfaceVariant,
  },
  chartBars: {
    height: 120,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    paddingHorizontal: 8,
  },
  chartBarGroup: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
  },
  chartBar: {
    width: 12,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },

  // Quick Actions (Mobile)
  sectionLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: DT.onSurfaceVariant,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  quickActionsScroll: {
    gap: 16,
    paddingVertical: 4,
  },
  quickActionBtn: {
    alignItems: "center",
    gap: 8,
    minWidth: 72,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DT.surfaceLowest,
    boxShadow: `0px 2px 8px ${DT.shadow}`,
  },
  quickActionIconGradient: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: DT.onSurfaceVariant,
  },

  // Quick Actions (Desktop)
  quickActionsDesktop: {
    backgroundColor: DT.surfaceContainer,
    borderRadius: 24,
    padding: 20,
    gap: 10,
  },
  quickActionsDesktopTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: DT.onSurfaceVariant,
    letterSpacing: 1.5,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  quickActionDesktopGradient: {
    borderRadius: 16,
    overflow: "hidden",
  },
  quickActionDesktopGradientInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  quickActionDesktopGradientLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
  },
  quickActionDesktopItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DT.surfaceLowest,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  quickActionDesktopIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionDesktopLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: DT.primaryContainer,
  },

  // Desktop grid
  desktopGrid: {
    flexDirection: "row",
    gap: 40,
  },
  desktopMain: {
    flex: 2,
    gap: 16,
  },
  desktopSidebar: {
    flex: 1,
    gap: 16,
  },

  // Grupos List
  gruposSection: {
    gap: 10,
  },
  gruposSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  grupoCountBadge: {
    backgroundColor: DT.primaryFixed,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  grupoCountText: {
    fontSize: 11,
    fontWeight: "700",
    color: DT.primaryContainer,
  },
  gruposList: {
    gap: 12,
  },
  grupoCard: {
    backgroundColor: DT.surfaceLow,
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  grupoCardWide: {
    padding: 20,
    borderRadius: 24,
  },
  grupoCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  grupoCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  grupoCardAvatar: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: DT.surfaceLowest,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: `0px 2px 4px ${DT.shadow}`,
  },
  grupoCardAvatarText: {
    fontSize: 14,
    fontWeight: "700",
    color: DT.primaryContainer,
  },
  grupoCardName: {
    fontSize: 15,
    fontWeight: "700",
    color: DT.primaryContainer,
  },
  grupoCardMeta: {
    fontSize: 12,
    color: DT.onSurfaceVariant,
    marginTop: 1,
  },
  grupoCardBadge: {
    backgroundColor: "rgba(160,244,153,0.3)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  grupoCardBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: DT.onSecondaryContainer,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  grupoCardStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "rgba(194,198,209,0.15)",
    paddingTop: 14,
  },
  grupoCardStat: {
    alignItems: "center",
  },
  grupoCardStatLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: DT.onSurfaceVariant,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  grupoCardStatValue: {
    fontSize: 14,
    fontWeight: "700",
    color: DT.onSurface,
    marginTop: 2,
  },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },

  // Alertas
  alertasSection: {
    gap: 10,
  },
  alertasHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  alertaCountBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: DT.errorContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  alertaCountText: {
    fontSize: 11,
    fontWeight: "700",
    color: DT.error,
  },
  alertaCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DT.surfaceLowest,
    borderRadius: 16,
    padding: 14,
    borderLeftWidth: 4,
    gap: 12,
  },
  alertaAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  alertaInfo: {
    flex: 1,
    gap: 4,
  },
  alertaName: {
    fontSize: 14,
    fontWeight: "700",
    color: DT.onSurface,
  },
  alertaGrupo: {
    fontSize: 11,
    color: DT.onSurfaceVariant,
  },
  alertaBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginTop: 2,
  },
  alertaBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },

  // Tip Card (Dashboard)
  tipCardDashboard: {
    borderRadius: 24,
    padding: 20,
    gap: 8,
    overflow: "hidden",
  },
  tipCardInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tipCardOverline: {
    fontSize: 10,
    fontWeight: "800",
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  tipCardDesc: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF",
    lineHeight: 20,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyIconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: DT.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: DT.onSurface,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: DT.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
    marginBottom: 24,
  },
  emptyPrimaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#1676D2",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    marginBottom: 12,
    width: "100%",
    maxWidth: 320,
    justifyContent: "center",
    height: 50,
  },
  emptyPrimaryBtnText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "800",
  },
  emptySecondaryBtn: {
    backgroundColor: DT.surfaceContainer,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
    height: 48,
    justifyContent: "center",
  },
  emptySecondaryBtnText: {
    color: DT.onSurface,
    fontSize: 15,
    fontWeight: "700",
  },

  // Skeleton
  skeletonContent: {
    paddingHorizontal: 16,
    paddingTop: 80,
    gap: 28,
  },
  skeletonPill: {
    width: 180,
    height: 32,
    borderRadius: 999,
    backgroundColor: DT.skeleton,
    opacity: 0.5,
  },
  skeletonKpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  skeletonKpi: {
    width: "47%",
    height: 100,
    borderRadius: 14,
    backgroundColor: DT.skeleton,
    opacity: 0.5,
  },
  skeletonChart: {
    width: "100%",
    height: 200,
    borderRadius: 14,
    backgroundColor: DT.skeleton,
    opacity: 0.5,
  },
  skeletonActionsRow: {
    flexDirection: "row",
  },
  skeletonAction: {
    width: 130,
    height: 120,
    borderRadius: 14,
    backgroundColor: DT.skeleton,
    opacity: 0.5,
    marginRight: 12,
  },
  skeletonGrupo: {
    width: "100%",
    height: 90,
    borderRadius: 14,
    backgroundColor: DT.skeleton,
    opacity: 0.5,
  },

  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorIconWrap: {
    padding: 20,
    borderRadius: 999,
    backgroundColor: DT.surfaceLow,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: DT.text,
    textAlign: "center",
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 15,
    color: DT.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 300,
    marginBottom: 20,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#1676D2",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
    width: "100%",
    maxWidth: 280,
  },
  retryBtnText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700",
  },

  // Compare button
  compareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: DT.surfaceLow,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  compareBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: DT.primaryContainer,
  },
});

// ─── Modal Styles ───

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: DT.overlay,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: DT.surfaceLowest,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    maxHeight: "90%",
    boxShadow: `0px -24px 48px rgba(0,72,132,0.12)`,
  },
  handle: {
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(194,198,209,0.3)",
    alignSelf: "center",
    marginTop: 14,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: DT.primaryContainer,
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DT.surfaceLow,
    alignItems: "center",
    justifyContent: "center",
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DT.surfaceLow,
    borderRadius: 16,
    marginHorizontal: 24,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: DT.onSurface,
    padding: 0,
  },
  list: {
    paddingHorizontal: 24,
    maxHeight: 400,
  },
  grupoItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    marginBottom: 8,
    gap: 12,
  },
  grupoAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,69,128,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  grupoAvatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: DT.primaryContainer,
  },
  grupoInfo: {
    flex: 1,
  },
  grupoName: {
    fontSize: 15,
    fontWeight: "700",
    color: DT.onSurface,
  },
  grupoMeta: {
    fontSize: 13,
    color: DT.onSurfaceVariant,
  },
  grupoBadge: {
    backgroundColor: "rgba(27,109,36,0.1)",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  grupoBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: DT.secondary,
  },
  noResults: {
    textAlign: "center",
    fontSize: 14,
    color: DT.outline,
    paddingVertical: 24,
  },
  footer: {
    padding: 20,
  },
  cancelBtn: {
    backgroundColor: DT.surfaceLow,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: DT.primaryContainer,
  },
  compareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: DT.surfaceLow,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
  },
  compareBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: DT.primaryContainer,
  },
});

const compareStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: DT.overlay,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: DT.surfaceLowest,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: "90%",
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 28,
    boxShadow: `0px -24px 48px rgba(0,72,132,0.12)`,
  },
  handle: {
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(194,198,209,0.3)",
    alignSelf: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: DT.primaryContainer,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: DT.onSurfaceVariant,
    marginBottom: 16,
  },
  chips: {
    flexDirection: "row",
    marginBottom: 16,
    maxHeight: 40,
  },
  chip: {
    backgroundColor: DT.surfaceHigh,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  chipSelected: {
    backgroundColor: DT.primaryContainer,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "700",
    color: DT.onSurfaceVariant,
  },
  chipTextSelected: {
    color: "#FFF",
  },
  tableWrap: {
    flex: 1,
    marginBottom: 16,
  },
  headerRowBg: {
    backgroundColor: DT.surfaceLow,
    borderRadius: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: DT.outlineVariant,
  },
  metricCell: {
    width: 100,
  },
  valueCell: {
    flex: 1,
    alignItems: "center",
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: DT.outline,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  colHeader: {
    fontSize: 12,
    fontWeight: "700",
    color: DT.onSurface,
  },
  metricText: {
    fontSize: 13,
    fontWeight: "600",
    color: DT.onSurfaceVariant,
  },
  valueText: {
    fontSize: 15,
    fontWeight: "700",
    color: DT.onSurface,
  },
  bestValue: {
    color: DT.secondary,
  },
  barsSection: {
    marginTop: 20,
  },
  barsSectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: DT.outline,
    marginBottom: 12,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  barLabel: {
    width: 80,
    fontSize: 12,
    fontWeight: "600",
    color: DT.onSurface,
  },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: DT.surfaceLow,
    overflow: "hidden",
  },
  barFill: {
    height: 8,
    borderRadius: 4,
  },
  barValue: {
    width: 36,
    fontSize: 12,
    fontWeight: "700",
    color: DT.onSurfaceVariant,
    textAlign: "right",
  },
  footerRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  exportBtn: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  exportBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  exportBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFF",
  },
  closeBtn: {
    flex: 1,
    backgroundColor: DT.surfaceLow,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: DT.primaryContainer,
  },
});

export default GruposDashboardScreen;

