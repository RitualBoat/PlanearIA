import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { COLORS, FONT_SIZES } from "../../../types";
import BottomNavBar from "../../components/BottomNavBar";
import WebScrollView from "../../components/WebScrollView";

/**
 * Tipo para las props de navegación
 */
type DetalleGrupoScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "DetalleGrupo"
>;

type DetalleGrupoScreenRouteProp = RouteProp<
  RootStackParamList,
  "DetalleGrupo"
>;

/**
 * Props del componente
 */
interface DetalleGrupoScreenProps {
  navigation: DetalleGrupoScreenNavigationProp;
  route: DetalleGrupoScreenRouteProp;
}

/**
 * Tipo para las pestañas disponibles
 */
type TabType =
  | "alumnos"
  | "calificaciones"
  | "asistencias"
  | "comentarios"
  | "tareas"
  | "graficas";

interface Tab {
  id: TabType;
  label: string;
  icon: string;
}

/**
 * Componente que renderiza el contenido según la pestaña activa
 */
const TabContent: React.FC<{
  activeTab: TabType;
  navigation: DetalleGrupoScreenNavigationProp;
  grupoId: number;
}> = React.memo(({ activeTab, navigation, grupoId }) => {
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
            {[
              "Juan Pérez García",
              "María López Martínez",
              "Carlos Rodríguez Sánchez",
            ].map((nombre) => (
              <View key={nombre} style={styles.alumnoItem}>
                <MaterialIcons
                  name="account-circle"
                  size={40}
                  color={COLORS.primary}
                />
                <Text style={styles.alumnoNombre}>{nombre}</Text>
                <MaterialIcons
                  name="chevron-right"
                  size={24}
                  color={COLORS.textSecondary}
                />
              </View>
            ))}
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
            <Text style={styles.actionButtonText}>
              Registrar Calificaciones
            </Text>
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
              <Text style={styles.comentarioTexto}>
                Excelente participación en clase
              </Text>
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
              onPress={() => {
                navigation.navigate("CrearTareaGrupo", { grupoId });
              }}
            >
              <MaterialIcons name="add" size={20} color="white" />
              <Text style={styles.actionButtonText}>Nueva Tarea</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.actionButtonHalf,
                styles.actionButtonSecondary,
              ]}
              onPress={() => {
                navigation.navigate("AsignarRecurso", { grupoId });
              }}
            >
              <MaterialIcons name="file-copy" size={20} color="white" />
              <Text style={styles.actionButtonText}>Asignar Examen</Text>
            </TouchableOpacity>
          </View>

          {/* Lista de tareas */}
          <View style={styles.listaContainer}>
            <Text style={styles.sectionTitle}>Tareas Activas</Text>

            {/* Tarea ejemplo 1 */}
            <TouchableOpacity
              style={styles.tareaItem}
              onPress={() => {
                navigation.navigate("DetalleTarea", {
                  tareaId: 1,
                  grupoId,
                });
              }}
            >
              <View style={styles.tareaHeader}>
                <MaterialIcons name="assignment" size={24} color="#FF9800" />
                <View style={styles.tareaInfo}>
                  <Text style={styles.tareaTitulo}>Investigación sobre IA</Text>
                  <Text style={styles.tareaMetadata}>
                    Entrega: en 2 días | Valor: 20pts
                  </Text>
                </View>
                <MaterialIcons
                  name="chevron-right"
                  size={24}
                  color={COLORS.textSecondary}
                />
              </View>
              <View style={styles.tareaProgress}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: "54%" }]} />
                </View>
                <Text style={styles.progressText}>15/28 entregados</Text>
              </View>
            </TouchableOpacity>

            {/* Tarea ejemplo 2 */}
            <TouchableOpacity
              style={styles.tareaItem}
              onPress={() => {
                navigation.navigate("DetalleTarea", {
                  tareaId: 2,
                  grupoId,
                });
              }}
            >
              <View style={styles.tareaHeader}>
                <MaterialIcons name="quiz" size={24} color="#2196F3" />
                <View style={styles.tareaInfo}>
                  <Text style={styles.tareaTitulo}>Examen Parcial 2</Text>
                  <Text style={styles.tareaMetadata}>
                    Próximo: 30 Nov | Valor: 30pts
                  </Text>
                </View>
                <MaterialIcons
                  name="chevron-right"
                  size={24}
                  color={COLORS.textSecondary}
                />
              </View>
              <View style={styles.tareaProgress}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: "0%" }]} />
                </View>
                <Text style={styles.progressText}>Aún no ha iniciado</Text>
              </View>
            </TouchableOpacity>

            {/* Tarea ejemplo 3 */}
            <TouchableOpacity
              style={styles.tareaItem}
              onPress={() => {
                navigation.navigate("DetalleTarea", {
                  tareaId: 3,
                  grupoId,
                });
              }}
            >
              <View style={styles.tareaHeader}>
                <MaterialIcons name="science" size={24} color="#9C27B0" />
                <View style={styles.tareaInfo}>
                  <Text style={styles.tareaTitulo}>Proyecto Final</Text>
                  <Text style={styles.tareaMetadata}>
                    Entrega: en 15 días | Valor: 40pts
                  </Text>
                </View>
                <MaterialIcons
                  name="chevron-right"
                  size={24}
                  color={COLORS.textSecondary}
                />
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
            <Text style={styles.graficaText}>
              Aquí se mostrarán gráficas de:
            </Text>
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
});

