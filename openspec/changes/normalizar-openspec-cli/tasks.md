## 1. Toolchain reproducible

- [x] 1.1 Instalar `@fission-ai/openspec@1.6.0` como devDependency exacta y actualizar el lockfile.
- [x] 1.2 Reemplazar la invocacion al paquete incorrecto y agregar scripts npm locales para version, listado, validacion, diagnostico y update opsx.

## 2. Diagnostico determinista

- [x] 2.1 Implementar `scripts/checkOpenSpecCli.mjs` con comprobaciones accionables de declaracion, instalacion, runtime, binario, lectura y validacion estricta.
- [x] 2.2 Probar los caminos de exito y al menos un fallo controlado sin dejar cambios residuales.

## 3. Workflows y operacion

- [x] 3.1 Ejecutar `agent:opsx:update`, aplicar el patch idempotente y aceptar solo cambios dentro del blast radius opsx documentado.
- [x] 3.2 Agregar el smoke check al gate suave `agent-harness-parity.yml`.
- [x] 3.3 Actualizar la guia operativa con los comandos locales oficiales, prerequisitos y procedimiento de update/diff/rollback.

## 4. Verificacion y cierre tecnico

- [x] 4.1 Validar `openspec:check`, `agent:opsx:patch:check`, `agent:harness:check`, paridad MCP y el change en modo estricto.
- [x] 4.2 Ejecutar typecheck, lint, backend check y tests automatizados; registrar evidencia antes de marcar tareas.
- [x] 4.3 Realizar revision adversarial del diff y corregir todo hallazgo bloqueante o alto.
- [ ] 4.4 Publicar PR ligado a #49 y confirmar checks remotos verdes antes de cerrar o archivar el change.
