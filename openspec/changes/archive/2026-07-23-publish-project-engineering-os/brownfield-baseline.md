# Baseline brownfield: publish-project-engineering-os

## Superficies tocadas

- `tools/project-constructor/**`: package, bins, runtime, blueprint, schemas, tests y fixture.
- `tools/debt-control/**` y `.project-os/debt/**`: motor, schemas, tests y estado consumidor.
- Scripts/dependencias raíz que hoy invocan ambos runtimes embebidos.
- Plan, roadmap, docs del constructor, prompts 00/01 y guía manual.
- Specs `project-constructor-*` y artefactos de este change.
- Upstream GitHub/npm futuros, únicamente después de gates manuales.

No se toca `src/`, `backend/`, UI, datos, auth, sync o IA de PlanearIA.

## Fuentes de verdad actuales

- Código/tests del constructor: `tools/project-constructor/`.
- Código/tests de deuda: `tools/debt-control/` y `.project-os/debt/`.
- Comportamiento: `openspec/specs/project-constructor-*` y `openspec/specs/debt-control-*`.
- Reglas: `AGENTS.md`, `.agents/`, `openspec/config.yaml`.
- Operación: `Documentacion/02-operacion/constructor-proyectos/` y
  `Documentacion/02-operacion/CONTROL_DEUDA_TECNICA.md`.
- Estado/evidencia: #126, Product OS, Actions y assessments inmutables.

Los changes archivados son evidencia histórica; PR #127 cerrado no es fuente editable.

## Comportamiento vigente

`tools/project-constructor` es `project-engineering-os-constructor@0.1.0`, privado, UNLICENSED y con bin
`project-constructor`. Bootstrap/doctor/fixture funcionan desde source o tarball local.

`tools/debt-control` es otro paquete privado local. Sus 58 tests demuestran captura idempotente,
assessments inmutables, gates, GitHub modes, handoff y presupuesto. PlanearIA ejecuta ambos mediante scripts
raíz y es owner/consumidor. No existe upstream, npm público, GitHub Release, provenance o upgrade por PR.

## Comportamiento objetivo

`RitualBoat/project-engineering-os` será upstream MIT de un solo package
`create-project-engineering-os`. `project-os` expondrá constructor y namespace debt. Releases tendrán
tarball único, checksum, provenance y CI multiplataforma. Consumidores fijarán versión/schema, usarán
upgrade read-only/apply/PR y rollback. PlanearIA conservará solo dependencia y smokes contractuales.

## Compatibilidad legacy

- Alias `project-constructor` puede sobrevivir una versión menor solo con fixture justificativa.
- State/config/registry previos requieren migraciones explícitas; schemas futuros se rechazan.
- Policy/assessments del consumidor se preservan durante upgrade/rollback.
- Tarball local sirve como release candidate/recovery, no como owner permanente.
- Copias embebidas se retiran solo después de validar upstream/npm/provenance.
- No cambian contratos de producto ni datos.

## Owner de spec y contexto

Engineering OS será owner técnico de CLI, blueprint, schemas, Debt Control Loop, docs públicas y releases.
OpenSpec conserva ownership de workflows OPSX. Cada consumidor es owner de producto, overlays, policy
seed-once y archivos no administrados. PlanearIA consume paquete, versión, schema e identidad.

No hay contrato cruzado entre bounded contexts docentes; `userId`, `src/sync`, permisos e IA no aplican.

## Evidencia actual

- #126 enriquecido y `Ready`; gate pre-propose PASS 10/10 sobre `development@2ef9a46`.
- #129/#136 cerrados; plan harness y constructor en 0/5, sin triggers.
- PR #139 y checks Windows/Ubuntu verdes.
- Baseline local: typecheck/lint/backend PASS; Jest 121 suites/843 tests; debt-control 58; harness 36;
  OpenSpec 46.
- GitNexus fresh tras repair/verify.
- GitHub repo no encontrado y npm E404 para los nombres propuestos el 2026-07-23; no están reservados.
- AJV 8.20.0 y OpenSpec 1.5.0 reportan MIT.
- Documentación oficial vigente exige Node >=22.14 y npm >=11.5.1 para npm Trusted Publishing.

PR/release/npm/checksum/provenance y fixtures publicadas todavía no existen y deben incorporarse antes de
archive.

## Fuera de alcance

- Aplicación, historia completa, dominio, secretos o datos de PlanearIA.
- UI, backend, auth, sync, IA, React/Expo, Figma o Playwright visual.
- Dashboard, SaaS, telemetría, marketplace o servicio pagado.
- Template repository como owner.
- Soporte v1 garantizado para pnpm, Yarn o Bun.
- Publicación/autenticación automática desde doctor/bootstrap.
