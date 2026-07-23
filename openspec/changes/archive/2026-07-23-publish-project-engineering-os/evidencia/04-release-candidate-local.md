# Release candidate local

Fecha: 2026-07-23.

## Resultado

- `npm run check:package`: PASS.
- `npm run check:neutrality`: PASS.
- `npm run check:docs`: PASS; 11 enlaces directos del README.
- `npm run check:workflows`: PASS; tres workflows, acciones por SHA y sin `pull_request_target`.
- `npm test`: PASS; 119 tests antes de la fixture de export, sin fallos.
- `npm run pack:verify`: PASS; tarball instalado y ejecutado fuera del source.
- `npm run fixture -- --skip-install`: PASS; bootstrap desde tarball y segundo run sin drift.
- `npm audit --audit-level=high`: 0 vulnerabilidades.
- `npm publish --dry-run --ignore-scripts --loglevel=error`: PASS y sin warnings.
- `node scripts/check-version-available.mjs`: PASS; `0.1.0` no existe en npm.

El primer dry-run reveló que npm 11 normalizaba `./bin/project-os.mjs` y emitía warning. La metadata se
canonizó a `bin/project-os.mjs`, se regeneró el lockfile y el segundo dry-run quedó silencioso.

## Casos negativos

Las suites rechazan bin ausente, licencia incompatible, secreto simulado, término/ruta no neutral, runtime
duplicado, tarball alterado, colisión humana, estado futuro, GitHub no autenticado, superficie de PR
inesperada y fallo parcial.

## Identidad provisional

El dry-run previo al commit produjo `create-project-engineering-os-0.1.0.tgz` y comprobó un único
artefacto. Su checksum es provisional porque el commit final y la evidencia aún cambian; la identidad
publicable se regenerará una sola vez desde el merge protegido del upstream.

