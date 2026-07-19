## 1. Linea base reproducible

- [x] 1.1 Registrar la linea base del falso verde en la evidencia del change: salida de `npm run harness:doctor` (`PASS gitnexus`), de `npm run gitnexus:diagnose` (`Status: stale`, commit indexado y commit actual) y de `npm run gitnexus:verify` (`passed`) en el mismo checkout, con fecha y commit.
- [x] 1.2 Capturar la salida literal de `gitnexus status` en estado stale y, tras un reindex, en estado fresco, para fijar las dos cadenas que el clasificador debe reconocer.
- [x] 1.3 Medir y registrar la duracion de `gitnexus:diagnose` y de `gitnexus:verify` como linea base del costo declarado en el proposal.

## 2. Clasificador de frescura

- [x] 2.1 Anadir a `scripts/gitNexusFts.mjs` un `classifyIndexFreshness(output)` exportado que devuelva `fresh`, `stale` o `unclassifiable` anclandose a la linea `Status:` y tolerando la decoracion del CLI.
- [x] 2.2 Cubrir el clasificador en `scripts/testGitNexusFts.mjs` con las dos cadenas reales capturadas en 1.2, una salida vacia, una sin linea `Status:` y un caso donde la palabra de frescura aparezca fuera de esa linea (por ejemplo en una ruta) sin alterar la clasificacion.
- [x] 2.3 Invertir `scripts/testGitNexusFts.mjs:19` para afirmar que `Status: stale` no es sano, conservando la ruta con espacios `C:\Planear IA\PlanearIA` como cobertura de Windows.

## 3. Verificacion estructural compartida

- [x] 3.1 Extraer de `verify` una funcion exportada `runStructuralVerification(options)` que ejecute la consulta MVVM y el `impact` por UID reutilizando `verifyQueryResult` y `verifyImpactResult`, y devuelva un resultado clasificado en lugar de lanzar.
- [x] 3.2 Reescribir `verify` sobre esa funcion conservando su guardia de archivos de agente (`findUnexpectedAgentChanges`) y su contrato de salida, sin moverlo a la funcion compartida.
- [x] 3.3 Ejecutar `npm run test:gitnexus` y `npm run gitnexus:verify` antes y despues de la extraccion y comparar las salidas para demostrar que la refactorizacion no cambio el comportamiento.

## 4. Comprobacion GitNexus del doctor

- [x] 4.1 Reescribir `checkGitNexus` en `scripts/harnessDoctor.mjs` para clasificar la frescura y reportar `FAIL` en `stale` y en `unclassifiable`, con la causa nombrada en el resumen.
- [x] 4.2 Encadenar `runStructuralVerification` cuando la frescura sea `fresh` y reportar `FAIL` con el fixture no resuelto como causa cuando la consulta o el `impact` fallen.
- [x] 4.3 Reportar `PASS` solo cuando frescura y verificacion estructural tengan exito, y redactar la remediacion como la secuencia `npm run gitnexus:repair` seguida de `npm run gitnexus:verify` sin ejecutarla.
- [x] 4.4 Actualizar `harness-doctor.config.json` para que el manifest deje de expresar la salud como lista de fallos conocidos y conserve solo las firmas que siguen siendo alcanzables tras el cambio.
- [x] 4.5 Verificar que la evidencia reportada por el check sigue normalizada y no expone rutas con credenciales ni tokens.

## 5. Recuperacion que si recupera

- [x] 5.1 Cambiar el cuerpo de `repair` en `scripts/gitNexusFts.mjs` a `analyze --index-only --name PlanearIA .`, conservando `--index-only` como garantia de no inyeccion en archivos de agente.
- [x] 5.2 Ejecutar en un checkout con indice stale la secuencia `npm run gitnexus:repair` y luego `npm run gitnexus:diagnose`, y registrar como evidencia que el indice queda `fresh` en el commit actual.
- [x] 5.3 Ejecutar `npm run gitnexus:verify` tras la reparacion y registrar que FTS queda sano sin `--repair-fts`; si apareciera degradacion FTS, reincorporar la bandera y documentar la evidencia que lo justifica, segun D5 del design.
- [x] 5.4 Confirmar con `git status --porcelain` que la reparacion no modifico `AGENTS.md`, `CLAUDE.md`, `.agents/` ni las skills generadas.

