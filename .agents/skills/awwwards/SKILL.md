---
name: awwwards
description: Use when the user wants showcase-tier, "jaw-dropping", "Awwwards-tier" visual quality for a specific surface (landing page, hero section, onboarding, a memorable transition, an empty state that wows), or asks to evaluate/score a design against showcase criteria, or to decide how bold a given screen should be. This is the ASPIRATIONAL + EVALUATION layer for PlanearIA. It decides WHERE to push intensity and JUDGES the result; it defers fine-grained design vocabulary (typography/color/spacing/motion recipes) to the `impeccable` skill and the anti-slop pass to PLAN_UXUI_NAVEGACION_GLOBAL.md section 1.9. Not for backend, and not for sober daily work screens where calm and speed win over spectacle.
version: 1.0.0
---

# awwwards — Showcase-tier design for PlanearIA

Purpose: push the RIGHT surfaces of PlanearIA to a level that would survive an Awwwards jury,
WITHOUT betraying the product's core promise (familiaridad y calma) or its constraints (Android
gama media, presupuesto cero, React Native + Expo). Spectacle is a tool, aimed on purpose.

This skill is the aspirational/evaluation layer. It works WITH, not instead of, the others:

- `impeccable` → the design vocabulary and per-element craft (23 commands: typography, color, motion...).
- `awwwards` (this) → decides intensity zone, applies the phased pipeline, and scores the result.
- `PLAN_UXUI_NAVEGACION_GLOBAL.md` §1.9 → the binding rules (anti-slop checklist, RN translation,
  motion/performance budget). This skill NEVER overrides §1.9; it operationalizes it.

## 0. Hard guardrails (from the plan — non-negotiable)

- **Stack translation.** Motion only via `react-native-reanimated` + `gesture-handler` in the app.
  Tailwind / GSAP / Framer Motion are DOM-only and PROHIBITED in the RN app; they are allowed ONLY in
  the separate `landing-web` artifact. Glassmorphism via `expo-blur`, budgeted, overlays only.
- **Reduce-motion + 60fps on mid-range Android.** Every effect has a static equivalent
  (`AccessibilityInfo.isReduceMotionEnabled`) and degrades (blur/gradient → solid) if it janks.
- **Anti-alucinación.** Verify reanimated/gesture-handler/expo APIs in Context7 before writing them;
  explore code with CodeGraph before editing.
- **The wow lives in the polish (motion, rhythm, detail), not in exotic layouts.** A "Word" that
  no longer feels like Word is a failure, not a win.

## 1. Decide the intensity zone FIRST (do not skip)

Before any bold move, place the surface in a zone (plan §1.9.1). Spending spectacle in the wrong zone
is the #1 way to make PlanearIA worse.

| Zone | Intensity | Examples |
| --- | --- | --- |
| Landing web / marketing | Maximum — full Awwwards treatment allowed verbatim | `landing-web` change |
| Onboarding, empty states, cross-experience transitions | High — memorable, low-frequency moments | onboarding-suite, first empties |
| Escritorio (dock, tablero) | Medium-high — premium but calm, seen daily | escritorio-docente |
| Work screens (editors, lists, grading) | Sober — calm, precision, zero distraction | NotasPLAN, CalcuPLAN, Clases lists |

If the target is a sober work screen and the user asks to "make it jaw-dropping", push back: the
right move there is craft (rhythm, clarity, one meaningful micro-interaction), not spectacle. Say so.

## 2. The 9-phase visual pipeline (per surface)

1. **Intent & zone** — what is this surface for, who uses it (María/Luis/Carmen), which zone (§1).
2. **Reference & ground truth** — gather real references; the Figma frame is the source of truth
   (pipeline D11: Stitch/Codex Design diverge → curate in Figma → Figma MCP feeds implementation).
3. **Concept directions** — 2-3 distinct visual directions (e.g. calm-editorial vs. bold-spatial vs.
   playful-bento). Pick one with the user; keep the best idea from the runners-up.
4. **Composition & hierarchy** — grid, focal point, reading order, bento structure if it fits.
   Hand fine typography/spacing/color to `impeccable`.
5. **Signature moment** — ONE thing this surface will be remembered for (a hero reveal, a dock that
   springs to life, a checkmark that draws). Not five; one, done impeccably.
6. **Motion design** — spring configs from motion tokens (reanimated `withSpring`); scroll-triggered
   via `useAnimatedScrollHandler`; haptics + spring on press (magnetic-button feel without hover).
7. **States as craft** — loading (premium shimmer), empty (accionable + intentional illustration/icon),
   error (honest, in teacher Spanish), offline (calm). Never improvised.
8. **Build in-stack** — translate to RN + tokens; verify APIs in Context7; explore with CodeGraph.
   Landing only: DOM stack (GSAP/Framer/Tailwind) permitted.
9. **Judge & iterate** — score with §3 + Playwright QA loop across 3 breakpoints until it passes.
   PROHIBIDO archivar UI sin cumplir los 5 criterios de salida del Protocolo 2.5.

## 3. Awwwards-style scoring (adapted to a teacher suite)

Score 0-10 on each; a surface is "showcase-ready" only when it clears the bar for its zone.
Awwwards weights roughly: Design 40%, Usability 30%, Creativity 20%, Content 10%.

- **Design (40%)** — hierarchy, rhythm, typography, color discipline (from tokens), consistency.
  Bar: landing >=9, high-zone >=8, medium >=7.5, sober screens judged on clarity not flash.
- **Usability (30%)** — a teacher reaches the primary task without thinking; Nielsen sin sev>=3;
  reduce-motion respected; 60fps on mid-range Android. NON-NEGOTIABLE: usability never sacrificed
  for design in PlanearIA. A beautiful screen María can't use fast is a 0.
- **Creativity (20%)** — the signature moment is genuinely fresh, not a template. Passes the
  anti-slop checklist (§1.9.3): remove the logo and it's still recognizably PlanearIA.
- **Content (10%)** — copy is teacher-real (Carmen's language), not lorem; empties teach the next step.

If Usability < 7 on any zone, the surface FAILS regardless of Design score. That is the PlanearIA rule.

## 4. Anti-patterns this skill must refuse

- Spectacle on sober work screens (spend it on landing/onboarding instead).
- Any DOM-only motion lib in the RN app (GSAP/Framer/Tailwind) — landing only.
- Effects with no static/reduce-motion fallback, or that drop below 60fps on mid-range Android.
- "Jaw-dropping" that breaks familiarity (an editor that stops feeling like Word/Excel).
- Bold visuals shipped without designed loading/empty/error/offline states.
- Inventing colors/fonts outside `src/themes` tokens.
- Treating this as a substitute for `impeccable`'s per-element craft or §1.9's binding gates.

## 5. Handoff

Always end by naming: the chosen zone, the single signature moment, the §3 scores, and whether the
surface is showcase-ready or needs another QA iteration. If fine-grained craft is needed, invoke
`impeccable`. If the surface is the landing, note that the DOM stack is permitted there.
