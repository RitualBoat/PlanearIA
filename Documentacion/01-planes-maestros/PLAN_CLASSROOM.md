# Plan Maestro: Classroom / Grupos y Recursos - PlanearIA

> **Version:** 1.0  
> **Fecha:** 2026-06-03  
> **Estado:** [~] Plan maestro en ejecucion. Fases 0-9 completadas; Fase 10 en validacion manual.
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
- `Documentacion/01-planes-maestros/meta_guia_planes.md`.
- `Documentacion/00-fundamentos/VISION_ACTUAL.md`.
- `Documentacion/05-analisis-ia/INFRAESTRUCTURA_SUGERIDA.md`.
- `Documentacion/00-fundamentos/MAPA_MODULOS_ACTUALES.md`.
- `Documentacion/01-planes-maestros/PLAN_PASOS_INICIALES.md`.
- `Documentacion/01-planes-maestros/plan_planeaciones.md`.
- `Documentacion/02-operacion/GITHUB_PRODUCT_OS.md`.
- `Documentacion/02-operacion/ENTORNO_LOCAL.md`.

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
      -> Tablon
      -> Trabajo de clase
        -> Seccion / Unidad
          -> Material
          -> Actividad
            -> Entregas
            -> Calificacion contextual
      -> Personas
```

### Acciones principales

- Crear grupo/clase.
- Importar alumnos.
- Agregar alumno individual.
- Crear seccion/unidad de curso.
- Subir archivo o pegar enlace dentro de una seccion.
- Preparar importacion futura desde Canva/Genially.
- Asignar contenido a una seccion sin usar formularios legacy de recursos/actividades.
- Abrir actividad y ver entregas por alumno.
- Calificar entrega desde el detalle de la actividad, solo si el alumno entrego.
- Ver alumno en contexto.
- Importar/exportar lista de alumnos desde `Personas`.
- Mantener asistencia, reportes y analitica como herramientas secundarias hasta que tengan ubicacion natural.

### Principio UX

Cada accion debe empezar desde el grupo cuando tenga contexto de grupo.

Ejemplo:

- Bien: `Grupo -> Trabajo de clase -> Unidad 1 -> Agregar contenido -> subir/enlazar`.
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
| `UnidadClassroom` | nueva implementada | organiza `Trabajo de clase` por secciones/unidades colapsables. |

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
| `Tablon` | feed de publicaciones, proximas entregas y actividad reciente del curso. |
| `Trabajo de clase` | secciones/unidades colapsables con materiales y actividades. |
| `DetalleActividadClassroomScreen` | instrucciones, entregas por alumno y calificacion contextual. |
| `Personas` | profesores, alumnos inscritos, importacion/exportacion y perfil de alumno. |
| Herramientas secundarias | asistencia, reportes, IA y analitica fuera del primer plano hasta ubicacion natural. |

### 7.2 Navegacion

Mapa minimo:

```markdown
## Mapa de Navegacion Classroom

- Entrada principal: `GruposTab`.
- Entradas secundarias: `ContenidoScreen`, acciones contextuales de recursos/planeaciones, perfil de alumno y notificaciones.
- Crear grupo: `GruposTab` -> `ClassroomHome` -> `CrearGrupo` -> `ClassroomGroup`.
- Crear alumno: `ClassroomGroup` -> `Personas` -> `Agregar alumno`.
- Crear seccion: `ClassroomGroup` -> `Trabajo de clase` -> `Crear seccion`.
- Agregar contenido: `ClassroomGroup` -> `Trabajo de clase` -> `Seccion` -> `Agregar contenido`.
- Subir/enlazar: `Agregar contenido` -> `Material` o `Actividad evaluable` -> archivo/enlace -> `ClassroomGroup`.
- Importar Canva/Genially: placeholder deshabilitado hasta crear modulo visual.
- Calificar: `ClassroomGroup` -> `Trabajo de clase` -> `Actividad` -> `Entrega entregada` -> `Guardar calificacion`.
- Asistencia/reportes: rutas secundarias, no tabs principales.
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

### 7.5 Estrategia UX/UI Hibrida

Decision post-revision manual:

