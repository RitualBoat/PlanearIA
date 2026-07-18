import React from "react";
import { View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { useAppTheme } from "../themes/useAppTheme";
import { radii, spacing, useReducedMotionPreference } from "../themes/tokens";
import type { AppShellParamList } from "./types";
import { INITIAL_HUB } from "./routeManifest";
import { getShellNavigationOptions } from "./shellOptions";
import AppTopBar from "./AppTopBar";
import InicioStack from "./stacks/InicioStack";
import OfficeStack from "./stacks/OfficeStack";
import ClasesStack from "./stacks/ClasesStack";
import AsistenteStack from "./stacks/AsistenteStack";
import MasStack from "./stacks/MasStack";

interface HubConfig {
  name: keyof AppShellParamList;
  titulo: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

const HUBS: HubConfig[] = [
  { name: "InicioTab", titulo: "Inicio", icon: "space-dashboard" },
  { name: "OfficeTab", titulo: "Office", icon: "description" },
  { name: "ClasesTab", titulo: "Clases", icon: "school" },
  { name: "AsistenteTab", titulo: "Asistente", icon: "auto-awesome" },
  { name: "MasTab", titulo: "Mas", icon: "widgets" },
];

const HUB_SCREENS: Record<keyof AppShellParamList, React.ComponentType<any>> = {
  InicioTab: InicioStack,
  OfficeTab: OfficeStack,
  ClasesTab: ClasesStack,
  AsistenteTab: AsistenteStack,
  MasTab: MasStack,
};

const HUB_ICONS = Object.fromEntries(HUBS.map((hub) => [hub.name, hub.icon])) as Record<
  keyof AppShellParamList,
  keyof typeof MaterialIcons.glyphMap
>;

const Tab = createBottomTabNavigator<AppShellParamList>();

/**
 * Shell adaptativo de PlanearIA (change app-shell-navegacion, #81).
 *
 * Un unico navegador de tabs cuya barra cambia de posicion segun el breakpoint;
 * los cinco hubs son stacks anidados con historial propio. El chrome (TopBar)
 * ocupa su espacio en el layout, sin overlays de navegacion paralelos.
 */
const AppShell: React.FC = () => {
  const { breakpoint } = useBreakpoint();
  const reduceMotion = useReducedMotionPreference();
  const { colors, scaled, highContrast } = useAppTheme();
  const shellOptions = getShellNavigationOptions(breakpoint, reduceMotion);
  const isMobile = breakpoint === "mobile";

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppTopBar />
      <Tab.Navigator
        id={undefined}
        initialRouteName={INITIAL_HUB}
        screenOptions={({ route }) => ({
          headerShown: false,
          ...shellOptions,
          tabBarHideOnKeyboard: true,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: highContrast ? colors.text : colors.textSecondary,
          // Indicador de hub activo: color + fondo tenue comunican el estado
          // (micro-interaccion significativa del shell, 1.9.3).
          tabBarActiveBackgroundColor: colors.primaryTint,
          tabBarStyle: isMobile
            ? {
                // Altura explicita: sin ella el default del navegador recorta
                // las etiquetas bajo el icono (verificado en QA Playwright 375).
                height: 64,
                backgroundColor: colors.surface,
                borderTopWidth: 1,
                borderTopColor: highContrast ? colors.borderStrong : colors.border,
                paddingTop: spacing.xs,
                paddingBottom: spacing.xs,
                paddingHorizontal: spacing.xs,
              }
            : {
                backgroundColor: colors.surface,
                borderRightWidth: 1,
                borderRightColor: highContrast ? colors.borderStrong : colors.border,
                paddingTop: spacing.sm,
                paddingHorizontal: spacing.xs,
                ...(breakpoint === "desktop" ? { minWidth: 224 } : null),
              },
          tabBarItemStyle: {
            minHeight: 44,
            borderRadius: radii.md,
            ...(isMobile ? { marginHorizontal: 2 } : { marginVertical: 2 }),
          },
          tabBarLabelStyle: {
            fontSize: scaled(11),
            fontWeight: "700",
          },
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons
              name={HUB_ICONS[route.name as keyof AppShellParamList] ?? "circle"}
              size={size}
              color={color}
            />
          ),
        })}
      >
        {HUBS.map((hub) => (
          <Tab.Screen
            key={hub.name}
            name={hub.name}
            component={HUB_SCREENS[hub.name]}
            options={{
              title: hub.titulo,
              tabBarAccessibilityLabel: hub.titulo,
            }}
          />
        ))}
      </Tab.Navigator>
    </View>
  );
};

export default AppShell;
