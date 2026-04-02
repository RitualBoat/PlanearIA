import { useState, useCallback, useEffect } from "react";
import { Platform, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../navigation/StackNavigator";
import { useAuth } from "../context/AuthContext";

type Nav = StackNavigationProp<RootStackParamList>;

export interface EditarPerfilViewModel {
  nombre: string;
  apellidos: string;
  biografia: string;
  pais: string;
  email: string;
  isLoading: boolean;
  error: string;
  setNombre: (v: string) => void;
  setApellidos: (v: string) => void;
  setBiografia: (v: string) => void;
  setPais: (v: string) => void;
  handleGuardar: () => void;
  handleCancelar: () => void;
}

export const useEditarPerfilViewModel = (): EditarPerfilViewModel => {
  const navigation = useNavigation<Nav>();
  const { usuario, actualizarPerfil } = useAuth();

  const [nombre, setNombre] = useState(usuario?.nombre || "");
  const [apellidos, setApellidos] = useState(usuario?.apellidos || "");
  const [biografia, setBiografia] = useState(usuario?.biografia || "");
  const [pais, setPais] = useState(usuario?.pais || "México");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (usuario) {
      setNombre(usuario.nombre);
      setApellidos(usuario.apellidos);
      setBiografia(usuario.biografia);
      setPais(usuario.pais);
    }
  }, [usuario]);

  const showAlert = useCallback((title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(message);
    } else {
      Alert.alert(title, message);
    }
  }, []);

  const handleGuardar = useCallback(async () => {
    setError("");
    if (!nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await actualizarPerfil({
        nombre: nombre.trim(),
        apellidos: apellidos.trim(),
        biografia: biografia.trim(),
        pais: pais.trim(),
      });
      if (result.success) {
        showAlert("Perfil actualizado", "Tus datos se han guardado correctamente.");
        navigation.goBack();
      } else {
        setError(result.error || "Error al guardar.");
      }
    } catch {
      setError("No se pudo conectar al servidor.");
    } finally {
      setIsLoading(false);
    }
  }, [nombre, apellidos, biografia, pais, actualizarPerfil, navigation, showAlert]);

  const handleCancelar = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return {
    nombre,
    apellidos,
    biografia,
    pais,
    email: usuario?.email || "",
    isLoading,
    error,
    setNombre,
    setApellidos,
    setBiografia,
    setPais,
    handleGuardar,
    handleCancelar,
  };
};
