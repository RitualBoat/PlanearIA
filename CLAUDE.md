<!-- GENERADO por scripts/syncAgentHarness.mjs desde .agents/. No editar a mano: correr `npm run agent:harness:sync`. -->

# PlanearIA - Shared Agent Context

> **Estado:** vigente.
> **Uso:** contexto largo compartido para agentes (entrada de Claude Code).
> **Fuente de verdad:** codigo real, `openspec/specs/`, `openspec/config.yaml`, `Documentacion/00-fundamentos/`.
> **No usar para:** sustituir evidence gates, specs archivadas o validacion local.
> **Especifico de Claude Code:** permisos en `.claude/settings.json`, comandos `/opsx:*`, skills en `.claude/skills/`. Reglas por path en `.claude/rules/`.

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

- GitNexus: primario para preguntas estructurales de codigo, flujos MVVM, call chains, dependencias,
  backend/IA, sync/offline e impacto. Usar `npx -y gitnexus@latest status` para frescura y
  `npx -y gitnexus@latest analyze --index-only --name PlanearIA .` para reindexar sin inyectar archivos
  de agente.
- CodeGraph: secundario/fallback para fuente lineada estilo Read, simbolos puntuales y comprobacion cuando
  GitNexus sea ambiguo, este stale o no devuelva suficiente contexto editable.
- No usar GitNexus y CodeGraph por reflejo en la misma pregunta; usar el segundo solo si el primero falla,
  omite un archivo clave o el change pide comparacion de evidencia.
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
