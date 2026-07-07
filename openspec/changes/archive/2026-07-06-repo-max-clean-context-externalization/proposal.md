## Why

PlanearIA ya tiene entradas AI-friendly y CodeGraph dejo de indexar fuentes externas completas, pero el repo todavia conserva material legacy, evidencia historica, referencias pesadas y ejemplos potencialmente sensibles que agregan ruido cognitivo a agentes IA y busquedas textuales. La limpieza maxima externaliza ese material con respaldo verificable antes de borrar, conserva indices minimos dentro del repo y deja evidencia antes/despues de CodeGraph.

## What Changes

- Crear y verificar un respaldo completo en `PLANEARIA_BACKUP_MOVE_OUT_2026-07-06/` antes de cualquier borrado.
- Recuperar dentro del respaldo los `context/referencias-opensource/**/source/**` que ya aparecen borrados en el working tree actual.
- Pausar el flujo despues del respaldo para que el usuario mueva esa carpeta fuera del repo.
- Tras confirmacion, retirar del repo material legacy, archivos de estudio, referencias externas completas, validaciones historicas antiguas, ejemplos sensibles y assets pesados de ground truth.
- Mantener dentro del repo solo indices/stubs minimos que expliquen donde vive el respaldo externo y como pedir ground truth cuando haga falta.
- Comparar CodeGraph antes/despues con metricas de archivos, nodos, edges, DB size, archivos bajo `context` y consultas trampa.
- Resolver el alta en GitHub Project con `gh project item-add` o documentar el fallo exacto.
- Dejar evidencia completa en `Documentacion/03-validacion/repo-max-clean-context-2026-07-06/`.

## Capabilities

### New Capabilities

- Ninguna.

### Modified Capabilities

- `ai-friendly-repository-context`: agrega requisitos de respaldo externo obligatorio, contexto minimo en repo, pausa humana antes de borrado, y comparacion CodeGraph antes/despues.

## Impact

- Afecta documentacion, contexto curado, OpenSpec y tracking operativo.
- No modifica logica de negocio, pantallas, servicios, backend, sync ni datos runtime.
- Rutas candidatas de externalizacion: `Documentacion/99-archivo/`, `Documentacion/Ejemplo materia IHC/`, `Documentacion/01-planes-maestros/cerrados/`, validaciones historicas antiguas, `openspec/changes/archive/`, `context/OpenSpec/`, `context/referencias-opensource/`, `context/referencias-app-similares-a-planearia/`, `context/infraestructura-ground-truth/`, `context/planeaciones-reales/`, `context/stitch-results/`, `context/roadmap-context/` y assets pesados de ground truth.
- Plan/contexto relacionado: `Documentacion/05-context-engineering/README.md` y `openspec/specs/ai-friendly-repository-context/spec.md`.

## No objetivos

- No reescribir codigo funcional.
- No migrar datos de usuarios ni claves AsyncStorage.
- No subir el respaldo externo a Git, GitHub Releases, nube o rutas publicas.
- No resolver redisenos UX/UI ni cambiar comportamiento de la app.
