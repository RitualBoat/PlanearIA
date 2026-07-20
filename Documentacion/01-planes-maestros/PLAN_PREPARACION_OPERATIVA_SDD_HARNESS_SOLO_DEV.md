# Plan Maestro: Preparacion Operativa SDD y Harness Solo-Dev - PlanearIA

> **Version:** 1.0
> **Fecha:** 2026-07-14
> **Formato:** SDD con OpenSpec (`meta_guia_planes.md` v3)
> **Alcance:** corregir los bloqueos operativos, de contexto, validacion y gobernanza detectados antes y durante las primeras olas del plan UX/UI. No implementa las experiencias de producto del plan UX/UI.
> **Estado:** activo como prerrequisito transversal de UX/UI
> **Plan consumidor:** `PLAN_UXUI_NAVEGACION_GLOBAL.md`
> **Guia manual:** `../02-operacion/GUIA_MANUAL_PREPARACION_SDD_HARNESS.md`
> **Epic GitHub:** `#42` - https://github.com/RitualBoat/PlanearIA/issues/42

## 1. Blueprint

### 1.1 Objetivo y vision

Conseguir que un desarrollador solo pueda dirigir agentes de codigo de forma repetible, trazable y segura:

```text
intencion
  -> issue y Project
    -> enrich
      -> change OpenSpec pequeno
        -> implementacion y pruebas
          -> evidencia visual/operativa
            -> revision adversarial
              -> PR y archive
```

El plan cierra la diferencia entre "herramienta declarada" y "herramienta realmente utilizable". Al cerrarlo, las olas UX/UI podran avanzar sin que los agentes tengan que redescubrir rutas, adivinar ground truth, saltarse validaciones o mezclar cambios no relacionados.

### 1.2 Relacion con el plan UX/UI

Este plan no sustituye ni pausa por completo `PLAN_UXUI_NAVEGACION_GLOBAL.md`. Define tres umbrales just-in-time:

| Umbral | Debe cumplirse antes de | Contenido minimo |
| --- | --- | --- |
| R0 | crear el primer change de Ola 0 UX/UI | working tree/historial clasificado, 93 suites/608 tests verdes, GitHub Projects accesible, OpenSpec estable, una herramienta estructural operativa y branch protegida con CI base |
| R1 | iniciar Ola 1 UX/UI | doctor del harness, cronologia UX/IHC coherente, Definition of Ready y mapa DDD ligero |
| R2 | iniciar implementacion visual de Ola 2 | ground truth Figma enlazado, golden journeys web, tests con senal limpia y docentes reclutados para IHC |

No es necesario cerrar todas las tareas de mantenimiento antes de empezar UX/UI. Se cierra cada riesgo antes de la ola que lo consume.

### 1.3 Lineas de ejecucion

#### Linea A: gates manuales/externos

Acciones que requieren autenticacion, criterio visual, decisiones de riesgo o contacto humano. Se rastrean con issue, evidencia y estado, pero no crean un change OpenSpec si no modifican el repositorio.

#### Linea B: changes OpenSpec del harness

Cambios versionables en scripts, configuracion, CI, documentacion, tests y reglas arquitectonicas. Cada entrada sigue issue -> enrich -> propose -> apply -> QA -> adversarial review -> archive.

#### Linea C: changes del plan UX/UI

Continuaran en `PLAN_UXUI_NAVEGACION_GLOBAL.md`. Este plan solo aporta prerequisitos; no duplica `theming-runtime`, `app-shell-navegacion`, componentes o pantallas.

### 1.4 Decisiones tomadas

| ID | Fecha | Decision |
| --- | --- | --- |
| D1 | 2026-07-14 | No crear un unico change para toda la auditoria. Un fallo no debe bloquear ni mezclar veinte correcciones. |
| D2 | 2026-07-14 | Un change OpenSpec activo a la vez. Un segundo agente puede revisar, pero no implementar otro change grande en paralelo. |
| D3 | 2026-07-14 | GitNexus es primario para estructura y CodeGraph es fallback lineado. La decision del issue #51 retiro Graphify del MCP activo; solo puede evaluarse como auditoria local manual y no bloquea CI, paridad ni doctor. |
| D4 | 2026-07-14 | Adoptar DDD estrategico ligero, sin microservicios, CQRS ni event sourcing. |
| D5 | 2026-07-14 | Proteger `development` con PR y CI base, sin exigir aprobacion humana externa a un desarrollador solo. |
| D6 | 2026-07-14 | Crear issues solo para la ola activa y la siguiente. El backlog futuro permanece en este documento. |
| D7 | 2026-07-14 | Las entrevistas se realizan con prototipo Figma antes de cerrar Ola 2 y, preferentemente, antes de implementar sus pantallas costosas. |
| D8 | 2026-07-14 | La deuda legacy se corrige por contacto: toda pantalla tocada debe salir mas delgada y respetar limites nuevos, sin refactor global previo. |
| D9 | 2026-07-14 | Los resultados de Knip y scanners son candidatos a investigar; nunca autorizan borrado automatico. |
| D10 | 2026-07-14 | Dependencias Expo se actualizan por SDK y con compatibilidad validada; no se aplica un upgrade masivo a `latest`. |

### 1.5 Baseline de auditoria

Estado confirmado al crear este plan:

