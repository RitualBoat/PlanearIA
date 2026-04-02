import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  Platform,
  Modal,
  Pressable,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Sharing from "expo-sharing";
import { COLORS } from "../../../types";
import { RootStackParamList } from "../../navigation/StackNavigator";
import {
  useContenidoViewModel,
  CategoriaContenido,
  ContenidoItem,
} from "../../hooks/useContenidoViewModel";
import { CrearNuevoModal } from "../../components/CrearNuevoModal";
import {
  exportPlaneacionToPdf,
  exportPlaneacionToDocx,
} from "../../services/planeacionExportService";
import type { Planeacion } from "../../../types/planeacion";

type Nav = StackNavigationProp<RootStackParamList>;

// ─── Design tokens ───
const DT = {
  primary: "#004580",
  primaryContainer: "#005da8",
  primaryFixed: "#d4e3ff",
  onPrimaryFixed: "#001c39",
  onPrimary: "#ffffff",
  surface: "#f6f9ff",
  surfaceLow: "#eff4fb",
  surfaceHigh: "#e3e9f0",
  surfaceHighest: "#dee3ea",
  surfaceLowest: "#ffffff",
  onSurface: "#171c21",
  onSurfaceVariant: "#414751",
  outlineVariant: "#c1c7d3",
  secondary: "#1b6d24",
  secondaryContainer: "#a0f399",
  error: "#ba1a1a",
  errorContainer: "#ffdad6",
  amber: "#7B3F00",
  amberBg: "#FFE0B2",
  purple: "#6A1B9A",
  purpleBg: "#E1BEE7",
  draftColor: "#F57F17",
  draftBg: "#FFF9C4",
};

const CAT_COLORS: Record<string, { text: string; bg: string }> = {
  planeaciones: { text: DT.primary, bg: DT.primaryFixed },
  recursos: { text: DT.secondary, bg: DT.secondaryContainer },
  entregables: { text: DT.amber, bg: DT.amberBg },
  plantillas: { text: DT.purple, bg: DT.purpleBg },
};

const CAT_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  planeaciones: "event-note",
  recursos: "folder-special",
  entregables: "assignment",
  plantillas: "dashboard-customize",
};

const TIPO_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  examen: "quiz",
  presentacion: "slideshow",
  mapa_mental: "hub",
  linea_tiempo: "timeline",
  video: "videocam",
  documento: "description",
  imagen: "image",
  audio: "audiotrack",
  enlace: "link",
  tarea: "description",
  proyecto: "architecture",
  investigacion: "manage-search",
  postal: "mail",
  reporte: "summarize",
};

const CATEGORIAS: { key: CategoriaContenido; label: string }[] = [
  { key: "todo", label: "Todo" },
  { key: "planeaciones", label: "Planeaciones" },
  { key: "recursos", label: "Recursos" },
  { key: "entregables", label: "Entregables" },
  { key: "plantillas", label: "Plantillas" },
];

const FILTER_TIPOS = [
  { key: "examen", label: "Examen" },
  { key: "presentacion", label: "Presentación" },
  { key: "mapa_mental", label: "Mapa Mental" },
  { key: "linea_tiempo", label: "Línea de Tiempo" },
  { key: "video", label: "Video" },
  { key: "documento", label: "Documento" },
  { key: "audio", label: "Audio" },
  { key: "imagen", label: "Imagen" },
];

const FILTER_FECHAS = [
  { key: "hoy", label: "Hoy" },
  { key: "semana", label: "Esta semana" },
  { key: "mes", label: "Este mes" },
  { key: "anio", label: "Este año" },
];

const FILTER_ESTADOS = [
  { key: "completo", label: "Completo" },
  { key: "borrador", label: "Borrador" },
];

// ─── Helpers ───

const formatTimeAgo = (fecha: string): string => {
  if (!fecha) return "";
  const now = new Date();
  const d = new Date(fecha);
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Ahora";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Hace ${diffH} hora${diffH > 1 ? "s" : ""}`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `Hace ${diffD} día${diffD > 1 ? "s" : ""}`;
  const diffW = Math.floor(diffD / 7);
  if (diffW < 4) return `Hace ${diffW} semana${diffW > 1 ? "s" : ""}`;
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
};

