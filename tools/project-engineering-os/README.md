# Project Engineering OS

Project Engineering OS prepara un repositorio nuevo con gobernanza, SDD, agentes, documentación
encontrable, control de deuda y validaciones reproducibles. No elige tu producto ni instala React,
Expo, bases de datos, proveedores cloud u otras dependencias de aplicación.

El paquete público es `create-project-engineering-os`; sus dos comandos (`create-project-engineering-os`
y `project-os`) ejecutan el mismo runtime.

## Inicio rápido: repositorio vacío

Requiere Git, npm y Node `^20.20.0 || >=22.22.0`.

```sh
mkdir mi-proyecto
cd mi-proyecto
git init
npx --yes create-project-engineering-os@0.1.1 bootstrap --target .
npm ci
npm exec --yes=false -- openspec init --tools codex,claude,cursor,github-copilot,opencode
npm run project-os:opsx:adapt
npm run project-os:check
npm run project-os:doctor
```

La versión explícita hace reproducible el bootstrap. Antes de usar `latest`, revisa el
[changelog](CHANGELOG.md). El bootstrap conserva cualquier `LICENSE` existente y no inventa una
licencia para el producto.

## Repositorio existente

Trabaja desde una rama y un árbol limpio:

```sh
npx --yes create-project-engineering-os@0.1.1 bootstrap --target . --dry-run
npx --yes create-project-engineering-os@0.1.1 bootstrap --target .
npm ci
npm run project-os:check
```

Una colisión humana se detiene antes de escribir. Los archivos se clasifican como administrados,
overlay humano, propiedad del proyecto o propiedad externa de OpenSpec; consulta
[ownership](docs/architecture/OWNERSHIP.md).

## Qué instala

- instrucciones universales y espejos para Codex, Claude Code, Cursor, OpenCode y GitHub Copilot;
- OpenSpec local fijado, readiness, DoR/DoD y ownership separado de OPSX;
- plantillas neutrales de issues, PR y diez issues de discovery en modo declarativo;
- doctor read-only humano/JSON con `PASS`, `FAIL`, `WARN` y `SKIP`;
- Debt Control Loop configurable, sin crear deuda a partir de warnings no verificados;
- perfiles de evidencia universales; los perfiles de producto siguen inactivos.

Empieza por la [guía del usuario](docs/USER_GUIDE.md) y el
[índice de documentación](docs/README.md). El Prompt 00 termina la Etapa A sin preguntar por el
producto; el Prompt 01 comienza discovery después de aprobación humana.

## Comandos

```sh
project-os bootstrap --target .
project-os sync --target . --check
project-os doctor --target .
project-os doctor --target . --json
project-os readiness-check --phase propose --issue 123 --target .
project-os readiness-check --phase archive --change mi-change --run-local --target .
project-os debt check --root .
project-os debt handoff --root . --plan mi-plan
project-os upgrade --target . --check
project-os upgrade --target . --apply
project-os upgrade --target . --apply --open-pr
project-os rollback --target . --transaction <id>
```

`doctor` y `upgrade --check` no instalan, autentican, reparan ni reindexan. `--open-pr` requiere
working tree limpio y `gh` autenticado; crea o reutiliza una rama y un PR, pero nunca aprueba o mergea.

## Deuda técnica

Cada cierre SDD captura un assessment, incluso cuando queda limpio. Los candidatos se verifican antes de
clasificarse. Blockers/Majors, excepciones vencidas, recurrencia o presupuesto agotado pausan únicamente
el plan dueño, salvo riesgo transversal crítico.

```sh
project-os debt capture --root . --flow mi-change --input assessment.json
project-os debt sync --root .
project-os debt check --root .
```

La política inicial es `seed-once`: el proyecto puede configurarla y las actualizaciones no la
sobrescriben. Lee [control de deuda](docs/DEBT_CONTROL.md).

## Actualización y recuperación

Usa siempre una versión destino explícita:

```sh
npx --yes create-project-engineering-os@0.2.0 upgrade --target . --check
npx --yes create-project-engineering-os@0.2.0 upgrade --target . --apply --open-pr
```

Cada mutación genera journal, hash y comando de rollback. Si una ejecución se interrumpe, repite el mismo
comando para reanudar o usa `project-os rollback --transaction <id>`. No borres journals ni uses
`git reset --hard`. La [guía de recuperación](docs/RECOVERY.md) está a un enlace.

## Seguridad, licencias y costo

El runtime usa licencia MIT. Las dependencias y notices están en
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). El núcleo no requiere servicios pagados. GitHub, npm y
OpenSpec conservan sus propios términos y límites; consulta [costos y lock-in](docs/COSTS_AND_LICENSES.md).

Reporta vulnerabilidades de forma privada según [SECURITY.md](SECURITY.md). Para contribuir, revisa
[CONTRIBUTING.md](CONTRIBUTING.md) y [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Alcance

Project Engineering OS es una base de trabajo, no una certificación de que el producto sea correcto,
seguro o listo para producción. MVVM, React, Expo, Playwright, offline/sync, IA y cloud son perfiles
condicionales que solo deben activarse después del discovery y una decisión versionada.
