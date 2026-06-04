# Plan Maestro: Classroom / Grupos y Recursos - PlanearIA

> **Version:** 1.0  
> **Fecha:** 2026-06-03  
> **Estado:** [~] Plan maestro en ejecucion  
> **Alcance:** fusionar grupos, alumnos, tareas, entregables, recursos, asistencia, calificaciones y reportes operativos en una experiencia central tipo Google Classroom, manteniendo arquitectura MVVM, offline-first y bajo costo.  
> **Stack:** React Native 0.81.5, Expo 54, TypeScript 5.9, React Navigation 7, AsyncStorage actual con posible migracion futura a SQLite/Expo SQLite, backend Node en `backend/api`, MongoDB Atlas/free tier, Jest + Testing Library.
> **Modulo:** Classroom / Gestion academica diaria.  
> **Relacion con otros modulos:** Planeaciones, Contenido, Recursos Didacticos, Recursos Evaluables, Alumnos, Asistencia, Calificaciones, Plantillas, Chat, Notificaciones, Reportes, Auth/Seguridad y UX/UI Global.

---

## 1. Resumen Ejecutivo

Classroom sera la segunda gran experiencia madre de PlanearIA despues de Planeaciones. Su objetivo no es crear otro modulo mas, sino ordenar lo que ya existe para que el docente trabaje desde una clase/grupo como centro operativo.

La experiencia deseada es:

- Entrar a **Grupos/Classroom**.
- Ver clases activas, pendientes y accesos rapidos.
- Abrir un grupo.
- Administrar desde un solo lugar alumnos, unidades, materiales, actividades, entregas, asistencia, calificaciones, reportes y comunicacion.
- Evitar saltos entre pantallas sueltas que hoy existen como modulos separados.

Este plan no debe ejecutarse como una reescritura ciega. Debe hacer una fusion progresiva, usando lo existente cuando funcione, ocultando legacy cuando duplique flujo y creando una capa de experiencia unificada encima de datos actuales.

---

## 2. Ground Truth Leido Para Este Plan

Documentacion interna:

- `README.md`.
- `Documentacion/README.md`.
- `Documentacion/meta_guia_planes.md`.
- `Documentacion/VISION_ACTUAL.md`.
- `Documentacion/INFRAESTRUCTURA_SUGERIDA.md`.
- `Documentacion/MAPA_MODULOS_ACTUALES.md`.
- `Documentacion/PLAN_PASOS_INICIALES.md`.
- `Documentacion/plan_planeaciones.md`.
- `Documentacion/GITHUB_PRODUCT_OS.md`.
- `Documentacion/ENTORNO_LOCAL.md`.

Codigo actual auditado a nivel de estructura:

- `src/navigation/StackNavigator.tsx`.
- `src/navigation/AppTabsNavigator.tsx`.
- `src/screens/grupos/`.
- `src/screens/grupos/tareas/`.
- `src/screens/alumnos/`.
- `src/screens/asistencia/`.
- `src/screens/calificaciones/`.
- `src/screens/tareas/`.
- `src/screens/biblioteca/`.
- `src/context/AlumnosContext.tsx`.
- `src/context/AsistenciaContext.tsx`.
- `src/context/CalificacionesContext.tsx`.
- `src/context/EntregablesContext.tsx`.
- `src/context/GruposContext.tsx`.
- `src/context/RecursosContext.tsx`.
- `src/hooks/useCrearAlumnoViewModel.ts`.
- `src/hooks/useCrearGrupoViewModel.ts`.
- `src/hooks/useCrearRecursoViewModel.ts`.
- `src/hooks/useCrearTareaGrupoViewModel.ts`.
- `src/hooks/useDetalleGrupoViewModel.ts`.
- `src/hooks/useGrupoNotas.ts`.
- `src/hooks/useGrupos.ts`.
- `src/hooks/useGruposDashboardViewModel.ts`.
- `src/hooks/useListaRecursosViewModel.ts`.
- `src/hooks/useNotasAlumnoViewModel.ts`.
- `src/hooks/useReportesAlumnoViewModel.ts`.
- `src/hooks/useReportesGrupoViewModel.ts`.
- `src/services/alumnoExportService.ts`.
- `src/services/alumnoImportService.ts`.
- `src/services/alumnoReportesService.ts`.
- `src/services/grupoAsignacionesService.ts`.
- `src/services/grupoExportService.ts`.
- `src/services/grupoImportService.ts`.
- `src/services/grupoReportesService.ts`.
- `src/services/gruposService.ts`.
- `backend/api/alumnos.js`.
- `backend/api/asistencias.js`.
- `backend/api/calificaciones.js`.
- `backend/api/entregables.js`.
- `backend/api/grupos.js`.
- `backend/api/recursos.js`.
- `backend/api/sync.js`.
- `types/index.ts`.

Referencias open source leidas como inspiracion conceptual:

