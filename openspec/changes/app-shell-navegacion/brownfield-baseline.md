# Brownfield baseline: app-shell-navegacion

Alcance de este documento: solo la superficie de navegacion que el change va a tocar. No inventaria la app completa ni sustituye la spec.

## Superficies tocadas

- `src/navigation/StackNavigator.tsx`: stack raiz con 60 registros `<Stack.Screen>` hermanos y `RootStackParamList`.
- `src/navigation/AppTabsNavigator.tsx`: tab navigator con 5 tabs legacy e `initialRouteName="FeedTab"`.
- `src/components/FloatingActionIcons.tsx`: overlay flotante de notificaciones, ayuda y menu de cuenta.
- `App.tsx`: componente local `AppShell` (envoltorio de providers) que colisiona en nombre con el shell de navegacion.
- Archivos acoplados a `returnToClassroom`: `src/hooks/useCrearGrupoViewModel.ts`, `src/hooks/useCrearTareaGrupoViewModel.ts`, `src/screens/biblioteca/CrearRecursoScreen.tsx`, `src/screens/classroom/ClassroomHomeScreen.tsx`, `src/screens/grupos/tareas/CrearTareaGrupoScreen.tsx` y el propio `StackNavigator.tsx`.
- Sitios que navegan a `MainTabs` con nombre de tab legacy (9 archivos) y las 4 llamadas cruzadas entre experiencias enumeradas en el design.
- Pantallas que se reapuntan sin modificarse por dentro: `FeedScreen`, `SocialScreen`, `ContenidoScreen`, `CuentaScreen`, `ClassroomHomeScreen`.

Fuera de esta lista no se toca nada: ni servicios, ni contextos de datos, ni backend, ni `src/sync`.

## Fuentes de verdad actuales

