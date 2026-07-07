import React from "react";
import { Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export interface PhotoPickerOption {
  icon: string;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

interface PhotoPickerModalProps {
  visible: boolean;
  options: PhotoPickerOption[];
  onClose: () => void;
}

const PhotoPickerModal: React.FC<PhotoPickerModalProps> = ({ visible, options, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose} accessibilityRole="button">
        {/* Sheet claims the touch responder so taps inside it never reach the
            backdrop's onPress (the old inner TouchableWithoutFeedback role). */}
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <View style={styles.handle} />
          <Text style={styles.title}>Cambiar foto</Text>
          {options.map((opt, i) => (
            <Pressable
              key={i}
              style={({ pressed }) => [styles.option, pressed && { opacity: 0.6 }]}
              onPress={() => {
                opt.onPress();
                onClose();
              }}
              accessibilityRole="button"
              accessibilityLabel={opt.label}
            >
              <MaterialIcons
                name={opt.icon as any}
                size={22}
                color={opt.destructive ? "#ba1a1a" : "#181c20"}
              />
              <Text style={[styles.optionText, opt.destructive && { color: "#ba1a1a" }]}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
          <Pressable
            style={({ pressed }) => [styles.cancelBtn, pressed && { opacity: 0.6 }]}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Cerrar"
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
    ...Platform.select({
      web: { backdropFilter: "blur(2px)" } as any,
      default: {},
    }),
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "web" ? 24 : 40,
    paddingTop: 12,
    gap: 4,
    ...Platform.select({
      web: {
        boxShadow: "0px -8px 24px rgba(0, 72, 132, 0.08)",
      } as any,
      default: {
        shadowColor: "#004884",
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
        elevation: 12,
      },
    }),
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e0e3e7",
    alignSelf: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#181c20",
    marginBottom: 8,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  optionText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#181c20",
  },
  cancelBtn: {
    marginTop: 8,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#f1f4f8",
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#424750",
  },
});

export default PhotoPickerModal;
