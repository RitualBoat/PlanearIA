import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useAppTheme } from "../../themes/useAppTheme";
import { radii, scaleType, spacing, typography } from "../../themes/tokens";
import type { ColorTokens, ThemedStylesInput } from "../../themes/types";
import Button from "./Button";

export type EmptyStateVariant = "empty" | "error" | "offline";

export interface EmptyStateProps {
  variant?: EmptyStateVariant;
  /** Sustituye el titulo por defecto de la variante cuando la pantalla tiene uno mejor. */
  titulo?: string;
  mensaje?: string;
  accion?: { label: string; onPress: () => void };
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Estado de pantalla sin contenido util: vacio, error o sin conexion.
 *
 * Las tres variantes viven en un componente y no en tres, porque su estructura es la
 * misma (icono, titulo, mensaje, salida) y tres gemelos habrian divergido con el tiempo.
 * Tenerlas en un `variant` obliga a elegir una: ninguna pantalla puede "olvidar" el caso
 * sin conexion, porque esta en el mismo tipo que el vacio.
 *
 * Cada variante trae su copy por defecto, para que un estado nunca quede como pantalla en
 * blanco aunque quien lo monte no escriba texto.
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  variant = "empty",
  titulo,
  mensaje,
  accion,
  style,
  testID,
}) => {
  const { colors, isDark, scaled, highContrast } = useAppTheme();
  const styles = useMemo(
    () => getStyles({ colors, isDark, scaled, highContrast }),
    [colors, isDark, scaled, highContrast]
  );

  const preset = VARIANTES[variant];

  return (
    <View style={[styles.contenedor, style]} accessibilityRole="summary" testID={testID}>
      <View style={[styles.circulo, { backgroundColor: colors[preset.fondo] }]}>
        <MaterialIcons name={preset.icono} size={32} color={colors[preset.acento]} />
      </View>

      <Text style={styles.titulo}>{titulo ?? preset.titulo}</Text>
      <Text style={styles.mensaje}>{mensaje ?? preset.mensaje}</Text>

      {accion ? (
        <View style={styles.accion}>
          <Button
            label={accion.label}
            onPress={accion.onPress}
            variant={variant === "empty" ? "primary" : "secondary"}
            icon={preset.iconoAccion}
            testID={testID ? `${testID}-accion` : undefined}
          />
        </View>
      ) : null}
    </View>
  );
};

interface VariantePreset {
  icono: keyof typeof MaterialIcons.glyphMap;
  iconoAccion: keyof typeof MaterialIcons.glyphMap;
  titulo: string;
  mensaje: string;
  fondo: keyof ColorTokens;
  acento: keyof ColorTokens;
}

// Cada variante tiene icono, titulo y mensaje propios: reutilizar el copy entre ellas
// dejaria al docente sin saber si el problema es suyo, de la red o del servidor.
const VARIANTES: Record<EmptyStateVariant, VariantePreset> = {
  empty: {
    icono: "inbox",
    iconoAccion: "add",
    titulo: "Aun no hay nada aqui",
    mensaje: "Cuando agregues el primer elemento, aparecera en esta lista.",
    fondo: "primaryTint",
    acento: "primary",
  },
  error: {
    icono: "error-outline",
    iconoAccion: "refresh",
    titulo: "No pudimos cargar esto",
    mensaje: "Ocurrio un problema al obtener la informacion. Puedes intentarlo de nuevo.",
    fondo: "errorTint",
    acento: "error",
  },
  offline: {
    icono: "cloud-off",
    iconoAccion: "refresh",
    titulo: "Sin conexion",
    mensaje:
      "No hay conexion en este momento. Puedes seguir trabajando: tus cambios se guardan en este dispositivo.",
    fondo: "warningTint",
    acento: "warning",
  },
};

const getStyles = ({ colors, scaled, highContrast }: ThemedStylesInput) =>
  StyleSheet.create({
    contenedor: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: spacing.xxxl,
      paddingHorizontal: spacing.lg,
    },
    circulo: {
      width: 72,
      height: 72,
      borderRadius: radii.pill,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.lg,
    },
    titulo: {
      ...scaleType(typography.subtitle, scaled),
      color: colors.text,
      textAlign: "center",
    },
    mensaje: {
      ...scaleType(typography.body, scaled),
      color: highContrast ? colors.text : colors.textSecondary,
      textAlign: "center",
      marginTop: spacing.sm,
      maxWidth: 420,
    },
    accion: {
      marginTop: spacing.xl,
    },
  });

export default EmptyState;
