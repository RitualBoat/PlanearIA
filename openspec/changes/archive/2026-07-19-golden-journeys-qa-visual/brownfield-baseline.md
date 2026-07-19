# Brownfield baseline: golden-journeys-qa-visual

Alcance de este documento: solo la superficie de QA visual y definicion de journeys que el change va a
tocar. No inventaria la app ni sustituye la spec.

## Superficies tocadas

- `qa/golden-journeys.json` (nuevo): manifiesto de golden journeys.
- `Documentacion/03-validacion/GOLDEN_JOURNEYS_QA_VISUAL.md` (nuevo): runbook y decision Playwright.
- `Documentacion/03-validacion/README.md`: una linea en "Reportes Vigentes".
- `scripts/checkGoldenJourneys.mjs` y `scripts/testGoldenJourneys.mjs` (nuevos).
- `package.json`: dos entradas nuevas en `scripts` (`qa:visual:check`, `test:golden-journeys`).
- `openspec/changes/golden-journeys-qa-visual/evidencia/`: corrida de referencia de GJ0.

Fuera de esta lista no se toca nada: ni `src/`, ni `backend/`, ni workflows de CI, ni gates
compartidos, ni dependencias.

## Fuentes de verdad actuales

- `Documentacion/00-fundamentos/IHC_DISCOVERY_DOCENTE.md`: seccion 4 (recorridos de Maria, Luis y
  Carmen) y seccion 6 (checklist Nielsen y escala de severidad 0-4 con umbral de bloqueo en 3).
- `Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md`: gate R2 (:211) y seccion 1.9
  (Design Excellence y checklist anti-slop).
- `Documentacion/01-planes-maestros/PLAN_PREPARACION_OPERATIVA_SDD_HARNESS_SOLO_DEV.md`: tabla R2 (:39)
  y change `golden-journeys-web` (:481, Ola 2, pendiente).
- `openspec/specs/ux-ihc-chronology/spec.md:22`: R2 como gate previo con golden journeys.
- `openspec/specs/reactive-breakpoints` (#79): `useBreakpoint()` como fuente unica; `mobile <768`,
  `tablet 768-1279`, `desktop >=1280`.
- `openspec/changes/archive/2026-07-18-app-shell-navegacion/evidencia/README.md`: la QA visual de facto
  que este change formaliza.
- `src/navigation/routeManifest.ts`: `ROOT_ROUTES` (9) y `HUB_ROUTES` por hub; superficie navegable real.
- `scripts/checkOpenSpecReadiness.mjs`: `VALIDATION_PROFILES.ui` exige `web-http-200`,
  `playwright-breakpoints` y `nielsen` en la readiness de todo change con superficie `ui`.
- `Documentacion/03-validacion/README.md`: plantilla recomendada de reportes de validacion.

## Comportamiento vigente

- Los golden journeys estan nombrados en tres fuentes y definidos en ninguna: no hay lista, ni anchos
  obligatorios, ni criterios observables, ni contrato de evidencia (hallazgo H3 de la auditoria #76).
- Playwright existe solo como servidor MCP. `package.json` no declara dependencia ni script de
  Playwright, e2e o golden journeys; solo `web` (`expo start --web`) y `build:web`.
- `.github/workflows/` contiene `ci.yml`, `cd.yml`, `react-doctor.yml` y `agent-harness-parity.yml`;
  ningun workflow de QA visual.
- El perfil `ui` del gate de readiness ya exige las tres evidencias, pero su contenido es texto libre:
  nada verifica que las capturas existan ni que el reporte este completo.
- La QA visual de cada change se define por criterio del agente de turno. #81 la ejecuto bien
  (5 anchos, medicion DOM, HTTP 200, Nielsen, anti-slop, ruido clasificado) pero su procedimiento
  quedo dentro de su carpeta de evidencia, no disponible para el siguiente change.
- La senal de tests exigida por R2 esta verde: 103 suites y 677 tests tras #81.

## Comportamiento objetivo

- Los golden journeys existen en un manifiesto versionado, con estado por journey y dueno del delta
  pendiente cuando aplique.
- La QA visual tiene anchos canonicos derivados de `useBreakpoint()` y tres niveles de esfuerzo segun
  el alcance del change.
- El procedimiento esta escrito con las trampas del entorno web como pasos obligatorios.
- La evidencia tiene forma fija y se verifica con `npm run qa:visual:check`, determinista y read-only.
- La decision sobre Playwright esta registrada con tradeoffs, owner y disparador de revision.
- El alcance de R2 cubierto es explicito: solo la parte de golden journeys de H3.

## Compatibilidad legacy

- **No se toca ningun gate compartido.** `scripts/checkOpenSpecReadiness.mjs` queda igual; el checker
  nuevo es independiente y su uso se exige por runbook, no por cableado.
- **No se modifica la evidencia ya archivada.** La de #81 sigue valida tal cual; el contrato nuevo se
  aplica a changes futuros y el propio change lo estrena con su corrida de referencia.
- **No se altera la QA de changes en curso.** Al no haber changes activos ademas de este, ninguno
  queda a medio camino entre dos contratos.
- **Ningun runtime de la app importa los artefactos nuevos**, asi que no hay superficie de regresion
  sobre `src/` ni sobre las suites existentes.
- **Las tres evidencias del perfil `ui`** (`web-http-200`, `playwright-breakpoints`, `nielsen`) siguen
  siendo las mismas claves; el change les da contenido verificable, no las renombra.

## Owner de spec y contexto

- **Spec nueva:** `golden-journeys-qa` (capability creada por este change).
- **Contexto DDD:** "Experiencia y Preferencias" para la superficie de UI evaluada; el artefacto en si
  pertenece al harness de validacion, junto a `openspec-readiness-gates` y `harness-readiness-doctor`.
- **Specs relacionadas que NO se modifican:** `ux-ihc-chronology` (declara R2 y sigue vigente sin
  cambios), `reactive-breakpoints` (origen de los anchos), `adaptive-app-shell` (superficie que recorre
  GJ0), `design-tokens` y `theming-runtime-propagation`.

## Evidencia actual

- `package.json` y `.github/workflows/` verificados el 2026-07-18: sin Playwright, sin workflow visual.
- `openspec/changes/archive/2026-07-18-app-shell-navegacion/evidencia/`: reporte y ocho capturas reales
  por breakpoint, precedente directo del contrato.
- `Documentacion/03-validacion/auditoria-plan-maestro-uxui-ola1/`: H3 (`matriz-hallazgos.md:11`),
  cobertura del gate R2 (`matriz-cobertura.md:14`), inventario de CI (`log-auditoria.md:34`) y
  dependencia pre-R2 (`mapa-dependencias-roadmap.md:14`).
- `src/navigation/routeManifest.ts` leido el 2026-07-18: 9 rutas raiz y 5 hubs con sus rutas.
- Trampas del entorno web verificadas el 2026-07-17 y 2026-07-18 durante la QA de #79 y #81.

## Fuera de alcance

- Pantallas y navegacion: el change no toca `src/`.
- Cierre del gate R2: #46 (Figma) y #47 (reclutamiento IHC) siguen siendo gates manuales ajenos.
- Automatizacion en CI, devDependency de Playwright y baselines de imagen: son `golden-journeys-web`.
- Criterios de los journeys `offline-reconexion` y `accion-ia-revisable`: solo se reservan.
- Cableado del checker dentro del gate de readiness compartido: queda como seguimiento con disparador.
- Planes maestros y sus conteos: no se editan.
