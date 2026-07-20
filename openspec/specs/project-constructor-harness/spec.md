# project-constructor-harness Specification

## Purpose
TBD - created by archiving change constructor-proyectos-nuevos. Update Purpose after archive.
## Requirements
### Requirement: Una fuente canónica neutral gobierna todos los harnesses

El constructor SHALL mantener una única fuente canónica versionada para instrucciones universales, reglas
por path, skills, permisos, MCP activos y perfiles de validación. El soporte inicial SHALL incluir Codex,
Claude Code, Cursor, OpenCode y GitHub Copilot. Todo espejo generado SHALL declarar su owner y derivarse de
esa fuente; ningún espejo SHALL convertirse en autoridad mediante edición manual.

`AGENTS.md` SHALL contener el núcleo universal suficiente para que un agente opere con seguridad aun cuando
su harness no soporte skills, reglas por path, permisos ejecutables o MCP.

#### Scenario: Cambio en una instrucción universal

- **WHEN** una instrucción canónica cambia y se ejecuta `sync`
- **THEN** todos los espejos afectados de los cinco harnesses reflejan el cambio
- **AND** los destinos no afectados permanecen byte a byte iguales

#### Scenario: Agente sin capacidades avanzadas

- **WHEN** un agente solo puede leer `AGENTS.md`
- **THEN** obtiene las reglas universales, gates SDD, límites de permisos y degradaciones aplicables
- **AND** no necesita una skill o MCP para descubrir el núcleo operativo

#### Scenario: Fuente con decisión de producto prematura

- **WHEN** el núcleo universal intenta declarar como default un framework, proveedor, base de datos, patrón
  arquitectónico o regla de dominio
- **THEN** la validación del manifiesto falla
- **AND** identifica la entrada que debe moverse a un perfil condicional

### Requirement: La matriz de capacidades hace visibles las degradaciones

El constructor SHALL publicar una matriz versionada y verificable que clasifique, para cada harness y
capacidad, el soporte como nativo, generado, documentado o no soportado. La matriz SHALL cubrir
instrucciones, reglas por path, skills, permisos, MCP y perfiles de validación, e indicar owner, destino y
validación. Una capacidad ausente SHALL degradarse explícitamente; nunca SHALL desaparecer en silencio.

#### Scenario: Harness sin enforcement de permisos

- **WHEN** un harness no puede aplicar una denegación como configuración ejecutable
- **THEN** la matriz lo declara como degradación documentada
- **AND** la regla permanece visible en sus instrucciones universales
- **AND** el sistema no afirma que existe enforcement nativo

#### Scenario: Harness sin soporte de skills

- **WHEN** un harness no soporta skills versionadas
- **THEN** conserva la conducta esencial mediante instrucciones generadas
- **AND** la matriz registra que la skill no es invocable de forma nativa

#### Scenario: Capacidad declarada sin renderer o validación

- **WHEN** la matriz declara una capacidad como nativa o generada pero el adaptador no posee destino o
  comprobación
- **THEN** `sync --check` termina con código distinto de cero
- **AND** señala la afirmación de capacidad no demostrada

### Requirement: Sync y check son deterministas e idempotentes

El constructor SHALL exponer `sync` como comando mutante explícito y `sync --check` como comprobación
estrictamente read-only. Dada la misma fuente, versión y perfiles activos, ambos SHALL calcular el mismo
conjunto ordenado de destinos. El diff SHALL ser determinista, estable entre Windows, macOS y Linux y no
contener timestamps, rutas absolutas ni datos de la máquina.

Un segundo `sync` sin cambios SHALL producir cero modificaciones.

#### Scenario: Segundo run sin cambios

- **WHEN** `sync` se ejecuta dos veces sobre la misma fixture sin cambiar fuente, versión o perfiles
- **THEN** la segunda ejecución produce cero diff
- **AND** `sync --check` termina con código cero

#### Scenario: Drift manual de un espejo