- En el commit auditado originalmente pasaban TypeScript, ESLint, 93 suites/608 tests y backend smoke.
- Tras los commits concurrentes locales, Jest retrocedio temporalmente a 29 suites/259 tests fallidos. El incidente se resolvio el 2026-07-14 en `#48`: `development` local/remoto quedo en `6dc6b98`, el historial roto se preservo en una branch de seguridad y volvieron a pasar 93 suites/608 tests.
- CodeGraph esta fresco y utilizable.
- GitNexus no puede reindexar por fallo FTS y sus consultas quedaron sin resultados estructurales utiles.
- Baseline historico: Graphify tenia artefactos generados, pero `graphify` y `uv` no estaban disponibles en PATH. El issue #51 lo retiro del MCP activo; `graphify-out/` queda como salida local opcional, no health check.
- `mcp:parity` valida el conjunto activo y rechaza Graphify si reaparece; `mcp:test` comprueba solo los servidores MCP activos.
- OpenSpec funciona mediante `npx @fission-ai/openspec`, pero no esta normalizado como dependencia del repo y un script referencia un paquete/version incorrectos.
- GitHub CLI no tiene `read:project`/`project`.
- `development` no esta protegida.
- Los checks de paridad del harness son `continue-on-error`.
- El plan UX/UI y el documento IHC colocan entrevistas antes de cerrar Ola 2, mientras que la ejecucion conversada las colocaba en Ola 3.
- Las carpetas ground truth son indices de material externalizado y no registran frames Figma aprobados.
- La arquitectura presenta un Stack central grande, providers globales, pantallas extensas y excepciones a MVVM/storage/API.
- Los tests pasan con warnings `act()` y ruido de consola.
- `npm audit` detecta riesgo alto en `xlsx` y riesgos transitivos adicionales.
- Durante la redaccion, otro proceso convirtio cambios de producto en dos commits locales sobre `development` y absorbio este archivo nuevo dentro de un commit no relacionado. Resuelto en `#43`/`#48`: se preservo `codex/safety-react-doctor-broken-20260714`, se realineo `development` sin reset destructivo y este plan vive en `codex/readiness-operativa-sdd`.

### 1.6 Definition of Ready provisional

Ningun change de este plan entra a `propose` sin:

- Issue creado y agregado a `PlanearIA Product OS`.
- Historia enriquecida sin sobrescribir el original.
- Dependencias archivadas o declaradas como gate manual satisfecho.
- Working tree limpio para el alcance o worktree/branch aislado.
- Estado actual verificado con GitNexus o CodeGraph y lectura directa cuando corresponda.
- Criterios observables, evidencia esperada, rollback y no objetivos.
- Decision explicita sobre si requiere intervencion manual.

### 1.7 Definition of Done comun

Un change no se archiva hasta que:

- Todos los escenarios OpenSpec y tareas estan completos.
- Pasan las validaciones proporcionales al riesgo.
- No introduce nuevos warnings de consola ni nuevas excepciones arquitectonicas sin decision escrita.
- La evidencia queda vinculada al issue/PR.
- La revision adversarial no deja hallazgos bloqueantes.
- El PR esta integrado y las specs fueron sincronizadas/archivadas.
- El issue y Project reflejan el estado final.

### 1.8 Riesgos y anti-patrones

- Crear un mega-change `fix-all-audit`.
- Pedir a un agente que ejecute todo durante horas sin checkpoints ni PRs intermedios.
- Hacer que OpenSpec modele clics OAuth o entrevistas humanas como si fueran cambios de codigo.
- Exigir GitNexus, CodeGraph y Graphify en cada tarea.
- Activar branch protection con checks que no siempre se ejecutan por filtros de paths.
- Convertir toda la arquitectura a DDD tactico.
- Refactorizar las 61 pantallas antes de avanzar producto.
- Crear todos los issues de todas las olas desde el primer dia.
- Aceptar `mcp:parity` como prueba de que los servidores arrancan y autentican.
- Borrar archivos solo porque Knip los reporta.

### 1.9 No objetivos

- Redisenar pantallas o implementar las olas UX/UI.
- Cerrar el plan Auth completo.
- Activar SQLite como almacenamiento default.
- Crear microservicios o infraestructura pagada.
- Sustituir todos los Context de forma global.
- Resolver toda la deuda legacy antes de entregar valor.

### 1.10 Seguimiento Product OS de readiness

