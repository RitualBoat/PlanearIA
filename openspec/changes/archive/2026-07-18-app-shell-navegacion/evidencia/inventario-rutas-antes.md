# Inventario de navegacion ANTES del change (congelado 2026-07-18, commit a8566d1)

Fuente: `src/navigation/StackNavigator.tsx` (60 registros `<Stack.Screen>`) y
`src/navigation/AppTabsNavigator.tsx` (5 tabs legacy, `initialRouteName="FeedTab"`,
`FloatingActionIcons` montado en la linea 47).

## Las 60 rutas del stack raiz

Auth/onboarding (5): Onboarding, Login, Registro, RecuperarContrasena, MainTabs.
Planeaciones (8): Planeaciones, CrearPlaneacion, GenerarPlaneacionIA, ImportarPlaneacion,
EscanerPlantilla, ExportarPlaneacion, DocEditor, ListaPlaneaciones.
Grupos (6): ListaGrupos, CrearGrupo, DetalleGrupo, ClassroomGroup, ReportesGrupo, ImportarGrupos.
Tareas (7): CrearTareaGrupo, AsignarRecurso, DetalleTarea, CalificarEntregas,
DetalleActividadClassroom, AgregarContenidoClassroom, DetalleRecursoClassroom.
Entregables (1): ListaEntregables.
Asistencia (2): RegistrarAsistencia, HistorialAsistencia.
Calificaciones (2): CapturarCalificaciones, PromediosCalificaciones.
Alumnos (7): CrearAlumno, ListaAlumnos, ImportarAlumnos, ExportarAlumnos, DetalleAlumno,
NotasAlumno, ReportesAlumno.
Recursos (3): RecursosDidacticos, ListaRecursos, CrearRecurso.
Plantillas (4): BibliotecaPlantillas, ListaPlantillas, DetallePlantilla, EditorPlantilla.
Cuenta (5): Cuenta, EditarPerfil, AdminRoles, SesionesActivas, Terminos.
Perfil (1): Perfil.
Retos/posts (4): RetoResolucion, RetoResultado, QuestionEditor, PostDetail.
Social/chat (3): BuscadorPerfiles, Chat, Conversacion.
Notificaciones/ayuda (2): Notificaciones, Ayuda.

Total: 60.

## Las 5 tabs legacy

| Tab | Pantalla | Params |
| --- | --- | --- |
| FeedTab (inicial) | FeedScreen | `openCreatePost?`, `attachmentToShare?` |
| ContenidoTab | ContenidoScreen | `selectionMode?`, `targetGroupId?` |
| GruposTab | ClassroomHomeScreen | — |
| SocialTab | SocialScreen | — |
| ConfiguracionTab | CuentaScreen | — |

## Sitios que navegan a `MainTabs` (verificados por grep)

| Archivo:linea | Llamada |
| --- | --- |
| `src/components/FloatingActionIcons.tsx:42` | `navigate("MainTabs", { screen: "ConfiguracionTab" })` |
| `src/hooks/useCrearGrupoViewModel.ts:120` | `navigate("MainTabs", { screen: "GruposTab" })` |
| `src/hooks/useDeepLinkHandler.ts:54` | `navigate("MainTabs", { screen: "SocialTab" })` |
| `src/hooks/useDetalleGrupoViewModel.ts:260` | `navigate("MainTabs", { screen: "ContenidoTab", params: { selectionMode, targetGroupId } })` |
| `src/hooks/useDocEditorViewModel.ts:254` | `navigate("MainTabs", { screen: "ContenidoTab" })` |
| `src/screens/ayuda/AyudaScreen.tsx:147` | `navigate("MainTabs", { screen: "SocialTab" })` |
| `src/screens/biblioteca/RecursosDidacticosScreen.tsx:99` | `navigate("MainTabs" as any)` (fallback sin historial) |
| `src/screens/contenido/ContenidoScreen.tsx:463` | `navigate("MainTabs", { screen: "FeedTab", params: { openCreatePost, attachmentToShare } })` |
| `src/screens/notificaciones/NotificacionesScreen.tsx:78,80,83` | `SocialTab` x2, `GruposTab` |

Sin `screen` (aterrizan en la tab inicial): `useLoginViewModel.ts:69,92,105`,
`useRegistroViewModel.ts:100`, `OnboardingScreen.tsx:108` (replace).

## Acoplamiento `returnToClassroom` (6 archivos)

`StackNavigator.tsx:143,160,211` (tipos), `useCrearGrupoViewModel.ts:39,119`,
`useCrearTareaGrupoViewModel.ts:84,202`, `CrearRecursoScreen.tsx:34,50`,
`ClassroomHomeScreen.tsx:93,168`, `CrearTareaGrupoScreen.tsx:39`.

## Llamadas cruzadas entre experiencias (analisis estatico, 55 rutas destino)

| Origen | Destino | Experiencia destino |
| --- | --- | --- |
| `src/screens/biblioteca/CrearRecursoScreen.tsx:50` | `ClassroomGroup` | Clases |
| `src/screens/grupos/tareas/AsignarRecursoScreen.tsx:189` | `ListaRecursos` | Office |
| `src/screens/contenido/ContenidoScreen.tsx` | `ListaEntregables` | Clases |
| `src/hooks/useDeepLinkHandler.ts:36` | `BuscadorPerfiles` | Mas |

Este inventario es la referencia del test de guardia (tarea 6.1): ninguna de las 60 rutas
puede desaparecer del grafo tras la particion.
