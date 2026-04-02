import { useState, useCallback } from "react";
import { Platform, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../navigation/StackNavigator";
import { useAuth } from "../context/AuthContext";

type Nav = StackNavigationProp<RootStackParamList, "Registro">;

export interface RegistroFormData {
  nombre: string;
  apellidos: string;
  email: string;
  password: string;
  confirmPassword: string;
  aceptaTerminos: boolean;
}

export interface RegistroViewModel {
  formData: RegistroFormData;
  isLoading: boolean;
  errors: Partial<Record<keyof RegistroFormData, string>>;
  updateField: (field: keyof RegistroFormData, value: string | boolean) => void;
  handleRegistro: () => void;
  handleIrALogin: () => void;
}

export const useRegistroViewModel = (): RegistroViewModel => {
  const navigation = useNavigation<Nav>();
  const { registro } = useAuth();

  const [formData, setFormData] = useState<RegistroFormData>({
    nombre: "",
    apellidos: "",
    email: "",
    password: "",
    confirmPassword: "",
    aceptaTerminos: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof RegistroFormData, string>>>({});

  const showAlert = useCallback((title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(message);
    } else {
      Alert.alert(title, message);
    }
  }, []);

  const updateField = useCallback((field: keyof RegistroFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof RegistroFormData, string>> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Formato de email no válido";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mínimo 6 caracteres";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    if (!formData.aceptaTerminos) {
      newErrors.aceptaTerminos = "Debes aceptar los términos";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleRegistro = useCallback(async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      const result = await registro({
        nombre: formData.nombre.trim(),
        apellidos: formData.apellidos.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      if (result.success) {
        navigation.replace("MainTabs");
      } else {
        showAlert("Error de registro", result.error || "No se pudo crear la cuenta.");
      }
    } catch {
      showAlert("Error", "No se pudo conectar al servidor.");
    } finally {
      setIsLoading(false);
    }
  }, [formData, validate, registro, navigation, showAlert]);

  const handleIrALogin = useCallback(() => {
    navigation.navigate("Login");
  }, [navigation]);

  return {
    formData,
    isLoading,
    errors,
    updateField,
    handleRegistro,
    handleIrALogin,
  };
};
