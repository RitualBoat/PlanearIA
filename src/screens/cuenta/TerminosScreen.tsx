import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { FONT_SIZES } from "../../../types";
import { AVISO_PRIVACIDAD, TERMINOS_CONDICIONES } from "../../utils/legalTexts";
import { useAppTheme } from "../../themes/useAppTheme";
import { ThemedStylesInput } from "../../themes/types";

type TabKey = "terminos" | "privacidad";

const TerminosScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const initialTab: TabKey = route.params?.tab === "privacidad" ? "privacidad" : "terminos";
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  const { colors, isDark, scaled, highContrast } = useAppTheme();
  const styles = useMemo(
    () => getStyles({ colors, isDark, scaled, highContrast }),
    [colors, isDark, scaled, highContrast]
  );

  const content = activeTab === "terminos" ? TERMINOS_CONDICIONES : AVISO_PRIVACIDAD;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.surface} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Documentos Legales</Text>
        <View style={styles.backBtn} />
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <Pressable
          style={({ pressed }) => [
            styles.tab,
            activeTab === "terminos" && styles.tabActive,
            pressed && { opacity: 0.6 },
          ]}
          onPress={() => setActiveTab("terminos")}
        >
          <Text style={[styles.tabText, activeTab === "terminos" && styles.tabTextActive]}>
            Términos y Condiciones
          </Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.tab,
            activeTab === "privacidad" && styles.tabActive,
            pressed && { opacity: 0.6 },
          ]}
          onPress={() => setActiveTab("privacidad")}
        >
          <Text style={[styles.tabText, activeTab === "privacidad" && styles.tabTextActive]}>
            Aviso de Privacidad
          </Text>
        </Pressable>
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
      width: 32,
      padding: 4,
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
      paddingVertical: 12,
      alignItems: "center",
      borderBottomWidth: 2,
      borderBottomColor: "transparent",
    },
    tabActive: {
      borderBottomColor: colors.primary,
    },
    tabText: {
      fontSize: scaled(FONT_SIZES.small),
      fontWeight: "600",
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
