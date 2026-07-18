import React, { useMemo, useState } from "react";
import { Platform, Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RouteProp } from "@react-navigation/native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import WebScrollView from "../../components/WebScrollView";
import { useAlumnos } from "../../context/AlumnosContext";
import { useCalificaciones } from "../../context/CalificacionesContext";
import { useGrupos } from "../../hooks/useGrupos";
import { COLORS } from "../../../types";
import type { AppRoutesParamList } from "../../navigation/StackNavigator";
import {
  calcularPromediosAlumnos,
  calcularPromedioGrupal,
  type PromedioAlumno,
} from "../../services/promediosService";

type Nav = StackNavigationProp<AppRoutesParamList, "PromediosCalificaciones">;
type Route = RouteProp<AppRoutesParamList, "PromediosCalificaciones">;

interface Props {
  navigation: Nav;
  route: Route;
}

type Filtro = "todos" | "aprobados" | "reprobados" | "pendientes";

const AVATAR_COLORS = [
  "#4A90D9",
  "#E67E22",
  "#27AE60",
  "#8E44AD",
  "#E74C3C",
  "#16A085",
  "#D35400",
  "#2980B9",
  "#C0392B",
  "#7D3C98",
];

const getAvatarColor = (index: number) => AVATAR_COLORS[index % AVATAR_COLORS.length];

const getInitials = (p: PromedioAlumno): string => {
  const first = p.nombre?.charAt(0) ?? "";
  const last = p.apellidos?.charAt(0) ?? "";
  return `${first}${last}`.toUpperCase();
};

const estadoConfig = {
  aprobado: { label: "Aprobado", color: "#27AE60", bg: "#E8F5E9" },
  reprobado: { label: "Reprobado", color: "#E74C3C", bg: "#FFE8E8" },
  pendiente: { label: "Pendiente", color: "#F39C12", bg: "#FFF8E1" },
};

