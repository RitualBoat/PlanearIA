## 1. Linea base reproducible

- [ ] 1.1 Registrar la linea base del falso verde en la evidencia del change: salida de `npm run harness:doctor` (`PASS gitnexus`), de `npm run gitnexus:diagnose` (`Status: stale`, commit indexado y commit actual) y de `npm run gitnexus:verify` (`passed`) en el mismo checkout, con fecha y commit.
- [ ] 1.2 Capturar la salida literal de `gitnexus status` en estado stale y, tras un reindex, en estado fresco, para fijar las dos cadenas que el clasificador debe reconocer.
- [ ] 1.3 Medir y registrar la duracion de `gitnexus:diagnose` y de `gitnexus:verify` como linea base del costo declarado en el proposal.

## 2. Clasificador de frescura

- [ ] 2.1 Anadir a `scripts/gitNexusFts.mjs` un `classifyIndexFreshness(output)` exportado que devuelva `fresh`, `stale` o `unclassifiable` anclandose a la linea `Status:` y tolerando la decoracion del CLI.
- [ ] 2.2 Cubrir el clasificador en `scripts/testGitNexusFts.mjs` con las dos cadenas reales capturadas en 1.2, una salida vacia, una sin linea `Status:` y un caso donde la palabra de frescura aparezca fuera de esa linea (por ejemplo en una ruta) sin alterar la clasificacion.
- [ ] 2.3 Invertir `scripts/testGitNexusFts.mjs:19` para afirmar que `Status: stale` no es sano, conservando la ruta con espacios `C:\Planear IA\PlanearIA` como cobertura de Windows.

## 3. Verificacion estructural compartida

- [ ] 3.1 Extraer de `verify` una funcion exportada `runStructuralVerification(options)` que ejecute la consulta MVVM y el `impact` por UID reutilizando `verifyQueryResult` y `verifyImpactResult`, y devuelva un resultado clasificado en lugar de lanzar.
- [ ] 3.2 Reescribir `verify` sobre esa funcion conservando su guardia de archivos de agente (`findUnexpectedAgentChanges`) y su contrato de salida, sin moverlo a la funcion compartida.
- [ ] 3.3 Ejecutar `npm run test:gitnexus` y `npm run gitnexus:verify` antes y despues de la extraccion y comparar las salidas para demostrar que la refactorizacion no cambio el comportamiento.

## 4. Comprobacion GitNexus del doctor

- [ ] 4.1 Reescribir `checkGitNexus` en `scripts/harnessDoctor.mjs` para clasificar la frescura y reportar `FAIL` en `stale` y en `unclassifiable`, con la causa nombrada en el resumen.
- [ ] 4.2 Encadenar `runStructuralVerification` cuando la frescura sea `fresh` y reportar `FAIL` con el fixture no resuelto como causa cuando la consulta o el `impact` fallen.
- [ ] 4.3 Reportar `PASS` solo cuando frescura y verificacion estructural tengan exito, y redactar la remediacion como la secuencia `npm run gitnexus:repair` seguida de `npm run gitnexus:verify` sin ejecutarla.
- [ ] 4.4 Actualizar `harness-doctor.config.json` para que el manifest deje de expresar la salud como lista de fallos conocidos y conserve solo las firmas que siguen siendo alcanzables tras el cambio.
- [ ] 4.5 Verificar que la evidencia reportada por el check sigue normalizada y no expone rutas con credenciales ni tokens.

## 5. Recuperacion que si recupera

- [ ] 5.1 Cambiar el cuerpo de `repair` en `scripts/gitNexusFts.mjs` a `analyze --index-only --name PlanearIA .`, conservando `--index-only` como garantia de no inyeccion en archivos de agente.
- [ ] 5.2 Ejecutar en un checkout con indice stale la secuencia `npm run gitnexus:repair` y luego `npm run gitnexus:diagnose`, y registrar como evidencia que el indice queda `fresh` en el commit actual.
- [ ] 5.3 Ejecutar `npm run gitnexus:verify` tras la reparacion y registrar que FTS queda sano sin `--repair-fts`; si apareciera degradacion FTS, reincorporar la bandera y documentar la evidencia que lo justifica, segun D5 del design.
- [ ] 5.4 Confirmar con `git status --porcelain` que la reparacion no modifico `AGENTS.md`, `CLAUDE.md`, `.agents/` ni las skills generadas.

## 6. Fixtures del doctor

- [ ] 6.1 Anadir a `scripts/testHarnessDoctor.mjs` el caso de indice stale con resultado inyectado y afirmar `FAIL gitnexus` y `ok: false` en el veredicto agregado.
- [ ] 6.2 Anadir el caso de indice fresco cuyo fixture estructural no resuelve y afirmar `FAIL gitnexus`.
- [ ] 6.3 Anadir el caso de indice fresco y funcional y afirmar `PASS gitnexus`, para que una implementacion que siempre falle no pase la suite.
- [ ] 6.4 Anadir una asercion read-only que inspeccione los comandos invocados durante la comprobacion GitNexus y verifique que ninguno ejecuta `analyze`, reparacion ni reindexado.
- [ ] 6.5 Confirmar que ninguno de los casos nuevos lanza un proceso GitNexus real y que el caso sano existente sigue pasando.

## 7. Documentacion de agente

- [ ] 7.1 Corregir en `.agents/instructions/core.md` la descripcion del contrato de recuperacion para que refleje el reindex y la secuencia `repair` mas `verify`, sin editar `AGENTS.md` ni `CLAUDE.md` a mano.
- [ ] 7.2 Regenerar los espejos con `npm run agent:harness:sync`, revisar el diff resultante y dejar `npm run agent:harness:check` en paridad.

## 8. Validacion y cierre

- [ ] 8.1 Ejecutar `npm run test:gitnexus` y `npm run test:harness:doctor` y registrar sus salidas.
- [ ] 8.2 Ejecutar `npm run harness:doctor` con indice fresco y comprobar `PASS gitnexus`; repetir con indice stale forzado y comprobar `FAIL` con codigo distinto de cero, registrando ambas salidas.
- [ ] 8.3 Ejecutar `npm run typecheck` y `npm run lint -- --quiet`.
- [ ] 8.4 Ejecutar `npm exec --yes=false -- openspec validate --all --strict --no-interactive` y `npm run agent:harness:check`.
- [ ] 8.5 Registrar la duracion final del check `gitnexus` del doctor y compararla con la linea base de 1.3.
- [ ] 8.6 Completar `readiness.json` con issue, superficies, validaciones, evidencia, rollback y la referencia de la revision adversarial.
- [ ] 8.7 Ejecutar la revision adversarial con `/adversarial-review` y resolver Blockers y Majors antes de archivar.
- [ ] 8.8 Ejecutar `npm run openspec:ready:archive -- --change gitnexus-frescura-doctor --run-local` y resolver cada `FAIL`.
- [ ] 8.9 Actualizar `TLDR.md` si el alcance, los archivos, el comportamiento o el resultado esperado cambiaron durante el apply.
