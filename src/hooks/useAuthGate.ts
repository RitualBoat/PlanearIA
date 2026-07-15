import { useCallback } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useAuth } from ".//useAuth";
import { RootStackParamList } from "../navigation/StackNavigator";

type Nav = StackNavigationProp<RootStackParamList>;

/**
 * Hook que protege acciones que requieren cuenta autenticada.
 * En modo guest, muestra un alert con opciones de login/registro.
 * Retorna `guard(callback)` — ejecuta el callback solo si está autenticado.
 */
export function useAuthGate() {
  const { isGuest } = useAuth();
  const navigation = useNavigation<Nav>();

  const guard = useCallback(
    (action: () => void) => {
      if (!isGuest) {
        action();
        return;
      }

      Alert.alert(
        "Necesitas una cuenta",
        "Para usar esta función necesitas iniciar sesión o crear una cuenta.",
        [
          {
            text: "Iniciar sesión",
            onPress: () => navigation.navigate("Login"),
          },
          {
            text: "Registrarse",
            onPress: () => navigation.navigate("Registro"),
          },
          {
            text: "Continuar sin cuenta",
            style: "cancel",
          },
        ]
      );
    },
    [isGuest, navigation]
  );

  return { guard, isGuest };
}
