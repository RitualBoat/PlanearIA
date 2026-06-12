# Deploy de Demo Hosteada - PlanearIA

Esta guia es para tener una URL publica estable que tu profesor pueda abrir sin que tu tengas que ejecutar `npx expo start`, ngrok ni levantar la laptop.

La ruta mas facil para este repo es:

```text
GitHub repo PlanearIA
  ├─ Proyecto Vercel 1: planearia-api  -> usa la carpeta backend/
  └─ Proyecto Vercel 2: planearia-web  -> usa la raiz del repo ./
```

Vercel va a leer el mismo repositorio dos veces, pero cada proyecto apunta a una carpeta distinta.

---

## Antes de empezar

Necesitas:

- Cuenta en Vercel: https://vercel.com
- Repo subido a GitHub.
- Estos cambios ya commiteados y pusheados:
  - `package.json` con script `build:web`.
  - `vercel.json` en la raiz.
  - Esta guia.
- Tu archivo local `backend/.env.local` abierto para copiar valores. No lo subas a GitHub.

Comandos locales recomendados antes de subir:

```bash
npm run typecheck
npm run backend:check
npm run build:web
```

Si `npm run build:web` termina con `Exported: dist`, el frontend esta listo.

---

## Parte 1 - Subir cambios a GitHub

Vercel no ve tus archivos locales hasta que esten en GitHub.

Desde la raiz del repo:

```bash
git status --short
git add package.json vercel.json Documentacion/02-operacion/DEPLOY_DEMO_HOSTEADA.md
git commit -m "Prepare hosted demo deploy"
git push
```

No hagas `git add .` si tienes `.env.local` o cambios que no quieras subir.

---

## Parte 2 - Crear el backend en Vercel

Este proyecto publica tus endpoints:

```text
backend/api/health.js
backend/api/auth.js
backend/api/grupos.js
backend/api/planeaciones.js
...
```

La URL final se vera parecido a:

```text
https://planearia-api.vercel.app
```

### 2.1 Entrar a Vercel

1. Abre https://vercel.com/dashboard
2. Inicia sesion con GitHub.
3. Arriba a la derecha presiona `Add New...`.
4. Elige `Project`.

### 2.2 Importar el repo

1. Busca tu repo `PlanearIA`.
2. Presiona `Import`.
3. Veras una pantalla llamada algo como `Configure Project`.

### 2.3 Configurar carpeta del backend

En esa pantalla, busca `Root Directory`.

Pon:

```text
backend
```

Si Vercel te deja navegar carpetas:

1. Presiona `Edit` junto a `Root Directory`.
2. Selecciona la carpeta `backend`.
3. Confirma con `Continue` o `Save`.

Esto significa: "Vercel, para este proyecto ignora la app Expo y entra solo a `backend/`".

### 2.4 Configurar build del backend

En `Build and Output Settings`, para backend deja casi todo simple:

```text
Framework Preset: Other
Build Command: vacio
Output Directory: vacio
Install Command: npm install
```

Muy importante: en el proyecto `planearia-api` NO pongas `npm run build:web`.

Ese comando solo existe en el `package.json` de la raiz para el frontend. El backend usa `backend/package.json`, y ahi no existe `build:web`.

Si Vercel no te deja dejar `Build Command` vacio, usa la opcion `Override` apagada o elimina el texto del campo para que quede como valor por defecto.

Si no ves estos campos, no pasa nada. Lo importante es que `Root Directory` sea `backend` y que el backend no tenga `Build Command: npm run build:web`.

### 2.5 Agregar variables del backend

En la misma pantalla de creacion hay una seccion `Environment Variables`.

Agrega una por una. El lado izquierdo es `Name`; el lado derecho es `Value`.

Obligatorias:

```text
Name: MONGODB_URI
Value: copia el valor desde backend/.env.local

Name: API_SECRET
Value: copia el valor desde backend/.env.local

Name: JWT_SECRET
Value: copia el valor desde backend/.env.local

Name: AUTH_RESET_CODE_SECRET
Value: copia el valor desde backend/.env.local

Name: ALLOWED_ORIGINS
Value: http://localhost:8081,http://localhost:19006
```

Todavia no tenemos la URL del frontend, por eso `ALLOWED_ORIGINS` empieza solo con localhost. Luego la actualizamos.

Opcionales para IA real:

```text
OPENAI_API_KEY
OPENAI_MODEL
GROQ_API_KEY
GROQ_MODEL
OPENROUTER_API_KEY
OPENROUTER_MODEL
TOGETHER_API_KEY
TOGETHER_MODEL
AI_GATEWAY_PROVIDERS
OPENAI_TIMEOUT_MS
AI_MAX_REQUESTS_PER_ACTION
AI_LIMIT_WINDOW_MS
```

