import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { API_CONFIG } from "../sync/config/apiConfig";
import type { RolUsuario } from "../../types";

interface UsuarioListItem {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  rol: RolUsuario;
  fechaCreacion: string;
}

export function useAdminRolesViewModel(enabled: boolean = true) {
  const navigation = useNavigation();
  const { token } = useAuth();
  const [usuarios, setUsuarios] = useState<UsuarioListItem[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchUsuarios = useCallback(async () => {
    if (!token || !enabled) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_CONFIG.baseUrl}/api/auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": API_CONFIG.apiSecret,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "listar_usuarios" }),
      });
      const json = await res.json();
      if (json.success) {
        setUsuarios(json.data.usuarios);
      } else {
        Alert.alert("Error", json.error || "No se pudieron cargar los usuarios.");
      }
    } catch {
      Alert.alert("Error", "No se pudo conectar al servidor.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  const cambiarRol = useCallback(
    async (targetUserId: number, nuevoRol: RolUsuario) => {
      if (!token) return;
      setUpdatingId(targetUserId);
      try {
        const res = await fetch(`${API_CONFIG.baseUrl}/api/auth`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": API_CONFIG.apiSecret,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action: "cambiar_rol", targetUserId, nuevoRol }),
        });
        const json = await res.json();
        if (json.success) {
          setUsuarios((prev) =>
            prev.map((u) => (u.id === targetUserId ? { ...u, rol: nuevoRol } : u))
          );
        } else {
          Alert.alert("Error", json.error || "No se pudo cambiar el rol.");
        }
      } catch {
        Alert.alert("Error", "No se pudo conectar al servidor.");
      } finally {
        setUpdatingId(null);
      }
    },
    [token, enabled]
  );

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return {
    usuarios,
    isLoading,
    updatingId,
    cambiarRol,
    refetch: fetchUsuarios,
    goBack,
  };
}
