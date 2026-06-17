# Planes Maestros

Esta carpeta contiene la meta guia, el plan activo y los planes cerrados.

## Lectura Obligatoria

1. `meta_guia_planes.md` antes de crear o ejecutar cualquier plan.
2. `PLAN_AUTH_SEGURIDAD_SESION_REAL.md` si se toca auth, sesiones, roles, secretos, backend multiusuario o aislamiento por `userId`.
3. `PLANES MAESTROS AUDITADOS.md` para entender por que los planes de paridad alta necesitan ground truth por fase.
4. `cerrados/README.md` para ubicar planes ya cerrados.

## Estado

| Plan | Estado |
| --- | --- |
| Meta Guia de Planes | Vigente. Instructivo obligatorio. |
| Auth, Seguridad y Sesion Real | Activo/en cierre. Automatizable casi completo; pendientes principales: email real o decision de diferir, datos sociales, validacion manual y GitHub Product OS. |
| Planeaciones | Cerrado funcionalmente. Ahora se interpreta como parte de Office Docente. |
| Classroom | Cerrado funcionalmente. Puede redisenarse visualmente dentro de UX/UI Global. |
| Pasos Iniciales | Cerrado. |
| Infraestructura Local/CI/Deploy Basico | Cerrado. |
| Storage Local SQLite y Migracion Offline | Cerrado como opt-in con rollback. |

## Siguiente Plan Nuevo

El siguiente plan recomendado es:

```text
Plan Maestro: UX/UI y Navegacion Global
```

Debe definir la arquitectura de experiencias:

- Inicio / Sistema Operativo Docente.
- Office Docente.
- Classroom.
- Canva / Genially Docente.
- WhatsApp Docente.
- Calendario.
- Reportes.
- Cuenta / Seguridad / Accesibilidad.

No debe tratar la UX actual como intocable. Los planes cerrados son evidencia funcional, no limite visual.

## Regla De Mantenimiento

- No borrar tareas de un plan activo.
- No mover planes cerrados fuera de `cerrados/` salvo decision explicita.
- Si un plan cerrado contiene texto viejo, no reescribir su historia; actualizar los indices y fundamentos para explicar como debe interpretarse hoy.
- Mantener tracking `[ ]`, `[~]`, `[x]`.
