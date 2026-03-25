import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from "./src/navigation/StackNavigator";
import { SyncProvider } from "./src/sync/providers/SyncProvider";

const App: React.FC = () => {
  return (
    <SyncProvider>
      <NavigationContainer>
        <StackNavigator />
      </NavigationContainer>
    </SyncProvider>
  );
};
export default App;
