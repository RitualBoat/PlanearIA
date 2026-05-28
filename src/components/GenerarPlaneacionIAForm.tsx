import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { COLORS, FONT_SIZES } from "../../types";
import { NivelAcademico } from "../../types/planeacionLegacy";

interface GenerarPlaneacionIAFormProps {
  prompt: string;
  nivelSeleccionado: NivelAcademico;
  isGenerating: boolean;
  errorMessage: string;
  onChangePrompt: (value: string) => void;
  onSelectNivel: (nivel: NivelAcademico) => void;
  onGenerate: () => void;
}

const niveles: Array<{ nivel: NivelAcademico; label: string }> = [
  { nivel: NivelAcademico.PRIMARIA, label: "Primaria" },
  { nivel: NivelAcademico.SECUNDARIA, label: "Secundaria" },
  { nivel: NivelAcademico.PREPARATORIA, label: "Preparatoria" },
  { nivel: NivelAcademico.UNIVERSIDAD, label: "Universidad" },
];

export const GenerarPlaneacionIAForm: React.FC<GenerarPlaneacionIAFormProps> = ({
  prompt,
  nivelSeleccionado,
  isGenerating,
  errorMessage,
  onChangePrompt,
  onSelectNivel,
  onGenerate,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Prompt para la IA</Text>
      <TextInput
        style={styles.promptInput}
        placeholder="Ej: Genera una planeación de matemáticas para 3° sobre fracciones, con actividades colaborativas y evaluación formativa."
        placeholderTextColor={COLORS.textSecondary}
        value={prompt}
        onChangeText={onChangePrompt}
        multiline
        numberOfLines={5}
        textAlignVertical="top"
      />

      <Text style={styles.label}>Nivel Académico</Text>
      <View style={styles.nivelesContainer}>
        {niveles.map((item) => {
          const selected = item.nivel === nivelSeleccionado;
          return (
            <TouchableOpacity
              key={item.nivel}
              style={[styles.nivelButton, selected && styles.nivelButtonActive]}
              onPress={() => onSelectNivel(item.nivel)}
              disabled={isGenerating}
            >
              <Text style={[styles.nivelButtonText, selected && styles.nivelButtonTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <TouchableOpacity
        style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
        onPress={onGenerate}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="white" />
            <Text style={styles.generateButtonText}>Generando...</Text>
          </View>
        ) : (
          <Text style={styles.generateButtonText}>Generar con IA</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  label: {
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
    color: COLORS.text,
  },
  promptInput: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: COLORS.textSecondary + "40",
    borderRadius: 10,
    padding: 12,
    backgroundColor: COLORS.background,
    color: COLORS.text,
    fontSize: FONT_SIZES.medium,
  },
  nivelesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  nivelButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.background,
  },
  nivelButtonActive: {
    backgroundColor: COLORS.primary,
  },
  nivelButtonText: {
    color: COLORS.primary,
    fontWeight: "600",
    fontSize: FONT_SIZES.small,
  },
  nivelButtonTextActive: {
    color: "white",
  },
  errorText: {
    color: "#d32f2f",
    fontSize: FONT_SIZES.small,
  },
  generateButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  generateButtonDisabled: {
    opacity: 0.7,
  },
  generateButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: FONT_SIZES.medium,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});

export default GenerarPlaneacionIAForm;
