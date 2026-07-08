import React, { useMemo, useState } from "react";
import { Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RouteProp } from "@react-navigation/native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import WebScrollView from "../../components/WebScrollView";
import { useAsistencias } from "../../context/AsistenciaContext";
import { useGrupos } from "../../hooks/useGrupos";
import { COLORS } from "../../../types";
import type { RootStackParamList } from "../../navigation/StackNavigator";

type Nav = StackNavigationProp<RootStackParamList, "HistorialAsistencia">;
type Route = RouteProp<RootStackParamList, "HistorialAsistencia">;

interface Props {
  navigation: Nav;
  route: Route;
}

type Filtro = "todos" | "presentes" | "retardos" | "faltas";

const FILTROS: { id: Filtro; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "presentes", label: "Presentes" },
  { id: "retardos", label: "Retardos" },
  { id: "faltas", label: "Faltas" },
];

interface SesionResumen {
  fecha: string;
  fechaDisplay: string;
  mesCorto: string;
  diaNum: number;
  presentes: number;
  retardos: number;
  faltas: number;
  total: number;
}

const MESES_CORTO = [
  "ENE",
  "FEB",
  "MAR",
  "ABR",
  "MAY",
  "JUN",
  "JUL",
  "AGO",
  "SEP",
  "OCT",
  "NOV",
  "DIC",
];

