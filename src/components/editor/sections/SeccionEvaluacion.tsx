import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../../../context/ThemeContext";
import type {
  CriterioEvaluacion,
  InstrumentoEvaluacion,
  NivelEscala,
  TipoInstrumento,
} from "../../../../types/planeacionV2";

export interface SeccionEvaluacionProps {
  evaluacionInicial?: InstrumentoEvaluacion;
  evaluacionFinal?: InstrumentoEvaluacion;
  onChange: (next: {
    evaluacionInicial?: InstrumentoEvaluacion;
    evaluacionFinal?: InstrumentoEvaluacion;
  }) => void;
}

const TIPOS: TipoInstrumento[] = [
  "escala_valoracion",
  "escala_estimativa",
  "rubrica",
  "lista_cotejo",
  "otro",
];

const getTipoLabel = (tipo: TipoInstrumento): string => {
  const labels: Record<TipoInstrumento, string> = {
    escala_valoracion: "Escala valoracion",
    escala_estimativa: "Escala estimativa",
    rubrica: "Rubrica",
    lista_cotejo: "Lista cotejo",
    otro: "Otro",
  };
  return labels[tipo];
};

const defaultScaleByType = (tipo: TipoInstrumento): NivelEscala[] => {
  if (tipo === "escala_valoracion") {
    return [{ etiqueta: "Si" }, { etiqueta: "A veces" }, { etiqueta: "No" }];
  }
  if (tipo === "escala_estimativa") {
    return [
      { etiqueta: "Excelente", valor: 10 },
      { etiqueta: "Bueno", valor: 8 },
      { etiqueta: "Regular", valor: 7 },
      { etiqueta: "Deficiente", valor: 6 },
    ];
  }
  if (tipo === "lista_cotejo") {
    return [{ etiqueta: "Cumple" }, { etiqueta: "No cumple" }];
  }
  return [];
};

const buildDefaultInstrumento = (tipo: TipoInstrumento = "rubrica"): InstrumentoEvaluacion => {
  return {
    tipo,
    escala: defaultScaleByType(tipo),
    criterios: [
      {
        id: `crit_${Date.now()}`,
        descripcion: "Participacion y desarrollo de actividades",
      },
    ],
  };
};

interface InstrumentoCardProps {
  title: string;
  value?: InstrumentoEvaluacion;
  optional?: boolean;
  onChange: (next?: InstrumentoEvaluacion) => void;
}

