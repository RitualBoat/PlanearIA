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

const Stack = createStackNavigator<MasStackParamList>();

const SCREENS: Record<keyof MasStackParamList, React.ComponentType<any>> = {
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
  </Stack.Navigator>
);

export default MasStack;
