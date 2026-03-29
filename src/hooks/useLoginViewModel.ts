import { useState, useCallback } from "react";
import { Platform, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../navigation/StackNavigator";
import type { LoginFormData } from "../../types";

type Nav = StackNavigationProp<RootStackParamList, "Login">;

export interface LoginViewModel {
  formData: LoginFormData;
  isLoading: boolean;
  updateFormData: (field: keyof LoginFormData, value: string) => void;
  handleLogin: () => void;
  handleForgotPassword: () => void;
  handleRegister: () => void;
}

export const useLoginViewModel = (): LoginViewModel => {
  const navigation = useNavigation<Nav>();
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const updateFormData = useCallback((field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const showAlert = useCallback((title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(message);
    } else {
      Alert.alert(title, message);
    }
  }, []);

  const validateForm = useCallback((): boolean => {
    if (!formData.username.trim()) {
      showAlert("Error", "Por favor ingrese su nombre de usuario");
      return false;
    }
    if (!formData.password.trim()) {
      showAlert("Error", "Por favor ingrese su contraseña");
      return false;
    }
    if (formData.password.length < 4) {
      showAlert("Error", "La contraseña debe tener al menos 4 caracteres");
      return false;
    }
    return true;
  }, [formData, showAlert]);

  const authenticateUser = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      console.log("[auth] Authenticated:", formData.username);
      navigation.replace("MainTabs");
    }, 2000);
  }, [formData.username, navigation]);

  const handleLogin = useCallback(() => {
    if (!validateForm()) return;

    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        `¿Desea iniciar sesión con el usuario: ${formData.username}?`
      );
      if (confirmed) authenticateUser();
    } else {
      Alert.alert(
        "Confirmación de Inicio de Sesión",
        `¿Desea iniciar sesión con el usuario: ${formData.username}?`,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Aceptar", onPress: authenticateUser },
        ],
        { cancelable: false }
      );
    }
  }, [formData.username, validateForm, authenticateUser]);

  const handleForgotPassword = useCallback(() => {
    showAlert("Recuperar Contraseña", "Esta funcionalidad estará disponible próximamente.");
  }, [showAlert]);

  const handleRegister = useCallback(() => {
    showAlert("Registro", "Esta funcionalidad estará disponible próximamente.");
  }, [showAlert]);

  return {
    formData,
    isLoading,
    updateFormData,
    handleLogin,
    handleForgotPassword,
    handleRegister,
  };
};
