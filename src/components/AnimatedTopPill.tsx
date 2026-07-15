import React, { useCallback } from "react";
import { Easing, StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, cancelAnimation, interpolateColor } from "react-native-reanimated";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFocusEffect } from "@react-navigation/native";
import { COLORS } from "../../types";

interface AnimatedTopPillProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  size?: "default" | "large";
  titleNumberOfLines?: number;
  subtitleNumberOfLines?: number;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  children?: React.ReactNode;
}

const AnimatedTopPill: React.FC<AnimatedTopPillProps> = ({
  title,
  subtitle = "",
  icon = "auto-awesome",
  size = "default",
  titleNumberOfLines = 1,
  subtitleNumberOfLines = 1,
  style,
  titleStyle,
  subtitleStyle,
  children,
}) => {
  const ringShift = useSharedValue(0);
  const ringOpacity = useSharedValue(0);

  const runGlow = useCallback(() => {
    cancelAnimation(ringShift);
    cancelAnimation(ringOpacity);
    ringShift.value = 0;
    ringOpacity.value = 0.95;

    ringShift.value = withTiming(1, { duration: 1400, easing: Easing.linear });
    ringOpacity.value = withTiming(0, { duration: 1500, easing: Easing.out(Easing.cubic) });
  }, [ringShift, ringOpacity]);

  useFocusEffect(
    useCallback(() => {
      runGlow();
    }, [runGlow])
  );

  const animatedRingStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      ringShift.value,
      [0, 0.16, 0.33, 0.5, 0.66, 0.83, 1],
      [COLORS.errorLight, "#FF9F1C", "#FFE66D", "#2EC4B6", "#3A86FF", "#8338EC", COLORS.errorLight]
    ),
    opacity: ringOpacity.value,
  }));

  return (
    <View style={styles.shell}>
      <Animated.View
        pointerEvents="none"
        style={[styles.rainbowRing, animatedRingStyle]}
      />

      <View style={[styles.pill, size === "large" && styles.pillLarge, style]}>
        <View style={styles.iconWrap}>
          <MaterialIcons name={icon} size={18} color={COLORS.primaryMuted} />
        </View>
        <View style={styles.textWrap}>
          <Text
            style={[styles.title, size === "large" && styles.titleLarge, titleStyle]}
            numberOfLines={titleNumberOfLines}
          >
            {title}
          </Text>
          {children ? (
            children
          ) : (
            <Text
              style={[styles.subtitle, size === "large" && styles.subtitleLarge, subtitleStyle]}
              numberOfLines={subtitleNumberOfLines}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  shell: {
    position: "relative",
  },
  rainbowRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
    borderWidth: 2,
    margin: -2,
  },
  pill: {
    minHeight: 88,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2EAF4",
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    boxShadow: "0px 10px 22px rgba(22, 53, 99, 0.1)",
  },
  pillLarge: {
    minHeight: 138,
    alignItems: "flex-start",
    paddingVertical: 18,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: COLORS.primaryTint,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    fontSize: 29,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: -0.45,
    lineHeight: 34,
  },
  titleLarge: {
    fontSize: 40,
    lineHeight: 44,
  },
  subtitle: {
    fontSize: 15,
    color: "#64758E",
    lineHeight: 20,
  },
  subtitleLarge: {
    fontSize: 20,
    lineHeight: 28,
  },
});

export default AnimatedTopPill;
