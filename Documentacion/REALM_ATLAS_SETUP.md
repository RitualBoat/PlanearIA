# 🚀 Guía de Integración: Realm + MongoDB Atlas

## Resumen de la Arquitectura Implementada

```
┌─────────────────────────────────────────────────────────────────┐
│                    PlanearIA App (Expo)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐    ┌──────────────────┐                   │
│  │ RealmAppProvider │───▶│ PlaneacionesRealm│                   │
│  │ (Autenticación)  │    │    (CRUD Hook)   │                   │
│  └────────┬─────────┘    └────────┬─────────┘                   │
│           │                       │                              │
│           ▼                       ▼                              │
│  ┌───────────────────────────────────────────┐                  │
│  │           Realm SDK Local                  │                  │
│  │    (Base de datos embebida offline)        │                  │
│  └────────────────────┬──────────────────────┘                  │
│                       │                                          │
│           ┌───────────┴───────────┐                              │
│           │  Atlas Device Sync    │                              │
│           │  (Sync Automático)    │                              │
│           └───────────┬───────────┘                              │
└───────────────────────┼──────────────────────────────────────────┘
                        │
                        ▼
           ┌────────────────────────┐
           │   MongoDB Atlas M0     │
           │   (Cloud - GRATUITO)   │
           │   512 MB Storage       │
           └────────────────────────┘
```

---

## 📋 Checklist de Implementación

### Paso 1: MongoDB Atlas (Cloud) ✅

- [ ] Crear cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
- [ ] Crear cluster M0 (gratuito)
- [ ] Configurar Network Access (Allow from Anywhere)
- [ ] Crear usuario de base de datos
- [ ] Crear App Services
- [ ] Habilitar Device Sync con Flexible Sync
- [ ] Habilitar autenticación anónima
- [ ] Copiar el **App ID**

### Paso 2: Configuración Local ✅

- [ ] Instalar dependencias: `npx expo install @realm/react realm`
- [ ] Instalar expo-dev-client: `npx expo install expo-dev-client`
- [ ] Actualizar [atlasConfig.ts](src/realm/config/atlasConfig.ts) con tu App ID
- [ ] Ejecutar `npx expo prebuild` para crear build nativo

### Paso 3: Verificar Integración ✅

- [ ] Cambiar `App.tsx` por `App.realm.tsx`
- [ ] Probar modo offline
- [ ] Verificar sincronización al reconectarse

---

## 📦 Archivos Creados

```
src/realm/
├── index.ts                    # Exportaciones centralizadas
├── config/
│   ├── atlasConfig.ts          # Configuración de Atlas (EDITAR)
│   └── realmConfig.ts          # Configuración de Realm SDK
├── schemas/
│   └── PlaneacionSchema.ts     # Schemas de datos para Realm
├── providers/
│   └── RealmAppProvider.tsx    # Provider principal de Realm
├── hooks/
│   ├── useConnectivity.ts      # Hook de conectividad
│   └── usePlaneacionesRealm.ts # Hook CRUD de planeaciones
└── utils/
    ├── converters.ts           # Conversión de tipos
    └── migration.ts            # Migración desde AsyncStorage
```

---

## 🔧 Configuración Requerida

### 1. Editar `src/realm/config/atlasConfig.ts`

```typescript
// ⚠️ IMPORTANTE: Reemplaza con tu App ID real
export const ATLAS_APP_ID = "planearia-sync-xxxxx"; // ← Tu App ID aquí
```

### 2. Actualizar `App.tsx`

Reemplaza el contenido de `App.tsx` con el de `App.realm.tsx`:

```typescript
import { RealmAppProvider } from "./src/realm";

const App: React.FC = () => {
  return (
    <RealmAppProvider fallback={<LoadingFallback />}>
      <PlaneacionesProvider>
        <NavigationContainer>
          <StackNavigator />
        </NavigationContainer>
      </PlaneacionesProvider>
    </RealmAppProvider>
  );
};
```

---

## 🔄 Cómo Funciona la Sincronización

### Offline-First

1. **Escrituras locales inmediatas**: Todos los cambios se guardan primero en Realm local
2. **Cola de sincronización**: Los cambios se encolan automáticamente
3. **Sincronización en background**: Cuando hay conexión, Device Sync sube los cambios
4. **Resolución de conflictos**: MongoDB Atlas resuelve conflictos automáticamente

### Flujo de Datos

```
Usuario edita → Realm Local → [Cola de Sync] → Atlas (cuando online)
                    ↑                              │
                    └──────────────────────────────┘
                         (Cambios de otros dispositivos)
```

### Reconexión Automática

El hook `useConnectivity` detecta cuando vuelves online y:

1. Notifica al provider
2. Sube cambios pendientes
3. Descarga cambios del servidor

---

## 📱 Migración de Datos Existentes

La migración de AsyncStorage a Realm es automática:

1. Al iniciar la app, se verifica si hay migración pendiente
2. Los datos de `@planearia:planeaciones` se copian a Realm
3. Se crea backup antes de migrar
4. Se marca la migración como completada

Para forzar re-migración (desarrollo):

```typescript
import { resetMigrationStatus } from "./src/realm";
await resetMigrationStatus();
```

---

## 🆓 Límites del Plan Gratuito (M0)

| Recurso     | Límite      |
| ----------- | ----------- |
| Storage     | 512 MB      |
| Connections | 500         |
| Device Sync | ✅ Incluido |
| RAM         | Shared      |
| Backup      | No          |

**Estimación para PlanearIA:**

- ~500 planeaciones completas
- ~5-10 usuarios simultáneos
- Perfecto para desarrollo y uso personal/pequeños equipos

---

## 🛠️ Comandos Útiles

```bash
# Instalar dependencias
npx expo install @realm/react realm expo-dev-client

# Crear build de desarrollo
npx expo prebuild

# Ejecutar en Android
npx expo run:android

# Ejecutar en iOS
npx expo run:ios

# Limpiar cache
npx expo start --clear
```

---

## 🐛 Troubleshooting

### Error: "Realm is not configured"

- Verifica que `ATLAS_APP_ID` esté configurado correctamente

### Error: "Cannot open Realm"

- Asegúrate de tener `expo-dev-client` instalado
- Ejecuta `npx expo prebuild` nuevamente

### Error: "Sync session error"

- Verifica Network Access en Atlas (0.0.0.0/0)
- Revisa que Device Sync esté habilitado

### No sincroniza después de offline

- El hook `useConnectivity` debería detectar reconexión
- Verifica logs en consola
- Usa `forceSync()` para sincronización manual

---

## 🔐 Seguridad (Producción)

Para producción, considera:

1. **Autenticación real**: Cambiar de anónimo a email/password o OAuth
2. **Reglas de acceso**: Configurar permissions en Atlas App Services
3. **Network Access**: Restringir IPs en lugar de 0.0.0.0/0
4. **Encriptación**: Habilitar encriptación de Realm local

---

## 📚 Referencias

- [MongoDB Atlas Docs](https://www.mongodb.com/docs/atlas/)
- [Realm React Native SDK](https://www.mongodb.com/docs/realm/sdk/react-native/)
- [@realm/react](https://www.npmjs.com/package/@realm/react)
- [Atlas Device Sync](https://www.mongodb.com/docs/atlas/app-services/sync/)
