# Design: app-shell-navegacion

## 1. Contextos delimitados (DDD ligero)

Fuente: `Documentacion/00-fundamentos/MAPA_DDD_ESTRATEGICO_LIGERO.md`.

**Contexto owner: Experiencia y Preferencias**, que posee explicitamente "tema, fuente, daltonismo, accesibilidad, onboarding y navegacion como experiencia de uso". Toda la superficie de este change (shell, hubs, particion de rutas, TopBar, placeholder de Escritorio) vive dentro de ese contexto.

**No requiere contrato cruzado nuevo.** El change no crea, modifica ni mueve entidades de dominio: no toca `Grupo`, `Alumno`, `Tarea`, `Planeacion`, `Recurso`, `Calificacion` ni `Asistencia`. Reordena la capa de presentacion que ya las muestra.

Hay una unica lectura cruzada, y ya existe hoy:

| Dato | Contexto owner | Consumidor | Direccion y forma | Compatibilidad |
| --- | --- | --- | --- | --- |
| `unreadCount` de Notificacion | Comunicacion Profesional (`NotificacionesContext`) | Experiencia y Preferencias (`AppTopBar`) | Lectura de solo lectura, sin escritura ni transformacion | Identica a la vigente: `FloatingActionIcons.tsx:22` ya consume `useNotificaciones().unreadCount`. Cambia el contenedor visual, no el contrato. |

Invariantes preservadas: el shell no consulta ni filtra datos academicos, por lo que el aislamiento por `userId` sigue siendo responsabilidad de los contextos que ya lo aplican; no se introducen clientes HTTP ni colas paralelas; no se toca `src/sync`; no hay accion de IA en esta superficie, asi que la regla de confirmacion docente no aplica.

## 2. Ground truth visual

El plan pide "wireframe Figma del shell (3 breakpoints)" como ground truth y el issue instruye declararlo como bloqueo si no existe al proponer. **No existe: el gate #46 sigue sin avance (hallazgo H4 de la auditoria #76).**

Se declara como **limitacion conocida, no como bloqueo de este change**, con esta justificacion explicita:

- El plan clasifica la paridad de `app-shell-navegacion` como **funcional**, no visual (seccion 1.5: "Cuenta, shell, sync UI -> paridad funcional"). Los changes de paridad alta (NotasPLAN, Clases, AsistePLAN, ConectaPLAN) son los que no pueden avanzar sin frames.
- El ground truth aplicable a la forma del shell son fuentes primarias ya registradas en `investigacion-web.md`: Material Design 3 (navigation rail, window size classes, regla de no coexistencia bar/rail) y la documentacion oficial de React Navigation 7. Son normativas y verificables, y estan citadas en la seccion 4.
- El shell no define lenguaje visual propio: consume los tokens de #80 y el tema en runtime de #78. No hay decision estetica que un frame tendria que resolver antes de implementar.

Consecuencia registrada: cuando `prototipos-figma-ola2` produzca los frames del shell, cualquier ajuste visual entra como refinamiento en ese hito o en `componentes-base`, no reabre esta arquitectura de navegacion.

## 3. Arquitectura del shell

### 3.1 Un solo navegador, una sola barra

```
NavigationContainer
+- RootStack (9 rutas hermanas)
   +- Onboarding | Login | Registro | RecuperarContrasena     (fuera del shell)
   +- MainTabs -> AppShell                                     (el shell)
   |  +- AppTopBar                        (chrome: notificaciones, ayuda, cuenta)
   |  +- Tab.Navigator (tabBarPosition adaptativa)
   |     +- InicioTab     -> InicioStack     (Escritorio placeholder)
   |     +- OfficeTab     -> OfficeStack     (16 rutas)
   |     +- ClasesTab     -> ClasesStack     (26 rutas)
   |     +- AsistenteTab  -> AsistenteStack  (hub senializado)
   |     +- MasTab        -> MasStack        (15 rutas)
   +- DocEditor | Notificaciones | Ayuda | Terminos            (overlays sobre el shell)
```

