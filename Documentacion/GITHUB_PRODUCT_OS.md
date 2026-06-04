# GitHub Product OS - PlanearIA

> Estado: guia operativa para ejecutar la Fase 0 de `Documentacion/PLAN_PASOS_INICIALES.md`.

## Ramas oficiales

- `main`: estable, solo commits validados.
- `development`: rama activa diaria.
- `feature/*`: cambios por plan/fase.
- `docs/*`: cambios documentales grandes.
- `fix/*`: bugs puntuales.

Regla practica: trabajar en `development` o ramas derivadas; `main` solo recibe cambios validados.

## GitHub Project

Nombre recomendado:

```text
PlanearIA Product OS
```

Vistas recomendadas:

- Kanban operativo.
- Roadmap por epic.
- Bugs y validacion manual.

Columnas/estados:

- Inbox
- Backlog
- Ready
- In Progress
- Review Manual
- Blocked
- Done
- Parked

## Labels base

| Label | Uso |
| --- | --- |
| `epic` | Agrupador grande de producto. |
| `plan-maestro` | Solicitud o ejecucion de plan maestro. |
| `fase` | Tarea de fase dentro de un plan. |
| `bug` | Error reproducible. |
| `ux-ui` | Interaccion, navegacion, accesibilidad, visual. |
| `legacy` | Deuda o flujo viejo a eliminar/redirigir. |
| `offline-first` | Persistencia local, sync, conflictos. |
| `ai` | IA, prompts, gateway, fallback, limites. |
| `infra` | CI/CD, deploy, backend, entorno. |
| `docs` | Documentacion. |
| `testing` | Tests automaticos o validacion manual. |
| `needs-input` | Requiere decision/input del usuario. |
| `low-cost` | Decision de costo/free tier/local-first. |

## Milestones

- `Ciclo 0 - Reorientacion y GitHub`.
- `Ciclo 1 - Plan Classroom`.
- `Ciclo 2 - Fundacion Classroom`.
- `Ciclo 3 - UX/Navegacion Global`.

## Modelo de Work Items

La documentacion markdown y GitHub Projects cumplen roles distintos:

- Markdown: arquitectura, decisiones, fases completas, criterios de cierre e historial.
- GitHub Projects: seguimiento diario, Kanban, prioridad, bloqueos y avance visible.
- GitHub Actions: validacion automatica; no es un tablero de tareas.

Regla practica para no llenar el tablero de ruido:

- Crear un item/issue `epic` por plan maestro.
- Crear un item/issue por fase cuando esa fase se vaya a ejecutar.
- Crear issues de tareas pequenas solo para la fase activa o la siguiente fase inmediata.
- Mantener checkboxes futuros dentro del plan markdown hasta que sea momento de ejecutarlos.
- Usar milestones como ciclos/sprints/release goals, no como epicas.
- Usar labels para clasificar: `fase`, `ux-ui`, `legacy`, `offline-first`, `ai`, `infra`, `testing`, `docs`, `needs-input`, `low-cost`.

Ejemplo recomendado para Classroom:

- Epic: `Plan Maestro: Classroom / Grupos y Recursos`.
- Milestone: `Ciclo 2 - Fundacion Classroom`.
- Issue fase activa: `Classroom Fase 0 - Auditoria profunda y preparacion`.
- Checklist dentro del issue: tareas `0.1` a `0.7`.

## Automatizacion local con GitHub CLI

`gh` ya esta instalado y autenticado en la laptop. Si se necesita reconstruir labels/milestones, ejecutar:

```powershell
.\scripts\github-bootstrap.ps1
```

Ese script crea/verifica labels y milestones. El Project v2 ya existe como `PlanearIA Product OS`; si falla por permisos, revisar que `gh auth status` tenga scope `project`.

## Templates creados

- Bug report.
- Tarea tecnica.
- Validacion manual.
- Solicitud de plan maestro.
- Decision arquitectonica.
- Pull request template.

## Criterio de merge

- No mergear a `main` si CI falla.
- No cerrar fase UX/UI sin validacion manual cuando aplique.
- No cerrar plan maestro sin actualizar su tracking `[ ]`, `[~]`, `[x]`.
- No mergear cambios con secrets reales.
