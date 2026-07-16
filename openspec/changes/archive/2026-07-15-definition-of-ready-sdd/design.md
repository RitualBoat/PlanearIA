## Context

El repositorio ya dispone de `openspec:check` para la CLI y artefactos, `agent:harness:check` para espejos project-owned, `agent:opsx:patch:check` para workflows generados y `harness:doctor` para salud global. Ninguno enlaza un issue enriquecido con un change ni verifica que el cierre incluya matriz proporcional, evidencia, rollback y excepciones trazables. El change debe respetar que los workflows opsx pertenecen a la CLI y solo se normalizan mediante `scripts/patchOpsxWorkflows.mjs`.

El gate se usará antes de crear un change (`propose`) y antes de archivarlo (`archive`). No toca UI ni datos docentes; su matriz aplica a cambios futuros que sí los toquen.

## Goals / Non-Goals

**Goals:**

- Ofrecer un único checker Node, local y read-only con fases `propose` y `archive`.
- Validar datos verificables, mostrar `PASS`, `FAIL` o `EXCEPTION` y dar una remediación por campo.
- Mantener un contrato pequeño y versionado: metadata de pre-propose en el issue enriquecido y `readiness.json` en la raíz del change para el cierre.
- Exigir perfiles de validación por superficie (`docs`, `harness`, `ui`, `sync`, `ia`, `backend`) sin ejecutar comandos arbitrarios del manifest.
- Propagar la guía desde `.agents` y el parche post-update, conservando el flujo actual de OpenSpec y la paridad de harness.

**Non-Goals:**

- No reemplazar decisiones humanas, evidencias visuales, revisión adversarial ni el control de Project/PR.
- No hacer del doctor del harness un gate por change ni conectar este checker a CI u `openspec:check` en esta entrega.
- No aplicar, archivar, crear issues, autenticar ni modificar archivos desde el checker.

## Decisions

### 1. Checker dedicado con fases explícitas

`scripts/checkOpenSpecReadiness.mjs` recibirá `--phase propose --issue <n>` o `--phase archive --change <name>`. La fase `propose` consultará el issue con `gh issue view --json` en modo lectura; la fase `archive` leerá únicamente el directorio resuelto del change y ejecutará validaciones locales fijas cuando se solicite `--run-local`.

Se elige un checker separado en vez de extender `harnessDoctor.mjs`: el doctor declara que el entorno puede iniciar trabajo, mientras este gate decide si un issue/change concreto puede avanzar. Reutilizará los scripts existentes por identificador, no duplicará sus validaciones.

### 2. Dos manifestos pequeños, JSON estricto

El enrich añadirá al issue un bloque JSON delimitado y oculto (`openspec-readiness:pre-propose`) con nombre del change, tipo de ejecución, dependencias, método de contexto, superficies, intervención manual y excepciones. Al proponer se crea `readiness.json` junto a `proposal.md`, `design.md`, `tasks.md` y `TLDR.md`, con `schemaVersion`, issue, change, superficies, validaciones requeridas, enlaces de evidencia, rollback y excepciones.

JSON permite parseo nativo de Node y fixtures sin una dependencia YAML. El checker rechazará JSON inválido, campos desconocidos críticos, rutas fuera de `openspec/changes`, `issue` que no coincide y manifestos que no indican su versión.

### 3. Excepciones visibles, temporales y acotadas

Cada excepción usará `{ field, reason, owner, approvedBy, expiresOn, recovery }`. Solo podrán eximir campos explícitamente permitidos, como evidencia manual aún pendiente o acceso temporal al Project; identidad del issue, nombre del change, integridad de artefactos, tareas pendientes y excepciones vencidas no son eximibles. El reporte mostrará `EXCEPTION`, conservará el motivo y terminará con cero únicamente si no hay `FAIL`.

Esto evita bloquear un caso justificado sin convertir el mecanismo en un bypass silencioso. La alternativa de aceptar texto libre o `N/A` se descarta porque no es comprobable ni tiene caducidad.

