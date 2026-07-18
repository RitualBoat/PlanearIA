# Tasks: app-shell-navegacion

Regla: una tarea a la vez; `[x]` solo con evidencia (salida de typecheck, lint y tests afectados).
Validacion base del change: `npm run typecheck`, `npm run lint -- --quiet`, `npm test -- --runInBand`, `npm run test:classroom`, `npm run test:planeaciones`.

## 1. Preparacion

- [x] 1.1 Resolver la colision de nombres: renombrar el componente local `AppShell` de `App.tsx:33` a `AppProviders`, sin cambiar el arbol de providers ni su orden. (Evidencia: App.tsx solo conserva AppProviders; grep sin referencias residuales a AppShell fuera del comentario.)
- [x] 1.2 Congelar el inventario de navegacion vigente como evidencia: lista de las 60 rutas de `RootStackParamList`, las 5 tabs legacy y los sitios que navegan a `MainTabs`, guardado en `evidencia/inventario-rutas-antes.md`. (Evidencia: archivo creado con conteos verificados por grep sobre a8566d1.)

## 2. Contrato de navegacion

- [x] 2.1 Declarar `AppShellParamList` con los cinco hubs (`InicioTab`, `OfficeTab`, `ClasesTab`, `AsistenteTab`, `MasTab`) y los param lists anidados de cada stack de hub. (Evidencia: src/navigation/types.ts; typecheck limpio.)
- [x] 2.2 Reescribir `RootStackParamList` con las 9 rutas de raiz acordadas y eliminar de ella `returnToClassroom`. (Evidencia: RootStackParamList con 9 rutas en types.ts; sin el parametro de retorno; typecheck limpio.)
- [x] 2.3 Crear `src/navigation/navigateToHub.ts` con helpers tipados para navegacion anidada raiz->hub y hub->hub. (Evidencia: src/navigation/navigateToHub.ts + goBackOrHubLanding; tests navigateToHub.test.ts 5/5.)

## 3. Shell adaptativo

- [x] 3.1 Crear `src/navigation/AppShell.tsx`: un unico `createBottomTabNavigator` que derive `tabBarPosition`, `tabBarVariant` y `tabBarLabelPosition` de `useBreakpoint()`, con estilos desde `useAppTheme()` y tokens de `src/themes/tokens.ts`. (Evidencia: src/navigation/AppShell.tsx + shellOptions.ts; tests shellOptions.test.ts 9/9.)
- [x] 3.2 Aplicar accesibilidad de los destinos: rol de pestana, etiqueta accesible, estado seleccionado y area de toque >= 44 pt en las tres presentaciones. (Evidencia: tabBarAccessibilityLabel por hub, tabBarItemStyle minHeight 44; test shellA11y.)
- [x] 3.3 Desactivar la animacion de cambio de destino cuando `useReducedMotionPreference()` sea verdadero. (Evidencia: animation none con useReducedMotionPreference true; test en shellOptions.test.ts.)
- [x] 3.4 Crear `src/navigation/AppTopBar.tsx` con notificaciones (badge desde `NotificacionesContext`), ayuda y menu de cuenta, con foco visible en web y z-index desde la escala nombrada. (Evidencia: src/navigation/AppTopBar.tsx; tests de badge, etiquetas y menu en shellA11y.test.tsx.)

## 4. Hubs y stacks anidados

- [x] 4.1 Crear `EscritorioPlaceholderScreen` con dock hacia los otros cuatro hubs y aviso explicito de version temporal; fijarla como destino inicial del shell. (Evidencia: EscritorioPlaceholderScreen con dock 4 hubs + aviso temporal; INITIAL_HUB=InicioTab; tests.)
- [x] 4.2 Crear el hub de Office y su stack: planeaciones (7), recursos (3), plantillas (4) y `Contenido`. (Evidencia: OfficeStack con 16 rutas Record-exhaustivo + OfficeHomeScreen.)
- [x] 4.3 Crear el stack de Clases con `ClassroomHomeScreen` como landing: grupos (6), tareas (7), entregables (1), asistencia (2), calificaciones (2) y alumnos (7). (Evidencia: ClasesStack con 26 rutas, landing ClassroomHome.)
- [x] 4.4 Crear el hub de Asistente, que enruta a la IA vigente (crear o abrir documento con Copiloto) y declara lo que llega en `asistente-ia-base`. (Evidencia: AsistenteHomeScreen enruta al Copiloto real y declara lo futuro; sin chat falso.)
- [x] 4.5 Crear el hub de Mas y su stack: cuenta (4), `Perfil`, retos y posts (4), comunicacion (3), `Feed` y `Social`. (Evidencia: MasStack con 15 rutas + MasHomeScreen.)
- [x] 4.6 Sustituir `AppTabsNavigator` por el shell en `StackNavigator` y dejar la raiz en 9 rutas. (Evidencia: StackNavigator reescrito a 9 rutas; AppTabsNavigator eliminado; test routePartition 8/8.)

