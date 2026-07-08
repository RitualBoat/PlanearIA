import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RouteProp } from "@react-navigation/native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import WebScrollView from "../../components/WebScrollView";
import { useAlumnos } from "../../context/AlumnosContext";
import { useCalificaciones } from "../../context/CalificacionesContext";
import { useGrupos } from "../../hooks/useGrupos";
import { COLORS } from "../../../types";
import type { Alumno, Calificacion } from "../../../types";
import type { RootStackParamList } from "../../navigation/StackNavigator";

type Nav = StackNavigationProp<RootStackParamList, "CapturarCalificaciones">;
type Route = RouteProp<RootStackParamList, "CapturarCalificaciones">;

interface Props {
  navigation: Nav;
  route: Route;
}

type ParcialKey = "parcial1" | "parcial2" | "parcial3";

const PARCIALES = [
  { key: "parcial1" as ParcialKey, label: "1° PARCIAL" },
  { key: "parcial2" as ParcialKey, label: "2° PARCIAL" },
  { key: "parcial3" as ParcialKey, label: "3° PARCIAL" },
];

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

const getInitials = (alumno: Alumno): string => {
  const first = alumno.nombre?.charAt(0) ?? "";
  const last = alumno.apellidos?.charAt(0) ?? "";
  return `${first}${last}`.toUpperCase();
};

const buildCalificacionesInput = (
  alumnosDelGrupo: Alumno[],
  calificacionesMap: Record<number, Calificacion>,
  parcialActivo: ParcialKey
): Record<number, string> =>
  alumnosDelGrupo.reduce<Record<number, string>>((acc, alumno) => {
    const existing = calificacionesMap[alumno.id];
    const val = existing?.[parcialActivo];
    if (val !== undefined && val !== null) {
      acc[alumno.id] = String(val);
    }
    return acc;
  }, {});

