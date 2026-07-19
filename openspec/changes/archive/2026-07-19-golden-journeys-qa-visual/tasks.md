# Tasks: golden-journeys-qa-visual

Issue: [#85](https://github.com/RitualBoat/PlanearIA/issues/85). Un bloque a la vez; `[x]` solo con evidencia.

## 1. Manifiesto de journeys

- [x] 1.1 (Evidencia: qa/golden-journeys.json creado; niveles N1/N2/N3 y anchos 375/767/768/1279/1280 con fuenteDeAnchos apuntando a useBreakpoint.) Crear `qa/golden-journeys.json` con `schemaVersion`, los anchos canonicos derivados de `useBreakpoint()` (375/768/1280 y limites 767/1279) y la definicion de los tres niveles de proporcionalidad.
- [x] 1.2 (Evidencia: GJ0 arranque-y-alcance-del-shell en estado vigente, 7 pasos y 5 criterios observables.) Declarar GJ0 `arranque-y-alcance-del-shell` en estado `vigente`: pasos (onboarding -> invitado -> shell abre en Escritorio -> los 5 hubs -> una pantalla real por hub) y criterios observables, derivados de `src/navigation/routeManifest.ts`.
- [x] 1.3 (Evidencia: GJ1 lunes-7am, GJ2 crear-planeacion-y-asignarla y GJ3 capturar-calificaciones en estado parcial, cada uno con bloque delta y changeDuenio.) Declarar GJ1 `lunes-7am` (Maria), GJ2 `crear-y-asignar` (Luis) y GJ3 `capturar-calificaciones` (Carmen) en estado `parcial`, cada uno con los pasos ejecutables hoy sobre rutas reales y el bloque `delta` con el change dueno.
- [x] 1.4 (Evidencia: GJ4 offline-reconexion y GJ5 accion-ia-revisable en estado declarado con duenio golden-journeys-web y sin criterios inventados.) Declarar `offline-reconexion` y `accion-ia-revisable` en estado `declarado` con dueno `golden-journeys-web`, sin inventar criterios.
- [x] 1.5 (Evidencia: npm run qa:visual:check en PASS: manifiesto-rutas confirma que las 15 rutas citadas existen en routeManifest.ts.) Verificar que toda ruta citada en los pasos existe en `ROOT_ROUTES` o `HUB_ROUTES` de `src/navigation/routeManifest.ts`.

## 2. Checker determinista

- [x] 2.1 (Evidencia: scripts/checkGoldenJourneys.mjs con --change, --nivel, --journeys, --evidence, --manifest y --route-manifest; read-only.) Crear `scripts/checkGoldenJourneys.mjs`: lee el manifiesto y el directorio de evidencia de un change, acepta `--change <nombre>` y `--nivel <n>`, y reporta PASS/FAIL con ruta de remediacion. Read-only, sin navegador ni red.
- [x] 2.2 (Evidencia: Cuatro afirmaciones implementadas mas cinco de integridad del manifiesto.) Implementar las cuatro afirmaciones: capturas por ancho exigido, secciones obligatorias del reporte, severidad Nielsen maxima menor que 3, cobertura de los journeys declarados como tocados.
- [x] 2.3 (Evidencia: qa:visual:check agregado a package.json; verificado en PASS.) Agregar `qa:visual:check` a `scripts` de `package.json`.
- [x] 2.4 (Evidencia: scripts/testGoldenJourneys.mjs con 13 escenarios, 11 de ellos negativos.) Crear `scripts/testGoldenJourneys.mjs` con fixtures que pasan y que fallan (captura faltante, seccion ausente, severidad 3, journey sin cubrir), siguiendo la convencion de `scripts/testOpenSpec*.mjs`.
- [x] 2.5 (Evidencia: test:golden-journeys agregado y en PASS; cada fixture negativo afirma el id de fallo esperado, no solo que falle.) Agregar `test:golden-journeys` a `scripts` de `package.json` y verificar por mutacion que cada fixture negativo falla por su motivo y no por otro.

## 3. Runbook

- [x] 3.1 (Evidencia: Documentacion/03-validacion/GOLDEN_JOURNEYS_QA_VISUAL.md con encabezado estado/uso/fuente de verdad/no usar para.) Crear `Documentacion/03-validacion/GOLDEN_JOURNEYS_QA_VISUAL.md` con el encabezado de estado/uso/fuente de verdad que usa el resto de `Documentacion/`.
- [x] 3.2 (Evidencia: Seccion 4: HTTP 200, recorrido por ancho, medicion DOM, capturas, checklists, clasificacion de consola y verificacion.) Documentar el procedimiento paso a paso: levantar `expo start --web` (`.claude/launch.json`, perfil `expo-web`, puerto 8081), confirmar HTTP 200, recorrer por ancho, medir por DOM, capturar, aplicar Nielsen y anti-slop, clasificar consola, archivar.
- [x] 3.3 (Evidencia: Seccion 5: seis trampas con su motivo; 5.2 marcada como la mas peligrosa. Corregidas 5.2, 5.3 y 5.5 y anadida 5.6 tras desmentirlas la corrida real del bloque 4.) Documentar las trampas del entorno web como pasos obligatorios, con el motivo por el que cada una produce evidencia enganosa si se ignora.
- [x] 3.4 (Evidencia: Seccion 3 (niveles y como se declara en readiness.json) y seccion 6 (contrato de evidencia con las siete secciones).) Documentar los tres niveles de proporcionalidad, como se declara el nivel en `readiness.json` y el contrato de evidencia (ubicacion y secciones obligatorias).
- [x] 3.5 (Evidencia: Seccion 7: tabla de tradeoffs, veredicto solo MCP, owner, revision 2027-01-19, dos disparadores y golden-journeys-web como duenio.) Registrar la decision Playwright: tabla de tradeoffs, veredicto (solo MCP), owner, fecha de revision y disparador; nombrar a `golden-journeys-web` como dueno de la automatizacion en CI.
- [x] 3.6 (Evidencia: Seccion 8: tabla de los cuatro componentes de R2; #46 y #47 declarados abiertos.) Declarar explicitamente que este trabajo no cierra R2 y que #46 y #47 siguen abiertos.
- [x] 3.7 (Evidencia: Primera entrada de Reportes Vigentes en Documentacion/03-validacion/README.md.) Registrar el runbook en la seccion "Reportes Vigentes" de `Documentacion/03-validacion/README.md`.

## 4. Corrida de referencia real

- [x] 4.1 (Evidencia: curl a http://localhost:8081 devolvio HTTP 200 antes de navegar; git diff development -- src/ vacio, el codigo servido es identico a development.) Levantar `expo start --web` y confirmar HTTP 200 antes de navegar; registrar el comando y la respuesta.
- [x] 4.2 (Evidencia: GJ0 recorrido con Playwright MCP en 375/768/1280 con clics reales; tablists=1 en los tres anchos; capturas reales en evidencia/capturas/. El primer intento fallo por bloqueo de herramienta y el checker lo detecto; no se fabricaron capturas.) Ejecutar GJ0 completo en 375, 768 y 1280 con Playwright MCP: medicion DOM por ancho y capturas reales en `evidencia/capturas/`.
- [x] 4.3 (Evidencia: evidencia/README.md con las siete secciones, incluidas la clasificacion de los 28 errores 401 y cinco limitaciones honestas.) Redactar `evidencia/README.md` cumpliendo las siete secciones del contrato, incluida la clasificacion del ruido de consola y las limitaciones honestas.
- [x] 4.4 (Evidencia: qa:visual:check PASS en las once afirmaciones sobre la propia evidencia del change.) Correr `npm run qa:visual:check -- --change golden-journeys-qa-visual` sobre la propia evidencia y registrar su salida; el change se autoverifica con su propio contrato.

## 5. Validacion y cierre

- [x] 5.1 (Evidencia: typecheck y lint --quiet sin errores.) `npm run typecheck` y `npm run lint -- --quiet` en verde.
- [x] 5.2 (Evidencia: 103 suites / 677 tests en verde, sin regresion de la linea base.) `npm test -- --runInBand` sin regresion de la linea base (103 suites / 677 tests).
- [x] 5.3 (Evidencia: golden-journeys-tests PASS, 13 escenarios.) `npm run test:golden-journeys` en verde.
- [x] 5.4 (Evidencia: openspec:validate 29/29 y openspec-tldr OK.) `npm run openspec:validate` en verde.
- [x] 5.5 (Evidencia: TLDR.md actualizado: conteo de trampas corregido tras la corrida real y bloque de Tasks reescrito para registrar que la revision adversarial ataco al checker y cerro el hueco.) Actualizar `TLDR.md` si cambiaron alcance, archivos, comportamiento o resultado esperado.
- [x] 5.6 (Evidencia: revision adversarial 2026-07-19, PASS CON HUECOS. Dos majors detectados y cerrados dentro de la revision: los chequeos de medicion y de cobertura eran falsos positivos por los nombres de captura; un reporte hueco pasaba N2 completo. Corregido con parseo por secciones y verificado por mutacion; fixtures 13 -> 17.) Revision adversarial independiente antes de archivar.
- [x] 5.7 (Evidencia: gate de archive ejecutado con --run-local; openspec-strict y harness-parity en verde y las 14 afirmaciones en PASS.) `npm run openspec:ready:archive -- --change golden-journeys-qa-visual --run-local` en PASS.