const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const normalizeFecha = (fecha: Date | string): string => {
  const d = typeof fecha === "string" ? new Date(fecha) : fecha;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const formatFechaLarga = (fecha: string): string => {
  const d = new Date(fecha + "T12:00:00");
  return `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`;
};

const HistorialAsistenciaScreen: React.FC<Props> = ({ navigation, route }) => {
  const { grupoId } = route.params;
  const { grupos } = useGrupos();
  const { obtenerAsistenciasPorGrupo } = useAsistencias();

  const [filtro, setFiltro] = useState<Filtro>("todos");

  const grupo = useMemo(() => grupos.find((g) => g.id === grupoId), [grupos, grupoId]);

  const asistenciasGrupo = useMemo(
    () => obtenerAsistenciasPorGrupo(grupoId),
    [grupoId, obtenerAsistenciasPorGrupo]
  );

  // Group by fecha and compute per-session summaries
  const sesiones = useMemo((): SesionResumen[] => {
    const porFecha = new Map<
      string,
      { presentes: number; retardos: number; faltas: number; total: number }
    >();

    asistenciasGrupo.forEach((a) => {
      const key = normalizeFecha(a.fecha);
      const entry = porFecha.get(key) ?? { presentes: 0, retardos: 0, faltas: 0, total: 0 };
      entry.total += 1;
      if (a.estado === "presente") entry.presentes += 1;
      else if (a.estado === "retardo") entry.retardos += 1;
      else if (a.estado === "ausente") entry.faltas += 1;
      porFecha.set(key, entry);
    });

    return Array.from(porFecha.entries())
      .map(([fecha, stats]) => {
        const d = new Date(fecha + "T12:00:00");
        return {
          fecha,
          fechaDisplay: formatFechaLarga(fecha),
          mesCorto: MESES_CORTO[d.getMonth()],
          diaNum: d.getDate(),
          ...stats,
        };
      })
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [asistenciasGrupo]);

  // Filtered sessions
  const sesionesFiltradas = useMemo(() => {
    if (filtro === "todos") return sesiones;
    if (filtro === "presentes") return sesiones.filter((s) => s.presentes > 0);
    if (filtro === "retardos") return sesiones.filter((s) => s.retardos > 0);
    return sesiones.filter((s) => s.faltas > 0);
  }, [sesiones, filtro]);

  // Global stats
  const totalSesiones = sesiones.length;
  const totalPresentes = asistenciasGrupo.filter((a) => a.estado === "presente").length;
  const totalRetardos = asistenciasGrupo.filter((a) => a.estado === "retardo").length;
  const totalFaltas = asistenciasGrupo.filter((a) => a.estado === "ausente").length;
  const totalRegistros = asistenciasGrupo.length;
  const porcentajeAsistencia =
    totalRegistros > 0 ? Math.round((totalPresentes / totalRegistros) * 100) : 0;

  const filtros = FILTROS;

  const handleNavigateRegistrar = () => {
    navigation.navigate("RegistrarAsistencia", { grupoId });
  };

  const handleSesionPress = (fechaSesion: string) => {
    // Navigate to register with the given date pre-set (edit mode)
    navigation.navigate("RegistrarAsistencia", { grupoId });
  };

  // ── EMPTY STATE ──
  if (sesiones.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.headerRow}>
            <Pressable
              style={({ pressed }) => [styles.headerIconBtn, pressed && { opacity: 0.6 }]}
              onPress={() => navigation.goBack()}
            >
              <MaterialIcons name="arrow-back" size={22} color={COLORS.text} />
            </Pressable>
            <Text style={styles.headerTitle}>Historial de Asistencia</Text>
          </View>

          {/* Group Card */}
          <View style={styles.grupoCard}>
            <View style={styles.grupoCardIcon}>
              <MaterialIcons name="school" size={22} color={COLORS.surface} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.grupoCardLabel}>CURSO ACTUAL</Text>
              <Text style={styles.grupoCardName}>
                {grupo ? `${grupo.nombre} • ${grupo.materia}` : "Grupo"}
              </Text>
            </View>
          </View>

          {/* Empty Illustration */}
          <View style={styles.emptyWrap}>
            <View style={styles.emptyCircle}>
              <MaterialIcons name="event-busy" size={56} color={COLORS.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>Sin registros de asistencia</Text>
            <Text style={styles.emptySubtitle}>Pasa lista para ver el historial aquí.</Text>

            <View style={styles.tipCard}>
              <MaterialIcons name="auto-awesome" size={20} color={COLORS.primary} />
              <Text style={styles.tipText}>
                Sugerencia: Puedes programar recordatorios para no olvidar pasar lista.
              </Text>
            </View>

            <Pressable
              style={({ pressed }) => [styles.startButton, pressed && { opacity: 0.6 }]}
              onPress={handleNavigateRegistrar}
            >
              <MaterialIcons name="add" size={20} color={COLORS.surface} />
              <Text style={styles.startButtonText}>Iniciar Pase de Lista</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ── DATA STATE ──
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable
            style={({ pressed }) => [styles.headerIconBtn, pressed && { opacity: 0.6 }]}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={22} color={COLORS.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Historial de Asistencia</Text>
        </View>

        <WebScrollView style={styles.scrollContent}>
          {/* Group Card */}
          <View style={styles.grupoCardFull}>
            <View style={{ flex: 1 }}>
              <Text style={styles.grupoFullLabel}>GRUPO {grupo?.nombre ?? ""}</Text>
              <Text style={styles.grupoFullName}>{grupo?.materia ?? "Materia"}</Text>
              {grupo?.horario ? (
                <View style={styles.horarioRow}>
                  <MaterialIcons name="schedule" size={14} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.horarioText}>{grupo.horario}</Text>
                </View>
              ) : null}
            </View>
            <View style={styles.grupoFullIcon}>
              <MaterialIcons name="school" size={28} color="rgba(255,255,255,0.3)" />
            </View>
          </View>

          {/* Filter Pills */}
          <View style={styles.filtrosRow}>
            {filtros.map((f) => (
              <Pressable
                key={f.id}
                style={({ pressed }) => [
                  styles.filtroPill,
                  filtro === f.id && styles.filtroPillActive,
                  pressed && { opacity: 0.6 },
                ]}
                onPress={() => setFiltro(f.id)}
              >
                <Text
                  style={[styles.filtroPillText, filtro === f.id && styles.filtroPillTextActive]}
                >
                  {f.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Stats Card */}
          <View style={styles.statsCard}>
            <Text style={styles.statsLabel}>PROMEDIO DE ASISTENCIA</Text>
            <View style={styles.statsMainRow}>
              <Text style={styles.statsPorcentaje}>{porcentajeAsistencia}%</Text>
              {totalSesiones >= 2 && (
                <View style={styles.trendBadge}>
                  <MaterialIcons name="trending-up" size={14} color={COLORS.primary} />
                  <Text style={styles.trendText}>este periodo</Text>
                </View>
              )}
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${porcentajeAsistencia}%` }]} />
            </View>

            {/* Mini Stats */}
            <View style={styles.miniStatsRow}>
              <View style={styles.miniStatBox}>
                <Text style={styles.miniStatLabel}>SESIONES</Text>
                <Text style={styles.miniStatValue}>{totalSesiones}</Text>
              </View>
              <View style={[styles.miniStatBox, styles.miniStatBoxRetardos]}>
                <Text style={styles.miniStatLabel}>RETARDOS</Text>
                <Text style={[styles.miniStatValue, { color: COLORS.warning }]}>
                  {totalRetardos}
                </Text>
              </View>
              <View style={[styles.miniStatBox, styles.miniStatBoxFaltas]}>
                <Text style={styles.miniStatLabel}>FALTAS</Text>
                <Text style={[styles.miniStatValue, { color: COLORS.danger }]}>{totalFaltas}</Text>
              </View>
            </View>
          </View>

          {/* Session List Header */}
          <View style={styles.sesionesHeader}>
            <Text style={styles.sesionesTitle}>Sesiones Recientes</Text>
          </View>

          {/* Session Cards */}
          {sesionesFiltradas.map((sesion) => (
            <Pressable
              key={sesion.fecha}
              style={({ pressed }) => [styles.sesionCard, pressed && { opacity: 0.7 }]}
              onPress={() => handleSesionPress(sesion.fecha)}
            >
              {/* Date Badge */}
              <View style={styles.fechaBadge}>
                <Text style={styles.fechaMes}>{sesion.mesCorto}</Text>
                <Text style={styles.fechaDia}>{sesion.diaNum}</Text>
              </View>

              {/* Session Info */}
              <View style={styles.sesionInfo}>
                <Text style={styles.sesionFecha}>{sesion.fechaDisplay}</Text>
                <View style={styles.chipsRow}>
                  {sesion.presentes > 0 && (
                    <View style={[styles.chip, styles.chipPresente]}>
                      <Text style={styles.chipTextPresente}>{sesion.presentes} PRESENTES</Text>
                    </View>
                  )}
                  {sesion.retardos > 0 && (
                    <View style={[styles.chip, styles.chipRetardo]}>
                      <Text style={styles.chipTextRetardo}>{sesion.retardos} RETARDOS</Text>
                    </View>
                  )}
                  {sesion.faltas > 0 && (
                    <View style={[styles.chip, styles.chipFalta]}>
                      <Text style={styles.chipTextFalta}>
                        {sesion.faltas} {sesion.faltas === 1 ? "FALTA" : "FALTAS"}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <MaterialIcons name="chevron-right" size={24} color={COLORS.textMuted} />
            </Pressable>
          ))}

          {sesionesFiltradas.length === 0 && (
            <View style={styles.noResults}>
              <MaterialIcons name="filter-list-off" size={32} color={COLORS.textMuted} />
              <Text style={styles.noResultsText}>Sin sesiones con este filtro.</Text>
            </View>
          )}

          <View style={{ height: 40 }} />
        </WebScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1 },

  // Header
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },
  headerIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: COLORS.text },

  scrollContent: { flex: 1 },

  // Group Card (full / with data)
  grupoCardFull: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
  },
  grupoFullLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 1,
  },
  grupoFullName: { fontSize: 20, fontWeight: "700", color: COLORS.surface, marginTop: 4 },
  horarioRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  horarioText: { fontSize: 12, color: "rgba(255,255,255,0.8)" },
  grupoFullIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Group Card (empty state)
  grupoCard: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.primary,
  },
  grupoCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  grupoCardLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 0.8,
  },
  grupoCardName: { fontSize: 15, fontWeight: "700", color: COLORS.surface, marginTop: 2 },

  // Filter Pills
  filtrosRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  filtroPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filtroPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filtroPillText: { fontSize: 13, fontWeight: "600", color: COLORS.textSecondary },
  filtroPillTextActive: { color: COLORS.surface },

  // Stats Card
  statsCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statsLabel: { fontSize: 11, fontWeight: "700", color: COLORS.textMuted, letterSpacing: 0.8 },
  statsMainRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  statsPorcentaje: { fontSize: 40, fontWeight: "800", color: COLORS.text },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
  },
  trendText: { fontSize: 12, fontWeight: "600", color: COLORS.primary },

  // Progress Bar
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    marginTop: 12,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },

  // Mini Stats
  miniStatsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  miniStatBox: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  miniStatBoxRetardos: { borderColor: COLORS.warning },
  miniStatBoxFaltas: { borderColor: COLORS.danger },
  miniStatLabel: { fontSize: 10, fontWeight: "700", color: COLORS.textMuted, letterSpacing: 0.5 },
  miniStatValue: { fontSize: 22, fontWeight: "800", color: COLORS.text, marginTop: 2 },

  // Session List
  sesionesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  sesionesTitle: { fontSize: 17, fontWeight: "700", color: COLORS.text },

  sesionCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 14,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  fechaBadge: {
    width: 48,
    alignItems: "center",
    marginRight: 14,
  },
  fechaMes: { fontSize: 11, fontWeight: "700", color: COLORS.primary, letterSpacing: 0.5 },
  fechaDia: { fontSize: 22, fontWeight: "800", color: COLORS.text },

  sesionInfo: { flex: 1 },
  sesionFecha: { fontSize: 14, fontWeight: "600", color: COLORS.text, marginBottom: 6 },

  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  chipPresente: { backgroundColor: "#E8F5E9" },
  chipRetardo: { backgroundColor: "#FFF3E0" },
  chipFalta: { backgroundColor: "#FFE8E8" },
  chipTextPresente: { fontSize: 11, fontWeight: "700", color: COLORS.success },
  chipTextRetardo: { fontSize: 11, fontWeight: "700", color: COLORS.warning },
  chipTextFalta: { fontSize: 11, fontWeight: "700", color: COLORS.danger },

  // No Results
  noResults: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 8,
  },
  noResultsText: { fontSize: 14, color: COLORS.textMuted },

  // Empty State
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  emptyCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: COLORS.text, textAlign: "center" },
  emptySubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: "center", marginTop: 8 },
  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 24,
    padding: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  tipText: { flex: 1, fontSize: 13, color: COLORS.primary, lineHeight: 18 },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
  },
  startButtonText: { fontSize: 15, fontWeight: "700", color: COLORS.surface },
});

export default HistorialAsistenciaScreen;
