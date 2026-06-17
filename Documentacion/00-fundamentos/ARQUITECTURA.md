# Arquitectura de PlanearIA

## Vision General

PlanearIA es una app React Native/Expo offline-first para docentes. Tecnica y productivamente se mantiene como monolito modular: una sola app, un backend logico simple y dominios separados por carpetas, contratos y planes.

La experiencia objetivo es una suite docente conectada:

- Office Docente para documentos, planeaciones, hojas y listas.
- Asistente IA / ChatGPT Docente para conversar con documentos, recursos, clases y archivos adjuntos.
- Solicitudes IA en segundo plano iniciadas desde sugerencias contextuales, como correcciones de documentos aprobadas por el docente.
- Classroom para organizar clases y asignar trabajo.
- Canva/Genially para crear materiales visuales.
- WhatsApp Docente para colaborar.
- Calendario y reportes para seguimiento.

La arquitectura debe permitir que una accion creada en una experiencia pueda usarse en otra sin duplicar datos ni obligar al docente a copiar/pegar.

## Stack Tecnologico

| Capa | Tecnologia | Estado |
| --- | --- | --- |
| App | React Native 0.81.5 + Expo 54 | Vigente |
| Lenguaje | TypeScript 5.9 | Vigente |
| Navegacion | React Navigation 7 | Vigente |
| Web | `react-native-web` | Vigente |
| Estado | React Context + hooks ViewModel | Vigente |
| Storage local | AsyncStorage | Default productivo |
| Storage opt-in | Expo SQLite | Infraestructura instalada, no default |
| Storage tokens nativo | Expo SecureStore | Instalado para auth en Android/iOS |
| Backend | Node serverless en Vercel | Vigente |
| Base remota | MongoDB Atlas M0 | Vigente |
| IA | `backend/lib/aiGateway.js` OpenAI-compatible + custom providers | Vigente |
| CI/CD | GitHub Actions | CI + builds web/APK |

## Principios Arquitectonicos

1. **MVVM pragmatico**: pantallas delgadas, hooks como ViewModels, Context como modelo compartido y Services para I/O.
2. **Offline-first**: toda escritura academica importante debe guardar local primero y sincronizar despues.
3. **Sync global**: datos academicos sincronizables usan `src/sync`, no colas por modulo.
4. **Aislamiento por usuario**: todo dato multiusuario se filtra por `userId`.
5. **Backend simple**: no microservicios; router unico serverless y rutas por dominio.
6. **IA por backend**: nunca exponer API keys ni llamar modelos desde frontend; proveedores cloud o locales deben pasar por `aiGateway`.
7. **SQLite opt-in**: no activarlo como default sin plan, validacion manual y rollback.
8. **Vision responsive**: una pantalla madre por defecto para web/tablet/movil; variantes `.web.tsx` o `.native.tsx` solo con justificacion real.

## Capas

```text
Screen (View)
  -> hook ViewModel
    -> Context / Service de dominio
      -> storage local + src/sync
        -> apiClient con JWT
          -> backend/api/index.js
            -> backend/routes/*
              -> MongoDB Atlas
```

## Estructura Principal

```text
PlanearIA/
  App.tsx
  src/
    components/
    context/
    hooks/
    navigation/
    screens/
    services/
    sync/
    themes/
    utils/
    __tests__/
  backend/
    api/index.js
    routes/
    lib/
    shared/
  types/
  Documentacion/
  context/
  .github/workflows/
```

## Frontend

### Pantallas

Las pantallas viven en `src/screens/`. Deben encargarse de renderizar y delegar logica a hooks/contextos.

Directorios actuales:

- `auth`
- `classroom`
- `planeaciones`
- `contenido`
- `biblioteca`
- `grupos`
- `alumnos`
- `asistencia`
- `calificaciones`
- `tareas`
- `feed`
- `social`
- `chat`
- `cuenta`
- `perfil`
- `plantillas`
- `notificaciones`
- `onboarding`
- `ayuda`

Estos directorios son inventario tecnico, no la arquitectura UX objetivo. El futuro plan UX/UI puede reorganizar la experiencia sin mover todo el codigo de inmediato.

### ViewModels

Los hooks en `src/hooks/` encapsulan estado derivado, acciones, validaciones y navegacion de una pantalla o flujo.

### Context

Los providers en `src/context/` sostienen estado compartido: auth, sync, dominios academicos, tema, fuente, daltonismo, etc.

### Temas Y Accesibilidad

La app ya tiene:

- `ThemeContext`
- `FontSizeContext`
- `DaltonismoContext`
- `src/themes/colors.ts`

El futuro plan UX/UI debe consolidar tokens, no inventar una paleta paralela en cada modulo.

## Backend

El backend usa `backend/api/index.js` como router unico serverless y delega en `backend/routes/`.

Reglas:

