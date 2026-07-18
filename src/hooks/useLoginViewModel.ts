import { useState, useCallback } from "react";
import { Platform, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { AppRoutesParamList } from "../navigation/StackNavigator";
import type { LoginFormData } from "../../types";
import { useAuth } from "../context/AuthContext";
import logger from "../utils/logger";

type Nav = StackNavigationProp<AppRoutesParamList, "Login">;

export interface LoginViewModel {
  formData: LoginFormData;
  isLoading: boolean;
  updateFormData: (field: keyof LoginFormData, value: string) => void;
  handleLogin: () => void;
  handleForgotPassword: () => void;
  handleRegister: () => void;
  handleEntrarComoInvitado: () => void;
  handleLoginDesarrollador: () => void;
  isDevMode: boolean;
}

export const useLoginViewModel = (): LoginViewModel => {
  const navigation = useNavigation<Nav>();
  const { login, loginComoInvitado, loginComoDesarrollador } = useAuth();
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
      showAlert("Error", "Por favor ingrese su email");
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

  const handleLogin = useCallback(async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const result = await login(formData.username.trim(), formData.password);
      if (result.success) {
        logger.log("[auth] Login exitoso:", formData.username);
        navigation.replace("MainTabs");
      } else {
        showAlert("Error de inicio de sesión", result.error || "Credenciales incorrectas.");
      }
    } catch {
      showAlert("Error", "No se pudo conectar al servidor.");
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateForm, login, navigation, showAlert]);

  const handleForgotPassword = useCallback(() => {
    navigation.navigate("RecuperarContrasena");
  }, [navigation]);

  const handleRegister = useCallback(() => {
    navigation.navigate("Registro");
  }, [navigation]);

  const handleEntrarComoInvitado = useCallback(async () => {
    setIsLoading(true);
    try {
      await loginComoInvitado();
      navigation.replace("MainTabs");
    } catch {
      showAlert("Error", "No se pudo iniciar como invitado.");
    } finally {
      setIsLoading(false);
    }
  }, [loginComoInvitado, navigation, showAlert]);

  const handleLoginDesarrollador = useCallback(async () => {
    setIsLoading(true);
    try {
      await loginComoDesarrollador();
      logger.log("[auth] Login como desarrollador");
      navigation.replace("MainTabs");
    } catch {
      showAlert("Error", "No se pudo iniciar como desarrollador.");
    } finally {
      setIsLoading(false);
    }
  }, [loginComoDesarrollador, navigation, showAlert]);

  return {
    formData,
    isLoading,
    updateFormData,
    handleLogin,
    handleForgotPassword,
    handleRegister,
    handleEntrarComoInvitado,
    handleLoginDesarrollador,
    isDevMode: __DEV__,
  };
};
