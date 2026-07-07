import { useState, useCallback } from "react";
import { Platform, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../navigation/StackNavigator";
import { API_CONFIG } from "../sync/config/apiConfig";
import logger from "../utils/logger";

type Nav = StackNavigationProp<RootStackParamList, "RecuperarContrasena">;

type Step = "email" | "codigo" | "nueva";

export interface RecuperarContrasenaViewModel {
  step: Step;
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
  isLoading: boolean;
  error: string;
  setEmail: (v: string) => void;
  setCode: (v: string) => void;
  setNewPassword: (v: string) => void;
  setConfirmPassword: (v: string) => void;
  handleEnviarCodigo: () => void;
  handleVerificarCodigo: () => void;
  handleResetear: () => void;
  handleVolver: () => void;
}

async function authRequest(body: Record<string, unknown>): Promise<{
  ok: boolean;
  data?: Record<string, unknown>;
  error?: string;
}> {
  try {
    const res = await fetch(`${API_CONFIG.baseUrl}/api/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (json.success) {
      return { ok: true, data: json.data };
    }
    return { ok: false, error: json.error || "Error desconocido" };
  } catch {
    return { ok: false, error: "No se pudo conectar al servidor." };
  }
}

export const useRecuperarContrasenaViewModel = (): RecuperarContrasenaViewModel => {
  const navigation = useNavigation<Nav>();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const showAlert = useCallback((title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(message);
    } else {
      Alert.alert(title, message);
    }
  }, []);

  const handleEnviarCodigo = useCallback(async () => {
    setError("");
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Ingresa tu email.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Formato de email no válido.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await authRequest({ action: "recuperar", email: trimmed });
      if (result.ok) {
        logger.log("[auth] Código de recuperación solicitado para:", trimmed);
        // En dev, mostramos el código
        if (result.data?._devCode) {
          showAlert("Código (solo dev)", `Tu código es: ${result.data._devCode}`);
        }
        setStep("codigo");
      } else {
        setError(result.error || "Error al enviar código.");
      }
    } catch {
      setError("No se pudo conectar al servidor.");
    } finally {
      setIsLoading(false);
    }
  }, [email, showAlert]);

  const handleVerificarCodigo = useCallback(() => {
    setError("");
    if (!code.trim() || code.trim().length !== 6) {
      setError("Ingresa el código de 6 dígitos.");
      return;
    }
    setStep("nueva");
  }, [code]);

  const handleResetear = useCallback(async () => {
    setError("");
    if (!newPassword) {
      setError("Ingresa tu nueva contraseña.");
      return;
    }
    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await authRequest({
        action: "resetear",
        email: email.trim(),
        code: code.trim(),
        newPassword,
      });
      if (result.ok) {
        showAlert(
          "Contraseña actualizada",
          "Tu contraseña se ha cambiado correctamente. Inicia sesión con tu nueva contraseña."
        );
        navigation.navigate("Login");
      } else {
        setError(result.error || "Error al cambiar la contraseña.");
      }
    } catch {
      setError("No se pudo conectar al servidor.");
    } finally {
      setIsLoading(false);
    }
  }, [email, code, newPassword, confirmPassword, navigation, showAlert]);

  const handleVolver = useCallback(() => {
    if (step === "codigo") {
      setStep("email");
      setCode("");
      setError("");
    } else if (step === "nueva") {
      setStep("codigo");
      setNewPassword("");
      setConfirmPassword("");
      setError("");
    } else {
      navigation.goBack();
    }
  }, [step, navigation]);

  return {
    step,
    email,
    code,
    newPassword,
    confirmPassword,
    isLoading,
    error,
    setEmail,
    setCode,
    setNewPassword,
    setConfirmPassword,
    handleEnviarCodigo,
    handleVerificarCodigo,
    handleResetear,
    handleVolver,
  };
};
