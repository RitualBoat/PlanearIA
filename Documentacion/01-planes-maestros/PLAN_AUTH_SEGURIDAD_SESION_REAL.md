# Plan Maestro: Auth, Seguridad y Sesion Real - PlanearIA

> **Version:** 1.0  
> **Fecha:** 2026-06-11  
> **Estado:** [~] Plan en ejecucion; Fase 2 validada localmente; Review Manual remoto pendiente.
> **Alcance:** endurecer autenticacion, sesion, roles, permisos, recuperacion de cuenta, aislamiento multiusuario y seguridad backend/frontend antes de beta, datos reales o pilotos.  
> **Stack:** React Native 0.81.5 - Expo 54 - TypeScript 5.9 - React Navigation 7 - Context/hooks MVVM - Backend Node/Vercel - MongoDB Atlas Free - AsyncStorage default / SQLite opt-in.  
> **Modulo:** Auth, Cuenta, Seguridad, Sesion, RBAC, secretos, APIs protegidas y aislamiento por usuario.  
> **Estado actual:** existe login, registro, recuperacion, cuenta, roles admin/docente/alumno/usuario/supervisor, JWT manual, PBKDF2, `X-API-Key`, API secret publica de demo y persistencia de token en AsyncStorage. Seguridad real aun no esta cerrada.  
> **Relacion con otros modulos:** afecta Planeaciones, Classroom, Sync, IA, Cuenta, Notificaciones, Social, Chat y cualquier dato academico que deba aislarse por `userId`.

---

## 1. Objetivo

Convertir el auth actual de PlanearIA en una capa de sesion real y mantenible, suficiente para:

- usar cuentas reales en una beta cerrada sin exponer datos entre usuarios;
- separar `Dev/Desarrollador`, `Admin`, `Docente` y `Alumno`;
- mantener modo invitado y demo local sin confundirlo con seguridad real;
- proteger rutas y acciones criticas en frontend como ayuda UX;
- validar permisos en backend como fuente real de autorizacion;
- aislar datos remotos por `userId`, rol y permisos;
- preparar datos locales academicos para multiusuario sin activar SQLite como default;
- documentar costos, secretos, email y rollback.

Este plan no busca lanzar a produccion, comprar servicios ni redisenar toda la app. Busca dejar el cimiento de seguridad listo antes de que mas modulos escriban datos academicos o se pruebe con informacion real.

---

## 2. Analisis del Ground Truth

### 2.1 Nivel de paridad

- **Nivel:** Funcional/administrativo.
- **Razon:** Auth/seguridad no busca clon visual de una experiencia madre. La prioridad es robustez, aislamiento, bajo costo, mantenibilidad y trazabilidad.
- **Ground truth requerido:** auditoria de codigo, flujos de sesion reales, escenarios docentes y evidencia de seguridad. No se requiere carpeta visual tipo `context/<modulo>-ground-truth/` para cerrar pantallas de paridad alta.
- **Recomendacion de evidencia al ejecutar:** crear un baseline tecnico en `context/infraestructura-ground-truth/06-auth-seguridad-sesion/` o `context/auth-seguridad-ground-truth/` con capturas de login/cuenta, matriz de endpoints, variables y pruebas manuales.

### 2.2 Escenarios docentes representativos

| Escenario | Riesgo si no se resuelve | Comportamiento objetivo |
| --- | --- | --- |
| Docente inicia sesion en su laptop y celular | Datos locales/remotos mezclados entre sesiones | Tokens seguros, refresh, sesiones identificadas por dispositivo y `userId` consistente |
| Docente trabaja offline con su ultima sesion | Bloqueo de app o perdida de borradores | Sesion local valida, modo offline claro y refresh al reconectar |
| Docente cambia de cuenta en el mismo dispositivo | Fuga de grupos/alumnos/tareas de otra cuenta | Namespace local por usuario y filtros por `userId` |
| Alumno entra a futuro flujo de entregas | Acceso a vistas de docente/admin | RBAC en backend y gates UX por rol |
| Admin cambia roles | Cualquier usuario podria navegar a ruta admin | Backend valida permisos; frontend solo oculta/guia |
| Desarrollador necesita soporte/demo | Dev local queda como admin productivo | Rol `dev` separado, activable solo por entorno controlado |
| Recuperacion de contrasena | Codigo dev expuesto en respuesta | Email low-cost o modo dev explicito; nunca codigo dev en prod |
| Sync/IA/creacion masiva reciben abuso | Costos, spam o bloqueo de free tiers | Rate limiting por IP/usuario/accion y errores visibles |

### 2.3 Flujo actual vs flujo ideal

| Area | Actual detectado | Ideal del plan |
| --- | --- | --- |
| Persistencia de sesion | `@planearia:auth_token`, `@planearia:auth_user`, `@planearia:is_guest` en AsyncStorage | SecureStore en nativo para tokens; AsyncStorage solo para web/dev fallback y datos no sensibles |
| Login dev | `dev-token-local-testing-only`, usuario local con rol `admin` | Rol `dev` real o modo dev controlado por env, separado de `admin` |
| JWT | Firmado/verificado manualmente con HMAC en `backend/api/auth.js` y `backend/lib/auth.js` | Helper centralizado, tokens con `jti`, `sid`, expiracion corta, refresh y revocacion |
| Refresh token | No existe | Refresh token rotado, hasheado en MongoDB y revocable por sesion/dispositivo |
| Password hash | PBKDF2 propio con salt | Mantener compatibilidad y versionar hashes; migrar a bcrypt/equivalente estandar si se aprueba dependencia |
| Recuperacion | Codigo de 6 digitos almacenado en usuario y `_devCode` en respuesta | Codigo hasheado/TTL, envio email low-cost, `_devCode` solo con flag dev explicito |
| Roles | `admin`, `supervisor`, `docente`, `alumno`, `usuario`; plan pide Dev/Admin/Docente/Alumno | Roles canonicos `dev`, `admin`, `docente`, `alumno`; aliases legacy temporales |
| Permisos | Duplicados frontend/backend, `hasPermission` backend poco usado | Matriz centralizada, validacion por endpoint y tests |
| API secret | `EXPO_PUBLIC_API_SECRET` via `X-API-Key`; no es secreto real en frontend | Queda como guard de demo/backoffice temporal, no como identidad ni autorizacion multiusuario |
| Backend academico | Planeaciones/sync usan `userId`; otros endpoints usan `validateAuth` por API key | Todos los endpoints multiusuario obtienen `userId` del JWT y filtran queries |
| Local academico | AsyncStorage default y SQLite opt-in sin activacion default | Ports/repositories reciben `userId`; SQLite sigue opt-in; no borrar legacy |
| Tests Auth | No hay suite dedicada Auth | Tests de AuthContext, viewmodels, backend auth helpers, rate limit, roles y sync |

### 2.4 Hallazgos clave

