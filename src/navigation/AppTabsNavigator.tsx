import React from "react";
import { View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Platform, useWindowDimensions } from "react-native";
import { COLORS, PostAttachment } from "../../types";

import FeedScreen from "../screens/feed/FeedScreen";
import ContenidoScreen from "../screens/contenido/ContenidoScreen";
import ClassroomHomeScreen from "../screens/classroom/ClassroomHomeScreen";
import SocialScreen from "../screens/social/SocialScreen";
import CuentaScreen from "../screens/cuenta/CuentaScreen";
import FloatingActionIcons from "../components/FloatingActionIcons";

export type MainTabParamList = {
  FeedTab: {
    openCreatePost?: boolean;
    attachmentToShare?: PostAttachment;
  } | undefined;
  ContenidoTab: {
    selectionMode?: boolean;
    targetGroupId?: string;
  } | undefined;
  GruposTab: undefined;
  SocialTab: undefined;
  ConfiguracionTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const AppTabsNavigator: React.FC = () => {
  const { width } = useWindowDimensions();
  const isCompact = width < 420;
  const isWeb = Platform.OS === "web";
  const useFloatingWebBar = isWeb && width >= 768;

  const labels: Record<keyof MainTabParamList, string> = {
    FeedTab: "Feed",
    ContenidoTab: isCompact ? "Conten." : "Contenido",
    GruposTab: "Grupos",
    SocialTab: "Social",
    ConfiguracionTab: isCompact ? "Config." : "Configuración",
  };

  return (
    <View style={{ flex: 1 }}>
      <FloatingActionIcons />
      <Tab.Navigator
        id="main-tabs"
        initialRouteName="FeedTab"
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
            backgroundColor: COLORS.surface,
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
            const iconByRoute: Record<keyof MainTabParamList, keyof typeof MaterialIcons.glyphMap> =
              {
                FeedTab: "dynamic-feed",
                ContenidoTab: "folder-special",
                GruposTab: "groups",
                SocialTab: "people",
                ConfiguracionTab: "settings",
              };

            const iconName = iconByRoute[route.name as keyof MainTabParamList] || "circle";
            return <MaterialIcons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen
          name="FeedTab"
          component={FeedScreen}
          options={{
            title: labels.FeedTab,
            tabBarAccessibilityLabel: "Feed",
          }}
        />
        <Tab.Screen
          name="ContenidoTab"
          component={ContenidoScreen}
          options={{
            title: labels.ContenidoTab,
            tabBarAccessibilityLabel: "Contenido",
          }}
        />
        <Tab.Screen
          name="GruposTab"
          component={ClassroomHomeScreen}
          options={{
            title: labels.GruposTab,
            tabBarAccessibilityLabel: "Grupos",
          }}
        />
        <Tab.Screen
          name="SocialTab"
          component={SocialScreen}
          options={{
            title: labels.SocialTab,
            tabBarAccessibilityLabel: "Social",
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
    </View>
  );
};

export default AppTabsNavigator;
