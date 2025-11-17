import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/StackNavigator";
import { COLORS, FONT_SIZES } from "../../types";
import { responsive } from "../utils/responsive";

interface BottomNavBarProps {
  currentScreen: string;
  showBackButton?: boolean;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentScreen,
  showBackButton = true,
}) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handleBack = (): void => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Home");
    }
  };

  const handleMenu = (): void => {
    navigation.navigate("Home");
  };

  return (
    <View style={styles.headerBar}>
      <TouchableOpacity
        style={styles.iconButton}
        onPress={handleBack}
        disabled={!showBackButton}
      >
        {showBackButton && (
          <MaterialIcons name="arrow-back" size={24} color="white" />
        )}
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{currentScreen}</Text>
      <TouchableOpacity style={styles.iconButton} onPress={handleMenu}>
        <MaterialIcons name="home" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: responsive(30, 40, 60),
    paddingVertical: responsive(20, 22, 25),
    elevation: 4,
    shadowColor: COLORS.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerTitle: {
    fontSize: responsive(
      FONT_SIZES.large,
      FONT_SIZES.large + 2,
      FONT_SIZES.large + 4
    ),
    fontWeight: "bold",
    color: COLORS.background,
    flex: 1,
    textAlign: "center",
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    minWidth: 40,
    alignItems: "center",
  },
});

export default BottomNavBar;
