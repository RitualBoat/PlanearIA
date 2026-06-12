# Auth Fase 0 - Auditoria y baseline de seguridad

> **Fecha de ejecucion:** 2026-06-12
> **Plan maestro:** `Documentacion/01-planes-maestros/PLAN_AUTH_SEGURIDAD_SESION_REAL.md`
> **Fase:** 0 - Auditoria y baseline de seguridad
> **Estado:** baseline tecnico creado y validado; listo para cierre de Fase 0.
> **Modo de trabajo:** NORMAL, porque la fase requiere auditoria, decisiones y trazabilidad.
> **No objetivos activos:** no activar SQLite como default, no borrar AsyncStorage legacy, no cambiar runtime de auth ni migrar datos.

---

## 1. Trazabilidad GitHub Product OS

| Elemento | Valor |
| --- | --- |
| Repo | `RitualBoat/PlanearIA` |
| Rama base | `development` |
| Epic | `#26` - `Plan Maestro: Auth, Seguridad y Sesion Real` |
| Fase | `#27` - `Auth Seguridad Fase 0 - Auditoria y baseline de seguridad` |
| Milestone | `Ciclo 4 - Auth y Seguridad` (`#7`) |
| Project | `PlanearIA Product OS` |
| Estado de epic | `In progress` |
| Estado de fase al crear baseline | `In progress` |
| Estado local tras validacion | Validado |
| Estado GitHub tras cierre | Issue `#27` cerrado; Project item en `Done` |

---

## 2. Alcance revisado

La Fase 0 no modifica comportamiento de aplicacion. Su salida es una fotografia tecnica para ejecutar las fases siguientes sin perder de vista:

- `X-API-Key` expuesto desde Expo no es identidad real de usuario.
- Los tokens actuales viven en AsyncStorage y deben migrarse con compatibilidad.
- Los endpoints academicos multiusuario deben obtener `userId` desde JWT cuando aplique.
- SQLite ya existe como infraestructura opt-in; cualquier dato academico nuevo debe pasar por ports/repositories compatibles con SQLite.
- AsyncStorage legacy sigue siendo default y no se borra durante este inicio.

---

## 3. Flujos Auth actuales

| Flujo | Frontend | Backend | Observacion |
| --- | --- | --- | --- |
| Login | `src/hooks/useLoginViewModel.ts`, `src/context/AuthContext.tsx` | `backend/api/auth.js?action=login` | Persiste token y usuario en AsyncStorage. |
| Registro | `src/hooks/useRegistroViewModel.ts` | `backend/api/auth.js?action=registro` | Rol por default en backend; requiere alinear politica de password. |
| Invitado | `AuthContext.loginComoInvitado` | No aplica | Local-only; debe conservar restricciones via `useAuthGate`. |
| Dev login | `AuthContext.loginComoDesarrollador` | No aplica directo | Usa `dev-token-local-testing-only` y usuario local con rol `admin`; separar de admin real. |
| Verificar token | `AuthContext.verificarToken` | `backend/api/auth.js?action=verificar` | Token manual JWT/HMAC. |
| Recuperar | `useRecuperarContrasenaViewModel` | `auth?action=recuperar` | Dev code queda expuesto en respuesta; debe quedar bajo flag explicito. |
| Resetear | `useRecuperarContrasenaViewModel` | `auth?action=resetear` | Codigo y TTL deben endurecerse. |
| Perfil/preferencias | `useEditarPerfilViewModel`, `useCuentaViewModel` | `actualizar_perfil`, `actualizar_preferencias` | Depende de token real para `userId`. |
| Eliminar cuenta | `AuthContext.eliminarCuenta` | `auth?action=eliminar_cuenta` | Debe verificar `userId` desde token. |
| Admin roles | `useAdminRolesViewModel`, `AdminRolesScreen` | `listar_usuarios`, `cambiar_rol` | UI oculta por rol, pero la ruta requiere guard. Backend valida admin. |

