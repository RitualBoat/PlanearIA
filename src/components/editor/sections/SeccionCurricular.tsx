import React, { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useTheme } from "../../../context/ThemeContext";
import type { EditorMode } from "../../../hooks/useEditorMode";
import type { ElementosCurriculares } from "../../../../types/planeacionV2";

export interface SeccionCurricularProps {
  value: ElementosCurriculares;
  mode?: EditorMode;
  isSuggestingPda?: boolean;
  onChange: (next: ElementosCurriculares) => void;
  onSuggestPda?: () => Promise<string | void>;
}

const CAMPOS_FORMATIVOS = [
  "Lenguajes",
  "Saberes y pensamiento cientifico",
  "Etica, naturaleza y sociedades",
  "De lo humano y lo comunitario",
];

const EJES_ARTICULADORES = [
  "Inclusión",
  "Pensamiento critico",
  "Interculturalidad critica",
  "Igualdad de genero",
  "Vida saludable",
  "Apropiacion de las culturas",
];

const normalizeList = (value: string): string[] => {
  return value
    .split(/\n|,/)
    .flatMap((item) => {
      const text = item.trim();
      return text ? [text] : [];
    });
};

export const SeccionCurricular: React.FC<SeccionCurricularProps> = ({
  value,
  mode = "mobile",
  isSuggestingPda = false,
  onChange,
  onSuggestPda,
}) => {
  const { colors } = useTheme();
  const [rasgosInput, setRasgosInput] = useState(value.rasgosPerfilEgreso.join(", "));
  const isStandard = mode === "standard";

  const updateField = <K extends keyof ElementosCurriculares>(field: K, fieldValue: ElementosCurriculares[K]) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  const handleSuggestPda = async () => {
    if (!onSuggestPda) return;
    const nextPda = await onSuggestPda();
    if (typeof nextPda === "string" && nextPda.trim()) {
      updateField("pda", nextPda.trim());
    }
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
      <Text style={[styles.title, { color: colors.onSurface }]}>Elementos curriculares</Text>

      <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Proposito</Text>
      <TextInput
        style={[
          styles.textArea,
          {
            color: colors.onSurface,
            borderColor: colors.borderLight,
            backgroundColor: colors.surfaceContainerLow,
          },
        ]}
        multiline
        value={value.proposito}
        onChangeText={(text) => updateField("proposito", text)}
        placeholder="Enuncia el proposito de la planeacion"
        placeholderTextColor={colors.textMuted}
      />

      <View style={isStandard ? styles.row : undefined}>
        <View style={styles.fieldBlock}>
          <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Contenido</Text>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.onSurface,
                borderColor: colors.borderLight,
                backgroundColor: colors.surfaceContainerLow,
              },
            ]}
            value={value.contenido}
            onChangeText={(text) => updateField("contenido", text)}
            placeholder="Contenido o tema central"
            placeholderTextColor={colors.textMuted}
          />
        </View>
        <View style={styles.fieldBlock}>
          <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Producto (opcional)</Text>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.onSurface,
                borderColor: colors.borderLight,
                backgroundColor: colors.surfaceContainerLow,
              },
            ]}
            value={value.producto || ""}
            onChangeText={(text) => updateField("producto", text || undefined)}
            placeholder="Evidencia esperada"
            placeholderTextColor={colors.textMuted}
          />
        </View>
      </View>

      <View style={styles.pdaHeader}>
        <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>PDA</Text>
        <Pressable
          style={[
            styles.aiButton,
            {
              borderColor: colors.primary,
              backgroundColor: colors.surfaceContainerLowest,
              opacity: onSuggestPda ? 1 : 0.6,
            },
          ]}
          disabled={!onSuggestPda || isSuggestingPda}
          onPress={() => {
            void handleSuggestPda();
          }}
        >
          {isSuggestingPda ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={[styles.aiButtonText, { color: colors.primary }]}>Sugerir PDA</Text>
          )}
        </Pressable>
      </View>
      <TextInput
        style={[
          styles.textArea,
          {
            color: colors.onSurface,
            borderColor: colors.borderLight,
            backgroundColor: colors.surfaceContainerLow,
          },
        ]}
        multiline
        value={value.pda}
        onChangeText={(text) => updateField("pda", text)}
        placeholder="Proceso de desarrollo de aprendizaje"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Campo formativo</Text>
      <View style={styles.chipsRow}>
        {CAMPOS_FORMATIVOS.map((campo) => {
          const active = value.campoFormativo === campo;
          return (
            <Pressable
              key={campo}
              onPress={() => updateField("campoFormativo", campo)}
              style={[
                styles.chip,
                {
                  borderColor: active ? colors.primary : colors.borderLight,
                  backgroundColor: active ? colors.primary : colors.surfaceContainerLow,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: active ? colors.surface : colors.onSurfaceVariant }]}>
                {campo}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Eje articulador</Text>
      <View style={styles.chipsRow}>
        {EJES_ARTICULADORES.map((eje) => {
          const active = value.ejeArticulador === eje;
          return (
            <Pressable
              key={eje}
              onPress={() => updateField("ejeArticulador", eje)}
              style={[
                styles.chip,
                {
                  borderColor: active ? colors.primary : colors.borderLight,
                  backgroundColor: active ? colors.primary : colors.surfaceContainerLow,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: active ? colors.surface : colors.onSurfaceVariant }]}>
                {eje}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Rasgos perfil egreso</Text>
      <TextInput
        style={[
          styles.textArea,
          {
            color: colors.onSurface,
            borderColor: colors.borderLight,
            backgroundColor: colors.surfaceContainerLow,
          },
        ]}
        multiline
        value={rasgosInput}
        onChangeText={(text) => {
          setRasgosInput(text);
          updateField("rasgosPerfilEgreso", normalizeList(text));
        }}
        placeholder="Separa por coma o salto de linea"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Instrumento de evaluacion (opcional)</Text>
      <TextInput
        style={[
          styles.input,
          {
            color: colors.onSurface,
            borderColor: colors.borderLight,
            backgroundColor: colors.surfaceContainerLow,
          },
        ]}
        value={value.instrumentoEvaluacion || ""}
        onChangeText={(text) => updateField("instrumentoEvaluacion", text || undefined)}
        placeholder="Ej. Rubrica de 4 niveles"
        placeholderTextColor={colors.textMuted}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
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
  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    minHeight: 84,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    textAlignVertical: "top",
  },
  pdaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  aiButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 94,
    alignItems: "center",
  },
  aiButtonText: {
    fontSize: 12,
    fontWeight: "700",
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
  },
});

export default SeccionCurricular;
