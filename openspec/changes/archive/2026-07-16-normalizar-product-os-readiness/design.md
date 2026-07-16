## Context

La epic #42 sigue abierta y su item esta en `In progress`; #65 y #66 estan abiertos en `Backlog` dentro de `PlanearIA Product OS` (Project 1). Gate M mantiene #46 y #47 en `Parked`, mientras que #48 a #52 y #62 a #64 estan cerrados y en `Done`. La exploracion tambien reprodujo la primera deuda de #66: `npm run gitnexus:diagnose` imprime `Not a git repository` y termina con codigo 0.

Los milestones abiertos mezclan ciclos futuros, gates activos y ciclos ya completados. No hay datos de producto ni codigo de aplicacion en esta decision; el cambio solo gobierna documentos, metadatos y acciones externas de GitHub CLI.

### Bounded contexts and ownership

La gobernanza de Product OS es una capacidad operativa transversal, no un bounded context que posea entidades docentes. No modifica datos ni ownership de Identidad, Planeacion, Classroom, Seguimiento, Comunicacion, Experiencia, Sync o IA; por ello no requiere contrato cruzado, `userId`, `src/sync` ni confirmacion docente.

## Goals / Non-Goals

**Goals:**

- Mantener una fuente de evidencia reproducible que relacione plan, epic, Project, milestones e issues de readiness.
- Cerrar solamente milestones historicos cuya evidencia confirme que no conservan issues abiertos.
- Preservar gates activos y deuda posterior sin convertirlos en trabajo paralelo o sin borrar su historial.
- Hacer cada accion externa idempotente, revisable y reversible sin usar secretos.

**Non-Goals:**

- Corregir GitNexus, Expo, el doctor, CI o dependencias; #66 conserva esas dos remediaciones para changes futuros separados.
- Cerrar #42, #65, #66, #46 o #47, ni afirmar que R2 esta desbloqueado.
- Renombrar por estetica, eliminar issues/items/milestones, ni crear todos los issues de las olas futuras.
- Cambiar una pantalla, un flujo MVVM, datos academicos, backend, sync, SQLite, autenticacion o IA.

## Decisions

### 1. La fotografia de GitHub CLI es la evidencia previa a toda mutacion

Durante apply se consultaran Project 1, #42, #44, #46 a #52, #62 a #66 y todos los milestones con `gh`. La documentacion guardara la matriz resultante con fecha, conteos y accion. Ninguna decision se inferira de un titulo: un cierre exige comprobar que el milestone no tiene issues abiertos y que su plan no sigue activo.

Se descarta cerrar automaticamente cualquier milestone con cero issues abiertos: `Ciclo 4 - Auth y Seguridad` esta sin issues abiertos, pero el plan figura activo/en cierre. Tambien se descarta usar el estado Project como unico criterio, porque representa ejecucion diaria y no el ciclo de release.

### 2. La matriz externa es conservadora y no renombra elementos

| Objetivo externo | Estado observado | Decision propuesta para apply | Evidencia/rollback |
| --- | --- | --- | --- |
| Epic #42 | Open, `In progress` | Conservar; ampliar su checklist de Ola 1 y enlazar #65/#66 sin cerrarla. | Revertir el cuerpo al snapshot; no altera identidad ni estado. |
| #65 | Open, `Backlog` | Conservar durante propose; mover a `In progress` solo al comenzar apply. | Restituir `Backlog` si apply se aborta. |
| #46 y #47 | Open, `Parked`, Gate M | Aparcar/conservar; bloquean R2, no R0/R1. | No hay mutacion prevista. |
| #66 | Open, `Backlog`, sin milestone | Conservar como deuda post-Ola 0 y agregar su clasificacion/links, sin cerrarla ni marcarla Done. | Revertir solo el texto de clasificacion; el issue permanece abierto. |
| Ciclo 0 - Reorientacion y GitHub | Abierto, vencido, 0 issues | Cerrar. | Reabrir el milestone si el snapshot posterior detecta una referencia omitida. |
| Ciclo 1 - Plan Classroom | Abierto, 0 issues | Cerrar. | Reabrir el milestone; no se eliminan issues. |
| Ciclo 2 - Fundacion Classroom | Abierto, 8 issues cerrados | Cerrar. | Reabrir el milestone; conserva sus 8 issues. |
| Ciclo 3 - Infraestructura Local y CI | Abierto, 8 issues cerrados | Cerrar. | Reabrir el milestone; conserva sus 8 issues. |
| Readiness Ola 0 | Abierto, 5 issues cerrados | Cerrar; #66 queda fuera porque es seguimiento posterior. | Reabrir el milestone; #66 no se mueve automaticamente. |
| Ciclo 3 - UX/Navegacion Global | Abierto, 0 issues; plan UX/UI activo | Conservar abierto para sus olas futuras. | No hay mutacion prevista. |
| Ciclo 4 - Auth y Seguridad | Abierto, 4 issues cerrados; plan activo/en cierre | Conservar temporalmente hasta confirmar el cierre del plan Auth. | No hay mutacion prevista. |
| Readiness Gate M | Abierto, #46/#47 abiertos | Conservar abierto. | No hay mutacion prevista. |

