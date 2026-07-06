# Planes Maestros

> **Estado:** vigente.
> **Uso:** meta guia y planes activos.
> **Fuente de verdad:** `meta_guia_planes.md`, planes activos, issue GitHub y OpenSpec.
> **No usar para:** implementar directo desde un plan sin issue enriquecido ni change OpenSpec.

## Lectura Obligatoria

1. `meta_guia_planes.md`: formato SDD y Protocolo de Interaccion Guiada.
2. `PLAN_UXUI_NAVEGACION_GLOBAL.md`: plan activo de UX/UI y backlog por olas.
3. `PLAN_AUTH_SEGURIDAD_SESION_REAL.md`: auth, sesiones, roles, secretos, backend multiusuario y `userId`.
4. `../05-context-engineering/README.md`: rutas de lectura y carbonizacion para IAs.

## Estado

| Plan | Estado |
| --- | --- |
| Meta Guia de Planes | Vigente. Instructivo obligatorio. |
| UX/UI y Navegacion Global | Activo. Blueprint + backlog de changes OpenSpec. |
| Auth, Seguridad y Sesion Real | Activo/en cierre. |

Los planes cerrados completos viven en respaldo externo. Sus reglas vigentes estan migradas a fundamentos, specs o planes activos.

## Como Se Ejecuta Un Plan

```text
Backlog del plan
  -> Change pendiente
    -> Issue GitHub
      -> Enrich
        -> OpenSpec propose/apply
          -> Evidencia
            -> Adversarial review
              -> Archive
```

Las specs archivadas son verdad de comportamiento. El historial completo se consulta solo si el usuario aporta el respaldo externo.