- Cada ruta academica exige JWT real cuando corresponde.
- Cada query multiusuario filtra por `userId`.
- Cada endpoint CRUD crea indices idempotentes.
- CORS se controla con `ALLOWED_ORIGINS` o defaults seguros en `backend/lib/auth.js`.
- Auth vive en `backend/routes/auth.js` y helpers en `backend/lib/`.
- IA vive detras de `backend/lib/aiGateway.js` y `backend/lib/aiUsageLimiter.js`.
- El Asistente IA / ChatGPT Docente futuro debe reutilizar ese gateway.

Endpoints relevantes:

| Dominio | Rutas |
| --- | --- |
| Health | `/api/health` |
| Auth | `/api/auth` |
| Sync/academico | `/api/grupos`, `/api/unidades`, `/api/alumnos`, `/api/asistencias`, `/api/calificaciones`, `/api/entregables`, `/api/recursos`, `/api/plantillas`, `/api/planeaciones`, `/api/sync` |
| Social | posts, contactos, mensajes, notificaciones |
| IA | planeaciones, classroom y futuro chatbot/docente via gateway |

## Auth Y Sesiones

Estado actual:

- JWT access token.
- Refresh token opaco con hash en backend.
- Sesiones activas y revocacion.
- SecureStore en nativo.
- AsyncStorage en web.
- Modo invitado/dev.
- Roles base `dev`, `admin`, `docente`, `alumno`.

Pendientes del plan activo:

- Email real.
- Validacion manual.
- Datos sociales completos.
- Namespacing local final donde aplique.
- Sincronizacion final con GitHub Product OS.

## Sync Offline-First

La fuente tecnica actual esta en `src/sync/README.md` y `Documentacion/00-fundamentos/FLUJO_SINCRONIZACION.md`.

Resumen:

- `syncEngine.ts`: cola por entidad, locks, reintentos y flush.
- `entitySync.ts`: registry `SYNC_ENTITIES`, push, pull y reconciliacion.
- `syncEvents.ts`: eventos para refrescar contextos.
- `SyncContext.tsx`: orquestador global.
- `SyncStatusBanner.tsx`: UX de offline/servidor/auth.

Regla: ningun modulo nuevo con datos academicos sincronizables debe crear su propia cola o cliente HTTP si el motor global cubre el caso.

## Storage

| Uso | Decision |
| --- | --- |
| Preferencias simples, flags, caches pequenos | AsyncStorage |
| Tokens nativos | SecureStore |
| Tokens web | AsyncStorage |
| Datos academicos actuales | AsyncStorage default + sync |
| Datos relacionales/pesados futuros | SQLite opt-in mediante ports/repositories |
| Borrado de claves legacy | Solo con plan, migracion, validacion y rollback |

## IA

Toda IA debe:

- Pasar por backend.
- Tener fallback o error visible.
- Tener limites de costo/uso.
- Pedir revision humana antes de guardar cambios importantes.
- No guardar contenido generado sin confirmacion docente.

### Superficies IA

La vision vigente contempla tres superficies:

- **IA contextual**: sugerencias dentro de Office, Classroom, Canva, WhatsApp, Calendario y Reportes.
- **Solicitudes IA en segundo plano**: acciones aprobadas por el docente desde una sugerencia contextual, por ejemplo pedir correcciones al LLM de PlanearIA y recibir despues una copia corregida, resumen de cambios o borrador comparativo.
- **Asistente IA / ChatGPT Docente**: chat propio para conversar con documentos, hojas, recursos visuales, clases, entregas, reportes y archivos adjuntos.

Toda solicitud en segundo plano debe conservar estado visible o recuperable: pendiente, generando, listo, error o cancelado. No debe sobrescribir contenido original sin confirmacion.

### Proveedores Cloud Y Locales

`aiGateway.js` usa proveedores OpenAI-compatible en cascada y acepta `AI_GATEWAY_PROVIDERS` para proveedores custom.

LM Studio puede conectarse como proveedor local si expone una API compatible con OpenAI, pero con estas restricciones:

- Funciona cuando el backend puede alcanzar la URL local o de red.
- En Vercel, el backend no puede acceder al `localhost` del usuario.
- Para demo hosteada se necesita proveedor cloud o un puente/proxy explicitamente aprobado.
- No se debe exponer LM Studio ni llaves de proveedores desde frontend.

Referencia vigente: `Documentacion/00-fundamentos/IA_CHATBOT_LLM.md`.

## Estado De Planes

- Cerrados: Planeaciones, Classroom, Pasos Iniciales, Infraestructura, SQLite opt-in.
- Activo/en cierre: Auth, Seguridad y Sesion Real.
- Siguiente recomendado: UX/UI y Navegacion Global.

## Convenciones

- Pantallas: `NombreScreen.tsx`.
- Hooks: `useNombre.ts`.
- Contextos: `NombreContext.tsx`.
- Services: I/O y logica compartida.
- Tests: `src/__tests__/`.
- Commits: Conventional Commits cuando aplique.
- Sin secretos reales en commits.

## Version

- Ultima actualizacion: 2026-06-17.
- Version de arquitectura: 4.4.
