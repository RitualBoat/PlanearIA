## Context

PlanearIA tiene piezas maduras de un sistema operativo de ingeniería —OpenSpec local, readiness, Product
OS, harness single-source, doctor, CI y context engineering—, pero hoy sus fuentes y renderers viven en la
raíz del producto y mezclan reglas universales con React Native/Expo, dominio docente y decisiones
históricas. El doctor actual también demuestra por qué la extracción debe cambiar el contrato: una
comprobación de salud puede llegar a iniciar un smoke OAuth, de modo que “diagnóstico” y “operación” no
están completamente separados.

La Ola 0 debe producir una unidad autocontenida, barata y mantenible por una sola persona. Debe ejecutarse
en Windows, macOS y Linux, funcionar sin un IDE concreto, no seleccionar producto ni stack y poder probarse
en directorios temporales. La fuente versionada vive primero en PlanearIA, pero el resultado instalado no
puede depender de rutas, nombres o runtime de PlanearIA.

### Contextos delimitados afectados

El change pertenece a un único contexto habilitador: **Engineering Enablement / Project Constructor**.
Este contexto es owner del blueprint, runtime del CLI, estado de ownership, renderers, doctor y contratos de
evidencia que instala. Consume OpenSpec, Git y GitHub mediante adaptadores, pero no posee ni intercambia
datos de los contextos de producto de PlanearIA.

No requiere contrato cruzado con Planeación, Classroom, Comunicación, Identidad ni otros contextos del mapa
DDD. Las invariantes `userId`, `src/sync` y confirmación de IA son `N/A` porque no se toca dato académico,
runtime de producto ni IA. Esta declaración no introduce microservicios, CQRS, event sourcing ni nuevos
providers globales.

## Goals / Non-Goals

**Goals:**

- Hacer que un repositorio vacío obtenga un núcleo neutral de gobernanza reproducible antes del discovery.
- Mantener una sola fuente ejecutable para templates, schema, renderers, perfiles, migraciones y rollback.
- Separar archivos canónicos, generados, overlays humanos y artefactos con ownership externo.
- Detectar conflictos antes de escribir, recuperarse de una ejecución parcial y demostrar idempotencia.
- Generar paridad proporcional para cinco harnesses sin afirmar capacidades que no tienen.
- Producir un doctor determinista y estrictamente read-only en formatos humano y JSON.
- Instalar OpenSpec local fijado y sus contratos de SDD sin copiar la configuración de producto de
  PlanearIA.
- Ofrecer CI advisory, fixtures, documentación, costos/licencias y un Prompt 00 que invoque el mismo
  contrato ejecutable.

**Non-Goals:**

- Preguntar por el producto, elegir arquitectura de producto o activar perfiles técnicos.
- Publicar todavía un paquete npm o crear un template repository remoto.
- Imponer React, React Native, Expo, MVVM, base de datos, cloud, offline, sync o IA.
- Generar por cuenta propia los workflows OPSX cuya fuente es la CLI oficial de OpenSpec.
- Ejecutar OAuth, iniciar MCP, reindexar grafos, reparar herramientas o modificar branch protection desde
  el doctor.
- Convertir señales de scanners, `npm audit`, Knip o Graphify en mutaciones automáticas.

## Decisions

### D1. Solución híbrida con CLI como única fuente ejecutable

Se implementará un paquete neutral bajo `tools/project-constructor/`. Su nombre de paquete será neutral y
su CLI será la autoridad de schema, blueprint, renderers, validaciones, transacciones y migraciones.
`PROMPT_00_BOOTSTRAP_ENTORNO`, las skills futuras y un posible template repository serán adaptadores que
invocan ese CLI; no contendrán copias funcionales de sus templates.

| Alternativa | Actualización y drift | Idempotencia y fixtures | Multi-SO/agentes | Decisión |
|---|---|---|---|---|
| Template repository | Copia rápida, pero sin canal de actualización posterior | Débil tras crear el repo | Buena al inicio | Solo semilla opcional futura |
| Generador/CLI | Versiones y migraciones explícitas | Alta, automatizable | Alta con Node portable | Fuente ejecutable elegida |
| Prompts/skills/scripts | Distribución cómoda, salida no determinista | Débil sin motor común | Amplia pero desigual | Adaptadores del CLI |
| Híbrida | CLI actualizable + interfaces humanas | Alta | Alta con degradación declarada | Opción recomendada |

