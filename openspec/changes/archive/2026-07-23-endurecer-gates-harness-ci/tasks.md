## 1. Baseline y contrato de pruebas

- [x] 1.1 Reproducir y registrar el guard POSIX roto de los cuatro entrypoints, los siete `continue-on-error`, las tres señales de consola y el baseline de `npm audit` sin alterar dependencias de producto. Evidencia: `evidencia/01-baseline-y-validacion-local.md`.
- [x] 1.2 Crear una prueba de procesos para los cuatro entrypoints, incluido un caso negativo que demuestra que salida vacía o no ejecución falla. Evidencia: `npm run test:harness:cli` en Windows y Ubuntu/WSL PASS.

## 2. Entrypoints y señal de pruebas

- [x] 2.1 Cambiar los cuatro guards CLI a `pathToFileURL(process.argv[1]).href` con protección de entrada y cubrir sus marcadores semánticos. Evidencia: prueba CLI cross-platform PASS.
- [x] 2.2 Añadir un wrapper portable de Jest que desactiva solo Web Storage experimental cuando el runtime lo soporta, y enrutar los scripts de prueba por ese wrapper. Evidencia: Jest completo 121/843 PASS sin `ExperimentalWarning`.
- [x] 2.3 Actualizar `baseline-browser-mapping` como dato de desarrollo y verificar que lint/Jest no emitan el warning obsoleto. Evidencia: `2.8.22 -> 2.11.1`; lint y Jest completos PASS sin aviso.
- [x] 2.4 Capturar y asertar el `stderr` del fixture positivo de codificación sin heredarlo a la consola de Jest, manteniendo sus seis líneas como evidencia. Evidencia: `sourceEncoding.test.ts` aserta las seis referencias y Jest no las imprime.

## 3. Cutover de CI y gobernanza

- [x] 3.1 Inventariar los siete `continue-on-error`, retirar los respaldados por baseline verde y añadir la matriz Windows/Linux para las pruebas CLI sin tocar branch protection ni required checks remotos. Evidencia: inventario final de claves `continue-on-error`: 0; matriz `ubuntu-latest`/`windows-latest`.
- [x] 3.2 Ejecutar la prueba negativa del check bloqueante y verificar que un fallo de paridad/entrypoint termina el job con código no cero. Evidencia: `testHarnessCliEntrypoints.mjs` aserta que `status: 0` con salida vacía lanza.
- [x] 3.3 Comparar `npm audit --json` con 1 low, 20 moderate y 0 high/critical; clasificar cualquier drift sin `npm audit fix` ni upgrade de Expo. Evidencia: baseline sin drift en `evidencia/01-baseline-y-validacion-local.md`.

## 4. Validación y evidencia de cierre

- [x] 4.1 Ejecutar typecheck, lint quiet, Jest completo, backend smoke, debt-control, harness check, OpenSpec validate y un segundo run de generación/paridad sin drift. Evidencia: `evidencia/01-baseline-y-validacion-local.md`.
- [x] 4.2 Ejecutar las pruebas CLI reales en Windows y Linux Ubuntu/WSL, y configurar la misma prueba en `ubuntu-latest` de CI. Evidencia: Windows Node 26/20 y Ubuntu/WSL Node 20 PASS; el workflow replica la misma prueba en `ubuntu-latest`.
- [x] 4.3 Capturar el assessment `kind: remediation` que resuelve `debt-2887d890144e`, sin candidatos nuevos sin clasificar, y actualizar `readiness.json` con evidencia real. Evidencia: `debt:capture` PASS; `.project-os/debt/assessments/endurecer-gates-harness-ci.json`; plan harness 0/5 y 0 flujos con deuda abierta.
- [x] 4.4 Ejecutar revisión adversarial independiente, corregir Blockers/Majors y repetir las validaciones afectadas. Evidencia: `evidencia/02-revision-adversarial.md`; veredicto final PASS.
- [x] 4.5 Ejecutar el gate pre-archive con validaciones locales y actualizar el paquete de evidencia para archive/PR. Evidencia: primera ejecución aisló la tarea pendiente como única condición; repetición final `openspec:ready:archive --run-local` PASS antes de archive.
