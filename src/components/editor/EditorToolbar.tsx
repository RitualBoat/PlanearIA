import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useBridgeState, type EditorBridge } from "@10play/tentap-editor";
import { useTheme } from "../../context/ThemeContext";
import type { EditorMode } from "../../hooks/useEditorMode";
import type { InsertTablePayload } from "./bridges/TableBridge";

type EditorWithCommands = EditorBridge & {
  toggleBold?: () => void;
  toggleItalic?: () => void;
  toggleBulletList?: () => void;
  toggleOrderedList?: () => void;
  toggleHeading?: (level: 1 | 2 | 3 | 4 | 5 | 6) => void;
  toggleTaskList?: () => void;
  insertTable?: (payload?: InsertTablePayload) => void;
};

interface EditorStateShape {
  isBoldActive?: boolean;
  canToggleBold?: boolean;
  isItalicActive?: boolean;
  canToggleItalic?: boolean;
  isBulletListActive?: boolean;
  canToggleBulletList?: boolean;
  isOrderedListActive?: boolean;
  canToggleOrderedList?: boolean;
  headingLevel?: number;
  canToggleHeading?: boolean;
  isTaskListActive?: boolean;
  canToggleTaskList?: boolean;
  isTableActive?: boolean;
  canInsertTable?: boolean;
}

export interface EditorToolbarProps {
  editor: EditorBridge | null;
  mode?: EditorMode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

interface ToolbarButtonProps {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  isActive?: boolean;
  disabled?: boolean;
  compact?: boolean;
  onPress: () => void;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  label,
  icon,
  isActive = false,
  disabled = false,
  compact = false,
  onPress,
}) => {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        compact && styles.buttonCompact,
        {
          backgroundColor: isActive
            ? colors.primary
            : pressed
              ? colors.surfaceContainerHigh
              : colors.surfaceContainerLow,
          borderColor: isActive ? colors.primary : colors.borderLight,
          opacity: disabled ? 0.45 : 1,
        },
      ]}
    >
      <MaterialIcons
        name={icon}
        size={compact ? 17 : 19}
        color={isActive ? colors.surface : colors.onSurfaceVariant}
      />
      {!compact && (
        <Text
          style={[
            styles.buttonLabel,
            {
              color: isActive ? colors.surface : colors.onSurfaceVariant,
            },
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
};

const EditorToolbarContent: React.FC<Omit<EditorToolbarProps, "editor"> & { editor: EditorBridge }> = ({
  editor,
  mode = "mobile",
  disabled = false,
  style,
}) => {
  const { colors } = useTheme();
  const bridgeState = useBridgeState(editor) as EditorStateShape;
  const compact = mode === "mobile";
  const editorApi = editor as EditorWithCommands;

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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <ToolbarButton
          label="Negrita"
          icon="format-bold"
          compact={compact}
          isActive={bridgeState.isBoldActive}
          disabled={disabled || bridgeState.canToggleBold === false || typeof editorApi.toggleBold !== "function"}
          onPress={() => editorApi.toggleBold?.()}
        />
        <ToolbarButton
          label="Cursiva"
          icon="format-italic"
          compact={compact}
          isActive={bridgeState.isItalicActive}
          disabled={
            disabled || bridgeState.canToggleItalic === false || typeof editorApi.toggleItalic !== "function"
          }
          onPress={() => editorApi.toggleItalic?.()}
        />
        <ToolbarButton
          label="Lista"
          icon="format-list-bulleted"
          compact={compact}
          isActive={bridgeState.isBulletListActive}
          disabled={
            disabled ||
            bridgeState.canToggleBulletList === false ||
            typeof editorApi.toggleBulletList !== "function"
          }
          onPress={() => editorApi.toggleBulletList?.()}
        />
        <ToolbarButton
          label="Numerada"
          icon="format-list-numbered"
          compact={compact}
          isActive={bridgeState.isOrderedListActive}
          disabled={
            disabled ||
            bridgeState.canToggleOrderedList === false ||
            typeof editorApi.toggleOrderedList !== "function"
          }
          onPress={() => editorApi.toggleOrderedList?.()}
        />
        <ToolbarButton
          label="Titulo"
          icon="title"
          compact={compact}
          isActive={typeof bridgeState.headingLevel === "number" && bridgeState.headingLevel > 0}
          disabled={disabled || bridgeState.canToggleHeading === false || typeof editorApi.toggleHeading !== "function"}
          onPress={() => editorApi.toggleHeading?.(2)}
        />
        <ToolbarButton
          label="Checklist"
          icon="check-box"
          compact={compact}
          isActive={bridgeState.isTaskListActive}
          disabled={
            disabled || bridgeState.canToggleTaskList === false || typeof editorApi.toggleTaskList !== "function"
          }
          onPress={() => editorApi.toggleTaskList?.()}
        />
        <ToolbarButton
          label="Tabla"
          icon="table-chart"
          compact={compact}
          isActive={bridgeState.isTableActive}
          disabled={disabled || bridgeState.canInsertTable === false || typeof editorApi.insertTable !== "function"}
          onPress={() =>
            editorApi.insertTable?.({
              rows: 3,
              cols: 3,
              withHeaderRow: true,
            })
          }
        />
      </ScrollView>
    </View>
  );
};

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor, ...props }) => {
  if (!editor) return null;
  return <EditorToolbarContent editor={editor} {...props} />;
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 6,
  },
  scrollContent: {
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 8,
  },
  button: {
    minHeight: 38,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  buttonCompact: {
    minWidth: 40,
    paddingHorizontal: 8,
  },
  buttonLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
});

export default EditorToolbar;