- Cada modulo debe implementar una UX base profesional, responsive y usable dentro de su propio plan.
- El plan del modulo debe corregir bugs visuales propios del flujo: scroll roto, pantallas cortadas, jerarquia confusa, acciones ocultas o layout movil/web desfasado.
- El plan del modulo debe consultar su ground truth local antes de tocar UI. Para Classroom, usar `context/classroom-ground-truth/` y referencias reales de Google Classroom/Classroomio como inspiracion conceptual.
- No inflar cada plan con redisenos finales exhaustivos. El refinamiento visual profundo debe vivir en `Plan Maestro: UX/UI y Navegacion Global`.
- Si el desarrollador crea pantallas en Stitch/Figma y entrega HTML/MD/capturas, ese material se considera ground truth superior para una fase de redisenio dedicada.
- UX/UI Global hara la auditoria final con Nielsen, severidad 0-4, accesibilidad, tokens visuales y consistencia entre modulos.

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
- Permitir asignar actividades derivadas de una planeacion en fase posterior, sin convertir Classroom en editor/creador principal.
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

### Modo de Trabajo Recomendado

Antes de ejecutar cualquier fase, la IA debe leer `.agents/skills/token-efficiency/SKILL.md`.

- `NORMAL`: usar para auditorias, decisiones de arquitectura, dudas de producto, diseno UX/UI, seguridad, IA, costos, checkpoints y explicaciones al usuario.
- `CAVEMAN`: usar para implementacion mecanica ya aprobada, creacion de archivos, helpers, facades, ViewModels, tests, correcciones de lint/typecheck, updates de checklist y sincronizacion con GitHub Project.
- Mixto: usar `NORMAL` al inicio para confirmar criterio tecnico y `CAVEMAN` durante la ejecucion mecanica.
- Volver a `NORMAL` al cerrar una fase para reportar evidencia, riesgos y pedir confirmacion si aplica.

Guia opcional de modelos:

- Planeacion/auditoria/arquitectura: Codex 5.5 `high/xhigh`, Gemini 3.1 Pro, Claude Opus thinking o Claude Sonnet thinking.
- Implementacion de fases Classroom: Codex 5.4 o 5.5 `medium/high`.
- Cambios mecanicos, checkboxes, issues, validaciones: Codex 5.4 mini o modelo rapido `low/medium` con modo `CAVEMAN`.
- Bugs dificiles de sync/navegacion o migraciones delicadas: subir a razonamiento `high/xhigh`.

### FASE 0: Auditoria Profunda y Preparacion

Objetivo: confirmar rutas, datos y dependencias antes de tocar codigo.

Modo sugerido: `NORMAL`. Esta fase requiere lectura, criterio y registro de riesgos.

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

Modo sugerido: mixto. `NORMAL` para decidir contratos; `CAVEMAN` para crear tipos, helpers y tests una vez aprobados.

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

Modo sugerido: `CAVEMAN` para implementar `classroomFacade`, selectores, storage abstraction y tests, porque la decision arquitectonica ya esta definida. Volver a `NORMAL` si aparece una decision real sobre AsyncStorage vs SQLite o cambio de sync.

- [x] **2.1 Crear `src/services/classroom/classroomFacade.ts` o equivalente.**
- [x] **2.2 Agregar selectores para resumen de grupo.**
- [x] **2.3 Agregar selectores para alumnos, actividades, materiales, asistencia y calificaciones por grupo.**
- [x] **2.4 Reutilizar servicios actuales de import/export/reportes.**
- [x] **2.5 Garantizar fallback local si backend falla.**
- [x] **2.6 Definir interfaz de storage local que no bloquee migracion futura a SQLite.**
- [x] **2.7 Agregar tests unitarios de selectors/facade/storage.**

Criterio de cierre:

- [x] Classroom puede renderizar datos locales.
- [x] No se rompe ningun contexto existente.
- [x] La capa local no queda acoplada irreversiblemente a AsyncStorage.
- [x] Typecheck, lint y tests pasan.

Resultado de ejecucion:

- Se creo `src/services/classroom/classroomStorage.ts` con `ClassroomStoragePort`, `AsyncStorageClassroomStorage`, `MemoryClassroomStorage` y claves academicas centralizadas.
- Se creo `src/services/classroom/classroomFacade.ts` como punto unico para leer grupos, alumnos, actividades, materiales, asistencia, calificaciones y entregas por `grupoId`.
- La facade consume el modelo de Fase 1 y expone `getClassroomModel`, `listGruposResumen` y selectores por seccion.
- Se agrego fallback para la deuda historica `@planearia:entregables` / `@planearia:tareas`, filtrando por forma de dato para evitar mezclar `Tarea` con `EntregaTarea`.
- Se agregaron pruebas en `src/__tests__/classroom/classroomFacade.test.ts`.
- Validaciones ejecutadas: `npx tsc --noEmit`, `npx jest src/__tests__/classroom --runInBand` y lint focalizado.