- `context/referencias-opensource/classroomio-classroom/FUENTE.md`.
- `context/referencias-opensource/classroomio-classroom/ARCHITECTURE_PATHS.md`.
- `context/referencias-opensource/kalvi-classroom/FUENTE.md`.
- `context/referencias-opensource/kalvi-classroom/ARCHITECTURE_PATHS.md`.
- `context/referencias-opensource/webdesk-legacy-classroom/ARCHITECTURE_PATHS.md`.

Restriccion de licencia:

- `classroomio` y `kalvi` son referencias AGPL. No copiar codigo.
- `webdesk` no tiene licencia detectada. No copiar codigo.
- Usar solo patrones de dominio: curso, clase, unidad, material, actividad, entrega, asistencia, calificacion, invitacion y tablero.

---

## 3. Estado Actual del Codigo

### 3.1 Lo Que Ya Existe

PlanearIA ya tiene piezas valiosas para construir Classroom:

- Grupos con dashboard, lista, detalle, importacion, exportacion, reportes y tareas.
- Alumnos con CRUD, detalle, notas, importacion, exportacion y reportes.
- Asistencia con registro e historial.
- Calificaciones con captura y promedios.
- Tareas/entregables con creacion, asignacion, detalle y calificacion.
- Biblioteca/recursos con lista, creacion y asignacion.
- Contextos por dominio academico.
- Servicios de import/export y reportes.
- Backend por entidad.
- Sync offline-first ya existente.

### 3.2 Problema Actual

El problema principal no es falta de funcionalidad. Es fragmentacion:

- El docente puede terminar saltando entre grupos, alumnos, asistencia, calificaciones, recursos y tareas como si fueran apps distintas.
- Varias pantallas tienen sentido como subflujo, pero no como entrada principal.
- `ContenidoScreen` y `GruposTab` pueden competir como entradas a recursos/entregables.
- El flujo de "crear algo para un grupo" todavia puede vivir en modales, rutas y pantallas separadas.
- No hay una sola vista madre que responda: "que esta pasando en mi clase hoy?".

### 3.3 Decision Principal

El `Grupo` actual debe convertirse en la raiz practica de Classroom. No crear una entidad nueva `Curso` todavia si no aporta valor inmediato.

Traduccion de conceptos:

| Concepto Classroom | Entidad actual o destino |
| --- | --- |
| Clase / Curso | `Grupo` |
| Participantes | `Alumno` + miembros de grupo |
| Stream / Inicio | nuevo resumen de actividad por grupo |
| Trabajo de clase | tareas, recursos, planeaciones asignadas y actividades |
| Material | `Recurso` |
| Actividad / Tarea | `Tarea` / entregables |
| Entrega | `EntregaTarea` |
| Calificacion | `Calificacion` + rubrica futura |
| Asistencia | `Asistencia` |
| Reportes | reportes de grupo/alumno existentes |
| Invitaciones | contacto/invitacion futura, no prioridad inmediata |

---

## 4. Objetivo de Producto

Classroom debe sentirse como una herramienta diaria de aula, no como un panel administrativo.

### Flujo ideal

```text
GruposTab
  -> Classroom Home
    -> Grupo / Clase
      -> Inicio
      -> Alumnos
      -> Actividades
      -> Materiales
      -> Asistencia
      -> Calificaciones
      -> Reportes
      -> Configuracion
```

### Acciones principales

- Crear grupo/clase.
- Importar alumnos.
- Agregar alumno individual.
- Crear material.
- Asignar planeacion como material.
- Crear actividad/tarea.
- Calificar entregas.
- Registrar asistencia.
- Capturar calificaciones.
- Ver alumno en contexto.
- Exportar lista, asistencia, calificaciones o reporte.

### Principio UX

Cada accion debe empezar desde el grupo cuando tenga contexto de grupo.

Ejemplo:

- Bien: `Grupo -> Actividades -> Crear actividad`.
- Evitar: `Contenido -> Crear entregable -> elegir grupo -> volver a buscar grupo`.

---

## 5. Modelo de Datos Objetivo

### 5.1 Regla de Evolucion

No romper tipos actuales sin necesidad. La primera fase debe crear una capa conceptual de Classroom encima de `Grupo`, `Alumno`, `Tarea`, `EntregaTarea`, `Recurso`, `Asistencia` y `Calificacion`.

### 5.2 Entidades Base

| Entidad | Estado | Decision |
| --- | --- | --- |
| `Grupo` | existente | usar como raiz de clase. |
| `Alumno` | existente | vincular con grupo, historial y estado academico. |
| `Recurso` | existente | usar como material de clase. |
| `Tarea` | existente | usar como actividad evaluable. |
| `EntregaTarea` | existente | mantener como entrega por alumno. |
| `Calificacion` | existente | conectar con actividad/rubrica/alumno. |
| `Asistencia` | existente | conectar por fecha y grupo. |
| `PlaneacionV2` | existente | permitir asignar como material o guia de clase. |
| `Rubrica` | futura | evaluar si vive en recursos evaluables o Classroom. |
| `UnidadClassroom` | nueva opcional | solo si se necesita organizar por semana, tema o periodo. |

