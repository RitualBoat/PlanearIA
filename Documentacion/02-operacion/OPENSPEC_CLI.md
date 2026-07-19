# OpenSpec CLI reproducible

> Estado: vigente desde el change `normalizar-openspec-cli` (issue #49).
> Objetivo: todos los agentes y computadoras usan la misma CLI de OpenSpec sin instalar un comando global.

## Regla principal

La version oficial vive en `devDependencies` y `package-lock.json`. En una terminal normal usa los scripts npm o `npm exec --yes=false -- openspec`; no uses `openspec` bare, el paquete historico `openspec@1.5.0` ni una version `@latest` para ejecutar el flujo cotidiano. `--yes=false` hace que npm falle si falta la dependencia local en vez de buscar un fallback externo.

Prerequisitos:

- Node `>=20.19.0`.
- Ejecutar desde la raiz del repositorio.
- Instalar exactamente el lockfile con `npm ci`.

Verificacion inicial:

```bash
npm ci
npm run openspec:check
```

El segundo comando comprueba la version declarada, instalada y ejecutada; el requisito de Node; la lectura de `openspec/`; y la validez estricta de todos los changes y specs.

## Comandos diarios

| Necesidad | Comando |
|---|---|
| Diagnostico completo, no mutante | `npm run openspec:check` |
| Ver version fijada | `npm run openspec:version` |
| Listar changes | `npm run openspec:list` |
| Validar todo estrictamente | `npm run openspec:validate` |
| Cualquier subcomando no expuesto | `npm exec --yes=false -- openspec <subcomando>` |
| Regenerar workflows opsx | `npm run agent:opsx:update` |
| Comprobar normalizacion opsx | `npm run agent:opsx:patch:check` |
| Archivar un change terminado | `npm run opsx:archive -- <change>` (previsualiza con `npm run opsx:archive:dry -- <change>`) |
| Cerrar la rama del change por PR | `npm run opsx:finish` (previsualiza con `npm run opsx:finish:dry`) |

Ejemplo del flujo SDD:

```bash
npm exec --yes=false -- openspec new change "mi-change"
npm exec --yes=false -- openspec status --change "mi-change" --json
npm exec --yes=false -- openspec instructions proposal --change "mi-change" --json
npm exec --yes=false -- openspec validate "mi-change" --type change --strict --no-interactive
```

Los workflows generados de Claude, Codex, Cursor, Copilot y OpenCode ya usan esta misma forma local.

## Actualizar OpenSpec deliberadamente

No actualices la CLI dentro de una feature de producto. Hazlo en una issue/change propios y en una rama o worktree limpio.

1. Confirma que `git status --short` no muestre cambios ajenos.
2. Consulta la version objetivo y sus requisitos:

   ```bash
   npm view @fission-ai/openspec version engines --json
   ```

3. Fija la version aprobada, sin `^` ni `~`:

   ```bash
   npm install --save-dev --save-exact @fission-ai/openspec@X.Y.Z
   ```

4. Ejecuta el diagnostico y regenera:

   ```bash
   npm run openspec:check
   npm run agent:opsx:update
   npm run agent:opsx:patch:check
   ```

5. Revisa `git diff --name-only` y `git diff`. La regeneracion/normalizacion solo debe tocar las skills opsx bajo `.agents/` y los destinos conocidos bajo `.claude/`, `.codex/`, `.cursor/`, `.opencode/` y `.github/prompts/`, ademas de los archivos intencionales del change.
6. Valida el harness completo:

   ```bash
   npm run openspec:check
   npm run agent:harness:check
   npm run mcp:parity
   npm run agent:opsx:patch:check
   ```

7. Publica el diff como PR y espera sus checks. No mezcles una regeneracion masiva con cambios funcionales de la app.

OpenSpec 1.6.0 aun genera referencias a una CLI global y al comando continue inexistente. `scripts/patchOpsxWorkflows.mjs` corrige ambos defectos de forma idempotente despues de cada update y obliga a fallar si falta la CLI local.

## Orden canonico del cierre

El cierre tiene dos comandos y un owner por paso. No hay pasos manuales entre ellos.

| Paso | Owner | Comando | Efecto |
|---|---|---|---|
| Gate de readiness | `checkOpenSpecReadiness.mjs` | Lo invoca `opsx:archive` | Read-only; aborta el archive ante `FAIL` |
| Clasificacion de sincronizacion | `opsx:archive` | — | Decide si las deltas ya estan aplicadas |
| Escritura de specs principales | CLI de OpenSpec | Lo invoca `opsx:archive` | Unico escritor de `openspec/specs/` durante el archive |
| Movimiento a `archive/` | CLI de OpenSpec | Lo invoca `opsx:archive` | `moveDirectory`, con fallback copy+remove en Windows |
| Commit del archive | `opsx:archive` | — | Deja el arbol limpio en la rama del change |
| PR, checks y merge | `opsx:finish` | `npm run opsx:finish` | Nunca escribe local ni remotamente sobre el target |

Regla que resuelve el conflicto historico: **la CLI de OpenSpec es el unico escritor de las specs
principales durante el archive**. No ejecutes `/opsx:sync` antes de archivar un change que vas a
archivar en ese momento. La CLI aplica las mismas deltas y aborta al reencontrar una requirement
`ADDED` que ya existe. `/opsx:sync` solo es legitimo para actualizar specs a mitad de un change que
seguira activo.

### Los tres estados de sincronizacion

`opsx:archive` clasifica antes de escribir, por presencia de los encabezados `### Requirement:`, que es
el mismo criterio con el que la CLI decide abortar:

| Estado | Cuando | Que hace |
|---|---|---|
| `pendiente` | Ninguna operacion decisiva esta aplicada | `openspec archive --yes` (aplica las deltas) |
| `sincronizada` | Todas las operaciones decisivas ya estan aplicadas | `openspec archive --yes --skip-specs` |
| `parcial` | Mezcla de aplicadas y pendientes, o una operacion indeterminada | Aborta nombrando la requirement; no escribe nada |

Una operacion `MODIFIED` cuya requirement existe es **neutra**: aplicarla reemplaza el bloque completo,
asi que es idempotente y no distingue un estado del otro. Una delta compuesta solo de `MODIFIED`
clasifica como `pendiente` y deja que la CLI la aplique.

`parcial` aborta en vez de elegir porque ninguna rama es segura: aplicar las deltas falla a medias
dejando specs escritas, y omitirlas archiva declarando sincronizado algo que no lo esta. Resuelve la
spec principal para que la delta quede totalmente aplicada o totalmente sin aplicar, y repite.

### Reejecucion

`opsx:archive` clasifica el estado del repositorio antes de actuar, asi que repetirlo es seguro:

| Estado observado | Accion |
|---|---|
| Change activo y sin archivar | Ruta normal completa |
| Archivado y commiteado | No-op con exito; informa el commit |
| Archivado sin commitear | Consolida y commitea; no repite el archive |
| Activo y archivado a la vez | Aborta: archive interrumpido, resuelve cual es el bueno |

No existe una bandera para omitir la clasificacion. Una via de escape devolveria el indeterminismo que
este comando elimina.

Pruebas locales de esta logica: `npm run test:opsx-archive` (sin red ni git; cubre los tres estados de
sincronizacion, los cuatro de repositorio y el parseo de deltas).

## Cierre del change y espera de checks

`npm run opsx:finish` cierra la rama del change mediante PR hacia `development`. Nunca hace checkout, merge ni push directo sobre el target: publica la rama, crea o reutiliza el PR, espera los checks y ordena el merge a GitHub. Previsualiza con `npm run opsx:finish:dry`, que termina antes de esperar CI.

Antes de esperar checks, el cierre comprueba que GitHub ya refleje el push. La API del PR puede seguir
reportando el commit anterior durante unos segundos; atar `--match-head-commit` a ese OID obsoleto hace
que el merge falle con `Head branch was modified` aunque nadie haya tocado la rama. El cierre sondea
`headRefOid` hasta que coincide con `HEAD` local, limitado por `--head-deadline` (60s por defecto). Si no
coincide, aborta mostrando ambos commits y el PR queda sin mergear: no se relaja `--match-head-commit`,
que es la unica garantia de que se mergea exactamente lo que CI valido.

La espera de checks ocurre despues, en dos fases. GitHub registra los checks del commit recien empujado con unos segundos de retraso; durante esa ventana `gh pr checks` falla en vez de esperar, y `--watch` no lo cubre porque el error se produce antes de su bucle. La fase 1 sondea hasta que los checks aparecen; la fase 2 espera a que terminen, sin filtrar a los requeridos.

El `git checkout` a `development` que aparece en el reflog al final de cada change proviene de este
comando, no de la CLI de OpenSpec: `openspec archive` no ejecuta ninguna operacion git. Por eso
archivar despues de `opsx:finish` deja la salida sin rastrear en una rama protegida, y por eso
`opsx:archive` verifica la rama antes de escribir.

`gh` sale con codigo 1 tanto cuando el PR aun no reporta checks como cuando un check esta en rojo, asi que el cierre clasifica por el par (codigo de salida, mensaje de error):

| Estado | Como se detecta | Que hace el cierre |
|---|---|---|
| Aprobados | exit 0 | Continua al merge |
| Pendientes | exit 8 | Espera a que terminen |
| Aun no registrados | exit 1 con el mensaje de checks no reportados | Reintenta hasta el deadline |
| Fallidos | cualquier otra terminacion distinta de cero | Aborta sin mergear |

Un mensaje de error no reconocido cuenta como fallo y aborta. Es deliberado: si `gh` cambia su texto, el cierre se detiene en vez de mergear sin checks.

| Bandera | Default | Para que |
|---|---|---|
| `--checks-deadline <segundos>` | 120 | Limite del sondeo. `0` fuerza una sola consulta (comportamiento previo al sondeo). |
| `--checks-interval <segundos>` | 5 | Espera entre consultas del sondeo. |
| `--head-deadline <segundos>` | 60 | Limite de la espera a que GitHub refleje el push en el PR. |

Si el sondeo se agota, el cierre aborta nombrando PR, commit, tiempo esperado y que revisar, y el PR queda sin mergear. La ausencia de checks nunca se interpreta como checks aprobados. Ante ese diagnostico: confirma en `<url del PR>/checks` que los workflows aplican a `development`, y sube `--checks-deadline` solo si CI tarda mas en arrancar. Un PR hacia `development` siempre deberia reportar los checks requeridos (`TypeScript`, `ESLint`, `Jest`, `Backend smoke`); que no aparezcan indica un problema de CI, no del cierre.

Pruebas locales de esta logica: `npm run test:opsx-finish` (sin red ni procesos; cubre checks tardios, timeout y checks fallidos).

## Errores frecuentes

| Mensaje/sintoma | Accion |
|---|---|
| `openspec` no se reconoce | Es esperado para el comando global; usa `npm exec --yes=false -- openspec ...` o un script npm. |
| Falta el paquete local | Ejecuta `npm ci`. |
| Version instalada distinta | No uses `npm install` sin revisar; restaura con `npm ci`. |
| Node menor que el requerido | Instala Node 20.19 o superior y vuelve a ejecutar `npm ci`. |
| `openspec validate` falla | Ejecuta `npm run openspec:validate` y corrige el change/spec indicado; el check no lo modifica. |
| Patch check falla | Ejecuta `npm run agent:opsx:update`, revisa el diff y repite el check. |
| `opsx:archive` aborta: sincronizacion parcial | La spec principal tiene solo una parte de la delta aplicada. Completa o revierte esa parte segun las requirements que nombra el diagnostico y repite. No se escribio nada. |
| `opsx:archive` aborta: rama protegida o detached HEAD | Archiva desde la rama del change. Si ya ejecutaste `opsx:finish`, vuelve a la rama antes de archivar. |
| `opsx:archive` aborta: cambios sin commitear fuera de `openspec/` | Commitea o guarda ese trabajo; el commit del archive no debe arrastrarlo. |
| `opsx:archive` aborta: change activo y archivado a la vez | Un archive quedo a medias. Decide cual directorio conservar y elimina el otro antes de repetir. |
| `openspec archive` aborta: `ADDED ... already exists` | Sintoma de haber sincronizado antes de archivar. Usa `npm run opsx:archive`, que clasifica el estado y elige la invocacion correcta. |
| `opsx:finish` aborta: hay cambios sin commitear | Ejecuta `npm run opsx:archive -- <change>` antes; es el owner del commit del archive. |
| `opsx:finish` aborta: el PR no reporto checks | Revisa `<url del PR>/checks` y que los workflows apliquen a `development`. Sube `--checks-deadline` solo si CI tarda mas en arrancar; el PR queda sin mergear. |
| `opsx:finish` aborta: el PR reporta un commit distinto al local | GitHub aun no refleja el push, o alguien mas empujo a la rama. Compara los dos commits del diagnostico; si solo es retraso, repite el cierre o sube `--head-deadline`. |
| `opsx:finish` aborta: GitHub rechazo el merge | La rama avanzo entre la validacion y el merge. Revisa el PR y repite el cierre. |
| `opsx:finish` aborta: los checks fallaron | Corrige la CI en rojo y vuelve a ejecutar. El cierre no reintenta checks fallidos ni relanza workflows. |

## Rollback seguro

Si una actualizacion produce un diff inesperado, no la mezcles con trabajo existente. Conserva primero cualquier cambio propio, vuelve al commit anterior de la rama dedicada o elimina el worktree fallido, y repite con la version previamente fijada. Si el cambio ya fue commiteado, usa un commit de revert para mantener historia auditable; no uses `git reset --hard`.
