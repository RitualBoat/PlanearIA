## Producto

PlanearIA es una suite docente offline-first para profesores mexicanos. Integra herramientas familiares para crear, organizar, asignar, comunicar y dar seguimiento sin saltar entre pestanas, archivos, chats y plataformas externas.

Experiencias objetivo:

- Escritorio Docente.
- Office Docente: NotasPLAN, CalcuPLAN y PresentaPLAN.
- Clases / Classroom.
- AsistePLAN: ChatGPT/Gemini docente con adjuntos reales.
- DisenaPLAN: Canva/Genially docente.
- ConectaPLAN: comunicacion profesional docente.
- AgendaPLAN, ReportaPLAN, cuenta, seguridad y accesibilidad.

Principio rector: familiaridad primero, conexion nativa despues. La IA propone; el docente decide.

## Stack

- React Native 0.81.5 + Expo SDK 54 + TypeScript 5.9.
- React Navigation 7.
- React Context + hooks como ViewModels.
- AsyncStorage como default local.
- Expo SQLite instalado como opt-in, no default.
- Expo SecureStore para tokens nativos; AsyncStorage como fallback web.
- Backend Node serverless en `backend/api/index.js` + `backend/routes`.
- MongoDB Atlas M0.
- JWT auth con refresh sessions.
- IA mediante `backend/lib/aiGateway.js` y `backend/lib/aiUsageLimiter.js`.
- CI/CD con GitHub Actions y Vercel.

## Reglas Arquitectonicas

- Monolito modular y MVVM pragmatico.
- Screens delgadas; hooks como ViewModels; Context para estado compartido; services/repositories para I/O.
- Datos academicos sincronizables usan `src/sync`; no crear clientes HTTP ni colas paralelas.
- Toda entidad multiusuario filtra por `userId`.
- IA solo via backend; nunca keys ni URLs privadas de proveedores en frontend.
- Correcciones IA no sobrescriben originales sin confirmacion; generan copia, borrador, diff o resumen revisable.
- SQLite sigue opt-in hasta aprobacion explicita con migracion, validacion y rollback.
- No borrar claves legacy `@planearia:*` sin migracion validada y rollback.
- Presupuesto bajo/cero; no microservicios ni infraestructura cara sin peticion explicita y tradeoffs.
- Web/tablet/movil parten de una pantalla madre responsiva; archivos `.web.tsx`/`.native.tsx` requieren justificacion.

## Lectura Por Defecto

1. `Documentacion/README.md`.
2. `Documentacion/05-context-engineering/README.md`.
3. `Documentacion/00-fundamentos/RESUMEN_EJECUTIVO.md`.
4. `Documentacion/00-fundamentos/VISION_ACTUAL.md`.
5. `Documentacion/00-fundamentos/ARQUITECTURA.md`.
6. `Documentacion/00-fundamentos/FLUJO_SINCRONIZACION.md`.
7. `Documentacion/00-fundamentos/IA_CHATBOT_LLM.md`.
8. `Documentacion/01-planes-maestros/meta_guia_planes.md`.
9. Plan activo, spec OpenSpec o carpeta `context/` relacionada.

## OpenSpec SDD

PlanearIA usa OpenSpec para cambios de producto no triviales. Config activa: `openspec/config.yaml`.

Flujo formal:

```text
Paso 0 - Creacion: issue GitHub / item Project
Paso 1 - Enrich: criterios de aceptacion observables
Paso 2 - Propose & Apply: proposal/design/spec/tasks + implementacion tarea por tarea
Paso 3 - Audit & QA: evidencia tecnica y visual; adversarial review; archive
Paso 4 - Cierre: PR/merge de GitHub hacia development y borrado de la rama (npm run opsx:finish)
```

Reglas:

- El issue/user story y su item en PlanearIA Product OS son obligatorios antes de enrich, explore o
  propose para todo change SDD no trivial. Solo un hotfix trivial autorizado explicitamente puede saltarlo.
- El issue se enriquece antes de proponer.
- Un change grande a la vez.
- `proposal.md` define why/what/no objetivos.
- Specs usan `SHALL` + escenarios WHEN/THEN.
- `tasks.md` contiene tareas tecnicas pequenas.
- `[x]` solo con evidencia.
- UI visible requiere Playwright por breakpoint; navegar solo despues de que `expo start --web` responda HTTP 200.
- `openspec/specs/` es verdad de comportamiento; se actualiza con archive/sync, no a mano.
- Tras archivar, cerrar la rama del change con `npm run opsx:finish`: publica la rama, crea o reutiliza un PR hacia `development`, espera los checks requeridos y ordena el merge a GitHub. Nunca hace push directo al target protegido; tras confirmar el merge remoto actualiza `development` local y borra la rama local. Previsualiza con `npm run opsx:finish:dry`.