- Codigo real de `src/navigation/`, verificado el 2026-07-18 sobre el commit `b11344d` con el indice GitNexus reconstruido.
- `openspec/specs/reactive-breakpoints` (#79): `useBreakpoint()` como fuente reactiva unica; movil <768, tablet 768-1279, escritorio >=1280.
- `openspec/specs/theming-runtime-propagation` (#78): `useAppTheme()` y la fabrica `getStyles({ colors, isDark, scaled, highContrast, breakpoint })`.
- `openspec/specs/design-tokens` (#80): los seis grupos de tokens y `useReducedMotionPreference()`.
- `Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md`: decisiones D1, D5, D6, D7, D13; riesgo R4; seccion 1.9; change `app-shell-navegacion`.
- `Documentacion/03-validacion/auditoria-plan-maestro-uxui-ola1/`: hallazgos H10, H12b, H12d, H16; decision abierta DA4; investigacion-web F1, F2, F3.
- `Documentacion/00-fundamentos/MAPA_DDD_ESTRATEGICO_LIGERO.md`: contexto "Experiencia y Preferencias" como owner de la navegacion.
- Context7 sobre `reactnavigation.org` (2026-07-18): `tabBarPosition`, `tabBarVariant` y la regla de bubbling de acciones de navegacion.

## Comportamiento vigente

- La app autenticada abre en `FeedTab`, un feed social.
- La navegacion primaria es la misma a cualquier ancho: 5 tabs legacy abajo, con una barra flotante centrada cuando la plataforma es web y el ancho es >=768.
- Las 60 rutas son hermanas en la raiz: cualquier pantalla puede navegar a cualquier otra por nombre plano, y toda pantalla apilada tapa la barra de tabs.
- `returnToClassroom` es un parametro booleano que tres formularios usan para decidir a donde volver tras guardar. En `useCrearGrupoViewModel.ts:119` el destino es fijo (`GruposTab` o `ListaGrupos`), sin importar el origen real.
- `FloatingActionIcons` se monta dentro del tab navigator, en posicion absoluta con `zIndex: 1000`, con botones de 34x34 pt y estilos desde `COLORS` estatico, superpuesto al contenido de todas las pantallas del shell.
- El conteo de notificaciones no leidas ya se lee de `NotificacionesContext` desde ese overlay.

## Comportamiento objetivo

- La app autenticada abre en el hub de Inicio (Escritorio placeholder).
- Una unica superficie de navegacion primaria por ancho: barra inferior en movil, rail en tablet, sidebar en escritorio; nunca dos a la vez.
- Cinco hubs con historial propio; la raiz baja a 9 rutas hermanas y las demas viven dentro del hub que las posee.
- Tras guardar, los formularios vuelven al origen real por historial del hub; `returnToClassroom` deja de existir.
- Notificaciones, ayuda y cuenta viven en el TopBar del shell, con area de toque >= 44 pt, tokens de tema y foco visible en web; el overlay flotante desaparece.
- El shell respeta tema, fuente, daltonismo y reducir movimiento en caliente.

## Compatibilidad legacy

- **Ninguna ruta se borra.** Las 60 rutas siguen en el grafo de navegacion; cambian de contenedor, no de existencia.
- **Ninguna pantalla se borra ni se redisena.** `FeedScreen`, `SocialScreen` y `ContenidoScreen` pierden su tab propia pero siguen accesibles desde los hubs Mas y Office hasta que `conectaplan` y el rediseno de Office las sustituyan.
- **Se elimina un solo archivo**, `FloatingActionIcons.tsx`, porque sus tres afordancias se mudan al TopBar y mantenerlo montado conservaria la navegacion paralela que el change cierra.
- **Se elimina un parametro**, `returnToClassroom`, cuya unica razon de ser era compensar el stack plano.
- Almacenamiento intacto: no se leen ni escriben distinto las claves `@planearia:*`, `HAS_SEEN_ONBOARDING` ni las preferencias de accesibilidad. `SYNC_ENTITIES` y `src/sync` no se tocan.
- Contratos de contexto intactos: el shell solo lee `unreadCount` de `NotificacionesContext`, igual que hoy.

## Owner de spec y contexto

- Contexto delimitado owner: **Experiencia y Preferencias** (posee la navegacion como experiencia de uso). No requiere contrato cruzado nuevo; la unica lectura cruzada (`unreadCount`, owner Comunicacion Profesional) ya existe y no cambia de forma.
- Spec owner de este change: `adaptive-app-shell` (nueva).
- Specs que este change **no** modifica y de las que depende: `reactive-breakpoints`, `theming-runtime-propagation`, `design-tokens`.
- Changes vecinos cuya frontera queda declarada: `escritorio-docente` (Escritorio real), `notificaciones-chrome` (pantalla de avisos), `asistente-ia-base` (superficie de IA), `componentes-base`, `sync-status-ui`, `assign-sheet`.

## Evidencia actual

- Conteos verificados 2026-07-18: 60 registros `<Stack.Screen>`; 55 rutas destino distintas en llamadas `navigate()`; 9 llamadas `navigate("MainTabs", { screen })`; 4 rutas con entradas desde experiencias distintas; 6 archivos acoplados a `returnToClassroom`.
- `AppTabsNavigator.tsx:47,50`: overlay montado e `initialRouteName="FeedTab"`.
- `FloatingActionIcons.tsx:123-141`: posicion absoluta, `zIndex: 1000`, botones de 34x34 pt.
- `App.tsx:33`: colision del nombre `AppShell`.
- Ground truth visual Figma del shell: **no existe** (gate #46 sin avance, hallazgo H4). Declarado como limitacion conocida y no como bloqueo, con la justificacion escrita en `design.md` seccion 2: la paridad del shell es funcional segun el plan y el ground truth aplicable son M3 y React Navigation 7, ambas fuentes primarias ya registradas.

## Fuera de alcance

- El Escritorio real: dock definitivo, tablero del dia y tratamiento bento (`escritorio-docente`, Ola 2).
- El rediseno de la pantalla de notificaciones, su agrupacion por experiencia y sus deep links (`notificaciones-chrome`).
- La superficie de conversacion del asistente, adjuntos y backend (`asistente-ia-base`, Ola 3).
- La biblioteca de componentes base, el chip de estado de sync y el selector de asignacion (`componentes-base`, `sync-status-ui`, `assign-sheet`).
- Cualquier cambio de datos, sync, backend, gateway de IA o esquema de almacenamiento.
- El rediseno interno de las pantallas que se reapuntan.
- OQ1 (nombres finales de las experiencias) y la edicion del Plan Maestro.
