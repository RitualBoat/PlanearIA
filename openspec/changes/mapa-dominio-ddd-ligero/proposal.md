## Why

Issue #63 necesita un lenguaje y una propiedad de datos explícitos para que los cambios futuros no dupliquen modelos, servicios ni significados entre Office, Classroom, comunicación y capacidades transversales. El repositorio ya es un monolito modular offline-first con límites técnicos dispersos; R1 del plan de Preparación Operativa requiere convertirlos en una referencia estratégica ligera antes de ampliar la suite UX/UI.

## What Changes

- Crear un mapa DDD estratégico ligero y un glosario docente versionados en la documentación fundamental.
- Declarar contextos delimitados, owner de cada entidad compartida, consumidores autorizados, referencias y sus invariantes.
- Modelar sync/offline, adjuntos, notificaciones, seguridad/autorización y asistencia IA como capacidades transversales, no como dueños de datos académicos.
- Hacer encontrable el mapa desde la arquitectura o su índice vigente.
- Ajustar las instrucciones de `design.md` para que un change cruzado declare contextos, owner y contrato; un change intra-contexto debe declarar que no necesita contrato cruzado.
- Mantener explícitamente el monolito modular: estos límites no crean microservicios, CQRS, event sourcing ni una migración global.

## No objetivos

- Reorganizar carpetas, Contexts, rutas, tipos, storage o endpoints existentes.
- Cambiar datos académicos, sincronización, auth, IA, SQLite o la UX de producto.
- Crear infraestructura distribuida o aplicar patrones DDD tácticos fuera de la documentación y la regla de planificación.

## Capabilities

### New Capabilities

- `strategic-domain-map`: referencia estratégica de contextos, glosario, propiedad de entidades e invariantes para PlanearIA.
- `cross-context-change-contract`: contrato de planificación que distingue cambios intra-contexto de cambios que requieren declarar una integración entre contextos.

### Modified Capabilities

- Ninguna. Las specs actuales de readiness y de política de herramientas siguen vigentes; este change añade una referencia de dominio y un contrato de diseño complementario.

## Impact

- Documentación: nuevo mapa en `Documentacion/00-fundamentos/` y enlace desde la arquitectura o índice relacionado.
- Planificación: regla de artefacto `design` en `openspec/config.yaml`.
- Evidencia: consultas de ejemplo de owner/contexto, `openspec validate --all --strict` y `npm run agent:harness:check` durante la implementación.
- No hay cambios de runtime, APIs, esquema MongoDB, AsyncStorage/SQLite, colas sync ni datos de usuarios.
