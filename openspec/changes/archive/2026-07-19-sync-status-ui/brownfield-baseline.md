# Brownfield baseline: sync-status-ui

Registra solo la superficie que este change toca. No inventaria la app ni sustituye la spec.

## Superficies tocadas

**Se modifican (tres archivos, todos capa visual):**

- `src/navigation/AppTopBar.tsx` — chrome superior del shell (#81).
- `src/screens/planeaciones/ListaPlaneacionesScreen.tsx` — solo su indicador de sync (`buildSyncState`, lineas 18-36 y su uso en el render).
- `src/components/SyncStatusBanner.tsx` — barra global y toast de sync.

**Se agregan:**

- `src/hooks/useSyncPresentation.ts`.
- `src/components/sync/` (`SyncStatusChip`, `SaveStateLabel`, `PendingBadge`, barrel).
- Pruebas en `src/__tests__/`.

**Se adopta como consumidor de referencia:**

- `src/screens/plantillas/EditorPlantillaScreen.tsx` — recibe `SaveStateLabel` alimentado por su `isSaving` existente.

**Se lee sin modificar:**

- `src/context/SyncContext.tsx` — fuente de verdad, via `useSyncStatus()`.

## Fuentes de verdad actuales

- `src/context/SyncContext.tsx:32-56` define `GlobalSyncStatus` y el contrato de nueve campos (`isOnline`, `status`, `lastSyncAt`, `pendingCount`, `syncEnabled`, `authError`, `notice`, `dismissNotice`, `syncNow`). Es y sigue siendo la unica fuente de verdad del estado de sincronizacion.
- `src/context/SyncContext.tsx:104-194` concentra las transiciones y el copy tranquilizador vigente que este change reutiliza literalmente.
- `src/sync/services/entitySync.ts:390-396` (`getTotalPendingCount`) define el alcance del conteo de pendientes: recorre `[...Object.keys(SYNC_ENTITIES), "planeaciones"]`.
- `openspec/specs/adaptive-app-shell/spec.md` es verdad de comportamiento del shell y su chrome.
- `openspec/specs/base-component-library/spec.md` y `src/components/base/` fijan el patron de tokens, accesibilidad y motion heredado de #82.

## Comportamiento vigente

- `useSyncStatus()` tiene **un** consumidor en toda la app: `SyncStatusBanner.tsx`.
- Existen **tres** derivaciones visuales del estado de sincronizacion, con vocabularios distintos:
  - `SyncStatusBanner.tsx:20-63`: barra persistente, `COLORS` estatico legacy, textos tranquilizadores largos, si contempla `authError`.
  - `SyncStatusBanner.tsx:77-102`: toast transitorio, tercer conjunto de textos.
  - `ListaPlaneacionesScreen.tsx:18-36` (`buildSyncState`): 4 hex fijos (`#f59e0b`, `#dc2626`, `#2563eb`, `#16a34a`), copy propio ("Error sync"), **no** contempla `authError`, y se alimenta de `PlaneacionesContext` en vez de `SyncContext`.
- Ninguna derivacion distingue `syncEnabled === false`: un docente invitado ve "Sincronizado" en verde aunque no tenga sincronizacion alguna.
- Ningun componente de sync consume tokens de runtime; ninguno respeta tema, daltonismo ni alto contraste.
- `AppTopBar` presenta tres afordancias (notificaciones, ayuda, cuenta); no muestra estado de sincronizacion.
- No existe maquina de autoguardado por documento: solo booleanos `isSaving` sueltos, con copy real unicamente en `EditorPlantillaScreen.tsx:258,273`.

## Comportamiento objetivo

- Una sola funcion pura, envuelta en `useSyncPresentation()`, traduce el estado a `{ estado, tono, icono, titulo, detalle, etiquetaA11y, accion }`. Las tres superficies y los tres componentes nuevos la consumen; ninguno deriva por su cuenta.
- Siete estados con precedencia explicita: `local` (sincronizacion desactivada), `sin-conexion`, `sesion-expirada`, `sincronizando`, `sin-servidor`, `pendiente`, `sincronizado`. Sin conexion gana sobre sesion expirada; sincronizacion desactivada gana sobre todo.
- Ningun estado de sincronizacion usa el tono de error; el rojo se reserva al fallo de guardado local. La cadena "Error sync" desaparece de `src/`.
- `AppTopBar` presenta cuatro elementos de chrome, incluido el indicador de sincronizacion, con variante compacta en movil.
- `ListaPlaneacionesScreen` deja de derivar estado **y deja de mostrarlo**: el chrome lo lleva de forma global, asi que el indicador de la pantalla repetia la misma frase en la misma vista (decidido durante la QA visual, ver `design.md` D8). Un guardarrail impide que la derivacion local reaparezca.
- `SyncStatusBanner` conserva su rol de interrupcion, migrada a tokens y al vocabulario compartido.
- El estado se entiende por texto, sin depender de color ni icono; `aria-busy` explicito durante la sincronizacion.

## Compatibilidad legacy

- **`PlaneacionesContext` (`:442-446`, `:560-614`, `:827-829`) conserva intacta su maquina de estado de sync paralela**: sus campos `syncStatus`/`isOnline`/`pendingCount`, su suscripcion propia a `subscribeConnectivity` y sus transiciones siguen exactamente igual. Este change solo corta su consumo desde la UI. Su retiro es change posterior, para no tocar el ciclo de sync de planeaciones (no objetivo explicito).
- `src/sync`, `SYNC_ENTITIES`, `syncAllEntities`, colas y almacenamiento quedan sin modificar. Cero clientes HTTP, cero colas, cero estado de sincronizacion nuevo.
- Claves `@planearia:*` no se leen ni escriben distinto; este change no escribe en almacenamiento en absoluto.
- Componentes legacy `Toast.tsx`, `ConfirmDialog.tsx` y `StatCard.tsx` quedan sin tocar. `SyncStatusBanner.tsx` es el unico legacy modificado, y solo en capa visual: mismos disparadores, misma estructura, mismo `syncNow("manual")`.
- Contextos de preferencias (`ThemeContext`, `FontSizeContext`, `DaltonismoContext`, `AccessibilityPreferencesContext`) sin cambios.

**Limitacion conocida declarada.** `pendingCount` es veraz para toda la app, planeaciones incluida. `status`, en cambio, refleja el ciclo de `syncAllEntities()`, que el ciclo propio de `PlaneacionesContext` no dispara. El chip puede decir "Todo sincronizado" durante un ciclo de planeaciones en curso, pero no puede ocultar trabajo pendiente, porque el conteo si lo detecta.

## Owner de spec y contexto

- Spec nueva: `sync-status-presentation` (creada por este change).
- Spec modificada: `adaptive-app-shell` (owner original: #81 `app-shell-navegacion`). Se modifican dos requisitos: el del chrome y el de comportamiento ante falta de conexion.
- Plan maestro: `Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md`, Ola 1, lineas 319-325.
- Issue: #83. Origen: auditoria #76, hallazgo H15.
- Dependencia cerrada: #82 `componentes-base`. Habilita: #88 `escritorio-docente` (plan linea 383).

## Evidencia actual

- Conteos verificados sobre el codigo real el 2026-07-19: 1 consumidor de `useSyncStatus()`; 3 derivaciones visuales; 4 hex hardcodeados en `buildSyncState`; 0 componentes de sync con tokens de runtime; 1 de 3 derivaciones contempla `authError`.
- Linea base de suite heredada de #82: 108 suites / 720 tests en verde.
- `qa/golden-journeys.json`: contrato de QA visual por breakpoint (375/768/1280), nivel N1 y journey GJ0.
- Hallazgos de accesibilidad de #82 que este change hereda como restriccion: RN Web no deriva `aria-busy` ni `aria-checked`; el foco solo se dispara con tabulacion real; el anillo de foco necesita `colors.primary` (4.61:1).

## Fuera de alcance

- Motor de sync, `src/sync`, `SYNC_ENTITIES`, `syncAllEntities`, colas, almacenamiento.
- Retiro de la maquina de estado paralela de `PlaneacionesContext`.
- `ConflictSheet` y resolucion de conflictos: exigen un modelo que el motor no tiene.
- Autoguardado o maquina de guardado por documento.
- Adopcion de `SaveStateLabel` en editores mas alla del consumidor de referencia.
- Rediseno de `ListaPlaneacionesScreen` mas alla de su indicador de sync.
- Backend, claves `@planearia:*`, proyecto nativo, dependencias nuevas, rutas de navegacion nuevas.
- Edicion del Plan Maestro.
