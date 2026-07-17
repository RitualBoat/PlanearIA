## 1. Corregir el contrato del diagnóstico

- [x] 1.1 Ajustar `scripts/gitNexusFts.mjs` para que la invocación Windows de Node/`npx` establezca explícitamente la raíz verificada del checkout sin cambiar los argumentos, la versión fijada ni la configuración OpenSSL.
- [x] 1.2 Hacer que `diagnose` falle de forma accionable si la salida de `status` contiene `Not a git repository`, preservando la detección FTS y la conducta no-Windows.

## 2. Cubrir regresiones del wrapper y del doctor

- [x] 2.1 Ampliar `scripts/testGitNexusFts.mjs` o su seam mínimo para comprobar la raíz Windows y el error semántico con código cero, incluyendo una ruta con espacios.
- [x] 2.2 Mantener o ampliar `scripts/testHarnessDoctor.mjs` para demostrar que el doctor sigue clasificando una firma `Not a git repository` como `FAIL` y que no convierte esa condición en un falso `PASS`.

## 3. Validar y registrar evidencia

- [x] 3.1 Ejecutar `npm run test:gitnexus` y `npm run test:harness:doctor`; adjuntar sus salidas o referencias al issue y a `readiness.json`.
- [x] 3.2 Ejecutar `npm run gitnexus:diagnose` y `npm run harness:doctor -- --json` desde la raíz; verificar que `gitnexus` ya no falla por `Not a git repository` y separar cualquier fallo ajeno, como Expo, sin ocultarlo.
- [ ] 3.3 Ejecutar las validaciones de cierre del perfil harness, actualizar las referencias pendientes de `readiness.json`, solicitar revisión adversarial y ejecutar el gate `openspec:ready:archive` antes de archivar.
