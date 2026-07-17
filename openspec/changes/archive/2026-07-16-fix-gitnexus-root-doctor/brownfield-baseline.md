# Baseline brownfield: fix-gitnexus-root-doctor

## Superficies tocadas

- `scripts/gitNexusFts.mjs`: wrapper de GitNexus y diagnóstico de estado.
- `scripts/testGitNexusFts.mjs`: pruebas focalizadas del wrapper y clasificación semántica.
- `scripts/testHarnessDoctor.mjs`: contrato del doctor frente a una salida GitNexus inválida.
- `openspec/specs/gitnexus-index-health/spec.md`: requisito vigente que se modifica mediante delta.

## Fuentes de verdad actuales

- `scripts/gitNexusFts.mjs` fija la versión, el entorno OpenSSL y la rama Windows de PowerShell.
- `scripts/harnessDoctor.mjs` y `harness-doctor.config.json` clasifican `Not a git repository` como fallo del doctor.
- `openspec/specs/gitnexus-index-health/spec.md` define salud, FTS, reparación y verificación estructural.
- Issue #74 y su bloque `openspec-readiness:pre-propose` contienen el diagnóstico reproducible y el alcance aprobado.

## Comportamiento vigente

- El comando directo `gitnexus status` desde la raíz identifica el repositorio.
- El wrapper de `npm run gitnexus:diagnose` puede emitir `Not a git repository` y terminar con código cero en Windows.
- El doctor detecta esa salida y reporta `FAIL gitnexus`; no es un falso verde del doctor, sino un falso negativo del wrapper previo.
- Un índice stale es una señal independiente y no equivale a un repositorio ausente.

## Comportamiento objetivo

- La rama Windows ejecuta GitNexus desde la raíz verificada del checkout.
- La firma semántica `Not a git repository` hace fallar el diagnóstico aunque el proceso hijo termine con cero.
- El doctor conserva la detección de esa firma y puede reflejar el estado real posterior sin ocultar deudas ajenas.

## Compatibilidad legacy

- Se conservan los scripts npm, la versión fijada, los argumentos de verify/repair, OpenSSL y el comportamiento no-Windows.
- No hay migración de datos ni artefactos legacy que retirar.
- La reparación FTS sigue siendo una acción explícita separada; este change no reindexa.

## Owner de spec y contexto

- El contexto **Agent Harness y Code Intelligence** es dueño del wrapper, sus comandos y su evidencia.
- `harnessDoctor.mjs` consume el diagnóstico sin apropiarse de la ejecución GitNexus.
- No existen entidades compartidas, `userId`, permisos, `src/sync` ni contrato cruzado con contextos docentes.

## Evidencia actual

- `npx -y gitnexus@1.6.10-rc.23 status` desde la raíz identifica PlanearIA y reporta estado del índice.
- `npm run gitnexus:diagnose` reproduce `Not a git repository` con código cero.
- `npm run harness:doctor` reporta `FAIL gitnexus` por la firma semántica.
- `scripts/testHarnessDoctor.mjs` ya prueba que esa firma inyectada no produce un falso PASS.

## Fuera de alcance

- #75 y toda actualización Expo.
- UI, Playwright, accesibilidad, backend, IA, auth, sync, almacenamiento y datos académicos.
- Cambiar políticas de GitNexus/CodeGraph, instalar herramientas o regenerar el índice como sustituto del arreglo.
