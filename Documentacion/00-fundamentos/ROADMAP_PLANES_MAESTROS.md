# Roadmap de Planes Maestros - PlanearIA

Este archivo define orden recomendado, estado y criterios de activacion. No reemplaza los planes; solo orienta la secuencia.

## Reglas

- Planes activos: `Documentacion/01-planes-maestros/`.
- Planes cerrados: `Documentacion/01-planes-maestros/cerrados/`.
- Un plan futuro no se escribe hasta que el usuario lo pida.
- Todo plan nuevo debe seguir `meta_guia_planes.md`.
- GitHub Project acompana la ejecucion, pero el detalle vive en markdown.

## Estado De Planes Existentes

| Plan | Archivo | Estado |
| --- | --- | --- |
| Meta Guia de Planes | `01-planes-maestros/meta_guia_planes.md` | Vigente como instructivo obligatorio. |
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

### 2. Plan Maestro: UX/UI y Navegacion Global

Debe ser el siguiente plan grande. Objetivo:

- Definir arquitectura de experiencias objetivo.
- Decidir navegacion global web/tablet/movil.
- Definir sistema visual, tokens, componentes base y accesibilidad.
- Redisenar conceptualmente desde cero, incluso lo ya funcional.
- Decidir como Office Docente integra documentos, hojas/listas y asignacion a Classroom.
- Establecer reglas para Canva, WhatsApp, Calendario, Reportes y Cuenta.

Este plan no debe implementar toda la app de golpe. Debe producir blueprint, prioridades, ground truth y subplanes.

## Secuencia Recomendada Despues De UX/UI Global

1. `Plan Maestro: Office Docente`
   - Documentos, planeaciones, hojas, listas, rubricas, asistencia/calificaciones tabulares, import/export e IA de asignacion.
2. `Plan Maestro: Classroom Redesign e Integracion`
   - Aplicar la nueva navegacion/visual y conectar objetos de Office/Canva/WhatsApp.
3. `Plan Maestro: Cuenta, Configuracion y Accesibilidad Real`
   - Preferencias, tema, fuente, daltonismo, privacidad, sesiones, modo dev/admin y accesibilidad verificable.
4. `Plan Maestro: Calificacion y Revision de Tareas`
   - Entregas, rubricas, feedback, IA revisable y reportes base.
5. `Plan Maestro: Calendario y Seguimiento Personal`
   - Vista temporal conectada a clases, documentos, actividades y entregas.
6. `Plan Maestro: WhatsApp Docente`
   - Contactos, conversaciones, adjuntos, recursos compartidos, estados y notificaciones.
7. `Plan Maestro: Canva / Genially Docente`
   - Editor visual, plantillas, paginas/capas, exportacion y asignacion directa.
8. `Plan Maestro: Reportes, Analitica y Gamificacion`
   - Cuando existan datos reales suficientes.
9. `Plan Maestro: Activacion SQLite como Default`
   - Solo si una validacion futura lo justifica.
10. `Plan Maestro: Distribucion/Beta`
   - Solo cuando UX, auth, sync y demo esten maduros.

## Criterios De Activacion

| Plan | Activar cuando |
| --- | --- |
| UX/UI Global | Ya: es necesario para ordenar la vision y evitar mas interfaces heterogeneas. |
| Office Docente | Cuando UX/UI Global defina si Office sera tab, workspace o herramienta contextual. |
| Classroom Redesign | Cuando Office y navegacion objetivo definan como se asignan objetos a clases. |
| Cuenta/Accesibilidad | Junto o despues de UX/UI Global; hay preferencias y accesibilidad base pero falta cierre real. |
| Calificacion | Cuando actividades/entregas de Classroom sean flujo estable en el nuevo diseno. |
| Calendario | Cuando documentos y actividades tengan fechas confiables. |
| WhatsApp Docente | Cuando se decida el futuro de Social/Chat/Feed. |
| Canva | Cuando se necesite crear recursos visuales dentro del flujo, no solo subir archivos. |
| Reportes | Cuando haya datos reales suficientes. |
| SQLite default | Solo tras snapshot, migracion, rollback y validacion manual. |

## GitHub Product OS

- Mantener epic/fases de Auth hasta cierre formal.
- Crear epic de UX/UI Global solo cuando el usuario inicie ese plan.
- No crear issues para todos los planes futuros de una vez.
- Para avances grandes ya hechos, usar issues consolidados de progreso si el usuario lo pide.

## Version

- Ultima actualizacion: 2026-06-17.
