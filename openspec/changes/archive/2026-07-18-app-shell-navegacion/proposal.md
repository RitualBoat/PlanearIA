# Proposal: app-shell-navegacion

Issue: [#81](https://github.com/RitualBoat/PlanearIA/issues/81).
Plan: `Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md`, Ola 1, change `app-shell-navegacion`.
Depende de: #78 (`theming-runtime`) y #79 (`breakpoints-reactivos`), ambos archivados; consume tambien los tokens de #80.

## Why

La navegacion de PlanearIA contradice hoy la vision del plan en tres puntos verificables sobre el codigo (2026-07-18, indice GitNexus en `b11344d`):

1. **La app abre en un feed social, no en el escritorio del docente.** `AppTabsNavigator.tsx:50` fija `initialRouteName="FeedTab"`. La decision D1 del plan (Escritorio como landing) lleva sin cumplirse desde que se tomo; es el hallazgo H10 de la auditoria #76.
2. **No existe jerarquia de experiencias.** `StackNavigator.tsx` registra 60 rutas hermanas en un stack plano: `CalificarEntregas` es hermana de `Terminos` y de `RetoResultado`. Sin jerarquia, cada pantalla que necesita volver a su origen tiene que recordarlo a mano, que es exactamente para lo que existe el parametro `returnToClassroom` acoplando 6 archivos.
3. **Hay dos navegaciones compitiendo.** `FloatingActionIcons` se monta dentro del tab navigator (`AppTabsNavigator.tsx:47`) como overlay absoluto con `zIndex: 1000`, tapando contenido, con botones de 34x34 pt (bajo el minimo de 44 pt del proyecto) y `COLORS` estatico. Es el riesgo R4 del plan y la decision abierta DA4/OQ2.

Ademas, la navegacion actual es identica en telefono, tablet y escritorio: las mismas tabs abajo a cualquier ancho, con una barra flotante en web >=768 como unico gesto responsive. La decision D7 pide tabs en movil, rail en tablet y sidebar en web, y las fuentes primarias (Material Design 3, investigacion-web F2) anaden una regla dura: **nunca barra de navegacion y rail simultaneos**.

Mientras esto siga asi, toda pantalla nueva del plan nace colgada de un stack plano y hereda el acoplamiento. Este change es el que desbloquea la Ola 1 y, con ella, el Escritorio real de la Ola 2.

## What

Un **AppShell adaptativo** con hubs por experiencia, construido sobre la fundacion ya archivada (`useBreakpoint()` de #79, `useAppTheme()`/`getStyles` de #78, tokens y `useReducedMotionPreference()` de #80).

- **Un solo navegador de tabs con posicion adaptativa.** `createBottomTabNavigator` de React Navigation 7 acepta `tabBarPosition` y `tabBarVariant` (verificado en Context7 sobre `reactnavigation.org/docs/bottom-tab-navigator`, 2026-07-18). El shell deriva la posicion de `useBreakpoint()`: barra inferior en movil, rail lateral en tablet, sidebar lateral con etiquetas en escritorio. La regla "nunca barra y rail a la vez" deja de depender de la disciplina de quien programa: solo existe una barra y solo puede tener una posicion.
- **Cinco hubs por experiencia** (`InicioTab`, `OfficeTab`, `ClasesTab`, `AsistenteTab`, `MasTab`), cada uno con su stack anidado y su pantalla hub. Las pantallas actuales se reapuntan sin borrarse: `ContenidoScreen` entra por Office, `FeedScreen`/`SocialScreen`/`CuentaScreen` por Mas, `ClassroomHomeScreen` es el hub de Clases.
- **Ruta inicial = Escritorio.** `InicioTab` monta un placeholder honesto (dock hacia los otros hubs mas aviso de que es temporal), no una pantalla fantasma. El Escritorio real es de `escritorio-docente` (Ola 2).
- **Particion de rutas respaldada por evidencia.** La raiz baja de 60 a un maximo de 10 rutas hermanas; las demas viven dentro del hub que las posee, segun un analisis estatico de quien navega a que.
- **`FloatingActionIcons` se retira y sus afordancias suben al `AppTopBar`** (notificaciones con badge, ayuda, menu de cuenta), con toque >= 44 pt, tokens de tema y foco visible en web. Resuelve DA4/OQ2 con la opcion (a).
- **`returnToClassroom` desaparece** de `RootStackParamList` y de los 6 archivos que lo usan, sustituido por el regreso natural dentro del stack del hub.

## No objetivos

- No construir el Escritorio real (dock definitivo, tablero del dia, bento premium): es `escritorio-docente` de Ola 2. Aqui solo hay placeholder.
- No redisenar ninguna pantalla interna. Las pantallas actuales se reapuntan tal cual, con sus estilos vigentes.
- No redisenar la pantalla de notificaciones, agrupar avisos por experiencia ni construir deep links al objeto real: eso es `notificaciones-chrome`. Este change solo mueve la campana con badge al TopBar porque retira a su duenio actual.
- No construir UI de conversacion, adjuntos ni backend del asistente: es `asistente-ia-base` (Ola 3).
- No crear la biblioteca de componentes base, el `SyncStatusChip` ni el `AssignSheet`: son `componentes-base`, `sync-status-ui` y `assign-sheet`.
- No tocar datos, motor de sync, `SYNC_ENTITIES`, claves `@planearia:*`, backend ni gateway de IA.
- No borrar rutas ni pantallas del grafo de navegacion.
- No resolver OQ1 (nombres finales de las experiencias).
- No editar el Plan Maestro ni sus conteos.
