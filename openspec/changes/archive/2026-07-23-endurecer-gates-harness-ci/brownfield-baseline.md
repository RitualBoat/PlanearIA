# Brownfield baseline: endurecer-gates-harness-ci

## Superficies tocadas

- `scripts/checkOpenSpecReadiness.mjs`, `scripts/checkOpenSpecTldr.mjs`, `scripts/gitNexusFts.mjs` y `scripts/harnessDoctor.mjs`.
- Pruebas Node de harness y `src/__tests__/harness/sourceEncoding.test.ts`.
- `package.json`, `package-lock.json`, wrapper de Jest y `.github/workflows/agent-harness-parity.yml`.
- Registro y assessment bajo `.project-os/debt/` para el cierre gobernado de `debt-2887d890144e`.

## Fuentes de verdad actuales

- Issue #136 y su manifest `openspec-readiness:pre-propose`; epic de saneamiento #129.
- Specs `agent-harness-parity`, `openspec-readiness-gates`, `gitnexus-index-health`, `harness-readiness-doctor`, `source-encoding-integrity` y `test-console-signal-guard`.
- `Documentacion/01-planes-maestros/PLAN_PREPARACION_OPERATIVA_SDD_HARNESS_SOLO_DEV.md`, `Documentacion/02-operacion/CONTROL_DEUDA_TECNICA.md` y `CADENCIA_DEPENDENCIAS.md`.

## Comportamiento vigente

- Los cuatro guards forman `file:///${argv[1]}` a mano; en POSIX el bloque CLI no se ejecuta.
- Siete pasos del workflow poseen `continue-on-error: true`.
- Lint/Jest avisan por `baseline-browser-mapping@2.8.22`; Node avisa por Web Storage experimental vía `docx`; el fixture positivo imprime seis líneas al stderr de Jest.
- El audit actual informa 1 low, 20 moderate y 0 high/critical.

## Comportamiento objetivo

- Los cuatro CLI se ejecutan y son probados como procesos reales en Windows y Linux; salida vacía falla.
- Los checks de CI con baseline verde se vuelven bloqueantes y cualquier advisory residual queda documentado de forma completa.
- Las tres señales quedan corregidas o capturadas localmente como salida esperada; no hay supresión global.
- La deuda `debt-2887d890144e` queda resuelta por assessment de remediación sin deuda nueva.

## Compatibilidad legacy

- Los scripts conservan sus argumentos, salida funcional y exportaciones existentes; solo cambia la detección de invocación directa.
- El wrapper de Jest mantiene los argumentos y usa ejecución normal si el runtime no conoce la flag de Web Storage.
- La actualización del dataset no toca Expo SDK ni el contrato de dependencias de producto.

## Owner de spec y contexto

- Owner operativo: plan `preparacion-operativa-sdd-harness`, issue #136.
- Contexto DDD: infraestructura de desarrollo sin entidades de producto ni contrato cruzado.
- Owners de spec: las seis capacidades modificadas enumeradas en `proposal.md` y sus deltas.

## Evidencia actual

- `npm run openspec:ready:propose -- --issue 136`: PASS 10/10 sobre `development@948813e`.
- `npm run gitnexus:diagnose`: índice fresco en `948813e`.
- Trazas reproducidas: `docx` accede a `localStorage` desde Jest; fixture `mojibake.sample.tsx` emite sus seis líneas; `npm ls` fija `baseline-browser-mapping@2.8.22` y `npm view` expone `2.11.1`.
- `npm audit --json`: 1 low, 20 moderate, 0 high/critical.

## Fuera de alcance

- Expo SDK, `npm audit fix`, SheetJS, vendor tarball, notices, assessment y excepción `debt-770acc1e9d53`.
- Branch protection y required checks remotos, #126, PR #127 y el issue cerrado #137.
- UI, backend, `src/sync`, datos docentes, autenticación y publicación del constructor.
