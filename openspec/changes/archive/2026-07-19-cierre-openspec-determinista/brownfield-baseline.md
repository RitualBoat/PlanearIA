# Baseline brownfield: cierre-openspec-determinista

## Superficies tocadas

- `scripts/opsxArchiveChange.mjs` (nuevo): comando unico del paso de archive.
- `scripts/lib/openspecArchiveState.mjs` (nuevo): clasificacion pura de sincronizacion y de repositorio.
- `scripts/testOpsxArchive.mjs` (nuevo): suite sin red del comando y sus clasificadores.
- `scripts/patchOpsxWorkflows.mjs`: bloque de cierre y neutralizacion del prompt de sync.
- Workflows opsx regenerados bajo `.agents/skills/`, `.claude/commands/opsx/`, `.claude/skills/`, `.codex/skills/`, `.cursor/commands/`, `.cursor/skills/`, `.opencode/commands/`, `.opencode/skills/` y `.github/prompts/`.
- `.agents/instructions/core.md` y sus espejos generados `AGENTS.md` y `CLAUDE.md`.
- `package.json`: scripts `opsx:archive`, `opsx:archive:dry` y `test:opsx-archive`.
- `Documentacion/02-operacion/OPENSPEC_CLI.md`: orden canonico y owner por paso.
- `openspec/specs/opsx-change-closure/spec.md`: via delta, durante el archive.

## Fuentes de verdad actuales

- `openspec/specs/opsx-change-closure/spec.md`: contrato vigente del cierre por PR, fijado por #96.
- `openspec/specs/openspec-readiness-gates/spec.md`: contrato del gate de archive que el comando invoca.
- `scripts/opsxFinishChange.mjs`: implementacion vigente del cierre por PR y origen del criterio de rama protegida.
- `scripts/checkOpenSpecReadiness.mjs`: gate read-only de readiness, invocado sin modificarse.
- `node_modules/@fission-ai/openspec/dist/core/archive.js` y `dist/core/specs-apply.js`: semantica real de sincronizacion y movimiento que el comando delega.
- `Documentacion/02-operacion/OPENSPEC_CLI.md`: documentacion operativa vigente del CLI y del cierre.

## Comportamiento vigente

El paso de archive no tiene comando. Un agente lo ejecuta leyendo los workflows generados, que ofrecen
`"Sync now (recommended)"` antes de archivar y prescriben `mv` manual del directorio del change.
Sincronizar antes hace que `openspec archive` aborte en `specs-apply.js:229` al reencontrar una
requirement ADDED ya presente. El `mv` manual choca con un bloqueo de Windows sobre `specs/`, mientras
la CLI ya trae fallback copy+remove. Nadie verifica la rama antes de archivar ni crea el commit de la
salida, asi que `opsx:finish` aborta despues por arbol sucio. Reejecutar el archive falla con
`archive_target_exists` sin ruta de recuperacion.

## Comportamiento objetivo

`npm run opsx:archive` es el unico comando del paso. Verifica rama y trabajo ajeno, corre el gate de
readiness, clasifica la sincronizacion en `pendiente`, `sincronizada` o `parcial`, delega a la CLI el
archive con o sin deltas, aborta con diagnostico en `parcial`, consolida la salida y crea el commit
canonico. Reejecutarlo es no-op verificable o recuperacion segura. Los workflows generados nombran ese
comando y ya no recomiendan sincronizar antes ni mover carpetas a mano.

## Compatibilidad legacy

Los changes ya archivados no se tocan ni se reprocesan. La logica de espera de checks de `opsx:finish`
fijada por #96 permanece intacta y su suite sigue siendo criterio de aceptacion. El gate
`checkOpenSpecReadiness.mjs` se invoca sin modificarse y conserva su caracter read-only. La ruta manual
sigue siendo posible para un operador que la necesite: el comando no bloquea el uso directo de la CLI,
solo deja de recomendarlo. `--skip-specs` conserva el soporte de changes que ya sincronizaron a mano.

## Owner de spec y contexto

Capacidad `opsx-change-closure`, que hoy cubre el cierre por PR y pasa a cubrir tambien el paso de
archive que lo precede. Contexto operativo en `Documentacion/02-operacion/OPENSPEC_CLI.md`. Owner
humano: RitualBoat, via issue #113 en PlanearIA Product OS.

## Evidencia actual

- `git reflog`: `checkout: moving from feat/<rama> to development` al cierre de los seis changes recientes, siempre desde `opsxFinishChange.mjs:154`.
- Commits `1e156b5` (#85), `9aa4ba5` (#84) y `b03b735` (#112): los archives quedaron en su rama tras intervencion manual.
- `scripts/testOpsxFinish.mjs`: unica cobertura de ciclo de vida existente, limitada a la espera de checks.
- Bitacora del cierre de #85: `Permission denied` del `mv` sobre `specs/` en Windows.
- Ausencia de cobertura del paso de archive: no existe `test:opsx-archive` ni equivalente.
- `.cursor/skills/` y `.opencode/skills/` no figuraban en los destinos de `patchOpsxWorkflows.mjs`, asi que conservaban tanto la CLI global como la ruta de archive rota. Se incorporan aqui porque sin ellos el criterio de aceptacion no se cumple en esos harnesses.

## Fuera de alcance

Sincronizador propio de specs. Edicion de specs o evidencia archivadas. Cambios en la espera de checks
de #96 o en cualquier otra logica de `opsx:finish`. Relajacion de `checkOpenSpecReadiness.mjs` o de la
revision adversarial. Actualizacion de la version fijada de la CLI de OpenSpec. Push, commit o merge
directo sobre `development`. Bandera de escape que omita la clasificacion. Producto, `src/`, backend,
`src/sync`, datos, claves `@planearia:*` y proyecto nativo. Workflows de CI de entrega. Edicion manual
de `AGENTS.md` y `CLAUDE.md`.
