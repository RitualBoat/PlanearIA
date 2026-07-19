import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { useAppTheme } from "../../themes/useAppTheme";
import { radii, scaleType, spacing, typography } from "../../themes/tokens";
import type { ThemedStylesInput } from "../../themes/types";
import { useSyncStatus } from "../../context/SyncContext";
import { frasePendientes } from "../../hooks/syncPresentation";
import { TONOS_SYNC } from "./tonos";

export interface PendingBadgeProps {
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Conteo de operaciones en cola.
 *
 * Cuenta, no juzga: usa el tono informativo y nunca el de error. Trabajo pendiente de subir
 * no es un fallo, es una cola que se vacia sola en cuanto hay servidor.
 *
 * El conteo viene de `SyncContext` y es veraz para toda la app: `getTotalPendingCount`
 * recorre las entidades de `SYNC_ENTITIES` mas planeaciones.
 */
const PendingBadge: React.FC<PendingBadgeProps> = ({ style, testID }) => {
  const { pendingCount } = useSyncStatus();
  const { colors, isDark, scaled, highContrast } = useAppTheme();

  const styles = useMemo(
    () => getStyles({ colors, isDark, scaled, highContrast }),
    [colors, isDark, scaled, highContrast]
  );

  // Sin cola no hay nada que comunicar: un badge en cero seria ruido permanente.
  if (pendingCount <= 0) return null;

  const paleta = TONOS_SYNC.info;

  return (
    <View
      style={[styles.badge, { backgroundColor: colors[paleta.fondo] }, style]}
      // Ver SyncStatusChip: accessibilityRole="text" pierde el aria-label en web. Sin rol,
      // el lector anunciaria solo la cifra ("5") y no que son cambios por sincronizar.
      accessibilityRole="image"
      accessibilityLabel={frasePendientes(pendingCount)}
      testID={testID}
    >
      <Text style={[styles.texto, { color: colors[paleta.acento] }]}>
        {pendingCount > 99 ? "99+" : pendingCount}
      </Text>
    </View>
  );
};

const getStyles = ({ scaled }: ThemedStylesInput) =>
  StyleSheet.create({
    badge: {
      minWidth: 20,
      height: 20,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.xs,
      borderRadius: radii.pill,
    },
    texto: {
      ...scaleType(typography.caption, scaled),
      fontWeight: "700",
    },
  });

export default PendingBadge;
