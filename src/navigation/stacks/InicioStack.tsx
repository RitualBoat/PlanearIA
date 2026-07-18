import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import type { InicioStackParamList } from "../types";
import EscritorioPlaceholderScreen from "../../screens/inicio/EscritorioPlaceholderScreen";

const Stack = createStackNavigator<InicioStackParamList>();

/** Hub Inicio: el Escritorio es la ruta inicial del shell (D1). */
const InicioStack: React.FC = () => (
  <Stack.Navigator
    id={undefined}
    initialRouteName="Escritorio"
    screenOptions={{ headerShown: false }}
  >
    <Stack.Screen name="Escritorio" component={EscritorioPlaceholderScreen} />
  </Stack.Navigator>
);

export default InicioStack;
