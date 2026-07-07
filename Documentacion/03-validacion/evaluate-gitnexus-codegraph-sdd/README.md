# Evaluacion GitNexus vs CodeGraph para SDD

> Estado: completado.
> Change OpenSpec: `evaluate-gitnexus-codegraph-sdd`.
> Issue: https://github.com/RitualBoat/PlanearIA/issues/40
> Fecha de inicio: 2026-07-07.
> Fecha de cierre: 2026-07-07.

## 1. Baseline

### Issue y Project

- Issue: `#40 Evaluar GitNexus vs CodeGraph para el flujo SDD de agentes IA`.
- URL: https://github.com/RitualBoat/PlanearIA/issues/40
- Estado: `OPEN`.
- Project: `PlanearIA Product OS`.
- Project status: `Backlog`.
- Labels: `change`, `infra`, `docs`, `testing`, `low-cost`.
- Change OpenSpec: `openspec/changes/evaluate-gitnexus-codegraph-sdd/`.
- Validacion inicial: `openspec validate --all --strict --json` paso `10/10` antes de apply.

### Instrucciones activas que priorizan CodeGraph

Comando:

```powershell
rg -n "CodeGraph|GitNexus|knowledge graph|codegraph|gitnexus" AGENTS.md CLAUDE.md openspec/config.yaml Documentacion/02-operacion/MCP_FLUJOS_PLANEARIA.md Documentacion/05-context-engineering/README.md Documentacion/01-planes-maestros/meta_guia_planes.md Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md
```

Resultados relevantes:

| Archivo | Hallazgo |
| --- | --- |
| `AGENTS.md` | Indica que CodeGraph debe usarse antes de grep/find o lectura de codigo en repos indexados. |
| `CLAUDE.md` | Lista CodeGraph como primero para preguntas estructurales, flujos, dependencias e impacto. |
| `openspec/config.yaml` | Inyecta CodeGraph en propose/apply para preguntas estructurales y en D15 de design/apply. |
| `Documentacion/02-operacion/MCP_FLUJOS_PLANEARIA.md` | Declara CodeGraph como primer MCP para preguntas estructurales y lo ubica en enrich/propose/apply. |
| `Documentacion/05-context-engineering/README.md` | Dice que la IA verifica codigo real con CodeGraph cuando toca implementacion. |
| `Documentacion/01-planes-maestros/meta_guia_planes.md` | Usa CodeGraph en enrich, propose, apply y cierre del ciclo SDD. |
| `Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md` | D15 exige partir de CodeGraph para inventario y blast radius; seccion 1.9.5 lo describe como herramienta verificada. |

Conclusion baseline: el repo esta claramente en modo CodeGraph-first. Cualquier adopcion de GitNexus debe actualizar todas estas fuentes o dejar una politica dual sin contradicciones.

### Estado actual de CodeGraph

Comando:

```powershell
npm run codegraph:status
```

Resultado:

```text
Project: C:\Users\jarco\dev\PlanearIA
Files: 379
Nodes: 4,651
Edges: 11,863
DB Size: 38.58 MB
Backend: node:sqlite - built-in (full WAL)
Journal: wal
Files by Language: tsx 179, typescript 140, javascript 51, yaml 9
[OK] Index is up to date
```

Artefactos locales:

| Archivo | Estado |
| --- | --- |
| `.codegraph/codegraph.db` | Existe, 38.58 MB aprox, actualizado el 2026-07-07. |
| `.codegraph/codegraph.db-shm` | Existe. |
| `.codegraph/codegraph.db-wal` | Existe. |
| `.codegraph/daemon.log` | Existe. |
| `.codegraph/daemon.pid` | Existe. |

Scripts disponibles en `package.json`:

- `npm run codegraph:init`
- `npm run codegraph:status`
- `npm run codegraph:sync`
- `npm run codegraph:explore -- "<pregunta>"`

Limitaciones baseline:

- Aun no hay evidencia comparativa de que CodeGraph ahorre tokens o mejore precision en PlanearIA.
- El indice esta sano, por lo que cualquier bajo rendimiento observado no se puede atribuir de entrada a un indice roto.
- Las mediciones de tokens exactos no estan disponibles; se usaran proxies: numero de tool calls, volumen de salida, archivos relevantes/irrelevantes, follow-up reads y first-pass usefulness.

## 2. Matriz comparativa

