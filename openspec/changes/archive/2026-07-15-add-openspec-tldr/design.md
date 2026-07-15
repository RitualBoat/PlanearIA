## Context

OpenSpec 1.6.0 define cuatro artefactos obligatorios en el esquema `spec-driven`; la configuración de proyecto no añade un artefacto local sin bifurcar la CLI instalada. Hoy las instrucciones de propose, apply y archive no crean ni mantienen un resumen humano. Las fuentes de PlanearIA no son homogéneas: `.agents/instructions/` se refleja con `syncAgentHarness.mjs`, los comandos migrados viven en `.agents/skills/source-command-opsx-*`, y los workflows OpenSpec regenerados se estabilizan con `scripts/patchOpsxWorkflows.mjs` tras `openspec update`.

El cambio introduce un archivo suplementario y una guarda propia de proyecto. No modifica el esquema instalado, la app ni changes archivados.

## Goals / Non-Goals

**Goals:**

- Crear un solo `TLDR.md` humano por change nuevo en la raíz de su directorio, con el contrato del issue #67.
- Mantener la regla en propose, apply y archive sin editar manualmente los espejos generados.
- Fallar de forma accionable si un change activo no tiene el archivo en la ruta esperada, sin interpretar su contenido.
- Conservar el archivo por el movimiento normal del directorio al archive y cubrir la regla con fixtures reproducibles.

**Non-Goals:**

- Cambiar `@fission-ai/openspec`, bifurcar `spec-driven` o reescribir changes históricos.
- Convertir la validación en un evaluador de redacción, estructura, orden, cantidad de palabras o calidad técnica.
- Cambiar producto, backend, sync, datos docentes, autenticación o dependencias.

## Decisions

### D1. TLDR será un archivo suplementario, no un quinto artefacto del esquema instalado

`TLDR.md` se ubicará en `openspec/changes/<change>/TLDR.md`. Las instrucciones lo crearán y el validador de proyecto lo exigirá, pero OpenSpec seguirá gestionando `proposal`, `specs`, `design` y `tasks` con el esquema fijado. Así se evita modificar `node_modules`, mantener un fork de schema o perder la convención al actualizar la CLI.

Alternativa descartada: editar `schemas/spec-driven/schema.yaml` dentro de la dependencia. No se versiona como fuente del repositorio y cualquier `npm ci` la eliminaría.

### D2. La guía humana será exacta; su revisión seguirá siendo humana

La plantilla generada pedirá cinco bloques, en orden: intención de Proposal, enfoque de Design, comportamiento de Spec, plan práctico de Tasks y `Resumen integral del change`. Cada bloque y el párrafo final tendrán máximo 120 palabras, español accesible y encabezados que expliquen para qué sirve el artefacto. Propose crea el archivo; apply obliga a actualizarlo si cambian alcance, archivos, comportamiento o resultado esperado; archive recuerda verificar que viaja con el directorio.

Alternativa descartada: contar palabras o analizar encabezados en código. Es frágil, no mide comprensión y contradice el límite explícito del issue para la automatización.

### D3. Las fuentes canónicas se actualizan antes que los espejos

La convención breve se declarará en `openspec/config.yaml` y `.agents/instructions/core.md`. Los comandos migrados canónicos `.agents/skills/source-command-opsx-{propose,apply,archive}/SKILL.md` recibirán sus responsabilidades de ciclo de vida. `scripts/patchOpsxWorkflows.mjs` incorporará un bloque TLDR con marcador idempotente a los workflows que `openspec update` regenera y su modo `--check` detectará una convención ausente.

Después, `npm run agent:opsx:update` regenera y parchea los workflows OpenSpec; `npm run agent:harness:sync` propaga las fuentes `.agents` a sus mirrors. `AGENTS.md` y `CLAUDE.md` nunca se editarán a mano.

### D4. La validación será pequeña, determinista y sólo de presencia/ruta

Un script Node recorrerá exclusivamente los changes activos bajo `openspec/changes/`, ignorando `archive/`, y comprobará `existsSync(<changeRoot>/TLDR.md)`. Un archivo vacío o con contenido deficiente satisface esta guarda de ubicación; un TLDR en otra carpeta no. El fallo indicará el change y la ruta exacta donde crear o mover el archivo.

El comando `openspec:validate` y `openspec:check` encadenarán la validación nativa estricta y este checker. Fixtures temporales cubrirán caso válido, archivo ausente y archivo colocado fuera de la raíz, sin inspeccionar texto del TLDR.

### D5. Archive conserva el TLDR por diseño de movimiento, con una comprobación previa

El archive seguirá moviendo el directorio completo del change. La instrucción de archive verificará que `TLDR.md` permanezca en la raíz antes de moverlo y no generará copias fuera del archive. Esto preserva el resumen junto a proposal, design, specs y tasks sin alterar archivos históricos.

## Risks / Trade-offs

- [Cambios upstream alteran el texto de workflows] → El parche usará un marcador idempotente y `agent:opsx:patch:check` reportará el destino que necesite ajustar su patrón.
- [El TLDR existe pero es malo] → Es una decisión deliberada: las instrucciones y la revisión humana cubren tono, orden y 120 palabras; el checker no finge evaluar calidad.
- [Un change antiguo sigue activo al activar la regla] → El flujo trabaja un change grande a la vez; se añadirá el TLDR al change actual y archive queda excluido. Si aparece una excepción real, se documentará antes de ejecutar la guarda.
- [La regeneración ensucia espejos no revisados] → Se ejecutarán sync/update desde fuentes canónicas, se revisará el diff y `agent:harness:check` detectará cualquier drift.

## Migration Plan

1. Añadir la guía canónica, el parche idempotente y el checker con sus tests/fixtures.
2. Integrar el checker en los comandos de validación sin eliminar la validación estricta nativa.
3. Regenerar primero workflows OpenSpec y después mirrors del harness; revisar el diff resultante.
4. Verificar el change actual con su `TLDR.md`, los fixtures válido/ausente/mal ubicado y todos los checks afectados.

Rollback: revertir en un commit independiente las fuentes, scripts, scripts npm y mirrors generados de este change; volver a ejecutar `npm run agent:harness:sync`. No hay migraciones, datos ni estado remoto que recuperar. Los TLDR ya creados son Markdown inocuo y pueden permanecer sin afectar OpenSpec.

## Open Questions

No quedan preguntas abiertas: #67 fija que la calidad y el límite de palabras se revisan por personas, y que sólo la presencia/ubicación se automatiza.
