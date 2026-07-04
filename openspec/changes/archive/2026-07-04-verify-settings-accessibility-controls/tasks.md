## 1. Tests de preferencias

- [x] 1.1 Agregar tests focalizados para `ThemeProvider`, `FontSizeProvider` y `DaltonismoProvider`.
- [x] 1.2 Ejecutar el test focalizado y corregir cualquier fallo.

Evidencia: `npm test -- src/__tests__/settings/accessibilityPreferencesContexts.test.tsx --runInBand` paso con 8 tests.

## 2. Evidencia base

- [x] 2.1 Ejecutar `npm run typecheck`.
- [x] 2.2 Ejecutar `npm run lint -- --quiet`.
- [x] 2.3 Evaluar gate visual: documentar por que Playwright/Figma no aplican en este smoke sin UI renderizada.

Evidencia: `npm run typecheck` y `npm run lint -- --quiet` pasaron.
Gate visual documentado en `Documentacion/03-validacion/openspec-sdd-smoke-2026-07-04/README.md`.

## 3. Documentacion y cierre

- [x] 3.1 Documentar el flujo SDD completo de inicio a fin en `Documentacion/`.
- [x] 3.2 Ejecutar validacion OpenSpec final y dejar el change listo para archivar.

Evidencia: proceso documentado en `Documentacion/03-validacion/openspec-sdd-smoke-2026-07-04/README.md`.
Validacion: `openspec validate "verify-settings-accessibility-controls" --type change --strict` y `openspec validate --all --strict` pasaron.
