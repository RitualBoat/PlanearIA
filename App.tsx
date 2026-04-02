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
import { PostsProvider } from "./src/context/PostsContext";
import { ContactosProvider } from "./src/context/ContactosContext";
import { ThemeProvider } from "./src/context/ThemeContext";
import { FontSizeProvider } from "./src/context/FontSizeContext";
import { DaltonismoProvider } from "./src/context/DaltonismoContext";
import "./src/locales/i18n";

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <FontSizeProvider>
        <DaltonismoProvider>
          <AuthProvider>
            <SyncProvider>
              <AlumnosProvider>
                <GruposProvider>
                  <AsistenciaProvider>
                    <CalificacionesProvider>
                      <EntregablesProvider>
                        <RecursosProvider>
                          <PlantillasProvider>
                            <PostsProvider>
                              <ContactosProvider>
                                <NavigationContainer>
                                  <StackNavigator />
                                </NavigationContainer>
                              </ContactosProvider>
                            </PostsProvider>
                          </PlantillasProvider>
                        </RecursosProvider>
                      </EntregablesProvider>
                    </CalificacionesProvider>
                  </AsistenciaProvider>
                </GruposProvider>
              </AlumnosProvider>
            </SyncProvider>
          </AuthProvider>
        </DaltonismoProvider>
      </FontSizeProvider>
    </ThemeProvider>
  );
};
export default App;
