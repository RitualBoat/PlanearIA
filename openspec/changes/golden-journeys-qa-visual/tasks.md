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

- [ ] 3.1 Crear `Documentacion/03-validacion/GOLDEN_JOURNEYS_QA_VISUAL.md` con el encabezado de estado/uso/fuente de verdad que usa el resto de `Documentacion/`.
- [ ] 3.2 Documentar el procedimiento paso a paso: levantar `expo start --web` (`.claude/launch.json`, perfil `expo-web`, puerto 8081), confirmar HTTP 200, recorrer por ancho, medir por DOM, capturar, aplicar Nielsen y anti-slop, clasificar consola, archivar.
- [ ] 3.3 Documentar las cuatro trampas del entorno web como pasos obligatorios, con el motivo por el que cada una produce evidencia enganosa si se ignora.
- [ ] 3.4 Documentar los tres niveles de proporcionalidad, como se declara el nivel en `readiness.json` y el contrato de evidencia (ubicacion y secciones obligatorias).
- [ ] 3.5 Registrar la decision Playwright: tabla de tradeoffs, veredicto (solo MCP), owner, fecha de revision y disparador; nombrar a `golden-journeys-web` como dueno de la automatizacion en CI.
- [ ] 3.6 Declarar explicitamente que este trabajo no cierra R2 y que #46 y #47 siguen abiertos.
- [ ] 3.7 Registrar el runbook en la seccion "Reportes Vigentes" de `Documentacion/03-validacion/README.md`.

## 4. Corrida de referencia real

- [ ] 4.1 Levantar `expo start --web` y confirmar HTTP 200 antes de navegar; registrar el comando y la respuesta.
- [ ] 4.2 Ejecutar GJ0 completo en 375, 768 y 1280 con Playwright MCP: medicion DOM por ancho y capturas reales en `evidencia/capturas/`.
- [ ] 4.3 Redactar `evidencia/README.md` cumpliendo las siete secciones del contrato, incluida la clasificacion del ruido de consola y las limitaciones honestas.
- [ ] 4.4 Correr `npm run qa:visual:check -- --change golden-journeys-qa-visual` sobre la propia evidencia y registrar su salida; el change se autoverifica con su propio contrato.

## 5. Validacion y cierre

- [ ] 5.1 `npm run typecheck` y `npm run lint -- --quiet` en verde.
- [ ] 5.2 `npm test -- --runInBand` sin regresion de la linea base (103 suites / 677 tests).
- [ ] 5.3 `npm run test:golden-journeys` en verde.
- [ ] 5.4 `npm run openspec:validate` en verde.
- [ ] 5.5 Actualizar `TLDR.md` si cambiaron alcance, archivos, comportamiento o resultado esperado.
- [ ] 5.6 Revision adversarial independiente antes de archivar.
- [ ] 5.7 `npm run openspec:ready:archive -- --change golden-journeys-qa-visual --run-local` en PASS.
