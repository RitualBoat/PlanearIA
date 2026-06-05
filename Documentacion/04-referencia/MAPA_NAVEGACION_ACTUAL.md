# Mapa de Navegacion Actual - PlanearIA

## Fuente real

La fuente tecnica de verdad es `src/navigation/StackNavigator.tsx` y `src/navigation/AppTabsNavigator.tsx`.

Este archivo resume la navegacion vigente para planificacion. No debe inventar rutas que no existan.

## Tabs actuales

- Feed: comunidad/feed actual, pendiente de reorientar hacia WhatsApp docente.
- Contenido: hub transversal para planeaciones, recursos, entregables y plantillas.
- Classroom/Grupos: entrada al flujo tipo Classroom.
- Social: contactos y busqueda de perfiles.
- Configuracion/Cuenta: perfil, roles, accesibilidad, terminos y preferencias.

La estructura de tabs es provisional. La decision final pertenece al futuro `Plan Maestro: UX/UI y Navegacion Global`.

## Flujos principales

### Planeaciones

Entrada principal:

- `Contenido` -> crear planeacion -> selector de plantillas -> `DocEditor`.

Entradas secundarias:

- Lista de planeaciones.
- Card/menu contextual de planeacion.
- Material de Classroom con URL `planeacion://<id>`.

Regla:

- No volver a formularios legacy como flujo principal.

### Classroom

Entrada principal:

- Tab Classroom/Grupos -> `ClassroomHomeScreen` -> `ClassroomGroupScreen`.

Dentro de una clase:

- `Tablon`: feed/resumen contextual del curso, proximas entregas y actividad reciente.
- `Trabajo de clase`: secciones/unidades colapsables con materiales y actividades.
- `Personas`: docentes/alumnos inscritos, importacion/exportacion y detalle de alumno.
- Materiales: se crean/asignan desde `AgregarContenidoClassroom`, admiten enlaces/archivos multiples y se abren en `DetalleRecursoClassroom`.
- Actividades: se crean/asignan desde `AgregarContenidoClassroom`, admiten fechas, entrega tardia, notas y calificacion contextual por entregas.
- Asistencia, reportes y calificaciones: no deben aparecer como modulos sueltos de primer plano; se ubican de forma contextual o quedan para planes especializados.

### Contenido

Debe mantenerse como hub transversal, no como competidor de Classroom.

- Si la accion depende de una clase, debe vivir en Classroom.
- Si la accion es biblioteca/global, puede vivir en Contenido.

### Cuenta/Auth

Auth actual existe, pero seguridad real se endurecera en el plan de Auth/Seguridad.

## Rutas legacy conocidas

- Detalle legacy de grupo no debe ser flujo principal si existe equivalente Classroom.
- Crear/editar materiales o actividades desde una clase no debe mandar a formularios legacy si existe pantalla contextual.
- Pantallas viejas de navegacion 2025 no deben usarse como referencia. Ver `Documentacion/99-archivo/`.

## Checklist de navegacion para cualquier fase

- [ ] Hay entrada clara desde tab/hub/card/FAB.
- [ ] Hay salida segura: volver, cancelar, guardar o cerrar.
- [ ] No se pierde contexto del grupo/recurso/planeacion.
- [ ] No hay doble captura del mismo dato.
- [ ] No hay botones sin destino.
- [ ] Web y movil permiten scroll completo.
- [ ] Empty states llevan a la accion correcta.
