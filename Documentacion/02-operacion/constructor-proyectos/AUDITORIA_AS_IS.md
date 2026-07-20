# Auditoría as-is del sistema operativo de ingeniería

> **Snapshot:** 2026-07-19.
> **Alcance:** gobernanza, SDD, harness, herramientas, GitHub, CI, calidad y documentación.
> **No incluye:** rediseño del producto ni selección del stack de un proyecto futuro.

## 1. Método

La auditoría siguió la precedencia real del repositorio:

1. código, runtime y tests para estado actual;
2. `openspec/specs/` para comportamiento esperado archivado;
3. `AGENTS.md`, `.agents/` y `openspec/config.yaml` para reglas operativas;
4. GitHub Project para estado diario;
5. GitHub Actions para evidencia automática;
6. issue, PR, reportes y decisiones para evidencia manual;
7. changes archivados como historia, no como política vigente implícita.

Se usaron lecturas directas para Markdown, YAML, JSON y archivos generados. GitNexus fue la primera ruta
estructural; al omitir el detalle necesario de `harnessDoctor.mjs` y del parser TOML se usó CodeGraph como
fallback lineado.

## 2. Evidencia automática actual

| Comprobación | Resultado observado | Evidencia |
| --- | --- | --- |
| Harness | `OK`, 36 mirrors en paridad | `npm run agent:harness:check`; `scripts/syncAgentHarness.mjs`. |
| OpenSpec | CLI local `1.6.0`, Node `26.4.0`, 1 change y 34 items válidos | `npm run openspec:check`; `package.json`; lockfile. |
| GitNexus | índice `up-to-date` en commit `502746f` | `npm run gitnexus:diagnose`; issue [#112](https://github.com/RitualBoat/PlanearIA/issues/112) cerrado. |
| Change activo | `constructor-proyectos-nuevos`, 0/48 al iniciar apply documental | `npm exec --yes=false -- openspec instructions apply --change constructor-proyectos-nuevos --json`. |
| Branch | `feat/constructor-proyectos-nuevos` | `git status --short --branch`. |
| Protección `development` | TypeScript, ESLint, Jest y Backend smoke requeridos; force push/deletion deshabilitados | GitHub REST `branches/development/protection`. |
| Protección `main` | API devolvió `404 Branch not protected` | GitHub REST `branches/main/protection`. |

La paridad actual no elimina dos gaps vigentes:

- `scripts/harnessDoctor.mjs` llama `npm run mcp:test`; el smoke inicia servidores stdio y puede activar
  OAuth. El doctor aún no es estrictamente read-only.
- `scripts/testMcpServers.mjs` extrae nombres Codex con
  `^\[mcp_servers\.([^\]]+)\]`; por ello las subtables
  `.codex/config.toml` como `mcp_servers.github.tools.issue_write` pueden contarse como servidores.

## 3. Inventario por fuente

### 3.1 Reglas y proceso

- `AGENTS.md` y `.agents/instructions/core.md`: entrada universal y reglas de agente.
- `Documentacion/01-planes-maestros/meta_guia_planes.md`: plan maestro, olas, NORMAL/CAVEMAN y SDD.
- `openspec/config.yaml`: reglas OpenSpec activas, actualmente específicas de PlanearIA.
- `scripts/checkOpenSpecReadiness.mjs`: DoR/DoD, metadata y excepciones.
- `scripts/opsxArchiveChange.mjs` y `scripts/opsxFinishChange.mjs`: archive, PR, checks y cierre.

### 3.2 Harness y herramientas

- `.agents/`: instrucciones, reglas, skills y permisos canónicos.
- `.mcp.json`: baseline MCP.
- `scripts/syncAgentHarness.mjs`: renderer actual.
- `scripts/patchOpsxWorkflows.mjs`: ownership post-update separado de OPSX.
- `scripts/testMcpServers.mjs`: paridad y smoke MCP.
- `scripts/harnessDoctor.mjs`: doctor humano/JSON actual.
- `scripts/gitNexusFts.mjs`: diagnose, verify y reparación aislada.

### 3.3 GitHub y CI

- `Documentacion/02-operacion/GITHUB_PRODUCT_OS.md`: Project, estados, labels y cierre.
- `.github/ISSUE_TEMPLATE/` y `.github/pull_request_template.md`: entradas de trabajo.
- `.github/workflows/ci.yml`: typecheck, lint, Jest y backend smoke.
- `.github/workflows/agent-harness-parity.yml`: señal advisory del harness.
- `.github/workflows/react-doctor.yml`: señal específica de React, no universal.
- `.github/workflows/cd.yml`: CD específico de Expo/Vercel.

### 3.4 Contexto y evidencia

- `Documentacion/README.md`: índice y precedencia.
- `Documentacion/05-context-engineering/README.md`: rutas mínimas y prueba de encontrabilidad.
- `Documentacion/00-fundamentos/MAPA_DDD_ESTRATEGICO_LIGERO.md`: glosario, contextos, owners e invariantes.
- `Documentacion/00-fundamentos/IHC_DISCOVERY_DOCENTE.md`: IHC/Nielsen, específico de UI docente.
- `context/`: ground truth visual cuando existe.

## 4. Clasificación ejecutiva

### Núcleo universal

SDD/OpenSpec local, issue y Project previos, enrich, DoR/DoD, TLDR, brownfield baseline, readiness,
excepciones temporales, planes por olas, backlog lazy, harness single-source, ownership separado OPSX,
doctor por evidencia, contexto encontrable, DDD estratégico ligero, evidencia proporcional, revisión
adversarial, rollback y cierre por PR.

### Perfiles condicionales

React Doctor, Playwright, Figma, Nielsen/IHC, breakpoints, backend/API, auth, datos, offline/sync, IA,
deploy, observabilidad y validaciones de framework.

### Específico de PlanearIA

Dominio docente, módulos `*PLAN`, MVVM actual, `userId`, `src/sync`, Expo, MongoDB, Vercel, AsyncStorage,
SQLite opt-in, gateway IA y breakpoints vigentes. Se parametrizan o excluyen.

### Histórico, deuda o retirado

Graphify activo, diagnósticos GitNexus basados solo en firmas, configuraciones antiguas de OPSX y pasajes
de planes que describen fallos ya resueltos. Se conservan solo como historia fechada.

## 5. Drifts y contradicciones

| Drift | Fuente A | Fuente B/estado real | Tratamiento |
| --- | --- | --- | --- |
| GitNexus aparecía inutilizable | `PLAN_PREPARACION_OPERATIVA_SDD_HARNESS_SOLO_DEV.md` conserva el snapshot antiguo | #112 cerrado; diagnose actual fresh | Marcar histórico; no copiar el fallo. |
| Doctor se declara read-only | `harness-readiness-doctor/spec.md` | `harnessDoctor.mjs` ejecuta `mcp:test` | Gap vigente; separar evidencia runtime/auth. |
| Paridad MCP pasa | `npm run agent:harness:check` | regex TOML puede contar subtables como servers extra | No usar el verde como prueba semántica completa. |
| `main` se documenta estable | `GITHUB_PRODUCT_OS.md` | API indica rama sin protección | Gate manual de normalización. |
| Tests verdes equivalen a calidad | suites automáticas | warnings/logs inesperados ya observados | Crear baseline de tests silenciosos; no autoeditar. |
| Change archivado parece política | `openspec/changes/archive/` | AGENTS/config/código pueden haber cambiado | Aplicar precedencia y registrar drift. |

## 6. Conclusión

PlanearIA sí contiene un núcleo transferible, pero copiar archivos produciría un sistema acoplado y varios
falsos verdes. La extracción correcta exige un CLI neutral, ownership explícito, profiles opt-in, doctor
sin side effects, parser MCP estructural y fixtures de repositorio vacío. El detalle fila por fila está en
[`MATRIZ_TRANSFERIBILIDAD.md`](MATRIZ_TRANSFERIBILIDAD.md); los gaps priorizados están en
[`GAP_ANALYSIS.md`](GAP_ANALYSIS.md).
