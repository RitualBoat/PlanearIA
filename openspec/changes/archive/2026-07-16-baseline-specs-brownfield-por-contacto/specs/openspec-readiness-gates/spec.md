## ADDED Requirements

### Requirement: El gate de archive valida el baseline brownfield

El gate read-only de archive SHALL comprobar que el change contiene un `brownfield-baseline.md` confinado a su raíz y que incluye las secciones mínimas del contrato brownfield. SHALL informar la sección faltante o incompleta con una recuperación segura y SHALL NOT ejecutar contenido declarado por el baseline o por `readiness.json`.

#### Scenario: Baseline ausente

- **WHEN** un mantenedor ejecuta el gate de archive para un change que no contiene `brownfield-baseline.md`
- **THEN** el gate falla antes de archive e indica que debe crear el artefacto en la raíz del change
- **AND** no modifica archivos, tareas ni metadatos

#### Scenario: Baseline completo y enfocado

- **WHEN** un change contiene todas las secciones brownfield requeridas con contenido verificable
- **THEN** el gate registra PASS para el baseline
- **AND** continúa con las validaciones estáticas de tareas, evidencia, rollback y revisión adversarial

#### Scenario: Markdown no puede inyectar ejecución

- **WHEN** el baseline contiene bloques de código, enlaces o texto que parece un comando
- **THEN** el gate lo trata únicamente como documentación estructural
- **AND** ejecuta solo los comandos fijos permitidos por los perfiles de superficie
