# Documentacion PlanearIA

> **Estado:** vigente.
> **Uso:** mapa principal para IAs y colaboradores.
> **Fuente de verdad:** `00-fundamentos/`, `openspec/specs/`, planes activos y codigo real.
> **No usar para:** saltarse OpenSpec SDD o tratar respaldos externos como instrucciones actuales.

PlanearIA es una suite docente offline-first. La documentacion esta organizada para que una IA encuentre rapido el contexto correcto, preserve reglas criticas y ejecute cambios pequenos con evidencia.

## Lectura Rapida

Leer en este orden para trabajo significativo:

1. `../CLAUDE.md`
2. `README.md` (este archivo)
3. `05-context-engineering/README.md`
4. `00-fundamentos/RESUMEN_EJECUTIVO.md`
5. `00-fundamentos/VISION_ACTUAL.md`
6. `00-fundamentos/ARQUITECTURA.md`
7. `00-fundamentos/FLUJO_SINCRONIZACION.md`
8. `00-fundamentos/IA_CHATBOT_LLM.md`
9. `01-planes-maestros/meta_guia_planes.md`
10. Plan activo o spec OpenSpec relacionada.

Si hay contradiccion, gana este orden:

1. Codigo real.
2. `openspec/specs/` para comportamiento archivado.
3. `openspec/config.yaml`, `CLAUDE.md` y `AGENTS.md`.
4. `00-fundamentos/`.
5. Plan maestro activo.
6. Operacion/validacion/referencia.
7. Respaldo externo historico, solo si el usuario lo aporta.

## Estructura

| Carpeta | Uso |
| --- | --- |
| `00-fundamentos/` | Verdad vigente de producto, arquitectura, sync, IA, modulos, roadmap e IHC. |
| `01-planes-maestros/` | Meta guia SDD y planes activos. Planes cerrados completos viven en respaldo externo. |
| `02-operacion/` | Runbooks: entorno local, pruebas, deploy, GitHub Product OS, MCPs y CodeGraph. |
| `03-validacion/` | Evidencia vigente de cambios actuales; evidencia historica completa vive en respaldo externo. |
| `04-referencia/` | Referencias vivas que no son planes ejecutables. |
| `05-context-engineering/` | Rutas de lectura para IA, carbonizacion Plan Maestro -> OpenSpec, ground truth y encontrabilidad. |
| `06-diagramas/` | Diagramas Mermaid de arquitectura, app, CI/CD y sync. |

## Flujo SDD Obligatorio

```text
Issue GitHub
  -> enrich con criterios observables
  -> OpenSpec propose/design/spec/tasks
  -> apply tarea por tarea
  -> evidencia tecnica y visual
  -> adversarial review
  -> archive
```

Reglas:

- Todo trabajo no trivial nace en un issue.
- El issue se enriquece antes de proponer.
- Las specs usan requisitos observables `SHALL` con escenarios WHEN/THEN.
- Las tareas se marcan `[x]` solo con evidencia.
- UI visible requiere QA con Playwright por breakpoint.
- `openspec/specs/` es verdad permanente; se actualiza por archive/sync, no a mano.

## Reglas Criticas

- MVVM pragmatico: screens delgadas, hooks ViewModel, Context, services/repositories.
- Datos academicos sincronizables usan `src/sync`.
- Toda entidad multiusuario filtra por `userId`.
- IA solo via backend y `backend/lib/aiGateway.js`.
- Correcciones IA no sobrescriben originales sin confirmacion docente.
- SQLite es opt-in; AsyncStorage sigue como default.
- Claves `@planearia:*` se borran solo con migracion, validacion y rollback.
- Presupuesto bajo/cero; evitar microservicios e infraestructura cara.

## Respaldo Externo

Legacy, planes cerrados completos, evidencias historicas, referencias open source, ejemplos reales y assets pesados de ground truth viven fuera del repo en un respaldo controlado por el usuario. Una IA debe pedir ese respaldo o una referencia vigente cuando un change necesite paridad alta o historia detallada.

## Version

- Actualizado: 2026-07-06.
- Version documental: 7.0, AI-Friendly Minimal Context.