const CapturarCalificacionesScreen: React.FC<Props> = ({ navigation, route }) => {
  const { grupoId } = route.params;
  const { grupos } = useGrupos();
  const { alumnos } = useAlumnos();
  const { registrarCalificacionesMasivas, obtenerCalificacionesPorGrupo, eliminarCalificacion } =
    useCalificaciones();

  const [parcialActivo, setParcialActivo] = useState<ParcialKey>("parcial1");
  const [calificacionesDrafts, setCalificacionesDrafts] = useState<
    Record<string, Record<number, string>>
  >({});
  const [isSaving, setIsSaving] = useState(false);

  const grupo = useMemo(() => grupos.find((g) => g.id === grupoId), [grupos, grupoId]);

  const alumnosDelGrupo = useMemo(
    () => alumnos.filter((a) => a.grupoId === grupoId && a.estado === "activo"),
    [alumnos, grupoId]
  );

  // Load existing calificaciones for this grupo
  const calificacionesExistentes = useMemo(
    () => obtenerCalificacionesPorGrupo(grupoId),
    [grupoId, obtenerCalificacionesPorGrupo]
  );

  // Build a map of alumnoId -> existing calificacion record
  const calificacionesMap = useMemo(() => {
    const map: Record<number, Calificacion> = {};
    calificacionesExistentes.forEach((c) => {
      map[c.alumnoId] = c;
    });
    return map;
  }, [calificacionesExistentes]);

  const inputSourceKey = useMemo(
    () =>
      JSON.stringify([
        grupoId,
        parcialActivo,
        alumnosDelGrupo.map((alumno) => alumno.id).sort((a, b) => a - b),
        calificacionesExistentes
          .map((c) => [c.id, c.alumnoId, c[parcialActivo]])
          .sort((a, b) => Number(a[0]) - Number(b[0])),
      ]),
    [alumnosDelGrupo, calificacionesExistentes, grupoId, parcialActivo]
  );
  const loadedCalificacionesInput = useMemo(
    () => buildCalificacionesInput(alumnosDelGrupo, calificacionesMap, parcialActivo),
    [alumnosDelGrupo, calificacionesMap, parcialActivo]
  );
  const calificacionesInput = calificacionesDrafts[inputSourceKey] ?? loadedCalificacionesInput;

  const updateCalificacion = useCallback(
    (alumnoId: number, value: string) => {
      // Allow empty, digits, and one decimal point
      if (value !== "" && !/^\d{0,3}(\.\d{0,1})?$/.test(value)) return;
      setCalificacionesDrafts((prev) => ({
        ...prev,
        [inputSourceKey]: {
          ...(prev[inputSourceKey] ?? loadedCalificacionesInput),
          [alumnoId]: value,
        },
      }));
    },
    [inputSourceKey, loadedCalificacionesInput]
  );

  const getCalificacionValue = useCallback(
    (alumnoId: number): string => calificacionesInput[alumnoId] ?? "",
    [calificacionesInput]
  );

  const getCalificacionNumeric = useCallback(
    (alumnoId: number): number | undefined => {
      const val = calificacionesInput[alumnoId];
      if (!val || val === "") return undefined;
      const num = parseFloat(val);
      return isNaN(num) ? undefined : num;
    },
    [calificacionesInput]
  );

  // Stats
  const stats = useMemo(() => {
    let total = 0;
    let count = 0;
    alumnosDelGrupo.forEach((a) => {
      const val = getCalificacionNumeric(a.id);
      if (val !== undefined) {
        total += val;
        count++;
      }
    });
    return {
      promedio: count > 0 ? (total / count).toFixed(1) : "--",
      calificados: count,
      totalAlumnos: alumnosDelGrupo.length,
    };
  }, [alumnosDelGrupo, getCalificacionNumeric]);

  const handleGuardar = useCallback(async () => {
    const registros: (Omit<Calificacion, "id"> & { id?: number })[] = [];

    alumnosDelGrupo.forEach((alumno) => {
      const val = getCalificacionNumeric(alumno.id);
      const existing = calificacionesMap[alumno.id];

      // Build the calificacion record merging existing data
      const parcialData: Record<string, number | undefined> = {};
      PARCIALES.forEach((p) => {
        if (p.key === parcialActivo) {
          parcialData[p.key] = val;
        } else if (existing) {
          parcialData[p.key] = existing[p.key] as number | undefined;
        }
      });

      const p1 = parcialData.parcial1;
      const p2 = parcialData.parcial2;
      const p3 = parcialData.parcial3;

      const definedParciales = [p1, p2, p3].filter((v) => v !== undefined) as number[];
      const promedio =
        definedParciales.length > 0
          ? definedParciales.reduce((a, b) => a + b, 0) / definedParciales.length
          : 0;

      let estado: "aprobado" | "reprobado" | "pendiente" = "pendiente";
      if (p1 !== undefined && p2 !== undefined && p3 !== undefined) {
        estado = promedio >= 60 ? "aprobado" : "reprobado";
      }

      registros.push({
        id: existing?.id,
        alumnoId: alumno.id,
        grupoId,
        periodo: grupo?.periodo ?? "",
        parcial1: parcialData.parcial1,
        parcial2: parcialData.parcial2,
        parcial3: parcialData.parcial3,
        promedio: Math.round(promedio * 10) / 10,
        estado,
        fechaRegistro: new Date(),
      });
    });

    if (registros.length === 0) {
      Alert.alert("Sin datos", "No hay alumnos en este grupo para calificar.");
      return;
    }

    setIsSaving(true);
    try {
      const { syncOk } = await registrarCalificacionesMasivas(registros);
      const syncMsg = syncOk ? "" : "\n(Sin conexión, se guardó localmente)";
      Alert.alert(
        "Calificaciones guardadas",
        `Se registraron ${stats.calificados} calificaciones del ${PARCIALES.find((p) => p.key === parcialActivo)?.label}.${syncMsg}`
      );
      navigation.goBack();
    } catch {
      Alert.alert("Error", "No se pudieron guardar las calificaciones.");
    } finally {
      setIsSaving(false);
    }
  }, [
    alumnosDelGrupo,
    getCalificacionNumeric,
    calificacionesMap,
    parcialActivo,
    grupoId,
    grupo,
    registrarCalificacionesMasivas,
    stats.calificados,
    navigation,
  ]);

  const handleEliminar = useCallback(() => {
    const existentesIds = alumnosDelGrupo
      .map((a) => calificacionesMap[a.id]?.id)
      .filter((id): id is number => id !== undefined);

    if (existentesIds.length === 0) {
      Alert.alert("Sin datos", "No hay calificaciones registradas para eliminar.");
      return;
    }

    Alert.alert(
      "Eliminar calificaciones",
      `¿Eliminar todas las calificaciones de este grupo? (${existentesIds.length} registros)`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            await Promise.all(existentesIds.map((id) => eliminarCalificacion(id)));
            setCalificacionesDrafts((prev) => ({ ...prev, [inputSourceKey]: {} }));
            Alert.alert("Eliminado", "Se eliminaron las calificaciones del grupo.");
          },
        },
      ]
    );
  }, [alumnosDelGrupo, calificacionesMap, eliminarCalificacion, inputSourceKey]);

  const getGradeColor = (alumnoId: number) => {
    const val = getCalificacionNumeric(alumnoId);
    if (val === undefined) return COLORS.border;
    return val >= 60 ? "#27AE60" : "#E74C3C";
  };

  // ─── RENDER ───
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
        <Text style={styles.headerTitle}>Registro de Calificaciones</Text>
        <Pressable
          onPress={handleEliminar}
          style={({ pressed }) => [styles.trashButton, pressed && { opacity: 0.6 }]}
        >
          <MaterialIcons name="delete-outline" size={24} color="white" />
        </Pressable>
      </View>

      <WebScrollView style={styles.scrollView}>
        {/* Group Card */}
        <View style={styles.grupoCard}>
          <View style={styles.grupoCardHeader}>
            <View style={styles.grupoLabelBadge}>
              <Text style={styles.grupoLabelText}>GRUPO ACADÉMICO</Text>
            </View>
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

        {/* Parcial Selector */}
        <View style={styles.parcialSection}>
          <View style={styles.parcialHeaderRow}>
            <Text style={styles.parcialLabel}>PERIODO DE EVALUACIÓN</Text>
            <View style={styles.activoBadge}>
              <Text style={styles.activoBadgeText}>Activo</Text>
            </View>
          </View>
          <View style={styles.parcialSelector}>
            {PARCIALES.map((p) => (
              <Pressable
                key={p.key}
                style={({ pressed }) => [
                  styles.parcialPill,
                  parcialActivo === p.key && styles.parcialPillActive,
                  pressed && { opacity: 0.6 },
                ]}
                onPress={() => setParcialActivo(p.key)}
              >
                <Text
                  style={[
                    styles.parcialPillText,
                    parcialActivo === p.key && styles.parcialPillTextActive,
                  ]}
                >
                  {p.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Student List or Empty State */}
        {alumnosDelGrupo.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <MaterialIcons name="format-list-numbered" size={40} color={COLORS.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>Sin alumnos en este grupo</Text>
            <Text style={styles.emptySubtitle}>
              Agrega alumnos al grupo para poder registrar sus calificaciones
            </Text>
            <Pressable
              style={({ pressed }) => [styles.emptyButton, pressed && { opacity: 0.6 }]}
              onPress={() =>
                navigation.navigate("DetalleGrupo", {
                  grupoId,
                  grupoNombre: grupo?.nombre ?? "Grupo",
                })
              }
            >
              <MaterialIcons name="people" size={18} color={COLORS.primary} />
              <Text style={styles.emptyButtonText}>Ir a Gestión de Alumnos</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.studentList}>
            {alumnosDelGrupo.map((alumno, index) => (
              <View key={alumno.id} style={styles.studentRow}>
                {/* Avatar */}
                <View style={[styles.avatar, { backgroundColor: getAvatarColor(index) }]}>
                  <Text style={styles.avatarText}>{getInitials(alumno)}</Text>
                </View>

                {/* Info */}
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName} numberOfLines={1}>
                    {alumno.nombre} {alumno.apellidos}
                  </Text>
                  <Text style={styles.studentNC}>NC: {alumno.numeroControl}</Text>
                </View>

                {/* Grade Input */}
                <View
                  style={[styles.gradeInputContainer, { borderColor: getGradeColor(alumno.id) }]}
                >
                  <TextInput
                    style={styles.gradeInput}
                    value={getCalificacionValue(alumno.id)}
                    onChangeText={(text) => updateCalificacion(alumno.id, text)}
                    keyboardType="numeric"
                    maxLength={5}
                    placeholder="--"
                    placeholderTextColor={COLORS.textSecondary}
                    textAlign="center"
                  />
                </View>
              </View>
            ))}
          </View>
        )}
      </WebScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomStats}>
          <Text style={styles.bottomPromedioLabel}>PROMEDIO GRUPAL</Text>
          <Text style={styles.bottomPromedioValue}>{stats.promedio}</Text>
        </View>
        <View style={styles.bottomRight}>
          <View style={styles.calificadosBadge}>
            <Text style={styles.calificadosText}>
              {stats.calificados}/{stats.totalAlumnos} calificados
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.guardarButton,
              isSaving && styles.guardarButtonDisabled,
              pressed && { opacity: 0.6 },
            ]}
            onPress={handleGuardar}
            disabled={isSaving}
          >
            <MaterialIcons name="save" size={18} color="white" />
            <Text style={styles.guardarButtonText}>
              {isSaving ? "Guardando..." : "Guardar Calificaciones"}
            </Text>
          </Pressable>
        </View>
      </View>
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
  trashButton: {
    padding: 4,
    marginLeft: 8,
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
  grupoCardHeader: {
    flexDirection: "row",
    marginBottom: 8,
  },
  grupoLabelBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
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
  // Parcial Selector
  parcialSection: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  parcialHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  parcialLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  activoBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  activoBadgeText: {
    color: "#27AE60",
    fontSize: 11,
    fontWeight: "600",
  },
  parcialSelector: {
    flexDirection: "row",
    backgroundColor: "#E8EDF2",
    borderRadius: 12,
    padding: 4,
  },
  parcialPill: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  parcialPillActive: {
    backgroundColor: "white",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: { elevation: 2 },
    }),
  },
  parcialPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  parcialPillTextActive: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E8EDF2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  emptyButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  // Student List
  studentList: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
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
  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F2F5",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  studentInfo: {
    flex: 1,
    marginRight: 12,
  },
  studentName: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 2,
  },
  studentNC: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  gradeInputContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2.5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  gradeInput: {
    width: 50,
    height: 50,
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    padding: 0,
  },
  // Bottom Bar
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E8EDF2",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: { elevation: 8 },
    }),
  },
  bottomStats: {
    marginRight: 16,
  },
  bottomPromedioLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  bottomPromedioValue: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.primary,
  },
  bottomRight: {
    flex: 1,
    alignItems: "flex-end",
    gap: 6,
  },
  calificadosBadge: {
    backgroundColor: "#E8F0FE",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  calificadosText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.primary,
  },
  guardarButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  guardarButtonDisabled: {
    opacity: 0.6,
  },
  guardarButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
  },
});

export default CapturarCalificacionesScreen;
