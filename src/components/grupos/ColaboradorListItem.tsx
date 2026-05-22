import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { User, MoreVertical } from "lucide-react-native";
import { GrupoMiembro, RolGrupo } from "../../../types";
import { colors } from "../../themes/colors";
import { typography } from "../../themes/typography";

interface Props {
  miembro: GrupoMiembro;
  onMenuPress: () => void;
}

export const ColaboradorListItem: React.FC<Props> = ({ miembro, onMenuPress }) => {
  const getBadgeStyle = (rol: RolGrupo) => {
    switch (rol) {
      case "titular":
        return { backgroundColor: colors.primaryFixed, color: colors.onPrimaryFixed };
      case "co-docente":
        return { backgroundColor: colors.secondaryFixed, color: colors.onSecondaryFixed };
      case "ponente_invitado":
        return { backgroundColor: colors.surfaceVariant, color: colors.onSurfaceVariant };
      default:
        return { backgroundColor: colors.surfaceVariant, color: colors.onSurfaceVariant };
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
          <User size={24} color={colors.onSurfaceVariant} />
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
        <MoreVertical size={24} color={colors.onSurfaceVariant} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(191, 199, 212, 0.2)",
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
    backgroundColor: colors.primary,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.surfaceContainerLow,
    marginRight: 16,
    marginLeft: 4,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.surfaceContainerLow,
    backgroundColor: colors.surfaceVariant,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    marginLeft: 4,
  },
  content: {
    flex: 1,
  },
  name: {
    ...typography.titleLg,
    fontSize: 16,
    lineHeight: 24,
    color: colors.onSurface,
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
    ...typography.labelMd,
  },
  pendingBadge: {
    backgroundColor: colors.errorContainer,
  },
  pendingBadgeText: {
    ...typography.labelMd,
    color: colors.onErrorContainer,
  },
  menuButton: {
    padding: 8,
    borderRadius: 20,
    marginLeft: 8,
  },
});
