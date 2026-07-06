## Context

El overhaul AI-friendly anterior dejo el repo mejor encaminado: front doors alineados, spec `ai-friendly-repository-context` sincronizada y fuentes externas completas fuera del indexado principal de CodeGraph. La limpieza maxima busca el siguiente nivel: sacar del repo material que una IA no necesita para decidir normalmente, sin perderlo. El material completo queda en un respaldo externo controlado por el usuario; el repo conserva indices minimos, reglas vigentes y evidencia actual.

Estado actual relevante:

- `gh` esta instalado, autenticado como `RitualBoat` y tiene scope `project`.
- GitHub Project destino: `RitualBoat` Project `1`, `PlanearIA Product OS`.
- CodeGraph actual: 376 archivos, 4,607 nodos, 11,965 edges, DB 15.89 MB; bajo `context` solo aparecen 2 manifests YAML.
- Carpetas pesadas/candidatas: `context/stitch-results` (~33 MB no trackeado), `context/referencias-app-similares-a-planearia` (~25 MB trackeado), ground truth visual pesado, infraestructura historica, repos/estudio OpenSpec y legacy documental.
- La rama actual ya tiene borrados staged/working tree de `context/referencias-opensource/**/source/**`; el respaldo debe recuperarlos desde `HEAD`.

## Goals / Non-Goals

**Goals:**

- Crear un respaldo verificable antes de borrar cualquier material.
- Pausar despues del respaldo hasta que el usuario lo mueva fuera del repo.
- Externalizar legacy, repos, estudio, evidencia historica, ejemplos sensibles y assets pesados.
- Mantener indices minimos que expliquen que existe respaldo externo sin depender de rutas absolutas.
- Medir CodeGraph y encontrabilidad IA antes/despues.
- Resolver el alta de issue en GitHub Project por `gh`.

**Non-Goals:**

- Cambiar codigo funcional, runtime, backend, sync, auth, UI o datos locales.
- Subir el respaldo a Git, GitHub Releases, nube o una ruta publica.
- Decidir migraciones de datos o limpieza de claves `@planearia:*`.
- Reemplazar la necesidad de ground truth futuro; solo se externaliza el material completo actual.

## Decisions

1. **Backup dentro del repo primero, traslado manual despues.**
   - Razon: el usuario quiere inspeccionar y mover una carpeta completa antes del borrado.
   - Alternativa descartada: crear backup directamente fuera del repo. Reduce contaminacion temporal, pero no cumple la pausa y control manual pedidos.

2. **Respaldo exacto con manifiesto y hashes.**
   - Razon: despues de borrar del repo, la unica garantia de recuperacion sera el respaldo externo.
   - El manifiesto registra branch, fecha, `git status`, rutas, conteos, tamanos y SHA256.

3. **Recuperar fuentes ya borradas desde `HEAD` solo hacia el respaldo.**
   - Razon: el working tree actual ya marca esos archivos como eliminados; restaurarlos al repo contaminaria de nuevo CodeGraph.
   - Implementacion esperada: `git ls-tree -r --name-only HEAD -- context/referencias-opensource/.../source` + `git show HEAD:<path>` hacia el backup.

4. **Repo final conserva stubs/indices, no archivos completos.**
   - Razon: las IAs deben encontrar decision points rapido; el material detallado se solicita al usuario desde el respaldo externo cuando sea necesario.
   - Indices minimos: `context/README.md`, README por categoria activa cuando aplique, `Documentacion/README.md`, `05-context-engineering`, specs y evidencia actual.

5. **Medicion CodeGraph antes/despues con consulta trampa.**
   - Razon: no basta con contar archivos; hay que verificar que una pregunta sobre referencias externas no vuelva a tratar material externo como PlanearIA.
   - Consultas esperadas: sync, `aiGateway`, Classroom, Cuenta/accesibilidad y referencia externa.

## Risks / Trade-offs

- **Riesgo: borrar una regla vigente junto con legacy.** -> Mitigacion: solo borrar despues de backup, mantener fuentes vigentes `00-fundamentos`, `05-context-engineering`, `openspec/specs` y ejecutar findability test.
- **Riesgo: backup queda dentro del repo por accidente.** -> Mitigacion: pausa obligatoria y verificacion de inexistencia antes de continuar.
- **Riesgo: links rotos por retirar evidencia antigua.** -> Mitigacion: validador de links activos y actualizacion de indices a lenguaje de respaldo externo.
- **Riesgo: CodeGraph no baja mucho porque ya no indexa assets/docs.** -> Mitigacion: reportar metricas honestas; el beneficio tambien incluye `git ls-files`, peso repo y busqueda textual.
- **Riesgo: `gh project item-add` falla por permisos.** -> Mitigacion: documentar error exacto y dejar comando/fallback manual en evidencia.

## Migration Plan

1. Crear issue #36, enriquecerlo y agregarlo al Project.
2. Crear artefactos OpenSpec y validar el change.
3. Crear backup en `PLANEARIA_BACKUP_MOVE_OUT_2026-07-06/` con manifiesto.
4. Pausar y pedir al usuario mover el backup fuera del repo.
5. Tras confirmacion, verificar que el backup no existe en la raiz.
6. Ejecutar baseline pre-cleanup.
7. Borrar material respaldado y dejar stubs/indices minimos.
8. Reindexar/sincronizar CodeGraph, ejecutar comparativas y validaciones.
9. Sincronizar delta spec y archivar el change.

Rollback:

- Antes de la pausa: borrar la carpeta temporal de backup si el usuario cancela.
- Despues de la externalizacion: restaurar desde el backup externo o desde Git si todavia existe historial local.
