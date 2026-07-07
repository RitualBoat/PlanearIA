import React from "react";
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Modal,
  ActivityIndicator,
  TextInput,
  Alert,
  Platform,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { COLORS, FONT_SIZES } from "../../../types";
import type {
  Alumno,
  Asistencia,
  Calificacion,
  EntregaTarea,
  Recurso,
  Tarea,
  GrupoMiembro,
  RolGrupo,
} from "../../../types";
import WebScrollView from "../../components/WebScrollView";
import ScreenBackButton from "../../components/ScreenBackButton";
import CarreraSelector from "../../components/CarreraSelector";
import { useDetalleGrupoViewModel, TabType } from "../../hooks/useDetalleGrupoViewModel";
import { calcularEstadisticasGrupo } from "../../services/grupoReportesService";
import StatCard from "../../components/StatCard";
import TrendMiniChart from "../../components/TrendMiniChart";
import DeliveryDistributionMini from "../../components/DeliveryDistributionMini";
import { ColaboradorListItem } from "../../components/grupos/ColaboradorListItem";
import { ModalInvitacionColaborador } from "../../components/grupos/ModalInvitacionColaborador";
import { MenuContextualColaborador } from "../../components/grupos/MenuContextualColaborador";

const getLastRefreshText = (lastRefreshAt: Date | null): string => {
  if (!lastRefreshAt) return "Actualizado recientemente";
  const diffMs = Date.now() - new Date(lastRefreshAt).getTime();
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000));
  if (diffMinutes < 60) return `Actualizado hace ${diffMinutes} min`;
  const hours = Math.round(diffMinutes / 60);
  return `Actualizado hace ${hours} h`;
};

/**
 * Componente que renderiza el contenido según la pestaña activa
 */
