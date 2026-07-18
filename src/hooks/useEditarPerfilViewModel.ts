import { useState, useCallback, useEffect, useMemo } from "react";
import { Platform, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { AppRoutesParamList } from "../navigation/StackNavigator";
import { useAuth } from "../context/AuthContext";

type Nav = StackNavigationProp<AppRoutesParamList>;

export const BIO_MAX_LENGTH = 300;

export interface EditarPerfilViewModel {
  nombre: string;
  apellidos: string;
  biografia: string;
  pais: string;
  email: string;
  isLoading: boolean;
  error: string;
  nombreError: string;
  isDirty: boolean;
  bioCharCount: number;
  bioMaxLength: number;
  saveSuccess: boolean;
  saveError: boolean;
  setNombre: (v: string) => void;
  setApellidos: (v: string) => void;
  setBiografia: (v: string) => void;
  setPais: (v: string) => void;
  handleGuardar: () => void;
  handleCancelar: () => void;
  dismissSuccess: () => void;
  dismissError: () => void;
}

export const useEditarPerfilViewModel = (): EditarPerfilViewModel => {
  const navigation = useNavigation<Nav>();
  const { usuario, actualizarPerfil } = useAuth();

  const [nombre, setNombreRaw] = useState(usuario?.nombre || "");
  const [apellidos, setApellidos] = useState(usuario?.apellidos || "");
  const [biografia, setBiografiaRaw] = useState(usuario?.biografia || "");
  const [pais, setPais] = useState(usuario?.pais || "México");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [nombreError, setNombreError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    if (usuario) {
      setNombreRaw(usuario.nombre);
      setApellidos(usuario.apellidos);
      setBiografiaRaw(usuario.biografia);
      setPais(usuario.pais);
    }
  }, [usuario]);

  const isDirty = useMemo(() => {
    if (!usuario) return false;
    return (
      nombre !== usuario.nombre ||
      apellidos !== usuario.apellidos ||
      biografia !== usuario.biografia ||
      pais !== usuario.pais
    );
  }, [nombre, apellidos, biografia, pais, usuario]);

  const setNombre = useCallback((v: string) => {
    setNombreRaw(v);
    if (v.trim()) setNombreError("");
  }, []);

  const setBiografia = useCallback((v: string) => {
    if (v.length <= BIO_MAX_LENGTH) {
      setBiografiaRaw(v);
    }
  }, []);

  const showAlert = useCallback((title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(message);
    } else {
      Alert.alert(title, message);
    }
  }, []);

  const handleGuardar = useCallback(async () => {
    setError("");
    setNombreError("");
    if (!nombre.trim()) {
      setNombreError("Este campo es obligatorio");
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
        setSaveSuccess(true);
        setTimeout(() => navigation.goBack(), 1200);
      } else {
        setError(result.error || "Error al guardar.");
        setSaveError(true);
      }
    } catch {
      setError("No se pudo conectar al servidor.");
      setSaveError(true);
    } finally {
      setIsLoading(false);
    }
  }, [nombre, apellidos, biografia, pais, actualizarPerfil, navigation]);

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
    nombreError,
    isDirty,
    bioCharCount: biografia.length,
    bioMaxLength: BIO_MAX_LENGTH,
    saveSuccess,
    saveError,
    setNombre,
    setApellidos,
    setBiografia,
    setPais,
    handleGuardar,
    handleCancelar,
    dismissSuccess: () => setSaveSuccess(false),
    dismissError: () => setSaveError(false),
  };
};