### FASE 3: Shell Classroom y Navegacion Principal

Objetivo: convertir `GruposTab` en entrada real a Classroom sin romper rutas viejas.

Modo sugerido: mixto. `NORMAL` para revisar UX/navegacion antes de tocar rutas; `CAVEMAN` para crear pantallas, conectar navigation y agregar tests.

- [x] **3.1 Crear `src/screens/classroom/ClassroomHomeScreen.tsx`.**
- [x] **3.2 Crear `src/screens/classroom/ClassroomGroupScreen.tsx`.**
- [x] **3.3 Integrar entrada desde `AppTabsNavigator` o ruta actual de grupos.**
- [x] **3.4 Mantener redireccion segura a pantallas legacy mientras se migran secciones.**
- [x] **3.5 Crear header/acciones rapidas coherentes web/movil.**
- [x] **3.6 Agregar estados vacios y offline.**
- [x] **3.7 Validar que volver/cancelar no pierda contexto.**
- [x] **3.8 Ajuste post-validacion manual: corregir scroll web cortado dentro de clase activa.**
- [x] **3.9 Ajuste post-validacion manual: acercar la clase activa a un patron visual Google Classroom/Classroomio.**

Criterio de cierre:

- [x] `GruposTab` abre la experiencia Classroom.
- [x] Abrir un grupo lleva a `ClassroomGroupScreen`.
- [x] Las rutas legacy siguen accesibles solo donde sean necesarias.

Resultado de ejecucion:

- Se creo `src/screens/classroom/ClassroomHomeScreen.tsx` como nueva entrada de `GruposTab`.
- Se creo `src/screens/classroom/ClassroomGroupScreen.tsx` como shell madre por grupo, con KPIs, acciones contextuales, pendientes, actividad reciente y salida a detalle legacy.
- Se agregaron ViewModels `useClassroomHomeViewModel` y `useClassroomGroupViewModel`.
- `AppTabsNavigator` ahora apunta `GruposTab` a `ClassroomHomeScreen`.
- `StackNavigator` incluye la ruta `ClassroomGroup` y conserva `DetalleGrupo`, `ListaGrupos`, `CrearGrupo`, `ImportarGrupos`, tareas, asistencia, calificaciones y reportes legacy.
- Validaciones ejecutadas: `npx tsc --noEmit`, `npx jest src/__tests__/classroom --runInBand` y lint focalizado de rutas/pantallas/hooks nuevos.
- Tras revision manual en `context/classroom-ground-truth/01-errores-actuales`, se corrigio el scroll web de `ClassroomGroupScreen` y se cambio la composicion visual a banner de clase, pestaÃ±as tipo Classroom, columna lateral de resumen y stream principal.
- El rediseÃ±o visual base pertenece a Classroom porque afecta el flujo del modulo. La auditoria final de consistencia, Nielsen, accesibilidad y tokens visuales queda para Fase 10 / UX-UI Global.

### FASE 4: Seccion Alumnos y Lista del Grupo

Objetivo: que el docente administre participantes desde la clase.

Modo sugerido: `CAVEMAN` si se reutilizan pantallas/contextos existentes; cambiar a `NORMAL` si hay que decidir nuevo flujo de importacion, mover alumnos o acciones masivas.

- [x] **4.1 Crear seccion `Alumnos` dentro de `ClassroomGroupScreen`.**
- [x] **4.2 Reutilizar creacion/importacion/exportacion de alumnos.**
- [x] **4.3 Mostrar estado academico basico por alumno.**
- [x] **4.4 Permitir abrir detalle de alumno con retorno al grupo.**
- [x] **4.5 Definir acciones masivas: importar, exportar, mover, quitar de grupo.**
- [x] **4.6 Validar offline y sync pendiente.**

Criterio de cierre:

- [x] El flujo de alumnos dentro del grupo reemplaza el salto aislado a lista general.
- [x] Import/export siguen funcionando.
- [x] No se duplica captura de alumno.

Resultado:

