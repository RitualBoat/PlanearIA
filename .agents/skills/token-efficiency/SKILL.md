---
name: token-efficiency
description: Use only when a PlanearIA master plan, meta_guia_planes, issue, or user explicitly asks for NORMAL/CAVEMAN mode, token saving, compact execution, or efficient mechanical implementation. Do not use by default on every interaction.
---

# Token Efficiency For PlanearIA

## Purpose

Use this skill to choose a compact work mode during plan execution. It is a scoped execution aid, not a global personality or quality rule.

## NORMAL Mode

Use `NORMAL` when the task still needs judgment:

- Architecture, product or UX/UI decisions.
- Audit, planning, research or diagnosis.
- Security, data migration, sync strategy or cost tradeoffs.
- Ambiguous requirements.
- User-facing explanations, evidence and handoff summaries.

In `NORMAL`, keep enough context to explain decisions and risks.

## CAVEMAN Mode

Use `CAVEMAN` only after the direction is already approved and the work is mechanical:

- Create files from an approved spec.
- Move, rename or update imports.
- Implement small helpers/facades already designed.
- Write tests with clear expected behavior.
- Fix lint/typecheck failures.
- Run validations.
- Mark checkboxes or update GitHub Project fields.

In `CAVEMAN`, minimize narration, avoid re-litigating decisions and report only what changed, what passed and what remains.

## Guardrails

- Do not use `CAVEMAN` for unresolved architecture, UX/IHC, security, auth, data loss, deploy or cost decisions.
- If a phase mixes thinking and execution, start in `NORMAL`, close the decision, then switch to `CAVEMAN` for mechanical implementation.
- Return to `NORMAL` at the end of a phase to summarize evidence, risks and next decisions.