---

## 4. Matriz inicial de endpoints

| Endpoint | API key / validateAuth | JWT user helper | `userId` detectado | Rol/permisos | Rate limit | Riesgo principal |
| --- | --- | --- | --- | --- | --- | --- |
| `backend/api/alumnos.js` | Si | No | No | No detectado | No | Datos academicos sin aislamiento uniforme. |
| `backend/api/asistencias.js` | Si | No | No | No detectado | No | Datos academicos sin aislamiento uniforme. |
| `backend/api/auth.js` | Parcial por accion | Si | Si | Admin check | No dedicado | Superficie grande y logica duplicada. |
| `backend/api/calificaciones.js` | Si | No | No | No detectado | No | Datos academicos sin aislamiento uniforme. |
| `backend/api/classroom/copiloto.js` | Si | No | No | No detectado | Si | IA con identidad debil. |
| `backend/api/contactos.js` | Si | No | No | No detectado | No | Datos sociales/contacto sin aislamiento uniforme. |
| `backend/api/entregables.js` | Si | No | No | No detectado | No | Datos academicos sin aislamiento uniforme. |
| `backend/api/grupos.js` | Si | No | No | No detectado | No | Grupos no filtrados por usuario real. |
| `backend/api/health.js` | No | No | No | No | No | OK para health si no expone secretos. |
| `backend/api/mensajes.js` | Si | No | No | No detectado | No | Mensajeria requiere identidad real. |
| `backend/api/notificaciones.js` | Si | No | No | No detectado | No | Notificaciones requieren identidad real. |
| `backend/api/planeaciones.js` | Si | Si | Si | No centralizado | No | Mejor baseline actual; consolidar helpers. |
| `backend/api/planeaciones/copiloto.js` | Si | No | No | No detectado | Si | IA sin identidad real por JWT. |
| `backend/api/planeaciones/escanear-plantilla.js` | Si | Si | Si | No centralizado | Si | Requiere contrato comun de claims/rate limit. |
| `backend/api/planeaciones/generar.js` | Si | Si | Si | No centralizado | Si | Requiere contrato comun de claims/rate limit. |
| `backend/api/planeaciones/mejorar.js` | Si | No | No | No detectado | Si | IA sin identidad real por JWT. |
| `backend/api/plantillas.js` | Si | No | No | No detectado | No | Plantillas deben decidir alcance global vs usuario. |
| `backend/api/posts.js` | Si | No | No | No detectado | No | Social requiere permisos/propiedad. |
| `backend/api/recursos.js` | Si | No | No | No detectado | No | Recursos academicos sin aislamiento uniforme. |
| `backend/api/sync.js` | Si | Si | Si | No centralizado | No | Puede aceptar API key sin identidad suficiente si falta JWT, revisar acciones. |

Lectura de riesgo: `validateAuth` protege el acceso tecnico por API key, pero no reemplaza identidad de usuario ni autorizacion multiusuario.

---

## 5. Baseline de storage local

### 5.1 Sesion y Auth

| Clave / secreto | Archivo | Estado |
| --- | --- | --- |
| `@planearia:auth_token` | `src/context/AuthContext.tsx`, `src/utils/apiClient.ts`, `src/hooks/useCrearPlaneacionViewModel.ts` | Token sensible en AsyncStorage. |
| `@planearia:auth_user` | `src/context/AuthContext.tsx` | Perfil local cacheado. |
| `@planearia:is_guest` | `src/context/AuthContext.tsx` | Flag de invitado. |
| `dev-token-local-testing-only` | `src/context/AuthContext.tsx`, `backend/lib/aiUsageLimiter.js` | Dev/demo hardcodeado; separar de admin real. |
| `EXPO_PUBLIC_API_SECRET` | `.env.example`, `src/sync/config/apiConfig.ts` | Publico por naturaleza en cliente; no usar como secreto real. |
| `API_SECRET`, `JWT_SECRET` | `backend/.env.example`, `backend/lib/auth.js`, `backend/api/auth.js` | Backend requiere separacion clara entre API key demo y JWT secret. |