### GitNexus setup controlado

Fuentes primarias consultadas:

- README/repositorio oficial: https://github.com/abhigyanpatwari/GitNexus
- Docs oficiales de instalacion: https://abhigyanpatwari-gitnexus.mintlify.app/installation
- NPM package metadata via `npm view gitnexus ...`
- Issue Windows relevante: https://github.com/abhigyanpatwari/GitNexus/issues/1400

Entorno local:

```text
Node: v22.19.0
npm: 10.9.3
GitNexus latest: 1.6.9
GitNexus rc: 1.6.10-rc.7
License: PolyForm-Noncommercial-1.0.0
Repository: https://github.com/abhigyanpatwari/GitNexus.git
```

Comandos de preparacion:

```powershell
npx -y gitnexus@latest --help
npx -y gitnexus@latest doctor
npx -y gitnexus@latest status
npx -y gitnexus@latest analyze --help
```

Hallazgos de `doctor`:

```text
OS: win32/x64
Node: v22.19.0
GitNexus: 1.6.9
Graph store: available
Full-text search: available
VECTOR index: unavailable
Semantic mode: exact-scan
LadybugDB VECTOR is disabled on this platform; semantic search uses exact scan when embeddings exist.
```

Estado antes de indexar:

```text
Repository not indexed.
Run: gitnexus analyze
```

Indexado controlado:

```powershell
npx -y gitnexus@latest analyze --index-only --name PlanearIA .
```

Resultado:

```text
Repository indexed successfully (41.2s)
5,662 nodes | 11,683 edges | 257 clusters | 300 flows
C:\Users\jarco\dev\PlanearIA
warning: FTS extension unavailable; continuing without FTS features. load-only policy: extension not pre-installed
```

Status despues de indexar:

```text
Repository: C:\Users\jarco\dev\PlanearIA
Branch: development
Indexed: 7/7/2026, 4:34:08 PM
Indexed commit: 2378294
Current commit: 2378294
Status: up-to-date
```

Registro global:

```text
~/.gitnexus/registry.json
name: PlanearIA
path: C:\Users\jarco\dev\PlanearIA
storagePath: C:\Users\jarco\dev\PlanearIA\.gitnexus
stats: 405 files, 5662 nodes, 11683 edges, 257 communities, 300 processes, 0 embeddings
branch: development
```

Artefactos generados:

| Ruta | Estado |
| --- | --- |
| `.gitnexus/parse-cache/` | generado local |
| `.gitnexus/parsedfile-cache/` | generado local |
| `.gitnexus/.gitignore` | contiene `*`, por eso `git status --short .gitnexus` no muestra archivos |
| `.gitnexus/gitnexus.json` | generado local |
| `.gitnexus/lbug` | base local, ~83 MB |
| `.gitnexus/meta.json` | generado local |
| `.gitnexus/run.cjs` | generado local |
| `~/.gitnexus/registry.json` | registro global local |

Comandos de rollback documentados:

```powershell
npx -y gitnexus@latest clean --force
npx -y gitnexus@latest clean --all --force
npx -y gitnexus@latest uninstall
npx -y gitnexus@latest uninstall --force
```

Nota operativa: se uso `--index-only`, por lo que no se inyectaron secciones GitNexus en `AGENTS.md`/`CLAUDE.md` ni skills/hooks. No se ejecuto `gitnexus setup` durante la prueba.

Escala provisional:

- `Alta`: devuelve rutas/simbolos suficientes para actuar con pocos follow-ups.
- `Media`: ubica parte del flujo, pero exige lecturas adicionales importantes.
- `Baja`: devuelve ruido, omite piezas clave o no permite actuar con seguridad.
- `Bloqueado`: la herramienta no pudo ejecutar la consulta.

