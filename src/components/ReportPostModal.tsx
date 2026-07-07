import React, { useState } from "react";
import { View, Text, StyleSheet, Modal, Platform, Pressable } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";

interface ReportPostModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

const REPORT_REASONS = ["Spam", "Contenido inapropiado", "Información falsa", "Otro"];

const ReportPostModal: React.FC<ReportPostModalProps> = ({ visible, onClose, onSubmit }) => {
  const { colors } = useTheme();
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!selectedReason) return;
    onSubmit(selectedReason);
    setSelectedReason(null);
  };

  const handleClose = () => {
    setSelectedReason(null);
    onClose();
  };

  const modalShadow = Platform.select({
    web: { boxShadow: "0px 24px 48px rgba(0,72,132,0.08)" } as any,
    default: {
      shadowColor: "#004884",
      shadowOffset: { width: 0, height: 24 },
      shadowOpacity: 0.08,
      shadowRadius: 48,
      elevation: 8,
    },
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable
          style={[styles.modal, { backgroundColor: colors.surfaceContainerLowest }, modalShadow]}
          onPress={(e) => e?.stopPropagation?.()}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={[styles.headerIcon, { backgroundColor: colors.surfaceContainerLow }]}>
              <MaterialIcons name="flag" size={22} color={colors.primary} />
            </View>
            <Pressable
              onPress={handleClose}
              style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.6 }]}
            >
              <MaterialIcons name="close" size={20} color={colors.onSurfaceVariant} />
            </Pressable>
          </View>

          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={[styles.title, { color: colors.primary }]}>Reportar publicación</Text>
            <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
              ¿Por qué quieres reportar esta publicación? Tu reporte es anónimo.
            </Text>
          </View>

          {/* Radio options */}
          <View style={styles.optionsContainer}>
            {REPORT_REASONS.map((reason) => {
              const isSelected = selectedReason === reason;
              return (
                <Pressable
                  key={reason}
                  style={({ pressed }) => [
                    styles.optionRow,
                    {
                      backgroundColor: isSelected
                        ? colors.surfaceContainerHigh
                        : colors.surfaceContainerLow,
                      borderColor: isSelected ? `${colors.outlineVariant}50` : "transparent",
                    },
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => setSelectedReason(reason)}
                >
                  <View
                    style={[
                      styles.radioCircle,
                      {
                        borderColor: isSelected ? colors.primary : colors.outlineVariant,
                        backgroundColor: isSelected ? colors.primary : "transparent",
                      },
                    ]}
                  >
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                  <Text style={[styles.optionLabel, { color: colors.onSurface }]}>{reason}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Submit button */}
          <View style={styles.submitContainer}>
            <Pressable
              onPress={handleSubmit}
              disabled={!selectedReason}
              style={({ pressed }) => [
                { opacity: selectedReason ? 1 : 0.4 },
                pressed && { opacity: 0.85 },
              ]}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryContainer]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.submitBtn}
              >
                <Text style={styles.submitBtnText}>Enviar reporte</Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              onPress={handleClose}
              style={({ pressed }) => [styles.cancelBtn, pressed && { opacity: 0.6 }]}
            >
              <Text style={[styles.cancelText, { color: colors.primary }]}>Cancelar</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modal: {
    width: "100%",
    maxWidth: 390,
    borderRadius: 24,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 32,
    paddingTop: 32,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  titleSection: {
    paddingHorizontal: 32,
    paddingTop: 16,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.3,
    lineHeight: 28,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  optionsContainer: {
    paddingHorizontal: 32,
    gap: 10,
    marginBottom: 24,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFF",
  },
  optionLabel: {
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: -0.2,
  },
  submitContainer: {
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
  submitBtn: {
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    ...Platform.select({
      web: { boxShadow: "0px 4px 12px rgba(0,69,128,0.15)" } as any,
      default: {
        shadowColor: "#004580",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 4,
      },
    }),
  },
  submitBtnText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
  },
  cancelBtn: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 8,
  },
  cancelText: {
    fontWeight: "700",
    fontSize: 14,
  },
});

export default ReportPostModal;
