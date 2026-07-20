# Context Engineering - PlanearIA

> **Estado:** vigente.
> **Uso:** enrutar a una IA o colaborador humano hacia el contexto minimo correcto antes de proponer o implementar.
> **Fuente de verdad:** este archivo organiza lecturas; no reemplaza `CLAUDE.md`, `openspec/config.yaml` ni `00-fundamentos/`.
> **No usar para:** saltarse el flujo OpenSpec SDD o justificar cambios sin evidencia.

## Regla Principal

PlanearIA trabaja con contexto dirigido. Una IA no lee todo el repo: identifica el tipo de tarea, lee las fuentes vigentes, verifica codigo real con GitNexus como herramienta estructural primaria cuando toca implementacion y usa CodeGraph como fallback/fuente lineada cuando hace falta, antes de ejecutar el cambio con GitHub issue + OpenSpec.

## Ruta Cero Para Cualquier Agente

1. `AGENTS.md` o `CLAUDE.md`.
2. `Documentacion/README.md`.
3. Este archivo.
4. Fuentes especificas por tipo de trabajo.
5. `openspec/config.yaml` antes de proponer/aplicar.

## Que Leer Segun La Tarea

| Tarea | Leer primero | Evidencia esperada |
| --- | --- | --- |
| Ejecutar una User Story | `01-planes-maestros/meta_guia_planes.md`, `02-operacion/MCP_FLUJOS_PLANEARIA.md`, issue GitHub | Issue enriquecido, change OpenSpec, tasks con evidencia |
| UX/UI visible | `01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md`, `00-fundamentos/IHC_DISCOVERY_DOCENTE.md`, `context/README.md` | Capturas Playwright por breakpoint, checklist Nielsen |
| Theming/accesibilidad | `openspec/specs/settings-accessibility-preferences/spec.md`, `src/themes/`, contexts de tema/fuente/daltonismo | Tests afectados + QA visual |
| Sync/offline | `00-fundamentos/FLUJO_SINCRONIZACION.md`, `src/sync/README.md`, GitNexus (+ CodeGraph si hace falta fuente lineada) | Tests sync/backend, no perdida local |
| Backend/auth/datos | `00-fundamentos/ARQUITECTURA.md`, `01-planes-maestros/PLAN_AUTH_SEGURIDAD_SESION_REAL.md`, `backend/README.md` | `backend:check`, aislamiento `userId` |
| IA/LLM | `00-fundamentos/IA_CHATBOT_LLM.md`, `backend/lib/aiGateway.js`, reglas backend | Fallback proveedor, limites, confirmacion docente |
| Plan Maestro nuevo | `01-planes-maestros/meta_guia_planes.md`, `00-fundamentos/ROADMAP_PLANES_MAESTROS.md` | Blueprint + backlog de changes, no fases tecnicas largas |
| Preparar repositorio nuevo | [Plan](../01-planes-maestros/PLAN_CONSTRUCTOR_PROYECTOS_NUEVOS.md), [índice](../02-operacion/constructor-proyectos/README.md), [Prompt 00](../02-operacion/constructor-proyectos/PROMPT_00_BOOTSTRAP_ENTORNO.md) | Bootstrap neutral, doctor, segundo run sin drift; ninguna pregunta de producto |
| Deuda tecnica / saneamiento | [Runbook Debt Control](../02-operacion/CONTROL_DEUDA_TECNICA.md), `.project-os/debt/`, `npm run debt:check` | Assessment por flujo, registro verificado, presupuesto y pausa por plan |
| Referencia visual | `context/<modulo>-ground-truth/` y respaldo externo si hace falta | Ground truth citado en `design.md` |
| Archivo/historia | Respaldo externo del usuario | Solo contexto historico si el usuario lo aporta; nunca fuente ejecutable |

## Carbonizacion De Plan Maestro

```text
Plan Maestro
  -> Ola activa
    -> Change pendiente
      -> Issue GitHub
        -> Enrich con criterios observables
          -> OpenSpec proposal/design/spec/tasks
            -> Apply tarea por tarea
              -> Evidencia tecnica y visual
                -> Adversarial review
                  -> Archive y specs permanentes
```

Reglas:

- Un change grande a la vez.
- El plan maestro contiene vision y backlog; `tasks.md` del change contiene trabajo tecnico.
- `openspec/specs/` es verdad de comportamiento archivada; no se edita a mano.
- UI visible requiere Playwright y evidencia por breakpoint. El gate visual no se marca como N/A por defecto.

## Politica De Ground Truth

- Paridad alta: Figma, stubs de `context/<modulo>-ground-truth/` y respaldo externo del usuario cuando haga falta.
- Referencias open source: inspiracion y analisis, no copia de codigo.
- Capturas reales: se usan solo si el usuario aporta respaldo externo y aprueba su uso.
- Material sensible: no exponer nombres, listas, alumnos, escuelas o documentos privados en prompts ni reportes publicos.

## Prueba De Encontrabilidad IA

Al cerrar un overhaul documental, comprobar que una IA puede responder con rutas concretas:

1. Donde esta el flujo SDD obligatorio?
2. Donde estan las reglas de sync offline-first?
3. Donde esta la regla de IA via backend?
4. Donde esta el ground truth para una pantalla de alta paridad?
5. Donde se guarda la evidencia de QA?
6. Que carpetas no son fuente ejecutable?
7. Donde esta el runbook para preparar un repositorio sin producto?
8. Que acciones del constructor requieren intervencion humana?
9. Donde se distingue nucleo universal de perfiles condicionales?

La respuesta aceptable debe llegar a las rutas correctas en menos de 3 saltos desde `AGENTS.md` o `CLAUDE.md`.

Para las preguntas 7-9, la entrada canónica es el
[índice del constructor](../02-operacion/constructor-proyectos/README.md); desde allí cada respuesta está a
un enlace.
