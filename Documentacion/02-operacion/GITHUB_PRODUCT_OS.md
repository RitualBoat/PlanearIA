# GitHub Product OS - PlanearIA

> Estado: guia operativa vigente. `cerrados/PLAN_PASOS_INICIALES (closed).md`, Classroom e Infraestructura quedaron cerrados como cimientos (ver `01-planes-maestros/cerrados/`); esta guia mantiene GitHub Project alineado con planes activos/futuros.

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
- `Ciclo 3 - Infraestructura Local y CI`.
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
- Cada fase activa debe tener un bloque `GitHub/CI - Fase X` en el plan o en el issue, con issue/Project item, milestone, labels, estado inicial/final y scripts de validacion.
- Al cerrar una fase, dejar evidencia de comandos: `npx tsc --noEmit`, `npm run lint -- --quiet`, `npm test -- --runInBand`, tests focalizados y GitHub Actions si aplica.
- Si el usuario confirma una Review Manual y pide continuar, mover la fase a `Done` y registrar el comentario de cierre en GitHub.
- Si varias fases se resolvieron juntas durante un refactor, crear un issue consolidado que documente fases cubiertas, evidencia tecnica y pendientes manuales.

Ejemplo recomendado para Classroom:

- Epic: `Plan Maestro: Classroom / Grupos y Recursos`.
- Milestone: `Ciclo 2 - Fundacion Classroom`.
- Issue fase activa: crear solo la fase actual o la siguiente inmediata.
- Checklist dentro del issue: tareas internas de esa fase.

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

## Criterio de cierre y merge

- No mergear a `main` si CI falla.
- No cerrar fase UX/UI sin validacion manual cuando aplique.
- No cerrar plan maestro sin actualizar su tracking `[ ]`, `[~]`, `[x]`.
- No mergear cambios con secrets reales.
- No hacer commit automatico salvo que el usuario lo pida o confirme.

## Lectura Rapida de GitHub Actions

GitHub Actions es evidencia automatica, no tablero operativo. Para infraestructura actual, el workflow `CI` debe leerse asi:

| Job | Senal esperada |
| --- | --- |
| `TypeScript` | El proyecto compila con `npm run typecheck`. |
| `ESLint` | No hay errores de lint relevantes con `npm run lint -- --quiet`. |
| `Jest` | La suite completa pasa con `npm test -- --runInBand`. |
| `Backend smoke` | El backend instala dependencias propias y `GET /api/health` carga sin romper. |

Si un job falla:

- Abrir el run, entrar al job rojo y leer el primer error real.
- Reproducir localmente el comando del job antes de cambiar codigo.
- Registrar el comando corregido en el issue/fase activa.
- Mantener el Project como fuente de estado: `In progress`, `Review Manual`, `Blocked` o `Done`.

