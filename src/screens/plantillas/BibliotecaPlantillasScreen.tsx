import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  FlatList,
  TextInput,
  Modal,
  Pressable,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { usePlantillas } from "../../context/PlantillasContext";
import type { Plantilla } from "../../../types";

type Nav = StackNavigationProp<RootStackParamList>;

// ─── Design tokens (Stitch 3.5.1) ───
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
  outline: "#727782",
  outlineVariant: "#c1c7d3",
  secondary: "#1b6d24",
  secondaryContainer: "#a0f399",
  secondaryFixedDim: "#88d982",
  onSecondaryFixed: "#002204",
  error: "#ba1a1a",
  starColor: "#ffb700",
};

type CategoriaFilter = "todas" | Plantilla["tipo"];

const CATEGORY_PILLS: { key: CategoriaFilter; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "examen", label: "Exámenes" },
  { key: "presentacion", label: "Presentaciones" },
  { key: "mapa_mental", label: "Mapas Mentales" },
  { key: "postal", label: "Postales" },
  { key: "reporte", label: "Reportes" },
  { key: "linea_tiempo", label: "Líneas de Tiempo" },
];

const SIDEBAR_CATS: {
  key: CategoriaFilter;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}[] = [
  { key: "todas", label: "Explorar todo", icon: "grid-view" },
  { key: "examen", label: "Exámenes", icon: "quiz" },
  { key: "presentacion", label: "Presentaciones", icon: "slideshow" },
  { key: "mapa_mental", label: "Mapas Mentales", icon: "hub" },
  { key: "postal", label: "Postales", icon: "mail" },
  { key: "reporte", label: "Reportes", icon: "summarize" },
  { key: "linea_tiempo", label: "Líneas de Tiempo", icon: "timeline" },
];

const TIPO_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  examen: "quiz",
  presentacion: "slideshow",
  mapa_mental: "hub",
  linea_tiempo: "timeline",
  postal: "mail",
  reporte: "summarize",
  otro: "description",
};

const TIPO_LABELS: Record<string, string> = {
  examen: "EXAMEN",
  presentacion: "PRESENTACIÓN",
  mapa_mental: "MAPA MENTAL",
  linea_tiempo: "LÍNEA DE TIEMPO",
  postal: "POSTAL",
  reporte: "REPORTE",
  otro: "OTRO",
};

const BibliotecaPlantillasScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { plantillas, isLoading, eliminarPlantilla } = usePlantillas();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const [categoriaActiva, setCategoriaActiva] = useState<CategoriaFilter>("todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const [detallePlantilla, setDetallePlantilla] = useState<Plantilla | null>(null);

  // ─── Derived data ───
  const filteredPlantillas = useMemo(() => {
    let result = plantillas.filter((p) => !p.tags?.includes("__borrador__"));
    if (categoriaActiva !== "todas") {
      result = result.filter((p) => p.tipo === categoriaActiva);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          p.descripcion?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [plantillas, categoriaActiva, searchQuery]);

  const destacadas = useMemo(
    () =>
      [...plantillas]
        .filter((p) => !p.tags?.includes("__borrador__") && p.usosCount > 0)
        .sort((a, b) => b.usosCount - a.usosCount)
        .slice(0, 5),
    [plantillas]
  );

  const recientes = useMemo(
    () =>
      [...plantillas]
        .filter((p) => !p.tags?.includes("__borrador__"))
        .sort(
          (a, b) =>
            new Date(b.fechaModificacion).getTime() - new Date(a.fechaModificacion).getTime()
        )
        .slice(0, 6),
    [plantillas]
  );

  const showEmpty =
    !isLoading && plantillas.filter((p) => !p.tags?.includes("__borrador__")).length === 0;

  // ─── Handlers ───
  const handlePlantillaPress = useCallback((p: Plantilla) => {
    setDetallePlantilla(p);
  }, []);

  const handleUsarPlantilla = useCallback(() => {
    if (!detallePlantilla) return;
    setDetallePlantilla(null);
    navigation.navigate("EditorPlantilla", { plantillaId: detallePlantilla.id as number });
  }, [detallePlantilla, navigation]);

  const handleDuplicar = useCallback(() => {
    if (!detallePlantilla) return;
    setDetallePlantilla(null);
    navigation.navigate("EditorPlantilla", { plantillaId: detallePlantilla.id as number });
  }, [detallePlantilla, navigation]);

  const handleEliminar = useCallback(async () => {
    if (!detallePlantilla) return;
    await eliminarPlantilla(detallePlantilla.id as number);
    setDetallePlantilla(null);
  }, [detallePlantilla, eliminarPlantilla]);

  const handleSearchToggle = useCallback(() => {
    setSearchActive((v) => !v);
    if (searchActive) setSearchQuery("");
  }, [searchActive]);

  const getCatCount = useCallback(
    (key: CategoriaFilter) => {
      if (key === "todas")
        return plantillas.filter((p) => !p.tags?.includes("__borrador__")).length;
      return plantillas.filter((p) => p.tipo === key && !p.tags?.includes("__borrador__")).length;
    },
    [plantillas]
  );

  // ─── Skeleton ───
  const renderSkeleton = () => (
    <View style={s.skeletonContainer}>
      <View style={s.skeletonPills}>
        {[80, 90, 120].map((w, i) => (
          <View key={i} style={[s.skeletonPill, { width: w }]} />
        ))}
      </View>
      <View style={s.skeletonFeatured}>
        <View style={s.skeletonFeaturedCard} />
        <View style={s.skeletonFeaturedCard} />
      </View>
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={s.skeletonGridCard} />
      ))}
    </View>
  );

  // ─── Empty State ───
  const renderEmptyState = () => (
    <View style={s.emptyContainer}>
      <View style={s.emptyIconWrap}>
        <MaterialIcons name="grid-view" size={48} color={DT.primary} />
        <View style={s.emptyPlusIcon}>
          <MaterialIcons name="add" size={20} color={DT.primary} />
        </View>
      </View>
      <View style={s.emptyBadge}>
        <Text style={s.emptyBadgeText}>ATELIER</Text>
      </View>
      <Text style={s.emptyTitle}>Aún no tienes plantillas</Text>
      <Text style={s.emptySubtitle}>
        Explora la biblioteca del sistema o crea tu primera plantilla personalizada para empezar a
        diseñar tu próximo desafío educativo.
      </Text>
      <TouchableOpacity
        style={s.emptyPrimaryBtn}
        onPress={() => navigation.navigate("ListaPlantillas")}
        activeOpacity={0.85}
      >
        <Text style={s.emptyPrimaryBtnText}>Explorar plantillas del sistema</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={s.emptySecondaryBtn}
        onPress={() => navigation.navigate("EditorPlantilla")}
        activeOpacity={0.7}
      >
        <Text style={s.emptySecondaryBtnText}>Crear plantilla</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.emptyLink} onPress={() => {}} activeOpacity={0.7}>
        <Text style={s.emptyLinkText}>¿Qué son las plantillas?</Text>
        <MaterialIcons name="arrow-forward" size={16} color={DT.primary} />
      </TouchableOpacity>
    </View>
  );

  // ─── Featured card (horizontal scroll) ───
  const renderDestacadaCard = ({ item }: { item: Plantilla }) => (
    <TouchableOpacity
      style={s.featuredCard}
      onPress={() => handlePlantillaPress(item)}
      activeOpacity={0.85}
    >
      <View style={s.featuredGradient}>
        <MaterialIcons
          name={TIPO_ICONS[item.tipo] || "description"}
          size={48}
          color={DT.onPrimary}
          style={{ opacity: 0.4 }}
        />
        <View style={s.featuredBadge}>
          <Text style={s.featuredBadgeText}>
            {item.esDelSistema ? "SISTEMA" : TIPO_LABELS[item.tipo] || ""}
          </Text>
        </View>
      </View>
      <View style={s.featuredInfo}>
        <Text style={s.featuredTitle} numberOfLines={1}>
          {item.nombre}
        </Text>
        <View style={s.featuredRating}>
          <MaterialIcons name="star" size={12} color={DT.starColor} />
          <Text style={s.featuredRatingText}>
            {Math.min(5, 4 + item.usosCount * 0.1).toFixed(1)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // ─── Grid card ───
  const renderGridCard = (item: Plantilla) => (
    <TouchableOpacity
      key={item.id}
      style={s.gridCard}
      onPress={() => handlePlantillaPress(item)}
      activeOpacity={0.85}
    >
      <View style={[s.gridIcon, { backgroundColor: DT.primaryFixed }]}>
        <MaterialIcons name={TIPO_ICONS[item.tipo] || "description"} size={22} color={DT.primary} />
      </View>
      <Text style={s.gridTitle} numberOfLines={1}>
        {item.nombre}
      </Text>
      <Text style={s.gridAuthor} numberOfLines={1}>
        {item.esDelSistema ? "Por PlanearIA" : "Personal"}
      </Text>
      <View style={s.gridUsoBadge}>
        <MaterialIcons name="group" size={12} color={DT.primary} />
        <Text style={s.gridUsoText}>{item.usosCount} usos</Text>
      </View>
    </TouchableOpacity>
  );

  // ─── Detail preview modal ───
  const renderDetalleModal = () => {
    if (!detallePlantilla) return null;
    return (
      <Modal
        visible={!!detallePlantilla}
        transparent
        animationType="slide"
        onRequestClose={() => setDetallePlantilla(null)}
        statusBarTranslucent
      >
        <Pressable style={s.detOverlay} onPress={() => setDetallePlantilla(null)}>
          <Pressable
            style={[s.detSheet, isDesktop && s.detSheetDesktop]}
            onPress={(e) => e.stopPropagation()}
          >
            {!isDesktop && (
              <View style={s.detHandle}>
                <View style={s.detHandleBar} />
              </View>
            )}
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
              {/* Badges */}
              <View style={s.detBadgeRow}>
                <View style={s.detTypeBadge}>
                  <Text style={s.detTypeBadgeText}>
                    {TIPO_LABELS[detallePlantilla.tipo] || "PLANTILLA"}
                  </Text>
                </View>
                {detallePlantilla.esDelSistema && (
                  <View style={s.detSystemBadge}>
                    <MaterialIcons name="verified" size={12} color={DT.onPrimary} />
                    <Text style={s.detSystemBadgeText}>DEL SISTEMA</Text>
                  </View>
                )}
              </View>

              {/* Title */}
              <Text style={s.detTitle}>{detallePlantilla.nombre}</Text>

              {/* Author + usage */}
              <View style={s.detMetaRow}>
                <Text style={s.detAuthor}>
                  Por{" "}
                  <Text style={{ color: DT.primary, fontWeight: "700" }}>
                    {detallePlantilla.esDelSistema ? "PlanearIA" : "Ti"}
                  </Text>
                </Text>
                <Text style={s.detDot}>•</Text>
                <Text style={s.detUsos}>Usado {detallePlantilla.usosCount} veces</Text>
              </View>

              {/* Tags */}
              {detallePlantilla.tags && detallePlantilla.tags.length > 0 && (
                <View style={s.detTagsRow}>
                  {detallePlantilla.tags
                    .filter((t) => !t.startsWith("__"))
                    .slice(0, 4)
                    .map((tag) => (
                      <View key={tag} style={s.detTag}>
                        <Text style={s.detTagText}>{tag}</Text>
                      </View>
                    ))}
                </View>
              )}

              {/* Preview placeholder */}
              <View style={s.detPreview}>
                <View style={s.detPreviewContent}>
                  <View style={s.detPreviewLine1} />
                  <View style={s.detPreviewLine2} />
                  <View style={s.detPreviewLine3} />
                </View>
              </View>

              {/* Description */}
              {detallePlantilla.descripcion ? (
                <Text style={s.detDescripcion}>{detallePlantilla.descripcion}</Text>
              ) : null}
            </ScrollView>

            {/* Actions */}
            <View style={s.detActions}>
              <TouchableOpacity
                style={s.detPrimaryBtn}
                onPress={handleUsarPlantilla}
                activeOpacity={0.85}
              >
                <Text style={s.detPrimaryBtnText}>Usar plantilla</Text>
              </TouchableOpacity>
              <View style={s.detSecondaryRow}>
                <TouchableOpacity
                  style={s.detSecondaryBtn}
                  onPress={handleDuplicar}
                  activeOpacity={0.7}
                >
                  <Text style={s.detSecondaryBtnText}>Duplicar y editar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleEliminar} activeOpacity={0.7}>
                  <Text style={s.detDeleteText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    );
  };

  // ─── Mobile layout ───
  const renderMobile = () => (
    <ScrollView
      style={s.scrollMain}
      contentContainerStyle={s.scrollPad}
      showsVerticalScrollIndicator={false}
    >
      {/* Category pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.pillsScroll}
        contentContainerStyle={s.pillsContent}
      >
        {CATEGORY_PILLS.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[s.pill, categoriaActiva === cat.key && s.pillActive]}
            onPress={() => setCategoriaActiva(cat.key)}
            activeOpacity={0.8}
          >
            <Text style={[s.pillText, categoriaActiva === cat.key && s.pillTextActive]}>
              {cat.label.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Destacadas */}
      {destacadas.length > 0 && (
        <View style={s.sectionBlock}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Destacadas</Text>
            <TouchableOpacity onPress={() => navigation.navigate("ListaPlantillas")}>
              <Text style={s.sectionLink}>VER TODO</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={destacadas}
            renderItem={renderDestacadaCard}
            keyExtractor={(item) => String(item.id)}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.featuredList}
          />
        </View>
      )}

      {/* Grid */}
      <View style={s.sectionBlock}>
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>
            {categoriaActiva === "todas"
              ? "Todas"
              : CATEGORY_PILLS.find((c) => c.key === categoriaActiva)?.label || ""}
          </Text>
          <Text style={s.sectionLink}>RECIENTES</Text>
        </View>
        {filteredPlantillas.length === 0 ? (
          <View style={s.noResults}>
            <MaterialIcons name="search-off" size={32} color={DT.outlineVariant} />
            <Text style={s.noResultsText}>Sin resultados</Text>
          </View>
        ) : (
          <View style={s.grid}>{filteredPlantillas.map((p) => renderGridCard(p))}</View>
        )}
      </View>
    </ScrollView>
  );

  // ─── Desktop layout ───
  const renderDesktop = () => (
    <View style={s.desktopRow}>
      {/* Sidebar */}
      <View style={s.sidebar}>
        <Text style={s.sidebarLabel}>CATEGORÍAS</Text>
        {SIDEBAR_CATS.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[s.sidebarItem, categoriaActiva === cat.key && s.sidebarItemActive]}
            onPress={() => setCategoriaActiva(cat.key)}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name={cat.icon}
              size={20}
              color={categoriaActiva === cat.key ? DT.onPrimary : DT.onSurfaceVariant}
            />
            <Text
              style={[s.sidebarItemText, categoriaActiva === cat.key && s.sidebarItemTextActive]}
            >
              {cat.label}
            </Text>
            <Text style={[s.sidebarCount, categoriaActiva === cat.key && { color: DT.onPrimary }]}>
              {getCatCount(cat.key)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Main content */}
      <ScrollView
        style={s.desktopMain}
        contentContainerStyle={s.desktopMainPad}
        showsVerticalScrollIndicator={false}
      >
        {/* Search bar desktop */}
        <View style={s.desktopSearchBar}>
          <MaterialIcons name="search" size={20} color={DT.outline} />
          <TextInput
            style={s.desktopSearchInput}
            placeholder="Buscar plantillas, temas o autores..."
            placeholderTextColor={DT.outlineVariant}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Featured hero */}
        {destacadas.length > 0 && (
          <View style={s.heroContainer}>
            <View style={s.heroBadge}>
              <Text style={s.heroBadgeText}>DESTACADO</Text>
            </View>
            <Text style={s.heroTitle}>{destacadas[0].nombre}</Text>
            <View style={s.heroActions}>
              <TouchableOpacity
                style={s.heroBtn}
                onPress={() => handlePlantillaPress(destacadas[0])}
                activeOpacity={0.85}
              >
                <Text style={s.heroBtnText}>Usar plantilla</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.heroBtnOutline}
                onPress={() => handlePlantillaPress(destacadas[0])}
                activeOpacity={0.7}
              >
                <Text style={s.heroBtnOutlineText}>Más detalles</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Recent horizontal */}
        {recientes.length > 0 && (
          <View style={s.sectionBlock}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Plantillas Recientes</Text>
              <TouchableOpacity onPress={() => navigation.navigate("ListaPlantillas")}>
                <Text style={s.sectionLink}>Ver todas →</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={recientes}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={s.desktopCard}
                  onPress={() => handlePlantillaPress(item)}
                  activeOpacity={0.85}
                >
                  <View style={s.desktopCardImage}>
                    <MaterialIcons
                      name={TIPO_ICONS[item.tipo] || "description"}
                      size={36}
                      color={DT.onPrimary}
                      style={{ opacity: 0.6 }}
                    />
                  </View>
                  <Text style={s.desktopCardCat}>{TIPO_LABELS[item.tipo] || ""}</Text>
                  <Text style={s.desktopCardTitle} numberOfLines={1}>
                    {item.nombre}
                  </Text>
                  <Text style={s.desktopCardDesc} numberOfLines={2}>
                    {item.descripcion}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => String(item.id)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.desktopCardList}
            />
          </View>
        )}

        {/* All filtered */}
        <View style={s.sectionBlock}>
          <Text style={s.sectionTitle}>Todas las plantillas</Text>
          {filteredPlantillas.length === 0 ? (
            <View style={s.noResults}>
              <MaterialIcons name="search-off" size={32} color={DT.outlineVariant} />
              <Text style={s.noResultsText}>Sin resultados</Text>
            </View>
          ) : (
            <View style={s.desktopGrid}>{filteredPlantillas.map((p) => renderGridCard(p))}</View>
          )}
        </View>
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      {/* Header */}
      <View style={s.topBar}>
        <View style={s.topBarLeft}>
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Volver"
          >
            <MaterialIcons name="arrow-back" size={24} color={DT.primary} />
          </TouchableOpacity>
          <Text style={s.topBarTitle}>Plantillas</Text>
        </View>
        <TouchableOpacity
          style={s.backBtn}
          onPress={handleSearchToggle}
          accessibilityLabel="Buscar"
        >
          <MaterialIcons name="search" size={24} color={DT.primary} />
        </TouchableOpacity>
      </View>

      {/* Search bar (mobile) */}
      {searchActive && !isDesktop && (
        <View style={s.searchBarMobile}>
          <MaterialIcons name="search" size={20} color={DT.outline} />
          <TextInput
            style={s.searchInput}
            placeholder="Buscar..."
            placeholderTextColor={DT.outlineVariant}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <MaterialIcons name="close" size={18} color={DT.onSurfaceVariant} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Content */}
      {isLoading
        ? renderSkeleton()
        : showEmpty
          ? renderEmptyState()
          : isDesktop
            ? renderDesktop()
            : renderMobile()}

      {/* FAB */}
      {!showEmpty && (
        <TouchableOpacity
          style={[s.fab, isDesktop && s.fabDesktop]}
          onPress={() => navigation.navigate("EditorPlantilla")}
          activeOpacity={0.85}
          accessibilityLabel="Crear plantilla"
        >
          <MaterialIcons name="add" size={28} color={DT.onPrimary} />
        </TouchableOpacity>
      )}

      {/* Detail modal */}
      {renderDetalleModal()}
    </SafeAreaView>
  );
};

