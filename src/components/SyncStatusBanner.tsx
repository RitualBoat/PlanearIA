/**
 * Global sync/offline UX.
 *
 * SyncOfflineBar: persistent top bar shown while the device is offline or
 * the backend is unreachable. The app stays fully usable; the bar only
 * informs that changes are being saved locally.
 *
 * SyncNoticeToast: transient bottom toast for sync results ("Sincronización
 * exitosa", "Conexión restablecida", warnings). Auto-dismissed by the
 * SyncProvider, tap to dismiss early.
 */

import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../../types";
import { useSyncStatus, type SyncNotice } from "../context/SyncContext";

export const SyncOfflineBar: React.FC = () => {
  const { isOnline, status, pendingCount, syncEnabled, syncNow } = useSyncStatus();
  const insets = useSafeAreaInsets();

  const showOffline = !isOnline;
  const showServerDown = isOnline && syncEnabled && status === "error";

  if (!showOffline && !showServerDown) return null;

  const pendingSuffix = pendingCount > 0 ? ` ${pendingCount} cambios por sincronizar.` : "";
  const message = showOffline
    ? `Sin conexión. Puedes seguir trabajando: tus cambios se guardan en este dispositivo.${pendingSuffix}`
    : `Servidor no disponible. Trabajando con datos locales.${pendingSuffix}`;

  return (
    <View
      style={[styles.bar, { paddingTop: insets.top + 8 }]}
      accessibilityRole="alert"
      accessibilityLabel={message}
    >
      <MaterialIcons
        name={showOffline ? "cloud-off" : "cloud-queue"}
        size={16}
        color={COLORS.textOnPrimary}
      />
      <Text style={styles.barText} numberOfLines={2}>
        {message}
      </Text>
      {showServerDown && (
        <TouchableOpacity
          onPress={() => void syncNow("manual")}
          accessibilityRole="button"
          accessibilityLabel="Reintentar sincronización"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialIcons name="refresh" size={18} color={COLORS.textOnPrimary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const toastColor = (kind: SyncNotice["kind"]): string => {
  if (kind === "success") return COLORS.success;
  if (kind === "warning") return COLORS.warning;
  return COLORS.primary;
};

const toastIcon = (kind: SyncNotice["kind"]): keyof typeof MaterialIcons.glyphMap => {
  if (kind === "success") return "cloud-done";
  if (kind === "warning") return "error-outline";
  return "sync";
};

export const SyncNoticeToast: React.FC = () => {
  const { notice, dismissNotice } = useSyncStatus();
  const insets = useSafeAreaInsets();

  if (!notice) return null;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.toastWrapper, { bottom: insets.bottom + 28 }]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={dismissNotice}
        style={[styles.toast, { backgroundColor: toastColor(notice.kind) }]}
        accessibilityRole="alert"
        accessibilityLabel={notice.message}
      >
        <MaterialIcons name={toastIcon(notice.kind)} size={18} color={COLORS.textOnPrimary} />
        <Text style={styles.toastText} numberOfLines={2}>
          {notice.message}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingBottom: 8,
    backgroundColor: COLORS.warning,
  },
  barText: {
    flex: 1,
    color: COLORS.textOnPrimary,
    fontSize: 13,
    fontWeight: "600",
  },
  toastWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1000,
    elevation: 10,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    maxWidth: 480,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  toastText: {
    color: COLORS.textOnPrimary,
    fontSize: 13,
    fontWeight: "600",
    flexShrink: 1,
  },
});
