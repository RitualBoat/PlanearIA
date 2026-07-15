import React from "react";
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  Image,
  useWindowDimensions,
} from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, useAnimatedScrollHandler, interpolate, Extrapolation } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { COLORS } from "../../../types";
import { isWeb } from "../../utils/responsive";
import AnimatedTopPill from "../../components/AnimatedTopPill";
import { useRecursos } from "../../context/RecursosContext";

type RecursosDidacticosScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "RecursosDidacticos"
>;

interface RecursosDidacticosScreenProps {
  navigation: RecursosDidacticosScreenNavigationProp;
}

const TIPO_CARDS = [
  { id: "examen", title: "Exámenes", icon: "quiz", color: COLORS.warning, bgColor: "#FFF3E0" },
  {
    id: "presentacion",
    title: "Presentaciones",
    icon: "slideshow",
    color: COLORS.primaryLight,
    bgColor: "#E3F2FD",
  },
  {
    id: "mapa_mental",
    title: "Mapas\nMentales",
    icon: "hub",
    color: COLORS.primary,
    bgColor: "#E3F2FD",
  },
  {
    id: "linea_tiempo",
    title: "Líneas de\nTiempo",
    icon: "show-chart",
    color: COLORS.textSecondary,
    bgColor: "#F0F4F9",
  },
] as const;

const FILTER_CHIPS = [
  { id: "todos", label: "Todos" },
  { id: "examen", label: "Exámenes" },
  { id: "presentacion", label: "Presentac..." },
  { id: "mapa_mental", label: "Mapas" },
  { id: "linea_tiempo", label: "Líneas" },
] as const;

const RecursosDidacticosScreen: React.FC<RecursosDidacticosScreenProps> = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const wideLayout = width >= 920;
  const { recursos } = useRecursos();
  const scrollY = useSharedValue(0);
  const mobilePillStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 12, 34], [1, 0.45, 0], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(scrollY.value, [0, 34], [0, -14], Extrapolation.CLAMP) }],
  }));
  const handleScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const getCountByTipo = (tipo: string) =>
    tipo === "todos" ? recursos.length : recursos.filter((r) => r.tipo === tipo).length;

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerBar}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
            onPress={() =>
              navigation.canGoBack() ? navigation.goBack() : navigation.navigate("MainTabs" as any)
            }
          >
            <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
          </Pressable>
          <Text style={styles.headerBarTitle}>Recursos</Text>
          <View style={{ width: 40 }} />
        </View>
        <Animated.ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {/* Header pill */}
          <View style={styles.headerBlock}>
            <Animated.View style={mobilePillStyle}>
              <AnimatedTopPill
                icon="menu-book"
                title="Recursos"
                subtitle="Crea y organiza trabajos o materiales"
              />
            </Animated.View>
          </View>

          {/* Hero text */}
          <Text style={styles.heroTitle}>Crea y organiza{"\n"}materiales didácticos</Text>
          <Text style={styles.heroSubtitle}>
            Gestiona tu biblioteca digital con herramientas inteligentes.
          </Text>

          {/* MIS RECURSOS — chip filters */}
          <Text style={styles.sectionLabel}>MIS RECURSOS</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {FILTER_CHIPS.map((chip) => {
              const count = getCountByTipo(chip.id);
              return (
                <Pressable
                  key={chip.id}
                  style={({ pressed }) => [
                    styles.chip,
                    chip.id === "todos" && styles.chipActive,
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={() =>
                    navigation.navigate("ListaRecursos", {
                      filtroTipo: chip.id === "todos" ? undefined : chip.id,
                    })
                  }
                >
                  <Text style={[styles.chipText, chip.id === "todos" && styles.chipTextActive]}>
                    {chip.label} ({count})
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* POR TIPO — 2x2 grid */}
          <Text style={styles.sectionLabel}>POR TIPO</Text>
          <View style={[styles.tipoGrid, wideLayout && styles.tipoGridWide]}>
            {TIPO_CARDS.map((card) => {
              const count = getCountByTipo(card.id);
              return (
                <Pressable
                  key={card.id}
                  style={({ pressed }) => [
                    styles.tipoCard,
                    wideLayout && styles.tipoCardWide,
                    pressed && { opacity: 0.85 },
                  ]}
                  onPress={() => navigation.navigate("ListaRecursos", { filtroTipo: card.id })}
                >
                  <View style={[styles.tipoIconCircle, { backgroundColor: card.bgColor }]}>
                    <MaterialIcons name={card.icon as any} size={28} color={card.color} />
                  </View>
                  <Text style={styles.tipoTitle}>{card.title}</Text>
                  <Text style={styles.tipoCount}>{count} RECURSOS</Text>
                </Pressable>
              );
            })}
          </View>

          {/* ACCIONES RÁPIDAS */}
          <Text style={styles.sectionLabel}>ACCIONES RÁPIDAS</Text>

          <Pressable
            style={({ pressed }) => [styles.actionCard, pressed && { opacity: 0.85 }]}
            onPress={() => navigation.navigate("CrearRecurso")}
          >
            <View style={[styles.actionIcon, { backgroundColor: COLORS.primaryTint }]}>
              <MaterialIcons name="add" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Crear recurso</Text>
              <Text style={styles.actionSubtitle}>Nuevo documento, examen o presentación</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={COLORS.textTertiary} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.actionCard, pressed && { opacity: 0.85 }]}
            onPress={() => navigation.navigate("ListaRecursos")}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#F0F4F9" }]}>
              <MaterialIcons name="format-list-bulleted" size={24} color={COLORS.textSecondary} />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Ver todos mis recursos</Text>
              <Text style={styles.actionSubtitle}>Buscar y gestionar tu biblioteca</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={COLORS.textTertiary} />
          </Pressable>

          {/* Banner decorativo */}
          <View style={styles.banner}>
            <Text style={styles.bannerTitle}>
              Organización inteligente{"\n"}para mentes brillantes.
            </Text>
          </View>
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 54,
    paddingBottom: isWeb() ? 28 : 110,
    gap: 12,
    width: "100%",
    alignSelf: "center",
    maxWidth: 1220,
  },
  headerBlock: { marginBottom: 2 },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: "#E2EAF4",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF3FA",
  },
  headerBarTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: -0.3,
    lineHeight: 32,
  },
  heroSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  sectionLabel: {
    marginTop: 8,
    fontSize: 12,
    color: COLORS.textTertiary,
    fontWeight: "700",
    letterSpacing: 1,
  },
  chipsRow: { gap: 8, paddingVertical: 4 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  chipActive: {
    backgroundColor: COLORS.text,
    borderColor: COLORS.text,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  chipTextActive: { color: "#FFFFFF" },
  tipoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  tipoGridWide: {},
  tipoCard: {
    width: "47.5%",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
    boxShadow: "0px 4px 12px rgba(33, 60, 109, 0.06)",
  },
  tipoCardWide: { width: "23%" },
  tipoIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  tipoTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },
  tipoCount: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  actionInfo: { flex: 1 },
  actionTitle: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  actionSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  banner: {
    borderRadius: 16,
    padding: 24,
    backgroundColor: "#D5C4A1",
    marginTop: 4,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#3E2C1A",
    lineHeight: 24,
  },
});

export default RecursosDidacticosScreen;
