# project-constructor-doctor Specification

## Purpose
TBD - created by archiving change constructor-proyectos-nuevos. Update Purpose after archive.
## Requirements
### Requirement: El doctor produce un veredicto humano y JSON equivalente

El constructor SHALL exponer un doctor determinista con salida humana y modo JSON. Cada resultado SHALL
contener un ID estable, perfil, estado `PASS`, `FAIL`, `WARN` o `SKIP`, causa, evidencia normalizada y
recuperación concreta. El orden y la semántica SHALL ser iguales en ambas salidas.

`PASS` SHALL significar contrato demostrado; `FAIL`, requisito bloqueante roto o indeterminado; `WARN`,
limitación no bloqueante sin prueba completa; y `SKIP`, comprobación deliberadamente no aplicable, inactiva
o retirada. Cualquier `FAIL` SHALL producir código de salida distinto de cero.

#### Scenario: Entorno sano

- **WHEN** todas las comprobaciones requeridas producen evidencia válida
- **THEN** el doctor termina con código cero
- **AND** ningún resultado es `FAIL`

#### Scenario: Probe bloqueante falla

- **WHEN** una comprobación requerida falla, expira o devuelve evidencia inclasificable
- **THEN** el doctor la registra como `FAIL`
- **AND** continúa evaluando las comprobaciones independientes restantes
- **AND** termina con código distinto de cero

#### Scenario: Salidas equivalentes

- **WHEN** las mismas respuestas inyectadas se reportan en modo humano y JSON
- **THEN** ambos modos conservan los mismos IDs, orden, estados, causas y recuperaciones

#### Scenario: Estado desconocido

- **WHEN** un probe intenta devolver un estado fuera del vocabulario permitido
- **THEN** el doctor registra un fallo interno
- **AND** no degrada el resultado a `WARN` ni lo omite

### Requirement: El doctor es estrictamente read-only

El doctor SHALL NOT instalar, reparar, autenticar, actualizar, reindexar, regenerar, escribir
configuración, modificar lockfiles, iniciar un flujo OAuth ni abrir un navegador. Todo probe ejecutado
SHALL estar declarado como no mutante, tener timeout y finalizar sus procesos hijos. La recuperación SHALL
mostrarse, nunca ejecutarse.

#### Scenario: Herramienta ausente

- **WHEN** falta una herramienta requerida
- **THEN** el doctor registra `FAIL` con la instalación o preparación manual necesaria
- **AND** no descarga ni instala nada

#### Scenario: GitNexus stale

- **WHEN** el índice GitNexus está stale
- **THEN** el doctor registra `FAIL` y muestra la secuencia aprobada de reparación
- **AND** no ejecuta analyze, repair ni reindex

#### Scenario: OAuth requerido

- **WHEN** un MCP requiere consentimiento o autenticación interactiva
- **THEN** el doctor registra la limitación sin abrir navegador, reservar puertos ni iniciar el
  consentimiento
- **AND** remite al smoke autenticado separado

#### Scenario: Probe excede su timeout

- **WHEN** un proceso no finaliza dentro del límite configurado
- **THEN** el doctor lo termina
- **AND** registra `FAIL` o `WARN` según la obligatoriedad declarada
- **AND** no deja listeners o procesos hijos activos

### Requirement: Las comprobaciones se seleccionan por perfil

El doctor SHALL comprobar, según aplicabilidad declarada: runtime y package manager, lockfile, Git y
working tree, OpenSpec local fijado, GitHub CLI y Project configurado, paridad del harness, paridad MCP,
GitNexus, CodeGraph, variables requeridas, CI local reproducible y herramientas retiradas. Las
comprobaciones de framework, UI, backend, seguridad, datos, IA o deploy SHALL ejecutarse únicamente cuando
su perfil esté activo.

Un perfil activo sin probe implementado SHALL producir `FAIL`; un perfil inactivo SHALL producir `SKIP`
con causa, nunca un `PASS` inferido.