No se publicará a un registry en esta ola. PlanearIA probará el paquete por ruta local; la estrategia de
publicación y firma queda como gate de distribución posterior.

### D2. Node sin dependencias runtime externas

El CLI usará módulos estándar de Node y declarará Node `^20.20.0 || >=22.22.0`. OpenSpec `1.6.0` declara
`>=20.19.0`, pero su lockfile resuelve `posthog-node 5.45.2`, cuyo engine es
`^20.20.0 || >=22.22.0`; el constructor usa la intersección efectiva para evitar `EBADENGINE` y rechaza
Node 21. Evitar una librería de templates o YAML reduce supply chain, licencias y diferencias entre SO. Los
documentos canónicos usan Markdown y los contratos machine-readable usan JSON estable con claves ordenadas
por el renderer.

El paquete tendrá su propio `package.json`, lockfile, `bin` y tests con `node:test`. Será `private` y
`UNLICENSED` durante Ola 0: PlanearIA no tiene licencia raíz y este change no concede derechos ni publica
artefactos. El repositorio destino recibirá solo dependencias de gobernanza fijadas —OpenSpec local—;
ninguna dependencia de producto forma parte del bootstrap.

### D3. Blueprint, configuración y estado son artefactos distintos

El paquete distribuirá:

- `blueprint/core/`: templates neutrales de instrucciones, reglas, documentación, GitHub y CI.
- `blueprint/profiles/`: definiciones inactivas de perfiles de evidencia.
- `blueprint/schema/`: schema versionado, matriz de harnesses y catálogo de herramientas.
- `src/`: comandos, renderers, doctor, transacciones y migraciones.

El repositorio generado tendrá:

- `.project-os/`: fuente canónica project-owned para instrucciones, reglas, permisos, MCP y perfiles; el
  blueprint la siembra una vez y después el proyecto la gobierna.
- `.project-constructor/config.json`: selección humana y schema solicitado.
- `.project-constructor/state.json`: versión instalada, ownership y hashes del último render.
- `.project-constructor/runtime/`: runtime autocontenido necesario para `sync --check` y `doctor`.
- `.project-constructor/transactions/`: journals y backups solo cuando una escritura real los requiera.

Los defaults del paquete siembran `.project-os/`; los espejos se renderizan desde la instancia canónica del
repositorio, no directamente desde una copia permanente de esos defaults. Los templates no leen
`openspec/config.yaml` de PlanearIA ni interpolan variables de su dominio. Una prueba de neutralidad rechaza
nombres y reglas prohibidas.

### D4. Ownership explícito y transacciones recuperables

Cada salida versionada declara uno de cuatro owners:

1. `constructor`: el CLI posee el archivo completo y puede actualizarlo si su hash coincide con el último
   estado conocido.
2. `human-overlay`: el CLI posee únicamente un bloque delimitado o siembra el archivo una vez; preserva el
   resto byte a byte y nunca adopta personalizaciones implícitamente.
3. `external-openspec`: la CLI local fijada de OpenSpec escribe el archivo; el constructor solo verifica
   su contrato mediante el checker separado.
4. `project`: se crea si falta y después queda bajo ownership del proyecto.

Los gates que no son archivos —GitHub Project, OAuth, costos y branch protection— se clasifican como
intervenciones `manual` en la guía, no como un quinto owner de filesystem.

Antes de escribir se calculan todas las salidas y conflictos. Si un archivo preexistente no está
registrado o cambió respecto al hash instalado, el comando aborta sin modificarlo. Una ejecución con
cambios crea journal, copia de seguridad de archivos reemplazados y lista de archivos nuevos; escribe por
archivo temporal y rename. Al completar, actualiza `state.json` al final.

`rollback` restaura backups y elimina únicamente archivos nuevos que siguen teniendo el hash escrito por la
transacción. Nunca borra rutas no owned. Un journal incompleto provoca `FAIL` accionable y permite
`rollback` o `resume`; el doctor solo lo reporta.

### D5. Comandos pequeños con mutabilidad visible

- `bootstrap --target <ruta>`: preflight, instala el núcleo y deja un reporte humano/JSON.
- `sync --target <ruta>`: actualiza solo archivos owned sin conflicto.
- `sync --target <ruta> --check`: read-only; exit `1` y diff determinista si hay drift.
- `doctor --target <ruta> [--json]`: siempre read-only.
- `rollback --target <ruta> --transaction <id>`: mutación explícita y acotada.
- `github-plan --target <ruta> [--json]`: plan read-only de labels, estados, templates y gates manuales.