### 5.3 Campos Obligatorios Para Entidades Sincronizables

Cada entidad nueva o modificada debe incluir, o mapear a equivalente:

- `id`.
- `userId`.
- `grupoId` cuando aplique.
- `fechaCreacion`.
- `fechaModificacion`.
- `syncStatus` o equivalente.
- `deletedAt` o eliminacion logica si aplica.

### 5.4 Persistencia Local

Decision corregida antes de implementar:

- AsyncStorage es la implementacion local actual.
- SQLite/Expo SQLite es mejor candidato para el destino futuro de datos relacionales, volumen alto, busquedas, filtros, historial, asistencia, calificaciones y sync complejo.
- Classroom no debe crear una nueva dependencia directa fuerte a AsyncStorage si eso dificulta la migracion.
- La primera implementacion debe favorecer una capa de repositorio/facade que pueda leer desde AsyncStorage hoy y migrar a SQLite despues.

La fase de datos debe inventariar:

- Claves de grupos.
- Claves de alumnos.
- Claves de recursos.
- Claves de tareas/entregables.
- Claves de asistencia.
- Claves de calificaciones.
- Cola de sync.

---

## 6. Arquitectura Tecnica

### 6.1 Mantener MVVM

```text
ClassroomScreen
  -> useClassroomHomeViewModel
    -> ClassroomContext o facade
      -> contexts existentes
      -> services existentes
      -> storage local desacoplado (AsyncStorage actual / SQLite futura) + API/sync
```

### 6.2 Capa Recomendable

Crear una capa `classroom` progresiva, no invasiva:

- `src/screens/classroom/` para pantallas nuevas de experiencia madre.
- `src/hooks/classroom/` para ViewModels nuevos.
- `src/services/classroom/` para agregadores/facades.
- `types/classroom.ts` solo si el modelo objetivo requiere tipos nuevos.

La capa `classroom` debe consumir contextos existentes al inicio. Solo despues, si hay demasiada duplicacion, se evalua un `ClassroomContext`.

### 6.3 Backend

No crear un backend nuevo solo por Classroom. Reutilizar endpoints actuales:

- `grupos.js`.
- `alumnos.js`.
- `recursos.js`.
- `entregables.js`.
- `asistencias.js`.
- `calificaciones.js`.
- `sync.js`.

Crear endpoints agregados solo si reducen llamadas o simplifican sync:

- `GET /api/classroom/:grupoId/resumen`.
- `POST /api/classroom/:grupoId/bootstrap`.
- `GET /api/classroom/:grupoId/timeline`.

Estos endpoints son opcionales y deben justificarse con pruebas o dolor real.

### 6.4 Offline-First

La experiencia debe funcionar aunque el backend este apagado:

- Mostrar datos locales del grupo.
- Permitir crear tareas, materiales, asistencia y calificaciones offline.
- Marcar acciones pendientes.
- Reintentar sync.
- Evitar spinners infinitos.
- Mostrar conflictos de forma entendible.
- Evitar acoplar pantallas nuevas a una API directa de AsyncStorage.

---

## 7. UX/UI Objetivo

### 7.1 Pantallas Objetivo

| Pantalla | Funcion |
| --- | --- |
| `ClassroomHomeScreen` | reemplazo gradual de dashboard de grupos como vista tipo Classroom. |
| `ClassroomGroupScreen` | detalle madre de un grupo/clase. |
| `ClassroomInicioSection` | resumen, pendientes, actividad reciente y proximas acciones. |
| `ClassroomAlumnosSection` | lista, importacion, asistencia rapida y perfiles. |
| `ClassroomActividadesSection` | tareas, entregables, rubricas y estado de entrega. |
| `ClassroomMaterialesSection` | recursos, planeaciones asignadas, PDFs, links y archivos. |
| `ClassroomAsistenciaSection` | registrar e historial por fecha. |
| `ClassroomCalificacionesSection` | captura, promedios y relacion con tareas. |
| `ClassroomReportesSection` | reportes accionables por grupo/alumno. |
| `ClassroomConfiguracionSection` | nombre, ciclo, materia, exportar y archivo. |

### 7.2 Navegacion

Mapa minimo:

```markdown
## Mapa de Navegacion Classroom

- Entrada principal: `GruposTab`.
- Entradas secundarias: `ContenidoScreen`, acciones contextuales de recursos/planeaciones, perfil de alumno y notificaciones.
- Crear grupo: `GruposTab` -> `ClassroomHome` -> `CrearGrupo` -> `ClassroomGroup`.
- Editar grupo: `ClassroomGroup` -> `Configuracion` -> `EditarGrupo` -> `ClassroomGroup`.
- Crear alumno: `ClassroomGroup` -> `Alumnos` -> `Agregar alumno`.
- Crear actividad: `ClassroomGroup` -> `Actividades` -> `Crear actividad`.
- Crear material: `ClassroomGroup` -> `Materiales` -> `Crear material`.
- Registrar asistencia: `ClassroomGroup` -> `Asistencia` -> `Registro del dia`.
- Calificar: `ClassroomGroup` -> `Actividades` o `Calificaciones` -> `Calificar`.
- Salidas seguras: guardar, cancelar, volver a grupo, volver a home.
- Rutas legacy: ocultar o redirigir despues de validar equivalencia.
```

