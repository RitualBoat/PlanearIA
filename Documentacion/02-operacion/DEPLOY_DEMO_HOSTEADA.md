# Deploy de Demo Hosteada - PlanearIA

> Objetivo: tener una URL publica estable para que un profesor pueda probar PlanearIA sin `expo start`, ngrok ni la laptop encendida.

## Ruta Recomendada

Usar dos proyectos en Vercel desde el mismo repositorio:

- `planearia-api`: backend serverless desde la carpeta `backend/`.
- `planearia-web`: frontend Expo Web estatico desde la raiz del repo.

Esta ruta encaja con el repo actual porque el backend ya esta preparado como funciones Vercel en `backend/api`, y Expo Web puede exportarse como sitio estatico en `dist/`.

## 1. Backend en Vercel

Crear o revisar un proyecto Vercel para la carpeta `backend/`.

Configuracion:

```text
Framework Preset: Other
Root Directory: backend
Build Command: vacio o por defecto
Output Directory: vacio
Install Command: npm install
```

Variables obligatorias en Vercel, proyecto backend:

```text
MONGODB_URI=...
API_SECRET=...
JWT_SECRET=...
AUTH_RESET_CODE_SECRET=...
ALLOWED_ORIGINS=https://planearia-web.vercel.app,http://localhost:8081,http://localhost:19006
```

Variables IA opcionales:

```text
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4o-mini
OPENAI_TIMEOUT_MS=20000
GROQ_API_KEY=...
OPENROUTER_API_KEY=...
TOGETHER_API_KEY=...
```

Despues del deploy, validar:

```bash
npm run backend:health -- https://TU_BACKEND.vercel.app
```

Debe responder `/api/health`.

## 2. Frontend Web en Vercel

Crear un segundo proyecto Vercel apuntando a la raiz del repo.

Configuracion:

```text
Framework Preset: Other
Root Directory: .
Build Command: npm run build:web
Output Directory: dist
Install Command: npm install
```

El archivo `vercel.json` de la raiz ya fija el build, el output y el rewrite de SPA hacia `index.html`.

Variables obligatorias en Vercel, proyecto frontend:

```text
EXPO_PUBLIC_API_URL=https://TU_BACKEND.vercel.app
EXPO_PUBLIC_API_SECRET=el_mismo_valor_que_API_SECRET
EXPO_PUBLIC_ALLOW_NATIVE_LOCALHOST=false
```

Importante: las variables `EXPO_PUBLIC_*` quedan embebidas en el bundle web. Para demo academica sirve, pero `EXPO_PUBLIC_API_SECRET` no debe tratarse como secreto real de seguridad. El plan de Auth/Sesion debe reemplazar este contrato por JWT/roles/permisos reales antes de beta publica.

## 3. Orden Seguro Para La Demo

1. Desplegar backend.
2. Copiar la URL del backend.
3. Agregar esa URL a `EXPO_PUBLIC_API_URL` en el proyecto frontend.
4. Agregar la URL final del frontend a `ALLOWED_ORIGINS` del backend.
5. Redeploy backend si cambiaste `ALLOWED_ORIGINS`.
6. Redeploy frontend si cambiaste `EXPO_PUBLIC_API_URL` o `EXPO_PUBLIC_API_SECRET`.
7. Probar login, grupos, alumnos, planeaciones y algun flujo con IA si configuraste proveedor IA.

## 4. Comandos Locales Antes De Subir

```bash
npm run typecheck
npm run backend:check
npm run build:web
```

Si `npm run build:web` genera `dist/`, el frontend esta listo para hosting estatico.

## 5. Opcion Mas Simple Si Hay Prisa

Si ya tienes cuenta Vercel y el repo esta en GitHub:

1. Importa el repo dos veces en Vercel.
2. Primer proyecto: Root Directory `backend`.
3. Segundo proyecto: Root Directory `.`.
4. Configura las variables anteriores.
5. Comparte la URL del frontend, no la del backend.

## 6. Alternativas

- Render Static Site: viable para el frontend, pero el backend actual ya esta mas cerca de Vercel Functions.
- Render Web Service: util si decides migrar a un servidor Express persistente; no es necesario ahora.
- Cloudflare Pages: buena opcion para frontend estatico, pero tendrias que mantener backend en Vercel o migrarlo.
- Expo EAS Update/Build: sirve para app movil, no reemplaza la URL web que el profesor abre desde navegador.

Decision vigente para esta demo: Vercel frontend + Vercel backend.
