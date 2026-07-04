---
name: ai-gateway
description: Design or modify PlanearIA AI features, backend AI gateway calls, first-party chatbot/LLM assistant, prompts, structured outputs, local LM Studio providers, IA-first UX suggestions, or teacher workflow automation.
---

# AI Gateway For PlanearIA

## Read First

- `CLAUDE.md`
- `Documentacion/00-fundamentos/VISION_ACTUAL.md`
- `Documentacion/00-fundamentos/IA_CHATBOT_LLM.md`
- `backend/lib/aiGateway.js`
- `backend/lib/aiUsageLimiter.js`

## Rules

- AI provider calls happen server-side only.
- The first-party ChatGPT/Gemini-like assistant must use backend gateway endpoints.
- LM Studio/local OpenAI-compatible providers are allowed through `AI_GATEWAY_PROVIDERS` only when the backend can reach them.
- Do not expose provider keys in frontend code, docs, screenshots or commits.
- Keep prompts grounded in teacher workflows and current app data.
- AI output is a draft or suggestion, never final truth.
- Ask for confirmation before assigning, sending, deleting or changing classroom data.
- Background LLM tasks, such as document corrections, must produce reviewable copies, drafts, diffs or chat summaries before applying changes.
- Preserve offline work. If AI requires network, the manual flow must still work.

## Product Pattern

AI should connect work across experiences:

- Read a document or sheet.
- Chat with attached PlanearIA objects or uploaded files.
- Suggest an approved background request to the PlanearIA LLM when a teacher is editing, such as "Pedir correcciones al DocenteLLM?".
- Detect class, subject, unit, dates, activities, resources or students.
- Suggest where it belongs.
- Let the teacher confirm, adjust or cancel.
- Create the assignment, reminder, resource or report through existing app flows.

## Backend Checklist

- Auth required where user data is involved.
- Rate limiting applied.
- Input validated and normalized.
- Output shape typed or schema-checked before returning.
- Errors are user-safe and do not leak provider details.
