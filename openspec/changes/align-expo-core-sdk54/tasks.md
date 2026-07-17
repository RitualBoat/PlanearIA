## 1. Linea base y alcance

- [ ] 1.1 Capturar la salida inicial de `npm run harness:doctor` y `npx expo install --check`, mas las entradas de manifiesto, lockfile y `node_modules` en #92.
- [ ] 1.2 Confirmar que el `FAIL mcp-smoke` permanece fuera de alcance y que el arbol de trabajo no contiene cambios ajenos.

## 2. Alineacion acotada

- [ ] 2.1 Ejecutar desde la raiz `npx expo install expo`, sin `--fix`, `latest` ni paquetes adicionales.
- [ ] 2.2 Confirmar que `node_modules` queda coherente con el lockfile; si no, ejecutar `npm ci` como paso explicito.
- [ ] 2.3 Inspeccionar el diff versionado y detenerse si contiene modificaciones no necesarias para `expo`.

## 3. Validacion y evidencia

- [ ] 3.1 Ejecutar `npx expo install --check` y confirmar que `expo` deja de aparecer como incompatible y que `expo-localization` tampoco aparece.
- [ ] 3.2 Ejecutar `npm run harness:doctor` y confirmar que `expo-compatibility` deja de ser FAIL; registrar el `FAIL mcp-smoke` residual como deuda ajena.
- [ ] 3.3 Ejecutar `npm run typecheck`, `npm run lint -- --quiet` y `npm test -- --runInBand`.
- [ ] 3.4 Ejecutar las validaciones OpenSpec/harness/OpsX y actualizar la evidencia real de `readiness.json`.

## 4. Cierre controlado

- [ ] 4.1 Ejecutar y registrar revision adversarial, resolver hallazgos y completar DoD.
- [ ] 4.2 Sincronizar la spec, completar DoD y dejar el gate de archive listo; el archive, PR/merge y actualizacion de #92/#66 se evidenciaran por sus artefactos y enlaces posteriores.
