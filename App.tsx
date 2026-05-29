import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from "./src/navigation/StackNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { PlaneacionesProvider } from "./src/context/PlaneacionesContext";
import { GruposProvider } from "./src/context/GruposContext";
import { AlumnosProvider } from "./src/context/AlumnosContext";
import { AsistenciaProvider } from "./src/context/AsistenciaContext";
import { CalificacionesProvider } from "./src/context/CalificacionesContext";
import { EntregablesProvider } from "./src/context/EntregablesContext";
import { RecursosProvider } from "./src/context/RecursosContext";
import { PlantillasProvider } from "./src/context/PlantillasContext";
import { PostsProvider } from "./src/context/PostsContext";
import { ContactosProvider } from "./src/context/ContactosContext";
import { MensajesProvider } from "./src/context/MensajesContext";
import { NotificacionesProvider } from "./src/context/NotificacionesContext";
import { ThemeProvider } from "./src/context/ThemeContext";
import { FontSizeProvider } from "./src/context/FontSizeContext";
import { DaltonismoProvider } from "./src/context/DaltonismoContext";
import KeyboardDismissFab from "./src/components/KeyboardDismissFab";
import "./src/locales/i18n";

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <FontSizeProvider>
        <DaltonismoProvider>
          <AuthProvider>
            <PlaneacionesProvider>
              <AlumnosProvider>
                <GruposProvider>
                  <AsistenciaProvider>
                    <CalificacionesProvider>
                      <EntregablesProvider>
                        <RecursosProvider>
                          <PlantillasProvider>
                            <PostsProvider>
                              <ContactosProvider>
                                <MensajesProvider>
                                  <NotificacionesProvider>
                                    <NavigationContainer>
                                      <StackNavigator />
                                    </NavigationContainer>
                                    <KeyboardDismissFab />
                                  </NotificacionesProvider>
                                </MensajesProvider>
                              </ContactosProvider>
                            </PostsProvider>
                          </PlantillasProvider>
                        </RecursosProvider>
                      </EntregablesProvider>
                    </CalificacionesProvider>
                  </AsistenciaProvider>
                </GruposProvider>
              </AlumnosProvider>
            </PlaneacionesProvider>
          </AuthProvider>
        </DaltonismoProvider>
      </FontSizeProvider>
    </ThemeProvider>
  );
};
export default App;
