# Evidencia Local - Fase 2 Env, Secrets y Perfiles - 2026-06-06

## Alcance

Fase 2 del plan de infraestructura: variables de entorno, secrets y perfiles local/web/movil.

No se leyeron ni copiaron secretos reales. No se hizo deploy, Docker, EAS, SQLite ni cambio de proveedor cloud.

## Cambios aplicados

- `.env.example`: agrega `EXPO_PUBLIC_ALLOW_NATIVE_LOCALHOST=false` y mantiene solo variables publicas de Expo.
- `backend/.env.example`: mantiene placeholders seguros para MongoDB, auth, API secret, IA y CORS.
- `backend/README.md`: reemplaza ejemplos que parecian secretos reales por placeholders.
- `README.md`: documenta separacion entre variables publicas de app y secretos backend.
- `Documentacion/02-operacion/ENTORNO_LOCAL.md`: agrega matriz de URLs web/emulador/celular/backend cloud y checklist de red para celular fisico.
- `.gitignore`: confirma env locales ignorados y agrega `.vercel/`.
- `PLAN_INFRAESTRUCTURA_LOCAL_CI_DEPLOY.md`: actualiza tracking de Fase 2.

## Verificacion de secretos/documentacion

Busqueda ejecutada:

```bash
rg -n "planearia-dev-secret|ignacio11|planearia_user|mongodb\+srv://planearia_|OPENAI_API_KEY=.*\S|GROQ_API_KEY=.*\S|OPENROUTER_API_KEY=.*\S" README.md backend\README.md Documentacion\02-operacion Documentacion\01-planes-maestros .env.example backend\.env.example src\sync\config\apiConfig.ts
```

Resultado: sin coincidencias.

## Validacion tecnica

- `npm run typecheck`: OK.
- `npm run lint -- --quiet`: OK.

Warnings conocidos:

- `baseline-browser-mapping` desactualizado.
- Warnings normales de Windows sobre LF/CRLF al revisar diffs.
