# golden-journeys-qa Specification

## Purpose
TBD - created by archiving change golden-journeys-qa-visual. Update Purpose after archive.
## Requirements
### Requirement: Los golden journeys estan definidos en un manifiesto versionado

El sistema SHALL declarar los golden journeys de PlanearIA en un manifiesto versionado y legible por
maquina, que es la fuente de verdad del gate R2. Cada journey SHALL declarar identificador, nombre,
persona IHC cuando aplique, pasos, criterios observables, anchos obligatorios, capturas esperadas y
estado. La documentacion en prosa SHALL citar al manifiesto y SHALL NOT redefinir los journeys por su
cuenta.

#### Scenario: Un agente necesita saber que recorridos cubre el gate

- **WHEN** un agente prepara la QA visual de un change de UI
- **THEN** obtiene del manifiesto la lista de journeys con sus pasos, criterios observables y anchos obligatorios, sin depender de criterio propio ni de la evidencia de changes anteriores

#### Scenario: Prosa y manifiesto discrepan

- **WHEN** el runbook y el manifiesto describen un journey de forma distinta
- **THEN** el manifiesto prevalece como fuente de verdad y la discrepancia se corrige en la prosa

### Requirement: Cada journey declara su estado y el dueno de lo que falta

El sistema SHALL asignar a cada journey uno de tres estados: `vigente` (ejecutable de punta a punta
hoy), `parcial` (existe camino real hoy pero el objetivo depende de un change posterior) o `declarado`
(reservado, sin criterios definidos). Todo journey `parcial` SHALL declarar por separado los pasos
verificables hoy y el delta pendiente con el change dueno. Todo journey `declarado` SHALL nombrar al
change dueno. El manifiesto SHALL NOT exigir la verificacion de pantallas que no existen.

#### Scenario: Un journey depende de pantallas de una ola posterior

- **WHEN** el objetivo de un journey requiere una pantalla que pertenece a un change futuro
- **THEN** el journey queda en estado `parcial`, verifica solo el camino real de hoy y registra el delta con el nombre del change que lo cierra

#### Scenario: El change dueno de un delta aterriza

- **WHEN** el change nombrado como dueno del delta de un journey `parcial` se implementa
- **THEN** ese change actualiza el manifiesto y el journey pasa a `vigente`, sin necesidad de reabrir el trabajo que definio los journeys

#### Scenario: Un journey se reserva sin definirlo

- **WHEN** un recorrido se considera necesario pero sus criterios corresponden a otro change
- **THEN** figura en el manifiesto con estado `declarado` y dueno explicito, y el gate no exige evidencia suya

### Requirement: La QA visual cubre anchos canonicos con esfuerzo proporcional

El sistema SHALL derivar los anchos canonicos de la fuente reactiva de breakpoints establecida por
`reactive-breakpoints`, y SHALL exigir cobertura en tres niveles segun el alcance del change. Todo
change con UI visible SHALL cubrir como minimo los anchos representativos de movil, tablet y
escritorio. Un change que altere la estructura de layout o de navegacion SHALL cubrir ademas los
anchos limite superiores y aportar medicion numerica del invariante que declara. Un change que toque
la superficie de un golden journey SHALL recorrer ese journey completo con sus criterios observables.
El nivel aplicado SHALL declararse en la readiness del change.

#### Scenario: Un change ajusta el color de una pantalla existente

- **WHEN** el change tiene UI visible pero no altera layout, navegacion ni la superficie de un journey
- **THEN** la QA visual cubre los tres anchos representativos con capturas, checklist Nielsen y checklist anti-slop, y no se le exigen los anchos limite

#### Scenario: Un change modifica la navegacion primaria

- **WHEN** el change altera la estructura de layout o de navegacion
- **THEN** la QA visual cubre ademas los anchos limite superiores de movil y tablet, y aporta medicion numerica del invariante declarado, no solo capturas

#### Scenario: Un change toca la superficie de un golden journey

- **WHEN** el change modifica una pantalla que forma parte de los pasos de un journey del manifiesto
- **THEN** la evidencia recorre ese journey completo y verifica sus criterios observables

### Requirement: El procedimiento de QA visual es reproducible y previene la evidencia enganosa

El sistema SHALL documentar un procedimiento que cualquier agente pueda repetir obteniendo evidencia
comparable. El procedimiento SHALL exigir la confirmacion de respuesta HTTP 200 del servidor web antes
de navegar. Cuando el cambio de ancho se realice por control remoto del navegador, el procedimiento
SHALL exigir que se dispare el evento de redimensionado del documento y que la medicion se tome en una
llamada posterior, porque de lo contrario la aplicacion conserva el layout del ancho anterior. El
procedimiento SHALL exigir medicion sobre el DOM o los estilos computados ademas de la captura, y
SHALL exigir que el ruido de consola preexistente se clasifique en vez de omitirse.

