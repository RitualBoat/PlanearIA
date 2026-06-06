# Evidencia Local - Fase 1 Scripts Reproducibles - 2026-06-06

## Alcance

Fase 1 del plan de infraestructura: reproducibilidad local desde la raiz del repo.

No se tocaron secretos reales, SQLite, Docker, EAS, deploy automatico ni proveedor cloud.

## Scripts agregados o normalizados

Raiz:

- `npm run typecheck`
- `npm run check`
- `npm run test:classroom`
- `npm run test:planeaciones`
- `npm run test:sync`
- `npm run backend:install`
- `npm run backend:dev`
- `npm run backend:deploy`

Backend:

- `npm run dev`

## Validacion ejecutada

- `npm run typecheck`: OK.
- `npm run lint -- --quiet`: OK.
- `npm run test:classroom`: OK, 3 suites / 12 tests.
- `npm run test:planeaciones`: OK, 12 suites / 41 tests.
- `npm run test:sync`: OK, 2 suites / 17 tests.
- `npm run check`: OK.

Resultado de `npm run check`:

- TypeScript: OK.
- ESLint quiet: OK.
- Jest completo: 73 suites passed, 549 tests passed.

## Warnings conocidos

- `baseline-browser-mapping` desactualizado.
- Warnings esperados de `expo-notifications` en entorno Jest/Expo Go.
- Warnings existentes de `act(...)` en algunos tests.
- Logs esperados de sync con errores simulados.

## Documentacion actualizada

- `README.md`
- `Documentacion/02-operacion/ENTORNO_LOCAL.md`
- `Documentacion/02-operacion/GUIA_PRUEBAS.md`
- `Documentacion/01-planes-maestros/PLAN_INFRAESTRUCTURA_LOCAL_CI_DEPLOY.md`
