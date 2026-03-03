import { useCallback } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { CommonActions } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../navigation/StackNavigator";

type Nav = StackNavigationProp<RootStackParamList, "Cuenta">;

export interface CuentaViewModel {
  handleEditarPerfil: () => void;
  handleCambiarContrasena: () => void;
  handleCerrarSesion: () => void;
}

export const useCuentaViewModel = (): CuentaViewModel => {
  const navigation = useNavigation<Nav>();

  const handleEditarPerfil = useCallback(() => {
    console.log("[cuenta] Edit profile");
  }, []);

  const handleCambiarContrasena = useCallback(() => {
    console.log("[cuenta] Change password");
  }, []);

  const handleCerrarSesion = useCallback(() => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro de que deseas cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar Sesión",
        style: "destructive",
        onPress: () => {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "Login" }],
            }),
          );
        },
      },
    ]);
  }, [navigation]);

  return {
    handleEditarPerfil,
    handleCambiarContrasena,
    handleCerrarSesion,
  };
};
