import React, { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useAppTheme } from "../../themes/useAppTheme";
import {
  getElevation,
  radii,
  spacing,
  spring,
  useReducedMotionPreference,
} from "../../themes/tokens";
import type { ThemedStylesInput } from "../../themes/types";
import { useFocusRing } from "./primitives";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Escala del catalogo de micro-interacciones 1.9.2 para el feedback de presion. */
const PRESSED_SCALE = 0.97;

export interface CardProps {
  children: React.ReactNode;
  /** Nivel de elevacion. `flat` deja la tarjeta sin sombra, solo con borde. */
  elevation?: "flat" | "level1" | "level2" | "level3";
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Superficie contenedora con elevacion por token.
 *
 * Con `onPress` se vuelve un control: toma rol de boton, responde con `scale 0.97` y
 * muestra anillo de foco en web. Sin `onPress` es una superficie pasiva y no declara rol
 * interactivo, para no anunciar a un lector de pantalla un control que no existe.
 */
const Card: React.FC<CardProps> = ({
  children,
  elevation = "level1",
  onPress,
  accessibilityLabel,
  accessibilityHint,
  disabled = false,
  style,
  testID,
}) => {
  const { colors, isDark, scaled, highContrast } = useAppTheme();
  const reduceMotion = useReducedMotionPreference();
  const { focused, onFocus, onBlur } = useFocusRing();
  const styles = useMemo(
    () => getStyles({ colors, isDark, scaled, highContrast }),
    [colors, isDark, scaled, highContrast]
  );

  const escala = useSharedValue(1);
  const estiloAnimado = useAnimatedStyle(() => ({ transform: [{ scale: escala.value }] }));

  const aplicarEscala = (valor: number) => {
    // Bajo reduce-motion se asigna el valor final sin transicion: el estado se comunica
    // igual, pero sin movimiento.
    escala.value = reduceMotion ? valor : withSpring(valor, spring.snappy);
  };

  const nivel = elevation === "flat" ? undefined : styles[elevation];
  const base = [styles.card, nivel, focused && styles.focusRing, disabled && styles.disabled, style];

  if (!onPress) {
    return (
      <View style={base} testID={testID}>
        {children}
      </View>
    );
  }

  return (
    <AnimatedPressable
      style={[base, estiloAnimado]}
      onPress={onPress}
      onPressIn={() => aplicarEscala(PRESSED_SCALE)}
      onPressOut={() => aplicarEscala(1)}
      onFocus={onFocus}
      onBlur={onBlur}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      testID={testID}
    >
      {children}
    </AnimatedPressable>
  );
};

const getStyles = ({ colors, highContrast }: ThemedStylesInput) => {
  const elevation = getElevation(colors);
  return StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: radii.lg,
      borderWidth: 1,
      borderColor: highContrast ? colors.borderStrong : colors.borderLight,
      padding: spacing.lg,
    },
    level1: elevation.level1,
    level2: elevation.level2,
    level3: elevation.level3,
    focusRing: {
      borderColor: colors.primary,
      // Anillo propio en vez del outline del navegador: es theme-aware y verificable.
      boxShadow: `0px 0px 0px 3px ${colors.primary}`,
    },
    disabled: {
      opacity: 0.5,
    },
  });
};

export default Card;
