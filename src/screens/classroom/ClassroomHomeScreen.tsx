import React, { useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../../types";
import type { RootStackParamList } from "../../navigation/StackNavigator";
import AnimatedTopPill from "../../components/AnimatedTopPill";
import { useClassroomHomeViewModel } from "../../hooks/classroom/useClassroomHomeViewModel";

type Navigation = StackNavigationProp<RootStackParamList>;
type HomeTab = "cursos" | "calendario" | "pendientes";

const HOME_TABS: { key: HomeTab; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { key: "cursos", label: "Cursos", icon: "school" },
  { key: "calendario", label: "Calendario", icon: "event" },
  { key: "pendientes", label: "Pendientes", icon: "assignment-late" },
];

const COVER_COLORS = ["#1E7D4F", "#2563EB", "#0F766E", "#B45309", "#4338CA"];

const ClassroomHomeScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>();
  const { classrooms, isLoading, error, isEmpty, totalAlumnos, totalGrupos, totalPendientes, reload } =
    useClassroomHomeViewModel();
  const [activeTab, setActiveTab] = useState<HomeTab>("cursos");
  const [scrollY] = React.useState(() => new Animated.Value(0));
  const allPendientes = classrooms.flatMap((item) =>
    item.pendientes.map((pendiente) => ({
      ...pendiente,
      grupoNombre: item.grupo.nombre,
      materia: item.grupo.materia,
    })),
  );

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.ScrollView
        style={styles.scroller}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => void reload()} />}
        showsVerticalScrollIndicator={Platform.OS === "web"}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
      >
        <View style={styles.headerBlock}>
          <Animated.View
            style={{
              opacity: mobilePillOpacity,
              transform: [{ translateY: mobilePillTranslateY }],
            }}
          >
            <AnimatedTopPill
              icon="school"
              title="Tus clases"
              subtitle="Organiza cursos, unidades, materiales y actividades."
            />
          </Animated.View>
        </View>

        <View style={styles.heroActions}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate("CrearGrupo", { returnToClassroom: true })}>
            <MaterialIcons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Crear clase</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate("ImportarGrupos")}>
            <MaterialIcons name="upload-file" size={20} color={COLORS.primary} />
            <Text style={styles.secondaryButtonText}>Importar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.kpiGrid}>
          <KpiCard label="Cursos" value={String(totalGrupos)} icon="groups" />
          <KpiCard label="Alumnos" value={String(totalAlumnos)} icon="school" />
          <KpiCard label="Pendientes" value={String(totalPendientes)} icon="assignment-late" />
        </View>

        <View style={styles.tabsBar}>
          {HOME_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, activeTab === tab.key ? styles.tabButtonActive : null]}
              onPress={() => setActiveTab(tab.key)}
            >
              <MaterialIcons
                name={tab.icon}
                size={18}
                color={activeTab === tab.key ? COLORS.primary : "#64748B"}
              />
              <Text style={[styles.tabText, activeTab === tab.key ? styles.tabTextActive : null]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {error ? (
          <View style={styles.statusCard}>
            <MaterialIcons name="cloud-off" size={24} color="#B45309" />
            <Text style={styles.statusTitle}>Modo local activo</Text>
            <Text style={styles.statusText}>{error}</Text>
            <TouchableOpacity style={styles.statusButton} onPress={() => void reload()}>
              <Text style={styles.statusButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {isLoading && classrooms.length === 0 ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={styles.loadingText}>Cargando grupos...</Text>
          </View>
        ) : null}

        {isEmpty ? (
          <View style={styles.emptyCard}>
            <MaterialIcons name="auto-awesome" size={34} color={COLORS.primary} />
            <Text style={styles.emptyTitle}>Crea tu primera clase</Text>
            <Text style={styles.emptyText}>
              Classroom se activa cuando hay grupos. Puedes crear uno nuevo o importar grupos desde
              el flujo actual.
            </Text>
            <View style={styles.emptyActions}>
              <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate("CrearGrupo", { returnToClassroom: true })}>
                <Text style={styles.primaryButtonText}>Crear grupo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => navigation.navigate("ImportarGrupos")}
              >
                <Text style={styles.secondaryButtonText}>Importar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {activeTab === "cursos" ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Clases activas</Text>
              <Text style={styles.sectionCaption}>Abre una clase para ver tablon, trabajo de clase y personas.</Text>
            </View>

            <View style={styles.classGrid}>
              {classrooms.map((item, index) => (
                <TouchableOpacity
                  key={item.grupo.id}
                  style={styles.classCard}
                  onPress={() =>
                    navigation.navigate("ClassroomGroup", {
                      grupoId: item.grupo.id,
                      grupoNombre: item.grupo.nombre,
                    })
                  }
                >
                  <View style={[styles.classCover, { backgroundColor: getCoverColor(index) }]}>
                    <Text style={styles.classCoverTitle} numberOfLines={2}>{item.grupo.nombre}</Text>
                    <Text style={styles.classCoverSubtitle}>{item.grupo.materia}</Text>
                    <View style={styles.avatarBubble}>
                      <Text style={styles.avatarBubbleText}>{item.grupo.nombre.slice(0, 1).toUpperCase()}</Text>
                    </View>
                  </View>
                  <View style={styles.classBody}>
                    <Text style={styles.classSubtitle}>{item.grupo.periodo}</Text>
                    <View style={styles.cardMetrics}>
                      <MiniMetric label="Alumnos" value={item.resumen.totalAlumnos} />
                      <MiniMetric label="Actividades" value={item.resumen.totalActividades} />
                      <MiniMetric label="Materiales" value={item.resumen.totalMateriales} />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : null}

        {activeTab === "calendario" ? (
          <TimelineList
            emptyText="No hay fechas proximas."
            items={allPendientes
              .filter((item) => item.fechaLimite)
              .sort((a, b) => new Date(a.fechaLimite ?? "").getTime() - new Date(b.fechaLimite ?? "").getTime())
              .map((item) => ({
                id: item.id,
                title: item.titulo,
                subtitle: `${item.grupoNombre} - ${formatDate(item.fechaLimite)}`,
                icon: "event",
              }))}
          />
        ) : null}

        {activeTab === "pendientes" ? (
          <TimelineList
            emptyText="No tienes pendientes generales."
            items={allPendientes.map((item) => ({
              id: item.id,
              title: item.titulo,
              subtitle: `${item.grupoNombre} - prioridad ${item.prioridad}`,
              icon: "assignment-late",
            }))}
          />
        ) : null}
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const KpiCard: React.FC<{ label: string; value: string; icon: keyof typeof MaterialIcons.glyphMap }> = ({
  icon,
  label,
  value,
}) => (
  <View style={styles.kpiCard}>
    <MaterialIcons name={icon} size={22} color={COLORS.primary} />
    <Text style={styles.kpiValue}>{value}</Text>
    <Text style={styles.kpiLabel}>{label}</Text>
  </View>
);

const MiniMetric: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <View style={styles.miniMetric}>
    <Text style={styles.miniMetricValue}>{value}</Text>
    <Text style={styles.miniMetricLabel}>{label}</Text>
  </View>
);

const TimelineList: React.FC<{
  emptyText: string;
  items: Array<{
    icon: keyof typeof MaterialIcons.glyphMap;
    id: string;
    subtitle: string;
    title: string;
  }>;
}> = ({ emptyText, items }) => (
  <View style={styles.timelineCard}>
    {items.length === 0 ? (
      <View style={styles.timelineEmpty}>
        <MaterialIcons name="event-available" size={30} color={COLORS.primary} />
        <Text style={styles.emptyText}>{emptyText}</Text>
      </View>
    ) : (
      items.map((item) => (
        <View key={item.id} style={styles.timelineRow}>
          <View style={styles.timelineIcon}>
            <MaterialIcons name={item.icon} size={20} color={COLORS.primary} />
          </View>
          <View style={styles.timelineCopy}>
            <Text style={styles.timelineTitle}>{item.title}</Text>
            <Text style={styles.timelineSubtitle}>{item.subtitle}</Text>
          </View>
        </View>
      ))
    )}
  </View>
);

function getCoverColor(index: number): string {
  return COVER_COLORS[index % COVER_COLORS.length];
}

function formatDate(value?: string): string {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toLocaleDateString() : "Sin fecha";
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3F7FB",
  },
  scroller: {
    flex: 1,
    ...(Platform.OS === "web"
      ? ({
          height: "100vh",
          maxHeight: "100vh",
          overflowY: "auto",
        } as object)
      : null),
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 54,
    paddingBottom: Platform.OS === "web" ? 160 : 110,
    gap: 14,
  },
  headerBlock: {
    marginBottom: 2,
  },
  hero: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 22,
    borderWidth: 1,
    borderColor: "#DDE8F5",
  },
  heroCopy: {
    gap: 8,
  },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    color: "#122033",
    fontSize: 27,
    fontWeight: "900",
    lineHeight: 32,
  },
  subtitle: {
    color: "#526173",
    fontSize: 15,
    lineHeight: 22,
  },
  heroActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#EEF5FF",
    borderColor: "#CFE0F7",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "800",
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 14,
  },
  tabsBar: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE8F5",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
    padding: 8,
  },
  tabButton: {
    alignItems: "center",
    borderRadius: 14,
    flexDirection: "row",
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  tabButtonActive: {
    backgroundColor: "#EAF2FF",
  },
  tabText: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "900",
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  kpiCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE8F5",
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    minWidth: 110,
    padding: 16,
  },
  kpiValue: {
    color: "#122033",
    fontSize: 26,
    fontWeight: "900",
    marginTop: 8,
  },
  kpiLabel: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "700",
  },
  statusCard: {
    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
    marginTop: 14,
    padding: 16,
  },
  statusTitle: {
    color: "#9A3412",
    fontSize: 16,
    fontWeight: "900",
  },
  statusText: {
    color: "#9A3412",
    fontSize: 14,
  },
  statusButton: {
    alignSelf: "flex-start",
    backgroundColor: "#FFEDD5",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  statusButtonText: {
    color: "#9A3412",
    fontWeight: "800",
  },
  loadingBox: {
    alignItems: "center",
    gap: 10,
    marginTop: 28,
  },
  loadingText: {
    color: "#64748B",
    fontWeight: "700",
  },
  emptyCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE8F5",
    borderRadius: 24,
    borderWidth: 1,
    gap: 10,
    marginTop: 18,
    padding: 22,
  },
  emptyTitle: {
    color: "#122033",
    fontSize: 21,
    fontWeight: "900",
  },
  emptyText: {
    color: "#64748B",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  emptyActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 8,
  },
  sectionHeader: {
    marginTop: 24,
  },
  sectionTitle: {
    color: "#122033",
    fontSize: 21,
    fontWeight: "900",
  },
  sectionCaption: {
    color: "#64748B",
    fontSize: 13,
    marginTop: 3,
  },
  classGrid: {
    gap: 14,
    marginTop: 12,
  },
  classCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE8F5",
    borderRadius: 22,
    borderWidth: 1,
    overflow: "hidden",
  },
  classCover: {
    minHeight: 142,
    padding: 18,
  },
  classCoverTitle: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "900",
    maxWidth: 280,
  },
  classCoverSubtitle: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 5,
  },
  avatarBubble: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "rgba(255,255,255,0.5)",
    borderRadius: 999,
    borderWidth: 3,
    bottom: -24,
    height: 58,
    justifyContent: "center",
    position: "absolute",
    right: 18,
    width: 58,
  },
  avatarBubbleText: {
    color: COLORS.primary,
    fontSize: 22,
    fontWeight: "900",
  },
  classBody: {
    padding: 18,
    paddingTop: 30,
  },
  cardTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iconBadge: {
    alignItems: "center",
    backgroundColor: "#EEF5FF",
    borderRadius: 14,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  statusPill: {
    backgroundColor: "#E7F8EF",
    borderRadius: 999,
    color: "#166534",
    fontSize: 12,
    fontWeight: "900",
    paddingHorizontal: 11,
    paddingVertical: 6,
    textTransform: "capitalize",
  },
  classTitle: {
    color: "#122033",
    fontSize: 19,
    fontWeight: "900",
    marginTop: 14,
  },
  classSubtitle: {
    color: "#64748B",
    fontSize: 14,
    marginTop: 4,
  },
  cardMetrics: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  miniMetric: {
    backgroundColor: "#F6F9FD",
    borderRadius: 14,
    flex: 1,
    padding: 10,
  },
  miniMetricValue: {
    color: "#122033",
    fontSize: 18,
    fontWeight: "900",
  },
  miniMetricLabel: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },
  timelineCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE8F5",
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 16,
    overflow: "hidden",
  },
  timelineRow: {
    alignItems: "center",
    borderBottomColor: "#E2E8F0",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 15,
  },
  timelineIcon: {
    alignItems: "center",
    backgroundColor: "#EAF2FF",
    borderRadius: 999,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  timelineCopy: {
    flex: 1,
  },
  timelineTitle: {
    color: "#122033",
    fontSize: 15,
    fontWeight: "900",
  },
  timelineSubtitle: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 2,
  },
  timelineEmpty: {
    alignItems: "center",
    gap: 8,
    padding: 24,
  },
});

export default ClassroomHomeScreen;