#### Scenario: Etapa universal sin stack

- **WHEN** el doctor corre antes del discovery
- **THEN** los checks universales se evalúan
- **AND** las compatibilidades de framework o proveedor se registran como `SKIP`
- **AND** no se instala ni detecta un stack como decisión implícita

#### Scenario: OpenSpec global pero no local

- **WHEN** existe OpenSpec global pero falta la versión local fijada o el lockfile coherente
- **THEN** el doctor registra `FAIL`
- **AND** no utiliza ni descarga el fallback global

#### Scenario: Working tree con cambios

- **WHEN** Git identifica un repositorio válido con cambios no clasificados
- **THEN** el doctor registra `WARN` con las rutas o categorías relevantes
- **AND** no limpia, mueve ni revierte esos cambios

#### Scenario: Project no visible

- **WHEN** GitHub CLI no puede leer el Project configurado por autenticación, scopes o permisos
- **THEN** el doctor registra `FAIL` sin revelar credenciales
- **AND** muestra la intervención manual necesaria

#### Scenario: Perfil activo sin validación

- **WHEN** un perfil activado no define probe, evidencia manual o criterio de cierre
- **THEN** el doctor registra `FAIL`
- **AND** no lo trata como `N/A`

#### Scenario: CI local no demostrada

- **WHEN** existe configuración CI pero no hay comando local read-only ni evidencia compatible de ejecución
- **THEN** el doctor distingue configuración presente de ejecución no demostrada
- **AND** no reporta la CI como operativa

### Requirement: Configuración, startup, tool listing y autenticación MCP son evidencias independientes

El doctor SHALL reportar por servidor MCP cuatro niveles distintos: configuración válida,
startup/handshake, `tools/list` y smoke autenticado. Evidencia de un nivel SHALL NOT promover
automáticamente los niveles posteriores.

El doctor SHALL comprobar directamente solo la configuración y los probes expresamente seguros y no
interactivos. El smoke autenticado SHALL ser un comando opt-in separado; el doctor únicamente SHALL
consumir evidencia redactada, vigente y ligada a la configuración actual. Si no existe esa evidencia,
SHALL reportar `WARN` o `SKIP` según el perfil, nunca `PASS`.

#### Scenario: Configuración presente sin runtime demostrado

- **WHEN** un MCP aparece en todos los espejos pero no existe evidencia de startup
- **THEN** `mcp-config` puede ser `PASS`
- **AND** startup, tool listing y auth smoke no son `PASS`

#### Scenario: Startup sin herramientas

- **WHEN** un servidor completa handshake pero falla `tools/list`
- **THEN** startup conserva su evidencia
- **AND** tool listing registra `FAIL`
- **AND** autenticación no se infiere

#### Scenario: Tool listing sin identidad autenticada

- **WHEN** `tools/list` responde pero no se ejecutó un smoke autenticado
- **THEN** tool listing puede ser `PASS`
- **AND** auth smoke permanece `WARN` o `SKIP`

#### Scenario: Evidencia autenticada vigente

- **WHEN** el smoke opt-in ejecuta una operación read-only, redacta su salida y la liga a la configuración
  vigente
- **THEN** el doctor puede registrar auth smoke como `PASS`
- **AND** no repite autenticación ni la operación remota

#### Scenario: Evidencia stale o de otra configuración

- **WHEN** el hash/configuración, servidor o vigencia de la evidencia no coincide con el entorno actual
- **THEN** el doctor la rechaza
- **AND** no reporta un falso `PASS`

#### Scenario: MCP roto junto a otro con OAuth pendiente

- **WHEN** un servidor está roto y otro solo requiere OAuth
- **THEN** el servidor roto permanece `FAIL`
- **AND** el OAuth pendiente no degrada el fallo agregado a `WARN`

### Requirement: Variables y evidencia nunca revelan secretos

