import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS, FONT_SIZES } from "../../types";
import { useRealmApp } from "../realm";

/**
 * Props del componente
 */
interface SyncIndicatorRealmProps {
  showText?: boolean;
  compact?: boolean;
  onPress?: () => void;
}

/**
 * Componente que muestra el estado de sincronización con Realm/Atlas
 * Incluye indicador visual y opción de sincronización manual
 */
const SyncIndicatorRealm: React.FC<SyncIndicatorRealmProps> = ({
  showText = true,
  compact = false,
  onPress,
}) => {
  const { syncState, isOnline, isLoading, forceSync, error } = useRealmApp();

  /**
   * Obtiene el icono según el estado
   */
  const getIcon = (): keyof typeof MaterialIcons.glyphMap => {
    if (!isOnline) return "cloud-off";
    if (isLoading) return "sync";
    if (error || syncState === "error") return "error";
    if (syncState === "active") return "cloud-done";
    if (syncState === "connecting") return "cloud-queue";
    return "cloud-queue";
  };

  /**
   * Obtiene el color según el estado
   */
  const getColor = (): string => {
    if (!isOnline) return "#FF9800"; // Naranja para offline
    if (error || syncState === "error") return "#f44336"; // Rojo para error
    if (syncState === "active") return "#4CAF50"; // Verde para synced
    if (syncState === "connecting") return "#2196F3"; // Azul para connecting
    return COLORS.textSecondary; // Gris por defecto
  };

  /**
   * Obtiene el texto según el estado
   */
  const getText = (): string => {
    if (!isOnline) return "Sin conexión";
    if (isLoading) return "Sincronizando...";
    if (error) return "Error";
    if (syncState === "active") return "Sincronizado";
    if (syncState === "connecting") return "Conectando...";
    if (syncState === "disconnected") return "Desconectado";
    return "Local";
  };

  /**
   * Maneja el tap para sincronización manual
   */
  const handlePress = async () => {
    if (onPress) {
      onPress();
    } else if (isOnline) {
      await forceSync();
    }
  };

  const iconSize = compact ? 14 : 18;
  const color = getColor();

  return (
    <TouchableOpacity
      style={[styles.container, compact && styles.containerCompact]}
      onPress={handlePress}
      disabled={!isOnline && !onPress}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={color} />
      ) : (
        <MaterialIcons name={getIcon()} size={iconSize} color={color} />
      )}

      {showText && (
        <Text style={[styles.text, compact && styles.textCompact, { color }]}>
          {getText()}
        </Text>
      )}

      {/* Indicador de punto para estado offline con cambios pendientes */}
      {!isOnline && syncState !== "active" && (
        <View style={styles.pendingDot} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.05)",
    gap: 6,
  },
  containerCompact: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 4,
  },
  text: {
    fontSize: FONT_SIZES.small || 12,
    fontWeight: "500",
  },
  textCompact: {
    fontSize: 10,
  },
  pendingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF9800",
    marginLeft: 2,
  },
});

export default SyncIndicatorRealm;