### 4. Perfil estático de validación, no comandos del manifest

Una tabla interna asignará a cada superficie los identificadores de validación, comandos locales permitidos y evidencia manual requerida. El manifest declara superficies e IDs; no puede inyectar comandos. `--run-local` ejecutará únicamente comandos de esa tabla y sanitizará su salida. UI conservará evidencia humana de HTTP 200, Playwright por breakpoint y Nielsen; sync, IA y backend conservarán sus escenarios obligatorios como evidencia además de sus comandos fijos.

Esta decisión reduce riesgo de ejecución arbitraria y mantiene la validación proporcional. La alternativa de confiar en un campo `status: passed` no demuestra ninguna ejecución; la alternativa de forzar todos los comandos en CI elevaría costo y bloquearía antes de estabilizar el flujo.

### 5. Propagación por las autoridades existentes

La definición humana se añadirá a `.agents/instructions/core.md`; `npm run agent:harness:sync` regenerará los mirrors. `scripts/patchOpsxWorkflows.mjs` insertará y verificará un bloque determinista en los flujos `propose` y `archive`, por lo que sobrevive a `npm run agent:opsx:update`. `openspec/config.yaml` pedirá la metadata y la matriz al crear nuevos artefactos.

No se editarán a mano `AGENTS.md`, `CLAUDE.md`, prompts o comandos generados. La spec existente `agent-harness-parity` se amplía porque su comportamiento de paridad incluye esta guía.

## Validation Matrix

| Superficie declarada | Validación local fija | Evidencia obligatoria antes de archive |
| --- | --- | --- |
| Todas | OpenSpec estricto y tareas sin pendientes | enlaces a issue/PR, rollback y revisión adversarial |
| `docs` | paridad de harness y rutas/checks documentados | enlaces o salida de verificación de documentos afectados |
| `harness` | `agent:harness:check` y `agent:opsx:patch:check` | fixtures PASS/FAIL y salida de paridad |
| `ui` | arranque web verificable | HTTP 200, Playwright en móvil/tablet/web y Nielsen |
| `sync` | `test:sync` y pruebas focalizadas | offline, reconexión, otro dispositivo y no pérdida local |
| `ia` | pruebas focalizadas del gateway | proveedor ausente, error temporal, límite y resultado revisable |
| `backend` | `backend:check` y pruebas focalizadas | JWT, `userId`, índices/rate limit y ausencia de secretos |

## Risks / Trade-offs

- [GitHub CLI sin scopes o red] → el pre-propose falla con recuperación `gh auth refresh`; una excepción temporal válida deja registro visible cuando aplique.
- [Parser frágil o falsos positivos] → JSON versionado, fixtures por campo y comandos explícitos no bloqueantes fuera de propose/archive; rollback por reversión del checker/instrucciones.
- [Evidencia manual ficticia] → el checker valida presencia y trazabilidad, pero la revisión adversarial y el responsable humano siguen confirmando calidad; no se afirma automatización inexistente.
- [Cambios de OpenSpec regeneran workflows] → el bloque se inserta y comprueba desde el parche idempotente, no desde un espejo.
- [Ejecución accidental de un comando peligroso] → perfiles estáticos en código; el manifest nunca aporta shell arbitrario.

## Migration Plan

1. Introducir los comandos de gate y documentación como invocaciones explícitas, sin modificar CI ni `openspec:check`.
2. Regenerar mirrors y workflows, y verificar sus checks existentes.
3. Crear fixtures y probar tanto JSON válido como campos, expiraciones y superficies inválidas.
4. Los changes existentes no se reescriben; para archives posteriores se crea el manifest o se usa una excepción temporal aprobada con fecha y recuperación.
5. Si el gate produce falsos positivos, revertir checker/configuración o corregir su parser, conservar los artefactos y no borrar evidencia.

## Open Questions

- Ninguna bloqueante para proponer. Durante apply se confirmará el conjunto mínimo de IDs de validación con los scripts de test realmente disponibles, sin inventar comandos para superficies que aún no tengan suite automatizada.