El doctor SHALL comprobar variables mediante nombre, obligatoriedad y presencia, sin mostrar valores,
longitud, hash o fragmentos. La salida de probes SHALL normalizarse y redactarse antes de llegar al reporte
humano, JSON, logs o fixtures.

#### Scenario: Variable requerida ausente

- **WHEN** falta una variable requerida por un perfil activo
- **THEN** el doctor registra `FAIL` nombrando únicamente la variable
- **AND** explica cómo configurarla manualmente sin sugerir un valor

#### Scenario: Variable opcional ausente

- **WHEN** falta una variable opcional
- **THEN** el doctor registra `WARN` o `SKIP` según el contrato del perfil
- **AND** no la presenta como requisito satisfecho

#### Scenario: Probe imprime una credencial

- **WHEN** la salida de un comando contiene un valor con patrón sensible
- **THEN** el doctor lo redacta antes de persistir o mostrar evidencia
- **AND** las pruebas afirman que el valor original no aparece en ningún formato

#### Scenario: Archivo de secretos presente

- **WHEN** existe un archivo local de secretos
- **THEN** el doctor no imprime ni incorpora su contenido
- **AND** limita el diagnóstico a nombres y presencia permitidos

### Requirement: GitNexus y CodeGraph conservan roles distintos

Cuando el perfil declare código indexable, GitNexus SHALL ser la comprobación estructural primaria y solo
SHALL obtener `PASS` si el índice está fresh y una consulta e impacto conocidos funcionan. Un estado stale,
inclasificable o semánticamente roto SHALL ser `FAIL` aunque el proceso termine con código cero.

CodeGraph SHALL reportarse de forma independiente como fallback para fuente lineada. Un `PASS` de
CodeGraph SHALL NOT ocultar un `FAIL` requerido de GitNexus. Ninguno SHALL reindexarse o repararse desde el
doctor.

#### Scenario: GitNexus devuelve falso verde

- **WHEN** el proceso termina con código cero pero la frescura es stale, inclasificable o la consulta
  estructural no resuelve
- **THEN** GitNexus se registra como `FAIL`
- **AND** la recuperación se muestra sin ejecutarse

#### Scenario: Fallback disponible

- **WHEN** GitNexus falla y CodeGraph responde
- **THEN** ambos resultados permanecen visibles
- **AND** CodeGraph no convierte el resultado primario en `PASS`

#### Scenario: Ambos fallan

- **WHEN** GitNexus y CodeGraph no están operativos para un perfil que los requiere
- **THEN** el doctor conserva ambos fallos
- **AND** explica las recuperaciones independientes

#### Scenario: Repositorio sin superficie indexable

- **WHEN** el perfil aprobado declara que aún no existe código indexable
- **THEN** los smokes estructurales se registran como `SKIP` con esa causa
- **AND** el doctor no crea índices ni afirma que las consultas funcionan

### Requirement: Graphify permanece retirado y manual

El doctor SHALL incluir Graphify como `SKIP` con causa `retirado/manual` y recuperación `ninguna; auditoría
opcional fuera del bootstrap`. Su ausencia SHALL NOT causar `FAIL` o `WARN`. El doctor SHALL NOT buscar
binarios, inspeccionar `graphify-out/`, instalarlo, iniciarlo o usarlo como evidencia de salud.

#### Scenario: Graphify ausente

- **WHEN** no existe instalación ni salida local de Graphify
- **THEN** el doctor reporta `SKIP retirado/manual`
- **AND** el veredicto agregado no falla por esa ausencia

#### Scenario: Salida histórica presente

- **WHEN** existe `graphify-out/` pero no una auditoría manual vigente
- **THEN** el doctor conserva `SKIP`
- **AND** no interpreta la carpeta como runtime sano

#### Scenario: Reintroducción en MCP activo

- **WHEN** Graphify aparece como servidor MCP activo
- **THEN** la paridad/configuración MCP registra `FAIL`
- **AND** el check específico de Graphify continúa como `SKIP`
- **AND** el doctor no intenta iniciarlo ni repararlo

