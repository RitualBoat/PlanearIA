import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../../../hooks/useTheme";
import type { Firma } from "../../../../types/planeacionV2";

export interface SeccionFirmasProps {
  value: Firma[];
  defaultNombre?: string;
  onChange: (next: Firma[]) => void;
}

const DEFAULT_ROLES = [
  "Docente",
  "Coordinacion academica",
  "Direccion",
];

export const SeccionFirmas: React.FC<SeccionFirmasProps> = ({ value, defaultNombre, onChange }) => {
  const { colors } = useTheme();
  const list = value.length > 0 ? value : [{ rol: "Docente", nombre: defaultNombre || "" }];

  const update = (index: number, next: Firma) => {
    onChange(list.map((item, itemIndex) => (itemIndex === index ? next : item)));
  };

  const remove = (index: number) => {
    const next = list.filter((_, itemIndex) => itemIndex !== index);
    onChange(next);
  };

  const add = (rol = "Docente") => {
    onChange([
      ...list,
      {
        rol,
        nombre: rol === "Docente" ? defaultNombre || "" : "",
      },
    ]);
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
      <Text style={[styles.title, { color: colors.onSurface }]}>Firmas</Text>

      {list.map((firma, index) => (
        <View
          key={`firma_${firma.rol}_${index}`}
          style={[
            styles.card,
            {
              borderColor: colors.borderLight,
              backgroundColor: colors.surfaceContainerLow,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Firma {index + 1}</Text>
            <Pressable onPress={() => remove(index)}>
              <MaterialIcons name="delete-outline" size={20} color={colors.error} />
            </Pressable>
          </View>

          <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Rol</Text>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: colors.borderLight,
                backgroundColor: colors.surfaceContainerLowest,
                color: colors.onSurface,
              },
            ]}
            value={firma.rol}
            placeholder="Docente, Coordinacion..."
            placeholderTextColor={colors.textMuted}
            onChangeText={(text) => update(index, { ...firma, rol: text })}
          />

          <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Nombre</Text>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: colors.borderLight,
                backgroundColor: colors.surfaceContainerLowest,
                color: colors.onSurface,
              },
            ]}
            value={firma.nombre}
            placeholder="Nombre completo"
            placeholderTextColor={colors.textMuted}
            onChangeText={(text) => update(index, { ...firma, nombre: text })}
          />
        </View>
      ))}

      <View style={styles.row}>
        <Pressable
          style={[
            styles.actionButton,
            {
              borderColor: colors.primary,
              backgroundColor: colors.surfaceContainerLowest,
            },
          ]}
          onPress={() => add()}
        >
          <Text style={[styles.actionButtonText, { color: colors.primary }]}>Agregar firma</Text>
        </Pressable>
      </View>

      <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Roles rapidos</Text>
      <View style={styles.quickRolesRow}>
        {DEFAULT_ROLES.map((rol) => (
          <Pressable
            key={rol}
            style={[
              styles.quickChip,
              {
                borderColor: colors.borderLight,
                backgroundColor: colors.surfaceContainerLow,
              },
            ]}
            onPress={() => add(rol)}
          >
            <Text style={[styles.quickChipText, { color: colors.onSurfaceVariant }]}>{rol}</Text>
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
    gap: 6,
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
  input: {
    borderWidth: 1,
    borderRadius: 10,
    minHeight: 40,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
  },
  row: {
    flexDirection: "row",
  },
  actionButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "700",
  },
  quickRolesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  quickChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: "600",
  },
});

export default SeccionFirmas;
