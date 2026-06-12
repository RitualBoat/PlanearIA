import React, { useState, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  Modal,
  Pressable,
  Text,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, CommonActions } from "@react-navigation/native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { COLORS } from "../../types";
import { useNotificaciones } from "../context/NotificacionesContext";
import { useAuth } from "../context/AuthContext";

const FloatingActionIcons: React.FC = () => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { unreadCount } = useNotificaciones();
  const { logout } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);

  const isWeb = Platform.OS === "web";
  const topOffset = isWeb ? 18 : insets.top + 10;
  const rightOffset = isWeb && width >= 768 ? 24 : 14;

  const openMenu = useCallback(() => setMenuVisible(true), []);
  const closeMenu = useCallback(() => setMenuVisible(false), []);

  const handleProfile = useCallback(() => {
    setMenuVisible(false);
    navigation.navigate("Perfil");
  }, [navigation]);

  const handleAccount = useCallback(() => {
    setMenuVisible(false);
    navigation.navigate("Cuenta");
  }, [navigation]);

  const handleLogout = useCallback(async () => {
    setMenuVisible(false);
    await logout();
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Login" }],
      })
    );
  }, [logout, navigation]);

  return (
    <>
      <View style={[styles.wrap, { top: topOffset, right: rightOffset }]} pointerEvents="box-none">
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.iconBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("Notificaciones")}
            accessibilityRole="button"
            accessibilityLabel="Abrir notificaciones"
          >
            <View style={{ position: "relative", alignItems: "center", justifyContent: "center" }}>
              <MaterialIcons name="notifications-none" size={20} color={COLORS.textDark} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("Ayuda")}
            accessibilityRole="button"
            accessibilityLabel="Abrir centro de ayuda"
          >
            <MaterialIcons name="help-outline" size={20} color={COLORS.textDark} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.avatarBtn}
            activeOpacity={0.85}
            onPress={openMenu}
            accessibilityRole="button"
            accessibilityLabel="Abrir menú de cuenta"
          >
            <View style={styles.avatarCircle}>
              <MaterialIcons name="person" size={16} color={COLORS.surface} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <Modal animationType="fade" transparent visible={menuVisible} onRequestClose={closeMenu}>
        <Pressable style={styles.menuOverlay} onPress={closeMenu}>
          <View style={styles.menuContainer}>
            <Text style={styles.menuTitle}>Cuenta</Text>
            <Pressable style={styles.menuOption} onPress={handleAccount}>
              <MaterialIcons name="manage-accounts" size={20} color={COLORS.primary} />
              <Text style={styles.menuText}>Cuenta y seguridad</Text>
            </Pressable>
            <Pressable style={styles.menuOption} onPress={handleProfile}>
              <MaterialIcons name="person" size={20} color={COLORS.primary} />
              <Text style={styles.menuText}>Mi perfil</Text>
            </Pressable>
            <Pressable style={styles.menuOption} onPress={handleLogout}>
              <MaterialIcons name="logout" size={20} color={COLORS.error} />
              <Text style={[styles.menuText, { color: COLORS.error }]}>Cerrar sesión</Text>
            </Pressable>
            <Pressable style={styles.closeBtn} onPress={closeMenu}>
              <Text style={styles.closeBtnText}>Cancelar</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    zIndex: 1000,
    elevation: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.surfaceTertiary,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: Platform.OS === "web" ? "0px 8px 18px rgba(20, 48, 92, 0.12)" : undefined,
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: COLORS.error,
    borderRadius: 7,
    minWidth: 14,
    height: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 8,
    fontWeight: "800",
    textAlign: "center",
  },
  avatarBtn: {
    marginLeft: 0,
  },
  avatarCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: Platform.OS === "web" ? "0px 8px 18px rgba(20, 48, 92, 0.12)" : undefined,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: Platform.OS === "web" ? "flex-start" : "center",
    alignItems: Platform.OS === "web" ? "flex-end" : "center",
    paddingTop: Platform.OS === "web" ? 62 : 0,
    paddingRight: Platform.OS === "web" ? 24 : 0,
  },
  menuContainer: {
    width: 260,
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 22,
    gap: 10,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  menuOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  menuText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },
  closeBtn: {
    marginTop: 6,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceTertiary,
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
});

export default FloatingActionIcons;
