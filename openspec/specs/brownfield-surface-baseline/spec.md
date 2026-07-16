# brownfield-surface-baseline Specification

## Purpose
TBD - created by archiving change baseline-specs-brownfield-por-contacto. Update Purpose after archive.
## Requirements
### Requirement: Cada change nuevo registra un baseline brownfield acotado

PlanearIA SHALL requerir que cada change versionable nuevo incluya `brownfield-baseline.md` en su raíz antes de archive. El baseline SHALL describir únicamente las superficies que el change pretende tocar y SHALL incluir secciones no vacías de superficies tocadas, fuentes de verdad actuales, comportamiento vigente, comportamiento objetivo, compatibilidad legacy, owner de spec y contexto, evidencia actual y fuera de alcance.

#### Scenario: Change documental limitado

- **WHEN** un agente propone un change que solo modifica documentación y harness
- **THEN** su baseline enumera únicamente esas rutas, specs, pruebas y contratos relevantes
- **AND** declara explícitamente que las pantallas, datos académicos, `src/sync`, backend e IA quedan fuera de alcance

#### Scenario: Change futuro de superficie UX

- **WHEN** un agente propone una fundación UX como `theming-runtime` o `app-shell-navegacion`
- **THEN** el baseline identifica Experiencia y Preferencias como contexto owner de la superficie
- **AND** distingue sus consumidores de los owners de datos de Office, Classroom, Sync e IA

### Requirement: El baseline hace explícito el delta y la compatibilidad legacy

El baseline SHALL separar hechos verificables del comportamiento vigente del comportamiento objetivo. SHALL declarar qué contrato legacy se conserva, se depreca con migración o no aplica con una razón concreta; no podrá sustituir esa declaración con una lista de tareas o una afirmación genérica.

#### Scenario: Compatibilidad preservada durante migración gradual

- **WHEN** una superficie existente conserva rutas, tokens o fallback legacy mientras migra por contacto
- **THEN** el baseline identifica el comportamiento preservado, sus consumidores y la condición para retirarlo
- **AND** la spec del change no trata esa compatibilidad como comportamiento nuevo implícito

#### Scenario: Sin compatibilidad legacy aplicable

- **WHEN** una superficie no tiene contrato anterior que conservar
- **THEN** el baseline registra `No aplica` junto con la razón y las fuentes revisadas
- **AND** mantiene evidencia suficiente para que un revisor distinga ausencia de contrato de falta de investigación

### Requirement: Las primeras superficies UX tienen owner de spec declarado

La guía brownfield SHALL identificar `theming-runtime`, `breakpoints-reactivos`, `tokens-completos` y `app-shell-navegacion` como superficies de Experiencia y Preferencias. Para cada una SHALL registrar fuentes técnicas actuales y compatibilidad a revisar, sin transferir ownership de entidades de otros bounded contexts.

#### Scenario: AppShell enlaza una experiencia con datos ajenos

- **WHEN** una spec de AppShell presenta entradas hacia Office, Classroom, Sync o Asistente IA
- **THEN** declara al shell como owner de navegación y a esas experiencias como consumidoras o destinos
- **AND** conserva los owners de datos y contratos cruzados definidos por el mapa DDD

### Requirement: El ejemplo brownfield es verificable sin aplicar producto

PlanearIA SHALL mantener una plantilla y un ejemplo de delta brownfield que puedan ser validados por OpenSpec estricto y por las fixtures del gate, sin crear ni aplicar el change UX usado como ejemplo.

#### Scenario: Mantenedor verifica el ejemplo

- **WHEN** un mantenedor ejecuta la validación OpenSpec y las pruebas focalizadas del gate
- **THEN** la spec y el delta brownfield cumplen el formato SHALL/WHEN/THEN
- **AND** las fixtures demuestran aceptación de un baseline válido y rechazo de uno faltante o incompleto
