# Revisión adversarial final

**Alcance:** issue #126 y change `publish-project-engineering-os`, revisado después de apply desde un
contexto limpio respecto de la planificación inicial.

**Superficies contrastadas:** paquete público v0.1.4, release/provenance npm y GitHub, fixtures externas,
migración consumidora de PlanearIA, harness, OpenSpec, deuda, CI y documentación.

## Intentos de refutación y resultado

| Severidad | Intento | Evidencia | Resultado |
| --- | --- | --- | --- |
| Major corregido | Un tarball con CRLF podía pasar la verificación de EOL. | Upstream #4/#5, release v0.1.2 y evidencia 09. | Corregido; la prueba de empaquetado rechaza el falso PASS. |
| Major corregido | `upgrade --check` podía decir IN_SYNC mientras un `sync --check` posterior cambiaba state. | Upstream #6/#7, release v0.1.3 y evidencia 10. | Corregido; fixture 0.1.1 -> 0.1.3 queda IN_SYNC en ambos checks y rollback vuelve íntegramente a 0.1.1. |
| Major corregido | Un feature que captura deuda preexistente podía bloquearse al activar la pausa correcta; el handoff podía omitir el issue por consistencia eventual. | Upstream #8/#9, release v0.1.4 y evidencia 11. | Corregido; feature registra evidencia y cierra, remediation conserva el gate estricto, y el backref se persiste desde la URL creada. |
| Major descartado | PlanearIA podía retener una segunda fuente editable del runtime. | Paquete exacto 0.1.4, scripts `project-os`, prueba contractual y ausencia de `tools/project-constructor`/`tools/debt-control`. | No reproducible. El upstream gobierna el runtime; PlanearIA conserva contratos de consumidor. |
| Major descartado | Release/npm podía no corresponder al tag/artefacto probado. | GitHub Release v0.1.4, workflow 30043434297, provenance SLSA, SHA-256 `9f5096abf42ab178d1231e20fd3c84652ccdf864874495f97d4ea4cfa9e92e4a`. | No reproducible. |
| Minor capturado | El full baseline de React Doctor conserva 11 errores reales de UX/UI. | React Doctor 0.9.1 full del 2026-07-23: 11 errores, 199 warnings; input de assessment adjunto. | Tres candidatos `technical-debt` confirmados y encaminados al plan UX/UI. No son regresión de este change: scope changed obtiene 100/100. |
| Gate manual resuelto | La reserva npm 0.0.0 debía quedar deprecada y la sesión local revocada. | `npm view` devuelve el mensaje de deprecación; `npm whoami` devuelve `ENEEDAUTH`. | PASS; evidencia 11. |

## Controles que no aceptan falso verde

- El paquete se verifica desde el registry y desde el tarball contra la release, no por la existencia de
  archivos locales.
- El fixture ejecuta bootstrap repetido, `sync --check`, `upgrade --check`, `upgrade --apply`, rollback y
  `npm ci` repetido; no infiere idempotencia de una sola ejecución.
- Doctor, harness y CI separan disponibilidad, configuración, proceso y smoke autenticado.
- La deuda observada no se deja como narración: se captura con evidencia, presupuesto y issue de
  saneamiento del plan dueño.
- No se añadieron secretos, servicios pagados, Graphify, frameworks de producto ni dependencias de runtime
  a la Etapa A.

## Veredicto

**PASS.** No quedan Blockers ni Majors abiertos del change. Los tres Minors preexistentes se registran
mediante el Debt Control Loop y pausan solo el plan UX/UI; el plan constructor permanece activo. Los gates
restantes son los automáticos de archive, CI y finish.
