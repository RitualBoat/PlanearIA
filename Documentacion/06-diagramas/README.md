# Diagramas de Arquitectura - PlanearIA

Diagramas tecnicos en Mermaid generados a partir del codigo real del repositorio
(backend, `src/sync`, `.github/workflows`, navegacion y estructura de carpetas).

Cada diagrama tiene su archivo fuente `.mmd` y esta embebido aqui. GitHub y VS Code
renderizan los bloques ` ```mermaid ` automaticamente.

## Indice

1. [Arquitectura del Backend](#1-arquitectura-del-backend) - `01-arquitectura-backend.mmd`
2. [App: flujo de usuario y capas MVVM](#2-app-flujo-de-usuario-y-capas-mvvm) - `02-app-flujo-usuario.mmd`
3. [App: estructura de carpetas](#3-app-estructura-de-carpetas) - `03-app-estructura-carpetas.mmd`
4. [Flujo CI/CD](#4-flujo-cicd) - `04-ci-cd.mmd`
5. [Sincronizacion offline-first](#5-sincronizacion-offline-first) - `05-sincronizacion-offline-first.mmd`

## Como verlos o exportarlos a imagen

Las imagenes ya estan pre-renderizadas en `img/` (SVG vectorial y PNG @2x). No hace falta
ejecutar nada para verlas; abre los archivos de esa carpeta. Para regenerarlas tras editar un
`.mmd`, usa los comandos de mermaid-cli mas abajo.

- GitHub: abre este `README.md` en el repo; los diagramas se renderizan solos.
- VS Code: instala la extension "Markdown Preview Mermaid Support" y abre la vista previa
  (Ctrl+Shift+V), o "Mermaid Editor" para los `.mmd`.
- Web sin instalar nada: pega el contenido de un `.mmd` en https://mermaid.live y exporta a PNG/SVG.
- Generar imagenes localmente (vectoriales y nitidas) con mermaid-cli:

  ```bash
  # desde Documentacion/06-diagramas
  npx -y @mermaid-js/mermaid-cli -i 01-arquitectura-backend.mmd -o img/01-arquitectura-backend.svg
  npx -y @mermaid-js/mermaid-cli -i 02-app-flujo-usuario.mmd -o img/02-app-flujo-usuario.svg
  npx -y @mermaid-js/mermaid-cli -i 03-app-estructura-carpetas.mmd -o img/03-app-estructura-carpetas.svg
  npx -y @mermaid-js/mermaid-cli -i 04-ci-cd.mmd -o img/04-ci-cd.svg
  npx -y @mermaid-js/mermaid-cli -i 05-sincronizacion-offline-first.mmd -o img/05-sincronizacion-offline-first.svg
  ```

  Cambia la extension de salida a `.png` para PNG. La primera ejecucion descarga Chromium
  (lo usa puppeteer); requiere conexion a internet.

---

## 1. Arquitectura del Backend

Node serverless en Vercel con router unico (`backend/api/index.js`) que despacha a los
handlers de `backend/routes`. Toda ruta academica valida JWT y aisla por `userId`, crea sus
indices de forma idempotente y reutiliza la conexion cacheada a MongoDB Atlas. La IA pasa por
un gateway multi-provider; las API keys viven solo en el backend.

```mermaid
flowchart TB
    subgraph clients["Clientes"]
        web["App Web<br/>(react-native-web)"]
        apk["App Android<br/>(APK standalone)"]
        expo["Expo Go / dev-client"]
    end

    subgraph vercel["Vercel Serverless (Node)"]
        router["api/index.js<br/>router unico + normalizeApiPath + CORS"]

        subgraph routes["backend/routes (handlers)"]
            acad["Academico (sync por entidad)<br/>grupos, alumnos, unidades, asistencias,<br/>calificaciones, entregables, recursos,<br/>plantillas, planeaciones, sync"]
            social["Social<br/>posts, contactos, mensajes, notificaciones"]
            authr["auth.js<br/>login / registro / recuperar"]
            ai["IA<br/>planeaciones/(copiloto, generar, mejorar,<br/>escanear-plantilla), classroom/copiloto"]
            health["health.js"]
        end

        subgraph libs["backend/lib"]
            authlib["auth.js<br/>validateAuth, getScopeUserId, ownsDoc, CORS"]
            tokens["tokens.js (JWT)"]
            passwords["passwords.js (bcrypt)"]
            rate["rateLimit.js"]
            sessions["authSessions.js / resetCodes.js"]
            mongolib["mongodb.js<br/>cliente cacheado"]
            idx["databaseIndexes.js<br/>createIndex idempotente"]
            aigw["aiGateway.js<br/>cascada multi-provider"]
            ailimit["aiUsageLimiter.js"]
        end
    end

    subgraph data["Datos y servicios externos"]
        mongo[("MongoDB Atlas M0<br/>planeariaDB<br/>aislado por userId")]
        providers["Proveedores IA OpenAI-compatible<br/>OpenRouter / Groq / OpenAI"]
    end

    web -->|"HTTPS + JWT Bearer"| router
    apk -->|"HTTPS + JWT Bearer"| router
    expo -->|"HTTPS + JWT Bearer"| router

    router --> acad
    router --> social
    router --> authr
    router --> ai
    router --> health

    acad -->|"validateAuth + userId scope"| authlib
    social --> authlib
    authr --> authlib
    authlib --> tokens
    authr --> passwords
    authr --> sessions
    authr --> rate

    acad -->|"connectToDatabase"| mongolib
    social --> mongolib
    authr --> mongolib
    acad -.->|"ensureIndexes por endpoint"| idx
    mongolib --> mongo
    idx --> mongo

    ai --> aigw
    ai --> ailimit
    aigw --> providers
