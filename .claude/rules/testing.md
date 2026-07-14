---
paths:
  - "src/__tests__/**/*.{ts,tsx}"
  - "**/*.test.{ts,tsx}"
---

# Testing Rules

- Jest + Testing Library for React Native
- Every functional code change requires tests
- Run: npm test -- --testPathPattern="<pattern>"
- Windows: add --rootDir C:\Users\RitualBoatLaptop\Documents\Projects\PlanearIA
- Classroom tests: npm run test:classroom -- --runInBand
- Sync tests: npm run test:sync -- --runInBand
- Backend smoke: npm run backend:check
- Fix failing tests before marking tasks complete
