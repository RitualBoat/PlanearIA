---
paths:
  - "src/**/*.{ts,tsx}"
  - "App.tsx"
---

# Frontend Rules

- MVVM: screens are thin views, hooks are ViewModels, Context for shared state
- Colors from src/themes/colors.ts only; do not invent new palettes
- Icons: use @expo/vector-icons with direct imports, no barrel exports
- Preserve ThemeContext, FontSizeContext, and DaltonismoContext in any redesign
- No direct AsyncStorage reads for new syncable academic data; use ports/repositories compatible with src/sync
- Always handle: loading, error, empty, and offline states
- Responsive: start from a shared web/tablet/mobile screen; platform-specific files need justification
- Current UX vision is a connected teacher suite: Asistente IA, Office Docente, Classroom, Canva/Genially, WhatsApp Docente, Calendar, Reports, Account
- No skeleton/placeholder screens without clear entry points and exit CTAs
- Do not copy legacy tab/module structure as the target UX unless the active plan justifies it
- AI chatbot UI must never call OpenAI/Gemini/LM Studio directly; use backend gateway endpoints and confirm actions before saving/assigning
- Background AI corrections must show status and produce a reviewable copy, draft, diff or summary before applying changes
- Motion/animation only via react-native-reanimated + gesture-handler (spring configs from motion tokens); Tailwind/GSAP/Framer Motion are DOM-only and PROHIBITED in the RN app (allowed only in the separate landing-web artifact)
- Every animation must respect the OS reduce-motion setting and hit 60fps on mid-range Android; degrade effects (blur/gradients) to solid surfaces if they jank
- New/redesigned UI must pass the Design Excellence standard (PLAN_UXUI_NAVEGACION_GLOBAL.md section 1.9): anti-slop checklist, intentional typography from tokens, at least one meaningful micro-interaction, designed loading/empty/error/offline states
- Verify library APIs (reanimated, gesture-handler, tentap, expo-*) against Context7 docs before writing them; explore code with CodeGraph before editing
