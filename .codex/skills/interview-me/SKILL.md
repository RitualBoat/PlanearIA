---
name: interview-me
description: Interview the user before drafting or creating PlanearIA features, GitHub issues, user stories, OpenSpec changes, project tasks, or product/architecture decisions. Use when the user asks to create, refine, or prepare an issue, story, feature, requirement, proposal, SDD item, GitHub Project item, or when their intent is broad, ambiguous, exploratory, or decision-oriented.
---

# Interview Me

## Purpose

Clarify the user's real intent before converting an idea into a user story, GitHub issue, GitHub Project item, OpenSpec change, or implementation plan.

Do not rush to a polished issue when the request still hides unresolved decisions. Interview until the intent is effectively ready, then produce the issue-grade artifact or create the issue if requested and tools are available.

## Workflow

1. Classify the request:
   - Feature/build request.
   - Bug/fix request.
   - UX/product request.
   - Technical debt/refactor request.
   - Architecture/tooling decision.
   - Research/spike/evaluation.
   - SDD/OpenSpec change.

2. State the current intent confidence as a percentage and name the biggest uncertainty.

3. Ask a focused interview round:
   - Ask 3 to 7 questions per round.
   - Put the highest-risk unknowns first.
   - Use direct questions, not long forms.
   - Offer options only when options reduce ambiguity.
   - Avoid asking for information that can be discovered from repo docs, code, or existing issues.

4. Continue interviewing until intent confidence is at least 95%.

5. Convert the clarified intent into the appropriate artifact:
   - User story.
   - GitHub issue body.
   - GitHub Project-ready issue.
   - OpenSpec-ready change brief.
   - Research/spike brief.
   - Decision record candidate.

6. If the user asked to create the issue, use GitHub tooling after the issue body is ready. For PlanearIA, include enough detail to support Step 0 of the SDD workflow before OpenSpec propose/apply.

## 95% Intent Standard

Treat 95% as a readiness heuristic, not a mathematical truth. The artifact is ready only when all critical dimensions are clear or explicitly assumed:

- Actor: who benefits or performs the action.
- Problem: what pain, risk, inefficiency, or opportunity exists.
- Outcome: what should be true after the work.
- Scope: what is included and excluded.
- Decision type: build now, evaluate, migrate, compare, document, or deprecate.
- Constraints: budget, stack, architecture, data, security, offline-first, SDD, timelines.
- Success criteria: observable acceptance criteria and evidence.
- Risks: rollback, compatibility, data loss, workflow disruption, agent/tool reliability.
- Dependencies: docs, GitHub Projects, OpenSpec, MCP tools, commands, external services.

If any critical dimension is unknown, confidence is below 95%. Ask another round.

## PlanearIA Rules

For PlanearIA work:

- Respect AGENTS.md, CLAUDE.md, OpenSpec SDD, and the project documentation hierarchy.
- Non-trivial product or architecture work must start with a GitHub issue or project item before OpenSpec propose/apply.
- Do not frame a decision as a pre-decided implementation. If the user is unsure, create a research/spike issue with decision criteria.
- Include MVVM, offline-first, sync, userId isolation, AI gateway, cost constraints, and validation impact when relevant.
- For tooling or agent workflow changes, specify documentation updates and operational commands that future agents must follow.

## Issue Output Template

When ready, produce this shape:

```markdown
## User Story
As a <actor>, I want <capability/decision>, so that <measurable outcome>.

## Context / Problem
<Why this matters now, what is painful, and what uncertainty/risk exists.>

## Desired Outcome
<The future state, including whether this is implementation, research, migration, or decision.>

## Scope
- In scope: <items>
- Out of scope: <items>

## Acceptance Criteria
- [ ] <Observable criterion>
- [ ] <Observable criterion>
- [ ] <Observable criterion>

## Decision Criteria
- <Use for architecture/tooling/research issues.>

## SDD / Documentation Impact
- <Docs, OpenSpec, agent guide, commands, flow updates.>

## Validation / Evidence
- <Checks, demos, docs proof, command output, comparison matrix, QA.>

## Risks / Open Questions
- <Remaining non-blocking risks or assumptions.>
```

## Interview Style

Be precise, calm, and persistent. The user is not merely asking for nicer wording; they are trying to reveal the right work. Challenge premature conclusions gently, especially when a request says "migrate", "replace", "rewrite", or "delete" before evidence exists.

When the user asks for a GitHub issue from an exploratory idea, prefer a spike/evaluation issue unless the evidence already supports an implementation decision.
