import React, { useMemo } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useAppTheme } from "../../themes/useAppTheme";
import { radii, scaleType, spacing, spring, typography, useReducedMotionPreference } from "../../themes/tokens";
import type { ThemedStylesInput } from "../../themes/types";
import { MIN_TOUCH_TARGET, useFocusRing } from "./primitives";
import type { ActionVariant } from "./primitives";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PRESSED_SCALE = 0.97;

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ActionVariant;
  icon?: keyof typeof MaterialIcons.glyphMap;
  disabled?: boolean;
  loading?: boolean;
  /** Ocupa todo el ancho disponible. Util en formularios y hojas. */
  fullWidth?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Accion primaria de la biblioteca.
 *
 * Cubre los cuatro estados en un solo control: normal, pressed (`scale 0.97`), disabled y
 * loading. `loading` bloquea la accion ademas de mostrarla, porque un boton que sigue
 * disparando durante una operacion en curso es la via directa a peticiones duplicadas.
 * Ambos estados viajan a `accessibilityState` para que el bloqueo tambien se anuncie.
 */
const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = "primary",
  icon,
  disabled = false,
  loading = false,
  fullWidth = false,
  accessibilityHint,
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

  // Un boton cargando no vuelve a disparar: el bloqueo es de comportamiento, no solo visual.
  const bloqueado = disabled || loading;

  const escala = useSharedValue(1);
  const estiloAnimado = useAnimatedStyle(() => ({ transform: [{ scale: escala.value }] }));

  const aplicarEscala = (valor: number) => {
    escala.value = reduceMotion ? valor : withSpring(valor, spring.snappy);
  };

  const colorContenido = bloqueado
    ? colors.textMuted
    : variant === "primary" || variant === "destructive"
      ? colors.textOnPrimary
      : colors.primary;

  return (
    <AnimatedPressable
      style={[
        styles.boton,
        styles[variant],
        fullWidth && styles.fullWidth,
        focused && styles.focusRing,
        bloqueado && styles.bloqueado,
        estiloAnimado,
        style,
      ]}
      onPress={onPress}
      onPressIn={() => aplicarEscala(PRESSED_SCALE)}
      onPressOut={() => aplicarEscala(1)}
      onFocus={onFocus}
      onBlur={onBlur}
      disabled={bloqueado}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: bloqueado, busy: loading }}
      testID={testID}
    >
      <View style={styles.contenido}>
        {loading ? (
          <ActivityIndicator size="small" color={colorContenido} testID="button-loading" />
        ) : icon ? (
          <MaterialIcons name={icon} size={18} color={colorContenido} />
        ) : null}
        <Text style={[styles.label, { color: colorContenido }]} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </AnimatedPressable>
  );
};

const getStyles = ({ colors, scaled, highContrast }: ThemedStylesInput) =>
  StyleSheet.create({
    boton: {
      minHeight: MIN_TOUCH_TARGET,
      justifyContent: "center",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: radii.md,
      borderWidth: 1,
      alignSelf: "flex-start",
    },
    fullWidth: {
      alignSelf: "stretch",
    },
    contenido: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
    },
    label: {
      ...scaleType(typography.bodyStrong, scaled),
      textAlign: "center",
    },
    primary: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    secondary: {
      backgroundColor: colors.surface,
      borderColor: highContrast ? colors.borderStrong : colors.border,
    },
    ghost: {
      backgroundColor: "transparent",
      borderColor: "transparent",
    },
    destructive: {
      backgroundColor: colors.error,
      borderColor: colors.error,
    },
    bloqueado: {
      backgroundColor: colors.surfaceTertiary,
      borderColor: highContrast ? colors.borderStrong : colors.borderLight,
    },
    focusRing: {
      boxShadow: `0px 0px 0px 3px ${colors.primaryTint}`,
    },
  });

export default Button;
