import React from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Platform, useWindowDimensions } from "react-native";
import { COLORS } from "../../types";

import HomeScreen from "../screens/home/HomeScreen";
import PlaneacionesScreen from "../screens/planeaciones/PlaneacionesScreen";
import GruposScreen from "../screens/grupos/GruposScreen";
import RecursosDidacticosScreen from "../screens/biblioteca/RecursosDidacticosScreen";
import CuentaScreen from "../screens/cuenta/CuentaScreen";

export type MainTabParamList = {
  HomeTab: undefined;
  PlaneacionesTab: undefined;
  GruposTab: undefined;
  RecursosTab: undefined;
  ConfiguracionTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const AppTabsNavigator: React.FC = () => {
  const { width } = useWindowDimensions();
  const isCompact = width < 420;
  const isWeb = Platform.OS === "web";
  const useFloatingWebBar = isWeb && width >= 768;

  const labels: Record<keyof MainTabParamList, string> = {
    HomeTab: "Inicio",
    PlaneacionesTab: isCompact ? "Planea" : "Planeaciones",
    GruposTab: "Grupos",
    RecursosTab: isCompact ? "Recurs." : "Recursos",
    ConfiguracionTab: isCompact ? "Config." : "Configuración",
  };

  return (
    <Tab.Navigator
      id="main-tabs"
      initialRouteName="HomeTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        animation: "shift",
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: "#6B7280",
        tabBarShowLabel: !isCompact,
        tabBarHideOnKeyboard: true,
        tabBarActiveBackgroundColor: "#EEF5FF",
        tabBarStyle: {
          height: isCompact ? 68 : 72,
          paddingTop: 8,
          paddingBottom: isCompact ? 8 : 10,
          paddingHorizontal: 6,
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          backgroundColor: "#FFFFFF",
          ...(useFloatingWebBar
            ? {
                width: "100%",
                maxWidth: 760,
                alignSelf: "center",
                borderRadius: 16,
                marginBottom: 10,
                borderWidth: 1,
                boxShadow: "0px 8px 18px rgba(20, 48, 92, 0.12)",
              }
            : null),
        },
        tabBarItemStyle: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 12,
          marginHorizontal: 2,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginTop: -1,
        },
        tabBarIconStyle: {
          marginTop: isCompact ? 1 : 2,
        },
        tabBarIcon: ({ color, size }) => {
          const iconByRoute: Record<keyof MainTabParamList, keyof typeof MaterialIcons.glyphMap> = {
            HomeTab: "home",
            PlaneacionesTab: "event-note",
            GruposTab: "groups",
            RecursosTab: "menu-book",
            ConfiguracionTab: "settings",
          };

          const iconName = iconByRoute[route.name as keyof MainTabParamList] || "circle";
          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: labels.HomeTab,
          tabBarAccessibilityLabel: "Inicio",
        }}
      />
      <Tab.Screen
        name="PlaneacionesTab"
        component={PlaneacionesScreen}
        options={{
          title: labels.PlaneacionesTab,
          tabBarAccessibilityLabel: "Planeaciones",
        }}
      />
      <Tab.Screen
        name="GruposTab"
        component={GruposScreen}
        options={{
          title: labels.GruposTab,
          tabBarAccessibilityLabel: "Grupos",
        }}
      />
      <Tab.Screen
        name="RecursosTab"
        component={RecursosDidacticosScreen}
        options={{
          title: labels.RecursosTab,
          tabBarAccessibilityLabel: "Recursos",
        }}
      />
      <Tab.Screen
        name="ConfiguracionTab"
        component={CuentaScreen}
        options={{
          title: labels.ConfiguracionTab,
          tabBarAccessibilityLabel: "Configuración",
        }}
      />
    </Tab.Navigator>
  );
};

export default AppTabsNavigator;
