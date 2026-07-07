import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import StackNavigator from "./src/navigation/StackNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { migrateLegacySessionKeys } from "./src/services/auth/legacyMigration";
import { SyncProvider } from "./src/context/SyncContext";
import { SyncOfflineBar, SyncNoticeToast } from "./src/components/SyncStatusBanner";
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

interface ChildrenProps {
  children: React.ReactNode;
}

const AppShell: React.FC<ChildrenProps> = ({ children }) => (
  <SafeAreaProvider>
    <ThemeProvider>
      <FontSizeProvider>
        <DaltonismoProvider>{children}</DaltonismoProvider>
      </FontSizeProvider>
    </ThemeProvider>
  </SafeAreaProvider>
);

const DataProviders: React.FC<ChildrenProps> = ({ children }) => (
  <AuthProvider>
    <SyncProvider>
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
                            <NotificacionesProvider>{children}</NotificacionesProvider>
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
    </SyncProvider>
  </AuthProvider>
);

const MainNavigation: React.FC = () => (
  <>
    <View style={{ flex: 1 }}>
      <SyncOfflineBar />
      <NavigationContainer>
        <StackNavigator />
      </NavigationContainer>
      <SyncNoticeToast />
    </View>
    <KeyboardDismissFab />
  </>
);

const App: React.FC = () => {
  const [migrated, setMigrated] = useState(false);

  useEffect(() => {
    migrateLegacySessionKeys().finally(() => setMigrated(true));
  }, []);

  // Block render until migration completes (fast, single AsyncStorage read)
  if (!migrated) return null;

  return (
    <AppShell>
      <DataProviders>
        <MainNavigation />
      </DataProviders>
    </AppShell>
  );
};
export default App;
