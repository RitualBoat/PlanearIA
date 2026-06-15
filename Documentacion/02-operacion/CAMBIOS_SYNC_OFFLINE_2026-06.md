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

---

## 9. Fix: banner "Servidor no disponible" falso por ruta no desplegada (2026-06-13)

Sintoma: con sesion real e internet, el banner naranja "Servidor no disponible. Trabajando con datos locales." aparecia de forma permanente aunque grupos/alumnos/planeaciones si sincronizaban.

Causa: el orquestador sincroniza todas las entidades, incluida la nueva `/api/unidades`. Esa ruta aun no esta desplegada en el backend de Vercel, asi que su GET responde 404 ("Ruta no encontrada"). El codigo marcaba cualquier fallo de entidad como `ok = false` y eso encendia el banner global de servidor caido.

Diagnostico confirmado contra el backend desplegado: `/api/health` 200, `/api/grupos|alumnos|recursos|plantillas` 401 (existen, requieren auth), `/api/unidades` 404 (no desplegada).

Correccion (cliente, sin necesidad de desplegar):

- `EntitySyncOutcome` y `SyncSummary` ganan `unreachable`. Solo un fallo de red o un 5xx marca `unreachable = true`. Un 4xx (404 de ruta no desplegada, 401/403) deja `ok = false` pero `unreachable = false`.
- `SyncContext` enciende el banner de "servidor no disponible" solo cuando `summary.unreachable` es verdadero. Si el backend responde pero una entidad da 4xx, el ciclo se considera `synced` (se registra el detalle en log) y no se alarma al usuario.
- `PlaneacionesContext.runSync` aplica la misma clasificacion.

Resultado: el banner solo aparece cuando el backend esta realmente inalcanzable (Vercel/Mongo caidos o sin red). Una ruta nueva sin desplegar deja de provocar el aviso falso. Al desplegar `backend/routes/unidades.js`, las unidades empiezan a sincronizar sin cambios adicionales en el cliente.

Pendiente del usuario: desplegar el backend para activar `/api/unidades` y el endurecimiento JWT en todas las rutas academicas.

---

## 10. Fix: secreto desalineado, fallo silencioso y dominio propio (2026-06-15)

Sintoma original: nada sincronizaba cross-device. Crear una planeacion o grupos en un dispositivo no aparecia en otro, y la app se comportaba como si solo trabajara con datos locales, sin aviso de error.

Causa raiz (auditoria contra el backend desplegado):

- El `EXPO_PUBLIC_API_SECRET` del frontend no coincidia con el `API_SECRET` del backend. Como `/api/auth` no valida la API key, el login funcionaba y la app parecia autenticada, pero toda ruta academica respondia `401 "Invalid API key"`. El cliente trataba el 401 como transitorio y no mostraba banner: fallo 100% silencioso.
- El deploy del backend habia quedado apuntando a la raiz del repo (build `npm run build:web`), por lo que `backend-eight-chi-54.vercel.app` servia el SPA web y `/api/*` devolvia HTML. Corregido fijando `Root Directory = backend` y build vacio (ver `Documentacion/02-operacion/DEPLOY_DEMO_HOSTEADA.md`, Caso A).

Endurecimiento aplicado (cliente y backend):

- `backend/lib/auth.js` `validateAuth`: ahora autoriza con un JWT valido aunque la `X-API-Key` falte o no coincida. El JWT esta firmado por el backend y ya trae el `userId` para aislamiento, asi que es auth mas fuerte que la API key compartida. Un `EXPO_PUBLIC_API_SECRET` desalineado ya no bloquea en silencio a un usuario con sesion. Tokens forjados se siguen rechazando.
- `src/sync/services/syncEngine.ts`: un 401/403 marca `EngineResult.authError`, conserva la operacion en cola sin consumir reintentos y detiene el ciclo (un token invalido no se arregla a mitad de flush). Antes el 401 se reintentaba en silencio.
- `src/sync/services/entitySync.ts`: `EntitySyncOutcome` y `SyncSummary` ganan `authError`, propagado desde push y pull.
- `src/context/SyncContext.tsx`: expone `authError` y, ante 401/403, muestra un banner de "vuelve a iniciar sesion" en vez de simular modo local. Throttle igual que el banner de servidor caido.
- `src/components/SyncStatusBanner.tsx`: tercer estado visual para `authError` (icono `lock-outline`, mensaje de re-login).
- `src/context/PlaneacionesContext.tsx`: flush inmediato en create/update/delete (igual que `queueEntityOperation` del registry) para que el cambio llegue a otros dispositivos al instante y no espere al ciclo de 12 s; tambien propaga `authError`.

Fix de CORS y dominio propio (`planearai.com`):

- Sintoma: con backend ya sano, el login desde `https://planearai.com` devolvia "No se pudo conectar al servidor. Revisa que la URL del backend y CORS permitan este frontend.".
- Diagnostico: el preflight a `/api/auth` con `Origin: https://planearai.com` devolvia `Access-Control-Allow-Origin: https://planearia.app` (fallback al primer origen permitido). El dominio nuevo no estaba en la lista blanca. El bundle del frontend si apuntaba bien a `https://backend-eight-chi-54.vercel.app`.
- Correccion: se agregaron `https://planearai.com` y `https://www.planearai.com` al default `ALLOWED_ORIGINS` en `backend/lib/auth.js`. Alternativa equivalente: definir la env `ALLOWED_ORIGINS` (lista separada por comas) en el proyecto backend de Vercel. Requiere redeploy del backend.

Validacion: `npx tsc --noEmit` OK, `npm run lint -- --quiet` (focalizado) OK, `npx jest src/__tests__/sync` 23/23 OK (incluye nuevo test de `authError` en 401), `npx jest src/__tests__/{planeaciones,contenido,chat,perfil}` 130/130 OK, smoke de `validateAuth` en Node (JWT solo autoriza, token forjado rechazado).

Pendiente del usuario: tras desplegar el backend con estos cambios, validar cross-device (crear en web -> aparece en APK en ~12 s) y rotar la API key de Resend que quedo expuesta localmente.
