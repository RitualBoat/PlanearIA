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

- Alumnos: crear, importar, exportar, mover, quitar, abrir detalle.
- Materiales: crear, asignar existente, adjuntar planeacion, filtrar y abrir.
- Actividades/tareas: pendiente Fase 6.
- Asistencia/calificaciones/reportes: rutas existentes se reutilizan hasta migracion completa.

### Contenido

Debe mantenerse como hub transversal, no como competidor de Classroom.

- Si la accion depende de una clase, debe vivir en Classroom.
- Si la accion es biblioteca/global, puede vivir en Contenido.

### Cuenta/Auth

Auth actual existe, pero seguridad real se endurecera en el plan de Auth/Seguridad.

## Rutas legacy conocidas

- Detalle legacy de grupo puede seguir accesible como puente mientras Classroom absorbe funciones.
- Pantallas viejas de navegacion 2025 no deben usarse como referencia. Ver `Documentacion/99-archivo/`.

## Checklist de navegacion para cualquier fase

- [ ] Hay entrada clara desde tab/hub/card/FAB.
- [ ] Hay salida segura: volver, cancelar, guardar o cerrar.
- [ ] No se pierde contexto del grupo/recurso/planeacion.
- [ ] No hay doble captura del mismo dato.
- [ ] No hay botones sin destino.
- [ ] Web y movil permiten scroll completo.
- [ ] Empty states llevan a la accion correcta.
