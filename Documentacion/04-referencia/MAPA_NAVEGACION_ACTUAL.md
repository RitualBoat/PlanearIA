# Mapa de Navegacion Actual - PlanearIA

> **Que es:** descripcion de la navegacion **implementada** en la app, no de la navegacion objetivo.
> **Documento derivado:** su fuente es `src/navigation/routeManifest.ts`, el manifiesto que declara en
> valores que ruta vive en que navegador y cuya correccion esta atada a `npm run typecheck`.
> **Cuando se actualiza:** cuando cambia `src/navigation/routeManifest.ts`. Verificar el mapa es comparar
> estas tablas contra ese archivo.
> **Donde vive la navegacion objetivo:** `Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md`.
> **Snapshot de codigo:** `development@4755177` (posterior al change `app-shell-navegacion`, issue #81).

## Fuentes De Verdad

| Archivo | Que aporta |
| --- | --- |
| `src/navigation/routeManifest.ts` | Particion de rutas en valores: `ROOT_ROUTES`, `HUB_ROUTES`, `DEV_ONLY_ROUTES`, `INITIAL_HUB`, `HUB_LANDING`. Sus chequeos bidireccionales rompen la compilacion si el manifiesto y los contratos divergen. |
| `src/navigation/AppShell.tsx` | Los cinco hubs, su titulo, su icono y la barra adaptativa. |
| `src/navigation/types.ts` | Param lists por hub y `RootStackParamList`. |
| `src/navigation/StackNavigator.tsx` | Composicion real de la raiz. |
| `src/navigation/navigateToHub.ts` | Forma unica del cruce entre hubs y del retorno al origen. |
| `src/navigation/stacks/` | Un stack por hub. |

## Arquitectura En Una Frase

Un unico navegador de tabs (`AppShell`) cuya barra cambia de posicion segun el breakpoint, con cinco hubs
que son stacks anidados con historial propio, sobre una raiz de nueve rutas. La app abre en el Escritorio
(`INITIAL_HUB = "InicioTab"`).

## Hubs

Los cinco hubs del shell. Esta tabla contiene hubs y nada mas: las pantallas viven en la seccion de su hub.

| Hub | Ruta | Landing | Proposito |
| --- | --- | --- | --- |
| Inicio | `InicioTab` | `Escritorio` | Escritorio docente: dock hacia las demas experiencias. Ruta inicial del shell. |
| Office | `OfficeTab` | `OfficeHome` | Documentos, planeaciones, recursos, plantillas y biblioteca. |
| Clases | `ClasesTab` | `ClassroomHome` | Grupos, tareas, asistencia, calificaciones y alumnos. |
| Asistente | `AsistenteTab` | `AsistenteHome` | Espacio del Copiloto IA. |
| Mas | `MasTab` | `MasHome` | Cuenta, perfil, comunicacion y comunidad. |

## Hub Inicio (`InicioTab`)

- `Escritorio` - `EscritorioPlaceholderScreen`.

Placeholder honesto (decision D1): la app abre en el Escritorio y no en un feed, con salidas reales hacia
Office, Clases, Asistente y Mas. No simula datos ni tarjetas vacias. El Escritorio completo (dock
definitivo y tablero del dia) pertenece al change `escritorio-docente` de la Ola 2.

## Hub Office (`OfficeTab`)

Landing: `OfficeHome`.

**Planeaciones:** `Planeaciones`, `CrearPlaneacion`, `GenerarPlaneacionIA`, `ImportarPlaneacion`,
`EscanerPlantilla`, `ExportarPlaneacion`, `ListaPlaneaciones`.

El editor de documentos `DocEditor` no vive aqui: es ruta de raiz, porque se abre a pantalla completa
sobre cualquier hub.

**Recursos didacticos:** `RecursosDidacticos`, `ListaRecursos`, `CrearRecurso`.

**Plantillas:** `BibliotecaPlantillas`, `ListaPlantillas`, `DetallePlantilla`, `EditorPlantilla`.

**Biblioteca transversal:** `Contenido`.

> **Superficie legacy.** `Contenido` fue la tab `ContenidoTab` antes de #81. La decision D6 disolvio esa
> tab y su funcion paso a la biblioteca dentro de Office mas el selector transversal Asignar/Adjuntar. La
> pantalla sigue viva y alcanzable como ruta de este hub; no es navegacion primaria.

## Hub Clases (`ClasesTab`)

Landing: `ClassroomHome` (la pantalla de Classroom existente, con datos reales).

**Grupos:** `ListaGrupos`, `CrearGrupo`, `DetalleGrupo`, `ClassroomGroup`, `ReportesGrupo`,
`ImportarGrupos`.

**Tareas dentro de grupos:** `CrearTareaGrupo`, `AsignarRecurso`, `DetalleTarea`, `CalificarEntregas`,
`DetalleActividadClassroom`, `AgregarContenidoClassroom`, `DetalleRecursoClassroom`.

**Entregables:** `ListaEntregables`.

**Asistencia:** `RegistrarAsistencia`, `HistorialAsistencia`.

**Calificaciones:** `CapturarCalificaciones`, `PromediosCalificaciones`.

**Alumnos:** `CrearAlumno`, `ListaAlumnos`, `ImportarAlumnos`, `ExportarAlumnos`, `DetalleAlumno`,
`NotasAlumno`, `ReportesAlumno`.

Regla vigente: si existe flujo contextual en Clases, no volver a formularios legacy como experiencia
principal.

## Hub Asistente (`AsistenteTab`)

- `AsistenteHome` - `AsistenteHomeScreen`.

Hub senializado (decision D4). Alcance real hoy, declarado sin adornos:

- **Lo que funciona:** la unica IA vigente es el Copiloto contextual dentro del editor de documentos. El
  hub enruta hacia ella con dos acciones reales: crear un documento con Copiloto (`OfficeTab` ->
  `CrearPlaneacion`) y abrir las planeaciones existentes (`OfficeTab` -> `ListaPlaneaciones`).
- **Lo que no existe todavia:** conversacion completa con adjuntos reales y tareas en segundo plano. Llega
  con el change `asistente-ia-base` (Ola 3). La pantalla lo declara al docente en vez de simularlo.
- **Por que la quinta posicion se monto ya:** la arquitectura de informacion es lo que fijo #81; dejar el
  hueco habria obligado a rehacer el shell cuando llegue `asistente-ia-base`.

Regla vigente: cualquier chatbot IA pasa por el backend/AI Gateway y confirma antes de guardar, asignar o
enviar.

## Hub Mas (`MasTab`)

Landing: `MasHome`.

**Cuenta y seguridad:** `Cuenta`, `EditarPerfil`, `AdminRoles`, `SesionesActivas`.

**Perfil publico:** `Perfil`.

**Comunicacion:** `BuscadorPerfiles`, `Chat`, `Conversacion`.

**Retos y posts:** `RetoResolucion`, `RetoResultado`, `QuestionEditor`, `PostDetail`.

**Feed y Social:** `Feed`, `Social`.

> **Superficies legacy.** `Feed` y `Social` fueron las tabs `FeedTab` y `SocialTab` antes de #81. La
> decision D1 le quito a Feed su condicion de pantalla inicial y la decision D5 las condena a disolverse
> dentro de ConectaPLAN, que aun no existe. Hasta entonces siguen vivas y alcanzables como rutas de este
> hub. No son navegacion primaria y no deben disenarse como tal.

## Raiz De Navegacion

Nueve rutas (`ROOT_ROUTES`). Criterio de pertenencia: solo autenticacion y onboarding (que viven fuera del
shell), el shell mismo, y los destinos que se apilan sobre cualquier hub y **nunca navegan de vuelta hacia
uno**. Todo lo demas vive dentro del hub que lo posee.

| Ruta | Por que esta en la raiz |
| --- | --- |
| `Onboarding` | Fuera del shell: precede a la sesion. |
| `Login` | Fuera del shell. |
| `Registro` | Fuera del shell. |
| `RecuperarContrasena` | Fuera del shell. |
| `MainTabs` | Es el shell (`AppShell`). |
| `DocEditor` | Editor a pantalla completa sobre cualquier hub; solo-destino. |
| `Notificaciones` | Solo-destino desde el chrome superior. |
| `Ayuda` | Solo-destino desde el chrome superior. |
| `Terminos` | Solo-destino. |

Ruta inicial segun estado: `Onboarding` si no se ha visto, `MainTabs` si hay sesion, `Login` en otro caso.

### Rutas solo de desarrollo

`CatalogoComponentes` (catalogo de la biblioteca base, #82) se registra unicamente bajo `__DEV__` en
`MasStack`. **No es alcanzable por el docente** y no es una superficie disenable. Se declara aqui, y no se
omite, para que el inventario siga siendo exhaustivo: cada ruta del contrato esta en este mapa o en esta
seccion.

## Navegacion Cruzada Entre Hubs

Regla estructural, no lista de atajos: **las acciones de navegacion suben al navegador padre pero nunca
bajan a un navegador hermano.** Desde Clases, `navigate("ListaRecursos")` no encuentra la ruta, porque vive
dentro del stack de Office.

Por eso todo cruce entre hubs usa la forma anidada centralizada en `navigateToHub`:

```ts
navigateToHub(navigation, "OfficeTab", "ListaRecursos");
navigateToHub(navigation, "ClasesTab"); // abre el hub conservando su historial
```

Y todo retorno tras guardar o cerrar un flujo usa `goBackOrHubLanding`, que vuelve al origen real por
historial y aterriza en la landing del hub duenio cuando no hay historial (entrada por deep link):

```ts
navigation.canGoBack() ? navigation.goBack() : navigateToHub(navigation, HUB_LANDING[hub]);
```

Consecuencia para diseno: un flujo que cruza hubs tiene un costo estructural y una unica forma correcta.
Conviene preferir que una tarea se complete dentro de su hub y reservar el cruce para cuando el destino
pertenece de verdad a otra experiencia.

## Chrome Del Shell

`AppTopBar` ocupa su propio espacio en el layout (no se superpone al contenido) y reune tres afordancias:

| Afordancia | Destino |
| --- | --- |
| Notificaciones | Icono con badge de no leidos; navega a `Notificaciones` (raiz). |
| Ayuda | Navega a `Ayuda` (raiz). |
| Cuenta | Menu con Mi perfil, Cuenta y seguridad, Cerrar sesion; navega a `MasTab`. |

Presenta ademas el indicador global de sincronizacion (`SyncStatusChip`).

### Decision sobre `FloatingActionIcons`

El menu flotante `src/components/FloatingActionIcons.tsx` **fue retirado** (commit `2e5acfb`). Era una
segunda navegacion paralela superpuesta al contenido, con area de toque por debajo del minimo de 44 pt y
colores estaticos que no propagaban tema, daltonismo ni tamano de fuente. Sus tres afordancias pasaron al
`AppTopBar` con area de toque conforme, colores desde el tema en runtime, foco visible por teclado en web
y etiquetas de accesibilidad.

Decision completa: `openspec/changes/archive/2026-07-18-app-shell-navegacion/design.md`, seccion 3.5. Esta
decision cierra la open question OQ2 y el riesgo R4 del Plan Maestro.

## Brecha Entre Lo Implementado Y La Navegacion Objetivo

Este mapa describe lo construido. El Plan Maestro describe el objetivo, y **no coinciden todavia**. Se
registran aqui las diferencias conocidas para que un prototipo de Figma no tome lo implementado por lo
planeado ni al reves. Ante una diferencia, el objetivo manda para diseno y este mapa manda para saber que
existe hoy.

| Tema | Implementado hoy | Objetivo del plan | Donde se cierra |
| --- | --- | --- | --- |
| Asistente en web/tablet | Hub con pantalla completa, igual que en movil | D4: panel acoplable a la derecha en web/tablet (>=1024px utiles), pantalla completa solo en movil | `asistente-ia-base` (Ola 3) |
| Superficie del Asistente | Enruta al Copiloto del editor; sin conversacion propia | Conversacion con adjuntos reales y tareas en segundo plano | `asistente-ia-base` (Ola 3) |
| Navegacion en web | Barra lateral del mismo tab navigator | D7: sidebar completa, con panel IA acompanante | Ola 2 y `asistente-ia-base` |
| Escritorio | Placeholder con dock hacia las experiencias | D1: dock de herramientas + tablero del dia | `escritorio-docente` (Ola 2) |
| Feed y Social | Rutas vivas dentro de `MasTab` | D5: se funden en ConectaPLAN, disenado desde cero | `conectaplan` |
| Contenido | Ruta viva dentro de `OfficeTab` | D6: biblioteca de Office + selector Asignar/Adjuntar | Ola 2 |

## Historial: Que Paso Con Las Tabs Anteriores

Antes de #81 la app tenia cinco tabs. **Ninguna existe hoy como navegacion primaria.** Se registra la
equivalencia para que nadie disene sobre la estructura anterior:

| Tab anterior | Donde esta hoy | Decision |
| --- | --- | --- |
| `FeedTab` | Ruta `Feed` dentro de `MasTab` | D1 le quita la pantalla inicial; D5 la disuelve en ConectaPLAN. |
| `ContenidoTab` | Ruta `Contenido` dentro de `OfficeTab` | D6: su funcion pasa a la biblioteca de Office. |
| `GruposTab` | Landing `ClassroomHome` del hub `ClasesTab` | Es la experiencia Clases del plan. |
| `SocialTab` | Ruta `Social` dentro de `MasTab` | D5, igual que Feed. |
| `ConfiguracionTab` | Ruta `Cuenta` dentro de `MasTab` | D7 define los cinco hubs sin una tab de configuracion; la cuenta pasa a Mas. |

Ninguna pantalla se elimino en la migracion. El unico elemento retirado fue el parametro
`returnToClassroom`, que existia para compensar el stack plano y quedo sin funcion cuando cada formulario
paso a vivir en el stack de su hub.

## Checklist Para Cualquier Cambio De Navegacion

- [ ] Tiene entrada clara.
- [ ] Tiene salida segura.
- [ ] No pierde contexto.
- [ ] No duplica captura de datos.
- [ ] No abre rutas legacy si existe ruta moderna.
- [ ] Si cruza hubs, usa `navigateToHub`; si regresa, usa `goBackOrHubLanding`.
- [ ] Si es una ruta nueva, se registra en `routeManifest.ts` y en el param list de su hub.
- [ ] Funciona en web y movil.
- [ ] Scroll completo en pantallas largas.
- [ ] Empty states llevan a la accion correcta.
- [ ] Acciones cruzadas explican a donde mandan al usuario.