| Escenario | Herramienta | Comando/prompt | Archivos relevantes | Faltantes | Ruido | Tiempo aprox | Follow-up reads | Utilidad | Veredicto |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MVVM screen -> hook -> service | CodeGraph | `DetalleGrupoScreen` natural-language query + refined symbol query | `useDetalleGrupoViewModel`, `useGrupoNotas`, `useAddStudentsModal`, `useRemoveStudentModal`, `classroomRepository`, `GruposContext` references | Did not return `DetalleGrupoScreen.tsx` even when asked by path | First query returned unrelated legal/feed/calificaciones files; second query only returned hook source | <1s per query | 1 extra CodeGraph query | Media | Useful after refinement, but not precise enough as a single-shot MVVM map. |
| Shared hook blast radius | CodeGraph | `useAddStudentsModal blast radius callers dependencies persistAlumnosAndCount...` | `useAddStudentsModal`, `actualizarGrupo`, `classroomRepository`, `useDetalleGrupoViewModel`, `gruposService`, related callers/tests | Some downstream UI callers not fully expanded due output budget | Low/moderate; included one unrelated script/types section but core was relevant | <1s | 0 direct reads | Alta | Strong for blast radius and test hints; surfaced no tests for several hooks and `gruposService.test.ts` for `actualizarGrupo`. |
| Backend/AI gateway | CodeGraph | `backend AI gateway flow...` + exact `backend/lib/aiGateway.js...` query | `aiUsageLimiter`, `backend/api/index.js`, route registration for `/planeaciones/generar` | Did not return `backend/lib/aiGateway.js` or the actual `planeaciones/generar.js` handler body | High; returned frontend navigation/routes and asistencia/calificaciones route type aliases | <1s per query | Would need direct file reads or another method | Baja | Poor for this AI/backend flow; exact file query still missed the main gateway file. |
| Sync/offline | CodeGraph | `syncEngine entitySync SyncContext queueEntityOperation syncAllEntities...` | `entitySync.ts`, `SyncContext.tsx`, `syncEvents.ts`, `syncQueueSqliteStorage.ts`, callers for `queueEntityOperation`, `syncAllEntities` | Some `syncEngine.ts` sections trimmed by output budget | Low; most content was relevant to offline/sync flow | <1s | 0 direct reads | Alta | Strong result: mapped queue, remote eligibility, orchestrator, events, pending count, SQLite opt-in storage. |
| UX/UI active plan | CodeGraph | `UX UI active plan theming runtime useTheme ThemeContext...` | `ThemeContext`, `responsive.ts`, `CuentaScreen`, `useTheme` callers/tests | Did not include `FontSizeContext`/`DaltonismoContext` source despite matching symbols; docs/plan context not indexed as behavior | Moderate; long `CuentaScreen` dump exceeded practical need | <1s | Would need narrower follow-up for contexts | Media | Good for runtime theming blast radius, but noisy and incomplete for the full UX/UI D15 context. |
| MVVM screen -> hook -> service | GitNexus | `gitnexus query -r PlanearIA -l 5 "DetalleGrupoScreen useDetalleGrupoViewModel classroomRepository GruposContext..."` | `DetalleGrupoScreen.tsx`, `useDetalleGrupoViewModel.ts`, `GruposContext.tsx`, `classroomRepository.ts`, `classroomFacade.ts`, `StackNavigator.tsx` | It did not explain the full flow in prose; it listed definitions/processes | Processes were mostly unrelated (`DataProviders`, SQLite migration), but definitions were highly relevant | internal 327ms; npx total ~6.8s | 0 direct reads | Alta | Better than CodeGraph for locating the full MVVM file set in one query. |
| Shared hook blast radius | GitNexus | `gitnexus impact --file src/hooks/useAddStudentsModal.ts ... useAddStudentsModal`, then UID-disambiguated impact | `useAddStudentsModal` -> `useDetalleGrupoViewModel` -> `DetalleGrupoScreen`, modules Hooks/Grupos | Needed a second call with UID because Function/Const were ambiguous | Low after disambiguation | npx total ~6.5s | 1 extra GitNexus call | Alta | Very clean blast radius after disambiguation; exact epistemic result and risk LOW. |
| Backend/AI gateway | GitNexus | `gitnexus query -r PlanearIA -l 8 "backend aiGateway planeaciones generar AI_GATEWAY_PROVIDERS..."` | `backend/lib/aiGateway.js`, `getConfiguredProviders`, `runChatCompletion`, `backend/routes/planeaciones/generar.js`, `mejorar.js`, `copiloto.js`, `classroom/copiloto.js`, `handleGenerarConIA` | Processes did not rank the AI flow itself as top process | Processes were unrelated (`RunSync`, export), but definitions were on target | internal 549ms; npx total ~7.0s | 0 direct reads | Alta | Clearly found the gateway and routes that CodeGraph missed. |
| Sync/offline | GitNexus | `gitnexus query -r PlanearIA -l 8 "queueEntityOperation syncAllEntities SyncContext sync offline..."` | `entitySync.ts`, `syncEngine.ts`, `SyncContext.tsx`, `syncEvents.ts`, Calificaciones/Asistencia contexts, sqlite inspect tools | Did not list `syncAllEntities` prominently in definitions despite query | Moderate; processes emphasized calificaciones/asistencia, which is relevant but not full sync overview | internal 481ms; npx total ~6.9s | 0 direct reads | Alta | Strong; comparable to CodeGraph, with better process framing for mutations through sync. |
| UX/UI active plan | GitNexus | `gitnexus query ... "useTheme ThemeContext FontSizeContext DaltonismoContext CuentaScreen..."` + `gitnexus impact useTheme` | `ThemeContext`, `CuentaScreen`, `DaltonismoContext`, `FontSizeContext`, archived accessibility spec, `useTheme` blast radius: 74 impacted, 9 modules, risk CRITICAL | Query did not directly reason from plan D15; impact needed a second command | Query processes were noisy API/auth paths; impact output was very useful | internal 451ms; impact npx total ~6.5s | 1 extra GitNexus call | Alta | Better than CodeGraph for complete theming/accessibility file set and risk counts; processes still noisy. |
| Dual-tool/fallback | Ambos | GitNexus `context --content` for `useDetalleGrupoViewModel`; GitNexus `impact runChatCompletion`; compare with CodeGraph source behavior | GitNexus impact found `runChatCompletion` dependants exactly; context found incoming/outgoing calls | GitNexus content output was one-line/truncated and less edit-friendly than CodeGraph line-numbered source | Using both blindly would duplicate context; using GitNexus first then CodeGraph for exact source is useful | ~6-7s per npx command; CodeGraph MCP <1s | 1 extra GitNexus call for UID disambiguation | Alta with routing | Adopt both with strict routing; do not call both by default for every question. |

