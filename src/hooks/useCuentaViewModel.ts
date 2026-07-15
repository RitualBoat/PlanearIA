import { useCallback } from "react";
import { Alert, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { CommonActions } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../navigation/StackNavigator";
import { type Usuario } from "../context/AuthContext";
import { useAuth } from ".//useAuth";
import logger from "../utils/logger";

type Nav = StackNavigationProp<RootStackParamList, "Cuenta">;

export interface CuentaViewModel {
  usuario: Usuario | null;
  isAuthenticated: boolean;
  handleEditarPerfil: () => void;
  handleCambiarContrasena: () => void;
  handleCerrarSesion: () => void;
  handleEliminarCuenta: (password: string) => Promise<{ success: boolean; error?: string }>;
}

export const useCuentaViewModel = (): CuentaViewModel => {
  const navigation = useNavigation<Nav>();
  const { usuario, isAuthenticated, isGuest, logout, eliminarCuenta } = useAuth();

  const handleEditarPerfil = useCallback(() => {
    navigation.navigate("EditarPerfil");
  }, [navigation]);

  const handleCambiarContrasena = useCallback(() => {
    navigation.navigate("RecuperarContrasena");
  }, [navigation]);

  const handleCerrarSesion = useCallback(() => {
    const goToLogin = () => {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Login" }],
        })
      );
    };

    // A guest has no session to close: go straight to Login. This avoids a
    // confusing "cerrar sesion?" confirm and the web confirm dialog entirely,
    // which is why the guest "Iniciar sesion" button did nothing on web.
    if (isGuest) {
      goToLogin();
      return;
    }

    const performLogout = async () => {
      await logout();
      goToLogin();
    };

    if (Platform.OS === "web") {
      const confirmed =
        typeof globalThis.confirm === "function"
          ? globalThis.confirm("¿Estás seguro de que deseas cerrar sesión?")
          : true;
      if (confirmed) {
        void performLogout();
      }
      return;
    }

    Alert.alert("Cerrar Sesión", "¿Estás seguro de que deseas cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar Sesión",
        style: "destructive",
        onPress: () => void performLogout(),
      },
    ]);
  }, [navigation, logout, isGuest]);

  const handleEliminarCuenta = useCallback(
    async (password: string) => {
      const result = await eliminarCuenta(password);
      if (result.success) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Login" }],
          })
        );
      }
      return result;
    },
    [navigation, eliminarCuenta]
  );

  return {
    usuario,
    isAuthenticated,
    handleEditarPerfil,
    handleCambiarContrasena,
    handleCerrarSesion,
    handleEliminarCuenta,
  };
};
