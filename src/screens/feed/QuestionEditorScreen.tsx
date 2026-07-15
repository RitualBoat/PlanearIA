import React, { useState, useCallback } from "react";
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTheme } from "../../hooks/useTheme";

type QuestionType = "multiple" | "true_false" | "short_answer";

interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options: QuestionOption[];
  explanation: string;
  points: number;
}

interface QuestionEditorScreenProps {
  route?: {
    params?: {
      questions?: Question[];
      retoTitle?: string;
      maxQuestions?: number;
    };
  };
  navigation?: {
    goBack: () => void;
    navigate: (screen: string, params?: any) => void;
  };
}

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

const DEFAULT_QUESTION: () => Question = () => ({
  id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  type: "multiple",
  text: "",
  options: [
    { id: "a", text: "", isCorrect: false },
    { id: "b", text: "", isCorrect: false },
    { id: "c", text: "", isCorrect: false },
    { id: "d", text: "", isCorrect: false },
  ],
  explanation: "",
  points: 1,
});

const QuestionEditorScreen: React.FC<QuestionEditorScreenProps> = ({ route, navigation }) => {
  const { colors } = useTheme();
  const params = route?.params;
  const maxQuestions = params?.maxQuestions || 10;
  const retoTitle = params?.retoTitle || "Examen";

  const [questions, setQuestions] = useState<Question[]>(
    params?.questions?.length ? params.questions : []
  );

  const handleAddQuestion = useCallback(() => {
    setQuestions((prev) => [...prev, DEFAULT_QUESTION()]);
  }, []);

  const handleDeleteQuestion = useCallback((qId: string) => {
    Alert.alert("Eliminar pregunta", "¿Estás seguro de que deseas eliminar esta pregunta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => setQuestions((prev) => prev.filter((q) => q.id !== qId)),
      },
    ]);
  }, []);

  const handleDuplicateQuestion = useCallback((qId: string) => {
    setQuestions((prev) => {
      const idx = prev.findIndex((q) => q.id === qId);
      if (idx === -1) return prev;
      const dup: Question = {
        ...prev[idx],
        id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        options: prev[idx].options.map((o) => ({ ...o })),
      };
      const next = [...prev];
      next.splice(idx + 1, 0, dup);
      return next;
    });
  }, []);

  const updateQuestion = useCallback((qId: string, updates: Partial<Question>) => {
    setQuestions((prev) => prev.map((q) => (q.id === qId ? { ...q, ...updates } : q)));
  }, []);

  const updateOption = useCallback(
    (qId: string, optId: string, updates: Partial<QuestionOption>) => {
      setQuestions((prev) =>
        prev.map((q) => {
          if (q.id !== qId) return q;
          return {
            ...q,
            options: q.options.map((o) => (o.id === optId ? { ...o, ...updates } : o)),
          };
        })
      );
    },
    []
  );

  const setCorrectOption = useCallback((qId: string, optId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        return {
          ...q,
          options: q.options.map((o) => ({ ...o, isCorrect: o.id === optId })),
        };
      })
    );
  }, []);

  const handleDone = useCallback(() => {
    navigation?.goBack();
  }, [navigation]);

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

  // Empty state
  if (questions.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation?.goBack()}
            style={({ pressed }) => [styles.headerIconBtn, pressed && { opacity: 0.6 }]}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.onSurfaceVariant} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: "#004580" }]}>
              Preguntas (0/{maxQuestions})
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.onSurfaceVariant }]}>
              {retoTitle}
            </Text>
          </View>
          <Pressable
            onPress={handleDone}
            style={({ pressed }) => [styles.headerDoneBtn, pressed && { opacity: 0.6 }]}
          >
            <Text style={[styles.headerDoneText, { color: "#004580" }]}>Listo</Text>
          </Pressable>
        </View>

        <View style={styles.emptyContainer}>
          {/* Decorative illustration */}
          <View style={styles.emptyIllustration}>
            <View
              style={[styles.emptyNotebookOuter, { backgroundColor: colors.surfaceContainerLow }]}
            >
              <View
                style={[
                  styles.emptyNotebookInner,
                  { backgroundColor: colors.surfaceContainerLowest },
                ]}
              >
                {[1, 0.75, 1, 0.85].map((w, i) => (
                  <View
                    key={i}
                    style={{
                      height: 4,
                      width: `${w * 100}%`,
                      backgroundColor: `${colors.outlineVariant}30`,
                      borderRadius: 2,
                    }}
                  />
                ))}
                <View style={{ marginTop: "auto", alignItems: "center" }}>
                  <MaterialIcons name="edit-note" size={48} color={`${colors.outlineVariant}50`} />
                </View>
              </View>
            </View>
            <View style={styles.emptySparkle}>
              <MaterialIcons name="auto-awesome" size={48} color={`${colors.primary}20`} />
            </View>
          </View>

          <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>
            Aún no has añadido preguntas
          </Text>
          <Text style={[styles.emptyDesc, { color: colors.onSurfaceVariant }]}>
            Toca el botón de abajo para crear tu primera pregunta y comenzar a diseñar este desafío
            académico.
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.emptyBtn,
              { backgroundColor: "#004580" },
              pressed && { opacity: 0.6 },
            ]}
            onPress={handleAddQuestion}
          >
            <MaterialIcons name="add" size={22} color="#FFF" />
            <Text style={styles.emptyBtnText}>Crear primera pregunta</Text>
          </Pressable>

          <View style={styles.emptyHelp}>
            <MaterialIcons name="help-outline" size={14} color={`${colors.onSurfaceVariant}60`} />
            <Text style={{ fontSize: 13, color: `${colors.onSurfaceVariant}60` }}>
              ¿Necesitas ayuda con los formatos de pregunta?
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation?.goBack()}
          style={({ pressed }) => [styles.headerIconBtn, pressed && { opacity: 0.6 }]}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.onSurfaceVariant} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: "#004580" }]}>
            Preguntas ({questions.length}/{maxQuestions})
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.onSurfaceVariant }]}>
            {retoTitle}
          </Text>
        </View>
        <Pressable
          onPress={handleDone}
          style={({ pressed }) => [styles.headerDoneBtn, pressed && { opacity: 0.6 }]}
        >
          <Text style={[styles.headerDoneText, { color: "#004580" }]}>Listo</Text>
        </Pressable>
      </View>

      {/* Question list */}
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {questions.map((q, idx) => (
          <View
            key={q.id}
            style={[
              styles.questionCard,
              { backgroundColor: colors.surfaceContainerLowest },
              cardShadow,
            ]}
          >
            {/* Question header */}
            <View style={styles.qHeader}>
              <View style={[styles.qBadge, { backgroundColor: colors.surfaceContainerLow }]}>
                <Text style={[styles.qBadgeText, { color: "#004580" }]}>
                  Pregunta {idx + 1} •{" "}
                  {q.type === "multiple"
                    ? "Opción Múltiple"
                    : q.type === "true_false"
                      ? "Verdadero/Falso"
                      : "Respuesta Corta"}
                </Text>
              </View>
              <View style={styles.qActions}>
                <MaterialIcons name="drag-indicator" size={18} color={colors.outlineVariant} />
                <Pressable
                  style={({ pressed }) => pressed && { opacity: 0.6 }}
                  onPress={() => handleDuplicateQuestion(q.id)}
                >
                  <MaterialIcons name="content-copy" size={18} color={colors.outlineVariant} />
                </Pressable>
                <Pressable
                  style={({ pressed }) => pressed && { opacity: 0.6 }}
                  onPress={() => handleDeleteQuestion(q.id)}
                >
                  <MaterialIcons name="delete" size={18} color="#ba1a1a" />
                </Pressable>
              </View>
            </View>

            {/* Question text */}
            <TextInput
              style={[styles.qTextInput, { color: colors.onSurface }]}
              placeholder="Escribe la pregunta..."
              placeholderTextColor={colors.onSurfaceVariant}
              value={q.text}
              onChangeText={(t) => updateQuestion(q.id, { text: t })}
              multiline
              maxLength={500}
            />

            {/* Options */}
            {q.type === "multiple" && (
              <View style={styles.optionsList}>
                {q.options.map((opt, oi) => {
                  const isCorrect = opt.isCorrect;
                  return (
                    <Pressable
                      key={opt.id}
                      style={({ pressed }) => [
                        styles.optionRow,
                        {
                          backgroundColor: isCorrect
                            ? `${colors.secondaryContainer}30`
                            : colors.surfaceContainerLow,
                          borderWidth: isCorrect ? 2 : 0,
                          borderColor: isCorrect ? "#1b6d24" : "transparent",
                        },
                        pressed && { opacity: 0.6 },
                      ]}
                      onPress={() => setCorrectOption(q.id, opt.id)}
                    >
                      <View
                        style={[
                          styles.optionCircle,
                          {
                            backgroundColor: isCorrect ? "#1b6d24" : colors.surfaceContainerHigh,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionLetter,
                            { color: isCorrect ? "#FFF" : colors.onSurfaceVariant },
                          ]}
                        >
                          {OPTION_LETTERS[oi]}
                        </Text>
                      </View>
                      <TextInput
                        style={[styles.optionInput, { color: colors.onSurface, flex: 1 }]}
                        placeholder={`Opción ${OPTION_LETTERS[oi]}`}
                        placeholderTextColor={colors.onSurfaceVariant}
                        value={opt.text}
                        onChangeText={(t) => updateOption(q.id, opt.id, { text: t })}
                      />
                      {isCorrect && <MaterialIcons name="check-circle" size={20} color="#1b6d24" />}
                    </Pressable>
                  );
                })}
              </View>
            )}

            {q.type === "true_false" && (
              <View style={styles.tfRow}>
                {["Verdadero", "Falso"].map((label, ti) => {
                  const optId = q.options[ti]?.id;
                  const isCorrect = q.options[ti]?.isCorrect;
                  return (
                    <Pressable
                      key={label}
                      style={({ pressed }) => [
                        styles.tfOption,
                        {
                          backgroundColor: isCorrect
                            ? `${colors.secondaryContainer}30`
                            : colors.surfaceContainerLow,
                          borderWidth: isCorrect ? 2 : 0,
                          borderColor: isCorrect ? "#1b6d24" : "transparent",
                        },
                        pressed && { opacity: 0.6 },
                      ]}
                      onPress={() => optId && setCorrectOption(q.id, optId)}
                    >
                      <MaterialIcons
                        name={isCorrect ? "check-circle" : "cancel"}
                        size={20}
                        color={isCorrect ? "#1b6d24" : colors.outlineVariant}
                      />
                      <Text
                        style={{
                          fontWeight: "700",
                          fontSize: 12,
                          letterSpacing: 0.5,
                          textTransform: "uppercase",
                          color: colors.onSurface,
                        }}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {/* Explanation */}
            {q.explanation !== undefined && (
              <View
                style={[styles.explanationWrap, { borderTopColor: `${colors.outlineVariant}20` }]}
              >
                <Text style={{ fontSize: 12, color: colors.onSurfaceVariant, fontStyle: "italic" }}>
                  <Text style={{ fontWeight: "700", color: colors.primary, fontStyle: "normal" }}>
                    Explicación:{" "}
                  </Text>
                  {q.explanation || ""}
                </Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* FAB */}
      <View style={styles.fabContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.fab,
            { backgroundColor: "#004580" },
            pressed && { opacity: 0.6 },
          ]}
          onPress={handleAddQuestion}
        >
          <MaterialIcons name="add" size={24} color="#FFF" />
          <Text style={styles.fabText}>Añadir pregunta</Text>
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
  headerIconBtn: { padding: 8, borderRadius: 20 },
  headerCenter: { alignItems: "center" },
  headerTitle: { fontWeight: "700", fontSize: 20, letterSpacing: -0.3 },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  headerDoneBtn: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  headerDoneText: { fontWeight: "700", fontSize: 15 },

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyIllustration: { position: "relative", marginBottom: 48 },
  emptyNotebookOuter: {
    width: 256,
    height: 256,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "3deg" }],
  },
  emptyNotebookInner: {
    width: 192,
    height: 224,
    borderRadius: 12,
    padding: 24,
    gap: 16,
    transform: [{ rotate: "-6deg" }, { translateX: 8 }, { translateY: 8 }],
  },
  emptySparkle: { position: "absolute", top: -16, right: -16 },
  emptyTitle: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  emptyDesc: { fontSize: 16, textAlign: "center", lineHeight: 24, maxWidth: 320, marginBottom: 40 },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  emptyBtnText: { color: "#FFF", fontWeight: "700", fontSize: 17 },
  emptyHelp: { flexDirection: "row", alignItems: "center", gap: 8 },

  // Question list
  scrollArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 120, gap: 24 },
  questionCard: { borderRadius: 16, padding: 20 },
  qHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  qBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999 },
  qBadgeText: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.5 },
  qActions: { flexDirection: "row", gap: 8, alignItems: "center" },
  qTextInput: { fontWeight: "700", fontSize: 18, lineHeight: 26, marginBottom: 16 },
  optionsList: { gap: 12 },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  optionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  optionLetter: { fontSize: 10, fontWeight: "700" },
  optionInput: { fontSize: 14, fontWeight: "500" },
  tfRow: { flexDirection: "row", gap: 16 },
  tfOption: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 4,
  },
  explanationWrap: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  fabContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: "center",
  },
  fab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 9999,
  },
  fabText: { color: "#FFF", fontWeight: "800", fontSize: 15, letterSpacing: -0.3 },
});

export default QuestionEditorScreen;
