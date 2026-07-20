# Revisión adversarial pre-apply

**Alcance:** issue #126 y change `publish-project-engineering-os`.

**Fuentes:** proposal, design, cuatro delta specs, tasks, TLDR, baseline, readiness, specs vigentes del
constructor y documentación oficial de npm/GitHub consultada el 2026-07-20.

Esta revisión evalúa arquitectura y especificación antes de apply. No sustituye la revisión adversarial
independiente de la implementación requerida antes de archive.

## Alineación spec/tareas

- El issue exige upstream público, npm/npx, MIT, PRs de actualización, tres SO y contribuciones.
- Proposal y specs separan distribución upstream de actualización consumidor.
- Tasks conserva gates manuales antes de crear repo, autenticar o publicar.
- Readiness no incluye referencias ficticias a PR, fixtures o revisión final todavía inexistentes.

## Hallazgos

| Severidad | Área | Hallazgo | Evidencia | Resolución |
| --- | --- | --- | --- | --- |
| Major | Branch protection | El diseño original importaba todo mediante el único push directo; eso dejaba el release inicial fuera de PR protegido. | D1/D5 y scenario `Commit inicial`. | Corregido: seed mínimo, protección inmediata y export completo por `feat/initial-release` con CI/PR. |
| Major | Fuente de verdad | Archivar specs en PlanearIA podía interpretarse como mantener dos owners junto al upstream. | DDD técnico y deltas `project-constructor-*`. | Corregido: upstream gobierna evolución; PlanearIA conserva contrato consumidor fijado a una release y solo lo actualiza al adoptar. |
| Major | Licencias | MIT del paquete no definía si imponía la misma licencia al producto generado. | Package/blueprint copia archivos administrados. | Corregido: notice MIT separado para superficies derivadas; `LICENSE` y código del producto permanecen bajo decisión del consumidor. |
| Minor | Contribución | Un escenario mencionaba DCO sin que el owner lo hubiera decidido. | Spec de distribución. | Corregido a términos de contribución/licencia neutrales. |
| Pregunta | Copyright | Falta fijar el texto exacto de copyright de LICENSE/NOTICE. | Design Open Questions. | Gate previo a publicación; propuesta: `Copyright (c) 2026 RitualBoat contributors`. |
| Pregunta | npm bootstrap | La primera publicación puede requerir credencial temporal antes de configurar trusted publishing. | Documentación npm vigente. | Gate manual, revocación posterior y fallo seguro sin fallback persistente. |

## Comprobaciones de refutación

- El package con dos bins usa aliases del mismo entrypoint; npm puede inferirlo para `npx`.
- Trusted Publishing exige repositorio/workflow coincidentes, runner hospedado y OIDC; no se asume
  soporte self-hosted.
- El tarball se empaca una vez y se publica por archivo para evitar reconstrucción divergente.
- `--open-pr` es opt-in y no autentica, aprueba o mergea.
- El seed no se trata como release y la matriz completa se exige antes del tag.
- No hay UI, datos, backend, sync o IA; sus perfiles permanecen fuera de alcance.

## Veredicto

**PASS para revisión humana de apply.**

Blockers abiertos: 0. Majors abiertos: 0. Minor abiertos: 0. Preguntas/gates: 2.

**Archive no es aconsejable:** no existe implementación, PR, fixture nueva, publicación ni revisión
adversarial final. `readiness.json` debe seguir fallando el gate de archive hasta producir esa evidencia.
