/**
 * Global sync/offline UX.
 *
 * SyncOfflineBar: persistent top bar shown while the device is offline or
 * the backend is unreachable. The app stays fully usable; the bar only
 * informs that changes are being saved locally.
 *
 * SyncNoticeToast: transient bottom toast for sync results ("Sincronización
 * exitosa", "Conexión restablecida", warnings). Auto-dismissed by the
 * SyncProvider, tap to dismiss early.
 *
 * Desde sync-status-ui (#83) la barra toma su texto, icono y tono de
 * `useSyncPresentation()`, la misma fuente que alimenta al chip del chrome: por eso las
 * dos superficies no pueden contradecirse. La division de trabajo es de rol, no de
 * contenido: el chip es ambiente y siempre visible; la barra es interrupcion y aparece
 * solo cuando hay algo que el docente podria querer resolver.
 */

import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../themes/useAppTheme";
import { radii, scaleType, spacing, typography, zIndex } from "../themes/tokens";
import type { ThemedStylesInput } from "../themes/types";
import { useSyncStatus, type SyncNotice } from "../context/SyncContext";
import { useSyncPresentation } from "../hooks/useSyncPresentation";
import { frasePendientes } from "../hooks/syncPresentation";
import { TONOS_SYNC } from "./sync/tonos";

export const SyncOfflineBar: React.FC = () => {
  const { pendingCount, syncNow } = useSyncStatus();
  const presentacion = useSyncPresentation();
  const insets = useSafeAreaInsets();
  const { colors, isDark, scaled, highContrast } = useAppTheme();

  const styles = useMemo(
    () => getStyles({ colors, isDark, scaled, highContrast }),
    [colors, isDark, scaled, highContrast]
  );

  // La barra interrumpe solo ante lo que el docente podria querer resolver. Los estados
  // tranquilos (todo al dia, cola vaciandose, guardado local sin sesion) los cubre el chip
  // del chrome sin ocupar ancho completo.
  const interrumpe =
    presentacion.estado === "sin-conexion" ||
    presentacion.estado === "sin-servidor" ||
    presentacion.estado === "sesion-expirada";

  if (!interrumpe) return null;

  const paleta = TONOS_SYNC[presentacion.tono];
  const pendingSuffix = pendingCount > 0 ? ` ${frasePendientes(pendingCount)}.` : "";
  const mensaje = `${presentacion.detalle ?? presentacion.titulo}${pendingSuffix}`;

  return (
    <View
      style={[
        styles.bar,
        { backgroundColor: colors[paleta.fondo], paddingTop: insets.top + spacing.sm },
      ]}
      accessibilityRole="alert"
      accessibilityLabel={mensaje}
    >
      <MaterialIcons name={presentacion.icono} size={16} color={colors[paleta.acento]} />
      <Text style={[styles.barText, { color: colors[paleta.acento] }]} numberOfLines={2}>
        {mensaje}
      </Text>
      {presentacion.accion === "reintentar" && (
        <Pressable
          style={({ pressed }) => pressed && styles.pressed}
          onPress={() => void syncNow("manual")}
          accessibilityRole="button"
          accessibilityLabel="Reintentar sincronización"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialIcons name="refresh" size={18} color={colors[paleta.acento]} />
        </Pressable>
      )}
    </View>
  );
};

const toastIcon = (kind: SyncNotice["kind"]): keyof typeof MaterialIcons.glyphMap => {
  if (kind === "success") return "cloud-done";
  if (kind === "warning") return "error-outline";
  return "sync";
};

export const SyncNoticeToast: React.FC = () => {
  const { notice, dismissNotice } = useSyncStatus();
  const insets = useSafeAreaInsets();
  const { colors, isDark, scaled, highContrast } = useAppTheme();

  const styles = useMemo(
    () => getStyles({ colors, isDark, scaled, highContrast }),
    [colors, isDark, scaled, highContrast]
  );

  if (!notice) return null;

  // El toast informa un resultado puntual, no un estado sostenido: mantiene su propia
  // escala de tonos porque "sincronizacion exitosa" no es ninguno de los siete estados.
  const acento =
    notice.kind === "success"
      ? colors.success
      : notice.kind === "warning"
        ? colors.warning
        : colors.primary;

  return (
    <View pointerEvents="box-none" style={[styles.toastWrapper, { bottom: insets.bottom + 28 }]}>
      <Pressable
        onPress={dismissNotice}
        style={({ pressed }) => [
          styles.toast,
          { backgroundColor: acento },
          pressed && styles.pressedToast,
        ]}
        accessibilityRole="alert"
        accessibilityLabel={notice.message}
      >
        <MaterialIcons name={toastIcon(notice.kind)} size={18} color={colors.textOnPrimary} />
        <Text style={styles.toastText} numberOfLines={2}>
          {notice.message}
        </Text>
      </Pressable>
    </View>
  );
};

const getStyles = ({ colors, scaled }: ThemedStylesInput) =>
  StyleSheet.create({
    bar: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.sm,
      zIndex: zIndex.sticky,
    },
    barText: {
      ...scaleType(typography.caption, scaled),
      flex: 1,
      fontWeight: "600",
    },
    pressed: {
      opacity: 0.6,
    },
    pressedToast: {
      opacity: 0.9,
    },
    toastWrapper: {
      position: "absolute",
      left: 0,
      right: 0,
      alignItems: "center",
      zIndex: zIndex.toast,
      elevation: 10,
    },
    toast: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      maxWidth: 480,
      marginHorizontal: spacing.lg,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radii.pill,
      shadowColor: colors.overlay,
      shadowOpacity: 0.2,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 6,
    },
    toastText: {
      ...scaleType(typography.caption, scaled),
      color: colors.textOnPrimary,
      fontWeight: "600",
      flexShrink: 1,
    },
  });
