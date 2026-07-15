import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { COLORS } from "../../types";
import { CARRERA_OPTIONS, type CarreraSelectorValue } from "./CarreraSelector.constants";

interface CarreraSelectorProps {
  value: string;
  onChange: (value: CarreraSelectorValue) => void;
  error?: string;
  label?: string;
}

const CarreraSelector: React.FC<CarreraSelectorProps> = ({
  value,
  onChange,
  error,
  label = "Carrera*",
}) => {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.card, error ? styles.cardError : null]}>
        <View style={styles.selectedRow}>
          <Text style={[styles.selectedText, !value && styles.placeholderText]}>
            {value || "Selecciona carrera"}
          </Text>
          <MaterialIcons name="school" size={18} color="#6D7F98" />
        </View>
        <View style={styles.optionsRow}>
          {CARRERA_OPTIONS.map((option) => {
            const selected = value === option;
            return (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`Seleccionar carrera ${option}`}
                style={({ pressed }) => [
                  styles.optionButton,
                  selected && styles.optionButtonActive,
                  pressed && { opacity: 0.85 },
                ]}
                onPress={() => onChange(option)}
              >
                <Text style={[styles.optionText, selected && styles.optionTextActive]}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 10,
  },
  label: {
    color: "#6A7D98",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 5,
  },
  card: {
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceHover,
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 10,
  },
  cardError: {
    borderColor: "#DB3B33",
    backgroundColor: "#FFF6F6",
  },
  selectedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  selectedText: {
    color: COLORS.textDark,
    fontSize: 15,
    fontWeight: "700",
  },
  placeholderText: {
    color: "#6D7F98",
    fontWeight: "500",
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionButton: {
    minWidth: 62,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#C8D8EE",
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
  },
  optionButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  optionText: {
    color: "#245C9E",
    fontSize: 13,
    fontWeight: "800",
  },
  optionTextActive: {
    color: COLORS.surface,
  },
  errorText: {
    color: "#C12620",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
});

export default CarreraSelector;
