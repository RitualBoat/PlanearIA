import React, { useCallback, useEffect, useState } from "react";
import { Keyboard, Platform, Pressable, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../hooks/useTheme";
import { runGlobalKeyboardDismissHandler } from "../utils/keyboardDismissController";

const KeyboardDismissFab: React.FC = () => {
  const { colors } = useTheme();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (Platform.OS === "web") return undefined;

    const showSub = Keyboard.addListener("keyboardDidShow", (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handlePress = useCallback(() => {
    runGlobalKeyboardDismissHandler();
    Keyboard.dismiss();
    setKeyboardHeight(0);
  }, []);

  if (Platform.OS === "web" || keyboardHeight <= 0) return null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Ocultar teclado"
      onPress={handlePress}
      style={[
        styles.button,
        {
          bottom: keyboardHeight + 10,
          borderColor: colors.borderLight,
          backgroundColor: colors.surfaceContainerLowest,
        },
      ]}
    >
      <MaterialIcons name="keyboard-arrow-down" size={24} color={colors.onSurfaceVariant} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    right: 16,
    zIndex: 100000,
    width: 42,
    height: 42,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
});

export default KeyboardDismissFab;
