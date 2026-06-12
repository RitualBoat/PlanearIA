import React from "react";
import { Platform, ScrollView, StyleSheet } from "react-native";
import type { ScrollViewProps } from "react-native";

interface WebScrollViewProps extends ScrollViewProps {
  children: React.ReactNode;
}

/**
 * Mantiene el mismo contrato de scroll en web y movil.
 * React Native Web ya traduce ScrollView a un contenedor web con scroll; mantenerlo
 * evita alturas maximas fijas que rompen Safari/Chrome movil en deploys web.
 */
const WebScrollView: React.FC<WebScrollViewProps> = ({
  children,
  style,
  contentContainerStyle,
  ...props
}) => {
  return (
    <ScrollView
      style={[Platform.OS === "web" && styles.webScroll, style]}
      contentContainerStyle={[
        Platform.OS === "web" && styles.webContent,
        contentContainerStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled
      showsVerticalScrollIndicator={true}
      {...props}
    >
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  webScroll: {
    flex: 1,
    minHeight: 0,
  },
  webContent: {
    flexGrow: 1,
  },
});

export default WebScrollView;