#### Scenario: El agente cambia el ancho de la ventana por control remoto

- **WHEN** el ancho se modifica mediante el protocolo de control del navegador y no arrastrando el borde
- **THEN** el procedimiento dispara el evento de redimensionado del documento y mide en una llamada posterior, de modo que la evidencia corresponde al ancho nuevo y no al anterior

#### Scenario: La captura de pantalla no responde

- **WHEN** la pantalla bajo prueba mantiene el renderizador ocupado y la captura agota su tiempo
- **THEN** la medicion por DOM y estilos computados sostiene la evidencia, y la limitacion se declara en el reporte

#### Scenario: La consola muestra errores ajenos al change

- **WHEN** aparecen errores de consola preexistentes, como respuestas no autorizadas del backend por navegar sin sesion
- **THEN** el reporte los clasifica y declara cuantos son atribuibles al change, y no afirma que no hubo errores

### Requirement: La evidencia visual tiene forma fija y verificable por herramienta

El sistema SHALL definir un contrato de evidencia con ubicacion y secciones obligatorias: entorno con
la confirmacion HTTP 200, medicion por breakpoint, journeys cubiertos, checklist Nielsen con
severidad, checklist anti-slop, clasificacion del ruido de consola y limitaciones honestas. El sistema
SHALL ofrecer una verificacion determinista y de solo lectura que compruebe, contra el manifiesto, que
existen las capturas de los anchos exigidos, que estan las secciones obligatorias, que la severidad
Nielsen maxima declarada es menor que el umbral de bloqueo y que los journeys tocados estan cubiertos.
La verificacion SHALL NOT requerir navegador ni acceso de red, y SHALL reportar el resultado con ruta
de remediacion.

#### Scenario: Falta una captura de un ancho obligatorio

- **WHEN** se verifica la evidencia de un change al que le falta la captura de uno de los anchos que su nivel exige
- **THEN** la verificacion falla nombrando el ancho ausente y la ruta de remediacion

#### Scenario: El reporte omite una seccion obligatoria

- **WHEN** el reporte de evidencia no incluye alguna de las secciones del contrato
- **THEN** la verificacion falla nombrando la seccion ausente

#### Scenario: La severidad Nielsen alcanza el umbral de bloqueo

- **WHEN** el reporte declara un hallazgo Nielsen de severidad igual o mayor al umbral de bloqueo
- **THEN** la verificacion falla, porque ese hallazgo debe corregirse antes de archivar

#### Scenario: La evidencia esta completa

- **WHEN** la evidencia cumple capturas, secciones, severidad y cobertura de journeys
- **THEN** la verificacion reporta exito y su salida puede citarse como evidencia de la readiness del change

### Requirement: La decision sobre herramienta de QA visual queda registrada con disparador de revision

El sistema SHALL registrar la decision vigente sobre como se ejecuta la QA visual, con sus
alternativas, ventajas, costos, owner y el disparador que obliga a revisarla. La decision vigente
SHALL ser que la QA visual se conduce mediante el servidor MCP de Playwright sin incorporarlo como
dependencia del repositorio. El registro SHALL declarar que la automatizacion en integracion continua
con baselines comparables pertenece a un change posterior, nombrandolo.

#### Scenario: Alguien evalua instalar Playwright como dependencia

- **WHEN** se plantea versionar un runner de Playwright en el repositorio
- **THEN** encuentra la decision registrada con sus tradeoffs, el change dueno de esa automatizacion y el disparador que la habilitaria, en vez de una omision sin explicar

#### Scenario: Se cumple el disparador de revision

- **WHEN** se requiere regresion visual bloqueante en integracion continua o entra un segundo colaborador
- **THEN** la decision se revisa en el change dueno de la automatizacion, no de forma incidental dentro de un change de UI

### Requirement: La definicion de golden journeys no cierra el gate R2

El sistema SHALL declarar explicitamente que definir los golden journeys y su procedimiento cubre solo
una parte del gate R2. La aprobacion del ground truth visual y el reclutamiento para las entrevistas
SHALL permanecer como gates manuales con su propia evidencia, y SHALL NOT considerarse satisfechos por
la existencia de este manifiesto o de su procedimiento.

#### Scenario: Se evalua si R2 puede darse por cumplido

- **WHEN** alguien revisa el estado del gate R2 tras existir el manifiesto y el procedimiento
- **THEN** encuentra declarado que los gates manuales de ground truth visual y reclutamiento siguen abiertos, y que R2 no se cierra por este trabajo

