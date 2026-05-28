import React from "react";
import { Animated, Easing, StyleProp, ViewStyle } from "react-native";
import { NavigationContext } from "@react-navigation/native";

interface TabSceneTransitionProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const TabSceneTransition: React.FC<TabSceneTransitionProps> = ({ children, style }) => {
  const navigation = React.useContext(NavigationContext);
  const [progress] = React.useState(() => new Animated.Value(1));

  const runAnimation = React.useCallback(() => {
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [progress]);

  React.useEffect(() => {
    runAnimation();

    if (!navigation) {
      return;
    }

    const unsubscribeFocus = navigation.addListener("focus", runAnimation);
    return unsubscribeFocus;
  }, [navigation, runAnimation]);

  const opacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 1],
  });

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [26, 0],
  });

  return (
    <Animated.View style={[{ flex: 1, opacity, transform: [{ translateX }] }, style]}>
      {children}
    </Animated.View>
  );
};

export default TabSceneTransition;
