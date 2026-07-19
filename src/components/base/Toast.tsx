import React, { useEffect, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useAppTheme } from "../../themes/useAppTheme";
import {
  getElevation,
  radii,
  scaleType,
  spacing,
  spring,
  typography,
  useReducedMotionPreference,
  zIndex,
} from "../../themes/tokens";
import type { ColorTokens, ThemedStylesInput } from "../../themes/types";
import { hitSlopToMinTarget, useFocusRing } from "./primitives";
import type { ToneVariant } from "./primitives";

export interface ToastProps {
  visible: boolean;
  tone?: ToneVariant;
  mensaje: string;
  onDismiss?: () => void;
  testID?: string;
}

/**
 * Aviso transitorio, puramente presentacional.
 *
 * No gestiona cola, temporizadores ni contexto global: quien lo monta decide cuando
 * aparece y cuando se va. Esa frontera es deliberada, porque `src/components/Toast.tsx`
 * ya tiene un mecanismo imperativo con llamadores en produccion, y construir aqui un
 * segundo sistema de notificaciones seria la duplicacion que el change evita. Unificar
 * ambos es trabajo de un change de migracion posterior.
 */
const Toast: React.FC<ToastProps> = ({ visible, tone = "info", mensaje, onDismiss, testID }) => {
  const { colors, isDark, scaled, highContrast } = useAppTheme();
  const reduceMotion = useReducedMotionPreference();
  const cerrarFoco = useFocusRing();
  const styles = useMemo(
    () => getStyles({ colors, isDark, scaled, highContrast }),
    [colors, isDark, scaled, highContrast]
  );

  const progreso = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    const destino = visible ? 1 : 0;
    progreso.value = reduceMotion ? destino : withSpring(destino, spring.standard);
  }, [visible, reduceMotion, progreso]);

  const estiloAnimado = useAnimatedStyle(() => ({
    opacity: progreso.value,
    transform: [{ translateY: (1 - progreso.value) * DESPLAZAMIENTO_ENTRADA }],
  }));

  if (!visible) return null;

  const paleta = TONOS[tone];

  return (
    <Animated.View
      style={[styles.toast, estiloAnimado]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      testID={testID}
    >
      <MaterialIcons name={paleta.icono} size={20} color={colors[paleta.acento]} />

      <Text style={styles.mensaje} numberOfLines={3}>
        {mensaje}
      </Text>

      {onDismiss ? (
        <Pressable
          onPress={onDismiss}
          onFocus={cerrarFoco.onFocus}
          onBlur={cerrarFoco.onBlur}
          hitSlop={hitSlopToMinTarget(ICONO_CERRAR, ICONO_CERRAR)}
          style={[styles.cerrar, cerrarFoco.focused && styles.focusRing]}
          accessibilityRole="button"
          accessibilityLabel="Descartar aviso"
          testID={testID ? `${testID}-dismiss` : undefined}
        >
          <MaterialIcons name="close" size={18} color={colors.textSecondary} />
        </Pressable>
      ) : null}
    </Animated.View>
  );
};

/** El toast sube desde abajo. Recorrido corto: es un aviso, no una transicion de pantalla. */
const DESPLAZAMIENTO_ENTRADA = 16;
const ICONO_CERRAR = 28;

interface TonoPaleta {
  icono: keyof typeof MaterialIcons.glyphMap;
  acento: keyof ColorTokens;
}

const TONOS: Record<ToneVariant, TonoPaleta> = {
  info: { icono: "info", acento: "primary" },
  success: { icono: "check-circle", acento: "success" },
  warning: { icono: "warning-amber", acento: "warning" },
  error: { icono: "error-outline", acento: "error" },
};

const getStyles = ({ colors, scaled, highContrast }: ThemedStylesInput) => {
  const elevation = getElevation(colors);
  return StyleSheet.create({
    toast: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      padding: spacing.lg,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: highContrast ? colors.borderStrong : colors.borderLight,
      backgroundColor: colors.surfaceContainerHigh,
      zIndex: zIndex.toast,
      ...elevation.level2,
    },
    mensaje: {
      ...scaleType(typography.body, scaled),
      color: colors.text,
      flex: 1,
    },
    cerrar: {
      width: ICONO_CERRAR,
      height: ICONO_CERRAR,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radii.sm,
    },
    focusRing: {
      boxShadow: `0px 0px 0px 3px ${colors.primary}`,
    },
  });
};

export default Toast;