## 6. Fixtures del doctor

- [x] 6.1 Anadir a `scripts/testHarnessDoctor.mjs` el caso de indice stale con resultado inyectado y afirmar `FAIL gitnexus` y `ok: false` en el veredicto agregado.
- [x] 6.2 Anadir el caso de indice fresco cuyo fixture estructural no resuelve y afirmar `FAIL gitnexus`.
- [x] 6.3 Anadir el caso de indice fresco y funcional y afirmar `PASS gitnexus`, para que una implementacion que siempre falle no pase la suite.
- [x] 6.4 Anadir una asercion read-only que inspeccione los comandos invocados durante la comprobacion GitNexus y verifique que ninguno ejecuta `analyze`, reparacion ni reindexado.
- [x] 6.5 Confirmar que ninguno de los casos nuevos lanza un proceso GitNexus real y que el caso sano existente sigue pasando.

## 7. Documentacion de agente

- [x] 7.1 Corregir en `.agents/instructions/core.md` la descripcion del contrato de recuperacion para que refleje el reindex y la secuencia `repair` mas `verify`, sin editar `AGENTS.md` ni `CLAUDE.md` a mano.
- [x] 7.2 Regenerar los espejos con `npm run agent:harness:sync`, revisar el diff resultante y dejar `npm run agent:harness:check` en paridad.

## 8. Validacion y cierre

- [x] 8.1 Ejecutar `npm run test:gitnexus` y `npm run test:harness:doctor` y registrar sus salidas.
- [x] 8.2 Ejecutar `npm run harness:doctor` con indice fresco y comprobar `PASS gitnexus`; repetir con indice stale forzado y comprobar `FAIL` con codigo distinto de cero, registrando ambas salidas.
- [x] 8.3 Ejecutar `npm run typecheck` y `npm run lint -- --quiet`.
- [x] 8.4 Ejecutar `npm exec --yes=false -- openspec validate --all --strict --no-interactive` y `npm run agent:harness:check`.
- [x] 8.5 Registrar la duracion final del check `gitnexus` del doctor y compararla con la linea base de 1.3.
- [x] 8.6 Completar `readiness.json` con issue, superficies, validaciones, evidencia, rollback y la referencia de la revision adversarial.
- [x] 8.7 Ejecutar la revision adversarial con `/adversarial-review` y resolver Blockers y Majors antes de archivar.
- [x] 8.8 Ejecutar `npm run openspec:ready:archive -- --change gitnexus-frescura-doctor --run-local` y resolver cada `FAIL`.
- [x] 8.9 Actualizar `TLDR.md` si el alcance, los archivos, el comportamiento o el resultado esperado cambiaron durante el apply.

## 9. Hallazgos de la revision adversarial

- [x] 9.1 Cerrar el hueco de `gitnexus:verify`, que aprobaba un indice stale pese a estar documentado como gate de salud: comprobar la frescura antes de los fixtures y cubrirlo con la salida real del CLI.
- [x] 9.2 Hacer inyectable el runner de `runStructuralVerification` y afirmar en pruebas que solo emite `query` e `impact`, para que la promesa read-only del doctor no dependa de una asercion que solo ve sus llamadas directas.
- [x] 9.3 Cubrir los desenlaces de fallo de la verificacion estructural (consulta vacia, diagnostico FTS, impact no exacto) y comprobar que no continua tras el primer fallo.
- [x] 9.4 Registrar en la spec los escenarios del gate de salud sobre indice stale y del conjunto de subcomandos de solo lectura.
- [x] 9.5 Verificar que ningun workflow de CI invoca `harness:doctor` ni `gitnexus:*`, de modo que el endurecimiento no rompe la entrega.
