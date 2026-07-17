# Tasks

## 1. Clasificacion en el smoke MCP

- [x] 1.1 Agregar a `scripts/testMcpServers.mjs` una funcion pura que clasifique el fallo de un servidor stdio a partir de `{ stderr, initialized, serverUrl }` y devuelva `oauth-interactive-required` solo si la evidencia contiene el prompt de autorizacion con una URL `https` de `authorize` del mismo origen que el endpoint configurado y `initialized === false`.
- [x] 1.2 Exponer `classification` en el resultado por servidor sin alterar `ok`, el veredicto agregado ni el codigo de salida.
- [x] 1.3 Exportar la funcion de clasificacion y el endpoint configurado por servidor para que el doctor y las pruebas la usen sin lanzar procesos.

## 2. Decision en el doctor

- [x] 2.1 Agregar `oauthInteractiveServers: ["expo"]` a `harness-doctor.config.json`.
- [x] 2.2 Reescribir `checkMcpSmoke` en `scripts/harnessDoctor.mjs` para inspeccionar `results` antes de abortar, separando servidores verificados, OAuth-pendientes permitidos y fallos reales.
- [x] 2.3 Devolver `WARN` solo si todos los servidores no verificados son OAuth-pendientes permitidos; nombrar los servidores y dar la recuperacion sin ejecutarla.
- [x] 2.4 Conservar el `WARN` por nota de los servidores con transporte `url` sin cambios.
- [x] 2.5 Mantener `FAIL` para cualquier otro fallo, incluida la coexistencia de un fallo real con OAuth pendiente.

## 3. Pruebas reproducibles

- [x] 3.1 Fixture inyectado: smoke autenticado y respondiente -> `PASS`.
- [x] 3.2 Fixture inyectado: OAuth requerido en la allowlist -> `WARN` que nombra el servidor.
- [x] 3.3 Fixture inyectado: MCP realmente roto -> `FAIL`.
- [x] 3.4 Fixture inyectado: mismo estado OAuth con timeout y con exit distinto de cero -> mismo `WARN`.
- [x] 3.5 Fixture inyectado: OAuth pendiente fuera de la allowlist -> `FAIL`.
- [x] 3.6 Fixture inyectado: URL de autorizacion de otro origen -> `FAIL`.
- [x] 3.7 Fixture inyectado: fallo real coexistiendo con OAuth pendiente permitido -> `FAIL`.
- [x] 3.8 Verificar que la evidencia reportada no incluye tokens ni secretos.

## 4. Documentacion

- [x] 4.1 Documentar en `Documentacion/02-operacion/MCP_FLUJOS_PLANEARIA.md` la limitacion de OAuth no interactivo de Expo, por que es `WARN` y no `FAIL`, y como autorizarlo cuando una tarea si necesite Expo MCP.

## 5. Validacion y evidencia

- [x] 5.1 `node scripts/testHarnessDoctor.mjs` en verde.
- [x] 5.2 `npm run agent:harness:check` en `PASS`.
- [x] 5.3 `npm run mcp:parity` en `PASS`.
- [x] 5.4 `npm run mcp:test -- expo` sigue devolviendo `ok: false` y codigo distinto de cero.
- [x] 5.5 `npm run harness:doctor` sin `FAIL`s, con `WARN mcp-smoke` que nombra `expo`.
- [x] 5.6 `npm exec --yes=false -- openspec validate --all --strict --no-interactive` en verde.
- [x] 5.7 Revision adversarial y registro de evidencia en `readiness.json`.
