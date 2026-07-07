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
  const transitionAnimationRef = React.useRef<Animated.CompositeAnimation | null>(null);

  const runAnimation = React.useCallback(() => {
    transitionAnimationRef.current?.stop();
    progress.setValue(0);
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

    transitionAnimationRef.current = animation;
    animation.start(() => {
      if (transitionAnimationRef.current === animation) {
        transitionAnimationRef.current = null;
      }
    });
  }, [progress]);

  React.useEffect(() => {
    runAnimation();

    if (!navigation) {
      return () => {
        transitionAnimationRef.current?.stop();
        transitionAnimationRef.current = null;
      };
    }

    const unsubscribeFocus = navigation.addListener("focus", runAnimation);
    return () => {
      unsubscribeFocus();
      transitionAnimationRef.current?.stop();
      transitionAnimationRef.current = null;
    };
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
