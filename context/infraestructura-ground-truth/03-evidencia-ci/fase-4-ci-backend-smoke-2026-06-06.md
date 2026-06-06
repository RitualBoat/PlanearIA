# Evidencia CI - Fase 4 Backend Smoke - 2026-06-06

## Alcance

Fase 4 del plan de infraestructura: CI robusto pero barato.

No se agrego deploy automatico, EAS, Docker, tuneles ni servicios de pago.

## Cambios aplicados

- `.github/workflows/ci.yml`: agrega job `Backend smoke`.
- `package.json`: agrega `backend:check`.
- `scripts/checkBackendApiStatic.mjs`: smoke estatico de backend para CI.
- Documentacion actualizada:
  - `Documentacion/02-operacion/GUIA_PRUEBAS.md`
  - `Documentacion/02-operacion/GITHUB_PRODUCT_OS.md`
  - `Documentacion/02-operacion/ENTORNO_LOCAL.md`
  - `Documentacion/01-planes-maestros/PLAN_INFRAESTRUCTURA_LOCAL_CI_DEPLOY.md`

## Decision CI

- Mantener jobs separados: `TypeScript`, `ESLint`, `Jest`, `Backend smoke`.
- Mantener `concurrency` y cache npm existentes.
- Backend usa `npm ci --prefix backend` con `backend/package-lock.json`.
- El smoke backend es estatico y barato: valida `backend/vercel.json`, `GET /api/health` y `OPTIONS /api/health` sin levantar Vercel, MongoDB ni servidor.
- No se agregan deploy automatico ni EAS en esta fase.

## Validacion local equivalente a CI

- `npm run backend:check`: OK.
- `npm run typecheck`: OK.
- `npm run lint -- --quiet`: OK.
- `npm ci --prefix backend`: OK.
- `npm test -- --runInBand`: OK, 73 suites / 549 tests.

## Warnings conocidos

- `npm ci --prefix backend` reporta vulnerabilidades/deprecations de dependencias actuales del backend/Vercel CLI. No se corrigen en Fase 4 para evitar cambios de dependencias fuera de alcance; quedan como entrada natural para futura fase de seguridad/dependencias.
- `baseline-browser-mapping` desactualizado.
- Warnings esperados de `expo-notifications` en Jest/Expo Go.
- Warnings existentes de `act(...)`.
- Logs esperados de sync con errores simulados.

## CI remoto

Review manual completada por el usuario el 2026-06-06.

- GitHub Actions remoto: OK segun capturas adjuntas en esta carpeta.
- Jobs esperados: TypeScript, ESLint, Jest y Backend smoke.
- Evidencia adjunta:
  - `revision manual pasada.png`
  - `revision manual pasada 2.png`

## Estado

Fase 4 cerrada. CI remoto validado manualmente con evidencia.
