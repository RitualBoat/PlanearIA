import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useTheme } from "../../../hooks/useTheme";
import type { EditorMode } from "../../../hooks/useEditorMode";
import type { InfoInstitucional } from "../../../../types/planeacionV2";

export interface SeccionInfoInstitucionalProps {
  value: InfoInstitucional;
  mode?: EditorMode;
  onChange: (next: InfoInstitucional) => void;
}

export const SeccionInfoInstitucional: React.FC<SeccionInfoInstitucionalProps> = ({
  value,
  mode = "mobile",
  onChange,
}) => {
  const { colors } = useTheme();
  const isStandard = mode === "standard";

  const updateField = <K extends keyof InfoInstitucional>(field: K, fieldValue: InfoInstitucional[K]) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surfaceContainerLowest,
          borderColor: colors.borderLight,
        },
      ]}
    >
      <Text style={[styles.title, { color: colors.onSurface }]}>Informacion institucional</Text>

      <View style={isStandard ? styles.row : undefined}>
        <View style={styles.fieldBlock}>
          <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Institucion</Text>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.onSurface,
                borderColor: colors.borderLight,
                backgroundColor: colors.surfaceContainerLow,
              },
            ]}
            placeholder="Nombre de la institucion"
            placeholderTextColor={colors.textMuted}
            value={value.institucion}
            onChangeText={(text) => updateField("institucion", text)}
          />
        </View>

        <View style={styles.fieldBlock}>
          <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Ciclo escolar</Text>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.onSurface,
                borderColor: colors.borderLight,
                backgroundColor: colors.surfaceContainerLow,
              },
            ]}
            placeholder="2026-2027"
            placeholderTextColor={colors.textMuted}
            value={value.cicloEscolar}
            onChangeText={(text) => updateField("cicloEscolar", text)}
          />
        </View>
      </View>

      <View style={isStandard ? styles.row : undefined}>
        <View style={styles.fieldBlock}>
          <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Subsistema (opcional)</Text>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.onSurface,
                borderColor: colors.borderLight,
                backgroundColor: colors.surfaceContainerLow,
              },
            ]}
            placeholder="Ej. Estatal / Federal / Universidad"
            placeholderTextColor={colors.textMuted}
            value={value.subsistema || ""}
            onChangeText={(text) => updateField("subsistema", text || undefined)}
          />
        </View>

        <View style={styles.fieldBlock}>
          <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Lugar (opcional)</Text>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.onSurface,
                borderColor: colors.borderLight,
                backgroundColor: colors.surfaceContainerLow,
              },
            ]}
            placeholder="Ciudad / Estado"
            placeholderTextColor={colors.textMuted}
            value={value.lugar || ""}
            onChangeText={(text) => updateField("lugar", text || undefined)}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  fieldBlock: {
    flex: 1,
    gap: 6,
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
});

export default SeccionInfoInstitucional;