- **WHEN** un archivo generado se edita directamente
- **THEN** `sync --check` termina con código distinto de cero
- **AND** imprime un diff estable que identifica fuente, destino y owner
- **AND** no modifica el archivo

#### Scenario: Normalización entre sistemas operativos

- **WHEN** la misma fixture se renderiza en Windows, macOS y Linux
- **THEN** los archivos lógicos resultantes son byte a byte equivalentes
- **AND** diferencias de separador de ruta o fin de línea no generan drift espurio

#### Scenario: Fuente inválida

- **WHEN** el manifiesto contiene IDs duplicados, destinos ambiguos o una referencia no resoluble
- **THEN** el comando falla antes de escribir cualquier destino
- **AND** conserva intacto el último estado válido

### Requirement: El ownership evita sobrescrituras y permite recuperación

Cada ruta administrada SHALL estar clasificada como generada, preservada o externa. `sync` SHALL escribir
únicamente rutas generadas y bloques explícitamente delimitados. Una colisión con contenido no adoptado
SHALL detener la escritura sin sobrescribir trabajo del usuario. Reejecutar `sync` después de una
interrupción SHALL converger al mismo resultado que una ejecución limpia.

#### Scenario: Colisión con archivo del usuario

- **WHEN** un destino existe pero no posee ownership compatible
- **THEN** `sync` falla antes de sobrescribirlo
- **AND** explica la decisión de adopción o cambio de destino necesaria

#### Scenario: Ejecución parcial

- **WHEN** una ejecución se interrumpe después de generar solo parte de los destinos
- **THEN** una nueva ejecución valida de nuevo la fuente y completa el conjunto esperado
- **AND** el resultado final coincide con el de una fixture limpia

#### Scenario: Archivo preservado contiene personalización

- **WHEN** un archivo preservado incluye contenido local fuera de un bloque generado
- **THEN** `sync` actualiza únicamente el bloque bajo ownership
- **AND** conserva byte a byte el contenido local restante

### Requirement: Reglas, skills, permisos y MCP conservan semántica verificable

Las reglas por path SHALL renderizarse como capacidades nativas cuando existan y como instrucciones de
fallback cuando no. Las skills SHALL versionarse o degradarse según la matriz. Los permisos SHALL
distinguir enforcement de recomendación documental.

Los MCP activos SHALL declararse una sola vez mediante configuración estructurada y referencias a
variables, nunca mediante secretos literales. La paridad SHALL usar parsers conscientes del schema de cada
destino; subtables de permisos, aprobación u opciones SHALL NOT contarse como servidores. Cualquier
extensión local SHALL estar declarada como overlay canónico, no como drift oculto, y SHALL NOT reemplazar
un servidor universal con el mismo ID.

#### Scenario: Subtable TOML no es un MCP

- **WHEN** la configuración Codex contiene una subtable de aprobación bajo un servidor
- **THEN** la validación la interpreta como configuración del servidor
- **AND** no la cuenta como un servidor adicional ni produce un falso verde de paridad

#### Scenario: MCP universal ausente

- **WHEN** un adaptador omite un MCP activo requerido por el manifiesto
- **THEN** `sync --check` falla
- **AND** identifica el harness, servidor y destino faltantes

#### Scenario: Secreto literal en configuración

- **WHEN** una fuente o espejo contiene un token, contraseña o clave literal donde se exige una referencia
  de entorno
- **THEN** la validación falla sin reproducir el valor
- **AND** indica el nombre de la variable o mecanismo esperado

#### Scenario: Permiso solo documental

- **WHEN** un harness carece de enforcement de permisos
- **THEN** el espejo conserva la denegación como regla visible
- **AND** la matriz impide reportarla como protección técnica equivalente

### Requirement: Los perfiles se activan únicamente mediante una decisión explícita

