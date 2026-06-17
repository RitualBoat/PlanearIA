# Mapa de Navegacion Actual - PlanearIA

Este archivo resume la navegacion real actual. No define la navegacion objetivo.

Fuentes de verdad:

- `src/navigation/AppTabsNavigator.tsx`
- `src/navigation/StackNavigator.tsx`

## Tabs Actuales

| Tab | Ruta | Pantalla | Lectura vigente |
| --- | --- | --- | --- |
| Feed | `FeedTab` | `FeedScreen` | Feed/comunidad actual; puede reducirse o reorientarse. |
| Contenido | `ContenidoTab` | `ContenidoScreen` | Hub transversal; debe evaluarse contra Office/Classroom. |
| Grupos | `GruposTab` | `ClassroomHomeScreen` | Entrada actual a Classroom. |
| Social | `SocialTab` | `SocialScreen` | Base para contactos/WhatsApp Docente. |
| Configuracion | `ConfiguracionTab` | `CuentaScreen` | Cuenta, perfil, sesiones, roles y preferencias. |

La tab bar actual es provisional. El futuro `Plan Maestro: UX/UI y Navegacion Global` puede reemplazarla.

## Stack Principal

### Auth

- `Onboarding`
- `Login`
- `Registro`
- `RecuperarContrasena`
- `MainTabs`

### Office Docente Actual Parcial

Rutas documentales ya existentes:

- `Planeaciones`
- `CrearPlaneacion`
- `ImportarPlaneacion`
- `EscanerPlantilla`
- `ExportarPlaneacion`
- `DocEditor`
- `ListaPlaneaciones`

En la vision nueva, estas rutas son la base documental de Office Docente. La parte tabular tipo Excel aun debe definirse.

### Classroom Actual

Entrada viva:

- `GruposTab` -> `ClassroomHomeScreen` -> `ClassroomGroup`

Rutas relacionadas:

- `ClassroomGroup`
- `DetalleActividadClassroom`
- `AgregarContenidoClassroom`
- `DetalleRecursoClassroom`
- `CrearGrupo`
- `ListaGrupos`
- `ImportarGrupos`
- `RegistrarAsistencia`
- `HistorialAsistencia`
- `CapturarCalificaciones`
- `PromediosCalificaciones`
- `CrearAlumno`
- `ListaAlumnos`
- `ImportarAlumnos`
- `ExportarAlumnos`
- `DetalleAlumno`
- `NotasAlumno`
- `ReportesAlumno`
- `ReportesGrupo`

Regla: si existe flujo contextual en Classroom, no volver a formularios legacy como experiencia principal.

### Biblioteca / Plantillas / Contenido

- `RecursosDidacticos`
- `ListaRecursos`
- `CrearRecurso`
- `BibliotecaPlantillas`
- `ListaPlantillas`
- `DetallePlantilla`
- `EditorPlantilla`

Estas rutas deben revisarse en UX/UI Global. Pueden vivir dentro de Office, Classroom, Canva o biblioteca transversal.

### Social / Chat / Comunidad

- `PostDetail`
- `RetoResolucion`
- `RetoResultado`
- `QuestionEditor`
- `BuscadorPerfiles`
- `Chat`
- `Conversacion`

Base tecnica para WhatsApp Docente y comunidad profesional.

### Cuenta / Perfil / Soporte

- `Cuenta`
- `EditarPerfil`
- `AdminRoles`
- `SesionesActivas`
- `Terminos`
- `Perfil`
- `Notificaciones`
- `Ayuda`

## Checklist Para Cualquier Cambio De Navegacion

- [ ] Tiene entrada clara.
- [ ] Tiene salida segura.
- [ ] No pierde contexto.
- [ ] No duplica captura de datos.
- [ ] No abre rutas legacy si existe ruta moderna.
- [ ] Funciona en web y movil.
- [ ] Scroll completo en pantallas largas.
- [ ] Empty states llevan a la accion correcta.
- [ ] Acciones cruzadas explican a donde mandan al usuario.

## Nota Para UX/UI Global

La navegacion objetivo debe partir de la vision actual:

- Inicio como sistema operativo docente.
- Office Docente como workspace de documentos/hojas.
- Classroom como organizador/asignador.
- Canva, WhatsApp, Calendario, Reportes y Cuenta como experiencias conectadas.
