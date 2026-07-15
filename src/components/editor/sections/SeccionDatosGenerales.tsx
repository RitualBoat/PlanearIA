import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useTheme } from "../../../hooks/useTheme";
import type { EditorMode } from "../../../hooks/useEditorMode";
import type { DatosGenerales } from "../../../../types/planeacionV2";

export interface SeccionDatosGeneralesProps {
  value: DatosGenerales;
  mode?: EditorMode;
  onChange: (next: DatosGenerales) => void;
}

const parseNumberList = (input: string): number[] => {
  return input
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item) && item > 0);
};

const parseStringList = (input: string): string[] => {
  return input
    .split(",")
    .flatMap((item) => {
      const text = item.trim();
      return text ? [text] : [];
    });
};

export const SeccionDatosGenerales: React.FC<SeccionDatosGeneralesProps> = ({
  value,
  mode = "mobile",
  onChange,
}) => {
  const { colors } = useTheme();
  const isStandard = mode === "standard";

  const updateField = <K extends keyof DatosGenerales>(field: K, fieldValue: DatosGenerales[K]) => {
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
      <Text style={[styles.title, { color: colors.onSurface }]}>Datos generales</Text>

      <View style={isStandard ? styles.row : undefined}>
        <View style={styles.fieldBlock}>
          <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Docente</Text>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.onSurface,
                borderColor: colors.borderLight,
                backgroundColor: colors.surfaceContainerLow,
              },
            ]}
            value={value.maestro}
            placeholder="Nombre del docente"
            placeholderTextColor={colors.textMuted}
            onChangeText={(text) => updateField("maestro", text)}
          />
        </View>
        <View style={styles.fieldBlock}>
          <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Asignatura</Text>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.onSurface,
                borderColor: colors.borderLight,
                backgroundColor: colors.surfaceContainerLow,
              },
            ]}
            value={value.asignatura}
            placeholder="Ej. Espanol"
            placeholderTextColor={colors.textMuted}
            onChangeText={(text) => updateField("asignatura", text)}
          />
        </View>
      </View>

      <View style={isStandard ? styles.row : undefined}>
        <View style={styles.fieldBlock}>
          <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Grado</Text>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.onSurface,
                borderColor: colors.borderLight,
                backgroundColor: colors.surfaceContainerLow,
              },
            ]}
            value={value.grado}
            placeholder="Ej. 3A o Segundo"
            placeholderTextColor={colors.textMuted}
            onChangeText={(text) => updateField("grado", text)}
          />
        </View>
        <View style={styles.fieldBlock}>
          <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Trimestre (opcional)</Text>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.onSurface,
                borderColor: colors.borderLight,
                backgroundColor: colors.surfaceContainerLow,
              },
            ]}
            value={value.trimestre != null ? String(value.trimestre) : ""}
            placeholder="1, 2, 3..."
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            onChangeText={(text) => {
              const next = Number(text);
              updateField("trimestre", Number.isFinite(next) && next > 0 ? next : undefined);
            }}
          />
        </View>
      </View>

      <View style={isStandard ? styles.row : undefined}>
        <View style={styles.fieldBlock}>
          <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Fecha inicio</Text>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.onSurface,
                borderColor: colors.borderLight,
                backgroundColor: colors.surfaceContainerLow,
              },
            ]}
            value={value.fechaInicio}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textMuted}
            onChangeText={(text) => updateField("fechaInicio", text)}
          />
        </View>
        <View style={styles.fieldBlock}>
          <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Fecha fin</Text>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.onSurface,
                borderColor: colors.borderLight,
                backgroundColor: colors.surfaceContainerLow,
              },
            ]}
            value={value.fechaFin}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textMuted}
            onChangeText={(text) => updateField("fechaFin", text)}
          />
        </View>
      </View>

      <View style={isStandard ? styles.row : undefined}>
        <View style={styles.fieldBlock}>
          <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Semanas (coma separada)</Text>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.onSurface,
                borderColor: colors.borderLight,
                backgroundColor: colors.surfaceContainerLow,
              },
            ]}
            value={value.semanas.join(", ")}
            placeholder="33, 34"
            placeholderTextColor={colors.textMuted}
            onChangeText={(text) => updateField("semanas", parseNumberList(text))}
          />
        </View>

        <View style={styles.fieldBlock}>
          <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Grupos (coma separada)</Text>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.onSurface,
                borderColor: colors.borderLight,
                backgroundColor: colors.surfaceContainerLow,
              },
            ]}
            value={value.grupos.join(", ")}
            placeholder="A, B, C"
            placeholderTextColor={colors.textMuted}
            onChangeText={(text) => updateField("grupos", parseStringList(text))}
          />
        </View>
      </View>

      <View style={styles.quickRow}>
        {[1, 2, 3].map((trimestre) => {
          const active = value.trimestre === trimestre;
          return (
            <Pressable
              key={trimestre}
              style={[
                styles.quickChip,
                {
                  borderColor: active ? colors.primary : colors.borderLight,
                  backgroundColor: active ? colors.primary : colors.surfaceContainerLow,
                },
              ]}
              onPress={() => updateField("trimestre", trimestre)}
            >
              <Text style={[styles.quickChipText, { color: active ? colors.surface : colors.onSurfaceVariant }]}>
                Trim. {trimestre}
              </Text>
            </Pressable>
          );
        })}
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
  quickRow: {
    flexDirection: "row",
    gap: 8,
  },
  quickChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: "700",
  },
});

export default SeccionDatosGenerales;
