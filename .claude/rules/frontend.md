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
- No direct AsyncStorage reads for new academic data; use ports/repositories
- Always handle: loading, error, empty, and offline states
- Responsive: test on mobile, web, and tablet layouts
- No skeleton/placeholder screens without clear entry points and exit CTAs