No se propone ningun renombramiento. La nomenclatura actual es suficientemente trazable y renombrar introducira ruido historico sin resolver una dependencia.

### 3. #66 es tracking post-plan, no una dependencia de #65

El texto de #66 se ampliara durante apply con la clasificacion `deuda operacional post-Ola 0`, su origen #52 y dos remediaciones candidatas: `corregir-doctor-gitnexus-root` y `alinear-expo-localization-sdk54`. Esos nombres son candidatos de futuro, no changes creados ahora. Cada uno requerira issue enriquecido, Definition of Ready, propuesta y cambio propio cuando sea el siguiente trabajo autorizado.

Se descarta reabrir `Readiness Ola 0` o asignar #66 a ese milestone: la Ola 0 finalizo y #66 debe mantener el hecho de que fue hallada despues. Tambien se descarta cerrar #66 con dos checkboxes: ocultaria una remediacion sin evidencia y contradice la regla de no mega-changes.

### 4. Las mutaciones son declarativas e idempotentes

Las tareas comprobaran primero el estado actual. Si un milestone ya esta cerrado o un item ya tiene el estado esperado, se registrara la conformidad sin repetir una accion. Tras cada lote se volveran a consultar GitHub y los documentos para dejar enlaces de evidencia. Ningun comando usara tokens en argumentos, borrara contenido ni modifique elementos fuera de esta tabla.

## Risks / Trade-offs

- [Un milestone se cierra con una referencia activa no detectada] → Consultar issues por milestone y confirmar contra el plan antes del cierre; el rollback es reabrirlo.
- [La epic se interpreta como completada porque Ola 0 termino] → Mantener #42 abierta mientras R1 y Gate M tengan seguimiento pendiente.
- [#66 se transforma en un mega-change] → Conservarlo como tracker y exigir una propuesta independiente por cada remediacion.
- [El Project queda distinto al snapshot por una edicion concurrente] → Reconsultar justo antes de mutar y detenerse si la matriz ya no coincide; no sobrescribir cambios ajenos.
- [El estado `Parked` se confunde con cierre] → Mantener #46/#47 abiertos y describir expresamente que bloquean R2.

## Migration Plan

1. Validar el snapshot actual de GitHub contra la matriz y actualizar los documentos de plan/Product OS con las decisiones aprobadas.
2. Actualizar #42 con el tracking de Ola 1 y la referencia de #65; clasificar #66 sin cambiar su estado o milestone.
3. Aplicar solo los cierres de milestones confirmados por la matriz y registrar el snapshot posterior.
4. Ejecutar la validacion documental y OpenSpec, adjuntar evidencia y solicitar revision adversarial.
5. Si se necesita rollback, restaurar el texto documental y reabrir exclusivamente milestones cerrados por este change; no borrar historial ni cerrar #66.

## Open Questions

Ninguna bloqueante para propose. Antes de apply, el mantenedor revisara la tabla de decisiones externas y volvera a comprobar el snapshot para detectar cambios concurrentes.
