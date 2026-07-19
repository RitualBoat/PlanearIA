import React, { useEffect, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useAppTheme } from "../../themes/useAppTheme";
import {
  radii,
  scaleType,
  spacing,
  timing,
  typography,
  useReducedMotionPreference,
} from "../../themes/tokens";
import type { ThemedStylesInput } from "../../themes/types";
import { useSyncStatus } from "../../context/SyncContext";
import { useSyncPresentation } from "../../hooks/useSyncPresentation";
import { MIN_TOUCH_TARGET, hitSlopToMinTarget, useFocusRing } from "../base/primitives";
import { TONOS_SYNC } from "./tonos";

/** Alto visual del chip. Menor a 44pt para no romper la densidad del chrome; el area tactil la completa hitSlop. */
const ALTO_VISUAL = 28;

export interface SyncStatusChipProps {
  /**
   * Variante sin texto, para anchos angostos. La etiqueta accesible sigue completa: se
   * recorta lo que se ve, nunca lo que se anuncia.
   */
  compacto?: boolean;
  /**
   * Salida hacia el reingreso de sesion. La navegacion pertenece al anfitrion, no a un
   * componente de estado; sin este callback el chip informa la sesion expirada sin
   * ofrecer una accion que no podria completar.
   */
  onReingresar?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Indicador ambiente del estado de sincronizacion.
 *
 * Toma su presentacion de `useSyncPresentation()`, la unica fuente: no decide texto, icono
 * ni tono. Es la superficie de ambiente del par que forma con `SyncOfflineBar`, que es la
 * de interrupcion; como ambas leen el mismo hook, no pueden contradecirse.
 *
 * No se anuncia como alerta a proposito: el ciclo de sincronizacion corre cada pocos
 * segundos y un rol de alerta interrumpiria al lector de pantalla en cada vuelta.
 */
const SyncStatusChip: React.FC<SyncStatusChipProps> = ({
  compacto = false,
  onReingresar,
  style,
  testID,
}) => {
  const presentacion = useSyncPresentation();
  const { syncNow } = useSyncStatus();
  const { colors, isDark, scaled, highContrast } = useAppTheme();
  const reduceMotion = useReducedMotionPreference();
  const { focused, onFocus, onBlur } = useFocusRing();

  const styles = useMemo(
    () => getStyles({ colors, isDark, scaled, highContrast }),
    [colors, isDark, scaled, highContrast]
  );

  const paleta = TONOS_SYNC[presentacion.tono];

  // Fundido corto al cambiar de estado. No hay animacion en bucle: el ciclo periodico
  // dejaria el chrome en movimiento permanente, contra el presupuesto de motion 1.9.4.
  const opacidad = useSharedValue(1);
  useEffect(() => {
    if (reduceMotion) {
      opacidad.value = 1;
      return;
    }
    opacidad.value = 0.4;
    opacidad.value = withTiming(1, timing.fast);
  }, [presentacion.estado, reduceMotion, opacidad]);

  const estiloAnimado = useAnimatedStyle(() => ({ opacity: opacidad.value }));

  const alPresionar =
    presentacion.accion === "reintentar"
      ? () => void syncNow("manual")
      : presentacion.accion === "reingresar" && onReingresar
        ? onReingresar
        : null;

  const contenido = (
    <>
      <MaterialIcons name={presentacion.icono} size={16} color={colors[paleta.acento]} />
      {compacto ? null : (
        <Text style={[styles.titulo, { color: colors[paleta.acento] }]} numberOfLines={1}>
          {presentacion.titulo}
        </Text>
      )}
    </>
  );

  const estiloBase = [
    styles.chip,
    { backgroundColor: colors[paleta.fondo] },
    focused && styles.focusRing,
    style,
  ];

  // La etiqueta accesible siempre es la completa, tambien en compacto: el estado se
  // comunica por texto y no por el color ni el icono que quedan a la vista.
  const propsAccesibles = {
    accessibilityLabel: presentacion.etiquetaA11y,
    // React Native Web no deriva aria-busy de accessibilityState (verificado en #82): sin
    // este prop, el ciclo en curso no se anuncia en web.
    "aria-busy": presentacion.ocupado,
    testID,
  };

  if (!alPresionar) {
    return (
      <Animated.View
        style={[estiloBase, estiloAnimado]}
        accessibilityRole="text"
        accessibilityState={{ busy: presentacion.ocupado }}
        {...propsAccesibles}
      >
        <View style={styles.contenido}>{contenido}</View>
      </Animated.View>
    );
  }

  const etiquetaAccion =
    presentacion.accion === "reintentar" ? "Reintentar sincronizacion" : "Volver a iniciar sesion";

  return (
    <Animated.View style={estiloAnimado}>
      <Pressable
        style={estiloBase}
        onPress={alPresionar}
        onFocus={onFocus}
        onBlur={onBlur}
        hitSlop={hitSlopToMinTarget(MIN_TOUCH_TARGET, ALTO_VISUAL)}
        accessibilityRole="button"
        accessibilityState={{ busy: presentacion.ocupado }}
        {...propsAccesibles}
        accessibilityLabel={`${presentacion.etiquetaA11y} ${etiquetaAccion}`}
        accessibilityHint={etiquetaAccion}
      >
        <View style={styles.contenido}>{contenido}</View>
      </Pressable>
    </Animated.View>
  );
};

const getStyles = ({ colors, scaled }: ThemedStylesInput) =>
  StyleSheet.create({
    chip: {
      height: ALTO_VISUAL,
      minWidth: ALTO_VISUAL,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.sm,
      borderRadius: radii.pill,
      alignSelf: "center",
    },
    contenido: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },
    titulo: {
      ...scaleType(typography.caption, scaled),
    },
    focusRing: {
      boxShadow: `0px 0px 0px 3px ${colors.primary}`,
    },
  });

export default SyncStatusChip;