// ─── Sub-components ───

const SkeletonCard: React.FC<{ width?: number; height?: number }> = ({
  width = 140,
  height = 100,
}) => (
  <View
    style={[
      styles.skeletonCard,
      { width, height, backgroundColor: DT.surfaceHigh, borderRadius: 12 },
    ]}
  />
);

const CategoryPill: React.FC<{
  label: string;
  active: boolean;
  count?: number;
  onPress: () => void;
}> = ({ label, active, count, onPress }) => (
  <TouchableOpacity
    style={[styles.pill, active ? styles.pillActive : styles.pillInactive]}
    onPress={onPress}
    activeOpacity={0.7}
    accessibilityRole="button"
    accessibilityState={{ selected: active }}
    accessibilityLabel={`Filtrar por ${label}`}
  >
    <Text style={[styles.pillText, active ? styles.pillTextActive : styles.pillTextInactive]}>
      {label}
    </Text>
    {count !== undefined && (
      <View
        style={[
          styles.pillBadge,
          { backgroundColor: active ? "rgba(255,255,255,0.25)" : DT.surfaceHighest },
        ]}
      >
        <Text
          style={[styles.pillBadgeText, { color: active ? DT.onPrimary : DT.onSurfaceVariant }]}
        >
          {count}
        </Text>
      </View>
    )}
  </TouchableOpacity>
);

