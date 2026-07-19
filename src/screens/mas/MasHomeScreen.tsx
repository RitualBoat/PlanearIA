import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { useAppTheme } from "../../themes/useAppTheme";
import { getElevation, radii, scaleType, spacing, typography } from "../../themes/tokens";
import type { ThemedStylesInput } from "../../themes/types";
import type { MasStackParamList } from "../../navigation/types";

type Nav = StackNavigationProp<MasStackParamList, "MasHome">;

interface Entrada {
  destino: keyof MasStackParamList;
  icon: keyof typeof MaterialIcons.glyphMap;
  titulo: string;
  descripcion: string;
}

const SECCIONES: Array<{ titulo: string; entradas: Entrada[] }> = [
  {
    titulo: "Tu cuenta",
    entradas: [
      {
        destino: "Perfil",
        icon: "person",
        titulo: "Mi perfil",
        descripcion: "Como te ven otros docentes",
      },
      {
        destino: "Cuenta",
        icon: "manage-accounts",
        titulo: "Cuenta y seguridad",
        descripcion: "Sesiones, tema, fuente y accesibilidad",
      },
    ],
  },
  {
    titulo: "Comunidad",
    entradas: [
      {
        destino: "Chat",
        icon: "chat",
        titulo: "Mensajes",
        descripcion: "Conversaciones con otros docentes",
      },
      {
        destino: "Social",
        icon: "people",
        titulo: "Comunidad docente",
        descripcion: "Contactos y perfiles",
      },
      {
        destino: "Feed",
        icon: "dynamic-feed",
        titulo: "Feed",
        descripcion: "Publicaciones y retos",
      },
    ],
  },
];

/**
 * Herramientas de desarrollo. Solo se agregan bajo `__DEV__`, junto con la ruta que
 * `MasStack` registra: una pantalla sin punto de entrada seria inalcanzable salvo por
 * URL, y este proyecto no configura `linking`.
 */
const SECCION_DESARROLLO: { titulo: string; entradas: Entrada[] } = {
  titulo: "Desarrollo",
  entradas: [
    {
      destino: "CatalogoComponentes",
      icon: "widgets",
      titulo: "Catalogo de componentes",
      descripcion: "Biblioteca base con todos sus estados",
    },
  ],
};

/**
 * Hub Mas (D7): reune cuenta, perfil y la comunidad legacy. Feed y Social viven
 * aqui hasta que conectaplan las sustituya (D5); se reapuntan, no se redisenan.
 */
const MasHomeScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { colors, isDark, scaled, highContrast } = useAppTheme();
  const styles = useMemo(
    () => getStyles({ colors, isDark, scaled, highContrast }),
    [colors, isDark, scaled, highContrast]
  );

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.titulo}>Mas</Text>
      <Text style={styles.subtitulo}>Tu cuenta y tu comunidad, en un solo lugar.</Text>

      {(__DEV__ ? [...SECCIONES, SECCION_DESARROLLO] : SECCIONES).map((seccion) => (
        <View key={seccion.titulo} style={styles.seccion}>
          <Text style={styles.seccionTitulo}>{seccion.titulo}</Text>
          <View style={styles.lista}>
            {seccion.entradas.map((entrada) => (
              <Pressable
                key={entrada.destino}
                style={({ pressed }) => [styles.fila, pressed && styles.filaPressed]}
                onPress={() => navigation.navigate(entrada.destino as never)}
                accessibilityRole="button"
                accessibilityLabel={entrada.titulo}
                accessibilityHint={entrada.descripcion}
              >
                <View style={styles.filaIcono}>
                  <MaterialIcons name={entrada.icon} size={22} color={colors.primary} />
                </View>
                <View style={styles.filaTextos}>
                  <Text style={styles.filaTitulo}>{entrada.titulo}</Text>
                  <Text style={styles.filaDescripcion}>{entrada.descripcion}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={22} color={colors.textTertiary} />
              </Pressable>
            ))}
          </View>
        </View>
      ))}
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
      maxWidth: 840,
      width: "100%",
      alignSelf: "center",
    },
    titulo: {
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
    seccion: {
      marginBottom: spacing.xl,
    },
    seccionTitulo: {
      ...scaleType(typography.overline, scaled),
      color: highContrast ? colors.text : colors.textSecondary,
      textTransform: "uppercase",
      marginBottom: spacing.sm,
      marginLeft: spacing.xs,
    },
    lista: {
      backgroundColor: colors.surface,
      borderRadius: radii.lg,
      borderWidth: 1,
      borderColor: highContrast ? colors.borderStrong : colors.borderLight,
      overflow: "hidden",
      ...elevation.level1,
    },
    fila: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      minHeight: 64,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.divider,
    },
    filaPressed: {
      backgroundColor: colors.surfaceHover,
    },
    filaIcono: {
      width: 44,
      height: 44,
      borderRadius: radii.md,
      backgroundColor: colors.primaryTint,
      alignItems: "center",
      justifyContent: "center",
    },
    filaTextos: {
      flex: 1,
    },
    filaTitulo: {
      ...scaleType(typography.bodyStrong, scaled),
      color: colors.text,
    },
    filaDescripcion: {
      ...scaleType(typography.caption, scaled),
      color: highContrast ? colors.text : colors.textSecondary,
      marginTop: 2,
    },
  });
};

export default MasHomeScreen;
