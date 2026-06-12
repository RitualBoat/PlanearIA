# Entorno Local - PlanearIA

> Estado: runbook vigente tras cerrar `Plan Maestro: Infraestructura Local, CI y Deploy Basico`.

## Objetivo

Levantar PlanearIA de forma repetible en web y celular fisico, usando desarrollo local primero y sin depender de produccion.

## Requisitos

- Node.js 20 LTS recomendado.
- npm incluido con Node.
- Expo CLI via `npx expo`.
- Vercel CLI via dependencia local del backend. No hace falta instalarlo globalmente para `npm run backend:dev`.
- Android Studio o dispositivo Android fisico para pruebas moviles.
- Git.

## Frontend

Desde la raiz del repo:

```bash
npm install
npm run backend:install
npm run web
```

Comandos utiles:

```bash
npm start
npm run start:dev
npm run android
npm run ios
npm run backend:dev
npm run backend:dev:local
npm run backend:health
npm run backend:check
```

Notas:

- `npm run web` levanta la app web con Expo.
- `npm run start:dev` se usa cuando haga falta dev client.
- `npm run android` requiere entorno Android configurado.

## Backend local

Desde la raiz del repo:

```bash
npm run backend:install
npm run backend:dev
```

La API local esperada queda en:

```text
http://localhost:3000
```

En otra terminal, confirma health:

```bash
npm run backend:health
```

Decision vigente:

- `npm run backend:dev` usa `vercel dev` y sigue siendo la ruta principal porque se parece mas al backend serverless real.
- `npm run backend:dev:local` es fallback minimo sin login de Vercel para validar `/api/health`.
- `backend/vercel.json` usa el patron `api/**/*.js`; no reintroducir `api/*.js` porque Vercel CLI 50 lo rechazo durante Fase 5.
- El fallback local no reemplaza pruebas de endpoints complejos, MongoDB, auth real ni IA.

Tambien puedes validar otra URL sin cambiar `.env.local`:

```bash
npm run backend:health -- http://IP_DE_TU_LAPTOP:3000
npm run backend:health -- https://tu-backend.vercel.app
```

## Variables de entorno

Copia los ejemplos y rellena valores locales:

```bash
copy .env.example .env.local
copy backend\.env.example backend\.env.local
```

Valores minimos para desarrollo:

```text
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_API_SECRET=el_mismo_valor_que_API_SECRET
EXPO_PUBLIC_ALLOW_NATIVE_LOCALHOST=false
API_SECRET=el_mismo_valor_que_EXPO_PUBLIC_API_SECRET
MONGODB_URI=tu_uri_de_mongodb
```

No guardar keys reales en Git. `.env`, `.env.local`, `backend/.env.local` y variantes locales deben permanecer ignoradas.

### Variables de Auth y Seguridad (backend)

Definidas por el plan Auth/Seguridad. Solo en backend; nunca como `EXPO_PUBLIC_*`.

```text
# Secretos
API_SECRET=                      # guard X-API-Key (demo/backoffice)
JWT_SECRET=                      # firma de access tokens (fallback: API_SECRET)
AUTH_RESET_CODE_SECRET=          # opcional; hash de codigos de reset (fallback: JWT/API_SECRET)

# Tokens
AUTH_ACCESS_TOKEN_MINUTES=15     # vida del access token
AUTH_REFRESH_TOKEN_DAYS=14       # vida del refresh token

# Password
AUTH_MIN_PASSWORD_LENGTH=6

# Rate limit auth
AUTH_RATE_LIMIT_MAX=
AUTH_RATE_LIMIT_WINDOW_MS=

# Reset de contrasena
AUTH_RESET_CODE_TTL_MS=900000
AUTH_RESET_CODE_MAX_ATTEMPTS=5
AUTH_DEV_RESET_CODE=false        # dev only: devuelve el codigo en la respuesta. NUNCA en prod

# Roles
ALLOW_DEV_ROLE_ASSIGNMENT=false  # permitir asignar rol dev desde admin (false en prod)

# CORS
ALLOWED_ORIGINS=                 # lista separada por comas; vacio usa default seguro

# Email (pendiente; modo dev por ahora)
EMAIL_PROVIDER=                  # Resend/Brevo/SendGrid antes de beta
EMAIL_FROM=
EMAIL_API_KEY=
```

Nota: la creacion de `.env.example`/`backend/.env.example` quedo bloqueada por la politica anti-secretos del entorno; esta tabla es la fuente documental de variables Auth hasta crearlos manualmente.

## Matriz de URLs local/web/movil/backend

| Escenario | `EXPO_PUBLIC_API_URL` | Notas |
| --- | --- | --- |
| Web en la misma laptop | `http://localhost:3000` | Requiere `npm run backend:dev`. |
| Android emulator | `http://10.0.2.2:3000` | Alias habitual del host en Android emulator. |
| Celular fisico en Wi-Fi | `http://IP_DE_TU_LAPTOP:3000` | Laptop y celular deben estar en la misma red. |
| Backend cloud/demo | `https://tu-backend.vercel.app` | Solo usar URL sin tokens ni query secrets. |
| Modo offline/local-only | dejar API URL vacia o backend apagado | La app debe degradar sin pantalla roja. |

Celular fisico: `localhost` apunta al telefono, no a la laptop. Para celular usa la IP LAN de la laptop:

```text
EXPO_PUBLIC_API_URL=http://IP_DE_TU_LAPTOP:3000
```