Si no configuras IA, la app debe seguir funcionando con fallbacks o errores visibles.

### 2.6 Deploy del backend

1. Presiona `Deploy`.
2. Espera a que termine.
3. Vercel te dara una URL.

Guarda esa URL. La llamaremos:

```text
BACKEND_URL=https://planear-ia-git-development-ritualboats-projects.vercel.app
```

### 2.7 Probar backend

Abre en el navegador:

```text
https://TU_BACKEND.vercel.app/api/health
```

Tambien puedes probar desde terminal:

```bash
npm run backend:health -- https://TU_BACKEND.vercel.app
```

Si responde health, el backend vive. Bonito, respira.

---

## Parte 3 - Crear el frontend web en Vercel

Este proyecto publica la app que abrira tu profesor:

```text
App.tsx
src/
assets/
```

La URL final se vera parecido a:

```text
https://planearia-web.vercel.app
```

### 3.1 Crear otro proyecto

Vuelve al dashboard:

1. Abre https://vercel.com/dashboard
2. Presiona `Add New...`.
3. Elige `Project`.
4. Vuelve a importar el mismo repo `PlanearIA`.

Si Vercel dice que el repo ya esta importado, aun puedes importarlo otra vez como otro proyecto. Cambia el nombre del proyecto para distinguirlo.

Nombre recomendado:

```text
planearia-web
```

### 3.2 Configurar carpeta del frontend

En `Root Directory`, deja:

```text
.
```

O sea: la raiz del repositorio.

No selecciones `backend` aqui. Este segundo proyecto debe ver `package.json`, `App.tsx`, `src/`, `assets/` y `vercel.json`.

### 3.3 Configurar build del frontend

En `Build and Output Settings`, pon:

```text
Framework Preset: Other
Build Command: npm run build:web
Output Directory: dist
Install Command: npm install
```

El archivo `vercel.json` de la raiz tambien dice esto, pero ponerlo en la UI ayuda a revisar que todo esta claro.

### 3.4 Agregar variables del frontend

En `Environment Variables`, agrega:

```text
Name: EXPO_PUBLIC_API_URL
Value: https://TU_BACKEND.vercel.app

Name: EXPO_PUBLIC_API_SECRET
Value: el mismo valor de API_SECRET del backend

Name: EXPO_PUBLIC_ALLOW_NATIVE_LOCALHOST
Value: false
```

Importante:

- `EXPO_PUBLIC_API_URL` debe ser la URL del backend, sin `/api/health`.
- Correcto: `https://planearia-api.vercel.app`
- Incorrecto: `https://planearia-api.vercel.app/api/health`

### 3.5 Deploy del frontend

1. Presiona `Deploy`.
2. Espera a que termine.
3. Vercel te dara una URL.

Guarda esa URL. La llamaremos:

```text
FRONTEND_URL=https://TU_FRONTEND.vercel.app
```

Esa es la URL que compartiras con tu profesor.

---

## Parte 4 - Conectar frontend y backend con CORS

Ahora el backend debe permitir llamadas desde el frontend.

### 4.1 Abrir settings del backend

1. Ve a https://vercel.com/dashboard
2. Entra al proyecto `planearia-api`.
3. Abre `Settings`.
4. En el menu lateral, entra a `Environment Variables`.

### 4.2 Editar `ALLOWED_ORIGINS`

Busca la variable:

```text
ALLOWED_ORIGINS
```

Editala para que incluya tu frontend:

```text
https://TU_FRONTEND.vercel.app,http://localhost:8081,http://localhost:19006
```

No pongas espacios entre URLs.

### 4.3 Redeploy backend

Las variables nuevas no afectan deploys viejos. Hay que redeployar.

1. En el proyecto `planearia-api`, abre `Deployments`.
2. En el ultimo deployment, abre el menu de tres puntos `...`.
3. Presiona `Redeploy`.
4. Confirma.

---

## Parte 5 - Prueba final de demo

Abre:

```text
https://TU_FRONTEND.vercel.app
```

Checklist rapido:

- [ ] La app carga sin pantalla blanca.
- [ ] Puedes entrar al flujo de login/registro.
- [ ] Puedes abrir grupos/alumnos/planeaciones.
- [ ] No hay errores de CORS en consola.
- [ ] Si usas IA, el backend responde sin 500.
- [ ] La URL funciona desde otro dispositivo o ventana anonima.

Para probar como profesor:

1. Abre una ventana de incognito.
2. Pega `FRONTEND_URL`.
3. Intenta usar la app como si no fueras tu.

---

## Donde se configura cada cosa

