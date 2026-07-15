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

## Errores frecuentes

| Mensaje/sintoma | Accion |
|---|---|
| `openspec` no se reconoce | Es esperado para el comando global; usa `npm exec --yes=false -- openspec ...` o un script npm. |
| Falta el paquete local | Ejecuta `npm ci`. |
| Version instalada distinta | No uses `npm install` sin revisar; restaura con `npm ci`. |
| Node menor que el requerido | Instala Node 20.19 o superior y vuelve a ejecutar `npm ci`. |
| `openspec validate` falla | Ejecuta `npm run openspec:validate` y corrige el change/spec indicado; el check no lo modifica. |
| Patch check falla | Ejecuta `npm run agent:opsx:update`, revisa el diff y repite el check. |

## Rollback seguro

Si una actualizacion produce un diff inesperado, no la mezcles con trabajo existente. Conserva primero cualquier cambio propio, vuelve al commit anterior de la rama dedicada o elimina el worktree fallido, y repite con la version previamente fijada. Si el cambio ya fue commiteado, usa un commit de revert para mantener historia auditable; no uses `git reset --hard`.