### 7.3 Web, Tablet y Movil

Web/tablet:

- Layout con sidebar o tabs internas.
- Panel principal con tarjetas y tablas.
- Acciones rapidas visibles.

Movil:

- Tabs internas horizontales o menu compacto.
- Accion primaria flotante contextual.
- No saturar la pantalla con demasiadas tarjetas.

### 7.4 Estados Obligatorios

- Estado vacio sin grupos.
- Estado vacio sin alumnos.
- Estado vacio sin actividades.
- Estado vacio sin materiales.
- Estado offline.
- Estado sync pendiente.
- Estado error recuperable.
- Estado loading con timeout o fallback local.

---

## 8. IA y Automatizacion

La IA no debe ser la prioridad de la primera implementacion Classroom. Primero debe existir el flujo academico estable.

Casos futuros recomendados:

- Sugerir actividades para un grupo con base en planeacion/material.
- Crear rubrica inicial.
- Resumir entregas o progreso del grupo.
- Detectar alumnos en riesgo con datos de asistencia/calificaciones.
- Generar retroalimentacion sugerida para una entrega.
- Convertir una planeacion en actividades/materiales para Classroom.

Reglas:

- Reutilizar `backend/lib/aiGateway.js` si aplica.
- Respetar limite `AI_MAX_REQUESTS_PER_ACTION`, default 10.
- Mantener `AI_DEV_MODE` solo para desarrollo con advertencia.
- No calificar automaticamente sin revision humana.
- No gastar APIs si se puede usar fallback heuristico durante desarrollo.
- Documentar prompts, proveedor, costo y fallback antes de activar IA avanzada.

---

## 9. Integracion Con Modulos Existentes

### Planeaciones

- Permitir asignar una planeacion a un grupo como guia/material.
- Permitir crear actividades desde una planeacion en fase posterior.
- No modificar el editor Word/Docs durante la fase inicial de Classroom.

### Contenido

- `ContenidoScreen` debe seguir existiendo como hub transversal.
- Debe redirigir acciones de grupo hacia Classroom cuando corresponda.
- Evitar doble flujo de crear recurso/entregable para grupo.

### Recursos Didacticos

- Los recursos deben poder vivir en biblioteca general y asignarse a grupo.
- Classroom debe mostrar recursos filtrados por grupo.

### Recursos Evaluables

- Las tareas/entregables deben vivir dentro de `Actividades`.
- Las rubricas deben planearse como submodelo, no improvisarse.

### Chat y Notificaciones

- Notificaciones para tareas, entregas, recordatorios y mensajes quedan como integracion posterior.
- Chat no debe bloquear la primera version de Classroom.

### Auth y Seguridad

- Filtrar por `userId`.
- Preparar RBAC futuro para `Dev/Desarrollador`, `Admin`, `Docente` y `Alumno`.
- No abrir datos de otros usuarios cuando haya multiusuario real.

---

## 10. Limpieza Legacy

No borrar pantallas viejas al inicio. Primero hay que asegurar equivalencia funcional.

### Candidatas a fusion/redireccion

- `src/screens/grupos/GruposDashboardScreen.tsx`.
- `src/screens/grupos/DetalleGrupoScreen.tsx`.
- `src/screens/grupos/tareas/*`.
- `src/screens/alumnos/ListaAlumnosScreen.tsx`.
- `src/screens/asistencia/RegistrarAsistenciaScreen.tsx`.
- `src/screens/calificaciones/CapturarCalificacionesScreen.tsx`.
- `src/screens/tareas/ListaEntregablesScreen.tsx`.
- `src/screens/biblioteca/ListaRecursosScreen.tsx`.

### Criterio para borrar u ocultar

- Existe ruta moderna equivalente.
- Tests cubren flujo principal.
- Se actualizo navegacion.
- No queda CTA apuntando a pantalla vieja.
- Validacion manual web/movil aprobada.

---

## 11. Costos e Infraestructura

Este plan debe mantenerse low-cost:

- No agregar servicios pagos.
- No agregar plataforma LMS externa.
- No migrar a microservicios.
- No cambiar MongoDB Atlas/free tier sin necesidad.
- No exigir Docker para la primera fase.
- Mantener desarrollo local con laptop del desarrollador.
- Usar GitHub Actions solo para validar.
- Reutilizar backend actual.

Si en una fase aparece necesidad de almacenamiento pesado, emails, push o IA pagada, se debe detener y pedir decision.

---

## 12. Fases de Ejecucion

### FASE 0: Auditoria Profunda y Preparacion

Objetivo: confirmar rutas, datos y dependencias antes de tocar codigo.

