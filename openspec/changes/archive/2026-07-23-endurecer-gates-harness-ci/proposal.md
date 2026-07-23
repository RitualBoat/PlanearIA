## Why

El issue [#136](https://github.com/RitualBoat/PlanearIA/issues/136) cierra la Ola 3 del epic de saneamiento #129. Cuatro entrypoints del harness comparan `import.meta.url` con una URL armada manualmente: en POSIX producen una barra adicional, el bloque CLI no corre y un gate puede terminar verde sin haber comprobado nada. A la vez, todos los checks de `.github/workflows/agent-harness-parity.yml` siguen como advisory, por lo que el drift reproducible no detiene un PR.

El cambio vuelve verificables esas señales en Windows y Linux, endurece únicamente los checks con baseline estable y conserva el resto como advisory gobernado. Así se puede resolver `debt-2887d890144e` sin convertir ruido inestable ni cambios remotos de protección de rama en falsos bloqueos.

## What Changes

- Migrar los cuatro guards CLI a la comparación portable basada en `pathToFileURL(process.argv[1]).href` y demostrar, mediante procesos hijos, que cada bloque CLI ejecuta tanto en Windows como en Linux.
- Añadir una prueba negativa que falla si un entrypoint no ejecuta el bloque CLI, en vez de aceptar solo el código de salida vacío.
- Convertir a bloqueantes los checks de harness cuya ejecución queda establecida por baseline y pruebas; conservar exclusivamente los advisories que tengan causa, owner, recuperación y criterio concreto de cutover. La ausencia de un comando será fallo, nunca éxito.
- Localizar y tratar las tres señales reproducidas: datos obsoletos de `baseline-browser-mapping`, advertencia de `localStorage` de Node y las seis líneas del fixture positivo de codificación. No se usarán supresiones globales, redirecciones generales ni filtros que oculten regresiones.
- Comparar `npm audit --json` con el baseline de 1 low, 20 moderate y 0 high/critical sin `npm audit fix` ni upgrade de Expo SDK; cualquier drift se investigará y gobernará antes del cierre.
- Capturar un assessment de remediación que resuelva `debt-2887d890144e`, sin modificar los artefactos, el tarball, notices ni la excepción de SheetJS de las olas anteriores.

## Capabilities

### New Capabilities

- Ninguna. El change endurece contratos existentes del harness y de la señal de pruebas.

### Modified Capabilities

- `agent-harness-parity`: el workflow de paridad ejecuta el contrato de CI en Windows y Linux, bloquea solo las señales estabilizadas y documenta cada advisory restante.
- `openspec-readiness-gates`: el entrypoint del gate se ejecuta de forma portable y una ausencia de ejecución no puede producir PASS.
- `gitnexus-index-health`: el diagnóstico CLI se ejecuta de forma portable y queda cubierto por procesos reales.
- `harness-readiness-doctor`: el reporte CLI se ejecuta de forma portable y queda cubierto por procesos reales.
- `source-encoding-integrity`: el fixture negativo conserva sus seis hallazgos como salida esperada asertada, sin contaminar la salida de Jest.
- `test-console-signal-guard`: las señales de tooling y de fixtures se capturan de forma local, explícita y no silencian mensajes no declarados.

## Impact

- Código: `scripts/checkOpenSpecReadiness.mjs`, `scripts/checkOpenSpecTldr.mjs`, `scripts/gitNexusFts.mjs`, `scripts/harnessDoctor.mjs`, pruebas CLI y guardia de consola asociadas.
- CI: `.github/workflows/agent-harness-parity.yml`, con matriz Windows/Linux y el inventario explícito de `continue-on-error`.
- Tooling: configuración o scripts estrictamente necesarios para tratar las tres señales reproducidas y evidencia de `npm audit`.
- Gobernanza: registro y assessment del motor de deuda para `debt-2887d890144e`.
- No cambia APIs de producto, UI, backend, `src/sync`, datos docentes ni permisos remotos de GitHub.

## No objetivos

- No subir Expo SDK, ejecutar `npm audit fix`, ni cambiar SheetJS, su tarball, notices, assessment o la excepción `debt-770acc1e9d53`.
- No cambiar branch protection ni required checks remotos; si fuese necesario, el flujo se detiene para solicitar una decisión.
- No reabrir #137, #126 ni PR #127, ni publicar el constructor como paquete o repositorio separado.
- No convertir una señal inestable en bloqueante ni ocultar advertencias globalmente.
