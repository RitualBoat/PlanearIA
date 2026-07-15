## MODIFIED Requirements

### Requirement: Los workflows opsx se generan por la CLI oficial y reproducible de OpenSpec
Los cinco workflows opsx en los 6 harnesses SHALL mantenerse mediante la version exacta de `@fission-ai/openspec` instalada en `devDependencies` y resuelta localmente por scripts npm, nunca mediante una instalacion global, un paquete con nombre distinto ni una version flotante. `agent:opsx:update` SHALL ejecutar `openspec update --force` y despues el patch post-update idempotente. Cada workflow generado SHALL invocar la CLI como `npm exec --yes=false -- openspec` y alinear su permiso de shell cuando aplique, de modo que npm falle en vez de descargar un fallback cuando falte la dependencia local. El repositorio SHALL ofrecer un smoke check no mutante que compruebe version declarada/instalada/ejecutada, compatibilidad de Node, lectura del repositorio y validacion estricta de todos los changes y specs.

#### Scenario: Clon limpio usa la version fijada
- **WHEN** un desarrollador o agente ejecuta `npm ci` y despues `npm run openspec:check` en un clon limpio con Node compatible
- **THEN** el binario local reporta exactamente la version declarada en `package.json` y el diagnostico termina con codigo cero si la configuracion y los artefactos son validos

#### Scenario: No existe dependencia de una instalacion global
- **WHEN** la maquina no tiene un comando global `openspec` pero ya ejecuto `npm ci`
- **THEN** todos los scripts OpenSpec del repositorio se ejecutan mediante `node_modules/.bin` sin pedir una instalacion global ni descargar una version flotante

#### Scenario: Version o runtime incompatible produce recuperacion accionable
- **WHEN** falta el paquete local, la version instalada difiere de la version exacta declarada o Node no satisface el minimo de la CLI
- **THEN** `npm run openspec:check` termina con codigo distinto de cero e indica si se debe ejecutar `npm ci`, alinear la version o actualizar Node

#### Scenario: Sin comando zombi tras update y patch
- **WHEN** se corre `npm run agent:opsx:update`
- **THEN** los destinos opsx se regeneran con la CLI local fijada, invocan `npm exec --yes=false -- openspec` y ningun archivo de harness referencia `opsx:continue`, `opsx-continue` u `openspec-continue-change`

#### Scenario: Artefacto invalido se detecta sin mutarlo
- **WHEN** un change o spec no supera `openspec validate --all --strict --no-interactive`
- **THEN** el smoke check falla, identifica la validacion fallida y no reescribe el artefacto

#### Scenario: Paridad de opsx observada en CI
- **WHEN** se abre o actualiza un PR hacia `main` o `development`
- **THEN** el workflow de paridad instala el lockfile, ejecuta el smoke check y verifica que no queden referencias al comando zombi; durante el arranque suave reporta la falla sin cambiar archivos

#### Scenario: Guia del estado bloqueado
- **WHEN** el apply alcanza `state: "blocked"` despues del patch
- **THEN** la guia es listar los artefactos faltantes, abrir un issue de seguimiento y pausar
