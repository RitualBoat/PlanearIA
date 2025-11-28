import React from "react";
import { ScrollView, Platform, View, StyleSheet } from "react-native";
import type { ScrollViewProps } from "react-native";

interface WebScrollViewProps extends ScrollViewProps {
  children: React.ReactNode;
}

/**
 * WebScrollView - Componente que maneja scroll correctamente en web y móvil
 * En web: usa div nativo con scroll visible y altura máxima para evitar overflow
 * En móvil: usa ScrollView normal de React Native
 */
const WebScrollView: React.FC<WebScrollViewProps> = ({
  children,
  style,
  contentContainerStyle,
  ...props
}) => {
  if (Platform.OS === "web") {
    // En web, usamos un div nativo con scroll visible
    const Div = "div" as any;
    const flatStyle = StyleSheet.flatten(style);
    const flatContentStyle = StyleSheet.flatten(contentContainerStyle);

    return (
      <Div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch",
          height: "100%",
          maxHeight: "calc(100vh - 140px)", // Espacio para header y BottomNavBar
          scrollbarWidth: "thin", // Firefox
          scrollbarColor: "#2196F3 #f0f0f0", // Firefox
          ...flatStyle,
          // Estilos para webkit browsers (Chrome, Safari, Edge)
          "::-webkit-scrollbar": {
            width: "8px",
          },
          "::-webkit-scrollbar-track": {
            background: "#f0f0f0",
          },
          "::-webkit-scrollbar-thumb": {
            background: "#2196F3",
            borderRadius: "4px",
          },
          "::-webkit-scrollbar-thumb:hover": {
            background: "#1976D2",
          },
        }}
      >
        <View style={flatContentStyle}>{children}</View>
      </Div>
    );
  }

  // En móvil (iOS/Android), usamos el ScrollView normal
  return (
    <ScrollView
      style={style}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={true}
      {...props}
    >
      {children}
    </ScrollView>
  );
};

export default WebScrollView;
