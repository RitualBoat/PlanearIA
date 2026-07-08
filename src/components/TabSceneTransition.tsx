import React, { use } from "react";
import { Easing, StyleProp, ViewStyle } from "react-native";
import Animated, { useSharedValue, withTiming, useAnimatedStyle, interpolate } from "react-native-reanimated";
import { NavigationContext } from "@react-navigation/native";

interface TabSceneTransitionProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const TabSceneTransition: React.FC<TabSceneTransitionProps> = ({ children, style }) => {
  const navigation = use(NavigationContext);
  const progress = useSharedValue(1);

  const runAnimation = React.useCallback(() => {
    progress.value = 0;
    progress.value = withTiming(1, { duration: 260, easing: Easing.out(Easing.cubic) });
  }, [progress]);

  React.useEffect(() => {
    runAnimation();

    if (!navigation) {
      return undefined;
    }

    const unsubscribeFocus = navigation.addListener("focus", runAnimation);
    return () => {
      unsubscribeFocus();
    };
  }, [navigation, runAnimation]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0.2, 1]),
    transform: [{ translateX: interpolate(progress.value, [0, 1], [26, 0]) }],
  }));

  return (
    <Animated.View style={[{ flex: 1 }, style, animatedStyle]}>
      {children}
    </Animated.View>
  );
};

export default TabSceneTransition;
