# project-constructor-governance Specification

## Purpose
TBD - created by archiving change constructor-proyectos-nuevos. Update Purpose after archive.
## Requirements
### Requirement: El núcleo instala una gobernanza neutral por etapas

El constructor SHALL instalar reglas operativas que separen bootstrap, discovery, selección técnica e
inicio de producto. La conclusión de la Etapa A SHALL habilitar discovery, pero SHALL NOT declarar elegido
un stack ni permitir generación de código de producto. La estrategia de ramas y los nombres de contextos,
entidades o módulos SHALL ser configurables y no heredarán valores de PlanearIA.

#### Scenario: Núcleo validado antes de discovery

- **WHEN** el bootstrap, la paridad, el doctor y las validaciones universales terminan sin `FAIL` no
  justificados
- **THEN** el repositorio queda marcado como listo para iniciar discovery
- **AND** ningún perfil técnico queda activo

#### Scenario: Intento de seleccionar stack antes de discovery

- **WHEN** se solicita activar un perfil técnico sin una decisión de discovery aprobada
- **THEN** la gobernanza bloquea la activación y explica el gate faltante
- **AND** no instala dependencias de producto

#### Scenario: Configuración neutral de ramas

- **WHEN** se genera la política de ramas
- **THEN** utiliza los nombres declarados para el proyecto nuevo
- **AND** no impone `development`, ramas o protecciones específicas de PlanearIA

### Requirement: Los prompts de bootstrap y discovery son independientes

El núcleo SHALL instalar `PROMPT_00_BOOTSTRAP_ENTORNO` para preparar y validar la Etapa A sin preguntas de
producto. También SHALL instalar `PROMPT_01_DISCOVERY_PROYECTO` como handoff inerte y encontrable, pero
SHALL NOT ejecutarlo ni activar perfiles técnicos hasta que exista evidencia aprobada de cierre de Etapa A.

#### Scenario: Prompt 00 en un repositorio vacío

- **WHEN** un agente ejecuta Prompt 00
- **THEN** prepara únicamente el núcleo universal y termina informando si el entorno está listo
- **AND** no pregunta por visión, usuarios, stack ni arquitectura de producto

#### Scenario: Prompt 01 presente antes de su gate

- **WHEN** el bootstrap materializa Prompt 01
- **THEN** el archivo permanece disponible como contrato independiente
- **AND** su primera acción comprueba el cierre aprobado de Etapa A y se detiene si no existe

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

### Requirement: Las excepciones son limitadas, visibles y temporales

Las excepciones de readiness SHALL declarar campo permitido, motivo, owner, aprobador, expiración ISO y
recuperación. SHALL NOT eximir identidad del issue/change, integridad de artefactos, tareas pendientes,
secretos ni evidencia de una superficie obligatoria sin una política explícita que lo permita.

#### Scenario: Excepción válida

- **WHEN** una excepción permitida contiene todos sus campos, no ha expirado y posee aprobación
- **THEN** el gate la reporta como `EXCEPTION` con owner, expiración y recuperación
- **AND** conserva trazabilidad sin presentarla como `PASS`

#### Scenario: Excepción prohibida o vencida

- **WHEN** una excepción omite campos, está vencida o intenta eximir una condición no excepcionable
- **THEN** el gate registra `FAIL`
- **AND** exige resolver el campo o registrar una nueva decisión válida

### Requirement: GitHub Product OS se describe de forma declarativa y segura

El núcleo SHALL instalar plantillas neutrales de issues y PR, un manifiesto de labels, estados y campos del
Project, y payloads para el paquete inicial de discovery. La planificación remota SHALL ofrecer un modo
dry-run determinista que no cree, edite ni cierre recursos y que distinga entre estado remoto verificado y
estado desconocido por falta de autenticación.

#### Scenario: Dry-run offline

- **WHEN** se genera el plan de Product OS sin una sesión GitHub autenticada
- **THEN** enumera templates, labels, estados, campos e issues propuestos
- **AND** marca el estado remoto como no verificado sin realizar llamadas mutantes

#### Scenario: Dry-run autenticado

- **WHEN** existe acceso read-only al repositorio y Project
- **THEN** clasifica cada recurso como crear, reutilizar, actualizar o conflicto
- **AND** no ejecuta ninguna de esas acciones

#### Scenario: Plantillas neutrales

- **WHEN** se inspeccionan las plantillas generadas
- **THEN** incluyen historia, criterios observables, dependencias, owner, evidencia, estado, rollback y no
  objetivos cuando aplique
- **AND** no contienen dominio docente, `userId`, Expo, MVVM, breakpoints ni proveedores heredados

#### Scenario: Paquete inicial de discovery

