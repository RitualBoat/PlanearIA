import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { COLORS, FONT_SIZES } from "../../../types";
import BottomNavBar from "../../components/BottomNavBar";
import SyncIndicator from "../../components/SyncIndicator";
import {
  NivelAcademico,
  Planeacion,
  FiltrosPlaneacion,
} from "../../../types/planeacion";
import { usePlaneaciones } from "../../context/PlaneacionesContext";

type ListaPlaneacionesScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ListaPlaneaciones"
>;

interface ListaPlaneacionesScreenProps {
  navigation: ListaPlaneacionesScreenNavigationProp;
}

const ListaPlaneacionesScreen: React.FC<ListaPlaneacionesScreenProps> = ({
  navigation,
}) => {
  const {
    planeaciones,
    filtrarPlaneaciones,
    eliminarPlaneacion,
    clonarPlaneacion,
  } = usePlaneaciones();

  const [planeacionesFiltradas, setPlaneacionesFiltradas] =
    useState<Planeacion[]>(planeaciones);
  const [showFiltros, setShowFiltros] = useState(false);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);

  // Estados de filtros
  const [filtroNivel, setFiltroNivel] = useState<NivelAcademico | undefined>(
    undefined
  );
  const [filtroAsignatura, setFiltroAsignatura] = useState("");
  const [filtroGrado, setFiltroGrado] = useState("");

  /**
   * Actualiza la lista cuando cambian las planeaciones
   */
  useEffect(() => {
    aplicarFiltros();
  }, [planeaciones]);

  /**
   * Aplica los filtros seleccionados
   */
  const aplicarFiltros = () => {
    const filtros: FiltrosPlaneacion = {
      nivelAcademico: filtroNivel,
      asignatura: filtroAsignatura || undefined,
      grado: filtroGrado || undefined,
    };

    const resultado = filtrarPlaneaciones(filtros);
    setPlaneacionesFiltradas(resultado);
    setShowFiltros(false);
  };

  /**
   * Limpia todos los filtros
   */
  const limpiarFiltros = () => {
    setFiltroNivel(undefined);
    setFiltroAsignatura("");
    setFiltroGrado("");
    setPlaneacionesFiltradas(planeaciones);
    setShowFiltros(false);
  };

  /**
   * Formatea la fecha
   */
  const formatearFecha = (fecha: string): string => {
    const date = new Date(fecha);
    return date.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /**
   * Obtiene el color del badge según el nivel
   */
  const getColorNivel = (nivel: NivelAcademico): string => {
    const colores = {
      [NivelAcademico.PRIMARIA]: "#4CAF50",
      [NivelAcademico.SECUNDARIA]: "#2196F3",
      [NivelAcademico.PREPARATORIA]: "#FF9800",
      [NivelAcademico.UNIVERSIDAD]: "#9C27B0",
    };
    return colores[nivel];
  };

  /**
   * Obtiene el texto del nivel
   */
  const getTextoNivel = (nivel: NivelAcademico): string => {
    const textos = {
      [NivelAcademico.PRIMARIA]: "Primaria",
      [NivelAcademico.SECUNDARIA]: "Secundaria",
      [NivelAcademico.PREPARATORIA]: "Preparatoria",
      [NivelAcademico.UNIVERSIDAD]: "Universidad",
    };
    return textos[nivel];
  };

  /**
   * Muestra confirmación según plataforma
   */
  const confirmar = (
    titulo: string,
    mensaje: string,
    onConfirm: () => void
  ) => {
    if (Platform.OS === "web") {
      if (window.confirm(`${titulo}\n\n${mensaje}`)) {
        onConfirm();
      }
    } else {
      Alert.alert(titulo, mensaje, [
        { text: "Cancelar", style: "cancel" },
        { text: "Confirmar", onPress: onConfirm },
      ]);
    }
  };

  /**
   * Maneja la edición de una planeación
   */
  const handleEditar = (planeacion: Planeacion) => {
    setMenuVisible(null);
    navigation.navigate("EditorPlaneacion", {
      nivel: planeacion.nivelAcademico,
      modo: "editar",
      planeacionId: planeacion.id,
    });
  };

  /**
   * Maneja el clonado de una planeación
   */
  const handleClonar = async (planeacionId: string) => {
    setMenuVisible(null);
    try {
      await clonarPlaneacion(planeacionId);
      if (Platform.OS === "web") {
        window.alert("Planeación clonada exitosamente");
      } else {
        Alert.alert("Éxito", "Planeación clonada exitosamente");
      }
    } catch (error) {
      if (Platform.OS === "web") {
        window.alert("Error al clonar la planeación");
      } else {
        Alert.alert("Error", "No se pudo clonar la planeación");
      }
    }
  };

  /**
   * Maneja la eliminación de una planeación
   */
  const handleEliminar = (planeacionId: string) => {
    setMenuVisible(null);
    confirmar(
      "Eliminar Planeación",
      "¿Estás seguro de que deseas eliminar esta planeación? Esta acción no se puede deshacer.",
      async () => {
        try {
          await eliminarPlaneacion(planeacionId);
          if (Platform.OS === "web") {
            window.alert("Planeación eliminada");
          } else {
            Alert.alert("Eliminada", "Planeación eliminada correctamente");
          }
        } catch (error) {
          if (Platform.OS === "web") {
            window.alert("Error al eliminar la planeación");
          } else {
            Alert.alert("Error", "No se pudo eliminar la planeación");
          }
        }
      }
    );
  };

  /**
   * Maneja la exportación (placeholder)
   */
  const handleExportar = (planeacionId: string) => {
    setMenuVisible(null);
    if (Platform.OS === "web") {
      window.alert("Función de exportar próximamente disponible");
    } else {
      Alert.alert("Exportar", "Función de exportar próximamente disponible");
    }
  };

  /**
   * Renderiza una card de planeación
   */
  const renderPlaneacion = ({ item }: { item: Planeacion }) => {
    const isMenuOpen = menuVisible === item.id;

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
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate("CrearPlaneacion")}
      >
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
                  onPress={() => navigation.navigate("CrearPlaneacion")}
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
    elevation: 2,
    shadowColor: COLORS.text,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
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
    elevation: 5,
    shadowColor: COLORS.text,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
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