## 5. Migracion de llamadas

- [x] 5.1 Actualizar los 9 sitios que navegan a `MainTabs` con nombre de tab legacy a los nombres nuevos de hub. (Evidencia: 9 sitios reescritos; grep sin nombres de tab legacy.)
- [x] 5.2 Reescribir las 4 llamadas cruzadas enumeradas en el design (biblioteca->`ClassroomGroup`, grupos->`ListaRecursos`, contenido->`ListaEntregables`, deep link->`BuscadorPerfiles`) con la forma anidada. (Evidencia: 4 llamadas cruzadas via navigateToHub; enumeradas en inventario-rutas-antes.md.)
- [x] 5.3 Eliminar `returnToClassroom` de los 6 archivos acoplados, sustituyendolo por retroceso al origen con salvaguarda cuando no hay historial. (Evidencia: goBackOrHubLanding en los 3 flujos; tests con y sin historial.)
- [x] 5.4 Eliminar `src/components/FloatingActionIcons.tsx` y toda referencia a el. (Evidencia: git rm del componente flotante; afordancias en AppTopBar.)
- [x] 5.5 Buscar residuos: sin ocurrencias de `returnToClassroom`, de nombres de tab legacy (`FeedTab`, `ContenidoTab`, `GruposTab`, `SocialTab`, `ConfiguracionTab`) ni de `FloatingActionIcons` en `src/`. (Evidencia: grep de parametro de retorno, componente flotante y tabs legacy = cero ocurrencias.)

## 6. Pruebas

- [x] 6.1 Test de guardia de la particion de rutas: cada ruta esta registrada en su hub declarado y en ninguno otro; la raiz no excede 10 rutas; ninguna ruta del inventario previo desaparece del grafo. (Evidencia: routePartition.test.ts 8/8; manifiesto atado por tipos a los param lists.)
- [x] 6.2 Test del shell adaptativo: a 375, 768, 1279 y 1280 puntos hay exactamente una superficie de navegacion primaria montada, con la posicion esperada; nunca barra y rail a la vez. (Evidencia: shellOptions.test.ts 9/9 en 375/767/768/1279/1280/1920.)
- [x] 6.3 Test de destino inicial: autenticado con onboarding visto, el destino activo es Inicio. (Evidencia: INITIAL_HUB=InicioTab y landing Escritorio afirmados en routePartition.test.ts.)
- [x] 6.4 Test de retroceso tras guardar: con historial vuelve al origen; sin historial aterriza en la pantalla inicial del hub. (Evidencia: navigateToHub.test.ts + useCrearGrupoViewModel.test.tsx con y sin historial.)
- [x] 6.5 Test de accesibilidad del shell: rol de pestana, etiqueta y estado seleccionado en los destinos; acciones del chrome con etiqueta accesible. (Evidencia: shellA11y.test.tsx 5/5: roles, etiquetas, badge, menu de cuenta.)
- [x] 6.6 Ejecutar la validacion base completa y registrar la salida; sin regresion frente a la linea base. (Evidencia: typecheck y lint --quiet limpios; jest 102 suites/674 tests, base 98/646 sin fallos; classroom 21; planeaciones 42.)

## 7. Validacion visual y cierre

- [x] 7.1 Levantar `expo start --web`, confirmar HTTP 200 y solo entonces navegar con Playwright. (Evidencia: expo-web via launch.json; curl HTTP 200 confirmado antes de navegar; evidencia/README.md seccion 1.)
- [x] 7.2 Capturas por breakpoint (movil 375, tablet 768, escritorio 1280) mas los limites 767 y 1279, guardadas en `evidencia/`. (Evidencia: evidencia/capturas/ en 375/767/768/1279/1280 + medicion DOM; tablists=1 en todos los anchos.)
- [x] 7.3 Recorrido de alcance: verificar que `FeedScreen`, `SocialScreen`, `ContenidoScreen`, `CuentaScreen` y `ClassroomHomeScreen` siguen alcanzables desde los nuevos hubs; registrar el recorrido. (Evidencia: evidencia/README.md seccion 4; Contenido, ClassroomHome, Feed, Social y Cuenta alcanzables desde los hubs.)
- [x] 7.4 Checklist Nielsen del shell sin severidad >= 3 y checklist anti-slop de la seccion 1.9.3, en `evidencia/README.md`. (Evidencia: evidencia/README.md secciones 8 y 9; Nielsen severidad maxima 0; anti-slop 7/7.)
- [x] 7.5 Actualizar `TLDR.md` si el alcance, los archivos o el comportamiento cambiaron durante la implementacion. (Evidencia: TLDR.md actualizado a tiempo pasado; design.md ampliado con los archivos reales y la nota de tipado.)
- [ ] 7.6 Revision adversarial independiente y registro de su veredicto en `readiness.json`.
- [ ] 7.7 `npm run openspec:ready:archive -- --change app-shell-navegacion --run-local` en PASS.