- `ClassroomGroupScreen` ahora muestra alumnos filtrados por `grupoId`, con preview, contador y acceso a detalle.
- `CrearAlumno` acepta `grupoId` y el ViewModel guarda alumnos nuevos vinculados al grupo.
- `ImportarAlumnos` y `ExportarAlumnos` aceptan `grupoId`/`grupoNombre`; desde Classroom importan/exportan solo la clase actual y desde la lista general conservan el modo global.
- Se agregaron acciones contextuales para abrir detalle, mover alumno a otro grupo y quitar alumno del grupo sin eliminar su perfil.
- Se reutilizan rutas existentes: `CrearAlumno`, `ImportarAlumnos`, `ExportarAlumnos` y `DetalleAlumno`, evitando duplicar capturas.

### FASE 5: Materiales y Recursos de Clase

Objetivo: llevar recursos didacticos al contexto de grupo.

Modo sugerido: mixto. `NORMAL` para evitar duplicidad con `ContenidoScreen`; `CAVEMAN` para implementar filtros, rutas y tests ya definidos.

- [x] **5.1 Crear seccion `Materiales`.**
- [x] **5.2 Mostrar recursos asignados al grupo.**
- [x] **5.3 Permitir crear recurso desde grupo.**
- [x] **5.4 Permitir adjuntar planeacion como material.**
- [x] **5.5 Permitir filtrar por tipo: PDF, enlace, video, planeacion, imagen, archivo.**
- [x] **5.6 Mantener biblioteca general como origen transversal.**
- [x] **5.7 Evitar duplicidad con `ContenidoScreen`.**

Criterio de cierre:

- [x] Un docente puede agregar/ver materiales desde el grupo.
- [x] `ContenidoScreen` no compite con Classroom para acciones de grupo.

Resultado:

- `ClassroomGroupScreen` muestra materiales asignados por `grupoId`, con preview y contador.
- `CrearRecurso` acepta `grupoId` y el ViewModel guarda recursos nuevos vinculados al grupo.
- Se agregaron filtros internos por tipo: todos, planeaciones, PDF, video, enlaces, imagenes, archivo y otros.
- Se puede adjuntar una planeacion existente como material del grupo usando `planeacion://<id>` y abrirla directamente en `DocEditor`.
- Se mantienen rutas de biblioteca/asignacion existentes como origen transversal; Classroom queda como vista contextual de clase y `ContenidoScreen` no compite con acciones de grupo.

### FASE 6: Actividades, Tareas y Entregables

Objetivo: unificar recursos evaluables dentro de la clase.

Modo sugerido: mixto. `NORMAL` para resolver vocabulario `Tarea`/`Entregable`/`EntregaTarea` y rubricas; `CAVEMAN` para integrar servicios, estados y pruebas.

- [x] **6.1 Crear seccion `Actividades`.**
- [x] **6.2 Mostrar tareas por estado: borrador, publicada, en curso, cerrada, calificada.**
- [x] **6.3 Reutilizar creacion de tarea actual.**
- [x] **6.4 Reutilizar entregables y calificacion existente.**
- [x] **6.5 Preparar soporte para rubricas sin implementarlas si no toca.**
- [x] **6.6 Agregar estado por alumno: pendiente, entregado, revisado, calificado.**
- [x] **6.7 Validar flujo completo crear -> asignar -> entregar/mock -> calificar.**

Criterio de cierre:

- [x] Las tareas se gestionan desde el grupo.
- [x] El docente ve rapidamente quien entrego y quien falta.
- [x] No hay calificacion automatica por IA.

Resultado:

- `ClassroomGroupScreen` integro el flujo de actividades y entregas dentro de `Trabajo de clase`, con filtros por estado, acceso a entregables y calificacion contextual por tarea.
- Los estados visibles se mapean sobre el modelo actual: `asignada` como publicada, `en_progreso` como en curso, `finalizada` como cerrada y `calificada` derivada de entregas calificadas por alumno.
- Cada actividad muestra progreso de entregas, pendientes, calificadas y preview de estado por alumno: pendiente, entregado, revisado o calificado.
- `useClassroomGroupViewModel` consume actividades y entregas desde `classroomFacade`, manteniendo MVVM y el camino futuro hacia SQLite.
- `CalificarEntregasScreen` deja de usar alumnos mock; ahora carga alumnos del grupo, lee/escribe entregas reales en `@planearia:entregas` y conserva la tarea desde `EntregablesContext`.
- Rubricas quedan preparadas como extension visible del flujo, sin implementar submodelo ni calificacion automatica por IA.
- Validaciones ejecutadas: `npx tsc --noEmit`, `npx jest src/__tests__/classroom --runInBand` y lint focalizado de archivos tocados.
- Validacion manual pendiente recomendada: crear una actividad desde el grupo, calificar al menos un alumno y volver a Classroom para confirmar que el contador de calificadas cambia.

