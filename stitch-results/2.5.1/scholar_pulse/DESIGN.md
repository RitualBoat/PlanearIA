# Design System: The Collaborative Challenge

## 1. Overview & Creative North Star
**Creative North Star: "The Academic Atelier"**
This design system moves away from the sterile, "app-like" feel of traditional LMS platforms and moves toward an editorial, high-end educational experience. The goal is to facilitate "The Collaborative Challenge" by treating the digital interface as a curated workspace—a digital atelier where knowledge is not just consumed, but constructed.

To break the "template" look, we utilize **intentional asymmetry** and **tonal depth**. Rather than a rigid grid of boxes, elements are layered using a sophisticated palette of blue-greys and deep indigos. We favor generous white space and high-contrast typography scales to create a sense of scholarly authority and professional calm.

## 2. Colors & Surface Philosophy
The palette is rooted in a professional academic foundation, using tonal variations to guide the eye rather than aggressive structural lines.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning content. Boundaries must be defined solely through background color shifts or subtle tonal transitions.
*   *Implementation:* Use `surface-container-low` for a sidebar sitting on a `surface` background. The contrast between these two tokens is sufficient to define the edge without a "line."

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of fine heavy-weight paper.
*   **Base:** `surface` (#f6f9ff)
*   **Secondary Zones:** `surface-container-low` (#eff4fb)
*   **Active Interaction Areas:** `surface-container-highest` (#dee3ea)
*   **Floating Elements:** `surface-container-lowest` (#ffffff)

### The "Glass & Gradient" Rule
To add visual "soul," use subtle gradients on primary CTAs and hero headers. 
*   **Signature Gradient:** Transition from `primary` (#004580) to `primary-container` (#005da8) at a 135° angle.
*   **Glassmorphism:** For floating overlays (e.g., timed challenge alerts), use `surface-container-lowest` with an 80% opacity and a `24px` backdrop-blur.

## 3. Typography: The Editorial Voice
We use **Manrope** exclusively. Its geometric yet humanist qualities provide the "Academic yet Engaging" balance required.

*   **Display (The Hook):** Use `display-md` (2.75rem) for challenge titles. It should feel authoritative.
*   **Headlines (The Context):** `headline-sm` (1.5rem) uses tighter letter-spacing (-0.02em) to create a sophisticated, editorial header feel.
*   **Body (The Knowledge):** `body-lg` (1rem) is the workhorse. We prioritize a generous line-height (1.6) to ensure long-form educational content remains readable and non-intimidating.
*   **Labels (The Data):** `label-md` (0.75rem) should always be in all-caps with +0.05em tracking when used in semantic badges (RETO, COMPLETADO).

## 4. Elevation & Depth
Hierarchy is achieved through **Tonal Layering** rather than traditional structural shadows.

*   **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` section. This creates a "soft lift" that feels architectural rather than digital.
*   **Ambient Shadows:** For "Challenge Cards" that require high elevation (Visual Cues), use an extra-diffused shadow: `0px 24px 48px rgba(0, 72, 132, 0.08)`. Note the use of a blue-tinted shadow instead of grey to maintain color harmony.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility, use `outline-variant` at 15% opacity. Never use 100% opaque borders.

## 5. Components

### Buttons (The "Pill" Format)
*   **Primary:** Background: Signature Gradient. Shape: `full` (24px height/rounding). Typography: `title-sm` (white).
*   **Secondary:** Background: `surface-container-high`. No border. This creates a "submerged" look that doesn't compete with the primary action.

### Semantic Badges (The "Status" System)
Badges must use the `label-md` spec with high-contrast pairings:
*   **RETO:** `primary-fixed` background with `on-primary-fixed` text.
*   **COMPLETADO:** `secondary-fixed` background with `on-secondary-fixed` text.
*   **CERRADO:** `surface-dim` background with `on-surface-variant` text.

### Challenge Cards
*   **Structure:** No dividers. Separate the "Challenge Prompt" from the "Options" using a `10` (2.5rem) spacing gap.
*   **Interaction:** On hover, a card should transition from `surface-container-lowest` to `surface-bright` with a 2px "Ghost Border" in `primary`.

### Input Fields & Selectors
*   **Quiz Options:** Use large, `md` (1.5rem) rounded containers. When "Selected," the container shifts to `primary-fixed` with a `primary` ghost border. Do not use standard radio circles; use the entire card as the hit target.

### Interactive Timers
*   **Style:** A circular progress ring using `primary` for the track and `outline-variant` for the remaining time. Place in the top-right "Editorial" position of the screen.

## 6. Do's and Don'ts

### Do:
*   **Do** use asymmetrical margins. For example, a wider left margin for a headline creates a sophisticated "offset" layout.
*   **Do** use `surface-container` shifts to group related quiz questions instead of lines.
*   **Do** utilize the `xl` (3rem) rounding for large interactive containers to maintain the "Engaging" brand promise.

### Don't:
*   **Don't** use pure black (#000) for text. Use `on-surface` (#171c21) to keep the contrast high but the "vibe" academic and soft.
*   **Don't** use 1px dividers between list items. Use `6` (1.5rem) vertical spacing to let the content breathe.
*   **Don't** use standard "Drop Shadows." If an element needs to pop, use Tonal Layering or the Ambient Shadow spec mentioned in Section 4.