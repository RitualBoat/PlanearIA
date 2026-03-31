import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { COLORS, FONT_SIZES } from "../../../types";
import WebScrollView from "../../components/WebScrollView";
import { useDetalleGrupoViewModel, TabType } from "../../hooks/useDetalleGrupoViewModel";

/**
 * Componente que renderiza el contenido según la pestaña activa
 */
const TabContent: React.FC<{
  activeTab: TabType;
  alumnos: Array<{ id: number; nombre: string; apellidos: string }>;
  tareas: Array<{ id: number; titulo: string; fechaEntrega: Date | string; valor: number }>;
  recursos: Array<{ id: number; titulo: string; tipo: string }>;
  asistencias: Array<{ id: number; estado: string }>;
  calificaciones: Array<{ id: number; promedio: number; estado: string }>;
  navigateCrearTarea: () => void;
  navigateAsignarRecurso: () => void;
  navigateDetalleTarea: (tareaId: number) => void;
}> = React.memo(
  ({
    activeTab,
    alumnos,
    tareas,
    recursos,
    asistencias,
    calificaciones,
    navigateCrearTarea,
    navigateAsignarRecurso,
    navigateDetalleTarea,
  }) => {
    switch (activeTab) {
      case "alumnos":
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Lista de Alumnos</Text>
            <Text style={styles.tabDescription}>Alumnos vinculados al grupo seleccionado.</Text>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialIcons name="person-add" size={24} color="white" />
              <Text style={styles.actionButtonText}>Agregar Alumno</Text>
            </TouchableOpacity>

            <View style={styles.listaContainer}>
              {alumnos.length === 0 ? (
                <Text style={styles.emptyText}>No hay alumnos vinculados a este grupo.</Text>
              ) : (
                alumnos.map((alumno) => (
                  <View key={String(alumno.id)} style={styles.alumnoItem}>
                    <MaterialIcons name="account-circle" size={40} color={COLORS.primary} />
                    <Text style={styles.alumnoNombre}>{`${alumno.nombre} ${alumno.apellidos}`}</Text>
                    <MaterialIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
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
            <TouchableOpacity style={styles.actionButton}>
              <MaterialIcons name="edit-note" size={24} color="white" />
              <Text style={styles.actionButtonText}>Registrar Calificaciones</Text>
            </TouchableOpacity>

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
            <TouchableOpacity style={styles.actionButton}>
              <MaterialIcons name="checklist" size={24} color="white" />
              <Text style={styles.actionButtonText}>Pasar Lista</Text>
            </TouchableOpacity>

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
            <TouchableOpacity style={styles.actionButton}>
              <MaterialIcons name="file-copy" size={24} color="white" />
              <Text style={styles.actionButtonText}>Asignar Recurso</Text>
            </TouchableOpacity>

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
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonHalf]}
                onPress={navigateCrearTarea}
              >
                <MaterialIcons name="add" size={20} color="white" />
                <Text style={styles.actionButtonText}>Nueva Tarea</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonHalf, styles.actionButtonSecondary]}
                onPress={navigateAsignarRecurso}
              >
                <MaterialIcons name="file-copy" size={20} color="white" />
                <Text style={styles.actionButtonText}>Asignar Examen</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.listaContainer}>
              <Text style={styles.sectionTitle}>Tareas Activas</Text>
              {tareas.length === 0 ? (
                <Text style={styles.emptyText}>No hay tareas asignadas a este grupo.</Text>
              ) : (
                tareas.map((tarea) => (
                  <TouchableOpacity
                    key={String(tarea.id)}
                    style={styles.tareaItem}
                    onPress={() => navigateDetalleTarea(tarea.id)}
                  >
                    <View style={styles.tareaHeader}>
                      <MaterialIcons name="assignment" size={24} color="#FF9800" />
                      <View style={styles.tareaInfo}>
                        <Text style={styles.tareaTitulo}>{tarea.titulo}</Text>
                        <Text style={styles.tareaMetadata}>
                          Entrega: {new Date(tarea.fechaEntrega).toLocaleDateString()} | Valor: {tarea.valor}
                          pts
                        </Text>
                      </View>
                      <MaterialIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>
        );

      case "graficas":
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Gráficas de Rendimiento</Text>
            <Text style={styles.tabDescription}>
              Visualiza estadísticas y el rendimiento del grupo
            </Text>

            {/* Gráficas placeholder */}
            <View style={styles.graficaContainer}>
              <MaterialIcons name="bar-chart" size={80} color={COLORS.primary} />
              <Text style={styles.graficaText}>Aquí se mostrarán gráficas de:</Text>
              <Text style={styles.graficaItem}>• Promedio de calificaciones</Text>
              <Text style={styles.graficaItem}>• Evolución del grupo</Text>
              <Text style={styles.graficaItem}>• Porcentaje de asistencias</Text>
              <Text style={styles.graficaItem}>• Comparativa por alumno</Text>
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
    navigateDetalleTarea,
  } = useDetalleGrupoViewModel();

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#EEF3FA" barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea}>
        {/* Header con info del grupo */}
        <View style={styles.header}>
          <Text style={styles.grupoNombre}>{grupoNombre}</Text>
          <Text style={styles.grupoId}>ID: {grupoId}</Text>
          <TouchableOpacity style={styles.editarButton} onPress={navigateEditarGrupo}>
            <MaterialIcons name="edit" size={16} color="#1676D2" />
            <Text style={styles.editarButtonText}>Editar grupo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.eliminarButton} onPress={openDeleteModal}>
            <MaterialIcons name="delete-outline" size={16} color="#C62828" />
            <Text style={styles.eliminarButtonText}>Eliminar grupo</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs horizontales */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
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
            </TouchableOpacity>
          ))}
        </ScrollView>

        {isLoadingData ? (
          <View style={styles.inlineState}>
            <ActivityIndicator size="small" color="#1676D2" />
            <Text style={styles.inlineStateText}>Cargando datos reales del grupo...</Text>
          </View>
        ) : null}

        {!isLoadingData && loadError ? (
          <View style={styles.inlineStateError}>
            <MaterialIcons name="error-outline" size={18} color="#B12635" />
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
            navigateCrearTarea={navigateCrearTarea}
            navigateAsignarRecurso={navigateAsignarRecurso}
            navigateDetalleTarea={navigateDetalleTarea}
          />
        </WebScrollView>

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
                  <MaterialIcons name="group" size={18} color="#1676D2" />
                  <Text style={styles.impactText}>Alumnos asociados: {cantidadAlumnos}</Text>
                </View>
                <View style={styles.impactRow}>
                  <MaterialIcons name="assignment" size={18} color="#1676D2" />
                  <Text style={styles.impactText}>Tareas asociadas: 12</Text>
                </View>
                <View style={styles.impactRow}>
                  <MaterialIcons name="history" size={18} color="#1676D2" />
                  <Text style={styles.impactText}>Registros relacionados: 8</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.confirmRow, deleteError ? styles.confirmRowError : undefined]}
                onPress={toggleDeleteConfirmed}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, deleteConfirmed && styles.checkboxActive]}>
                  {deleteConfirmed && <MaterialIcons name="check" size={14} color="#FFFFFF" />}
                </View>
                <Text style={styles.confirmText}>
                  Confirmo que entiendo que esta acción no se puede deshacer.
                </Text>
              </TouchableOpacity>

              {deleteError ? <Text style={styles.deleteErrorText}>{deleteError}</Text> : null}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelModalButton}
                  onPress={closeDeleteModal}
                  disabled={isDeleting}
                >
                  <Text style={styles.cancelModalButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.deleteModalButton,
                    (!deleteConfirmed || isDeleting) && styles.deleteModalButtonDisabled,
                  ]}
                  onPress={() => void confirmDeleteGrupo()}
                  disabled={!deleteConfirmed || isDeleting}
                >
                  {isDeleting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <MaterialIcons name="delete-forever" size={16} color="#FFFFFF" />
                  )}
                  <Text style={styles.deleteModalButtonText}>
                    {isDeleting ? "Eliminando..." : "Eliminar grupo definitivamente"}
                  </Text>
                </TouchableOpacity>
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
    backgroundColor: "#EEF3FA",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E3EAF4",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  grupoNombre: {
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
    color: "#1E2A3A",
  },
  grupoId: {
    fontSize: FONT_SIZES.small,
    color: "#6B7D96",
    marginTop: 4,
  },
  editarButton: {
    marginTop: 10,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#CFE2F7",
    backgroundColor: "#F5FAFF",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  editarButtonText: {
    color: "#1676D2",
    fontSize: 13,
    fontWeight: "700",
  },
  eliminarButton: {
    marginTop: 8,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#F5C2C7",
    backgroundColor: "#FFF5F6",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  eliminarButtonText: {
    color: "#C62828",
    fontSize: 13,
    fontWeight: "700",
  },
  tabsContainer: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E3EAF4",
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
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: "#EAF4FF",
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
    borderWidth: 1,
    borderColor: "#CFE2F7",
    backgroundColor: "#F2F8FF",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inlineStateText: {
    fontSize: FONT_SIZES.small,
    color: "#0C5DA8",
    fontWeight: "600",
  },
  inlineStateError: {
    marginHorizontal: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#F7CDD2",
    backgroundColor: "#FFF1F2",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inlineStateErrorText: {
    fontSize: FONT_SIZES.small,
    color: "#B12635",
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
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3EAF4",
    borderRadius: 12,
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
    borderRadius: 10,
    marginBottom: 20,
    boxShadow: "0px 8px 18px rgba(22, 118, 210, 0.32)",
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
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3EAF4",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    boxShadow: "0px 8px 18px rgba(18, 44, 86, 0.08)",
  },
  alumnoNombre: {
    flex: 1,
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
    marginLeft: 12,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  statCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3EAF4",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
    boxShadow: "0px 8px 18px rgba(18, 44, 86, 0.08)",
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
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3EAF4",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    boxShadow: "0px 8px 18px rgba(18, 44, 86, 0.08)",
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
  graficaContainer: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3EAF4",
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    boxShadow: "0px 8px 18px rgba(18, 44, 86, 0.08)",
  },
  graficaText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
    marginTop: 20,
    marginBottom: 15,
    fontWeight: "600",
  },
  graficaItem: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    marginVertical: 5,
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
    backgroundColor: "#9C27B0",
  },
  tareaItem: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3EAF4",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    boxShadow: "0px 8px 18px rgba(18, 44, 86, 0.08)",
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
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
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
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 24,
    gap: 12,
  },
  modalTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: "#1E2A3A",
    letterSpacing: -0.4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#4D5D74",
  },
  impactCard: {
    borderWidth: 1,
    borderColor: "#D8E6F8",
    borderRadius: 14,
    backgroundColor: "#F6FAFF",
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
    color: "#1E2A3A",
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
    backgroundColor: "#FFFFFF",
  },
  checkboxActive: {
    borderColor: "#1676D2",
    backgroundColor: "#1676D2",
  },
  confirmText: {
    flex: 1,
    color: "#42536D",
    fontSize: 15,
    lineHeight: 20,
  },
  deleteErrorText: {
    color: "#C62828",
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
    borderColor: "#DFE7F3",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  cancelModalButtonText: {
    color: "#4D5D74",
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
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },
});

export default DetalleGrupoScreen;