const DraftCard: React.FC<{ item: ContenidoItem; onPress: () => void }> = ({ item, onPress }) => {
  const icon = CAT_ICONS[item.tipo] || "description";
  const colors = CAT_COLORS[item.tipo] || { text: DT.primary, bg: DT.primaryFixed };

  return (
    <TouchableOpacity
      style={styles.draftCard}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityLabel={`Borrador: ${item.titulo}`}
    >
      <View style={styles.draftHeader}>
        <View style={[styles.draftIcon, { backgroundColor: colors.bg }]}>
          <MaterialIcons name={icon} size={20} color={colors.text} />
        </View>
        <View style={[styles.draftBadge, { backgroundColor: DT.draftBg }]}>
          <Text style={[styles.draftBadgeText, { color: DT.draftColor }]}>BORRADOR</Text>
        </View>
      </View>
      <Text style={styles.draftTitle} numberOfLines={2}>
        {item.titulo}
      </Text>
      {item.progreso !== undefined && (
        <View style={styles.draftProgressRow}>
          <Text style={styles.draftProgressText}>PROGRESO</Text>
          <Text style={styles.draftProgressPercent}>{item.progreso}%</Text>
        </View>
      )}
      {item.progreso !== undefined && (
        <View style={styles.draftProgressTrack}>
          <View
            style={[
              styles.draftProgressFill,
              { width: `${item.progreso}%`, backgroundColor: DT.primary },
            ]}
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

const ContentItemCard: React.FC<{
  item: ContenidoItem;
  onPress: () => void;
  onMenuPress: () => void;
}> = ({ item, onPress, onMenuPress }) => {
  const catColors = CAT_COLORS[item.tipo] || { text: DT.primary, bg: DT.primaryFixed };
  const catLabel = CATEGORIAS.find((c) => c.key === item.tipo)?.label?.toUpperCase() || "";
  const icon = item.tipoRecurso
    ? TIPO_ICONS[item.tipoRecurso] || "description"
    : CAT_ICONS[item.tipo] || "description";

  return (
    <TouchableOpacity
      style={styles.contentCard}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityLabel={item.titulo}
    >
      <View style={[styles.contentIcon, { backgroundColor: catColors.bg }]}>
        <MaterialIcons name={icon} size={24} color={catColors.text} />
      </View>
      <View style={styles.contentInfo}>
        <View style={styles.contentHeader}>
          <Text style={[styles.contentBadge, { color: catColors.text }]}>{catLabel}</Text>
          <Text style={styles.contentDate}> · {formatTimeAgo(item.fechaModificacion)}</Text>
        </View>
        <Text style={styles.contentTitle} numberOfLines={2}>
          {item.titulo}
        </Text>
        <Text style={styles.contentSubtitle} numberOfLines={1}>
          {item.subtitulo}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.contentMenu}
        onPress={onMenuPress}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        accessibilityLabel="Más opciones"
      >
        <MaterialIcons name="more-vert" size={20} color={DT.onSurfaceVariant} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

// ─── Main Screen ───

const ContenidoScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1280;
  const isTablet = width >= 768;
  const navigation = useNavigation<Nav>();
  const vm = useContenidoViewModel();
  const searchRef = useRef<TextInput>(null);

  const [menuItem, setMenuItem] = useState<ContenidoItem | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<ContenidoItem | null>(null);
  const [showCrearNuevo, setShowCrearNuevo] = useState(false);

  // ─── Handlers ───

  const handleItemPress = useCallback(
    (item: ContenidoItem) => {
      if (item.tipo === "planeaciones") {
        const raw = item.raw as { id: string; nivelAcademico: string };
        navigation.navigate("EditorPlaneacion", {
          nivel: raw.nivelAcademico as any,
          modo: "editar",
          planeacionId: raw.id,
        });
      } else if (item.tipo === "recursos") {
        navigation.navigate("CrearRecurso", { recursoId: (item.raw as any).id });
      } else if (item.tipo === "entregables") {
        navigation.navigate("ListaEntregables");
      } else if (item.tipo === "plantillas") {
        navigation.navigate("DetallePlantilla", { plantillaId: (item.raw as any).id } as any);
      }
    },
    [navigation]
  );

  const handleCreatePress = useCallback(() => {
    setShowCrearNuevo(true);
  }, []);

  const handleCrearNuevoNavigate = useCallback(
    (screen: string, params?: Record<string, unknown>) => {
      navigation.navigate(screen as any, params as any);
    },
    [navigation]
  );

  const handleMenuAction = useCallback(
    (action: string) => {
      if (!menuItem) return;
      const currentItem = menuItem;
      setMenuItem(null);
      switch (action) {
        case "editar":
          handleItemPress(currentItem);
          break;
        case "duplicar":
          vm.duplicarItem(currentItem);
          break;
        case "eliminar":
          setDeleteConfirm(currentItem);
          break;
        case "compartir":
          handleCompartir(currentItem);
          break;
        case "exportar":
          handleExportar(currentItem);
          break;
      }
    },
    [menuItem, vm, handleItemPress]
  );

  const handleCompartir = useCallback(async (item: ContenidoItem) => {
    if (item.tipo !== "planeaciones") {
      Alert.alert(
        "Próximamente",
        "Compartir este tipo de contenido estará disponible en una próxima actualización."
      );
      return;
    }
    try {
      const planeacion = item.raw as Planeacion;
      const result = await exportPlaneacionToPdf(planeacion, {
        portada: true,
        actividades: true,
        evaluacion: true,
        observaciones: true,
      });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(result.uri, {
          mimeType: "application/pdf",
          dialogTitle: "Compartir planeación",
        });
      } else {
        Alert.alert("No disponible", "Compartir no está disponible en este dispositivo.");
      }
    } catch {
      Alert.alert("Error", "No se pudo compartir la planeación.");
    }
  }, []);

  const handleExportar = useCallback((item: ContenidoItem) => {
    if (item.tipo !== "planeaciones") {
      Alert.alert(
        "Próximamente",
        "Exportar este tipo de contenido estará disponible en una próxima actualización."
      );
      return;
    }
    const planeacion = item.raw as Planeacion;
    const options = { portada: true, actividades: true, evaluacion: true, observaciones: true };
    Alert.alert("Exportar planeación", "Selecciona el formato de exportación", [
      {
        text: "PDF",
        onPress: async () => {
          try {
            const result = await exportPlaneacionToPdf(planeacion, options);
            const canShare = await Sharing.isAvailableAsync();
            if (canShare) {
              await Sharing.shareAsync(result.uri, {
                mimeType: "application/pdf",
                dialogTitle: "Guardar planeación PDF",
              });
            }
          } catch {
            Alert.alert("Error", "No se pudo exportar la planeación.");
          }
        },
      },
      {
        text: "Word (.docx)",
        onPress: async () => {
          try {
            const result = await exportPlaneacionToDocx(planeacion, options);
            const canShare = await Sharing.isAvailableAsync();
            if (canShare) {
              await Sharing.shareAsync(result.uri, {
                mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                dialogTitle: "Guardar planeación DOCX",
              });
            }
          } catch {
            Alert.alert("Error", "No se pudo exportar la planeación.");
          }
        },
      },
      { text: "Cancelar", style: "cancel" },
    ]);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteConfirm) {
      vm.eliminarItem(deleteConfirm);
      setDeleteConfirm(null);
    }
  }, [deleteConfirm, vm]);

  // ─── Filter chips row ───

  const renderFilterChips = () => {
    if (!showFilters && vm.filtrosActivos === 0) return null;

    return (
      <View style={styles.filterSection}>
        <View style={styles.filterHeader}>
          <View style={styles.filterHeaderLeft}>
            <MaterialIcons name="tune" size={18} color={DT.onSurfaceVariant} />
            <Text style={styles.filterLabel}>
              {vm.filtrosActivos > 0
                ? `${vm.filtrosActivos} filtro${vm.filtrosActivos > 1 ? "s" : ""} activo${vm.filtrosActivos > 1 ? "s" : ""}`
                : "Filtros"}
            </Text>
          </View>
          {vm.filtrosActivos > 0 && (
            <TouchableOpacity onPress={vm.limpiarFiltros}>
              <Text style={styles.clearFilters}>LIMPIAR FILTROS</Text>
            </TouchableOpacity>
          )}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChipsRow}>
          {FILTER_TIPOS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, vm.filtroTipo === f.key && styles.filterChipActive]}
              onPress={() => vm.setFiltroTipo(vm.filtroTipo === f.key ? "" : f.key)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  vm.filtroTipo === f.key && styles.filterChipTextActive,
                ]}
              >
                Tipo: {f.label}
              </Text>
              {vm.filtroTipo === f.key && (
                <MaterialIcons
                  name="close"
                  size={14}
                  color={DT.primary}
                  style={{ marginLeft: 4 }}
                />
              )}
            </TouchableOpacity>
          ))}
          {FILTER_FECHAS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, vm.filtroFecha === f.key && styles.filterChipActive]}
              onPress={() => vm.setFiltroFecha(vm.filtroFecha === f.key ? "" : f.key)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  vm.filtroFecha === f.key && styles.filterChipTextActive,
                ]}
              >
                Fecha: {f.label}
              </Text>
              {vm.filtroFecha === f.key && (
                <MaterialIcons
                  name="close"
                  size={14}
                  color={DT.primary}
                  style={{ marginLeft: 4 }}
                />
              )}
            </TouchableOpacity>
          ))}
          {FILTER_ESTADOS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, vm.filtroEstado === f.key && styles.filterChipActive]}
              onPress={() => vm.setFiltroEstado(vm.filtroEstado === f.key ? "" : f.key)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  vm.filtroEstado === f.key && styles.filterChipTextActive,
                ]}
              >
                {f.label}
              </Text>
              {vm.filtroEstado === f.key && (
                <MaterialIcons
                  name="close"
                  size={14}
                  color={DT.primary}
                  style={{ marginLeft: 4 }}
                />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  // ─── Drafts section ───

  const renderDrafts = () => {
    if (vm.borradores.length === 0) return null;
    const cardW = isDesktop ? 220 : isTablet ? 180 : 155;
    const cardH = isDesktop ? 130 : isTablet ? 120 : 110;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Borradores</Text>
          <TouchableOpacity onPress={() => vm.setFiltroEstado("borrador")}>
            <Text style={styles.seeAll}>Ver todos</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.draftsScroll}
        >
          {vm.borradores.map((item) => (
            <View key={item.id} style={{ width: cardW, height: cardH, marginRight: 12 }}>
              <DraftCard item={item} onPress={() => handleItemPress(item)} />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  // ─── Empty state ───

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <MaterialIcons name="folder-open" size={64} color={DT.outlineVariant} />
      </View>
      <Text style={styles.emptyTitle}>Tu contenido aparecerá aquí</Text>
      <Text style={styles.emptySubtitle}>
        Crea tu primera planeación, sube un recurso o explora las plantillas para comenzar
      </Text>
      <TouchableOpacity
        style={styles.emptyPrimary}
        onPress={() => navigation.navigate("Planeaciones")}
      >
        <Text style={styles.emptyPrimaryText}>Crear planeación</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.emptySecondary}
        onPress={() => navigation.navigate("CrearRecurso")}
      >
        <Text style={styles.emptySecondaryText}>Subir recurso</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("BibliotecaPlantillas")}>
        <Text style={styles.emptyLink}>Ver plantillas</Text>
      </TouchableOpacity>
    </View>
  );

  // ─── Loading skeleton ───

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      <SkeletonCard width={width - 32} height={48} />
      <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
        {[1, 2, 3, 4].map((i) => (
          <SkeletonCard key={i} width={80} height={36} />
        ))}
      </View>
      <View style={{ flexDirection: "row", gap: 12, marginTop: 20 }}>
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} width={155} height={110} />
        ))}
      </View>
      {[1, 2, 3, 4].map((i) => (
        <SkeletonCard key={i} width={width - 32} height={80} />
      ))}
    </View>
  );

  // ─── Context menu (bottom sheet on mobile, popover concept) ───

  const renderContextMenu = () => (
    <Modal
      visible={menuItem !== null}
      transparent
      animationType="slide"
      onRequestClose={() => setMenuItem(null)}
    >
      <Pressable style={styles.modalOverlay} onPress={() => setMenuItem(null)}>
        <Pressable
          style={[styles.bottomSheet, isTablet && styles.bottomSheetTablet]}
          onPress={(e) => e.stopPropagation()}
        >
          {menuItem && (
            <>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeader}>
                <View
                  style={[
                    styles.sheetIcon,
                    {
                      backgroundColor: CAT_COLORS[menuItem.tipo]?.bg || DT.primaryFixed,
                    },
                  ]}
                >
                  <MaterialIcons
                    name={CAT_ICONS[menuItem.tipo] || "description"}
                    size={20}
                    color={CAT_COLORS[menuItem.tipo]?.text || DT.primary}
                  />
                </View>
                <View style={styles.sheetHeaderText}>
                  <Text style={styles.sheetTitle} numberOfLines={1}>
                    {menuItem.titulo}
                  </Text>
                  <Text style={styles.sheetSubtitle}>{menuItem.subtitulo}</Text>
                </View>
              </View>
              <View style={styles.sheetDivider} />
              {[
                { key: "editar", icon: "edit" as const, label: "Editar" },
                { key: "duplicar", icon: "content-copy" as const, label: "Duplicar" },
                { key: "compartir", icon: "share" as const, label: "Compartir" },
                { key: "exportar", icon: "file-download" as const, label: "Exportar" },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={styles.sheetOption}
                  onPress={() => handleMenuAction(opt.key)}
                >
                  <MaterialIcons name={opt.icon} size={22} color={DT.onSurface} />
                  <Text style={styles.sheetOptionText}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
              <View style={styles.sheetDivider} />
              <TouchableOpacity
                style={styles.sheetOption}
                onPress={() => handleMenuAction("eliminar")}
              >
                <MaterialIcons name="delete" size={22} color={DT.error} />
                <Text style={[styles.sheetOptionText, { color: DT.error }]}>Eliminar</Text>
              </TouchableOpacity>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );

  // ─── Delete confirmation ───

  const renderDeleteModal = () => (
    <Modal
      visible={deleteConfirm !== null}
      transparent
      animationType="fade"
      onRequestClose={() => setDeleteConfirm(null)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.deleteModal}>
          <MaterialIcons name="warning" size={40} color={DT.error} />
          <Text style={styles.deleteTitle}>¿Eliminar este elemento?</Text>
          <Text style={styles.deleteSubtitle}>
            Se eliminará &quot;{deleteConfirm?.titulo}&quot;. Esta acción no se puede deshacer.
          </Text>
          <View style={styles.deleteActions}>
            <TouchableOpacity style={styles.deleteCancel} onPress={() => setDeleteConfirm(null)}>
              <Text style={styles.deleteCancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteConfirmBtn} onPress={confirmDelete}>
              <Text style={styles.deleteConfirmText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // ─── Desktop sidebar ───

  const renderSidebar = () => (
    <View style={styles.sidebar}>
      {CATEGORIAS.map((cat) => {
        const active = vm.categoriaActiva === cat.key;
        const icon =
          cat.key === "todo" ? ("apps" as const) : CAT_ICONS[cat.key] || ("description" as const);
        return (
          <TouchableOpacity
            key={cat.key}
            style={[styles.sidebarItem, active && styles.sidebarItemActive]}
            onPress={() => vm.setCategoriaActiva(cat.key)}
          >
            <MaterialIcons
              name={icon}
              size={20}
              color={active ? DT.primary : DT.onSurfaceVariant}
            />
            <Text style={[styles.sidebarLabel, active && { color: DT.primary, fontWeight: "700" }]}>
              {cat.label}
            </Text>
            <Text style={styles.sidebarCount}>{vm.conteos[cat.key]}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  // ─── Item render for FlatList ───

  const renderItem = useCallback(
    ({ item }: { item: ContenidoItem }) => (
      <ContentItemCard
        item={item}
        onPress={() => handleItemPress(item)}
        onMenuPress={() => setMenuItem(item)}
      />
    ),
    [handleItemPress]
  );

  const keyExtractor = useCallback((item: ContenidoItem) => item.id, []);

  // ─── Main content ───

  const mainContent = (
    <>
      {/* Search bar */}
      <View
        style={[
          styles.searchContainer,
          isDesktop && { maxWidth: 600, alignSelf: "center", width: "100%" },
        ]}
      >
        <MaterialIcons name="search" size={22} color={DT.onSurfaceVariant} />
        <TextInput
          ref={searchRef}
          style={styles.searchInput}
          placeholder="Buscar planeaciones, recursos, tareas..."
          placeholderTextColor={DT.outlineVariant}
          value={vm.searchQuery}
          onChangeText={vm.setSearchQuery}
          accessibilityLabel="Buscar en tu contenido"
          returnKeyType="search"
        />
        {vm.searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => vm.setSearchQuery("")}>
            <MaterialIcons name="close" size={20} color={DT.onSurfaceVariant} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category pills (mobile/tablet) */}
      {!isDesktop && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsRow}
        >
          {CATEGORIAS.map((cat) => (
            <CategoryPill
              key={cat.key}
              label={cat.label}
              active={vm.categoriaActiva === cat.key}
              count={cat.key !== "todo" ? vm.conteos[cat.key] : undefined}
              onPress={() => vm.setCategoriaActiva(cat.key)}
            />
          ))}
        </ScrollView>
      )}

      {/* Filter toggle button */}
      <TouchableOpacity style={styles.filterToggle} onPress={() => setShowFilters(!showFilters)}>
        <MaterialIcons name="tune" size={18} color={DT.onSurfaceVariant} />
        <Text style={styles.filterToggleText}>Filtros</Text>
        {vm.filtrosActivos > 0 && (
          <View style={styles.filterBadge}>
            <Text style={styles.filterBadgeText}>{vm.filtrosActivos}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Filter chips */}
      {(showFilters || vm.filtrosActivos > 0) && renderFilterChips()}

      {/* Drafts */}
      {!vm.searchQuery && vm.filtrosActivos === 0 && renderDrafts()}

      {/* Section title */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Reciente</Text>
        <Text style={styles.sectionCount}>{vm.items.length} elementos</Text>
      </View>
    </>
  );

  // ─── Render ───

  if (vm.isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mi Contenido</Text>
        </View>
        {renderSkeleton()}
      </SafeAreaView>
    );
  }

  const showEmpty = vm.totalItems === 0;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Mi Contenido</Text>
          <Text style={styles.headerSubtitle}>{vm.totalItems} elementos</Text>
        </View>
      </View>

      {showEmpty ? (
        renderEmpty()
      ) : (
        <View style={[styles.body, isDesktop && styles.bodyDesktop]}>
          {/* Desktop sidebar */}
          {isDesktop && renderSidebar()}

          {/* Main list */}
          <FlatList
            data={vm.items}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            style={styles.list}
            contentContainerStyle={[
              styles.listContent,
              isDesktop && { paddingHorizontal: 32 },
              isTablet && !isDesktop && { paddingHorizontal: 24 },
            ]}
            ListHeaderComponent={mainContent}
            ListEmptyComponent={
              <View style={styles.noResults}>
                <MaterialIcons name="search-off" size={48} color={DT.outlineVariant} />
                <Text style={styles.noResultsText}>Sin resultados</Text>
                <Text style={styles.noResultsSub}>
                  Prueba con otros filtros o términos de búsqueda
                </Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {/* FAB */}
      {!showEmpty && (
        <TouchableOpacity
          style={[styles.fab, isDesktop && styles.fabDesktop]}
          onPress={handleCreatePress}
          activeOpacity={0.85}
          accessibilityLabel="Crear nuevo contenido"
        >
          <MaterialIcons name="add" size={28} color={DT.onPrimary} />
        </TouchableOpacity>
      )}

      {/* Modals */}
      {renderContextMenu()}
      {renderDeleteModal()}
      <CrearNuevoModal
        visible={showCrearNuevo}
        onClose={() => setShowCrearNuevo(false)}
        onNavigate={handleCrearNuevoNavigate}
      />
    </SafeAreaView>
  );
};

// ─── Styles ───

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DT.surface },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: DT.onSurface,
  },
  headerSubtitle: {
    fontSize: 13,
    color: DT.onSurfaceVariant,
    marginTop: 2,
  },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DT.surfaceHigh,
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    marginHorizontal: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: DT.onSurface,
    ...(Platform.OS === "web" ? { outlineStyle: "none" as any } : {}),
  },

  // Pills
  pillsRow: {
    paddingHorizontal: 16,
    gap: 8,
    marginTop: 14,
    paddingBottom: 4,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 20,
    gap: 6,
  },
  pillActive: {
    backgroundColor: DT.primary,
  },
  pillInactive: {
    backgroundColor: DT.surfaceLow,
  },
  pillText: {
    fontSize: 14,
    fontWeight: "600",
  },
  pillTextActive: {
    color: DT.onPrimary,
  },
  pillTextInactive: {
    color: DT.onSurfaceVariant,
  },
  pillBadge: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 20,
    alignItems: "center",
  },
  pillBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },

  // Filter toggle
  filterToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  filterToggleText: {
    fontSize: 13,
    color: DT.onSurfaceVariant,
    fontWeight: "500",
  },
  filterBadge: {
    backgroundColor: DT.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: {
    color: DT.onPrimary,
    fontSize: 11,
    fontWeight: "700",
  },

  // Filter section
  filterSection: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  filterHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  filterLabel: {
    fontSize: 13,
    color: DT.onSurfaceVariant,
    fontWeight: "500",
  },
  clearFilters: {
    fontSize: 12,
    fontWeight: "700",
    color: DT.primary,
    letterSpacing: 0.5,
  },
  filterChipsRow: {
    flexDirection: "row",
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 16,
    backgroundColor: DT.surfaceLow,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: DT.primaryFixed,
  },
  filterChipText: {
    fontSize: 13,
    color: DT.onSurfaceVariant,
  },
  filterChipTextActive: {
    color: DT.primary,
    fontWeight: "600",
  },

  // Sections
  section: {
    marginTop: 20,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: DT.onSurface,
  },
  sectionCount: {
    fontSize: 12,
    color: DT.onSurfaceVariant,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: "600",
    color: DT.primary,
  },

  // Drafts
  draftsScroll: {
    paddingHorizontal: 16,
  },
  draftCard: {
    flex: 1,
    backgroundColor: DT.surfaceLowest,
    borderRadius: 12,
    padding: 12,
    justifyContent: "space-between",
  },
  draftHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  draftIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  draftBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  draftBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  draftTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: DT.onSurface,
    marginTop: 6,
  },
  draftProgressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  draftProgressText: {
    fontSize: 10,
    fontWeight: "600",
    color: DT.onSurfaceVariant,
    letterSpacing: 0.5,
  },
  draftProgressPercent: {
    fontSize: 11,
    fontWeight: "700",
    color: DT.onSurface,
  },
  draftProgressTrack: {
    height: 4,
    backgroundColor: DT.surfaceHigh,
    borderRadius: 2,
    marginTop: 4,
    overflow: "hidden",
  },
  draftProgressFill: {
    height: "100%",
    borderRadius: 2,
  },

  // Content cards
  contentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DT.surfaceLowest,
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    gap: 12,
  },
  contentIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  contentInfo: {
    flex: 1,
  },
  contentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  contentBadge: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  contentDate: {
    fontSize: 11,
    color: DT.onSurfaceVariant,
  },
  contentTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: DT.onSurface,
    lineHeight: 20,
  },
  contentSubtitle: {
    fontSize: 13,
    color: DT.onSurfaceVariant,
    marginTop: 2,
  },
  contentMenu: {
    padding: 4,
  },

  // Body layout
  body: {
    flex: 1,
  },
  bodyDesktop: {
    flexDirection: "row",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
    paddingHorizontal: 0,
  },

  // Sidebar (desktop)
  sidebar: {
    width: 240,
    backgroundColor: DT.surfaceLow,
    paddingTop: 20,
    paddingHorizontal: 12,
    gap: 4,
  },
  sidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
  },
  sidebarItemActive: {
    backgroundColor: DT.primaryFixed,
  },
  sidebarLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: DT.onSurfaceVariant,
  },
  sidebarCount: {
    fontSize: 13,
    fontWeight: "600",
    color: DT.onSurfaceVariant,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 28,
    backgroundColor: DT.surfaceLow,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: DT.onSurface,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 15,
    color: DT.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 8,
  },
  emptyPrimary: {
    backgroundColor: DT.primary,
    paddingHorizontal: 32,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    maxWidth: 300,
  },
  emptyPrimaryText: {
    color: DT.onPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  emptySecondary: {
    backgroundColor: DT.surfaceHigh,
    paddingHorizontal: 32,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    maxWidth: 300,
  },
  emptySecondaryText: {
    color: DT.onSurface,
    fontSize: 16,
    fontWeight: "600",
  },
  emptyLink: {
    color: DT.primary,
    fontSize: 15,
    fontWeight: "600",
    marginTop: 4,
  },

  // No results
  noResults: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 8,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: "600",
    color: DT.onSurface,
  },
  noResultsSub: {
    fontSize: 14,
    color: DT.onSurfaceVariant,
    textAlign: "center",
  },

  // Skeleton
  skeletonContainer: {
    padding: 16,
    gap: 12,
  },
  skeletonCard: {
    opacity: 0.5,
  },

  // FAB
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: DT.primary,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      web: { boxShadow: "0px 8px 24px rgba(0,69,128,0.15)" },
      default: { elevation: 6 },
    }),
  },
  fabDesktop: {
    right: 32,
    bottom: 32,
    width: 64,
    height: 64,
    borderRadius: 32,
  },

  // Bottom sheet / context menu
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(19, 30, 49, 0.42)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: DT.surfaceLowest,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
    paddingTop: 12,
    maxHeight: "60%",
  },
  bottomSheetTablet: {
    alignSelf: "center",
    width: 400,
    borderRadius: 16,
    marginBottom: 40,
    maxHeight: "50%",
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: DT.outlineVariant,
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 12,
  },
  sheetIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetHeaderText: {
    flex: 1,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: DT.onSurface,
  },
  sheetSubtitle: {
    fontSize: 13,
    color: DT.onSurfaceVariant,
    marginTop: 2,
  },
  sheetDivider: {
    height: 6,
    backgroundColor: DT.surfaceLow,
    marginVertical: 4,
  },
  sheetOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 14,
  },
  sheetOptionText: {
    fontSize: 15,
    fontWeight: "500",
    color: DT.onSurface,
  },

  // Delete modal
  deleteModal: {
    backgroundColor: DT.surfaceLowest,
    borderRadius: 24,
    padding: 28,
    marginHorizontal: 32,
    alignItems: "center",
    alignSelf: "center",
    maxWidth: 400,
    width: "100%",
    gap: 8,
  },
  deleteTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: DT.onSurface,
    marginTop: 8,
  },
  deleteSubtitle: {
    fontSize: 14,
    color: DT.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 20,
  },
  deleteActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    width: "100%",
  },
  deleteCancel: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: DT.surfaceHigh,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteCancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: DT.onSurface,
  },
  deleteConfirmBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: DT.error,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteConfirmText: {
    fontSize: 15,
    fontWeight: "600",
    color: DT.onPrimary,
  },
});

export default ContenidoScreen;