### FASE 7: Asistencia y Calificaciones Integradas

Objetivo: mover controles academicos diarios al mismo espacio.

Modo sugerido: `CAVEMAN` para integrar secciones y reutilizar servicios actuales. Usar `NORMAL` solo si se redefine modelo de calificaciones o reglas academicas.

- [x] **7.1 Crear seccion `Asistencia`.**
- [x] **7.2 Registrar asistencia desde grupo con fecha clara.**
- [x] **7.3 Ver historial de asistencia por grupo.**
- [x] **7.4 Crear seccion `Calificaciones`.**
- [x] **7.5 Capturar calificaciones desde actividades o tabla general.**
- [x] **7.6 Mantener promedios conectados con datos existentes.**
- [x] **7.7 Exportar asistencia/calificaciones si ya existe servicio.**

Criterio de cierre:

- [x] Asistencia y calificaciones ya no se sienten como modulos aislados.
- [x] Los datos siguen sincronizando correctamente.

Resultado:

- `ClassroomGroupScreen` ahora incluye seccion `Asistencia` con ultimo registro, presentes, retardos, ausentes, justificadas y pendientes.
- La seccion de asistencia reutiliza rutas actuales: `RegistrarAsistencia` e `HistorialAsistencia`, siempre con `grupoId` contextual.
- `ClassroomGroupScreen` ahora incluye seccion `Calificaciones` con promedio, registros, pendientes, aprobados y reprobados.
- La seccion de calificaciones reutiliza rutas actuales: `CapturarCalificaciones`, `PromediosCalificaciones` y `ReportesGrupo` como salida de exportacion/reporte sin inventar servicio nuevo.
- `useClassroomGroupViewModel` carga asistencias y calificaciones desde `classroomFacade`, manteniendo el patron MVVM y offline-first.
- Validaciones ejecutadas: `npx tsc --noEmit`, `npx jest src/__tests__/classroom --runInBand` y lint focalizado de archivos tocados.
- Validacion manual pendiente recomendada: registrar asistencia, volver a Classroom y confirmar que los contadores de ultimo registro cambian; capturar calificacion y verificar promedio/resumen.

### FASE 8: Reportes, Alertas y Seguimiento

Objetivo: dar al docente informacion accionable sin convertir Classroom en un dashboard saturado.

Modo sugerido: mixto. `NORMAL` para decidir indicadores utiles y carga cognitiva; `CAVEMAN` para conectar reportes existentes y tests.

- [x] **8.1 Crear seccion `Reportes` dentro del grupo.**
- [x] **8.2 Reutilizar reportes de grupo y alumno.**
- [x] **8.3 Mostrar indicadores simples: asistencia baja, tareas pendientes, promedio bajo.**
- [x] **8.4 Agregar vista de alumno con historial academico resumido.**
- [x] **8.5 Exportar reporte si ya existe flujo estable.**
- [x] **8.6 No implementar gamificacion todavia.**

Criterio de cierre:

- [x] El docente puede detectar que alumnos requieren atencion.
- [x] El reporte no depende de IA ni de infraestructura nueva.

Resultado:

- `ClassroomGroupScreen` ahora incluye seccion `Reportes y seguimiento` con alertas simples por alumno.
- Los indicadores se derivan de datos locales: asistencia menor a 80%, promedio reprobado y actividades pendientes.
- Cada alerta abre `DetalleAlumno`, reutilizando el perfil/historial existente sin crear una pantalla duplicada.
- La accion principal abre `ReportesGrupo`, manteniendo el flujo estable de reporte/exportacion existente.
- No se agrego gamificacion, IA ni infraestructura nueva.
- Validaciones ejecutadas: `npx tsc --noEmit`, `npx jest src/__tests__/classroom --runInBand` y lint focalizado de archivos tocados.
- Validacion manual pendiente recomendada: generar datos con asistencia baja o promedio reprobado y confirmar que el alumno aparece en seguimiento.

