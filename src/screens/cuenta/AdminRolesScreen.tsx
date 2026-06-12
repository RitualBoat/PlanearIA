import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ASSIGNABLE_ROLES, COLORS, FONT_SIZES, getRoleLabel } from "../../../types";
import type { RolUsuario } from "../../../types";
import { useAdminRolesViewModel } from "../../hooks/useAdminRolesViewModel";
import { usePermission } from "../../hooks/usePermission";

const ROLES: { value: RolUsuario; label: string }[] = ASSIGNABLE_ROLES.map((value) => ({
  value,
  label: getRoleLabel(value),
}));

const rolColor = (rol: RolUsuario): string => {
  switch (rol) {
    case "dev":
      return "#5B2A86";
    case "admin":
      return "#C62828";
    case "supervisor":
      return "#E65100";
    case "docente":
      return COLORS.primary;
    case "alumno":
      return "#2E7D32";
    case "usuario":
    default:
      return COLORS.textSecondary;
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

  if (!permitted) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Administrar Roles</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.center}>
          <MaterialIcons name="lock" size={48} color={COLORS.textTertiary} />
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
          <TouchableOpacity
            style={[styles.rolBadge, { backgroundColor: rolColor(item.rol) + "18" }]}
            onPress={() => setSelectedUser({ id: item.id, nombre: item.nombre })}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <>
                <Text style={[styles.rolText, { color: rolColor(item.rol) }]}>
                  {ROLES.find((r) => r.value === item.rol)?.label || item.rol}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={18} color={rolColor(item.rol)} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Administrar Roles</Text>
        <TouchableOpacity onPress={refetch} style={styles.backBtn}>
          <MaterialIcons name="refresh" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando usuarios...</Text>
        </View>
      ) : usuarios.length === 0 ? (
        <View style={styles.center}>
          <MaterialIcons name="people-outline" size={48} color={COLORS.textTertiary} />
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
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedUser(null)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cambiar rol de {selectedUser?.nombre}</Text>
            {ROLES.map((r) => (
              <TouchableOpacity
                key={r.value}
                style={styles.modalOption}
                onPress={() => {
                  if (selectedUser) {
                    cambiarRol(selectedUser.id, r.value);
                    setSelectedUser(null);
                  }
                }}
              >
                <View style={[styles.rolDot, { backgroundColor: rolColor(r.value) }]} />
                <Text style={styles.modalOptionText}>{r.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.modalCancel} onPress={() => setSelectedUser(null)}>
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: "700",
    color: COLORS.text,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
  },
  emptyText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textTertiary,
    marginTop: 8,
  },
  list: {
    padding: 16,
    gap: 10,
  },
  userCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: COLORS.surface,
    fontWeight: "700",
    fontSize: FONT_SIZES.small,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
    color: COLORS.text,
  },
  userEmail: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
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
    fontSize: 12,
    fontWeight: "600",
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 340,
  },
  modalTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: "700",
    color: COLORS.text,
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
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
  },
  modalCancel: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  modalCancelText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
});

export default AdminRolesScreen;