const TabContent: React.FC<{
  activeTab: TabType;
  alumnos: Alumno[];
  tareas: Tarea[];
  recursos: Recurso[];
  asistencias: Asistencia[];
  calificaciones: Calificacion[];
  entregas: EntregaTarea[];
  lastDataRefreshAt: Date | null;
  grupoNotas: string;
  notasUltimaEdicion: string;
  notasEstado: "sin-cambios" | "cambios-sin-guardar" | "guardando" | "guardado" | "error";
  notasError: string;
  miembros: GrupoMiembro[];
  chartWidth: number;
  openAddStudentsModal: () => void;
  openRemoveStudentModal: (student: {
    id: number;
    nombre: string;
    apellidos: string;
    numeroControl: string;
  }) => void;
  openInvitacionModal: () => void;
  openContextualMenu: (miembro: GrupoMiembro) => void;
  navigateCrearTarea: () => void;
  navigateAsignarRecurso: () => void;
  navigateAsignarDeBiblioteca: () => void;
  navigateDetalleTarea: (tareaId: number) => void;
  navigateReportesGrupo: () => void;
  navigateRegistrarAsistencia: () => void;
  navigateHistorialAsistencia: () => void;
  navigateCapturarCalificaciones: () => void;
  navigatePromediosCalificaciones: () => void;
  setGrupoNotas: (value: string) => void;
  guardarNotasGrupo: () => Promise<void>;
  descartarCambiosNotas: () => void;
}> = React.memo(
  ({
    activeTab,
    alumnos,
    tareas,
    recursos,
    asistencias,
    calificaciones,
    entregas,
    lastDataRefreshAt,
    grupoNotas,
    notasUltimaEdicion,
    notasEstado,
    notasError,
    miembros,
    chartWidth,
    openAddStudentsModal,
    openRemoveStudentModal,
    openInvitacionModal,
    openContextualMenu,
    navigateCrearTarea,
    navigateAsignarRecurso,
    navigateAsignarDeBiblioteca,
    navigateDetalleTarea,
    navigateReportesGrupo,
    navigateRegistrarAsistencia,
    navigateHistorialAsistencia,
    navigateCapturarCalificaciones,
    navigatePromediosCalificaciones,
    setGrupoNotas,
    guardarNotasGrupo,
    descartarCambiosNotas,
  }) => {
    switch (activeTab) {
      case "alumnos":
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Lista de Alumnos</Text>
            <Text style={styles.tabDescription}>Alumnos vinculados al grupo seleccionado.</Text>
            <Pressable
              style={({ pressed }) => [styles.actionButton, pressed && { opacity: 0.6 }]}
              onPress={openAddStudentsModal}
            >
              <MaterialIcons name="person-add" size={24} color="white" />
              <Text style={styles.actionButtonText}>Agregar Alumno</Text>
            </Pressable>

            <View style={styles.listaContainer}>
              {alumnos.length === 0 ? (
                <Text style={styles.emptyText}>No hay alumnos vinculados a este grupo.</Text>
              ) : (
                alumnos.map((alumno) => (
                  <View key={String(alumno.id)} style={styles.alumnoItem}>
                    <MaterialIcons name="account-circle" size={40} color={COLORS.primary} />
                    <View style={styles.alumnoInfo}>
                      <Text
                        style={styles.alumnoNombre}
                      >{`${alumno.nombre} ${alumno.apellidos}`}</Text>
                      <Text style={styles.alumnoControl}>ID: {alumno.numeroControl}</Text>
                    </View>
                    <Pressable
                      style={({ pressed }) => [
                        styles.removeAlumnoButton,
                        pressed && { opacity: 0.6 },
                      ]}
                      onPress={() => openRemoveStudentModal(alumno)}
                    >
                      <MaterialIcons name="person-remove" size={16} color={COLORS.error} />
                      <Text style={styles.removeAlumnoButtonText}>Quitar</Text>
                    </Pressable>
                  </View>
                ))
              )}
            </View>
          </View>
        );

      case "calificaciones":
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Calificaciones del Grupo</Text>
            <Text style={styles.tabDescription}>
              Registra y consulta las calificaciones de tus alumnos
            </Text>
            <Pressable
              style={({ pressed }) => [styles.actionButton, pressed && { opacity: 0.6 }]}
              onPress={navigateCapturarCalificaciones}
            >
              <MaterialIcons name="edit-note" size={24} color="white" />
              <Text style={styles.actionButtonText}>Registrar Calificaciones</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                { backgroundColor: COLORS.primaryDark, marginTop: 8 },
                pressed && { opacity: 0.6 },
              ]}
              onPress={navigatePromediosCalificaciones}
            >
              <MaterialIcons name="bar-chart" size={24} color="white" />
              <Text style={styles.actionButtonText}>Ver Promedios</Text>
            </Pressable>

            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {calificaciones.length > 0
                    ? (
                        calificaciones.reduce((acc, item) => acc + Number(item.promedio || 0), 0) /
                        calificaciones.length
                      ).toFixed(1)
                    : "0.0"}
                </Text>
                <Text style={styles.statLabel}>Promedio Grupal</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {calificaciones.length > 0
                    ? `${Math.round(
                        (calificaciones.filter((c) => c.estado === "aprobado").length /
                          calificaciones.length) *
                          100
                      )}%`
                    : "0%"}
                </Text>
                <Text style={styles.statLabel}>Aprobación</Text>
              </View>
            </View>
          </View>
        );

      case "asistencias":
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Control de Asistencias</Text>
            <Text style={styles.tabDescription}>
              Lleva el registro de asistencia de tus alumnos
            </Text>
            <Pressable
              style={({ pressed }) => [styles.actionButton, pressed && { opacity: 0.6 }]}
              onPress={navigateRegistrarAsistencia}
            >
              <MaterialIcons name="checklist" size={24} color="white" />
              <Text style={styles.actionButtonText}>Pasar Lista</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                { backgroundColor: COLORS.primaryDark, marginTop: 8 },
                pressed && { opacity: 0.6 },
              ]}
              onPress={navigateHistorialAsistencia}
            >
              <MaterialIcons name="history" size={24} color="white" />
              <Text style={styles.actionButtonText}>Ver Historial</Text>
            </Pressable>

            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {asistencias.length > 0
                    ? `${Math.round(
                        (asistencias.filter((a) => a.estado === "presente").length /
                          asistencias.length) *
                          100
                      )}%`
                    : "0%"}
                </Text>
                <Text style={styles.statLabel}>Asistencia Promedio</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {asistencias.filter((a) => a.estado === "retardo").length}
                </Text>
                <Text style={styles.statLabel}>Retardos Hoy</Text>
              </View>
            </View>
          </View>
        );

      case "recursos":
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Recursos Asignados</Text>
            <Text style={styles.tabDescription}>Recursos asociados al grupo seleccionado.</Text>
            <View style={styles.actionButtonsRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.actionButtonHalf,
                  pressed && { opacity: 0.6 },
                ]}
                onPress={navigateAsignarRecurso}
              >
                <MaterialIcons name="file-copy" size={24} color="white" />
                <Text style={styles.actionButtonText}>Pantalla Asignar</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.actionButtonHalf,
                  styles.actionButtonSecondary,
                  pressed && { opacity: 0.6 },
                ]}
                onPress={navigateAsignarDeBiblioteca}
              >
                <MaterialIcons name="library-books" size={24} color="white" />
                <Text style={styles.actionButtonText}>De Biblioteca</Text>
              </Pressable>
            </View>

            <View style={styles.listaContainer}>
              <Text style={styles.sectionTitle}>Recursos del grupo</Text>
              {recursos.length === 0 ? (
                <Text style={styles.emptyText}>Este grupo aún no tiene recursos asignados.</Text>
              ) : (
                recursos.map((recurso) => (
                  <View key={String(recurso.id)} style={styles.comentarioItem}>
                    <Text style={styles.comentarioAlumno}>{recurso.titulo}</Text>
                    <Text style={styles.comentarioTexto}>Tipo: {recurso.tipo}</Text>
                  </View>
                ))
              )}
            </View>
          </View>
        );

      case "tareas":
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Tareas y Exámenes</Text>
            <Text style={styles.tabDescription}>
              Gestiona las tareas, exámenes y proyectos del grupo
            </Text>

            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{tareas.length}</Text>
                <Text style={styles.statLabel}>Entregado</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>--</Text>
                <Text style={styles.statLabel}>Promedio</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{tareas.length}</Text>
                <Text style={styles.statLabel}>Pendientes</Text>
              </View>
            </View>

            {/* Botones de acción */}
            <View style={styles.actionButtonsRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.actionButtonHalf,
                  pressed && { opacity: 0.6 },
                ]}
                onPress={navigateCrearTarea}
              >
                <MaterialIcons name="add" size={20} color="white" />
                <Text style={styles.actionButtonText}>Nueva Tarea</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.actionButtonHalf,
                  styles.actionButtonSecondary,
                  pressed && { opacity: 0.6 },
                ]}
                onPress={navigateAsignarRecurso}
              >
                <MaterialIcons name="file-copy" size={20} color="white" />
                <Text style={styles.actionButtonText}>Asignar Examen</Text>
              </Pressable>
            </View>

            <View style={styles.listaContainer}>
              <Text style={styles.sectionTitle}>Tareas Activas</Text>
              {tareas.length === 0 ? (
                <Text style={styles.emptyText}>No hay tareas asignadas a este grupo.</Text>
              ) : (
                tareas.map((tarea) => (
                  <Pressable
                    key={String(tarea.id)}
                    style={({ pressed }) => [styles.tareaItem, pressed && { opacity: 0.6 }]}
                    onPress={() => navigateDetalleTarea(tarea.id)}
                  >
                    <View style={styles.tareaHeader}>
                      <MaterialIcons name="assignment" size={24} color={COLORS.warning} />
                      <View style={styles.tareaInfo}>
                        <Text style={styles.tareaTitulo}>{tarea.titulo}</Text>
                        <Text style={styles.tareaMetadata}>
                          Entrega: {new Date(tarea.fechaEntrega).toLocaleDateString()} | Valor:{" "}
                          {tarea.valor}
                          pts
                        </Text>
                      </View>
                      <MaterialIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
                    </View>
                  </Pressable>
                ))
              )}
            </View>
          </View>
        );

      case "graficas": {
        const stats = calcularEstadisticasGrupo({
          alumnos,
          calificaciones,
          asistencias,
          tareas,
          entregas,
        });
        const completionRatio = tareas.length === 0 ? 0 : (entregas.length / tareas.length) * 100;
        const avgRaw = Math.max(0, Math.min(100, stats.promedioGeneral * 10));
        const summaryTrend =
          stats.indiceAprobacion >= 80
            ? "Rendimiento sólido en las últimas semanas"
            : "Conviene reforzar seguimiento académico";

        return (
          <View style={styles.tabContent}>
            <View style={styles.statsHeaderRow}>
              <View>
                <Text style={styles.tabTitle}>Estadísticas del Grupo</Text>
                <Text style={styles.tabDescription}>Seguimiento académico en tiempo real</Text>
              </View>
              <Text style={styles.updatedAtText}>{getLastRefreshText(lastDataRefreshAt)}</Text>
            </View>

            <View style={styles.statsCardsRow}>
              <StatCard
                label="PROMEDIO"
                value={stats.promedioGeneral.toFixed(1)}
                accentColor={COLORS.primary}
                trend={stats.promedioGeneral >= 8 ? "up" : "flat"}
                footerText="Meta: 8.0"
              />
              <StatCard
                label="ASISTENCIA"
                value={`${Math.round(stats.indiceAsistencia)}%`}
                accentColor="#0FA878"
                trend={stats.indiceAsistencia >= 85 ? "up" : "down"}
                footerText="Objetivo: 85%"
              />
            </View>

            <View style={styles.statsCardsRow}>
              <StatCard
                label="APROBACIÓN"
                value={`${Math.round(stats.indiceAprobacion)}%`}
                accentColor="#5C6AC4"
                trend={stats.indiceAprobacion >= 80 ? "up" : "flat"}
                footerText={`${Math.round(stats.indiceReprobacion)}% reprobación`}
              />
              <StatCard
                label="ENTREGAS"
                value={`${Math.round(stats.indiceEntregasATiempo)}%`}
                accentColor={COLORS.warning}
                trend={stats.indiceEntregasATiempo >= 70 ? "up" : "down"}
                footerText={`${Math.round(completionRatio)}% avance`}
              />
            </View>

            <View style={styles.miniChartsSection}>
              <TrendMiniChart
                title="Evolución del promedio"
                subtitle={`${stats.promedioGeneral.toFixed(1)} / 10 actual`}
                color={COLORS.primary}
                bars={[
                  Math.max(10, avgRaw - 10),
                  Math.max(10, avgRaw - 7),
                  Math.max(10, avgRaw - 4),
                  Math.max(10, avgRaw - 2),
                  avgRaw,
                ]}
              />
              <TrendMiniChart
                title="Cumplimiento de tareas"
                subtitle={`${Math.round(stats.indiceEntregasATiempo)}% a tiempo`}
                color={COLORS.warning}
                bars={[
                  Math.max(10, stats.indiceEntregasATiempo - 20),
                  Math.max(10, stats.indiceEntregasATiempo - 14),
                  Math.max(10, stats.indiceEntregasATiempo - 9),
                  Math.max(10, stats.indiceEntregasATiempo - 5),
                  Math.max(10, stats.indiceEntregasATiempo),
                ]}
              />
            </View>

            <DeliveryDistributionMini
              onTime={stats.indiceEntregasATiempo}
              late={stats.indiceEntregasTarde}
              missing={stats.indiceNoEntregadas}
              chartWidth={chartWidth}
            />

            <View style={styles.insightCard}>
              <MaterialIcons name="lightbulb-outline" size={18} color="#8A6C10" />
              <Text style={styles.insightText}>{summaryTrend}</Text>
            </View>

            <View style={styles.openReportButtonContainer}>
              <Pressable
                style={({ pressed }) => [styles.openReportButton, pressed && { opacity: 0.6 }]}
                onPress={navigateReportesGrupo}
              >
                <MaterialIcons name="insights" size={18} color={COLORS.surface} />
                <Text style={styles.openReportButtonText}>Abrir reporte completo</Text>
              </Pressable>
            </View>
          </View>
        );
      }

      case "notas":
        return (
          <View style={styles.tabContent}>
            <View style={styles.notesSuggestionCard}>
              <MaterialIcons name="lightbulb-outline" size={20} color="#1467B8" />
              <View style={{ flex: 1 }}>
                <Text style={styles.notesSuggestionTitle}>Sugerencia pedagógica</Text>
                <Text style={styles.notesSuggestionText}>
                  Considera anotar acuerdos de seguimiento y pendientes de la próxima sesión.
                </Text>
              </View>
            </View>

            <View style={styles.notesCard}>
              <View style={styles.notesHeaderRow}>
                <View>
                  <Text style={styles.tabTitle}>Notas personales</Text>
                  <View style={styles.notesPrivateRow}>
                    <MaterialIcons name="lock-outline" size={14} color={COLORS.textTertiary} />
                    <Text style={styles.notesPrivateText}>Solo visible para ti</Text>
                  </View>
                </View>
                <View style={styles.notesPrivateBadge}>
                  <Text style={styles.notesPrivateBadgeText}>Modo privado</Text>
                </View>
              </View>

              <TextInput
                value={grupoNotas}
                onChangeText={setGrupoNotas}
                multiline
                textAlignVertical="top"
                placeholder="Escribe observaciones del grupo, acuerdos, pendientes o contexto relevante..."
                placeholderTextColor="#A0ADBF"
                style={styles.notesInput}
              />

              <View style={styles.notesMetaRow}>
                <View style={styles.notesStatusRow}>
                  <View
                    style={[
                      styles.notesStatusDot,
                      notasEstado === "cambios-sin-guardar"
                        ? styles.notesStatusDotWarning
                        : notasEstado === "guardado"
                          ? styles.notesStatusDotSuccess
                          : notasEstado === "error"
                            ? styles.notesStatusDotError
                            : styles.notesStatusDotNeutral,
                    ]}
                  />
                  <Text style={styles.notesStatusText}>
                    {notasEstado === "guardando"
                      ? "Guardando..."
                      : notasEstado === "cambios-sin-guardar"
                        ? "Cambios sin guardar"
                        : notasEstado === "guardado"
                          ? "Guardado"
                          : notasEstado === "error"
                            ? "Error al guardar"
                            : "Sin cambios"}
                  </Text>
                </View>
                <Text style={styles.notesTimestamp}>Última edición: {notasUltimaEdicion}</Text>
              </View>

              {notasError ? <Text style={styles.notesErrorText}>{notasError}</Text> : null}

              <View style={styles.notesActionsRow}>
                {notasEstado === "cambios-sin-guardar" ? (
                  <Pressable
                    style={({ pressed }) => [
                      styles.notesDiscardButton,
                      pressed && { opacity: 0.6 },
                    ]}
                    onPress={descartarCambiosNotas}
                  >
                    <Text style={styles.notesDiscardButtonText}>Descartar cambios</Text>
                  </Pressable>
                ) : null}

                <Pressable
                  style={({ pressed }) => [
                    styles.notesSaveButton,
                    notasEstado !== "cambios-sin-guardar" && styles.notesSaveButtonDisabled,
                    pressed && { opacity: 0.6 },
                  ]}
                  onPress={() => void guardarNotasGrupo()}
                  disabled={notasEstado !== "cambios-sin-guardar"}
                >
                  <Text style={styles.notesSaveButtonText}>
                    {notasEstado === "guardando" ? "Guardando..." : "Guardar notas"}
                  </Text>
                </Pressable>
              </View>
            </View>

            <Text style={styles.notesFooterText}>
              Estas notas se guardan localmente y se sincronizan con tu nube docente para acceso
              offline.
            </Text>
          </View>
        );

      case "colaboradores":
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Colaboradores</Text>
            <Text style={styles.tabDescription}>
              Gestiona los docentes y asistentes con acceso a la planificación de este grupo.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.actionButton, pressed && { opacity: 0.6 }]}
              onPress={openInvitacionModal}
            >
              <MaterialIcons name="person-add" size={24} color="white" />
              <Text style={styles.actionButtonText}>Invitar Docente</Text>
            </Pressable>

            <View style={styles.listaContainer}>
              {miembros.length === 0 ? (
                <Text style={styles.emptyText}>No hay colaboradores asignados a este grupo.</Text>
              ) : (
                miembros.map((miembro) => (
                  <ColaboradorListItem
                    key={miembro.usuarioId}
                    miembro={miembro}
                    onMenuPress={() => openContextualMenu(miembro)}
                  />
                ))
              )}
            </View>
          </View>
        );

      default:
        return null;
    }
  }
);

