import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AnimatedTopPill from "../../components/AnimatedTopPill";
import { COLORS } from "../../../types";

const SocialScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        <AnimatedTopPill
          title="Social"
          subtitle="Conecta y colabora con otros docentes"
          icon="people"
        />
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Próximamente</Text>
          <Text style={styles.placeholderSub}>
            La pestaña social se implementará en el Sprint 5
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, padding: 16, gap: 20 },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  placeholderSub: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
  },
});

export default SocialScreen;
