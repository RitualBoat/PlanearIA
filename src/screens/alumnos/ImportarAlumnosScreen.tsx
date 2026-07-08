import React from "react";
import { Pressable, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, type RouteProp } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../navigation/StackNavigator";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import WebScrollView from "../../components/WebScrollView";
import ErrorStage from "../../components/alumnos/importar/ErrorStage";
import ExitoStage from "../../components/alumnos/importar/ExitoStage";
import ProcesandoStage from "../../components/alumnos/importar/ProcesandoStage";
import SeleccionArchivoStage from "../../components/alumnos/importar/SeleccionArchivoStage";
import VistaPreviaStage from "../../components/alumnos/importar/VistaPreviaStage";
import { styles } from "../../components/alumnos/importar/styles";
import { useImportarAlumnosViewModel } from "../../hooks/useImportarAlumnosViewModel";
import { COLORS } from "../../../types";

type Nav = StackNavigationProp<RootStackParamList, "ImportarAlumnos">;
type Route = RouteProp<RootStackParamList, "ImportarAlumnos">;

interface ImportarAlumnosScreenProps {
  navigation: Nav;
}

const ImportarAlumnosScreen: React.FC<ImportarAlumnosScreenProps> = ({ navigation }) => {
  const route = useRoute<Route>();
  const grupoId = route.params?.grupoId;
  const grupoNombre = route.params?.grupoNombre;

  const {
    uiState,
    result,
    errorMessage,
    isImporting,
    validCount,
    invalidCount,
    previewRows,
    handleDownloadTemplate,
    handleSelectFile,
    handleImportValidRows,
    resetFlow,
  } = useImportarAlumnosViewModel(grupoId);

  const selectFile = () => void handleSelectFile();
  const importValidRows = () => void handleImportValidRows();

  const goToDestination = () => {
    if (grupoId) {
      navigation.navigate("ClassroomGroup", { grupoId, grupoNombre });
      return;
    }

    navigation.navigate("ListaAlumnos");
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <WebScrollView style={styles.content}>
          <View style={styles.headerRow}>
            <Pressable
              style={({ pressed }) => [styles.headerIconButton, pressed && { opacity: 0.6 }]}
              onPress={() => navigation.goBack()}
            >
              <MaterialIcons name="arrow-back" size={22} color={COLORS.primary} />
            </Pressable>
            <Text style={styles.headerTitle}>Importar Alumnos</Text>
          </View>

          <Text style={styles.pageTitle}>Carga de Datos</Text>
          <Text style={styles.pageSubtitle}>
            Importa tus alumnos desde archivos CSV o Excel para dar de alta listas completas.
          </Text>

          {uiState === "idle" ? (
            <SeleccionArchivoStage
              grupoId={grupoId}
              grupoNombre={grupoNombre}
              onSelectFile={selectFile}
              onDownloadTemplate={handleDownloadTemplate}
            />
          ) : null}
          {uiState === "processing" ? <ProcesandoStage /> : null}
          {uiState === "preview" ? (
            <VistaPreviaStage
              result={result}
              validCount={validCount}
              invalidCount={invalidCount}
              previewRows={previewRows}
              isImporting={isImporting}
              onSelectFile={selectFile}
              onDownloadTemplate={handleDownloadTemplate}
              onCancel={resetFlow}
              onImport={importValidRows}
            />
          ) : null}
          {uiState === "success" ? (
            <ExitoStage
              validCount={validCount}
              grupoId={grupoId}
              grupoNombre={grupoNombre}
              onPrimary={goToDestination}
              onImportMore={resetFlow}
            />
          ) : null}
          {uiState === "error" ? (
            <ErrorStage errorMessage={errorMessage} onRetry={selectFile} onCancel={resetFlow} />
          ) : null}
        </WebScrollView>
      </SafeAreaView>
    </View>
  );
};

export default ImportarAlumnosScreen;
