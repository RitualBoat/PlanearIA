## 1. Contrato brownfield y guías de propose

- [x] 1.1 Confirmar las ocho secciones canónicas y documentar la plantilla `brownfield-baseline.md` en `openspec/config.yaml`, sin convertirla en inventario global ni aceptar secciones vacías.
- [x] 1.2 Actualizar la fuente `.agents` y el parche idempotente de workflows OpenSpec para pedir el baseline durante propose; regenerar únicamente los espejos autorizados y comprobar su paridad.
- [x] 1.3 Añadir a la guía SDD pertinente el flujo de captura por contacto, las fuentes permitidas (código, specs, pruebas y documentación) y la diferencia entre baseline, spec, tarea y evidencia de archive.

## 2. Gate read-only y fixtures

- [x] 2.1 Extender `scripts/checkOpenSpecReadiness.mjs` con una validación confinada del archivo raíz y de las ocho secciones brownfield, manteniendo resultados PASS/FAIL y recuperaciones seguras.
- [x] 2.2 Asegurar que la validación trata todo contenido del baseline como documentación y conserva la lista estática de comandos/IDs permitidos.
- [x] 2.3 Ampliar `scripts/testOpenSpecReadiness.mjs` o sus fixtures para cubrir baseline válido, ausente y con sección requerida vacía o incompleta.

## 3. Owners UX y ejemplo validable

- [x] 3.1 Registrar en el plan UX/UI los owners de spec, fuentes brownfield y compatibilidad de `theming-runtime`, `breakpoints-reactivos`, `tokens-completos` y `app-shell-navegacion`, sin transferir ownership de datos de otros contextos.
- [x] 3.2 Publicar una plantilla y un ejemplo de `theming-runtime` que capture comportamiento vigente, objetivo y compatibilidad sin crear ni aplicar ese change UX.
- [x] 3.3 Completar el `brownfield-baseline.md` de este change con las superficies docs/harness realmente tocadas y actualizar `readiness.json` solo con evidencia real al avanzar hacia archive.

## 4. Validación y cierre posterior a apply

- [x] 4.1 Ejecutar `npm run test:openspec-readiness`, `npm exec --yes=false -- openspec validate --all --strict --no-interactive`, `npm run agent:harness:check` y `npm run agent:opsx:patch:check`; corregir toda regresión atribuible al change.
- [x] 4.2 Ejecutar `npm run typecheck` y `npm run lint -- --quiet`; no se requiere Playwright porque el change no modifica una pantalla visible.
- [x] 4.3 Vincular al issue #64 la plantilla, ejemplo, fixtures y salidas de validación; solicitar revisión adversarial independiente y registrar su resultado real.
- [ ] 4.4 Antes de archive, completar las referencias reales de PR/evidencia en `readiness.json` y ejecutar `npm run openspec:ready:archive -- --change baseline-specs-brownfield-por-contacto --run-local`.
