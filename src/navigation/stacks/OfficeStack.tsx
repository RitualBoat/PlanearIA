import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import type { OfficeStackParamList } from "../types";

import OfficeHomeScreen from "../../screens/office/OfficeHomeScreen";
import CrearPlaneacionScreen from "../../screens/planeaciones/CrearPlaneacionScreen";
import ImportarPlaneacionScreen from "../../screens/planeaciones/ImportarPlaneacionScreen";
import ExportarPlaneacionScreen from "../../screens/planeaciones/ExportarPlaneacionScreen";
import ListaPlaneacionesScreen from "../../screens/planeaciones/ListaPlaneacionesScreen";
import EscanerPlantillaScreen from "../../screens/planeaciones/EscanerPlantillaScreen";
import RecursosDidacticosScreen from "../../screens/biblioteca/RecursosDidacticosScreen";
import ListaRecursosScreen from "../../screens/biblioteca/ListaRecursosScreen";
import CrearRecursoScreen from "../../screens/biblioteca/CrearRecursoScreen";
import BibliotecaPlantillasScreen from "../../screens/plantillas/BibliotecaPlantillasScreen";
import ListaPlantillasScreen from "../../screens/plantillas/ListaPlantillasScreen";
import DetallePlantillaScreen from "../../screens/plantillas/DetallePlantillaScreen";
import EditorPlantillaScreen from "../../screens/plantillas/EditorPlantillaScreen";
import ContenidoScreen from "../../screens/contenido/ContenidoScreen";

const Stack = createStackNavigator<OfficeStackParamList>();

// Record: obliga en compilacion a registrar cada ruta del contrato exactamente
// una vez; el manifiesto (routeManifest.ts) ata el contrato a la particion.
const SCREENS: Record<keyof OfficeStackParamList, React.ComponentType<any>> = {
  OfficeHome: OfficeHomeScreen,
  Planeaciones: CrearPlaneacionScreen,
  CrearPlaneacion: CrearPlaneacionScreen,
  GenerarPlaneacionIA: CrearPlaneacionScreen,
  ImportarPlaneacion: ImportarPlaneacionScreen,
  EscanerPlantilla: EscanerPlantillaScreen,
  ExportarPlaneacion: ExportarPlaneacionScreen,
  ListaPlaneaciones: ListaPlaneacionesScreen,
  RecursosDidacticos: RecursosDidacticosScreen,
  ListaRecursos: ListaRecursosScreen,
  CrearRecurso: CrearRecursoScreen,
  BibliotecaPlantillas: BibliotecaPlantillasScreen,
  ListaPlantillas: ListaPlantillasScreen,
  DetallePlantilla: DetallePlantillaScreen,
  EditorPlantilla: EditorPlantillaScreen,
  Contenido: ContenidoScreen,
};

const ROUTE_NAMES = Object.keys(SCREENS) as Array<keyof OfficeStackParamList>;

/** Hub Office: planeaciones, recursos, plantillas y biblioteca (D2/D6). */
const OfficeStack: React.FC = () => (
  <Stack.Navigator
    id={undefined}
    initialRouteName="OfficeHome"
    screenOptions={{ headerShown: false }}
  >
    {ROUTE_NAMES.map((name) => (
      <Stack.Screen key={name} name={name} component={SCREENS[name]} />
    ))}
  </Stack.Navigator>
);

export default OfficeStack;
