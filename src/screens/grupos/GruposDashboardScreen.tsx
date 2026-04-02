import React, { useState, useCallback } from "react";
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
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { COLORS } from "../../../types";
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
              <MaterialIcons name="close" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={modalStyles.searchWrap}>
            <MaterialIcons name="search" size={20} color={COLORS.textMuted} />
            <TextInput
              style={modalStyles.searchInput}
              placeholder="Buscar grupo..."
              placeholderTextColor={COLORS.textMuted}
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
                  <View style={modalStyles.grupoAlumnosRow}>
                    <MaterialIcons name="groups" size={14} color={COLORS.textMuted} />
                    <Text style={modalStyles.grupoAlumnosText}>
                      {grupo.cantidadAlumnos} Alumnos
                    </Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={22} color={COLORS.textMuted} />
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
          <Text style={compareStyles.title}>Comparar Grupos</Text>

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
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView style={compareStyles.tableWrap}>
            {/* Table Header */}
            <View style={compareStyles.row}>
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
                          backgroundColor: COLORS.primary,
                        },
                      ]}
                    />
                  </View>
                  <Text style={compareStyles.barValue}>{g.promedio.toFixed(1)}</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity style={compareStyles.closeBtn} onPress={onClose}>
            <Text style={compareStyles.closeBtnText}>Cerrar</Text>
          </TouchableOpacity>
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
        <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrap}>
              <MaterialIcons name="groups" size={64} color={COLORS.outlineVariant} />
            </View>
            <Text style={styles.emptyTitle}>Aún no tienes grupos</Text>
            <Text style={styles.emptySubtitle}>
              Crea tu primer grupo para comenzar a gestionar tus clases de manera inteligente.
            </Text>
            <TouchableOpacity
              style={styles.emptyPrimaryBtn}
              onPress={handleCrearGrupo}
              activeOpacity={0.85}
            >
              <MaterialIcons name="add" size={18} color="#FFF" />
              <Text style={styles.emptyPrimaryBtnText}>Crear mi primer grupo</Text>
            </TouchableOpacity>
            <View style={styles.tipCard}>
              <MaterialIcons name="auto-awesome" size={18} color={COLORS.primary} />
              <Text style={styles.tipText}>
                Tip Académico: Los grupos te permiten organizar tus estudiantes y generar planes de
                clase personalizados con IA en segundos.
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ─── Loading State ───
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando dashboard...</Text>
      </View>
    );
  }

  // ─── Error State ───
  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <MaterialIcons name="error-outline" size={48} color={COLORS.error} />
        <Text style={styles.errorTitle}>No se pudo cargar el dashboard</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={recargar}>
          <Text style={styles.retryBtnText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Dashboard ───
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />

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
              <MaterialIcons name="cloud-done" size={14} color="#002204" />
              <Text style={styles.badgeText}>SINCRONIZADO</Text>
            </View>
            <View style={[styles.badge, styles.badgeInfo]}>
              <Text style={styles.badgeText}>{kpis.gruposActivos} GRUPOS ACTIVOS</Text>
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
                    <MaterialIcons name="compare-arrows" size={18} color={COLORS.primary} />
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
                  <MaterialIcons name="compare-arrows" size={18} color={COLORS.primary} />
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
      color: "#1565C0",
      icon: "people" as const,
    },
    {
      label: "Promedio Gral",
      value: kpis.promedioGeneral.toFixed(1),
      color: "#2E7D32",
      icon: "trending-up" as const,
    },
    {
      label: "Asistencia",
      value: `${kpis.indiceAsistencia}%`,
      color: "#00796B",
      icon: "event-available" as const,
    },
    {
      label: "Pendientes",
      value: String(kpis.entregasPendientes),
      color: "#E65100",
      icon: "assignment-late" as const,
    },
  ];

  return (
    <View style={[styles.kpiGrid, wideLayout && styles.kpiGridWide]}>
      {items.map((item) => (
        <View key={item.label} style={[styles.kpiCard, { borderLeftColor: item.color }]}>
          <Text style={styles.kpiLabel}>{item.label.toUpperCase()}</Text>
          <View style={styles.kpiValueRow}>
            <Text style={styles.kpiValue}>{item.value}</Text>
            <MaterialIcons name={item.icon} size={16} color={item.color} />
          </View>
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
            <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
            <Text style={styles.legendText}>Aprob.</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.tealLight }]} />
            <Text style={styles.legendText}>Asist.</Text>
          </View>
        </View>
      </View>
      <View style={styles.chartBars}>
        {bars.map((bar, i) => (
          <View key={i} style={styles.chartBarGroup}>
            <View
              style={[styles.chartBar, { height: `${bar.h1}%`, backgroundColor: COLORS.primary }]}
            />
            <View
              style={[styles.chartBar, { height: `${bar.h2}%`, backgroundColor: COLORS.tealLight }]}
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
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.quickActionDesktopItem}
            onPress={() => onPress(action.id as QuickActionType)}
            activeOpacity={0.7}
          >
            <View style={[styles.quickActionDesktopIcon, { backgroundColor: action.bgColor }]}>
              <MaterialIcons name={action.icon as any} size={22} color={action.color} />
            </View>
            <Text style={styles.quickActionDesktopLabel}>{action.label}</Text>
            <MaterialIcons name="chevron-right" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        ))}
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
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.quickActionBtn}
            onPress={() => onPress(action.id as QuickActionType)}
            activeOpacity={0.7}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: action.bgColor }]}>
              <MaterialIcons name={action.icon as any} size={24} color={action.color} />
            </View>
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
      <Text style={styles.sectionLabel}>TUS GRUPOS ACTIVOS</Text>
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
                <View>
                  <Text style={styles.grupoCardName}>{grupo.nombre}</Text>
                  <Text style={styles.grupoCardMeta}>{grupo.cantidadAlumnos} Alumnos</Text>
                </View>
              </View>
              <View style={styles.grupoCardBadge}>
                <Text style={styles.grupoCardBadgeText}>ACTIVO</Text>
              </View>
            </View>
            <View style={styles.grupoCardStats}>
              <View style={styles.grupoCardStat}>
                <Text style={styles.grupoCardStatLabel}>Prom.</Text>
                <Text style={styles.grupoCardStatValue}>{grupo.promedio.toFixed(1)}</Text>
              </View>
              <View style={styles.grupoCardStat}>
                <Text style={styles.grupoCardStatLabel}>Asist.</Text>
                <Text style={styles.grupoCardStatValue}>{grupo.asistencia}%</Text>
              </View>
              <View style={styles.grupoCardStat}>
                <Text style={styles.grupoCardStatLabel}>Pend.</Text>
                <Text style={styles.grupoCardStatValue}>{grupo.pendientes}</Text>
              </View>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(grupo.asistencia, 100)}%`,
                    backgroundColor: grupo.asistencia >= 80 ? COLORS.primary : COLORS.warning,
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
  const getBorderColor = (tipo: string) => {
    switch (tipo) {
      case "critico":
        return COLORS.error;
      case "alerta":
        return COLORS.warning;
      default:
        return COLORS.primary;
    }
  };

  const getBgColor = (tipo: string) => {
    switch (tipo) {
      case "critico":
        return COLORS.errorTint;
      case "alerta":
        return COLORS.warningTint;
      default:
        return COLORS.primaryTint;
    }
  };

  return (
    <View style={styles.alertasSection}>
      <View style={styles.alertasHeader}>
        <Text style={styles.sectionLabel}>ATENCIÓN REQUERIDA</Text>
        <MaterialIcons name="warning" size={18} color={COLORS.error} />
      </View>
      {alertas.map((alerta, index) => (
        <TouchableOpacity
          key={`${alerta.alumnoId}-${index}`}
          style={[
            styles.alertaCard,
            {
              backgroundColor: getBgColor(alerta.tipo),
              borderLeftColor: getBorderColor(alerta.tipo),
            },
          ]}
          onPress={() => onAlertaPress(alerta.alumnoId, alerta.nombre, alerta.apellidos)}
          activeOpacity={0.7}
        >
          <View style={styles.alertaInfo}>
            <Text style={styles.alertaName}>
              {alerta.nombre} {alerta.apellidos}
            </Text>
            <Text style={[styles.alertaMsg, { color: getBorderColor(alerta.tipo) }]}>
              {alerta.mensaje}
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={COLORS.textMuted} />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const renderTipCard = () => (
  <View style={styles.tipCardDashboard}>
    <View style={styles.tipCardInner}>
      <MaterialIcons name="lightbulb" size={20} color="#d4e3ff" />
      <Text style={styles.tipCardTitle}>Tip de Eficiencia</Text>
    </View>
    <Text style={styles.tipCardDesc}>
      Puedes usar las acciones rápidas para pasar lista en menos de 2 minutos. PlanearIA
      sincronizará los datos automáticamente con el reporte semanal.
    </Text>
  </View>
);

// ─── Styles ───

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    paddingHorizontal: 24,
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
    borderRadius: 20,
  },
  badgeSync: {
    backgroundColor: "rgba(163, 246, 156, 0.3)",
  },
  badgeInfo: {
    backgroundColor: "rgba(212, 227, 255, 0.3)",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: COLORS.text,
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
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    borderLeftWidth: 4,
    boxShadow: "0px 12px 24px rgba(0,72,132,0.06)",
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.textMuted,
    letterSpacing: 1.2,
  },
  kpiValueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  kpiValue: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.text,
  },

  // Chart
  chartCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    boxShadow: "0px 12px 24px rgba(0,72,132,0.06)",
  },
  chartCardWide: {
    padding: 28,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },
  chartSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
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
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.textSecondary,
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
    width: 10,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },

  // Quick Actions (Mobile)
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: COLORS.textMuted,
    marginBottom: 10,
  },
  quickActionsScroll: {
    gap: 16,
    paddingVertical: 4,
  },
  quickActionBtn: {
    alignItems: "center",
    gap: 6,
    minWidth: 72,
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.text,
  },

  // Quick Actions (Desktop)
  quickActionsDesktop: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  quickActionDesktopItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
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
    color: COLORS.text,
  },

  // Desktop grid
  desktopGrid: {
    flexDirection: "row",
    gap: 24,
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
  gruposList: {
    gap: 12,
  },
  grupoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    boxShadow: "0px 4px 12px rgba(0,72,132,0.04)",
  },
  grupoCardWide: {
    padding: 20,
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
  },
  grupoCardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  grupoCardAvatarText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#bdd6ff",
  },
  grupoCardName: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },
  grupoCardMeta: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  grupoCardBadge: {
    backgroundColor: "rgba(163, 246, 156, 0.4)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  grupoCardBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#002204",
    letterSpacing: 0.5,
  },
  grupoCardStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  grupoCardStat: {
    alignItems: "center",
  },
  grupoCardStatLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  grupoCardStatValue: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
  },
  progressBar: {
    height: 5,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },

  // Alertas
  alertasSection: {
    gap: 10,
  },
  alertasHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  alertaCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    padding: 14,
    borderLeftWidth: 4,
  },
  alertaInfo: {
    flex: 1,
  },
  alertaName: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },
  alertaMsg: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },

  // Tip Card (Dashboard)
  tipCardDashboard: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 16,
    padding: 20,
    gap: 8,
  },
  tipCardInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tipCardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#d4e3ff",
  },
  tipCardDesc: {
    fontSize: 12,
    color: "#a4c9ff",
    lineHeight: 18,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyIconWrap: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: COLORS.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 300,
    marginBottom: 24,
  },
  emptyPrimaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 24,
    marginBottom: 12,
  },
  emptyPrimaryBtnText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700",
  },
  tipCard: {
    marginTop: 32,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    backgroundColor: COLORS.surfaceContainerLow,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    maxWidth: 340,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: "italic",
    lineHeight: 17,
  },

  // Loading / Error
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 12,
  },
  errorMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  retryBtnText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
  },
});

// ─── Modal Styles ───

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(23, 28, 33, 0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "90%",
    boxShadow: "0px -12px 24px rgba(0,72,132,0.08)",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.outlineVariant,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.text,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceContainerHigh,
    alignItems: "center",
    justifyContent: "center",
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 24,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    padding: 0,
  },
  list: {
    paddingHorizontal: 20,
    maxHeight: 400,
  },
  grupoItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    marginBottom: 8,
    gap: 12,
  },
  grupoAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryTint,
    alignItems: "center",
    justifyContent: "center",
  },
  grupoAvatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary,
  },
  grupoInfo: {
    flex: 1,
  },
  grupoName: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },
  grupoMeta: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  grupoAlumnosRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  grupoAlumnosText: {
    fontSize: 11,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  noResults: {
    textAlign: "center",
    fontSize: 14,
    color: COLORS.textMuted,
    paddingVertical: 24,
  },
  footer: {
    padding: 20,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  cancelBtn: {
    backgroundColor: COLORS.surfaceContainerHigh,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },
  compareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
  },
  compareBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
});

const compareStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "90%",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 28,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.outlineVariant,
    alignSelf: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
  },
  chips: {
    flexDirection: "row",
    marginBottom: 16,
    maxHeight: 40,
  },
  chip: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  chipTextSelected: {
    color: "#FFF",
  },
  tableWrap: {
    flex: 1,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
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
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  colHeader: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.text,
  },
  metricText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  valueText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },
  bestValue: {
    color: "#2E7D32",
  },
  barsSection: {
    marginTop: 20,
  },
  barsSectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textMuted,
    marginBottom: 12,
    letterSpacing: 0.3,
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
    color: COLORS.text,
  },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceContainerLow,
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
    color: COLORS.textSecondary,
    textAlign: "right",
  },
  closeBtn: {
    backgroundColor: COLORS.surfaceContainerHigh,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },
});

export default GruposDashboardScreen;
