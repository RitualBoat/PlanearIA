import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  Modal,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ASSIGNABLE_ROLES, FONT_SIZES, getRoleLabel } from "../../../types";
import type { RolUsuario } from "../../../types";
import { useAdminRolesViewModel } from "../../hooks/useAdminRolesViewModel";
import { usePermission } from "../../hooks/usePermission";
import { useAppTheme } from "../../themes/useAppTheme";
import { ThemedStylesInput } from "../../themes/types";
import type { ColorTokens } from "../../themes/types";

const ROLES: { value: RolUsuario; label: string }[] = ASSIGNABLE_ROLES.map((value) => ({
  value,
  label: getRoleLabel(value),
}));

// Los colores de identidad de rol siguen siendo literales: no existen como tokens y
// mapearlos a la paleta actual cambiaria su color visible. Tokenizarlos es trabajo de
// `tokens-completos`, no de este change. Los dos casos que si tienen token lo usan.
const rolColor = (rol: RolUsuario, colors: ColorTokens): string => {
  switch (rol) {
    case "dev":
      return "#5B2A86";
    case "admin":
      return "#C62828";
    case "supervisor":
      return "#E65100";
    case "docente":
      return colors.primary;
    case "alumno":
      return "#2E7D32";
    case "usuario":
    default:
      return colors.textSecondary;
  }
};

const AdminRolesScreen: React.FC = () => {
  // Frontend gate: deny rendering the roster to anyone without the
  // cambiar_roles permission. This blocks direct navigation/deep links.
  // The backend still validates every listar_usuarios/cambiar_rol call.
  const { can } = usePermission();
  const permitted = can("cambiar_roles");
  const { usuarios, isLoading, updatingId, cambiarRol, refetch, goBack } =
    useAdminRolesViewModel(permitted);
  const [selectedUser, setSelectedUser] = useState<{ id: number; nombre: string } | null>(null);

  const { colors, isDark, scaled, highContrast } = useAppTheme();
  const styles = useMemo(
    () => getStyles({ colors, isDark, scaled, highContrast }),
    [colors, isDark, scaled, highContrast]
  );

  if (!permitted) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={colors.background}
        />
        <View style={styles.header}>
          <Pressable
            onPress={goBack}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Administrar Roles</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.center}>
          <MaterialIcons name="lock" size={48} color={colors.textTertiary} />
          <Text style={styles.emptyText}>No tienes permiso para administrar roles.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }: { item: (typeof usuarios)[0] }) => {
    const initials = `${item.nombre?.[0] || ""}${item.apellidos?.[0] || ""}`.toUpperCase();
    const isUpdating = updatingId === item.id;

    return (
      <View style={styles.userCard}>
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {item.nombre} {item.apellidos || ""}
            </Text>
            <Text style={styles.userEmail}>{item.email}</Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.rolBadge,
              { backgroundColor: rolColor(item.rol, colors) + "18" },
              pressed && { opacity: 0.6 },
            ]}
            onPress={() => setSelectedUser({ id: item.id, nombre: item.nombre })}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <Text style={[styles.rolText, { color: rolColor(item.rol, colors) }]}>
                  {ROLES.find((r) => r.value === item.rol)?.label || item.rol}
                </Text>
                <MaterialIcons
                  name="arrow-drop-down"
                  size={18}
                  color={rolColor(item.rol, colors)}
                />
              </>
            )}
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={goBack}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Administrar Roles</Text>
        <Pressable
          onPress={refetch}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
        >
          <MaterialIcons name="refresh" size={24} color={colors.primary} />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando usuarios...</Text>
        </View>
      ) : usuarios.length === 0 ? (
        <View style={styles.center}>
          <MaterialIcons name="people-outline" size={48} color={colors.textTertiary} />
          <Text style={styles.emptyText}>No hay usuarios registrados</Text>
        </View>
      ) : (
        <FlatList
          data={usuarios}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}

      {/* Role selector modal */}
      <Modal visible={!!selectedUser} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedUser(null)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cambiar rol de {selectedUser?.nombre}</Text>
            {ROLES.map((r) => (
              <Pressable
                key={r.value}
                style={({ pressed }) => [styles.modalOption, pressed && { opacity: 0.6 }]}
                onPress={() => {
                  if (selectedUser) {
                    cambiarRol(selectedUser.id, r.value);
                    setSelectedUser(null);
                  }
                }}
              >
                <View style={[styles.rolDot, { backgroundColor: rolColor(r.value, colors) }]} />
                <Text style={styles.modalOptionText}>{r.label}</Text>
              </Pressable>
            ))}
            <Pressable
              style={({ pressed }) => [styles.modalCancel, pressed && { opacity: 0.6 }]}
              onPress={() => setSelectedUser(null)}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const getStyles = ({ colors, scaled, highContrast }: ThemedStylesInput) => {
  // "Contraste alto": refuerza bordes y texto secundario usando solo tokens del tema.
  const cardBorder = highContrast ? colors.borderStrong : colors.borderLight;
  const subtleText = highContrast ? colors.text : colors.textSecondary;

  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: cardBorder,
    },
    backBtn: {
      padding: 4,
    },
    headerTitle: {
      fontSize: scaled(FONT_SIZES.large),
      fontWeight: "700",
      color: colors.text,
    },
    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: 12,
    },
    loadingText: {
      fontSize: scaled(FONT_SIZES.medium),
      color: subtleText,
    },
    emptyText: {
      fontSize: scaled(FONT_SIZES.medium),
      color: highContrast ? colors.text : colors.textTertiary,
      marginTop: 8,
    },
    list: {
      padding: 16,
      gap: 10,
    },
    userCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 14,
      borderWidth: 1,
      borderColor: cardBorder,
    },
    userRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    avatar: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    avatarText: {
      color: colors.textOnPrimary,
      fontWeight: "700",
      fontSize: scaled(FONT_SIZES.small),
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: scaled(FONT_SIZES.medium),
      fontWeight: "600",
      color: colors.text,
    },
    userEmail: {
      fontSize: scaled(FONT_SIZES.small),
      color: subtleText,
      marginTop: 2,
    },
    rolBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      marginLeft: 8,
    },
    rolText: {
      fontSize: scaled(12),
      fontWeight: "600",
    },
    // Modal
    modalOverlay: {
      flex: 1,
      // Antes era el literal rgba(0,0,0,0.4), que no se adaptaba al tema.
      backgroundColor: colors.overlay,
      justifyContent: "center",
      alignItems: "center",
      padding: 32,
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      width: "100%",
      maxWidth: 340,
    },
    modalTitle: {
      fontSize: scaled(FONT_SIZES.large),
      fontWeight: "700",
      color: colors.text,
      marginBottom: 16,
      textAlign: "center",
    },
    modalOption: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderRadius: 8,
    },
    rolDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: 12,
    },
    modalOptionText: {
      fontSize: scaled(FONT_SIZES.medium),
      color: colors.text,
    },
    modalCancel: {
      marginTop: 12,
      paddingVertical: 12,
      alignItems: "center",
      borderTopWidth: 1,
      borderTopColor: cardBorder,
    },
    modalCancelText: {
      fontSize: scaled(FONT_SIZES.medium),
      color: subtleText,
      fontWeight: "600",
    },
  });
};

export default AdminRolesScreen;
