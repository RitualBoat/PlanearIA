import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import type { AsistenteStackParamList } from "../types";
import AsistenteHomeScreen from "../../screens/asistente/AsistenteHomeScreen";

const Stack = createStackNavigator<AsistenteStackParamList>();

/** Hub Asistente: senializado hasta asistente-ia-base (Ola 3). */
const AsistenteStack: React.FC = () => (
  <Stack.Navigator
    id={undefined}
    initialRouteName="AsistenteHome"
    screenOptions={{ headerShown: false }}
  >
    <Stack.Screen name="AsistenteHome" component={AsistenteHomeScreen} />
  </Stack.Navigator>
);

export default AsistenteStack;
