import React from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useWindowDimensions } from "react-native";
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
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: "#6B7280",
        tabBarShowLabel: !isCompact,
        tabBarStyle: {
          height: 64,
          paddingTop: 6,
          paddingBottom: 8,
          paddingHorizontal: 6,
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          backgroundColor: "#FFFFFF",
        },
        tabBarItemStyle: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
          marginTop: -2,
        },
        tabBarIconStyle: {
          marginTop: isCompact ? 0 : 2,
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
