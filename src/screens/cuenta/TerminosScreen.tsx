import React, { useState } from "react";
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { COLORS, FONT_SIZES } from "../../../types";
import { AVISO_PRIVACIDAD, TERMINOS_CONDICIONES } from "../../utils/legalTexts";

type TabKey = "terminos" | "privacidad";

const TerminosScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const initialTab: TabKey = route.params?.tab === "privacidad" ? "privacidad" : "terminos";
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  const content = activeTab === "terminos" ? TERMINOS_CONDICIONES : AVISO_PRIVACIDAD;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
        >
          <MaterialIcons name="arrow-back" size={24} color={COLORS.text} />
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

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backBtn: {
    width: 32,
    padding: 4,
  },
  headerTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: "700",
    color: COLORS.text,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZES.small,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  legalText: {
    fontSize: FONT_SIZES.small,
    lineHeight: 22,
    color: COLORS.text,
  },
});

export default TerminosScreen;