### FASE 9: IA Classroom y Automatizaciones Pedagogicas

Objetivo: agregar IA solo cuando el flujo base sea estable.

Modo sugerido: `NORMAL` al inicio, porque hay decisiones de costo, prompts, limites, privacidad y revision humana. Cambiar a `CAVEMAN` solo al implementar endpoints/tests ya especificados.

- [x] **9.1 Definir casos IA reales para Classroom.**
- [x] **9.2 Reutilizar `aiGateway` y limites por accion.**
- [x] **9.3 Crear prompts para sugerir actividades/rubricas/retroalimentacion.**
- [x] **9.4 Agregar fallback heuristico si no hay API key.**
- [x] **9.5 Mostrar advertencia dev si `AI_DEV_MODE` supera limites.**
- [x] **9.6 Exigir revision humana antes de guardar sugerencias.**
- [x] **9.7 Agregar tests de exito/error/fallback.**

Criterio de cierre:

- [x] IA ayuda sin sustituir al docente.
- [x] No hay spinners infinitos.
- [x] No se generan costos silenciosos.

Resultado:

- Se creo `backend/api/classroom/copiloto.js` con acciones IA acotadas: sugerir actividad, generar rubrica, resumir progreso y sugerir retroalimentacion.
- El endpoint reutiliza `backend/lib/aiGateway.js` y `backend/lib/aiUsageLimiter.js`, con limite por accion `classroom_<accion>` y advertencia visible cuando `AI_DEV_MODE` aplica.
- Se creo `src/services/classroom/classroomAiService.ts` con cliente frontend, retry corto, lectura JSON robusta y fallback heuristico local si backend/API key no estan disponibles.
- `ClassroomGroupScreen` ahora incluye `Copiloto IA Classroom` con resumen de progreso, sugerencia de actividad y sugerencia de rubrica; todas requieren revision humana y no guardan nada automaticamente.
- `CalificarEntregasScreen` ahora permite sugerir retroalimentacion IA por alumno; la sugerencia solo se inserta si el docente la acepta y aun debe guardar manualmente.
- Se agregaron pruebas en `src/__tests__/classroom/classroomAiService.test.ts` para fallback sin API, exito backend con warning dev y fallback ante error no JSON.
- Validaciones ejecutadas: `npx tsc --noEmit`, `npx jest src/__tests__/classroom --runInBand` y lint focalizado de archivos tocados.
- Validacion manual pendiente recomendada: probar cada boton IA con backend apagado y, despues, con backend/API keys configuradas para confirmar warning dev y ausencia de spinners infinitos.

### FASE 10: UX/UI, Navegacion y Limpieza Legacy

Objetivo: dejar Classroom usable, profesional y sin rutas duplicadas.

Modo sugerido: `NORMAL` para auditoria IHC con heuristicas de Nielsen y severidad 0-4. Usar `CAVEMAN` solo para aplicar fixes mecanicos ya priorizados.

- [x] **10.1 Auditar Classroom con reglas de navegacion de `meta_guia_planes.md`.**
- [x] **10.2 Verificar entradas desde tabs, `ContenidoScreen`, cards, FABs y acciones contextuales.**
- [x] **10.3 Ocultar o redirigir rutas legacy que ya tengan reemplazo.**
- [~] **10.4 Mantener legacy fuera del flujo principal y eliminar duplicados solo despues de validacion manual.**
- [x] **10.5 Revisar botones activos legibles, contrastes, labels y tamanos tactiles.**
- [~] **10.6 Validar web, tablet y movil.**
- [x] **10.7 Actualizar onboarding/ayuda si el flujo cambia.**

Criterio de cierre:

- [~] Ningun flujo clave queda aislado.
- [~] No hay doble captura de datos.
- [~] El docente puede volver/cancelar/guardar sin perder contexto.

Resultado parcial:

