## ADDED Requirements

### Requirement: Las instrucciones OpenSpec sincronizadas preservan la convención TLDR

Las fuentes canónicas de instrucciones de PlanearIA y el parche determinista posterior a `openspec update` SHALL comunicar la convención `TLDR.md` a los flujos de propose, apply y archive. Propose SHALL indicar crear la plantilla; apply SHALL indicar actualizarla ante cambios materiales; y archive SHALL indicar comprobar que se conserva con el directorio. Los mirrors generados SHALL derivarse de esas fuentes y nunca convertirse en autoridad mediante edición manual.

#### Scenario: Regeneración de workflows conserva el ciclo de vida TLDR
- **WHEN** un mantenedor ejecuta `npm run agent:opsx:update` y después `npm run agent:harness:sync`
- **THEN** los workflows y mirrors afectados contienen las responsabilidades de propose, apply y archive para `TLDR.md`
- **AND** `npm run agent:opsx:patch:check` y `npm run agent:harness:check` terminan sin drift

#### Scenario: Cambio de una fuente canónica se propaga sin editar espejos
- **WHEN** un mantenedor ajusta la guía TLDR en una fuente bajo `.agents/` o en el parche canónico de workflows
- **THEN** regenera los destinos con los comandos del repositorio
- **AND** no edita manualmente `AGENTS.md`, `CLAUDE.md` ni los comandos generados por un harness
