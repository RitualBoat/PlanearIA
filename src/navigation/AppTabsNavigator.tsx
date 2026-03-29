import React from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
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
  return (
    <Tab.Navigator
      id="main-tabs"
      initialRouteName="HomeTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: "#6B7280",
        tabBarStyle: {
          height: 66,
          paddingTop: 6,
          paddingBottom: 8,
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          backgroundColor: "#FFFFFF",
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
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
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: "Inicio" }} />
      <Tab.Screen
        name="PlaneacionesTab"
        component={PlaneacionesScreen}
        options={{ title: "Planeaciones" }}
      />
      <Tab.Screen name="GruposTab" component={GruposScreen} options={{ title: "Grupos" }} />
      <Tab.Screen
        name="RecursosTab"
        component={RecursosDidacticosScreen}
        options={{ title: "Recursos" }}
      />
      <Tab.Screen
        name="ConfiguracionTab"
        component={CuentaScreen}
        options={{ title: "Configuración" }}
      />
    </Tab.Navigator>
  );
};

export default AppTabsNavigator;