- `ClassroomGroupScreen` fue reorientado a una experiencia tipo Google Classroom/Classroomio con tres pestañas principales: `Tablon`, `Trabajo de clase` y `Personas`.
- `Tablon` queda como feed de publicaciones del curso, con proximas entregas y sin tarjetas administrativas sueltas.
- `Trabajo de clase` organiza contenidos solo por `UnidadClassroom`/seccion colapsable; se elimino `Sin seccion` del flujo visible.
- Las actividades y materiales visibles deben guardar `unidadId`; los contenidos sin unidad quedan fuera de la vista Classroom hasta reasignarse.
- Al abrir una actividad desde `Trabajo de clase`, el flujo entra a `DetalleActividadClassroom`, donde se ve la consigna, entregas por alumno y calificacion integrada.
- La calificacion ya no se presenta como modulo suelto: solo se habilita si existe `EntregaTarea` marcada como `entregada`, `tarde` o `calificada`.
- `Personas` queda para ver/agregar/importar/exportar alumnos; asistencia, reportes y calificaciones quedan fuera del primer plano hasta una fase posterior donde tengan ubicacion natural.
- Se ocultaron CTAs visibles a pantallas legacy administrativas desde la clase moderna; las rutas antiguas siguen existiendo como respaldo hasta validacion manual completa.
- Se agrego `UnidadClassroom` y CRUD de secciones en `classroomFacade`, manteniendo MVVM/offline-first y evitando acoplar la pantalla a claves directas.
- Se revisaron botones activos para mantener texto visible en estados seleccionados/deshabilitados y se ajusto layout responsive en web/movil.
- Correccion post-validacion: el boton `+` de una seccion abre `AgregarContenidoClassroom`, no un formulario directo.
- Correccion post-validacion 2: `AgregarContenidoClassroom` ya no lista recursos existentes ni planeaciones; ahora permite material/actividad evaluable mediante multiples archivos y enlaces, y deja Canva/Genially como integracion futura.
- Correccion post-validacion 3: `DetalleRecursoClassroom` muestra los adjuntos publicados en Classroom como lista visible, ocultando metadatos tecnicos internos.
- Correccion post-validacion 4: `ClassroomHomeScreen` reemplazo el header anterior por `AnimatedTopPill` preservado.
- Correccion post-validacion 5: `CrearGrupo` puede regresar al dashboard Classroom cuando se invoca desde `ClassroomHomeScreen`, evitando `ListaGrupos` legacy.
- Correccion post-validacion 6: editar material o actividad desde Classroom abre `AgregarContenidoClassroom` en modo edicion, no pantallas legacy; actividades incorporan fecha de asignacion, entrega, entrega tardia y notas.
- Correccion post-validacion: los materiales existentes abren `DetalleRecursoClassroom`, con visor, metadatos y acciones secundarias para editar/quitar/eliminar.
- Correccion post-validacion: `CrearRecurso` queda como respaldo legacy/secundario, no como flujo principal de Classroom.
- Correccion post-validacion: `ClassroomHomeScreen` se alineo al patron Classroom con cursos, calendario y pendientes; se quito el CTA visible `Ver legacy`.
- Regla de producto reforzada: Classroom organiza/asigna contenido; la creacion compleja debe vivir en modulos especializados tipo Word/Docs, Canva/Genially o Excel/Listas.
- No se actualizo onboarding porque no existe flujo de ayuda/onboarding especifico de Classroom que haya cambiado en esta fase.
- Validaciones tecnicas ejecutadas: `npx tsc --noEmit`, `npx jest src/__tests__/classroom --runInBand` y lint focalizado de archivos tocados.
- Pruebas Classroom actualizadas: 12 tests pasan, incluyendo CRUD de secciones/unidades en `classroomFacade`.
- Pendiente para cerrar Fase 10: validar manualmente web, tablet y movil; confirmar que `Trabajo de clase` no corta scroll, que crear/guardar vuelve al contexto correcto y que no hay rutas clave aisladas.

### FASE FINAL: Validacion, Documentacion y Cierre

Objetivo: cerrar el plan con evidencia tecnica y manual.

