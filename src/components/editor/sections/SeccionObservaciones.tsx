import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../../../context/ThemeContext";
import type { Observacion } from "../../../../types/planeacionV2";

export interface SeccionObservacionesProps {
  value: Observacion[];
  onChange: (next: Observacion[]) => void;
}

const CATEGORIAS: Array<NonNullable<Observacion["categoria"]>> = [
  "general",
  "flexibilidad",
  "usaer",
  "proyecto",
];

const SUGERENCIAS = [
  "Ajustar tiempos segun avance del grupo.",
  "Adaptar actividades para atencion de USAER.",
  "Vincular con proyecto escolar comunitario.",
];

export const SeccionObservaciones: React.FC<SeccionObservacionesProps> = ({ value, onChange }) => {
  const { colors } = useTheme();
  const list = value.length > 0 ? value : [{ texto: "", categoria: "general" as const }];

  const update = (index: number, next: Observacion) => {
    onChange(list.map((item, itemIndex) => (itemIndex === index ? next : item)));
  };

  const add = (texto = "") => {
    onChange([
      ...list,
      {
        texto,
        categoria: "general",
      },
    ]);
  };

  const remove = (index: number) => {
    const next = list.filter((_, itemIndex) => itemIndex !== index);
    onChange(next.length > 0 ? next : [{ texto: "", categoria: "general" }]);
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
      <Text style={[styles.title, { color: colors.onSurface }]}>Observaciones</Text>

      {list.map((observacion, index) => (
        <View
          key={`obs_${observacion.categoria}_${index}`}
          style={[
            styles.card,
            {
              borderColor: colors.borderLight,
              backgroundColor: colors.surfaceContainerLow,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Observacion {index + 1}</Text>
            <Pressable onPress={() => remove(index)}>
              <MaterialIcons name="delete-outline" size={20} color={colors.error} />
            </Pressable>
          </View>

          <View style={styles.chipsRow}>
            {CATEGORIAS.map((categoria) => {
              const active = observacion.categoria === categoria;
              return (
                <Pressable
                  key={categoria}
                  onPress={() => update(index, { ...observacion, categoria })}
                  style={[
                    styles.chip,
                    {
                      borderColor: active ? colors.primary : colors.borderLight,
                      backgroundColor: active ? colors.primary : colors.surfaceContainerLowest,
                    },
                  ]}
                >
                  <Text style={[styles.chipText, { color: active ? colors.surface : colors.onSurfaceVariant }]}>
                    {categoria}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <TextInput
            style={[
              styles.textArea,
              {
                borderColor: colors.borderLight,
                backgroundColor: colors.surfaceContainerLowest,
                color: colors.onSurface,
              },
            ]}
            multiline
            value={observacion.texto}
            placeholder="Observacion para esta planeacion"
            placeholderTextColor={colors.textMuted}
            onChangeText={(text) => update(index, { ...observacion, texto: text })}
          />
        </View>
      ))}

      <View style={styles.footerRow}>
        <Pressable
          style={[
            styles.addButton,
            {
              borderColor: colors.primary,
              backgroundColor: colors.surfaceContainerLowest,
            },
          ]}
          onPress={() => add()}
        >
          <Text style={[styles.addButtonText, { color: colors.primary }]}>Agregar observacion</Text>
        </Pressable>
      </View>

      <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Sugerencias rapidas</Text>
      <View style={styles.chipsRow}>
        {SUGERENCIAS.map((suggestion) => (
          <Pressable
            key={suggestion}
            style={[
              styles.chip,
              {
                borderColor: colors.borderLight,
                backgroundColor: colors.surfaceContainerLow,
              },
            ]}
            onPress={() => add(suggestion)}
          >
            <Text style={[styles.chipText, { color: colors.onSurfaceVariant }]}>{suggestion}</Text>
          </Pressable>
        ))}
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
  card: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    fontWeight: "600",
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    minHeight: 90,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    textAlignVertical: "top",
  },
  footerRow: {
    flexDirection: "row",
  },
  addButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: "700",
  },
});

export default SeccionObservaciones;
