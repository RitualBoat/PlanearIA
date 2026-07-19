import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useAppTheme } from "../../themes/useAppTheme";
import { scaleType, spacing, typography } from "../../themes/tokens";
import type { ColorTokens, ThemedStylesInput } from "../../themes/types";
import { useSyncPresentation } from "../../hooks/useSyncPresentation";
import { TONOS_SYNC } from "./tonos";

/** Estado de guardado local del documento, provisto por quien lo edita. */
export type EstadoGuardado = "guardando" | "guardado" | "pendiente" | "error";

export interface SaveStateLabelProps {
  /**
   * Lo reporta el editor. No se deriva del conteo global de pendientes: ese conteo es un
   * total y filtrarlo por documento exigiria tocar el motor de sync, que es justo lo que
   * este change no hace.
   */
  estado: EstadoGuardado;
  /** Momento del ultimo guardado, ya formateado por el editor. */
  guardadoEn?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

interface AspectoGuardado {
  icono: keyof typeof MaterialIcons.glyphMap;
  texto: string;
  color: keyof ColorTokens;
  ocupado: boolean;
}

/**
 * Estado de guardado de un documento, con el estado de sincronizacion como contexto.
 *
 * Comunica la distincion que importa en una app offline-first: **guardado** (esta en el
 * dispositivo, no se pierde) no es lo mismo que **sincronizado** (esta en el servidor). Un
 * docente sin conexion debe poder leer "Guardado" con calma aunque el indicador global diga
 * "Sin conexion"; por eso la pierna local manda en el texto principal y la de sync entra
 * como complemento.
 *
 * Es el unico lugar del change que puede usar el rojo de error, y solo para el fallo de
 * guardado local: ahi el trabajo del docente si corre riesgo real.
 */
const SaveStateLabel: React.FC<SaveStateLabelProps> = ({ estado, guardadoEn, style, testID }) => {
  const sync = useSyncPresentation();
  const { colors, isDark, scaled, highContrast } = useAppTheme();

  const styles = useMemo(
    () => getStyles({ colors, isDark, scaled, highContrast }),
    [colors, isDark, scaled, highContrast]
  );

  const aspecto = aspectoDe(estado, guardadoEn);

  // El complemento sale de la tabla y no de `titulo`: tres estados se titulan "Guardado en
  // este dispositivo", que junto a esta etiqueta producia "Guardado - Guardado en este
  // dispositivo". La tabla decide cuando el estado remoto es noticia distinta.
  const complementoSync = estado === "guardado" ? sync.complementoGuardado : null;

  const etiquetaCompleta = complementoSync
    ? `${aspecto.texto}. ${sync.etiquetaA11y}`
    : aspecto.texto;

  return (
    <View
      style={[styles.fila, style]}
      // Ver SyncStatusChip: accessibilityRole="text" pierde el aria-label en web, y aqui la
      // etiqueta es la que une el guardado local con el estado de sync.
      accessibilityRole="image"
      accessibilityLabel={etiquetaCompleta}
      accessibilityState={{ busy: aspecto.ocupado }}
      // React Native Web no deriva aria-busy de accessibilityState (verificado en #82).
      aria-busy={aspecto.ocupado}
      testID={testID}
    >
      <MaterialIcons name={aspecto.icono} size={14} color={colors[aspecto.color]} />
      <Text style={[styles.texto, { color: colors[aspecto.color] }]} numberOfLines={1}>
        {aspecto.texto}
      </Text>
      {complementoSync ? (
        <Text style={styles.complemento} numberOfLines={1}>
          {`· ${complementoSync}`}
        </Text>
      ) : null}
    </View>
  );
};

function aspectoDe(estado: EstadoGuardado, guardadoEn?: string): AspectoGuardado {
  switch (estado) {
    case "guardando":
      return {
        icono: "sync",
        texto: "Guardando...",
        color: TONOS_SYNC.info.acento,
        ocupado: true,
      };
    case "guardado":
      return {
        icono: "check-circle-outline",
        texto: guardadoEn ? `Guardado ${guardadoEn}` : "Guardado",
        color: TONOS_SYNC.exito.acento,
        ocupado: false,
      };
    case "pendiente":
      return {
        icono: "edit",
        texto: "Cambios sin guardar",
        color: TONOS_SYNC.neutro.acento,
        ocupado: false,
      };
    case "error":
      // Unico rojo del change: aqui el trabajo del docente si esta en riesgo.
      return {
        icono: "error-outline",
        texto: "No se pudo guardar",
        color: "error",
        ocupado: false,
      };
  }
}

const getStyles = ({ colors, scaled, highContrast }: ThemedStylesInput) =>
  StyleSheet.create({
    fila: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },
    texto: {
      ...scaleType(typography.caption, scaled),
    },
    complemento: {
      ...scaleType(typography.caption, scaled),
      color: highContrast ? colors.text : colors.textSecondary,
      flexShrink: 1,
    },
  });

export default SaveStateLabel;
