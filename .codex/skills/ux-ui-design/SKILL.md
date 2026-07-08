---
name: ux-ui-design
description: Design or review PlanearIA UX/UI, navigation, responsive web/tablet/mobile screens, design systems, AI chatbot UX, and teacher-first flows. Use for UX/UI Global, Asistente IA, Office Docente, Classroom, Canva/Genially, WhatsApp Docente, dashboards, accessibility-aware UI, or redesign work.
---

# UX/UI Design For PlanearIA

## Read First

- `CLAUDE.md`
- `Documentacion/00-fundamentos/VISION_ACTUAL.md`
- `Documentacion/04-referencia/MAPA_NAVEGACION_ACTUAL.md`
- `Documentacion/00-fundamentos/IHC_DISCOVERY_DOCENTE.md`
- `Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md`
- `Documentacion/99-archivo/prompt_mejorado_auditoria_uxui_ejecutada_2026-07.md` only as historical audit reference

## Product North Star

PlanearIA is a connected teacher suite, not a bundle of isolated modules. A teacher should create, organize, assign, communicate and follow up without jumping between apps, files, chats or tabs.

Core experiences:

- Inicio / Sistema Operativo Docente
- Asistente IA / ChatGPT Docente
- Office Docente: documents, lesson plans, sheets, lists, attendance, grades, rubrics and import/export
- Classroom / Clases
- Canva / Genially Docente
- WhatsApp Docente
- Calendario
- Reportes
- Cuenta / Accesibilidad / Seguridad

## Design Rules

- Prefer familiar mental models: Office, Classroom, Canva and WhatsApp.
- Start from a shared responsive screen for web/tablet/mobile.
- Treat current screens as capability inventory, not as visual constraints.
- Every screen needs entry point, main action, exit path, loading, empty, error and offline states.
- Sync state must be visible but calm.
- AI suggestions must be subtle, confirmable and reversible.
- Background AI requests must show origin, status and a reviewable result before the teacher applies changes.
- The AI chatbot can be explicit and conversational, but actions from it must still be confirmable and reversible.
- Do not leave dead controls that look usable.
- Use existing tokens and contexts: `src/themes/colors.ts`, ThemeContext, FontSizeContext, DaltonismoContext.

## Implementation Fit

- Preserve MVVM: screens stay thin, hooks own behavior, services own I/O.
- Do not bypass `src/sync` for academic syncable data.
- Do not fork web and mobile unless the UX need is real and documented.
- Prefer component extraction only when it reduces real duplication or supports a repeated pattern.

## Output Shape

When designing, provide:

1. User goal.
2. Screen or flow structure.
3. Responsive behavior.
4. States.
5. Components/tokens affected.
6. Risks and tests.
