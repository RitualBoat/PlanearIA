# Debt Control Loop

Un warning, TODO o scanner es un candidato, no deuda verificada. Cada cierre SDD produce un assessment
inmutable con resultado `clean` o candidatos clasificados.

Categorías: `defect`, `technical-debt`, `external-risk`, `decision-required`, `optional-improvement`,
`false-positive` y `duplicate`.

Disparan saneamiento: Blocker/Major verificado, riesgo transversal crítico, excepción vencida, cinco
flujos con deuda residual, el mismo hallazgo en tres flujos o presupuesto de cinco unidades. La pausa
afecta al plan dueño salvo riesgo transversal crítico. El issue de saneamiento es idempotente y exige
**NO GENERAR MÁS DEUDA TÉCNICA**.

`debt check` es read-only. `capture` y `sync` son las mutaciones explícitas. La configuración seed-once
permite modos GitHub `required`, `advisory` y `off`. Indisponibilidad nunca se presenta como PASS falso.

`debt handoff` recomienda continuar o cambiar de chat según el alcance/contexto y genera un prompt
redactado. Los assessments y excepciones no se borran como forma de recuperación.

