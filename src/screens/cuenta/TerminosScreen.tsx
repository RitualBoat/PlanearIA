import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { NavigationProp, RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { FONT_SIZES } from "../../../types";
import type { RootStackParamList } from "../../navigation/types";
import {
  AVISO_PRIVACIDAD,
  LICENCIAS_TERCEROS,
  TERMINOS_CONDICIONES,
} from "../../utils/legalTexts";
import { useAppTheme } from "../../themes/useAppTheme";
import { ThemedStylesInput } from "../../themes/types";

type TabKey = "terminos" | "privacidad" | "licencias";

const LEGAL_TABS: ReadonlyArray<{ key: TabKey; label: string }> = [
  { key: "terminos", label: "Términos y Condiciones" },
  { key: "privacidad", label: "Aviso de Privacidad" },
  { key: "licencias", label: "Licencias de terceros" },
];

const LEGAL_CONTENT: Record<TabKey, string> = {
  terminos: TERMINOS_CONDICIONES,
  privacidad: AVISO_PRIVACIDAD,
  licencias: LICENCIAS_TERCEROS,
};

const TerminosScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "Terminos">>();
  const initialTab: TabKey = route.params?.tab ?? "terminos";
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  const { colors, isDark, scaled, highContrast } = useAppTheme();
  const styles = useMemo(
    () => getStyles({ colors, isDark, scaled, highContrast }),
    [colors, isDark, scaled, highContrast]
  );

  const content = LEGAL_CONTENT[activeTab];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.surface} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
          accessibilityRole="button"
          accessibilityLabel="Volver"
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Documentos Legales</Text>
        <View style={styles.backBtn} />
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {LEGAL_TABS.map(({ key, label }) => {
          const selected = activeTab === key;
          return (
            <Pressable
              key={key}
              style={({ pressed }) => [
                styles.tab,
                selected && styles.tabActive,
                pressed && { opacity: 0.6 },
              ]}
              onPress={() => setActiveTab(key)}
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityState={{ selected }}
            >
              <Text style={[styles.tabText, selected && styles.tabTextActive]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator
      >
        <Text style={styles.legalText}>{content}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = ({ colors, scaled, highContrast }: ThemedStylesInput) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: highContrast ? colors.borderStrong : colors.borderLight,
    },
    backBtn: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontSize: scaled(FONT_SIZES.large),
      fontWeight: "700",
      color: colors.text,
    },
    tabBar: {
      flexDirection: "row",
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: highContrast ? colors.borderStrong : colors.borderLight,
    },
    tab: {
      flex: 1,
      minHeight: 44,
      paddingVertical: 12,
      alignItems: "center",
      justifyContent: "center",
      borderBottomWidth: 2,
      borderBottomColor: "transparent",
    },
    tabActive: {
      borderBottomColor: colors.primary,
    },
    tabText: {
      fontSize: scaled(FONT_SIZES.small),
      fontWeight: "600",
      textAlign: "center",
      // "Contraste alto": refuerza el texto de la pestana inactiva usando solo tokens.
      color: highContrast ? colors.text : colors.textSecondary,
    },
    tabTextActive: {
      color: colors.primary,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      padding: 20,
      paddingBottom: 40,
    },
    legalText: {
      fontSize: scaled(FONT_SIZES.small),
      // El interlineado escala con la fuente para que el texto legal no se encime.
      lineHeight: scaled(22),
      color: colors.text,
    },
  });

export default TerminosScreen;