| Cosa                   | Donde esta                                                               |
| ---------------------- | ------------------------------------------------------------------------ |
| Codigo frontend        | Repo local: raiz, `App.tsx`, `src/`, `assets/`                           |
| Codigo backend         | Repo local: `backend/api/`, `backend/lib/`                               |
| Build web              | Repo local: `package.json` script `build:web`                            |
| Config Vercel frontend | Repo local: `vercel.json`                                                |
| Variables frontend     | Vercel Dashboard -> `planearia-web` -> Settings -> Environment Variables |
| Variables backend      | Vercel Dashboard -> `planearia-api` -> Settings -> Environment Variables |
| URL para profesor      | La URL de `planearia-web`, no la del backend                             |
| Health backend         | `https://TU_BACKEND.vercel.app/api/health`                               |

---

## Problemas comunes

### El frontend falla con `Missing script build:web`

Hay dos causas posibles.

Caso A: estabas desplegando `planearia-api`.

Entonces el problema es que pusiste `npm run build:web` en el backend. El backend no usa ese script.

Solucion:

1. Entra a Vercel -> proyecto `planearia-api`.
2. Ve a `Settings`.
3. Entra a `Build and Deployment`.
4. Busca `Build Command`.
5. Borra `npm run build:web` o apaga el override.
6. Confirma que `Root Directory` sea `backend`.
7. Ve a `Deployments`.
8. En el ultimo deploy fallido, tres puntos `...` -> `Redeploy`.

Caso B: estabas desplegando `planearia-web`.

Entonces Vercel no recibio tu cambio de `package.json` o el proyecto web esta apuntando a la carpeta incorrecta.

Solucion:

```bash
git add package.json vercel.json Documentacion/02-operacion/DEPLOY_DEMO_HOSTEADA.md
git commit -m "Prepare hosted demo deploy"
git push
```

Luego revisa en Vercel:

```text
Proyecto: planearia-web
Root Directory: .
Build Command: npm run build:web
Output Directory: dist
```

Despues redeploy frontend.

### La app carga, pero no habla con backend

Revisa en `planearia-web`:

```text
EXPO_PUBLIC_API_URL=https://TU_BACKEND.vercel.app
EXPO_PUBLIC_API_SECRET=igual a API_SECRET
```

Despues redeploy frontend.

### Sale error de CORS

Revisa en `planearia-api`:

```text
ALLOWED_ORIGINS=https://TU_FRONTEND.vercel.app,http://localhost:8081,http://localhost:19006
```

Despues redeploy backend.

### Backend falla con MongoDB

Revisa en `planearia-api`:

```text
MONGODB_URI=...
```

Tambien revisa MongoDB Atlas:

1. Entra a MongoDB Atlas.
2. Ve a `Network Access`.
3. Para demo, permite acceso desde Vercel. Si no sabes la IP de salida, la opcion rapida es `Allow Access from Anywhere`, pero solo para demo y con usuario/password fuertes.
4. Ve a `Database Access` y confirma que el usuario de la URI existe.

### Error: `No more than 12 Serverless Functions`

Este error aparece en el plan Hobby cuando Vercel detecta demasiados archivos dentro de `backend/api` y quiere convertir cada archivo en una funcion separada.

PlanearIA ya esta preparado para evitarlo:

```text
backend/api/index.js       -> unica funcion serverless visible para Vercel
backend/routes/*.js        -> handlers reales internos
backend/vercel.json        -> rewrite /api/:path* hacia /api/index.js
```

Si te sale este error, significa que Vercel esta desplegando un commit viejo o que todavia no subiste el cambio del router unico.

Solucion:

```bash
git status --short
git add backend/api/index.js backend/routes backend/vercel.json scripts/checkBackendApiStatic.mjs scripts/testBackendIsolation.mjs scripts/localBackendServer.mjs Documentacion/02-operacion/DEPLOY_DEMO_HOSTEADA.md
git commit -m "Use single Vercel API function for Hobby deploy"
git push
```

Despues:

1. Entra a Vercel -> proyecto `planearia-api`.
2. Ve a `Deployments`.
3. En el ultimo deploy fallido, tres puntos `...`.
4. Presiona `Redeploy`.
5. Asegurate de que el nuevo deployment use el commit que incluye `backend/api/index.js`.

No necesitas pagar Pro solo para esta demo.

### Le di `Redeploy` y sigue saliendo `No more than 12 Serverless Functions`

Entonces Vercel probablemente redeployo un deployment viejo, no el ultimo commit.

Verifica esto en Vercel:

1. Entra al proyecto `planearia-api`.
2. Abre `Deployments`.
3. Abre el deployment que fallo.
4. Busca el commit mostrado por Vercel.

Debe ser:

```text
871c930 Use single Vercel API function for Hobby deploy
```

Si Vercel muestra:

```text
4074a0f Prepare hosted demo deploy
```

ese es el commit viejo y por eso sigue fallando.

Soluciones:

Opcion A, desde Vercel:

