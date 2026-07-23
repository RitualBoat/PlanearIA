# Evidencia de validación técnica

Fecha: 2026-07-23.

## Supply chain y reproducción

- `npm run sheetjs:verify`: PASS. Versión embebida `0.20.3`; SHA-256
  `8dc73fc3b00203e72d176e85b50938627c7b086e607c682e8d3c22c02bb99fe8`.
- Prueba negativa: una copia temporal alterada del tarball hace fallar el verificador sin modificar el
  artefacto real.
- `npm run sheetjs:reproduce-hang`: PASS. El bloqueo sólo se provoca en un proceso hijo; el padre
  confirma el timeout de 1000 ms y termina el hijo.
- Dos ejecuciones completas de `npm ci --ignore-scripts`: PASS. Tras cada una pasó el verificador.
  `package.json` conservó SHA-256
  `83B1EA7D4764A965A071A010F91E999399FCA141161431E39950B8758C71FD22` y
  `package-lock.json` conservó
  `9DAB30CBEE0721A782C4195B2AE2BCCA3355DACCB405A56E2E76357D0361BDAD`.
- El lock resuelve `node_modules/xlsx` como `file:vendor/sheetjs/xlsx-0.20.3.tgz`; la instalación no
  necesita descargar SheetJS desde el CDN.

## Matriz completa

- `npm run typecheck`: PASS.
- `npm run lint -- --quiet`: PASS.
- `npm test -- --runInBand`: PASS, 121 suites y 843 tests.
- `npm run backend:check`: PASS.
- `npm run test:debt-control`: PASS, 58 tests.
- `npm run agent:harness:check`: PASS, 36 mirrors.
- `npm run openspec:validate`: PASS, 46 items y change válido.
- `npx expo install --check`: PASS, dependencias al día.
- `npm run debt:check`: PASS; ningún trigger de saneamiento y ningún `remediation-new-debt`.
- `git diff --check`: PASS.

## Auditoría y preservación histórica

`npm audit --json` reportó 21 advisories conocidas: 1 low, 20 moderate, 0 high y 0 critical.
`xlsx` no aparece. No se ejecutó `npm audit fix` ni se amplió #137 para corregir dependencias
gobernadas por la cadencia/#136.

El assessment histórico de #133
`.project-os/debt/assessments/resolver-riesgo-y-cadencia-dependencias.json` conserva SHA-256
`4403DF0E2144B6883CD981CE90ACA2768D0E346E6748A410ED8EF2B9877BCE42`.
