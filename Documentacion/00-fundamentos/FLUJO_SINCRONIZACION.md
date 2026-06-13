# Flujo de Datos y Sincronización - PlanearIA

> **Actualizacion 2026-06:** la sincronizacion se unifico en un motor por entidad
> (`src/sync/services/entitySync.ts`) coordinado por un orquestador global
> (`src/context/SyncContext.tsx`). El push/pull, la conectividad y los avisos de
> UI ahora son transversales a todos los modulos academicos, no solo a
> planeaciones. Ver el detalle completo en
> `Documentacion/02-operacion/CAMBIOS_SYNC_OFFLINE_2026-06.md`.
>
> Puntos clave del nuevo flujo:
> - Cada entidad (grupos, alumnos, asistencias, calificaciones, entregables,
>   recursos, plantillas, unidades, planeaciones) encola sus mutaciones y baja
>   la lista autoritativa desde MongoDB conservando el trabajo offline en cola.
> - La conectividad se evalua con `navigator.onLine` en web y NetInfo en nativo;
>   la peticion misma es la prueba real (NetInfo no es fiable en web).
> - El orquestador sincroniza en arranque, login, reconexion, foreground y
>   polling (12 s) mientras la app esta activa.
> - Un pull fallido nunca toca los datos locales: la app sobrevive a Vercel o
>   MongoDB caidos y a modo avion, reintentando despues.
> - Toda ruta academica del backend exige JWT y es idempotente para la cola.

## Índice

