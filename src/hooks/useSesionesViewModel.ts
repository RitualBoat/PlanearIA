import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from ".//useAuth";
import * as authService from "../services/auth/authService";
import type { SesionActiva } from "../services/auth/authService";

/**
 * ViewModel for the active sessions screen. Lists the user's live sessions
 * and lets them revoke a single one or every other session.
 */
export function useSesionesViewModel() {
  const navigation = useNavigation();
  const { token } = useAuth();
  const [sesiones, setSesiones] = useState<SesionActiva[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSesiones = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    const res = await authService.listarSesiones(token);
    if (res.success) {
      setSesiones(res.sesiones ?? []);
    } else {
      setError(res.error ?? "No se pudieron cargar las sesiones.");
    }
    setIsLoading(false);
  }, [token]);

  useEffect(() => {
    fetchSesiones();
  }, [fetchSesiones]);

  const revocar = useCallback(
    async (sessionId: string) => {
      if (!token) return;
      setRevokingId(sessionId);
      const res = await authService.revocarSesion(token, sessionId);
      if (res.success) {
        setSesiones((prev) => prev.filter((s) => s.id !== sessionId));
      } else {
        Alert.alert("Error", res.error ?? "No se pudo cerrar la sesión.");
      }
      setRevokingId(null);
    },
    [token]
  );

  const cerrarOtras = useCallback(async () => {
    if (!token) return;
    setRevokingId("__all__");
    const res = await authService.cerrarOtrasSesiones(token);
    if (res.success) {
      setSesiones((prev) => prev.filter((s) => s.current));
    } else {
      Alert.alert("Error", res.error ?? "No se pudieron cerrar las sesiones.");
    }
    setRevokingId(null);
  }, [token]);

  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  return {
    sesiones,
    isLoading,
    revokingId,
    error,
    refetch: fetchSesiones,
    revocar,
    cerrarOtras,
    goBack,
  };
}
