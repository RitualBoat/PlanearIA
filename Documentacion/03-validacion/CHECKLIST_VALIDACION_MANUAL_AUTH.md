# Checklist de Validacion Manual - Auth, Seguridad y Sesion Real

Fecha: 2026-06-12
Plan: `Documentacion/01-planes-maestros/PLAN_AUTH_SEGURIDAD_SESION_REAL.md`
Alcance validado: Fases 3 a 6 (sesion segura, RBAC UX, aislamiento backend, sesiones, cuenta, legal).

Este documento cubre la validacion manual (Review Manual) que NO se puede cerrar solo con CI.
La bateria automatica se valida en CI y se resume al final.

## 1. Bateria automatica (Fase 7.1)

Ejecutar desde la raiz:

```bash
npm run typecheck
npm run lint -- --quiet
npm test -- --runInBand
npm run backend:check
```

Resultado de referencia 2026-06-12: typecheck 0 errores, lint 0 errores,
jest 623/623 (87 suites), backend:check (smoke + aislamiento incl. sesiones) en verde.
CI (GitHub Actions) en verde para los 4 jobs.

## 2. Matriz manual de Auth (Fase 7.2)

- [ ] Crear cuenta docente nueva y entrar automaticamente.
- [ ] Cerrar sesion y volver a Login sin estado residual.
- [ ] Iniciar sesion con credenciales validas.
- [ ] Iniciar sesion con password incorrecta muestra error claro, sin filtrar si el email existe.
- [ ] Reiniciar la app restaura la sesion (token en almacen seguro nativo / AsyncStorage web).
- [ ] Entrar como invitado: acciones de cuenta ocultas, acciones protegidas piden iniciar sesion.
- [ ] Dev login solo aparece en `__DEV__`.
- [ ] Recuperar contrasena en modo dev (`AUTH_DEV_RESET_CODE=true`): codigo visible solo en dev.
- [ ] Reset con codigo invalido/expirado/intentos excedidos responde con error correcto.
- [ ] Cambiar contrasena y volver a entrar con la nueva.

## 3. Matriz de roles / RBAC UX (Fase 7.2)

- [ ] Admin/Dev ven el boton "Administrar roles" en Cuenta; docente/alumno/invitado no.
- [ ] Navegar directo a `AdminRoles` sin permiso muestra estado "sin permiso" y no carga usuarios.
- [ ] Admin lista usuarios y cambia un rol; el backend acepta.
- [ ] Docente intentando cambiar rol via backend recibe 403 (no solo UI oculta).
- [ ] Rol `dev` no se puede asignar desde UI salvo `ALLOW_DEV_ROLE_ASSIGNMENT=true`.

## 4. Sesiones (Fase 7.2)

- [ ] "Sesiones iniciadas" lista las sesiones activas, marcando la actual.
- [ ] Cerrar una sesion especifica la revoca (no reaparece al refrescar).
- [ ] "Cerrar las demas sesiones" deja solo la actual.
- [ ] Un refresh con token revocado no renueva la sesion.

## 5. Aislamiento multiusuario (Fase 7.3)

Automatizado en `scripts/testBackendIsolation.mjs` (grupos, alumnos, calificaciones, notificaciones, sesiones).
Manual recomendado con dos cuentas reales:

- [ ] Usuario A no ve grupos/alumnos/recursos/asistencias/calificaciones/entregables de Usuario B.
- [ ] Usuario A no puede editar ni borrar datos de Usuario B (403/404).
- [ ] Notificaciones de A no son visibles ni modificables por B.
- [ ] Trafico solo con API key (sin JWT) mantiene comportamiento legacy (compatibilidad).

## 6. Errores y estados (Fase 7.4)

- [ ] Backend apagado: la app abre con datos locales, sin spinner infinito.
- [ ] API no configurada: no rompe la app.
- [ ] Token de acceso expirado: intenta refresh; si falla, fuerza re-login.
- [ ] Offline: ultima sesion valida abre; acciones remotas degradan en silencio.
- [ ] Eliminar cuenta: requiere password, borra datos por `userId`, revoca sesiones, vuelve a Login.

## 7. Seguridad basica (Fase 7 / 14.3)

- [ ] No hay secrets reales en el diff ni en logs.
- [ ] `_devCode` no aparece sin `AUTH_DEV_RESET_CODE`.
- [ ] No se muestran tokens ni secrets en pantallas (web/movil).
- [ ] CORS responde con origen configurado.
- [ ] Rate limit responde con error claro en login/registro/recuperacion.

## Cierre

- [ ] Desarrollador confirma que el flujo se siente como una sesion real: crear cuenta, entrar,
      cerrar sesion, recuperar contrasena y trabajar offline sin mezclar datos con otra cuenta.
