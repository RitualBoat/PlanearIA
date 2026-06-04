import React from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { RouteProp } from "@react-navigation/native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../../types";
import type { Alumno, EntregaTarea } from "../../../types";
import { useAlumnos } from "../../context/AlumnosContext";
import { useEntregables } from "../../context/EntregablesContext";
import type { RootStackParamList } from "../../navigation/StackNavigator";
import { CLASSROOM_STORAGE_KEYS } from "../../services/classroom/classroomStorage";

type Navigation = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "DetalleActividadClassroom">;

interface DraftCalificacion {
  calificacion: string;
  retroalimentacion: string;
}

const isEntregaCalificable = (entrega?: EntregaTarea): boolean =>
  Boolean(entrega && ["entregada", "tarde", "calificada"].includes(entrega.estado));

const formatDate = (value?: Date | string): string => {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Sin fecha";
  return date.toLocaleDateString();
};

const parseEntregas = (raw: string | null): EntregaTarea[] => {
  if (!raw) return [];
  const parsed = JSON.parse(raw) as unknown;
  return Array.isArray(parsed) ? (parsed as EntregaTarea[]) : [];
};

const DetalleActividadClassroomScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const { width } = useWindowDimensions();
  const { grupoId, tareaId } = route.params;
  const { alumnos } = useAlumnos();
  const { obtenerEntregablePorId, actualizarEntregable } = useEntregables();
  const tarea = obtenerEntregablePorId(tareaId);
  const alumnosGrupo = React.useMemo(
    () => alumnos.filter((alumno) => alumno.grupoId === grupoId),
    [alumnos, grupoId],
  );
  const [entregas, setEntregas] = React.useState<EntregaTarea[]>([]);
  const [drafts, setDrafts] = React.useState<Record<string, DraftCalificacion>>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState<number | null>(null);
  const isCompact = width < 820;

  const showMessage = React.useCallback((title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n\n${message}`);
      return;
    }
    Alert.alert(title, message);
  }, []);

  const reloadEntregas = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const raw = await AsyncStorage.getItem(CLASSROOM_STORAGE_KEYS.entregas);
      const data = parseEntregas(raw).filter((entrega) => entrega.tareaId === tareaId);
      setEntregas(data);
    } finally {
      setIsLoading(false);
    }
  }, [tareaId]);

  React.useEffect(() => {
    void reloadEntregas();
  }, [reloadEntregas]);

  React.useEffect(() => {
    const nextDrafts: Record<string, DraftCalificacion> = {};
    entregas.forEach((entrega) => {
      nextDrafts[String(entrega.alumnoId)] = {
        calificacion: entrega.calificacion != null ? String(entrega.calificacion) : "",
        retroalimentacion: entrega.retroalimentacion ?? "",
      };
    });
    setDrafts(nextDrafts);
  }, [entregas]);

  const entregasByAlumno = React.useMemo(() => {
    const map = new Map<number, EntregaTarea>();
    entregas.forEach((entrega) => {
      if (typeof entrega.alumnoId === "number") {
        map.set(entrega.alumnoId, entrega);
      }
    });
    return map;
  }, [entregas]);

  const totalEntregadas = React.useMemo(
    () => entregas.filter((entrega) => isEntregaCalificable(entrega)).length,
    [entregas],
  );

  const updateDraft = React.useCallback(
    (alumnoId: number, field: keyof DraftCalificacion, value: string) => {
      setDrafts((prev) => ({
        ...prev,
        [String(alumnoId)]: {
          calificacion: prev[String(alumnoId)]?.calificacion ?? "",
          retroalimentacion: prev[String(alumnoId)]?.retroalimentacion ?? "",
          [field]: value,
        },
      }));
    },
    [],
  );

  const handleGuardarCalificacion = React.useCallback(
    async (alumno: Alumno, entrega?: EntregaTarea) => {
      if (!tarea || !entrega || !isEntregaCalificable(entrega)) {
        showMessage("Entrega pendiente", "Solo puedes calificar cuando el alumno ya marco la actividad como entregada.");
        return;
      }

      const draft = drafts[String(alumno.id)] ?? { calificacion: "", retroalimentacion: "" };
      const calificacion = Number(draft.calificacion.replace(",", "."));
      const max = tarea.calificacionMaxima ?? tarea.valor ?? 100;

      if (!Number.isFinite(calificacion) || calificacion < 0 || calificacion > max) {
        showMessage("Calificacion invalida", `Ingresa una calificacion entre 0 y ${max}.`);
        return;
      }

      try {
        setIsSaving(alumno.id);
        const raw = await AsyncStorage.getItem(CLASSROOM_STORAGE_KEYS.entregas);
        const allEntregas = parseEntregas(raw);
        const next = allEntregas.map((item) => {
          if (String(item.id) !== String(entrega.id)) return item;
          return {
            ...item,
            calificacion,
            calificada: true,
            estado: "calificada" as const,
            retroalimentacion: draft.retroalimentacion.trim() || undefined,
          };
        });

        await AsyncStorage.setItem(CLASSROOM_STORAGE_KEYS.entregas, JSON.stringify(next));
        setEntregas(next.filter((item) => item.tareaId === tareaId));
        showMessage("Calificacion guardada", `La entrega de ${alumno.nombre} quedo calificada.`);
      } finally {
        setIsSaving(null);
      }
    },
    [drafts, showMessage, tarea, tareaId],
  );

  const handleFinalizarActividad = React.useCallback(() => {
    if (!tarea) return;
    const message = "La actividad se marcara como finalizada. Podras seguir revisando sus entregas desde esta pantalla.";
    const finish = async () => {
      await actualizarEntregable(tarea.id, { estado: "finalizada" });
      showMessage("Actividad finalizada", "El trabajo quedo cerrado en Classroom.");
    };

    if (Platform.OS === "web") {
      if (window.confirm(`Finalizar actividad\n\n${message}`)) void finish();
      return;
    }

    Alert.alert("Finalizar actividad", message, [
      { text: "Cancelar", style: "cancel" },
      { text: "Finalizar", onPress: () => void finish() },
    ]);
  }, [actualizarEntregable, showMessage, tarea]);

  if (!tarea) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerBox}>
          <MaterialIcons name="assignment-late" size={42} color={COLORS.primary} />
          <Text style={styles.emptyTitle}>No encontramos esta actividad</Text>
          <Text style={styles.emptyText}>Puede haberse eliminado o estar pendiente de recarga local.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.primaryButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroller}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={Platform.OS === "web"}
      >
        <View style={[styles.header, isCompact ? styles.headerCompact : null]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={22} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>Trabajo de clase</Text>
            <Text style={styles.title}>{tarea.titulo}</Text>
            <Text style={styles.subtitle}>
              {tarea.tipo} - Entrega: {formatDate(tarea.fechaEntrega)} - Valor: {tarea.calificacionMaxima ?? tarea.valor ?? 100}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() =>
              navigation.navigate("AgregarContenidoClassroom", {
                grupoId,
                kind: "actividad",
                modo: "editar",
                tareaId: tarea.id,
                unidadId: tarea.unidadId,
              })
            }
          >
            <MaterialIcons name="edit" size={18} color={COLORS.primary} />
            <Text style={styles.secondaryButtonText}>Editar</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.grid, isCompact ? styles.gridCompact : null]}>
          <View style={styles.mainColumn}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Instrucciones</Text>
              <Text style={styles.bodyText}>{tarea.instrucciones || tarea.descripcion || "Sin instrucciones."}</Text>
              {tarea.recursosNecesarios?.length ? (
                <View style={styles.resourceList}>
                  {tarea.recursosNecesarios.map((recurso, index) => (
                    <View key={`${recurso}-${index}`} style={styles.resourcePill}>
                      <MaterialIcons name="attachment" size={16} color={COLORS.primary} />
                      <Text style={styles.resourceText}>{recurso}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardTitle}>Entregas y calificaciones</Text>
                  <Text style={styles.cardSubtitle}>La calificacion solo se habilita si el alumno entrego.</Text>
                </View>
                {isLoading ? <ActivityIndicator color={COLORS.primary} /> : null}
              </View>

              {alumnosGrupo.length === 0 ? (
                <View style={styles.emptyInline}>
                  <MaterialIcons name="groups" size={28} color={COLORS.primary} />
                  <Text style={styles.emptyTitle}>No hay alumnos inscritos</Text>
                  <Text style={styles.emptyText}>Agrega alumnos desde la pestana Personas para recibir entregas.</Text>
                </View>
              ) : null}

              {alumnosGrupo.map((alumno) => {
                const entrega = entregasByAlumno.get(alumno.id);
                const canGrade = isEntregaCalificable(entrega);
                const draft = drafts[String(alumno.id)] ?? { calificacion: "", retroalimentacion: "" };

                return (
                  <View key={alumno.id} style={styles.submissionRow}>
                    <View style={styles.studentHeader}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{(alumno.nombre?.[0] ?? "A").toUpperCase()}</Text>
                      </View>
                      <View style={styles.studentCopy}>
                        <Text style={styles.studentName}>{`${alumno.nombre} ${alumno.apellidos}`.trim()}</Text>
                        <Text style={styles.studentMeta}>{entrega ? resolveEntregaLabel(entrega) : "Pendiente de entrega"}</Text>
                      </View>
                      <View style={[styles.statusBadge, canGrade ? styles.statusReady : styles.statusPending]}>
                        <Text style={[styles.statusText, canGrade ? styles.statusTextReady : styles.statusTextPending]}>
                          {canGrade ? "Entregado" : "Pendiente"}
                        </Text>
                      </View>
                    </View>

                    {entrega?.comentarioAlumno ? (
                      <Text style={styles.commentText}>Comentario del alumno: {entrega.comentarioAlumno}</Text>
                    ) : null}

                    {canGrade ? (
                      <View style={styles.gradeGrid}>
                        <View style={styles.inputGroup}>
                          <Text style={styles.label}>Calificacion</Text>
                          <TextInput
                            style={styles.input}
                            keyboardType="decimal-pad"
                            placeholder={`0-${tarea.calificacionMaxima ?? tarea.valor ?? 100}`}
                            placeholderTextColor="#94A3B8"
                            value={draft.calificacion}
                            onChangeText={(value) => updateDraft(alumno.id, "calificacion", value)}
                          />
                        </View>
                        <View style={[styles.inputGroup, styles.feedbackInput]}>
                          <Text style={styles.label}>Retroalimentacion</Text>
                          <TextInput
                            style={[styles.input, styles.textArea]}
                            multiline
                            placeholder="Comentario para el alumno"
                            placeholderTextColor="#94A3B8"
                            value={draft.retroalimentacion}
                            onChangeText={(value) => updateDraft(alumno.id, "retroalimentacion", value)}
                          />
                        </View>
                        <TouchableOpacity
                          style={[styles.saveButton, isSaving === alumno.id ? styles.buttonDisabled : null]}
                          disabled={isSaving === alumno.id}
                          onPress={() => void handleGuardarCalificacion(alumno, entrega)}
                        >
                          <MaterialIcons name="save" size={18} color="#FFFFFF" />
                          <Text style={styles.saveButtonText}>{isSaving === alumno.id ? "Guardando..." : "Guardar"}</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.lockedBox}>
                        <MaterialIcons name="lock-clock" size={18} color="#64748B" />
                        <Text style={styles.lockedText}>Aun no se puede calificar porque no existe entrega del alumno.</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>

          <View style={[styles.sideColumn, isCompact ? styles.sideColumnCompact : null]}>
            <View style={styles.sideCard}>
              <Text style={styles.sideLabel}>Resumen</Text>
              <Text style={styles.sideMetric}>{totalEntregadas}/{alumnosGrupo.length}</Text>
              <Text style={styles.sideText}>entregas recibidas</Text>
            </View>
            <View style={styles.sideCard}>
              <Text style={styles.sideLabel}>Estado</Text>
              <Text style={styles.sideText}>{tarea.estado}</Text>
              <TouchableOpacity style={styles.outlineButton} onPress={handleFinalizarActividad}>
                <Text style={styles.outlineButtonText}>Finalizar actividad</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

function resolveEntregaLabel(entrega: EntregaTarea): string {
  if (entrega.estado === "calificada") return `Calificada${entrega.calificacion != null ? ` - ${entrega.calificacion}` : ""}`;
  if (entrega.estado === "tarde") return `Entregada tarde - ${formatDate(entrega.fechaEntrega)}`;
  if (entrega.estado === "entregada") return `Entregada - ${formatDate(entrega.fechaEntrega)}`;
  return "Pendiente de entrega";
}

const webScrollStyle =
  Platform.OS === "web"
    ? ({ height: "100vh", maxHeight: "100vh", overflowY: "auto" } as object)
    : null;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  scroller: {
    flex: 1,
    ...webScrollStyle,
  },
  content: {
    alignSelf: "center",
    maxWidth: 1220,
    padding: 18,
    paddingBottom: Platform.OS === "web" ? 160 : 110,
    width: "100%",
  },
  centerBox: {
    alignItems: "center",
    flex: 1,
    gap: 10,
    justifyContent: "center",
    padding: 24,
  },
  header: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE8F5",
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    padding: 16,
  },
  headerCompact: {
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  backButton: {
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 16,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  headerCopy: {
    flex: 1,
  },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    color: "#122033",
    fontSize: 26,
    fontWeight: "900",
    marginTop: 4,
  },
  subtitle: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
  },
  grid: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 16,
    marginTop: 16,
  },
  gridCompact: {
    flexDirection: "column",
  },
  mainColumn: {
    flex: 1,
    gap: 16,
    minWidth: 0,
  },
  sideColumn: {
    gap: 12,
    width: 260,
  },
  sideColumnCompact: {
    width: "100%",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE8F5",
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  cardHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cardTitle: {
    color: "#122033",
    fontSize: 18,
    fontWeight: "900",
  },
  cardSubtitle: {
    color: "#64748B",
    fontSize: 13,
    marginTop: 3,
  },
  bodyText: {
    color: "#334155",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  resourceList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  resourcePill: {
    alignItems: "center",
    backgroundColor: "#EAF2FF",
    borderRadius: 999,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  resourceText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  submissionRow: {
    borderTopColor: "#E2E8F0",
    borderTopWidth: 1,
    paddingVertical: 16,
  },
  studentHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: "#DFF3E8",
    borderRadius: 999,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  avatarText: {
    color: "#1E7D4F",
    fontSize: 15,
    fontWeight: "900",
  },
  studentCopy: {
    flex: 1,
  },
  studentName: {
    color: "#122033",
    fontSize: 15,
    fontWeight: "900",
  },
  studentMeta: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusReady: {
    backgroundColor: "#DCFCE7",
  },
  statusPending: {
    backgroundColor: "#F1F5F9",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "900",
  },
  statusTextReady: {
    color: "#166534",
  },
  statusTextPending: {
    color: "#64748B",
  },
  commentText: {
    color: "#475569",
    fontSize: 13,
    marginTop: 10,
  },
  gradeGrid: {
    alignItems: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },
  inputGroup: {
    gap: 6,
    minWidth: 130,
  },
  feedbackInput: {
    flex: 1,
    minWidth: 260,
  },
  label: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "900",
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderColor: "#CBD5E1",
    borderRadius: 12,
    borderWidth: 1,
    color: "#122033",
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textArea: {
    minHeight: 78,
    textAlignVertical: "top",
  },
  saveButton: {
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    flexDirection: "row",
    gap: 7,
    marginTop: 19,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
  lockedBox: {
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    padding: 12,
  },
  lockedText: {
    color: "#64748B",
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
  },
  sideCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE8F5",
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  sideLabel: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  sideMetric: {
    color: "#122033",
    fontSize: 30,
    fontWeight: "900",
    marginTop: 6,
  },
  sideText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4,
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#EAF2FF",
    borderColor: "#CFE0F7",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  outlineButton: {
    borderColor: COLORS.primary,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  outlineButtonText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center",
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
  emptyInline: {
    alignItems: "center",
    gap: 8,
    padding: 18,
  },
  emptyTitle: {
    color: "#122033",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },
  emptyText: {
    color: "#64748B",
    fontSize: 14,
    textAlign: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default DetalleActividadClassroomScreen;