const InstrumentoCard: React.FC<InstrumentoCardProps> = ({ title, value, optional = false, onChange }) => {
  const { colors } = useTheme();
  const enabled = optional ? Boolean(value) : true;
  const instrumento = value || buildDefaultInstrumento("rubrica");

  const update = (next: InstrumentoEvaluacion) => onChange(next);

  const updateScale = (index: number, partial: Partial<NivelEscala>) => {
    const nextScale = instrumento.escala.map((item, itemIndex) =>
      itemIndex === index ? { ...item, ...partial } : item
    );
    update({
      ...instrumento,
      escala: nextScale,
    });
  };

  const removeScale = (index: number) => {
    update({
      ...instrumento,
      escala: instrumento.escala.filter((_, itemIndex) => itemIndex !== index),
    });
  };

  const addScale = () => {
    update({
      ...instrumento,
      escala: [...instrumento.escala, { etiqueta: "" }],
    });
  };

  const addCriteria = () => {
    const criterio: CriterioEvaluacion = {
      id: `crit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      descripcion: "",
    };
    update({
      ...instrumento,
      criterios: [...instrumento.criterios, criterio],
    });
  };

  const updateCriteria = (id: string, partial: Partial<CriterioEvaluacion>) => {
    update({
      ...instrumento,
      criterios: instrumento.criterios.map((criterio) =>
        criterio.id === id
          ? {
              ...criterio,
              ...partial,
            }
          : criterio
      ),
    });
  };

  const removeCriteria = (id: string) => {
    update({
      ...instrumento,
      criterios: instrumento.criterios.filter((criterio) => criterio.id !== id),
    });
  };

  return (
    <View
      style={[
        styles.instrumentCard,
        {
          borderColor: colors.borderLight,
          backgroundColor: colors.surfaceContainerLow,
        },
      ]}
    >
      <View style={styles.instrumentHeader}>
        <Text style={[styles.instrumentTitle, { color: colors.onSurface }]}>{title}</Text>
        {optional ? (
          <Pressable
            style={[
              styles.toggleButton,
              {
                borderColor: enabled ? colors.success : colors.borderLight,
                backgroundColor: enabled ? colors.successTint : colors.surfaceContainerLowest,
              },
            ]}
            onPress={() => onChange(enabled ? undefined : buildDefaultInstrumento("rubrica"))}
          >
            <Text style={[styles.toggleText, { color: enabled ? colors.success : colors.onSurfaceVariant }]}>
              {enabled ? "Activo" : "Activar"}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {!enabled ? (
        <Text style={[styles.helperText, { color: colors.onSurfaceVariant }]}>
          Activa este instrumento para configurar evaluacion inicial.
        </Text>
      ) : (
        <>
          <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Tipo de instrumento</Text>
          <View style={styles.chipsRow}>
            {TIPOS.map((tipo) => {
              const active = instrumento.tipo === tipo;
              return (
                <Pressable
                  key={tipo}
                  style={[
                    styles.chip,
                    {
                      borderColor: active ? colors.primary : colors.borderLight,
                      backgroundColor: active ? colors.primaryContainer : colors.surfaceContainerLowest,
                    },
                  ]}
                  onPress={() =>
                    update({
                      ...instrumento,
                      tipo,
                      escala: defaultScaleByType(tipo),
                    })
                  }
                >
                  <Text style={[styles.chipText, { color: active ? colors.primary : colors.onSurfaceVariant }]}>
                    {getTipoLabel(tipo)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Escala</Text>
          {instrumento.escala.map((scale, index) => (
            <View key={`${title}_scale_${index}`} style={styles.row}>
              <TextInput
                style={[
                  styles.input,
                  styles.flexGrow,
                  {
                    color: colors.onSurface,
                    borderColor: colors.borderLight,
                    backgroundColor: colors.surfaceContainerLowest,
                  },
                ]}
                value={scale.etiqueta}
                placeholder={`Nivel ${index + 1}`}
                placeholderTextColor={colors.textMuted}
                onChangeText={(text) => updateScale(index, { etiqueta: text })}
              />
              <TextInput
                style={[
                  styles.input,
                  styles.smallInput,
                  {
                    color: colors.onSurface,
                    borderColor: colors.borderLight,
                    backgroundColor: colors.surfaceContainerLowest,
                  },
                ]}
                value={scale.valor != null ? String(scale.valor) : ""}
                placeholder="Valor"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                onChangeText={(text) => updateScale(index, { valor: text ? Number(text) : undefined })}
              />
              <Pressable onPress={() => removeScale(index)} style={styles.iconTap}>
                <MaterialIcons name="delete-outline" size={20} color={colors.error} />
              </Pressable>
            </View>
          ))}
          <Pressable
            style={[
              styles.outlineButton,
              {
                borderColor: colors.primary,
                backgroundColor: colors.primaryContainer,
              },
            ]}
            onPress={addScale}
          >
            <Text style={[styles.outlineButtonText, { color: colors.primary }]}>Agregar nivel de escala</Text>
          </Pressable>

          <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Criterios</Text>
          {instrumento.criterios.map((criterio) => (
            <View key={criterio.id} style={styles.criteriaCard}>
              <View style={styles.row}>
                <TextInput
                  style={[
                    styles.textArea,
                    styles.flexGrow,
                    {
                      color: colors.onSurface,
                      borderColor: colors.borderLight,
                      backgroundColor: colors.surfaceContainerLowest,
                    },
                  ]}
                  multiline
                  value={criterio.descripcion}
                  placeholder="Describe el criterio"
                  placeholderTextColor={colors.textMuted}
                  onChangeText={(text) => updateCriteria(criterio.id, { descripcion: text })}
                />
                <Pressable onPress={() => removeCriteria(criterio.id)} style={styles.iconTap}>
                  <MaterialIcons name="delete-outline" size={20} color={colors.error} />
                </Pressable>
              </View>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.onSurface,
                    borderColor: colors.borderLight,
                    backgroundColor: colors.surfaceContainerLowest,
                  },
                ]}
                value={criterio.mejora || ""}
                placeholder="Que necesito hacer para mejorar (opcional)"
                placeholderTextColor={colors.textMuted}
                onChangeText={(text) => updateCriteria(criterio.id, { mejora: text || undefined })}
              />
            </View>
          ))}
          <Pressable
            style={[
              styles.outlineButton,
              {
                borderColor: colors.primary,
                backgroundColor: colors.primaryContainer,
              },
            ]}
            onPress={addCriteria}
          >
            <Text style={[styles.outlineButtonText, { color: colors.primary }]}>Agregar criterio</Text>
          </Pressable>
        </>
      )}
    </View>
  );
};

export const SeccionEvaluacion: React.FC<SeccionEvaluacionProps> = ({
  evaluacionInicial,
  evaluacionFinal,
  onChange,
}) => {
  const { colors } = useTheme();

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
      <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Evaluacion</Text>

      <InstrumentoCard
        title="Evaluacion inicial (opcional)"
        value={evaluacionInicial}
        optional
        onChange={(next) =>
          onChange({
            evaluacionInicial: next,
            evaluacionFinal,
          })
        }
      />

      <InstrumentoCard
        title="Evaluacion final"
        value={evaluacionFinal}
        onChange={(next) =>
          onChange({
            evaluacionInicial,
            evaluacionFinal: next || buildDefaultInstrumento("rubrica"),
          })
        }
      />
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  instrumentCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    gap: 8,
  },
  instrumentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  instrumentTitle: {
    fontSize: 14,
    fontWeight: "700",
    flex: 1,
  },
  toggleButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: "700",
  },
  helperText: {
    fontSize: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
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
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    minHeight: 40,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    minHeight: 70,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    textAlignVertical: "top",
  },
  flexGrow: {
    flex: 1,
  },
  smallInput: {
    width: 84,
  },
  iconTap: {
    padding: 3,
  },
  outlineButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    alignSelf: "flex-start",
  },
  outlineButtonText: {
    fontSize: 12,
    fontWeight: "700",
  },
  criteriaCard: {
    borderRadius: 10,
    gap: 8,
  },
});

export default SeccionEvaluacion;