- [x] **0.1 Auditar rutas actuales de grupos/alumnos/tareas/asistencia/calificaciones.**
- [x] **0.2 Auditar contexts y servicios usados por cada pantalla.**
- [x] **0.3 Auditar tests existentes y brechas por modulo.**
- [x] **0.4 Identificar pantallas legacy que se conservaran temporalmente.**
- [x] **0.5 Definir equivalencias entre flujo actual y flujo Classroom.**
- [x] **0.6 Crear checklist manual especifico de Classroom.**
- [x] **0.7 Registrar riesgos de navegacion antes de implementar.**

Criterio de cierre:

- [x] Inventario validado.
- [x] Lista de rutas legacy documentada.
- [x] Checklist manual creado.
- [x] No hay dudas sobre primera pantalla a construir.

Resultado de ejecucion:

- Entrada principal actual confirmada: `GruposTab` apunta a `GruposDashboardScreen` y debe evolucionar hacia Classroom sin romper rutas existentes.
- Rutas academicas actuales confirmadas en `StackNavigator`: grupos, alumnos, asistencia, calificaciones, tareas/entregables y recursos.
- Contextos auditados: `GruposContext`, `AlumnosContext`, `AsistenciaContext`, `CalificacionesContext`, `EntregablesContext` y `RecursosContext`.
- Servicios auditados: import/export/reportes de grupos y alumnos, asignaciones de grupo, promedios, backend por entidad y sync.
- Brechas registradas: storage local disperso por claves AsyncStorage, endpoints academicos con aislamiento `userId` incompleto, `ContenidoScreen` como hub transversal que puede competir con Classroom y pantallas de calificacion/entregas con datos mock o integracion parcial.
- Checklist manual especifico queda en la seccion 13 de este documento.

### FASE 1: Modelo Academico Unificado

Objetivo: definir contratos para que `Grupo` funcione como clase madre sin romper datos actuales.

- [x] **1.1 Revisar `types/index.ts` para `Grupo`, `Alumno`, `Tarea`, `EntregaTarea`, `Recurso`, `Asistencia` y `Calificacion`.**
- [x] **1.2 Crear `types/classroom.ts` solo si aporta tipos derivados o ViewModels.**
- [x] **1.3 Definir `ClassroomResumen`, `ClassroomActividadReciente` y `ClassroomPendiente` si hacen falta.**
- [x] **1.4 Asegurar `userId`, `grupoId`, fechas y sync status en entidades nuevas o derivadas.**
- [x] **1.5 Agregar tests de mapeo si se crea facade.**

Criterio de cierre:

- [x] Tipos compilan.
- [x] No se duplican entidades existentes.
- [x] `Grupo` queda definido como raiz de Classroom.

Resultado de ejecucion:

- Se creo `types/classroom.ts` con tipos derivados para `ClassroomGrupo`, `ClassroomResumen`, `ClassroomActividadReciente`, `ClassroomPendiente`, `ClassroomDataset` y `ClassroomRouteMap`.
- Se creo `src/services/classroom/classroomModel.ts` como primer agregador puro de dominio. Todavia no reemplaza contexts ni storage; solo normaliza lectura para futuros ViewModels.
- Se agregaron pruebas en `src/__tests__/classroom/classroomModel.test.ts` para validar conteos por grupo, actividad reciente, pendientes y composicion del modelo.
- `Grupo` queda confirmado como raiz de Classroom; `Alumno`, `Tarea`, `EntregaTarea`, `Recurso`, `Asistencia` y `Calificacion` se consumen por `grupoId`.
- `userId`, `fechaModificacion`, `syncStatus` y eliminacion logica quedan modelados como auditoria derivada cuando existan, pero siguen siendo deuda en varias entidades actuales. La fase 2 debe resolverlo desde una capa de repositorio/storage, sin mutar todo de golpe.

### FASE 2: Capa de Datos y Facade Classroom

Objetivo: crear un punto de lectura/escritura para la experiencia Classroom sin reescribir contexts existentes.

- [ ] **2.1 Crear `src/services/classroom/classroomFacade.ts` o equivalente.**
- [ ] **2.2 Agregar selectores para resumen de grupo.**
- [ ] **2.3 Agregar selectores para alumnos, actividades, materiales, asistencia y calificaciones por grupo.**
- [ ] **2.4 Reutilizar servicios actuales de import/export/reportes.**
- [ ] **2.5 Garantizar fallback local si backend falla.**
- [ ] **2.6 Definir interfaz de storage local que no bloquee migracion futura a SQLite.**
- [ ] **2.7 Agregar tests unitarios de selectors/facade/storage.**

Criterio de cierre:

- [ ] Classroom puede renderizar datos locales.
- [ ] No se rompe ningun contexto existente.
- [ ] La capa local no queda acoplada irreversiblemente a AsyncStorage.
- [ ] Typecheck, lint y tests pasan.

### FASE 3: Shell Classroom y Navegacion Principal

Objetivo: convertir `GruposTab` en entrada real a Classroom sin romper rutas viejas.

