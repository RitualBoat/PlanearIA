## Why

El constructor neutral ya está probado dentro de PlanearIA, pero sigue siendo un paquete privado,
`UNLICENSED` y distribuido por tarball local. Extraerlo ahora a un upstream público evita que PlanearIA
se convierta en una fuente accidental, permite adopción por terceros y hace verificables instalación,
actualización y rollback mediante releases SemVer.

Issue de origen: [#126](https://github.com/RitualBoat/PlanearIA/issues/126). Plan afectado:
`Documentacion/01-planes-maestros/PLAN_CONSTRUCTOR_PROYECTOS_NUEVOS.md`, Ola 4 de distribución.

## What Changes

- Crear `RitualBoat/project-engineering-os` como upstream público, neutral y licenciado bajo MIT.
- Publicar el paquete `create-project-engineering-os` con binario `project-os`, ruta principal por
  `npx` y releases ligadas al mismo tag/SHA que pasó CI.
- Añadir checksums, changelog, inventario de licencias, política de seguridad y documentación amigable
  para uso y contribución.
- Añadir un contrato de actualización fijada: preview determinista, migraciones explícitas, rama/PR
  revisable y rollback a una versión sana.
- Migrar PlanearIA de propietario del runtime embebido a consumidor de una release fijada, conservando
  trazabilidad y una transición reversible.
- Probar instalación, bootstrap, segundo run, actualización y rollback en Windows, macOS y Linux con
  Node 20/22.
- Mantener como gates humanos la creación pública, autenticación, primera publicación npm y releases
  mayores. Ningún secreto se almacena o imprime.

### No objetivos

- No publicar código, historia, datos, secretos o reglas de dominio docente de PlanearIA.
- No crear dashboard, SaaS, backend hospedado, telemetría ni marketplace.
- No activar perfiles React/Expo, UI, offline/sync, IA o cloud.
- No prometer soporte v1 para pnpm, Yarn o Bun.
- No convertir un template repository en segunda fuente de verdad ni usar instalación global como
  camino principal.

## Capabilities

### New Capabilities

- `project-constructor-distribution`: upstream público, licencia, paquete npm/npx, releases verificables,
  documentación de adopción, supply chain y gobernanza comunitaria.
- `project-constructor-consumer-updates`: consumo fijado y actualización segura mediante preview,
  migraciones, rama/PR y rollback sin drift.

### Modified Capabilities

- `project-constructor-bootstrap`: el bootstrap deja de depender únicamente de un tarball privado y
  acepta una release pública fijada cuya identidad y compatibilidad son verificables.
- `project-constructor-governance`: la gobernanza incorpora ownership upstream/consumer, contribuciones
  públicas y gates de publicación sin convertir autenticación en trabajo SDD ficticio.

## Impact

- Código origen: `tools/project-constructor/**`, wrappers y scripts del constructor en PlanearIA.
- Contratos: `openspec/specs/project-constructor-bootstrap`,
  `openspec/specs/project-constructor-governance` y las dos capacidades nuevas.
- Documentación: plan maestro, roadmap, índices, runbooks, Prompt 00/01, compatibilidad y licencias.
- Sistemas externos: nuevo repositorio GitHub, GitHub Actions/Releases y registry npm.
- Dependencias: se conserva Node 20/22 y npm; cualquier cambio adicional requiere lockfile, licencia y
  decisión explícita.
- Runtime de producto: sin cambios en UI, backend, auth, sync, datos académicos o IA de PlanearIA.