```

---

## 2. App: flujo de usuario y capas MVVM

Arranque de la app, decision de sesion (login / registro / invitado), onboarding y entrada a
los tabs. Cada modulo respeta el patron MVVM: View (pantalla) -> ViewModel (hook) ->
Model (context) -> Services/Sync -> persistencia local y backend.

```mermaid
flowchart TD
    start(["Inicio (App.tsx)"]) --> providers["Providers globales<br/>Auth, Sync, Theme, FontSize, Daltonismo,<br/>Grupos, Alumnos, Recursos, ..."]
    providers --> authCheck{"Sesion valida?"}

    authCheck -->|"No"| authStack["Stack Auth<br/>Login / Registro / Recuperar contrasena"]
    authStack -->|"login ok"| authCheck
    authStack -->|"continuar como invitado"| guest["Modo invitado<br/>(solo local, sin sync remoto)"]

    authCheck -->|"Si"| onboarding{"Onboarding visto?"}
    onboarding -->|"No"| onb["Onboarding"]
    onboarding -->|"Si"| tabs
    onb --> tabs
    guest --> tabs

    subgraph tabs["AppTabsNavigator (barra inferior)"]
        feed["Feed"]
        recursos["Recursos / Contenido"]
        classroom["Classroom (Grupos)"]
        social["Social"]
        config["Configuracion"]
    end

    classroom --> grupos["Grupo -> Tablon, Personas,<br/>Unidades, Tareas, Asistencia, Calificaciones"]
    recursos --> plan["Planeaciones (editor tipo Word/Docs + IA)"]
    recursos --> biblio["Biblioteca / Plantillas"]
    social --> chat["Chat / Contactos"]
    config --> cuenta["Perfil / Cuenta / Accesibilidad"]

    subgraph mvvm["Patron MVVM por pantalla"]
        direction LR
        view["View<br/>screens/*Screen.tsx"] --> viewmodel["ViewModel<br/>hooks/use*ViewModel.ts"]
        viewmodel --> model["Model<br/>context/*Context.tsx"]
        model --> svc["Services + Sync<br/>services/, sync/, utils/apiClient"]
        svc --> persist[("Persistencia local<br/>AsyncStorage default<br/>SQLite opt-in")]
        svc -->|"online"| remote["Backend Vercel + MongoDB"]
    end

    tabs -.->|"cada modulo usa"| mvvm
