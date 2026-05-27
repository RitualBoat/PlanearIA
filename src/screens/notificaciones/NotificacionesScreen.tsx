import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
  StatusBar,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import AnimatedTopPill from "../../components/AnimatedTopPill";
import { useNotificaciones } from "../../context/NotificacionesContext";
import { useTheme } from "../../context/ThemeContext";
import { Notificacion, TipoNotificacion } from "../../../types";

type FilterType = "todas" | "no_leidas";

export const NotificacionesScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  
  const {
    notificaciones,
    marcarComoLeida,
    marcarTodasComoLeidas,
    eliminarNotificacion,
  } = useNotificaciones();

  const [activeFilter, setActiveFilter] = useState<FilterType>("todas");

  const filteredNotificaciones = notificaciones.filter((n) => {
    if (activeFilter === "no_leidas") return !n.leida;
    return true;
  });

  const getNotificationIconInfo = (tipo: TipoNotificacion) => {
    switch (tipo) {
      case "solicitud":
        return { name: "person-add" as const, color: colors.primaryContainer, bg: colors.primaryTint };
      case "mensaje":
        return { name: "chat" as const, color: colors.success, bg: colors.successTint };
      case "tarea":
        return { name: "assignment" as const, color: colors.warning, bg: colors.warningTint };
      case "sistema":
      default:
        return { name: "notifications" as const, color: colors.purple, bg: colors.purpleTint };
    }
  };

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Hace un momento";
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    return `Hace ${diffDays} d`;
  };

  const handleNotificationPress = async (n: Notificacion) => {
    if (!n.leida) {
      await marcarComoLeida(n.id);
    }
    
    // Redirigir según el tipo de notificación
    if (n.tipo === "solicitud") {
      navigation.navigate("MainTabs", { screen: "SocialTab" });
    } else if (n.tipo === "mensaje") {
      navigation.navigate("MainTabs", { screen: "SocialTab" });
    } else if (n.tipo === "tarea") {
      navigation.navigate("Grupos");
    }
  };

  const renderItem = ({ item }: { item: Notificacion }) => {
    const iconInfo = getNotificationIconInfo(item.tipo);
    return (
      <View
        style={[
          styles.notificationCard,
          !item.leida && styles.unreadCard,
        ]}
      >
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => handleNotificationPress(item)}
          activeOpacity={0.8}
        >
          <View style={[styles.iconContainer, { backgroundColor: iconInfo.bg }]}>
            <MaterialIcons name={iconInfo.name} size={22} color={iconInfo.color} />
          </View>
          <View style={styles.textContainer}>
            <View style={styles.cardHeader}>
              <Text style={[styles.titleText, !item.leida && styles.unreadTitle]}>
                {item.titulo}
              </Text>
              <Text style={styles.timeText}>{timeAgo(item.fechaCreacion)}</Text>
            </View>
            <Text style={styles.descText} numberOfLines={2}>
              {item.mensaje}
            </Text>
          </View>
        </TouchableOpacity>
        <View style={styles.actionsContainer}>
          {!item.leida && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => marcarComoLeida(item.id)}
            >
              <MaterialIcons name="done" size={18} color={colors.success} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => eliminarNotificacion(item.id)}
          >
            <MaterialIcons name="delete-outline" size={18} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar backgroundColor={colors.surfaceContainerLowest} barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header Fijo con Botón de Regresar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificaciones</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={[styles.container, isDesktop && styles.desktopContainer]}>
        <AnimatedTopPill
          icon="notifications-active"
          title="Centro de Notificaciones"
          subtitle="Entérate al instante de solicitudes, mensajes y tareas"
        />

        {/* Barra de Filtros y Acción de Limpiar */}
        <View style={styles.filterRow}>
          <View style={styles.pillsContainer}>
            <TouchableOpacity
              style={[styles.pill, activeFilter === "todas" && styles.pillActive]}
              onPress={() => setActiveFilter("todas")}
              activeOpacity={0.7}
            >
              <Text style={[styles.pillText, activeFilter === "todas" && styles.pillTextActive]}>
                Todas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.pill, activeFilter === "no_leidas" && styles.pillActive]}
              onPress={() => setActiveFilter("no_leidas")}
              activeOpacity={0.7}
            >
              <Text style={[styles.pillText, activeFilter === "no_leidas" && styles.pillTextActive]}>
                Sin leer
              </Text>
              {notificaciones.filter((n) => !n.leida).length > 0 && (
                <View style={styles.badgeCount}>
                  <Text style={styles.badgeText}>
                    {notificaciones.filter((n) => !n.leida).length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {notificaciones.some((n) => !n.leida) && (
            <TouchableOpacity
              style={styles.markAllBtn}
              onPress={marcarTodasComoLeidas}
              activeOpacity={0.7}
            >
              <MaterialIcons name="done-all" size={16} color={colors.primaryContainer} />
              <Text style={styles.markAllText}>Leídas</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Lista de Notificaciones */}
        {filteredNotificaciones.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <MaterialIcons name="notifications-none" size={64} color={colors.border} />
            </View>
            <Text style={styles.emptyTitle}>Sin notificaciones</Text>
            <Text style={styles.emptySubtitle}>
              {activeFilter === "no_leidas"
                ? "No tienes notificaciones pendientes por leer."
                : "Aún no has recibido ninguna notificación."}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredNotificaciones}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const getStyles = (colors: any, isDark: boolean) => {
  const cardShadow = Platform.select({
    web: { boxShadow: `0px 2px 8px ${colors.shadowBlue}` } as any,
    default: {
      shadowColor: colors.primaryDark,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
  });

  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1, padding: 16, paddingTop: 10, paddingBottom: 30 },
    desktopContainer: { maxWidth: 720, alignSelf: "center", width: "100%" },

    // Header Bar
    headerBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.surfaceContainerLowest,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surfaceContainerLow,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.primary,
    },

    // Filtros
    filterRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginVertical: 14,
    },
    pillsContainer: {
      flexDirection: "row",
      backgroundColor: colors.surfaceContainerLow,
      padding: 3,
      borderRadius: 12,
      gap: 4,
    },
    pill: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 6,
      paddingHorizontal: 14,
      borderRadius: 10,
      gap: 6,
    },
    pillActive: {
      backgroundColor: colors.surfaceContainerLowest,
      ...cardShadow,
    },
    pillText: {
      fontSize: 13,
      fontWeight: "500",
      color: colors.textMuted,
    },
    pillTextActive: {
      color: colors.text,
      fontWeight: "700",
    },
    badgeCount: {
      backgroundColor: colors.error,
      borderRadius: 8,
      paddingHorizontal: 6,
      paddingVertical: 1,
      minWidth: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    badgeText: {
      color: "#FFF",
      fontSize: 10,
      fontWeight: "700",
    },
    markAllBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 10,
      backgroundColor: colors.primaryTint,
    },
    markAllText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.primaryContainer,
    },

    // FlatList
    listContent: { gap: 12, paddingBottom: 40 },
    notificationCard: {
      flexDirection: "row",
      backgroundColor: colors.surfaceContainerLowest,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      ...cardShadow,
    },
    unreadCard: {
      backgroundColor: isDark ? "#162235" : "#F0F4FF",
      borderColor: colors.primaryContainer,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    cardContent: {
      flex: 1,
      flexDirection: "row",
      gap: 12,
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
    },
    textContainer: {
      flex: 1,
      gap: 4,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    titleText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      flex: 1,
      marginRight: 6,
    },
    unreadTitle: {
      fontWeight: "800",
      color: colors.primary,
    },
    timeText: {
      fontSize: 11,
      color: colors.textMuted,
    },
    descText: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    actionsContainer: {
      justifyContent: "center",
      alignItems: "center",
      paddingLeft: 8,
      borderLeftWidth: 1,
      borderLeftColor: colors.border,
      marginLeft: 8,
      gap: 10,
    },
    actionBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surfaceContainerLow,
    },

    // Empty State
    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 80,
      gap: 16,
    },
    emptyIconWrap: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: colors.surfaceContainerLow,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      maxWidth: 260,
      lineHeight: 20,
    },
  });
};
