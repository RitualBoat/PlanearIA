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
import { useTheme } from "../../context/ThemeContext";
import type { EditorMode } from "../../hooks/useEditorMode";

export interface EditorSectionItem {
  id: string;
  title: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  completed?: boolean;
  disabled?: boolean;
}

export interface SectionNavigatorProps {
  sections: EditorSectionItem[];
  activeSectionId: string;
  onSectionChange: (sectionId: string) => void;
  mode?: EditorMode;
  style?: StyleProp<ViewStyle>;
}

export const SectionNavigator: React.FC<SectionNavigatorProps> = ({
  sections,
  activeSectionId,
  onSectionChange,
  mode = "mobile",
  style,
}) => {
  const { colors } = useTheme();

  const completedCount = sections.filter((section) => section.completed).length;
  const progressValue = sections.length > 0 ? completedCount / sections.length : 0;

  if (mode !== "mobile") return null;

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
      <View style={styles.progressRow}>
        <Text style={[styles.progressText, { color: colors.onSurfaceVariant }]}>
          Secciones completadas: {completedCount}/{sections.length}
        </Text>
      </View>
      <View style={[styles.progressTrack, { backgroundColor: colors.surfaceContainerHigh }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${Math.round(progressValue * 100)}%`,
              backgroundColor: colors.primary,
            },
          ]}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sectionsRow}>
        {sections.map((section, index) => {
          const isActive = section.id === activeSectionId;
          const iconName = section.icon || "article";
          const disabled = section.disabled === true;
          return (
            <Pressable
              key={section.id}
              accessibilityRole="button"
              accessibilityLabel={section.title}
              disabled={disabled}
              onPress={() => onSectionChange(section.id)}
              style={({ pressed }) => [
                styles.sectionChip,
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
                name={section.completed ? "check-circle" : iconName}
                size={16}
                color={section.completed && !isActive ? colors.success : isActive ? colors.surface : colors.onSurfaceVariant}
              />
              <Text
                numberOfLines={1}
                style={[
                  styles.sectionLabel,
                  {
                    color: isActive ? colors.surface : colors.onSurface,
                  },
                ]}
              >
                {index + 1}. {section.title}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 8,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    borderRadius: 999,
  },
  sectionsRow: {
    paddingVertical: 2,
    alignItems: "center",
    gap: 8,
  },
  sectionChip: {
    minHeight: 36,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    maxWidth: 220,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
});

export default SectionNavigator;
