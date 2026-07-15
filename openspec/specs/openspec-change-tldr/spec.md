# openspec-change-tldr Specification

## Purpose

Definir el resumen humano complementario que acompaña cada change OpenSpec de PlanearIA y su validación limitada de presencia y ubicación.

## Requirements

### Requirement: Cada change nuevo incluye un resumen humano ubicado en su raíz

PlanearIA SHALL requerir para cada change OpenSpec nuevo un único archivo `TLDR.md` en `openspec/changes/<change>/TLDR.md`, junto a sus artefactos de planeación. El flujo de propose SHALL crear el archivo además de `proposal.md`, `design.md`, specs y `tasks.md`; el TLDR no SHALL sustituir ninguno de esos artefactos.

#### Scenario: Propose crea el resumen junto con los artefactos
- **WHEN** un agente completa la propuesta de un change nuevo mediante el flujo OpenSpec de PlanearIA
- **THEN** crea `TLDR.md` en la raíz del directorio del change antes de declarar la propuesta lista para apply
- **AND** el archivo coexiste con los artefactos técnicos requeridos sin reemplazarlos

### Requirement: El TLDR explica la función de cada artefacto para lectura humana

El TLDR SHALL presentar, en este orden, un bloque para la intención de Proposal, uno para el enfoque de Design, uno para el comportamiento esperado de Spec, uno para el plan práctico de Tasks y un único párrafo `Resumen integral del change`. Cada bloque y el resumen SHALL tener como máximo 120 palabras, usar español accesible y coloquial, y emplear encabezados que expliquen la función real del artefacto en vez de repetir una fórmula vacía. Estas cualidades SHALL ser instruidas y revisadas por personas, no evaluadas por el validador automático.

#### Scenario: Revisión humana del resumen propuesto
- **WHEN** una persona revisa el TLDR antes de apply
- **THEN** puede identificar intención, enfoque, reglas y plan de trabajo sin releer primero los cuatro artefactos técnicos
- **AND** confirma manualmente el orden, lenguaje y límite de cada bloque y del resumen final

### Requirement: El resumen se mantiene durante apply y archive

El flujo de apply SHALL indicar actualizar `TLDR.md` antes de continuar o archivar cuando el trabajo cambie el alcance, los archivos afectados, el comportamiento o el resultado esperado. El flujo de archive SHALL comprobar que el archivo está en la raíz del change y preservarlo al mover el directorio completo a `openspec/changes/archive/`.

#### Scenario: Apply modifica el alcance material
- **WHEN** la implementación cambia alcance, archivos, comportamiento o resultado esperado respecto de los artefactos aprobados
- **THEN** el agente actualiza el TLDR para reflejar el cambio antes de cerrar las tareas afectadas
- **AND** el resumen conserva sus cinco bloques en el orden requerido

#### Scenario: Archive mueve el change completo
- **WHEN** un change con TLDR se archiva después de completar sus tareas
- **THEN** `TLDR.md` queda dentro del directorio archivado junto con proposal, design, specs y tasks
- **AND** archive no crea una copia separada ni elimina el resumen

### Requirement: La validación automática sólo revisa presencia y ubicación

La validación de PlanearIA SHALL comprobar en cada change activo únicamente que existe `TLDR.md` exactamente en la raíz del directorio del change. Si falta o sólo está en otra ubicación, SHALL terminar con código distinto de cero, identificar el change y explicar cómo crearlo o moverlo a la ruta esperada. La validación SHALL ignorar el contenido, estructura, número de palabras, tono y calidad del TLDR, y SHALL ignorar cambios ya archivados.

#### Scenario: Change activo con TLDR en la ruta esperada
- **WHEN** el validador revisa un change activo con un archivo en `<changeRoot>/TLDR.md`
- **THEN** la comprobación de TLDR pasa independientemente del contenido del archivo
- **AND** la validación estricta nativa de OpenSpec conserva sus comprobaciones propias sobre los demás artefactos

#### Scenario: TLDR ausente o fuera de la raíz
- **WHEN** el validador revisa un change activo sin `<changeRoot>/TLDR.md`
- **THEN** falla sin intentar analizar el contenido de ningún resumen
- **AND** muestra la ruta exacta donde se debe crear o mover `TLDR.md`

#### Scenario: Change archivado sin retroajuste
- **WHEN** el validador recorre `openspec/changes/archive/`
- **THEN** no falla por archivos históricos que no tengan TLDR
- **AND** no modifica el contenido de ningún archive
