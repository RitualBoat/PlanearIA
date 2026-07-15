## 1. Definir el contrato y los flujos canónicos

- [x] 1.1 Incorporar en `openspec/config.yaml`, `.agents/instructions/core.md` y `.agents/skills/source-command-opsx-{propose,apply,archive}/SKILL.md` la convención de un único `TLDR.md`, su plantilla de cinco bloques, el máximo humano de 120 palabras y las responsabilidades de propose, apply y archive.
- [x] 1.2 Extender `scripts/patchOpsxWorkflows.mjs` con un bloque TLDR marcado e idempotente para los workflows generados por `openspec update`; hacer que `--check` detecte una guía ausente además de las normalizaciones existentes.

## 2. Implementar la guarda limitada y sus pruebas

- [x] 2.1 Crear un checker Node para changes activos que compruebe exclusivamente `openspec/changes/<change>/TLDR.md`, ignore `archive/` y emita una remediación concreta ante archivo ausente o fuera de la raíz, sin leer ni analizar contenido.
- [x] 2.2 Encadenar el checker a `openspec:validate` y `openspec:check` sin perder la validación estricta nativa ni los diagnósticos de versión de la CLI.
- [x] 2.3 Añadir scripts npm y pruebas con fixtures temporales para TLDR válido, faltante y fuera de ubicación; ajustar las pruebas OpenSpec afectadas para conservar resultados y remediaciones reproducibles.

## 3. Regenerar desde fuentes y revisar la propagación

- [x] 3.1 Ejecutar `npm run agent:opsx:update` para regenerar los workflows OpenSpec y aplicar el parche TLDR; revisar que el diff provenga de la actualización y no de edición manual de un espejo.
- [x] 3.2 Ejecutar `npm run agent:harness:sync` para propagar fuentes `.agents`; confirmar que `AGENTS.md`, `CLAUDE.md` y los skills de Codex sólo se modificaron como salidas generadas.

## 4. Validar, revisar y registrar evidencia

- [x] 4.1 Ejecutar las pruebas nuevas de TLDR, `npm run test:openspec-cli`, `npm run agent:opsx:patch:check`, `npm run agent:harness:check`, `npm run openspec:validate` y `npm run openspec:check`.
- [x] 4.2 Ejecutar `npm run typecheck` y `npm run lint -- --quiet`; documentar cualquier fallo preexistente o corregir los introducidos por el change.
- [x] 4.3 Revisar manualmente un TLDR generado, incluido el de este change, para confirmar los cinco bloques, el lenguaje accesible, encabezados útiles y máximo de 120 palabras por bloque; no convertir esta revisión en regla del checker.
- [x] 4.4 Adjuntar al issue #67 y al PR la salida de validación, la evidencia de fixtures y la revisión de rollback; antes de archive confirmar que el TLDR refleja el alcance final y que el directorio lo conservará.
