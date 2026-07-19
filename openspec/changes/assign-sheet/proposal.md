# Change: assign-sheet

Issue: #84. Plan maestro: `Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md` (Ola 1, change `assign-sheet`, lineas 327-333). Origen: auditoria #76, hallazgo H15.

## Why

Asignar y adjuntar ya ocurre en cuatro superficies del producto. El problema no es que falte la accion: es que **tres de esas cuatro escrituras pierden el trabajo del docente**, y ninguna comparte selector.

`asignarRecursosAGrupo` (`grupoAsignacionesService.ts:75-92`) escribe `grupoId` directo en `@planearia:recursos` y nunca llama a `queueEntityOperation`. Sin operacion en cola, el pull siguiente aplica `reconcileWithPending` (`entitySync.ts:151-178`), que conserva la version local **solo** de los items con trabajo encolado; para el resto gana el remoto. El recurso vuelve sin `grupoId` y la asignacion desaparece sin aviso. La condicion es el caso normal del docente conectado: sesion autenticada, API configurada y backend alcanzable.

El segundo defecto es peor porque miente. `grupoAsignacionesService.ts:5` lee y escribe `@planearia:tareas`, la clave que `classroomStorage.ts:13` marca explicitamente como **legacy**, mientras `EntregablesContext` y `SYNC_ENTITIES.entregables` usan `@planearia:entregables`. Sobre datos creados por la app actual, el selector de entregables aparece vacio; si hubiera datos legacy, la asignacion recorre el array equivocado, actualiza cero elementos y la pantalla igualmente muestra "Asignacion completada". Es una confirmacion falsa sobre una escritura que no ocurrio.

Ninguno de los dos rompe una prueba hoy: `grupoAsignacionesService.test.ts` ejercita el servicio contra su propia clave, asi que verifica que el codigo hace lo que hace, no que el docente conserve su asignacion.

A eso se suma la brecha que el plan nombra: el modelo ya tiene `grupoId`, `unidadId` y `tareaId` en `Recurso` y `Tarea`, pero `unidadId` **solo se puede fijar al crear**. No existe ningun camino en el producto para mover a una unidad un recurso ya creado.

## What Changes