- [ ] **3.1 Crear `src/screens/classroom/ClassroomHomeScreen.tsx`.**
- [ ] **3.2 Crear `src/screens/classroom/ClassroomGroupScreen.tsx`.**
- [ ] **3.3 Integrar entrada desde `AppTabsNavigator` o ruta actual de grupos.**
- [ ] **3.4 Mantener redireccion segura a pantallas legacy mientras se migran secciones.**
- [ ] **3.5 Crear header/acciones rapidas coherentes web/movil.**
- [ ] **3.6 Agregar estados vacios y offline.**
- [ ] **3.7 Validar que volver/cancelar no pierda contexto.**

Criterio de cierre:

- [ ] `GruposTab` abre la experiencia Classroom.
- [ ] Abrir un grupo lleva a `ClassroomGroupScreen`.
- [ ] Las rutas legacy siguen accesibles solo donde sean necesarias.

### FASE 4: Seccion Alumnos y Lista del Grupo

Objetivo: que el docente administre participantes desde la clase.

- [ ] **4.1 Crear seccion `Alumnos` dentro de `ClassroomGroupScreen`.**
- [ ] **4.2 Reutilizar creacion/importacion/exportacion de alumnos.**
- [ ] **4.3 Mostrar estado academico basico por alumno.**
- [ ] **4.4 Permitir abrir detalle de alumno con retorno al grupo.**
- [ ] **4.5 Definir acciones masivas: importar, exportar, mover, quitar de grupo.**
- [ ] **4.6 Validar offline y sync pendiente.**

Criterio de cierre:

- [ ] El flujo de alumnos dentro del grupo reemplaza el salto aislado a lista general.
- [ ] Import/export siguen funcionando.
- [ ] No se duplica captura de alumno.

### FASE 5: Materiales y Recursos de Clase

Objetivo: llevar recursos didacticos al contexto de grupo.

- [ ] **5.1 Crear seccion `Materiales`.**
- [ ] **5.2 Mostrar recursos asignados al grupo.**
- [ ] **5.3 Permitir crear recurso desde grupo.**
- [ ] **5.4 Permitir adjuntar planeacion como material.**
- [ ] **5.5 Permitir filtrar por tipo: PDF, enlace, video, planeacion, imagen, archivo.**
- [ ] **5.6 Mantener biblioteca general como origen transversal.**
- [ ] **5.7 Evitar duplicidad con `ContenidoScreen`.**

Criterio de cierre:

- [ ] Un docente puede agregar/ver materiales desde el grupo.
- [ ] `ContenidoScreen` no compite con Classroom para acciones de grupo.

### FASE 6: Actividades, Tareas y Entregables

Objetivo: unificar recursos evaluables dentro de la clase.

- [ ] **6.1 Crear seccion `Actividades`.**
- [ ] **6.2 Mostrar tareas por estado: borrador, publicada, en curso, cerrada, calificada.**
- [ ] **6.3 Reutilizar creacion de tarea actual.**
- [ ] **6.4 Reutilizar entregables y calificacion existente.**
- [ ] **6.5 Preparar soporte para rubricas sin implementarlas si no toca.**
- [ ] **6.6 Agregar estado por alumno: pendiente, entregado, revisado, calificado.**
- [ ] **6.7 Validar flujo completo crear -> asignar -> entregar/mock -> calificar.**

Criterio de cierre:

- [ ] Las tareas se gestionan desde el grupo.
- [ ] El docente ve rapidamente quien entrego y quien falta.
- [ ] No hay calificacion automatica por IA.

### FASE 7: Asistencia y Calificaciones Integradas

Objetivo: mover controles academicos diarios al mismo espacio.

- [ ] **7.1 Crear seccion `Asistencia`.**
- [ ] **7.2 Registrar asistencia desde grupo con fecha clara.**
- [ ] **7.3 Ver historial de asistencia por grupo.**
- [ ] **7.4 Crear seccion `Calificaciones`.**
- [ ] **7.5 Capturar calificaciones desde actividades o tabla general.**
- [ ] **7.6 Mantener promedios conectados con datos existentes.**
- [ ] **7.7 Exportar asistencia/calificaciones si ya existe servicio.**

Criterio de cierre:

- [ ] Asistencia y calificaciones ya no se sienten como modulos aislados.
- [ ] Los datos siguen sincronizando correctamente.

### FASE 8: Reportes, Alertas y Seguimiento

Objetivo: dar al docente informacion accionable sin convertir Classroom en un dashboard saturado.

- [ ] **8.1 Crear seccion `Reportes` dentro del grupo.**
- [ ] **8.2 Reutilizar reportes de grupo y alumno.**
- [ ] **8.3 Mostrar indicadores simples: asistencia baja, tareas pendientes, promedio bajo.**
- [ ] **8.4 Agregar vista de alumno con historial academico resumido.**
- [ ] **8.5 Exportar reporte si ya existe flujo estable.**
- [ ] **8.6 No implementar gamificacion todavia.**

Criterio de cierre:

- [ ] El docente puede detectar que alumnos requieren atencion.
- [ ] El reporte no depende de IA ni de infraestructura nueva.

