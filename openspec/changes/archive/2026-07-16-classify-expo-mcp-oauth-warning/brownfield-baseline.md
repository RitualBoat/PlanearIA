# Brownfield baseline: classify-expo-mcp-oauth-warning

Registra solo la superficie que este change toca. No inventaria la app.

## Superficies tocadas

- `scripts/testMcpServers.mjs`: clasificacion del fallo por servidor stdio y campo `classification` en el resultado.
- `scripts/harnessDoctor.mjs`: `checkMcpSmoke`, unica funcion modificada.
- `harness-doctor.config.json`: nueva clave `oauthInteractiveServers`.
- `scripts/testHarnessDoctor.mjs`: fixtures inyectados.
- `Documentacion/02-operacion/MCP_FLUJOS_PLANEARIA.md`: limitacion y ruta de autorizacion.

Fuera de estas rutas no se modifica nada. Sin impacto en app, backend, sync ni IA.

## Fuentes de verdad actuales

- `openspec/specs/harness-readiness-doctor/spec.md`: contrato vigente del doctor, incluido el `WARN` para MCP remoto que requiere autenticacion de cliente.
- `.mcp.json`: canon de servidores MCP activos y su transporte. Este change lo lee, no lo modifica.
- `harness-doctor.config.json`: manifest de orden de checks, patrones y herramientas retiradas.
- Issue #94 y el tracking #66: origen y evidencia de la deuda.

## Comportamiento vigente

`checkMcpSmoke` aborta en `execution.status !== 0 || !report?.ok` y devuelve `FAIL` sin inspeccionar `results`. Como `expo` es stdio y `mcp-remote` no puede completar OAuth en una sesion no interactiva, `mcp:test` sale con codigo distinto de cero y el doctor reporta `FAIL mcp-smoke`, dejando el veredicto agregado en `FAIL`.

El `WARN` por nota (`Complete auth and tool listing`) solo alcanza a servidores con transporte `url`, como `figma`, cuyo resultado es `ok: true` sin haber contactado al servidor. Ese camino nunca se evalua para `expo` porque el abort ocurre antes.

## Comportamiento objetivo

El smoke agrega `classification` por servidor y conserva `ok: false`, veredicto y codigo de salida sin cambios. El doctor inspecciona `results` antes de decidir y reporta `WARN mcp-smoke` solo cuando todos los servidores no verificados presentan prueba conjunta de OAuth interactivo pendiente (prompt de autorizacion con URL `https` de `authorize` del mismo origen que el endpoint configurado, e `initialized === false`) y estan en `oauthInteractiveServers`. Cualquier otra causa sigue en `FAIL`.

## Compatibilidad legacy

No hay claves `@planearia:*`, datos docentes, esquema ni contrato de API involucrados. `mcp:test` mantiene su forma de salida: `classification` es aditivo y los consumidores actuales (`harnessDoctor.mjs`, `mcp:parity`) no dependen de campos removidos. `ci.yml` no ejecuta `harness:doctor` ni `mcp:test`, asi que CI no cambia de comportamiento. El `WARN` por nota de `figma` se conserva intacto.

## Owner de spec y contexto

- Spec: `openspec/specs/harness-readiness-doctor/spec.md`, owner RitualBoat.
- Contexto operativo: `Documentacion/02-operacion/MCP_FLUJOS_PLANEARIA.md`, owner RitualBoat.
- Issue: #94. Tracking de origen: #66.

## Evidencia actual

- `npm run mcp:test -- expo --timeout=40000` (2026-07-16): `ok: false`, `initialized: false`, `stderr` con `Please authorize this client by visiting: https://mcp.expo.dev/oauth/authorize?...&resource=https%3A%2F%2Fmcp.expo.dev%2Fmcp`.
- Dos corridas consecutivas terminaron en `Process exited with code 1` por `EADDRINUSE 127.0.0.1:36566`; `netstat -ano` confirma que el puerto lo retiene un `mcp-remote` concurrente del cliente MCP de la sesion. Sin concurrente, la misma condicion aparece como `Timed out after 45000ms`.
- `npm run harness:doctor` (estado previo): `FAIL mcp-smoke`; el resto de checks en `PASS` salvo `SKIP graphify`.
- `npm run openspec:ready:propose -- --issue 94`: `PASS`.

## Fuera de alcance

- Autorizar el MCP de Expo; tocar credenciales, `.mcp.json` o configuracion global del usuario.
- Modificar el camino `url` de Figma o su `WARN` por nota.
- Mover `harness:doctor` o `mcp:test` a CI.
- Corregir el `EADDRINUSE` de `mcp-remote` o su apertura automatica de navegador.
- Retirar `expo` del smoke o de la paridad MCP.
- Convertir `mcp:test` en verde.
