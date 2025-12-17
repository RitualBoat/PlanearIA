// Imports necesarios para App.tsx
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from "./src/navigation/StackNavigator";
import { PlaneacionesProvider } from "./src/context/PlaneacionesContext";
import { SyncProvider } from "./src/sync/providers/SyncProvider";

const App: React.FC = () => {
  return (
    <SyncProvider>
      <PlaneacionesProvider>
        <NavigationContainer>
          <StackNavigator />
        </NavigationContainer>
      </PlaneacionesProvider>
    </SyncProvider>
  );
};
export default App;