No habrá `--force` genérico. Resolver un conflicto exige preservar el archivo como overlay, adoptar una
decisión versionada o revertirlo manualmente.

### D6. Harness neutral con degradación verificable

La fuente canónica define instrucciones, reglas por path, skills, permisos, MCP y perfiles de validación.
El renderer genera como mínimo:

- `AGENTS.md`: núcleo completo y fallback textual de reglas para cualquier agente.
- `CLAUDE.md`, `.claude/rules/` y `.claude/settings.json`.
- `.cursor/rules/` y `.cursor/mcp.json`.
- `.codex/config.toml` y skills project-owned compatibles.
- `.github/copilot-instructions.md`.
- fallback `AGENTS.md` para OpenCode, más sus superficies compatibles cuando existan.

La matriz declara cada capacidad como `native`, `generated`, `documented` o `unsupported`. La paridad
significa que la degradación coincide con esa matriz, no que todos los harnesses sean idénticos. Los
permisos que un agente no puede aplicar se clasifican como `documented`; una intervención humana asociada
se registra en la guía manual, no como estado adicional de capacidad.

Los workflows OPSX y skills `openspec-*` no aparecen en el blueprint general. El bootstrap instala OpenSpec
local y delega su generación a la CLI oficial. Un adaptador separado puede poseer únicamente bloques
delimitados de readiness, TLDR y cierre después de la generación; debe fallar si cambia la estructura
upstream. Su check separado detecta drift tras un upgrade. Esto evita dos fuentes de verdad.

### D7. OpenSpec local y gobernanza sin producto

El target recibe una versión exacta de OpenSpec y lockfile reproducible. Su configuración inicial solo
contiene reglas universales: issue/Project antes del change, enrich, DoR/DoD, TLDR, brownfield baseline,
readiness, evidencia, revisión adversarial, archive y cierre por PR.

El bootstrap genera plantillas neutrales y un manifiesto de Product OS. `github-plan` muestra las acciones;
autenticación, creación/edición del Project, branch protection y publicación permanecen como gates
manuales. El doctor puede comprobar visibilidad después, pero nunca solicita OAuth ni aplica cambios.

### D8. Perfiles de evidencia existen, pero solo el núcleo está activo

El catálogo incluye `documentation`, `harness-tooling`, `ui`, `backend-api`, `auth-security`,
`data-migration-sync`, `ai`, `infra-deploy` y `library-cli`. Cada perfil declara validación automática,
evidencia manual, casos negativos, rollback, condiciones de `N/A` y gate de cierre.

En Ola 0 solo se activan `documentation` y `harness-tooling`. React Doctor, Playwright, Figma, breakpoints,
backend, sync e IA quedan inactivos hasta una decisión posterior al discovery.

### D9. Doctor por evidencia, no por side effects

Cada check devuelve `{id, status, summary, cause, remediation, evidence}` y se ordena por un catálogo
estable. La salida JSON tiene schema versionado; la salida humana se deriva del mismo objeto. `FAIL` produce
exit `1`; `WARN` y `SKIP` no se presentan como pruebas ejecutadas.

El doctor solo lee archivos, variables por nombre y comandos explícitamente clasificados read-only. Para
MCP informa por separado:

1. configuración declarada;
2. proceso/startup observado mediante evidencia aportada;
3. tool listing observado mediante evidencia aportada;
4. smoke autenticado observado mediante evidencia aportada.

Nunca inicia servidores ni abre OAuth. Sin evidencia, las capas 2-4 son `SKIP` o `WARN`, no `PASS`.
GitNexus puede comprobar frescura sin reindexar; CodeGraph queda fallback; Graphify siempre `SKIP` salvo
perfil manual futuro. Variables requeridas se reportan por nombre y presencia, nunca por valor.

### D10. CI advisory y fixtures como contrato de distribución

El paquete prueba:

- bootstrap sobre directorio vacío;
- segundo bootstrap y segundo sync sin diff;
- conflicto preexistente sin escritura parcial;
- fallo inyectado, journal y rollback;
- render de cinco harnesses y degradaciones esperadas;
- doctor humano/JSON y prueba de no mutación;
- neutralidad del inventario generado;
- encontrabilidad documental en menos de tres saltos;
- actualización de una versión fixture sin drift residual.

