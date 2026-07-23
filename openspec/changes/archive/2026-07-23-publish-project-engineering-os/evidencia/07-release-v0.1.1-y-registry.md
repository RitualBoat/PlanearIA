# Release pública `v0.1.1` y fixture desde registry

Fecha: 2026-07-23.

## Identidad y publicación

- Upstream: `https://github.com/RitualBoat/project-engineering-os`.
- Merge protegido: `cae44279f57d48bb1fa4a42682ae22c11eb82ac1`.
- Tag protegido: `v0.1.1`.
- GitHub Release: `https://github.com/RitualBoat/project-engineering-os/releases/tag/v0.1.1`.
- Workflow: `https://github.com/RitualBoat/project-engineering-os/actions/runs/30037017279`.
- npm: `https://www.npmjs.com/package/create-project-engineering-os/v/0.1.1`.
- SHA-256 común de tarball npm/GitHub/`SHA256SUMS`:
  `9a164870a923605b81c84d505a98e2f1d6eb85e34e40a3aa11e6b88d7cbcec22`.
- Tamaño: 151622 bytes.
- npm integrity:
  `sha512-VYg3dEkqa9ls9JXNWEQ/Y4NUivRqafkCWyyD2UxuPtsMzLHdBD6c4rr0l3ViZqlCuw51OX9UY8QFzlfrpe6DQA==`.
- npm shasum: `1eaa5654ad9574383cff77c8fc7ae42166e358d4`.

El build produjo un único tarball y los jobs de GitHub Release y npm consumieron ese artefacto. Una
descarga independiente de ambos canales confirmó igualdad byte a byte.

## Trusted Publishing y supply chain

- Tipo: GitHub Actions.
- Relación npm: `0b6b6c8e-49cd-49e4-8d42-bb03415bb4c3`.
- Repositorio: `RitualBoat/project-engineering-os`.
- Workflow: `release.yml`.
- Environment: `npm-publish`.
- Permiso: `publish`.
- Cuenta npm: `ritualboat`, 2FA `auth-and-writes` mediante WebAuthn.
- `dist.attestations.url` está presente.
- La attestation usa predicado SLSA provenance v1.
- `npm audit signatures`: 81 firmas de registry y 10 attestations verificadas en la fixture.

No se persistió ni imprimió token npm. La reserva mínima `0.0.0` contiene solo `LICENSE`, `README.md` y
`package.json`; su shasum es `f847de4b93bf623c14484ef1b3fb5fca79e9ad16`. Se depreca de forma
explícita; no se usa como rollback ni como release sana.

## Fixture externa real

Ruta desechable fuera de ambos repositorios:
`C:/Users/RitualBoatLaptop/Documents/Projects/project-os-fixture-v0.1.1`.

Resultados:

1. caché npm limpia y `npx --yes create-project-engineering-os@0.1.1 --version`: `0.1.1`;
2. primer bootstrap: `APPLIED`, 74 rutas administradas más state, cero colisiones;
3. paquete de discovery: exactamente 10 issues neutrales, de Visión a Primera entrega vertical;
4. segundo bootstrap antes de OPSX: `IN_SYNC`;
5. `sync --check`: `IN_SYNC`;
6. `npm ci` dos veces: ambas PASS, 82 paquetes auditados, 0 vulnerabilidades y hash del árbol
   `4fa52040b09917c1e07498fa670ac0e3348957eb69a255a7abbf1abe3f406f02` sin drift;
7. OpenSpec local inicializado para cinco herramientas y `opsx-adapt`: 25 bloques actualizados;
8. `opsx-check`, sync/check y debt check: PASS;
9. doctor: `verdict PASS`, 12 PASS, 0 FAIL, 4 WARN y 13 SKIP;
10. tercer bootstrap tras OPSX: `IN_SYNC`.

Los WARN corresponden a working tree aún no registrado y smokes opt-in no ejecutados. Los SKIP
corresponden a perfiles inactivos, MCP real, inteligencia de código sin código y Graphify retirado. No se
convirtieron en PASS.

## Rollback

`0.1.1` es la primera release sana disponible en npm. `0.1.0` conserva evidencia como prerelease GitHub,
pero no existe en npm y nunca se presenta como rollback. Hasta publicar una segunda release sana, un
consumidor revierte por PR el commit de adopción; después, fija la última versión sana exacta.
