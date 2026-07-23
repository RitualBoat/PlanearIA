# Migración consumidora de PlanearIA

Fecha: 2026-07-23.

## Cutover

- `create-project-engineering-os` está fijado exactamente a `0.1.4` en manifest y lockfile.
- `debt:*`, readiness y post-finish consumen el paquete público.
- `test:project-os-contract` verifica versión, dos bins, exports, help, bootstrap, segundo run, sync/check,
  doctor, debt check y los diez issues neutrales.
- La CI conserva la matriz Windows/macOS/Linux y ejecuta el smoke consumidor desde `npm ci`.
- `.agents/` permanece como fuente del harness específico de PlanearIA y quedó en paridad.
- `.project-os/debt/` conserva assessments y registro propios.
- Las copias editables `tools/project-constructor`, `tools/debt-control` y
  `tools/project-engineering-os` fueron retiradas después de verificar release, provenance y fixture.
- Una búsqueda activa fuera de artefactos históricos no encuentra referencias a esos runtimes.

## Hallazgo de seguridad durante instalación

`npm audit` incorporó GHSA-6g55-p6wh-862q para `postcss@8.4.49`, dependencia de
`@expo/metro-config@54.0.17`: 21 advisories = 1 high, 19 moderate, 1 low. La advisory afecta
`<=8.5.11`; 8.5.12 es la mínima parcheada.

Se fijó `postcss@8.5.22` mediante override deliberado. Es el mismo major, licencia MIT y engines
compatibles; cruza la restricción `~8.4.32` de Expo, por lo que exige validación completa. Resultado
inmediato:

- Expo sigue `54.0.36`;
- `expo install --check`: dependencies up to date;
- `npm ls`: una única `postcss@8.5.22 overridden`;
- audit: 20 = 0 high, 19 moderate, 1 low.

No se ejecutó `npm audit fix`, no se ocultó la advisory y no se subió Expo SDK.

## Rollback

La reversión de este cutover es un PR que revierte el commit de adopción y restaura temporalmente el
snapshot embebido desde Git. No borra assessments ni usa `git reset --hard`. Cuando exista una segunda
release sana, el rollback normal será fijar la anterior exacta y repetir smokes.

Ensayo ejecutado en worktree desechable desde el commit `3897d93`:

- `git revert --no-commit 3897d93` convergió exactamente al árbol padre;
- comparación completa contra `3897d93^`: cero diff;
- runtime restaurado: constructor 48/48 y debt-control 58/58;
- readiness integrado: PASS;
- la fixture se retiró con `git worktree remove`; no se alteró la rama del change.

El ensayo demuestra el contenido de una reversión por PR sin crear un falso rollback a `0.1.0`.
