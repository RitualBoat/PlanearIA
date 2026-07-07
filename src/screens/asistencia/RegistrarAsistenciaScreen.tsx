import React, { useCallback, useMemo, useState } from "react";
import { Alert, Platform, Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RouteProp } from "@react-navigation/native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import WebScrollView from "../../components/WebScrollView";
import { useAlumnos } from "../../context/AlumnosContext";
import { useAsistencias } from "../../context/AsistenciaContext";
import { useGrupos } from "../../hooks/useGrupos";
import { COLORS } from "../../../types";
import type { Alumno, Asistencia } from "../../../types";
import type { RootStackParamList } from "../../navigation/StackNavigator";

type EstadoAsistencia = "presente" | "retardo" | "ausente";

type Nav = StackNavigationProp<RootStackParamList, "RegistrarAsistencia">;
type Route = RouteProp<RootStackParamList, "RegistrarAsistencia">;

interface Props {
  navigation: Nav;
  route: Route;
}

const formatFechaDisplay = (date: Date): string => {
  const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const meses = [
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
  const dia = dias[date.getDay()];
  const num = date.getDate();
  const mes = meses[date.getMonth()];
  const year = date.getFullYear();
  return `${dia}, ${num} de ${mes} ${year}`;
};

const normalizeFecha = (d: Date): string => {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const buildEstadosFromRecords = (records: Asistencia[]): Record<number, EstadoAsistencia> =>
  records.reduce<Record<number, EstadoAsistencia>>((acc, r) => {
    if (r.estado === "presente" || r.estado === "retardo" || r.estado === "ausente") {
      acc[r.alumnoId] = r.estado;
    }
    return acc;
  }, {});

const RegistrarAsistenciaScreen: React.FC<Props> = ({ navigation, route }) => {
  const { grupoId } = route.params;
  const { grupos } = useGrupos();
  const { alumnos } = useAlumnos();
  const { registrarAsistenciaMasiva, obtenerAsistenciasPorGrupoYFecha, eliminarAsistencia } =
    useAsistencias();

  const [fecha, setFecha] = useState(new Date());
  const [estadosDrafts, setEstadosDrafts] = useState<Record<string, Record<number, EstadoAsistencia>>>(
    {}
  );
  const [isSaving, setIsSaving] = useState(false);

  const grupo = useMemo(() => grupos.find((g) => g.id === grupoId), [grupos, grupoId]);

  const alumnosDelGrupo = useMemo(
    () => alumnos.filter((a) => a.grupoId === grupoId && a.estado === "activo"),
    [alumnos, grupoId]
  );

  // Load existing attendance for this date on mount or date change
  const fechaStr = normalizeFecha(fecha);
  const existingRecords = useMemo(
    () => obtenerAsistenciasPorGrupoYFecha(grupoId, fechaStr),
    [grupoId, fechaStr, obtenerAsistenciasPorGrupoYFecha]
  );

  const estadosSourceKey = useMemo(
    () =>
      JSON.stringify([
        grupoId,
        fechaStr,
        existingRecords
          .map((r) => [r.id, r.alumnoId, r.estado])
          .sort((a, b) => Number(a[0]) - Number(b[0])),
      ]),
    [existingRecords, fechaStr, grupoId]
  );
  const loadedEstados = useMemo(() => buildEstadosFromRecords(existingRecords), [existingRecords]);
  const estados = estadosDrafts[estadosSourceKey] ?? loadedEstados;

  const toggleEstado = useCallback(
    (alumnoId: number, estado: EstadoAsistencia) => {
      setEstadosDrafts((prev) => {
        const current = prev[estadosSourceKey] ?? loadedEstados;
        const next = { ...current };
        if (next[alumnoId] === estado) {
          delete next[alumnoId];
        } else {
          next[alumnoId] = estado;
        }
        return { ...prev, [estadosSourceKey]: next };
      });
    },
    [estadosSourceKey, loadedEstados]
  );

  const marcados = useMemo(() => Object.keys(estados).length, [estados]);
  const presentes = useMemo(
    () => Object.values(estados).filter((e) => e === "presente").length,
    [estados]
  );
  const retardos = useMemo(
    () => Object.values(estados).filter((e) => e === "retardo").length,
    [estados]
  );
  const faltas = useMemo(
    () => Object.values(estados).filter((e) => e === "ausente").length,
    [estados]
  );

  const handleGuardar = async () => {
    if (marcados === 0) {
      const msg = "Marca al menos un alumno antes de guardar.";
      if (Platform.OS === "web") {
        window.alert(msg);
      } else {
        Alert.alert("Sin registros", msg);
      }
      return;
    }

    try {
      setIsSaving(true);
      const registros = Object.entries(estados).map(([alumnoIdStr, estado]) => ({
        alumnoId: Number(alumnoIdStr),
        grupoId,
        fecha,
        estado,
      }));

      await registrarAsistenciaMasiva(registros);

      const msg = `Asistencia guardada: ${presentes} presentes, ${retardos} retardos, ${faltas} faltas.`;
      if (Platform.OS === "web") {
        window.alert(msg);
      } else {
        Alert.alert("Guardado", msg);
      }
      navigation.goBack();
    } catch {
      const msg = "No se pudo guardar la asistencia.";
      if (Platform.OS === "web") {
        window.alert(msg);
      } else {
        Alert.alert("Error", msg);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCambiarFecha = () => {
    // Simple date navigation: go back/forward one day
    const msg = "Usa los botones de fecha para navegar entre días.";
    if (Platform.OS === "web") {
      window.alert(msg);
    } else {
      Alert.alert("Cambiar Fecha", msg);
    }
  };

  const handleFechaAnterior = () => {
    setFecha((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 1);
      return d;
    });
  };

  const handleFechaSiguiente = () => {
    setFecha((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 1);
      return d;
    });
  };

  const isHoy = normalizeFecha(fecha) === normalizeFecha(new Date());

  const handleEliminarAsistencia = () => {
    if (existingRecords.length === 0) {
      const msg = "No hay registros de asistencia para esta fecha.";
      if (Platform.OS === "web") {
        window.alert(msg);
      } else {
        Alert.alert("Sin registros", msg);
      }
      return;
    }

    const doDelete = async () => {
      try {
        await Promise.all(existingRecords.map((r) => eliminarAsistencia(r.id)));
        setEstadosDrafts((prev) => ({ ...prev, [estadosSourceKey]: {} }));
        const msg = "Registro de asistencia eliminado.";
        if (Platform.OS === "web") {
          window.alert(msg);
        } else {
          Alert.alert("Eliminado", msg);
        }
      } catch {
        const msg = "No se pudo eliminar la asistencia.";
        if (Platform.OS === "web") {
          window.alert(msg);
        } else {
          Alert.alert("Error", msg);
        }
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm("¿Eliminar el registro de asistencia de esta fecha?")) {
        void doDelete();
      }
    } else {
      Alert.alert("Confirmar eliminación", "¿Eliminar el registro de asistencia de esta fecha?", [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => void doDelete() },
      ]);
    }
  };

  const renderAlumnoRow = (alumno: Alumno) => {
    const estado = estados[alumno.id];
    return (
      <View key={alumno.id} style={styles.alumnoRow}>
        <View style={styles.alumnoInfo}>
          <View style={styles.alumnoAvatar}>
            <Text style={styles.avatarText}>
              {(alumno.nombre?.[0] || "").toUpperCase()}
              {(alumno.apellidos?.[0] || "").toUpperCase()}
            </Text>
          </View>
          <View style={styles.alumnoTextWrap}>
            <Text style={styles.alumnoName} numberOfLines={1}>
              {alumno.nombre} {alumno.apellidos}
            </Text>
            <Text style={styles.alumnoControl}>{alumno.numeroControl}</Text>
          </View>
        </View>
        <View style={styles.estadoBtns}>
          <Pressable
            style={({ pressed }) => [
              styles.estadoBtn,
              estado === "presente" && styles.estadoBtnPresente,
              pressed && { opacity: 0.6 },
            ]}
            onPress={() => toggleEstado(alumno.id, "presente")}
          >
            <MaterialIcons
              name="check-circle"
              size={28}
              color={estado === "presente" ? COLORS.surface : COLORS.textMuted}
            />
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.estadoBtn,
              estado === "retardo" && styles.estadoBtnRetardo,
              pressed && { opacity: 0.6 },
            ]}
            onPress={() => toggleEstado(alumno.id, "retardo")}
          >
            <MaterialIcons
              name="schedule"
              size={28}
              color={estado === "retardo" ? COLORS.surface : COLORS.textMuted}
            />
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.estadoBtn,
              estado === "ausente" && styles.estadoBtnFalta,
              pressed && { opacity: 0.6 },
            ]}
            onPress={() => toggleEstado(alumno.id, "ausente")}
          >
            <MaterialIcons
              name="cancel"
              size={28}
              color={estado === "ausente" ? COLORS.surface : COLORS.textMuted}
            />
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable
            style={({ pressed }) => [styles.headerIconButton, pressed && { opacity: 0.6 }]}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={22} color={COLORS.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Registrar Asistencia</Text>
          {existingRecords.length > 0 && (
            <Pressable
              style={({ pressed }) => [
                styles.headerIconButton,
                { marginLeft: "auto" },
                pressed && { opacity: 0.6 },
              ]}
              onPress={handleEliminarAsistencia}
            >
              <MaterialIcons name="delete-outline" size={22} color={COLORS.danger} />
            </Pressable>
          )}
        </View>

        <WebScrollView style={styles.scrollContent}>
          {/* Group Card */}
          <View style={styles.grupoCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.grupoLabel}>CLASE ACTUAL</Text>
              <Text style={styles.grupoName}>
                {grupo ? `${grupo.nombre} • ${grupo.materia}` : "Grupo no encontrado"}
              </Text>
            </View>
            <View style={styles.grupoIconWrap}>
              <MaterialIcons name="school" size={24} color={COLORS.surface} />
            </View>
          </View>

          {/* Date Selector */}
          <View style={styles.dateRow}>
            <Pressable
              onPress={handleFechaAnterior}
              style={({ pressed }) => [styles.dateArrow, pressed && { opacity: 0.6 }]}
            >
              <MaterialIcons name="chevron-left" size={24} color={COLORS.textSecondary} />
            </Pressable>
            <View style={styles.datePill}>
              <MaterialIcons name="event" size={18} color={COLORS.textSecondary} />
              <Text style={styles.dateText}>
                {isHoy ? "Hoy, " : ""}
                {formatFechaDisplay(fecha)}
              </Text>
            </View>
            <Pressable
              onPress={handleFechaSiguiente}
              style={({ pressed }) => [styles.dateArrow, pressed && { opacity: 0.6 }]}
            >
              <MaterialIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
            </Pressable>
            <Pressable
              style={({ pressed }) => pressed && { opacity: 0.6 }}
              onPress={handleCambiarFecha}
            >
              <Text style={styles.cambiarText}>CAMBIAR</Text>
            </Pressable>
          </View>

          {/* List Header */}
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>LISTA DE ALUMNOS</Text>
            {marcados > 0 ? (
              <View style={styles.marcadosBadge}>
                <Text style={styles.marcadosText}>{marcados} MARCADOS</Text>
              </View>
            ) : (
              <Text style={styles.totalText}>{alumnosDelGrupo.length} total</Text>
            )}
          </View>

          {/* Student List */}
          {alumnosDelGrupo.length === 0 ? (
            <View style={styles.emptyCard}>
              <MaterialIcons name="group-off" size={40} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No hay alumnos en este grupo.</Text>
              <Text style={styles.emptySubtext}>Agrega alumnos desde el detalle del grupo.</Text>
            </View>
          ) : (
            alumnosDelGrupo.map((alumno) => renderAlumnoRow(alumno))
          )}

          {/* Spacer for bottom bar */}
          <View style={{ height: 120 }} />
        </WebScrollView>

        {/* Bottom Summary Bar */}
        <View style={styles.bottomBar}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <View style={[styles.summaryDot, { backgroundColor: COLORS.success }]} />
              <Text style={styles.summaryCount}>{presentes}</Text>
              <Text style={styles.summaryLabel}>PRESENTES</Text>
            </View>
            <View style={styles.summaryItem}>
              <View style={[styles.summaryDot, { backgroundColor: COLORS.warning }]} />
              <Text style={styles.summaryCount}>{retardos}</Text>
              <Text style={styles.summaryLabel}>RETARDOS</Text>
            </View>
            <View style={styles.summaryItem}>
              <View style={[styles.summaryDot, { backgroundColor: COLORS.danger }]} />
              <Text style={styles.summaryCount}>{faltas}</Text>
              <Text style={styles.summaryLabel}>FALTAS</Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              isSaving && styles.saveButtonDisabled,
              pressed && { opacity: 0.6 },
            ]}
            onPress={() => void handleGuardar()}
            disabled={isSaving}
          >
            <MaterialIcons name="check-circle" size={20} color={COLORS.surface} />
            <Text style={styles.saveButtonText}>
              {isSaving ? "Guardando..." : "Guardar Asistencia"}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },
  headerIconButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { color: COLORS.text, fontSize: 24, fontWeight: "800" },
  scrollContent: { flex: 1, paddingHorizontal: 16 },

  // Group card
  grupoCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  grupoLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  grupoName: { color: COLORS.text, fontSize: 20, fontWeight: "800" },
  grupoIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  // Date row
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  dateArrow: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  datePill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateText: { color: COLORS.text, fontSize: 16, fontWeight: "600" },
  cambiarText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  // List header
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  listTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  totalText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: "600" },
  marcadosBadge: {
    backgroundColor: COLORS.primaryTint,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  marcadosText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
  },

  // Student row
  alumnoRow: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  alumnoInfo: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  alumnoAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryTint,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: COLORS.primary, fontSize: 14, fontWeight: "800" },
  alumnoTextWrap: { flex: 1 },
  alumnoName: { color: COLORS.text, fontSize: 16, fontWeight: "700" },
  alumnoControl: { color: COLORS.textSecondary, fontSize: 13, marginTop: 1 },

  // Estado buttons
  estadoBtns: { flexDirection: "row", gap: 6 },
  estadoBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },
  estadoBtnPresente: { backgroundColor: COLORS.success },
  estadoBtnRetardo: { backgroundColor: COLORS.warning },
  estadoBtnFalta: { backgroundColor: COLORS.danger },

  // Empty state
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  emptyText: { color: COLORS.text, fontSize: 18, fontWeight: "700" },
  emptySubtext: { color: COLORS.textSecondary, fontSize: 14 },

  // Bottom bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 24,
    gap: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  summaryItem: { alignItems: "center", flexDirection: "row", gap: 4 },
  summaryDot: { width: 8, height: 8, borderRadius: 4 },
  summaryCount: { color: COLORS.text, fontSize: 18, fontWeight: "800" },
  summaryLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  saveButton: {
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: COLORS.surface, fontSize: 18, fontWeight: "800" },
});

export default RegistrarAsistenciaScreen;
