# Tasks: breakpoints-reactivos

Regla: una tarea a la vez. `[x]` solo con evidencia (salida de typecheck, lint y tests afectados).

## 1. Fuente reactiva unica (infra pura)

- [x] 1.1 Crear `src/hooks/useBreakpoint.ts`: tipo `Breakpoint = "mobile" | "tablet" | "desktop"`; constante `BREAKPOINTS = { tablet: 768, desktop: 1280 }`; funcion pura `getBreakpoint(width)`; funcion pura `resolveResponsive(breakpoint, mobile, tablet, desktop?)` (desktop omitido cae a tablet). Hook `useBreakpoint()` sobre `useWindowDimensions()` que devuelve `{ width, height, fontScale, breakpoint, isMobile, isTablet, isDesktop }`, memoizado por valores.
- [x] 1.2 Tests unitarios de `getBreakpoint` (limites 767/768/1279/1280, 0 y ancho grande) y `resolveResponsive` (cada bucket, fallback desktop->tablet, valores no numericos). En `src/__tests__/hooks/useBreakpoint.test.tsx`. Evidencia: 8/8 PASS.
- [x] 1.3 Test de reactividad de `useBreakpoint`: mock de `useWindowDimensions` con anchos cambiantes; `breakpoint`, `width`, `fontScale` y flags reflejan el valor nuevo. Evidencia: PASS.

## 2. Contrato de fabrica (preparar ancho en `ThemedStylesInput`)

- [x] 2.1 Agregar `breakpoint?: Breakpoint` (opcional) a `ThemedStylesInput` en `src/themes/types.ts` (import type desde `../hooks/useBreakpoint`); docstring actualizado (bucket reactivo, opcional, `useAppTheme` no lo provee). `useAppTheme` intacto. Evidencia: `npm run typecheck` verde.
- [x] 2.2 Test de fabrica de muestra memoizada por bucket (valores distintos por rango, estables dentro del rango). Evidencia: PASS (dentro de `useBreakpoint.test.tsx`).

## 3. Descongelar `LoginScreen` (el bug real)

- [x] 3.1 `LoginScreen.tsx`: `StyleSheet.create` de modulo convertido en fabrica exportada `getStyles(breakpoint)` con `COLORS`/`FONT_SIZES` estaticos e `isWeb()` de plataforma; los 7 `responsive(...)` -> `resolveResponsive(breakpoint, ...)`; al render `const { breakpoint } = useBreakpoint()` con `useMemo`. Import de `responsive` retirado; `isWeb` conservado.
- [x] 3.2 Test de reflow de `LoginScreen` (fabrica exportada): logo 120/140/160 por rango; titulo y `maxWidth` del formulario varian. En `src/__tests__/auth/LoginScreen.responsive.test.tsx`. Evidencia: 3/3 PASS. Se probo la fabrica en vez de montar la pantalla completa para no acoplar la prueba a AuthContext/AsyncStorage; equivale al reflow por rango.

## 4. Unificar la fuente en los 6 mixtos

- [x] 4.1 `ListaRecursosScreen.tsx`: `useWindowDimensions()` -> `useBreakpoint()`; `width >= 920` conservado.
- [x] 4.2 `RecursosDidacticosScreen.tsx`: idem, `width >= 920` conservado.
- [x] 4.3 `CrearGrupoScreen.tsx`: idem, `width >= 900` conservado.
- [x] 4.4 `ListaGruposScreen.tsx`: idem, `width >= 920` conservado.
- [x] 4.5 `ListaPlantillasScreen.tsx`: idem, `width >= 920` conservado.
- [x] 4.6 `CuentaScreen.tsx`: idem, `width >= 1080` conservado (piloto themeado; `getStyles` sin `breakpoint`, no tiene estilo de ancho). Reflow en vivo verificado en QA.

## 5. Jubilar el API congelado

- [x] 5.1 `src/utils/responsive.ts`: `responsive()` y `getScreenDimensions()` retirados; `isWeb()` conservado con comentario que redirige a `useBreakpoint`. Ningun archivo importa ya `responsive`/`getScreenDimensions` (solo `isWeb`).
- [x] 5.2 Gate objetivo: `rg "Dimensions.get" src/` devuelve cero ocurrencias en codigo (solo quedan menciones en comentarios de `useBreakpoint.ts` y `responsive.ts`).

## 6. Validacion

- [x] 6.1 `npm run typecheck` en verde.
- [x] 6.2 `npm run lint -- --quiet` en verde.
- [x] 6.3 `npm test -- --runInBand` en verde: 96 suites, 628 tests. Linea base 94/617 + 2 suites nuevas (11 tests) = sin regresion.
- [x] 6.4 `npm exec -- openspec validate --all --strict --no-interactive` en verde (25/25).

## 7. QA visual (gate obligatorio de UI)

- [x] 7.1 `expo start --web` (config `expo-web`) levantado; HTTP 200 confirmado (bundle compilado, pantalla renderizada).
- [x] 7.2 Medicion en la app real: `LoginScreen` a 1280 (escritorio) con logo 160x160 y titulo 32px = `getStyles('desktop')` exacto. `computer screenshot` del harness agota tiempo (renderer ocupado); se uso medicion DOM/estilos computados, numerica y exacta. Evidencia en `evidencia/README.md`.
- [x] 7.3 Reflow en vivo sin recargar sobre pantalla migrada (`CuentaScreen`): la columna `wideLayout` (>=1080) aparece a 1280 y desaparece a 375 al disparar el evento `resize`, con `reloads` constante. Se documento la limitacion del harness (CDP no emite el evento `resize` del DOM; se dispara el real, equivalente a arrastrar la ventana).
- [x] 7.4 Consola sin errores de render/dimensiones en los estados probados.
- [x] 7.5 Checklist Nielsen del reflow registrado en `evidencia/README.md`; se adjunta al issue #79 en el cierre.

## 8. Cierre

- [x] 8.1 Artefactos actualizados con conteos reales (96 suites / 628 tests). Alcance y comportamiento sin cambio.
- [x] 8.2 Revision adversarial independiente (verificacion previa a archive). Veredicto y detalle en `readiness.json`.

## Procedimiento de cierre (no son tareas de implementacion)

Estos pasos ejecutan el propio cierre y no se marcan como checkbox para no crear
autorreferencia con el gate `tasks-complete` (mismo criterio que changes previos archivados):

- `npm run openspec:ready:archive -- --change breakpoints-reactivos --run-local` debe reportar PASS.
- Archive del change, sync de specs y `npm run opsx:finish` (PR hacia `development`, espera de checks, merge).
