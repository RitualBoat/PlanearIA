import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from "./src/navigation/StackNavigator";
import { SyncProvider } from "./src/sync/providers/SyncProvider";
import { GruposProvider } from "./src/context/GruposContext";
import { AlumnosProvider } from "./src/context/AlumnosContext";

const App: React.FC = () => {
  return (
    <SyncProvider>
      <AlumnosProvider>
        <GruposProvider>
          <NavigationContainer>
            <StackNavigator />
          </NavigationContainer>
        </GruposProvider>
      </AlumnosProvider>
    </SyncProvider>
  );
};
export default App;
