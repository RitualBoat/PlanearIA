## MODIFIED Requirements

### Requirement: El flujo SDD incluye Definition of Ready y Definition of Done observables

El núcleo SHALL documentar y validar el flujo `issue → enrich → DoR → propose → apply → QA → revisión
adversarial → assessment de deuda → DoD → archive → PR/CI/merge → cierre`. El gate de DoR SHALL comprobar
issue, Project, historia original, criterios observables, dependencias, superficies, evidencia, rollback,
no objetivos, costos/licencias, intervenciones manuales y pausas de deuda antes de crear un change. El gate
de DoD SHALL comprobar artefactos OpenSpec, tareas completas, evidencia proporcional, rollback, revisión
adversarial y assessment reflejado antes de archive.

#### Scenario: Issue incompleto antes de propose

- **WHEN** falta un campo obligatorio, una dependencia sigue abierta o el plan está pausado para trabajo
  de producto
- **THEN** el gate read-only termina con código distinto de cero e identifica la recuperación
- **AND** no crea el change ni modifica GitHub

#### Scenario: Change incompleto antes de archive

- **WHEN** una tarea, evidencia, rollback, revisión o assessment requerido está pendiente
- **THEN** el gate de DoD bloquea archive y señala el artefacto faltante
- **AND** no marca tareas, captura deuda ni inventa evidencia automáticamente

#### Scenario: Hallazgo residual al cierre

- **WHEN** la revisión final identifica un candidato verificable
- **THEN** el assessment lo clasifica, refuta, resuelve o excepciona con evidencia
- **AND** el texto final no lo deja únicamente como aviso narrativo

#### Scenario: Ausencia de checks en un PR

- **WHEN** un PR no expone checks requeridos o su estado no puede consultarse
- **THEN** la gobernanza no interpreta la ausencia como éxito
- **AND** mantiene el cierre bloqueado con recuperación verificable

### Requirement: Los repositorios generados reciben una politica de deuda neutral

El blueprint SHALL sembrar `.project-os/debt/config.json`, schemas y registro inicial, con owner seed-once.
La política SHALL declarar siete categorías, presupuesto híbrido con umbral default 5, triggers de
saneamiento y modo GitHub `auto`: `required` con Product OS activo y `off` sin él, modificable a
`required`, `advisory` u `off`. El motor SHALL ejecutarse desde el mismo paquete público
`create-project-engineering-os` y SHALL NOT copiar source editable ni duplicar workflows OPSX.

#### Scenario: Bootstrap con perfil GitHub

- **WHEN** un repositorio se genera con el manifest del Project OS de GitHub presente
- **THEN** su politica de deuda sembrada (modo `auto`) resuelve a `required` con umbral 5

#### Scenario: Bootstrap con Product OS GitHub

- **WHEN** el repositorio contiene manifest Product OS
- **THEN** modo `auto` resuelve a `required` y umbral default 5
- **AND** no crea issue hasta que exista un trigger

#### Scenario: Bootstrap sin GitHub

- **WHEN** no existe manifest Product OS
- **THEN** modo `auto` resuelve a `off` conservando registro local
- **AND** debt check funciona sin red

#### Scenario: El proyecto ajusta su politica

- **WHEN** el owner edita la configuración seed-once
- **THEN** sync/upgrade no la sobreescribe
- **AND** el doctor valida la configuración personalizada

#### Scenario: Runtime embebido detectado

- **WHEN** un consumidor copia source del motor además del paquete
- **THEN** el check de ownership falla
- **AND** no trata la copia como fallback permitido

## ADDED Requirements

### Requirement: Upstream y consumidores tienen ownership no ambiguo

El repositorio público SHALL ser owner de CLI, blueprint, schemas, Debt Control Loop, documentación
pública y releases. Cada consumidor SHALL ser owner de su producto, política seed-once y archivos no
administrados. Un consumidor SHALL referenciar una release y SHALL NOT redefinir localmente el runtime.

#### Scenario: Cambio del núcleo después del corte

- **WHEN** un consumidor necesita modificar el CLI o motor de deuda
- **THEN** crea issue/change/PR en upstream
- **AND** adopta el resultado mediante una nueva release

#### Scenario: Personalización del proyecto

- **WHEN** el consumidor cambia un overlay o política de su ownership
- **THEN** upgrade conserva esa ruta
- **AND** upstream no incorpora automáticamente la decisión como default universal

#### Scenario: Specs locales del consumidor

- **WHEN** PlanearIA conserva specs `project-constructor-*`
- **THEN** las trata como contrato de aceptación de su versión fijada
- **AND** las specs upstream gobiernan evolución del paquete

### Requirement: Publicación y autenticación permanecen como gates humanos

Creación pública, primera publicación, configuración del trusted publisher, cambios de visibilidad,
branch/ruleset y releases mayores SHALL requerir intervención humana trazable. Doctor, bootstrap y upgrade
SHALL NOT aceptar términos, autenticar, crear credenciales, comprar, publicar o cambiar protección.

#### Scenario: Primera publicación pendiente

- **WHEN** el release candidate está listo pero falta aprobación o sesión npm
- **THEN** el flujo se detiene con evidencia y pasos manuales
- **AND** no afirma que el paquete fue reservado

#### Scenario: Credenciales ausentes

- **WHEN** una operación remota requiere autenticación
- **THEN** reporta el gate sin revelar valores
- **AND** conserva la operación local recuperable

#### Scenario: Release mayor

- **WHEN** la versión propuesta cambia el major
- **THEN** exige guía de migración y aprobación explícita
- **AND** no publica automáticamente por la mera existencia de un tag
