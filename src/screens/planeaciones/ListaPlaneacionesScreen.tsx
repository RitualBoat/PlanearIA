import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { COLORS, FONT_SIZES } from "../../../types";
import BottomNavBar from "../../components/BottomNavBar";
import SyncIndicator from "../../components/SyncIndicator";
import {
  NivelAcademico,
  Planeacion,
  PlaneacionUniversidad,
} from "../../../types/planeacion";
import { useListaPlaneacionesViewModel } from "../../hooks/useListaPlaneacionesViewModel";

/**
 * Pantalla de lista de planeaciones (View)
 * Solo JSX y StyleSheet - la logica vive en useListaPlaneacionesViewModel
 */
const ListaPlaneacionesScreen: React.FC = () => {
  const {
    planeacionesFiltradas,
    showFiltros,
    setShowFiltros,
    menuVisible,
    setMenuVisible,
    filtroNivel,
    setFiltroNivel,
    filtroAsignatura,
    setFiltroAsignatura,
    filtroGrado,
    setFiltroGrado,
    aplicarFiltros,
    limpiarFiltros,
    formatearFecha,
    getColorNivel,
    getTextoNivel,
    handleEditar,
    handleClonar,
    handleEliminar,
    handleExportar,
    handleCrearNueva,
  } = useListaPlaneacionesViewModel();

  /**
   * Renderiza una card de planeación
   */
  const renderPlaneacion = ({ item }: { item: Planeacion }) => {
    const isMenuOpen = menuVisible === item.id;
    const isUniversidadDetallada =
      item.nivelAcademico === NivelAcademico.UNIVERSIDAD &&
      (item as PlaneacionUniversidad).semanas &&
      (item as PlaneacionUniversidad).semanas!.length > 0;

    return (
      <View style={styles.card}>
        {/* Badge de nivel */}
        <View
          style={[
            styles.badge,
            { backgroundColor: getColorNivel(item.nivelAcademico) },
          ]}
        >
          <Text style={styles.badgeText}>
            {getTextoNivel(item.nivelAcademico)}
          </Text>
        </View>

        {/* Badge de modo detallado para Universidad */}
        {isUniversidadDetallada && (
          <View style={[styles.badge, styles.badgeDetallado]}>
            <Text style={styles.badgeText}>
              {
                (item as PlaneacionUniversidad).configuracionCurso!
                  .duracionSemanas
              }{" "}
              sem
            </Text>
          </View>
        )}

        {/* Botón de menú */}
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setMenuVisible(isMenuOpen ? null : item.id)}
        >
          <MaterialIcons name="more-vert" size={24} color={COLORS.text} />
        </TouchableOpacity>

        {/* Menu contextual */}
        {isMenuOpen && (
          <View style={styles.contextMenu}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleEditar(item)}
            >
              <MaterialIcons name="edit" size={20} color={COLORS.primary} />
              <Text style={styles.menuItemText}>Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleClonar(item.id)}
            >
              <MaterialIcons
                name="content-copy"
                size={20}
                color={COLORS.primary}
              />
              <Text style={styles.menuItemText}>Clonar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleEliminar(item.id)}
            >
              <MaterialIcons name="delete" size={20} color="#f44336" />
              <Text style={[styles.menuItemText, { color: "#f44336" }]}>
                Eliminar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleExportar(item.id)}
            >
              <MaterialIcons name="share" size={20} color={COLORS.primary} />
              <Text style={styles.menuItemText}>Exportar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Contenido de la card */}
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => handleEditar(item)}
        >
          <Text style={styles.cardAsignatura}>{item.asignatura}</Text>
          <Text style={styles.cardGrado}>
            {item.grado} {item.grupo && `"${item.grupo}"`}
          </Text>
          <Text style={styles.cardTema} numberOfLines={2}>
            {item.temaSesion}
          </Text>

          {/* Info adicional para Universidad detallada */}
          {isUniversidadDetallada && (
            <View style={styles.detalleCurso}>
              <View style={styles.detalleItem}>
                <MaterialIcons
                  name="library-books"
                  size={14}
                  color={COLORS.textSecondary}
                />
                <Text style={styles.detalleText}>
                  {(item as PlaneacionUniversidad).semanas!.length} semanas
                </Text>
              </View>
              {(item as PlaneacionUniversidad).evaluaciones &&
                (item as PlaneacionUniversidad).evaluaciones!.length > 0 && (
                  <View style={styles.detalleItem}>
                    <MaterialIcons
                      name="assessment"
                      size={14}
                      color={COLORS.textSecondary}
                    />
                    <Text style={styles.detalleText}>
                      {(item as PlaneacionUniversidad).evaluaciones!.length}{" "}
                      evaluaciones (
                      {(item as PlaneacionUniversidad).evaluaciones!.reduce(
                        (sum, ev) => sum + ev.porcentaje,
                        0,
                      )}
                      %)
                    </Text>
                  </View>
                )}
              <View style={styles.detalleItem}>
                <MaterialIcons
                  name="schedule"
                  size={14}
                  color={COLORS.textSecondary}
                />
                <Text style={styles.detalleText}>
                  {(item as PlaneacionUniversidad).configuracionCurso!
                    .horasTeoricas +
                    (item as PlaneacionUniversidad).configuracionCurso!
                      .horasPracticas}{" "}
                  hrs •{" "}
                  {(item as PlaneacionUniversidad).configuracionCurso!.creditos}{" "}
                  créditos
                </Text>
              </View>
            </View>
          )}

          <View style={styles.cardFooter}>
            <View style={styles.cardFooterItem}>
              <MaterialIcons
                name="calendar-today"
                size={16}
                color={COLORS.textSecondary}
              />
              <Text style={styles.cardFooterText}>
                {formatearFecha(item.fecha)}
              </Text>
            </View>
            {!isUniversidadDetallada && (
              <View style={styles.cardFooterItem}>
                <MaterialIcons
                  name="access-time"
                  size={16}
                  color={COLORS.textSecondary}
                />
                <Text style={styles.cardFooterText}>
                  {item.horaInicio} • {item.duracionTotal} min
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  /**
   * Renderiza el estado vacío
   */
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons
        name="description"
        size={80}
        color={COLORS.textSecondary}
      />
      <Text style={styles.emptyTitle}>No hay planeaciones</Text>
      <Text style={styles.emptySubtitle}>
        {planeacionesFiltradas.length === 0 && planeaciones.length > 0
          ? "No se encontraron planeaciones con los filtros aplicados"
          : "Crea tu primera planeación para comenzar"}
      </Text>
      <TouchableOpacity style={styles.createButton} onPress={handleCrearNueva}>
        <MaterialIcons name="add" size={24} color="white" />
        <Text style={styles.createButtonText}>Nueva Planeación</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <FlatList
        data={planeacionesFiltradas}
        renderItem={renderPlaneacion}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={true}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={styles.title}>Mis Planeaciones</Text>
                <SyncIndicator />
              </View>
              <View style={styles.headerButtons}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => setShowFiltros(true)}
                >
                  <MaterialIcons
                    name="filter-list"
                    size={24}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={handleCrearNueva}
                >
                  <MaterialIcons
                    name="add-circle"
                    size={24}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Chips de filtros activos */}
            {(filtroNivel || filtroAsignatura || filtroGrado) && (
              <View style={styles.activeFilters}>
                {filtroNivel && (
                  <View style={styles.filterChip}>
                    <Text style={styles.filterChipText}>
                      {getTextoNivel(filtroNivel)}
                    </Text>
                    <TouchableOpacity onPress={() => setFiltroNivel(undefined)}>
                      <MaterialIcons
                        name="close"
                        size={16}
                        color={COLORS.text}
                      />
                    </TouchableOpacity>
                  </View>
                )}
                {filtroAsignatura && (
                  <View style={styles.filterChip}>
                    <Text style={styles.filterChipText}>
                      {filtroAsignatura}
                    </Text>
                    <TouchableOpacity onPress={() => setFiltroAsignatura("")}>
                      <MaterialIcons
                        name="close"
                        size={16}
                        color={COLORS.text}
                      />
                    </TouchableOpacity>
                  </View>
                )}
                {filtroGrado && (
                  <View style={styles.filterChip}>
                    <Text style={styles.filterChipText}>{filtroGrado}</Text>
                    <TouchableOpacity onPress={() => setFiltroGrado("")}>
                      <MaterialIcons
                        name="close"
                        size={16}
                        color={COLORS.text}
                      />
                    </TouchableOpacity>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.clearFiltersButton}
                  onPress={limpiarFiltros}
                >
                  <Text style={styles.clearFiltersText}>Limpiar</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        }
      />

      {/* Modal de filtros */}
      <Modal
        visible={showFiltros}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFiltros(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtrar Planeaciones</Text>
              <TouchableOpacity onPress={() => setShowFiltros(false)}>
                <MaterialIcons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {/* Filtro por nivel */}
            <Text style={styles.filterLabel}>Nivel Académico</Text>
            <View style={styles.nivelButtonsContainer}>
              {Object.values(NivelAcademico).map((nivel) => (
                <TouchableOpacity
                  key={nivel}
                  style={[
                    styles.nivelButton,
                    filtroNivel === nivel && styles.nivelButtonActive,
                    { borderColor: getColorNivel(nivel) },
                    filtroNivel === nivel && {
                      backgroundColor: getColorNivel(nivel),
                    },
                  ]}
                  onPress={() =>
                    setFiltroNivel(filtroNivel === nivel ? undefined : nivel)
                  }
                >
                  <Text
                    style={[
                      styles.nivelButtonText,
                      filtroNivel === nivel && styles.nivelButtonTextActive,
                    ]}
                  >
                    {getTextoNivel(nivel)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Botones de acción */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={limpiarFiltros}
              >
                <Text style={styles.modalButtonTextSecondary}>
                  Limpiar Filtros
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={aplicarFiltros}
              >
                <Text style={styles.modalButtonText}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomNavBar currentScreen="Planeaciones" />
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
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingBottom: 10,
  },
  headerLeft: {
    gap: 8,
  },
  title: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 10,
  },
  iconButton: {
    padding: 8,
  },
  activeFilters: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    paddingBottom: 10,
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
  },
  filterChipText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.text,
  },
  clearFiltersButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  clearFiltersText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.primary,
    fontWeight: "bold",
  },
  listContent: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 15,
    overflow: "visible",
    boxShadow: "0px 2px 4px rgba(26, 26, 26, 0.1)",
  },
  badge: {
    position: "absolute",
    top: -8,
    left: 15,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  badgeText: {
    color: "white",
    fontSize: FONT_SIZES.small,
    fontWeight: "bold",
  },
  badgeDetallado: {
    left: 100,
    backgroundColor: "#5c6bc0",
  },
  menuButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 8,
    zIndex: 2,
  },
  contextMenu: {
    position: "absolute",
    top: 45,
    right: 10,
    backgroundColor: "white",
    borderRadius: 8,
    boxShadow: "0px 2px 8px rgba(26, 26, 26, 0.3)",
    zIndex: 10,
    minWidth: 150,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 10,
  },
  menuItemText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
  },
  cardContent: {
    padding: 15,
    paddingTop: 25,
  },
  cardAsignatura: {
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  cardGrado: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  cardTema: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
    marginBottom: 12,
  },
  detalleCurso: {
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    gap: 6,
  },
  detalleItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detalleText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
  },
  cardFooterItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardFooterText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 40,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    gap: 8,
  },
  createButtonText: {
    color: "white",
    fontSize: FONT_SIZES.medium,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: "bold",
    color: COLORS.text,
  },
  filterLabel: {
    fontSize: FONT_SIZES.medium,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 12,
  },
  nivelButtonsContainer: {
    gap: 10,
    marginBottom: 30,
  },
  nivelButton: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: COLORS.surface,
  },
  nivelButtonActive: {
    // backgroundColor set dynamically
  },
  nivelButtonText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
    textAlign: "center",
    fontWeight: "600",
  },
  nivelButtonTextActive: {
    color: "white",
    fontWeight: "bold",
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonPrimary: {
    backgroundColor: COLORS.primary,
  },
  modalButtonSecondary: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  modalButtonText: {
    color: "white",
    fontSize: FONT_SIZES.medium,
    fontWeight: "bold",
  },
  modalButtonTextSecondary: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.medium,
    fontWeight: "bold",
  },
});

export default ListaPlaneacionesScreen;