- **WHEN** el constructor genera los payloads neutrales de discovery
- **THEN** produce los diez títulos y dependencias definidos por la gobernanza
- **AND** no crea issues remotos durante el bootstrap ni convierte entrevistas u OAuth en changes OpenSpec

### Requirement: La documentación crítica se encuentra en menos de tres saltos

El repositorio generado SHALL ofrecer entradas desde `README.md` y `AGENTS.md` que permitan llegar, con un
máximo de dos enlaces relativos, al runbook de bootstrap, jerarquía de fuentes de verdad, flujo SDD/DoR/DoD,
perfiles de evidencia, política de herramientas, rollback, `PROMPT_00_BOOTSTRAP_ENTORNO` y guía de
intervención manual. Los enlaces SHALL poder validarse automáticamente en la fixture.

#### Scenario: Prueba de encontrabilidad desde README

- **WHEN** el test recorre enlaces relativos desde `README.md`
- **THEN** localiza cada documento crítico en cero, uno o dos saltos
- **AND** no encuentra enlaces rotos en esas rutas

#### Scenario: Agente sin soporte de skills

- **WHEN** un agente solo lee `AGENTS.md`
- **THEN** obtiene el núcleo SDD, la jerarquía de verdad y las rutas hacia validación y recuperación
- **AND** no depende de skills o MCP para conocer las reglas universales

### Requirement: Los perfiles de evidencia son extensibles y se activan explícitamente

El núcleo SHALL definir perfiles declarativos para documentación, harness/tooling, UI, backend/API,
auth/seguridad, datos/migración/sync, IA, infra/deploy y librería/CLI. Cada perfil SHALL declarar
validaciones automáticas, evidencia manual, casos negativos, rollback, condiciones objetivas para `N/A` y
gate de cierre. El bootstrap SHALL activar únicamente los perfiles universales aplicables a documentación y
harness/tooling; los demás permanecerán disponibles pero inactivos hasta una decisión aprobada.

#### Scenario: Repositorio recién preparado

- **WHEN** finaliza la Etapa A
- **THEN** solo los perfiles universales declarados aparecen activos
- **AND** UI, backend, auth, datos, IA e infraestructura permanecen inactivos

#### Scenario: Perfil condicional sin decisión

- **WHEN** una validación intenta activar React Doctor, Playwright, Figma, sync o un proveedor de IA sin
  decisión técnica registrada
- **THEN** la configuración rechaza la activación
- **AND** informa la decisión o perfil requerido

#### Scenario: Cierre con N/A

- **WHEN** una evidencia se marca `N/A`
- **THEN** el gate acepta la marca únicamente si satisface una condición declarada por el perfil y conserva
  la justificación
- **AND** no permite usar `N/A` para ocultar una validación obligatoria

### Requirement: Las fuentes de verdad y el drift permanecen explícitos

La gobernanza SHALL distinguir estado real, comportamiento esperado, reglas operativas, estado diario,
evidencia automática, evidencia manual e historia OpenSpec archivada. SHALL definir una precedencia
observable y SHALL NOT asumir que un change archivado continúa siendo política vigente. Una contradicción
detectada SHALL producir un hallazgo de drift con fuente vigente y acción de normalización.

#### Scenario: Documento histórico contradice el runtime

- **WHEN** una regla archivada o plan cerrado contradice código y tests actuales
- **THEN** el reporte identifica ambas fuentes y clasifica el estado real por la precedencia declarada
- **AND** registra la contradicción sin reescribirla silenciosamente

#### Scenario: Regla operativa contradictoria

- **WHEN** dos fuentes activas asignan ownership o secuencia diferente al mismo proceso
- **THEN** la validación reporta `FAIL` o un gate manual pendiente
- **AND** exige una decisión de normalización antes de automatizar ese proceso

### Requirement: Las acciones humanas permanecen como gates trazables

OAuth, autenticación, aprobación de costos/licencias, branch protection, entrevistas y decisiones
irreversibles SHALL documentarse como intervenciones humanas con causa, verificación y evidencia esperada.
SHALL NOT representarse como changes ficticios ni ejecutarse automáticamente por el doctor o bootstrap.

#### Scenario: Autenticación requerida

- **WHEN** una comprobación necesita consentimiento OAuth o scopes adicionales
- **THEN** reporta `WARN` o `SKIP` según la política y enlaza la guía manual
- **AND** no abre navegador, autentica ni inicia un flujo de consentimiento

#### Scenario: Servicio con costo o licencia no aprobada

- **WHEN** una opción requiere pago, licencia incompatible o aceptación contractual
- **THEN** permanece desactivada y crea un gate de decisión
- **AND** el núcleo universal continúa operando sin esa herramienta

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

