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

const FloatingActionIcons: React.FC = () => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { unreadCount } = useNotificaciones();
  const [menuVisible, setMenuVisible] = useState(false);

  const isWebDesktop = Platform.OS === "web" && width >= 1080;

  const openMenu = useCallback(() => setMenuVisible(true), []);
  const closeMenu = useCallback(() => setMenuVisible(false), []);

  const handleProfile = useCallback(() => {
    navigation.navigate("Perfil");
  }, [navigation]);

  const handleLogout = useCallback(() => {
    setMenuVisible(false);
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Login" }],
      })
    );
  }, [navigation]);

  if (isWebDesktop) return null;

  return (
    <>
      <View style={[styles.wrap, { top: insets.top + 10 }]}>
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.iconBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("Notificaciones")}
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
          >
            <MaterialIcons name="help-outline" size={20} color={COLORS.textDark} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatarBtn} activeOpacity={0.85} onPress={handleProfile}>
            <View style={styles.avatarCircle}>
              <MaterialIcons name="person" size={16} color={COLORS.surface} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <Modal animationType="fade" transparent visible={menuVisible} onRequestClose={closeMenu}>
        <View style={styles.menuOverlay}>
          <View style={styles.menuContainer}>
            <Text style={styles.menuTitle}>Cuenta</Text>
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
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    right: 14,
    zIndex: 20,
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
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
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
