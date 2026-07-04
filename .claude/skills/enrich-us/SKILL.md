---
name: enrich-us
description: Use when the user wants to enrich, refine or complete a vague user story, idea or GitHub issue into an implementation-ready ticket before running /opsx:propose. Trigger with "enrich", "enriquece", "refina esta historia", or a GitHub issue number.
version: 1.0.0
---
# enrich-us Skill (adaptada a PlanearIA)

Convierte una idea vaga o un issue de GitHub en una historia de usuario lista para implementar,
que luego alimenta el flujo OpenSpec (`/opsx:propose`).

## Fuente de entrada del ticket

Determina de donde viene el ticket, en este orden:

1. **Texto directo (por defecto):** si el usuario pega el contenido en el chat, usalo tal cual.
2. **Modo GitHub Issue:** si el usuario da un numero de issue (por ejemplo `42`), lee el issue con:
   - el MCP de GitHub si esta conectado, o
   - la herramienta Bash: `gh issue view 42` (y para escribir de vuelta `gh issue edit 42 --body-file ...`).
   PlanearIA usa GitHub Projects como tablero, no Jira. No requieras Jira nunca.
3. Si la entrada es ambigua (referencia corta sin contenido), pide el numero de issue o el texto completo.

## Instrucciones

1. Actua como experto de producto con criterio tecnico.
2. Entiende el problema descrito. Lee el contexto tecnico de PlanearIA en CLAUDE.md y
   Documentacion/00-fundamentos antes de proponer detalle tecnico.
3. Decide si la historia esta suficientemente detallada. Valida que incluya:
   - Descripcion funcional completa.
   - Datos/campos a crear o actualizar.
   - Endpoints o servicios afectados (recuerda: sync academico via src/sync; IA via backend gateway).
   - Archivos/modulos a modificar segun la arquitectura MVVM (pantallas, hooks, context, services).
   - Definicion de terminado (implementacion, tests afectados, docs).
   - Requisitos no funcionales relevantes (aislamiento por userId, offline-first, seguridad, rendimiento).
4. Si le falta detalle para implementacion autonoma, entrega una version mejorada mas clara,
   especifica y concisa. Puede estar en espanol.
5. Formato de salida SIEMPRE con estas dos secciones:
   - `## Original`
   - `## Enriquecida`
6. Escritura de vuelta a GitHub (opcional, solo en modo issue):
   - Actualiza el cuerpo del issue anexando la version enriquecida despues del original,
     con encabezados `## Original` y `## Enriquecida`.
   - Usa `gh issue edit <n> --body-file <archivo>` o el MCP de GitHub.

## Notas

- No sobreescribas el contenido original del issue: anexa, no reemplaces.
- Siguiente paso natural tras enriquecer: `/opsx:propose` con la historia enriquecida.
