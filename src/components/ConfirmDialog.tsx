import React from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export interface ConfirmDialogProps {
  visible: boolean;
  icon?: string;
  iconColor?: string;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  icon,
  iconColor,
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancelar",
  destructive = false,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel} accessibilityRole="button">
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              {icon && (
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: destructive ? "#ffdad6" : "#d4e3ff" },
                  ]}
                >
                  <MaterialIcons
                    name={icon as any}
                    size={28}
                    color={iconColor || (destructive ? "#ba1a1a" : "#005da8")}
                  />
                </View>
              )}
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={onCancel}
                  accessibilityRole="button"
                  accessibilityLabel={cancelLabel}
                >
                  <Text style={styles.cancelText}>{cancelLabel}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.confirmBtn,
                    destructive ? { backgroundColor: "#ba1a1a" } : { backgroundColor: "#005da8" },
                  ]}
                  onPress={onConfirm}
                  accessibilityRole="button"
                  accessibilityLabel={confirmLabel}
                >
                  <Text style={styles.confirmText}>{confirmLabel}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(19, 30, 49, 0.42)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    ...Platform.select({
      web: { backdropFilter: "blur(4px)" } as any,
      default: {},
    }),
  },
  card: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    gap: 12,
    ...Platform.select({
      web: {
        boxShadow: "0px 24px 48px rgba(0, 72, 132, 0.08)",
      } as any,
      default: {
        shadowColor: "#004884",
        shadowOffset: { width: 0, height: 24 },
        shadowOpacity: 0.08,
        shadowRadius: 48,
        elevation: 12,
      },
    }),
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#181c20",
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    color: "#424750",
    textAlign: "center",
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#c0c7d4",
    alignItems: "center",
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#424750",
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

export default ConfirmDialog;
