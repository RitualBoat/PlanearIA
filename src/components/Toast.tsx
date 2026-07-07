import React, { useEffect, useCallback } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export type ToastType = "success" | "error" | "info" | "share";

export interface ToastConfig {
  message: string;
  type: ToastType;
  duration?: number;
  dismissible?: boolean;
}

interface ToastProps extends ToastConfig {
  visible: boolean;
  onDismiss: () => void;
}

const ICON_MAP: Record<ToastType, { name: string; color: string }> = {
  success: { name: "check-circle", color: "#10B981" },
  error: { name: "error", color: "#ba1a1a" },
  info: { name: "info", color: "#005da8" },
  share: { name: "link", color: "#005da8" },
};

const DEFAULT_DURATION: Record<ToastType, number> = {
  success: 3500,
  error: 5500,
  info: 4000,
  share: 2500,
};

const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type,
  duration,
  dismissible = true,
  onDismiss,
}) => {
  const translateY = useSharedValue(80);
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const hide = useCallback(() => {
    translateY.value = withTiming(80, {
      duration: 250,
      easing: Easing.out(Easing.cubic),
    });
    opacity.value = withTiming(
      0,
      {
        duration: 200,
        easing: Easing.out(Easing.cubic),
      },
      (finished) => {
        if (finished) runOnJS(onDismiss)();
      }
    );
  }, [translateY, opacity, onDismiss]);

  useEffect(() => {
    if (visible) {
      translateY.value = 80;
      opacity.value = 0;
      translateY.value = withTiming(0, {
        duration: 250,
        easing: Easing.out(Easing.cubic),
      });
      opacity.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.cubic),
      });

      const ms = duration ?? DEFAULT_DURATION[type];
      const timer = setTimeout(hide, ms);
      return () => clearTimeout(timer);
    }
  }, [visible, type, duration, translateY, opacity, hide]);

  if (!visible) return null;

  const icon = ICON_MAP[type];

  return (
    <Animated.View
      style={[styles.container, animatedStyle]}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
    >
      <View style={styles.content}>
        <MaterialIcons name={icon.name as any} size={20} color={icon.color} />
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
        {dismissible && (
          <Pressable
            onPress={hide}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Cerrar notificación"
            style={({ pressed }) => pressed && styles.pressed}
          >
            <MaterialIcons name="close" size={18} color="#424750" />
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: Platform.OS === "web" ? 32 : 100,
    left: 16,
    right: 16,
    alignItems: "center",
    zIndex: 9999,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    maxWidth: 420,
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "rgba(247, 249, 255, 0.92)",
    ...Platform.select({
      web: {
        backdropFilter: "blur(16px)",
        boxShadow: "0px 8px 24px rgba(0, 72, 132, 0.12)",
      } as any,
      default: {
        shadowColor: "#004884",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 8,
      },
    }),
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#181c20",
    lineHeight: 20,
  },
  // Replaces the default TouchableOpacity press dim (see PRESSED_OPACITY note).
  pressed: {
    opacity: 0.6,
  },
});

export default Toast;