/**
 * Pantalla de Detalle de Grupo (View)
 * Solo JSX y StyleSheet - la logica vive en useDetalleGrupoViewModel
 */
const DetalleGrupoScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const chartWidth = Math.max(280, Math.min(width - 56, 620));

  const {
    grupoId,
    grupoNombre,
    cantidadAlumnos,
    isLoadingData,
    loadError,
    alumnos,
    tareas,
    recursos,
    asistencias,
    calificaciones,
    entregas,
    lastDataRefreshAt,
    grupoNotas,
    notasUltimaEdicion,
    notasEstado,
    notasError,
    miembros,
    invitacionModalVisible,
    contextualMenuVisible,
    colaboradorSeleccionado,
    openInvitacionModal,
    closeInvitacionModal,
    openContextualMenu,
    closeContextualMenu,
    invitarDocente,
    cambiarRolColaborador,
    eliminarColaborador,
    addStudentsModalVisible,
    createStudentMode,
    studentSearchQuery,
    selectedStudentIds,
    availableStudents,
    isLinkingStudents,
    addStudentsError,
    addStudentsSuccessVisible,
    createdAndAddedCount,
    newStudentNombre,
    newStudentApellidos,
    newStudentNumeroControl,
    newStudentCarrera,
    setStudentSearchQuery,
    openAddStudentsModal,
    closeAddStudentsModal,
    openCreateStudentMode,
    closeCreateStudentMode,
    toggleStudentSelection,
    confirmAddSelectedStudents,
    setNewStudentNombre,
    setNewStudentApellidos,
    setNewStudentNumeroControl,
    setNewStudentCarrera,
    createAndAddStudent,
    closeAddStudentsSuccess,
    removeStudentModalVisible,
    studentToRemove,
    isUnlinkingStudent,
    removeStudentError,
    openRemoveStudentModal,
    closeRemoveStudentModal,
    confirmRemoveStudentFromGroup,
    deleteModalVisible,
    deleteConfirmed,
    isDeleting,
    deleteError,
    activeTab,
    tabs,
    setActiveTab,
    openDeleteModal,
    closeDeleteModal,
    toggleDeleteConfirmed,
    confirmDeleteGrupo,
    navigateEditarGrupo,
    navigateCrearTarea,
    navigateAsignarRecurso,
    navigateAsignarDeBiblioteca,
    navigateDetalleTarea,
    navigateReportesGrupo,
    navigateRegistrarAsistencia,
    navigateHistorialAsistencia,
    navigateCapturarCalificaciones,
    navigatePromediosCalificaciones,
    exportarGrupo,
    setGrupoNotas,
    guardarNotasGrupo,
    descartarCambiosNotas,
  } = useDetalleGrupoViewModel();

  const handleExport = React.useCallback(() => {
    Alert.alert("Exportar grupo", "Selecciona el formato que deseas generar", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "PDF",
        onPress: () => {
          void exportarGrupo("pdf")
            .then((ok) => {
              if (!ok) {
                throw new Error("No se pudo exportar el grupo a PDF");
              }
              if (Platform.OS !== "web") {
                Alert.alert("Listo", "Grupo exportado en PDF.");
              }
            })
            .catch(() => {
              Alert.alert("Error", "No se pudo exportar el grupo en PDF.");
            });
        },
      },
      {
        text: "Excel",
        onPress: () => {
          void exportarGrupo("excel")
            .then((ok) => {
              if (!ok) {
                throw new Error("No se pudo exportar el grupo a Excel");
              }
              if (Platform.OS !== "web") {
                Alert.alert("Listo", "Grupo exportado en Excel.");
              }
            })
            .catch(() => {
              Alert.alert("Error", "No se pudo exportar el grupo en Excel.");
            });
        },
      },
    ]);
  }, [exportarGrupo]);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea}>
        {/* Header con info del grupo */}
        <View style={styles.header}>
          <ScreenBackButton style={{ marginLeft: -8, marginBottom: 2 }} />
          <Text style={styles.grupoNombre}>{grupoNombre}</Text>
          <Text style={styles.grupoId}>ID: {grupoId}</Text>
          <View style={styles.headerActions}>
            <Pressable
              style={({ pressed }) => [styles.editarButton, pressed && { opacity: 0.6 }]}
              onPress={navigateEditarGrupo}
            >
              <MaterialIcons name="edit" size={16} color={COLORS.primary} />
              <Text style={styles.editarButtonText}>Editar</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.exportarButton, pressed && { opacity: 0.6 }]}
              onPress={handleExport}
            >
              <MaterialIcons name="file-download" size={16} color="#0E7A56" />
              <Text style={styles.exportarButtonText}>Exportar</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.eliminarButton, pressed && { opacity: 0.6 }]}
              onPress={openDeleteModal}
            >
              <MaterialIcons name="delete-outline" size={16} color={COLORS.error} />
              <Text style={styles.eliminarButtonText}>Eliminar</Text>
            </Pressable>
          </View>
        </View>

        {/* Tabs horizontales */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}
        >
          {tabs.map((tab) => (
            <Pressable
              key={tab.id}
              style={({ pressed }) => [
                styles.tab,
                activeTab === tab.id && styles.activeTab,
                pressed && { opacity: 0.6 },
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <MaterialIcons
                name={tab.icon as any}
                size={24}
                color={activeTab === tab.id ? COLORS.primary : COLORS.textSecondary}
              />
              <Text style={[styles.tabLabel, activeTab === tab.id && styles.activeTabLabel]}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {isLoadingData ? (
          <View style={styles.inlineState}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.inlineStateText}>Cargando datos reales del grupo...</Text>
          </View>
        ) : null}

        {!isLoadingData && loadError ? (
          <View style={styles.inlineStateError}>
            <MaterialIcons name="error-outline" size={18} color={COLORS.dangerDark} />
            <Text style={styles.inlineStateErrorText}>{loadError}</Text>
          </View>
        ) : null}

        {/* Contenido de la pestaña activa */}
        <WebScrollView style={styles.content}>
          <TabContent
            activeTab={activeTab}
            alumnos={alumnos}
            tareas={tareas}
            recursos={recursos}
            asistencias={asistencias}
            calificaciones={calificaciones}
            entregas={entregas}
            lastDataRefreshAt={lastDataRefreshAt}
            grupoNotas={grupoNotas}
            notasUltimaEdicion={notasUltimaEdicion}
            notasEstado={notasEstado}
            notasError={notasError}
            miembros={miembros}
            chartWidth={chartWidth}
            openAddStudentsModal={openAddStudentsModal}
            openRemoveStudentModal={openRemoveStudentModal}
            openInvitacionModal={openInvitacionModal}
            openContextualMenu={openContextualMenu}
            navigateCrearTarea={navigateCrearTarea}
            navigateAsignarRecurso={navigateAsignarRecurso}
            navigateAsignarDeBiblioteca={navigateAsignarDeBiblioteca}
            navigateDetalleTarea={navigateDetalleTarea}
            navigateReportesGrupo={navigateReportesGrupo}
            navigateRegistrarAsistencia={navigateRegistrarAsistencia}
            navigateHistorialAsistencia={navigateHistorialAsistencia}
            navigateCapturarCalificaciones={navigateCapturarCalificaciones}
            navigatePromediosCalificaciones={navigatePromediosCalificaciones}
            setGrupoNotas={setGrupoNotas}
            guardarNotasGrupo={guardarNotasGrupo}
            descartarCambiosNotas={descartarCambiosNotas}
          />
        </WebScrollView>

        <Modal
          visible={removeStudentModalVisible}
          animationType="slide"
          transparent
          onRequestClose={closeRemoveStudentModal}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Quitar alumno</Text>
              <Text style={styles.modalSubtitle}>
                ¿Deseas quitar a {studentToRemove?.nombre} {studentToRemove?.apellidos} de este
                grupo?
              </Text>

              <View style={styles.impactCard}>
                <View style={styles.impactRow}>
                  <MaterialIcons name="info-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.impactText}>
                    El alumno seguirá existiendo en el sistema y podrá agregarse de nuevo.
                  </Text>
                </View>
              </View>

              {removeStudentError ? (
                <Text style={styles.deleteErrorText}>{removeStudentError}</Text>
              ) : null}

              <View style={styles.modalActions}>
                <Pressable
                  style={({ pressed }) => [styles.cancelModalButton, pressed && { opacity: 0.6 }]}
                  onPress={closeRemoveStudentModal}
                  disabled={isUnlinkingStudent}
                >
                  <Text style={styles.cancelModalButtonText}>Cancelar</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.deleteModalButton, pressed && { opacity: 0.6 }]}
                  onPress={() => void confirmRemoveStudentFromGroup()}
                  disabled={isUnlinkingStudent}
                >
                  {isUnlinkingStudent ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.deleteModalButtonText}>Quitar</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        <ModalInvitacionColaborador
          visible={invitacionModalVisible}
          onClose={closeInvitacionModal}
          onInvite={invitarDocente}
          grupoNombre={grupoNombre}
        />

        <MenuContextualColaborador
          visible={contextualMenuVisible}
          colaborador={colaboradorSeleccionado}
          onClose={closeContextualMenu}
          onChangeRole={cambiarRolColaborador}
          onRemove={eliminarColaborador}
        />

        <Modal
          visible={addStudentsModalVisible}
          animationType="slide"
          transparent
          onRequestClose={closeAddStudentsModal}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Agregar alumnos</Text>
              <Text style={styles.modalSubtitle}>{grupoNombre}</Text>

              {!createStudentMode ? (
                <>
                  <View style={styles.searchBox}>
                    <MaterialIcons name="search" size={18} color="#7A8CA5" />
                    <TextInput
                      placeholder="Buscar por nombre o número de control"
                      style={styles.searchInput}
                      value={studentSearchQuery}
                      onChangeText={setStudentSearchQuery}
                      placeholderTextColor="#8DA0BA"
                    />
                  </View>

                  <View style={styles.studentsList}>
                    {availableStudents.length === 0 ? (
                      <Text style={styles.modalEmptyText}>
                        No hay alumnos disponibles para agregar.
                      </Text>
                    ) : (
                      availableStudents.map((student) => {
                        const selected = selectedStudentIds.includes(student.id);
                        return (
                          <Pressable
                            key={String(student.id)}
                            style={({ pressed }) => [
                              styles.studentRow,
                              selected && styles.studentRowSelected,
                              pressed && { opacity: 0.6 },
                            ]}
                            onPress={() => toggleStudentSelection(student.id)}
                          >
                            <View style={styles.studentAvatar}>
                              <MaterialIcons name="person" size={16} color={COLORS.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text
                                style={styles.studentName}
                              >{`${student.nombre} ${student.apellidos}`}</Text>
                              <Text style={styles.studentMeta}>ID: {student.numeroControl}</Text>
                            </View>
                            <MaterialIcons
                              name={selected ? "check-circle" : "radio-button-unchecked"}
                              size={22}
                              color={selected ? COLORS.primary : "#A8B8CF"}
                            />
                          </Pressable>
                        );
                      })
                    )}
                  </View>
                </>
              ) : (
                <View style={styles.createStudentCard}>
                  <Text style={styles.sectionTitle}>Registro rápido de alumno</Text>
                  <TextInput
                    style={styles.createInput}
                    placeholder="Nombre"
                    value={newStudentNombre}
                    onChangeText={setNewStudentNombre}
                  />
                  <TextInput
                    style={styles.createInput}
                    placeholder="Apellidos"
                    value={newStudentApellidos}
                    onChangeText={setNewStudentApellidos}
                  />
                  <TextInput
                    style={styles.createInput}
                    placeholder="Número de control"
                    value={newStudentNumeroControl}
                    onChangeText={setNewStudentNumeroControl}
                  />
                  <CarreraSelector
                    label="Carrera"
                    value={newStudentCarrera}
                    onChange={setNewStudentCarrera}
                  />
                </View>
              )}

              {addStudentsError ? (
                <Text style={styles.deleteErrorText}>{addStudentsError}</Text>
              ) : null}

              <View style={styles.modalActions}>
                <Pressable
                  style={({ pressed }) => [styles.cancelModalButton, pressed && { opacity: 0.6 }]}
                  onPress={createStudentMode ? closeCreateStudentMode : closeAddStudentsModal}
                >
                  <Text style={styles.cancelModalButtonText}>Cancelar</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.secondaryModalButton,
                    pressed && { opacity: 0.6 },
                  ]}
                  onPress={
                    createStudentMode ? () => void createAndAddStudent() : openCreateStudentMode
                  }
                >
                  <Text style={styles.secondaryModalButtonText}>
                    {createStudentMode ? "Crear y agregar" : "Nuevo ingreso"}
                  </Text>
                </Pressable>

                {!createStudentMode ? (
                  <Pressable
                    style={({ pressed }) => [
                      styles.primaryModalButton,
                      pressed && { opacity: 0.6 },
                    ]}
                    onPress={() => void confirmAddSelectedStudents()}
                    disabled={isLinkingStudents}
                  >
                    <Text style={styles.primaryModalButtonText}>
                      {isLinkingStudents
                        ? "Agregando..."
                        : `Agregar seleccionados (${selectedStudentIds.length})`}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={addStudentsSuccessVisible}
          animationType="fade"
          transparent
          onRequestClose={closeAddStudentsSuccess}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.successCard}>
              <View style={styles.successIcon}>
                <MaterialIcons name="check" size={26} color={COLORS.surface} />
              </View>
              <Text style={styles.successTitle}>¡Todo listo!</Text>
              <Text style={styles.successText}>
                Alumnos agregados correctamente. Total actual del grupo: {createdAndAddedCount}
              </Text>
              <Pressable
                style={({ pressed }) => [styles.primaryModalButton, pressed && { opacity: 0.6 }]}
                onPress={closeAddStudentsSuccess}
              >
                <Text style={styles.primaryModalButtonText}>Volver al detalle del grupo</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        <Modal
          visible={deleteModalVisible}
          animationType="slide"
          transparent
          onRequestClose={closeDeleteModal}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Eliminar grupo</Text>
              <Text style={styles.modalSubtitle}>
                Esta acción eliminará permanentemente el grupo.
              </Text>

              <View style={styles.impactCard}>
                <View style={styles.impactRow}>
                  <MaterialIcons name="group" size={18} color={COLORS.primary} />
                  <Text style={styles.impactText}>Alumnos asociados: {cantidadAlumnos}</Text>
                </View>
                <View style={styles.impactRow}>
                  <MaterialIcons name="assignment" size={18} color={COLORS.primary} />
                  <Text style={styles.impactText}>Tareas asociadas: 12</Text>
                </View>
                <View style={styles.impactRow}>
                  <MaterialIcons name="history" size={18} color={COLORS.primary} />
                  <Text style={styles.impactText}>Registros relacionados: 8</Text>
                </View>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.confirmRow,
                  deleteError ? styles.confirmRowError : undefined,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={toggleDeleteConfirmed}
              >
                <View style={[styles.checkbox, deleteConfirmed && styles.checkboxActive]}>
                  {deleteConfirmed && (
                    <MaterialIcons name="check" size={14} color={COLORS.surface} />
                  )}
                </View>
                <Text style={styles.confirmText}>
                  Confirmo que entiendo que esta acción no se puede deshacer.
                </Text>
              </Pressable>

              {deleteError ? <Text style={styles.deleteErrorText}>{deleteError}</Text> : null}

              <View style={styles.modalActions}>
                <Pressable
                  style={({ pressed }) => [styles.cancelModalButton, pressed && { opacity: 0.6 }]}
                  onPress={closeDeleteModal}
                  disabled={isDeleting}
                >
                  <Text style={styles.cancelModalButtonText}>Cancelar</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.deleteModalButton,
                    (!deleteConfirmed || isDeleting) && styles.deleteModalButtonDisabled,
                    pressed && { opacity: 0.6 },
                  ]}
                  onPress={() => void confirmDeleteGrupo()}
                  disabled={!deleteConfirmed || isDeleting}
                >
                  {isDeleting ? (
                    <ActivityIndicator size="small" color={COLORS.surface} />
                  ) : (
                    <MaterialIcons name="delete-forever" size={16} color={COLORS.surface} />
                  )}
                  <Text style={styles.deleteModalButtonText}>
                    {isDeleting ? "Eliminando..." : "Eliminar grupo definitivamente"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
};

