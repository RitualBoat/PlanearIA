# Revisión adversarial independiente

Fecha: 2026-07-23. Revisión desde el diff completo contra `development`, los artefactos OpenSpec y
la evidencia generada, sin reutilizar las conclusiones de implementación como premisas.

## Veredicto

**PASS: 0 Blockers, 0 Majors.**

## Intentos de refutación

1. **El artefacto podría no ser el oficial o estar alterado.** Refutado: la metadata fija el URL
   oficial, versión y SHA-256; el verificador inspecciona el paquete embebido/licencia y una copia
   alterada falla.
2. **`npm ci` todavía podría depender del CDN para SheetJS.** Refutado: dos instalaciones limpias
   pasaron con manifiesto/lock sin drift y el lock resuelve `xlsx` exclusivamente mediante `file:`.
3. **La atribución podría perderse o no ser encontrable.** Refutado: el tarball preserva
   `package/LICENSE`; `THIRD_PARTY_NOTICES.md` documenta la ausencia de NOTICE separado; la app expone
   una tercera pestaña tipada y accesible desde la pantalla legal existente.
4. **El cambio podría afirmar falsamente que evita todo cuelgue.** Refutado: servicio, ADR y
   assessment distinguen excepciones lanzadas de un bucle síncrono que no devuelve control.
5. **La reproducción podría bloquear Jest/CI.** Refutado: la entrada peligrosa sólo se procesa en un
   hijo supervisado; el padre impone 1000 ms y la prueba además limita el comando a 5000 ms.
6. **La excepción podría ser permanente o duplicar estado.** Refutado: el item canónico
   `debt-770acc1e9d53` está en `accepted-exception`, vence `2026-10-31`, tiene owner/aprobador y una
   recuperación exacta. El ADR remite al registro como única fuente de estado y expiración.
7. **La remediación podría declararse limpia u ocultar deuda nueva.** Refutado: el assessment es
   `kind: remediation`, `result: debt`; `debt:check` pasa sin `remediation-new-debt`.
8. **La evidencia histórica podría haberse reescrito.** Refutado: el SHA-256 del assessment #133
   permanece `4403DF0E2144B6883CD981CE90ACA2768D0E346E6748A410ED8EF2B9877BCE42`.
9. **El rollback podría borrar trazabilidad o restaurar una versión vulnerable.** Refutado: el plan
   preserva assessment, item, excepción y notices; sólo admite PR normal y prohíbe restaurar una
   versión vulnerable.
10. **La UI podría degradar Términos/Privacidad o accesibilidad.** Refutado: tests cubren los tres
    contenidos, ruta inicial y volver; Playwright cubre móvil/tablet/web, teclado, roles, estado
    seleccionado y objetivos táctiles de 44 pt.

## Hallazgos residuales

- **Minor conocido, gobernado:** bloqueo síncrono de SheetJS ante ZIP corrupto. Está capturado como
  riesgo externo y excepción temporal; no es una regresión introducida por #137.
- Los avisos npm restantes, el CORS local y el botón anidado preexistente están fuera de la superficie
  de este change y conservan su gobernanza vigente. No justifican ampliar el alcance ni crear deuda
  duplicada.
