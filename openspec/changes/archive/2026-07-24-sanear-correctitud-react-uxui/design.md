# Design: sanear-correctitud-react-uxui

## Contexto DDD

Este change cruza tres capas sin introducir contratos nuevos entre bounded contexts:

- **Infraestructura de sincronizacion** (`src/context/SyncContext.tsx`): orquestador (ViewModel) del
  ciclo push+pull. Este change corrige su seguridad de render; NO toca `src/sync` (motor, colas,
  storage) ni el contrato de `syncNow`. La capa de presentacion (`sync-status-presentation`) queda
  intacta.
- **Office Docente / Planeaciones** (`src/hooks/useDocEditorViewModel.ts`,
  `src/screens/planeaciones/DocEditorScreen.tsx`): ViewModel del editor y su pantalla. Se corrige la
  maquina de historial (undo/redo/dirty) y el cleanup del guard de navegacion, sin cambiar el
  contrato de guardado ni el modelo `PlaneacionDocumento`.
- **Feed / Contenido** (`src/components/AnimatedTopPill.tsx`, `src/hooks/useContenidoViewModel.ts`,
  `src/screens/feed/RetoResolucionScreen.tsx`): componente compartido, ViewModel de contenido y
  pantalla del reto. Se corrige cleanup de efectos y la pureza del temporizador.

Ninguna correccion altera el comportamiento observable por el docente. La evidencia primaria son
pruebas de comportamiento; no hay delta de UI visible, por lo que no se declara superficie `ui` ni
QA Playwright (ver "Alcance de evidencia").

## Decision 1 - SyncContext: refs latest-value a efecto post-commit

**Problema.** `SyncContext.tsx:83-86` asigna `isOnlineRef/syncEnabledRef/statusRef/authErrorRef`
durante render. Bajo render concurrente React puede descartar o repetir un render; una escritura de
ref durante render puede quedar de un render que nunca commitea, y `syncNow` observaria estado que no
corresponde al commit visible.

**Por que existen los refs.** `syncNow` es un `useCallback` con deps estables
(`[refreshPendingCount, showNotice]`) para no recrearse: si dependiera de `isOnline/syncEnabled/
status/authError`, cada efecto que depende de `syncNow` (interval, foreground, connectivity) se
re-suscribiria en cada cambio de estado, reseteando el timer de polling. Los refs le dan el ultimo
valor sin recrear el callback.

**Decision (aprobada por entrevista 2026-07-24).** Mover las cuatro asignaciones a un unico
`useEffect(() => { ... }, [isOnline, syncEnabled, status, authError])` declarado antes de los efectos
que llaman `syncNow` de forma sincrona dentro del flush (startup y login). Los efectos corren en
orden de declaracion, asi que los refs quedan frescos antes de que cualquier otro efecto del mismo
commit llame a `syncNow`; los llamadores asincronos (interval, foreground, connectivity, manual)
siempre ven el ultimo commit. Se conserva la estabilidad de `syncNow` y no se re-suscribe nada.

**Alternativas descartadas.** (a) Eliminar los refs y depender del estado en `syncNow`: re-suscribe
los efectos y resetea el polling en cada cambio; mayor riesgo al contrato de sync. (b)
`useLayoutEffect`: sincrono antes del paint, sin beneficio aqui (ningun lector de los refs corre en
render o layout) y peor para performance movil.

## Decision 2 - Cleanup de efectos verificable

Los tres efectos marcados ya retornan una funcion de cleanup, pero la regla `effect-needs-cleanup`
no puede garantizarlo estaticamente (rutas de cleanup condicionales/multiples en `AnimatedTopPill`;
patron unsubscribe-function envuelto en arrow en `useContenidoViewModel`/`DocEditorScreen`). Se
refactoriza cada uno a una unica ruta de cleanup que referencie la suscripcion de forma reconocible,
preservando el comportamiento:

- `AnimatedTopPill.tsx:72`: unificar las dos rutas (con y sin `navigation`) en una sola;
  `const unsub = navigation?.addListener("focus", runGlow)` y un unico return que hace `unsub?.()` y
  detiene/limpia la animacion. Comportamiento identico (sin navigation, `unsub` es `undefined` y su
  llamada opcional es no-op).
- `useContenidoViewModel.ts:181`: cleanup del listener NetInfo en forma reconocible, sin cambiar la
  semantica offline.
- `DocEditorScreen.tsx:268`: cleanup del listener `beforeRemove` en forma reconocible, sin cambiar el
  guard de cambios sin guardar (web `beforeunload` y nativo Alert intactos).

Cada refactor se valida re-ejecutando React Doctor sobre el archivo (oraculo empirico): el error debe
desaparecer sin `--fix`. Pruebas de montaje/desmontaje confirman que el cleanup libera la suscripcion.

## Decision 3 - Updaters puros

- `RetoResolucionScreen.tsx:76`: el updater de `setTimeLeft` llama `clearInterval` (efecto lateral).
  Se deja el updater puro (`prev <= 1 ? 0 : prev - 1`) y se limpia el interval en un efecto separado
  que observa `timeLeft === 0`. El cleanup por unmount se conserva. Comportamiento identico: la cuenta
  regresiva se detiene en cero y al desmontar.

- `useDocEditorViewModel.ts:146,264,275`: `updateDoc`, `undo` y `redo` ejecutan setState anidado
  dentro del updater de otro setState (`pushHistory` -> `setPast`/`setFuture`; `setDocumento`;
  `setIsDirty`). Bajo doble invocacion se repiten o corrompen el historial. La maquina de historial
  (present=`documento`, `past`, `future`, `isDirty`) se reemplaza por un `useReducer` con
  transiciones puras y atomicas: `update` (aplica el updater, empuja historial con limite 30, marca
  dirty, sella `fechaModificacion`), `undo`, `redo`, `reset` (hidratacion/boot) y `markSaved`
  (guardado). Un reducer puro es idempotente ante la doble invocacion de React por definicion, que es
  justo la garantia que falta.

  **Por que reducer y no setters secuenciales.** `updateDoc` necesita el `documento` actual para
  computar `next` Y para empujar el previo al historial, y ambos deben transicionar atomicamente sobre
  el MISMO valor. Con setters separados habria que leer el actual desde un ref/closure, reintroduciendo
  un valor potencialmente obsoleto bajo batching (perderia una edicion o duplicaria una entrada de
  historial si dos ediciones ocurrieran en el mismo tick). El reducer preserva la seguridad ante
  batching que el `setDocumento((current) => ...)` original ya daba, sin efectos laterales. El cambio
  se contiene a la maquina de historial; `isLoading/isSaving/draftSavedAt/activeSectionId` siguen como
  `useState` y el autoguardado, el boot y `guardarDocumento` solo cambian su forma de escribir esos
  cuatro valores (dispatch en vez de cuatro setState).

## Alcance de evidencia

- Superficie declarada: `sync` (por `SyncContext`). Evidencia: `test:sync` verde (cubre
  offline/reconnect/cross-device sin regresion), prueba nueva de frescura de estado de `SyncContext`,
  y la constatacion de que no se toca el flujo de datos ni el storage de sync (sin perdida local).
- Los archivos no-sync son correctitud interna sin delta de UI renderizada; su evidencia son pruebas
  de comportamiento (cleanup en unmount, undo/redo, temporizador). No se declara `ui` ni se corre
  Playwright porque no hay cambio visible que capturar; declarar `ui` forzaria evidencia visual vacua.
- Verificacion transversal: React Doctor full 0 errores; typecheck, lint, suite completa (guardia de
  consola activa), `test:sync`, `test:debt-control`, `agent:harness:check`, `openspec:validate`.
