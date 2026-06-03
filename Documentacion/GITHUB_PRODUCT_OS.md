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

## Automatizacion local pendiente de GitHub CLI

`gh` no esta instalado actualmente en la laptop. Cuando este instalado y autenticado, ejecutar:

```powershell
.\scripts\github-bootstrap.ps1
```

Ese script crea labels y milestones. El Project v2 puede requerir permisos extra (`project` scope), por lo que si falla, crearlo manualmente desde GitHub con el nombre y vistas indicadas arriba.

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
