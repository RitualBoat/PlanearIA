# Entorno Local - PlanearIA

> Estado: guia base creada desde `Documentacion/PLAN_PASOS_INICIALES.md`.

## Objetivo

Levantar PlanearIA de forma repetible en web y celular fisico, usando desarrollo local primero y sin depender de produccion.

## Requisitos

- Node.js 20 LTS recomendado.
- npm incluido con Node.
- Expo CLI via `npx expo`.
- Vercel CLI solo si se usa el backend serverless local: `npm install -g vercel`.
- Android Studio o dispositivo Android fisico para pruebas moviles.
- Git.

## Frontend

Desde la raiz del repo:

```bash
npm install
npm run web
```

Comandos utiles:

```bash
npm start
npm run start:dev
npm run android
npm run ios
```

Notas:

- `npm run web` levanta la app web con Expo.
- `npm run start:dev` se usa cuando haga falta dev client.
- `npm run android` requiere entorno Android configurado.

## Backend local

Desde `backend/`:

```bash
cd backend
npm install
vercel dev
```

La API local esperada queda en:

```text
http://localhost:3000
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
API_SECRET=el_mismo_valor_que_EXPO_PUBLIC_API_SECRET
MONGODB_URI=tu_uri_de_mongodb
```

No guardar keys reales en Git. `.env`, `.env.local`, `backend/.env.local` y variantes locales deben permanecer ignoradas.

## Web vs celular fisico

- Web en la laptop: `EXPO_PUBLIC_API_URL=http://localhost:3000`.
- Celular fisico: `localhost` apunta al telefono, no a la laptop.
- Para celular usa la IP LAN de la laptop:

```text
EXPO_PUBLIC_API_URL=http://IP_DE_TU_LAPTOP:3000
```

Ejemplo:

```text
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
```

Ambos dispositivos deben estar en la misma red Wi-Fi y el firewall debe permitir el puerto local.

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

## Verificacion rapida

```bash
npx tsc --noEmit
npm run lint -- --quiet
npm test -- --runInBand
```

Para trabajar mas rapido, ejecutar tests focalizados del modulo tocado.
