import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
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
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppRoutesParamList } from "../../navigation/StackNavigator";
import { usePlantillas } from "../../context/PlantillasContext";
import type { Plantilla } from "../../../types";

type Nav = StackNavigationProp<AppRoutesParamList>;

// ─── Design tokens (Stitch 3.5.1) ───
const DT = {
  primary: "#002f5a",
  primaryContainer: "#004580",
  primaryFixed: "#d4e3ff",
  onPrimaryFixed: "#001c3a",
  onPrimaryFixedVariant: "#064883",
  onPrimary: "#ffffff",
  surface: "#f7f9ff",
  surfaceLow: "#f1f4fa",
  surfaceContainer: "#ebeef4",
  surfaceHigh: "#e5e8ee",
  surfaceHighest: "#dfe3e8",
  surfaceLowest: "#ffffff",
  onSurface: "#181c20",
  onSurfaceVariant: "#424750",
  outline: "#727781",
  outlineVariant: "#c2c6d1",
  secondary: "#1b6d24",
  secondaryContainer: "#a0f399",
  secondaryFixed: "#a3f69c",
  onSecondaryFixedVariant: "#005312",
  tertiaryContainer: "#713200",
  onTertiaryContainer: "#f69b63",
  error: "#ba1a1a",
  errorContainer: "#ffdad6",
  starColor: "#f59e0b",
};

