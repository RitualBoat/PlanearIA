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
- Current UX vision is a connected teacher suite: Office Docente, Classroom, Canva/Genially, WhatsApp Docente, Calendar, Reports, Account
- No skeleton/placeholder screens without clear entry points and exit CTAs
- Do not copy legacy tab/module structure as the target UX unless the active plan justifies it
