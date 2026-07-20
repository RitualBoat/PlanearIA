## Why

PlanearIA ya posee gobernanza, SDD, harnesses y validaciones maduras, pero están acopladas a su dominio
docente y a React Native/Expo. La Ola 0 extrae un núcleo universal ejecutable para que un repositorio vacío
pueda quedar gobernado, reproducible y verificable antes de preguntar qué producto se construirá.

Issue de origen: #103. Plan maestro afectado:
`Documentacion/01-planes-maestros/PLAN_CONSTRUCTOR_PROYECTOS_NUEVOS.md`.

## What Changes

- Añadir un paquete/CLI neutral y versionado como única fuente ejecutable del constructor, sin dependencias
  de producto y con bootstrap recuperable sobre repositorios vacíos.
- Definir un manifiesto canónico para gobernanza, instrucciones, reglas por path, skills, permisos, MCP y
  perfiles de evidencia; renderizar espejos deterministas para Codex, Claude Code, Cursor, OpenCode y
  GitHub Copilot.
- Añadir `sync` y `sync --check`, ownership explícito de archivos, degradaciones por harness, fixtures e
  idempotencia verificable. Los workflows OPSX continúan bajo ownership separado de OpenSpec.
- Añadir un doctor estrictamente read-only con salida humana y JSON, estados `PASS`, `FAIL`, `WARN` y
  `SKIP`, causa y recuperación; configuración, startup, tool listing y smoke autenticado se reportan como
  señales distintas.
- Añadir el plan maestro, auditoría as-is, matriz de transferibilidad, gap analysis, runbook, compatibilidad
  agente/SO, costos/licencias, rollback, `PROMPT_00_BOOTSTRAP_ENTORNO` y un
  `PROMPT_01_DISCOVERY_PROYECTO` inerte que solo puede ejecutarse tras aprobar la Etapa A.
- Añadir gates DoR/DoD read-only ejecutables con metadata, excepciones temporales limitadas y salida
  humana/JSON; un estado remoto no verificable no se interpreta como éxito.
- Añadir CI advisory del constructor y una fixture de repositorio vacío que demuestre bootstrap,
  segundo run sin drift, neutralidad y recuperación de una ejecución parcial.

## Capabilities

### New Capabilities

- `project-constructor-bootstrap`: bootstrap neutral, manifiesto de ownership, reanudación, idempotencia,
  actualización y rollback sobre un repositorio vacío.
- `project-constructor-governance`: instalación del núcleo universal de SDD/OpenSpec, documentación,
  GitHub Product OS, plantillas y perfiles de evidencia sin seleccionar todavía un stack de producto.
- `project-constructor-harness`: fuente canónica neutral, renderers, paridad, matriz de capacidades y
  degradación explícita entre harnesses.
- `project-constructor-doctor`: diagnóstico humano/JSON estrictamente read-only y separación verificable
  entre presencia de configuración, arranque, listado de herramientas y smoke autenticado.

### Modified Capabilities

Ninguna. Las specs vigentes de PlanearIA continúan gobernando este repositorio; el constructor introduce
contratos nuevos y neutrales para proyectos futuros.

## Impact

- Nueva superficie autocontenida bajo `tools/project-constructor/`, implementada con Node y APIs
  multiplataforma.
- Nueva documentación bajo `Documentacion/01-planes-maestros/` y `Documentacion/02-operacion/`.
- Nuevos tests/fixtures del constructor y workflow CI advisory; no cambia CI/CD del producto.
- Podrán añadirse scripts raíz mínimos para ejecutar y validar el paquete desde PlanearIA, y correcciones
  por contacto indispensables para que el gate real no emita warnings de seguridad.
- No se modifica `src/`, `backend/`, datos, sync, autenticación, IA, UI ni dependencias de producto.
- OpenSpec local permanece fijado; sus workflows OPSX no se duplican dentro del renderer del constructor.

## No objetivos

- Ejecutar discovery, preguntar por el producto, elegir stack o instalar frameworks, bases de datos,
  proveedores cloud o servicios pagados.
- Ejecutar `PROMPT_01_DISCOVERY_PROYECTO`, producir sus artefactos de visión/arquitectura, activar perfiles
  técnicos o crear el primer código de producto; pertenecen a olas posteriores del plan maestro. Ola 0
  solo almacena el prompt independiente como handoff no ejecutable automáticamente.
- Copiar PlanearIA, su dominio docente, `userId`, breakpoints, MVVM, Expo, MongoDB, Vercel, offline, sync o
  IA como defaults.
- Convertir entrevistas, OAuth o aprobaciones humanas en changes OpenSpec ficticios.
- Reimplementar la generación de workflows OPSX ni usar Graphify como requisito.
- Corregir automáticamente hallazgos de `npm audit`, scanners o Knip, o borrar código sin revisión humana.
