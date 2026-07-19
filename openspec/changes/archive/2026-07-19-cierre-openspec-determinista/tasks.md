# Tasks: cierre-openspec-determinista

## 1. Clasificacion pura

- [x] 1.1 Crear `scripts/lib/openspecArchiveState.mjs` con `parseDeltaOperations(contenido)`, que extraiga las operaciones ADDED/MODIFIED/REMOVED/RENAMED de una delta spec usando el mismo encabezado canonico y `name.trim()` como normalizacion.
- [x] 1.2 Anadir `classifySyncState(operaciones, specPrincipal)` que devuelva `pendiente`, `sincronizada` o `parcial` segun la tabla de colision del design, tratando `MODIFIED` presente como neutra.
- [x] 1.3 Hacer que `parcial` devuelva la capacidad, la operacion y la requirement discrepante para el diagnostico.
- [x] 1.4 Anadir `classifyRepositoryState({ changeDirExiste, archiveDirExiste, archiveCommiteado })` con los cuatro estados del design.

## 2. Comando de archive

- [x] 2.1 Crear `scripts/opsxArchiveChange.mjs` con la guardia de rama: aborta en `main`, `master`, `development` y detached `HEAD`, reutilizando el criterio de `opsxFinishChange.mjs`.
- [x] 2.2 Anadir la guardia de trabajo ajeno: aborta si `git status --porcelain` reporta rutas fuera de `openspec/`.
- [x] 2.3 Invocar `npm run openspec:ready:archive -- --change <name> --run-local` y abortar ante `FAIL`.
- [x] 2.4 Resolver las deltas y specs principales del change y clasificar con `classifySyncState`; abortar en `parcial` sin escribir.
- [x] 2.5 Invocar `openspec archive <name> --yes`, anadiendo `--skip-specs` solo en estado `sincronizada`.
- [x] 2.6 Consolidar con `git add -A openspec/` y crear el commit canonico `docs(openspec): archivar <change> y sincronizar specs (#<issue>)`, tomando el issue de `readiness.json`.
- [x] 2.7 Implementar la reejecucion segun `classifyRepositoryState`: no-op con exito, consolidacion sin repetir archive, o aborto no clasificable.
- [x] 2.8 Anadir `--dry-run` que reporte clasificacion y acciones sin escribir, coherente con `opsx:finish:dry`.
- [x] 2.9 Registrar `opsx:archive` y `opsx:archive:dry` en `package.json`.

## 3. Normalizacion de workflows

- [x] 3.1 Anadir a `scripts/patchOpsxWorkflows.mjs` el bloque idempotente `PLANEARIA_CLOSURE_WORKFLOW` para el flujo archive, con el orden canonico y el comando unico.
- [x] 3.2 Neutralizar en el parcheador el prompt `"Sync now (recommended)"` y la instruccion de `mv` manual, de forma idempotente.
- [x] 3.3 Ejecutar `npm run agent:opsx:update` y revisar que el diff toque solo los workflows opsx conocidos.
- [x] 3.4 Verificar `npm run agent:opsx:patch:check` en verde.
- [x] 3.5 Incorporar `.cursor/skills` y `.opencode/skills` a los destinos del parcheador: quedaron fuera desde el inicio y conservaban la CLI global y la ruta de archive rota, asi que el criterio de aceptacion no se cumplia en esos dos harnesses.
- [x] 3.6 Neutralizar tambien la rama "If user chooses sync" y el guardrail que la autorizaba, que quedaban sin sujeto al retirar la opcion del prompt.
- [x] 3.7 Actualizar `.agents/instructions/core.md` con el comando y la regla de owner unico, y regenerar espejos con `npm run agent:harness:sync`.

## 4. Pruebas

- [x] 4.1 Crear `scripts/testOpsxArchive.mjs` con fixtures de delta y spec principal en `mkdtempSync`, sin red.
- [x] 4.2 Cubrir `pendiente`, `sincronizada`, `parcial` por mezcla y `parcial` por `MODIFIED` ausente.
- [x] 4.3 Cubrir la delta compuesta solo de `MODIFIED` presente, que debe clasificar `pendiente`.
- [x] 4.4 Cubrir los cuatro estados de `classifyRepositoryState`.
- [x] 4.5 Cubrir la guardia de rama protegida y de detached `HEAD` con ejecutor guionizado.
- [x] 4.6 Cubrir el aborto por `FAIL` del gate de readiness.
- [x] 4.7 Registrar `test:opsx-archive` en `package.json` y verificar que `npm run test:opsx-finish` sigue en verde.
- [x] 4.8 Demostrar no vacuidad por mutacion: invertir la neutralidad de `MODIFIED`, la inversion de `REMOVED` y la deteccion de `parcial` hace fallar la suite en los tres casos; el archivo restaurado coincide por `md5sum`.
- [x] 4.9 Cubrir `parseStatusEntries` tras la regresion detectada en el apply: leer `git status --porcelain` con `trim()` global desplazaba la primera ruta un caracter y convertia `openspec/...` en trabajo ajeno. La prueba fija ambas direcciones.

## 5. Documentacion

- [x] 5.1 Anadir a `Documentacion/02-operacion/OPENSPEC_CLI.md` la seccion de orden canonico con owner por paso.
- [x] 5.2 Documentar los tres estados de sincronizacion, el diagnostico de `parcial` y la reejecucion.
- [x] 5.3 Anadir a la tabla de errores frecuentes las entradas de `parcial`, rama protegida y estado no clasificable.
- [x] 5.4 Corregir la creencia sobre el checkout del CLI, nombrando `opsxFinishChange.mjs` como su origen real.

## 6. Validacion y evidencia

- [x] 6.1 Ejecutar `npm run test:opsx-archive`, `npm run test:opsx-finish`, `npm run openspec:check`, `npm run agent:harness:check`, `npm run agent:opsx:patch:check`, `npm run typecheck` y `npm run lint -- --quiet`; guardar salidas en `evidencia/`.
- [x] 6.2 Ejecutar `npm run opsx:archive:dry` sobre este mismo change y guardar la clasificacion como evidencia de uso real.
- [x] 6.3 Actualizar `readiness.json` con PR, revision adversarial y rutas de evidencia.
- [x] 6.4 Ejecutar la revision adversarial y resolver Blockers y Majors.
- [x] 6.5 Ejecutar `npm run openspec:ready:archive -- --change cierre-openspec-determinista --run-local` en `PASS`.
