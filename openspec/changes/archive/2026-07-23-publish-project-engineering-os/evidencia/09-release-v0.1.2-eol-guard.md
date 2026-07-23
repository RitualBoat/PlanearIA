# Release `v0.1.2`, guardia EOL y fixture externa

## Hallazgo adversarial corregido

Un checkout Windows anterior a `.gitattributes` podía estar limpio para Git y conservar CRLF en rutas
canónicas. El empaquetado cambiaba bytes y SHA-256, mientras `pack:verify` declaraba `PASS`. Se clasificó
como Major por producir un verde falso y se corrigió antes de cerrar el change.

- Issue upstream: `https://github.com/RitualBoat/project-engineering-os/issues/4`.
- PR protegido: `https://github.com/RitualBoat/project-engineering-os/pull/5`.
- Merge: `4ccfa1a874a261f3612329ca133709a8e9770fac`.
- Corrección: preflight sobre `git ls-files --eol`; rechaza CRLF o EOL mixto donde Git exige LF,
  enumera rutas y recuperación, y conserva un caso negativo automatizado.
- Suite upstream: 123/123; matriz Ubuntu, Windows y macOS con Node 20.20/22.22 verde.

## Release pública

- Tag: `v0.1.2`.
- GitHub Release: `https://github.com/RitualBoat/project-engineering-os/releases/tag/v0.1.2`.
- Workflow: `https://github.com/RitualBoat/project-engineering-os/actions/runs/30039932616`.
- npm: `https://www.npmjs.com/package/create-project-engineering-os/v/0.1.2`.
- Trusted Publisher: GitHub Actions, workflow `release.yml`, environment protegido `npm-publish`.
- Provenance: npm expone attestations SLSA.
- SHA-256 GitHub/npm:
  `7070014e12ac484bbcda495fe3c33b1accd179bd710b10fa70e8e43ea5454d3a`.
- Tamaño: 151818 bytes.
- Integridad npm:
  `sha512-TD552JOCB3sblSzZwAf/aEpnBSVbyrfmgmCFlF40OScZWozzVIk+lB4cgtxruQg1Jidh0POWzB7L1mwIhIvkZw==`.
- Shasum npm: `156d812709f9228a4360ffd091c443d9ca66d308`.

La descarga independiente del asset GitHub y `npm pack create-project-engineering-os@0.1.2` produjeron
151818 bytes y el mismo SHA-256. La publicación no usó token persistente ni fallback secreto.

## Fixture desde un repositorio vacío

Ruta desechable:
`C:/Users/RitualBoatLaptop/Documents/Projects/project-os-fixture-v0.1.2`.

Resultado:

1. `npx --yes create-project-engineering-os@0.1.2 bootstrap --target ... --dry-run`: previsualización
   sin mutación.
2. Bootstrap real desde una caché npm nueva: `APPLIED`.
3. Dos `npm ci`: 0 vulnerabilidades y lockfile idéntico, SHA-256
   `4B063B64EC879E3522D17DDD188534AC76AB0F996AC18E39B3FE949186645085`.
4. OpenSpec `1.6.0` inicializó Codex, Claude Code, Cursor, GitHub Copilot y OpenCode.
5. Adaptación y checker OPSX: `PASS`.
6. Segundo bootstrap y `sync --check`: `IN_SYNC`, sin mutación ni drift.
7. Doctor: `PASS`, 12 PASS, 0 FAIL, 4 WARN explicados y 13 SKIP legítimos.
8. Debt check: `PASS`.
9. Payload declarativo: diez issues neutrales de discovery, sin framework ni producto.

Los WARN corresponden al working tree recién generado y a smokes remotos opt-in que el doctor no debe
inferir ni ejecutar. Los SKIP corresponden a perfiles inactivos, código aún inexistente y Graphify
retirado; ninguno se convirtió en PASS.
