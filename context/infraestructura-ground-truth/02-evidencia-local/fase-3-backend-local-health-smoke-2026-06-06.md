# Evidencia Local - Fase 3 Backend Local y Health Smoke - 2026-06-06

## Alcance

Fase 3 del plan de infraestructura: backend local y smoke test de `GET /api/health`.

No se hizo deploy, no se abrieron tuneles publicos, no se tocaron secretos reales, no se instalo Docker y no se migro storage.

## Decision de backend local

- `npm run backend:dev` sigue como ruta principal porque usa `vercel dev` y conserva mayor paridad con el backend serverless real.
- `vercel dev` requiere login local de Vercel o token; en esta maquina fallo con `No existing credentials found`.
- Se agrego `npm run backend:dev:local` como fallback minimo sin login para validar `/api/health`.
- El fallback local no reemplaza pruebas completas de endpoints con MongoDB, auth real ni IA.

## Scripts agregados/corregidos

- `npm run backend:health`: valida `GET /api/health` contra `http://localhost:3000` o una URL indicada.
- `npm run backend:dev:local`: servidor local minimo para `/api/health`.
- `npm run backend:dev`: corregido para usar `backend` `start` y evitar recursividad de `vercel dev`.

## Smoke ejecutado

Se levanto temporalmente:

```bash
npm run backend:dev:local
```

Luego:

```bash
npm run backend:health
```

Resultado:

```text
[backend:health] OK http://localhost:3000/api/health
[backend:health] PlanearIA API 1.0.0
```

Respuesta cruda validada:

```json
{"success":true,"data":{"status":"ok","service":"PlanearIA API","version":"1.0.0"}}
```

## Red, timeouts y polling

- `API_CONFIG.timeout`: 15000 ms.
- `SYNC_CONFIG.requestTimeout`: 15000 ms.
- `isAPIConfigured()` evita usar localhost nativo en movil si `EXPO_PUBLIC_ALLOW_NATIVE_LOCALHOST` no esta activo.
- Contextos CRUD revisados usan `AbortController` con `API_CONFIG.timeout`.
- `MensajesContext` tenia polling sin timeout; se agrego `AbortController` para evitar requests colgadas.
- `networkErrors.ts` detecta `Network request failed`, `failed to fetch`, `AbortError` y timeouts.

## Validacion tecnica

- `npm run typecheck`: OK.
- `npm run lint -- --quiet`: OK.
- `npm test -- --runInBand src/__tests__/chat src/__tests__/sync`: OK, 5 suites / 44 tests.
- `npm test -- --runInBand`: OK, 73 suites / 549 tests.

Warnings conocidos:

- `baseline-browser-mapping` desactualizado.
- Warnings esperados de `expo-notifications` en entorno Jest/Expo Go.
- Warnings existentes de `act(...)`.
- Logs esperados de sync con errores simulados.