/**
 * Pantalla de Detalle de Grupo
 * Muestra las pestañas para gestionar el grupo completo
 */
const DetalleGrupoScreen: React.FC<DetalleGrupoScreenProps> = ({
  navigation,
  route,
}) => {
  const { grupoId, grupoNombre } = route.params;
  const [activeTab, setActiveTab] = useState<TabType>("alumnos");

  /**
   * Pestañas disponibles
   */
  const tabs: Tab[] = [
    { id: "alumnos", label: "Alumnos", icon: "people" },
    { id: "calificaciones", label: "Calificaciones", icon: "grade" },
    { id: "asistencias", label: "Asistencias", icon: "event-available" },
    { id: "comentarios", label: "Comentarios", icon: "comment" },
    { id: "tareas", label: "Tareas", icon: "assignment" },
    { id: "graficas", label: "Gráficas", icon: "analytics" },
  ];

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

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
                color={
                  activeTab === tab.id ? COLORS.primary : COLORS.textSecondary
                }
              />
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === tab.id && styles.activeTabLabel,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Contenido de la pestaña activa */}
        <WebScrollView style={styles.content}>
          <TabContent
            activeTab={activeTab}
            navigation={navigation}
            grupoId={grupoId}
          />
        </WebScrollView>
      </SafeAreaView>

      <BottomNavBar currentScreen="Detalle de Grupo" />
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
    backgroundColor: COLORS.primary,
    padding: 20,
    paddingTop: 10,
  },
  grupoNombre: {
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
    color: "white",
  },
  grupoId: {
    fontSize: FONT_SIZES.small,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },
  tabsContainer: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tabsContent: {
    paddingHorizontal: 10,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: `${COLORS.primary}15`,
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
    padding: 20,
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
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    boxShadow: "0px 1px 3px rgba(26, 26, 26, 0.1)",
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
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
    boxShadow: "0px 2px 5px rgba(26, 26, 26, 0.1)",
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
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    boxShadow: "0px 1px 3px rgba(26, 26, 26, 0.1)",
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
    backgroundColor: COLORS.surface,
    padding: 30,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 10,
    boxShadow: "0px 2px 4px rgba(26, 26, 26, 0.15)",
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
    backgroundColor: COLORS.surface,
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    boxShadow: "0px 1px 3px rgba(26, 26, 26, 0.1)",
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
