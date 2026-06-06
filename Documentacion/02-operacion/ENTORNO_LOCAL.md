# Entorno Local - PlanearIA

> Estado: guia base creada desde `Documentacion/01-planes-maestros/PLAN_PASOS_INICIALES.md`.

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
| `npm run backend:deploy` | Ejecuta deploy del backend; usar solo con decision explicita. |