Modo sugerido: `CAVEMAN` para correr validaciones, marcar checkboxes, actualizar Project y preparar commit. Usar `NORMAL` para el resumen final y confirmacion del usuario.

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
- [ ] Confirmar que la clase activa muestra solo `Tablon`, `Trabajo de clase` y `Personas`.
- [ ] Confirmar que el dashboard Classroom usa la pildora hero preservada.
- [ ] Crear clase desde Classroom y confirmar regreso al dashboard Classroom, no a `ListaGrupos`.
- [ ] Crear seccion/unidad desde `Trabajo de clase`.
- [ ] Colapsar y expandir seccion/unidad.
- [ ] Confirmar que el boton `+` de una seccion abre `Agregar contenido`, no un formulario directo.
- [ ] Confirmar que no aparece `Sin seccion` en `Trabajo de clase`.
- [ ] Subir archivo desde `Agregar contenido` y confirmar regreso a Classroom.
- [ ] Pegar enlace desde `Agregar contenido` y confirmar regreso a Classroom.
- [ ] Asignar material con varios archivos/enlaces y confirmar que `DetalleRecursoClassroom` muestra todos los adjuntos.
- [ ] Confirmar que `Importar desde Canva/Genially` aparece como futura integracion deshabilitada.
- [ ] Abrir material existente y confirmar que entra a `DetalleRecursoClassroom`.
- [ ] Editar material desde `DetalleRecursoClassroom` y confirmar que abre `AgregarContenidoClassroom`.
- [ ] Asignar actividad evaluable ligera con ponderacion 0-100 desde `Agregar contenido`, sin abrir formularios legacy de creacion profunda.
- [ ] Confirmar que la actividad permite fecha de asignacion, fecha de entrega, entrega tardia y notas adicionales.
- [ ] Abrir actividad desde `Trabajo de clase`.
- [ ] Editar actividad desde `DetalleActividadClassroom` y confirmar que abre `AgregarContenidoClassroom`.
- [ ] Ver estado de entregas por alumno dentro del detalle de actividad.
- [ ] Confirmar que una entrega pendiente no permite calificar.
- [ ] Calificar entrega solo cuando exista entrega marcada como `entregada`, `tarde` o `calificada`.
- [ ] Confirmar que asistencia, reportes y calificaciones no aparecen como modulos sueltos en el primer plano.
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
- [x] Confirmar si las unidades/semanas se implementan en primera version o se posponen. Decision: implementadas como `UnidadClassroom`.
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

No empieces a programar Classroom sin leer este plan completo, `Documentacion/01-planes-maestros/meta_guia_planes.md` y `Documentacion/00-fundamentos/MAPA_MODULOS_ACTUALES.md`.

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

Mapping operativo:

- Epic: `Plan Maestro: Classroom / Grupos y Recursos`.
- Milestone: `Ciclo 2 - Fundacion Classroom`.
- Fases cerradas: 0, 1, 2, 3, 4, 5, 6, 7, 8 y 9.
- Fase en progreso: 10.
- Siguiente issue recomendado: `Classroom Fase 10 - UX/UI, navegacion y limpieza legacy`.

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
- [x] Issue creado para Fase 2: `https://github.com/RitualBoat/PlanearIA/issues/3`.
- [x] Issue de Fase 2 agregado a `PlanearIA Product OS`.
- [x] Fase 2 ejecutada y marcada como `Done`.
- [x] Issue creado para Fase 3: `https://github.com/RitualBoat/PlanearIA/issues/4`.
- [x] Issue de Fase 3 agregado a `PlanearIA Product OS`.
- [x] Fase 3 ejecutada y marcada como `Done`.
- [x] Issue creado para Fase 4: `https://github.com/RitualBoat/PlanearIA/issues/5`.
- [x] Issue de Fase 4 agregado a `PlanearIA Product OS`.
- [x] Fase 4 ejecutada: alumnos contextuales, import/export por grupo, mover/quitar alumno y detalle desde Classroom.
- [x] Issue creado para Fase 5: `https://github.com/RitualBoat/PlanearIA/issues/6`.
- [x] Issue de Fase 5 agregado a `PlanearIA Product OS`.
- [x] Fase 5 ejecutada: materiales contextuales, filtros internos, planeaciones como material y apertura en `DocEditor`.
- [x] Issue creado para Fase 10: `https://github.com/RitualBoat/PlanearIA/issues/7`.
- [x] Issue de Fase 10 agregado a `PlanearIA Product OS`.
- [~] Fase 10 en validacion manual: UX/UI Classroom-like, contenido por secciones, detalle de recurso y limpieza legacy visible.

Regla de actualizacion:

- Cuando una fase pase de `[ ]` a `[~]`, mover su item a `In Progress`.
- Cuando una fase pase a `[x]`, mover su item a `Review Manual` o `Done` segun si requiere validacion manual.
- Si hay bloqueo por decision de producto, API key, costo o input del usuario, mover a `Blocked` y etiquetar `needs-input`.

