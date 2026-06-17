---
paths:
  - "backend/**/*.js"
---

# Backend Rules

- Every CRUD endpoint MUST create MongoDB indexes (createIndex is idempotent)
- All queries MUST filter by userId for data isolation
- Auth: decode JWT with getUserFromToken from backend/lib/auth.js
- Headers: Authorization Bearer JWT + Content-Type application/json
- Rate limiting on critical endpoints: login, register, recovery, sync, bulk create, AI
- Never store secrets in code or commits; use environment variables
- Add CORS and security headers (helmet or equivalent)
- AI provider calls must go through backend/lib/aiGateway.js or a backend wrapper that preserves the same contract