> Verificado el 2026-07-16 con la epic [#42](https://github.com/RitualBoat/PlanearIA/issues/42),
> `PlanearIA Product OS` y consultas de GitHub CLI. La decision de normalizacion se registra en
> [#65](https://github.com/RitualBoat/PlanearIA/issues/65).

| Superficie | Estado operativo | Decision vigente |
| --- | --- | --- |
| Epic #42 | Abierta, `In progress` | Conserva el seguimiento de R1 y de los gates que aun bloquean R2; no se cierra con Ola 0. |
| Gate M | #43-#45 cerrados; #46/#47 abiertos y `Parked` | Se conserva abierto: Figma e IHC estan diferidos, pero no bloquean R0/R1. |
| Ola 0 | #48-#52 cerrados y `Done` | El milestone se cierra como ciclo terminado; sus issues permanecen como evidencia. |
| Ola 1 | #62, #63 y #64 cerrados; #65 normaliza la gobernanza | #65 es el unico change versionable durante su ejecucion; despues de archive, una nueva historia requiere autorizacion propia. |
| Deuda posterior | [#66](https://github.com/RitualBoat/PlanearIA/issues/66) abierta, `Backlog`, sin milestone | Es tracking post-Ola 0 de dos remediaciones separadas: doctor/GitNexus y compatibilidad Expo. No se mezcla con #65 ni reabre Ola 0. |

La normalizacion cierra solo milestones historicos sin issues abiertos: `Ciclo 0 -
Reorientacion y GitHub`, `Ciclo 1 - Plan Classroom`, `Ciclo 2 - Fundacion Classroom`,
`Ciclo 3 - Infraestructura Local y CI` y `Readiness Ola 0`. Conserva `Ciclo 3 -
UX/Navegacion Global`, `Ciclo 4 - Auth y Seguridad` y `Readiness Gate M`; no se propone
renombrar ni borrar milestones, issues o items.

## 2. Backlog de User Stories y Changes

### Gate M: intervencion manual y autorizaciones

Estas historias se crean como issues con labels `needs-input` y `infra` o `ux-ui`. No requieren OpenSpec mientras no modifiquen archivos del repositorio.

#### Gate: `clasificar-working-tree-actual`

- **Issue sugerido:** `[Readiness][Manual] Clasificar y aislar cambios locales existentes`
- **Historia:** Como desarrollador unico, quiero identificar a que trabajo pertenecen los cambios locales actuales para no mezclarlos ni perderlos al iniciar la remediacion.
- **Criterios de aceptacion:**
  - Existe una lista de archivos modificados, commits locales por delante de origin y su proposito conocido.
  - Cada cambio queda en una branch/commit propio, se mantiene como WIP consciente o se autoriza explicitamente retirarlo mediante una estrategia no destructiva revisada.
  - El plan y su guia dejan de estar mezclados dentro de commits `react-doctor` u otro alcance ajeno.
  - El primer change de readiness parte de un worktree o branch sin cambios ajenos.
- **Evidencia:** `git status --short`, `git log origin/development..development`, diff revisado y enlace al commit/PR o decision del usuario.
- **Intervencion usuario:** obligatoria para declarar si reconoce y desea conservar los cambios.
- **Depende de:** nada.
- **Estado:** pendiente.
- **Labels:** `needs-input`, `infra`.

#### Gate: `autorizar-github-projects-cli`

- **Issue sugerido:** `[Readiness][Manual] Autorizar GitHub CLI para PlanearIA Product OS`
- **Historia:** Como desarrollador unico, quiero que los agentes puedan consultar y actualizar mi Project para que ningun change quede fuera del flujo SDD.
- **Criterios de aceptacion:**
  - `gh auth status` conserva los scopes actuales y agrega `read:project` y `project`.
  - `gh project list --owner RitualBoat` muestra `PlanearIA Product OS`.
  - Se puede agregar un issue de prueba o del plan al Project sin pegar tokens en archivos o chats.
- **Evidencia:** salida redactada de `gh auth status` y `gh project list`.
- **Intervencion usuario:** obligatoria en el navegador/device flow.
- **Depende de:** `clasificar-working-tree-actual` solo para iniciar cambios de repo; la autorizacion puede hacerse antes.
- **Estado:** pendiente.
- **Labels:** `needs-input`, `infra`.

#### Gate: `proteger-development-solo-dev`

- **Issue sugerido:** `[Readiness][Manual] Proteger development con PR y CI base`
- **Historia:** Como desarrollador unico, quiero impedir merges con validaciones fallidas sin exigir un revisor humano externo para conservar velocidad con una red de seguridad real.
- **Criterios de aceptacion:**
  - `development` requiere pull request.
  - `TypeScript`, `ESLint`, `Jest` y `Backend smoke` son checks requeridos.
  - Force push y borrado estan deshabilitados.
  - No se exige una aprobacion humana imposible para el propietario unico.
  - Una consulta API confirma que existe proteccion.
- **Evidencia:** captura/configuracion de Rulesets o Branch protection y respuesta API 200.
- **Intervencion usuario:** recomendada para revisar la configuracion; Codex puede aplicarla despues con autorizacion explicita.
- **Depende de:** CI base verde.
- **Estado:** pendiente.
- **Labels:** `needs-input`, `infra`.

#### Gate: `aprobar-ground-truth-figma`

- **Issue sugerido:** `[Readiness][Manual] Aprobar archivo y frames Figma para UX/UI`
- **Historia:** Como responsable de producto, quiero declarar cuales frames son ground truth para que los agentes implementen decisiones visuales aprobadas y no inventen la interfaz.
- **Criterios de aceptacion:**
  - Existe un archivo Figma Design de PlanearIA accesible al MCP.
  - Cada frame aprobado tiene enlace con `node-id`, breakpoint y estado.
  - Se distinguen frames de exploracion, aprobados y obsoletos.
  - El prototipo Escritorio -> Crear puede recorrerse sin explicacion del moderador.
- **Evidencia:** indice versionado de enlaces y prototype link.
- **Intervencion usuario:** obligatoria para aprobacion visual; Codex puede construir y registrar material bajo instrucciones.
- **Depende de:** decisiones de shell de Ola 1 para aprobacion definitiva. Puede prepararse en paralelo.
- **Estado:** pendiente.
- **Labels:** `needs-input`, `ux-ui`.

#### Gate: `reclutar-docentes-ihc`

- **Issue sugerido:** `[IHC][Manual] Reclutar docentes y calendarizar entrevistas del prototipo`
- **Historia:** Como responsable de producto, quiero observar a docentes diversos usando el prototipo para corregir Ola 2 y Ola 3 con evidencia real.
- **Criterios de aceptacion:**
  - Hay 3-5 participantes y variedad de conectividad, experiencia digital y uso de IA.
  - Cada participante conoce el proposito, tratamiento de notas y posibilidad de retirarse.
  - Las sesiones tienen fecha, dispositivo y guion.
  - No se recopilan nombres de estudiantes ni informacion escolar sensible.
- **Evidencia:** agenda anonimizada y plantilla de consentimiento/notas.
- **Intervencion usuario:** obligatoria; los agentes no contactan docentes por cuenta propia.
- **Depende de:** prototipo Figma navegable.
- **Estado:** pendiente; activar antes de UX/UI Ola 2.
- **Labels:** `needs-input`, `ux-ui`.

### Ola 0: toolchain SDD y code intelligence confiable

Crear estos issues al activar el plan. Cada uno es un change OpenSpec independiente.

#### Change: `recuperar-baseline-verde-react-doctor`

- **Issue sugerido:** `[Blocker] Recuperar baseline verde tras cadena de commits React Doctor`
- **Historia:** Como desarrollador unico, quiero separar y corregir la cadena local de commits que reintrodujo fallos para comenzar readiness desde un estado probado sin perder trabajo intencional ni mezclar el nuevo plan.
- **Criterios de aceptacion:**
  - Se documenta el grafo de commits locales respecto a `origin/development` y que cambios reintrodujo cada uno.
  - Se crea una referencia/branch de respaldo antes de modificar historial o contenido.
  - Los documentos de este plan quedan en un commit/PR documental propio.
  - Se conservan solo las correcciones React Doctor demostrablemente validas o se propone su reimplementacion separada.
  - TypeScript, ESLint, backend smoke y las 93 suites/608 tests vuelven a pasar.
  - No se hace push de la cadena rota.
- **Paridad:** funcional.
- **Ground truth:** `origin/development`, commits locales, tests y diffs actuales.
- **Depende de:** gates `clasificar-working-tree-actual` y `autorizar-github-projects-cli`.
- **Evidencia:** mapa de commits, branch de respaldo, diff final y validaciones verdes.
- **Estado:** pendiente y bloqueante R0.
- **Labels:** `change`, `infra`, `testing`.

#### Change: `normalizar-openspec-cli`

- **Issue sugerido:** `[Readiness] Normalizar y fijar OpenSpec CLI en el repositorio`
- **Historia:** Como desarrollador unico, quiero una version reproducible de OpenSpec y scripts correctos para que todos los agentes ejecuten el mismo flujo sin depender de instalaciones globales.
- **Criterios de aceptacion:**
  - El paquete oficial `@fission-ai/openspec` esta fijado deliberadamente o existe un wrapper equivalente versionado.
  - Todos los scripts usan el paquete oficial y dejan de referenciar `openspec@1.5.0`.
  - `list`, `validate`, `update` y el parche de workflows funcionan en Windows y CI o documentan claramente la excepcion local.
  - Un smoke check falla con mensaje accionable si el CLI no esta disponible.
- **Paridad:** funcional.
- **Ground truth:** repositorio oficial OpenSpec y `openspec/config.yaml`.
- **Depende de:** `recuperar-baseline-verde-react-doctor`, `autorizar-github-projects-cli` para el flujo completo.
- **Evidencia:** version, comandos smoke, harness check y diff de instrucciones controlado.
- **Estado:** pendiente.
- **Labels:** `change`, `infra`, `testing`.

#### Change: `reparar-gitnexus-fts`

- **Issue sugerido:** `[Readiness] Reparar indexado y consultas estructurales de GitNexus`
- **Historia:** Como agente de desarrollo, quiero consultar estructura e impacto con GitNexus para modificar PlanearIA sin releer el repositorio completo ni adivinar dependencias.
- **Criterios de aceptacion:**
  - El indice corresponde al commit actual o el comando reporta claramente que esta stale.
  - `analyze --index-only` termina sin el error de extension FTS.
  - Una consulta MVVM y un `impact` de simbolo conocido devuelven archivos/simbolos utiles.
  - El procedimiento de reparacion queda versionado y no inyecta archivos de agente.
  - CodeGraph permanece como fallback documentado.
- **Paridad:** funcional.
- **Ground truth:** politica GitNexus/CodeGraph de `AGENTS.md`.
- **Depende de:** `normalizar-openspec-cli` solo para ejecutar el ciclo SDD, no para diagnosticar.
- **Evidencia:** status, reindex, query e impact exitosos.
- **Estado:** pendiente.
- **Labels:** `change`, `infra`, `testing`.

#### Change: `resolver-graphify-runtime`

- **Issue sugerido:** `[Readiness] Reparar o retirar Graphify del runtime obligatorio`
- **Historia:** Como desarrollador unico, quiero que Graphify sea una herramienta opcional realmente utilizable o deje de anunciarse como disponible para que los agentes no desperdicien tiempo en un servidor muerto.
- **Criterios de aceptacion:**
  - Se decide y documenta `mantener` o `retirar de MCP activo` con evidencia de costo/beneficio.
  - Si se mantiene, `uv`, `graphify`, build y MCP smoke funcionan desde una instalacion reproducible.
  - Si se retira, los artefactos historicos se conservan o eliminan mediante decision explicita y la paridad no lo exige.
  - GitNexus/CodeGraph siguen cubriendo el routing primario/fallback.
- **Paridad:** funcional.
- **Ground truth:** scripts actuales de `package.json`, `.mcp.json` y artefactos `graphify-out`.
- **Depende de:** nada tecnico; coordinar con `doctor-harness-determinista`.
- **Evidencia:** decision registrada y smoke real.
- **Estado:** archivado en `openspec/changes/archive/2026-07-15-resolver-graphify-runtime`; Project pasa a `Done` tras el merge.
- **Labels:** `change`, `infra`, `low-cost`.

#### Change: `doctor-harness-determinista`

- **Issue sugerido:** `[Readiness] Crear doctor determinista del harness PlanearIA`
- **Historia:** Como desarrollador unico, quiero un comando que diagnostique el entorno completo con mensajes accionables para saber si un agente puede empezar antes de invertir tiempo en un change.
- **Criterios de aceptacion:**
  - Comprueba Node/npm, OpenSpec, GitHub Projects, GitNexus, CodeGraph, Graphify segun su decision, MCP smoke, Expo compatibility y estado Git.
  - Distingue `FAIL`, `WARN` y `SKIP` con remediacion concreta.
  - No usa versiones `@latest` en la ruta bloqueante.
  - Puede ejecutarse localmente sin modificar archivos.
  - Tiene pruebas para sus validaciones principales.
- **Paridad:** funcional.
- **Ground truth:** herramientas declaradas en `AGENTS.md`, `.mcp.json` y `package.json`.
- **Depende de:** `normalizar-openspec-cli`, `reparar-gitnexus-fts`, `resolver-graphify-runtime`.
- **Evidencia:** ejecucion exitosa y pruebas.
- **Estado:** pendiente.
- **Labels:** `change`, `infra`, `testing`.

### Ola 1: gobernanza, dominio y fuentes de verdad

Crear estos issues cuando Ola 0 este en curso/cierre. Son la siguiente ola, no trabajo paralelo grande.

#### Change: `alinear-cronologia-ux-ihc`

- **Issue sugerido:** `[Readiness] Alinear olas UX/UI, prototipo e entrevistas IHC`
- **Historia:** Como responsable de producto, quiero una unica cronologia para prototipo, entrevistas e implementacion para que los agentes no ejecuten investigacion despues de decisiones costosas.
- **Criterios de aceptacion:**
  - Plan UX/UI, IHC, roadmap y AGENTS usan la misma secuencia.
  - El prototipo se produce en paralelo a Ola 1.
  - Las entrevistas ocurren antes de cerrar Ola 2 y preferentemente antes de implementar sus pantallas de alto costo.
  - Se corrige la numeracion inconsistente 1.9/1.10 y todos los enlaces internos.
- **Paridad:** funcional.
- **Ground truth:** plan UX/UI e IHC Discovery.
- **Depende de:** nada.
- **Evidencia:** links internos validos y busqueda sin referencias contradictorias.
- **Estado:** pendiente.
- **Labels:** `change`, `docs`, `ux-ui`.

#### Change: `definition-of-ready-sdd`

- **Issue sugerido:** `[Readiness] Hacer ejecutable la Definition of Ready y Done de OpenSpec`
- **Historia:** Como desarrollador unico, quiero gates mecanicos antes de propose y archive para impedir changes sin issue, contexto, evidencia o rollback.
- **Criterios de aceptacion:**
  - La DoR y DoD se integran en las instrucciones fuente `.agents` y se sincronizan a espejos.
  - Existe un check para los campos verificables sin bloquear excepciones justificadas.
  - UI, sync, IA, backend y docs declaran matrices de validacion proporcionales.
  - El check explica como corregir cada fallo.
- **Paridad:** funcional.
- **Ground truth:** `meta_guia_planes.md`, `openspec/config.yaml` y este plan.
- **Depende de:** `normalizar-openspec-cli`.
- **Evidencia:** fixtures validos/invalidos y harness parity.
- **Estado:** pendiente.
- **Labels:** `change`, `infra`, `testing`, `docs`.

#### Change: `mapa-dominio-ddd-ligero`

- **Issue sugerido:** `[Architecture] Crear mapa DDD estrategico ligero de PlanearIA`
- **Historia:** Como desarrollador unico, quiero lenguaje y propiedad de datos por contexto para que agentes distintos no creen modelos, servicios o significados duplicados.
- **Criterios de aceptacion:**
  - Existe glosario docente y mapa de contextos delimitados.
  - Cada entidad compartida tiene propietario, consumidores e invariantes.
  - Sync/offline, adjuntos, notificaciones y seguridad se modelan como capacidades transversales.
  - OpenSpec `design.md` pide contexto afectado y contrato solo en changes cruzados.
  - El documento declara que bounded context no implica microservicio.
- **Paridad:** funcional.
- **Ground truth:** codigo real, arquitectura, vision y specs vigentes.
- **Depende de:** GitNexus operativo o CodeGraph fallback suficiente.
- **Evidencia:** consultas de ejemplo que llevan al contexto/propietario correcto.
- **Estado:** pendiente.
- **Labels:** `change`, `docs`, `infra`.

#### Change: `baseline-specs-brownfield-por-contacto`

- **Issue sugerido:** `[OpenSpec] Baseline brownfield para superficies tocadas por cada change`
- **Historia:** Como agente implementador, quiero conocer el comportamiento vigente de la superficie que voy a cambiar para que una spec nueva no borre silenciosamente compatibilidad existente.
- **Criterios de aceptacion:**
  - Se define un proceso ligero para capturar solo la superficie tocada, no documentar toda la app por adelantado.
  - Cada propose declara comportamiento vigente, comportamiento objetivo y compatibilidad legacy.
  - Las primeras superficies UX tienen owners de spec claros.
  - Existe un ejemplo validado de delta brownfield.
- **Paridad:** funcional.
- **Ground truth:** `openspec/specs`, codigo y tests actuales.
- **Depende de:** `definition-of-ready-sdd`, `mapa-dominio-ddd-ligero`.
- **Evidencia:** spec de ejemplo validada por CLI.
- **Estado:** archivado en `openspec/changes/archive/2026-07-16-baseline-specs-brownfield-por-contacto`.
- **Labels:** `change`, `docs`, `testing`.

#### Change: `normalizar-product-os-readiness`

- **Issue sugerido:** `[Readiness] Normalizar epic, milestones y estados del plan en Product OS`
- **Historia:** Como desarrollador unico, quiero que el tablero refleje solo trabajo ejecutable y dependencias reales para que el agente tome la siguiente historia sin abrir frentes innecesarios.
- **Criterios de aceptacion:**
  - Existe un epic para este plan y milestones coherentes con gates/olas.
  - Solo Gate M, Ola 0 y Ola 1 tienen issues abiertos inicialmente.
  - Cada issue incluye tipo de ejecucion, dependencia, evidencia y link futuro a OpenSpec.
  - Milestones antiguos vacios o vencidos tienen decision de cerrar, renombrar o conservar.
- **Paridad:** funcional.
- **Ground truth:** este plan y `meta_guia_planes.md` seccion Product OS.
- **Depende de:** `autorizar-github-projects-cli`.
- **Evidencia:** vista del Project y consultas `gh`.
- **Estado:** en ejecucion mediante issue #65 y change `normalizar-product-os-readiness`; actualiza
  Product OS, documentacion y evidencia sin resolver la deuda tecnica de #66.
- **Labels:** `change`, `infra`, `docs`, `plan-maestro`.

### Ola 2: feedback loops, CI y limites ejecutables

#### Change: `mcp-health-check-real`

- **Issue sugerido:** `[Harness] Validar salud real y autenticacion de MCPs`
- **Historia:** Como desarrollador unico, quiero distinguir paridad de configuracion, proceso vivo y herramienta autenticada para que un check verde represente capacidad real.
- **Criterios de aceptacion:**
  - El test separa `config parity`, `process startup`, `tool listing` y `authenticated smoke`.
  - Los MCP remotos tienen SKIP explicito cuando la CI no puede autenticarlos.
  - Los fallos locales muestran servidor, etapa y remediacion.
  - Figma no se considera validado solo por existir en JSON.
- **Paridad:** funcional.
- **Ground truth:** `.mcp.json`, configuraciones espejo y contratos MCP.
- **Depende de:** Ola 0 completa.
- **Evidencia:** pruebas unitarias y smoke local.
- **Estado:** pendiente.
- **Labels:** `change`, `infra`, `testing`.

#### Change: `endurecer-harness-ci`

- **Issue sugerido:** `[Harness] Convertir checks maduros del harness en gates reales`
- **Historia:** Como desarrollador unico, quiero que la CI bloquee drift reproducible del harness para no descubrirlo durante un change de producto.
- **Criterios de aceptacion:**
  - Se retira `continue-on-error` solo de checks estabilizados.
  - Los checks requeridos se ejecutan en todos los PR relevantes y no quedan Pending por filtros.
  - Los checks dependientes usan una conclusion fiable aunque falle un job previo.
  - Existe rollback documentado si un gate genera falsos positivos.
- **Paridad:** funcional.
- **Ground truth:** workflows GitHub Actions y resultados de al menos un PR.
- **Depende de:** `mcp-health-check-real`, `doctor-harness-determinista`.
- **Evidencia:** PR de prueba verde y prueba controlada de fallo.
- **Estado:** pendiente.
- **Labels:** `change`, `infra`, `testing`.

#### Change: `reglas-arquitectura-ejecutables`

- **Issue sugerido:** `[Architecture] Impedir nuevas violaciones MVVM, tokens y data boundaries`
- **Historia:** Como desarrollador unico, quiero convertir los limites mas importantes en checks automaticos para que los agentes no repliquen patrones legacy incorrectos.
- **Criterios de aceptacion:**
  - Codigo nuevo/tocado no introduce `AsyncStorage` o HTTP directo en screens.
  - No introduce `Dimensions.get` ni colores fuera del sistema permitido.
  - Se validan direcciones de dependencia criticas sin exigir migracion total del legacy.
  - Excepciones requieren archivo/decision con owner y fecha de revision.
  - Los mensajes de fallo incluyen la ruta de remediacion PlanearIA.
- **Paridad:** funcional.
- **Ground truth:** reglas Frontend/Backend de `AGENTS.md` y mapa DDD.
- **Depende de:** `mapa-dominio-ddd-ligero`.
- **Evidencia:** fixtures que fallan/pasan y CI.
- **Estado:** pendiente.
- **Labels:** `change`, `infra`, `testing`, `legacy`.

#### Change: `limpiar-senal-tests`

- **Issue sugerido:** `[Testing] Eliminar warnings act y ruido inesperado de la suite`
- **Historia:** Como agente implementador, quiero una suite silenciosa salvo errores intencionales para detectar regresiones reales sin gastar contexto leyendo logs irrelevantes.
- **Criterios de aceptacion:**
  - Se corrigen los warnings `act()` conocidos.
  - Los `console.error`/`warn` inesperados hacen fallar tests o se allowlistean con justificacion local.
  - Los logs esperados se espian/restauran correctamente.
  - Las 93 suites existentes siguen pasando.
- **Paridad:** funcional.
- **Ground truth:** salida Jest baseline.
- **Depende de:** nada; ejecutar sin mezclar con UI de producto.
- **Evidencia:** log limpio y pruebas.
- **Estado:** pendiente.
- **Labels:** `change`, `testing`.

#### Change: `golden-journeys-web`

- **Issue sugerido:** `[QA] Versionar golden journeys Playwright de PlanearIA`
- **Historia:** Como desarrollador unico, quiero recorridos web reproducibles con capturas para verificar que cambios de agentes no rompen los flujos esenciales ni la experiencia responsive.
- **Criterios de aceptacion:**
  - Existen journeys para arranque/login, Escritorio/Crear, offline-reconexion, asignacion y accion IA revisable segun disponibilidad real.
  - El runner espera HTTP 200 del bundler antes de navegar.
  - Se ejecutan breakpoints definidos y generan artefactos comparables.
  - Datos/credenciales de prueba no exponen secretos ni estudiantes reales.
  - La CI o runbook declara claramente que subset es automatico y cual local.
- **Paridad:** funcional primero; visual contra Figma cuando exista frame aprobado.
- **Ground truth:** app actual, plan UX/UI y Figma aprobado.
- **Depende de:** `limpiar-senal-tests`; para paridad visual, `aprobar-ground-truth-figma`.
- **Evidencia:** specs, reporte y capturas.
- **Estado:** pendiente.
- **Labels:** `change`, `testing`, `ux-ui`.

#### Change: `agent-eval-baseline`

- **Issue sugerido:** `[Harness] Crear baseline de evaluacion para agentes de codigo`
- **Historia:** Como desarrollador unico, quiero medir si un agente nuevo encuentra contexto, respeta arquitectura y verifica cambios para detectar degradacion del harness antes de usarlo en una ola grande.
- **Criterios de aceptacion:**
  - Hay 8-12 tareas representativas con respuesta esperada o grader claro.
  - Evalua routing de docs, estructura MVVM, sync, IA gateway, tests y evidencia visual.
  - Distingue encontrar informacion de modificar codigo correctamente.
  - Registra modelo/harness/commit y resultado sin guardar razonamiento sensible.
  - El baseline no bloquea CI hasta demostrar estabilidad.
- **Paridad:** funcional.
- **Ground truth:** AGENTS, docs, specs, codigo y tests.
- **Depende de:** `doctor-harness-determinista`, `reglas-arquitectura-ejecutables`.
- **Evidencia:** corrida baseline y reporte versionado.
- **Estado:** pendiente.
- **Labels:** `change`, `infra`, `testing`.

### Ola 3: seguridad de dependencias y mantenimiento continuo

#### Change: `decision-riesgo-xlsx`

- **Issue sugerido:** `[Security] Decidir y mitigar riesgo de xlsx en importaciones docentes`
- **Historia:** Como docente, quiero importar hojas sin que un archivo malicioso congele o comprometa la aplicacion para conservar mis datos y dispositivo seguros.
- **Criterios de aceptacion:**
  - Se documenta mantener, aislar, migrar o reemplazar `xlsx` con costo y compatibilidad.
  - Mientras exista, hay limites de tamano, hojas, filas, columnas y tiempo donde aplique.
  - Se validan archivos corruptos, formulas/contenido inesperado y errores recuperables.
  - La decision tiene owner y fecha de revision.
- **Paridad:** funcional.
- **Ground truth:** flujos reales de importacion y advisories vigentes.
- **Depende de:** mapa de propietarios de datos.
- **Evidencia:** decision, tests y audit actualizado.
- **Estado:** pendiente.
- **Labels:** `change`, `infra`, `testing`.

#### Change: `cadencia-dependencias-expo`

- **Issue sugerido:** `[Maintenance] Definir actualizaciones compatibles con Expo por cadencia`
- **Historia:** Como desarrollador unico, quiero actualizar dependencias en ventanas pequenas y compatibles para reducir riesgo sin convertir cada feature en una migracion de plataforma.
- **Criterios de aceptacion:**
  - `npx expo install --check` forma parte del doctor o CI apropiado.
  - Parches/minors compatibles se separan de upgrades de SDK.
  - Cada SDK se actualiza incrementalmente en un change propio con rollback.
  - Existe cadencia mensual o por release y registro de excepciones.
- **Paridad:** funcional.
- **Ground truth:** documentacion oficial Expo y `package-lock.json`.
- **Depende de:** `doctor-harness-determinista`.
- **Evidencia:** runbook y check reproducible.
- **Estado:** pendiente.
- **Labels:** `change`, `infra`, `low-cost`.

#### Change: `baseline-knip-mojibake`

- **Issue sugerido:** `[Maintenance] Crear baseline seguro de Knip y corregir mojibake`
- **Historia:** Como desarrollador unico, quiero una lista confiable de codigo candidato a limpieza y textos con codificacion valida para evitar que agentes propaguen basura o eliminen entradas dinamicas.
- **Criterios de aceptacion:**
  - Knip conoce entrypoints/configuracion React Native y separa certeza de sospecha.
  - No se elimina ningun archivo sin prueba de uso e impacto.
  - Los archivos con mojibake detectados quedan corregidos y protegidos por check simple.
  - La deuda restante se registra sin bloquear features no relacionadas.
- **Paridad:** funcional.
- **Ground truth:** build, tests, bundler y referencias dinamicas.
- **Depende de:** reglas arquitectonicas estables.
- **Evidencia:** baseline revisado, tests y busqueda de codificacion.
- **Estado:** pendiente.
- **Labels:** `change`, `legacy`, `testing`.

#### Change: `control-deuda-tecnica-sdd`

- **Issue:** [#128](https://github.com/RitualBoat/PlanearIA/issues/128)
- **Historia:** Como desarrollador unico asistido por agentes, quiero que todo hallazgo residual de un
  flujo SDD sea clasificado, verificado, registrado y gobernado mediante gates, para impedir que
  advertencias olvidadas acumulen deuda silenciosa y recibir una ruta guiada de saneamiento.
- **Criterios de aceptacion:** motor neutral en `tools/debt-control/` con registro canonico en
  `.project-os/debt/`; gates de deuda en pre-propose y archive; red de seguridad post-finish; issue de
  saneamiento idempotente por plan (GitHub `required` en PlanearIA); prompts de relevo deterministas;
  baseline verificable de la deuda actual.
- **Paridad:** funcional.
- **Ground truth:** issue #128 (politica aprobada), `openspec/specs/debt-control-*`.
- **Depende de:** `constructor-proyectos-nuevos` (#103, archivado).
- **Estado:** en curso mediante el change `control-deuda-tecnica-sdd`; bloquea #126 (publicacion open
  source) hasta cerrar su flujo SDD y resolver cualquier saneamiento que active el baseline.
- **Notas:** runbook en `Documentacion/02-operacion/CONTROL_DEUDA_TECNICA.md`. El motor es neutral y se
  extraera al nucleo de Project Engineering OS en #126.

#### Change: `presupuesto-deuda-por-contacto`

- **Issue sugerido:** `[Architecture] Aplicar presupuesto de deuda a pantallas tocadas`
- **Historia:** Como desarrollador unico, quiero mejorar gradualmente pantallas y providers cuando una ola los toca para evitar tanto el big-bang como la acumulacion indefinida.
- **Criterios de aceptacion:**
  - Cada change visible declara archivos grandes/hubs tocados y limite de extraccion razonable.
  - Orquestacion nueva vive en ViewModel y secciones visuales complejas se separan.
  - El app shell decide providers globales contra providers por dominio/ruta.
  - Stack, tipos centrales y Context se dividen solo cuando el change obtiene beneficio verificable.
  - El plan UX/UI referencia este criterio sin duplicar tareas.
- **Paridad:** funcional.
- **Ground truth:** arquitectura actual, Graphify/CodeGraph y plan UX/UI.
- **Depende de:** `reglas-arquitectura-ejecutables`, `mapa-dominio-ddd-ligero`.
- **Evidencia:** antes/despues por change y ausencia de nuevas excepciones.
- **Estado:** pendiente.
- **Labels:** `change`, `legacy`, `ux-ui`.

## 3. Secuencia Operativa Por Issue

### 3.1 Issue manual

```text
crear issue + item Project
  -> ejecutar guia manual
    -> adjuntar evidencia sin secretos
      -> cerrar gate
```

No se crea OpenSpec si no cambia el repositorio.

### 3.2 Change versionable

```text
1. Crear issue desde la historia del backlog.
2. Agregar al Project y milestone de ola.
3. Ejecutar enrich-us; conservar Original y anexar Enriquecida.
4. Confirmar Definition of Ready.
5. Ejecutar openspec propose para un solo change.
6. Revisar proposal/design/spec/tasks antes de apply.
7. Ejecutar apply tarea por tarea.
8. Validar y adjuntar evidencia.
9. Ejecutar revision adversarial independiente.
10. Crear PR, resolver CI/comentarios y hacer squash merge.
11. Sincronizar/archivar OpenSpec.
12. Cerrar issue y actualizar Project.
```

### 3.3 Politica de agentes

- Agente A: explore/propose/apply de un change.
- Agente B o nueva sesion: revision adversarial del diff y evidencia.
- El agente revisor no comparte la responsabilidad de justificar sus propias decisiones.
- No se abren dos changes grandes para editar harness/configuracion simultaneamente.
- CAVEMAN se usa solo en tareas mecanicas despues de aprobar design/spec.

## 4. Plan de Creacion de Issues

### Tracking actual

| Tipo | Issue | Estado Product OS |
| --- | --- | --- |
| Epic | `#42` Preparacion Operativa SDD/Harness | In progress |
| Gate Git/historial | `#43` | Done |
| Gate GitHub Projects | `#44` | Done |
| Gate branch protection | `#45` | Ready |
| Gate Figma | `#46` | Parked; diferido por el usuario, bloquea R2 |
| Gate entrevistas IHC | `#47` | Parked; activar cuando exista prototipo |
| Recuperacion baseline | `#48` | Done; 93 suites/608 tests verdes |
| OpenSpec reproducible | `#49` | Ready; primer change activo |
| GitNexus FTS | `#50` | Backlog |
| Graphify runtime | `#51` | Done tras merge; OpenSpec archivado |
| Doctor del harness | `#52` | Backlog |

### Primera tanda

Crear inmediatamente, despues de autorizar GitHub Projects:

- Epic del plan.
- Los cinco Gates M.
- Los cinco changes de Ola 0.

### Segunda tanda

Crear cuando al menos dos changes de Ola 0 esten archivados:

- Los cinco changes de Ola 1.

### Tandas posteriores

Ola 2 se crea al cerrar Ola 0. Ola 3 se crea al entrar en Ola 2. Esto mantiene visible el siguiente trabajo sin convertir Product OS en un inventario inmanejable.

## 5. Registro de Decisiones y Open Questions

| ID | Pregunta | Responsable | Momento limite |
| --- | --- | --- | --- |
| OQ1 | ¿Los cambios locales actuales pertenecen a otro trabajo que debe conservarse? | Usuario | Antes del primer change |
| OQ2 | Cerrada en #51: Graphify no aporta suficiente valor para mantenerse en el MCP activo; queda como auditoria manual opcional. | Change `resolver-graphify-runtime` | Resuelta |
| OQ3 | ¿Que frames Figma aprueba el usuario como ground truth? | Usuario | Antes de UX/UI Ola 2 |
| OQ4 | ¿`xlsx` se mantiene con mitigaciones o se reemplaza? | Usuario tras opciones tecnicas | Antes de ampliar importaciones/beta |
| OQ5 | ¿Que docentes pueden participar sin usar datos sensibles? | Usuario | Antes de cerrar UX/UI Ola 2 |

## 6. Criterio de Cierre del Plan

El plan se cierra cuando:

- R0, R1 y R2 estan satisfechos.
- OpenSpec y los checks del harness son reproducibles desde el repo.
- GitHub Product OS y branch protection funcionan.
- GitNexus vuelve a ser util o la politica declara temporalmente CodeGraph primario con una decision revisable.
- Graphify esta sano o retirado del runtime activo.
- Existe un unico mapa DDD ligero y owners de datos.
- Los agentes reciben DoR/DoD y limites arquitectonicos ejecutables.
- Los tests no esconden warnings inesperados.
- Los golden journeys y el agent-eval tienen baseline.
- Figma tiene frames aprobados e IHC tiene participantes/agenda.
- `xlsx` y la cadencia Expo tienen decision verificable.
- El plan UX/UI queda desbloqueado sin duplicar backlog.

## 7. Resultado Esperado

PlanearIA no depende de que el usuario recuerde una secuencia larga ni de que un agente interprete documentos contradictorios. El siguiente issue ejecutable puede tomarse desde Product OS, enriquecerse, convertirse en un change pequeno, validarse y cerrarse con evidencia sin contaminar el trabajo de producto.