### Requirement: Los tests del doctor refutan falsos verdes y mutaciones

El constructor SHALL probar el doctor con resultados inyectados para estados sanos, herramientas ausentes,
lockfile incoherente, comando con error semántico y exit cero, timeout, OAuth pendiente, MCP roto, evidencia
autenticada stale, secreto en stdout, GitNexus stale, CodeGraph fallback, Graphify retirado y perfiles
inactivos.

Las fixtures SHALL afirmar orden, equivalencia humano/JSON, exit code, redacción y lista exacta de comandos.
Ninguna prueba unitaria SHALL abrir navegador, autenticar, instalar, reparar, reindexar o lanzar servicios
reales.

#### Scenario: Error semántico con exit cero

- **WHEN** un probe termina con cero pero devuelve evidencia incompatible con su contrato
- **THEN** la prueba espera `FAIL`
- **AND** demuestra que el exit code por sí solo no produce `PASS`

#### Scenario: Determinismo del reporte

- **WHEN** se inyectan dos veces las mismas respuestas
- **THEN** los campos semánticos y su orden son idénticos
- **AND** telemetría volátil no altera el veredicto ni snapshots de paridad

#### Scenario: Ausencia de efectos laterales

- **WHEN** la fixture registra todos los comandos y archivos tocados
- **THEN** no aparecen comandos de instalación, reparación, auth, update, sync o reindexado
- **AND** no se modifica ningún archivo de la fixture

#### Scenario: Fallo parcial conserva diagnóstico

- **WHEN** un probe lanza una excepción o produce salida truncada
- **THEN** el doctor registra su fallo
- **AND** continúa con checks independientes
- **AND** no omite el resultado ni declara éxito agregado

### Requirement: El doctor verifica identidad de la release consumida

El doctor SHALL comparar nombre/versión/schema del state con manifest, lockfile e instalación. Un path
embebido, versión flotante, binario global o source duplicado SHALL producir `FAIL` con recovery. El doctor
SHALL NOT instalar, actualizar ni cambiar la dependencia.

#### Scenario: Release fijada sana

- **WHEN** state, package, lockfile e instalación coinciden
- **THEN** reporta `PASS` con versión e identidad no sensible
- **AND** no ejecuta red ni mutaciones

#### Scenario: Source duplicado

- **WHEN** el consumidor conserva runtime editable además de la dependencia upstream
- **THEN** reporta `FAIL` de ownership
- **AND** indica retirar la copia solo mediante migración/PR

#### Scenario: Latest persistido

- **WHEN** la identidad instalada depende de `latest` sin versión concreta
- **THEN** reporta `FAIL`
- **AND** exige fijar una release exacta

### Requirement: El doctor reporta salud del control de deuda sin mutarlo

El doctor SHALL validar presencia/schema de política, registro y assessments, ejecutar únicamente la ruta
read-only equivalente a `debt check` y distinguir motor no configurado, estado sano, pausa y corrupción.
SHALL NOT capturar, sincronizar GitHub, crear issues, renovar excepciones o reparar el registro.

#### Scenario: Registro sano y vacío

- **WHEN** una fixture greenfield contiene política y registro válidos sin deuda
- **THEN** el doctor reporta `PASS`
- **AND** conserva cero cambios de filesystem

#### Scenario: Plan pausado

- **WHEN** debt check devuelve triggers válidos
- **THEN** el doctor conserva el estado/triggers sin convertirlos en fallo interno
- **AND** remite al issue/handoff aplicable

#### Scenario: Assessment no reflejado

- **WHEN** existe assessment válido ausente del registro
- **THEN** reporta `FAIL` con recuperación explícita
- **AND** no ejecuta capture automáticamente

#### Scenario: GitHub off

- **WHEN** la política desactiva integración remota
- **THEN** la salud local se evalúa y GitHub se reporta `SKIP`
- **AND** la ausencia remota no se presenta como `PASS`

