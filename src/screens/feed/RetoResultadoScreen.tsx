import React from "react";
import { Pressable, View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../context/ThemeContext";

// Sample data for demo results
const SAMPLE_RESULTS = [
  {
    id: "1",
    number: "01",
    text: "¿En qué año inició la Revolución Mexicana?",
    correct: true,
    userAnswer: "1910",
    correctAnswer: "1910",
  },
  {
    id: "2",
    number: "02",
    text: "¿Cuál es el principio fundamental de la perspectiva lineal?",
    correct: false,
    userAnswer: "Uso de colores primarios",
    correctAnswer: "Punto de fuga único",
  },
  {
    id: "3",
    number: "03",
    text: "¿En qué siglo se originó el movimiento del Renacimiento?",
    correct: true,
    userAnswer: "Siglo XIV",
    correctAnswer: "Siglo XIV",
  },
];

interface RetoResultadoScreenProps {
  route?: {
    params?: {
      titulo?: string;
      correctas?: number;
      total?: number;
      tiempo?: number;
    };
  };
  navigation?: {
    goBack: () => void;
    navigate: (screen: string, params?: any) => void;
    popToTop?: () => void;
  };
}

const RetoResultadoScreen: React.FC<RetoResultadoScreenProps> = ({ route, navigation }) => {
  const { colors } = useTheme();
  const params = route?.params;
  const correctas = params?.correctas ?? SAMPLE_RESULTS.filter((r) => r.correct).length;
  const total = params?.total ?? SAMPLE_RESULTS.length;
  const percentage = total > 0 ? Math.round((correctas / total) * 100) : 0;
  const tiempo = params?.tiempo;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const getMessage = () => {
    if (percentage >= 90) return "¡Excelente trabajo!";
    if (percentage >= 70) return "¡Buen desempeño!";
    if (percentage >= 50) return "Puedes mejorar";
    return "Sigue practicando";
  };

  const cardShadow = Platform.select({
    web: { boxShadow: "0px 2px 8px rgba(0,69,128,0.06)" } as any,
    default: {
      shadowColor: "#004580",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: `${colors.background}CC` }]}>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>Resultado</Text>
        <Pressable
          style={({ pressed }) => [
            styles.closeBtn,
            { backgroundColor: "transparent" },
            pressed && { opacity: 0.6 },
          ]}
          onPress={() => navigation?.goBack()}
        >
          <MaterialIcons name="close" size={24} color={colors.onSurface} />
        </Pressable>
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {/* Score card */}
        <View
          style={[styles.scoreCard, { backgroundColor: colors.surfaceContainerLowest }, cardShadow]}
        >
          {/* Circular progress */}
          <View style={styles.progressCircleWrap}>
            <View style={[styles.progressCircle, { borderColor: colors.surfaceContainerLow }]}>
              <View style={[styles.progressCircleOverlay, { borderColor: "#1b6d24" }]} />
              <Text style={styles.trophyEmoji}>🏆</Text>
            </View>
          </View>

          <Text style={[styles.scoreText, { color: "#004580" }]}>
            {correctas}/{total}
          </Text>
          <Text style={[styles.percentText, { color: "#1b6d24" }]}>{percentage}% correcto</Text>

          <View style={[styles.messageDivider, { borderTopColor: `${colors.outlineVariant}20` }]}>
            <Text style={[styles.messageText, { color: colors.onSurface }]}>{getMessage()}</Text>
            {tiempo != null && (
              <View style={styles.timeRow}>
                <MaterialIcons name="schedule" size={14} color={colors.onSurfaceVariant} />
                <Text style={[styles.timeText, { color: colors.onSurfaceVariant }]}>
                  {formatTime(tiempo)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Analysis section */}
        <View style={styles.analysisSection}>
          <Text style={[styles.analysisTitle, { color: `${colors.primary}60` }]}>
            Análisis de Desempeño
          </Text>

          {SAMPLE_RESULTS.map((item) => (
            <View
              key={item.id}
              style={[
                styles.analysisItem,
                {
                  backgroundColor: item.correct ? "rgba(27,109,36,0.05)" : "rgba(186,26,26,0.05)",
                  borderLeftColor: item.correct ? "#1b6d24" : "#ba1a1a",
                },
              ]}
            >
              <View style={styles.analysisContent}>
                <View style={styles.analysisLeft}>
                  <Text style={[styles.qLabel, { color: item.correct ? "#1b6d24" : "#ba1a1a" }]}>
                    Pregunta {item.number}
                  </Text>
                  <Text style={[styles.qText, { color: colors.onSurface }]}>{item.text}</Text>

                  {item.correct ? (
                    <View style={styles.answerRow}>
                      <MaterialIcons name="check-circle" size={18} color="#1b6d24" />
                      <Text style={[styles.answerText, { color: "#1b6d24" }]}>
                        {item.userAnswer}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.answerColumn}>
                      <View style={styles.answerRow}>
                        <MaterialIcons name="cancel" size={18} color="#ba1a1a" />
                        <Text style={[styles.wrongText, { color: "#ba1a1a" }]}>
                          {item.userAnswer}
                        </Text>
                      </View>
                      <View style={[styles.correctRow, { borderColor: "rgba(27,109,36,0.2)" }]}>
                        <MaterialIcons name="task-alt" size={14} color="#1b6d24" />
                        <Text style={[styles.correctText, { color: "#1b6d24" }]}>
                          {item.correctAnswer}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
                <MaterialIcons name="expand-more" size={20} color={colors.outlineVariant} />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: `${colors.background}E6` }]}>
        <LinearGradient
          colors={["#004580", "#005da8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.footerPrimaryBtn}
        >
          <Pressable
            style={({ pressed }) => [styles.footerBtnInner, pressed && { opacity: 0.9 }]}
            onPress={() => navigation?.goBack()}
          >
            <Text style={styles.footerPrimaryText}>Volver al feed</Text>
          </Pressable>
        </LinearGradient>

        <Pressable
          style={({ pressed }) => [
            styles.footerSecondaryBtn,
            {
              backgroundColor: colors.surfaceContainerLowest,
              borderColor: `${colors.primary}10`,
              borderWidth: 2,
            },
            pressed && { opacity: 0.6 },
          ]}
          onPress={() => {
            /* stub */
          }}
        >
          <Text style={[styles.footerSecondaryText, { color: colors.primary }]}>
            Guardar en biblioteca
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.footerTextBtn, pressed && { opacity: 0.6 }]}
          onPress={() => {
            /* stub */
          }}
        >
          <MaterialIcons name="share" size={20} color={`${colors.primary}70`} />
          <Text style={[styles.footerTextBtnLabel, { color: `${colors.primary}70` }]}>
            Compartir
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: "800", letterSpacing: -0.5 },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 220 },

  // Score card
  scoreCard: {
    borderRadius: 32,
    padding: 32,
    alignItems: "center",
    marginBottom: 32,
  },
  progressCircleWrap: { marginBottom: 24, position: "relative" },
  progressCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 8,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  progressCircleOverlay: {
    position: "absolute",
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 64,
    borderWidth: 8,
    borderColor: "#1b6d24",
  },
  trophyEmoji: { fontSize: 36 },
  scoreText: { fontSize: 48, fontWeight: "800", letterSpacing: -1 },
  percentText: { fontSize: 18, fontWeight: "700", marginBottom: 16 },
  messageDivider: {
    width: "100%",
    borderTopWidth: 1,
    paddingTop: 16,
    alignItems: "center",
    gap: 8,
  },
  messageText: { fontSize: 24, fontWeight: "700", letterSpacing: -0.3 },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    opacity: 0.7,
  },
  timeText: { fontSize: 14, fontWeight: "600" },

  // Analysis
  analysisSection: { gap: 16 },
  analysisTitle: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  analysisItem: {
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
  },
  analysisContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
  },
  analysisLeft: { flex: 1, gap: 8 },
  qLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  qText: { fontWeight: "600", fontSize: 14, lineHeight: 20 },
  answerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  answerText: { fontSize: 14, fontWeight: "700" },
  answerColumn: { gap: 8 },
  wrongText: { fontSize: 14, fontWeight: "500" },
  correctRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFF",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  correctText: { fontSize: 14, fontWeight: "700" },

  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    gap: 12,
  },
  footerPrimaryBtn: { borderRadius: 12 },
  footerBtnInner: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  footerPrimaryText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
  footerSecondaryBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  footerSecondaryText: { fontWeight: "700", fontSize: 15 },
  footerTextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  footerTextBtnLabel: { fontWeight: "700", fontSize: 15 },
});

export default RetoResultadoScreen;
