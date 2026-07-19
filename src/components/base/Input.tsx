import React, { useMemo } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import type { StyleProp, TextInputProps, ViewStyle } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useAppTheme } from "../../themes/useAppTheme";
import { radii, scaleType, spacing, typography } from "../../themes/tokens";
import type { ThemedStylesInput } from "../../themes/types";
import { MIN_TOUCH_TARGET, useFocusRing } from "./primitives";

export interface InputProps extends Omit<TextInputProps, "style" | "editable"> {
  label: string;
  /** Texto de apoyo permanente. Se oculta mientras hay error, para no competir con el. */
  ayuda?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Campo de texto con etiqueta, ayuda y error.
 *
 * El error se comunica por tres canales a la vez (texto, icono y borde) porque el color
 * por si solo no llega a quien no lo distingue, y viaja en `accessibilityLabel` para que
 * un lector de pantalla lo anuncie junto al campo en vez de dejarlo como texto suelto.
 */
const Input: React.FC<InputProps> = ({
  label,
  ayuda,
  error,
  disabled = false,
  required = false,
  style,
  testID,
  ...textInputProps
}) => {
  const { colors, isDark, scaled, highContrast } = useAppTheme();
  const { focused, onFocus, onBlur } = useFocusRing();
  const styles = useMemo(
    () => getStyles({ colors, isDark, scaled, highContrast }),
    [colors, isDark, scaled, highContrast]
  );

  const tieneError = Boolean(error);
  const etiquetaAccesible = [label, required ? "obligatorio" : null, error]
    .filter(Boolean)
    .join(". ");

  return (
    <View style={[styles.contenedor, style]} testID={testID}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.requerido}> *</Text> : null}
      </Text>

      <View
        style={[
          styles.campo,
          focused && styles.campoFocused,
          tieneError && styles.campoError,
          disabled && styles.campoDisabled,
        ]}
      >
        <TextInput
          style={styles.textInput}
          placeholderTextColor={colors.textMuted}
          editable={!disabled}
          onFocus={onFocus}
          onBlur={onBlur}
          accessibilityLabel={etiquetaAccesible}
          accessibilityState={{ disabled }}
          testID={testID ? `${testID}-textinput` : undefined}
          {...textInputProps}
        />
      </View>

      {tieneError ? (
        <View style={styles.mensajeFila}>
          <MaterialIcons name="error-outline" size={16} color={colors.error} />
          <Text style={styles.mensajeError}>{error}</Text>
        </View>
      ) : ayuda ? (
        <Text style={styles.mensajeAyuda}>{ayuda}</Text>
      ) : null}
    </View>
  );
};

const getStyles = ({ colors, scaled, highContrast }: ThemedStylesInput) =>
  StyleSheet.create({
    contenedor: {
      width: "100%",
    },
    label: {
      ...scaleType(typography.caption, scaled),
      color: highContrast ? colors.text : colors.textSecondary,
      marginBottom: spacing.xs,
    },
    requerido: {
      color: colors.error,
    },
    campo: {
      minHeight: MIN_TOUCH_TARGET,
      justifyContent: "center",
      backgroundColor: colors.surface,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: highContrast ? colors.borderStrong : colors.border,
      paddingHorizontal: spacing.md,
    },
    campoFocused: {
      borderColor: colors.primary,
      boxShadow: `0px 0px 0px 3px ${colors.primary}`,
    },
    campoError: {
      borderColor: colors.error,
    },
    campoDisabled: {
      backgroundColor: colors.surfaceTertiary,
      borderColor: colors.borderLight,
    },
    textInput: {
      ...scaleType(typography.body, scaled),
      color: colors.text,
      paddingVertical: spacing.md,
    },
    mensajeFila: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      marginTop: spacing.xs,
    },
    mensajeError: {
      ...scaleType(typography.caption, scaled),
      color: colors.error,
      flex: 1,
    },
    mensajeAyuda: {
      ...scaleType(typography.caption, scaled),
      color: highContrast ? colors.text : colors.textTertiary,
      marginTop: spacing.xs,
    },
  });

export default Input;