### 5.2 Datos academicos AsyncStorage

| Area | Claves detectadas | Nota |
| --- | --- | --- |
| Classroom | `@planearia:grupos`, `@planearia:unidades_classroom`, `@planearia:alumnos`, `@planearia:entregables`, `@planearia:tareas`, `@planearia:recursos`, `@planearia:asistencias`, `@planearia:calificaciones`, `@planearia:entregas` | No borrar; agregar contexto de usuario por ports/repositories cuando se implemente aislamiento. |
| Sync legacy | `@planearia:planeaciones`, `@planearia:last_sync`, `@planearia:pending_ops`, `@planearia:device_id`, `@planearia:initial_sync` | Mantener compatibilidad. |
| Sync v2 | `@planearia:pending_ops_v2_`, `@planearia:failed_ops_v2` | Debe incluir `userId` en operaciones nuevas. |

Observacion legacy: `@planearia:entregables` aparece como clave activa y como alias legacy en Classroom, por lo que cualquier migracion debe tratar duplicidad con pruebas focalizadas.

### 5.3 SQLite opt-in

| Archivo | Estado |
| --- | --- |
| `src/services/classroom/classroomRepositoryFactory.ts` | Fabrica permite seleccionar repository; SQLite no debe activarse como default en este plan. |
| `src/services/classroom/sqlite/classroomSqliteSchema.ts` | Tablas `groups`, `students`, `classroom_units`, `tasks`, `resources`, `attendance`, `grades`, `submissions`, `sync_queue`, `failed_sync_ops`. |
| `src/services/classroom/sqlite/` | Infraestructura opt-in ya existente. |

Riesgo detectado: el schema SQLite no expone columna indexada `user_id` en tablas principales. Si se implementa multiusuario local, debe hacerse mediante migracion explicita y adapters compatibles, sin romper AsyncStorage default.

---

## 6. Baseline de rutas y guards

| Ruta / pantalla | Estado actual | Riesgo | Objetivo de fases siguientes |
| --- | --- | --- | --- |
| `Login` | Entrada no autenticada | OK | Mantener errores claros y dev mode visible solo en desarrollo. |
| `Registro` | Accesible desde login | Politica password debe alinearse | Validacion frontend/backend unica. |
| `RecuperarContrasena` | Accesible desde login | Dev code expuesto en backend | Flag dev explicito y email/codigo seguro. |
| `MainTabs` | Se muestra si `isAuthenticated` | Depende de sesion local | Sesion real con refresh/offline controlado. |
| `CuentaScreen` | Oculta AdminRoles si `usuario?.rol === "admin"` | Ocultar boton no es guard | Validar rol antes de navegar y en backend. |
| `AdminRolesScreen` | Ruta registrada en stack | Sin guard de rol central | Guard de rol/permisos; backend sigue siendo fuente de verdad. |
| `useAuthGate` | Bloquea invitado en acciones protegidas | No cubre roles | Extender o crear helper de permisos. |

---

## 7. Baseline de pruebas

| Area | Estado | Gap |
| --- | --- | --- |
| AuthContext | Sin suite dedicada | Restauracion, login, guest, dev, logout, refresh futuro. |
| Login/Registro/Recuperacion | Sin tests focalizados suficientes | Errores, loading, password policy, reset code. |
| Backend auth helpers | Sin suite dedicada | Token, password hash, roles, reset, rate limit. |
| Cuenta/AdminRoles | Tests relacionados existentes | Falta guard de ruta y permisos reales. |
| Sync/Classroom | Tests existentes | Deben ampliarse si se toca aislamiento `userId` local. |

Tests relacionados existentes detectados:

- `src/__tests__/cuenta/useEditarPerfilViewModel.test.tsx`
- `src/__tests__/cuenta/EditarPerfilScreen.test.tsx`
- `src/__tests__/perfil/PerfilScreen.test.tsx`
- `src/__tests__/sync/*`
- `src/__tests__/classroom/*`

