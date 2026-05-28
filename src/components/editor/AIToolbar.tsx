import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import type { EditorMode } from "../../hooks/useEditorMode";

export type AIActionType = "sugerir" | "mejorar" | "rubrica" | "revisar";

export interface AIToolbarResult {
  message: string;
}

export interface AIToolbarProps {
  mode?: EditorMode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  onAction?: (action: AIActionType) => Promise<AIToolbarResult | string | void>;
}

interface ActionConfig {
  id: AIActionType;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

const ACTIONS: ActionConfig[] = [
  { id: "sugerir", label: "Sugerir", icon: "auto-awesome" },
  { id: "mejorar", label: "Mejorar", icon: "auto-fix-high" },
  { id: "rubrica", label: "Rubrica", icon: "fact-check" },
  { id: "revisar", label: "Revisar", icon: "rule" },
];

const resolveMessage = (result: AIToolbarResult | string | void, action: AIActionType): string => {
  if (typeof result === "string") return result;
  if (result && typeof result === "object" && typeof result.message === "string") return result.message;
  return `Accion "${action}" lista. La integracion profunda del copiloto se cierra en la Fase 6.`;
};

export const AIToolbar: React.FC<AIToolbarProps> = ({
  mode = "mobile",
  disabled = false,
  style,
  onAction,
}) => {
  const { colors } = useTheme();
  const [loadingAction, setLoadingAction] = useState<AIActionType | null>(null);
  const [resultText, setResultText] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  const compact = mode === "mobile";
  const actions = useMemo(() => ACTIONS, []);

  const handlePress = useCallback(
    async (action: AIActionType) => {
      if (disabled || loadingAction) return;
      setErrorText(null);
      setLoadingAction(action);
      try {
        const result = onAction ? await onAction(action) : undefined;
        setResultText(resolveMessage(result, action));
      } catch (error) {
        setErrorText(error instanceof Error ? error.message : "No fue posible completar la accion.");
      } finally {
        setLoadingAction(null);
      }
    },
    [disabled, loadingAction, onAction]
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surfaceContainerLowest,
          borderColor: colors.borderLight,
        },
        style,
      ]}
    >
      <Text style={[styles.title, { color: colors.onSurface }]}>Copiloto IA</Text>
      <View style={styles.actionsRow}>
        {actions.map((action) => {
          const isLoading = loadingAction === action.id;
          return (
            <Pressable
              key={action.id}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              disabled={disabled || loadingAction !== null}
              onPress={() => {
                void handlePress(action.id);
              }}
              style={({ pressed }) => [
                styles.actionButton,
                compact && styles.actionButtonCompact,
                {
                  backgroundColor: pressed
                    ? colors.surfaceContainerHigh
                    : colors.surfaceContainerLow,
                  borderColor: colors.borderLight,
                  opacity: disabled ? 0.5 : 1,
                },
              ]}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <MaterialIcons name={action.icon} size={18} color={colors.primary} />
              )}
              <Text style={[styles.actionLabel, { color: colors.onSurface }]}>
                {compact ? action.label.slice(0, 3) : action.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {resultText ? (
        <View style={[styles.feedbackBox, { backgroundColor: colors.successTint, borderColor: colors.success }]}>
          <Text style={[styles.feedbackText, { color: colors.textDark }]}>{resultText}</Text>
        </View>
      ) : null}

      {errorText ? (
        <View style={[styles.feedbackBox, { backgroundColor: colors.errorTint, borderColor: colors.error }]}>
          <Text style={[styles.feedbackText, { color: colors.textDark }]}>{errorText}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    gap: 10,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
  },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  actionButton: {
    minHeight: 36,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionButtonCompact: {
    paddingHorizontal: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
  feedbackBox: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  feedbackText: {
    fontSize: 12,
    lineHeight: 17,
  },
});

export default AIToolbar;

