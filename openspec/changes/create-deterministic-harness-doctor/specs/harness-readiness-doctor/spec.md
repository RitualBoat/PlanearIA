## ADDED Requirements

### Requirement: El doctor entrega un veredicto determinista y accionable

El repositorio SHALL exponer un unico comando local del doctor del harness que se ejecute desde la raiz, sea read-only y produzca un listado ordenado de comprobaciones con `PASS`, `FAIL`, `WARN` o `SKIP`, un resumen breve y una remediacion segura cuando aplique. El modo `--json` SHALL emitir un unico documento estructurado con el mismo orden y campos estables que el reporte humano.

#### Scenario: Checkout sin hallazgos bloqueantes

- **WHEN** todas las comprobaciones requeridas del manifest terminan sanas y no se detecta una firma semantica de error
- **THEN** el doctor termina con codigo cero y el resumen estructurado no contiene ningun resultado `FAIL`

#### Scenario: Hallazgo bloqueante sin mutacion

- **WHEN** una comprobacion requerida falla o no puede ejecutarse
- **THEN** el doctor termina con codigo distinto de cero, conserva los resultados de las comprobaciones restantes y no instala, actualiza, autentica, repara ni reindexa herramientas

#### Scenario: Salida estructurada repetible

- **WHEN** las mismas respuestas de las comprobaciones se inyectan dos veces en los tests
- **THEN** el modo `--json` produce el mismo orden de identificadores, estados, resumenes y remediaciones en ambas ejecuciones

### Requirement: El doctor comprueba las dependencias activas con contratos semanticos

El doctor SHALL evaluar Node/npm, Git/worktree, OpenSpec, visibilidad de `PlanearIA Product OS` mediante GitHub CLI, GitNexus, CodeGraph, paridad de harness, paridad y smoke de MCP activos, y compatibilidad Expo mediante una herramienta instalada/fijada del repositorio. El doctor SHALL usar comandos read-only y SHALL distinguir la salida de error de una salida sana aunque el subproceso termine con codigo cero.

#### Scenario: GitNexus devuelve falso verde

- **WHEN** la comprobacion GitNexus imprime `Not a git repository`, un diagnostico FTS o una firma configurada de consulta inutilizable aunque su subproceso termine con codigo cero
- **THEN** el doctor registra GitNexus como `FAIL`, explica que la ruta estructural primaria no esta disponible y muestra la recuperacion aprobada sin ejecutarla

#### Scenario: CodeGraph conserva su papel de fallback

- **WHEN** GitNexus falla y el smoke de CodeGraph responde con el contrato esperado
- **THEN** el doctor registra el fallo de GitNexus y el resultado independiente de CodeGraph sin convertir el fallo primario en `PASS`

#### Scenario: MCP remoto requiere autenticacion de cliente

- **WHEN** un MCP remoto declara una configuracion o transporte valido pero indica que OAuth debe completarse dentro de un cliente MCP compatible
- **THEN** el doctor lo registra como `WARN` con esa limitacion visible y no afirma que la identidad o autorizacion remota este verificada

#### Scenario: La comprobacion Expo no descarga ni actualiza herramientas

- **WHEN** el doctor verifica compatibilidad Expo
- **THEN** ejecuta exclusivamente una ruta no mutante respaldada por la version instalada o fijada en el repositorio
- **AND** no usa `@latest`, no ejecuta una instalacion implicita y no modifica dependencias

### Requirement: Graphify se informa como retirado y no aplicable

El doctor SHALL incluir Graphify como `SKIP` con la razon `retirado/manual`. Su ausencia SHALL NOT producir `FAIL`, `WARN`, remediacion de instalacion ni intento de iniciar un servidor; `graphify-out/` SHALL NOT ser leido como evidencia de salud.

#### Scenario: Entorno sin Graphify instalado

- **WHEN** Graphify, `graphify-mcp` y `uv` no estan disponibles en PATH
- **THEN** el reporte incluye exactamente el resultado `SKIP` retirado/manual y el resultado agregado no falla por esa ausencia

#### Scenario: Reintroduccion como MCP activo

- **WHEN** Graphify reaparece en `.mcp.json` o en un espejo MCP generado
- **THEN** la comprobacion de paridad activa falla con una remediacion para regenerar o retirar el servidor
- **AND** el doctor no intenta reparar, instalar ni iniciar Graphify

### Requirement: El doctor protege la evidencia y permite pruebas aisladas

El runner SHALL capturar y normalizar la evidencia de comandos antes de reportarla, sin incluir tokens, secretos ni datos docentes. El repositorio SHALL incluir pruebas con resultados inyectados para un entorno sano, comando ausente, falso verde GitNexus, Project inaccesible, MCP OAuth esperado y Graphify retirado.

#### Scenario: GitHub Projects no es visible

- **WHEN** GitHub CLI no puede listar el Project configurado por falta de autenticacion, scope o visibilidad
- **THEN** el doctor registra `FAIL` sin exponer credenciales y muestra la recuperacion documentada para refrescar los scopes de Projects

#### Scenario: Prueba de Graphify retirado

- **WHEN** el fixture de pruebas representa un entorno sin binarios Graphify
- **THEN** la asercion espera `SKIP` retirado/manual y verifica que no se invoco un comando de Graphify
