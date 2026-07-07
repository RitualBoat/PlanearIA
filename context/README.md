# Contexto Minimo - PlanearIA

> **Estado:** vigente como indice ligero.
> **Uso:** enrutar a ground truth o referencias sin cargar el repo con material pesado.
> **Fuente de verdad:** `Documentacion/05-context-engineering/README.md`, fundamentos activos y specs OpenSpec.
> **No usar para:** asumir que assets, ejemplos sensibles, repos externos o evidencia historica viven dentro del repo.

## Politica

PlanearIA conserva en Git solo contexto minimo para IA. El material completo de legacy, estudio, referencias externas, ejemplos reales y assets pesados fue externalizado a un respaldo controlado por el usuario durante `repo-max-clean-context-externalization`.

Cuando un change necesite paridad alta, evidencia historica o ejemplos reales:

1. Pedir al usuario el respaldo externo o una referencia vigente.
2. Registrar en `design.md` que fuente se uso.
3. Redactar datos sensibles antes de pegarlos en prompts, issues o evidencia.
4. Declarar bloqueo en OpenSpec si el ground truth requerido no esta disponible.

## Indices Disponibles

| Ruta | Uso |
| --- | --- |
| `classroom-ground-truth/` | Stub para referencias de Clases/Classroom. |
| `planeaciones-ground-truth/` | Stub para Office Docente/NotasPLAN. |
| `excel-ground-truth/` | Stub para CalcuPLAN. |
| `chat-ground-truth/` | Stub para AsistePLAN/ConectaPLAN. |
| `referencias-opensource/` | Stub de referencias open source externalizadas. |
| `referencias-app-similares-a-planearia/` | Stub de benchmarking visual externalizado. |
| `infraestructura-ground-truth/` | Stub de evidencia historica tecnica. |
| `planeaciones-reales/` | Stub de ejemplos reales sensibles. |
| `OpenSpec/` | Stub de material de estudio externalizado. |

CodeGraph debe enfocarse en `src/`, `backend/`, `types/`, `shared/` y configuracion del proyecto; no en material externo.
