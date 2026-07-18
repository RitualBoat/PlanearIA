# Tasks: tokens-completos

Regla: una tarea a la vez. `[x]` solo con evidencia (salida de typecheck, lint y tests afectados).

## 1. Tokens estaticos: espaciado, radios, z-index

- [x] 1.1 Crear `src/themes/spacing.ts`: constante `spacing` `as const` en escala 4pt (`none:0, xs:4, sm:8, md:12, lg:16, xl:24, xxl:32, xxxl:48`), con comentario del porque (ritmo 4pt del plan).
- [x] 1.2 Crear `src/themes/radii.ts`: constante `radii` `as const` con `none:0, sm:8, md:12, lg:16, pill:9999`, segun el plan (8/12/16/pill).
- [x] 1.3 Crear `src/themes/zIndex.ts`: constante `zIndex` `as const` nombrada por rol de capa (base, raised, dropdown, sticky, banner, overlay, modal, toast, tooltip) con valores estrictamente ascendentes.
- [x] 1.4 Tests en `src/__tests__/themes/tokens.test.ts`: espaciado alineado a 4pt (valores no cero multiplos de 4, orden ascendente), radios incluyen 8/12/16/pill, z-index estrictamente ascendente por rol. Evidencia: 18/18 PASS en la suite de themes.

## 2. Movimiento y reduce-motion (resuelve H9)

- [x] 2.1 Crear `src/themes/motion.ts`: `duration` (`instant:0, fast:150, base:250, slow:400`), presets de `spring` (rigidez/amortiguacion) y `timing`, y `reduceMotionPolicy = ReduceMotion.System`; los configs de spring/timing incluyen `reduceMotion: reduceMotionPolicy`. Import de `ReduceMotion`/tipos `WithSpringConfig`/`WithTimingConfig` desde `react-native-reanimated` (API verificada en Context7).
- [x] 2.2 Crear `src/themes/useReducedMotionPreference.ts`: hook que devuelve `useReducedMotion() || reduceMotion` (SO via reanimated OR preferencia in-app de `AccessibilityPreferencesContext`). JSDoc con la salvedad: `useReducedMotion` es sincrono pero no re-renderiza si el SO cambia con la app abierta; mitigacion documentada. No se modifica `AccessibilityPreferencesContext`.
- [x] 2.3 Tests en `src/__tests__/themes/`: `duration` expone 150 y 250; springs tienen amortiguacion/rigidez; `reduceMotionPolicy === ReduceMotion.System`; spring y timing honran la politica. `useReducedMotionPreference` cumple el OR: SO true -> true; in-app true -> true; ambos true -> true; ambos false -> false (mock de `useReducedMotion` y del contexto). Evidencia: 18/18 PASS.

## 3. Tipografia escalable por `FontSizeContext`

- [x] 3.1 Crear `src/themes/typography.ts`: interfaz `TypeToken` (`fontSize`, `lineHeight`, `fontWeight`, `letterSpacing?`) y constante `typography` (`display/title/heading/subtitle/body/bodyStrong/caption/overline`) alineada al lenguaje visual vigente; sin `fontFamily` (costura de fuente de marca diferida documentada).
- [x] 3.2 Agregar `scaleType(token, scaled)` puro que multiplica `fontSize` y `lineHeight` por `scaled`, conserva `fontWeight` y `letterSpacing`.
- [x] 3.3 Tests: `scaleType` con factor 1 conserva base; con factor 1.4 multiplica `fontSize`/`lineHeight` y NO altera `fontWeight`/`letterSpacing`; omite `letterSpacing` cuando el token no lo define; los tokens base tienen `fontSize`/`lineHeight` positivos. Evidencia: 18/18 PASS.

## 4. Elevacion theme-aware

- [x] 4.1 Crear `src/themes/elevation.ts`: `getElevation(colors)` que devuelve `{ level1, level2, level3 }` (`ViewStyle`) con `boxShadow` creciente tomando color de `colors.shadowBlue`/`shadowBlueLift`.
- [x] 4.2 Tests: `getElevation(lightTheme)` y `getElevation(darkTheme)` difieren en el color de sombra; los 3 niveles son distintos entre si. Evidencia: 18/18 PASS.

## 5. Barrel y consistencia

- [x] 5.1 Crear `src/themes/tokens.ts` que reexporta `spacing`, `radii`, `zIndex`, `typography`/`scaleType`, `getElevation`, y `duration`/`spring`/`timing`/`reduceMotionPolicy`/`useReducedMotionPreference`. No reexporta `COLORS`; `npm run lint -- --quiet` en verde confirma que no rompe la regla de #78.
- [x] 5.2 `ThemedStylesInput` no cambia y los contextos protegidos siguen intactos: `useReducedMotionPreference` solo lee `reduceMotion` de `AccessibilityPreferencesContext`, sin modificarlo. Evidencia: `npm run typecheck` en verde.

## 6. Validacion

- [x] 6.1 `npm run typecheck` en verde.
- [x] 6.2 `npm run lint -- --quiet` en verde con la regla de `COLORS` de #78 activa.
- [x] 6.3 `npm test -- --runInBand` en verde: 98 suites, 646 tests. Linea base 96/628 (#79) + 2 suites nuevas (18 tests) = sin regresion.
- [x] 6.4 `npm exec -- openspec validate --all --strict --no-interactive` en verde (26/26).

## 7. Previews (documentacion visual)

- [x] 7.1 Crear `evidencia/tokens-preview.html`, pagina autocontenida y espejo fiel de los valores de `src/themes/` (espaciado, radios, tipografia base + escala xlarge, elevacion claro/oscuro, movimiento, z-index).
- [x] 7.2 Renderizada y medida por breakpoint (DOM/estilos computados; el screenshot del harness agota tiempo, igual que en #79). Reflujo confirmado: grid 1 col a 375, 2 col a 768, 3 col a 1280; tipografia en tamanos base exactos; elevacion difiere claro vs oscuro; z-index ascendente; consola sin errores. Metodo y resultados en `evidencia/README.md`.
- [x] 7.3 Checklist Nielsen acotado (consistencia, reconocimiento vs recuerdo, accesibilidad, sin regresion) en `evidencia/README.md`; se adjunta al issue #80 en el cierre.

## 8. Cierre

- [x] 8.1 Alcance, archivos y comportamiento reales coinciden con lo propuesto (change puramente aditivo, 6 grupos + hook + previews); no hubo cambio de alcance, asi que TLDR y demas artefactos se conservan sin edicion.
- [x] 8.2 Revision adversarial independiente (verificacion previa a archive): PASS CON HUECOS, sin blockers ni majors, 3 minors/preguntas rastreados y mitigados. Veredicto y detalle en `readiness.json`.

## Procedimiento de cierre (no son tareas de implementacion)

Estos pasos ejecutan el propio cierre y no se marcan como checkbox para no crear
autorreferencia con el gate `tasks-complete` (mismo criterio que changes previos archivados):

- `npm run openspec:ready:archive -- --change tokens-completos --run-local` debe reportar PASS.
- Archive del change, sync de specs y `npm run opsx:finish` (PR hacia `development`, espera de checks, merge).
