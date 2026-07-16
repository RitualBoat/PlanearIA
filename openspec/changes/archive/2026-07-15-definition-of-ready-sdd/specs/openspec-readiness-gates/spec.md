## ADDED Requirements

### Requirement: Gate de Definition of Ready valida un issue antes de proponer

El repositorio SHALL exponer un checker read-only que, al recibir un número de issue y la fase `propose`, valide que el issue está abierto, pertenece a `PlanearIA Product OS`, preserva la historia original, contiene enriquecimiento y declara nombre de change, tipo de ejecución, dependencias, contexto actual, criterios observables, evidencia esperada, no objetivos, rollback e intervención manual mediante el contrato de metadata de readiness.

#### Scenario: Issue versionable completo
- **WHEN** se ejecuta el gate `propose` para un issue abierto, enriquecido, vinculado al Project y con metadata válida
- **THEN** el reporte muestra `PASS` para los campos verificables y termina con código cero si no hay fallos

#### Scenario: Campo de entrada ausente
- **WHEN** el issue omite un campo obligatorio de readiness o el bloque de metadata no se puede parsear
- **THEN** el gate termina con código distinto de cero, identifica el campo y explica cómo enriquecer o corregir el issue sin modificarlo automáticamente

#### Scenario: Project no verificable
- **WHEN** GitHub CLI no puede consultar el issue o su pertenencia al Project por scopes, red o visibilidad
- **THEN** el gate termina con un fallo accionable que indica la recuperación segura o una excepción temporal permitida

### Requirement: Gate de Definition of Done valida un change antes de archive

El repositorio SHALL exponer un checker read-only que, al recibir un change y la fase `archive`, valide que el directorio resuelto pertenece a `openspec/changes`, enlaza al issue correcto, contiene metadata `readiness.json` válida, supera la validación OpenSpec estricta, conserva TLDR, no tiene tareas pendientes y declara evidencia, rollback, revisión adversarial y la matriz proporcional a sus superficies.

#### Scenario: Change listo para archive
- **WHEN** un change declara metadata consistente, tareas completas, evidencia enlazada y todas las validaciones requeridas para sus superficies
- **THEN** el gate muestra los resultados de cada campo y permite continuar hacia archive

#### Scenario: Tarea o evidencia pendiente
- **WHEN** existe una tarea sin marcar o falta una referencia obligatoria de evidencia, rollback o revisión adversarial
- **THEN** el gate falla antes de archive e identifica el archivo/campo y la acción de recuperación

#### Scenario: Directorio fuera del change
- **WHEN** se solicita validar una ruta ausente o que resuelve fuera de `openspec/changes`
- **THEN** el gate rechaza la solicitud sin leer ni escribir fuera de la raíz permitida

### Requirement: La matriz de validación es proporcional y no ejecuta comandos arbitrarios

El checker SHALL derivar las validaciones de un perfil estático para las superficies `docs`, `harness`, `ui`, `sync`, `ia` y `backend`. El manifest SHALL declarar las superficies aplicables, IDs de validación y enlaces de evidencia, pero SHALL NOT aportar comandos de shell. La ejecución local opcional SHALL limitarse a comandos fijos, read-only y sanitizados del perfil.

#### Scenario: Change de docs y harness
- **WHEN** un change declara las superficies `docs` y `harness`
- **THEN** el gate exige los IDs y evidencia definidos para esas superficies, incluida la paridad de instrucciones/workflows, sin exigir QA visual o sync no aplicables

#### Scenario: Change de interfaz
- **WHEN** un change declara la superficie `ui`
- **THEN** el gate exige evidencia de bundler HTTP 200, Playwright en móvil/tablet/web y checklist Nielsen, y no acepta `N/A` sin excepción válida

#### Scenario: Manifest intenta inyectar un comando
- **WHEN** la metadata incluye un comando, ruta ejecutable o ID de validación no reconocido
- **THEN** el gate falla con una remediación para usar únicamente IDs del perfil estático

### Requirement: Las excepciones justificadas permanecen visibles y caducan

El gate SHALL aceptar una excepción solo para campos permitidos cuando declara campo, motivo, responsable, aprobador, fecha ISO de expiración y recuperación. El reporte SHALL mostrar `EXCEPTION`; una excepción válida no bloqueará por sí misma. Campos de identidad/integridad y excepciones incompletas o vencidas SHALL fallar.

#### Scenario: Excepción temporal válida
- **WHEN** un campo excepcionable tiene una excepción completa, aprobada y no vencida
- **THEN** el gate informa `EXCEPTION` con su fecha de expiración y continúa si no existen otros fallos

#### Scenario: Excepción vencida
- **WHEN** la fecha de expiración es anterior a la fecha de ejecución
- **THEN** el gate falla y solicita corregir el campo o renovar la excepción con nueva aprobación

#### Scenario: Excepción de identidad prohibida
- **WHEN** una excepción intenta omitir issue, nombre de change, integridad de artefactos o tareas pendientes
- **THEN** el gate falla aunque el resto de la excepción tenga datos completos

### Requirement: Los diagnósticos son seguros y accionables

El checker SHALL producir resultados ordenados `PASS`, `FAIL` o `EXCEPTION`, con remediación por fallo. SHALL usar comandos de solo lectura, no escribir archivos, no crear o editar recursos de GitHub, no instalar dependencias ni exponer tokens, secretos o datos docentes en su salida.

#### Scenario: Fallo de CLI o validación local
- **WHEN** una dependencia local requerida no puede ejecutarse o una validación fija falla
- **THEN** el reporte conserva los demás resultados, oculta valores sensibles y ofrece un comando o paso de recuperación seguro
