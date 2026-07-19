# Change: sync-status-ui

Issue: #83. Plan maestro: `Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md` (Ola 1, change `sync-status-ui`, lineas 319-325). Origen: auditoria #76, hallazgo H15.

## Why

`SyncContext` ya resuelve el estado real de sincronizacion y expone nueve campos, pero **un solo componente lo consume**. El resto de la app improvisa: hoy conviven tres vocabularios distintos para el mismo hecho, y el mas visible es el peor. Cuando el backend no responde, `ListaPlaneacionesScreen` muestra **"Error sync"** en rojo `#dc2626` mientras la barra global dice, para ese mismo evento, "Trabajando con datos locales". El docente recibe el mismo hecho como fallo propio en una pantalla y como normalidad en otra.

El costo no es estetico. Un docente que cree haber perdido su trabajo deja de confiar en la app offline-first, que es justamente su promesa central. Ademas dos de las tres derivaciones ignoran `authError`: con la sesion expirada, `ListaPlaneacionesScreen` sigue mostrando "Sincronizado" en verde mientras nada sube al servidor. Eso no es un mensaje alarmante: es un mensaje falso y tranquilizador, que es peor.

## What Changes

- **Una sola derivacion.** Nuevo hook ViewModel `useSyncPresentation()` que traduce `SyncContext` a `{ tono, icono, titulo, detalle, etiquetaA11y }`. Es la unica traduccion de estado a presentacion en la app; los componentes renderizan, no deciden.
- **Tres componentes nuevos** en `src/components/sync/`: `SyncStatusChip` (ambiente, siempre visible), `SaveStateLabel` (estado de guardado en editores) y `PendingBadge` (conteo en cola).
- **Siete estados presentados**, incluido `sync-desactivado`: con `syncEnabled === false` (invitado, sesion dev-local o API sin configurar) el chip no puede decir "sincronizado" ni "error"; dice "Guardado en este dispositivo". Es el estado por defecto de todo docente que aun no inicia sesion, y hoy nadie lo maneja.
- **`authError` deja de ser invisible.** Se presenta como aviso con accion de reingreso, no como fallo tecnico.
- **Se retira `buildSyncState`** de `ListaPlaneacionesScreen` (4 hex fijos, vocabulario propio, sin `authError`). La cadena "Error sync" desaparece del producto.
- **`SyncStatusBanner` se migra** de `COLORS` legacy a tokens de runtime y al vocabulario compartido. Conserva su rol distinto: el chip es ambiente, la barra es interrupcion.
- **El chip global se monta en `AppTopBar`**, el chrome del shell de #81.
- Los textos tranquilizadores vigentes se conservan **literalmente**; se reutilizan desde el hook.

No hay cambios de motor: ni colas, ni clientes HTTP, ni estado de sincronizacion paralelo. El unico estado nuevo es presentacional y derivado.

## Capabilities

### New Capabilities

- `sync-status-presentation`: como la app traduce el estado de sincronizacion y guardado a lenguaje visible: una sola derivacion, siete estados, vocabulario unico, tono no alarmante, accesibilidad por texto y no solo por color, y la prohibicion explicita de derivar estado de sync fuera de esa fuente.

### Modified Capabilities

- `adaptive-app-shell`: el requisito "El chrome del shell reune notificaciones, ayuda y cuenta" pasa a incluir el indicador de sincronizacion como cuarto elemento del chrome, con la misma regla de ocupar espacio propio en el layout. Ademas, el requisito de comportamiento ante falta de conexion deja de decir que la senal global se muestra "como hasta ahora": pasa a exigir que use el vocabulario compartido.

## Impact

**Codigo agregado**
- `src/hooks/useSyncPresentation.ts`.
- `src/components/sync/` (`SyncStatusChip`, `SaveStateLabel`, `PendingBadge`, barrel).
- Pruebas en `src/__tests__/`.

**Codigo modificado (tres archivos, todos capa visual)**
- `src/navigation/AppTopBar.tsx`: monta el chip.
- `src/screens/planeaciones/ListaPlaneacionesScreen.tsx`: elimina `buildSyncState`, consume el chip.
- `src/components/SyncStatusBanner.tsx`: migra a tokens y al vocabulario compartido.

**Sin impacto**
- `src/sync`, `SYNC_ENTITIES`, `syncAllEntities`, colas, almacenamiento, backend, claves `@planearia:*`, proyecto nativo, dependencias, rutas de navegacion.
- `PlaneacionesContext` conserva intacta su maquina de estado paralela preexistente (`:442-446`, `:560-614`, `:827-829`). La UI deja de leerla; su ciclo sigue igual. Su retiro es change posterior.

**Limitacion conocida y declarada**
- `pendingCount` de `SyncContext` es veraz para toda la app: `getTotalPendingCount` (`entitySync.ts:390-396`) recorre `[...Object.keys(SYNC_ENTITIES), "planeaciones"]`. En cambio `status` refleja el ciclo de `syncAllEntities()`, que el ciclo propio de planeaciones no mueve. La asimetria se documenta, no se disimula.

**Dependencias de plan**
- Depende de #82 `componentes-base` (cerrado). Habilita #88 `escritorio-docente`, que exige chip de sync en el encabezado (plan linea 383).

## No objetivos

- No modificar el motor de sync, `src/sync`, `SYNC_ENTITIES`, `syncAllEntities`, colas ni almacenamiento.
- No crear clientes HTTP, colas ni estado de sincronizacion paralelo.
- No retirar la maquina de estado paralela de `PlaneacionesContext`; la UI deja de leerla, su ciclo queda intacto.
- No crear `ConflictSheet`: la familia sync del plan 1.4 lo nombra, pero exige un modelo de resolucion de conflictos que el motor no tiene, y este change no abre el motor.
- No implementar autoguardado ni maquina de guardado por documento: `SaveStateLabel` es presentacional y recibe su estado por props.
- No migrar los editores restantes mas alla del consumidor de referencia.
- No redisenar `ListaPlaneacionesScreen` mas alla de sustituir su derivacion de sync.
- No tocar `Toast.tsx`, `ConfirmDialog.tsx` ni `StatCard.tsx` legacy.
- No modificar `ThemeContext`, `FontSizeContext`, `DaltonismoContext` ni `AccessibilityPreferencesContext`.
- No tocar backend, claves `@planearia:*` ni proyecto nativo.
- No agregar dependencias ni rutas a la raiz de navegacion.
- No editar el Plan Maestro.
