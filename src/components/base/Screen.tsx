import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { useAppTheme } from "../../themes/useAppTheme";
import { spacing } from "../../themes/tokens";
import type { ThemedStylesInput } from "../../themes/types";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import WebScrollView from "../WebScrollView";

export interface ScreenProps {
  children: React.ReactNode;
  /** Envuelve el contenido en scroll. Desactivar para pantallas con su propia lista virtualizada. */
  scroll?: boolean;
  /** Quita el padding lateral, para pantallas cuyo contenido llega a los bordes. */
  bleed?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Contenedor raiz de una pantalla: fondo, ritmo lateral y ancho de lectura.
 *
 * El padding y el ancho maximo cambian por breakpoint en vez de estirar la columna movil
 * a lo ancho del escritorio, que es el fallo que el checklist anti-slop marca como
 * "densidad incorrecta por breakpoint". El scroll pasa por `WebScrollView` para conservar
 * el mismo contrato en web y en movil.
 */
const Screen: React.FC<ScreenProps> = ({
  children,
  scroll = true,
  bleed = false,
  style,
  contentStyle,
  testID,
}) => {
  const { colors, isDark, scaled, highContrast } = useAppTheme();
  const { breakpoint } = useBreakpoint();
  const styles = useMemo(
    () => getStyles({ colors, isDark, scaled, highContrast, breakpoint }),
    [colors, isDark, scaled, highContrast, breakpoint]
  );

  const content = [styles.content, bleed && styles.contentBleed, contentStyle];

  if (!scroll) {
    return (
      <View style={[styles.root, style]} testID={testID}>
        <View style={content}>{children}</View>
      </View>
    );
  }

  return (
    <WebScrollView style={[styles.root, style]} contentContainerStyle={content} testID={testID}>
      {children}
    </WebScrollView>
  );
};

const PADDING_POR_BREAKPOINT = {
  mobile: spacing.lg,
  tablet: spacing.xl,
  desktop: spacing.xl,
} as const;

// El ancho de lectura se acota en pantallas grandes: una linea de texto que cruza 1600px
// es incomoda de leer aunque haya espacio disponible.
const ANCHO_MAXIMO_POR_BREAKPOINT = {
  mobile: undefined,
  tablet: 840,
  desktop: 1120,
} as const;

const getStyles = ({ colors, breakpoint = "mobile" }: ThemedStylesInput) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flexGrow: 1,
      padding: PADDING_POR_BREAKPOINT[breakpoint],
      paddingBottom: spacing.xxxl,
      width: "100%",
      maxWidth: ANCHO_MAXIMO_POR_BREAKPOINT[breakpoint],
      alignSelf: "center",
    },
    contentBleed: {
      paddingHorizontal: 0,
    },
  });

export default Screen;