### FASE 9: IA Classroom y Automatizaciones Pedagogicas

Objetivo: agregar IA solo cuando el flujo base sea estable.

- [ ] **9.1 Definir casos IA reales para Classroom.**
- [ ] **9.2 Reutilizar `aiGateway` y limites por accion.**
- [ ] **9.3 Crear prompts para sugerir actividades/rubricas/retroalimentacion.**
- [ ] **9.4 Agregar fallback heuristico si no hay API key.**
- [ ] **9.5 Mostrar advertencia dev si `AI_DEV_MODE` supera limites.**
- [ ] **9.6 Exigir revision humana antes de guardar sugerencias.**
- [ ] **9.7 Agregar tests de exito/error/fallback.**

Criterio de cierre:

- [ ] IA ayuda sin sustituir al docente.
- [ ] No hay spinners infinitos.
- [ ] No se generan costos silenciosos.

### FASE 10: UX/UI, Navegacion y Limpieza Legacy

Objetivo: dejar Classroom usable, profesional y sin rutas duplicadas.

- [ ] **10.1 Auditar Classroom con reglas de navegacion de `meta_guia_planes.md`.**
- [ ] **10.2 Verificar entradas desde tabs, `ContenidoScreen`, cards, FABs y acciones contextuales.**
- [ ] **10.3 Ocultar o redirigir rutas legacy que ya tengan reemplazo.**
- [ ] **10.4 Eliminar pantallas duplicadas solo despues de validacion manual.**
- [ ] **10.5 Revisar botones activos legibles, contrastes, labels y tamanos tactiles.**
- [ ] **10.6 Validar web, tablet y movil.**
- [ ] **10.7 Actualizar onboarding/ayuda si el flujo cambia.**

Criterio de cierre:

- [ ] Ningun flujo clave queda aislado.
- [ ] No hay doble captura de datos.
- [ ] El docente puede volver/cancelar/guardar sin perder contexto.

### FASE FINAL: Validacion, Documentacion y Cierre

Objetivo: cerrar el plan con evidencia tecnica y manual.

- [ ] **F.1 Ejecutar `npx tsc --noEmit`.**
- [ ] **F.2 Ejecutar `npm run lint -- --quiet`.**
- [ ] **F.3 Ejecutar `npm test -- --runInBand`.**
- [ ] **F.4 Ejecutar tests focalizados de grupos/alumnos/tareas/asistencia/calificaciones.**
- [ ] **F.5 Validar manualmente web.**
- [ ] **F.6 Validar manualmente movil fisico.**
- [ ] **F.7 Validar offline/reconexion.**
- [ ] **F.8 Actualizar `README.md`.**
- [ ] **F.9 Actualizar `Documentacion/README.md`.**
- [ ] **F.10 Actualizar mapa de navegacion si cambia.**
- [ ] **F.11 Hacer commit solo cuando el usuario lo pida o lo confirme.**

---

## 13. Checklist de Validacion Manual

- [ ] Entrar desde `GruposTab`.
- [ ] Crear grupo nuevo.
- [ ] Abrir grupo existente.
- [ ] Volver de grupo a home.
- [ ] Agregar alumno desde grupo.
- [ ] Importar alumnos desde grupo.
- [ ] Abrir detalle de alumno y volver al grupo.
- [ ] Crear material desde grupo.
- [ ] Asignar recurso existente a grupo.
- [ ] Asignar planeacion existente como material.
- [ ] Crear actividad/tarea desde grupo.
- [ ] Ver estado de entregas por alumno.
- [ ] Calificar entrega.
- [ ] Registrar asistencia.
- [ ] Ver historial de asistencia.
- [ ] Capturar calificaciones.
- [ ] Ver reporte de grupo.
- [ ] Usar app sin internet y crear datos pendientes.
- [ ] Reconectar y confirmar sync.
- [ ] Validar web sin scroll roto.
- [ ] Validar movil sin pantallas cortadas.
- [ ] Validar que no haya botones sin destino.
- [ ] Validar que no haya texto ilegible al seleccionar botones.

---

## 14. Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigacion |
| --- | --- | --- |
| Intentar reescribir todo de golpe | Alto | Fusion progresiva por secciones. |
| Romper datos existentes | Alto | Usar facade y tipos derivados antes de migrar. |
| Duplicar rutas | Alto | Auditar navegacion en cada fase. |
| Sobrecargar UI movil | Medio | Secciones compactas y acciones contextuales. |
| Crear IA antes de flujo base | Medio | Dejar IA para fase posterior. |
| Introducir costos | Medio | Reusar backend y gateway actual; sin servicios nuevos. |
| Copiar referencias AGPL | Alto | Solo inspiracion conceptual, no codigo. |
| Dejar `ContenidoScreen` compitiendo | Alto | Redirecciones claras y criterio por contexto. |
| Storage academico disperso en varias claves AsyncStorage | Alto | Fase 2 debe crear facade/repositorio y no acoplar pantallas nuevas a claves directas. |
| Endpoints academicos sin aislamiento `userId` consistente | Alto | Documentar como deuda de seguridad y resolver antes de beta multiusuario. |
| Calificacion de entregas con datos mock/integracion parcial | Alto | Fase 6 debe conectar entregas reales, calificaciones y tests antes de cerrar flujo evaluable. |
| Nombres `Tarea`, `EntregaTarea` y `Entregable` mezclados | Medio | Fase 2 debe definir vocabulario interno y mapping sin duplicar entidades. |

