## Why

La cronologia de las olas UX/UI, el prototipo Figma y las entrevistas IHC esta repartida entre el plan UX/UI, IHC Discovery, el roadmap y las instrucciones de agentes. Aunque comparten la intencion, su redaccion permite interpretar que el prototipo o las entrevistas ocurren despues de decisiones visuales costosas, y la numeracion 1.9/1.10 del estandar visual es inconsistente. Es necesario fijar ahora una secuencia comun antes de iniciar la Ola 1 de UX/UI.

## What Changes

- Declarar una cronologia canonica desde R1 hasta el inicio de la Ola 3: shell y preparacion del prototipo en paralelo durante Ola 1; R2 antes de la implementacion visible de Ola 2; entrevistas con prototipo antes de cerrar Ola 2 y sintesis antes de Ola 3.
- Alinear el plan UX/UI, IHC Discovery y el roadmap a esa cronologia, sin convertir la creacion de Figma ni las entrevistas humanas en trabajo automatizable.
- Incorporar la cronologia en `.agents/instructions/core.md` y regenerar `AGENTS.md` y `CLAUDE.md` mediante el harness, para que los agentes reciban la misma regla desde sus entradas.
- Corregir la jerarquia de subsecciones del Estandar de Excelencia Visual para que dependan de 1.9 y conservar 1.10 para el Plan de transicion, con sus referencias internas actualizadas.

## Capabilities

### New Capabilities

- `ux-ihc-chronology`: Define el contrato documental de secuencia, gates y evidencia entre las olas UX/UI, prototipos Figma e investigacion IHC.

### Modified Capabilities

- Ninguna.

## Impact

- Afecta `Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md`, `Documentacion/00-fundamentos/IHC_DISCOVERY_DOCENTE.md`, `Documentacion/00-fundamentos/ROADMAP_PLANES_MAESTROS.md` y `.agents/instructions/core.md`.
- `AGENTS.md` y `CLAUDE.md` cambiaran solo como salidas generadas de `npm run agent:harness:sync`; no se editaran a mano.
- Requiere validar enlaces, busquedas de coherencia, paridad del harness y OpenSpec. No cambia APIs, datos, UI de producto, backend, sync ni configuracion de Figma/GitHub Projects.

## No objetivos

- Crear o aprobar frames Figma, autenticar su MCP, reclutar o entrevistar docentes, ni modificar los gates manuales #46 y #47.
- Aplicar cambios de shell, Escritorio, Office home o cualquier pantalla de Ola 1/2.
- Cambiar las reglas arquitectonicas, el runtime de la aplicacion, datos docentes o servicios externos.
