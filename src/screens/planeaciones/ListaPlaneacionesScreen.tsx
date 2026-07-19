import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import ScreenBackButton from "../../components/ScreenBackButton";
import { useListaPlaneacionesViewModel } from "../../hooks/useListaPlaneacionesViewModel";
import SyncStatusChip from "../../components/sync/SyncStatusChip";
import type { PlaneacionDocumento } from "../../../types/planeacionV2";
import { NivelAcademico } from "../../../types/planeacionV2";

const buildWeeksLabel = (doc: PlaneacionDocumento): string => {
  const semanas = doc.datosGenerales.semanas;
  if (!Array.isArray(semanas) || semanas.length === 0) return "Sin semanas";
  return `Semanas ${semanas.join(", ")}`;
};

const ListaPlaneacionesScreen: React.FC = () => {
  const { colors } = useTheme();
  const vm = useListaPlaneacionesViewModel();

  const removeChip = (type: "nivel" | "asignatura" | "grado" | "inicio" | "fin") => {
    if (type === "nivel") vm.setFiltroNivel(undefined);
    if (type === "asignatura") vm.setFiltroAsignatura("");
    if (type === "grado") vm.setFiltroGrado("");
    if (type === "inicio") vm.setFiltroFechaInicio("");
    if (type === "fin") vm.setFiltroFechaFin("");
    vm.aplicarFiltros();
  };

  const renderMenu = (doc: PlaneacionDocumento) => {
    if (vm.menuVisible !== doc.id) return null;

    return (
      <View
        style={[
          styles.contextMenu,
          {
            backgroundColor: colors.surfaceContainerLowest,
            borderColor: colors.borderLight,
            shadowColor: colors.shadowBlue,
          },
        ]}
      >
        <Pressable style={styles.menuItem} onPress={() => vm.handleEditar(doc)}>
          <MaterialIcons name="edit" size={16} color={colors.primary} />
          <Text style={[styles.menuItemText, { color: colors.onSurface }]}>Editar</Text>
        </Pressable>

        <Pressable style={styles.menuItem} onPress={() => void vm.handleClonar(doc.id)}>
          <MaterialIcons name="content-copy" size={16} color={colors.primary} />
          <Text style={[styles.menuItemText, { color: colors.onSurface }]}>Clonar</Text>
        </Pressable>

        <Pressable style={styles.menuItem} onPress={() => vm.handleExportar(doc.id)}>
          <MaterialIcons name="share" size={16} color={colors.primary} />
          <Text style={[styles.menuItemText, { color: colors.onSurface }]}>Exportar</Text>
        </Pressable>

        <Pressable style={styles.menuItem} onPress={() => void vm.handleEliminar(doc.id)}>
          <MaterialIcons name="delete-outline" size={16} color={colors.error} />
          <Text style={[styles.menuItemText, { color: colors.error }]}>Eliminar</Text>
        </Pressable>
      </View>
    );
  };

  const renderCard = (doc: PlaneacionDocumento) => {
    const nivelColor = vm.getColorNivel(doc.nivelAcademico);

    return (
      <View
        key={doc.id}
        style={[
          styles.card,
          {
            backgroundColor: colors.surfaceContainerLowest,
            borderColor: colors.borderLight,
          },
        ]}
      >
        <View style={styles.cardTopRow}>
          <View style={[styles.nivelBadge, { backgroundColor: `${nivelColor}22` }]}> 
            <Text style={[styles.nivelBadgeText, { color: nivelColor }]}>
              {vm.getTextoNivel(doc.nivelAcademico)}
            </Text>
          </View>

          <Pressable
            style={styles.menuButton}
            onPress={() => vm.setMenuVisible(vm.menuVisible === doc.id ? null : doc.id)}
          >
            <MaterialIcons name="more-vert" size={20} color={colors.onSurfaceVariant} />
          </Pressable>
        </View>

        {renderMenu(doc)}

        <Pressable style={styles.cardBody} onPress={() => vm.handleEditar(doc)}>
          <Text style={[styles.cardTitle, { color: colors.onSurface }]}>
            {doc.datosGenerales.asignatura || "Sin asignatura"}
          </Text>

          <Text style={[styles.cardSub, { color: colors.onSurfaceVariant }]}>
            {doc.datosGenerales.grado || "Sin grado"}
            {doc.datosGenerales.grupos.length > 0 ? ` • ${doc.datosGenerales.grupos.join(", ")}` : ""}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MaterialIcons name="calendar-today" size={14} color={colors.onSurfaceVariant} />
              <Text style={[styles.metaText, { color: colors.onSurfaceVariant }]}>
                {buildWeeksLabel(doc)}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialIcons name="edit-calendar" size={14} color={colors.onSurfaceVariant} />
              <Text style={[styles.metaText, { color: colors.onSurfaceVariant }]}>
                {vm.formatFecha(doc.fechaModificacion)}
              </Text>
            </View>
          </View>
        </Pressable>
      </View>
    );
  };

  const hasAnyFiltro =
    Boolean(vm.filtroNivel) ||
    Boolean(vm.filtroAsignatura.trim()) ||
    Boolean(vm.filtroGrado.trim()) ||
    Boolean(vm.filtroFechaInicio.trim()) ||
    Boolean(vm.filtroFechaFin.trim());

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}> 
      <View style={styles.header}>
        <View style={styles.headerTitleWrap}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <ScreenBackButton style={{ marginLeft: -8 }} color={colors.onSurface} />
            <Text style={[styles.title, { color: colors.onSurface }]}>Mis planeaciones</Text>
          </View>
          <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
            {vm.documentosFiltrados.length} de {vm.documentos.length}
          </Text>
          {/*
            El indicador va una vez en el encabezado, no en cada tarjeta: el estado es
            global, asi que repetirlo por documento comunicaba lo mismo N veces.
          */}
          <SyncStatusChip style={styles.syncChip} testID="planeaciones-sync-chip" />
        </View>

        <View style={styles.headerActions}>
          <Pressable
            style={[
              styles.iconButton,
              { borderColor: colors.borderLight, backgroundColor: colors.surfaceContainerLow },
            ]}
            onPress={() => vm.setShowFiltros(true)}
          >
            <MaterialIcons name="filter-list" size={20} color={colors.primary} />
          </Pressable>

          <Pressable
            style={[
              styles.iconButton,
              { borderColor: colors.primary, backgroundColor: colors.primaryContainer },
            ]}
            onPress={vm.handleCrearNueva}
          >
            <MaterialIcons name="add" size={20} color={colors.primary} />
          </Pressable>
        </View>
      </View>

      <View
        style={[
          styles.searchBox,
          {
            borderColor: colors.borderLight,
            backgroundColor: colors.surfaceContainerLow,
          },
        ]}
      >
        <MaterialIcons name="search" size={18} color={colors.onSurfaceVariant} />
        <TextInput
          style={[styles.searchInput, { color: colors.onSurface }]}
          placeholder="Buscar por asignatura, grado, contenido..."
          placeholderTextColor={colors.textMuted}
          value={vm.searchQuery}
          onChangeText={vm.setSearchQuery}
        />
      </View>

      {hasAnyFiltro ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipsRow}>
          {vm.filtroNivel ? (
            <Pressable
              style={[styles.filterChip, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.borderLight }]}
              onPress={() => removeChip("nivel")}
            >
              <Text style={[styles.filterChipText, { color: colors.onSurface }]}>
                {vm.getTextoNivel(vm.filtroNivel)}
              </Text>
              <MaterialIcons name="close" size={14} color={colors.onSurfaceVariant} />
            </Pressable>
          ) : null}

          {vm.filtroAsignatura ? (
            <Pressable
              style={[styles.filterChip, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.borderLight }]}
              onPress={() => removeChip("asignatura")}
            >
              <Text style={[styles.filterChipText, { color: colors.onSurface }]}>{vm.filtroAsignatura}</Text>
              <MaterialIcons name="close" size={14} color={colors.onSurfaceVariant} />
            </Pressable>
          ) : null}

          {vm.filtroGrado ? (
            <Pressable
              style={[styles.filterChip, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.borderLight }]}
              onPress={() => removeChip("grado")}
            >
              <Text style={[styles.filterChipText, { color: colors.onSurface }]}>{vm.filtroGrado}</Text>
              <MaterialIcons name="close" size={14} color={colors.onSurfaceVariant} />
            </Pressable>
          ) : null}

          {vm.filtroFechaInicio ? (
            <Pressable
              style={[styles.filterChip, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.borderLight }]}
              onPress={() => removeChip("inicio")}
            >
              <Text style={[styles.filterChipText, { color: colors.onSurface }]}>Desde {vm.filtroFechaInicio}</Text>
              <MaterialIcons name="close" size={14} color={colors.onSurfaceVariant} />
            </Pressable>
          ) : null}

          {vm.filtroFechaFin ? (
            <Pressable
              style={[styles.filterChip, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.borderLight }]}
              onPress={() => removeChip("fin")}
            >
              <Text style={[styles.filterChipText, { color: colors.onSurface }]}>Hasta {vm.filtroFechaFin}</Text>
              <MaterialIcons name="close" size={14} color={colors.onSurfaceVariant} />
            </Pressable>
          ) : null}

          <Pressable onPress={vm.limpiarFiltros}>
            <Text style={[styles.clearText, { color: colors.primary }]}>Limpiar</Text>
          </Pressable>
        </ScrollView>
      ) : null}

      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {vm.documentosFiltrados.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="description" size={72} color={colors.onSurfaceVariant} />
            <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>No hay planeaciones</Text>
            <Text style={[styles.emptySubtitle, { color: colors.onSurfaceVariant }]}>
              Crea una nueva planeacion o ajusta tus filtros para ver resultados.
            </Text>
            <Pressable
              style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
              onPress={vm.handleCrearNueva}
            >
              <MaterialIcons name="add" size={18} color={colors.surface} />
              <Text style={[styles.primaryBtnText, { color: colors.surface }]}>Nueva planeacion</Text>
            </Pressable>
          </View>
        ) : (
          vm.documentosFiltrados.map(renderCard)
        )}
        <View style={{ height: 30 }} />
      </ScrollView>

      <Modal
        visible={vm.showFiltros}
        transparent
        animationType="slide"
        onRequestClose={() => vm.setShowFiltros(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.surfaceContainerLowest,
                borderColor: colors.borderLight,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.onSurface }]}>Filtros</Text>
              <Pressable onPress={() => vm.setShowFiltros(false)}>
                <MaterialIcons name="close" size={22} color={colors.onSurfaceVariant} />
              </Pressable>
            </View>

            <Text style={[styles.modalLabel, { color: colors.onSurfaceVariant }]}>Nivel academico</Text>
            <View style={styles.levelsRow}>
              {Object.values(NivelAcademico).map((nivel) => {
                const selected = vm.filtroNivel === nivel;
                const nivelColor = vm.getColorNivel(nivel);
                return (
                  <Pressable
                    key={nivel}
                    style={[
                      styles.levelChip,
                      {
                        borderColor: selected ? nivelColor : colors.borderLight,
                        backgroundColor: selected ? `${nivelColor}22` : colors.surfaceContainerLow,
                      },
                    ]}
                    onPress={() => vm.setFiltroNivel(vm.filtroNivel === nivel ? undefined : nivel)}
                  >
                    <Text style={[styles.levelChipText, { color: selected ? nivelColor : colors.onSurfaceVariant }]}>
                      {vm.getTextoNivel(nivel)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.modalLabel, { color: colors.onSurfaceVariant }]}>Asignatura</Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  borderColor: colors.borderLight,
                  backgroundColor: colors.surfaceContainerLow,
                  color: colors.onSurface,
                },
              ]}
              value={vm.filtroAsignatura}
              onChangeText={vm.setFiltroAsignatura}
              placeholder="Espanol, Matematicas..."
              placeholderTextColor={colors.textMuted}
            />

            <Text style={[styles.modalLabel, { color: colors.onSurfaceVariant }]}>Grado</Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  borderColor: colors.borderLight,
                  backgroundColor: colors.surfaceContainerLow,
                  color: colors.onSurface,
                },
              ]}
              value={vm.filtroGrado}
              onChangeText={vm.setFiltroGrado}
              placeholder="2do, 3A..."
              placeholderTextColor={colors.textMuted}
            />

            <View style={styles.dualRow}>
              <View style={styles.dualCol}>
                <Text style={[styles.modalLabel, { color: colors.onSurfaceVariant }]}>Fecha inicio</Text>
                <TextInput
                  style={[
                    styles.modalInput,
                    {
                      borderColor: colors.borderLight,
                      backgroundColor: colors.surfaceContainerLow,
                      color: colors.onSurface,
                    },
                  ]}
                  value={vm.filtroFechaInicio}
                  onChangeText={vm.setFiltroFechaInicio}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={styles.dualCol}>
                <Text style={[styles.modalLabel, { color: colors.onSurfaceVariant }]}>Fecha fin</Text>
                <TextInput
                  style={[
                    styles.modalInput,
                    {
                      borderColor: colors.borderLight,
                      backgroundColor: colors.surfaceContainerLow,
                      color: colors.onSurface,
                    },
                  ]}
                  value={vm.filtroFechaFin}
                  onChangeText={vm.setFiltroFechaFin}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={[
                  styles.secondaryBtn,
                  {
                    borderColor: colors.borderLight,
                    backgroundColor: colors.surfaceContainerLow,
                  },
                ]}
                onPress={vm.limpiarFiltros}
              >
                <Text style={[styles.secondaryBtnText, { color: colors.onSurfaceVariant }]}>Limpiar</Text>
              </Pressable>

              <Pressable
                style={[styles.primaryBtnModal, { backgroundColor: colors.primary }]}
                onPress={vm.aplicarFiltros}
              >
                <Text style={[styles.primaryBtnText, { color: colors.surface }]}>Aplicar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  headerTitleWrap: {
    gap: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "600",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    borderWidth: 1,
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  searchBox: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 44,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 8,
  },
  filterChipsRow: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
    alignItems: "center",
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  clearText: {
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 10,
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    gap: 8,
    position: "relative",
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nivelBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  nivelBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  menuButton: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  contextMenu: {
    position: "absolute",
    top: 38,
    right: 12,
    zIndex: 12,
    minWidth: 142,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 4,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 7,
  },
  menuItem: {
    minHeight: 34,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  menuItemText: {
    fontSize: 13,
    fontWeight: "600",
  },
  cardBody: {
    gap: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  cardSub: {
    fontSize: 13,
    fontWeight: "600",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    fontSize: 12,
  },
  syncChip: {
    alignSelf: "flex-start",
    marginTop: 6,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 56,
    paddingBottom: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  emptySubtitle: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    maxWidth: 320,
  },
  primaryBtn: {
    marginTop: 10,
    minHeight: 42,
    borderRadius: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  primaryBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 20,
    gap: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
  levelsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },
  levelChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  levelChipText: {
    fontSize: 12,
    fontWeight: "700",
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    minHeight: 40,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  dualRow: {
    flexDirection: "row",
    gap: 8,
  },
  dualCol: {
    flex: 1,
    gap: 4,
  },
  modalActions: {
    marginTop: 10,
    flexDirection: "row",
    gap: 8,
  },
  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },
  primaryBtnModal: {
    flex: 1,
    borderRadius: 10,
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ListaPlaneacionesScreen;
