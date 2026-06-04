import React from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
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
import { useClassroomHomeViewModel } from "../../hooks/classroom/useClassroomHomeViewModel";

type Navigation = StackNavigationProp<RootStackParamList>;

const ClassroomHomeScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>();
  const { classrooms, isLoading, error, isEmpty, totalAlumnos, totalGrupos, totalPendientes, reload } =
    useClassroomHomeViewModel();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => void reload()} />}
      >
        <View style={styles.hero}>
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>Classroom</Text>
            <Text style={styles.title}>Tus clases, actividades y alumnos en un solo lugar</Text>
            <Text style={styles.subtitle}>
              Abre un grupo para trabajar materiales, tareas, asistencia, calificaciones y reportes
              sin saltar entre modulos.
            </Text>
          </View>
          <View style={styles.heroActions}>
            <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate("CrearGrupo")}>
              <MaterialIcons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Crear grupo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate("ListaGrupos")}>
              <MaterialIcons name="list-alt" size={20} color={COLORS.primary} />
              <Text style={styles.secondaryButtonText}>Ver legacy</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.kpiGrid}>
          <KpiCard label="Grupos" value={String(totalGrupos)} icon="groups" />
          <KpiCard label="Alumnos" value={String(totalAlumnos)} icon="school" />
          <KpiCard label="Pendientes" value={String(totalPendientes)} icon="assignment-late" />
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
              <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate("CrearGrupo")}>
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

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Clases activas</Text>
          <Text style={styles.sectionCaption}>Entrada moderna; las rutas legacy siguen disponibles.</Text>
        </View>

        <View style={styles.classGrid}>
          {classrooms.map((item) => (
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
              <View style={styles.cardTopRow}>
                <View style={styles.iconBadge}>
                  <MaterialIcons name="menu-book" size={22} color={COLORS.primary} />
                </View>
                <Text style={styles.statusPill}>{item.grupo.estado}</Text>
              </View>
              <Text style={styles.classTitle}>{item.grupo.nombre}</Text>
              <Text style={styles.classSubtitle}>
                {item.grupo.materia} - {item.grupo.periodo}
              </Text>
              <View style={styles.cardMetrics}>
                <MiniMetric label="Alumnos" value={item.resumen.totalAlumnos} />
                <MiniMetric label="Actividades" value={item.resumen.totalActividades} />
                <MiniMetric label="Materiales" value={item.resumen.totalMateriales} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3F7FB",
  },
  content: {
    padding: 18,
    paddingBottom: 110,
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
    marginTop: 18,
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
    padding: 18,
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
});

export default ClassroomHomeScreen;

