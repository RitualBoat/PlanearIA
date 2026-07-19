# Brownfield baseline: assign-sheet

Registra solo la superficie que este change toca. No inventaria la app ni sustituye la spec.

## Superficies tocadas

**Se modifican (dos archivos):**

- `src/screens/grupos/tareas/AsignarRecursoScreen.tsx` — adopta la hoja compartida; pierde sus tres `Modal` ad-hoc (`:349-495`) y su pantalla de exito incondicional (`:197-237`).
- `src/services/grupoAsignacionesService.ts` — camino de datos: encola y corrige la clave de entregables. Firma publica sin cambios.

**Se agregan:**

- `src/components/assign/` (`AssignSheet`, barrel).
- `src/hooks/useAssignSheet.ts`.
- Pruebas en `src/__tests__/`.

**Se leen sin modificar:**

- `src/context/RecursosContext.tsx` y `src/context/EntregablesContext.tsx` — camino de escritura que ya encola.
- `src/context/GruposContext.tsx` y `src/services/classroom/classroomRepository.ts` — origen de los destinos de clase, unidad y actividad.
- `src/hooks/useSyncPresentation.ts` (#83) — vocabulario de sincronizacion.
- `src/components/base/` (#82) — `Sheet`, `Button`, `Chip`, `EmptyState`, `Skeleton`.

**Se ven afectados sin ser editados:**

- `src/screens/contenido/ContenidoScreen.tsx` y `src/screens/chat/ConversacionScreen.tsx` — su UI queda intacta; cambia el camino de datos bajo el servicio que ya llaman.

## Fuentes de verdad actuales

- `src/sync/services/entitySync.ts:41-90` define `SYNC_ENTITIES` y es la fuente de verdad de que entidades sincronizan y con que clave de almacenamiento.
- `src/sync/services/entitySync.ts:109-126` (`queueEntityOperation`) es el unico camino sancionado para registrar una mutacion sincronizable; devuelve si la cola quedo drenada.
- `src/sync/services/entitySync.ts:151-178` (`reconcileWithPending`) define quien gana entre local y remoto: el local solo se conserva cuando tiene trabajo encolado.
- `types/index.ts:163-180` y `:203-233` definen `Tarea` y `Recurso`, incluidos los tres campos de destino (`grupoId`, `unidadId`, `tareaId`/`asignadoComoTarea`).
- `src/services/classroom/classroomStorage.ts:8-19` fija que clave es vigente y cual es legacy para cada entidad de classroom.
- `openspec/specs/sync-status-presentation/spec.md` es verdad de comportamiento del vocabulario de sincronizacion; este change lo consume y no puede derivar el suyo.
- `openspec/specs/base-component-library/spec.md` fija el patron de tokens, estados y accesibilidad heredado de #82.
- `qa/golden-journeys.json` es el contrato de QA visual; GJ2 lista `AsignarRecurso` entre sus rutas.

## Comportamiento vigente

- Cuatro superficies asignan o adjuntan: `AsignarRecursoScreen`, `ContenidoScreen:386-389`, `ConversacionScreen:520` y `AgregarContenidoClassroomScreen`.
- Las tres primeras escriben por `grupoAsignacionesService` y **ninguna encola**: `asignarRecursosAGrupo` (`:75-92`) y `asignarEntregablesAGrupo` (`:94-111`) escriben `AsyncStorage` directo. Con sesion autenticada, API configurada y backend alcanzable, el pull siguiente aplica `reconcileWithPending` y el remoto gana, asi que la asignacion desaparece sin aviso. En sesion invitada o dev-local no hay pull y el defecto no se manifiesta.
- `grupoAsignacionesService.ts:5` usa `@planearia:tareas`, marcada como `tareasLegacy` en `classroomStorage.ts:13`, mientras `EntregablesContext.tsx:8` y `SYNC_ENTITIES.entregables` usan `@planearia:entregables`. Sobre datos vigentes el selector de entregables aparece vacio y la asignacion actualiza cero elementos; la pantalla igualmente muestra "Asignacion completada".
- Solo `AgregarContenidoClassroomScreen` escribe bien: crea via `RecursosContext`/`EntregablesContext` con `grupoId` y `unidadId` (`:355,385`), y por lo tanto encola.
- El unico destino ofrecido es `grupoId`. `unidadId` solo se puede fijar al crear (`useCrearRecursoViewModel.ts:91,210`; `AgregarContenidoClassroomScreen.tsx:355,385`); no existe camino para mover a una unidad un elemento ya creado. La actividad no es elegible en ninguna superficie.
- Tres lenguajes de confirmacion conviven: dos `Modal` anidados en `AsignarRecursoScreen`, `Alert.alert` en `ContenidoScreen` y en `ConversacionScreen`.
- Ninguna de esas superficies usa componentes de #82 ni tokens de runtime: `Modal` crudo y `COLORS` legacy estatico.
- `ContenidoScreen:461` conserva un boton muerto: el menu "Asignar a grupo" abre un `Alert` "Proximamente".
- `grupoAsignacionesService.test.ts` pasa en verde ejercitando el servicio contra su propia clave: verifica la implementacion, no el resultado para el docente.

## Comportamiento objetivo

- Un unico selector (`AssignSheet`) y un unico ViewModel (`useAssignSheet`) resuelven asignar y adjuntar; ninguna superficie construye el suyo.
- Destino en cascada clase -> unidad -> actividad, con unidad y actividad opcionales, alimentado de datos locales del usuario en sesion, y con invalidacion de niveles inferiores al cambiar uno superior.
- Toda asignacion encola en el motor vigente en el mismo acto en que se escribe local; sobrevive al pull y sube sola al reconectar.
- `tareaId` y `asignadoComoTarea` se fijan siempre juntos y coherentes.
- Confirmacion explicita con destino y cantidad nombrados; nada se escribe antes.
- El resultado distingue sincronizado de encolado con el vocabulario de `useSyncPresentation()`; se elimina la afirmacion incondicional de exito.
- Sin conexion se puede asignar: el estado offline informa y no bloquea.
- Estados de cargando, vacio con salida y error con reintento, disenados.
- Accesibilidad: seleccion anunciada con `aria-checked` explicito, 44pt reales por altura minima, foco atrapado y visible, variante sin movimiento bajo reduce-motion.
- `grupoAsignacionesService` encola y escribe en `@planearia:entregables`, con firma publica intacta, de modo que sus dos consumidores dejan de perder asignaciones sin cambiar su UI.

## Compatibilidad legacy

- **No se migra ni se borra ningun dato.** La correccion de clave cambia donde aterrizan las escrituras nuevas; la lectura sigue igual, porque `classroomRepository` fusiona `@planearia:tareas` como `tareasLegacy` con `mergeById` (`:59-60,72,205-219`). Los entregables legacy siguen visibles.
- La reversion es compatible en ambos sentidos: al revertir, el servicio vuelve a escribir en la clave legacy y lo escrito en el intervalo queda en `@planearia:entregables`, que es la clave que la app usa para leer; sigue visible y asignado. Lo unico que regresa es el defecto original.
- `src/sync`, `SYNC_ENTITIES`, `syncAllEntities`, colas y almacenamiento quedan sin modificar. Cero clientes HTTP, cero colas, cero estado de sincronizacion nuevo.
- Backend, esquema, rutas de API y filtrado por `userId` sin cambios. El aislamiento sigue viniendo del token en el backend y del pull por entidad.
- `ContenidoScreen`, `ConversacionScreen` y `AgregarContenidoClassroomScreen` conservan su UI; la primera y la segunda solo cambian de camino de datos, la tercera ni eso.
- Contextos de preferencias (`ThemeContext`, `FontSizeContext`, `DaltonismoContext`, `AccessibilityPreferencesContext`) sin cambios.
- Firma publica de `grupoAsignacionesService` sin cambios, para no arrastrar a sus consumidores a este change.

## Owner de spec y contexto

- Spec nueva: `cross-surface-assignment` (creada por este change).
- Specs consumidas sin modificar: `sync-status-presentation` (#83), `base-component-library` (#82), `adaptive-app-shell` (#81), `reactive-breakpoints` (#79), `design-tokens` (#80).
- Plan maestro: `Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md`, Ola 1, lineas 327-333.
- Issue: #84. Origen: auditoria #76, hallazgo H15.
- Dependencia cerrada: #82 `componentes-base`. Habilita: `office-home-crear`, `disena-plan`, `conecta-plan`, `escritorio-docente` (plan lineas 394, 430, 477, 508).

## Evidencia actual

- Conteos verificados sobre el codigo real el 2026-07-19: 4 superficies que asignan; 3 selectores distintos; 0 de 3 escrituras del servicio encolan; 1 nivel de destino ofrecido de 3 posibles; 0 componentes de #82 usados por esas superficies; 1 boton muerto.
- Los tres campos de destino ya existen en el modelo: `types/index.ts:216,220,221-222` y `:167-168`.
- El camino correcto ya existe y se usa: `AgregarContenidoClassroomScreen.tsx:355,385` mas `RecursosContext.tsx:89-101`.
- `qa/golden-journeys.json`: GJ0 obligatorio; GJ2 en estado parcial con `AsignarRecurso` entre sus rutas y `assign-sheet` como uno de sus dos changes duenos.
- Hallazgos de accesibilidad heredados que este change respeta: RN Web no deriva `aria-checked` (#82); `hitSlop` no ensancha por debajo del ancho real (#83).

## Fuera de alcance

- Classroom como modulo, o cualquier parte de el mas alla del camino de asignacion.
- Motor de sync, `src/sync`, `SYNC_ENTITIES`, `syncAllEntities`, colas, almacenamiento.
- Backend, esquema, rutas de API, filtrado por `userId`.
- Rediseno de `ContenidoScreen` y su disolucion (D6), y el wireo de su boton "Proximamente" (`:461`).
- Migracion de `ConversacionScreen` y `AgregarContenidoClassroomScreen` a la hoja.
- Planeaciones como elemento asignable.
- Desasignar en masa, historial de asignaciones, resolucion de conflictos.
- Cierre del golden journey GJ2, que ademas depende de `crear-tipo-primero`.
- Dependencias nuevas, rutas de navegacion nuevas, edicion del Plan Maestro.
