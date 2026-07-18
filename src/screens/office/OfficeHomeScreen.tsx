import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { useAppTheme } from "../../themes/useAppTheme";
import { getElevation, radii, scaleType, spacing, typography } from "../../themes/tokens";
import type { ThemedStylesInput } from "../../themes/types";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import type { OfficeStackParamList } from "../../navigation/types";

type Nav = StackNavigationProp<OfficeStackParamList, "OfficeHome">;

interface Entrada {
  destino: keyof OfficeStackParamList;
  icon: keyof typeof MaterialIcons.glyphMap;
  titulo: string;
  descripcion: string;
}

// Solo lo que existe hoy. CalcuPLAN y PresentaPLAN entran con sus changes de
// Ola 3+; listarlos como botones seria crear accesos muertos (anti-slop 1.9.3).
const ENTRADAS: Entrada[] = [
  {
    destino: "ListaPlaneaciones",
    icon: "article",
    titulo: "Mis planeaciones",
    descripcion: "Tus documentos y planeaciones didacticas",
  },
  {
    destino: "CrearPlaneacion",
    icon: "note-add",
    titulo: "Crear documento",
    descripcion: "Empieza una planeacion nueva, con o sin IA",
  },
  {
    destino: "RecursosDidacticos",
    icon: "folder-special",
    titulo: "Recursos didacticos",
    descripcion: "Material reutilizable y asignable",
  },
  {
    destino: "BibliotecaPlantillas",
    icon: "dashboard-customize",
    titulo: "Plantillas",
    descripcion: "Estructuras listas para reutilizar",
  },
  {
    destino: "Contenido",
    icon: "collections-bookmark",
    titulo: "Biblioteca",
    descripcion: "Todo tu contenido en un solo lugar",
  },
];

/**
 * Hub de la experiencia Office (D2/D6). Lanzador hacia las superficies de
 * creacion que ya existen; las pantallas internas no se redisenan aqui.
 */
const OfficeHomeScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { colors, isDark, scaled, highContrast } = useAppTheme();
  const { breakpoint } = useBreakpoint();
  const styles = useMemo(
    () => getStyles({ colors, isDark, scaled, highContrast, breakpoint }),
    [colors, isDark, scaled, highContrast, breakpoint]
  );

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.titulo}>Office Docente</Text>
      <Text style={styles.subtitulo}>Crea, organiza y reutiliza tu material.</Text>

      <View style={styles.lista}>
        {ENTRADAS.map((entrada) => (
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

      <Text style={styles.nota}>
        CalcuPLAN (hojas de calculo) y PresentaPLAN (presentaciones) se integraran aqui en
        proximas etapas.
      </Text>
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
      marginBottom: spacing.xl,
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
    nota: {
      ...scaleType(typography.caption, scaled),
      color: highContrast ? colors.text : colors.textTertiary,
      marginTop: spacing.lg,
    },
  });
};

export default OfficeHomeScreen;