---

## 15. Open Questions Antes de Implementar

- [ ] Confirmar si el tab visible seguira llamandose `Grupos` o se renombrara a `Classroom`.
- [ ] Confirmar si `ContenidoScreen` debe mantenerse como tab principal o degradarse a hub interno mas adelante.
- [ ] Confirmar si las unidades/semanas se implementan en primera version o se posponen.
- [ ] Confirmar si los alumnos pueden existir fuera de grupos o siempre deben vincularse a uno.
- [ ] Confirmar si se requiere rol `Alumno` visible en la app durante esta fase o solo preparacion tecnica.
- [ ] Confirmar si Classroom debe tener modo demo con datos precargados para presentacion escolar.

---

## 16. Criterio de Cierre del Plan Classroom

Este plan se considera completado cuando:

- [ ] `GruposTab` funciona como experiencia Classroom.
- [ ] Un grupo/clase centraliza alumnos, materiales, actividades, asistencia, calificaciones y reportes.
- [ ] Las rutas legacy duplicadas estan ocultas, redirigidas o eliminadas.
- [ ] `ContenidoScreen` no duplica flujos de grupo.
- [ ] Los datos funcionan offline-first.
- [ ] TypeScript, lint y tests pasan.
- [ ] Hay validacion manual web y movil.
- [ ] README/documentacion reflejan el nuevo flujo.
- [ ] El usuario confirma que la experiencia se siente como Classroom y no como pantallas sueltas.

---

## 17. Nota Para Futuras IAs

No empieces a programar Classroom sin leer este plan completo, `Documentacion/meta_guia_planes.md` y `Documentacion/MAPA_MODULOS_ACTUALES.md`.

La meta no es "hacer otro dashboard". La meta es que el docente abra una clase y pueda trabajar ahi sin preguntarse en que modulo vive cada cosa.

---

## 18. Tracking Operativo en GitHub Projects

Decision antes de iniciar implementacion:

- No convertir cada checkbox del plan en issue desde el inicio.
- Usar este markdown como fuente arquitectonica y de trazabilidad completa.
- Usar GitHub Projects como tablero operativo.
- Mantener el item/issue padre `Plan Maestro: Classroom / Grupos y Recursos` como epic.
- Crear issue por fase al iniciar esa fase o cuando sea la siguiente inmediata.
- Meter las tareas internas de la fase activa como checklist dentro del issue de fase.
- Usar milestone `Ciclo 2 - Fundacion Classroom` para las primeras fases de implementacion.
- Usar labels segun corresponda: `fase`, `plan-maestro`, `offline-first`, `legacy`, `ux-ui`, `testing`, `docs`, `low-cost`, `needs-input`.

Mapping sugerido inicial:

| Work item | Tipo | Milestone | Estado inicial |
| --- | --- | --- | --- |
| `Plan Maestro: Classroom / Grupos y Recursos` | Epic | `Ciclo 2 - Fundacion Classroom` | Ready |
| `Classroom Fase 0 - Auditoria profunda y preparacion` | Fase | `Ciclo 2 - Fundacion Classroom` | Ready |
| `Classroom Fase 1 - Modelo academico unificado` | Fase | `Ciclo 2 - Fundacion Classroom` | Backlog |
| `Classroom Fase 2 - Capa de datos y facade` | Fase | `Ciclo 2 - Fundacion Classroom` | Backlog |
| `Classroom Fase 3 - Shell Classroom y navegacion principal` | Fase | `Ciclo 2 - Fundacion Classroom` | Backlog |

Estado operativo:

- [x] Issue creado para Fase 0: `https://github.com/RitualBoat/PlanearIA/issues/1`.
- [x] Issue agregado a `PlanearIA Product OS`.
- [x] Fase 0 movida a `In Progress` al iniciar ejecucion.
- [x] Fase 0 ejecutada y lista para `Done`.
- [x] Priority inicial: `P0`.
- [x] Issue creado para Fase 1: `https://github.com/RitualBoat/PlanearIA/issues/2`.
- [x] Issue de Fase 1 agregado a `PlanearIA Product OS`.
- [x] Fase 1 movida a `In Progress` al iniciar ejecucion.
- [x] Fase 1 ejecutada y lista para `Done`.

Regla de actualizacion:

- Cuando una fase pase de `[ ]` a `[~]`, mover su item a `In Progress`.
- Cuando una fase pase a `[x]`, mover su item a `Review Manual` o `Done` segun si requiere validacion manual.
- Si hay bloqueo por decision de producto, API key, costo o input del usuario, mover a `Blocked` y etiquetar `needs-input`.
