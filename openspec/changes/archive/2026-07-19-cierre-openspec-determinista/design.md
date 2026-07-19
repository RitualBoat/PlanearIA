# Design: cierre OpenSpec determinista

## Contexto tecnico

El paso de archive lo ejecuta hoy un agente siguiendo instrucciones en prosa generadas por
`openspec update` y normalizadas por `scripts/patchOpsxWorkflows.mjs`. No hay ningun script que lo
represente, asi que no hay nada que probar, y cada agente reconstruye la secuencia desde la prosa.

`openspec archive` ya hace mas de lo que su nombre sugiere: valida el change, comprueba tareas
pendientes, **aplica las deltas a las specs principales** y mueve el directorio con un `moveDirectory`
que degrada a copy+remove ante `EPERM`/`EXDEV`. Lo unico que no hace es git: verificado por ausencia de
`checkout`, `commit`, `push`, `fetch` y `reset` en `dist/` fuera de `core/store/`, y por las
importaciones de `core/archive.js:1-7`.

## Decision 1: reutilizar el CLI, no reimplementarlo

El comando nuevo orquesta; no reescribe la sincronizacion ni el movimiento de archivos. La alternativa
(un sincronizador propio) fue descartada: duplicaria la semantica de merge de `specs-apply.js`, que ya
es sutil, y volveria a crear el defecto de origen, dos definiciones de la misma escritura derivando
entre si.

## Decision 2: clasificar la colision, no la equivalencia semantica

La pregunta que el comando necesita responder no es "estan iguales la delta y la spec", sino
**"aplicara `openspec archive` estas deltas sin abortar"**. Esa pregunta es completamente decidible por
presencia de encabezados `### Requirement:`, porque `buildUpdatedSpec` decide exactamente asi:

| Operacion | Aborta cuando | Estado si la spec principal... |
| --- | --- | --- |
| `ADDED X` | `X` ya existe (`specs-apply.js:229`) | contiene `X`: aplicada. no lo contiene: pendiente |
| `REMOVED X` | `X` no existe (`:200`) | no contiene `X`: aplicada. lo contiene: pendiente |
| `RENAMED A -> B` | `A` no existe o `B` ya existe (`:176`, `:179`) | tiene `B` sin `A`: aplicada. tiene `A` sin `B`: pendiente |
| `MODIFIED X` | `X` no existe (`:212`) | contiene `X`: neutra. no lo contiene: indeterminada |

`MODIFIED` es **neutra por ser idempotente**: `specs-apply.js:223` reemplaza el bloque entero por el de
la delta, asi que aplicarla dos veces da el mismo resultado. Ademas `findMissingCurrentScenarios`
(`:219`) ya protege contra perder escenarios. Por eso una delta compuesta solo de `MODIFIED` se
clasifica como `pendiente`: dejar que el CLI la aplique es seguro y conserva un unico owner.

La normalizacion de nombres replica `normalizeRequirementName` (`parsers/requirement-blocks.js:2`),
que es `name.trim()`. Se replica en vez de importarse porque `dist/core/parsers/` no es superficie
publica del paquete y una actualizacion del CLI podria moverla; la funcion es de una linea y la prueba
la fija.

### Los tres estados

- **`pendiente`**: ninguna operacion no neutra esta aplicada. Se ejecuta `openspec archive <name> --yes`.
- **`sincronizada`**: todas las operaciones no neutras estan aplicadas. Se ejecuta
  `openspec archive <name> --yes --skip-specs`.
- **`parcial`**: mezcla de aplicadas y pendientes, o cualquier operacion indeterminada. **Aborta**
  nombrando la capacidad, la operacion y la requirement, sin escribir specs ni mover el change.

`parcial` aborta en vez de elegir porque es el unico caso donde ambas ramas corrompen: aplicar deltas
falla a medias dejando specs escritas, y `--skip-specs` archiva declarando sincronizado algo que no lo
esta. Es el mismo criterio que #112 fijo para la frescura de GitNexus: lo no clasificable falla.

### Limite conocido de `--skip-specs`

En el estado `sincronizada`, el comando acepta la spec principal tal como quedo tras la escritura
manual, que puede diferir en formato de lo que el CLI habria producido. Es un tradeoff deliberado y
acotado: `sincronizada` es una **ruta de recuperacion** para changes que ya sincronizaron a mano, no el
camino normal, porque este change elimina la recomendacion de sincronizar antes de archivar.
`npm run openspec:validate` sigue corriendo despues y detecta una spec estructuralmente invalida.

