# Cambios: Sincronizacion real, UX offline y bugs de navegacion

> Fecha: 2026-06-12
> Alcance: motor de sincronizacion cross-device, UX de estado de red, endurecimiento backend y correcciones de navegacion web/movil.
> Estado de validacion: 628/628 tests, `npx tsc --noEmit` sin errores, `npm run lint -- --quiet` sin errores, `scripts/testBackendIsolation.mjs` OK.

Este documento registra todos los cambios de la sesion. Sirve como referencia tecnica y como evidencia para el reporte academico.

---

## 1. Problema original

- El estado entre sesiones/dispositivos no se sincronizaba: los datos parecian quedarse solo en el almacenamiento local sin subir a MongoDB Atlas.
- Cada modulo (alumnos, asistencia, calificaciones, recursos, plantillas, entregables, grupos) tenia su propio cliente HTTP ad hoc; varios mandaban solo `X-API-Key` sin el JWT, por lo que el backend no podia aislar por `userId` ni devolver los datos correctos.
- No habia indicador de estado de red ni de sincronizacion. El modo offline no era visible.
- Pantallas abiertas sobre las tabs quedaban sin boton de regresar (la barra de tabs se oculta al hacer push).

---

## 2. Motor de sincronizacion unificado

Se centralizo el push/pull en una sola capa reutilizable por entidad.

### Archivos nuevos

| Archivo | Rol |
| --- | --- |
| `src/sync/services/entitySync.ts` | Registro de entidades sincronizables, push de cola + pull autoritativo, reconciliacion con operaciones pendientes y orquestacion `syncAllEntities`. |
| `src/sync/services/connectivity.ts` | Deteccion de conectividad fiable: web usa `navigator.onLine`, nativo usa NetInfo `isConnected`. La prueba real de conectividad siempre es la peticion misma. |
| `src/sync/services/syncEvents.ts` | Bus de eventos a nivel de modulo. Cuando un pull reescribe el storage local emite `entity-updated` y cada contexto/pantalla se refresca sin recargar. |
| `src/context/SyncContext.tsx` | Orquestador global (ViewModel de la UX de sync). Dispara sync en arranque, login, reconexion, foreground y polling. Expone estado y avisos. |
| `src/utils/generateId.ts` | IDs numericos basados en timestamp para evitar colisiones cross-device (antes `Math.max(ids)+1` chocaba entre dispositivos y sobrescribia documentos en Mongo). |

### Politica del motor (`entitySync.ts`)

- **Push**: las mutaciones encolan en `syncEngine` y se intenta un flush inmediato cuando hay sesion real.
- **Pull**: se descarga la lista autoritativa por entidad. Se conservan los items locales que aun tienen operaciones en cola (el trabajo offline gana hasta subirse) y se respetan los deletes en cola (no se resucitan documentos borrados en otro dispositivo).
- **Tolerancia a fallos**: un pull fallido nunca toca los datos locales. Con Vercel o Mongo caidos la app sigue funcionando desde storage y reintenta en el siguiente ciclo.
- **Sesiones**: `canSyncRemotely()` exige API configurada y token real. Invitado y dev-local trabajan 100% offline sin llamadas remotas.

### Cambios en `syncEngine.ts`

- Candado por entidad (`withQueueLock`) para que `enqueue` y `flush` no compitan sobre la misma clave de AsyncStorage.
- `flushQueue` ya no pre-chequea NetInfo: la peticion es la prueba de conectividad. Un fallo de red conserva la operacion en cola **sin consumir reintentos**; un rechazo del servidor (4xx no recuperable) la manda directo a la cola de fallidas.

### Orquestador (`SyncContext.tsx`)

- Triggers: arranque (cubre recarga de pagina en web), login, reconexion, foreground y polling cada `SYNC_CONFIG.pollInterval` (12 s) mientras la app esta activa.
- Dedupe de ciclos concurrentes (`runningRef` + `syncInFlight` en `syncAllEntities`).
- Estados: `idle | offline | syncing | synced | error`, mas `pendingCount` global y `lastSyncAt`.

