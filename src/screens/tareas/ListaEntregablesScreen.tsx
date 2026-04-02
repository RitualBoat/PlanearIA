import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { COLORS, FONT_SIZES, Tarea } from "../../../types";
import { useEntregables } from "../../context/EntregablesContext";
import { useGruposContext } from "../../context/GruposContext";

type Nav = StackNavigationProp<RootStackParamList>;

type FiltroTipo = "todos" | "tarea" | "examen" | "proyecto";

const TIPO_ICONS: Record<string, { name: string; color: string; bg: string }> = {
  tarea: { name: "description", color: COLORS.primary, bg: `${COLORS.primary}15` },
  examen: { name: "quiz", color: "#E67E22", bg: "#FFF3E0" },
  proyecto: { name: "architecture", color: "#E67E22", bg: "#FFF3E0" },
  investigacion: { name: "manage-search", color: COLORS.textSecondary, bg: "#F0F0F0" },
};

const ESTADO_COLORS: Record<string, { dot: string; text: string }> = {
  asignada: { dot: COLORS.success, text: COLORS.success },
  en_progreso: { dot: "#E67E22", text: "#E67E22" },
  finalizada: { dot: COLORS.textSecondary, text: COLORS.textSecondary },
};

const ESTADO_LABELS: Record<string, string> = {
  asignada: "ACTIVA",
  en_progreso: "EN PROGRESO",
  finalizada: "FINALIZADA",
};

const ListaEntregablesScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { entregables } = useEntregables();
  const { grupos } = useGruposContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>("todos");

  const gruposMap = useMemo(() => {
    const map: Record<number, string> = {};
    grupos.forEach((g) => {
      if (g.id != null) {
        map[g.id] = `${g.nombre ?? ""}`;
      }
    });
    return map;
  }, [grupos]);

  const gruposCount = useMemo(() => {
    const ids = new Set(entregables.map((e) => e.grupoId));
    return ids.size;
  }, [entregables]);

  const filtered = useMemo(() => {
    let result = entregables;
    if (filtroTipo !== "todos") {
      result = result.filter((e) => e.tipo === filtroTipo);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.titulo.toLowerCase().includes(q) ||
          (gruposMap[e.grupoId as number] ?? "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [entregables, filtroTipo, searchQuery, gruposMap]);

  const filtros: { key: FiltroTipo; label: string }[] = [
    { key: "todos", label: "Todos" },
    { key: "tarea", label: "Tareas" },
    { key: "examen", label: "Exámenes" },
    { key: "proyecto", label: "Proyectos" },
  ];

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const months = [
      "ENE",
      "FEB",
      "MAR",
      "ABR",
      "MAY",
      "JUN",
      "JUL",
      "AGO",
      "SEP",
      "OCT",
      "NOV",
      "DIC",
    ];
    return `${d.getDate()} ${months[d.getMonth()]}`;
  };

  const handleCrearEntregable = () => {
    // Navigate to crear without a grupoId — user needs to pick one
    // For now navigate to grupos first; the crear screen needs a grupoId
    navigation.navigate("ListaGrupos");
  };

  const handleEntregablePress = (entregable: Tarea) => {
    navigation.navigate("CrearTareaGrupo", {
      grupoId: entregable.grupoId as number,
      entregableId: entregable.id,
    });
  };

  const renderEntregableCard = ({ item }: { item: Tarea }) => {
    const icon = TIPO_ICONS[item.tipo] ?? TIPO_ICONS.tarea;
    const estadoStyle = ESTADO_COLORS[item.estado] ?? ESTADO_COLORS.asignada;
    const estadoLabel = ESTADO_LABELS[item.estado] ?? item.estado;
    const grupoNombre = gruposMap[item.grupoId as number] ?? `Grupo ${item.grupoId}`;

    return (
      <TouchableOpacity
        style={styles.entregableCard}
        onPress={() => handleEntregablePress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: icon.bg }]}>
            <MaterialIcons name={icon.name as any} size={22} color={icon.color} />
          </View>
          <TouchableOpacity style={styles.moreButton}>
            <MaterialIcons name="more-vert" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.cardTitle}>{item.titulo}</Text>

        <View style={styles.grupoRow}>
          <MaterialIcons name="groups" size={16} color={COLORS.textSecondary} />
          <Text style={styles.grupoText}>{grupoNombre}</Text>
        </View>

        <View style={styles.chipsRow}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{item.valor} PTS</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{formatDate(item.fechaEntrega)}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.estadoRow}>
            <View style={[styles.estadoDot, { backgroundColor: estadoStyle.dot }]} />
            <Text style={[styles.estadoText, { color: estadoStyle.text }]}>{estadoLabel}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={COLORS.textSecondary} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <MaterialIcons name="assignment" size={48} color={COLORS.primary} />
      </View>
      <View style={styles.emptyBadge}>
        <Text style={styles.emptyBadgeText}>Vacío</Text>
      </View>

      <Text style={styles.emptyTitle}>No tienes entregables creados</Text>
      <Text style={styles.emptySubtitle}>
        Crea tu primer entregable para asignar tareas, exámenes o proyectos a tus grupos de manera
        automatizada con IA.
      </Text>

      <TouchableOpacity style={styles.emptyButton} onPress={handleCrearEntregable}>
        <Text style={styles.emptyButtonText}>Crear Primer Entregable</Text>
        <MaterialIcons name="add" size={20} color="white" />
      </TouchableOpacity>

      {/* Feature cards */}
      <View style={styles.featuresList}>
        <View style={styles.featureCard}>
          <View style={[styles.featureIcon, { backgroundColor: "#FFF3E0" }]}>
            <MaterialIcons name="quiz" size={22} color="#E67E22" />
          </View>
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>Exámenes Rápidos</Text>
            <Text style={styles.featureDesc}>Genera evaluaciones personalizadas en segundos.</Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <View style={[styles.featureIcon, { backgroundColor: `${COLORS.primary}15` }]}>
            <MaterialIcons name="auto-awesome" size={22} color={COLORS.primary} />
          </View>
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>Proyectos con IA</Text>
            <Text style={styles.featureDesc}>
              Diseña rúbricas y objetivos complejos fácilmente.
            </Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <View style={[styles.featureIcon, { backgroundColor: "#E8F5E9" }]}>
            <MaterialIcons name="date-range" size={22} color={COLORS.success} />
          </View>
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>Planificación Semanal</Text>
            <Text style={styles.featureDesc}>Organiza las entregas de todo el trimestre.</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="menu" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Entregables</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleCrearEntregable}>
            <MaterialIcons name="add-circle" size={28} color="white" />
          </TouchableOpacity>
        </View>

        {entregables.length > 0 ? (
          <FlatList
            data={filtered}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderEntregableCard}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <View>
                {/* Resumen */}
                <View style={styles.resumenContainer}>
                  <Text style={styles.resumenLabel}>RESUMEN DE ACTIVIDADES</Text>
                  <View style={styles.resumenRow}>
                    <Text style={styles.resumenNumber}>{entregables.length}</Text>
                    <Text style={styles.resumenText}> entregables</Text>
                    <Text style={styles.resumenDot}> · </Text>
                    <Text style={styles.resumenNumber}>{gruposCount}</Text>
                    <Text style={styles.resumenText}> grupos</Text>
                  </View>
                </View>

                {/* Search */}
                <View style={styles.searchContainer}>
                  <MaterialIcons name="search" size={20} color={COLORS.textSecondary} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar entregable..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={COLORS.textSecondary}
                  />
                </View>

                {/* Filtros */}
                <View style={styles.filtrosContainer}>
                  {filtros.map((f) => (
                    <TouchableOpacity
                      key={f.key}
                      style={[styles.filtroPill, filtroTipo === f.key && styles.filtroPillActive]}
                      onPress={() => setFiltroTipo(f.key)}
                    >
                      <Text
                        style={[
                          styles.filtroPillText,
                          filtroTipo === f.key && styles.filtroPillTextActive,
                        ]}
                      >
                        {f.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            }
            ListEmptyComponent={
              <Text style={styles.noResults}>No se encontraron entregables con ese filtro.</Text>
            }
          />
        ) : (
          <FlatList
            data={[]}
            keyExtractor={() => "empty"}
            renderItem={() => null}
            ListHeaderComponent={
              <View style={styles.emptySearchContainer}>
                <View style={styles.searchContainer}>
                  <MaterialIcons name="search" size={20} color={COLORS.textSecondary} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar entregables..."
                    placeholderTextColor={COLORS.textSecondary}
                    editable={false}
                  />
                </View>
              </View>
            }
            ListEmptyComponent={renderEmptyState()}
          />
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
    color: "white",
  },
  addButton: {
    padding: 2,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  resumenContainer: {
    paddingTop: 20,
    paddingBottom: 16,
  },
  resumenLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  resumenRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  resumenNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
  },
  resumenText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  resumenDot: {
    fontSize: FONT_SIZES.large,
    color: COLORS.textSecondary,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
    padding: 0,
  },
  filtrosContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  filtroPill: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  filtroPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filtroPillText: {
    fontSize: FONT_SIZES.small,
    fontWeight: "600",
    color: COLORS.text,
  },
  filtroPillTextActive: {
    color: "white",
  },
  entregableCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  moreButton: {
    padding: 4,
  },
  cardTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 6,
  },
  grupoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  grupoText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    backgroundColor: COLORS.backgroundSoft,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  estadoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  estadoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  estadoText: {
    fontSize: FONT_SIZES.small,
    fontWeight: "bold",
    letterSpacing: 0.3,
  },
  noResults: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    textAlign: "center",
    paddingVertical: 40,
  },
  // Empty state
  emptySearchContainer: {
    paddingHorizontal: 0,
    paddingTop: 16,
  },
  emptyContainer: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${COLORS.primary}10`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  emptyBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-end",
    marginTop: -20,
    marginRight: 80,
    marginBottom: 20,
  },
  emptyBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xxlarge,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 25,
    gap: 8,
    marginBottom: 30,
  },
  emptyButtonText: {
    color: "white",
    fontSize: FONT_SIZES.medium,
    fontWeight: "bold",
  },
  featuresList: {
    width: "100%",
    gap: 4,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: FONT_SIZES.medium,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
  },
});

export default ListaEntregablesScreen;
