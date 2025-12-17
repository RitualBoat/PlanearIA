import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSyncPlaneaciones } from "../sync";

/**
 * Props del componente
 */
interface SyncStatusBadgeProps {
  showText?: boolean;
  compact?: boolean;
  showPendingCount?: boolean;
}

/**
 * Badge que muestra el estado de sincronización
 * Toca para forzar sync manual
 */
const SyncStatusBadge: React.FC<SyncStatusBadgeProps> = ({
  showText = true,
  compact = false,
  showPendingCount = true,
}) => {
  const { syncStatus, isOnline, pendingCount, forceSync, isSyncConfigured } =
    useSyncPlaneaciones();

  const [isSyncing, setIsSyncing] = React.useState(false);

  /**
   * Obtiene el icono según el estado
   */
  const getIcon = (): keyof typeof MaterialIcons.glyphMap => {
    if (!isOnline) return "cloud-off";
    if (isSyncing || syncStatus === "syncing") return "sync";
    if (syncStatus === "error") return "error-outline";
    if (syncStatus === "synced") return "cloud-done";
    if (pendingCount > 0) return "cloud-upload";
    return "cloud-queue";
  };

  /**
   * Obtiene el color según el estado
   */
  const getColor = (): string => {
    if (!isOnline) return "#FF9800"; // Naranja
    if (syncStatus === "error") return "#F44336"; // Rojo
    if (syncStatus === "synced" && pendingCount === 0) return "#4CAF50"; // Verde
    if (pendingCount > 0) return "#2196F3"; // Azul
    return "#9E9E9E"; // Gris
  };

  /**
   * Obtiene el texto según el estado
   */
  const getText = (): string => {
    if (!isSyncConfigured) return "Local";
    if (!isOnline) return "Sin conexión";
    if (isSyncing) return "Sincronizando...";
    if (syncStatus === "error") return "Error";
    if (pendingCount > 0) return `${pendingCount} pendientes`;
    if (syncStatus === "synced") return "Sincronizado";
    return "Listo";
  };

  /**
   * Maneja el tap para sincronizar
   */
  const handlePress = async () => {
    if (!isOnline || !isSyncConfigured || isSyncing) return;

    setIsSyncing(true);
    try {
      await forceSync();
    } finally {
      setIsSyncing(false);
    }
  };

  const color = getColor();
  const iconSize = compact ? 16 : 20;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        compact && styles.containerCompact,
        { borderColor: color },
      ]}
      onPress={handlePress}
      disabled={!isOnline || !isSyncConfigured || isSyncing}
      activeOpacity={0.7}
    >
      {isSyncing ? (
        <ActivityIndicator size="small" color={color} />
      ) : (
        <MaterialIcons name={getIcon()} size={iconSize} color={color} />
      )}

      {showText && <Text style={[styles.text, { color }]}>{getText()}</Text>}

      {showPendingCount && pendingCount > 0 && !showText && (
        <View style={[styles.badge, { backgroundColor: color }]}>
          <Text style={styles.badgeText}>{pendingCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderWidth: 1,
    gap: 6,
  },
  containerCompact: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: "500",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
  },
});

export default SyncStatusBadge;
