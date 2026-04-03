import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform, Pressable } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTheme } from "../context/ThemeContext";

interface PostOptionsSheetProps {
  visible: boolean;
  onClose: () => void;
  isOwnPost: boolean;
  onEdit?: () => void;
  onPin?: () => void;
  onDelete?: () => void;
  onSaveToLibrary?: () => void;
  onCopyLink?: () => void;
  onMuteAuthor?: () => void;
  onReport?: () => void;
}

interface OptionItem {
  icon: string;
  label: string;
  onPress?: () => void;
  destructive?: boolean;
  iconBg?: string;
}

const PostOptionsSheet: React.FC<PostOptionsSheetProps> = ({
  visible,
  onClose,
  isOwnPost,
  onEdit,
  onPin,
  onDelete,
  onSaveToLibrary,
  onCopyLink,
  onMuteAuthor,
  onReport,
}) => {
  const { colors } = useTheme();

  const ownOptions: OptionItem[] = [
    { icon: "edit", label: "Editar publicación", onPress: onEdit },
    { icon: "push-pin", label: "Fijar en perfil", onPress: onPin },
    { icon: "delete", label: "Eliminar publicación", onPress: onDelete, destructive: true },
  ];

  const otherOptions: OptionItem[] = [
    { icon: "bookmark-border", label: "Guardar en biblioteca", onPress: onSaveToLibrary },
    { icon: "link", label: "Copiar enlace", onPress: onCopyLink },
    { icon: "volume-off", label: "Silenciar autor", onPress: onMuteAuthor },
    { icon: "flag", label: "Reportar publicación", onPress: onReport, destructive: true },
  ];

  const options = isOwnPost ? ownOptions : otherOptions;
  const headerLabel = isOwnPost ? "GESTIONAR PUBLICACIÓN" : "OPCIONES";

  const containerShadow = Platform.select({
    web: { boxShadow: "0px -24px 48px rgba(0,72,132,0.12)" } as any,
    default: {
      shadowColor: "#004884",
      shadowOffset: { width: 0, height: -24 },
      shadowOpacity: 0.12,
      shadowRadius: 48,
      elevation: 8,
    },
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            { backgroundColor: colors.surfaceContainerLowest },
            containerShadow,
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Handle bar */}
          <View style={styles.handleRow}>
            <View style={[styles.handle, { backgroundColor: `${colors.outlineVariant}50` }]} />
          </View>

          {/* Header */}
          <View style={[styles.headerSection, { borderBottomColor: `${colors.outlineVariant}15` }]}>
            <Text style={[styles.headerLabel, { color: colors.onSurfaceVariant }]}>
              {headerLabel}
            </Text>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {options.map((opt, idx) => {
              const iconBgColor = opt.destructive
                ? `${colors.error}10`
                : colors.surfaceContainerHigh;
              const iconColor = opt.destructive ? colors.error : colors.primary;
              const textColor = opt.destructive ? colors.error : colors.onSurface;

              return (
                <TouchableOpacity
                  key={idx}
                  style={styles.optionRow}
                  onPress={() => {
                    opt.onPress?.();
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionLeft}>
                    <View style={[styles.optionIconBox, { backgroundColor: iconBgColor }]}>
                      <MaterialIcons name={opt.icon as any} size={22} color={iconColor} />
                    </View>
                    <Text style={[styles.optionLabel, { color: textColor }]}>{opt.label}</Text>
                  </View>
                  {!opt.destructive && (
                    <MaterialIcons name="chevron-right" size={18} color={colors.outlineVariant} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Dismiss */}
          <View style={styles.dismissContainer}>
            <TouchableOpacity
              style={[styles.dismissBtn, { backgroundColor: colors.surfaceContainerHigh }]}
              onPress={onClose}
            >
              <Text style={[styles.dismissText, { color: colors.onSurface }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>

          {/* Safe area bottom */}
          <View style={{ height: Platform.OS === "web" ? 16 : 32 }} />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  sheet: {
    width: "100%",
    maxWidth: 390,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  handleRow: {
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 8,
  },
  handle: {
    width: 48,
    height: 6,
    borderRadius: 3,
  },
  headerSection: {
    paddingHorizontal: 32,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  optionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  optionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  optionLabel: {
    fontWeight: "700",
    fontSize: 15,
  },
  dismissContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  dismissBtn: {
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
  },
  dismissText: {
    fontWeight: "700",
    fontSize: 15,
  },
});

export default PostOptionsSheet;
