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

## Cierre del change y espera de checks

`npm run opsx:finish` cierra la rama del change mediante PR hacia `development`. Nunca hace checkout, merge ni push directo sobre el target: publica la rama, crea o reutiliza el PR, espera los checks y ordena el merge a GitHub. Previsualiza con `npm run opsx:finish:dry`, que termina antes de esperar CI.

La espera ocurre en dos fases. GitHub registra los checks del commit recien empujado con unos segundos de retraso; durante esa ventana `gh pr checks` falla en vez de esperar, y `--watch` no lo cubre porque el error se produce antes de su bucle. La fase 1 sondea hasta que los checks aparecen; la fase 2 espera a que terminen, sin filtrar a los requeridos.

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
| `opsx:finish` aborta: el PR no reporto checks | Revisa `<url del PR>/checks` y que los workflows apliquen a `development`. Sube `--checks-deadline` solo si CI tarda mas en arrancar; el PR queda sin mergear. |
| `opsx:finish` aborta: los checks fallaron | Corrige la CI en rojo y vuelve a ejecutar. El cierre no reintenta checks fallidos ni relanza workflows. |

## Rollback seguro

Si una actualizacion produce un diff inesperado, no la mezcles con trabajo existente. Conserva primero cualquier cambio propio, vuelve al commit anterior de la rama dedicada o elimina el worktree fallido, y repite con la version previamente fijada. Si el cambio ya fue commiteado, usa un commit de revert para mantener historia auditable; no uses `git reset --hard`.
