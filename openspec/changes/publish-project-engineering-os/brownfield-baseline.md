## Superficies tocadas

- `tools/project-constructor/**`: package, bins, source, blueprint, schemas, tests y fixture.
- Scripts y dependencias raíz de PlanearIA que invocan el constructor embebido.
- Documentación del constructor, plan maestro, roadmap e índices.
- Specs `project-constructor-*` y artefactos de este change.
- Repositorio GitHub/npx/npm futuros, únicamente después de los gates manuales.

No se toca `src/`, `backend/`, datos, UI, auth, sync o IA de PlanearIA.

## Fuentes de verdad actuales

- Código y tests: `tools/project-constructor/`.
- Comportamiento vigente: `openspec/specs/project-constructor-{bootstrap,doctor,governance,harness}`.
- Reglas operativas: `AGENTS.md`, `.agents/`, `openspec/config.yaml`.
- Distribución/rollback: plan maestro y `Documentacion/02-operacion/constructor-proyectos/`.
- Estado diario/evidencia: issue #126, PlanearIA Product OS y GitHub Actions.

Las specs archivadas son historia; no sustituyen estas fuentes vigentes.

## Comportamiento vigente

El constructor 0.1.0 es un paquete privado `project-engineering-os-constructor`, `UNLICENSED`, con bin
`project-constructor`. Se ejecuta desde `tools/project-constructor` o un tarball local. La fixture prueba
un repositorio vacío, idempotencia, doctor, resume y rollback. No existe upstream público, paquete npm,
GitHub Release, provenance ni comando que gestione una actualización mediante rama/PR.

PlanearIA es hoy propietario y consumidor del mismo source.

## Comportamiento objetivo

`RitualBoat/project-engineering-os` será upstream MIT de `create-project-engineering-os`; expondrá
`create-project-engineering-os` y `project-os`, CI multiplataforma, releases con tarball/checksum y
publicación OIDC con provenance. Los consumidores fijarán una release y usarán upgrade read-only/apply,
migraciones y PR opt-in. PlanearIA consumirá la versión exacta y dejará de mantener runtime duplicado.

## Compatibilidad legacy

El alias `project-constructor` puede conservarse durante una versión menor solo para migrar fixtures y
scripts existentes. El formato de estado previo requiere migración explícita; schemas futuros se
rechazan. El tarball local sigue siendo recovery y evidencia, no fuente canónica. La copia embebida se
retira únicamente después de validar upstream/npm, y su reversión vuelve a la última release sana por PR.

No se cambian contratos de producto ni datos.

## Owner de spec y contexto

Engineering OS es owner técnico de runtime, blueprint, schemas, CLI y releases. OpenSpec mantiene
ownership separado de workflows OPSX. Los proyectos consumidores son owners de decisiones de producto,
overlays y archivos no administrados. PlanearIA consume la release mediante nombre, versión, checksum y
contrato CLI.

No hay contrato cruzado entre bounded contexts docentes; `userId`, `src/sync`, permisos e IA no aplican.

## Evidencia actual

- Issue #126 enriquecido, entrevista al 97% y siete decisiones aprobadas.
- Gate pre-propose: PASS 9/9 el 2026-07-20, sin excepciones.
- Dependencia #103 y PR #125 cerrados; merge `f1ba987`.
- Working tree limpio y cero changes OpenSpec activos antes de crear la rama.
- Disponibilidad read-only de repo/package comprobada el 2026-07-20, sin reservar nombres.
- Constructor Ola 0: 48/48 tests y fixture real documentados en su archive.

La evidencia de PR, release, npm, checksum, provenance, fixtures nuevas y revisión adversarial todavía no
existe y SHALL incorporarse antes de archive.

## Fuera de alcance

- Aplicación, historia completa, dominio docente o secretos de PlanearIA.
- Dashboard, SaaS, telemetría, backend, marketplace o template repository.
- React/Expo, UI, Playwright visual, Figma, offline/sync, IA y cloud.
- Soporte v1 garantizado para pnpm, Yarn o Bun.
- Publicación remota durante propose.
- Auth, aprobación o aceptación legal ejecutadas automáticamente por doctor/bootstrap.
