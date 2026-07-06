# Instrucciones Para GitHub Copilot - PlanearIA

> **Estado:** vigente.
> **Uso:** contexto compacto para asistentes ligeros dentro de GitHub/IDE.
> **Fuente de verdad:** `CLAUDE.md`, `AGENTS.md`, `Documentacion/README.md`, `openspec/config.yaml`.
> **No usar para:** implementar cambios no triviales sin issue enriquecido y change OpenSpec.

## Contexto

PlanearIA es una suite docente offline-first para profesores mexicanos. Usa React Native + Expo SDK 54 + TypeScript, backend Node serverless, MongoDB Atlas, JWT con refresh sessions, AsyncStorage default y SQLite opt-in.

Arquitectura:

- Monolito modular.
- MVVM pragmatico: screens delgadas, hooks ViewModel, Context y services/repositories.
- Sync academico global en `src/sync`.
- Backend en `backend/api/index.js` + `backend/routes`.
- IA por `backend/lib/aiGateway.js`; nunca desde frontend.

## Flujo De Trabajo

Cambios no triviales siguen OpenSpec SDD:

1. Issue GitHub.
2. Enrich con criterios observables.
3. OpenSpec proposal/design/spec/tasks.
4. Apply tarea por tarea.
5. Evidencia tecnica y visual.
6. Adversarial review.
7. Archive.

No marcar tareas como completas sin evidencia. UI visible requiere Playwright por breakpoint.

## Reglas Criticas

- Datos academicos sincronizables usan `src/sync`; no crear colas paralelas.
- Toda entidad multiusuario filtra por `userId`.
- IA solo via backend y `aiGateway`.
- Correcciones IA generan copia, borrador, diff o resumen revisable; no sobrescriben originales sin confirmacion.
- SQLite no es default.
- No borrar `@planearia:*` sin migracion, validacion y rollback.
- No guardar secretos en codigo ni commits.
- Presupuesto bajo/cero: evitar microservicios o servicios caros sin aprobacion.
- Usar tokens/temas existentes; no inventar paletas por pantalla.
- Manejar loading, empty, error, offline y accesibilidad.

## Lectura Recomendada

- `Documentacion/README.md`
- `Documentacion/05-context-engineering/README.md`
- `Documentacion/00-fundamentos/ARQUITECTURA.md`
- `Documentacion/00-fundamentos/FLUJO_SINCRONIZACION.md`
- `Documentacion/00-fundamentos/IA_CHATBOT_LLM.md`
- `Documentacion/01-planes-maestros/meta_guia_planes.md`
- Plan/spec/carpeta `context/` relacionada.

## Validacion

```bash
npm run typecheck
npm run lint -- --quiet
npm test -- --runInBand
npm run backend:check
```

Usar tests focalizados cuando el cambio sea pequeño y ampliar si toca sync, auth, backend, IA o UI compartida.