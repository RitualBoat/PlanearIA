## 1. Alinear las fuentes de producto e investigacion

- [x] 1.1 Actualizar el Plan UX/UI con la secuencia canonica R1 -> Ola 1 en paralelo con recorridos/prototipo -> R2 -> Ola 2 con entrevistas -> sintesis antes de Ola 3, conservando #46 y #47 como gates manuales.
- [x] 1.2 Corregir las subsecciones del Estandar de Excelencia Visual de `1.10.x` a `1.9.x` y actualizar cada referencia interna afectada sin renumerar contenido no relacionado.
- [x] 1.3 Actualizar IHC Discovery y el roadmap para expresar la misma secuencia, precondiciones y evidencia humana sin declarar satisfechos los gates manuales.

## 2. Propagar la regla al harness

- [x] 2.1 Incorporar la cronologia canonica en `.agents/instructions/core.md`, manteniendo los puntos de entrada de agentes concisos y accionables.
- [x] 2.2 Ejecutar `npm run agent:harness:sync` para regenerar los espejos y revisar que `AGENTS.md` y `CLAUDE.md` solo cambien como salidas del generador.

## 3. Validar y documentar evidencia

- [x] 3.1 Verificar enlaces internos y ejecutar busquedas dirigidas para demostrar que no quedan referencias contradictorias a la secuencia ni subsecciones `1.10.x` inexistentes.
- [x] 3.2 Ejecutar `npm run agent:harness:check`, `npm run openspec:validate` y `npm exec --yes=false -- openspec validate alinear-cronologia-ux-ihc --strict --no-interactive`; registrar sus resultados.
- [x] 3.3 Adjuntar a #61 la evidencia de cronologia, enlaces y paridad; confirmar que #46 y #47 conservan su estado y que no se realizo trabajo de Figma, entrevistas ni UI de producto.
