# uxui-plan-audit

Contrato del artefacto de auditoria pre-Ola 1 del Plan Maestro UX/UI: cobertura, trazabilidad, priorizacion, creacion de backlog sin ejecucion y recomendacion de secuencia. Todo comportamiento es observable por el responsable del producto revisando el reporte versionado, el issue #76 y PlanearIA Product OS.

## ADDED Requirements

### Requirement: Cobertura completa por ola y gate

La auditoria SHALL entregar una matriz de cobertura donde cada ola del plan (0, 1, 2, 3, 4+) y cada gate (R1 operativo, R2 operativo, #46 Figma, #47 IHC) tiene una fila con objetivo, dependencias, evidencia consultada, riesgo identificado e issues relacionados (existentes o creados).

#### Scenario: Matriz sin huecos

- **WHEN** el revisor abre `matriz-cobertura.md` en la carpeta versionada de la auditoria
- **THEN** encuentra una fila por cada ola y cada gate, sin celdas vacias ni "N/A" sin justificacion escrita

#### Scenario: Estado de R1 y brecha hacia R2 verificados

- **WHEN** el revisor consulta la fila de R1 y la de R2
- **THEN** R1 aparece verificado con evidencia reproducible (issues cerrados, comandos, documentos) y R2 lista con precision que falta, distinguiendo trabajo versionable de gates manuales #46/#47

### Requirement: Hallazgos trazables con evidencia e inferencia separadas

Cada hallazgo de la auditoria SHALL declarar si se sustenta en evidencia (con fuente verificable: archivo, comando, enlace) o en inferencia (con confianza alta/media/baja), ademas de severidad P0-P3, costo estimado, dependencia, ola recomendada y accion propuesta.

#### Scenario: Hallazgo con evidencia

- **WHEN** un hallazgo cita comportamiento del codigo o del harness
- **THEN** la matriz enlaza la fuente verificable (ruta de archivo, consulta GitNexus, comando con salida, o enlace) y ningun hallazgo estructural queda sustentado solo en documentacion sin contraste

#### Scenario: Hallazgo por inferencia

- **WHEN** un hallazgo no puede verificarse localmente (por ejemplo, practica externa o comportamiento futuro)
- **THEN** la matriz lo etiqueta como inferencia con confianza declarada y no se convierte en issue P0 sin evidencia adicional

### Requirement: Investigacion web con fuentes primarias aplicadas

La investigacion externa SHALL usar fuentes primarias o repositorios relevantes, citando enlace y una explicacion de por que aplica a PlanearIA; el codigo externo NO SHALL copiarse.

#### Scenario: Cita valida

- **WHEN** el reporte referencia una practica o patron externo
- **THEN** incluye el enlace a la fuente primaria y un parrafo de aplicabilidad al stack y contexto de PlanearIA (RN/Expo, offline-first, presupuesto cero, docentes mexicanos)

#### Scenario: Fuente sin aplicabilidad

- **WHEN** una fuente consultada no aplica al contexto de PlanearIA
- **THEN** se descarta o se registra en el log de investigacion como descartada con motivo, sin generar hallazgos ni issues

### Requirement: Backlog completo en Product OS sin ejecucion

La auditoria SHALL crear todos los issues sugeridos P0-P3, deduplicados contra issues existentes y entre si, enlazados al plan maestro, con prioridad, severidad, confianza, costo, dependencias, ola recomendada, evidencia y no objetivos, agregados a PlanearIA Product OS con estado `Backlog`. Ningun issue nuevo SHALL iniciarse, enriquecerse, proponerse ni aplicarse dentro de este change.

#### Scenario: Issue nuevo bien formado

- **WHEN** el revisor abre cualquier issue creado por la auditoria
- **THEN** encuentra la metadata completa (prioridad, severidad, confianza, costo, dependencia, ola, evidencia enlazada al reporte, no objetivos) y la nota de que requiere activacion humana propia

#### Scenario: Deduplicacion verificable

- **WHEN** existe un issue previo que cubre el mismo hallazgo
- **THEN** la auditoria lo referencia en la matriz en lugar de crear un duplicado

#### Scenario: Ninguna ejecucion encubierta

- **WHEN** el revisor inspecciona el estado de los issues creados al cierre del change
- **THEN** todos permanecen en `Backlog`, sin ramas, changes OpenSpec, asignaciones ni commits asociados

### Requirement: Estados externos existentes intactos

El change SHALL limitarse a crear artefactos nuevos (reporte, issues, items de Backlog) y a mover el propio #76; el Plan Maestro UX/UI, los issues existentes, los milestones y los gates #46/#47 NO SHALL modificarse ni cerrarse.

#### Scenario: Verificacion de no-mutacion

- **WHEN** el revisor compara `git diff` del PR y el historial de GitHub tras el cierre
- **THEN** el diff solo contiene la carpeta del reporte y el directorio del change, y #46/#47, milestones e issues previos conservan estado y contenido

### Requirement: Decisiones abiertas registradas sin resolverse

Cuando una recomendacion dependa de una decision humana (producto, costo, privacidad, Figma, IHC, epic/milestones), la auditoria SHALL registrarla en `decisiones-abiertas.md` con contexto, opciones y consecuencias, sin resolverla por inferencia.

#### Scenario: Decision abierta documentada

- **WHEN** un hallazgo requiere juicio humano para convertirse en accion
- **THEN** aparece en el registro de decisiones abiertas con opciones y efectos, y ningun issue creado la da por resuelta

### Requirement: Recomendacion de secuencia y primer issue ejecutable

El reporte SHALL cerrar con un mapa de dependencias, un roadmap recomendado y la recomendacion explicita de un unico primer issue ejecutable de Ola 1 UX/UI con su justificacion.

#### Scenario: Primer issue recomendado

- **WHEN** el revisor lee el reporte ejecutivo
- **THEN** encuentra un unico issue senalado como primer ejecutable de Ola 1, con justificacion basada en dependencias y riesgo, y el roadmap muestra el orden del resto

### Requirement: Ruteo estructural GitNexus con fallback documentado

Toda consulta estructural de codigo de la auditoria SHALL partir de GitNexus; CodeGraph solo SHALL usarse como fallback cuando GitNexus falle, este stale o no entregue el detalle requerido, y cada fallback SHALL registrarse con motivo.

#### Scenario: Fallback justificado

- **WHEN** la auditoria usa CodeGraph para una consulta
- **THEN** el log de la auditoria registra que devolvio GitNexus y por que fue insuficiente
