# Auth Fase 2 - Backend auth real y hardening inicial

> **Fecha de ejecucion:** 2026-06-12
> **Plan maestro:** `Documentacion/01-planes-maestros/PLAN_AUTH_SEGURIDAD_SESION_REAL.md`
> **Fase:** 2 - Backend Auth Real y Hardening Inicial
> **Estado:** implementacion tecnica validada; lista para revision manual por cambios de login real y variables
> **Issue:** `#29` - `Auth Seguridad Fase 2 - Backend auth real y hardening inicial`
> **Project OS:** item `PVTI_lAHOBUE3s84BZpAyzgvggpY`; sincronizacion remota a `Review Manual` pendiente por limite de uso del entorno

---

## 1. Cambios implementados

| Area | Resultado |
| --- | --- |
| Helpers backend | Nuevos `backend/lib/passwords.js`, `backend/lib/tokens.js`, `backend/lib/authSessions.js`, `backend/lib/resetCodes.js`, `backend/lib/rateLimit.js`. |
| JWT centralizado | `backend/lib/auth.js` usa `backend/lib/tokens.js` para `verifyToken` y `getUserFromToken`. |
| Sesiones refresh | Login/registro crean `auth_sessions`; `refresh` rota refresh token; `logout` revoca sesion actual o todas. |
| Compatibilidad frontend | La respuesta conserva `token` legacy y agrega `accessToken`, `refreshToken`, `sessionId` y `tokens`. |
| Password hashing | Nuevo formato `pbkdf2:v1`; verificacion soporta formato legacy `salt:key` y rehashea tras login exitoso. |
| Registro/login | Agregan `permissionsVersion`, `canonicalRole`, `ultimoAcceso`, sesion y claims compatibles con Fase 1. |
| Recuperacion/reset | Reset code se guarda hasheado; intentos limitados; TTL configurable; `_devCode` solo sale con `AUTH_DEV_RESET_CODE=true`. |
| Rate limit | In-memory low-cost para acciones auth criticas. |
| Headers/CORS | `ALLOWED_ORIGINS` desde env y headers `no-store`, `nosniff`, `DENY`, `no-referrer`, `Permissions-Policy`. |
| Variables | `backend/.env.example` documenta nuevas variables Auth. |
| Tests | Nueva suite `src/__tests__/auth/backendAuthHelpers.test.ts`. |

---

## 2. Compatibilidad y limites

- SQLite permanece opt-in.
- AsyncStorage legacy no fue borrado.
- El frontend aun no consume refresh token; eso queda para Fase 3.
- `AUTH_ACCESS_TOKEN_MINUTES` queda documentado con default compatible `10080` en `.env.example` hasta que Fase 3 use refresh real.
- No se agregaron dependencias nuevas; PBKDF2 se mantiene con Node `crypto`.
- No se implemento email real; `_devCode` queda desactivado salvo flag explicito.

---

## 3. Archivos principales

| Archivo | Cambio |
| --- | --- |
| `backend/api/auth.js` | Usa helpers, sesiones refresh, rate limit, reset hasheado, permisos compartidos. |
| `backend/lib/auth.js` | Centraliza JWT via `tokens.js`; agrega headers de seguridad y `ALLOWED_ORIGINS` por env. |
| `backend/lib/passwords.js` | Password hashing versionado + compatibilidad legacy. |
| `backend/lib/tokens.js` | JWT/access token/refresh token helpers. |
| `backend/lib/authSessions.js` | Crear, rotar y revocar sesiones. |
| `backend/lib/resetCodes.js` | Codigos de reset hasheados, TTL/intentos y flag dev. |
| `backend/lib/rateLimit.js` | Rate limit in-memory low-cost. |
| `backend/.env.example` | Variables Auth nuevas. |
| `src/__tests__/auth/backendAuthHelpers.test.ts` | Tests backend/helpers Auth. |

---

## 4. Validacion

| Comando | Resultado |
| --- | --- |
| `cmd /c npm --prefix "C:\Users\jarco\dev\PlanearIA" run typecheck` | OK |
| `cmd /c npm --prefix "C:\Users\jarco\dev\PlanearIA" test -- src/__tests__/auth --runInBand` | OK - 2 suites, 10 tests |
| `cmd /c npm --prefix "C:\Users\jarco\dev\PlanearIA" run lint -- --quiet` | OK |
| `cmd /c npm --prefix "C:\Users\jarco\dev\PlanearIA" run backend:check` | OK |
| `git -C 'C:\Users\jarco\dev\PlanearIA' diff --check` | OK |

Notas:

- `lint` conserva advertencia no bloqueante de `baseline-browser-mapping` desactualizado.
- `git diff --check` conserva warnings CRLF de Git con exit code 0.
- Hay cambios ajenos previos en `src/screens/biblioteca/RecursosDidacticosScreen.tsx` y `src/screens/classroom/ClassroomHomeScreen.tsx`; no fueron tocados por esta fase.
- GitHub Product OS no pudo moverse a `Review Manual` en esta ejecucion porque la aprobacion de `gh project item-edit` fue bloqueada por limite de uso del entorno.

---

## 5. Riesgos residuales

- Fase 3 debe persistir refresh token de forma segura y renovar access tokens en cliente.
- Fase 3 debe decidir SecureStore/fallback web sin borrar AsyncStorage legacy.
- Fase 4 debe agregar guards UX por permiso/rol.
- Fase 5 debe aplicar `userId` real a endpoints academicos multiusuario.
- Email real low-cost queda pendiente antes de beta.
