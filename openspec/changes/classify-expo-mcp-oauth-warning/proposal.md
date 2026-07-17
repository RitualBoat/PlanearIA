## Why

`npm run harness:doctor` reporta `FAIL mcp-smoke` (issue #94, tracking #66) porque el MCP `expo` exige autorizacion OAuth interactiva que una sesion de agente no puede completar. El gate local queda rojo por una condicion de entorno y no por una falla de codigo, lo que entrena a ignorar el veredicto agregado y esconde cualquier `FAIL` real que aparezca despues.

Hoy el doctor ya degrada a `WARN` la condicion equivalente de Figma, pero por un camino mas debil: `figma` se declara con transporte `url`, y `scripts/testMcpServers.mjs` cortocircuita cualquier servidor con `url` a `ok: true` sin contactarlo. Ese `WARN` se apoya en presencia de configuracion, no en evidencia. `expo` se lanza de verdad y produce evidencia real y verificable; merece una clasificacion al menos tan honesta.

## What Changes

- `scripts/testMcpServers.mjs` clasifica el fallo de un servidor stdio y expone un campo estructurado `classification` en su resultado. El smoke NO cambia su veredicto: `expo` sigue en `ok: false` y `mcp:test` sigue saliendo con codigo 1. Solo se agrega evidencia legible por maquina.
- `scripts/harnessDoctor.mjs` consume esa clasificacion y degrada `mcp-smoke` a `WARN` cuando los unicos servidores no verificados son OAuth-pendientes probados y estan en la allowlist. Cualquier otro fallo sigue en `FAIL`.
- `harness-doctor.config.json` declara `oauthInteractiveServers: ["expo"]`. El mecanismo es generico; la allowlist evita que se aplique en silencio a un servidor no previsto.
- `scripts/testHarnessDoctor.mjs` cubre los tres casos con resultados inyectados: autenticado/respondiente, OAuth requerido y MCP realmente roto.
- `Documentacion/02-operacion/MCP_FLUJOS_PLANEARIA.md` documenta la limitacion y como autorizar Expo cuando una tarea si lo necesite.

No es breaking: ningun consumidor depende hoy de que `mcp-smoke` sea `FAIL`.

### Evidencia de la condicion

`npm run mcp:test -- expo --timeout=40000` produce en `stderr`:

```text
Please authorize this client by visiting:
https://mcp.expo.dev/oauth/authorize?response_type=code&client_id=...&resource=https%3A%2F%2Fmcp.expo.dev%2Fmcp
[23948] Authentication required. Initializing auth...
```

Para imprimir ese prompt, `mcp-remote` resolvio DNS, alcanzo `mcp.expo.dev`, recibio un 401 con `WWW-Authenticate`, leyo la metadata OAuth y completo el registro dinamico de cliente. El prompt prueba conectividad, instalacion y protocolo. Solo falta el consentimiento interactivo, y `tools/list` nunca se verifico: por eso `WARN` y no `PASS`.

El sintoma terminal NO es invariante. Dos corridas consecutivas dieron `Process exited with code 1` por `EADDRINUSE 127.0.0.1:36566`, puerto retenido por un `mcp-remote` concurrente del cliente MCP de la propia sesion. Sin ese concurrente, la misma condicion se cuelga y aparece como `Timed out after 45000ms`. El unico invariante es el prompt de autorizacion mas `initialized: false`.

## No objetivos

- No autorizar el MCP de Expo ni tocar credenciales, `.mcp.json` ni configuracion global del usuario.
- No cambiar el camino `url` de Figma ni su `WARN` por nota. Los checks de Figma no se debilitan.
- No mover `harness:doctor` ni `mcp:test` a CI.
- No corregir el `EADDRINUSE` de `mcp-remote` ni su apertura automatica de navegador: son ruido de entorno ajeno, registrados como observacion.
- No retirar `expo` del smoke ni de la paridad MCP.
- No convertir `mcp:test` en verde: la senal cruda se conserva intacta.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `harness-readiness-doctor`: se agrega el requisito de clasificar por evidencia un MCP stdio con OAuth interactivo pendiente, distinguiendolo de una falla real, con allowlist explicita y sin debilitar el `WARN` por nota de un MCP remoto declarado por `url`.

## Impact

- `scripts/testMcpServers.mjs`: nuevo campo `classification` en el resultado por servidor; veredicto y codigo de salida sin cambios.
- `scripts/harnessDoctor.mjs`: `checkMcpSmoke` deja de abortar antes de inspeccionar `results` y clasifica con la allowlist.
- `harness-doctor.config.json`: nueva clave `oauthInteractiveServers`.
- `scripts/testHarnessDoctor.mjs`: nuevos fixtures inyectados.
- `Documentacion/02-operacion/MCP_FLUJOS_PLANEARIA.md`: limitacion y ruta de autorizacion.
- Sin impacto en app, backend, sync, IA ni dependencias. Superficies: `harness`, `docs`.
- Plan maestro: ninguno. Es deuda operativa del harness, no del plan UX/UI activo.
