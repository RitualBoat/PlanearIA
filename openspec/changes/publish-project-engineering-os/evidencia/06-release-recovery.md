# Recuperación de la primera release

Fecha: 2026-07-23.

## Estado observado

- Tag inmutable: `v0.1.0` → `5532f76425e03b4217306d62c2ac140a8fbc67d2`.
- Run: `https://github.com/RitualBoat/project-engineering-os/actions/runs/30036132915`.
- Build exacto: PASS.
- GitHub Release, tarball, manifest y checksum: PASS.
- npm Trusted Publishing: FAIL antes de publicar.
- Registry: `0.1.0` ausente; no hubo paquete parcial en npm.

Tarball retenido como evidencia:

- asset: `create-project-engineering-os-0.1.0.tgz`;
- SHA-256: `2e67262e06be595c393e2581f29a6f84c2f88d61cd2b30667a5f4fd07a2e760b`.

## Causa

El workflow llamó `npm publish release/*.tgz`. npm interpretó el argumento relativo sin `./` como
shorthand GitHub y ejecutó un `git ls-remote` contra un repositorio inexistente. Terminó con exit 128 antes
de subir el tarball.

## Clasificación

- Severidad: Major pre-release.
- Categoría: defecto verificable del workflow.
- Deuda nueva: no se acepta; se corrige dentro del mismo flow antes de cierre.
- Secretos: ninguno expuesto.

Los warnings adicionales indicaron que las Actions v4 basadas en Node 20 estaban siendo forzadas a Node
24 por el runner. No bloquearon el build, pero se corrigen en el mismo patch para conservar tests
silenciosos y evitar una futura retirada.

## Recuperación elegida

- `v0.1.0` y sus assets no se mueven ni sobrescriben.
- La release se marcó prerelease y documenta que no debe consumirse.
- `v0.1.1` corrige el path a `./release/*.tgz`.
- GitHub Release pasa a ser idempotente: si ya existe, compara tarball, manifest y checksum byte por byte.
- Actions se actualizan a releases actuales fijadas por SHA.
- La verificación de provenance reintenta de forma acotada la propagación del registry.
- PR de recuperación: `https://github.com/RitualBoat/project-engineering-os/pull/3`.

## Validación local del patch

- `npm run check`: PASS, 122/122.
- `npm run pack:verify`: PASS.
- `npm publish --dry-run`: PASS.
- `create-project-engineering-os@0.1.1`: disponible antes del publish.
- Export canónico PlanearIA/upstream: PASS, hash
  `60759e9bca1a2e7072b275b37399bec3387c956db5a39872319acda92daad823`.

## Condición de cierre

No continuar con la migración consumidora hasta que `v0.1.1` tenga GitHub Release, npm artifact,
checksum y provenance verificables y el PR #3 haya pasado toda la matriz obligatoria.