- `src/context/AuthContext.tsx` restaura y persiste sesion en AsyncStorage; esto es aceptable para demo, pero no para token real en nativo.
- `src/utils/apiClient.ts` lee directamente `@planearia:auth_token`; debe depender de un servicio de sesion para evitar duplicacion.
- `src/hooks/useLoginViewModel.ts` permite login invitado y dev en `__DEV__`; debe conservarse, pero separando dev de admin productivo.
- `backend/api/auth.js` concentra muchas responsabilidades: hash, token, roles, registro, login, recuperacion, perfil, eliminar cuenta y admin roles.
- `backend/lib/auth.js` y `backend/api/auth.js` tienen logica JWT similar; esto aumenta riesgo de divergencia.
- `backend/api/planeaciones.js` y `backend/api/sync.js` ya apuntan al modelo correcto: token -> `userId` -> query filtrada.
- Endpoints como `grupos`, `alumnos`, `recursos`, `asistencias`, `calificaciones`, `entregables`, `mensajes`, `posts`, `contactos`, `notificaciones` validan `X-API-Key`, pero no siempre filtran por `userId`.
- SQLite ya existe como infraestructura opt-in para Classroom y sync queue, pero el schema inicial no incluye `user_id` en tablas. Si se toca aislamiento local, debe hacerse via ports/repositories y migracion futura, sin activar SQLite como default.

### 2.5 Referencias obligatorias

| Tipo | Ruta | Uso |
| --- | --- | --- |
| Meta guia | `Documentacion/01-planes-maestros/meta_guia_planes.md` | Estructura, fases, GitHub/CI, seguridad low-cost |
| Arquitectura | `Documentacion/00-fundamentos/ARQUITECTURA.md` | Stack, MVVM, Auth/JWT, SecureStore pendiente |
| Sync | `Documentacion/00-fundamentos/FLUJO_SINCRONIZACION.md` | Offline-first, `X-API-Key`, CORS, sync legacy |
| Storage SQLite | `Documentacion/01-planes-maestros/PLAN_STORAGE_LOCAL_SQLITE_MIGRACION_OFFLINE.md` | SQLite opt-in, rollback, no borrar AsyncStorage |
| Entorno local | `Documentacion/02-operacion/ENTORNO_LOCAL.md` | Variables, backend local, demo low-cost |
| Pruebas | `Documentacion/02-operacion/GUIA_PRUEBAS.md` | Validaciones tecnicas y manuales |
| Product OS | `Documentacion/02-operacion/GITHUB_PRODUCT_OS.md` | Issues, labels, milestones, cierre de fases |
| Context | `context/README.md` | Ground truth visual solo si aplica paridad alta |
| Backend README | `backend/README.md` | Vercel, MongoDB, API secret, IA gateway, free tiers |
| Auth frontend | `src/context/AuthContext.tsx` | Estado real de sesion y storage |
| Auth backend | `backend/api/auth.js`, `backend/lib/auth.js` | Estado real de tokens, CORS, usuarios y roles |
| Navegacion | `src/navigation/StackNavigator.tsx`, `src/navigation/AppTabsNavigator.tsx` | Rutas auth/cuenta/admin |
| SQLite opt-in | `src/services/classroom/classroomRepositoryFactory.ts`, `src/services/classroom/sqlite/` | Compatibilidad con repositorios |

### 2.6 Referencias faltantes

- No falta referencia open source visual porque este modulo no es de paridad alta.
- Antes de ejecutar fases de email, elegir proveedor low-cost: SMTP propio, Resend, Brevo, SendGrid free tier u otro proveedor gratuito vigente.
- Antes de instalar dependencias de seguridad, revisar compatibilidad con Vercel serverless y Expo.

---

## 3. Inventario del Codigo Actual

### 3.1 Pantallas

- `src/screens/auth/LoginScreen.tsx`
- `src/screens/auth/RegistroScreen.tsx`
- `src/screens/auth/RecuperarContrasenaScreen.tsx`
- `src/screens/cuenta/CuentaScreen.tsx`
- `src/screens/cuenta/EditarPerfilScreen.tsx`
- `src/screens/cuenta/AdminRolesScreen.tsx`
- `src/screens/cuenta/TerminosScreen.tsx`
- `src/screens/perfil/PerfilScreen.tsx`

### 3.2 Hooks/ViewModels

- `src/hooks/useLoginViewModel.ts`
- `src/hooks/useRegistroViewModel.ts`
- `src/hooks/useRecuperarContrasenaViewModel.ts`
- `src/hooks/useCuentaViewModel.ts`
- `src/hooks/useEditarPerfilViewModel.ts`
- `src/hooks/useAdminRolesViewModel.ts`
- `src/hooks/useAuthGate.ts`

### 3.3 Contextos y providers

- `src/context/AuthContext.tsx`
- `src/context/ThemeContext.tsx`
- `src/context/FontSizeContext.tsx`
- `src/context/DaltonismoContext.tsx`
- Providers de datos academicos que dependen de usuario/sync indirectamente.

### 3.4 Servicios frontend

- `src/utils/apiClient.ts`
- `src/sync/config/apiConfig.ts`
- `src/sync/services/syncEngine.ts`
- `src/sync/services/syncQueueSqliteStorage.ts`
- `src/sync/services/syncQueueSqliteMigration.ts`
- `src/services/classroom/classroomRepository.ts`
- `src/services/classroom/classroomRepositoryFactory.ts`
- `src/services/classroom/classroomStorage.ts`
- `src/services/classroom/sqlite/classroomSqliteStorage.ts`

### 3.5 Tipos

- `types/index.ts`
  - `RolUsuario = "admin" | "supervisor" | "docente" | "alumno" | "usuario"`
  - `PERMISOS`
  - `PERMISOS_POR_ROL`
  - `ConfiguracionSeguridad`
- `types/classroom.ts`
  - `userId?: string`
  - `syncStatus`
  - `fechaCreacion`
  - `fechaModificacion`
- `types/planeacionV2.ts`
  - `userId: string`

### 3.6 Backend

- `backend/api/auth.js`
- `backend/lib/auth.js`
- `backend/api/sync.js`
- `backend/api/planeaciones.js`
- `backend/api/grupos.js`
- `backend/api/alumnos.js`
- `backend/api/recursos.js`
- `backend/api/asistencias.js`
- `backend/api/calificaciones.js`
- `backend/api/entregables.js`
- `backend/api/contactos.js`
- `backend/api/mensajes.js`
- `backend/api/notificaciones.js`
- `backend/api/posts.js`
- `backend/api/classroom/copiloto.js`
- `backend/lib/aiUsageLimiter.js`
- `backend/lib/databaseIndexes.js`

### 3.7 Tests actuales

