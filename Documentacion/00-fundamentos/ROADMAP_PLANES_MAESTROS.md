# Roadmap de Planes Maestros - PlanearIA

Este archivo define orden recomendado, estado y criterios de activacion. No reemplaza los planes; solo orienta la secuencia.

## Reglas

- Planes activos: `Documentacion/01-planes-maestros/`.
- Planes cerrados: `Documentacion/01-planes-maestros/cerrados/`.
- Un plan futuro no se escribe hasta que el usuario lo pida.
- Todo plan nuevo debe seguir `meta_guia_planes.md` v3: formato SDD (Blueprint + backlog de changes
  OpenSpec). Las tareas tecnicas viven en el `tasks.md` de cada change, no en el plan.
- GitHub Project acompana la ejecucion, pero el detalle vive en markdown y en `openspec/`.

## Estado De Planes Existentes

| Plan | Archivo | Estado |
| --- | --- | --- |
| Meta Guia de Planes | `01-planes-maestros/meta_guia_planes.md` | Vigente como instructivo obligatorio (v3, SDD con OpenSpec). |
| UX/UI y Navegacion Global | `01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md` | ACTIVO (2026-07). Blueprint + backlog de changes por olas; primer plan en formato SDD. |
| Auth, Seguridad y Sesion Real | `01-planes-maestros/PLAN_AUTH_SEGURIDAD_SESION_REAL.md` | Activo/en cierre. Automatizable casi completo; faltan email real o decision de diferir, datos sociales, validacion manual y GitHub Product OS. |
| Planeaciones | `01-planes-maestros/cerrados/plan_planeaciones (closed).md` | Cerrado funcionalmente. En la vision nueva se absorbe en Office Docente. |
| Classroom | `01-planes-maestros/cerrados/PLAN_CLASSROOM (closed).md` | Cerrado funcionalmente. Puede redisenarse visualmente en UX/UI Global. |
| Pasos Iniciales | `01-planes-maestros/cerrados/PLAN_PASOS_INICIALES (closed).md` | Cerrado. |
| Infraestructura Local, CI y Deploy Basico | `01-planes-maestros/cerrados/PLAN_INFRAESTRUCTURA_LOCAL_CI_DEPLOY (closed).md` | Cerrado. |
| Storage Local SQLite y Migracion Offline | `01-planes-maestros/cerrados/PLAN_STORAGE_LOCAL_SQLITE_MIGRACION_OFFLINE (closed).md` | Cerrado como opt-in con rollback. |

## Siguiente Plan Recomendado

### 1. Cierre de Auth

Antes de abrir una beta real o tocar datos sensibles con usuarios externos, cerrar formalmente:

- Email real o decision explicita de diferirlo.
- Validacion manual auth/sesion/roles.
- Datos sociales pendientes o decision de dejarlos para WhatsApp Docente.
- GitHub Product OS sincronizado.

### 2. Plan Maestro: UX/UI y Navegacion Global (YA ACTIVO)

Escrito el 2026-07-04 en formato SDD: `01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md`.
Contiene blueprint (decisiones D1-D12), backlog de changes por olas (0: fundaciones, 1: shell,
2: nucleo visible + entrevistas IHC, 3: experiencias, 4+: resto) y criterio de cierre.
El piloto natural del flujo OpenSpec es el change `theming-runtime` de la Ola 0.

## Secuencia Despues De UX/UI Global

La mayoria de los antiguos "planes futuros" de experiencia (Office, Asistente IA, Classroom redesign,
Cuenta/Accesibilidad, Calendario, WhatsApp, Canva, Reportes) ya NO seran documentos-plan separados:
son grupos de changes dentro del backlog del plan UX/UI (olas 3 y 4+). Solo ameritan plan maestro
propio si su alcance crece mas alla de lo que el backlog describe.

Planes que si seguiran siendo documentos propios cuando toquen:

1. `Plan Maestro: Calificacion y Revision de Tareas` — entregas, rubricas, feedback e IA revisable a fondo.
2. `Plan Maestro: Activacion SQLite como Default` — solo si una validacion futura lo justifica.
3. `Plan Maestro: Distribucion/Beta` — solo cuando UX, auth, sync y demo esten maduros.

## Criterios De Activacion

| Trabajo | Activar cuando |
| --- | --- |
| UX/UI Global | ACTIVO. Decisiones tomadas: Office = tab/experiencia madre con NotasPLAN/CalcuPLAN/PresentaPLAN; Asistente = tab movil + panel acoplable web; Feed+Social = ConectaPLAN. |
| Changes Ola 0-1 (fundaciones/shell) | Ya: son prerequisito de toda pantalla nueva. |
| Changes Ola 2 (Escritorio, Office home) | Tras archivar Ola 1; incluye entrevistas IHC con prototipo. |
| Changes Ola 3 (NotasPLAN, CalcuPLAN, Clases, AsistePLAN) | Tras Ola 2 y sintesis de entrevistas. |
| Changes Ola 4+ (ConectaPLAN, AgendaPLAN, DiseñaPLAN, ReportaPLAN, Cuenta) | Por prioridad tras Ola 3; ReportaPLAN solo con datos reales suficientes. |
| Calificacion (plan propio) | Cuando actividades/entregas de Clases sean flujo estable en el nuevo diseno. |
| SQLite default (plan propio) | Solo tras snapshot, migracion, rollback y validacion manual. |
| Distribucion/Beta (plan propio) | Solo cuando UX, auth, sync y demo esten maduros. |

## GitHub Product OS

- Mantener epic/fases de Auth hasta cierre formal.
- Crear el epic de UX/UI Global cuando arranque la Ola 0; un issue por change (solo la ola activa y la
  siguiente), milestones = olas. Mapping completo en `meta_guia_planes.md` v3 seccion 6.
- No crear issues para todos los changes futuros de una vez.
- Para avances grandes ya hechos, usar issues consolidados de progreso si el usuario lo pide.

## Version

- Ultima actualizacion: 2026-07-04 (plan UX/UI activo; roadmap migrado al formato SDD/OpenSpec).
