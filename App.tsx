import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from "./src/navigation/StackNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { SyncProvider } from "./src/sync/providers/SyncProvider";
import { GruposProvider } from "./src/context/GruposContext";
import { AlumnosProvider } from "./src/context/AlumnosContext";
import { AsistenciaProvider } from "./src/context/AsistenciaContext";
import { CalificacionesProvider } from "./src/context/CalificacionesContext";
import { EntregablesProvider } from "./src/context/EntregablesContext";
import { RecursosProvider } from "./src/context/RecursosContext";
import { PlantillasProvider } from "./src/context/PlantillasContext";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <SyncProvider>
        <AlumnosProvider>
          <GruposProvider>
            <AsistenciaProvider>
              <CalificacionesProvider>
                <EntregablesProvider>
                  <RecursosProvider>
                    <PlantillasProvider>
                      <NavigationContainer>
                        <StackNavigator />
                      </NavigationContainer>
                    </PlantillasProvider>
                  </RecursosProvider>
                </EntregablesProvider>
              </CalificacionesProvider>
            </AsistenciaProvider>
          </GruposProvider>
        </AlumnosProvider>
      </SyncProvider>
    </AuthProvider>
  );
};
export default App;
