import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../context/AuthContext";
import { useAppTheme } from "../themes/useAppTheme";
import { useDeepLinkHandler } from "../hooks/useDeepLinkHandler";
import type { RootStackParamList } from "./types";
import AppShell from "./AppShell";

// Fuera del shell: autenticacion y onboarding.
import OnboardingScreen from "../screens/onboarding/OnboardingScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import RegistroScreen from "../screens/auth/RegistroScreen";
import RecuperarContrasenaScreen from "../screens/auth/RecuperarContrasenaScreen";

// Overlays sobre el shell: solo-destino, nunca navegan hacia un hub.
import DocEditorScreen from "../screens/planeaciones/DocEditorScreen";
import { NotificacionesScreen } from "../screens/notificaciones/NotificacionesScreen";
import { AyudaScreen } from "../screens/ayuda/AyudaScreen";
import TerminosScreen from "../screens/cuenta/TerminosScreen";

// Reexportes de compatibilidad: 55 archivos importan sus tipos desde este modulo.
export type {
  AppRoutesParamList,
  AppShellParamList,
  RootStackParamList,
} from "./types";

const ONBOARDING_KEY = "HAS_SEEN_ONBOARDING";

const Stack = createStackNavigator<RootStackParamList>();

/**
 * Raiz de navegacion tras app-shell-navegacion (#81): 9 rutas.
 *
 * El stack plano de 60 rutas hermanas se reparte en los hubs del AppShell
 * (ver routeManifest.ts y el test de guardia de la particion). Aqui quedan
 * solo auth/onboarding, el shell y los destinos que se apilan por encima de
 * cualquier hub sin navegar de vuelta hacia uno.
 */
const StackNavigator: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { colors } = useAppTheme();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  useDeepLinkHandler();

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((v) => setHasSeenOnboarding(v === "true"));
  }, []);

  if (authLoading || hasSeenOnboarding === null) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const initialRoute: keyof RootStackParamList = !hasSeenOnboarding
    ? "Onboarding"
    : isAuthenticated
      ? "MainTabs"
      : "Login";

  return (
    <Stack.Navigator
      id={undefined}
      initialRouteName={initialRoute}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Iniciar Sesion" }} />
      <Stack.Screen name="Registro" component={RegistroScreen} options={{ title: "Crear cuenta" }} />
      <Stack.Screen
        name="RecuperarContrasena"
        component={RecuperarContrasenaScreen}
        options={{ title: "Recuperar contrasena" }}
      />
      <Stack.Screen name="MainTabs" component={AppShell} />
      <Stack.Screen name="DocEditor" component={DocEditorScreen} options={{ title: "DocEditor" }} />
      <Stack.Screen
        name="Notificaciones"
        component={NotificacionesScreen}
        options={{ title: "Notificaciones" }}
      />
      <Stack.Screen name="Ayuda" component={AyudaScreen} options={{ title: "Centro de Ayuda" }} />
      <Stack.Screen
        name="Terminos"
        component={TerminosScreen}
        options={{ title: "Terminos y Condiciones" }}
      />
    </Stack.Navigator>
  );
};

export default StackNavigator;
