# 🚀 Guía de Sincronización: MongoDB Atlas (Sin App Services)

## ✅ Solución Implementada

Esta guía usa **MongoDB Atlas Data API** en lugar de App Services, que es más simple de configurar.

```
┌─────────────────────────────────────────────────────────────────┐
│                    PlanearIA App (Expo)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐    ┌──────────────────┐                   │
│  │   SyncProvider   │───▶│  AsyncStorage    │                   │
│  │  (Offline-First) │    │  (Local DB)      │                   │
│  └────────┬─────────┘    └──────────────────┘                   │
│           │                                                      │
│           ▼                                                      │
│  ┌───────────────────────────────────────────┐                  │
│  │         MongoDB Data API (REST)            │                  │
│  │         Sincronización automática          │                  │
│  └────────────────────┬──────────────────────┘                  │
└───────────────────────┼──────────────────────────────────────────┘
                        │
                        ▼
           ┌────────────────────────┐
           │   MongoDB Atlas M0     │
           │   (GRATUITO)           │
           │   Tu cluster: PlanearIA│
           └────────────────────────┘
```

---

## 📋 PASO 1: Habilitar Data API en Atlas

### 1.1 Acceder a Data API

1. Ve a tu cluster en [MongoDB Atlas](https://cloud.mongodb.com)
2. En el menú lateral izquierdo, busca **"Data API"** (bajo "SERVICES")
3. Si no lo ves, busca en el menú superior o en "More" (...)

### 1.2 Habilitar Data API

1. Click en **"Enable the Data API"**
2. Selecciona tu cluster **"PlanearIA"**
3. Elige la región más cercana
4. Click **"Enable"**

### 1.3 Crear API Key

1. Una vez habilitado, ve a la pestaña **"API Keys"**
2. Click **"Create API Key"**
3. Nombre: `planearia-app-key`
4. Click **"Generate API Key"**
5. **⚠️ IMPORTANTE**: Copia la API Key ahora, no se mostrará de nuevo

### 1.4 Copiar la URL del Endpoint

1. Ve a la pestaña **"Overview"** o **"URL Endpoint"**
2. Copia la URL, se ve así:
   ```
   https://data.mongodb-api.com/app/data-xxxxx/endpoint/data/v1
   ```

---

## 📋 PASO 2: Configurar la App

### 2.1 Editar configuración

Abre el archivo `src/sync/config/mongoConfig.ts` y actualiza:

```typescript
export const DATA_API_CONFIG = {
  // Pega tu URL aquí (sin /action/xxx al final)
  baseUrl: "https://data.mongodb-api.com/app/data-XXXXX/endpoint/data/v1",

  // Pega tu API Key aquí
  apiKey: "TU_API_KEY_AQUI",

  // Nombre de tu cluster
  dataSource: "PlanearIA",
};
```

### 2.2 Actualizar App.tsx

Reemplaza el contenido de `App.tsx` con el de `App.sync.tsx`:

```typescript
import { SyncProvider } from "./src/sync";

const App = () => (
  <SyncProvider>
    <NavigationContainer>
      <StatusBar style="auto" />
      <StackNavigator />
    </NavigationContainer>
  </SyncProvider>
);
```

---

## 📋 PASO 3: Usar el nuevo sistema

### En tus componentes

El hook `usePlaneaciones` ahora tiene campos extra:

```typescript
import { usePlaneaciones } from "../sync";

const MiComponente = () => {
  const {
    // Datos (igual que antes)
    planeaciones,
    agregarPlaneacion,
    actualizarPlaneacion,
    eliminarPlaneacion,

    // NUEVO: Estado de sincronización
    syncStatus,      // 'idle' | 'syncing' | 'synced' | 'error' | 'offline'
    isOnline,        // true/false
    pendingCount,    // número de operaciones pendientes
    lastSync,        // timestamp de última sync
    forceSync,       // función para forzar sync
  } = usePlaneaciones();

  return (
    // ...
  );
};
```

### Componente de estado de sync

```typescript
import SyncStatusBadge from "../components/SyncStatusBadge";

// En tu header o donde quieras mostrar el estado
<SyncStatusBadge />;
```

---

## 🔄 Cómo Funciona la Sincronización

### Flujo Offline-First

1. **Escritura local inmediata**: Cambios se guardan en AsyncStorage
2. **Cola de operaciones**: Se registran para sincronizar después
3. **Sync automático**: Cada 30 segundos si hay conexión
4. **Sync al reconectarse**: Cuando vuelves online, sincroniza automáticamente

### Estados de Sincronización

| Estado    | Significado         |
| --------- | ------------------- |
| `idle`    | Sin actividad       |
| `syncing` | Sincronizando ahora |
| `synced`  | Todo sincronizado   |
| `error`   | Error en sync       |
| `offline` | Sin conexión        |

---

## 🆓 Límites del Plan Gratuito

| Recurso           | Límite     |
| ----------------- | ---------- |
| Storage           | 512 MB     |
| Data API Requests | 10,000/mes |
| Connections       | 500        |

**Nota**: 10,000 requests/mes es suficiente para uso personal/desarrollo.

---

## 🐛 Troubleshooting

### "Data API no configurado"

- Verifica que `DATA_API_CONFIG.apiKey` no sea "TU_API_KEY_AQUI"
- Verifica que `DATA_API_CONFIG.baseUrl` contenga tu App ID real

### Error 401 (Unauthorized)

- La API Key es incorrecta
- Genera una nueva API Key en Atlas

### Error 403 (Forbidden)

- El Data API no está habilitado para tu cluster
- Verifica permisos de la API Key

### No sincroniza

- Revisa la consola para errores
- Usa `forceSync()` para probar manualmente
- Verifica conectividad a internet

---

## 📁 Archivos Creados

```
src/sync/
├── index.ts                    # Exportaciones
├── config/
│   └── mongoConfig.ts          # ⚠️ CONFIGURAR
├── services/
│   └── syncService.ts          # Lógica de sincronización
├── hooks/
│   └── useSync.ts              # Hook de sync
└── providers/
    └── SyncProvider.tsx        # Provider principal

src/components/
└── SyncStatusBadge.tsx         # Indicador visual

App.sync.tsx                    # Nueva versión de App.tsx
```

---

## 🔐 Seguridad (Producción)

Para producción, considera:

1. **Variables de entorno**: No hardcodear la API Key
2. **Rate limiting**: Implementar throttling de requests
3. **Validación**: Validar datos antes de sincronizar
4. **Encriptación**: Considerar encriptar datos sensibles localmente
