## Superficies tocadas

- `tools/project-constructor/`: paquete/CLI nuevo, blueprint, renderers, doctor, fixtures y tests.
- `Documentacion/01-planes-maestros/` y `Documentacion/02-operacion/`: plan, auditoría y runbooks.
- Índices documentales, scripts raíz y workflow CI advisory del constructor.
- `scripts/checkOpenSpecReadiness.mjs` y su fixture, corregidos por contacto al observar `DEP0190` en el
  gate real de este change.
- `openspec/changes/constructor-proyectos-nuevos/`: propuesta, design, specs, tareas y evidencia.

No se toca `src/`, `backend/`, sync, datos, UI ni configuración runtime de producto.

## Fuentes de verdad actuales

- Código y tests reales: `scripts/syncAgentHarness.mjs`, `scripts/harnessDoctor.mjs`, scripts readiness y
  OPSX.
- Comportamiento esperado: `openspec/specs/`, con especial atención a harness, doctor, readiness y Product
  OS.
- Reglas operativas: `AGENTS.md`, `.agents/`, `openspec/config.yaml`.
- Estado diario: issue #103 y PlanearIA Product OS.
- Evidencia automática/manual: Actions, issue, PR y artefactos del change.

Las specs archivadas son historia; no se asumen política vigente sin contraste.

## Comportamiento vigente

PlanearIA puede sincronizar su propio harness, validar readiness y diagnosticar herramientas, pero esas
piezas están acopladas a su raíz, dominio y stack. No existe un comando que prepare un repositorio vacío,
mantenga ownership/migraciones, pruebe un segundo run o distribuya el núcleo a otros proyectos. El doctor
vigente incluye un smoke MCP que puede iniciar una ruta OAuth. La paridad MCP todavía requiere un parser
estructural que no confunda subtables TOML con servidores.

## Comportamiento objetivo

Un paquete neutral prepara un repositorio Git vacío sin preguntar por producto, genera gobernanza y cinco
adaptadores de harness, instala OpenSpec local fijado, mantiene estado/ownership y soporta sync/check,
reanudación y rollback. Su doctor solo observa y separa configuración, startup, tool listing y smoke
autenticado. Gates DoR/DoD verifican readiness sin mutar GitHub ni el change. Prompt 01 queda almacenado
como handoff bloqueado hasta cerrar Etapa A. Fixtures demuestran neutralidad, idempotencia, recuperación,
encontrabilidad y actualización sin drift.

## Compatibilidad legacy

El constructor no reemplaza `scripts/syncAgentHarness.mjs` ni `scripts/harnessDoctor.mjs` de PlanearIA en
esta ola; los usa como evidencia brownfield y construye una superficie autocontenida. El checker readiness
conserva su contrato y perfiles, pero sustituye `shell: true` por una invocación Windows explícita y
limitada a su allowlist estática. Los workflows OPSX existentes conservan ownership de OpenSpec y su parche
específico. Un revert del change restaura el estado previo sin migrar datos.

## Owner de spec y contexto

El contexto habilitador **Engineering Enablement / Project Constructor** es owner de las cuatro specs
`project-constructor-*`, del paquete y de sus archivos instalados. OpenSpec es owner externo de workflows
OPSX. Los proyectos generados son owners de sus overlays y archivos `project`. No hay contrato cruzado con
contextos de producto ni aplican `userId`, `src/sync` o confirmación IA.

## Evidencia actual

- Auditoría y matriz publicadas en #103.
- Gate pre-propose de #103: `PASS` el 2026-07-19.
- Working tree limpio en `development` antes de crear `feat/constructor-proyectos-nuevos`.
- Sin changes OpenSpec activos al iniciar.
- GitNexus fresh en el commit base `502746f`; consulta estructural ejecutada con CodeGraph como fallback
  para fuente lineada omitida.

- Evidencia machine-readable, fixture, verificación documental y revisión adversarial registradas bajo
  `evidencia/` y `artifacts/constructor/`.
- Gate pre-archive real en PASS; la primera corrida reveló `DEP0190`, corregido por contacto y cubierto
  antes de repetir el gate.

## Fuera de alcance

- Ejecución de discovery o Prompt 01, selección/instalación de stack y código de producto.
- Cambiar el runtime React Native/Expo de PlanearIA.
- Publicar paquetes, crear template remoto, comprar servicios o cambiar branch protection.
- Reestructurar el harness/doctor brownfield de PlanearIA fuera del arreglo por contacto del runner
  readiness que emitía `DEP0190`.
- Graphify, scanners o Knip como gates/mutaciones automáticas.