Skills utiles por agente:

- Claude: `/opsx:*`, `/enrich-us`, `/adversarial-review`.
- Codex: `$openspec-explore`, `$openspec-propose`, `$openspec-apply-change`, `$openspec-sync-specs`, `$openspec-archive-change`.

## Planes

- Activo: `Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md`.
- Activo/en cierre: `Documentacion/01-planes-maestros/PLAN_AUTH_SEGURIDAD_SESION_REAL.md`.
- Cerrados: planeaciones, classroom, pasos iniciales, infraestructura local/CI/deploy, SQLite opt-in.
- Roadmap: `Documentacion/00-fundamentos/ROADMAP_PLANES_MAESTROS.md`.

Los planes cerrados prueban funcionalidad; no bloquean redisenios UX/UI.

## MCPs

Ruteo de RAGs de conocimiento (IMPLICITO: consulta el RAG correcto de forma directa,
sin deliberar ni pedir permiso ni releer archivos a mano; asi no se gastan tokens):

- GitNexus: PRIMARIO para casi cualquier consulta estructural de codigo (flujos MVVM, call chains,
  dependencias, backend/IA, sync/offline, impacto). Es el default de toda IA/agente para entender el codigo.
  Frescura: `npm run gitnexus:diagnose`; reparacion local: `npm run gitnexus:repair`; gate de salud:
  `npm run gitnexus:verify`. La version queda fijada dentro del wrapper y la reparacion usa siempre
  `--repair-fts --index-only` para no inyectar archivos de agente. CodeGraph entra como fallback si este
  contrato falla o no entrega el contexto requerido.
- CodeGraph: FALLBACK cuando GitNexus no da el detalle exacto de UN archivo o simbolo especifico
  (fuente lineada estilo Read, comprobacion puntual), esta stale o resulta ambiguo. No usar junto a GitNexus
  por reflejo; solo si el primero falla, omite un archivo clave o el change pide comparacion de evidencia.
- Graphify: para preguntas ABIERTAS y de alto nivel sobre el proyecto (vision, alcance, contexto,
  recomendaciones estrategicas: "cual es la vision actual?", "que recomiendas?", "deberia cambiar el alcance
  o el contexto?") y como apoyo AL ACTUALIZAR documentacion. Grafo de conocimiento sobre codigo + docs.
  Consulta via MCP `graphify` o CLI: `graphify query "<pregunta>"`, `graphify path "A" "B"`, `graphify explain "X"`.
  Reconstruir: `npm run graphify:build` (codigo, local, sin API) o `npm run graphify:build:full` (agrega la capa
  semantica de docs; requiere un backend LLM). No usar Graphify para detalle fino de un simbolo: eso es GitNexus/CodeGraph.
- GitHub: issues, PRs, tracking operativo.
- Context7: APIs/librerias actuales.
- Figma: ground truth visual.
- Playwright: QA visual web obligatoria para UI.
- Expo/Vercel: diagnostico operativo.
- PlanearIA SQLite: inspeccion read-only de SQLite opt-in.

Detalle: `Documentacion/02-operacion/MCP_FLUJOS_PLANEARIA.md`.

## Ground Truth

Para paridad alta, usar `context/<modulo>-ground-truth/` y Figma cuando exista:

- Office: Word/Docs, Excel/Sheets, PowerPoint/Slides.
- AsistePLAN: ChatGPT/Gemini/NotebookLM.
- Clases: Google Classroom/Classroomio.
- DisenaPLAN: Canva/Genially.
- ConectaPLAN: WhatsApp profesional.

Referencias open source son inspiracion y analisis; no son codigo de PlanearIA.

## Validacion

Comandos base:

```bash
npm run typecheck
npm run lint -- --quiet
npm test -- --runInBand
npm run test:classroom
npm run test:planeaciones
npm run test:sync
npm run backend:check
```

Por tipo:

- UI: Playwright + capturas por breakpoint + checklist Nielsen.
- Sync/datos: offline -> reconexion -> otro dispositivo/backend -> sin perdida local.
- IA: exito, proveedor ausente, error temporal, limites, confirmacion docente.
- Backend/auth: `userId`, JWT, sesiones, rate limit, no secretos.

## Review

Priorizar en revision: bugs, perdida de datos, auth/aislamiento por `userId`, sync, botones muertos, estados loading/empty/error/offline, accesibilidad y evidencia faltante.

## Estilo

- Espanol aceptado en docs y texto usuario.
- Sin emojis en codigo, docs, commits ni logs.
- Lenguaje practico y claro.
- Comentarios explican por que, no que.

## Python

Ejecutable local:

```text
C:/Users/RitualBoatLaptop/AppData/Local/Programs/Python/Python314/python.exe
```
