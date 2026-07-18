import type {
  AppShellParamList,
  AsistenteStackParamList,
  ClasesStackParamList,
  InicioStackParamList,
  MasStackParamList,
  OfficeStackParamList,
} from "./types";
import { HUB_LANDING } from "./routeManifest";

export type HubName = keyof AppShellParamList;

type HubParamLists = {
  InicioTab: InicioStackParamList;
  OfficeTab: OfficeStackParamList;
  ClasesTab: ClasesStackParamList;
  AsistenteTab: AsistenteStackParamList;
  MasTab: MasStackParamList;
};

/**
 * Cualquier objeto de navegacion de React Navigation. Se acepta estructuralmente
 * porque las pantallas tipan su prop contra param lists distintos y este helper
 * debe servirles a todas sin obligar a cada una a componer tipos anidados.
 */
interface AnyNavigation {
  navigate: (...args: any[]) => void;
}

/**
 * Navega a una pantalla de otro hub con la forma anidada explicita.
 *
 * Existe porque las acciones de navegacion suben al padre pero nunca bajan a un
 * navegador hermano: `navigate("ListaRecursos")` desde Clases no encuentra la ruta,
 * que vive dentro del stack de Office. Centralizar la forma anidada evita repetir
 * literales fragiles en cada sitio cruzado y deja los nombres verificados por tipo.
 *
 * Sin `screen`, abre el hub tal como este (su historial se conserva); es el
 * equivalente del antiguo `navigate("MainTabs", { screen: <tab> })`.
 */
export function navigateToHub<H extends HubName, S extends keyof HubParamLists[H]>(
  navigation: AnyNavigation,
  hub: H,
  screen?: S,
  params?: HubParamLists[H][S]
): void {
  if (screen === undefined) {
    navigation.navigate("MainTabs", { screen: hub });
    return;
  }
  navigation.navigate("MainTabs", {
    screen: hub,
    params: { screen, params },
  });
}

/**
 * Regreso al origen real tras guardar o cerrar un flujo.
 *
 * Sustituye al antiguo parametro de retorno a Classroom: con los formularios dentro del stack
 * de su hub, el origen esta en el historial y `goBack()` llega a el. El fallback
 * cubre la entrada sin historial (deep link): aterriza en la pantalla inicial del
 * hub duenio en vez de dejar al docente sin salida.
 */
export function goBackOrHubLanding(
  navigation: AnyNavigation & { canGoBack: () => boolean; goBack: () => void },
  hub: HubName
): void {
  if (navigation.canGoBack()) {
    navigation.goBack();
    return;
  }
  navigateToHub(navigation, hub, HUB_LANDING[hub] as never);
}