- **Un solo selector transversal.** `AssignSheet` (presentacional, sobre el `Sheet` de #82) mas `useAssignSheet()` (ViewModel). La hoja renderiza; el hook decide destinos, validez y ejecucion. Su contrato de props es lo que la hace reutilizable por Office, Clases y Conecta en olas posteriores, sin copiarla.
- **Destino en cascada clase -> unidad -> actividad**, con unidad y actividad opcionales: elegir solo la clase sigue siendo una asignacion completa y valida. Los tres niveles se apoyan en campos que **ya existen** (`Recurso.grupoId`/`unidadId`/`tareaId`, `Tarea.grupoId`/`unidadId`), asi que no se toca esquema, backend ni `SYNC_ENTITIES`.
- **Toda escritura pasa por el camino que ya encola.** El hook asigna via `actualizarRecurso` / `actualizarEntregable` de los contextos vigentes, que ya invocan `queueEntityOperation`. La operacion queda encolada estando offline y sube sola al reconectar.
- **`grupoAsignacionesService` se corrige en su camino de datos**: pasa a encolar y a usar `@planearia:entregables`. Su firma publica no cambia y **la UI de sus otros dos consumidores no se toca**. Es correccion de escritura, no redisenio.
- **Confirmacion docente explicita con el destino nombrado** ("Asignar 3 elementos a 2do A - Unidad 1"), en el pie de la hoja. Sustituye a los dos `Modal` anidados de `AsignarRecursoScreen` y a los `Alert.alert` de las otras superficies.
- **El resultado se afirma solo cuando es cierto.** Con backend alcanzable, la hoja confirma sincronizado; sin conexion confirma que quedo guardado en el dispositivo y se asignara al reconectar, con el vocabulario de #83. Se elimina la pantalla de exito incondicional.
- **Adopcion en un flujo real:** `AsignarRecursoScreen`, alcanzable desde Detalle de Grupo (`useDetalleGrupoViewModel.ts:257`), es la superficie dedicada a asignar y la que sufre los dos defectos.

No hay motor nuevo: ni colas, ni clientes HTTP, ni estado de sincronizacion paralelo. Se **usa** lo que `src/sync` ya ofrece.

## Capabilities

### New Capabilities

- `cross-surface-assignment`: como el docente asigna o adjunta un elemento existente a una clase, unidad o actividad desde cualquier superficie: un solo selector, destino en cascada con niveles opcionales, confirmacion explicita antes de escribir, escritura siempre encolada en el motor de sincronizacion, resultado afirmado segun el hecho real y no de forma incondicional, y la prohibicion de que una superficie escriba una asignacion por fuera de ese camino.

### Modified Capabilities

Ninguna. Este change no altera el comportamiento garantizado por `adaptive-app-shell`, `base-component-library`, `sync-status-presentation` ni `reactive-breakpoints`; los consume.

## Impact

**Codigo agregado**
- `src/components/assign/` (`AssignSheet`, barrel).
- `src/hooks/useAssignSheet.ts`.
- Pruebas en `src/__tests__/`.

**Codigo modificado (tres archivos)**
- `src/screens/biblioteca/ListaRecursosScreen.tsx`: monta la hoja en el menu de cada recurso, sustituyendo el `Alert` "Proximamente". **Desviacion respecto del propose original, registrada en `design.md` D10**: la adopcion se movio aqui desde `AsignarRecursoScreen`, cuyo destino ya viene fijo por ruta y por tanto tiene la forma inversa a la que la hoja resuelve.
- `src/screens/grupos/tareas/AsignarRecursoScreen.tsx`: correccion minima de veracidad. Usa el conteo real que devuelve el servicio en vez de afirmar exito incondicional. No adopta la hoja ni se redisena.
- `src/services/grupoAsignacionesService.ts`: encola y corrige la clave de entregables. Firma publica sin cambios.

**Sin impacto**
- `src/sync`, `SYNC_ENTITIES`, `syncAllEntities`, colas, almacenamiento, backend, esquema, filtrado por `userId`, claves `@planearia:*` como contrato, proyecto nativo, dependencias, rutas de navegacion.
- `ContenidoScreen` y `ConversacionScreen` conservan su UI intacta; solo cambia el camino de datos bajo el servicio que ya llaman.
- `AgregarContenidoClassroomScreen` queda sin tocar: ya encola bien y es la prueba de que el camino correcto existia.

**Deuda declarada, no cerrada por este change**
- `ContenidoScreen:461` conserva su boton muerto ("Asignar a grupo" -> `Alert` "Proximamente"). Wirearlo obligaria a entrar a una pantalla de 1300 lineas cuya disolucion es D6 y no es de esta ola.
- `ConversacionScreen:524-527` sigue rechazando asignar planeaciones desde el chat. Este change no incorpora planeaciones al selector.

**Dependencias de plan**
- Depende de #82 `componentes-base` (cerrado) y consume #83 `sync-status-ui` (cerrado). Habilita `office-home-crear`, `disena-plan`, `conecta-plan` y `escritorio-docente` (plan lineas 394, 430, 477, 508). Retira uno de los dos bloqueos del golden journey GJ2 (`crear-planeacion-y-asignarla`); el otro, `crear-tipo-primero`, sigue pendiente.

## No objetivos

- No construir Classroom ni ninguna parte de el: este change entrega un selector y un camino de escritura, no un modulo.
- No modificar el motor de sync, `src/sync`, `SYNC_ENTITIES`, `syncAllEntities`, colas ni almacenamiento; solo se usa lo que ya existe.
- No tocar backend, esquema, rutas de API ni filtrado por `userId`.
- No crear pantallas nuevas ni entradas nuevas en la raiz de navegacion.
- No resucitar ni redisenar `ContenidoTab` / `ContenidoScreen`; solo se corrige el servicio que consume, sin tocar su UI.
- No wirear el boton "Proximamente" de `ContenidoScreen:461`.
- No migrar `ConversacionScreen` ni `AgregarContenidoClassroomScreen` a la hoja.
- No incorporar planeaciones como elemento asignable en este change.
- No implementar desasignar en masa, historial de asignaciones ni resolucion de conflictos.
- No agregar dependencias.
- No modificar `ThemeContext`, `FontSizeContext`, `DaltonismoContext` ni `AccessibilityPreferencesContext`.
- No editar el Plan Maestro.