### Contextos migrados

`AlumnosContext`, `AsistenciaContext`, `CalificacionesContext`, `EntregablesContext`, `RecursosContext`, `PlantillasContext`, `GruposContext` (via `gruposService`) y `PlaneacionesContext` (como tarea custom del orquestador). Todos:

- Usan `queueEntityOperation` / `syncEntity` en vez de un cliente HTTP propio.
- Envian el documento completo en updates (el backend hace upsert; un patch parcial podia dejar documentos incompletos).
- Se refrescan al recibir `entity-updated`.
- Generan IDs con `generateNumericId()`.

Las pantallas de Classroom (`useClassroomHomeViewModel`, `useClassroomGroupViewModel`) se refrescan ante eventos de sync sin spinner (solo la primera carga muestra spinner).

---

## 3. Endurecimiento del backend

Objetivo: que toda operacion de datos quede aislada por `userId` y que la cola offline sea idempotente.

- **JWT obligatorio** en rutas academicas (`grupos`, `alumnos`, `asistencias`, `calificaciones`, `entregables`, `recursos`, `plantillas`, `sync`, `unidades`): sin token se responde 401. Se elimino el modo "solo API key ve todo" (legacy) en estas rutas.
- **Idempotencia para la cola**: POST de creacion reintentado hace upsert en vez de 409; PUT hace upsert (un update offline puede llegar antes que su create); DELETE de algo ya borrado responde exito. Esto evita que la cola se atore con operaciones imposibles.
- **Ruta nueva `/api/unidades`** (`backend/routes/unidades.js`): CRUD de unidades/secciones de Classroom con aislamiento por `userId`. Registrada en `backend/api/index.js`.
- **Plantillas**: soporte de plantillas del sistema (`esDelSistema`) visibles para todos pero no editables; las del usuario quedan aisladas.
- **`/api/health?db=1`**: ping opcional a MongoDB para diagnosticar disponibilidad del cluster.
- `scripts/testBackendIsolation.mjs` ampliado: cubre `unidades`, rechazo de API-key-sola (401), idempotencia de create/delete.

---

## 4. UX de sincronizacion y modo offline

Archivo nuevo: `src/components/SyncStatusBanner.tsx`.

- **`SyncOfflineBar`**: barra superior persistente. Distingue "Sin conexion" (dispositivo offline) de "Servidor no disponible" (online pero backend/Mongo caidos). Siempre aclara que el trabajo se guarda local y la app sigue usable. Boton de reintento cuando el servidor esta caido.
- **`SyncNoticeToast`**: toast inferior transitorio: "Sincronizacion exitosa", "Conexion restablecida. Sincronizacion exitosa." y avisos de fallo. Auto-descartado.
- Cableado en `App.tsx` dentro de `SafeAreaProvider` + `SyncProvider`.

Escenarios cubiertos (pruebas de resiliencia):

- API de Vercel apagada -> fetch falla -> estado `error` -> barra "Servidor no disponible", datos locales intactos.
- Cluster de MongoDB apagado -> GET responde 500 -> mismo manejo.
- Modo avion -> `navigator.onLine`/NetInfo en falso -> barra "Sin conexion"; al reconectar, toast "Reconectado" + sync inmediato.

---

## 5. Auth resiliente offline

`src/services/auth/authService.ts` + `src/context/AuthContext.tsx`:

- `authFetch` marca `networkError` cuando la peticion nunca llego al backend.
- `refreshSession()` y `verificarTokenDetallado()` distinguen tres estados: token valido, token invalido (re-login) y backend inalcanzable (se conserva la sesion y se reintenta).
- El timer de refresh ya no cierra sesion en modo avion: si la red falla, reintenta; solo un rechazo explicito del servidor fuerza re-login.

---

