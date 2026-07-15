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
import { useTheme } from "../../hooks/useTheme";
import type { EditorMode } from "../../hooks/useEditorMode";

export type AIActionType = "sugerir" | "mejorar" | "autocompletar" | "rubrica" | "revisar";

export interface AIToolbarResult {
  message: string;
  title?: string;
  detail?: string;
  warning?: string;
  insertLabel?: string;
  payload?: unknown;
}

export interface AIToolbarProps {
  mode?: EditorMode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  iaStatusText?: string;
  onAction?: (action: AIActionType) => Promise<AIToolbarResult | string | void>;
  onInsertResult?: (result: AIToolbarResult, action: AIActionType) => Promise<void> | void;
}

interface ActionConfig {
  id: AIActionType;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

const ACTIONS: ActionConfig[] = [
  { id: "sugerir", label: "Sugerir", icon: "auto-awesome" },
  { id: "mejorar", label: "Mejorar", icon: "auto-fix-high" },
  { id: "autocompletar", label: "Completar", icon: "edit-note" },
  { id: "rubrica", label: "Rubrica", icon: "fact-check" },
  { id: "revisar", label: "Revisar", icon: "rule" },
];

const resolveResult = (result: AIToolbarResult | string | void, action: AIActionType): AIToolbarResult => {
  if (typeof result === "string") {
    return { message: result };
  }
  if (result && typeof result === "object" && typeof result.message === "string") {
    return result;
  }
  return {
    message: `Accion "${action}" completada.`,
    detail: "Revisa la sugerencia antes de insertarla en el documento.",
  };
};

export const AIToolbar: React.FC<AIToolbarProps> = ({
  mode = "mobile",
  disabled = false,
  style,
  iaStatusText,
  onAction,
  onInsertResult,
}) => {
  const { colors } = useTheme();
  const [loadingAction, setLoadingAction] = useState<AIActionType | null>(null);
  const [lastAction, setLastAction] = useState<AIActionType | null>(null);
  const [lastResult, setLastResult] = useState<AIToolbarResult | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  const compact = mode === "mobile";
  const actions = useMemo(() => ACTIONS, []);

  const handlePress = useCallback(
    async (action: AIActionType) => {
      if (disabled || loadingAction) return;
      setErrorText(null);
      setLastResult(null);
      setLoadingAction(action);
      try {
        const result = onAction ? await onAction(action) : undefined;
        setLastAction(action);
        setLastResult(resolveResult(result, action));
      } catch (error) {
        setErrorText(error instanceof Error ? error.message : "No fue posible completar la accion.");
      } finally {
        setLoadingAction(null);
      }
    },
    [disabled, loadingAction, onAction]
  );

  const handleInsert = useCallback(async () => {
    if (!lastResult || !lastAction || !onInsertResult) return;
    setErrorText(null);
    try {
      await onInsertResult(lastResult, lastAction);
      setLastResult({
        message: "Sugerencia insertada en el documento.",
        detail: "Puedes ajustar el texto manualmente si lo necesitas.",
      });
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "No fue posible insertar la sugerencia.");
    }
  }, [lastAction, lastResult, onInsertResult]);

  const handleRegenerate = useCallback(() => {
    if (!lastAction) return;
    void handlePress(lastAction);
  }, [handlePress, lastAction]);

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
      {iaStatusText ? (
        <View style={[styles.statusChip, { borderColor: colors.borderLight, backgroundColor: colors.surfaceContainerLow }]}>
          <MaterialIcons name="info-outline" size={14} color={colors.onSurfaceVariant} />
          <Text style={[styles.statusChipText, { color: colors.onSurfaceVariant }]}>{iaStatusText}</Text>
        </View>
      ) : null}
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

      {lastResult ? (
        <View style={[styles.feedbackBox, { backgroundColor: colors.successTint, borderColor: colors.success }]}>
          {lastResult.title ? (
            <Text style={[styles.feedbackTitle, { color: colors.textDark }]}>{lastResult.title}</Text>
          ) : null}
          <Text style={[styles.feedbackText, { color: colors.textDark }]}>{lastResult.message}</Text>
          {lastResult.detail ? (
            <Text style={[styles.feedbackDetail, { color: colors.textSecondary }]}>{lastResult.detail}</Text>
          ) : null}
          {lastResult.warning ? (
            <View style={[styles.warningBox, { backgroundColor: colors.warningTint }]}>
              <MaterialIcons name="warning-amber" size={14} color={colors.warning} />
              <Text style={[styles.warningText, { color: colors.warning }]}>{lastResult.warning}</Text>
            </View>
          ) : null}
          <View style={styles.feedbackActions}>
            {onInsertResult && lastResult.payload !== undefined ? (
              <Pressable
                style={[styles.feedbackButton, { backgroundColor: colors.primary }]}
                onPress={() => {
                  void handleInsert();
                }}
              >
                <Text style={[styles.feedbackButtonText, { color: colors.surface }]}>
                  {lastResult.insertLabel || "Insertar"}
                </Text>
              </Pressable>
            ) : null}
            <Pressable
              style={[styles.feedbackButton, styles.feedbackButtonGhost, { borderColor: colors.borderLight }]}
              onPress={handleRegenerate}
              disabled={!lastAction || loadingAction !== null}
            >
              <Text style={[styles.feedbackButtonText, { color: colors.onSurfaceVariant }]}>Regenerar</Text>
            </Pressable>
            <Pressable
              style={[styles.feedbackButton, styles.feedbackButtonGhost, { borderColor: colors.borderLight }]}
              onPress={() => setLastResult(null)}
            >
              <Text style={[styles.feedbackButtonText, { color: colors.onSurfaceVariant }]}>Descartar</Text>
            </Pressable>
          </View>
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
  statusChip: {
    minHeight: 30,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusChipText: {
    fontSize: 11,
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
  feedbackTitle: {
    fontSize: 13,
    fontWeight: "800",
  },
  feedbackDetail: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
  },
  warningBox: {
    marginTop: 8,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  warningText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
  },
  feedbackActions: {
    marginTop: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  feedbackButton: {
    minHeight: 32,
    borderRadius: 999,
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  feedbackButtonGhost: {
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  feedbackButtonText: {
    fontSize: 12,
    fontWeight: "800",
  },
});

export default AIToolbar;