const CATEGORY_COLORS: Record<string, { text: string; bg: string }> = {
  examen: { text: "#7B3F00", bg: "#FFE0B2" },
  presentacion: { text: "#004580", bg: "#d4e3ff" },
  mapa_mental: { text: "#6A1B9A", bg: "#E1BEE7" },
  postal: { text: "#00695C", bg: "#B2DFDB" },
  reporte: { text: "#BF360C", bg: "#FFCCBC" },
  linea_tiempo: { text: "#1565C0", bg: "#BBDEFB" },
  otro: { text: DT.onSurfaceVariant, bg: DT.surfaceLow },
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
  { key: "todas", label: "Explorar todo", icon: "dashboard" },
  { key: "examen", label: "Exámenes", icon: "quiz" },
  { key: "presentacion", label: "Presentaciones", icon: "school" },
  { key: "mapa_mental", label: "Mapas Mentales", icon: "account-tree" },
  { key: "postal", label: "Postales", icon: "mail" },
  { key: "reporte", label: "Reportes", icon: "summarize" },
  { key: "linea_tiempo", label: "Líneas de Tiempo", icon: "show-chart" },
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
        {[
          { id: "pill-0", w: 80 },
          { id: "pill-1", w: 90 },
          { id: "pill-2", w: 120 },
          { id: "pill-3", w: 80 },
        ].map(({ id, w }, i) => (
          <View key={id} style={[s.skeletonPill, { width: w, opacity: 1 - i * 0.2 }]} />
        ))}
      </View>
      <View style={s.skeletonFeatured}>
        <View style={s.skeletonFeaturedCard} />
        <View style={s.skeletonFeaturedCard} />
        <View style={[s.skeletonFeaturedCard, { opacity: 0.5 }]} />
      </View>
      <View style={s.skeletonGrid}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={s.skeletonGridCard}>
            <View style={s.skeletonGridThumb} />
            <View style={s.skeletonGridLine1} />
            <View style={s.skeletonGridLine2} />
          </View>
        ))}
      </View>
    </View>
  );

  // ─── Empty State ───
  const renderEmptyState = () => (
    <View style={s.emptyContainer}>
      <View style={s.emptyIconWrap}>
        <MaterialIcons name="dashboard-customize" size={64} color={DT.outlineVariant} />
      </View>
      <Text style={s.emptyTitle}>Aún no tienes plantillas</Text>
      <Text style={s.emptySubtitle}>
        Explora la biblioteca del sistema o crea tu primera plantilla personalizada
      </Text>
      <Pressable
        style={({ pressed }) => [s.emptyPrimaryBtn, pressed && { opacity: 0.85 }]}
        onPress={() => navigation.navigate("ListaPlantillas")}
      >
        <Text style={s.emptyPrimaryBtnText}>Explorar plantillas del sistema</Text>
      </Pressable>
      <Pressable
        style={({ pressed }) => [s.emptySecondaryBtn, pressed && { opacity: 0.7 }]}
        onPress={() => navigation.navigate("EditorPlantilla")}
      >
        <Text style={s.emptySecondaryBtnText}>Crear plantilla</Text>
      </Pressable>
      <Pressable
        style={({ pressed }) => [s.emptyLink, pressed && { opacity: 0.7 }]}
        onPress={() => navigation.navigate("Ayuda")}
      >
        <Text style={s.emptyLinkText}>¿Qué son las plantillas?</Text>
        <MaterialIcons name="arrow-forward" size={18} color={DT.primaryContainer} />
      </Pressable>
    </View>
  );

  // ─── Featured card (horizontal scroll) ───
  const renderDestacadaCard = ({ item }: { item: Plantilla }) => {
    const catColor = CATEGORY_COLORS[item.tipo] || CATEGORY_COLORS.otro;
    return (
      <Pressable
        style={({ pressed }) => [s.featuredCard, pressed && { opacity: 0.85 }]}
        onPress={() => handlePlantillaPress(item)}
      >
        <View style={s.featuredPreview}>
          <MaterialIcons
            name={TIPO_ICONS[item.tipo] || "description"}
            size={48}
            color={`${DT.primaryContainer}4D`}
          />
          {item.esDelSistema && (
            <View style={s.featuredSystemBadge}>
              <Text style={s.featuredSystemBadgeText}>DEL SISTEMA</Text>
            </View>
          )}
          <View style={[s.featuredTypeBadge, { backgroundColor: `${DT.surfaceLowest}CC` }]}>
            <Text style={[s.featuredTypeBadgeText, { color: catColor.text }]}>
              {TIPO_LABELS[item.tipo] || ""}
            </Text>
          </View>
        </View>
        <View style={s.featuredInfo}>
          <Text style={s.featuredTitle} numberOfLines={2}>
            {item.nombre}
          </Text>
          <View style={s.featuredRating}>
            <MaterialIcons name="star" size={12} color={DT.starColor} />
            <Text style={s.featuredRatingText}>
              {item.usosCount >= 1000
                ? `${(item.usosCount / 1000).toFixed(1)}k usos`
                : `${item.usosCount} usos`}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  // ─── Grid card ───
  const renderGridCard = (item: Plantilla) => {
    const catColor = CATEGORY_COLORS[item.tipo] || CATEGORY_COLORS.otro;
    return (
      <Pressable
        key={item.id}
        style={({ pressed }) => [s.gridCard, pressed && { opacity: 0.85 }]}
        onPress={() => handlePlantillaPress(item)}
      >
        <View style={[s.gridPreview, { backgroundColor: `${catColor.bg}40` }]}>
          <MaterialIcons
            name={TIPO_ICONS[item.tipo] || "description"}
            size={36}
            color={catColor.text}
          />
        </View>
        <Text style={s.gridTitle} numberOfLines={2}>
          {item.nombre}
        </Text>
        <Text style={s.gridAuthor} numberOfLines={1}>
          {item.esDelSistema ? "Por PlanearIA" : "Personal"}
        </Text>
        <View style={s.gridFooter}>
          <View style={s.gridUsoBadge}>
            <MaterialIcons name="group" size={10} color={DT.onSurfaceVariant} />
            <Text style={s.gridUsoText}>
              {item.usosCount >= 1000 ? `${(item.usosCount / 1000).toFixed(1)}k` : item.usosCount}
            </Text>
          </View>
          <MaterialIcons name="add-circle" size={18} color={DT.primaryContainer} />
        </View>
      </Pressable>
    );
  };

  // ─── Detail preview modal ───
  const renderDetalleModal = () => {
    if (!detallePlantilla) return null;
    const catColor = CATEGORY_COLORS[detallePlantilla.tipo] || CATEGORY_COLORS.otro;
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
            {/* Handle (mobile) / Close (desktop) */}
            {!isDesktop && (
              <View style={s.detHandle}>
                <View style={s.detHandleBar} />
              </View>
            )}
            {isDesktop && (
              <Pressable
                style={({ pressed }) => [s.detCloseBtn, pressed && { opacity: 0.6 }]}
                onPress={() => setDetallePlantilla(null)}
                accessibilityLabel="Cerrar detalle"
              >
                <MaterialIcons name="close" size={20} color={DT.onSurfaceVariant} />
              </Pressable>
            )}
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
              {/* Badges */}
              <View style={s.detBadgeRow}>
                <View style={[s.detTypeBadge, { backgroundColor: catColor.bg }]}>
                  <Text style={[s.detTypeBadgeText, { color: catColor.text }]}>
                    {TIPO_LABELS[detallePlantilla.tipo] || "PLANTILLA"}
                  </Text>
                </View>
                {detallePlantilla.esDelSistema && (
                  <View style={s.detSystemBadge}>
                    <Text style={s.detSystemBadgeText}>DEL SISTEMA</Text>
                  </View>
                )}
              </View>

              {/* Title */}
              <Text style={[s.detTitle, isDesktop && s.detTitleDesktop]}>
                {detallePlantilla.nombre}
              </Text>

              {/* Author + usage */}
              <View style={s.detMetaRow}>
                <Text style={s.detAuthor}>
                  Por{" "}
                  <Text style={{ color: DT.primaryContainer, fontWeight: "700" }}>
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
            <View style={[s.detActions, isDesktop && s.detActionsDesktop]}>
              <LinearGradient
                colors={["#004580", "#005da8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[s.detPrimaryBtn, isDesktop && { flex: 1 }]}
              >
                <Pressable
                  style={({ pressed }) => [s.detPrimaryBtnInner, pressed && { opacity: 0.85 }]}
                  onPress={handleUsarPlantilla}
                >
                  <MaterialIcons name="bolt" size={20} color={DT.onPrimary} />
                  <Text style={s.detPrimaryBtnText}>Usar plantilla</Text>
                </Pressable>
              </LinearGradient>
              <Pressable
                style={({ pressed }) => [
                  s.detSecondaryBtn,
                  isDesktop && { flex: 1 },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={handleDuplicar}
              >
                <MaterialIcons name="content-copy" size={18} color={DT.onSurface} />
                <Text style={s.detSecondaryBtnText}>Duplicar y editar</Text>
              </Pressable>
              {!detallePlantilla.esDelSistema && (
                <Pressable
                  style={({ pressed }) => pressed && { opacity: 0.7 }}
                  onPress={handleEliminar}
                >
                  <Text style={s.detDeleteText}>Eliminar</Text>
                </Pressable>
              )}
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
        {CATEGORY_PILLS.map((cat) =>
          categoriaActiva === cat.key ? (
            <LinearGradient
              key={cat.key}
              colors={["#004580", "#005da8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.pillGradient}
            >
              <Pressable
                onPress={() => setCategoriaActiva(cat.key)}
                style={({ pressed }) => [s.pillInner, pressed && { opacity: 0.8 }]}
              >
                <Text style={s.pillTextActive}>{cat.label}</Text>
              </Pressable>
            </LinearGradient>
          ) : (
            <Pressable
              key={cat.key}
              style={({ pressed }) => [s.pill, pressed && { opacity: 0.8 }]}
              onPress={() => setCategoriaActiva(cat.key)}
            >
              <Text style={s.pillText}>{cat.label}</Text>
            </Pressable>
          )
        )}
      </ScrollView>

      {/* Destacadas */}
      {destacadas.length > 0 && (
        <View style={s.sectionBlock}>
          <Text style={s.sectionOverline}>SELECCIÓN EDITORIAL</Text>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Destacadas</Text>
            <Pressable
              style={({ pressed }) => pressed && { opacity: 0.6 }}
              onPress={() => navigation.navigate("ListaPlantillas")}
            >
              <Text style={s.sectionLink}>Ver todas</Text>
            </Pressable>
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
          <View style={s.sectionTitleRow}>
            <Text style={s.sectionTitle}>
              {categoriaActiva === "todas"
                ? "Todas"
                : CATEGORY_PILLS.find((c) => c.key === categoriaActiva)?.label || ""}
            </Text>
            <MaterialIcons name="filter-list" size={20} color={DT.outline} />
          </View>
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
          <Pressable
            key={cat.key}
            style={({ pressed }) => [
              s.sidebarItem,
              categoriaActiva === cat.key && s.sidebarItemActive,
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => setCategoriaActiva(cat.key)}
          >
            <MaterialIcons
              name={cat.icon}
              size={20}
              color={categoriaActiva === cat.key ? DT.primaryContainer : DT.onSurfaceVariant}
            />
            <Text
              style={[s.sidebarItemText, categoriaActiva === cat.key && s.sidebarItemTextActive]}
            >
              {cat.label}
            </Text>
            <Text
              style={[
                s.sidebarCount,
                categoriaActiva === cat.key && { color: DT.primaryContainer },
              ]}
            >
              {getCatCount(cat.key)}
            </Text>
          </Pressable>
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
              <Pressable
                style={({ pressed }) => [s.heroBtn, pressed && { opacity: 0.85 }]}
                onPress={() => handlePlantillaPress(destacadas[0])}
              >
                <Text style={s.heroBtnText}>Usar plantilla</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [s.heroBtnOutline, pressed && { opacity: 0.7 }]}
                onPress={() => handlePlantillaPress(destacadas[0])}
              >
                <Text style={s.heroBtnOutlineText}>Más detalles</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Recent horizontal */}
        {recientes.length > 0 && (
          <View style={s.sectionBlock}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Plantillas Recientes</Text>
              <Pressable
                style={({ pressed }) => pressed && { opacity: 0.6 }}
                onPress={() => navigation.navigate("ListaPlantillas")}
              >
                <Text style={s.sectionLink}>Ver todas →</Text>
              </Pressable>
            </View>
            <FlatList
              data={recientes}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [s.desktopCard, pressed && { opacity: 0.85 }]}
                  onPress={() => handlePlantillaPress(item)}
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
                </Pressable>
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
          <Pressable
            style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.6 }]}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Volver"
          >
            <MaterialIcons name="arrow-back" size={24} color={DT.onSurface} />
          </Pressable>
          <Text style={s.topBarTitle}>Plantillas</Text>
        </View>
        <Pressable
          style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.6 }]}
          onPress={handleSearchToggle}
          accessibilityLabel="Buscar"
        >
          <MaterialIcons name="search" size={24} color={DT.onSurfaceVariant} />
        </Pressable>
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
            <Pressable
              style={({ pressed }) => pressed && { opacity: 0.6 }}
              onPress={() => setSearchQuery("")}
            >
              <MaterialIcons name="close" size={18} color={DT.onSurfaceVariant} />
            </Pressable>
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
        <LinearGradient
          colors={["#004580", "#005da8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[s.fab, isDesktop && s.fabDesktop]}
        >
          <Pressable
            onPress={() => navigation.navigate("EditorPlantilla")}
            accessibilityLabel="Crear plantilla"
            style={({ pressed }) => [s.fabInner, pressed && { opacity: 0.85 }]}
          >
            <MaterialIcons name="add" size={28} color={DT.onPrimary} />
          </Pressable>
        </LinearGradient>
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
    backgroundColor: DT.surface,
  },
  topBarLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  backBtn: {
    padding: 8,
    borderRadius: 20,
  },
  topBarTitle: {
    fontWeight: "800",
    fontSize: 20,
    color: DT.onSurface,
    letterSpacing: -0.5,
  },
  // Search
  searchBarMobile: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DT.surfaceLowest,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: `${DT.outlineVariant}4D`,
    ...Platform.select({
      web: { boxShadow: "0px 2px 8px rgba(0,69,128,0.06)" as never },
      default: { elevation: 1 },
    }),
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: DT.onSurface,
    padding: 0,
  },
  // Scroll
  scrollMain: { flex: 1 },
  scrollPad: { paddingBottom: 100 },
  // Pills
  pillsScroll: { maxHeight: 52 },
  pillsContent: { paddingHorizontal: 16, gap: 12 },
  pill: {
    backgroundColor: DT.surfaceLow,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
  },
  pillGradient: {
    borderRadius: 999,
    ...Platform.select({
      web: { boxShadow: "0px 2px 8px rgba(0,69,128,0.15)" as never },
      default: { elevation: 3 },
    }),
  },
  pillInner: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  pillText: {
    fontWeight: "600",
    fontSize: 14,
    color: DT.onSurfaceVariant,
  },
  pillTextActive: {
    fontWeight: "600",
    fontSize: 14,
    color: DT.onPrimary,
  },
  // Section
  sectionBlock: { marginTop: 24, paddingHorizontal: 16 },
  sectionOverline: {
    fontWeight: "700",
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: DT.onSurfaceVariant,
    opacity: 0.6,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontWeight: "800",
    fontSize: 20,
    color: DT.onSurface,
    letterSpacing: -0.3,
  },
  sectionLink: {
    fontWeight: "700",
    fontSize: 14,
    color: DT.primaryContainer,
  },
  // Featured
  featuredList: { paddingHorizontal: 16, gap: 20, paddingVertical: 8 },
  featuredCard: {
    width: 160,
    height: 200,
    backgroundColor: DT.surfaceLowest,
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      web: { boxShadow: "0px 2px 8px rgba(0,69,128,0.06)" as never },
      default: { elevation: 2 },
    }),
  },
  featuredPreview: {
    height: 128,
    backgroundColor: DT.surfaceLow,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  featuredSystemBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: DT.primaryFixed,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  featuredSystemBadgeText: {
    fontWeight: "700",
    fontSize: 10,
    color: DT.primaryContainer,
    letterSpacing: 0.5,
  },
  featuredTypeBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  featuredTypeBadgeText: {
    fontWeight: "700",
    fontSize: 10,
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
    fontWeight: "600",
    fontSize: 14,
    color: DT.onSurface,
  },
  featuredRating: { flexDirection: "row", alignItems: "center", gap: 4 },
  featuredRatingText: {
    fontWeight: "700",
    fontSize: 10,
    color: DT.outline,
  },
  // Grid
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  gridCard: {
    width: "47%",
    backgroundColor: DT.surfaceLowest,
    borderRadius: 16,
    padding: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: `${DT.outlineVariant}1A`,
    ...Platform.select({
      web: { boxShadow: "0px 2px 8px rgba(0,69,128,0.06)" as never },
      default: { elevation: 1 },
    }),
  },
  gridPreview: {
    height: 96,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  gridTitle: {
    fontWeight: "700",
    fontSize: 14,
    color: DT.onSurface,
  },
  gridAuthor: {
    fontWeight: "500",
    fontSize: 11,
    color: DT.onSurfaceVariant,
  },
  gridFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  gridUsoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  gridUsoText: {
    fontWeight: "500",
    fontSize: 10,
    color: DT.onSurfaceVariant,
  },
  noResults: { alignItems: "center", paddingVertical: 40, gap: 8 },
  noResultsText: {
    fontWeight: "600",
    fontSize: 14,
    color: DT.outlineVariant,
  },
  // Desktop
  desktopRow: { flex: 1, flexDirection: "row" },
  sidebar: {
    width: 240,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: DT.surfaceLow,
  },
  sidebarLabel: {
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
  sidebarItemActive: { backgroundColor: DT.primaryFixed },
  sidebarItemText: {
    flex: 1,
    fontWeight: "600",
    fontSize: 14,
    color: DT.onSurface,
  },
  sidebarItemTextActive: { color: DT.primaryContainer, fontWeight: "700" },
  sidebarCount: {
    fontWeight: "600",
    fontSize: 12,
    color: DT.outline,
  },
  desktopMain: { flex: 1 },
  desktopMainPad: { paddingHorizontal: 24, paddingBottom: 100 },
  desktopSearchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DT.surfaceLowest,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
    gap: 10,
    ...Platform.select({
      web: { boxShadow: "0px 2px 8px rgba(0,69,128,0.06)" as never },
      default: { elevation: 1 },
    }),
  },
  desktopSearchInput: {
    flex: 1,
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
    fontWeight: "700",
    fontSize: 11,
    color: DT.onPrimary,
    letterSpacing: 0.5,
  },
  heroTitle: {
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
      web: { boxShadow: "0px 2px 8px rgba(0,69,128,0.06)" as never },
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
    fontWeight: "700",
    fontSize: 10,
    letterSpacing: 1,
    color: DT.primaryContainer,
    paddingHorizontal: 14,
    paddingTop: 10,
    textTransform: "uppercase",
  },
  desktopCardTitle: {
    fontWeight: "700",
    fontSize: 14,
    color: DT.onSurface,
    paddingHorizontal: 14,
    paddingTop: 4,
  },
  desktopCardDesc: {
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
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: DT.surfaceLow,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontWeight: "700",
    fontSize: 22,
    color: DT.onSurface,
    textAlign: "center",
    marginBottom: 12,
  },
  emptySubtitle: {
    fontWeight: "400",
    fontSize: 15,
    color: DT.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
    maxWidth: 280,
  },
  emptyPrimaryBtn: {
    backgroundColor: DT.primaryContainer,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
    marginBottom: 12,
    ...Platform.select({
      web: { boxShadow: "0px 4px 12px rgba(0,69,128,0.15)" as never },
      default: { elevation: 3 },
    }),
  },
  emptyPrimaryBtnText: {
    fontWeight: "700",
    fontSize: 14,
    color: DT.onPrimary,
  },
  emptySecondaryBtn: {
    backgroundColor: DT.surfaceHigh,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
    marginBottom: 16,
  },
  emptySecondaryBtnText: {
    fontWeight: "700",
    fontSize: 14,
    color: DT.onSurface,
  },
  emptyLink: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 16 },
  emptyLinkText: {
    fontWeight: "600",
    fontSize: 14,
    color: DT.primaryContainer,
  },
  // Skeleton
  skeletonContainer: { padding: 16, gap: 20 },
  skeletonPills: { flexDirection: "row", gap: 12 },
  skeletonPill: {
    height: 36,
    borderRadius: 20,
    backgroundColor: DT.surfaceHigh,
  },
  skeletonFeatured: { flexDirection: "row", gap: 16 },
  skeletonFeaturedCard: {
    width: 160,
    height: 200,
    borderRadius: 16,
    backgroundColor: DT.surfaceHigh,
    opacity: 0.6,
  },
  skeletonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  skeletonGridCard: {
    width: "47%",
    borderRadius: 16,
    backgroundColor: DT.surfaceHigh,
    padding: 20,
    gap: 8,
  },
  skeletonGridThumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: DT.surfaceLowest,
    opacity: 0.3,
  },
  skeletonGridLine1: {
    height: 16,
    width: "75%",
    borderRadius: 8,
    backgroundColor: DT.surfaceLowest,
    opacity: 0.3,
  },
  skeletonGridLine2: {
    height: 12,
    width: "100%",
    borderRadius: 6,
    backgroundColor: DT.surfaceLowest,
    opacity: 0.2,
  },
  // Detail modal
  detOverlay: {
    flex: 1,
    backgroundColor: `${DT.primaryContainer}33`,
    justifyContent: "flex-end",
    ...Platform.select({
      web: { backdropFilter: "blur(4px)" as never },
      default: {},
    }),
  },
  detSheet: {
    backgroundColor: DT.surfaceLowest,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: "85%",
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 28,
    ...Platform.select({
      web: { boxShadow: "0px -8px 48px rgba(0,47,90,0.12)" as never },
      default: { elevation: 24 },
    }),
  },
  detSheetDesktop: {
    alignSelf: "center",
    width: 600,
    borderRadius: 24,
    marginBottom: "auto",
    marginTop: "auto",
    maxHeight: "80%",
    paddingTop: 32,
    ...Platform.select({
      web: { boxShadow: "0px 24px 48px rgba(0,72,132,0.08)" as never },
      default: { elevation: 24 },
    }),
  },
  detCloseBtn: {
    position: "absolute",
    top: 24,
    right: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DT.surfaceLow,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  detHandle: { alignItems: "center", paddingTop: 12, paddingBottom: 8 },
  detHandleBar: {
    width: 48,
    height: 6,
    borderRadius: 3,
    backgroundColor: DT.outlineVariant,
    opacity: 0.4,
  },
  detBadgeRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 },
  detTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  detTypeBadgeText: {
    fontWeight: "700",
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  detSystemBadge: {
    backgroundColor: DT.primaryFixed,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 4,
  },
  detSystemBadgeText: {
    fontWeight: "700",
    fontSize: 10,
    color: DT.primaryContainer,
    letterSpacing: 0.5,
  },
  detTitle: {
    fontWeight: "800",
    fontSize: 24,
    color: DT.onSurface,
    marginTop: 16,
    marginBottom: 8,
    lineHeight: 28,
  },
  detTitleDesktop: {
    fontSize: 44,
    lineHeight: 48,
    letterSpacing: -0.5,
  },
  detMetaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  detAuthor: {
    fontWeight: "500",
    fontSize: 14,
    color: DT.onSurfaceVariant,
  },
  detDot: { color: DT.onSurfaceVariant, fontSize: 14 },
  detUsos: {
    fontWeight: "500",
    fontSize: 14,
    color: DT.onSurfaceVariant,
  },
  detTagsRow: { flexDirection: "row", gap: 8, marginBottom: 16, flexWrap: "wrap" },
  detTag: {
    backgroundColor: DT.surfaceHigh,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  detTagText: {
    fontWeight: "700",
    fontSize: 14,
    color: DT.onSurfaceVariant,
  },
  detPreview: {
    backgroundColor: DT.surfaceLow,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    minHeight: 200,
    borderWidth: 1,
    borderColor: `${DT.outlineVariant}1A`,
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
    fontWeight: "500",
    fontSize: 14,
    color: DT.onSurfaceVariant,
    lineHeight: 20,
    marginBottom: 12,
  },
  detActions: { marginTop: 8, gap: 12 },
  detActionsDesktop: { flexDirection: "row", alignItems: "center" },
  detPrimaryBtn: {
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      web: { boxShadow: "0px 4px 16px rgba(0,69,128,0.2)" as never },
      default: { elevation: 4 },
    }),
  },
  detPrimaryBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  detPrimaryBtnText: {
    fontWeight: "700",
    fontSize: 16,
    color: DT.onPrimary,
  },
  detSecondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DT.surfaceHigh,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 8,
  },
  detSecondaryBtnText: {
    fontWeight: "700",
    fontSize: 14,
    color: DT.onSurface,
  },
  detDeleteText: {
    fontWeight: "700",
    fontSize: 14,
    color: DT.error,
    textAlign: "center",
    paddingVertical: 14,
  },
  // FAB
  fab: {
    position: "absolute",
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 16,
    ...Platform.select({
      web: { boxShadow: "0px 8px 24px rgba(0,69,128,0.2)" as never },
      default: { elevation: 6 },
    }),
  },
  fabInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  fabDesktop: {
    right: 32,
    bottom: 32,
    width: 64,
    height: 64,
    borderRadius: 20,
  },
});

export default BibliotecaPlantillasScreen;
