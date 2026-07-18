import React, { useState } from "react";
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TextInput,
  Alert,
} from "react-native";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { COLORS, Plantilla } from "../../../types";
import { useListaPlantillasViewModel } from "../../hooks/useListaPlantillasViewModel";
import { isWeb } from "../../utils/responsive";

const FILTER_OPTIONS = [
  { id: "todos", label: "Todas" },
  { id: "examenes", label: "Exámenes" },
  { id: "presentaciones", label: "Presentaciones" },
  { id: "mapas_mentales", label: "Mapas Mentales" },
  { id: "postales", label: "Postales" },
  { id: "reportes", label: "Reportes" },
] as const;

const ListaPlantillasScreen: React.FC = () => {
  const { width } = useBreakpoint();
  const wideLayout = width >= 920;
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "ListaPlantillas">>();
  const initialCategoria = route.params?.filtroCategoria;

  const vm = useListaPlantillasViewModel(initialCategoria);
  const [, setMenuPlantilla] = useState<Plantilla | null>(null);

  const handleUsar = (plantilla: Plantilla) => {
    // Navigate to editor with this template
    navigation.navigate("EditorPlantilla", { plantillaId: plantilla.id as number });
  };

  const handleEliminar = (plantilla: Plantilla) => {
    Alert.alert("Eliminar plantilla", `¿Estás seguro de eliminar "${plantilla.nombre}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => vm.eliminarPlantilla(plantilla.id as number),
      },
    ]);
  };

  const categoriaLabel =
    vm.filtroCategoria !== "todos"
      ? FILTER_OPTIONS.find((f) => f.id === vm.filtroCategoria)?.label || vm.filtroCategoria
      : "";

  const headerTitle = categoriaLabel ? `Plantillas de ${categoriaLabel}` : "Plantillas";

  const getOrigenBadge = (plantilla: Plantilla) => {
    if (plantilla.esDelSistema) {
      return { label: "DEL SISTEMA", color: COLORS.textSecondary, bg: "#F0F0F0" };
    }
    return { label: "PERSONALIZADA", color: COLORS.purple, bg: `${COLORS.purple}14` };
  };

  const getTipoBadge = (tipo: string) => {
    const map: Record<string, { label: string; color: string }> = {
      examen: { label: "EXAMEN", color: COLORS.warning },
      presentacion: { label: "PRESENTACIÓN", color: COLORS.primary },
      mapa_mental: { label: "MAPA MENTAL", color: COLORS.purple },
      linea_tiempo: { label: "LÍNEA DE TIEMPO", color: COLORS.success },
      postal: { label: "POSTAL", color: COLORS.teal },
      reporte: { label: "REPORTE", color: COLORS.success },
    };
    return map[tipo] || { label: tipo.toUpperCase(), color: "#757575" };
  };

  const getTipoIcon = (tipo: string) => {
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
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => pressed && { opacity: 0.7 }}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color={COLORS.text} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {headerTitle}
          </Text>
          <Pressable
            style={({ pressed }) => [styles.fabSmall, pressed && { opacity: 0.8 }]}
            onPress={() => navigation.navigate("EditorPlantilla")}
          >
            <MaterialIcons name="add" size={22} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Search bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={20} color={COLORS.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar plantilla..."
              value={vm.searchQuery}
              onChangeText={vm.setSearchQuery}
              placeholderTextColor={COLORS.textTertiary}
            />
          </View>
          <Pressable style={({ pressed }) => [styles.filterBtn, pressed && { opacity: 0.7 }]}>
            <MaterialIcons name="tune" size={20} color={COLORS.textSecondary} />
          </Pressable>
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {FILTER_OPTIONS.map((f) => {
            const isActive = vm.filtroCategoria === f.id;
            return (
              <Pressable
                key={f.id}
                style={({ pressed }) => [
                  styles.chip,
                  isActive && styles.chipActive,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => vm.setFiltroCategoria(f.id)}
              >
                {isActive && f.id === "todos" && (
                  <MaterialIcons
                    name="check"
                    size={14}
                    color="#FFFFFF"
                    style={{ marginRight: 4 }}
                  />
                )}
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{f.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Content */}
        <ScrollView
          contentContainerStyle={[styles.scrollContent, wideLayout && styles.scrollContentWide]}
          showsVerticalScrollIndicator={false}
        >
          {vm.plantillasFiltradas.length === 0 ? (
            /* Empty state */
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <MaterialIcons name="dashboard-customize" size={64} color={COLORS.borderLight} />
              </View>
              <Text style={styles.emptyTitle}>
                No hay plantillas{categoriaLabel ? ` de ${categoriaLabel.toLowerCase()}` : ""} aún
              </Text>
              <Text style={styles.emptySubtitle}>
                Crea tu primera plantilla personalizada o explora las del sistema
              </Text>
              <Pressable
                style={({ pressed }) => [styles.emptyButton, pressed && { opacity: 0.8 }]}
                onPress={() => navigation.navigate("EditorPlantilla")}
              >
                <Text style={styles.emptyButtonText}>+ Crear plantilla</Text>
              </Pressable>
            </View>
          ) : (
            <>
              {/* Section header */}
              <View style={styles.recientesHeader}>
                <Text style={styles.recientesLabel}>RECIENTES</Text>
                <Pressable style={({ pressed }) => pressed && { opacity: 0.6 }}>
                  <Text style={styles.verTodo}>Ver todo</Text>
                </Pressable>
              </View>

              {vm.plantillasFiltradas.map((plantilla) => {
                const tipoBadge = getTipoBadge(plantilla.tipo);
                const origenBadge = getOrigenBadge(plantilla);
                return (
                  <View
                    key={plantilla.id}
                    style={[styles.plantillaCard, wideLayout && styles.plantillaCardWide]}
                  >
                    <View style={styles.plantillaRow}>
                      {/* Icon */}
                      <View
                        style={[styles.plantillaIcon, { backgroundColor: `${tipoBadge.color}18` }]}
                      >
                        <MaterialIcons
                          name={getTipoIcon(plantilla.tipo) as any}
                          size={24}
                          color={tipoBadge.color}
                        />
                      </View>

                      {/* Info */}
                      <View style={styles.plantillaInfo}>
                        <Text style={styles.plantillaNombre} numberOfLines={2}>
                          {plantilla.nombre}
                        </Text>
                        <Text style={styles.plantillaDescripcion} numberOfLines={1}>
                          {plantilla.descripcion}
                        </Text>
                        <View style={styles.badgesRow}>
                          <View style={[styles.badge, { backgroundColor: `${tipoBadge.color}18` }]}>
                            <Text style={[styles.badgeText, { color: tipoBadge.color }]}>
                              {tipoBadge.label}
                            </Text>
                          </View>
                          <View style={[styles.badge, { backgroundColor: origenBadge.bg }]}>
                            <Text style={[styles.badgeText, { color: origenBadge.color }]}>
                              {origenBadge.label}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.usosRow}>
                          <MaterialIcons name="schedule" size={12} color={COLORS.textTertiary} />
                          <Text style={styles.usosText}>Usado {plantilla.usosCount} veces</Text>
                        </View>
                      </View>

                      {/* Usar button */}
                      <Pressable
                        style={({ pressed }) => [styles.usarBtn, pressed && { opacity: 0.8 }]}
                        onPress={() => handleUsar(plantilla)}
                      >
                        <Text style={styles.usarBtnText}>Usar</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}

              {/* AI promo card */}
              <View style={styles.promoCard}>
                <Text style={styles.promoLabel}>ASISTENTE AI</Text>
                <Text style={styles.promoTitle}>Genera plantillas con un solo clic</Text>
                <Text style={styles.promoSubtitle}>
                  Carga tu PDF y deja que nuestra IA cree el examen perfecto.
                </Text>
                <Pressable
                  style={({ pressed }) => [styles.promoButton, pressed && { opacity: 0.8 }]}
                >
                  <Text style={styles.promoButtonText}>PROBAR AHORA</Text>
                </Pressable>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1 },
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginLeft: 12,
  },
  fabSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  // Search
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
    gap: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F4F9",
    borderRadius: 24,
    paddingHorizontal: 14,
    minHeight: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: COLORS.text,
    paddingVertical: 0,
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F4F9",
    justifyContent: "center",
    alignItems: "center",
  },
  // Chips
  chipsRow: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    flexDirection: "row",
    alignItems: "center",
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 13, fontWeight: "600", color: COLORS.textSecondary },
  chipTextActive: { color: "#FFFFFF" },
  // Scroll
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: isWeb() ? 28 : 110,
    gap: 10,
  },
  scrollContentWide: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${COLORS.primary}08`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
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
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  emptyButtonText: { fontSize: 15, fontWeight: "600", color: COLORS.primary },
  // Recientes header
  recientesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
    marginTop: 4,
  },
  recientesLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textTertiary,
    letterSpacing: 0.8,
  },
  verTodo: { fontSize: 13, fontWeight: "600", color: COLORS.primary },
  // Plantilla card
  plantillaCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primaryLight,
  },
  plantillaCardWide: { width: "48%" },
  plantillaRow: { flexDirection: "row", alignItems: "flex-start" },
  plantillaIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  plantillaInfo: { flex: 1, marginRight: 10 },
  plantillaNombre: { fontSize: 15, fontWeight: "700", color: COLORS.text, marginBottom: 3 },
  plantillaDescripcion: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 6 },
  badgesRow: { flexDirection: "row", gap: 6, marginBottom: 4 },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 10, fontWeight: "700" },
  usosRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  usosText: { fontSize: 11, color: COLORS.textTertiary },
  // Usar button
  usarBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: "center",
  },
  usarBtnText: { fontSize: 13, fontWeight: "600", color: COLORS.primary },
  // AI promo
  promoCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 24,
    marginTop: 10,
  },
  promoLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 1,
    marginBottom: 6,
  },
  promoTitle: { fontSize: 18, fontWeight: "bold", color: "#FFFFFF", marginBottom: 6 },
  promoSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 19,
    marginBottom: 16,
  },
  promoButton: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  promoButtonText: { fontSize: 12, fontWeight: "700", color: COLORS.primary },
});

export default ListaPlantillasScreen;