Ejemplo:

```text
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
```

Ambos dispositivos deben estar en la misma red Wi-Fi y el firewall debe permitir el puerto local.

`EXPO_PUBLIC_ALLOW_NATIVE_LOCALHOST=true` solo debe usarse para pruebas puntuales en emuladores o escenarios controlados. En celular fisico real, prefiere IP LAN.

## IA durante desarrollo

- Mantener el gateway multi-provider actual.
- Usar fallbacks heuristicos cuando no haya API key.
- No gastar APIs salvo demo o validacion especifica.
- Si se usa modo dev:

```text
AI_DEV_MODE=true
AI_DEV_TOKEN=dev-token-local-testing-only
AI_DEV_MAX_REQUESTS_PER_ACTION=100
```

El modo dev debe mostrar advertencia visible y no cambia el limite conservador de invitados/usuarios registrados.

Reglas:

- Las API keys de IA viven solo en `backend/.env.local` o en variables del proveedor cloud.
- Nunca agregar `OPENAI_API_KEY`, `GROQ_API_KEY`, `OPENROUTER_API_KEY` ni similares como `EXPO_PUBLIC_*`.
- `AI_DEV_MODE=true` aumenta limites solo para desarrollo y debe seguir mostrando warning en UI/respuesta.

## Checklist de red para celular fisico

- Confirmar que laptop y celular estan en la misma red Wi-Fi.
- Ejecutar `npm run backend:dev` desde la raiz.
- Confirmar que `http://localhost:3000/api/health` responde en la laptop.
- Configurar `EXPO_PUBLIC_API_URL=http://IP_DE_TU_LAPTOP:3000`.
- Confirmar que el firewall permite conexiones entrantes al puerto del backend local.
- Reiniciar Expo si se cambian variables `EXPO_PUBLIC_*`.
- No usar screenshots que muestren API secrets, URIs de MongoDB ni tokens IA.

## Verificacion rapida

```bash
npm run typecheck
npm run lint -- --quiet
npm test -- --runInBand
npm run check
```

Para trabajar mas rapido, ejecutar tests focalizados del modulo tocado:

```bash
npm run test:classroom
npm run test:planeaciones
npm run test:sync
npm run backend:check
```

## Scripts reproducibles desde raiz

| Comando | Uso |
| --- | --- |
| `npm run typecheck` | Valida TypeScript sin emitir archivos. |
| `npm run lint -- --quiet` | Ejecuta ESLint mostrando solo problemas relevantes. |
| `npm test -- --runInBand` | Ejecuta toda la suite Jest de forma serial. |
| `npm run check` | Corre typecheck, lint quiet y tests completos. |
| `npm run test:classroom` | Ejecuta pruebas focalizadas de Classroom. |
| `npm run test:planeaciones` | Ejecuta pruebas focalizadas de Planeaciones. |
| `npm run test:sync` | Ejecuta pruebas focalizadas de sincronizacion/offline. |
| `npm run backend:install` | Instala dependencias del backend. |
| `npm run backend:dev` | Levanta el backend local con Vercel dev desde `backend/`. |
| `npm run backend:dev:local` | Levanta un servidor local minimo para smoke de `/api/health` sin login de Vercel. |
| `npm run backend:health` | Valida `GET /api/health` contra `http://localhost:3000` o una URL indicada. |
| `npm run backend:check` | Smoke estatico de backend para CI: valida `vercel.json` y carga `/api/health` sin levantar servidor. |
| `npm run backend:deploy` | Ejecuta deploy del backend; usar solo con decision explicita. |

## Estrategia de demo low-cost vigente

Ruta recomendada mientras no haya usuarios reales:

1. Demo local principal: laptop como host, `npm run web`, backend local y celular fisico por IP LAN.
2. Backend local con paridad serverless: `npm run backend:dev` si Vercel CLI tiene sesion.
3. Backend local minimo: `npm run backend:dev:local` solo para smoke de `/api/health` sin login de Vercel.
4. URL publica temporal para entrega/demo: `ngrok http PUERTO_EXPO` o `ngrok http PUERTO_BACKEND` segun lo que se vaya a mostrar.
5. Backend cloud para demo externa real: mantener Vercel como primera opcion cuando el usuario pida deploy permanente.
6. Base remota: mantener MongoDB Atlas Free para datos de demo.
7. Movil: usar Expo Go/local primero; posponer EAS/dev builds hasta que hagan falta capacidades nativas o distribucion.

No activar deploy automatico, EAS, Docker ni cambio de proveedor cloud sin decision explicita.

## Storage local y SQLite

Estado vigente:

- AsyncStorage sigue siendo la persistencia local actual.
- Expo SQLite ya esta instalado como infraestructura opt-in para datos academicos relacionales.
- No activar SQLite como default ni borrar claves legacy sin decision explicita.
- Plan cerrado: `Documentacion/01-planes-maestros/PLAN_STORAGE_LOCAL_SQLITE_MIGRACION_OFFLINE.md`.
- Evidencia academica: `context/infraestructura-ground-truth/05-sqlite-actividad-academica/`.

Regla practica:

- Preferencias, flags, caches pequenos y drafts simples pueden seguir en AsyncStorage.
- Grupos, alumnos, unidades, tareas, recursos, asistencias, calificaciones, entregas y cola de sync ya tienen infraestructura SQLite opt-in; cualquier plan nuevo debe usar ports/repositories y evitar lecturas directas a AsyncStorage.

