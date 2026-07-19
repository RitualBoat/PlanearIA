# Proposal: golden-journeys-qa-visual

Issue: [#85](https://github.com/RitualBoat/PlanearIA/issues/85).
Plan: `Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md` (gate R2) y
`PLAN_PREPARACION_OPERATIVA_SDD_HARNESS_SOLO_DEV.md` (R2, change `golden-journeys-web` de Ola 2).
Depende de: #81 (`app-shell-navegacion`), archivado el 2026-07-18.

## Why

El gate operativo **R2** exige "golden journeys" antes de la UI visible de Ola 2. Tres fuentes lo
nombran y ninguna lo define:

- `PLAN_PREPARACION_OPERATIVA_SDD_HARNESS_SOLO_DEV.md:39` (tabla de gates).
- `PLAN_UXUI_NAVEGACION_GLOBAL.md:211` (transicion conceptual).
- `openspec/specs/ux-ihc-chronology/spec.md:22` (spec vigente).

No existe lista de journeys, ni anchos obligatorios, ni criterios observables, ni contrato de
evidencia. Es el hallazgo **H3** de la auditoria #76. La otra mitad de R2, la senal de tests, esta
verde (103 suites / 677 tests tras #81), asi que la brecha es exactamente esta.

### La brecha no es la herramienta: es el contrato

Es tentador leer "Playwright no es dependencia del repo" y concluir que falta instalar un runner.
La evidencia dice otra cosa. El change #81 produjo QA visual **real y de alta calidad** sin runner
instalado: midio por DOM en 375/767/768/1279/1280, confirmo HTTP 200 del bundler antes de navegar,
aplico el checklist Nielsen con severidad y el anti-slop de la seccion 1.9.3, clasifico el ruido de
consola en vez de declarar "cero errores", y encontro un defecto que solo aparece en navegador real
(la barra movil recortaba etiquetas; se corrigio con `height: 64`).

Nada de eso fallo. Lo que falla es que **ese procedimiento no existe fuera de esa carpeta**. El
siguiente change de UI no tiene de donde leer que anchos son obligatorios, que recorrido debe cubrir,
que forma tiene la evidencia ni como se verifica que no falta nada. Se reinventa cada vez, y una QA
que se reinventa se degrada en silencio: nadie nota la captura que no se tomo.

Por eso este change entrega **definicion y contrato verificable**, no una herramienta nueva.

## What

Cuatro artefactos versionados y una corrida de referencia real.

- **Manifiesto de journeys** (`qa/golden-journeys.json`): fuente de verdad legible por maquina con
  id, persona IHC, pasos, criterios observables, anchos obligatorios, capturas esperadas y `estado`
  de cada journey.
- **Runbook** (`Documentacion/03-validacion/GOLDEN_JOURNEYS_QA_VISUAL.md`): procedimiento paso a paso,
  los tres niveles de proporcionalidad, el contrato de evidencia, donde se archiva, las trampas
  verificadas del entorno web y la decision Playwright con owner y disparador de revision.
- **Checker determinista** (`scripts/checkGoldenJourneys.mjs` + `npm run qa:visual:check`): lee el
  manifiesto y afirma sobre la evidencia de un change que no falte nada. Read-only, sin navegador ni red.
- **Fixtures** (`scripts/testGoldenJourneys.mjs` + `npm run test:golden-journeys`): casos que pasan y
  que fallan, para que el checker no sea decorativo.
- **Corrida de referencia**: GJ0 ejecutado sobre la app real en 375/768/1280, archivado como ejemplo
  canonico dentro del change.

### Los cuatro journeys

| ID | Nombre | Persona | Estado | Delta pendiente y dueno |
| --- | --- | --- | --- | --- |
| GJ0 | Arranque y alcance del shell | (transversal) | **vigente** | ninguno |
| GJ1 | Lunes 7am: preparar el dia | Maria | parcial | tablero del dia: `escritorio-docente` (Ola 2) |
| GJ2 | Crear una planeacion y asignarla | Luis | parcial | asignar desde el documento: `crear-tipo-primero` + `assign-sheet` |
| GJ3 | Pasar calificaciones de papel a la app | Carmen | parcial | importar SU Excel con formulas: CalcuPLAN (diferido) |

GJ1-GJ3 traducen los tres recorridos de `IHC_DISCOVERY_DOCENTE.md` seccion 4. Esos recorridos
describen como trabaja el docente **hoy sin PlanearIA**, asi que cada journey declara el camino real
ejecutable hoy y el delta que falta, con el change que lo cierra. GJ0 es transversal y es el unico
100% ejecutable hoy: es la red de regresion que protege a todo change de UI de romper el shell.

`offline-reconexion` y `accion-ia-revisable` quedan en el manifiesto con estado `declarado` y dueno
`golden-journeys-web`, para que no se pierdan sin definirlos aqui.

### Decision registrada: Playwright sigue siendo solo MCP

| Opcion | A favor | En contra |
| --- | --- | --- |
| devDependency + runner versionado | recorridos como codigo; baseline comparable en CI | ~1 GB de navegadores; CI tendria que levantar el bundler de Expo web (lento y flaky); sin fixtures de auth ni datos de prueba; costo real contra presupuesto bajo/cero con un solo dev |
| **Solo MCP + manifiesto + runbook + checker** | cero instalacion; cierra la brecha que realmente fallo; ya demostrado en #81 | la ejecucion sigue conducida por agente, no por CI |

Se elige la segunda, con disparador de revision escrito: regresion visual bloqueante en CI con
baseline de imagenes, o entrada de un segundo colaborador. Ese es el alcance de `golden-journeys-web`,
que ya existe en el plan de harness.

## No objetivos

- No implementar ni redisenar pantallas. Este change no toca `src/screens/` ni `src/navigation/`.
- No declarar R2 listo. #46 (aprobacion Figma) y #47 (reclutamiento IHC) siguen siendo gates manuales
  con su propia evidencia; aqui solo se cierra la parte "golden journeys" de H3.
- No instalar Playwright como dependencia ni crear workflow de CI de QA visual: es `golden-journeys-web`.
- No definir criterios de `offline-reconexion` ni de `accion-ia-revisable`.
- No modificar `scripts/checkOpenSpecReadiness.mjs` ni ningun gate compartido.
- No fabricar capturas ni evidencia simulada: lo que no se ejecute se declara como no ejecutado.
- No editar los planes maestros ni sus conteos.
- No crear infraestructura de pago.