## Decision 3: la guardia de rama precede a todo

`HEAD` en `main`, `master`, `development` o detached aborta antes de leer specs. Esa sola guardia
elimina la clase de fallo de #85 sin necesidad de diagnosticar por que se cambio de rama, y reutiliza
literalmente la lista `PROTECTED` y el criterio de `scripts/opsxFinishChange.mjs:75-78`. Las dos
guardias se mantienen coherentes porque el cierre completo exige ambas.

Diferencia deliberada con `opsx:finish`: `opsx:archive` **no** exige arbol limpio al entrar, porque su
trabajo consiste precisamente en producir cambios y commitearlos. Si exige que no haya cambios
preexistentes **fuera de `openspec/`**, para no arrastrar trabajo ajeno al commit del archive.

## Decision 4: el comando es el owner del commit

Tras el archive, el comando ejecuta `git add -A openspec/` y crea el commit con el mensaje canonico ya
presente en el historial (`1e156b5`, `9aa4ba5`, `b03b735`):

```text
docs(openspec): archivar <change> y sincronizar specs (#<issue>)
```

El numero de issue sale de `readiness.json` (`issue`), que el gate de archive ya exige. Sin owner del
commit, `opsx:finish` seguiria abortando por arbol sucio y el operador seguiria improvisando, que es
justo el tramo manual que este change elimina.

## Decision 5: idempotencia por estado observado, no por bandera

Reejecutar clasifica el estado del repositorio antes de actuar:

| Estado observado | Accion |
| --- | --- |
| `changes/<name>` existe, `archive/<fecha>-<name>` no | Ruta normal completa |
| `changes/<name>` no existe, archive existe y esta commiteado en `HEAD` | No-op con exito, informando el commit |
| `changes/<name>` no existe, archive existe sin commitear | Consolida y commitea; no reintenta el archive |
| Ambos existen | Aborta: estado no clasificable, probablemente un archive interrumpido |

No se anade `--force` ni `--skip-classification`. Una bandera de escape convertiria la clasificacion en
opcional y devolveria el indeterminismo por la puerta de atras.

## Decision 6: la normalizacion de workflows vive en el parcheador

`scripts/patchOpsxWorkflows.mjs` ya inyecta bloques delimitados por marcadores HTML de forma idempotente
y tiene modo `--check`. Se anade un bloque `PLANEARIA_CLOSURE_WORKFLOW` para el flujo archive y se
neutraliza el prompt `"Sync now (recommended)"` con una sustitucion dirigida, dentro del mismo trabajo
que el parcheador ya hace: corregir defectos de las plantillas upstream.

Editar los archivos generados a mano los perderia en el proximo `npm run agent:opsx:update`; por eso
`npm run agent:opsx:patch:check` es parte de la validacion de este change.

## Decision 7: pruebas sin red y con funciones puras exportadas

`scripts/testOpsxArchive.mjs` sigue el patron de `scripts/testOpsxFinish.mjs`: ejecutores guionizados y
reloj virtual donde aplique, fixtures en `mkdtempSync`. Se exportan como funciones puras
`classifySyncState(deltas, mainSpecs)` y `classifyRepositoryState(paths)`, de modo que los tres estados
de sincronizacion y los cuatro estados de repositorio se prueban sin invocar git ni el CLI.

Cobertura minima: `pendiente`, `sincronizada`, `parcial` por mezcla, `parcial` por `MODIFIED` ausente,
delta solo de `MODIFIED` clasificada como `pendiente`, rama protegida, detached `HEAD`, reejecucion
sobre archive commiteado, reejecucion sobre archive sin commitear, y `FAIL` del gate de readiness.

## Riesgos

| Riesgo | Mitigacion |
| --- | --- |
| Una actualizacion del CLI cambia la semantica de colision | La tabla de Decision 2 esta fijada en pruebas; un cambio upstream rompe la suite antes que un cierre real |
| `--skip-specs` acepta una spec sincronizada a mano con formato divergente | Ruta de recuperacion, no normal; `openspec:validate` corre despues |
| El bloque nuevo del parcheador colisiona con una plantilla upstream futura | Marcadores HTML propios y modo `--check` en la validacion |
| El commit automatico arrastra trabajo ajeno | El comando aborta si hay cambios sin commitear fuera de `openspec/` |
