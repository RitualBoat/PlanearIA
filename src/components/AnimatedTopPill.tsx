import React from "react";
import {
  Animated,
  Easing,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { NavigationContext } from "@react-navigation/native";
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
  const navigation = React.useContext(NavigationContext);
  const [ringShift] = React.useState(() => new Animated.Value(0));
  const [ringOpacity] = React.useState(() => new Animated.Value(0));
  const glowAnimationRef = React.useRef<Animated.CompositeAnimation | null>(null);

  const runGlow = React.useCallback(() => {
    glowAnimationRef.current?.stop();
    ringShift.setValue(0);
    ringOpacity.setValue(0.95);

    const animation = Animated.parallel([
      Animated.timing(ringShift, {
        toValue: 1,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
      Animated.timing(ringOpacity, {
        toValue: 0,
        duration: 1500,
        delay: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]);

    glowAnimationRef.current = animation;
    animation.start(() => {
      if (glowAnimationRef.current === animation) {
        glowAnimationRef.current = null;
      }
    });
  }, [ringOpacity, ringShift]);

  React.useEffect(() => {
    runGlow();

    if (!navigation) {
      return () => {
        glowAnimationRef.current?.stop();
        glowAnimationRef.current = null;
      };
    }

    const unsubscribeFocus = navigation.addListener("focus", runGlow);
    return () => {
      unsubscribeFocus();
      glowAnimationRef.current?.stop();
      glowAnimationRef.current = null;
    };
  }, [navigation, runGlow]);

  const borderColor = ringShift.interpolate({
    inputRange: [0, 0.16, 0.33, 0.5, 0.66, 0.83, 1],
    outputRange: [COLORS.errorLight, "#FF9F1C", "#FFE66D", "#2EC4B6", "#3A86FF", "#8338EC", COLORS.errorLight],
  });

  return (
    <View style={styles.shell}>
      <Animated.View
        pointerEvents="none"
        style={[styles.rainbowRing, { borderColor, opacity: ringOpacity }]}
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
