# Release `v0.1.3` y convergencia de upgrade

## Hallazgo corregido

La prueba externa `0.1.1 -> 0.1.2` demostró una contradicción: `upgrade --check` devolvía `IN_SYNC`,
pero el `sync --check` normal devolvía `DRIFT` con cero archivos materiales y `state=update`. El upgrade
conservaba `sourceHash` de la release anterior en `package.json` y `package-lock.json`; el sync posterior
normalizaba esa metadata mediante una segunda mutación.

- Issue upstream: `https://github.com/RitualBoat/project-engineering-os/issues/6`.
- PR protegido: `https://github.com/RitualBoat/project-engineering-os/pull/7`.
- Merge: `5534fe3ad5c3ee524da9257133891b9d9f34ca76`.
- Corrección: el upgrade mantiene ownership `project`, pero registra `source` y `sourceHash` del
  blueprint destino desde la primera transacción.
- Regresión: exige que el sync normal y el upgrade check queden ambos `IN_SYNC` y `stateUpdate=false`.
- Suite: 123/123 local y matriz requerida Ubuntu, Windows y macOS con Node 20.20/22.22.

## Release pública

- Tag: `v0.1.3`.
- GitHub Release: `https://github.com/RitualBoat/project-engineering-os/releases/tag/v0.1.3`.
- Workflow: `https://github.com/RitualBoat/project-engineering-os/actions/runs/30041909646`.
- npm: `https://www.npmjs.com/package/create-project-engineering-os/v/0.1.3`.
- SHA-256 común: `b6520d4d1df55b2e356e149be87497c66ec12560c3d88a631c10934d928f8438`.
- Tamaño: 151956 bytes.
- Integridad npm:
  `sha512-0uz07CYrWN2/3hlkjfMX6bjGzQvdR4mz/md4zFZZ5B6CMAQzJ4bGqzbDY153+IIWT3kpYH53k5Ar1FDodE6fCg==`.
- Shasum npm: `48e2f17d99e01ab48bd5005a2ac55270eb8822fb`.
- npm expone provenance SLSA y el workflow no usa token persistente.

La descarga separada de GitHub Release y `npm pack create-project-engineering-os@0.1.3` produjo el
mismo tamaño y SHA-256.

## Upgrade y rollback externos

En la fixture desechable `project-os-fixture-v0.1.1`:

1. Se restauró verificablemente `0.1.1` en manifest, lockfile, instalación y state.
2. `npx --yes create-project-engineering-os@0.1.3 upgrade --target . --apply --json`: `APPLIED`,
   transacción `tx-2026-07-23T20-25-58-803Z-26d8bd02`.
3. `npm ci`: 0 vulnerabilidades.
4. `project-os sync --check`: `IN_SYNC`, cero create/update/delete/conflict y state estable.
5. `upgrade --check`: `IN_SYNC`.
6. Doctor: `PASS`, 12 PASS, 0 FAIL, 4 WARN y 13 SKIP explicados.
7. Rollback por la transacción: `ROLLED_BACK`, cuatro restauraciones.
8. Después de `npm ci`, manifest, lockfile, instalación y state volvieron exactamente a `0.1.1`.

El Major quedó corregido antes de adoptar la release. No se aceptó excepción ni se dejó como deuda
residual del constructor.
