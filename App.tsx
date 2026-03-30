import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from "./src/navigation/StackNavigator";
import { SyncProvider } from "./src/sync/providers/SyncProvider";
import { GruposProvider } from "./src/context/GruposContext";

const App: React.FC = () => {
  return (
    <SyncProvider>
      <GruposProvider>
        <NavigationContainer>
          <StackNavigator />
        </NavigationContainer>
      </GruposProvider>
    </SyncProvider>
  );
};
export default App;
