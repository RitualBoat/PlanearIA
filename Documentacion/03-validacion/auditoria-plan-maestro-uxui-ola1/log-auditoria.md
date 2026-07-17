# Log de auditoria

Registro cronologico de comandos, consultas estructurales y fallbacks. Complementa las matrices.

## 2026-07-16 — Preparacion

- `gh issue list/project item-list/api milestones` → `snapshot-pre-auditoria.md` (baseline de no-mutacion).
- `npm run gitnexus:diagnose` → stale (indexado `dfcd32d` en development 2026-07-14; HEAD `93c68af`).
- `npm run gitnexus:repair` → "FTS indexes repaired successfully", pero el indice siguio stale (repair no reindexa contenido).
- `npx -y gitnexus@1.6.10-rc.23 analyze --index-only --name PlanearIA .` desde Git Bash → **"Not a git repository."** Reproduce en vivo el bug del issue #74 (wrapper/cwd en Windows): la misma invocacion via PowerShell desde la raiz indexo bien.
- `powershell -NoProfile ... npx gitnexus analyze --index-only` → "Repository indexed successfully (37.5s), 7,103 nodes | 13,359 edges"; nota: "index schema changed (stamped v5, this build is v6); forcing a full rebuild".
- `npm run gitnexus:diagnose` → up-to-date en `93c68af`.

**Evidencia derivada:** el hallazgo del issue #74 es real y afecta tambien al flujo de reindexado documentado en AGENTS.md (no solo a diagnose); ver matriz de hallazgos.

## Consultas estructurales

- GitNexus `query -r PlanearIA` sobre estructura de navegacion: confirma `FloatingActionIcons` vivo (handleAccount/handleLogout) y `FeedScreen` extenso (lineas 96-462).
- `rg` directo (conteos exactos, politica de lectura directa para verificacion puntual):
  - 65 archivos importan `COLORS` estatico (plan decia 60; deriva +5).
  - 18 archivos de pantallas usan patron reactivo `useTheme`/`getStyles` (coincide con plan).
  - 10 consumidores de `utils/responsive` (plan decia 11).
  - `src/navigation/StackNavigator.tsx`: 60 `<Stack.Screen>` hermanas; `AppTabsNavigator.tsx`: 5 tabs legacy; App.tsx sin rutas.
  - `returnToClassroom` en 6 archivos (parametro de acoplamiento que el shell debe eliminar).
  - 61 archivos de pantalla en `src/screens/` (coincide exacto con el plan).
  - `WebScrollView` existe con 24 consumidores; `SyncContext` expone idle/syncing/synced/offline/authError.
  - `src/themes/` solo contiene `colors.ts` y `types.ts`: faltan los 6 grupos de tokens (espaciado, radios, tipografia, elevacion, movimiento, z-index).
  - Reduce-motion ya referenciado en 5 archivos.
  - `SyncContext` define estados idle/syncing/synced/offline/error y una bandera `authError` aparte (precision corregida tras revision adversarial).
- Deduplicacion (task 5.1): `gh search issues --repo RitualBoat/PlanearIA "<kw>"` con 14 keywords (theming, breakpoint, tokens, shell, componentes, sync status, assign, golden, prototipo, ground truth, xlsx, epic, milestone, escritorio): cero issues existentes que cubran las 12 unidades nuevas; solapes conocidos referenciados sin duplicar (#46/#47/#66/#74/#75).
- Limite declarado de la dimension "estados loading/empty/error/offline": se audito como CONTENIDO del plan (secciones 1.4, 1.9.3 y criterios por change) y reglas del harness (config OpenSpec exige escenarios por estado en toda spec de UI); NO se inventariaron los estados de las 61 pantallas actuales porque el plan las reemplaza por olas y ese inventario pertenece al propose de cada change de UI.
- Dependencias (package.json): tentap 1.0.1, mammoth, docx, xlsx 0.18.5, pdfjs-dist 5.5.207, reanimated 4.1.2, gesture-handler 2.28, expo-notifications presentes; `expo-blur` NO instalado (coherente con plan); Playwright NO es dependencia del repo (QA visual solo via MCP).
- `context/`: existen chat/classroom/excel/infraestructura/planeaciones ground-truth; NO existen `office-ground-truth/` (referenciado por `notasplan-editor`) ni `asistente-ground-truth/` (el plan pide crearlo).
- `.github/workflows/`: ci.yml, cd.yml, react-doctor.yml, agent-harness-parity.yml. Sin workflow de QA visual/golden journeys; package.json sin scripts playwright/e2e/golden.
- `npm test -- --runInBand`: 93/93 suites, 608/608 tests PASS (61.5s); sin warnings act() capturados en esta corrida.
- `npm run harness:doctor`: FAIL solo por `expo-compatibility` (expo 54.0.35 vs ~54.0.36, expo-localization 17.0.8 vs ~17.0.9; territorio de #75); WARN mcp-smoke: figma requiere OAuth (evidencia para gate #46); gitnexus PASS tras reindex.
- `npm audit`: 22 vulnerabilidades (4 high, 17 moderate, 1 low, 0 critical); coincide con el riesgo declarado en el plan de readiness (xlsx entre los high).

## 2026-07-16/17 — Trabajo concurrente detectado durante el apply

- Otro proceso resolvio #74: PR #77 "fix(harness): run GitNexus from repository root" mergeado a development (2026-07-17T00:33Z), #74 cerrado y su change archivado; ademas aparecio el change `align-expo-localization-sdk54` scaffoldeado para #75.
- Impacto en esta auditoria: H8 pasa a "resuelto en paralelo" (evidencia de reproduccion conservada como registro historico); H7 anota el change en vuelo; el numero #77 explica el salto de numeracion de los issues creados (#78-#89).
- La rama de esta auditoria (`docs/auditoria-plan-uxui-pre-ola1`, base 93c68af) no colisiona en archivos con ese merge (scripts/ vs Documentacion/ + openspec/changes/ propios).

## Fallbacks CodeGraph (motivo obligatorio)

Ninguno: GitNexus y lectura directa cubrieron todas las consultas; no se requirio CodeGraph.