/**
 * Estilos del componente
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    boxShadow: "0px 4px 12px rgba(0, 72, 132, 0.06)",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
    flexWrap: "wrap",
  },
  grupoNombre: {
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
    color: COLORS.text,
  },
  grupoId: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textTertiary,
    marginTop: 4,
  },
  editarButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.backgroundSoft,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  editarButtonText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "700",
  },
  exportarButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F1FCF8",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  exportarButtonText: {
    color: "#0E7A56",
    fontSize: 13,
    fontWeight: "700",
  },
  eliminarButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFF5F6",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  eliminarButtonText: {
    color: COLORS.error,
    fontSize: 13,
    fontWeight: "700",
  },
  tabsContainer: {
    backgroundColor: COLORS.surfaceContainerLow,
  },
  tabsContent: {
    paddingHorizontal: 10,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 14,
  },
  activeTab: {
    backgroundColor: COLORS.surface,
    boxShadow: "0px 4px 12px rgba(0, 72, 132, 0.06)",
  },
  tabLabel: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    marginLeft: 8,
    fontWeight: "500",
  },
  activeTabLabel: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  inlineState: {
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: COLORS.backgroundSoft,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inlineStateText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.primaryDark,
    fontWeight: "600",
  },
  inlineStateError: {
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: COLORS.errorTint,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inlineStateErrorText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.dangerDark,
    fontWeight: "700",
  },
  tabContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 110,
  },
  tabTitle: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 8,
  },
  tabDescription: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginBottom: 20,
    boxShadow: "0px 12px 24px rgba(22, 118, 210, 0.25)",
  },
  actionButtonText: {
    color: "white",
    fontSize: FONT_SIZES.medium,
    fontWeight: "bold",
    marginLeft: 8,
  },
  listaContainer: {
    marginTop: 10,
  },
  alumnoItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    boxShadow: "0px 12px 24px rgba(0, 72, 132, 0.06)",
  },
  alumnoNombre: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
    fontWeight: "700",
  },
  alumnoInfo: {
    flex: 1,
    marginLeft: 12,
  },
  alumnoControl: {
    color: COLORS.textTertiary,
    fontSize: FONT_SIZES.small,
    marginTop: 2,
  },
  removeAlumnoButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFF5F6",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  removeAlumnoButtonText: {
    color: COLORS.error,
    fontSize: 13,
    fontWeight: "700",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  statCard: {
    backgroundColor: COLORS.surface,
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
    boxShadow: "0px 12px 24px rgba(0, 72, 132, 0.06)",
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 15,
  },
  comentarioItem: {
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    boxShadow: "0px 12px 24px rgba(0, 72, 132, 0.06)",
  },
  comentarioAlumno: {
    fontSize: FONT_SIZES.medium,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 5,
  },
  comentarioTexto: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    marginBottom: 5,
  },
  comentarioFecha: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
  },
  statsHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 8,
  },
  updatedAtText: {
    color: "#6C7D95",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
  },
  statsCardsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  miniChartsSection: {
    gap: 10,
    marginBottom: 10,
  },
  insightCard: {
    marginTop: 10,
    marginBottom: 6,
    backgroundColor: "#FFF9E8",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  insightText: {
    flex: 1,
    color: "#6A5823",
    fontSize: 13,
    fontWeight: "600",
  },
  openReportButtonContainer: {
    marginTop: 10,
  },
  openReportButton: {
    borderRadius: 10,
    backgroundColor: COLORS.primaryDark,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  openReportButtonText: {
    color: COLORS.surface,
    fontWeight: "800",
    fontSize: 14,
  },
  notesSuggestionCard: {
    backgroundColor: COLORS.surface,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
    boxShadow: "0px 12px 24px rgba(0, 72, 132, 0.06)",
  },
  notesSuggestionTitle: {
    color: "#5D6E87",
    fontSize: 14,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  notesSuggestionText: {
    color: "#24364E",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 3,
    lineHeight: 23,
  },
  notesCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    boxShadow: "0px 12px 24px rgba(0, 72, 132, 0.06)",
  },
  notesHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 8,
  },
  notesPrivateRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  notesPrivateText: {
    color: COLORS.textTertiary,
    fontSize: 14,
    fontWeight: "600",
  },
  notesPrivateBadge: {
    backgroundColor: "#EAF1FB",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  notesPrivateBadgeText: {
    color: "#2E6EBB",
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  notesInput: {
    minHeight: 180,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DFE7F2",
    backgroundColor: COLORS.surfaceHover,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#2B3D57",
    fontSize: 22,
    lineHeight: 32,
    fontWeight: "500",
  },
  notesMetaRow: {
    marginTop: 12,
    marginBottom: 8,
    gap: 4,
  },
  notesStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  notesStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  notesStatusDotNeutral: {
    backgroundColor: "#8EA0B7",
  },
  notesStatusDotWarning: {
    backgroundColor: "#E2A400",
  },
  notesStatusDotSuccess: {
    backgroundColor: "#15803D",
  },
  notesStatusDotError: {
    backgroundColor: COLORS.error,
  },
  notesStatusText: {
    color: "#334861",
    fontSize: 15,
    fontWeight: "700",
  },
  notesTimestamp: {
    color: COLORS.textTertiary,
    fontSize: 13,
    fontWeight: "500",
  },
  notesErrorText: {
    color: COLORS.dangerDark,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },
  notesActionsRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  notesDiscardButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#DAE4F2",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: COLORS.surface,
  },
  notesDiscardButtonText: {
    color: COLORS.textSecondary,
    fontSize: 19,
    fontWeight: "700",
  },
  notesSaveButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: COLORS.primary,
    boxShadow: "0px 12px 24px rgba(22, 118, 210, 0.25)",
  },
  notesSaveButtonDisabled: {
    backgroundColor: "#8EBCE6",
    boxShadow: "none",
  },
  notesSaveButtonText: {
    color: COLORS.surface,
    fontSize: 22,
    fontWeight: "800",
  },
  notesFooterText: {
    color: "#6C7D95",
    fontSize: 18,
    fontWeight: "500",
    lineHeight: 25,
    textAlign: "center",
    marginTop: 14,
  },
  // Estilos para tareas
  actionButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 20,
  },
  actionButtonHalf: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  actionButtonSecondary: {
    backgroundColor: COLORS.purple,
  },
  tareaItem: {
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    boxShadow: "0px 12px 24px rgba(0, 72, 132, 0.06)",
  },
  tareaHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  tareaInfo: {
    flex: 1,
    marginLeft: 12,
  },
  tareaTitulo: {
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  tareaMetadata: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
  },
  tareaProgress: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.divider,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.success,
    borderRadius: 3,
  },
  progressText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(14, 28, 52, 0.48)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 24,
    gap: 12,
  },
  modalTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: -0.4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: COLORS.textDark,
  },
  searchBox: {
    borderWidth: 1,
    borderColor: "#D8E3F2",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F9FBFF",
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
  },
  studentsList: {
    maxHeight: 320,
    gap: 8,
  },
  modalEmptyText: {
    color: "#5B6D86",
    textAlign: "center",
    paddingVertical: 12,
    fontSize: 14,
  },
  studentRow: {
    borderWidth: 1,
    borderColor: "#E2E9F4",
    borderRadius: 12,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.surface,
  },
  studentRowSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.backgroundSoft,
  },
  studentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  studentName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
  },
  studentMeta: {
    color: "#5B6D86",
    fontSize: 12,
    marginTop: 2,
  },
  createStudentCard: {
    borderWidth: 1,
    borderColor: "#DCE7F8",
    borderRadius: 14,
    padding: 12,
    backgroundColor: COLORS.backgroundSoft,
    gap: 8,
  },
  createInput: {
    borderWidth: 1,
    borderColor: "#D6E0F0",
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontSize: 14,
    color: COLORS.text,
  },
  secondaryModalButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#C8D8EE",
    backgroundColor: COLORS.backgroundSoft,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  secondaryModalButtonText: {
    color: "#245C9E",
    fontWeight: "700",
    fontSize: 14,
  },
  primaryModalButton: {
    borderRadius: 999,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  primaryModalButtonText: {
    color: COLORS.surface,
    fontWeight: "800",
    fontSize: 14,
  },
  successCard: {
    margin: 24,
    marginBottom: 48,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    padding: 18,
    alignItems: "center",
    gap: 10,
  },
  successIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#22A45D",
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "800",
  },
  successText: {
    color: COLORS.textDark,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 4,
  },
  impactCard: {
    borderWidth: 1,
    borderColor: "#D8E6F8",
    borderRadius: 14,
    backgroundColor: COLORS.backgroundSoft,
    padding: 12,
    gap: 10,
  },
  impactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  impactText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "700",
  },
  confirmRow: {
    borderWidth: 1,
    borderColor: "#E6EDF8",
    backgroundColor: "#FBFDFF",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  confirmRowError: {
    borderColor: "#E65151",
    backgroundColor: "#FFF8F8",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#B9C8DD",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.surface,
  },
  checkboxActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  confirmText: {
    flex: 1,
    color: "#42536D",
    fontSize: 15,
    lineHeight: 20,
  },
  deleteErrorText: {
    color: COLORS.error,
    fontWeight: "700",
    fontSize: 13,
  },
  modalActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cancelModalButton: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  cancelModalButtonText: {
    color: COLORS.textDark,
    fontWeight: "700",
    fontSize: 15,
  },
  deleteModalButton: {
    flex: 1.4,
    borderRadius: 999,
    backgroundColor: "#D62828",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    flexDirection: "row",
    gap: 8,
  },
  deleteModalButtonDisabled: {
    opacity: 0.65,
  },
  deleteModalButtonText: {
    color: COLORS.surface,
    fontWeight: "800",
    fontSize: 14,
  },
});

export default DetalleGrupoScreen;
