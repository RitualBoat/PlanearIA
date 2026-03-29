import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from "react-native";
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
  navigateCrearTarea: () => void;
  navigateAsignarRecurso: () => void;
  navigateDetalleTarea: (tareaId: number) => void;
}> = React.memo(
  ({ activeTab, navigateCrearTarea, navigateAsignarRecurso, navigateDetalleTarea }) => {
    switch (activeTab) {
      case "alumnos":
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Lista de Alumnos</Text>
            <Text style={styles.tabDescription}>
              Aquí se mostrará la lista de alumnos del grupo
            </Text>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialIcons name="person-add" size={24} color="white" />
              <Text style={styles.actionButtonText}>Agregar Alumno</Text>
            </TouchableOpacity>

            {/* Lista de ejemplo */}
            <View style={styles.listaContainer}>
              {["Juan Pérez García", "María López Martínez", "Carlos Rodríguez Sánchez"].map(
                (nombre) => (
                  <View key={nombre} style={styles.alumnoItem}>
                    <MaterialIcons name="account-circle" size={40} color={COLORS.primary} />
                    <Text style={styles.alumnoNombre}>{nombre}</Text>
                    <MaterialIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
                  </View>
                )
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

            {/* Resumen de ejemplo */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>8.5</Text>
                <Text style={styles.statLabel}>Promedio Grupal</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>85%</Text>
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

            {/* Estadísticas de ejemplo */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>92%</Text>
                <Text style={styles.statLabel}>Asistencia Promedio</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>3</Text>
                <Text style={styles.statLabel}>Retardos Hoy</Text>
              </View>
            </View>
          </View>
        );

      case "comentarios":
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Comentarios y Notas</Text>
            <Text style={styles.tabDescription}>
              Registra observaciones personalizadas de tus alumnos
            </Text>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialIcons name="add-comment" size={24} color="white" />
              <Text style={styles.actionButtonText}>Nuevo Comentario</Text>
            </TouchableOpacity>

            {/* Comentarios recientes */}
            <View style={styles.listaContainer}>
              <Text style={styles.sectionTitle}>Comentarios Recientes</Text>
              <View style={styles.comentarioItem}>
                <Text style={styles.comentarioAlumno}>Juan Pérez García</Text>
                <Text style={styles.comentarioTexto}>Excelente participación en clase</Text>
                <Text style={styles.comentarioFecha}>Hace 2 días</Text>
              </View>
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

            {/* Estadísticas de tareas */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>75%</Text>
                <Text style={styles.statLabel}>Entregado</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>8.5</Text>
                <Text style={styles.statLabel}>Promedio</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>3</Text>
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

            {/* Lista de tareas */}
            <View style={styles.listaContainer}>
              <Text style={styles.sectionTitle}>Tareas Activas</Text>

              {/* Tarea ejemplo 1 */}
              <TouchableOpacity style={styles.tareaItem} onPress={() => navigateDetalleTarea(1)}>
                <View style={styles.tareaHeader}>
                  <MaterialIcons name="assignment" size={24} color="#FF9800" />
                  <View style={styles.tareaInfo}>
                    <Text style={styles.tareaTitulo}>Investigación sobre IA</Text>
                    <Text style={styles.tareaMetadata}>Entrega: en 2 días | Valor: 20pts</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
                </View>
                <View style={styles.tareaProgress}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: "54%" }]} />
                  </View>
                  <Text style={styles.progressText}>15/28 entregados</Text>
                </View>
              </TouchableOpacity>

              {/* Tarea ejemplo 2 */}
              <TouchableOpacity style={styles.tareaItem} onPress={() => navigateDetalleTarea(2)}>
                <View style={styles.tareaHeader}>
                  <MaterialIcons name="quiz" size={24} color="#2196F3" />
                  <View style={styles.tareaInfo}>
                    <Text style={styles.tareaTitulo}>Examen Parcial 2</Text>
                    <Text style={styles.tareaMetadata}>Próximo: 30 Nov | Valor: 30pts</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
                </View>
                <View style={styles.tareaProgress}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: "0%" }]} />
                  </View>
                  <Text style={styles.progressText}>Aún no ha iniciado</Text>
                </View>
              </TouchableOpacity>

              {/* Tarea ejemplo 3 */}
              <TouchableOpacity style={styles.tareaItem} onPress={() => navigateDetalleTarea(3)}>
                <View style={styles.tareaHeader}>
                  <MaterialIcons name="science" size={24} color="#9C27B0" />
                  <View style={styles.tareaInfo}>
                    <Text style={styles.tareaTitulo}>Proyecto Final</Text>
                    <Text style={styles.tareaMetadata}>Entrega: en 15 días | Valor: 40pts</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
                </View>
                <View style={styles.tareaProgress}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: "25%" }]} />
                  </View>
                  <Text style={styles.progressText}>7/28 entregados</Text>
                </View>
              </TouchableOpacity>
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
    activeTab,
    tabs,
    setActiveTab,
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

        {/* Contenido de la pestaña activa */}
        <WebScrollView style={styles.content}>
          <TabContent
            activeTab={activeTab}
            navigateCrearTarea={navigateCrearTarea}
            navigateAsignarRecurso={navigateAsignarRecurso}
            navigateDetalleTarea={navigateDetalleTarea}
          />
        </WebScrollView>
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
});

export default DetalleGrupoScreen;
