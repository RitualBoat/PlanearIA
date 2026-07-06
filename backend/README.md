# PlanearIA Backend

> **Estado:** vigente.
> **Uso:** guia operativa del backend serverless.
> **Fuente de verdad:** `backend/api/index.js`, `backend/routes/`, `backend/lib/`, `Documentacion/00-fundamentos/ARQUITECTURA.md`.
> **No usar para:** exponer secretos, crear clientes paralelos o saltarse `userId`.

## Arquitectura

El backend de PlanearIA es Node serverless para Vercel:

```text
backend/api/index.js
  -> backend/routes/*
    -> backend/lib/auth.js / tokens / sessions / rateLimit
    -> backend/lib/mongodb.js
    -> backend/lib/aiGateway.js
```

Reglas:

- Rutas academicas usan JWT cuando corresponde.
- Toda consulta multiusuario se filtra por `userId`.
- Los endpoints crean indices MongoDB de forma idempotente.
- CORS se controla desde `backend/lib/auth.js` y variables de entorno.
- IA pasa por `backend/lib/aiGateway.js` y `backend/lib/aiUsageLimiter.js`.
- `X-API-Key` existe como compatibilidad/demo donde aplique; JWT valido es el camino principal para usuario autenticado.

## Entorno

Variables principales:

| Variable | Uso |
| --- | --- |
| `MONGODB_URI` | Conexion MongoDB Atlas. |
| `JWT_SECRET` / secrets relacionados | Firma y validacion de tokens. |
| `API_SECRET` | Compatibilidad/demo para rutas que aun aceptan `X-API-Key`. |
| `ALLOWED_ORIGINS` | Origenes permitidos para CORS. |
| `OPENROUTER_API_KEY`, `GROQ_API_KEY`, `OPENAI_API_KEY`, `TOGETHER_API_KEY` | Proveedores IA opcionales. |
| `AI_GATEWAY_PROVIDERS` | Proveedores OpenAI-compatible custom, incluido LM Studio local si el backend lo alcanza. |
| `AI_MAX_REQUESTS_PER_ACTION`, `AI_LIMIT_WINDOW_MS` | Limites de uso IA. |

Nunca guardar valores reales en Git.

## Desarrollo Local

Desde la raiz:

```bash
npm run backend:install
npm run backend:dev
```

Servidor local esperado:

```text
http://localhost:3000
```

Health/checks:

```bash
npm run backend:health
npm run backend:check
npm run backend:isolation
```

## Dominios Principales

| Dominio | Rutas/archivos |
| --- | --- |
| Health | `/api/health` |
| Auth | `backend/routes/auth.js` |
| Academico/sync | grupos, unidades, alumnos, asistencias, calificaciones, entregables, recursos, plantillas, planeaciones, sync |
| Social/comunicacion | posts, contactos, mensajes, notificaciones |
| IA | planeaciones, classroom/copiloto y futuro AsistePLAN via `aiGateway` |

## IA Gateway

`backend/lib/aiGateway.js` soporta proveedores OpenAI-compatible. El frontend no llama proveedores directamente.

Reglas IA:

- Sin keys en frontend.
- Fallback claro si no hay proveedor configurado.
- Limites de uso por accion.
- Resultados IA revisables; no sobrescribir contenido original sin confirmacion docente.
- LM Studio local funciona solo cuando el backend puede alcanzar su URL; Vercel no puede llamar al `localhost` del usuario.

## Seguridad Y Datos

- Validar JWT y scope antes de leer/escribir datos academicos.
- Filtrar por `userId` en MongoDB.
- Aplicar rate limiting en auth, sync, bulk e IA donde corresponda.
- No registrar secretos ni payloads sensibles en logs.
- Mantener compatibilidad con modo invitado/local sin pantalla roja.

## Deploy

El backend se despliega en Vercel como parte del proyecto. Ver guia completa:

- `../Documentacion/02-operacion/DEPLOY_DEMO_HOSTEADA.md`
- `../Documentacion/02-operacion/ENTORNO_LOCAL.md`

## Validacion Recomendada

```bash
npm run backend:check
npm run typecheck
npm run lint -- --quiet
npm test -- --runInBand
```