## 3. Decision final

### Politica elegida

Usar **GitNexus como herramienta primaria de inteligencia estructural** y conservar **CodeGraph como herramienta secundaria/fallback para fuente lineada y comprobacion puntual**.

Regla corta:

1. **GitNexus primero** para preguntas de arquitectura, flujo MVVM, dependencias, call chains, blast radius, backend/IA, sync/offline, y decisiones SDD donde la IA necesita saber "que se conecta con que".
2. **CodeGraph despues o como fallback** cuando se necesita fuente lineada estilo Read, cuando GitNexus no devuelve contenido suficiente, cuando GitNexus esta desactualizado/no instalado, o cuando una consulta GitNexus requiere demasiada desambiguacion para una edicion puntual.
3. **No usar ambos por reflejo** para la misma pregunta. Solo usar el segundo cuando el primero falle, omita un archivo clave, tenga salida ambigua, o haga falta comparar evidencia en un spike.
4. **Lectura directa/rg** sigue aplicando para Markdown, docs, assets, generated files, contexto exacto no indexado, o ediciones de archivo completo.

### Por que no migrar solo a GitNexus

- GitNexus fue mejor en MVVM, backend/IA, impact y UX/UI blast radius, pero su `context --content` no reemplaza bien a CodeGraph como lectura lineada: entrega contenido truncado/compactado en una sola linea.
- Los comandos por `npx` tienen overhead de 6-7s aunque el motor interno reporte ~300-550ms; un MCP persistente podria mejorar esto, pero no se verifico en este change.
- La licencia del paquete es `PolyForm-Noncommercial-1.0.0`; para uso comercial futuro requiere revision/licenciamiento.
- En Windows el `doctor` advierte VECTOR unavailable y exact-scan; ademas existen issues recientes de indexado en Windows, aunque PlanearIA si indexo correctamente con 1.6.9.

### Por que no conservar solo CodeGraph

- CodeGraph fallo o fue pobre en el caso backend/IA: no devolvio `backend/lib/aiGateway.js` ni el handler principal aunque se pidio por ruta exacta.
- En la consulta MVVM amplia omitio `DetalleGrupoScreen.tsx` y trajo archivos no relacionados; necesito refinamiento.
- GitNexus encontro mejor la pantalla, ViewModel, contexto y repository en una sola consulta, y su `impact` sobre `runChatCompletion` devolvio las cinco rutas backend afectadas.

### Politica operativa propuesta

