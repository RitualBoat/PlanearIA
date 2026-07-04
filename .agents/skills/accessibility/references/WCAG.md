# WCAG Notes For PlanearIA

Use this only when an accessibility task needs more detail than the main skill.

## Target

Aim for WCAG 2.1 AA where practical:

- Perceivable: text alternatives, contrast, scalable text.
- Operable: keyboard/focus support on web, reachable touch targets on mobile.
- Understandable: clear labels, predictable navigation, helpful errors.
- Robust: semantic controls and screen-reader friendly state.

## React Native Checklist

- Icon-only buttons include `accessibilityLabel`.
- Controls expose role/state where supported.
- Font scaling is not globally disabled.
- Critical status is not color-only.
- Forms have labels and readable error messages.
- Destructive actions require confirmation or undo.
- Loading, offline and sync states are announced when practical.

## Web Checklist

- Interactive controls are keyboard reachable.
- Focus order follows visual order.
- Focus indicator is visible.
- Modals trap focus and restore it on close.
- Text wraps and scales without clipping.

## PlanearIA-Specific Notes

- DaltonismoContext must preserve meaning beyond color.
- FontSizeContext must not break dense classroom or Office screens.
- Sync/offline language should be calm and actionable.
- Teacher workflows happen under time pressure; avoid tiny targets and ambiguous labels.