- No hay suite dedicada para `AuthContext`, login, registro, recuperacion, roles o backend auth.
- Tests relacionados:
  - `src/__tests__/cuenta/useEditarPerfilViewModel.test.tsx`
  - `src/__tests__/cuenta/EditarPerfilScreen.test.tsx`
  - `src/__tests__/perfil/PerfilScreen.test.tsx`
  - `src/__tests__/sync/*`
  - `src/__tests__/classroom/*`
  - `scripts/test-backend-sync.js`

### 3.8 Dependencias actuales

- Frontend: no esta instalado `expo-secure-store`.
- Backend: solo depende de `mongodb`; no hay `bcrypt`, `bcryptjs`, `jose`, `jsonwebtoken`, `helmet` ni libreria de rate limit.
- Esto permite mantener costo bajo, pero exige decidir dependencias con cuidado.

### 3.9 Legacy y deuda

- Token real en AsyncStorage.
- Dev token hardcodeado como admin local.
- `X-API-Key` publico de Expo usado como si fuera secreto.
- Roles `supervisor` y `usuario` no alineados con el contrato futuro `Dev/Admin/Docente/Alumno`.
- `hasPermission` existe en `backend/api/auth.js`, pero no gobierna todos los endpoints.
- `AdminRoles` esta protegido por visibilidad frontend y por backend, pero la ruta existe sin guard de rol.
- Recuperacion devuelve `_devCode` sin flag de entorno explicito.
- Endpoints academicos no filtran de forma uniforme por `userId`.

---

## 4. Decisiones Tecnicas

### 4.1 Arquitectura objetivo

```text
Screen/Auth UI
  -> Auth ViewModel
    -> AuthContext
      -> AuthService
        -> SessionStoragePort
          -> SecureStore native
          -> AsyncStorage web/dev fallback
        -> apiClient
          -> Backend /api/auth
            -> auth middleware
            -> usuarios
            -> auth_sessions
            -> password_reset_codes
            -> auth_audit_log

Modulo academico
  -> ViewModel/Context
    -> Repository con userId
      -> AsyncStorage default o SQLite opt-in
      -> Sync queue con userId
      -> Backend API filtrada por userId
```

### 4.2 Sesion y almacenamiento local

- Instalar y usar `expo-secure-store` para tokens en Android/iOS cuando se apruebe la fase.
- Mantener fallback AsyncStorage para web, tests y demo local, documentado como menos seguro.
- No mover todos los datos a SecureStore; solo tokens/session secrets.
- Mantener preferencias, flags, tema, fuente, daltonismo y caches simples en AsyncStorage.
- No activar SQLite como default para datos academicos.
- No borrar claves legacy `@planearia:auth_token`, `@planearia:auth_user`, `@planearia:is_guest` hasta migracion validada.

### 4.3 Token strategy

- Access token corto: 15 minutos recomendado.
- Refresh token: 7 a 30 dias segun decision de beta.
- Refresh token nunca en texto plano en MongoDB; guardar hash y metadatos.
- Cada sesion debe tener `sessionId`, `deviceId`, `createdAt`, `lastSeenAt`, `expiresAt`, `revokedAt`.
- Access token debe incluir como minimo: `sub/userId`, `role`, `permissionsVersion`, `sessionId`, `iat`, `exp`, `jti`.
- Logout debe revocar refresh token actual y limpiar storage local.
- Logout global debe revocar todas las sesiones del usuario.
- Cambio de password debe revocar sesiones existentes salvo la actual si se decide.

### 4.4 Password hashing

- Mantener compatibilidad con PBKDF2 actual para no romper cuentas de demo.
- Crear `backend/lib/passwords.js` con formato versionado:
  - `pbkdf2:...` para hashes existentes o migrados.
  - `bcrypt:...` si se aprueba `bcryptjs` o `bcrypt`.
- Preferencia low-cost: `bcryptjs` por no requerir build nativo en serverless.
- En login exitoso, si el hash legacy es valido, rehashear al formato nuevo si la dependencia ya esta activa.

### 4.5 RBAC pragmatico

Roles canonicos:

| Rol | Uso | Restricciones |
| --- | --- | --- |
| `dev` | Desarrollo, soporte, pruebas internas | Solo en dev o lista allowlist; no privilegios peligrosos en produccion sin flag |
| `admin` | Administracion de usuarios/configuracion | No equivale a dev; no bypass de seguridad |
| `docente` | Rol principal del producto | Gestiona sus datos academicos |
| `alumno` | Futuro acceso a entregas/retroalimentacion | Solo ve datos propios o asignados |

Aliases legacy temporales:

- `usuario` -> tratar como `docente` o rol limitado durante migracion, decidir en Fase 1.
- `supervisor` -> mantener solo si hay caso real; si no, deprecar y mapear a `admin` limitado o `docente`.

Regla central:

- RBAC frontend solo guia UX.
- RBAC backend es obligatorio para autorizacion real.
- Toda query multiusuario debe filtrar por `userId`, `role` y permisos aplicables.

### 4.6 API secret y secretos

- `EXPO_PUBLIC_API_SECRET` no puede considerarse secreto real porque vive en frontend.
- Mantenerlo temporalmente como guard simple de demo si no bloquea desarrollo.
- La identidad real debe venir de JWT y refresh token.
- `JWT_SECRET`, `REFRESH_TOKEN_SECRET`, `API_SECRET`, `MONGODB_URI`, email keys e IA keys viven solo en backend/env local o proveedor cloud.
- No guardar secretos reales en commits, screenshots ni docs.

### 4.7 Rate limiting

Endpoints criticos:

- `login`
- `registro`
- `recuperar`
- `resetear`
- `refresh`
- `sync`
- IA (`planeaciones`, `classroom/copiloto`)
- creacion masiva/importaciones futuras

Estrategia low-cost:

- Primer paso: rate limit por IP, email, usuario y accion usando MongoDB con TTL indexes.
- Evitar servicios externos de pago.
- Opcional futuro: Upstash/Redis o proveedor equivalente solo si MongoDB TTL no basta.

### 4.8 CORS y headers

- Reemplazar lista fija hardcodeada por `ALLOWED_ORIGINS`.
- Para desarrollo, permitir `localhost`, Expo web y LAN controlada.
- Para demo cloud, permitir solo dominios configurados.
- Agregar headers de seguridad manuales en `backend/lib/httpSecurity.js` o helper equivalente:
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy`
  - `Permissions-Policy`
  - `Content-Security-Policy` si aplica a endpoints web
- `helmet` solo aplica si se introduce Express u otro servidor compatible; no forzarlo en funciones serverless simples.

### 4.9 Email low-cost

- Fase inicial: modo dev explicito con `_devCode` solo si `AUTH_DEV_RECOVERY_CODES=true`.
- Fase beta: elegir proveedor con free tier y HTTPS:
  - Resend, Brevo, SendGrid, SMTP institucional o alternativa vigente.
- Todo email debe tener timeout, errores visibles, no revelar si existe una cuenta y no bloquear reset si el proveedor falla sin mensaje claro.

### 4.10 SQLite y datos academicos

- SQLite ya existe como infraestructura opt-in.
- Este plan no activa SQLite como default.
- Este plan no borra AsyncStorage legacy.
- Cualquier cambio a datos academicos debe pasar por ports/repositories compatibles con SQLite.
- El aislamiento por usuario debe contemplar:
  - `userId` en entidades sincronizables;
  - namespaces o filtros locales por usuario;
  - sync queue con `userId`;
  - snapshots/migraciones futuras;
  - rollback a AsyncStorage.

---

## 5. Modelo de Datos Objetivo

### 5.1 Usuario

```typescript
type PlaneariaRole = "dev" | "admin" | "docente" | "alumno";

interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  apellidos?: string;
  role: PlaneariaRole;
  permissionsVersion: number;
  emailVerifiedAt?: string | null;
  disabledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}
```

Notas:

- Migrar `id` numerico actual a string o mantener compatibilidad via normalizacion. La decision final se toma en Fase 1.
- Evitar exponer `password`, reset codes, refresh hashes o campos internos al frontend.

### 5.2 Sesion remota

```typescript
interface AuthSession {
  id: string;
  userId: string;
  refreshTokenHash: string;
  deviceId: string;
  deviceLabel?: string;
  platform?: "web" | "android" | "ios" | "unknown";
  ipHash?: string;
  userAgentHash?: string;
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
  revokedAt?: string | null;
  revokedReason?: "logout" | "logout_all" | "password_change" | "admin" | "security";
}
```

Indices MongoDB:

- `auth_sessions`: `{ id: 1 } unique`
- `auth_sessions`: `{ userId: 1, revokedAt: 1, expiresAt: -1 }`
- `auth_sessions`: `{ refreshTokenHash: 1 } unique`
- TTL opcional por `expiresAt`.

### 5.3 Password reset

```typescript
interface PasswordResetCode {
  id: string;
  userId: string;
  emailHash: string;
  codeHash: string;
  createdAt: string;
  expiresAt: string;
  usedAt?: string | null;
  attempts: number;
}
```

Indices:

- `{ userId: 1, expiresAt: -1 }`
- TTL por `expiresAt`.
- `{ emailHash: 1, createdAt: -1 }` para rate limit.

### 5.4 Rate limit y auditoria

```typescript
interface AuthRateLimitBucket {
  key: string; // ip/email/user/action
  count: number;
  windowStart: string;
  expiresAt: string;
}

