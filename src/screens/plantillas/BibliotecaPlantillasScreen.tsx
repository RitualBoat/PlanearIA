import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { COLORS } from "../../../types";
import { usePlantillas } from "../../context/PlantillasContext";
import { isWeb } from "../../utils/responsive";

type Nav = StackNavigationProp<RootStackParamList>;

const CATEGORIAS = [
  { key: "examenes", label: "Exámenes", icon: "quiz", color: COLORS.warning },
  {
    key: "presentaciones",
    label: "Presentaciones",
    icon: "play-circle-filled",
    color: COLORS.primary,
  },
  {
    key: "mapas_mentales",
    label: "Mapas Mentales",
    icon: "dashboard-customize",
    color: COLORS.purple,
  },
  { key: "postales", label: "Postales", icon: "mail", color: COLORS.teal },
] as const;

const BibliotecaPlantillasScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { plantillas } = usePlantillas();
  const { width } = useWindowDimensions();
  const wideLayout = width >= 920;

  const getCount = (cat: string) => plantillas.filter((p) => p.categoria === cat).length;

  // Get recent plantillas sorted by fechaModificacion
  const recientes = [...plantillas]
    .filter((p) => !p.tags?.includes("__borrador__"))
    .sort(
      (a, b) => new Date(b.fechaModificacion).getTime() - new Date(a.fechaModificacion).getTime()
    )
    .slice(0, 2);

  const borradores = plantillas.filter((p) => p.tags?.includes("__borrador__"));

  const getCatLabel = (tipo: string): string => {
    const labels: Record<string, string> = {
      examen: "EXAMEN",
      presentacion: "PRESENTACIÓN",
      mapa_mental: "MAPA MENTAL",
      linea_tiempo: "LÍNEA DE TIEMPO",
      postal: "POSTAL",
      reporte: "REPORTE",
    };
    return labels[tipo] || tipo.toUpperCase();
  };

  const getCatColor = (tipo: string): string => {
    const colors: Record<string, string> = {
      examen: COLORS.warning,
      presentacion: COLORS.primary,
      mapa_mental: COLORS.purple,
      linea_tiempo: COLORS.success,
      postal: COLORS.teal,
      reporte: COLORS.success,
    };
    return colors[tipo] || "#757575";
  };

  const getCatIcon = (tipo: string): string => {
    const icons: Record<string, string> = {
      examen: "quiz",
      presentacion: "play-circle-filled",
      mapa_mental: "dashboard-customize",
      linea_tiempo: "timeline",
      postal: "mail",
      reporte: "assessment",
    };
    return icons[tipo] || "description";
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.surface} barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            wideLayout && { maxWidth: 700, alignSelf: "center" as const },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Animated pill */}
          <View style={styles.pillContainer}>
            <View style={styles.pill}>
              <MaterialIcons name="auto-awesome" size={14} color={COLORS.primary} />
              <Text style={styles.pillText}>BIBLIOTECA DOCENTE</Text>
            </View>
          </View>

          {/* Hero */}
          <Text style={styles.heroTitle}>Plantillas listas para usar</Text>
          <Text style={styles.heroSubtitle}>
            Ahorra tiempo con plantillas prediseñadas para exámenes, presentaciones y más.
          </Text>

          {/* CATEGORÍAS */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>CATEGORÍAS</Text>
            <TouchableOpacity onPress={() => navigation.navigate("ListaPlantillas")}>
              <Text style={styles.seeAll}>Ver todas</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.categoriaGrid}>
            {CATEGORIAS.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={styles.categoriaCard}
                activeOpacity={0.8}
                onPress={() => navigation.navigate("ListaPlantillas", { filtroCategoria: cat.key })}
              >
                <View style={[styles.categoriaIconCircle, { backgroundColor: `${cat.color}18` }]}>
                  <MaterialIcons name={cat.icon as any} size={28} color={cat.color} />
                </View>
                <Text style={styles.categoriaLabel}>{cat.label}</Text>
                <Text style={[styles.categoriaCount, { color: cat.color }]}>
                  {getCount(cat.key)} PLANTILLAS
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* RECIENTES */}
          <Text style={[styles.sectionTitle, { marginTop: 28, marginBottom: 12 }]}>RECIENTES</Text>

          {recientes.length === 0 ? (
            <View style={styles.emptyRecientes}>
              <Text style={styles.emptyRecientesText}>Aún no tienes plantillas recientes</Text>
            </View>
          ) : (
            recientes.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={styles.recienteCard}
                activeOpacity={0.8}
                onPress={() =>
                  navigation.navigate("DetallePlantilla", { plantillaId: p.id as number })
                }
              >
                <View
                  style={[styles.recienteIcon, { backgroundColor: `${getCatColor(p.tipo)}18` }]}
                >
                  <MaterialIcons
                    name={getCatIcon(p.tipo) as any}
                    size={22}
                    color={getCatColor(p.tipo)}
                  />
                </View>
                <View style={styles.recienteInfo}>
                  <View style={styles.recienteBadgeRow}>
                    <View
                      style={[
                        styles.recienteBadge,
                        { backgroundColor: `${getCatColor(p.tipo)}18` },
                      ]}
                    >
                      <Text style={[styles.recienteBadgeText, { color: getCatColor(p.tipo) }]}>
                        {getCatLabel(p.tipo)}
                      </Text>
                    </View>
                    <View style={styles.usosRow}>
                      <MaterialIcons name="schedule" size={12} color={COLORS.textTertiary} />
                      <Text style={styles.usosText}>Usado {p.usosCount} veces</Text>
                    </View>
                  </View>
                  <Text style={styles.recienteNombre} numberOfLines={1}>
                    {p.nombre}
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={22} color={COLORS.textTertiary} />
              </TouchableOpacity>
            ))
          )}

          {/* BORRADORES */}
          {borradores.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: 28, marginBottom: 12 }]}>
                MIS BORRADORES
              </Text>
              {borradores.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={styles.recienteCard}
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate("EditorPlantilla", { plantillaId: p.id as number })
                  }
                >
                  <View
                    style={[styles.recienteIcon, { backgroundColor: `${getCatColor(p.tipo)}18` }]}
                  >
                    <MaterialIcons
                      name={getCatIcon(p.tipo) as any}
                      size={22}
                      color={getCatColor(p.tipo)}
                    />
                  </View>
                  <View style={styles.recienteInfo}>
                    <View style={styles.recienteBadgeRow}>
                      <View style={[styles.recienteBadge, { backgroundColor: "#FFF3E0" }]}>
                        <Text style={[styles.recienteBadgeText, { color: COLORS.warning }]}>
                          BORRADOR
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.recienteNombre} numberOfLines={1}>
                      {p.nombre}
                    </Text>
                  </View>
                  <MaterialIcons name="edit" size={20} color={COLORS.textTertiary} />
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* Banner */}
          <View style={styles.banner}>
            <View style={styles.bannerContent}>
              <MaterialIcons
                name="bookmarks"
                size={24}
                color="#FFFFFF"
                style={{ marginBottom: 8 }}
              />
              <Text style={styles.bannerTitle}>Crea tus propias plantillas</Text>
              <Text style={styles.bannerSubtitle}>
                Personaliza cada detalle para que se adapte perfectamente a tus clases.
              </Text>
              <TouchableOpacity
                style={styles.bannerButton}
                activeOpacity={0.8}
                onPress={() => navigation.navigate("EditorPlantilla")}
              >
                <Text style={styles.bannerButtonText}>Empezar ahora</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: isWeb() ? 28 : 110,
  },
  // Pill
  pillContainer: { marginTop: 16, marginBottom: 12 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 6,
  },
  pillText: { fontSize: 11, fontWeight: "700", color: COLORS.primary, letterSpacing: 0.5 },
  // Hero
  heroTitle: { fontSize: 24, fontWeight: "bold", color: COLORS.text, marginBottom: 6 },
  heroSubtitle: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20, marginBottom: 24 },
  // Section
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 12, fontWeight: "700", color: COLORS.textTertiary, letterSpacing: 0.8 },
  seeAll: { fontSize: 13, fontWeight: "600", color: COLORS.primary },
  // Categories grid
  categoriaGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  categoriaCard: {
    width: "47%",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 18,
    alignItems: "flex-start",
  },
  categoriaIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  categoriaLabel: { fontSize: 15, fontWeight: "600", color: COLORS.text, marginBottom: 4 },
  categoriaCount: { fontSize: 11, fontWeight: "700", letterSpacing: 0.3 },
  // Recientes
  emptyRecientes: { paddingVertical: 20, alignItems: "center" },
  emptyRecientesText: { fontSize: 14, color: COLORS.textTertiary },
  recienteCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  recienteIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  recienteInfo: { flex: 1 },
  recienteBadgeRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  recienteBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  recienteBadgeText: { fontSize: 10, fontWeight: "700" },
  usosRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  usosText: { fontSize: 11, color: COLORS.textTertiary },
  recienteNombre: { fontSize: 15, fontWeight: "600", color: COLORS.text },
  // Banner
  banner: {
    marginTop: 28,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: COLORS.primary,
  },
  bannerContent: { padding: 24 },
  bannerTitle: { fontSize: 18, fontWeight: "bold", color: "#FFFFFF", marginBottom: 6 },
  bannerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 19,
    marginBottom: 16,
  },
  bannerButton: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  bannerButtonText: { fontSize: 13, fontWeight: "700", color: COLORS.text },
});

export default BibliotecaPlantillasScreen;
