import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useAppTheme } from "../../themes/useAppTheme";
import {
  radii,
  scaleType,
  spacing,
  spring,
  timing,
  typography,
  useReducedMotionPreference,
} from "../../themes/tokens";
import type { ThemedStylesInput } from "../../themes/types";
import { MIN_TOUCH_TARGET, hitSlopToMinTarget, useFocusRing } from "./primitives";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PRESSED_SCALE = 0.97;

/**
 * Alto visual del chip. Deliberadamente menor a 44pt: en movil una fila de chips de 44pt
 * de alto rompe la densidad. El area tactil llega a 44 con hitSlop, sin inflar la forma.
 */
const ALTO_VISUAL = 32;

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /** Muestra el boton de descartar. El chip se desvanece antes de avisar al padre. */
  onDismiss?: () => void;
  icon?: keyof typeof MaterialIcons.glyphMap;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Etiqueta compacta, seleccionable o descartable.
 *
 * Cuando es seleccionable toma rol de checkbox y reporta `selected` y `checked`: para una
 * tecnologia de asistencia el estado de seleccion es la informacion util, no el color de
 * relleno con que se representa.
 */
const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  onDismiss,
  icon,
  disabled = false,
  style,
  testID,
}) => {
  const { colors, isDark, scaled, highContrast } = useAppTheme();
  const reduceMotion = useReducedMotionPreference();
  const { focused, onFocus, onBlur } = useFocusRing();
  const cerrarFoco = useFocusRing();
  const styles = useMemo(
    () => getStyles({ colors, isDark, scaled, highContrast }),
    [colors, isDark, scaled, highContrast]
  );

  const escala = useSharedValue(1);
  const opacidad = useSharedValue(1);
  const estiloAnimado = useAnimatedStyle(() => ({
    transform: [{ scale: escala.value }],
    opacity: opacidad.value,
  }));

  const aplicarEscala = (valor: number) => {
    escala.value = reduceMotion ? valor : withSpring(valor, spring.snappy);
  };

  const descartar = () => {
    if (!onDismiss) return;
    if (reduceMotion) {
      // Sin animacion de salida: el chip desaparece cuando el padre lo quita de la lista.
      onDismiss();
      return;
    }
    escala.value = withTiming(PRESSED_SCALE, timing.fast);
    opacidad.value = withTiming(0, timing.fast, (terminada) => {
      // El callback corre en el hilo de UI; volver a JS es obligatorio para avisar al
      // padre. El aviso espera al desvanecido para que la salida se vea completa.
      if (terminada) runOnJS(onDismiss)();
    });
  };

  const contenido = (
    <>
      {icon ? (
        <MaterialIcons
          name={icon}
          size={16}
          color={selected ? colors.textOnPrimary : colors.textSecondary}
        />
      ) : null}
      <Text style={[styles.label, selected && styles.labelSelected]} numberOfLines={1}>
        {label}
      </Text>
      {onDismiss ? (
        <Pressable
          onPress={descartar}
          onFocus={cerrarFoco.onFocus}
          onBlur={cerrarFoco.onBlur}
          hitSlop={hitSlopToMinTarget(ICONO_CERRAR, ICONO_CERRAR)}
          style={cerrarFoco.focused && styles.focusRing}
          accessibilityRole="button"
          accessibilityLabel={`Quitar ${label}`}
          testID={testID ? `${testID}-dismiss` : undefined}
        >
          <MaterialIcons
            name="close"
            size={16}
            color={selected ? colors.textOnPrimary : colors.textSecondary}
          />
        </Pressable>
      ) : null}
    </>
  );

  const estiloBase = [
    styles.chip,
    selected && styles.chipSelected,
    focused && styles.focusRing,
    disabled && styles.disabled,
    style,
  ];

  if (!onPress) {
    return (
      <Animated.View style={[estiloBase, estiloAnimado]} testID={testID}>
        <View style={styles.contenido}>{contenido}</View>
      </Animated.View>
    );
  }

  return (
    <AnimatedPressable
      style={[estiloBase, estiloAnimado]}
      onPress={onPress}
      onPressIn={() => aplicarEscala(PRESSED_SCALE)}
      onPressOut={() => aplicarEscala(1)}
      onFocus={onFocus}
      onBlur={onBlur}
      disabled={disabled}
      hitSlop={hitSlopToMinTarget(MIN_TOUCH_TARGET, ALTO_VISUAL)}
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ disabled, selected, checked: selected }}
      testID={testID}
    >
      <View style={styles.contenido}>{contenido}</View>
    </AnimatedPressable>
  );
};

/** Lado visual del boton de cerrar; el area efectiva la completa hitSlop. */
const ICONO_CERRAR = 20;

const getStyles = ({ colors, scaled, highContrast }: ThemedStylesInput) =>
  StyleSheet.create({
    chip: {
      height: ALTO_VISUAL,
      justifyContent: "center",
      paddingHorizontal: spacing.md,
      borderRadius: radii.pill,
      borderWidth: 1,
      borderColor: highContrast ? colors.borderStrong : colors.border,
      backgroundColor: colors.surface,
      alignSelf: "flex-start",
    },
    chipSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    contenido: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },
    label: {
      ...scaleType(typography.caption, scaled),
      color: colors.text,
    },
    labelSelected: {
      color: colors.textOnPrimary,
    },
    disabled: {
      opacity: 0.5,
    },
    focusRing: {
      boxShadow: `0px 0px 0px 3px ${colors.primaryTint}`,
    },
  });

export default Chip;
