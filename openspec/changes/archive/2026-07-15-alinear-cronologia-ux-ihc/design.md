## Context

El issue #61 busca alinear fuentes activas que hoy describen la relacion entre Ola 1, el prototipo Figma, R2, las entrevistas IHC y Ola 3. El plan de preparacion ya fija la intencion: el prototipo se prepara en paralelo a Ola 1 y las entrevistas suceden antes de cerrar Ola 2. Sin embargo, el plan UX/UI ubica los dos hitos bajo Ola 2, el roadmap los resume como parte de Ola 2 y las instrucciones de agentes no contienen la secuencia. Esto deja margen a que un agente empiece pantallas visibles sin investigación suficiente.

El change solo actualiza documentos y la fuente de instrucciones del harness. `AGENTS.md` y `CLAUDE.md` son espejos generados por `scripts/syncAgentHarness.mjs`; #46 (Figma) y #47 (entrevistas) son gates manuales que permanecen fuera de este scope.

## Goals / Non-Goals

**Goals:**

- Hacer que las fuentes activas expresen una secuencia única, desde R1 hasta la síntesis IHC previa a Ola 3.
- Mantener claro qué actividades ocurren en paralelo, cuáles son gates y qué evidencia humana no puede fabricar un agente.
- Corregir la numeración de las subsecciones del estándar visual sin mover su contenido normativo.
- Propagar la regla mediante la fuente neutral del harness y verificar que sus espejos no queden en drift.

**Non-Goals:**

- No producir, aprobar ni registrar frames Figma; no usar ni autenticar el MCP de Figma.
- No reclutar ni entrevistar docentes, ni recopilar notas, consentimientos o información escolar.
- No implementar UX/UI, navegación, componentes o pantallas, ni ejecutar Playwright de una UI que este change no altera.
- No modificar el estado de #46, #47, milestones ni Product OS.

## Decisions

### D1. El plan UX/UI conserva la narrativa extensa y las demás fuentes reciben una secuencia equivalente

El plan UX/UI será la explicación operativa más completa: el gate operativo R1, definido por el plan de Preparacion SDD, precede Ola 1; el shell, recorridos IHC y prototipo navegable se coordinan en paralelo durante Ola 1; el gate operativo R2 precede la implementación visible de Ola 2; las entrevistas se hacen con prototipo antes del cierre de Ola 2 y sus hallazgos se sintetizan antes de Ola 3. Los gates operativos no se confunden con los riesgos R1/R2 del plan UX/UI. IHC Discovery, roadmap y el contexto de agentes repetirán esa secuencia de manera concisa y enlazada.

Alternativas consideradas:

- Crear un documento nuevo como única cronología: se descarta porque añade otra fuente que el lector debe descubrir y mantener.
- Dejar solo enlaces al plan UX/UI: se descarta porque IHC, roadmap y AGENTS son puntos de entrada que se consultan de forma independiente.

### D2. El prototipo y las entrevistas son hitos manuales, no tareas de aplicación

El texto distinguirá la preparación del prototipo durante Ola 1 de la aprobación de frames y de las entrevistas reales. #46 mantiene la aprobación/acceso a Figma como gate de R2; #47 mantiene reclutamiento, consentimiento, agenda y síntesis humana. El change solo describe sus precondiciones y evidencia, sin prometer que la automatización las satisfaga.

Alternativa considerada: modelar ambos hitos como tareas OpenSpec completas. Se descarta porque requeriría autenticación y contacto humano que no modifica el repositorio y no puede cerrarse mediante una ejecución de agente.

### D3. La regla de agentes se modifica únicamente en la fuente neutral

La cronología se agregará a `.agents/instructions/core.md`. Después se ejecutará `npm run agent:harness:sync`, que regenera los espejos `AGENTS.md` y `CLAUDE.md`, y `npm run agent:harness:check` verificará que no exista drift. No se editará ningún espejo a mano.

Alternativa considerada: editar `AGENTS.md` directamente. Se descarta porque el encabezado generado y la especificación `agent-harness-parity` lo prohíben como fuente de verdad.

### D4. La jerarquía del estándar visual se normaliza sin cambiar su contenido

Las subsecciones existentes del estándar pasan de `1.10.1` a `1.9.1` (y sucesivas) para quedar anidadas bajo `1.9 Estandar de Excelencia Visual`. `1.10 Plan de transicion conceptual` conserva su número. Todas las referencias a las subsecciones se ajustarán a la nueva jerarquía.

Alternativa considerada: renumerar el Plan de transición y el resto del documento. Se descarta porque amplía innecesariamente el diff y rompe referencias no relacionadas.

### D5. La validación es documental y de paridad, no QA visual de producto

La evidencia será una revisión de enlaces internos y búsquedas dirigidas que muestren una única secuencia, más `npm run agent:harness:sync`, `npm run agent:harness:check` y validación estricta de OpenSpec. Playwright, typecheck y pruebas funcionales no son requisitos de este cambio porque no modifica una pantalla, TypeScript ni runtime.

## Risks / Trade-offs

- [La redacción vuelve a divergir con cambios posteriores] → Mantener la secuencia explícita en los cuatro puntos de entrada y revisar los resultados de búsqueda como evidencia del issue.
- [Un agente interpreta “en paralelo” como aprobación automática de Figma] → Nombrar #46 y #47 como gates manuales, indicar sus evidencias y prohibir su cierre desde este change.
- [Se edita un espejo del harness por error] → Cambiar solo `.agents/instructions/core.md` y ejecutar sync/check.
- [La renumeración rompe enlaces internos] → Inventariar referencias `1.10.x`, actualizarlas y verificar que no quede ninguna referencia a una subsección inexistente.
- [GitNexus continúa sin devolver contexto] → El alcance es Markdown/generado, para el cual la política permite `rg` y lectura directa; el fallo queda citado en #61 sin expandir este change a reparar tooling.

## Migration Plan

1. Actualizar los cuatro documentos fuente con la secuencia y las referencias correctas.
2. Ejecutar el generador del harness y revisar que los espejos resultantes reflejen solo el cambio esperado.
3. Ejecutar las comprobaciones de paridad, enlaces/búsquedas y OpenSpec; adjuntar la evidencia a #61.
4. Si la redacción o la numeración genera una contradicción, revertir únicamente las fuentes y espejos de este change y ejecutar de nuevo el generador. No existe migración de datos ni despliegue.

## Open Questions

- Ninguna bloquea la propuesta. La identidad de los frames aprobados y el reclutamiento de docentes continúan como decisiones manuales de #46 y #47 antes de sus gates respectivos.