El registro canónico SHALL definir perfiles extensibles con validaciones automáticas, evidencia manual,
casos negativos, rollback, condiciones de `N/A` y gate de cierre. Durante la etapa universal SHALL
activarse únicamente el núcleo de documentación y harness/tooling. Los perfiles de UI, backend/API,
auth/seguridad, datos/migración/sync, IA, infraestructura/deploy, librería/CLI o framework SHALL permanecer
inactivos hasta una decisión posterior al discovery.

Renderizar un perfil SHALL NOT instalar dependencias ni seleccionar un stack por inferencia.

#### Scenario: Bootstrap anterior al discovery

- **WHEN** se sincroniza un repositorio en etapa universal
- **THEN** no se generan configuraciones específicas de React, Expo, backend, base de datos, cloud, offline
  o IA
- **AND** los perfiles correspondientes figuran como inactivos

#### Scenario: Perfil inactivo con herramienta disponible globalmente

- **WHEN** una herramienta de producto existe en la máquina pero su perfil no está activo
- **THEN** el renderer no la incorpora
- **AND** no cambia dependencias ni validaciones por detección implícita

#### Scenario: Perfil activado sin contrato completo

- **WHEN** se intenta activar un perfil sin casos negativos, rollback o gate de cierre
- **THEN** la validación del manifiesto falla
- **AND** no genera espejos parciales

### Requirement: OpenSpec conserva ownership separado de OPSX

Los workflows OPSX SHALL continuar bajo ownership de la CLI local y fijada de OpenSpec. El renderer
general SHALL NOT generar, parchear, mover, eliminar ni adoptar esos archivos. La configuración SHALL
exponer el comando separado que los crea o actualiza y una comprobación read-only específica de su owner.

#### Scenario: Sync general del harness

- **WHEN** se ejecuta `sync`
- **THEN** ningún workflow OPSX cambia por efecto del renderer general
- **AND** el reporte identifica OpenSpec como owner externo de esas rutas

#### Scenario: Drift de un workflow OPSX

- **WHEN** un workflow OPSX difiere de la salida estabilizada de su owner
- **THEN** la comprobación específica de OpenSpec reporta el drift
- **AND** la recuperación dirige al flujo local fijado de OpenSpec
- **AND** `sync` no intenta repararlo

#### Scenario: Dependencia local ausente

- **WHEN** falta la CLI local fijada pero existe una instalación global
- **THEN** la validación OPSX falla
- **AND** no usa la instalación global ni descarga un fallback flotante

### Requirement: Fixtures y CI demuestran paridad sin falsos verdes

El constructor SHALL incluir fixtures que cubran los cinco harnesses, los tres sistemas operativos
soportados, capacidades degradadas, colisiones, ejecución parcial, drift e idempotencia. Cada fixture SHALL
poder introducir un fallo observable y demostrar que `sync --check` lo detecta.

El gate CI SHALL comenzar como advisory y solo SHALL convertirse en bloqueante mediante una política
versionada después de disponer de una baseline estable. La ausencia o no ejecución de checks SHALL NOT
contarse como éxito.

#### Scenario: Fixture de repositorio vacío

- **WHEN** se sincroniza una fixture vacía
- **THEN** se generan los cinco adaptadores esperados
- **AND** el segundo run produce cero drift
- **AND** el núcleo no contiene decisiones de producto

#### Scenario: Drift intencional por harness

- **WHEN** la suite altera sucesivamente un espejo de cada harness
- **THEN** cada alteración causa un fallo de `sync --check`
- **AND** restaurar desde la fuente devuelve el gate a verde

#### Scenario: Check no ejecutado

- **WHEN** CI cancela, omite o no encuentra el job de paridad
- **THEN** el resultado no se interpreta como paridad demostrada
- **AND** la evidencia registra el check como ausente

#### Scenario: Promoción a bloqueante

- **WHEN** se aprueba una política con baseline estable y criterio de rollback
- **THEN** CI puede convertir el check advisory en requerido
- **AND** la decisión queda versionada sin cambiar la semántica del renderer