1. Proyecto `planearia-api`.
2. `Deployments`.
3. Busca boton `Create Deployment`.
4. En `Git Reference`, escribe:

```text
development
```

5. Deploy.

Opcion B, desde terminal para forzar un nuevo deployment:

```bash
git commit --allow-empty -m "Trigger backend deploy"
git push origin development
```

Luego espera a que Vercel cree un deployment nuevo automaticamente.

### La URL `https://backend.vercel.app/api/health` devuelve otro mensaje

No uses esa URL salvo que Vercel te la haya dado exactamente para tu proyecto `planearia-api`.

La respuesta:

```json
{ "success": false, "message": "API端点不存在" }
```

no viene del backend actual de PlanearIA. Nuestro endpoint `/api/health` responde con `service: "PlanearIA API"`.

Para encontrar la URL correcta:

1. Entra a Vercel.
2. Abre el proyecto `planearia-api`.
3. En `Deployments`, abre el deployment exitoso mas reciente.
4. Copia la URL que aparece en `Domains` o `Deployment`.
5. Prueba:

```text
https://ESA_URL/api/health
```

La respuesta correcta debe incluir:

```json
"service": "PlanearIA API"
```

### Error: `This Serverless Function has crashed`

Si `/api/health` muestra:

```text
500: INTERNAL_SERVER_ERROR
Code: FUNCTION_INVOCATION_FAILED
```

revisa primero que el commit desplegado incluya el router con imports estaticos en:

```text
backend/api/index.js
```

El router debe tener entradas asi:

```js
"/health": require("../routes/health.js")
```

No debe usar `require(routeModule)` con strings dinamicos, porque Vercel puede no empaquetar `backend/routes/*` dentro de la funcion serverless.

Despues de corregirlo:

```bash
npm run backend:check
git add backend/api/index.js Documentacion/02-operacion/DEPLOY_DEMO_HOSTEADA.md
git commit -m "Bundle backend routes statically for Vercel"
git push origin development
```

Luego crea un deployment nuevo desde el commit mas reciente.

### Cambie una variable y no paso nada

Normal. En Vercel, cambiar variables no modifica deployments viejos.

Solucion:

1. Abre el proyecto.
2. Ve a `Deployments`.
3. Tres puntos `...`.
4. `Redeploy`.

### La URL correcta para compartir

Comparte:

```text
https://TU_FRONTEND.vercel.app
```

No compartas:

```text
https://TU_BACKEND.vercel.app
```

El backend es solo la API.

---

## Checklist si registro falla en el frontend hosteado

Si en el celular o navegador ves `Error de registro` / `No se pudo conectar al servidor`:

1. Abre la URL real del backend:

```text
https://TU_BACKEND.vercel.app/api/health
```

Debe responder con `success: true`.

2. En el proyecto frontend de Vercel revisa `Settings` -> `Environment Variables`.

Configura estas variables para el environment que estes usando (`Preview` si es URL de branch, `Production` si es dominio final):

```text
EXPO_PUBLIC_API_URL=https://TU_BACKEND.vercel.app
EXPO_PUBLIC_API_SECRET=<mismo valor que API_SECRET del backend>
```

3. En el proyecto backend revisa que `ALLOWED_ORIGINS` incluya la URL exacta del frontend:

```text
https://TU_FRONTEND.vercel.app
```

Si estas probando con una URL preview de Vercel, tambien debe estar esa URL preview exacta.
Tambien puedes usar un patron para demos preview:

```text
https://*.vercel.app
```

4. Haz `Redeploy` de ambos proyectos despues de cambiar variables.

Vercel no recompila deployments viejos cuando cambias environment variables.

## CD de builds demo

El workflow `.github/workflows/cd.yml` corre en:

- Push a `development`.
- Push a `main`.
- Tags `v*`.
- Ejecucion manual desde `Actions` -> `CD Builds` -> `Run workflow`.

El release generado sube:

- `planearia-web-<commit>.zip`
- `planearia-web-<commit>.zip.sha256`
- `planearia-android-debug-<commit>.apk` si el job Android termina correctamente.
- `planearia-android-debug-<commit>.apk.sha256`

---

## Advertencia de seguridad

Para esta demo, `EXPO_PUBLIC_API_SECRET` queda dentro del bundle web. Eso significa que no es un secreto real. Sirve para una demo escolar controlada, pero antes de beta publica debes cerrar el plan de Auth/Sesion Real: JWT, roles, permisos, rate limiting y aislamiento por usuario.

---

## Fuentes

- Expo Web exporta el sitio con `npx expo export -p web` y deja archivos en `dist/`.
- Expo documenta Vercel con `buildCommand`, `outputDirectory`, `framework: null` y rewrites SPA.
- Vercel permite crear proyectos desde Git con `New Project`, elegir root directory, build/output settings y environment variables.
