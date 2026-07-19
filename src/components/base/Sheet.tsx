import React, { useEffect, useMemo } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
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
import type { ThemedStylesInput } from "../../themes/types";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { MIN_TOUCH_TARGET, hitSlopToMinTarget, useFocusRing } from "./primitives";

export interface SheetProps {
  visible: boolean;
  titulo: string;
  onClose: () => void;
  children: React.ReactNode;
  /** Pie fijo, normalmente con las acciones de confirmar y cancelar. */
  footer?: React.ReactNode;
  testID?: string;
}

/**
 * Capa modal: hoja inferior en movil, dialogo centrado en tablet y escritorio.
 *
 * El fondo usa el token `overlay` solido, no blur: `expo-blur` quedo diferido por escrito
 * en #80 hasta medir su costo en Android de gama media. La costura para adoptarlo despues
 * es sustituir esta capa de fondo sin tocar el contrato del componente.
 */
const Sheet: React.FC<SheetProps> = ({ visible, titulo, onClose, children, footer, testID }) => {
  const { colors, isDark, scaled, highContrast } = useAppTheme();
  const { breakpoint } = useBreakpoint();
  const reduceMotion = useReducedMotionPreference();
  const cerrarFoco = useFocusRing();
  const styles = useMemo(
    () => getStyles({ colors, isDark, scaled, highContrast, breakpoint }),
    [colors, isDark, scaled, highContrast, breakpoint]
  );

  const progreso = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    const destino = visible ? 1 : 0;
    // Bajo reduce-motion la hoja aparece ya colocada: mismo estado final, sin recorrido.
    progreso.value = reduceMotion ? destino : withSpring(destino, spring.gentle);
  }, [visible, reduceMotion, progreso]);

  // El estilo solo lee el valor compartido; quien anima es el efecto de arriba. Llamar a
  // withTiming aqui reiniciaria la animacion en cada evaluacion del worklet.
  const fondoAnimado = useAnimatedStyle(() => ({ opacity: progreso.value }));

  const panelAnimado = useAnimatedStyle(() => ({
    opacity: progreso.value,
    transform: [{ translateY: (1 - progreso.value) * DESPLAZAMIENTO_ENTRADA }],
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.raiz} testID={testID}>
        <Animated.View style={[styles.fondo, fondoAnimado]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Cerrar"
            testID={testID ? `${testID}-backdrop` : undefined}
          />
        </Animated.View>

        {/*
          El `testID` propio del panel no es decorativo: en web el `Modal` de RN envuelve
          todo en un contenedor `position: fixed` a viewport completo que ya lleva
          `aria-modal="true"`, y `accessibilityViewIsModal` no viaja al DOM (no esta en la
          lista de props que react-native-web reenvia). Sin este ancla, medir la hoja por
          `[aria-modal="true"]` devuelve ese contenedor y la reporta full-width y pegada
          al borde inferior en cualquier ancho. Ver #84.
        */}
        <Animated.View
          style={[styles.panel, panelAnimado]}
          accessibilityViewIsModal
          testID={testID ? `${testID}-panel` : undefined}
        >
          <View style={styles.encabezado}>
            <Text style={styles.titulo} numberOfLines={2}>
              {titulo}
            </Text>
            <Pressable
              onPress={onClose}
              onFocus={cerrarFoco.onFocus}
              onBlur={cerrarFoco.onBlur}
              hitSlop={hitSlopToMinTarget(ICONO_CERRAR, ICONO_CERRAR)}
              style={[styles.cerrar, cerrarFoco.focused && styles.focusRing]}
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
              testID={testID ? `${testID}-close` : undefined}
            >
              <MaterialIcons name="close" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.cuerpo}>{children}</View>

          {footer ? <View style={styles.pie}>{footer}</View> : null}
        </Animated.View>
      </View>
    </Modal>
  );
};

/** Desplazamiento de entrada, en puntos. Corto a proposito: la hoja acompana, no viaja. */
const DESPLAZAMIENTO_ENTRADA = 24;
const ICONO_CERRAR = 28;

const getStyles = ({ colors, scaled, highContrast, breakpoint = "mobile" }: ThemedStylesInput) => {
  const elevation = getElevation(colors);
  const esMovil = breakpoint === "mobile";
  return StyleSheet.create({
    raiz: {
      flex: 1,
      justifyContent: esMovil ? "flex-end" : "center",
      alignItems: esMovil ? "stretch" : "center",
      zIndex: zIndex.modal,
    },
    fondo: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.overlay,
    },
    panel: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: highContrast ? colors.borderStrong : colors.borderLight,
      // En movil la hoja nace del borde inferior: solo se redondea arriba.
      borderTopLeftRadius: radii.lg,
      borderTopRightRadius: radii.lg,
      borderBottomLeftRadius: esMovil ? 0 : radii.lg,
      borderBottomRightRadius: esMovil ? 0 : radii.lg,
      width: esMovil ? "100%" : 520,
      maxWidth: "100%",
      maxHeight: "85%",
      ...elevation.level3,
    },
    encabezado: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      padding: spacing.lg,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.divider,
    },
    titulo: {
      ...scaleType(typography.subtitle, scaled),
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
    cuerpo: {
      padding: spacing.lg,
    },
    pie: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: spacing.md,
      minHeight: MIN_TOUCH_TARGET,
      padding: spacing.lg,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.divider,
    },
    focusRing: {
      boxShadow: `0px 0px 0px 3px ${colors.primary}`,
    },
  });
};

export default Sheet;
