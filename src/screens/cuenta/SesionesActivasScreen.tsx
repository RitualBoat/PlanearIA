import React, { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { FONT_SIZES } from "../../../types";
import { useSesionesViewModel } from "../../hooks/useSesionesViewModel";
import type { SesionActiva } from "../../services/auth/authService";
import { useAppTheme } from "../../themes/useAppTheme";
import { ThemedStylesInput } from "../../themes/types";

function formatFecha(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}

const SesionesActivasScreen: React.FC = () => {
  const { sesiones, isLoading, revokingId, error, refetch, revocar, cerrarOtras, goBack } =
    useSesionesViewModel();

  const { colors, isDark, scaled, highContrast } = useAppTheme();
  const styles = useMemo(
    () => getStyles({ colors, isDark, scaled, highContrast }),
    [colors, isDark, scaled, highContrast]
  );

  const otras = sesiones.filter((s) => !s.current).length;

  const renderItem = ({ item }: { item: SesionActiva }) => {
    const isRevoking = revokingId === item.id;
    return (
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <View style={styles.iconWrap}>
            <MaterialIcons name="devices" size={22} color={colors.primary} />
          </View>
          <View style={styles.info}>
            <Text style={styles.deviceText} numberOfLines={1}>
              {item.userAgent || "Dispositivo desconocido"}
            </Text>
            <Text style={styles.metaText}>
              Activa desde {formatFecha(item.lastUsedAt || item.createdAt)}
            </Text>
            {item.current ? <Text style={styles.currentBadge}>Sesión actual</Text> : null}
          </View>
          {item.current ? null : (
            <Pressable
              style={({ pressed }) => [styles.revokeBtn, pressed && { opacity: 0.6 }]}
              onPress={() => revocar(item.id)}
              disabled={isRevoking}
            >
              {isRevoking ? (
                <ActivityIndicator size="small" color={colors.danger} />
              ) : (
                <Text style={styles.revokeText}>Cerrar</Text>
              )}
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <View style={styles.header}>
        <Pressable
          onPress={goBack}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Sesiones iniciadas</Text>
        <Pressable
          onPress={refetch}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
        >
          <MaterialIcons name="refresh" size={24} color={colors.primary} />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando sesiones...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <MaterialIcons name="error-outline" size={44} color={colors.textTertiary} />
          <Text style={styles.emptyText}>{error}</Text>
          <Pressable
            style={({ pressed }) => [styles.retryBtn, pressed && { opacity: 0.6 }]}
            onPress={refetch}
          >
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : sesiones.length === 0 ? (
        <View style={styles.center}>
          <MaterialIcons name="devices" size={44} color={colors.textTertiary} />
          <Text style={styles.emptyText}>No hay sesiones activas.</Text>
        </View>
      ) : (
        <FlatList
          data={sesiones}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListFooterComponent={
            otras > 0 ? (
              <Pressable
                style={({ pressed }) => [styles.closeAllBtn, pressed && { opacity: 0.6 }]}
                onPress={cerrarOtras}
                disabled={revokingId === "__all__"}
              >
                {revokingId === "__all__" ? (
                  <ActivityIndicator size="small" color={colors.textOnPrimary} />
                ) : (
                  <Text style={styles.closeAllText}>Cerrar las demás sesiones</Text>
                )}
              </Pressable>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

const getStyles = ({ colors, scaled, highContrast }: ThemedStylesInput) => {
  // "Contraste alto": refuerza bordes y texto secundario usando solo tokens del tema.
  const cardBorder = highContrast ? colors.borderStrong : colors.borderLight;
  const subtleText = highContrast ? colors.text : colors.textSecondary;

  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: cardBorder,
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: scaled(FONT_SIZES.large), fontWeight: "700", color: colors.text },
    center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12, padding: 24 },
    loadingText: { fontSize: scaled(FONT_SIZES.medium), color: subtleText },
    emptyText: {
      fontSize: scaled(FONT_SIZES.medium),
      color: highContrast ? colors.text : colors.textTertiary,
      textAlign: "center",
    },
    retryBtn: {
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: colors.primary,
    },
    retryText: { color: colors.textOnPrimary, fontWeight: "600" },
    list: { padding: 16, gap: 10 },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 14,
      borderWidth: 1,
      borderColor: cardBorder,
    },
    cardRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    iconWrap: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.backgroundSoft,
      alignItems: "center",
      justifyContent: "center",
    },
    info: { flex: 1, gap: 2 },
    deviceText: { fontSize: scaled(FONT_SIZES.medium), fontWeight: "600", color: colors.text },
    metaText: { fontSize: scaled(FONT_SIZES.small), color: subtleText },
    currentBadge: { marginTop: 2, fontSize: scaled(12), fontWeight: "700", color: colors.primary },
    revokeBtn: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      // Antes era el literal #FFEBEE, que no reaccionaba al tema ni al daltonismo.
      backgroundColor: colors.errorTint,
    },
    revokeText: { color: colors.danger, fontWeight: "600", fontSize: scaled(13) },
    closeAllBtn: {
      marginTop: 8,
      borderRadius: 12,
      backgroundColor: colors.danger,
      paddingVertical: 14,
      alignItems: "center",
    },
    closeAllText: {
      color: colors.textOnPrimary,
      fontWeight: "700",
      fontSize: scaled(FONT_SIZES.medium),
    },
  });
};

export default SesionesActivasScreen;
