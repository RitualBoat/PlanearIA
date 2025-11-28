// Imports necesarios para App.tsx
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from "./src/navigation/StackNavigator";
import { PlaneacionesProvider } from "./src/context/PlaneacionesContext";

const App: React.FC = () => {
  return (
    <PlaneacionesProvider>
      <NavigationContainer>
        <StackNavigator />
      </NavigationContainer>
    </PlaneacionesProvider>
  );
};
export default App;
