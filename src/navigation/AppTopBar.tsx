import React, { useCallback, useMemo, useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CommonActions, useNavigation } from "@react-navigation/native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useAppTheme } from "../themes/useAppTheme";
import { getElevation, radii, scaleType, spacing, typography, zIndex } from "../themes/tokens";
import type { ThemedStylesInput } from "../themes/types";
import { useNotificaciones } from "../context/NotificacionesContext";
import { useAuth } from "../context/AuthContext";
import { navigateToHub } from "./navigateToHub";

/**
 * Chrome superior del shell. Hereda las tres afordancias del antiguo menu
 * flotante (notificaciones con badge, ayuda, menu de cuenta) pero en el flujo del layout:
 * ocupa su propio espacio en vez de superponerse al contenido (riesgo R4), con
 * toque de 44 pt y tokens de tema en runtime. El rediseno de la pantalla de
 * notificaciones pertenece a notificaciones-chrome; aqui solo vive la campana.
 */
const AppTopBar: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { unreadCount } = useNotificaciones();
  const { logout } = useAuth();
  const { colors, isDark, scaled, highContrast } = useAppTheme();
  const [menuVisible, setMenuVisible] = useState(false);

  const styles = useMemo(
    () => getStyles({ colors, isDark, scaled, highContrast }),
    [colors, isDark, scaled, highContrast]
  );

  const openMenu = useCallback(() => setMenuVisible(true), []);
  const closeMenu = useCallback(() => setMenuVisible(false), []);

  const handlePerfil = useCallback(() => {
    setMenuVisible(false);
    navigateToHub(navigation, "MasTab", "Perfil");
  }, [navigation]);

  const handleCuenta = useCallback(() => {
    setMenuVisible(false);
    navigateToHub(navigation, "MasTab", "Cuenta");
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
      <View style={[styles.bar, { paddingTop: insets.top }]}>
        <Text style={styles.marca} accessibilityRole="header">
          PlanearIA
        </Text>
        <View style={styles.acciones}>
          <Pressable
            style={({ pressed }) => [styles.accion, pressed && styles.accionPressed]}
            onPress={() => navigation.navigate("Notificaciones" as never)}
            accessibilityRole="button"
            accessibilityLabel={
              unreadCount > 0
                ? `Abrir notificaciones, ${unreadCount} sin leer`
                : "Abrir notificaciones"
            }
          >
            <View style={styles.accionIcono}>
              <MaterialIcons name="notifications-none" size={22} color={colors.text} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeTexto}>{unreadCount > 99 ? "99+" : unreadCount}</Text>
                </View>
              )}
            </View>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.accion, pressed && styles.accionPressed]}
            onPress={() => navigation.navigate("Ayuda" as never)}
            accessibilityRole="button"
            accessibilityLabel="Abrir centro de ayuda"
          >
            <MaterialIcons name="help-outline" size={22} color={colors.text} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.accion, pressed && styles.accionPressed]}
            onPress={openMenu}
            accessibilityRole="button"
            accessibilityLabel="Abrir menu de cuenta"
          >
            <View style={styles.avatar}>
              <MaterialIcons name="person" size={18} color={colors.textOnPrimary} />
            </View>
          </Pressable>
        </View>
      </View>

      <Modal animationType="fade" transparent visible={menuVisible} onRequestClose={closeMenu}>
        <Pressable
          style={styles.menuOverlay}
          onPress={closeMenu}
          accessibilityRole="button"
          accessibilityLabel="Cerrar menu de cuenta"
        >
          <View style={styles.menu}>
            <Text style={styles.menuTitulo}>Cuenta</Text>
            <Pressable
              style={({ pressed }) => [styles.menuOpcion, pressed && styles.menuOpcionPressed]}
              onPress={handlePerfil}
              accessibilityRole="button"
              accessibilityLabel="Mi perfil"
            >
              <MaterialIcons name="person" size={20} color={colors.primary} />
              <Text style={styles.menuTexto}>Mi perfil</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.menuOpcion, pressed && styles.menuOpcionPressed]}
              onPress={handleCuenta}
              accessibilityRole="button"
              accessibilityLabel="Cuenta y seguridad"
            >
              <MaterialIcons name="manage-accounts" size={20} color={colors.primary} />
              <Text style={styles.menuTexto}>Cuenta y seguridad</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.menuOpcion, pressed && styles.menuOpcionPressed]}
              onPress={handleLogout}
              accessibilityRole="button"
              accessibilityLabel="Cerrar sesion"
            >
              <MaterialIcons name="logout" size={20} color={colors.error} />
              <Text style={[styles.menuTexto, { color: colors.error }]}>Cerrar sesion</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.menuCerrar, pressed && styles.menuOpcionPressed]}
              onPress={closeMenu}
              accessibilityRole="button"
              accessibilityLabel="Cancelar"
            >
              <Text style={styles.menuCerrarTexto}>Cancelar</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const getStyles = ({ colors, scaled, highContrast }: ThemedStylesInput) => {
  const elevation = getElevation(colors);
  return StyleSheet.create({
    bar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      minHeight: 56,
      paddingHorizontal: spacing.lg,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: highContrast ? colors.borderStrong : colors.border,
      zIndex: zIndex.sticky,
    },
    marca: {
      ...scaleType(typography.subtitle, scaled),
      color: colors.primary,
    },
    acciones: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },
    accion: {
      minWidth: 44,
      minHeight: 44,
      borderRadius: radii.pill,
      alignItems: "center",
      justifyContent: "center",
    },
    accionPressed: {
      backgroundColor: colors.surfaceHover,
    },
    accionIcono: {
      position: "relative",
      alignItems: "center",
      justifyContent: "center",
    },
    badge: {
      position: "absolute",
      top: -6,
      right: -8,
      backgroundColor: colors.error,
      borderRadius: radii.pill,
      minWidth: 16,
      height: 16,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 3,
    },
    badgeTexto: {
      fontSize: 9,
      lineHeight: 12,
      fontWeight: "800",
      color: colors.textOnPrimary,
      textAlign: "center",
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: radii.pill,
      backgroundColor: colors.primaryMuted,
      alignItems: "center",
      justifyContent: "center",
    },
    menuOverlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: Platform.OS === "web" ? "flex-start" : "center",
      alignItems: Platform.OS === "web" ? "flex-end" : "center",
      paddingTop: Platform.OS === "web" ? 64 : 0,
      paddingRight: Platform.OS === "web" ? spacing.xl : 0,
    },
    menu: {
      width: 268,
      backgroundColor: colors.surface,
      borderRadius: radii.lg,
      borderWidth: 1,
      borderColor: highContrast ? colors.borderStrong : colors.borderLight,
      padding: spacing.xl,
      gap: spacing.sm,
      ...elevation.level3,
    },
    menuTitulo: {
      ...scaleType(typography.subtitle, scaled),
      color: colors.text,
      marginBottom: spacing.xs,
    },
    menuOpcion: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      minHeight: 44,
      paddingHorizontal: spacing.xs,
      borderRadius: radii.sm,
    },
    menuOpcionPressed: {
      backgroundColor: colors.surfaceHover,
    },
    menuTexto: {
      ...scaleType(typography.bodyStrong, scaled),
      color: colors.text,
    },
    menuCerrar: {
      marginTop: spacing.xs,
      minHeight: 44,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radii.md,
      backgroundColor: colors.surfaceTertiary,
    },
    menuCerrarTexto: {
      ...scaleType(typography.bodyStrong, scaled),
      color: highContrast ? colors.text : colors.textSecondary,
    },
  });
};

export default AppTopBar;
