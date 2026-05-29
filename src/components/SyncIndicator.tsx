import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import NetInfo from "@react-native-community/netinfo";
import { COLORS, FONT_SIZES } from "../../types";
import { usePlaneaciones } from "../context/PlaneacionesContext";

/**
 * Componente que muestra el estado de sincronización y conectividad
 */
const SyncIndicator: React.FC = () => {
  const { syncStatus, isLoading } = usePlaneaciones();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Monitorear estado de red
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Obtiene el icono según el estado
   */
  const getIcon = () => {
    if (!isOnline) return "cloud-off";
    if (isLoading || syncStatus === "syncing") return "sync";
    if (syncStatus === "error") return "error";
    if (syncStatus === "synced") return "cloud-done";
    return "cloud-queue";
  };

  /**
   * Obtiene el color según el estado
   */
  const getColor = () => {
    if (!isOnline) return COLORS.warning; // Naranja para offline
    if (syncStatus === "error") return COLORS.errorLight; // Rojo para error
    if (syncStatus === "synced") return COLORS.success; // Verde para synced
    return COLORS.textSecondary; // Gris para loading
  };

  /**
   * Obtiene el texto según el estado
   */
  const getText = () => {
    if (!isOnline) return "Sin conexión";
    if (isLoading) return "Cargando...";
    if (syncStatus === "syncing") return "Sincronizando...";
    if (syncStatus === "error") return "Error";
    if (syncStatus === "synced") return "Guardado";
    return "Esperando...";
  };

  return (
    <View style={styles.container}>
      <MaterialIcons name={getIcon()} size={16} color={getColor()} />
      <Text style={[styles.text, { color: getColor() }]}>{getText()}</Text>
      {!isOnline && (
        <View style={styles.offlineBadge}>
          <Text style={styles.offlineText}>OFFLINE</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    gap: 6,
  },
  text: {
    fontSize: FONT_SIZES.small,
    fontWeight: "500",
  },
  offlineBadge: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 4,
  },
  offlineText: {
    color: "white",
    fontSize: FONT_SIZES.small - 2,
    fontWeight: "bold",
  },
});

export default SyncIndicator;
