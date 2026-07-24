import React, { useState, useCallback, useEffect, useRef } from "react";
import { Pressable, View, Text, StyleSheet, ScrollView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../context/ThemeContext";

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

// Sample questions for demo (in real app, these come from the challenge data)
const SAMPLE_QUESTIONS = [
  {
    id: "1",
    text: "¿En qué año inició la Revolución Mexicana?",
    category: "Historia de México",
    options: [
      { id: "a", text: "1910", isCorrect: true },
      { id: "b", text: "1917", isCorrect: false },
      { id: "c", text: "1810", isCorrect: false },
      { id: "d", text: "1920", isCorrect: false },
    ],
  },
  {
    id: "2",
    text: "Venustiano Carranza promulgó la Constitución de 1917.",
    category: "Constitución",
    options: [
      { id: "a", text: "Verdadero", isCorrect: true },
      { id: "b", text: "Falso", isCorrect: false },
    ],
  },
  {
    id: "3",
    text: "¿Cuál de los siguientes personajes fue líder del Ejército Libertador del Sur?",
    category: "Personajes Históricos",
    options: [
      { id: "a", text: "Francisco Villa", isCorrect: false },
      { id: "b", text: "Emiliano Zapata", isCorrect: true },
      { id: "c", text: "Álvaro Obregón", isCorrect: false },
      { id: "d", text: "Porfirio Díaz", isCorrect: false },
    ],
  },
];

interface RetoResolucionScreenProps {
  route?: {
    params?: {
      titulo?: string;
      descripcion?: string;
      tiempoLimite?: number;
      preguntas?: number;
    };
  };
  navigation?: {
    goBack: () => void;
    navigate: (screen: string, params?: any) => void;
  };
}

const RetoResolucionScreen: React.FC<RetoResolucionScreenProps> = ({ route, navigation }) => {
  const { colors } = useTheme();
  const params = route?.params;
  const titulo = params?.titulo || "Resolver Reto";
  const totalQuestions = SAMPLE_QUESTIONS.length;
  const tiempoLimite = params?.tiempoLimite;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(tiempoLimite ? tiempoLimite * 60 : 0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer: the updater stays pure and only computes the next value. Stopping the
  // interval at zero is a side effect, handled by the separate effect below.
  useEffect(() => {
    if (!tiempoLimite) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [tiempoLimite]);

  // Stop the countdown once it reaches zero, outside the state updater.
  useEffect(() => {
    if (timeLeft === 0 && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const question = SAMPLE_QUESTIONS[currentIndex];
  const progress = ((currentIndex + 1) / totalQuestions) * 100;
  const answeredCount = Object.keys(answers).length;
  const selectedOption = question ? answers[question.id] : undefined;

  const handleSelectOption = useCallback(
    (optId: string) => {
      if (!question) return;
      setAnswers((prev) => ({ ...prev, [question.id]: optId }));
    },
    [question]
  );

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Submit
      Alert.alert(
        "Enviar respuestas",
        `Has contestado ${answeredCount} de ${totalQuestions} preguntas. ¿Deseas enviar tus respuestas?`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Enviar",
            onPress: () => {
              navigation?.navigate("RetoResultado", {
                titulo,
                correctas: answeredCount,
                total: totalQuestions,
                tiempo: tiempoLimite ? tiempoLimite * 60 - timeLeft : undefined,
              });
            },
          },
        ]
      );
    }
  }, [currentIndex, totalQuestions, answeredCount, navigation, titulo, tiempoLimite, timeLeft]);

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
      <View style={[styles.header, { backgroundColor: `${colors.surfaceContainerLow}F2` }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <MaterialIcons name="auto-stories" size={20} color={colors.primary} />
            <Text style={[styles.headerTitle, { color: colors.primary }]} numberOfLines={1}>
              {titulo}
            </Text>
          </View>
          {tiempoLimite ? (
            <View style={[styles.timerBadge, { borderColor: "rgba(246,155,99,0.2)" }]}>
              <Text style={[styles.timerText, { color: "#f69b63" }]}>
                ⏱️ {formatTime(timeLeft)}
              </Text>
            </View>
          ) : null}
        </View>
        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressLabels}>
            <Text style={[styles.progressLabel, { color: colors.onSurfaceVariant }]}>
              Pregunta {currentIndex + 1} de {totalQuestions}
            </Text>
            <Text style={[styles.progressPercent, { color: "#1b6d24" }]}>
              {Math.round(progress)}% completado
            </Text>
          </View>
          <View style={[styles.progressBarBg, { backgroundColor: colors.surfaceContainerHighest }]}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progress}%`, backgroundColor: "#1b6d24" },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Question content */}
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {question && (
          <View
            style={[
              styles.questionCard,
              { backgroundColor: colors.surfaceContainerLowest },
              cardShadow,
            ]}
          >
            <View style={[styles.categoryBadge, { backgroundColor: "#d4e3ff" }]}>
              <Text style={[styles.categoryText, { color: "#064883" }]}>{question.category}</Text>
            </View>
            <Text style={[styles.questionText, { color: colors.onSurface }]}>{question.text}</Text>
            <View style={styles.optionsList}>
              {question.options.map((opt, oi) => {
                const isSelected = selectedOption === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    style={({ pressed }) => [
                      styles.optionBtn,
                      {
                        backgroundColor: isSelected
                          ? `${colors.primary}08`
                          : colors.surfaceContainerLowest,
                        borderWidth: isSelected ? 2 : 1,
                        borderColor: isSelected ? colors.primary : colors.outlineVariant,
                      },
                      pressed && { opacity: 0.8 },
                    ]}
                    onPress={() => handleSelectOption(opt.id)}
                  >
                    <View
                      style={[
                        styles.optionCircle,
                        {
                          backgroundColor: isSelected ? colors.primary : "transparent",
                          borderWidth: 2,
                          borderColor: isSelected ? colors.primary : colors.outlineVariant,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionLetter,
                          { color: isSelected ? "#FFF" : colors.outlineVariant },
                        ]}
                      >
                        {OPTION_LETTERS[oi]}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: isSelected ? colors.primary : colors.onSurfaceVariant,
                          fontWeight: isSelected ? "700" : "500",
                        },
                      ]}
                    >
                      {opt.text}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: `${colors.surfaceContainerLowest}CC`,
            borderTopColor: `${colors.outlineVariant}10`,
          },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.prevBtn,
            { backgroundColor: colors.surfaceContainerHigh },
            pressed && { opacity: 0.6 },
          ]}
          onPress={handlePrev}
          disabled={currentIndex === 0}
        >
          <MaterialIcons
            name="arrow-back"
            size={16}
            color={currentIndex === 0 ? colors.onSurfaceVariant : colors.onSurface}
          />
          <Text
            style={[
              styles.prevBtnText,
              { color: currentIndex === 0 ? colors.onSurfaceVariant : colors.onSurface },
            ]}
          >
            Anterior
          </Text>
        </Pressable>

        <LinearGradient
          colors={["#004580", "#005da8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.nextBtnGradient}
        >
          <Pressable
            style={({ pressed }) => [styles.nextBtn, pressed && { opacity: 0.9 }]}
            onPress={handleNext}
          >
            <Text style={styles.nextBtnText}>
              {currentIndex === totalQuestions - 1 ? "Enviar" : "Siguiente"}
            </Text>
            <MaterialIcons name="arrow-forward" size={16} color="#FFF" />
          </Pressable>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 4 },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: "800", letterSpacing: -0.5 },
  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    backgroundColor: "rgba(246,155,99,0.1)",
  },
  timerText: { fontSize: 14, fontWeight: "700", letterSpacing: -0.3 },
  progressSection: { paddingHorizontal: 20, paddingBottom: 16 },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  progressPercent: { fontSize: 10, fontWeight: "700" },
  progressBarBg: { height: 4, borderRadius: 9999, overflow: "hidden" },
  progressBarFill: { height: "100%", borderRadius: 9999 },
  scrollArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 100, gap: 24 },
  questionCard: { borderRadius: 16, padding: 24 },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 16,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 26,
    marginBottom: 24,
  },
  optionsList: { gap: 12 },
  optionBtn: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    padding: 16,
    borderRadius: 12,
  },
  optionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  optionLetter: { fontSize: 10, fontWeight: "700" },
  optionText: { fontSize: 14, lineHeight: 20, flex: 1 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  prevBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  prevBtnText: { fontWeight: "700", fontSize: 14 },
  nextBtnGradient: { flex: 2, borderRadius: 12 },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  nextBtnText: { color: "#FFF", fontWeight: "700", fontSize: 14 },
});

export default RetoResolucionScreen;