El workflow del constructor ejecuta estas pruebas y `sync --check` con señal advisory al inicio. El paso a
blocking requiere baseline estable y decisión explícita; no se infiere por el paso del tiempo.

### D11. Versionado, costos y licencias

El schema y el paquete usan SemVer. `state.json` registra `schemaVersion`, `constructorVersion` y SHA-256
del paquete probado; un runtime antiguo rechaza estado futuro. Las migraciones son funciones explícitas y
probadas, sin edición heurística.

El núcleo usa herramientas locales y gratuitas; ninguna cuenta cloud es obligatoria para generar archivos.
Se documentan licencia, costo potencial y lock-in por herramienta. Activar GitHub Actions, GitHub Project u
otro servicio externo requiere comprobar el plan vigente. Graphify, scanners y proveedores comerciales no
se convierten en dependencias del core. Ola 0 prueba distribución con `npm pack` local inmutable, pero no
publica ni asigna una licencia permisiva sin decisión del propietario.

## Risks / Trade-offs

- **[R1] El runtime autocontenido duplica archivos del paquete** → Los archivos instalados llevan ownership,
  versión y hashes; solo se actualizan mediante migración, nunca por edición paralela.
- **[R2] JSON limita comentarios humanos frente a YAML** → Separar Markdown explicativo de contratos JSON y
  validar con mensajes accionables; evitar una dependencia YAML.
- **[R3] Un rename por archivo no es transacción de filesystem completa** → Preflight total, journal,
  backups, escritura temporal y rollback hash-aware; pruebas con fallo inyectado.
- **[R4] “Paridad” puede ocultar capacidades ausentes** → Estados de capacidad explícitos y tests de
  degradación; `unsupported` nunca cuenta como `native`.
- **[R5] El doctor puede volver a ejecutar algo mutable** → Allowlist cerrada de checks read-only, runner
  inyectable y test que compara snapshot del filesystem antes/después.
- **[R6] El lockfile de OpenSpec envejece** → Upgrade deliberado por change, validación de CLI oficial,
  regeneración OPSX y rollback a versión anterior.
- **[R7] El paquete todavía no tiene canal de distribución** → Probar por ruta local en Ola 0; registry,
  firma y template remoto quedan como gates de una ola posterior.
- **[R8] Ola 0 vuelva a crecer hasta un mega-change** → La ejecución de discovery, perfiles técnicos y
  producto permanecen fuera; Prompt 01 se instala únicamente como contrato inerte y el plan maestro
  conserva el backlog lazy.
- **[R9] Publicar o licenciar sin autoridad** → Paquete `private`/`UNLICENSED`, tarball local solo para
  fixture y gate humano antes de cualquier distribución.

## Migration Plan

1. Crear el paquete autocontenido, schema y fixtures sin activar nada en runtime de PlanearIA.
2. Añadir scripts raíz y CI advisory que prueban exclusivamente el constructor.
3. Ejecutar bootstrap dos veces sobre una fixture vacía, verificar diff cero y ejecutar rollback de una
   transacción de prueba.
4. Validar specs, harness, typecheck/lint aplicables y revisión adversarial; cualquier warning del gate
   se trata como hallazgo y se corrige o clasifica, nunca se oculta.
5. Archivar con `npm run opsx:archive -- constructor-proyectos-nuevos`; la CLI oficial mantiene ownership de
   specs y movimiento.
6. Cerrar por `npm run opsx:finish` hacia `development`.

Rollback en PlanearIA: revertir el commit/PR del change. Rollback en una fixture o proyecto generado:
ejecutar el comando explícito sobre la transacción instalada; si aún no hubo commit, borrar únicamente el
directorio fixture desechable. Nunca usar `git reset --hard`.

## Open Questions

- Canal, nombre público y licencia del paquete: se deciden antes de distribución; no bloquean la prueba
  local privada.
- Template repository opcional: se genera desde el mismo blueprint en una ola posterior.
- Momento de convertir CI advisory en blocking: requiere historial verde y política explícita.
- Automatización real de GitHub Project: `github-plan` y guía se entregan ahora; el apply externo se activa
  solo tras autenticación y aprobación en la etapa correspondiente.
