# Auth Fase 1 - Roles, permisos y contrato de sesion

> **Fecha de ejecucion:** 2026-06-12
> **Plan maestro:** `Documentacion/01-planes-maestros/PLAN_AUTH_SEGURIDAD_SESION_REAL.md`
> **Fase:** 1 - Modelo de roles, permisos y contrato de sesion
> **Estado:** implementacion tecnica validada; pendiente de revision manual de contrato
> **Issue:** `#28` - `Auth Seguridad Fase 1 - Modelo de roles permisos y contrato de sesion`
> **Project OS:** item `PVTI_lAHOBUE3s84BZpAyzgvgc2M`, estado objetivo `Review Manual`

---

## 1. Decisiones cerradas

| Decision | Resultado | Motivo |
| --- | --- | --- |
| Roles canonicos | `dev`, `admin`, `docente`, `alumno` | Separar desarrollo, administracion real, docencia y alumnado. |
| Roles legacy | `supervisor`, `usuario` | Mantener compatibilidad temporal con usuarios/datos existentes. |
| Alias legacy | `supervisor -> docente`, `usuario -> alumno` | Normalizacion de menor privilegio para contrato futuro. |
| Rol dev | Existe en contrato y usuario local dev | Se separa de `admin`; no se expone en UI de asignacion. |
| Roles asignables desde Admin UI | `admin`, `docente`, `alumno`, `supervisor`, `usuario` | Evita asignar `dev` accidentalmente desde producto. |
| Permisos | Fuente unica JSON compartida | Evita tablas divergentes frontend/backend. |
| Token contract | Claims objetivo documentados: `role`, `rol`, `sessionId`, `jti`, `permissionsVersion`, `iat`, `exp` | Fase 1 define contrato; refresh/sesiones quedan para Fase 2. |

---

## 2. Archivos modificados o creados

| Archivo | Cambio |
| --- | --- |
| `shared/authContract.json` | Fuente unica de roles, aliases, permisos, roles asignables y claims objetivo. |
| `types/auth.ts` | Tipos `PlaneariaRole`, `LegacyRole`, `RolUsuario`, `Permission`, `AuthUser`, `AuthSession`, `AuthTokens`, `AuthTokenClaims` y helpers. |
| `types/index.ts` | Reexporta contrato Auth para conservar imports existentes. |
| `backend/lib/authContract.js` | Adaptador Node del contrato compartido. |
| `backend/api/auth.js` | Usa contrato para roles/permisos, agrega `role` canonical y `permissionsVersion` al token, y protege asignacion remota de `dev` sin env. |
| `src/context/AuthContext.tsx` | Usuario local dev usa `rol: "dev"`; guest/dev llevan `permissionsVersion`. |
| `src/screens/cuenta/AdminRolesScreen.tsx` | Lista roles asignables desde contrato y etiqueta roles con helper compartido. |
| `src/screens/cuenta/CuentaScreen.tsx` | Etiqueta rol con contrato compartido. |
| `src/screens/perfil/PerfilScreen.tsx` | Etiqueta rol con contrato compartido. |
| `src/hooks/useFeedViewModel.ts` | Publicaciones usan etiqueta de rol desde contrato. |
| `backend/lib/aiUsageLimiter.js` | Reconoce rol `dev` para modo dev IA, conservando fallback admin+email dev. |
| `src/__tests__/auth/authContract.test.ts` | Prueba de no divergencia frontend/backend y reglas de roles/permisos. |

---

## 3. Compatibilidad y limites

- No se activó SQLite como default.
- No se borró AsyncStorage legacy.
- No se cambio el storage de tokens; eso queda para Fase 3.
- No se implementaron refresh tokens ni tabla de sesiones; eso queda para Fase 2.
- `rol` se conserva por compatibilidad con payloads existentes; `role` canonical se agrega como claim nuevo.
- `supervisor` y `usuario` siguen siendo roles aceptados durante transicion.
- `dev` no aparece en `ASSIGNABLE_ROLES` y backend rechaza asignarlo salvo `ALLOW_DEV_ROLE_ASSIGNMENT=true`.

---

## 4. Validacion

Ejecutado:

| Comando | Resultado |
| --- | --- |
| `cmd /c npm --prefix "C:\Users\jarco\dev\PlanearIA" run typecheck` | OK |
| `cmd /c npm --prefix "C:\Users\jarco\dev\PlanearIA" test -- src/__tests__/auth/authContract.test.ts --runInBand` | OK - 1 suite, 4 tests |
| `cmd /c npm --prefix "C:\Users\jarco\dev\PlanearIA" run lint -- --quiet` | OK |
| `cmd /c npm --prefix "C:\Users\jarco\dev\PlanearIA" run backend:check` | OK |
| `git -C 'C:\Users\jarco\dev\PlanearIA' diff --check` | OK |

Notas:

- `lint` conserva la advertencia no bloqueante de `baseline-browser-mapping` con datos de mas de dos meses.
- `git diff --check` conserva warnings CRLF de Git en archivos ya tocados, con exit code 0.

Resultado actual: Fase 1 validada localmente. Se recomienda `Review Manual` por cambio de contrato de producto.

---

## 5. Riesgos residuales para fases siguientes

- Los tokens siguen usando expiracion legacy de 168 horas hasta Fase 2.
- `backend/api/auth.js` conserva helpers JWT/password locales hasta extraccion de Fase 2.
- `AdminRoles` todavia necesita guard de navegacion por permiso en Fase 4.
- Los endpoints academicos aun deben adoptar `userId` real en Fase 5.
