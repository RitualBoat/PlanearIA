import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { COLORS } from "../../../types";
import type { GrupoMiembro, RolGrupo } from "../../../types";

interface Props {
  miembro: GrupoMiembro;
  onMenuPress: () => void;
}

export const ColaboradorListItem: React.FC<Props> = ({ miembro, onMenuPress }) => {
  const getBadgeStyle = (rol: RolGrupo) => {
    switch (rol) {
      case "titular":
        return { backgroundColor: COLORS.primaryTint, color: COLORS.primaryDark };
      case "co-docente":
        return { backgroundColor: "#E0F7FA", color: "#00695C" };
      case "ponente_invitado":
        return { backgroundColor: COLORS.surfaceSecondary, color: COLORS.textSecondary };
      default:
        return { backgroundColor: COLORS.surfaceSecondary, color: COLORS.textSecondary };
    }
  };

  const getRoleLabel = (rol: RolGrupo) => {
    switch (rol) {
      case "titular": return "Titular";
      case "co-docente": return "Co-docente";
      case "ponente_invitado": return "Ponente Invitado";
      default: return rol;
    }
  };

  const badgeStyle = getBadgeStyle(miembro.rol);

  return (
    <View style={styles.card}>
      <View style={styles.leftBorder} />
      
      {miembro.avatar ? (
        <Image source={{ uri: miembro.avatar }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <MaterialIcons name="person" size={24} color={COLORS.textSecondary} />
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{miembro.nombre}</Text>
        <View style={styles.badgesContainer}>
          <View style={[styles.badge, { backgroundColor: badgeStyle.backgroundColor }]}>
            <Text style={[styles.badgeText, { color: badgeStyle.color }]}>
              {getRoleLabel(miembro.rol)}
            </Text>
          </View>
          {miembro.estado === "pendiente" && (
            <View style={[styles.badge, styles.pendingBadge]}>
              <Text style={styles.pendingBadgeText}>Pendiente</Text>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity 
        style={styles.menuButton} 
        onPress={onMenuPress}
        accessibilityLabel="Opciones"
      >
        <MaterialIcons name="more-vert" size={24} color={COLORS.textSecondary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    position: "relative",
    overflow: "hidden",
  },
  leftBorder: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: COLORS.primary,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginRight: 16,
    marginLeft: 4,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceSecondary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    marginLeft: 4,
  },
  content: {
    flex: 1,
  },
  name: {
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.text,
    marginBottom: 4,
  },
  badgesContainer: {
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  pendingBadge: {
    backgroundColor: COLORS.errorTint,
  },
  pendingBadgeText: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.error,
  },
  menuButton: {
    padding: 8,
    borderRadius: 20,
    marginLeft: 8,
  },
});