const PromediosCalificacionesScreen: React.FC<Props> = ({ navigation, route }) => {
  const { grupoId } = route.params;
  const { grupos } = useGrupos();
  const { alumnos } = useAlumnos();
  const { obtenerCalificacionesPorGrupo } = useCalificaciones();

  const [filtro, setFiltro] = useState<Filtro>("todos");

  const grupo = useMemo(() => grupos.find((g) => g.id === grupoId), [grupos, grupoId]);

  const alumnosDelGrupo = useMemo(
    () => alumnos.filter((a) => a.grupoId === grupoId && a.estado === "activo"),
    [alumnos, grupoId]
  );

  const calificacionesGrupo = useMemo(
    () => obtenerCalificacionesPorGrupo(grupoId),
    [grupoId, obtenerCalificacionesPorGrupo]
  );

  const promediosAlumnos = useMemo(
    () => calcularPromediosAlumnos(calificacionesGrupo, alumnosDelGrupo),
    [calificacionesGrupo, alumnosDelGrupo]
  );

  const stats = useMemo(() => calcularPromedioGrupal(promediosAlumnos), [promediosAlumnos]);

  const promediosFiltrados = useMemo(() => {
    if (filtro === "todos") return promediosAlumnos;
    const estadoMap: Record<string, string> = {
      aprobados: "aprobado",
      reprobados: "reprobado",
      pendientes: "pendiente",
    };
    return promediosAlumnos.filter((p) => p.estado === estadoMap[filtro]);
  }, [promediosAlumnos, filtro]);

  const filtros: { key: Filtro; label: string; count: number }[] = [
    { key: "todos", label: "Todos", count: stats.totalAlumnos },
    { key: "aprobados", label: "Aprobados", count: stats.aprobados },
    { key: "reprobados", label: "Reprobados", count: stats.reprobados },
    { key: "pendientes", label: "Pendientes", count: stats.pendientes },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </Pressable>
        <Text style={styles.headerTitle}>Promedios del Grupo</Text>
        <View style={{ width: 32 }} />
      </View>

      <WebScrollView style={styles.scrollView}>
        {/* Group Card */}
        <View style={styles.grupoCard}>
          <View style={styles.grupoLabelBadge}>
            <Text style={styles.grupoLabelText}>RESUMEN DE CALIFICACIONES</Text>
          </View>
          <Text style={styles.grupoNombre}>
            {grupo?.nombre ?? "Grupo"}
            {grupo?.materia ? ` • ${grupo.materia}` : ""}
          </Text>
          <View style={styles.grupoMeta}>
            <MaterialIcons name="school" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.grupoMetaText}>{grupo?.periodo ?? "Sin periodo"}</Text>
            <MaterialIcons name="people" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.grupoMetaText}>{alumnosDelGrupo.length} alumnos</Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderLeftColor: COLORS.primary }]}>
            <Text style={styles.statValue}>{stats.promedioGeneral || "--"}</Text>
            <Text style={styles.statLabel}>Promedio General</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: "#27AE60" }]}>
            <Text style={styles.statValue}>{stats.porcentajeAprobacion}%</Text>
            <Text style={styles.statLabel}>Aprobación</Text>
          </View>
        </View>

        {/* Parcial Averages */}
        <View style={styles.parcialRow}>
          {(["parcial1", "parcial2", "parcial3"] as const).map((key, i) => (
            <View key={key} style={styles.parcialCard}>
              <Text style={styles.parcialCardTitle}>{i + 1}° Parcial</Text>
              <Text style={styles.parcialCardValue}>{stats.promediosPorParcial[key] ?? "--"}</Text>
            </View>
          ))}
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {filtros.map((f) => (
            <Pressable
              key={f.key}
              style={({ pressed }) => [
                styles.filterPill,
                filtro === f.key && styles.filterPillActive,
                pressed && { opacity: 0.6 },
              ]}
              onPress={() => setFiltro(f.key)}
            >
              <Text
                style={[styles.filterPillText, filtro === f.key && styles.filterPillTextActive]}
              >
                {f.label} ({f.count})
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Student Promedios List */}
        {promediosFiltrados.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="school" size={48} color={COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>Sin calificaciones registradas</Text>
            <Text style={styles.emptySubtitle}>
              Registra calificaciones para ver los promedios del grupo
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Alumno</Text>
              <Text style={[styles.tableHeaderText, styles.parcialCol]}>P1</Text>
              <Text style={[styles.tableHeaderText, styles.parcialCol]}>P2</Text>
              <Text style={[styles.tableHeaderText, styles.parcialCol]}>P3</Text>
              <Text style={[styles.tableHeaderText, styles.promedioCol]}>Prom</Text>
            </View>

            {promediosFiltrados.map((p, index) => {
              const cfg = estadoConfig[p.estado];
              return (
                <View key={p.alumnoId} style={styles.studentRow}>
                  {/* Avatar */}
                  <View style={[styles.avatar, { backgroundColor: getAvatarColor(index) }]}>
                    <Text style={styles.avatarText}>{getInitials(p)}</Text>
                  </View>

                  {/* Info */}
                  <View style={styles.studentInfo}>
                    <Text style={styles.studentName} numberOfLines={1}>
                      {p.nombre} {p.apellidos}
                    </Text>
                    <View style={[styles.estadoBadge, { backgroundColor: cfg.bg }]}>
                      <Text style={[styles.estadoBadgeText, { color: cfg.color }]}>
                        {cfg.label}
                      </Text>
                    </View>
                  </View>

                  {/* Parciales */}
                  <Text style={[styles.parcialValue, styles.parcialCol]}>{p.parcial1 ?? "--"}</Text>
                  <Text style={[styles.parcialValue, styles.parcialCol]}>{p.parcial2 ?? "--"}</Text>
                  <Text style={[styles.parcialValue, styles.parcialCol]}>{p.parcial3 ?? "--"}</Text>

                  {/* Promedio */}
                  <View
                    style={[
                      styles.promedioBadge,
                      {
                        backgroundColor:
                          p.estado === "aprobado"
                            ? "#E8F5E9"
                            : p.estado === "reprobado"
                              ? "#FFE8E8"
                              : "#F5F5F5",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.promedioValue,
                        {
                          color:
                            p.estado === "aprobado"
                              ? "#27AE60"
                              : p.estado === "reprobado"
                                ? "#E74C3C"
                                : COLORS.text,
                        },
                      ]}
                    >
                      {p.promedio || "--"}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 24 }} />
      </WebScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) + 8 : 14,
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    color: "white",
    fontSize: 20,
    fontWeight: "700",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  // Group Card
  grupoCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    backgroundColor: COLORS.primary,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  grupoLabelBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  grupoLabelText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  grupoNombre: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  grupoMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  grupoMetaText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    marginRight: 10,
  },
  // Stats
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  statValue: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  // Parcial Row
  parcialRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 12,
    gap: 8,
  },
  parcialCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
    }),
  },
  parcialCardTitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: "600",
    marginBottom: 4,
  },
  parcialCardValue: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primary,
  },
  // Filter
  filterRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 16,
    gap: 8,
    flexWrap: "wrap",
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#E8EDF2",
  },
  filterPillActive: {
    backgroundColor: COLORS.primary,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  filterPillTextActive: {
    color: "white",
  },
  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  // List
  listContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#F8F9FB",
    borderBottomWidth: 1,
    borderBottomColor: "#E8EDF2",
  },
  tableHeaderText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  parcialCol: {
    width: 36,
    textAlign: "center",
  },
  promedioCol: {
    width: 50,
    textAlign: "center",
  },
  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F2F5",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarText: {
    color: "white",
    fontSize: 13,
    fontWeight: "700",
  },
  studentInfo: {
    flex: 1,
    marginRight: 8,
  },
  studentName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 3,
  },
  estadoBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  estadoBadgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  parcialValue: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
  },
  promedioBadge: {
    width: 50,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
  },
  promedioValue: {
    fontSize: 15,
    fontWeight: "800",
  },
});

export default PromediosCalificacionesScreen;
