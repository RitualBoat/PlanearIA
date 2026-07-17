## 1. Línea base y alcance

- [x] 1.1 Capturar la salida inicial de los chequeos Expo y las entradas de manifiesto y lockfile en #75.
- [x] 1.2 Confirmar que la discrepancia de `expo` permanece fuera de alcance y que el árbol de trabajo no contiene cambios ajenos.

## 2. Alineación acotada

- [x] 2.1 Ejecutar desde la raíz `npx expo install expo-localization`, sin `--fix`, `latest` ni paquetes adicionales.
- [x] 2.2 Inspeccionar el diff y detenerse si contiene modificaciones no necesarias para localization.

## 3. Validación y evidencia

- [x] 3.1 Ejecutar el chequeo específico de localization y confirmar que deja de aparecer como incompatible.
- [x] 3.2 Ejecutar el chequeo global, registrar cualquier aviso de Expo independiente y ejecutar `npm run typecheck`.
- [x] 3.3 Ejecutar las validaciones OpenSpec/harness/OpsX y actualizar la evidencia real de `readiness.json`.

## 4. Cierre controlado

- [x] 4.1 Ejecutar y registrar revisión adversarial, resolver hallazgos y completar DoD.
- [x] 4.2 Sincronizar la spec, completar DoD y dejar el gate de archive listo; el archive, PR/merge y actualización de #75/#66 se evidenciarán por sus artefactos y enlaces posteriores.