```

---

## 3. App: estructura de carpetas

Mapa del repositorio: entry point, frontend `src/`, backend serverless, tipos, documentacion,
ground truth, skills y workflows.

```mermaid
flowchart LR
    root["PlanearIA/"]

    root --> appentry["App.tsx (entry point)"]
    root --> src["src/ (frontend)"]
    root --> backend["backend/ (serverless)"]
    root --> types["types/ (tipos TS centralizados)"]
    root --> doc["Documentacion/ (00-fundamentos ... 06-diagramas)"]
    root --> ctx["context/ (ground truth, stitch-results)"]
    root --> agents[".agents/skills/ (writing-style, token-efficiency)"]
    root --> gh[".github/workflows/ (ci.yml, cd.yml)"]
    root --> scripts["scripts/ (backend local, smoke, isolation)"]
    root --> assets["assets/  ·  shared/  ·  dist/"]

    src --> screens["screens/ (Views)<br/>classroom, planeaciones, alumnos, grupos,<br/>feed, social, chat, auth, biblioteca, ..."]
    src --> hooks["hooks/ (ViewModels)"]
    src --> context["context/ (Providers: Auth, Sync, Grupos,<br/>Alumnos, Theme, ...)"]
    src --> services["services/ (auth, push, classroom I/O)"]
    src --> sync["sync/ (motor offline-first)"]
    src --> nav["navigation/ (StackNavigator, AppTabsNavigator)"]
    src --> components["components/ (SyncStatusBanner, modales, ...)"]
    src --> themes["themes/ (colors, tokens)"]
    src --> utils["utils/ (apiClient, logger, networkErrors)"]
    src --> tests["__tests__/ (Jest)"]
    src --> locales["locales/ (i18n)"]

    sync --> syncsvc["services/<br/>entitySync, syncEngine, syncEvents,<br/>connectivity, syncQueueSqlite*"]
    sync --> synccfg["config/apiConfig.ts"]

    backend --> api["api/index.js (router)"]
    backend --> broutes["routes/ (CRUD academico + social + IA + auth)"]
    backend --> blib["lib/ (auth, tokens, passwords, mongodb,<br/>aiGateway, aiUsageLimiter, rateLimit, ...)"]
```

---

## 4. Flujo CI/CD

`ci.yml` corre en PR y push a `main`/`development` (typecheck, lint, jest, backend smoke).
`cd.yml` construye web y APK Android y publica un GitHub Release. El backend y la web hosteada
se despliegan en Vercel mediante su integracion Git (fuera de Actions).

```mermaid
flowchart TB
    subgraph triggers["Disparadores"]
        pr["Pull Request<br/>-> main / development"]
        push["Push<br/>-> main / development"]
        tag["Tag v*"]
        manual["workflow_dispatch (manual)"]
    end

    subgraph ci["CI .github/workflows/ci.yml (jobs en paralelo)"]
        tc["typecheck<br/>npx tsc --noEmit"]
        lint["lint<br/>npm run lint -- --quiet"]
        test["test<br/>npm test -- --runInBand"]
        smoke["backend smoke<br/>backend:check (static API + isolation)"]
    end

    subgraph cd["CD .github/workflows/cd.yml"]
        webjob["web<br/>typecheck + expo export --platform web<br/>-> zip + sha256"]
        androidjob["android<br/>prebuild + gradlew assembleRelease<br/>-> APK + sha256 (continue-on-error)"]
        release["release<br/>publica GitHub Release (needs web)"]
        webjob --> release
        androidjob --> release
    end

    pr --> ci
    push --> ci
    push --> cd
    tag --> cd
    manual --> cd

    ci -->|"estado verde requerido"| mergeok(["Merge / branch verde"])
    release --> ghrel[("GitHub Releases<br/>web bundle + APK demo")]

    subgraph deploy["Deploy hosteado (integracion Git de Vercel, fuera de Actions)"]
        vercelbe["Vercel: backend serverless<br/>(/api/*)"]
        vercelweb["Vercel: web hosteada<br/>planearia-web.vercel.app"]
    end

    push -.->|"auto-deploy Vercel"| vercelbe
    push -.->|"auto-deploy Vercel"| vercelweb
