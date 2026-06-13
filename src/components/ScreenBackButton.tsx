import React from "react";
import { StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "../../types";

interface ScreenBackButtonProps {
  /** Override the default goBack handler (e.g. custom confirm flow) */
  onPress?: () => void;
  color?: string;
  size?: number;
  style?: ViewStyle | ViewStyle[];
}

/**
 * Consistent back affordance for pushed screens.
 *
 * The root stack hides every native header (headerShown: false), so screens
 * opened over the tab bar have no system back button. Without one the user
 * is trapped (no tab bar either). Drop this at the top-left of the header.
 * Only renders when there is somewhere to go back to.
 */
const ScreenBackButton: React.FC<ScreenBackButtonProps> = ({
  onPress,
  color = COLORS.text,
  size = 24,
  style,
}) => {
  const navigation = useNavigation();

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  if (!onPress && !navigation.canGoBack()) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="Volver"
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      activeOpacity={0.7}
    >
      <MaterialIcons name="arrow-back" size={size} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ScreenBackButton;
