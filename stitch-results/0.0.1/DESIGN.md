# Design System Strategy: The Cognitive Sanctuary

This design system is engineered to transform the often chaotic experience of lesson planning and classroom management into a "Cognitive Sanctuary." For educators, productivity isn't just about speed; it’s about clarity. This system moves away from the "dashboard-itis" of typical EdTech—characterized by heavy borders and flat, sterile grids—and instead utilizes tonal depth, airy spatial relationships, and editorial typography to create an environment that feels authoritative yet effortless.

---

### 1. Creative North Star: "The Elevated Atelier"
The "Elevated Atelier" concept treats the screen as a curated workspace. We bypass the "standard" app look by using intentional asymmetry and layered surfaces. Elements shouldn't just sit on a background; they should feel like high-grade stationery organized on a clean, backlit desk. 

**Key Principles:**
*   **Asymmetric Breathing Room:** Don't center everything. Use generous, purposeful white space to lead the eye toward primary actions.
*   **Depth over Lines:** Structure is defined by light and shadow, not by rigid ink lines.
*   **Intentional Friction:** Use larger-than-standard typography for headlines to slow the user down where reflection is needed (like lesson goals), while keeping utility areas compact.

---

### 2. Color & Surface Architecture
We move beyond flat hex codes to a system of **Tonal Layering**.

#### The "No-Line" Rule
**Explicit Instruction:** Do not use `1px` solid borders to define sections. All boundaries must be created through background shifts or soft elevation. 
*   **Surface Hierarchy:** 
    *   `surface` (#f7fafe): The base canvas.
    *   `surface_container_low` (#f1f4f8): For secondary sidebars or non-interactive background zones.
    *   `surface_container_lowest` (#ffffff): Use exclusively for primary interaction cards or "Active Planning" areas to make them "pop" against the background.

#### Glass & Gradient Implementation
To prevent the UI from feeling "boxed in," use semi-transparent surfaces:
*   **The Glass Layer:** For floating headers or navigation bars, use `surface_container_lowest` at 80% opacity with a `24px` backdrop-blur.
*   **Signature Soul:** Primary CTAs should not be flat blue. Apply a subtle linear gradient from `primary` (#005da8) to `primary_container` (#0576d2) at a 135-degree angle to provide a sense of "tactile plastic" rather than a flat digital pixel.

---

### 3. Typography: The Editorial Scale
We use **Manrope** for its geometric clarity and modern humanist touch. 

*   **Display (Editorial Hero):** `display-lg` (3.5rem) should be used sparingly for "Zen Moments" (e.g., "Good Morning, [Name]"). 
*   **The Power of Scale:** Use a high contrast between `headline-sm` (1.5rem, Bold) for section titles and `body-md` (0.875rem, Regular) for metadata. This "Big/Small" pairing creates a sophisticated, magazine-like hierarchy.
*   **Label Utility:** `label-md` (0.75rem) should always be in `on_surface_variant` (#414752) and uppercase with `0.05rem` letter spacing to denote non-interactive metadata.

---

### 4. Elevation & Depth: The Layering Principle
Forget traditional drop shadows. We use **Ambient Lifts**.

*   **The Stack:** Place a `surface_container_lowest` card (The Planning Card) on top of a `surface_container_low` background. The difference in hex value creates a "natural" edge.
*   **Ambient Shadows:** If a card must float (e.g., a modal or a primary AI suggestion), use a shadow: `0px 12px 32px rgba(0, 93, 168, 0.06)`. Note the blue tint in the shadow—this mimics the primary brand color reflecting in natural light.
*   **The Ghost Border Fallback:** If a border is required for accessibility, use `outline_variant` at 15% opacity. Never use a 100% opaque border.

---

### 5. Components: Refined Utility

#### Cards & Lists (The Planning Blocks)
*   **Rounding:** Apply `lg` (1rem / 16px) to all main cards. This is slightly softer than the requested 14px to lean into the "friendly professional" vibe.
*   **Spacing:** Use `spacing.8` (2.75rem) between major card groups to ensure the "airy" feel.
*   **Rule:** Forbid the use of horizontal divider lines. Use `spacing.4` vertical gaps or a shift to `surface_container_high` for grouped list items.

#### Buttons (Tactile Actions)
*   **Primary:** Gradient fill (`primary` to `primary_container`), `xl` (1.5rem) rounding, and a soft primary-tinted shadow.
*   **Secondary:** No background. Use `primary` text with a `surface_container_highest` background only on hover.

#### Input Fields (The Atelier Inputs)
*   Background should be `surface_container_lowest`. 
*   Active state: Do not change the border; instead, increase the shadow spread and change the background to `surface_container_high`.

#### AI-Specific Components (The "Co-Pilot" Elements)
*   **AI Suggestion Chips:** Use `secondary_container` (#60e2ff) with a `12px` backdrop blur. This visually separates "Machine Generated" content from "Teacher Authored" content.

---

### 6. Do’s and Don’ts

**DO:**
*   **DO** use asymmetric layouts. If you have a list on the left, let the right side have a larger "hero" empty state to reduce visual noise.
*   **DO** use `secondary_fixed_dim` for "Success" icons instead of standard green when the context is educational progress; it feels more integrated into the palette.
*   **DO** stack containers. A `lowest` card on a `low` background is the "signature move" of this system.

**DON'T:**
*   **DON'T** use black (#000000). Use `on_surface` (#181c1f) for all "black" text to maintain the soft, premium feel.
*   **DON'T** use 1px dividers. If you feel the need to separate, use a `2rem` space instead.
*   **DON'T** use sharp corners. Everything must feel approachable. If a component isn't `lg` (16px), it should be `full` (pill-shaped).

---

### 7. Component Spec Summary Table

| Component | Token / Value | Editorial Note |
| :--- | :--- | :--- |
| **Corner Radius** | `lg` (1rem / 16px) | Softer edges promote a calm user state. |
| **Section Gap** | `spacing.10` (3.5rem) | High breathing room for high focus. |
| **Primary Text** | `on_surface` (#181c1f) | Deep navy-grey, not harsh black. |
| **Borders** | `outline_variant` @ 15% | Use only when tonal shifts fail. |
| **Shadows** | Tinted Blue (#005da8) | Low opacity (6%), high blur (32px). |