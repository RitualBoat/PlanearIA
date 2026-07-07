import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TextInput,
  Modal,
  Pressable,
  Alert,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { COLORS, Recurso } from "../../../types";
import { useListaRecursosViewModel } from "../../hooks/useListaRecursosViewModel";
import { isWeb } from "../../utils/responsive";

const FILTER_OPTIONS = [
  { id: "todos", label: "Todos" },
  { id: "examen", label: "Examen" },
  { id: "presentacion", label: "Presentación" },
  { id: "mapa_mental", label: "Mapa Mental" },
  { id: "linea_tiempo", label: "Línea de Tiempo" },
  { id: "audio", label: "Audio" },
  { id: "video", label: "Video" },
  { id: "documento", label: "Documento" },
] as const;

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `hace ${diffH} hora${diffH > 1 ? "s" : ""}`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `hace ${diffD} día${diffD > 1 ? "s" : ""}`;
  const diffW = Math.floor(diffD / 7);
  return `hace ${diffW} semana${diffW > 1 ? "s" : ""}`;
};

const ListaRecursosScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const wideLayout = width >= 920;
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "ListaRecursos">>();
  const initialFiltro = route.params?.filtroTipo;

  const vm = useListaRecursosViewModel(initialFiltro);
  const [menuRecurso, setMenuRecurso] = useState<Recurso | null>(null);

  const handleEditar = (recurso: Recurso) => {
    setMenuRecurso(null);
    navigation.navigate("CrearRecurso", { recursoId: recurso.id as number });
  };

  const handleDuplicar = async (recurso: Recurso) => {
    setMenuRecurso(null);
    await vm.duplicarRecurso(recurso);
  };

  const handleEliminar = (recurso: Recurso) => {
    setMenuRecurso(null);
    Alert.alert("Eliminar recurso", `¿Estás seguro de eliminar "${recurso.titulo}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => vm.eliminarRecurso(recurso.id as number),
      },
    ]);
  };

  const handleAsignar = () => {
    setMenuRecurso(null);
    Alert.alert("Próximamente", "Esta función se implementará en una próxima actualización.");
  };

  const handleCompartir = async () => {
    if (!menuRecurso) return;
    setMenuRecurso(null);

    const fileUri = menuRecurso.url; // stored from file picker
    if (!fileUri) {
      Alert.alert("Sin archivo", "Este recurso no tiene un archivo adjunto para compartir.");
      return;
    }

    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert("No disponible", "Compartir no está disponible en este dispositivo.");
      return;
    }

    try {
      // Ensure file is accessible — copy to a cache location if needed
      const fileName = menuRecurso.archivo || `recurso_${menuRecurso.id}`;
      const cacheUri = `${FileSystem.cacheDirectory}${fileName}`;

      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        Alert.alert("Archivo no encontrado", "El archivo original ya no está disponible.");
        return;
      }

      // Copy to cache if not already there
      if (fileUri !== cacheUri) {
        await FileSystem.copyAsync({ from: fileUri, to: cacheUri });
      }

      await Sharing.shareAsync(cacheUri, {
        dialogTitle: `Compartir: ${menuRecurso.titulo}`,
      });
    } catch {
      Alert.alert("Error", "No se pudo compartir el archivo.");
    }
  };

  const tipoLabel =
    vm.filtroTipo !== "todos"
      ? FILTER_OPTIONS.find((f) => f.id === vm.filtroTipo)?.label || vm.filtroTipo
      : "";

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
          <Text style={styles.headerTitle}>Mis Recursos</Text>
          <Pressable
            style={({ pressed }) => [styles.fabSmall, pressed && { opacity: 0.8 }]}
            onPress={() => navigation.navigate("CrearRecurso")}
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
              placeholder="Buscar recurso..."
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
            const isActive = vm.filtroTipo === f.id;
            return (
              <Pressable
                key={f.id}
                style={({ pressed }) => [
                  styles.chip,
                  isActive && styles.chipActive,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => vm.setFiltroTipo(f.id)}
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
          {vm.recursosFiltrados.length === 0 ? (
            /* Empty state */
            <View style={styles.emptyContainer}>
              <MaterialIcons name="search-off" size={80} color={COLORS.borderLight} />
              <Text style={styles.emptyTitle}>
                No hay {tipoLabel ? tipoLabel.toLowerCase() + "es" : "recursos"} aún
              </Text>
              <Text style={styles.emptySubtitle}>
                Crea tu primer {tipoLabel ? tipoLabel.toLowerCase() : "recurso"} o importa uno desde
                tu dispositivo
              </Text>
              <Pressable
                style={({ pressed }) => [styles.emptyButton, pressed && { opacity: 0.8 }]}
                onPress={() => navigation.navigate("CrearRecurso")}
              >
                <Text style={styles.emptyButtonText}>
                  + Crear {tipoLabel ? tipoLabel.toLowerCase() : "recurso"}
                </Text>
              </Pressable>
            </View>
          ) : (
            <>
              {vm.recursosFiltrados.map((recurso) => (
                <Pressable
                  key={recurso.id}
                  style={({ pressed }) => [
                    styles.recursoCard,
                    wideLayout && styles.recursoCardWide,
                    pressed && { opacity: 0.9 },
                  ]}
                  onPress={() => handleEditar(recurso)}
                >
                  <View style={styles.recursoRow}>
                    <View
                      style={[
                        styles.recursoIcon,
                        { backgroundColor: `${vm.getColorByTipo(recurso.tipo)}18` },
                      ]}
                    >
                      <MaterialIcons
                        name={vm.getIconByTipo(recurso.tipo) as any}
                        size={24}
                        color={vm.getColorByTipo(recurso.tipo)}
                      />
                    </View>

                    <View style={styles.recursoInfo}>
                      <Text style={styles.recursoTitulo} numberOfLines={1}>
                        {recurso.titulo}
                      </Text>
                      <Text style={styles.recursoDescripcion} numberOfLines={1}>
                        {recurso.descripcion}
                        {recurso.descripcion ? " · " : ""}
                        {formatTimeAgo(recurso.fechaModificacion)}
                      </Text>
                      <View style={styles.recursoBadges}>
                        <View
                          style={[
                            styles.badge,
                            { backgroundColor: `${vm.getColorByTipo(recurso.tipo)}14` },
                          ]}
                        >
                          <Text
                            style={[styles.badgeText, { color: vm.getColorByTipo(recurso.tipo) }]}
                          >
                            {vm.getLabelByTipo(recurso.tipo)}
                          </Text>
                        </View>
                        <View style={[styles.badge, recurso.origen === "ia" && styles.badgeIA]}>
                          {recurso.origen === "ia" && (
                            <MaterialIcons
                              name="auto-awesome"
                              size={10}
                              color={COLORS.purple}
                              style={{ marginRight: 3 }}
                            />
                          )}
                          <Text
                            style={[
                              styles.badgeText,
                              recurso.origen === "ia"
                                ? { color: COLORS.purple }
                                : { color: COLORS.textSecondary },
                            ]}
                          >
                            {vm.getOrigenLabel(recurso.origen)}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <Pressable
                      style={({ pressed }) => pressed && { opacity: 0.6 }}
                      onPress={() => setMenuRecurso(recurso)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <MaterialIcons name="more-vert" size={20} color={COLORS.textTertiary} />
                    </Pressable>
                  </View>
                </Pressable>
              ))}

              {/* AI promo card */}
              <View style={styles.promoCard}>
                <Text style={styles.promoTitle}>Potencia tus recursos con IA</Text>
                <Text style={styles.promoSubtitle}>
                  Convierte cualquier texto en un examen interactivo en segundos.
                </Text>
                <Pressable
                  style={({ pressed }) => [styles.promoButton, pressed && { opacity: 0.8 }]}
                >
                  <Text style={styles.promoButtonText}>Probar Generador</Text>
                </Pressable>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Bottom sheet menu */}
      <Modal
        visible={menuRecurso !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuRecurso(null)}
      >
        <Pressable style={styles.overlay} onPress={() => setMenuRecurso(null)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            {/* Sheet header */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle} numberOfLines={1}>
                {menuRecurso?.titulo}
              </Text>
              {menuRecurso && (
                <View style={[styles.sheetBadge]}>
                  <Text style={styles.sheetBadgeText}>{vm.getLabelByTipo(menuRecurso.tipo)}</Text>
                </View>
              )}
              <Pressable
                style={({ pressed }) => pressed && { opacity: 0.6 }}
                onPress={() => setMenuRecurso(null)}
              >
                <MaterialIcons name="close" size={22} color={COLORS.textSecondary} />
              </Pressable>
            </View>

            {/* Menu items */}
            <Pressable
              style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.6 }]}
              onPress={() => menuRecurso && handleEditar(menuRecurso)}
            >
              <MaterialIcons name="edit" size={22} color={COLORS.text} />
              <Text style={styles.menuItemText}>Editar recurso</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.6 }]}
              onPress={() => menuRecurso && handleDuplicar(menuRecurso)}
            >
              <MaterialIcons name="content-copy" size={22} color={COLORS.text} />
              <Text style={styles.menuItemText}>Duplicar recurso</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.6 }]}
              onPress={handleAsignar}
            >
              <MaterialIcons name="assignment-turned-in" size={22} color={COLORS.text} />
              <Text style={styles.menuItemText}>Asignar a entregable</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.6 }]}
              onPress={() => void handleCompartir()}
            >
              <MaterialIcons name="share" size={22} color={COLORS.text} />
              <Text style={styles.menuItemText}>Compartir</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.6 }]}
              onPress={() => menuRecurso && handleEliminar(menuRecurso)}
            >
              <MaterialIcons name="delete-outline" size={22} color={COLORS.error} />
              <Text style={[styles.menuItemText, { color: COLORS.error }]}>Eliminar recurso</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.cancelButton, pressed && { opacity: 0.8 }]}
              onPress={() => setMenuRecurso(null)}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
  chipsRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
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
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  chipTextActive: { color: "#FFFFFF" },
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
  /* Empty state */
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 32,
  },
  emptyButton: {
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primary,
  },
  /* Resource card */
  recursoCard: {
    width: "100%",
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    boxShadow: "0px 4px 12px rgba(33, 60, 109, 0.06)",
  },
  recursoCardWide: { width: "49%" },
  recursoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  recursoIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  recursoInfo: { flex: 1 },
  recursoTitulo: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 2,
  },
  recursoDescripcion: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  recursoBadges: {
    flexDirection: "row",
    gap: 6,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.backgroundSoft,
  },
  badgeIA: {
    backgroundColor: COLORS.purpleTint,
    borderColor: COLORS.purpleTint,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  /* Promo card */
  promoCard: {
    backgroundColor: COLORS.primaryTint,
    borderRadius: 16,
    padding: 20,
    gap: 6,
    marginTop: 6,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.primary,
  },
  promoSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  promoButton: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 6,
  },
  promoButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  /* Bottom sheet */
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  sheetTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  sheetBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: COLORS.primaryTint,
  },
  sheetBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.primary,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 14,
  },
  menuItemText: {
    fontSize: 15,
    color: COLORS.text,
  },
  cancelButton: {
    marginTop: 12,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
});

export default ListaRecursosScreen;
