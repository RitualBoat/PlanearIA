# Runbook de bootstrap

## Preflight

1. Trabaja en la raíz Git y clasifica el working tree.
2. Usa la versión exacta declarada en `package.json`/lockfile.
3. Verifica Node `^20.20.0 || >=22.22.0` y npm.
4. En brownfield, ejecuta primero dry-run:

```sh
npx --yes create-project-engineering-os@<VERSION> bootstrap --target . --dry-run
```

## Instalación

```sh
npx --yes create-project-engineering-os@<VERSION> bootstrap --target .
npm ci
npm exec --yes=false -- openspec init --tools codex,claude,cursor,github-copilot,opencode
npm run project-os:opsx:adapt
```

OpenSpec es el único owner de sus workflows OPSX. El renderer general no los crea.

## Validación

```sh
npm run project-os:check
npm run project-os:doctor
npm run project-os:doctor:json
npm run project-os:github-plan
npm run project-os:bootstrap
npm run project-os:check
```

El segundo run debe producir cero drift inesperado. Doctor es read-only y distingue configuración,
startup, tool listing y smoke autenticado.

## Recuperación

Repite el mismo comando para reanudar una transacción compatible o ejecuta:

```sh
npm run project-os:rollback -- --transaction <id>
```

El rollback se detiene ante hashes posteriores. No borres journals, registros de deuda o trabajo humano;
no uses `git reset --hard`.

## Handoff

Termina antes del discovery. Presenta versión, transaction ID, PASS/FAIL/WARN/SKIP, recuperación, gates
manuales y evidencia. Después ofrece `PROMPT_01_DISCOVERY_PROYECTO` en un chat nuevo cuando convenga a la
sanidad del contexto.