// ─── Styles ───
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: DT.surface },
  // TopBar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  topBarLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  backBtn: {
    padding: 8,
    borderRadius: 20,
  },
  topBarTitle: {
    fontFamily: "Manrope",
    fontWeight: "800",
    fontSize: 20,
    color: DT.primary,
    letterSpacing: -0.5,
  },
  // Search
  searchBarMobile: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DT.surfaceLow,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Manrope",
    fontSize: 14,
    color: DT.onSurface,
    padding: 0,
  },
  // Scroll
  scrollMain: { flex: 1 },
  scrollPad: { paddingBottom: 100 },
  // Pills
  pillsScroll: { maxHeight: 48 },
  pillsContent: { paddingHorizontal: 16, gap: 10 },
  pill: {
    backgroundColor: DT.surfaceHigh,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 999,
  },
  pillActive: { backgroundColor: DT.primaryContainer },
  pillText: {
    fontFamily: "Manrope",
    fontWeight: "700",
    fontSize: 11,
    letterSpacing: 1.5,
    color: DT.onSurfaceVariant,
  },
  pillTextActive: { color: DT.onPrimary },
  // Section
  sectionBlock: { marginTop: 24, paddingHorizontal: 16 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontFamily: "Manrope",
    fontWeight: "800",
    fontSize: 20,
    color: DT.primary,
    letterSpacing: -0.3,
  },
  sectionLink: {
    fontFamily: "Manrope",
    fontWeight: "700",
    fontSize: 11,
    color: DT.outline,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  // Featured
  featuredList: { paddingHorizontal: 16, gap: 12, paddingVertical: 8 },
  featuredCard: {
    width: 160,
    height: 200,
    backgroundColor: DT.surfaceLowest,
    borderRadius: 12,
    overflow: "hidden",
    ...Platform.select({
      web: { boxShadow: "0px 24px 48px rgba(0,72,132,0.08)" as never },
      default: { elevation: 3 },
    }),
  },
  featuredGradient: {
    height: 120,
    backgroundColor: DT.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  featuredBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: DT.primaryFixed,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  featuredBadgeText: {
    fontFamily: "Manrope",
    fontWeight: "700",
    fontSize: 10,
    color: DT.onPrimaryFixed,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  featuredInfo: {
    flex: 1,
    padding: 10,
    justifyContent: "space-between",
    backgroundColor: DT.surfaceLowest,
  },
  featuredTitle: {
    fontFamily: "Manrope",
    fontWeight: "700",
    fontSize: 13,
    color: DT.onSurface,
  },
  featuredRating: { flexDirection: "row", alignItems: "center", gap: 4 },
  featuredRatingText: {
    fontFamily: "Manrope",
    fontWeight: "700",
    fontSize: 10,
    color: DT.outline,
  },
  // Grid
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  gridCard: {
    width: "47%",
    backgroundColor: DT.surfaceLow,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  gridIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  gridTitle: {
    fontFamily: "Manrope",
    fontWeight: "700",
    fontSize: 14,
    color: DT.onSurface,
  },
  gridAuthor: {
    fontFamily: "Manrope",
    fontWeight: "600",
    fontSize: 10,
    color: DT.outlineVariant,
  },
  gridUsoBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: DT.surfaceHighest,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 4,
    marginTop: 4,
  },
  gridUsoText: {
    fontFamily: "Manrope",
    fontWeight: "700",
    fontSize: 10,
    color: DT.primary,
  },
  noResults: { alignItems: "center", paddingVertical: 40, gap: 8 },
  noResultsText: {
    fontFamily: "Manrope",
    fontWeight: "600",
    fontSize: 14,
    color: DT.outlineVariant,
  },
  // Desktop
  desktopRow: { flex: 1, flexDirection: "row" },
  sidebar: {
    width: 220,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: DT.surface,
  },
  sidebarLabel: {
    fontFamily: "Manrope",
    fontWeight: "700",
    fontSize: 10,
    letterSpacing: 1.5,
    color: DT.outline,
    marginBottom: 12,
  },
  sidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 4,
    gap: 10,
  },
  sidebarItemActive: { backgroundColor: DT.primary },
  sidebarItemText: {
    flex: 1,
    fontFamily: "Manrope",
    fontWeight: "600",
    fontSize: 14,
    color: DT.onSurface,
  },
  sidebarItemTextActive: { color: DT.onPrimary, fontWeight: "700" },
  sidebarCount: {
    fontFamily: "Manrope",
    fontWeight: "600",
    fontSize: 12,
    color: DT.outline,
  },
  desktopMain: { flex: 1 },
  desktopMainPad: { paddingHorizontal: 24, paddingBottom: 100 },
  desktopSearchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DT.surfaceLow,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
    gap: 10,
  },
  desktopSearchInput: {
    flex: 1,
    fontFamily: "Manrope",
    fontSize: 14,
    color: DT.onSurface,
    padding: 0,
  },
  heroContainer: {
    backgroundColor: DT.primaryContainer,
    borderRadius: 20,
    padding: 32,
    marginBottom: 24,
  },
  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: DT.secondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 16,
  },
  heroBadgeText: {
    fontFamily: "Manrope",
    fontWeight: "700",
    fontSize: 11,
    color: DT.onPrimary,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontFamily: "Manrope",
    fontWeight: "800",
    fontSize: 28,
    color: DT.onPrimary,
    marginBottom: 20,
  },
  heroActions: { flexDirection: "row", gap: 12 },
  heroBtn: {
    backgroundColor: DT.surfaceLowest,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  heroBtnText: {
    fontFamily: "Manrope",
    fontWeight: "700",
    fontSize: 14,
    color: DT.onSurface,
  },
  heroBtnOutline: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  heroBtnOutlineText: {
    fontFamily: "Manrope",
    fontWeight: "700",
    fontSize: 14,
    color: DT.onPrimary,
  },
  desktopCardList: { gap: 16, paddingVertical: 8 },
  desktopCard: {
    width: 200,
    backgroundColor: DT.surfaceLowest,
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      web: { boxShadow: "0px 8px 24px rgba(0,69,128,0.06)" as never },
      default: { elevation: 2 },
    }),
  },
  desktopCardImage: {
    height: 120,
    backgroundColor: DT.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  desktopCardCat: {
    fontFamily: "Manrope",
    fontWeight: "700",
    fontSize: 10,
    letterSpacing: 1,
    color: DT.primary,
    paddingHorizontal: 14,
    paddingTop: 10,
    textTransform: "uppercase",
  },
  desktopCardTitle: {
    fontFamily: "Manrope",
    fontWeight: "700",
    fontSize: 14,
    color: DT.onSurface,
    paddingHorizontal: 14,
    paddingTop: 4,
  },
  desktopCardDesc: {
    fontFamily: "Manrope",
    fontWeight: "500",
    fontSize: 12,
    color: DT.onSurfaceVariant,
    paddingHorizontal: 14,
    paddingVertical: 8,
    lineHeight: 16,
  },
  desktopGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 16,
  },
  // Empty state
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  emptyIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: DT.surfaceLow,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyPlusIcon: { position: "absolute", right: -4, bottom: -4 },
  emptyBadge: {
    backgroundColor: DT.secondaryContainer,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 20,
  },
  emptyBadgeText: {
    fontFamily: "Manrope",
    fontWeight: "700",
    fontSize: 11,
    color: DT.secondary,
    letterSpacing: 0.5,
  },
  emptyTitle: {
    fontFamily: "Manrope",
    fontWeight: "800",
    fontSize: 26,
    color: DT.onSurface,
    textAlign: "center",
    marginBottom: 12,
  },
  emptySubtitle: {
    fontFamily: "Manrope",
    fontWeight: "500",
    fontSize: 14,
    color: DT.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 28,
    maxWidth: 340,
  },
  emptyPrimaryBtn: {
    backgroundColor: DT.primary,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 14,
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
    marginBottom: 12,
  },
  emptyPrimaryBtnText: {
    fontFamily: "Manrope",
    fontWeight: "700",
    fontSize: 14,
    color: DT.onPrimary,
  },
  emptySecondaryBtn: {
    backgroundColor: DT.surfaceLow,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 14,
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
    marginBottom: 16,
  },
  emptySecondaryBtnText: {
    fontFamily: "Manrope",
    fontWeight: "700",
    fontSize: 14,
    color: DT.onSurface,
  },
  emptyLink: { flexDirection: "row", alignItems: "center", gap: 4 },
  emptyLinkText: {
    fontFamily: "Manrope",
    fontWeight: "600",
    fontSize: 14,
    color: DT.primary,
  },
  // Skeleton
  skeletonContainer: { padding: 16, gap: 16 },
  skeletonPills: { flexDirection: "row", gap: 10 },
  skeletonPill: {
    height: 36,
    borderRadius: 18,
    backgroundColor: DT.surfaceHigh,
    opacity: 0.5,
  },
  skeletonFeatured: { flexDirection: "row", gap: 12 },
  skeletonFeaturedCard: {
    width: 160,
    height: 200,
    borderRadius: 12,
    backgroundColor: DT.surfaceHigh,
    opacity: 0.4,
  },
  skeletonGridCard: {
    height: 120,
    borderRadius: 12,
    backgroundColor: DT.surfaceHigh,
    opacity: 0.3,
  },
  // Detail modal
  detOverlay: {
    flex: 1,
    backgroundColor: "rgba(23, 28, 33, 0.40)",
    justifyContent: "flex-end",
  },
  detSheet: {
    backgroundColor: DT.surfaceLowest,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: "80%",
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 28,
  },
  detSheetDesktop: {
    alignSelf: "center",
    width: 520,
    borderRadius: 24,
    marginBottom: "auto",
    marginTop: "auto",
  },
  detHandle: { alignItems: "center", paddingTop: 12, paddingBottom: 8 },
  detHandleBar: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: DT.surfaceHighest,
    opacity: 0.5,
  },
  detBadgeRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 },
  detTypeBadge: {
    backgroundColor: DT.surfaceHigh,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  detTypeBadgeText: {
    fontFamily: "Manrope",
    fontWeight: "700",
    fontSize: 10,
    color: DT.onSurfaceVariant,
    letterSpacing: 0.5,
  },
  detSystemBadge: {
    backgroundColor: DT.secondary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  detSystemBadgeText: {
    fontFamily: "Manrope",
    fontWeight: "700",
    fontSize: 10,
    color: DT.onPrimary,
    letterSpacing: 0.5,
  },
  detTitle: {
    fontFamily: "Manrope",
    fontWeight: "800",
    fontSize: 22,
    color: DT.onSurface,
    marginTop: 16,
    marginBottom: 8,
  },
  detMetaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  detAuthor: {
    fontFamily: "Manrope",
    fontWeight: "500",
    fontSize: 14,
    color: DT.onSurfaceVariant,
  },
  detDot: { color: DT.onSurfaceVariant, fontSize: 14 },
  detUsos: {
    fontFamily: "Manrope",
    fontWeight: "500",
    fontSize: 14,
    color: DT.onSurfaceVariant,
  },
  detTagsRow: { flexDirection: "row", gap: 8, marginBottom: 16, flexWrap: "wrap" },
  detTag: {
    backgroundColor: DT.surfaceLow,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  detTagText: {
    fontFamily: "Manrope",
    fontWeight: "600",
    fontSize: 12,
    color: DT.onSurfaceVariant,
  },
  detPreview: {
    backgroundColor: DT.surfaceLow,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    minHeight: 180,
  },
  detPreviewContent: { gap: 12 },
  detPreviewLine1: {
    height: 12,
    width: "80%",
    borderRadius: 6,
    backgroundColor: DT.surfaceHigh,
  },
  detPreviewLine2: {
    height: 10,
    width: "60%",
    borderRadius: 5,
    backgroundColor: DT.surfaceHigh,
  },
  detPreviewLine3: {
    height: 10,
    width: "40%",
    borderRadius: 5,
    backgroundColor: DT.surfaceHigh,
  },
  detDescripcion: {
    fontFamily: "Manrope",
    fontWeight: "500",
    fontSize: 14,
    color: DT.onSurfaceVariant,
    lineHeight: 20,
    marginBottom: 12,
  },
  detActions: { marginTop: 8 },
  detPrimaryBtn: {
    backgroundColor: DT.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  detPrimaryBtnText: {
    fontFamily: "Manrope",
    fontWeight: "700",
    fontSize: 16,
    color: DT.onPrimary,
  },
  detSecondaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  detSecondaryBtn: {
    backgroundColor: DT.surfaceLow,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 14,
    flex: 1,
    alignItems: "center",
    marginRight: 16,
  },
  detSecondaryBtnText: {
    fontFamily: "Manrope",
    fontWeight: "700",
    fontSize: 14,
    color: DT.onSurface,
  },
  detDeleteText: {
    fontFamily: "Manrope",
    fontWeight: "700",
    fontSize: 14,
    color: DT.error,
    paddingHorizontal: 16,
    paddingVertical: 14,
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
      web: { boxShadow: "0px 8px 24px rgba(0,69,128,0.15)" as never },
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
});

export default BibliotecaPlantillasScreen;
