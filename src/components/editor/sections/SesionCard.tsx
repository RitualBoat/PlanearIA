import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../../../context/ThemeContext";
import type { EditorMode } from "../../../hooks/useEditorMode";
import type { Sesion, TipoSesion } from "../../../../types/planeacionV2";
import { RichTextEditor } from "../RichTextEditor";
import type { EditorBridge } from "@10play/tentap-editor";

export interface SesionCardProps {
  sesion: Sesion;
  mode?: EditorMode;
  expanded: boolean;
  onToggle: () => void;
  onChange: (next: Sesion) => void;
  onDelete?: () => void;
  onActiveEditor?: (editor: EditorBridge) => void;
}

const SESSION_TYPES: Array<{ value: TipoSesion; label: string; icon: keyof typeof MaterialIcons.glyphMap }> = [
  { value: "regular", label: "Regular", icon: "menu-book" },
  { value: "suspension", label: "Suspension", icon: "event-busy" },
  { value: "proyecto_lectura", label: "Proyecto", icon: "auto-stories" },
  { value: "evaluacion", label: "Evaluacion", icon: "fact-check" },
];

const normalizeToEditorInput = (value?: string): string | Record<string, unknown> => {
  if (!value) return "";
  const trimmed = value.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      return JSON.parse(trimmed) as Record<string, unknown>;
    } catch {
      return value;
    }
  }
  return value;
};

const stringifyEditorOutput = (value: Record<string, unknown>): string => {
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
};

export const SesionCard: React.FC<SesionCardProps> = ({
  sesion,
  mode = "mobile",
  expanded,
  onToggle,
  onChange,
  onDelete,
  onActiveEditor,
}) => {
  const { colors } = useTheme();

  const selectedType = SESSION_TYPES.find((option) => option.value === sesion.tipo) || SESSION_TYPES[0];

  const updateField = <K extends keyof Sesion>(field: K, value: Sesion[K]) => {
    onChange({
      ...sesion,
      [field]: value,
    });
  };

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: colors.borderLight,
          backgroundColor: colors.surfaceContainerLowest,
        },
      ]}
    >
      <Pressable onPress={onToggle} style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialIcons name={selectedType.icon} size={18} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.onSurface }]}>
            Sesion {sesion.numero} - {selectedType.label}
          </Text>
        </View>
        <View style={styles.headerActions}>
          {onDelete ? (
            <Pressable onPress={onDelete} style={styles.iconButton}>
              <MaterialIcons name="delete-outline" size={20} color={colors.error} />
            </Pressable>
          ) : null}
          <MaterialIcons
            name={expanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
            size={22}
            color={colors.onSurfaceVariant}
          />
        </View>
      </Pressable>

      {expanded ? (
        <View style={styles.content}>
          <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Tipo de sesion</Text>
          <View style={styles.typeRow}>
            {SESSION_TYPES.map((option) => {
              const active = sesion.tipo === option.value;
              return (
                <Pressable
                  key={option.value}
                  style={[
                    styles.typeChip,
                    {
                      borderColor: active ? colors.primary : colors.borderLight,
                      backgroundColor: active ? colors.primary : colors.surfaceContainerLow,
                    },
                  ]}
                  onPress={() => updateField("tipo", option.value)}
                >
                  <MaterialIcons
                    name={option.icon}
                    size={14}
                    color={active ? colors.surface : colors.onSurfaceVariant}
                  />
                  <Text style={[styles.typeLabel, { color: active ? colors.surface : colors.onSurfaceVariant }]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {sesion.tipo === "suspension" ? (
            <>
              <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Motivo de suspension</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.onSurface,
                    borderColor: colors.borderLight,
                    backgroundColor: colors.surfaceContainerLow,
                  },
                ]}
                value={sesion.motivo || ""}
                placeholder="Ej. CTE, consejo tecnico, acto civico"
                placeholderTextColor={colors.textMuted}
                onChangeText={(text) => updateField("motivo", text)}
              />
            </>
          ) : (
            <>
              <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Inicio</Text>
              <RichTextEditor
                mode={mode}
                minHeight={180}
                initialContent={normalizeToEditorInput(sesion.inicio)}
                onChange={(content) => updateField("inicio", stringifyEditorOutput(content))}
                placeholder="Describe el inicio de la sesion"
                onEditorReady={onActiveEditor}
              />

              <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Desarrollo</Text>
              <RichTextEditor
                mode={mode}
                minHeight={220}
                initialContent={normalizeToEditorInput(sesion.desarrollo)}
                onChange={(content) => updateField("desarrollo", stringifyEditorOutput(content))}
                placeholder="Describe las actividades de desarrollo"
                onEditorReady={onActiveEditor}
              />

              <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Cierre</Text>
              <RichTextEditor
                mode={mode}
                minHeight={180}
                initialContent={normalizeToEditorInput(sesion.cierre)}
                onChange={(content) => updateField("cierre", stringifyEditorOutput(content))}
                placeholder="Cierre y reflexion final"
                onEditorReady={onActiveEditor}
              />

              <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Tarea (opcional)</Text>
              <RichTextEditor
                mode={mode}
                minHeight={140}
                initialContent={normalizeToEditorInput(sesion.tarea)}
                onChange={(content) => updateField("tarea", stringifyEditorOutput(content))}
                placeholder="Indicaciones de tarea"
                onEditorReady={onActiveEditor}
              />
            </>
          )}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  header: {
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  iconButton: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    minHeight: 42,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  typeChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
});

export default SesionCard;
