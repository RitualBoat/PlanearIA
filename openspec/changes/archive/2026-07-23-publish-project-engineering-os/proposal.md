## Why

PlanearIA ya demostró un constructor neutral y un Debt Control Loop verificable, pero ambos siguen
embebidos como paquetes privados y convierten a PlanearIA en propietario accidental de tooling que
debería servir a cualquier proyecto. Publicarlos ahora como un único Engineering OS evita dos fuentes
editables, permite instalación y actualización reproducibles, y transfiere la gobernanza madura sin
exportar la aplicación, el dominio docente ni perfiles técnicos condicionales.

Issue de origen: [#126](https://github.com/RitualBoat/PlanearIA/issues/126). Plan afectado:
`Documentacion/01-planes-maestros/PLAN_CONSTRUCTOR_PROYECTOS_NUEVOS.md`. El saneamiento previo quedó
cerrado por #129 y PR #139 sobre `development@2ef9a46`.

## What Changes

- Crear `RitualBoat/project-engineering-os` como upstream público, neutral y licenciado bajo MIT.
- Publicar un único paquete `create-project-engineering-os` con bins
  `create-project-engineering-os` y `project-os`, usable por `npx` con versión exacta.
- Integrar en ese mismo CLI el Debt Control Loop como `project-os debt ...`; no crear un segundo
  paquete, política o registro.
- Añadir distribución SemVer por GitHub Releases y npm con tarball único, checksum, provenance,
  acciones fijadas por SHA y Trusted Publishing OIDC desde un job compatible.
- Añadir actualización de consumidores mediante preview read-only, migraciones explícitas,
  transacciones, rama/PR opt-in y rollback a una release sana.
- Proveer README amigable, políticas comunitarias, inventario de licencias, CI multiplataforma,
  fixtures greenfield/brownfield y pruebas de neutralidad, idempotencia y recuperación.
- Migrar PlanearIA de owner de los runtimes embebidos a consumidor de una release exacta, conservando
  solo smokes contractuales y una transición reversible.
- Mantener creación pública, autenticación, primera publicación y releases mayores como gates humanos
  trazables. El doctor y los modos `--check` permanecen read-only.

### No objetivos

- No publicar código, historia, datos, secretos, nombres o reglas del dominio docente de PlanearIA.
- No fusionar PlanearIA con el repositorio público ni hacer que su aplicación dependa de servicios del
  Engineering OS en runtime.
- No crear dashboard, SaaS, backend hospedado, telemetría, marketplace o servicios pagados.
- No activar React, Expo, UI, Playwright visual, Figma, offline/sync, IA, base de datos o cloud en un
  proyecto nuevo sin discovery y decisión explícita.
- No prometer soporte v1 para pnpm, Yarn o Bun; npm/npx es la ruta soportada.
- No usar un template repository como segunda fuente canónica ni una instalación global como ruta
  principal.
- No ejecutar publicación remota durante `propose` ni interpretar ausencia de checks como éxito.

## Capabilities

### New Capabilities

- `project-constructor-distribution`: upstream público, paquete npm/npx, licencia, documentación,
  supply chain, CI, releases y gobernanza comunitaria verificables.
- `project-constructor-consumer-updates`: adopción y upgrades por release exacta, diff read-only,
  migraciones, transacciones, PR opt-in y rollback.
- `project-constructor-debt-control`: assessments inmutables, registro, presupuesto por plan, gates,
  modos GitHub y handoff configurables dentro del mismo CLI público.

### Modified Capabilities

- `project-constructor-bootstrap`: el bootstrap acepta una release pública fijada, instala el motor de
  deuda neutral y no depende de paths internos de PlanearIA.
- `project-constructor-doctor`: el doctor distingue identidad de release, salud del registro de deuda y
  operaciones remotas no demostradas sin reparar ni autenticar.
- `project-constructor-governance`: define ownership upstream/consumer, gates humanos, contribuciones y
  obligación de capturar deuda residual al cerrar flujos SDD.

## Impact

- Código origen: `tools/project-constructor/**`, `tools/debt-control/**`, wrappers y scripts raíz.
- Estado/configuración: `.project-os/debt/**`, schemas, blueprint y contratos de ownership.
- Specs: tres capacidades nuevas y deltas de bootstrap, doctor y governance.
- Documentación: plan maestro, roadmap, índices, runbooks, prompts 00/01, guía manual, compatibilidad,
  costos/licencias y estrategia de rollback.
- Sistemas externos posteriores al gate: repositorio público GitHub, Actions/Releases y registry npm.
- Dependencias: Node 20/22 y npm para consumidores; el job de Trusted Publishing deberá usar como
  mínimo Node 22.14 y npm 11.5.1 según documentación vigente. AJV y OpenSpec conservan licencia MIT.
- Runtime de producto PlanearIA: sin cambios en UI, backend, auth, sync, datos académicos o IA.