```

---

## 5. Sincronizacion offline-first

Como fluyen los datos: escritura optimista local primero, cola por entidad en el motor
`src/sync`, push y luego pull autoritativo desde MongoDB Atlas via la API de Vercel, con
reconciliacion contra operaciones pendientes. Un pull fallido nunca toca el storage local.

### 5a. Vista de arquitectura

```mermaid
flowchart TB
    subgraph device["Dispositivo (offline-first)"]
        ui["Pantalla (View)"]
        vm["Hook ViewModel"]
        context["Context / Provider<br/>(verdad en memoria)"]

        subgraph local["Persistencia local"]
            asyncs[("AsyncStorage<br/>@planearia:* (default)")]
            sqlite[("SQLite (opt-in)<br/>cola sync / datos relacionales")]
        end

        subgraph engine["Motor src/sync"]
            queue["syncEngine<br/>cola FIFO por entidad<br/>@planearia:pending_ops_v2_*<br/>reintentos (max 5) + LWW"]
            entity["entitySync<br/>SYNC_ENTITIES + reconcileWithPending"]
            orch["SyncContext (orquestador)<br/>triggers: startup, login, reconnect,<br/>foreground, polling 12s, manual"]
            conn["connectivity (NetInfo)"]
            events["syncEvents<br/>entity-updated -> refresca contexts"]
        end

        banner["SyncStatusBanner<br/>offline / servidor caido / re-login"]
    end

    apiclient["utils/apiClient<br/>HTTPS + JWT Bearer"]
    api["Vercel API<br/>/api/:entidad"]
    mongo[("MongoDB Atlas<br/>aislado por userId")]

    ui --> vm --> context
    context -->|"1. escritura optimista (UI inmediata)"| local
    context -->|"2. queueEntityOperation"| queue

    orch -->|"syncAllEntities"| entity
    entity -->|"PUSH: flushQueue"| queue
    queue -->|"POST / PUT / DELETE (idempotente)"| apiclient
    entity -->|"PULL: GET ?limit=500"| apiclient
    apiclient <-->|"JSON"| api
    api <-->|"CRUD por userId + indices"| mongo

    entity -->|"reconcilia remoto + pendientes<br/>(pull fallido NO toca local)"| asyncs
    asyncs --> events --> context
    conn --> orch
    orch --> banner

    queue -. "invitado / dev-local / API no configurada<br/>= 100% local, sin red" .-> local
```

### 5b. Secuencia: escribir offline y sincronizar al reconectar

```mermaid
sequenceDiagram
    actor U as Usuario
    participant V as Pantalla + ViewModel
    participant C as Context
    participant L as AsyncStorage (local)
    participant Q as syncEngine (cola)
    participant O as SyncContext (orquestador)
    participant A as Vercel API
    participant M as MongoDB Atlas

    Note over U,L: Sin conexion
    U->>V: Crea / edita / borra
    V->>C: accion del ViewModel
    C->>L: escritura optimista (UI ya actualizada)
    C->>Q: queueEntityOperation (encola)
    Q-->>C: pendiente (sin red, sin penalizar reintentos)

    Note over O,M: Vuelve la conexion (reconnect / polling 12s / foreground)
    O->>Q: syncAllEntities -> flushQueue (PUSH)
    Q->>A: POST / PUT / DELETE (idempotente, JWT)
    A->>M: upsert / delete por userId
    M-->>A: ok
    A-->>Q: 2xx -> saca op de la cola

    O->>A: GET /api/:entidad?limit=500 (PULL)
    A->>M: find por userId
    M-->>A: lista autoritativa
    A-->>O: data
    O->>O: reconcileWithPending (conserva trabajo offline)
    O->>L: persiste (solo si hubo cambios)
    O->>C: syncEvents entity-updated -> recarga UI

    Note over O,A: Si el PULL falla (5xx / red): NO toca el storage local; banner y reintento
```

---

## Notas de fidelidad

- Los diagramas reflejan el codigo en `development` al 2026-06-16.
- Fuentes verificadas: `backend/api/index.js`, `backend/routes/*`, `backend/lib/{auth,mongodb,aiGateway}.js`,
  `src/sync/services/{entitySync,syncEngine}.ts`, `src/sync/config/apiConfig.ts`,
  `src/context/SyncContext.tsx`, `.github/workflows/{ci,cd}.yml`, `package.json`.
- Las entidades con sync por registro estan en `SYNC_ENTITIES`; `planeaciones` y `notificaciones`
  usan tareas custom via `registerSyncTask`.
