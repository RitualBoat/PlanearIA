## Why

En Windows, el wrapper de `gitnexus:diagnose` puede ejecutar fuera de la raíz del checkout y recibir `Not a git repository` con código de salida cero. El doctor lo identifica correctamente como fallo semántico, pero el diagnóstico subyacente sigue siendo un falso negativo que bloquea la ruta primaria de exploración estructural.

La remediación debe ocurrir ahora porque #74 es la unidad autorizada para resolver la deuda registrada en #66, sin mezclarla con la alineación de Expo de #75.

## What Changes

- Fijar de forma determinista la raíz del checkout al invocar GitNexus mediante el wrapper de Windows.
- Convertir `Not a git repository` en un fallo del diagnóstico aunque el proceso hijo termine con código cero, preservando la detección FTS existente.
- Ampliar las pruebas del wrapper y conservar la clasificación semántica del harness doctor.

## No objetivos

- No reindexar GitNexus, cambiar su versión ni modificar su política frente a CodeGraph.
- No corregir la compatibilidad Expo de #75 ni cambiar UI, backend, sync o datos docentes.
- No alterar el contrato de read-only del doctor ni ejecutar recuperaciones automáticamente.

## Capabilities

### New Capabilities

- Ninguna.

### Modified Capabilities

- `gitnexus-index-health`: el diagnóstico de estado debe ejecutarse desde la raíz del checkout y tratar una salida semántica de repositorio ausente como fallo real.

## Impact

- Código: `scripts/gitNexusFts.mjs` y sus pruebas; se verificará el contrato existente de `scripts/harnessDoctor.mjs` y `scripts/testHarnessDoctor.mjs`.
- APIs y datos: ninguno. No se modifican endpoints, storage, `userId`, sync ni proveedores de IA.
- Dependencias: se conserva la versión fijada de GitNexus y la configuración OpenSSL actual; no se instalan ni actualizan paquetes.
- Tracking: implementa #74 y mantiene #66 abierto como tracking de esta y #75.