interface AuthAuditLog {
  id: string;
  userId?: string;
  action: string;
  result: "success" | "denied" | "error";
  reason?: string;
  createdAt: string;
}
```

### 5.5 Local session snapshot

```typescript
interface LocalSessionSnapshot {
  userId: string;
  email: string;
  role: PlaneariaRole;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt?: string;
  isGuest: boolean;
  lastVerifiedAt?: string;
}
```

Storage:

- Native SecureStore:
  - `@planearia:secure:access_token`
  - `@planearia:secure:refresh_token`
- AsyncStorage fallback:
  - `@planearia:auth_user`
  - `@planearia:is_guest`
  - claves legacy solo durante migracion
- Datos academicos:
  - AsyncStorage default actual con ports/repositories
  - SQLite opt-in futuro, sin activacion por este plan

---

## 6. UX/UI Objetivo

### 6.1 Principios

- La seguridad no debe sentirse como castigo.
- El docente debe entender si esta en modo invitado, offline, sesion expirada o cuenta real.
- Los errores deben ser claros y no revelar informacion sensible.
- Las acciones peligrosas deben pedir confirmacion y contrasena cuando aplique.
- Admin/dev no debe aparecer como una experiencia principal para docentes.

### 6.2 Login

- Campos: email y contrasena.
- Acciones:
  - iniciar sesion;
  - crear cuenta;
  - recuperar contrasena;
  - entrar como invitado;
  - dev login solo en `__DEV__` y con advertencia.
- Estados:
  - loading;
  - error credenciales;
  - backend no configurado;
  - offline;
  - sesion expirada;
  - cuenta deshabilitada.

### 6.3 Registro

- Validacion frontend y backend alineada.
- Password policy unica.
- Terminos y privacidad visibles.
- Registro debe crear usuario `docente` por default, salvo invitacion o rol asignado.
- No pedir datos innecesarios.

### 6.4 Recuperacion

- Flujo: email -> codigo -> nueva contrasena.
- En prod no mostrar codigo.
- En dev solo mostrar codigo si flag explicito esta activo.
- Reintentos limitados y reenviar con cooldown.

### 6.5 Cuenta y seguridad

La seccion actual de Cuenta debe evolucionar a:

- Perfil.
- Preferencias.
- Seguridad:
  - cambiar contrasena;
  - sesiones iniciadas;
  - cerrar sesion actual;
  - cerrar todas las sesiones;
  - eliminar cuenta.
- Privacidad y terminos.
- Admin:
  - administrar roles solo si backend confirma permiso.

### 6.6 Accesibilidad

- Labels en botones de auth.
- Errores asociados a campos.
- Estados loading anunciables.
- Contraste suficiente.
- No depender solo del color para permisos/roles.

---

## 7. Mapa de Navegacion del Modulo

- Entrada principal no autenticada: `StackNavigator` -> `Login`.
- Entradas secundarias: `Registro`, `RecuperarContrasena`, `Onboarding` -> login/invitado.
- Entrada autenticada: `MainTabs` -> `ConfiguracionTab` -> `CuentaScreen`.
- Crear cuenta: `Login` -> `Registro` -> `MainTabs`.
- Recuperar contrasena: `Login` -> `RecuperarContrasena` -> `Login`.
- Editar perfil: `ConfiguracionTab` -> `EditarPerfil` -> volver a `ConfiguracionTab`.
- Cambiar contrasena: `ConfiguracionTab` -> `RecuperarContrasena` o futuro flujo autenticado -> volver a Cuenta/Login.
- Administrar roles: `ConfiguracionTab` -> `AdminRoles` solo para roles permitidos.
- Sesiones iniciadas: `ConfiguracionTab` -> futura pantalla `SesionesActivas` -> volver a Cuenta.
- Logout: `CuentaScreen` -> limpiar sesion -> reset navigation a `Login`.
- Guest: `Login` -> `MainTabs` local-only -> acciones protegidas usan `useAuthGate`.
- Rutas legacy: no eliminar durante primeras fases; agregar guards antes de ocultar.

Checklist UX/navegacion:

- [ ] Auth tiene entrada clara desde arranque y onboarding.
- [ ] Cuenta tiene salida segura tras logout/eliminar cuenta.
- [ ] AdminRoles no queda accesible sin permiso backend.
- [ ] Modo invitado muestra restricciones sin romper exploracion.
- [ ] Offline no deja spinners infinitos.
- [ ] Web, Android e iOS tienen rutas equivalentes.
- [ ] No se muestran secretos, tokens ni reset codes fuera de modo dev explicito.

---

## 8. IA y Automatizacion

Este plan no crea nuevas funciones IA. Sin embargo, IA queda afectada por seguridad:

- `backend/lib/aiUsageLimiter.js` debe usar identidad real (`userId`, `role`, `sessionId`) cuando exista JWT.
- Dev mode de IA debe depender de rol `dev` o env allowlist, no de admin generico.
- Endpoints IA deben evaluar rate limiting por usuario/accion.
- API keys IA siguen solo en backend.
- Fallbacks heuristicos se mantienen.
- Ningun contenido generado por IA debe guardarse sin revision docente.

---

## 9. Offline-First y Sync

### 9.1 Sesion offline

- Si el usuario ya inicio sesion y el token local no esta expirado, la app puede abrir offline.
- Si el access token expiro pero refresh token sigue vigente, intentar refresh al reconectar.
- Si ambos expiraron, permitir modo local restringido para ver datos cacheados, pero bloquear sync/IA/acciones remotas hasta login.
- Modo invitado sigue local-only.

### 9.2 Datos locales multiusuario

- No mezclar datos academicos de usuarios distintos en el mismo dispositivo.
- Antes de escribir nuevos datos academicos, obtener `userId` desde AuthContext/AuthService.
- Repositories academicos deben aceptar contexto de usuario o filtrar por `userId`.
- Para datos legacy sin `userId`, mantenerlos como legacy local hasta migracion atribuible.
- No borrar AsyncStorage legacy durante este plan.
- SQLite no se activa como default.

### 9.3 Sync queue

- Cada operacion pendiente debe llevar `userId`, `deviceId`, `entity`, `operation`, timestamp y estado.
- Si se usa SQLite opt-in para sync queue, conservar rollback.
- Si se toca `src/sync`, validar `npm run test:sync -- --runInBand`.
- Si se toca Classroom/storage academico, validar `npm run test:classroom -- --runInBand`.

---

## 10. Costos e Infraestructura

### 10.1 Decisiones low-cost

- Mantener backend Node/Vercel y MongoDB Atlas Free.
- No introducir Auth0, Firebase Auth, Clerk, Supabase Auth u otro SaaS de pago como dependencia obligatoria.
- No introducir Redis/Upstash salvo necesidad futura demostrada.
- Usar MongoDB TTL para sesiones, reset codes y rate limits.
- Email con free tier o SMTP gratuito cuando sea necesario para beta.

### 10.2 Dependencias potenciales

| Dependencia | Costo | Riesgo | Decision |
| --- | --- | --- | --- |
| `expo-secure-store` | Gratis | Requiere soporte nativo; web necesita fallback | Recomendada para tokens nativos |
| `bcryptjs` | Gratis | Menos rapido que bcrypt nativo, suficiente para bajo volumen | Recomendada si se migra hash |
| `jose` o `jsonwebtoken` | Gratis | Nueva dependencia backend | Recomendada para reemplazar JWT manual |
| Email provider | Free tier | Limites, verificacion dominio o remitente | Elegir antes de beta |
| MongoDB TTL | Incluido | Serverless concurrencia moderada | Primera opcion para rate limit/sesiones |

### 10.3 Variables de entorno nuevas sugeridas

```text
JWT_SECRET=
REFRESH_TOKEN_SECRET=
AUTH_ACCESS_TOKEN_MINUTES=15
AUTH_REFRESH_TOKEN_DAYS=14
AUTH_DEV_LOGIN_ENABLED=false
AUTH_DEV_RECOVERY_CODES=false
AUTH_DEV_EMAIL_ALLOWLIST=
ALLOWED_ORIGINS=
EMAIL_PROVIDER=
EMAIL_FROM=
EMAIL_API_KEY=
RATE_LIMIT_AUTH_WINDOW_MS=
RATE_LIMIT_AUTH_MAX_ATTEMPTS=
```

---

## 11. Limpieza Legacy

No borrar en la primera fase. Marcar, migrar y retirar solo tras validacion.

Deuda a limpiar:

- `@planearia:auth_token` en AsyncStorage para nativo.
- `dev-token-local-testing-only` como supuesto admin.
- `EXPO_PUBLIC_API_SECRET` usado como secreto fuerte.
- JWT duplicado en `backend/api/auth.js` y `backend/lib/auth.js`.
- Roles `supervisor` y `usuario` sin contrato vigente.
- `hasPermission` no aplicado en endpoints.
- `_devCode` en respuesta de recuperacion sin flag.
- Endpoints academicos sin filtro uniforme por `userId`.
- Password policy distinta entre frontend/backend.
- Textos legales que mencionan seguridad futura como si ya estuviera completa.

---

## 12. Modo de Trabajo Recomendado

- **NORMAL:** Fase 0, decisiones de roles, token strategy, password hashing, email, rate limit, aislamiento multiusuario y UX de cuenta.
- **Mixto:** Fases 1 a 6; primero cerrar contrato, despues implementar cambios mecanicos.
- **CAVEMAN:** tests definidos, migraciones mecanicas, helpers, actualizacion de imports, checkboxes y sincronizacion de GitHub Project.
- **Volver a NORMAL:** al cerrar cada fase para resumir evidencia, riesgos y decisiones pendientes.

No usar modo mecanico cuando haya decisiones de seguridad, costo, rol `dev`, expiracion de tokens o migracion de datos locales.

---

## 13. Fases de Ejecucion

### FASE 0: Auditoria y Baseline de Seguridad

Brief de Seguridad - Fase 0:

- Nivel de paridad: Funcional/administrativo.
- Referencias obligatorias:
  - `src/context/AuthContext.tsx`
  - `src/utils/apiClient.ts`
  - `backend/api/auth.js`
  - `backend/lib/auth.js`
  - `backend/api/*.js`
  - `src/navigation/StackNavigator.tsx`
  - `Documentacion/02-operacion/ENTORNO_LOCAL.md`
- Validacion manual:
  - login, registro, invitado, dev login, recuperar contrasena, cuenta, admin roles.
- Flujos prohibidos:
  - considerar `X-API-Key` publico como identidad real;
  - cerrar fase sin matriz de endpoints y riesgos.

GitHub/CI - Fase 0:

- Epic: `#26` - `Plan Maestro: Auth, Seguridad y Sesion Real`.
- Issue/Project item: `#27` - `Auth Seguridad Fase 0 - Auditoria y baseline de seguridad`.
- Milestone: `Ciclo 4 - Auth y Seguridad` (`#7`).
- Labels: `plan-maestro`, `fase`, `infra`, `testing`, `low-cost`.
- Estado al iniciar: `In progress`.
- Estado al cerrar: `Review Manual` si incluye validacion manual; si solo auditoria documental, `Done`.
- Scripts obligatorios:
  - `npm run typecheck`
  - `npm run lint -- --quiet`
  - `npm test -- --runInBand` o tests focalizados justificados
  - `npm run backend:check`
  - `git diff --check`
- GitHub Actions: revisar si hay rama/PR.
- Evidencia Fase 0: `context/infraestructura-ground-truth/06-auth-seguridad-sesion/auth-fase-0-auditoria-baseline-2026-06-12.md`.

- [x] **0.1 Inventariar flujos Auth reales**
  - Login, registro, invitado, dev, recuperar, resetear, perfil, preferencias, eliminar cuenta, admin roles.
- [x] **0.2 Crear matriz de endpoints y nivel de proteccion**
  - Clasificar cada `backend/api/*.js` por API key, JWT, `userId`, rol, permisos y rate limit.
- [x] **0.3 Crear baseline de storage local**
  - Registrar claves Auth y claves academicas que no deben borrarse.
- [x] **0.4 Crear baseline de rutas**
  - Confirmar rutas accesibles sin rol y definir guards necesarios.
- [x] **0.5 Registrar riesgos**
  - Token en AsyncStorage, dev token, reset code, roles legacy, endpoints sin `userId`.
- **Avance 2026-06-12:** inventario documental de Fase 0 completado, validado y cerrado en GitHub Product OS; issue `#27` cerrado y Project item en `Done`.

### FASE 1: Modelo de Roles, Permisos y Contrato de Sesion

GitHub/CI - Fase 1:

- Issue/Project item: `#28` - `Auth Seguridad Fase 1 - Modelo de roles permisos y contrato de sesion`.
- Milestone: `Ciclo 4 - Auth y Seguridad` (`#7`).
- Labels: `fase`, `infra`, `docs`, `testing`.
- Estado al iniciar: `In progress`.
- Estado al cerrar: `Review Manual` si cambia contrato de producto; `Done` si solo tipos/tests.
- Scripts obligatorios:
  - `npm run typecheck`
  - `npm run lint -- --quiet`
  - tests de tipos/helpers Auth cuando existan
  - `git diff --check`
- Evidencia Fase 1: `context/infraestructura-ground-truth/06-auth-seguridad-sesion/auth-fase-1-roles-permisos-contrato-2026-06-12.md`.

- [x] **1.1 Definir roles canonicos**
  - `dev`, `admin`, `docente`, `alumno`.
- [x] **1.2 Definir aliases legacy**
  - Decidir migracion de `supervisor` y `usuario`.
- [x] **1.3 Crear tipos compartidos de auth**
  - `AuthUser`, `AuthSession`, `AuthTokens`, `PlaneariaRole`, `Permission`.
- [x] **1.4 Unificar permisos frontend/backend**
  - Evitar tablas divergentes en `types/index.ts` y backend.
- [x] **1.5 Definir contrato de token**
  - Claims, expiracion, `sessionId`, `jti`, `permissionsVersion`.
- [x] **1.6 Definir contrato de guest/dev**
  - Guest local-only; Dev separado de Admin.
- **Avance 2026-06-12:** contrato compartido implementado en `shared/authContract.json`, adaptadores frontend/backend creados, prueba focalizada Auth agregada y validacion local completa; issue `#28` pasa a `Review Manual` por cambio de contrato de producto.

### FASE 2: Backend Auth Real y Hardening Inicial

GitHub/CI - Fase 2:

- Issue/Project item: `#29` - `Auth Seguridad Fase 2 - Backend auth real y hardening inicial`.
- Milestone: `Ciclo 4 - Auth y Seguridad` (`#7`).
- Labels: `fase`, `infra`, `testing`, `low-cost`.
- Estado al iniciar: `In progress`.
- Estado al cerrar: `Review Manual` si cambia login real o variables; `Done` tras tests.
- Scripts obligatorios:
  - `npm run backend:check`
  - tests backend/helpers Auth
  - `npm run typecheck`
  - `npm run lint -- --quiet`
  - `git diff --check`
- Evidencia Fase 2: `context/infraestructura-ground-truth/06-auth-seguridad-sesion/auth-fase-2-backend-hardening-2026-06-12.md`.

- [x] **2.1 Extraer helpers backend**
  - Crear helpers para tokens, passwords, roles/permisos, rate limit y respuestas.
- [x] **2.2 Implementar access + refresh token**
  - `auth_sessions`, refresh hash, rotacion y revocacion.
- [x] **2.3 Versionar password hashing**
  - Mantener PBKDF2 legacy y preparar bcrypt/equivalente si se aprueba.
- [x] **2.4 Endurecer registro/login**
  - Password policy alineada, errores seguros, `ultimoAcceso`, auditoria minima.
- [x] **2.5 Endurecer recuperar/resetear**
  - Codigos hasheados, TTL, intentos, `_devCode` solo con flag.
- [x] **2.6 Implementar rate limit low-cost**
  - Login/registro/recuperacion/reset/refresh.
- [x] **2.7 Endurecer CORS y headers**
  - `ALLOWED_ORIGINS`, headers de seguridad, preflight consistente.
- [x] **2.8 Tests backend**
  - Login exitoso/fallido, refresh, revocacion, reset, roles, rate limit.
- **Avance 2026-06-12:** backend auth endurecido con helpers, sesiones refresh, reset codes hasheados, rate limit, headers y tests focalizados; issue `#29` listo para `Review Manual`, con sincronizacion remota pendiente por limite de uso del entorno.

### FASE 3: Frontend AuthContext, Storage Seguro y Session Service

Brief de Flujo - Fase 3:

- Nivel de paridad: Funcional/administrativo.
- Pantallas/flujo afectado:
  - `Login`, `Registro`, `RecuperarContrasena`, `Cuenta`.
- Validacion UX:
  - iniciar/cerrar sesion, restaurar sesion, expirar token, offline y guest.
- Flujos prohibidos:
  - escribir tokens nativos nuevos directo a AsyncStorage;
  - duplicar fetch auth fuera del servicio.

GitHub/CI - Fase 3:

- Issue/Project item: crear al iniciar fase.
- Milestone sugerido: `Ciclo 4 - Auth y Seguridad`.
- Labels: `fase`, `ux-ui`, `infra`, `testing`.
- Estado al iniciar: `In Progress`.
- Estado al cerrar: `Review Manual` por tocar auth UX.
- Scripts obligatorios:
  - `npm run typecheck`
  - `npm run lint -- --quiet`
  - tests de `AuthContext`, login/registro/recuperacion
  - `git diff --check`

- [ ] **3.1 Crear `SessionStoragePort`**
  - SecureStore native, AsyncStorage web/dev fallback.
- [ ] **3.2 Crear `authService`**
  - Login, registro, refresh, logout, revoke, verify, reset.
- [ ] **3.3 Refactorizar `AuthContext`**
  - Restauracion, refresh automatico, expiracion, guest/dev, errores.
- [ ] **3.4 Refactorizar `apiClient`**
  - Leer token desde Auth/session service o inyector controlado.
- [ ] **3.5 Migrar claves legacy de sesion**
  - Leer legacy, escribir nuevo storage, no borrar hasta validacion.
- [ ] **3.6 Tests frontend**
  - Storage fallback, logout, expired token, guest, dev, refresh error.

### FASE 4: Proteccion de Rutas, Cuenta y RBAC UX

Brief de Flujo - Fase 4:

- Nivel de paridad: Funcional/administrativo.
- Pantallas/flujo afectado:
  - `StackNavigator`, `CuentaScreen`, `AdminRolesScreen`, futura `SesionesActivas`.
- Validacion UX:
  - Admin ve admin; docente no; invitado no; deep link no brinca guards.
- Flujos prohibidos:
  - confiar en ocultar botones como seguridad real.

GitHub/CI - Fase 4:

- Issue/Project item: crear al iniciar fase.
- Milestone sugerido: `Ciclo 4 - Auth y Seguridad`.
- Labels: `fase`, `ux-ui`, `testing`.
- Estado al iniciar: `In Progress`.
- Estado al cerrar: `Review Manual`.
- Scripts obligatorios:
  - `npm run typecheck`
  - `npm run lint -- --quiet`
  - tests de navegacion/gates si existen
  - `git diff --check`

- [ ] **4.1 Crear helpers `RoleGate`/`usePermission`**
  - Frontend UX solamente.
- [ ] **4.2 Proteger rutas sensibles**
  - `AdminRoles`, editar perfil, sesiones, eliminar cuenta.
- [ ] **4.3 Mejorar Cuenta**
  - Seguridad, sesiones iniciadas, cerrar todas, estado de cuenta.
- [ ] **4.4 Mantener guest mode claro**
  - Local-only, acciones protegidas con `useAuthGate`.
- [ ] **4.5 Validar deep links**
  - No abrir rutas admin sin permiso.
- [ ] **4.6 Tests y validacion manual**
  - Web/movil, guest/docente/admin/dev.

### FASE 5: Aislamiento Multiusuario en Backend, Sync y Repositories

GitHub/CI - Fase 5:

- Issue/Project item: crear al iniciar fase.
- Milestone sugerido: `Ciclo 4 - Auth y Seguridad`.
- Labels: `fase`, `offline-first`, `infra`, `testing`.
- Estado al iniciar: `In Progress`.
- Estado al cerrar: `Review Manual` si toca datos academicos; `Done` tras validacion tecnica/manual.
- Scripts obligatorios:
  - `npm run typecheck`
  - `npm run lint -- --quiet`
  - `npm run test:sync -- --runInBand`
  - `npm run test:classroom -- --runInBand` si toca Classroom/storage
  - `npm run backend:check`
  - `git diff --check`

- [ ] **5.1 Endurecer endpoints academicos**
  - `grupos`, `alumnos`, `recursos`, `asistencias`, `calificaciones`, `entregables`, `mensajes`, `posts`, `contactos`, `notificaciones`.
- [ ] **5.2 Agregar filtros `userId` en MongoDB**
  - Queries, upserts, deletes e indices `{ userId, id }`.
- [ ] **5.3 Definir estrategia para datos legacy sin `userId`**
  - No borrar; no sync remoto hasta atribucion.
- [ ] **5.4 Pasar `userId` a repositorios locales nuevos**
  - Ports/repositories compatibles con SQLite.
- [ ] **5.5 Actualizar sync queue**
  - Operaciones con `userId`, `sessionId` o `deviceId`.
- [ ] **5.6 Mantener SQLite opt-in**
  - No cambiar factory default, no borrar AsyncStorage legacy.
- [ ] **5.7 Tests de aislamiento**
  - Usuario A no lee ni modifica datos de Usuario B.

### FASE 6: Email, Recuperacion, Privacidad y Ciclo de Cuenta

Brief de Flujo - Fase 6:

- Nivel de paridad: Funcional/administrativo.
- Pantallas/flujo afectado:
  - `RecuperarContrasena`, `CuentaScreen`, `TerminosScreen`.
- Validacion UX:
  - reset seguro, eliminar cuenta, privacidad clara.
- Flujos prohibidos:
  - enviar reset code en respuesta prod;
  - borrar datos sin confirmacion ni registro.

GitHub/CI - Fase 6:

- Issue/Project item: crear al iniciar fase.
- Milestone sugerido: `Ciclo 4 - Auth y Seguridad`.
- Labels: `fase`, `ux-ui`, `infra`, `docs`, `low-cost`.
- Estado al iniciar: `In Progress`.
- Estado al cerrar: `Review Manual`.
- Scripts obligatorios:
  - `npm run typecheck`
  - `npm run lint -- --quiet`
  - tests de recovery/cuenta
  - `npm run backend:check`
  - `git diff --check`

- [ ] **6.1 Elegir proveedor email low-cost**
  - Documentar costo, free tier, limites y variables.
- [ ] **6.2 Implementar envio real**
  - Timeout, errores visibles, no revelar existencia de correo.
- [ ] **6.3 Implementar pantalla/flujo de sesiones**
  - Listar, revocar actual/todas/una especifica.
- [ ] **6.4 Endurecer eliminar cuenta**
  - Password, auditoria, borrado por `userId`, rollback documental.
- [ ] **6.5 Actualizar terminos/privacidad**
  - Sesion, datos locales, IA, storage, eliminacion y email.

### FASE 7: Validacion Tecnica, Manual y Seguridad Basica

GitHub/CI - Fase 7:

- Issue/Project item: crear al iniciar fase.
- Milestone sugerido: `Ciclo 4 - Auth y Seguridad`.
- Labels: `fase`, `testing`, `infra`.
- Estado al iniciar: `In Progress`.
- Estado al cerrar: `Review Manual`.
- Scripts obligatorios:
  - `npm run typecheck`
  - `npm run lint -- --quiet`
  - `npm test -- --runInBand`
  - `npm run backend:check`
  - `npm run test:sync -- --runInBand`
  - `npm run test:classroom -- --runInBand` si Fase 5 toco Classroom/storage
  - `git diff --check`

- [ ] **7.1 Ejecutar bateria automatica**
  - Typecheck, lint, tests completos, backend smoke.
- [ ] **7.2 Ejecutar matriz manual Auth**
  - Registro, login, logout, refresh, offline, guest, dev, reset, admin roles.
- [ ] **7.3 Ejecutar matriz multiusuario**
  - Usuario A/B en backend y storage local.
- [ ] **7.4 Validar errores y estados**
  - Backend apagado, API no configurada, token expirado, refresh fallido.
- [ ] **7.5 Crear checklist de validacion**
  - Guardar en `Documentacion/03-validacion/` si se ejecuta fase.

### FASE 8: Limpieza Legacy Controlada y Documentacion

GitHub/CI - Fase 8:

- Issue/Project item: crear al iniciar fase.
- Milestone sugerido: `Ciclo 4 - Auth y Seguridad`.
- Labels: `fase`, `legacy`, `docs`, `testing`.
- Estado al iniciar: `In Progress`.
- Estado al cerrar: `Review Manual` si quedan validaciones manuales; `Done` tras cierre.
- Scripts obligatorios:
  - `npm run typecheck`
  - `npm run lint -- --quiet`
  - `npm test -- --runInBand`
  - `npm run backend:check`
  - `git diff --check`

- [ ] **8.1 Retirar duplicaciones Auth**
  - JWT/password/roles en helpers centralizados.
- [ ] **8.2 Deprecar claves legacy de sesion**
  - Solo despues de migracion y validacion; no borrar datos academicos.
- [ ] **8.3 Documentar variables**
  - `.env.example`, `backend/.env.example`, `ENTORNO_LOCAL.md`.
- [ ] **8.4 Actualizar README/roadmap**
  - Estado del plan, comandos, criterios.
- [ ] **8.5 Registrar cierre**
  - Evidencia, riesgos residuales, siguiente plan recomendado.

### FASE FINAL: Cierre del Plan

GitHub/CI - Fase Final:

- Issue/Project item: epic del plan y fase final.
- Milestone sugerido: `Ciclo 4 - Auth y Seguridad`.
- Labels: `epic`, `plan-maestro`, `testing`, `docs`.
- Estado al iniciar: `Review Manual`.
- Estado al cerrar: `Done` solo con evidencia automatica y validacion manual aceptada.
- Scripts obligatorios:
  - `npm run check`
  - `npm run backend:check`
  - tests focalizados Auth/Sync/Classroom si aplican
  - `git diff --check`

- [ ] **F.1 Confirmar criterio de cierre**
- [ ] **F.2 Actualizar GitHub Product OS**
- [ ] **F.3 Actualizar documentacion vigente**
- [ ] **F.4 Definir siguiente plan recomendado**

---

## 14. Validacion Obligatoria

### 14.1 Automatizada

Minimo por fase:

```bash
npm run typecheck
npm run lint -- --quiet
git diff --check
```

Cuando se toque backend:

```bash
npm run backend:check
```

Cuando se toque Auth frontend/backend:

```bash
npm test -- --runInBand
```

Cuando se toque sync:

```bash
npm run test:sync -- --runInBand
```

Cuando se toque Classroom/storage academico:

```bash
npm run test:classroom -- --runInBand
```

### 14.2 Manual

- Crear cuenta docente.
- Iniciar sesion.
- Cerrar sesion.
- Restaurar sesion tras reiniciar app.
- Entrar como invitado y bloquear accion protegida.
- Dev login solo en desarrollo.
- Recuperar contrasena en modo dev controlado.
- Cambiar contrasena.
- Ver/revocar sesiones si la fase lo implementa.
- Admin lista usuarios y cambia rol.
- Docente no accede a `AdminRoles`.
- Usuario A no ve datos de Usuario B.
- Offline abre ultima sesion valida o muestra estado restringido.
- Backend apagado no rompe la app.
- Web y movil no muestran tokens/secrets.

### 14.3 Seguridad basica

- No hay secrets reales en diff.
- No hay `_devCode` en prod.
- No hay tokens en logs.
- CORS usa origen configurado.
- Rate limit responde con error claro.
- JWT expirado no permite operaciones remotas.
- Refresh revocado no renueva sesion.
- Delete account filtra por `userId`.

---

## 15. Resumen de Archivos Probables

### Nuevos

- `src/services/auth/authService.ts`
- `src/services/auth/sessionStorage.ts`
- `src/services/auth/authTypes.ts`
- `src/components/auth/RoleGate.tsx`
- `backend/lib/tokens.js`
- `backend/lib/passwords.js`
- `backend/lib/roles.js`
- `backend/lib/rateLimit.js`
- `backend/lib/httpSecurity.js`
- tests auth frontend/backend
- checklist en `Documentacion/03-validacion/` cuando se ejecute

### Modificados

- `src/context/AuthContext.tsx`
- `src/utils/apiClient.ts`
- `src/hooks/useLoginViewModel.ts`
- `src/hooks/useRegistroViewModel.ts`
- `src/hooks/useRecuperarContrasenaViewModel.ts`
- `src/hooks/useAdminRolesViewModel.ts`
- `src/hooks/useCuentaViewModel.ts`
- `src/screens/auth/*`
- `src/screens/cuenta/*`
- `src/navigation/StackNavigator.tsx`
- `types/index.ts`
- `backend/api/auth.js`
- `backend/lib/auth.js`
- `backend/api/*.js`
- `src/sync/services/*` si se toca sync
- `src/services/classroom/*` si se toca aislamiento local academico
- `.env.example`
- `backend/.env.example`
- docs de operacion

---

## 16. Open Questions

Estas preguntas no bloquean la creacion del plan, pero deben resolverse antes o durante las fases indicadas:

- Proveedor email para beta: SMTP institucional, Resend, Brevo, SendGrid u otro free tier.
- Duracion exacta de refresh token: 7, 14 o 30 dias.
- Politica de `dev` en produccion: prohibido por default o allowlist explicita.
- Migracion de `supervisor` y `usuario`: alias temporal, rol limitado o eliminacion.
- `id` de usuario: mantener numero por compatibilidad o migrar a string/UUID.
- Alcance de alumno: solo futuro o preparar permisos ahora.
- Politica de datos legacy locales sin `userId`: atribuir al primer usuario real, mantener local-only o pedir confirmacion manual.

---

## 17. Criterio de Cierre

El plan puede cerrarse solo cuando:

- login, registro, logout, refresh y recuperacion funcionan con errores claros;
- tokens nativos ya no dependen de AsyncStorage salvo fallback web/dev;
- dev esta separado de admin;
- roles canonicos estan definidos y probados;
- backend valida permisos reales y no solo UI;
- endpoints academicos multiusuario filtran por `userId`;
- sync queue y datos academicos nuevos contemplan `userId`;
- SQLite sigue opt-in y AsyncStorage legacy no fue borrado sin aprobacion;
- rate limiting existe para auth critico;
- CORS/headers/secrets estan documentados;
- hay tests automatizados proporcionales;
- hay validacion manual de login, cuenta, roles, offline y multiusuario;
- GitHub Product OS y markdown estan sincronizados.

Criterio en lenguaje de usuario:

> Un docente puede crear una cuenta, entrar, cerrar sesion, recuperar contrasena y trabajar offline sin mezclar datos con otra cuenta; un admin puede gestionar roles sin convertirse en desarrollador; y la app no trata secretos publicos ni botones ocultos como seguridad real.

---

## 18. No Objetivos de Este Plan

- No activar SQLite como default.
- No borrar AsyncStorage legacy.
- No migrar todos los datos academicos a SQLite.
- No redisenar UX/UI global de toda la app.
- No implementar SSO empresarial.
- No comprar servicios de seguridad empresariales.
- No crear deploy permanente nuevo sin decision explicita.
- No resolver por completo Chat, Excel, Calificacion o Reportes.
