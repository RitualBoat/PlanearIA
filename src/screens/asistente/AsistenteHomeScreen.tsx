import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { useAppTheme } from "../../themes/useAppTheme";
import { getElevation, radii, scaleType, spacing, typography } from "../../themes/tokens";
import type { ThemedStylesInput } from "../../themes/types";
import { navigateToHub } from "../../navigation/navigateToHub";

/**
 * Hub senializado del Asistente (D4). La unica IA vigente es el Copiloto
 * contextual del editor de documentos; este hub enruta hacia ella y declara lo
 * que llega con asistente-ia-base (Ola 3: conversacion, adjuntos, tareas en
 * segundo plano). Se monta ya la quinta posicion porque la arquitectura de
 * informacion del shell es lo que este change fija; no construye chat ni backend.
 */
const AsistenteHomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, isDark, scaled, highContrast } = useAppTheme();
  const styles = useMemo(
    () => getStyles({ colors, isDark, scaled, highContrast }),
    [colors, isDark, scaled, highContrast]
  );

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.heroIcono}>
          <MaterialIcons name="auto-awesome" size={30} color={colors.primary} />
        </View>
        <Text style={styles.titulo}>Asistente</Text>
        <Text style={styles.subtitulo}>
          Hoy el Copiloto trabaja dentro de tus documentos: sugiere actividades, mejora
          textos y genera evaluaciones mientras escribes. Tu siempre decides que se guarda.
        </Text>
      </View>

      <Pressable
        style={({ pressed }) => [styles.accion, pressed && styles.accionPressed]}
        onPress={() => navigateToHub(navigation, "OfficeTab", "CrearPlaneacion")}
        accessibilityRole="button"
        accessibilityLabel="Crear un documento con Copiloto"
        accessibilityHint="Abre el creador de planeaciones, donde vive el Copiloto"
      >
        <MaterialIcons name="note-add" size={22} color={colors.textOnPrimary} />
        <Text style={styles.accionTexto}>Crear un documento con Copiloto</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.accionSecundaria,
          pressed && styles.accionSecundariaPressed,
        ]}
        onPress={() => navigateToHub(navigation, "OfficeTab", "ListaPlaneaciones")}
        accessibilityRole="button"
        accessibilityLabel="Abrir mis planeaciones"
        accessibilityHint="Abre tus documentos para seguir trabajando con el Copiloto"
      >
        <MaterialIcons name="article" size={22} color={colors.primary} />
        <Text style={styles.accionSecundariaTexto}>Abrir mis planeaciones</Text>
      </Pressable>

      <View
        style={styles.proximamente}
        accessibilityRole="text"
        accessibilityLabel="Lo que viene para el Asistente"
      >
        <Text style={styles.proximamenteTitulo}>Lo que viene</Text>
        <Text style={styles.proximamenteTexto}>
          Conversacion completa con adjuntos reales y tareas en segundo plano. Llegara en
          una proxima etapa; este espacio ya es su casa en la navegacion.
        </Text>
      </View>
    </ScrollView>
  );
};

const getStyles = ({ colors, scaled, highContrast }: ThemedStylesInput) => {
  const elevation = getElevation(colors);
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: spacing.lg,
      paddingBottom: spacing.xxxl,
      maxWidth: 640,
      width: "100%",
      alignSelf: "center",
    },
    hero: {
      alignItems: "flex-start",
      marginTop: spacing.sm,
      marginBottom: spacing.xl,
    },
    heroIcono: {
      width: 56,
      height: 56,
      borderRadius: radii.lg,
      backgroundColor: colors.primaryTint,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.md,
    },
    titulo: {
      ...scaleType(typography.title, scaled),
      color: colors.text,
    },
    subtitulo: {
      ...scaleType(typography.body, scaled),
      color: highContrast ? colors.text : colors.textSecondary,
      marginTop: spacing.sm,
    },
    accion: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      minHeight: 52,
      backgroundColor: colors.primary,
      borderRadius: radii.md,
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.md,
      ...elevation.level1,
    },
    accionPressed: {
      backgroundColor: colors.primaryDark,
      transform: [{ scale: 0.98 }],
    },
    accionTexto: {
      ...scaleType(typography.bodyStrong, scaled),
      color: colors.textOnPrimary,
    },
    accionSecundaria: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      minHeight: 52,
      backgroundColor: colors.surface,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: highContrast ? colors.borderStrong : colors.border,
      paddingHorizontal: spacing.lg,
    },
    accionSecundariaPressed: {
      backgroundColor: colors.surfaceHover,
    },
    accionSecundariaTexto: {
      ...scaleType(typography.bodyStrong, scaled),
      color: colors.primary,
    },
    proximamente: {
      backgroundColor: colors.surfaceSecondary,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: highContrast ? colors.borderStrong : colors.borderLight,
      padding: spacing.lg,
      marginTop: spacing.xl,
    },
    proximamenteTitulo: {
      ...scaleType(typography.overline, scaled),
      color: highContrast ? colors.text : colors.textSecondary,
      textTransform: "uppercase",
      marginBottom: spacing.xs,
    },
    proximamenteTexto: {
      ...scaleType(typography.caption, scaled),
      color: highContrast ? colors.text : colors.textSecondary,
    },
  });
};

export default AsistenteHomeScreen;
