# Design: auditoria-plan-uxui-pre-ola1

## Context

R1 esta cerrado (#48-#52, #62-#65) y el Plan Maestro UX/UI esta activo sin ningun change de producto iniciado. Los gates manuales #46 (Figma) y #47 (IHC) permanecen en Parked y bloquean R2. El issue #76 autoriza una auditoria integral pre-Ola 1 con creacion de backlog completo P0-P3 en Product OS, sustituyendo de forma deliberada y acotada la regla de "solo crear el trabajo activo/siguiente". El change es un spike documental: produce reporte versionado, matrices e issues; no toca codigo de producto.

**Bounded contexts (MAPA_DDD_ESTRATEGICO_LIGERO.md):** este change no afecta ningun contexto delimitado de datos docentes ni entidad de la matriz de propiedad. Opera sobre documentacion, OpenSpec y GitHub/Product OS. **No requiere contrato cruzado** entre contextos; no hay dato compartido nuevo, owner que cambie ni invariantes de `userId`/`src/sync`/IA involucradas.

**Ground truth visual:** no aplica; el change no produce UI. Los criterios de diseno responsive/tokens/Figma del plan se auditan como contenido, no se ejercen.

## Goals / Non-Goals

**Goals:**

- Metodo de auditoria reproducible: cada afirmacion del reporte queda etiquetada como evidencia (con fuente verificable) o inferencia (con confianza declarada).
- Cobertura completa del plan: olas 0-4+, gates R1/R2/#46/#47, y las siete dimensiones del issue (planificacion, shell/navegacion/responsive/accesibilidad/estados, arquitectura MVVM/offline/IA, Figma/IHC, QA/CI/evidencia, desglose de issues, investigacion web).
- Backlog accionable: issues P0-P3 deduplicados con metadata uniforme y estado `Backlog`, mas recomendacion del primer issue ejecutable de Ola 1.
- Trazabilidad SDD: readiness.json, brownfield-baseline.md, TLDR.md, revision adversarial y gate de archive.

**Non-Goals:**

- Corregir lo hallado, editar el plan maestro, mutar issues/milestones/gates existentes, aprobar Figma, contactar docentes, ejecutar los issues nuevos o copiar codigo externo (ver No objetivos del proposal).

## Decisions

1. **Reporte fuera del plan maestro, en `Documentacion/03-validacion/auditoria-plan-maestro-uxui-ola1/`.** Sigue el precedente de auditorias versionadas en `03-validacion/` (p. ej. `evaluate-gitnexus-codegraph-sdd/`). Alternativa rechazada: anexar al plan; violaria el guardrail de no editar el plan y mezclaria hallazgos con decisiones vigentes.
2. **Estructura de entregables fija:** `reporte-ejecutivo.md`, `matriz-cobertura.md` (fila por ola/gate: objetivo, dependencia, evidencia, riesgo, issues), `matriz-hallazgos.md` (hallazgo: evidencia/inferencia, P0-P3, confianza alta/media/baja, costo S/M/L, dependencia, ola recomendada, accion, issue creado), `mapa-dependencias-roadmap.md`, `decisiones-abiertas.md`, `investigacion-web.md` (fuente primaria, enlace, por que aplica a PlanearIA). Alternativa rechazada: un unico documento monolitico; dificulta revision adversarial y reuso por agentes.
3. **Taxonomia P0-P3 anclada a riesgo de Ola 1:** P0 = bloquea o corrompe el inicio de Ola 1; P1 = degrada Ola 1 o encarece Ola 2 si no se resuelve antes; P2 = mejora relevante no bloqueante; P3 = oportunidad/limpieza. La severidad es del hallazgo; la prioridad del issue puede diferir y se justifica.
4. **GitNexus primario, CodeGraph fallback documentado.** Cada consulta estructural parte de GitNexus (`query`/`impact`); si esta stale, ambiguo u omite un archivo clave, se usa CodeGraph y se registra el motivo en el log de la auditoria. Markdown y docs van por lectura directa/`rg`. Es la politica vigente de `agent-knowledge-graph-policy`.
5. **Issues nuevos con plantilla uniforme y deduplicacion previa.** Antes de crear, se busca en issues abiertos/cerrados (`gh search issues`) y en el backlog del plan. Cada issue declara: prioridad, severidad, confianza, costo, dependencias, ola recomendada, evidencia (enlace al reporte), no objetivos y nota explicita de "no iniciar sin activacion humana". Se agregan al Project como `Backlog` via `gh`. Alternativa rechazada: crear solo P0/P1; el issue #76 autoriza y pide el backlog completo.
6. **Enlace al plan, no a un epic inexistente.** No hay epic UX/UI en Product OS (el roadmap lo preve al arrancar Ola 0). Los issues enlazan al plan maestro y entre si; crear el epic y asignar milestones de olas queda como decision abierta para el humano. Alternativa rechazada: crear el epic por inferencia; es una mutacion de gobernanza no autorizada explicitamente.
7. **Investigacion web solo con fuentes primarias o repositorios relevantes,** citadas con enlace y aplicabilidad explicita a PlanearIA (stack RN/Expo, offline-first, presupuesto cero, docentes mexicanos). Sin copiar codigo. Los hallazgos externos entran a la matriz como inferencia salvo verificacion local.
8. **Superficie `docs` en readiness.json.** El perfil exige `openspec-strict` + `harness-parity` y evidencia `docs-verification`, proporcional a un spike documental. Alternativa rechazada: declarar `ui`/`harness`; obligaria evidencia Playwright o fixtures que no corresponden a un change sin codigo.

## Risks / Trade-offs

- [Backlog inflado con P2/P3 que nadie ejecuta] → taxonomia estricta, deduplicacion, y separacion visual Backlog vs trabajo activo; la recomendacion final ordena solo la secuencia inmediata.
- [Deriva de alcance hacia "arreglar mientras audito"] → guardrails en tasks: el apply solo escribe en la carpeta del reporte, el change y los issues nuevos; `git status` como verificacion.
- [Hallazgos plausibles pero falsos por leer docs desactualizados] → toda afirmacion estructural se verifica contra GitNexus/codigo; docs citan commit/fecha; revision adversarial independiente antes de archive.
- [Mutacion accidental de estados externos (issues, milestones, Project)] → solo operaciones `create`/`add` para items nuevos y el propio #76; ninguna edicion sobre items existentes; evidencia de comandos en el log.
- [Investigacion web irrelevante o de segunda mano] → regla de fuente primaria; cada cita incluye "por que aplica a PlanearIA" o se descarta.

## Migration Plan

No hay migracion: change documental. **Rollback:** revertir el PR restaura `Documentacion/` y `openspec/`; los issues creados se cierran como `not planned` si el humano revierte la auditoria, sin borrar historial ni datos. El movimiento de #76 en el Project es reversible manualmente.

## Open Questions

Se registran para decision humana; la auditoria puede refinarlas pero no resolverlas:

- OQ-A: crear o no el epic UX/UI en Product OS y milestones por ola antes de Ola 0/1.
- OQ-B: si algun hallazgo P0 exigiera modificar el plan maestro, quien y cuando lo aprueba (fuera de este change).
- OQ-C: politica de expiracion/revision de los issues P3 si envejecen sin activarse.