| Tipo de consulta | Herramienta primaria | Fallback |
| --- | --- | --- |
| Arquitectura MVVM screen/hook/service | GitNexus `query` o `context` | CodeGraph si falta fuente lineada o GitNexus omite un archivo clave |
| Blast radius de simbolo compartido | GitNexus `impact` | CodeGraph si se necesita fuente lineada o tests relacionados |
| Backend/IA gateway | GitNexus `query`/`impact` | lectura directa/rg si GitNexus no encuentra handlers CommonJS |
| Sync/offline | GitNexus `query` para proceso; CodeGraph si se quiere source lineado | CodeGraph |
| UX/UI D15, theming, responsive | GitNexus `query`/`impact` | CodeGraph para source lineado antes de editar |
| Edicion puntual de codigo ya localizado | CodeGraph o lectura directa | GitNexus si la edicion puede romper procesos/dependencias amplias |
| Markdown/docs/OpenSpec | lectura directa/rg | no usar knowledge graph salvo investigacion especial |

### Rechazados

- **Eliminar CodeGraph ahora:** rechazado porque CodeGraph sigue siendo mejor como Read-equivalent con fuente lineada y rapido via MCP.
- **Usar ambos siempre:** rechazado porque duplica contexto y puede contaminar al agente. El segundo tool solo entra por falla, ambiguedad o necesidad de fuente.
- **Descartar GitNexus:** rechazado porque supero a CodeGraph en casos clave de PlanearIA: MVVM completo, backend/IA gateway y blast radius de `runChatCompletion`.
- **Ejecutar `gitnexus setup` ahora:** rechazado por este change; el trial uso `--index-only` para evitar modificar AGENTS/CLAUDE/skills/hooks antes de que la politica quedara aprobada.

## 4. Validacion final

### Barrido de instrucciones activas

Comando:

```powershell
rg -n "CodeGraph|GitNexus|knowledge graph|MCP|codegraph|gitnexus" AGENTS.md CLAUDE.md openspec/config.yaml Documentacion/02-operacion Documentacion/05-context-engineering Documentacion/01-planes-maestros
```

Resultado: no quedan instrucciones activas que contradigan la politica final. Las referencias encontradas
quedan alineadas en estos terminos:

- `AGENTS.md`, `CLAUDE.md` y `openspec/config.yaml`: GitNexus primario; CodeGraph secundario/fallback.
- `Documentacion/02-operacion/MCP_FLUJOS_PLANEARIA.md`: documento canonico de MCPs con comandos GitNexus
  validados y regla de no usar ambos por reflejo.
- `Documentacion/02-operacion/CODEGRAPH_MCP.md`: actualizado para describir CodeGraph como fallback/fuente
  lineada, no como herramienta primaria.
- `Documentacion/05-context-engineering/README.md`: contexto dirigido con GitNexus primario y CodeGraph
  fallback.
- `Documentacion/01-planes-maestros/meta_guia_planes.md` y
  `Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md`: pasos SDD y D15 actualizados con la
  misma ruta.

### OpenSpec

Comando:

```powershell
openspec validate --all --strict --json
```

Resultado:

```text
items: 10
passed: 10
failed: 0
change evaluate-gitnexus-codegraph-sdd: valid
```

### Sanity check de prompts futuros

| Prompt futuro | Ruta esperada por la documentacion | Resultado |
| --- | --- | --- |
| "Voy a modificar `backend/lib/aiGateway.js`; dime que rutas se pueden romper." | `gitnexus status`, luego `gitnexus query`/`impact` sobre `runChatCompletion` o el helper afectado; lectura directa si hace falta editar; CodeGraph solo si falta fuente lineada. | Correcto: coincide con `AGENTS.md`, `MCP_FLUJOS_PLANEARIA.md` y `CLAUDE.md`. |
| "Necesito cambiar `DetalleGrupoScreen` y su ViewModel; ubica pantalla, hook y repository." | GitNexus primero para mapa MVVM screen -> hook/ViewModel -> service/repository; CodeGraph o lectura directa solo para fuente exacta antes del parche. | Correcto: coincide con meta guia, D15 UX/UI y politica operativa. |

### Playwright visual QA

N/A justificado: este change no modifica UI visible ni comportamiento runtime de la app. Solo cambia
documentacion, artefactos OpenSpec, politica de herramientas y una skill local de entrevista. No hay pantalla,
breakpoint, componente ni flujo de navegador que validar con Playwright.
