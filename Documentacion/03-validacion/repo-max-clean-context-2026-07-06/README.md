# Validacion: Repo Max Clean Context - 2026-07-06

## Estado

PASS. El repo conserva contexto minimo AI-friendly, el material pesado/legacy quedo externalizado en respaldo movido fuera del repo, CodeGraph ya no lista archivos bajo `context/`, y las validaciones principales pasan.

Issue SDD: https://github.com/RitualBoat/PlanearIA/issues/36
Project: `RitualBoat/1` (`PlanearIA Product OS`), agregado con `gh project item-add`.
Change OpenSpec: `repo-max-clean-context-externalization`.

## Backup Gate

Respaldo creado primero en `PLANEARIA_BACKUP_MOVE_OUT_2026-07-06/` y movido manualmente fuera del repo por el usuario antes de borrar material.

Contenido respaldado:

- `Documentacion/99-archivo/`
- `Documentacion/Ejemplo materia IHC/`
- `Documentacion/01-planes-maestros/cerrados/`
- validaciones historicas antiguas
- `openspec/changes/archive/`
- `context/OpenSpec/`
- `context/referencias-opensource/`
- `context/referencias-app-similares-a-planearia/`
- `context/infraestructura-ground-truth/`
- `context/planeaciones-reales/`
- `context/stitch-results/`
- `context/roadmap-context/`
- assets pesados de ground truth

Manifest del respaldo externo creado antes del traslado:

- `MANIFEST.md`
- `FILES_SHA256.tsv`
- 846 archivos
- 97.61 MB
- 48 archivos `context/referencias-opensource/**/source/**` recuperados desde `HEAD` dentro del backup, sin restaurarlos al repo

Verificacion posterior: `PLANEARIA_BACKUP_MOVE_OUT_2026-07-06/` no existe en la raiz del repo.

## Material Externalizado

Se retiro de Git el material cubierto por el respaldo externo. El repo conserva solo indices/stubs minimos en `context/`:

- `context/README.md`
- `context/OpenSpec/README.md`
- `context/chat-ground-truth/README.md`
- `context/classroom-ground-truth/README.md`
- `context/excel-ground-truth/README.md`
- `context/infraestructura-ground-truth/README.md`
- `context/planeaciones-ground-truth/README.md`
- `context/planeaciones-reales/README.md`
- `context/referencias-app-similares-a-planearia/README.md`
- `context/referencias-opensource/README.md`

Los stubs explican que el material completo existe en respaldo externo controlado por el usuario y debe solicitarse cuando haga falta.

## Comparacion Repo

| Metrica | Antes | Despues |
| --- | ---: | ---: |
| Archivos trackeados | 834 | 539 |
| Markdown trackeados | 184 | 103 |
| Archivos trackeados en `context/` | n/d | 10 |
| Archivos reales en `context/` | n/d | 10 |
| Bytes reales en `context/` | n/d | 5,688 |
| Candidatos legacy/context pesados trackeados | 321 | 0 material completo; quedan stubs minimos |

Evidencia: `pre-repo-baseline.txt`, `post-repo-baseline.txt`, `pre-folder-sizes.json`.

## Comparacion CodeGraph

| Metrica | Antes | Despues |
| --- | ---: | ---: |
| Files | 377 | 372 |
| Nodes | 4,607 | 4,607 |
| Edges | 11,965 | 11,965 |
| DB size | 15.89 MB | 15.89 MB |
| Files bajo `context/` | 2 manifests YAML | 0 |

Consultas ejecutadas antes y despues:

- sync / `src/sync`
- backend `aiGateway`
- Classroom
- Cuenta/accesibilidad
- trampa sobre `context/referencias-opensource`, `yft-canva` y `rishah-canvas`

Resultado de la consulta trampa post-cleanup: CodeGraph no devolvio codigo externo; priorizo tipos/contextos de PlanearIA (`types/index.ts`, `src/context/*`).

Evidencia: `pre-codegraph-*`, `post-codegraph-*`.

## Validacion Documental

- `ACTIVE_MARKDOWN_BROKEN_LINKS=0`.
- Las rutas canonicas de entrada existen: `README.md`, `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`, `backend/README.md`, `Documentacion/README.md`, `Documentacion/05-context-engineering/README.md`, `context/README.md`, `openspec/config.yaml`, `openspec/specs/ai-friendly-repository-context/spec.md`.
- `CORRUPTION_MATCHES=0` para mojibake/corrupciones conocidas.
- `DELETED_PATH_ACTIVE_REFS=0` para rutas externalizadas que podrian confundir a agentes.
- Findability IA PASS: una IA nueva encuentra flujo SDD, arquitectura, sync, IA, contexto minimo, validacion y spec principal desde las entradas canonicas.

Evidencia: `post-active-links.txt`, `post-doc-scans.txt`.

## Validacion Tecnica

| Comando | Resultado |
| --- | --- |
| `openspec validate --all --strict --json` | PASS |
| `npm run typecheck` | PASS, exit 0 |
| `npm run lint -- --quiet` | PASS, exit 0 |
| `git diff --check` | PASS, exit 0; solo warnings CRLF de Git en archivos ya modificados |

Nota: lint imprime aviso informativo de `baseline-browser-mapping` desactualizado; no es error de ESLint.

Evidencia: `validation-openspec-all-strict.json`, `validation-typecheck.txt`, `validation-lint-quiet.txt`, `validation-git-diff-check.txt`.

## Spec Y Cierre

El change fue archivado en `openspec/changes/archive/2026-07-06-repo-max-clean-context-externalization/`. `openspec list --json` devuelve `changes: []` y `openspec validate --all --strict --json` pasa despues del archive.

La delta spec se sincronizo en `openspec/specs/ai-friendly-repository-context/spec.md` con requisitos para:

- backup externo obligatorio antes de limpieza destructiva;
- contexto minimo en repo despues de externalizar;
- medicion CodeGraph antes/despues;
- evidencia auditable y archive limpio.

## Limitaciones Honestas

- CodeGraph bajo de 377 a 372 archivos porque antes ya estaba enfocado casi por completo en codigo PlanearIA; el beneficio fuerte esta en retirar manifests residuales bajo `context/`, reducir `git ls-files`, eliminar ruido documental y bajar el peso cognitivo para agentes.
- El respaldo externo no queda referenciado por ruta absoluta para evitar dependencia local; cuando una tarea necesite material completo, el agente debe pedirlo al usuario.
- Los avisos CRLF de Git no bloquean `git diff --check`; quedan documentados como warnings de normalizacion en Windows.

