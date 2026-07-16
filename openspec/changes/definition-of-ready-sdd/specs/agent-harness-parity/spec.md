## ADDED Requirements

### Requirement: La guía DoR/DoD se conserva desde la fuente hasta los workflows regenerados

Las instrucciones fuente bajo `.agents` SHALL comunicar los gates de Definition of Ready y Definition of Done, incluidos sus comandos explícitos y el contrato de excepciones. Los espejos project-owned SHALL derivarse exclusivamente del generador existente. El parche post-update de OpenSpec SHALL insertar y verificar la guía equivalente en los flujos `propose` y `archive` que pertenecen a la CLI.

#### Scenario: Sincronización de instrucciones raíz
- **WHEN** un mantenedor actualiza la guía DoR/DoD en la fuente `.agents` y ejecuta el generador del harness
- **THEN** `AGENTS.md`, `CLAUDE.md` y el espejo Copilot contienen la misma guía normativa sin edición manual de los destinos

#### Scenario: Regeneración de workflows OpenSpec
- **WHEN** un mantenedor ejecuta `agent:opsx:update` y el parche post-update
- **THEN** los workflows `propose` y `archive` indican ejecutar el gate de readiness correspondiente y el check de parche confirma que la guía no se perdió

#### Scenario: Espejo editado manualmente
- **WHEN** un destino generado difiere de su fuente de instrucciones o del parche canónico
- **THEN** los checks de paridad o parche reportan drift con el comando de regeneración aplicable