1. [Visión General](#visión-general)
2. [Arquitectura de Sincronización](#arquitectura-de-sincronización)
3. [Flujo de Datos Completo](#flujo-de-datos-completo)
4. [Componentes del Sistema](#componentes-del-sistema)
5. [Casos de Uso](#casos-de-uso)
6. [Manejo de Conflictos](#manejo-de-conflictos)

---

## Visión General

PlanearIA implementa una arquitectura **offline-first** que permite a los docentes trabajar sin conexión a internet, sincronizando automáticamente los datos cuando la conectividad se restablece.

### Principios de Diseño

- **Local First**: Todas las operaciones se ejecutan primero en el almacenamiento local
- **Sincronización Automática**: El sistema detecta cambios de conectividad y sincroniza automáticamente
- **Experiencia Sin Interrupciones**: El usuario nunca espera por operaciones de red
- **Tolerante a Fallos**: Las operaciones fallidas se reintentan automáticamente

---

## Arquitectura de Sincronización

```
┌─────────────────────────────────────────────────────────────────┐
│ APLICACIÓN │
│ (React Native + Expo) │
└─────────────────────────────────────────────────────────────────┘
 │
 ┌───────────┴───────────┐
 │ │
 ▼ ▼
 ┌──────────────────────┐ ┌──────────────────────┐
 │ CAPA DE PRESENTACIÓN │ │ CAPA DE LÓGICA │
 │ │ │ │
 │ - EditorPlaneacion │ │ - PlaneacionesCtx │
 │ - DetalleGrupo │ │ - SyncProvider │
 │ - CrearRecurso │ │ - useSync hook │
 └───────────┬──────────┘ └──────────┬───────────┘
 │ │
 └────────────┬───────────┘
 ▼
 ┌─────────────────────────┐
 │ CAPA DE SERVICIOS │
 │ │
 │ - syncService.ts │
 │ - apiConfig.ts │
 └────────────┬────────────┘
 │
 ┌────────────┴────────────┐
 │ │
 ▼ ▼
 ┌──────────────────────┐ ┌─────────────────────┐
 │ ALMACENAMIENTO LOCAL│ │ BACKEND REMOTO │
 │ │ │ │
 │ AsyncStorage │ │ Vercel Serverless │
 │ - planeaciones │ │ - /api/planeaciones│
 │ - pending_ops │ │ - /api/sync │
 │ - last_sync │ │ - /api/health │
 └──────────────────────┘ └──────────┬──────────┘
 │
 ▼
 ┌─────────────────────┐
 │ MongoDB Atlas │
 │ (M0 Free Tier) │
 │ │
 │ Collection: │
 │ - planeaciones │
 └─────────────────────┘
```

---

## Flujo de Datos Completo

### Escenario 1: Usuario Crea una Nueva Planeación

```
┌─────────────────────────────────────────────────────────────────────────┐
│ PASO 1: INTERACCIÓN DEL USUARIO │
└─────────────────────────────────────────────────────────────────────────┘

Usuario edita/guarda en DocEditorScreen.tsx o pantalla equivalente del modulo
 │
 │ (1) Usuario presiona "Guardar"
 │
 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ const handleGuardar = async () => { │
│ const nuevaPlaneacion: Planeacion = { │
│ id: `planeacion_${Date.now()}`, │
│ asignatura, grado, fecha, ... │
│ }; │
│ await agregarPlaneacion(nuevaPlaneacion); // ← Llama al contexto │
│ } │
└─────────────────────────────────────────────────────────────────────────┘
 │
 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ PASO 2: CONTEXTO GLOBAL (PlaneacionesContext.tsx) │
└─────────────────────────────────────────────────────────────────────────┘

PlaneacionesContext recibe la operación
 │
 │ (2) Actualiza estado local en memoria
 │
 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ const agregarPlaneacion = async (planeacion: Planeacion) => { │
│ setPlaneaciones(prev => [...prev, planeacion]); // Estado React │
│ await saveToStorage([...planeaciones, planeacion]); // ← AsyncStorage │
│ await addPendingOperation('create', planeacion); // ← Cola de sync │
│ } │
└─────────────────────────────────────────────────────────────────────────┘
 │
 ├─────────────────────────┬───────────────────────────┐
 │ │ │
 ▼ ▼ ▼
┌──────────────┐ ┌──────────────────┐ ┌────────────────────────────┐
│ PASO 3A │ │ PASO 3B │ │ PASO 3C │
│ Estado React │ │ AsyncStorage │ │ Cola de Sincronización │
└──────────────┘ └──────────────────┘ └────────────────────────────┘

planeaciones: [ @planearia: @planearia:pending_ops: [
 { id: "123", planeaciones {
 asignatura, [ id: "op_123",
 ... { id: "123", type: "create",
 } ... data: { id: "123", ... },
] } timestamp: "2025-12-16",
 ] retries: 0
 }
 ]

 │
 │ (4) UI se actualiza inmediatamente (optimistic update)
 │
 ▼
Usuario ve la planeación en la lista

┌─────────────────────────────────────────────────────────────────────────┐
│ PASO 4: DETECCIÓN DE CONECTIVIDAD (useSync.ts) │
└─────────────────────────────────────────────────────────────────────────┘

NetInfo detecta cambio de conectividad
 │
 │ (5) wasOffline = false → isOnline = true
 │
 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ useEffect(() => { │
│ if (isOnline && !wasOffline.current) { │
│ // No hace nada, ya estaba online │
│ } else if (isOnline && wasOffline.current) { │
│ setJustReconnected(true); │
│ performSync(); // ← Inicia sincronización │
│ } │
│ }, [isOnline]); │
└─────────────────────────────────────────────────────────────────────────┘
 │
 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ PASO 5: SINCRONIZACIÓN (syncService.ts) │
└─────────────────────────────────────────────────────────────────────────┘

Servicio de sincronización procesa la cola
 │
 │ (6) Lee operaciones pendientes de AsyncStorage
 │
 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ export const fullSync = async (): Promise<SyncResult> => { │
│ const pendingOps = await getPendingOperations(); │
│ const deviceId = await getDeviceId(); │
│ const lastSync = await getLastSyncTime(); │
│ │
│ // (7) Envía POST a /api/sync │
│ const response = await apiRequest('/api/sync', { │
│ method: 'POST', │
│ body: JSON.stringify({ │
│ deviceId, │
│ lastSync, │
│ operations: pendingOps // ← Operaciones pendientes │
│ }) │
│ }); │
│ } │
└─────────────────────────────────────────────────────────────────────────┘
 │
 │ (8) HTTP POST Request
 │
 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ PASO 6: BACKEND SERVERLESS (Vercel) │
│ /api/sync.js │
└─────────────────────────────────────────────────────────────────────────┘

Función serverless recibe la petición
 │
 │ (9) Valida autenticación (X-API-Key header)
 │
 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ module.exports = async (req, res) => { │
│ const { deviceId, lastSync, operations } = req.body; │
│ │
│ // (10) Procesa cada operación (create/update/delete) │
│ for (const op of operations) { │
│ if (op.type === 'create' || op.type === 'update') { │
│ await collection.updateOne( │
│ { id: op.data.id }, │
│ { $set: { ...op.data, syncedAt: new Date() } }, │
│ { upsert: true } │
│ ); │
│ } │
│ } │
│ │
│ // (11) Descarga cambios del servidor │
│ const serverChanges = await collection.find({ │
│ syncedAt: { $gt: lastSync }, │
│ lastDeviceId: { $ne: deviceId } // Excluye propios cambios │
│ }).toArray(); │
│ │
│ return res.json({ │
│ success: true, │
│ uploaded: operations.length, │
│ downloaded: serverChanges, │
│ serverTime: new Date().toISOString() │
│ }); │
│ } │
└─────────────────────────────────────────────────────────────────────────┘
 │
 │ (12) Escribe en MongoDB Atlas
 │
 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ MongoDB Atlas - Collection: planeaciones │
│ │
│ { │
│ id: "planeacion_1734398765432", │
│ asignatura: "Matemáticas", │
│ grado: "3° Secundaria", │
│ fecha: "2025-12-16", │
│ ... │
│ syncedAt: "2025-12-16T15:32:45.678Z", │
│ lastDeviceId: "device_abc123" │
│ } │
└─────────────────────────────────────────────────────────────────────────┘
 │
 │ (13) Respuesta HTTP 200 OK
 │
 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ PASO 7: RESPUESTA AL CLIENTE │
└─────────────────────────────────────────────────────────────────────────┘

syncService.ts recibe la respuesta
 │
 │ (14) Procesa cambios descargados del servidor
 │
 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ const result = await response.json(); │
│ │
│ // (15) Actualiza AsyncStorage con cambios remotos │
│ if (result.downloaded.length > 0) { │
│ const localData = await loadLocalPlaneaciones(); │
│ const merged = mergeServerChanges(localData, result.downloaded); │
│ await saveLocalPlaneaciones(merged); │
│ } │
│ │
│ // (16) Limpia operaciones pendientes exitosas │
│ await clearPendingOperations(); │
│ │
│ // (17) Guarda timestamp de última sincronización │
│ await AsyncStorage.setItem( │
│ '@planearia:last_sync', │
│ result.serverTime │
│ ); │
└─────────────────────────────────────────────────────────────────────────┘
 │
 │ (18) Notifica al contexto
 │
 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ PASO 8: ACTUALIZACIÓN DE UI │
└─────────────────────────────────────────────────────────────────────────┘

SyncProvider escucha el evento justReconnected
 │
 │ (19) Recarga datos desde AsyncStorage
 │
 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ useEffect(() => { │
│ if (justReconnected) { │
│ loadFromStorage(); // ← Recarga todo desde AsyncStorage │
│ } │
│ }, [justReconnected]); │
└─────────────────────────────────────────────────────────────────────────┘
 │
 │ (20) Estado React se actualiza
 │
 ▼
UI muestra indicador "Sincronizado"
```

---

## Componentes del Sistema

### 1. Capa de Presentación

| Componente | Responsabilidad | Archivo |
| --------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **DocEditorScreen** | Editor moderno de planeaciones | [`src/screens/planeaciones/DocEditorScreen.tsx`](../../src/screens/planeaciones/DocEditorScreen.tsx) |
| **ListaPlaneacionesScreen** | Visualización de planeaciones | [`src/screens/planeaciones/ListaPlaneacionesScreen.tsx`](../../src/screens/planeaciones/ListaPlaneacionesScreen.tsx) |
| **SyncIndicator** | Indicador visual de estado de sync | [`src/components/SyncIndicator.tsx`](../../src/components/SyncIndicator.tsx) |

### 2. Capa de Lógica

| Componente | Responsabilidad | Archivo |
| ----------------------- | ----------------------------- | ------------------------------------------------------------------------------- |
| **PlaneacionesContext** | Estado global de planeaciones | [`src/context/PlaneacionesContext.tsx`](../../src/context/PlaneacionesContext.tsx) |
| **SyncProvider** | Contexto de sincronización | [`src/sync/providers/SyncProvider.tsx`](../../src/sync/providers/SyncProvider.tsx) |
| **Sync hooks/context** | Conectividad y sync | Revisar `src/sync/` y contexts del modulo activo. |

### 3. Capa de Servicios

| Componente | Responsabilidad | Archivo |
| --------------- | -------------------------- | ------------------------------------------------------------------------- |
| **syncEngine** | Motor de sincronización | [`src/sync/services/syncEngine.ts`](../../src/sync/services/syncEngine.ts) |
| **apiConfig** | Configuración de endpoints | [`src/sync/config/apiConfig.ts`](../../src/sync/config/apiConfig.ts) |

### 4. Backend

| Endpoint | Método | Responsabilidad | Archivo |
| ------------------- | ------------------- | -------------------- | --------------------------------------------------------------- |
| `/api/health` | GET | Health check | [`backend/api/health.js`](../../backend/api/health.js) |
| `/api/planeaciones` | GET/POST/PUT/DELETE | CRUD individual | [`backend/api/planeaciones.js`](../../backend/api/planeaciones.js) |
| `/api/sync` | POST | Sincronización batch | [`backend/api/sync.js`](../../backend/api/sync.js) |

---

## Casos de Uso

### Caso 1: Usuario Online Crea Planeación

```
Usuario → Formulario → agregarPlaneacion() → AsyncStorage
 → Queue pendiente
 → API Vercel
 → MongoDB
 → UI actualizada
```

**Tiempo estimado**: 200-500ms

### Caso 2: Usuario Offline Crea Planeación

```
Usuario → Formulario → agregarPlaneacion() → AsyncStorage
 → Queue pendiente
 → (Sin red, no envía)
 → UI actualizada (optimistic)
```

**Tiempo estimado**: 50-100ms

Cuando se reconecta:

```
NetInfo detecta conexión → useSync trigger → fullSync()
 → Envía cola pendiente
 → Recibe cambios remotos
 → Actualiza AsyncStorage
 → Refresca UI
```

### Caso 3: Edición con Conflicto

**Escenario**: Dos dispositivos editan la misma planeación offline

```
Dispositivo A (offline):
 - Edita planeación ID "123"
 - Guarda en AsyncStorage
 - timestamp: 15:30:00

Dispositivo B (offline):
 - Edita misma planeación ID "123"
 - Guarda en AsyncStorage
 - timestamp: 15:35:00

Ambos se conectan:
 - Dispositivo A sync → MongoDB (15:30:00)
 - Dispositivo B sync → MongoDB (15:35:00) ← GANA (last-write-wins)

Resultado:
 - MongoDB tiene versión de B
 - Dispositivo A descarga versión de B en próximo sync
```

---

## Manejo de Conflictos

### Estrategia: Last-Write-Wins

PlanearIA utiliza la estrategia **last-write-wins** para resolver conflictos:

1. Cada documento tiene un campo `syncedAt` con timestamp del servidor
2. En caso de conflicto, la última modificación sobrescribe las anteriores
3. El campo `lastDeviceId` identifica qué dispositivo hizo el último cambio

### Ejemplo de Documento en MongoDB

```json
{
 "id": "planeacion_1734398765432",
 "asignatura": "Matemáticas",
 "grado": "3° Secundaria",
 "fecha": "2025-12-16",
 "actividades": [...],
 "syncedAt": "2025-12-16T15:35:42.123Z",
 "lastDeviceId": "device_xyz789",
 "createdAt": "2025-12-15T10:00:00.000Z"
}
```

### Optimizaciones Futuras

Para evitar pérdida de datos en conflictos:

1. **Versionado**: Guardar historial de cambios
2. **Merge inteligente**: Fusionar cambios no conflictivos
3. **Notificación**: Alertar al usuario sobre conflictos detectados
4. **CRDTs**: Conflict-free Replicated Data Types para merge automático

---

## Métricas de Rendimiento

| Operación | Tiempo Promedio |
| -------------------------------- | --------------- |
| Guardar local (AsyncStorage) | 10-50ms |
| Leer local (AsyncStorage) | 5-20ms |
| Sync completo (10 planeaciones) | 300-800ms |
| Sync completo (100 planeaciones) | 2-4 segundos |
| Detección de conectividad | < 100ms |

---

## Seguridad

### Autenticación

Todas las peticiones al backend incluyen:

```javascript
headers: {
 'X-API-Key': 'planearia-dev-secret-2025',
 'Content-Type': 'application/json'
}
```

### CORS

El backend permite peticiones desde cualquier origen (configurado para desarrollo):

```javascript
'Access-Control-Allow-Origin': '*'
```

**Nota**: En producción, restringir a dominios específicos.

---

## Mejoras Futuras

1. **Compresión**: Comprimir datos antes de enviar al servidor
2. **Delta Sync**: Enviar solo campos modificados, no documentos completos
3. **Retry Inteligente**: Backoff exponencial para reintentos
4. **Sync Selectivo**: Permitir al usuario elegir qué sincronizar
5. **Indicadores de Progreso**: Mostrar cuántas operaciones faltan por sincronizar

---

## Referencias

- [AsyncStorage Documentation](https://react-native-async-storage.github.io/async-storage/)
- [NetInfo Documentation](https://github.com/react-native-netinfo/react-native-netinfo)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [MongoDB Atlas](https://www.mongodb.com/docs/atlas/)

---

**Última actualización**: Diciembre 16, 2025
**Versión del proyecto**: 3.0

