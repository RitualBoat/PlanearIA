---
name: accessibility
description: Audit or improve PlanearIA accessibility for React Native, React Native Web, screen readers, keyboard/focus, contrast, font scaling, DaltonismoContext, and inclusive teacher workflows.
---

# Accessibility For PlanearIA

## Read First

- `CLAUDE.md`
- `Documentacion/00-fundamentos/VISION_ACTUAL.md`
- `src/themes/colors.ts`

For detailed WCAG notes, read `references/WCAG.md` only when needed.

## Rules

- Interactive icon-only controls need accessible labels.
- Preserve and test FontSizeContext and DaltonismoContext.
- Do not rely on color alone for status; combine icon/text/shape.
- Sync/offline/error changes should be announced calmly where supported.
- Web flows need keyboard reachable controls and visible focus.
- Forms need labels, errors tied to fields and clear recovery actions.
- Touch targets should be comfortable on mobile.

## Teacher Context

PlanearIA is used in busy teaching situations. Accessibility also means:

- Clear Spanish labels.
- No tiny dense controls for critical actions.
- Undo/cancel for destructive actions.
- Offline and sync messages that do not blame the user.

## Checklist

- Labels for all icon buttons.
- Contrast checked in default and accessibility themes.
- Font scaling does not break layout.
- Focus order is logical on web.
- Loading, empty, error and offline states are readable.
- Alerts/toasts have an accessible fallback.
