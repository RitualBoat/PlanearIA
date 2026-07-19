# Revision adversarial

**Alcance**: issue #113 / change `cierre-openspec-determinista`
**Fuentes**: `openspec/changes/cierre-openspec-determinista/` (proposal, design, spec delta, tasks),
diff de `fix/cierre-openspec-determinista` contra `development` (commits `244cb84`, `910cb2f`).

## Alineacion spec/tareas

Las cinco requirements ADDED del delta tienen implementacion identificable y cobertura:

- Owner unico y CLI como unico escritor: `scripts/opsxArchiveChange.mjs` delega en
  `openspec archive`; el parcheador retira la recomendacion de sincronizar y el `mv` manual de los
  9 workflows + 10 espejos incorporados.
- Tres estados de sincronizacion: `classifySyncState` y sus 14 aserciones.
- Guardia de rama: `opsxArchiveChange.mjs:102-105`, criterio identico a `opsxFinishChange.mjs:75-78`.
- Commit del archive y gate previo: `consolidate()` y la invocacion del gate antes de clasificar.
- Reejecucion: `classifyRepositoryState` con sus cuatro estados probados.

No objetivos respetados: `opsxFinishChange.mjs` y `prChecksWait.mjs` no aparecen en el diff;
`checkOpenSpecReadiness.mjs` tampoco; no hay bandera de escape de la clasificacion.

## Hallazgos

| Severidad | Area | Hallazgo | Evidencia | Arreglo |
|---|---|---|---|---|
| Major | Codigo | `consolidate()` hacia `git add -A -- openspec/`, asi que un segundo change en borrador dentro de `openspec/` habria entrado al commit del archive. La guardia de trabajo ajeno no lo cubre porque solo inspecciona rutas fuera de `openspec/`, y el design declara explicitamente la intencion contraria | `opsxArchiveChange.mjs` antes de `6e44b81`; design, Decision 3 | **Corregido** en `6e44b81`: se enumeran origen, destino y `openspec/specs`, y se filtran rutas inexistentes y no rastreadas |
| Major | Codigo | Al acotar el `git add`, una reejecucion cuyo borrado del origen ya estaba commiteado pasaria una ruta inexistente y no rastreada a `git add`, que es fatal | `git add -- <ruta>` falla con `pathspec did not match any files` | **Corregido** en `6e44b81` con el filtro de `archivePaths()` |
| Major | Codigo | `readGit` aplicaba `.trim()` a la salida completa de `git status --porcelain`, comiendose el espacio de estado de la primera linea. Con un archivo de `openspec/` en primera posicion, `openspec/...` se leia `penspec/...` y el comando abortaba declarando trabajo ajeno inexistente | Reproducido durante el apply; `parseStatusEntries` y su prueba | **Corregido**: parser dedicado sin trim, con prueba que fija ambas direcciones |
| Minor | Seguridad | `runNpm` usaba `shell: true` en Windows, que concatena argumentos sin escapar (Node DEP0190). El nombre del change ya estaba validado como kebab-case, asi que el vector estaba cerrado, pero la superficie sobraba | Warning DEP0190 en la salida del dry-run | **Corregido** en `910cb2f`: se nombra `npm.cmd` y se retira `shell` |
| Minor | Alcance | `.cursor/skills/` y `.opencode/skills/` no estaban en los destinos del parcheador desde antes de este change, asi que conservaban la CLI global y la ruta de archive rota. Sin incorporarlos, el criterio "los workflows ya no recomiendan sincronizar antes" no se cumplia en esos dos harnesses | `agent:opsx:patch:check` los reportaba con 4 y 9 motivos | **Corregido**: incorporados a `DIRS`; registrado en tasks 3.5 y en el baseline |
| Minor | Verificacion | `--skip-specs` acepta la spec principal tal como quedo tras una sincronizacion manual, que puede diferir en formato de lo que la CLI habria producido. No hay comprobacion de equivalencia, solo de colision | Design, "Limite conocido de `--skip-specs`" | Aceptado y declarado. Es ruta de recuperacion, no camino normal; `openspec:validate` corre despues |
| Pregunta | Gate ajeno | El gate compartido imprime el texto de fallo tambien en las lineas `PASS` (`PASS tldr: Falta TLDR.md en la raiz del change`), lo que hace su salida activamente confusa | `checkOpenSpecReadiness.mjs:92`, visible en `evidencia/03-dry-run-gate.txt` | **No se toca**: gate compartido, fuera de la superficie declarada. Se propone como issue de seguimiento |

## Intentos de refutacion que no prosperaron

- **"La clasificacion por presencia es mas debil que comparar contenido."** No para la pregunta que
  se hace. La CLI decide abortar exactamente por presencia (`specs-apply.js:176`, `:179`, `:200`,
  `:212`, `:229`), asi que la clasificacion predice el comportamiento real sin aproximarlo.
- **"`MODIFIED` neutra puede ocultar una desincronizacion."** Puede, pero aplicarla es idempotente
  (`specs-apply.js:223` reemplaza el bloque completo) y `findMissingCurrentScenarios` (`:219`) ya
  impide perder escenarios. La rama elegida es la unica que no depende de adivinar.
- **"Reejecutar podria duplicar el commit."** `consolidate()` comprueba el indice acotado antes de
  commitear y sale sin crear commit vacio; probado por los cuatro estados de repositorio.
- **"La guardia de rama duplica la de `opsx:finish` y pueden derivar."** Comparten criterio y lista,
  y el cierre completo exige ambas, asi que una divergencia se manifiesta en el mismo flujo.

## Veredicto

**PASS CON HUECOS**

Tres Majors detectados durante esta revision, los tres corregidos dentro del change y con prueba de
regresion en el caso del parser de `git status`. Los Minors restantes estan declarados: el limite de
`--skip-specs` es un tradeoff documentado en el design, y la salida confusa del gate compartido queda
como seguimiento fuera de esta superficie.

## Siguientes pasos antes de archivar

- Actualizar `readiness.json` con PR y esta revision.
- Abrir issue de seguimiento por el texto de fallo en lineas `PASS` de `checkOpenSpecReadiness.mjs`.
- Archivar con el propio `npm run opsx:archive`, que es la verificacion de uso real del comando.
