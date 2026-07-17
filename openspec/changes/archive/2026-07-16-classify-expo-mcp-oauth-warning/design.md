## Context

`harness:doctor` es un gate local read-only. `ci.yml` solo corre `mcp:parity`, asi que este `FAIL` no bloquea CI: degrada la confianza en el veredicto local, que es peor, porque entrena a ignorarlo.

Estado verificado antes de disenar:

- `figma` usa transporte `url`. `testMcpServers.mjs:83` cortocircuita todo servidor con `url` a `ok: true` con la nota `Remote OAuth/HTTP server config present...`. `harnessDoctor.mjs:108` busca esa nota y degrada a `WARN`. Ese `WARN` no prueba nada del servidor: prueba que hay configuracion.
- `expo` usa stdio (`npx -y mcp-remote https://mcp.expo.dev/mcp`), se lanza de verdad, imprime el prompt de autorizacion y nunca inicializa. `checkMcpSmoke` aborta en `execution.status !== 0 || !report?.ok` antes de mirar `results`, asi que el `WARN` por nota nunca se evalua para el.
- El sintoma terminal varia: `EADDRINUSE 127.0.0.1:36566` (puerto retenido por un `mcp-remote` concurrente del cliente MCP, PID confirmado con `netstat -ano`) o `Timed out after 45000ms` sin concurrente.

## Goals / Non-Goals

**Goals**

- Distinguir por evidencia OAuth interactivo pendiente de una falla real.
- Conservar intacta la senal cruda de `mcp:test`.
- Dejar el criterio de degradacion explicito en configuracion, no enterrado en codigo.

**Non-Goals**

- Autorizar Expo, tocar credenciales o `.mcp.json`.
- Cambiar el camino `url` de Figma.
- Corregir `EADDRINUSE` o la apertura de navegador de `mcp-remote`.

## Decisions

### Decision 1: la clasificacion vive solo en el doctor

`mcp:test` sigue devolviendo `ok: false` y saliendo con codigo 1 para `expo`. Solo agrega `classification` al resultado. El doctor decide `WARN` vs `FAIL`.

**Por que.** El smoke responde "que se verifico"; el doctor responde "que bloquea". Fusionarlos haria que `mcp:test` saliera 0 y afirmara implicitamente que `expo` esta sano cuando `tools/list` nunca corrio. La alternativa (marcar `ok: true` con nota, como Figma) fue rechazada: lava la senal cruda y replica justo la debilidad que este change no quiere extender.

### Decision 2: la evidencia es el prompt de autorizacion mas la no inicializacion

`WARN` exige de forma conjunta:

1. La evidencia capturada contiene el prompt de autorizacion del cliente remoto.
2. Ese prompt trae una URL `https` de `authorize` cuyo **origen** coincide con el origen del endpoint configurado para ese servidor en `.mcp.json`.
3. `initialized === false`.

**Por que el prompt basta como prueba de salud.** Para imprimirlo, `mcp-remote` resolvio DNS, alcanzo el host, recibio un 401 con `WWW-Authenticate`, leyo la metadata OAuth y completo el registro dinamico de cliente. Conectividad, instalacion y protocolo quedan probados por el propio prompt. Lo unico ausente es el consentimiento humano.

**Por que sigue siendo `WARN` y no `PASS`.** `tools/list` nunca se ejecuto. No sabemos si el servidor entrega herramientas utiles despues de autenticar.

**Por que se ignora el sintoma terminal.** Es ruido de entorno: el mismo estado produce timeout o exit 1 segun haya otro `mcp-remote` vivo. Condicionar la clasificacion al codigo de salida generaria `FAIL` espurio justo cuando un cliente MCP esta corriendo, que es el caso normal en una sesion de agente.

**Por que se compara el origen.** Un match laxo sobre la palabra `authorize` podria enmascarar una falla real cuya salida la mencione por casualidad. Exigir que el origen de la URL coincida con el endpoint configurado ata la evidencia al servidor que realmente estamos evaluando.

### Decision 3: mecanismo generico, aplicacion por allowlist

La deteccion funciona para cualquier servidor stdio. La degradacion solo aplica a los declarados en `oauthInteractiveServers` de `harness-doctor.config.json` (`["expo"]`).

**Por que.** Sin allowlist, un token vencido de `vercel` se degradaria solo a `WARN` sin decision humana. Con hardcode de `expo`, el criterio queda invisible y hay que reabrir codigo para el siguiente servidor. La allowlist deja la decision explicita, auditable y reversible sin tocar codigo.

### Decision 4: agregacion conservadora

`mcp-smoke` es `WARN` solo si **todos** los servidores no verificados son OAuth-pendientes permitidos. Un solo fallo real deja el check en `FAIL` aunque haya OAuth pendiente en paralelo. Un `FAIL` real nunca queda enmascarado.

## Risks / Trade-offs

- **Riesgo: un servidor de la allowlist se cae de verdad y el doctor lo reporta `WARN`.** Mitigado porque el prompt de autorizacion solo se emite si el host respondio con un 401 y su metadata OAuth. Un host caido no produce prompt: produce error de red y `FAIL`.
- **Riesgo: el texto del prompt de `mcp-remote` cambia en una version futura y la deteccion deja de reconocerlo.** Consecuencia segura: vuelve a `FAIL`, no a un `PASS` silencioso. Falla hacia el lado ruidoso.
- **Trade-off: `WARN` permanente mientras nadie autorice Expo.** Aceptado y explicito en el issue: warnings manuales son aceptables; `FAIL`s no.

## Migration Plan

No hay migracion. Cambio de clasificacion en un script read-only, sin datos ni estado persistente. Rollback: revertir el commit del PR restaura el `FAIL` previo; vaciar `oauthInteractiveServers` desactiva el mecanismo sin tocar codigo.

## Open Questions

Ninguna. Las tres decisiones de diseno fueron aprobadas antes de implementar.
