import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import type { MasStackParamList } from "../types";

import MasHomeScreen from "../../screens/mas/MasHomeScreen";
import CuentaScreen from "../../screens/cuenta/CuentaScreen";
import EditarPerfilScreen from "../../screens/cuenta/EditarPerfilScreen";
import AdminRolesScreen from "../../screens/cuenta/AdminRolesScreen";
import SesionesActivasScreen from "../../screens/cuenta/SesionesActivasScreen";
import PerfilScreen from "../../screens/perfil/PerfilScreen";
import RetoResolucionScreen from "../../screens/feed/RetoResolucionScreen";
import RetoResultadoScreen from "../../screens/feed/RetoResultadoScreen";
import QuestionEditorScreen from "../../screens/feed/QuestionEditorScreen";
import PostDetailScreen from "../../screens/feed/PostDetailScreen";
import BuscadorPerfilesScreen from "../../screens/social/BuscadorPerfilesScreen";
import ChatScreen from "../../screens/chat/ChatScreen";
import ConversacionScreen from "../../screens/chat/ConversacionScreen";
import FeedScreen from "../../screens/feed/FeedScreen";
import SocialScreen from "../../screens/social/SocialScreen";

import CatalogoComponentesScreen from "../../screens/mas/CatalogoComponentesScreen";

const Stack = createStackNavigator<MasStackParamList>();

/**
 * Catalogo de la biblioteca base (#82): herramienta de revision, no pantalla de producto.
 *
 * Se registra solo bajo `__DEV__` para que exista durante la QA visual (expo start --web
 * corre en desarrollo) y quede fuera del bundle que usa el docente.
 */
export const RUTAS_SOLO_DESARROLLO = ["CatalogoComponentes"] as const;

/**
 * Rutas de produccion del hub. `CatalogoComponentes` queda fuera a proposito: se registra
 * aparte y solo bajo `__DEV__`.
 */
const SCREENS: Record<
  Exclude<keyof MasStackParamList, (typeof RUTAS_SOLO_DESARROLLO)[number]>,
  React.ComponentType<any>
> = {
  MasHome: MasHomeScreen,
  Cuenta: CuentaScreen,
  EditarPerfil: EditarPerfilScreen,
  AdminRoles: AdminRolesScreen,
  SesionesActivas: SesionesActivasScreen,
  Perfil: PerfilScreen,
  RetoResolucion: RetoResolucionScreen,
  RetoResultado: RetoResultadoScreen,
  QuestionEditor: QuestionEditorScreen,
  PostDetail: PostDetailScreen,
  BuscadorPerfiles: BuscadorPerfilesScreen,
  Chat: ChatScreen,
  Conversacion: ConversacionScreen,
  Feed: FeedScreen,
  Social: SocialScreen,
};

const ROUTE_NAMES = Object.keys(SCREENS) as Array<keyof MasStackParamList>;

/** Hub Mas: cuenta, perfil y la comunidad legacy (Feed/Social hasta conectaplan). */
const MasStack: React.FC = () => (
  <Stack.Navigator
    id={undefined}
    initialRouteName="MasHome"
    screenOptions={{ headerShown: false }}
  >
    {ROUTE_NAMES.map((name) => (
      <Stack.Screen key={name} name={name} component={SCREENS[name]} />
    ))}
    {__DEV__ ? (
      <Stack.Screen
        name="CatalogoComponentes"
        component={CatalogoComponentesScreen}
        options={{ title: "Catalogo de componentes" }}
      />
    ) : null}
  </Stack.Navigator>
);

export default MasStack;
