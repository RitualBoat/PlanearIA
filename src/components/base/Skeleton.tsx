import React, { useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import type { DimensionValue, StyleProp, ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useAppTheme } from "../../themes/useAppTheme";
import { radii, spacing, useReducedMotionPreference } from "../../themes/tokens";
import type { ThemedStylesInput } from "../../themes/types";

export interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  /** `pill` para avatares y chips; `card` para bloques de contenido. */
  shape?: "line" | "pill" | "card";
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Duracion del ciclo de shimmer. Larga a proposito: un pulso rapido distrae mas que informa. */
const CICLO_MS = 1200;
const OPACIDAD_MINIMA = 0.4;

/**
 * Marcador de carga con la forma aproximada del contenido que llegara.
 *
 * Sustituye al spinner suelto: comunica la estructura que esta por aparecer, no solo que
 * algo ocurre. Bajo reduce-motion se presenta como bloque solido sin pulso, que es la
 * variante estatica equivalente: sigue ocupando el lugar y sigue comunicando carga.
 */
const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 16,
  shape = "line",
  style,
  testID,
}) => {
  const { colors, isDark, scaled, highContrast } = useAppTheme();
  const reduceMotion = useReducedMotionPreference();
  const styles = useMemo(
    () => getStyles({ colors, isDark, scaled, highContrast }),
    [colors, isDark, scaled, highContrast]
  );

  const opacidad = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) {
      opacidad.value = 1;
      return;
    }
    opacidad.value = withRepeat(
      withTiming(OPACIDAD_MINIMA, { duration: CICLO_MS, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [reduceMotion, opacidad]);

  const estiloAnimado = useAnimatedStyle(() => ({ opacity: opacidad.value }));

  const forma = [styles.base, styles[shape], { width, height }, style];

  if (reduceMotion) {
    return <View style={forma} accessibilityRole="progressbar" accessibilityLabel="Cargando" testID={testID} />;
  }

  return (
    <Animated.View
      style={[forma, estiloAnimado]}
      accessibilityRole="progressbar"
      accessibilityLabel="Cargando"
      testID={testID}
    />
  );
};

const getStyles = ({ colors }: ThemedStylesInput) =>
  StyleSheet.create({
    base: {
      backgroundColor: colors.skeleton,
    },
    line: {
      borderRadius: radii.sm,
    },
    pill: {
      borderRadius: radii.pill,
    },
    card: {
      borderRadius: radii.lg,
      marginBottom: spacing.md,
    },
  });

export default Skeleton;
