import React from "react";
import {
  Animated,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  StatusBar,
  ScrollView,
  TextInput,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { COLORS } from "../../../types";
import { isWeb } from "../../utils/responsive";
import { useHomeViewModel } from "../../hooks/useHomeViewModel";
import AnimatedTopPill from "../../components/AnimatedTopPill";

type NavOptionId = "planeaciones" | "grupos" | "recursosDidacticos" | "cuenta";

const metricCards = [
  {
    id: "planeaciones",
    title: "Total planeaciones",
    value: "24",
    badge: "+12%",
    icon: "event-note" as const,
    tone: COLORS.metricBlue,
  },
  {
    id: "grupos",
    title: "Grupos asignados",
    value: "6",
    badge: "Activo",
    icon: "groups" as const,
    tone: COLORS.metricTeal,
  },
  {
    id: "sugerencias",
    title: "Sugerencias IA",
    value: "158",
    badge: "Pro",
    icon: "auto-awesome" as const,
    tone: COLORS.metricAmber,
  },
  {
    id: "pendientes",
    title: "Tareas hoy",
    value: "3",
    badge: "Pendientes",
    icon: "assignment-late" as const,
    tone: COLORS.danger,
  },
];

const continueCards = [
  {
    id: "c1",
    title: "Cálculo Diferencial: Límites y Continuidad",
    tag: "MATEMÁTICAS",
    updated: "Editado hace 2 horas",
    progress: 75,
  },
  {
    id: "c2",
    title: "Mecánica Cuántica: Introducción a Partículas",
    tag: "FÍSICA",
    updated: "Editado ayer",
    progress: 30,
  },
];

const timeline = [
  {
    id: "t1",
    title: "Planeación completada",
    detail: "Unidad 3 · Álgebra Lineal",
    time: "Hace 15 min",
  },
  {
    id: "t2",
    title: "IA generó 5 ejercicios",
    detail: "Basado en el tema 'Límites'",
    time: "Hace 1 hora",
  },
  {
    id: "t3",
    title: "Grupo 11-A actualizado",
    detail: "Se agregaron 2 nuevos alumnos",
    time: "Hace 3 horas",
  },
  {
    id: "t4",
    title: "Sincronización exitosa",
    detail: "Google Classroom conectado",
    time: "Ayer, 18:30",
  },
];

const HomeScreen: React.FC = () => {
  const {
    menuVisible,
    menuOptions,
    openMenu,
    closeMenu,
    handleLogout,
    handleProfile,
    handleNavigation,
  } = useHomeViewModel();
  const { width } = useWindowDimensions();
  const scrollY = React.useRef(new Animated.Value(0)).current;

  const webDesktop = isWeb() && width >= 1080;
  const wideContent = width >= 860;
  const isNarrowMobile = !webDesktop && width < 420;
  const quickActionCardWidth = !wideContent
    ? Math.max(138, Math.floor((width - 36 - 10) / 2))
    : undefined;
  const greetingOpacity = scrollY.interpolate({
    inputRange: [0, 22, 56],
    outputRange: [1, 0.55, 0],
    extrapolate: "clamp",
  });
  const greetingTranslateY = scrollY.interpolate({
    inputRange: [0, 56],
    outputRange: [0, -16],
    extrapolate: "clamp",
  });

  const sidebarItems = [
    { id: "home", label: "Inicio", icon: "home" as const, active: true },
    { id: "planeaciones", label: "Planeaciones", icon: "event-note" as const },
    { id: "grupos", label: "Grupos", icon: "groups" as const },
    { id: "recursosDidacticos", label: "Recursos", icon: "folder" as const },
    { id: "cuenta", label: "Configuración", icon: "settings" as const },
  ];

  const onSidebarPress = (id: string) => {
    if (id === "home") return;
    const menuOption = menuOptions.find((option) => option.id === (id as NavOptionId));
    if (menuOption) {
      handleNavigation(menuOption);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={COLORS.surfaceHover} barStyle="dark-content" />

      <Modal animationType="fade" transparent visible={menuVisible} onRequestClose={closeMenu}>
        <View style={styles.menuOverlay}>
          <View style={styles.menuContainer}>
            <Text style={styles.menuTitle}>Cuenta</Text>
            <Pressable style={styles.menuOption} onPress={handleProfile}>
              <MaterialIcons name="person" size={20} color={COLORS.primary} />
              <Text style={styles.menuText}>Mi perfil</Text>
            </Pressable>
            <Pressable style={styles.menuOption} onPress={handleLogout}>
              <MaterialIcons name="logout" size={20} color={COLORS.error} />
              <Text style={[styles.menuText, styles.menuTextDanger]}>Cerrar sesión</Text>
            </Pressable>
            <Pressable style={styles.closeMenuButton} onPress={closeMenu}>
              <Text style={styles.closeMenuText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <View style={styles.rootLayout}>
        {webDesktop && (
          <View style={styles.sidebar}>
            <View>
              <Text style={styles.logo}>PlanearIA</Text>
              <Text style={styles.logoSub}>Cognitive sanctuary</Text>
            </View>

            <View style={styles.sidebarMenu}>
              {sidebarItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.sidebarItem, item.active && styles.sidebarItemActive]}
                  onPress={() => onSidebarPress(item.id)}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name={item.icon}
                    size={18}
                    color={item.active ? COLORS.primaryMuted : "#7D8BA3"}
                  />
                  <Text style={[styles.sidebarText, item.active && styles.sidebarTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.sidebarCta}
              activeOpacity={0.85}
              onPress={() => onSidebarPress("planeaciones")}
            >
              <MaterialIcons name="add" size={18} color={COLORS.surface} />
              <Text style={styles.sidebarCtaText}>Nueva Planeación</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.mainArea}>
          {webDesktop ? (
            <View style={styles.topBar}>
              <View style={styles.searchBar}>
                <MaterialIcons name="search" size={18} color="#8A96AA" />
                <TextInput
                  placeholder="Buscar planeaciones, recursos o alumnos..."
                  placeholderTextColor="#8A96AA"
                  style={styles.searchInput}
                />
              </View>
            </View>
          ) : (
            <>
              <View style={styles.floatingActionsWrap}>
                <View style={[styles.topActions, styles.topActionsCompact]}>
                  <TouchableOpacity
                    style={[styles.iconAction, styles.iconActionCompact]}
                    activeOpacity={0.85}
                  >
                    <MaterialIcons name="notifications-none" size={20} color={COLORS.textDark} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.iconAction, styles.iconActionCompact]}
                    activeOpacity={0.85}
                  >
                    <MaterialIcons name="help-outline" size={20} color={COLORS.textDark} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.profileBlock, styles.profileBlockCompact]}
                    activeOpacity={0.85}
                    onPress={openMenu}
                  >
                    <View style={styles.avatarCircle}>
                      <MaterialIcons name="person" size={16} color={COLORS.surface} />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              <Animated.View
                style={[
                  styles.mobileGreetingOverlay,
                  {
                    opacity: greetingOpacity,
                    transform: [{ translateY: greetingTranslateY }],
                  },
                ]}
                pointerEvents="none"
              >
                <AnimatedTopPill
                  icon="waving-hand"
                  title="Hola, Profe Ana"
                  subtitle="Resumen de tu semana académica"
                />
              </Animated.View>
            </>
          )}

          <Animated.ScrollView
            contentContainerStyle={[styles.scrollBody, !webDesktop && styles.scrollBodyMobile]}
            showsVerticalScrollIndicator={false}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
              useNativeDriver: true,
            })}
            scrollEventThrottle={16}
          >
            <View style={[styles.metricsGrid, wideContent && styles.metricsGridWide]}>
              {metricCards.map((metric) => (
                <View
                  key={metric.id}
                  style={[styles.metricCard, wideContent && styles.metricCardWide]}
                >
                  <View style={styles.metricHeader}>
                    <View style={[styles.metricIconWrap, { backgroundColor: `${metric.tone}1A` }]}>
                      <MaterialIcons name={metric.icon} size={18} color={metric.tone} />
                    </View>
                    <View style={[styles.metricBadge, { backgroundColor: `${metric.tone}21` }]}>
                      <Text style={[styles.metricBadgeText, { color: metric.tone }]}>
                        {metric.badge}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.metricTitle}>{metric.title}</Text>
                  <Text style={styles.metricValue}>{metric.value}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.sectionLabel}>ACCIONES RÁPIDAS</Text>

            <ScrollView
              horizontal={!wideContent}
              contentContainerStyle={[
                styles.quickActionsRow,
                wideContent && styles.quickActionsRowWide,
              ]}
              showsHorizontalScrollIndicator={false}
            >
              <TouchableOpacity
                style={[
                  styles.quickActionCard,
                  styles.quickActionPrimary,
                  !wideContent && { width: quickActionCardWidth },
                ]}
                activeOpacity={0.85}
                onPress={() => onSidebarPress("planeaciones")}
              >
                <MaterialIcons name="edit-document" size={22} color={COLORS.surface} />
                <Text style={styles.quickActionPrimaryText} numberOfLines={1}>
                  Nueva Planeación
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickActionCard, !wideContent && { width: quickActionCardWidth }]}
                activeOpacity={0.85}
                onPress={() => onSidebarPress("planeaciones")}
              >
                <MaterialIcons name="upload-file" size={22} color={COLORS.primaryMuted} />
                <Text style={styles.quickActionText} numberOfLines={1}>
                  Importar PDF
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickActionCard, !wideContent && { width: quickActionCardWidth }]}
                activeOpacity={0.85}
              >
                <MaterialIcons name="psychology" size={22} color={COLORS.primaryMuted} />
                <Text style={styles.quickActionText} numberOfLines={1}>
                  Asistente IA
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickActionCard, !wideContent && { width: quickActionCardWidth }]}
                activeOpacity={0.85}
              >
                <MaterialIcons name="share" size={22} color={COLORS.primaryMuted} />
                <Text style={styles.quickActionText} numberOfLines={1}>
                  Compartir Recurso
                </Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={[styles.lowerSection, wideContent && styles.lowerSectionWide]}>
              <View style={[styles.continueColumn, wideContent && styles.continueColumnWide]}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={[styles.sectionTitle, isNarrowMobile && styles.sectionTitleCompact]}>
                    Continuar trabajando
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => onSidebarPress("planeaciones")}
                  >
                    <Text style={styles.sectionLink}>Ver todo</Text>
                  </TouchableOpacity>
                </View>

                {continueCards.map((item) => (
                  <TouchableOpacity key={item.id} style={styles.continueCard} activeOpacity={0.9}>
                    <View style={styles.continueIcon}>
                      <MaterialIcons name="functions" size={22} color={COLORS.primaryMuted} />
                    </View>
                    <View style={styles.continueBody}>
                      <View style={styles.continueMetaRow}>
                        <Text style={styles.subjectBadge}>{item.tag}</Text>
                        <Text style={styles.updatedText}>{item.updated}</Text>
                      </View>
                      <Text style={styles.continueTitle}>{item.title}</Text>
                      <View style={styles.progressRow}>
                        <View style={styles.progressTrack}>
                          <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
                        </View>
                        <Text style={styles.progressText}>{item.progress}%</Text>
                      </View>
                    </View>
                    <MaterialIcons name="chevron-right" size={20} color="#7D8BA3" />
                  </TouchableOpacity>
                ))}
              </View>

              <View style={[styles.timelineColumn, wideContent && styles.timelineColumnWide]}>
                <Text style={[styles.sectionTitle, isNarrowMobile && styles.sectionTitleCompact]}>
                  Actividad reciente
                </Text>
                <View style={[styles.timelineCard, !wideContent && styles.timelineCardMobile]}>
                  <ScrollView
                    style={styles.timelineListScroll}
                    contentContainerStyle={styles.timelineListContent}
                    nestedScrollEnabled
                    showsVerticalScrollIndicator={!wideContent}
                  >
                    {timeline.map((entry, index) => (
                      <View key={entry.id} style={styles.timelineItem}>
                        <View style={styles.timelineTrackWrap}>
                          <View style={styles.timelineDot} />
                          {index < timeline.length - 1 && <View style={styles.timelineLine} />}
                        </View>
                        <View style={styles.timelineTextWrap}>
                          <Text style={styles.timelineTitle}>{entry.title}</Text>
                          <Text style={styles.timelineDetail}>{entry.detail}</Text>
                          <Text style={styles.timelineTime}>{entry.time}</Text>
                        </View>
                      </View>
                    ))}
                  </ScrollView>

                  <TouchableOpacity style={styles.historyButton} activeOpacity={0.85}>
                    <Text style={styles.historyButtonText}>Ver historial completo</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Animated.ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  rootLayout: {
    flex: 1,
    flexDirection: "row",
  },
  sidebar: {
    width: 170,
    backgroundColor: COLORS.surface,
    borderRightWidth: 1,
    borderRightColor: "#E4EAF2",
    paddingHorizontal: 12,
    paddingVertical: 16,
    justifyContent: "space-between",
  },
  logo: {
    fontSize: 27,
    fontWeight: "900",
    color: COLORS.primaryMuted,
    letterSpacing: -0.4,
  },
  logoSub: {
    marginTop: -4,
    fontSize: 10,
    color: "#9AA9BF",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sidebarMenu: {
    marginTop: 18,
    gap: 4,
  },
  sidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  sidebarItemActive: {
    backgroundColor: "#ECF4FF",
  },
  sidebarText: {
    fontSize: 14,
    color: "#6E7C95",
    fontWeight: "600",
  },
  sidebarTextActive: {
    color: COLORS.primaryMuted,
  },
  sidebarCta: {
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 10,
    paddingVertical: 12,
    backgroundColor: COLORS.primaryMuted,
    boxShadow: "0px 10px 18px rgba(30, 100, 204, 0.3)",
  },
  sidebarCtaText: {
    color: COLORS.surface,
    fontSize: 13,
    fontWeight: "700",
  },
  mainArea: {
    flex: 1,
  },
  topBar: {
    minHeight: 76,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: "#E4EAF2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  floatingActionsWrap: {
    position: "absolute",
    top: 10,
    right: 14,
    zIndex: 20,
  },
  mobileGreetingOverlay: {
    position: "absolute",
    top: 54,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  topBarCompact: {
    alignItems: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  searchBar: {
    flex: 1,
    maxWidth: 460,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.surfaceTertiary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#27364D",
    paddingVertical: 0,
  },
  mobileHeaderCopy: {
    flex: 1,
    minWidth: 0,
  },
  mobileGreetingPill: {
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: "#E3EAF3",
    minHeight: 96,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
    boxShadow: "0px 12px 24px rgba(18, 45, 85, 0.11)",
  },
  mobileHello: {
    fontSize: 33,
    fontWeight: "800",
    color: COLORS.text,
    lineHeight: 37,
    letterSpacing: -0.5,
  },
  mobileHelloCompact: {
    fontSize: 30,
    lineHeight: 34,
  },
  mobileSummary: {
    marginTop: 5,
    fontSize: 17,
    color: "#667085",
  },
  mobileSummaryCompact: {
    fontSize: 15,
  },
  topActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  topActionsCompact: {
    gap: 6,
  },
  iconAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  iconActionCompact: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  profileBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: 4,
    backgroundColor: "#F4F7FC",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 4,
    paddingHorizontal: 6,
    maxWidth: 150,
  },
  profileBlockCompact: {
    marginLeft: 0,
    paddingHorizontal: 2,
    borderRadius: 16,
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  profileText: {
    fontSize: 12,
    color: COLORS.textDark,
    fontWeight: "600",
  },
  avatarCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollBody: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 28,
    gap: 18,
  },
  scrollBodyMobile: {
    paddingTop: 170,
  },
  metricsGrid: {
    flexDirection: "column",
    gap: 12,
  },
  metricsGridWide: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  metricCard: {
    width: "100%",
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: "#E6ECF4",
    padding: 14,
    gap: 8,
  },
  metricCardWide: {
    width: "24%",
    minWidth: 180,
  },
  metricHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metricIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  metricBadge: {
    borderRadius: 12,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  metricBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  metricTitle: {
    textTransform: "uppercase",
    fontSize: 11,
    color: COLORS.textTertiary,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 39,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: -0.6,
  },
  sectionLabel: {
    fontSize: 17,
    color: "#5E6C81",
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  quickActionsRow: {
    gap: 10,
    paddingRight: 0,
  },
  quickActionsRowWide: {
    flexDirection: "row",
  },
  quickActionCard: {
    minWidth: 154,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DEE8F5",
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 14,
  },
  quickActionPrimary: {
    backgroundColor: COLORS.primaryMuted,
    borderColor: COLORS.primaryMuted,
    boxShadow: "0px 8px 16px rgba(30, 100, 204, 0.3)",
  },
  quickActionPrimaryText: {
    color: COLORS.surface,
    fontSize: 15,
    fontWeight: "700",
  },
  quickActionText: {
    color: "#1E2F4D",
    fontSize: 14,
    fontWeight: "700",
  },
  lowerSection: {
    gap: 16,
  },
  lowerSectionWide: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  continueColumn: {
    flex: 1,
    gap: 12,
  },
  continueColumnWide: {
    minWidth: 380,
  },
  timelineColumn: {
    width: "100%",
    gap: 12,
  },
  timelineColumnWide: {
    width: "36%",
    minWidth: 340,
    maxWidth: 460,
    flexShrink: 0,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 25,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: -0.4,
  },
  sectionTitleCompact: {
    fontSize: 17,
  },
  sectionLink: {
    color: COLORS.primaryMuted,
    fontSize: 15,
    fontWeight: "700",
  },
  continueCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E4EBF4",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  continueIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#F0F5FD",
    alignItems: "center",
    justifyContent: "center",
  },
  continueBody: {
    flex: 1,
    gap: 7,
  },
  continueMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  subjectBadge: {
    fontSize: 10,
    fontWeight: "700",
    color: "#3D82D8",
    backgroundColor: COLORS.border,
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  updatedText: {
    fontSize: 11,
    color: "#8392A7",
  },
  continueTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E2F4D",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    backgroundColor: COLORS.progressTrack,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: COLORS.primaryMuted,
  },
  progressText: {
    fontSize: 11,
    color: "#6D7B8F",
    fontWeight: "700",
    minWidth: 30,
  },
  timelineCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E4EBF4",
    padding: 14,
    gap: 10,
    overflow: "hidden",
  },
  timelineCardMobile: {
    minHeight: 300,
  },
  timelineListScroll: {
    flexGrow: 0,
    maxHeight: 220,
  },
  timelineListContent: {
    paddingBottom: 4,
  },
  timelineItem: {
    flexDirection: "row",
    gap: 10,
  },
  timelineTrackWrap: {
    width: 18,
    alignItems: "center",
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primaryMuted,
    marginTop: 5,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.borderLight,
    marginTop: 4,
  },
  timelineTextWrap: {
    flex: 1,
    paddingBottom: 12,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },
  timelineDetail: {
    fontSize: 12,
    color: "#6E7C95",
  },
  timelineTime: {
    marginTop: 2,
    fontSize: 12,
    color: "#2C74D7",
    fontWeight: "600",
  },
  historyButton: {
    marginTop: 2,
    borderRadius: 8,
    backgroundColor: "#EFF4FB",
    paddingVertical: 10,
    alignItems: "center",
  },
  historyButtonText: {
    fontSize: 13,
    color: "#3275D9",
    fontWeight: "700",
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(19, 30, 49, 0.42)",
    justifyContent: "flex-end",
  },
  menuContainer: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  menuTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 14,
  },
  menuOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
  },
  menuText: {
    fontSize: 15,
    color: "#354662",
    fontWeight: "600",
  },
  menuTextDanger: {
    color: COLORS.error,
  },
  closeMenuButton: {
    marginTop: 8,
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: COLORS.surfaceTertiary,
    paddingVertical: 10,
  },
  closeMenuText: {
    fontSize: 14,
    color: "#5C6A80",
    fontWeight: "700",
  },
});

export default HomeScreen;
