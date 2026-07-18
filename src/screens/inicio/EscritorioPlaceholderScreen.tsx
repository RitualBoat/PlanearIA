import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { useAppTheme } from "../../themes/useAppTheme";
import { getElevation, radii, scaleType, spacing, typography } from "../../themes/tokens";
import type { ThemedStylesInput } from "../../themes/types";
import { resolveResponsive, useBreakpoint } from "../../hooks/useBreakpoint";
import { navigateToHub, type HubName } from "../../navigation/navigateToHub";

interface DockItem {
  hub: Exclude<HubName, "InicioTab">;
  icon: keyof typeof MaterialIcons.glyphMap;
  titulo: string;
  descripcion: string;
}

// Solo destinos que funcionan hoy: el dock no muestra herramientas futuras
// como botones muertos (checklist anti-slop 1.9.3).
const DOCK: DockItem[] = [
  {
    hub: "OfficeTab",
    icon: "description",
    titulo: "Office",
    descripcion: "Planeaciones, recursos y plantillas",
  },
  {
    hub: "ClasesTab",
    icon: "school",
    titulo: "Clases",
    descripcion: "Grupos, tareas y seguimiento",
  },
  {
    hub: "AsistenteTab",
    icon: "auto-awesome",
    titulo: "Asistente",
    descripcion: "Copiloto IA en tus documentos",
  },
  {
    hub: "MasTab",
    icon: "widgets",
    titulo: "Mas",
    descripcion: "Cuenta, mensajes y comunidad",
  },
];

/**
 * Placeholder honesto del Escritorio Docente (D1). Es la ruta inicial del shell
 * desde app-shell-navegacion (#81); el Escritorio real (dock definitivo + tablero
 * del dia) pertenece al change escritorio-docente de la Ola 2. Este placeholder
 * existe para que la app abra en el escritorio y no en un feed, con salidas
 * reales hacia cada experiencia; no simula datos ni tarjetas vacias.
 */
const EscritorioPlaceholderScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, isDark, scaled, highContrast } = useAppTheme();
  const { breakpoint } = useBreakpoint();
  const styles = useMemo(
    () => getStyles({ colors, isDark, scaled, highContrast, breakpoint }),
    [colors, isDark, scaled, highContrast, breakpoint]
  );

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.saludo}>Escritorio</Text>
      <Text style={styles.subtitulo}>Tus herramientas de siempre, conectadas.</Text>

      <View
        style={styles.aviso}
        accessibilityRole="text"
        accessibilityLabel="Version temporal del Escritorio"
      >
        <MaterialIcons name="construction" size={18} color={colors.primary} />
        <Text style={styles.avisoTexto}>
          Version temporal: aqui vivira tu tablero del dia. Mientras tanto, entra directo a
          tus herramientas.
        </Text>
      </View>

      <View style={styles.dock}>
        {DOCK.map((item) => (
          <Pressable
            key={item.hub}
            style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]}
            onPress={() => navigateToHub(navigation, item.hub)}
            accessibilityRole="button"
            accessibilityLabel={`Abrir ${item.titulo}`}
            accessibilityHint={item.descripcion}
          >
            <View style={styles.tileIcono}>
              <MaterialIcons name={item.icon} size={26} color={colors.primary} />
            </View>
            <Text style={styles.tileTitulo}>{item.titulo}</Text>
            <Text style={styles.tileDescripcion}>{item.descripcion}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
};

const getStyles = ({ colors, scaled, highContrast, breakpoint }: ThemedStylesInput) => {
  const elevation = getElevation(colors);
  const tileBasis = resolveResponsive(breakpoint ?? "mobile", "47%" as const, "23%" as const);
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: spacing.lg,
      paddingBottom: spacing.xxxl,
      maxWidth: 1080,
      width: "100%",
      alignSelf: "center",
    },
    saludo: {
      ...scaleType(typography.title, scaled),
      color: colors.text,
      marginTop: spacing.sm,
    },
    subtitulo: {
      ...scaleType(typography.body, scaled),
      color: highContrast ? colors.text : colors.textSecondary,
      marginTop: spacing.xs,
      marginBottom: spacing.lg,
    },
    aviso: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      backgroundColor: colors.primaryTint,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: highContrast ? colors.borderStrong : colors.borderLight,
      padding: spacing.md,
      marginBottom: spacing.xl,
    },
    avisoTexto: {
      ...scaleType(typography.caption, scaled),
      color: colors.text,
      flex: 1,
    },
    dock: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.md,
    },
    tile: {
      flexGrow: 1,
      flexBasis: tileBasis,
      minHeight: 132,
      backgroundColor: colors.surface,
      borderRadius: radii.lg,
      borderWidth: 1,
      borderColor: highContrast ? colors.borderStrong : colors.borderLight,
      padding: spacing.lg,
      ...elevation.level1,
    },
    tilePressed: {
      backgroundColor: colors.surfaceHover,
      transform: [{ scale: 0.97 }],
    },
    tileIcono: {
      width: 44,
      height: 44,
      borderRadius: radii.md,
      backgroundColor: colors.primaryTint,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.md,
    },
    tileTitulo: {
      ...scaleType(typography.subtitle, scaled),
      color: colors.text,
    },
    tileDescripcion: {
      ...scaleType(typography.caption, scaled),
      color: highContrast ? colors.text : colors.textSecondary,
      marginTop: spacing.xs,
    },
  });
};

export default EscritorioPlaceholderScreen;