---

## 8. Registro de riesgos

| ID | Riesgo | Severidad | Fase sugerida |
| --- | --- | --- | --- |
| R1 | Token real en AsyncStorage. | Alta | Fase 3 |
| R2 | Dev token hardcodeado y usuario dev con rol admin. | Alta | Fase 1-2 |
| R3 | `EXPO_PUBLIC_API_SECRET` usado como secreto de cliente. | Alta | Fase 2 |
| R4 | Endpoints academicos con API key pero sin `userId` uniforme. | Alta | Fase 5 |
| R5 | `backend/api/sync.js` requiere revision para no operar sin identidad real. | Alta | Fase 5 |
| R6 | Recuperacion devuelve `_devCode` sin flag dev explicito. | Alta | Fase 2 |
| R7 | JWT manual duplicado en `backend/api/auth.js` y `backend/lib/auth.js`. | Media | Fase 2 |
| R8 | `AdminRoles` depende de visibilidad frontend para navegacion. | Media | Fase 4 |
| R9 | Politica de password no esta centralizada entre UI/backend. | Media | Fase 1-2 |
| R10 | SQLite opt-in sin columna `user_id` indexada en schema academico. | Media | Fase 5 |
| R11 | No hay suite Auth dedicada. | Media | Fase 7 |
| R12 | Clave legacy duplicada `@planearia:entregables`. | Media | Fase 5/8 |

---

## 9. Recomendaciones inmediatas

1. Fase 1 debe cerrar contrato de roles canonicos: `dev`, `admin`, `docente`, `alumno`, con aliases legacy para `supervisor` y `usuario`.
2. Fase 1 debe definir tipos compartidos de sesion, claims, permisos y usuario sin instalar dependencias todavia.
3. Fase 2 debe extraer helpers backend de token/password/roles antes de agregar refresh o rate limit.
4. Fase 3 debe introducir almacenamiento seguro con fallback, sin borrar claves AsyncStorage legacy.
5. Fase 5 debe exigir `userId` en datos academicos nuevos y en sync queue; SQLite sigue opt-in.
6. Fase 7 debe agregar tests Auth antes de considerar beta o datos reales.

---

## 10. Validacion

Comandos ejecutados el 2026-06-12. Se usaron comandos con `npm --prefix 'C:\Users\jarco\dev\PlanearIA'` para forzar el workspace correcto.

| Comando | Resultado | Nota |
| --- | --- | --- |
| `npm --prefix 'C:\Users\jarco\dev\PlanearIA' run typecheck` | OK | `tsc --noEmit` sin errores. |
| `npm --prefix 'C:\Users\jarco\dev\PlanearIA' run lint -- --quiet` | OK | Advertencia no bloqueante: `baseline-browser-mapping` con datos de mas de dos meses. |
| `npm --prefix 'C:\Users\jarco\dev\PlanearIA' test -- --runInBand` | OK | 78 suites y 563 tests pasaron. |
| `npm --prefix 'C:\Users\jarco\dev\PlanearIA' run backend:check` | OK | `backend/vercel.json`, `GET /api/health` y `OPTIONS /api/health` OK. |
| `git -C 'C:\Users\jarco\dev\PlanearIA' diff --check` | OK | Solo warning CRLF de Git en el plan maestro; exit code 0. |

Ruido no bloqueante observado:

- Jest muestra advertencias de `expo-notifications` sobre Expo Go/dev build.
- Jest muestra warnings `act(...)` en pruebas relacionadas con `useDetalleGrupoViewModel`.
- Pruebas de sync emiten logs de error esperados para escenarios de reintentos fallidos.

Resultado actual: Fase 0 validada localmente y cerrada en GitHub Product OS; no se tocaron archivos runtime, no se activo SQLite como default y no se borro AsyncStorage legacy.