## 6. Bugs de UI y navegacion (web vs movil)

- **Botones de regresar**: nuevo componente `src/components/ScreenBackButton.tsx` (usa `useNavigation().goBack()`, solo se muestra si hay a donde volver). Agregado a pantallas pushed que quedaban atrapadas: `ListaGruposScreen`, `ListaPlaneacionesScreen`, `DetalleGrupoScreen`, `CrearPlaneacionScreen`.
- **Boton muerto**: en `BibliotecaPlantillasScreen` el enlace "Que son las plantillas?" no hacia nada; ahora abre el Centro de Ayuda.
- **Flujo legacy**: la notificacion de tipo "tarea" abria el menu legacy `GruposScreen`; ahora va al tab vivo de clases (`GruposTab` / ClassroomHome).

---

## 7. Limpieza legacy

- Eliminado `src/screens/alumnos/AlumnosScreen.tsx` (pantalla muerta: no registrada en el stack, sin referencias, usaba `BottomNavBar` legacy).

### Limpieza adicional 2026-06-12

Confirmado 0 referencias entrantes (grep + `tsc`) y eliminado:

| Item eliminado | Accion |
| --- | --- |
| `src/screens/grupos/GruposScreen.tsx` | Borrado. Removidos import, `Stack.Screen name="Grupos"` y la clave `Grupos` de `RootStackParamList` en `StackNavigator.tsx`. El menu de inicio (`useHomeViewModel`) ahora tipa `route?: string` y la opcion "Grupos" sigue redirigiendo a `GruposTab`. |
| `src/screens/grupos/GruposDashboardScreen.tsx` | Borrado con su test `GruposDashboardScreen.test.tsx`. No estaba registrado en navegacion. |
| `src/components/SyncIndicator.tsx`, `src/components/SyncStatusBadge.tsx` | Borrados. Indicadores solo de planeaciones, superados por `SyncStatusBanner`. |
| `src/sync/providers/SyncProvider.tsx` | Borrado (wrapper deprecado) y removido su re-export en `src/sync/index.ts`. El test `SyncProvider.clonarPlaneacion.test.tsx` se migro a `PlaneacionesContext.clonarPlaneacion.test.tsx`, importando `AuthProvider`/`PlaneacionesProvider` directo del contexto. |

Validacion: `npx tsc --noEmit` OK, `npm run lint -- --quiet` OK, `npm test -- --runInBand` OK (88 suites, 606 tests).

### Deuda legacy restante

| Item | Motivo |
| --- | --- |
| `src/hooks/useGruposDashboardViewModel.ts` (+ `src/__tests__/grupos/useGruposDashboardViewModel.test.tsx`) | Quedo huerfano tras borrar `GruposDashboardScreen`; su unico consumidor era esa pantalla. Pendiente confirmar antes de borrar. |

---

## 8. Archivos tocados (resumen)

Frontend nuevo: `src/sync/services/entitySync.ts`, `connectivity.ts`, `syncEvents.ts`, `src/context/SyncContext.tsx`, `src/components/SyncStatusBanner.tsx`, `src/components/ScreenBackButton.tsx`, `src/utils/generateId.ts`.

Frontend modificado: `App.tsx`, `src/sync/services/syncEngine.ts`, `src/sync/config/apiConfig.ts`, 8 contextos, `src/services/gruposService.ts`, `src/services/auth/authService.ts` + `index.ts`, `src/context/AuthContext.tsx`, `src/services/classroom/classroomFacade.ts`, hooks de Classroom y 4 pantallas con back button.

Backend nuevo: `backend/routes/unidades.js`.

Backend modificado: `backend/api/index.js`, rutas `grupos`, `alumnos`, `asistencias`, `calificaciones`, `entregables`, `recursos`, `plantillas`, `sync`, `health`.

Pruebas: `scripts/testBackendIsolation.mjs` y suites de sync/grupos/contexts actualizadas a la nueva semantica.
