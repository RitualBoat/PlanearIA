import { useState, useCallback, useMemo } from "react";
import { useNavigation } from "@react-navigation/native";
import { CommonActions } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../navigation/StackNavigator";

type Nav = StackNavigationProp<RootStackParamList>;

export interface MenuOption {
  id: string;
  title: string;
  iconImage?: any;
  icon?: string;
  iconLibrary?: "FontAwesome5" | "MaterialIcons" | "Entypo";
  color: string;
  route?: keyof RootStackParamList;
  onPress?: () => void;
}

export interface HomeViewModel {
  menuVisible: boolean;
  menuOptions: MenuOption[];
  openMenu: () => void;
  closeMenu: () => void;
  handleLogout: () => void;
  handleProfile: () => void;
  handleNavigation: (option: MenuOption) => void;
}

export const useHomeViewModel = (): HomeViewModel => {
  const navigation = useNavigation<Nav>();
  const [menuVisible, setMenuVisible] = useState(false);

  const menuOptions: MenuOption[] = useMemo(
    () => [
      {
        id: "planeaciones",
        title: "Planeaciones",
        iconImage: require("../../assets/planeacionesIco.png"),
        color: "#2196F3",
        route: "Planeaciones" as keyof RootStackParamList,
      },
      {
        id: "grupos",
        title: "Grupos",
        iconImage: require("../../assets/alumnosIco.png"),
        color: "#4CAF50",
        route: "Grupos" as keyof RootStackParamList,
      },
      {
        id: "recursosDidacticos",
        title: "Recursos Didácticos",
        iconImage: require("../../assets/recursosIco.png"),
        color: "#9C27B0",
        route: "RecursosDidacticos" as keyof RootStackParamList,
      },
      {
        id: "cuenta",
        title: "Cuenta",
        iconImage: require("../../assets/CuentaYseguridadIco.png"),
        color: "#F44336",
        route: "Cuenta" as keyof RootStackParamList,
      },
    ],
    []
  );

  const openMenu = useCallback(() => setMenuVisible(true), []);
  const closeMenu = useCallback(() => setMenuVisible(false), []);

  const handleLogout = useCallback(() => {
    setMenuVisible(false);
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Login" }],
      })
    );
  }, [navigation]);

  const handleProfile = useCallback(() => {
    console.log("[home] Navigate to profile");
    setMenuVisible(false);
  }, []);

  const handleNavigation = useCallback(
    (option: MenuOption) => {
      if (option.route === "Planeaciones") {
        navigation.navigate("MainTabs", { screen: "PlaneacionesTab" });
        return;
      }

      if (option.route === "Grupos") {
        navigation.navigate("MainTabs", { screen: "GruposTab" });
        return;
      }

      if (option.route === "RecursosDidacticos") {
        navigation.navigate("MainTabs", { screen: "RecursosTab" });
        return;
      }

      if (option.route === "Cuenta") {
        navigation.navigate("MainTabs", { screen: "ConfiguracionTab" });
        return;
      }

      if (option.route) {
        navigation.navigate(option.route as any);
      } else if (option.onPress) {
        option.onPress();
      }
    },
    [navigation]
  );

  return {
    menuVisible,
    menuOptions,
    openMenu,
    closeMenu,
    handleLogout,
    handleProfile,
    handleNavigation,
  };
};