La decision central: **no hay dos componentes de navegacion primaria**. Existe un unico `createBottomTabNavigator` cuya barra cambia de posicion y variante segun el breakpoint. React Navigation 7 lo soporta de fabrica (verificado en Context7, `reactnavigation.org/docs/bottom-tab-navigator`, 2026-07-18): `tabBarPosition` acepta `bottom | top | left | right` y `tabBarVariant` acepta `uikit | material`, donde `material` solo es valido con posicion `left`/`right`.

| Breakpoint (`useBreakpoint()` de #79) | `tabBarPosition` | `tabBarVariant` | `tabBarLabelPosition` | Resultado |
| --- | --- | --- | --- | --- |
| `mobile` (<768) | `bottom` | `uikit` | `below-icon` | Barra de navegacion inferior |
| `tablet` (768-1279) | `left` | `material` | `below-icon` | Navigation rail estrecho |
| `desktop` (>=1280) | `left` | `material` | `beside-icon` | Sidebar con etiquetas |

Por que esto importa mas que ahorrar codigo: la regla M3 "nunca navigation bar y rail simultaneos" (investigacion-web F2, criterio H16) se convierte en una **imposibilidad estructural** en vez de una convencion que revisar en cada PR. Una sola barra no puede estar en dos posiciones. La alternativa evaluada y descartada era montar un `Drawer` (o `react-native-drawer-layout`, F1) para web/tablet junto al tab navigator de movil: habria significado dos arboles de navegacion, estado duplicado, riesgo real de que ambos se rendericen en un rango de anchos, y un remount al cruzar el breakpoint. `react-native-drawer-layout` sigue siendo la herramienta correcta para un drawer *secundario* (por ejemplo, el panel acoplable del asistente de D4), no para la navegacion primaria.

El cambio de breakpoint no remonta el navegador: `useBreakpoint()` es reactivo sobre `useWindowDimensions()` (#79) y solo altera `screenOptions`, de modo que redimensionar la ventana conserva el estado de navegacion de cada hub.

### 3.2 Particion de rutas: por que la raiz no puede vaciarse del todo

Las acciones de navegacion de React Navigation **suben** al navegador padre cuando el actual no puede atenderlas, y **nunca bajan** a un navegador hermano (Context7, `reactnavigation.org/docs/nesting-navigators`, 2026-07-18). De ahi salen tres reglas que gobiernan la migracion:

1. **Hub -> raiz funciona solo.** Una pantalla dentro de `ClasesStack` puede llamar `navigate("Terminos")` sin cambios: sube al tab navigator, sube a la raiz y encuentra la ruta.
2. **Raiz -> hub necesita forma anidada explicita.** `navigate("MainTabs", { screen: "MasTab", params: { screen: "Perfil" } })`.
3. **Hub A -> hub B necesita forma anidada explicita.** Igual que el anterior.

Por eso la particion no se decide por gusto tematico sino por un analisis estatico de quien navega a que (2026-07-18, 55 rutas destino en `src/`). La raiz conserva unicamente las rutas que **nunca navegan hacia un hub**, de modo que ningun destino queda inalcanzable:

| Ruta que se queda en la raiz | Por que |
| --- | --- |
| `Onboarding`, `Login`, `Registro`, `RecuperarContrasena` | Viven fuera del shell: no hay tabs que mostrar antes de autenticarse |
| `MainTabs` | Es el shell |
| `DocEditor` | Editor a pantalla completa: es correcto que tape el shell. Solo navega a `MainTabs` |
| `Notificaciones`, `Ayuda` | Destinos del TopBar; solo navegan a `MainTabs` |
| `Terminos` | Unico destino compartido entre `auth` (fuera del shell) y `Cuenta` (dentro de Mas); desde Mas sube por bubbling |

Resultado medible: **la raiz pasa de 60 a 9 rutas hermanas**. Las 51 restantes (50 existentes mas `ClassroomHome`, que hoy es una tab) se reparten entre los cinco hubs, junto con las cuatro pantallas hub nuevas y las tres pantallas que hoy son tabs y pasan a ser rutas (`Contenido`, `Feed`, `Social`).

| Hub | Rutas | Contenido |
| --- | --- | --- |
| `InicioTab` | 1 | `Escritorio` (placeholder nuevo) |
| `OfficeTab` | 16 | Hub nuevo + planeaciones (7) + recursos (3) + plantillas (4) + `Contenido` |
| `ClasesTab` | 26 | `ClassroomHome` (hub existente) + grupos (6) + tareas (7) + entregables (1) + asistencia (2) + calificaciones (2) + alumnos (7) |
| `AsistenteTab` | 1 | Hub senializado nuevo |
| `MasTab` | 15 | Hub nuevo + cuenta (4) + `Perfil` + retos/posts (4) + comunicacion (3) + `Feed` + `Social` |

Llamadas que hay que reescribir, enumeradas y cerradas:

| Sitio | Llamada hoy | Motivo | Forma nueva |
| --- | --- | --- | --- |
| `src/screens/biblioteca/*` | `navigate("ClassroomGroup")` | Office -> Clases | Anidada explicita |
| `src/screens/grupos/*` | `navigate("ListaRecursos")` | Clases -> Office | Anidada explicita |
| `src/screens/contenido/*` | `navigate("ListaEntregables")` | Office -> Clases | Anidada explicita |
| `src/hooks/useDeepLinkHandler.ts` | `navigate("BuscadorPerfiles")` | Raiz -> Mas | Anidada explicita |
| `AppTopBar` (menu de cuenta) | `navigate("Perfil")` / `navigate("MainTabs", { screen: "ConfiguracionTab" })` | Shell -> Mas | Anidada explicita hacia `MasTab` |
| 9 sitios con `navigate("MainTabs", { screen })` | Nombres de tab legacy | Renombre de tabs | Nombres nuevos de hub |

Para no repetir literales fragiles en esos sitios, el change expone un modulo `src/navigation/navigateToHub.ts` con helpers tipados por `AppShellParamList`. Es una funcion pura sobre el objeto de navegacion, no un Context ni un provider global.

Se anade un test de guardia que afirma la particion: toda ruta declarada como propiedad de un hub esta registrada en ese hub y en ningun otro, y ninguna ruta de la raiz aparece dentro de un hub. Asi la regla deja de depender de la memoria de quien edite despues.

### 3.3 Que pasa con las pantallas legacy

Criterio de aceptacion del plan: "pantallas actuales siguen accesibles desde los nuevos hubs; migracion por reapuntado, sin borrar rutas".

| Pantalla | Hoy | Despues | Justificacion |
| --- | --- | --- | --- |
| `FeedScreen` | `FeedTab` (landing) | Ruta dentro de `MasStack`, enlazada desde el hub Mas | D1 le quita el landing; D5 la disuelve en ConectaPLAN, que aun no existe. Se conserva accesible, no se borra |
| `SocialScreen` | `SocialTab` | Ruta dentro de `MasStack` | Igual que Feed (D5) |
| `ContenidoScreen` | `ContenidoTab` | Ruta dentro de `OfficeStack` | D6: su funcion pasa a la biblioteca de Office |
| `ClassroomHomeScreen` | `GruposTab` | Landing de `ClasesTab` | Es la experiencia Clases del plan |
| `CuentaScreen` | `ConfiguracionTab` | Ruta `Cuenta` dentro de `MasStack` | D7 la mueve al hub Mas |

Ninguna ruta se elimina de `RootStackParamList` salvo `returnToClassroom`, que es un parametro, no una ruta.

### 3.4 Los hubs, y por que ninguno es una pantalla fantasma

La regla de frontend prohibe "skeleton/placeholder screens without clear entry points and exit CTAs". Los cinco hubs cumplen porque todos son lanzadores reales hacia pantallas que ya funcionan:

- **Escritorio (`InicioTab`)**: dock hacia Office, Clases, Asistente y Mas, mas un aviso explicito y honesto de que es una version temporal y que el Escritorio completo (tablero del dia) llega en Ola 2. No inventa datos ni tarjetas vacias.
- **Office**: NotasPLAN (planeaciones y DocEditor), plantillas, recursos y biblioteca (`Contenido`). Todos destinos vivos.
- **Clases**: es `ClassroomHomeScreen`, que ya es una pantalla real con datos.
- **Asistente**: la unica IA vigente es contextual dentro del editor (`useCopiloto`, `AIToolbar`, `DocEditorScreen`); no existe superficie de conversacion. El hub enruta a lo que si funciona hoy (crear o abrir un documento y usar el Copiloto) y declara lo que falta. Se monta la quinta posicion ahora, y no en Ola 3, porque la arquitectura de informacion es justamente lo que este change fija: dejar el hueco obligaria a rehacer el shell cuando llegue `asistente-ia-base`.
- **Mas**: cuenta, perfil, notificaciones, ayuda, comunicacion (chat, social, feed) y retos.

Estado de datos: los hubs son lanzadores estaticos, sin carga asincrona propia, de modo que no tienen estados loading/empty/error propios. El estado offline global lo sigue mostrando `SyncOfflineBar`, ya montado en `App.tsx`, y el chip de sync es de `sync-status-ui`. La spec registra este razonamiento en vez de declarar los estados "N/A" en silencio.

### 3.5 TopBar: destino de `FloatingActionIcons` (DA4 / OQ2)

Se elige la **opcion (a): integrar al TopBar**, y ademas se retira el componente flotante.

Lo que hay hoy en `FloatingActionIcons.tsx`: un `View` en posicion absoluta con `zIndex: 1000` y `elevation: 12`, superpuesto al contenido, con tres botones de 34x34 pt (por debajo del minimo de 44 pt que el proyecto adopta como estandar, mas estricto que el minimo AA de WCAG 2.2 segun investigacion-web F3), estilos con `COLORS` estatico (no propaga tema, daltonismo ni fuente) y un menu modal de cuenta.

Por que no basta con dejarlo montado: es literalmente el riesgo R4 del plan, "segunda navegacion paralela". Mantenerlo junto al nuevo shell conservaria el problema que este change existe para cerrar; dejarlo en el repo sin montar seria codigo muerto. Se elimina el archivo y sus tres afordancias pasan al `AppTopBar`:

| Afordancia | Comportamiento en el TopBar |
| --- | --- |
| Notificaciones | Icono con badge de no leidos desde `NotificacionesContext`; navega a `Notificaciones` (raiz) |
| Ayuda | Navega a `Ayuda` (raiz) |
| Cuenta | Menu con Mi perfil, Cuenta y seguridad, Cerrar sesion; navega con forma anidada hacia `MasTab` |

Mejoras que trae el movimiento, verificables: area de toque >= 44 pt; colores desde `useAppTheme()` en vez de `COLORS` estatico; foco visible por teclado en web; sin superposicion sobre el contenido (el TopBar ocupa su propio espacio en el layout); y `accessibilityRole`/`accessibilityLabel` en cada accion.

### 3.6 Frontera con `notificaciones-chrome` (H12b)

**Decision: no se absorbe.** Criterio aplicado, para que la decision sea reproducible y no una preferencia:

- Se absorbe **solo** lo que es chrome del shell y que ademas este change esta obligado a mover porque retira a su duenio actual: la campana con badge en el TopBar.
- Queda fuera todo lo que es rediseno de pantalla o modelo de datos de avisos: el rediseno de `NotificacionesScreen`, la agrupacion por experiencia y el deep link al objeto real.

Razon: este ya es, por el propio plan, "el change mas delicado de navegacion" (60 rutas, 6 archivos acoplados por `returnToClassroom`, 6 llamadas cruzadas a reescribir). Anadirle un rediseno de pantalla violaria la regla "un change grande a la vez" y el no objetivo "no redisenar pantallas internas". `notificaciones-chrome` conserva su alcance y su dependencia de este change queda satisfecha: hereda un TopBar donde el badge ya vive.

### 3.7 Muerte de `returnToClassroom`

El parametro existe unicamente para compensar el stack plano: como toda pantalla es hermana de toda pantalla, al guardar habia que recordar a mano el origen. Hoy produce ademas un defecto real: `useCrearGrupoViewModel.ts:119` fuerza `GruposTab` o `ListaGrupos` sin importar desde donde se abrio la pantalla.

Con `CrearGrupo`, `CrearTareaGrupo` y `CrearRecurso` dentro del stack de su hub, el origen esta en el mismo historial y `goBack()` regresa a el. Se elimina el parametro de `RootStackParamList` y de los 6 archivos, con esta forma para cubrir la entrada sin historial (por ejemplo, deep link):

```
navigation.canGoBack() ? navigation.goBack() : navigateToHub(navigation, <hub landing>)
```

## 4. Verificacion de APIs (D15, anti-alucinacion)

Consultado con Context7 el 2026-07-18 sobre `reactnavigation.org` (React Navigation 7, la version que el repo usa):

- `createBottomTabNavigator` acepta `tabBarPosition: "bottom" | "top" | "left" | "right"`; en `left`/`right` la barra se estiliza como sidebar.
- `tabBarVariant: "uikit" | "material"`; `material` solo esta soportado con `tabBarPosition` `left` o `right`.
- La documentacion oficial incluye el patron adaptativo por ancho de ventana como caso de uso previsto, no como truco.
- Las acciones de navegacion las atiende el navegador actual y **suben** al padre si no puede atenderlas; cada navegador anidado mantiene su propio historial.
- `react-native-drawer-layout` es standalone en RN7 (investigacion-web F1): queda disponible para paneles secundarios futuros, no se adopta aqui.

Cada opcion se comprueba contra el comportamiento real durante apply; ninguna se da por buena solo por estar documentada.

## 5. Responsive, tokens y estandar visual

- **Pantalla madre unica.** El shell es un solo componente responsive; no se crean archivos `.web.tsx` ni `.native.tsx`. La diferencia entre breakpoints son opciones de navegacion, no implementaciones distintas, asi que no hay justificacion para bifurcar por plataforma.
- **Tokens y tema en runtime.** Espaciado, radios, elevacion, tipografia y z-index salen de `src/themes/tokens.ts` (#80); los colores de `useAppTheme()` (#78) mediante fabricas `getStyles({ colors, isDark, scaled, highContrast, breakpoint })`. Prohibido introducir `COLORS` estatico o paletas nuevas. El z-index del TopBar sale de la escala nombrada, no del `zIndex: 1000` magico que usaba el overlay.
- **Motion (seccion 1.9.4).** La unica animacion es la transicion entre tabs. Se apoya en la animacion nativa del navegador y se desactiva cuando `useReducedMotionPreference()` (#80) es verdadero, que combina el ajuste del sistema operativo via reanimated con la preferencia in-app reactiva. Sin blur, sin parallax, sin gradientes costosos: el shell se ve a diario y en el telefono de gama media de Maria, donde la calma y los 60fps valen mas que el efecto.
- **Micro-interaccion significativa (1.9.3).** El indicador de tab activa comunica estado, no decora: cambio de color e icono desde tokens, con transicion corta y equivalente estatico bajo reduce-motion.
- **Anti-slop.** El shell no usa placeholders genericos ni avatares grises inventados; el placeholder de Escritorio dice explicitamente que es temporal en vez de simular tarjetas vacias. La densidad cambia por breakpoint (rail estrecho en tablet, sidebar con etiquetas en escritorio), no es una columna movil estirada.
- **Accesibilidad.** Cada destino expone `accessibilityRole="tab"` y su estado seleccionado; area de toque >= 44 pt en tabs, rail, sidebar y acciones del TopBar; foco visible y recorrible por teclado en web; los labels no dependen del color.

## 6. Riesgos y mitigaciones

| Riesgo | Mitigacion |
| --- | --- |
| Una ruta queda inalcanzable tras anidar | Particion derivada de analisis estatico de llamadas; test de guardia sobre la particion; recorrido manual por breakpoint de las pantallas legacy |
| Una llamada cruzada entre hubs se escapa del inventario | `npm run typecheck` sobre `AppShellParamList` tipado, mas revision de los 6 sitios enumerados y busqueda final de `navigate("MainTabs"` y de nombres de tab legacy |
| Colision del nombre `AppShell` con el componente local de `App.tsx:33` | Se renombra el envoltorio de providers a `AppProviders`; el nombre `AppShell` queda para el shell de navegacion |
| Regresion en tests de classroom o planeaciones al mover rutas | `npm run test:classroom` y `npm run test:planeaciones` en la validacion; las suites afectadas se corren antes de marcar tareas |
| El rail/sidebar tapa contenido en anchos intermedios | QA Playwright en los tres breakpoints y en el limite exacto (767/768, 1279/1280) |
| El cambio de breakpoint pierde el estado de navegacion | Un unico navegador con `screenOptions` derivadas; se verifica redimensionando sin recargar |
