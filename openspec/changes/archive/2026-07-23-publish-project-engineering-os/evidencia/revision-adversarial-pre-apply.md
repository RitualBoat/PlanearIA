# Revisión adversarial pre-apply

**Alcance:** issue #126 y change `publish-project-engineering-os`.

**Fuentes:** proposal, design, seis delta specs, tasks, TLDR, baseline, readiness, specs vigentes, estado
real de ambos runtimes, PR #127 cerrado, Debt Control Loop archivado y documentación oficial vigente de
npm/GitHub.

Esta revisión evalúa arquitectura/especificación. No sustituye la revisión independiente posterior a apply.

## Alineación spec/tareas

- Las seis capabilities del proposal tienen delta spec.
- Las tareas cubren package único, stores, deuda, doctor, upgrade, docs, supply chain, upstream, npm,
  migración de PlanearIA, assessment y cierre.
- Mutaciones remotas ocurren después de release candidate y gates; propose no publica.
- Readiness conserva deliberadamente vacía la referencia de revisión final para impedir archive prematuro.

## Hallazgos

| Severidad | Área | Hallazgo intentado | Evidencia | Resolución |
| --- | --- | --- | --- | --- |
| Major | Ownership | Añadir debt-control podía crear un segundo paquete y otra versión. | Proposal, D3-D5, spec debt/distribution. | Corregido: un package/entrypoint; stores y schemas separados, sin segunda copia editable. |
| Major | Pérdida de evidencia | Rollback del constructor podía borrar assessments o reanudar planes por eliminación. | D4, D10, consumer-updates. | Corregido: assessments quedan fuera de borrado genérico; migración valida registro y rollback preserva historia. |
| Major | Supply chain | El diseño histórico no distinguía runtime consumidor de requisitos actuales de Trusted Publishing. | D7 y distribution/OIDC. | Corregido: consumidores Node 20/22; job de publicación Node >=22.14 y npm >=11.5.1, con preflight. |
| Major | Actions | Tags de actions son movibles y no bastan para release privilegiado. | D8, spec de workflows, tasks 6.2. | Corregido: SHA completo, permisos mínimos y separación PR/release. |
| Major | Falso verde | Repo/package o check ausente podía interpretarse como disponibilidad/éxito. | Distribution CI, tasks 6/7. | Corregido: nombres se revalidan; checks ausentes/skipped/cancelados/timeout fallan. |
| Major | Doble owner | Specs completas en upstream y PlanearIA podían gobernar el mismo runtime. | D13, governance ownership, task 8.6. | Corregido: upstream gobierna evolución; PlanearIA conserva contrato de aceptación fijado. |
| Pregunta | Legal | Copyright exacto aún no ha sido confirmado en el gate público. | D14/Open Questions. | Gate trazable antes de crear/publicar; no bloquea propose. |
| Pregunta | npm bootstrap | Trusted Publisher puede requerir que el package exista antes de configurarlo. | D7/Migration Plan. | Primera reserva interactiva aprobada como gate; cualquier credencial temporal se revoca. |
| Pregunta | Nombres | E404/no repo no reserva nombres. | Baseline. | Revalidación inmediata antes de mutación y pausa ante colisión. |

## Reglas adversariales

- No copia PlanearIA: allowlist y fixtures negativas bloquean dominio/paths/IDs.
- Config presente no significa operación: doctor y gates separan estado local, GitHub, OIDC y provenance.
- Bootstrap no instala producto ni crea deuda ficticia.
- No depende de un IDE/modelo/SO: AGENTS conserva núcleo y CI cubre tres SO.
- No genera múltiples fuentes: package único, upstream owner y retiro condicionado de copias.
- Ejecución parcial se recupera con journal/resume/rollback.
- Deuda humana no se convierte en changes ficticios; OAuth/publicación siguen gates.
- Graphify no se activa ni se exporta como requisito.
- Tests verdes no bastan: release exige identidad, checks, checksum, provenance, docs y evidencia remota.
- Costos, licencias, secretos y acciones están en gates explícitos.

## Veredicto

**PASS para iniciar apply, con tres preguntas/gates humanos abiertos y 0 Blockers / 0 Majors / 0 Minors.**

Archivar no es aconsejable: no existen todavía implementación pública, repo, PR upstream, release, npm,
provenance, migración consumidor, assessment ni revisión adversarial final.
