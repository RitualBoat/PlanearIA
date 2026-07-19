# Cierre OpenSpec determinista: un solo owner para archive, sync y commit

- Issue: #113
- Capacidad: `opsx-change-closure`
- Superficies: harness, docs

## Why

El paso de archive es hoy el unico tramo del flujo SDD sin owner ni comando propio, y es el que
produjo rutas manuales distintas en tres cierres consecutivos (#84, #85, #112).

Tres defectos concretos, todos verificables por lectura del codigo:

1. **Dos sincronizadores para una misma escritura.** `openspec archive` aplica las deltas a las specs
   principales por si mismo (`dist/core/archive.js:375-386`), y la skill `openspec-sync-specs` aplica
   las mismas deltas a mano. Nada declara cual manda.
2. **El camino feliz documentado es el que rompe.** La skill de archive ofrece
   `"Sync now (recommended)"` antes de archivar (`.claude/commands/opsx/archive.md:63`). Al sincronizar
   primero, el CLI intenta aplicar las deltas otra vez y aborta en `dist/core/specs-apply.js:229`
   (`ADDED failed for header ... already exists`). Basta una sola requirement ADDED para garantizarlo.
3. **Nadie es owner del movimiento, la rama ni el commit.** La skill prescribe `mv` manual, que en esta
   maquina choca con un lock de Windows sobre `specs/`, mientras el CLI ya trae fallback copy+remove
   (`archive.js:415`). Ninguna herramienta verifica la rama antes de archivar ni commitea la salida, asi
   que `opsx:finish` aborta despues por arbol sucio y el operador improvisa.

Una correccion de creencia previa entra aqui como evidencia: el CLI de OpenSpec **no ejecuta git**. El
`checkout` a `development` que se le atribuia proviene de `scripts/opsxFinishChange.mjs:154`. Archivar
despues de `opsx:finish` deja la salida sin rastrear en una rama protegida; ese fue el fallo de #85.

## What

Un comando local `npm run opsx:archive` que es el unico owner del paso de archive, y la normalizacion
de los workflows generados para que dejen de prescribir la ruta rota.

El comando, en orden:

1. Verifica que `HEAD` no sea `main`, `master`, `development` ni detached, y aborta nombrando la rama.
2. Ejecuta `npm run openspec:ready:archive -- --change <name> --run-local` y se detiene ante `FAIL`.
3. Clasifica el estado de sincronizacion de cada delta en `pendiente`, `sincronizada` o `parcial`.
4. Invoca `openspec archive --yes`, con `--skip-specs` solo cuando la clasificacion es `sincronizada`.
   `parcial` aborta nombrando la requirement discrepante, sin escribir nada.
5. Consolida la salida en git y crea el commit canonico del archive.
6. Reejecutado sobre un change ya archivado y commiteado, sale con exito sin duplicar nada.

`scripts/patchOpsxWorkflows.mjs` gana un bloque idempotente que elimina la recomendacion de sincronizar
antes de archivar, sustituye el `mv` manual por el comando y declara el orden canonico. La normalizacion
va en el parcheador porque los archivos bajo `.claude/`, `.codex/`, `.cursor/`, `.opencode/` y
`.github/prompts/` se regeneran con `npm run agent:opsx:update`.

`Documentacion/02-operacion/OPENSPEC_CLI.md` declara el orden canonico y el owner de cada paso.
`scripts/testOpsxArchive.mjs` cubre los tres estados de sincronizacion, la guardia de rama, la
reejecucion y el fallo del gate, sin red ni GitHub, siguiendo el patron de `scripts/testOpsxFinish.mjs`.

## No objetivos

- No reemplazar OpenSpec ni reimplementar su sincronizador de specs.
- No editar specs archivadas ni la evidencia de #84, #85 o #112.
- No debilitar `checkOpenSpecReadiness.mjs` ni la revision adversarial.
- No modificar la espera de checks corregida en #96 ni ninguna otra logica de `opsx:finish`.
- No permitir push, commit ni merge directo sobre `development`.
- No actualizar la version fijada de la CLI de OpenSpec.
- No anadir un segundo comando de recuperacion ni una bandera que salte la clasificacion.
- No tocar producto, `src/`, backend, `src/sync`, datos, claves `@planearia:*` ni proyecto nativo.
- No crear ni modificar workflows de CI de entrega.
- No editar `AGENTS.md` ni `CLAUDE.md` a mano.
