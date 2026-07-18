# Brownfield baseline: tokens-completos

Alcance de este documento: solo la superficie que el change toca. No inventaria la app.

## Superficies tocadas

- `src/themes/spacing.ts` (nuevo): escala 4pt.
- `src/themes/radii.ts` (nuevo): 8/12/16/pill.
- `src/themes/typography.ts` (nuevo): escala base + helper `scaleType`.
- `src/themes/elevation.ts` (nuevo): `getElevation(colors)` theme-aware.
- `src/themes/motion.ts` (nuevo): `duration`, `spring`, `reduceMotionPolicy`.
- `src/themes/zIndex.ts` (nuevo): escala nombrada ascendente.
- `src/themes/useReducedMotionPreference.ts` (nuevo): hook SO (reanimated) OR in-app.
- `src/themes/tokens.ts` (nuevo): barrel de reexport.
- `src/__tests__/themes/` (nuevo): pruebas unitarias de los tokens y el hook.
- `evidencia/` (nuevo): pagina de preview y README.

No se tocan: `App.tsx`, `src/navigation/`, `src/sync/`, `backend/`, ninguna pantalla de `src/screens/`, ni los contextos `ThemeContext`, `FontSizeContext`, `DaltonismoContext`, `AccessibilityPreferencesContext`.

## Fuentes de verdad actuales

- `src/themes/colors.ts`: `lightTheme`, `darkTheme`, `COLORS`. Incluye `shadowBlue` y `shadowBlueLift` (difieren por tema).
- `src/themes/types.ts`: `ColorTokens`, `ThemeMode`, `FontSizeMode`, `DaltonismoMode`, `ThemedStylesInput` (`colors`, `isDark`, `scaled`, `highContrast`, `breakpoint?`).
- `src/themes/useAppTheme.ts`: hook compuesto `{ colors, isDark, theme, scaled, highContrast }` (#78).
- `src/context/FontSizeContext.tsx:41-44`: `scaled(base) = round(base * factor)`; factores 0.85/1/1.2/1.4.
- `src/context/AccessibilityPreferencesContext.tsx:11,30,53-56`: preferencia in-app reactiva `reduceMotion` (clave `APP_REDUCE_MOTION`).
- `src/components/AnimatedTopPill.tsx:150`: `boxShadow` ya en uso cross-platform.
- `package.json`: `react-native-reanimated ^4.1.2`, `expo-font ~14.0.11`, sin `expo-blur`.
- Plan: `Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md` (secciones 1.9.2/1.9.4 y change `tokens-completos`).

## Comportamiento vigente

`src/themes/` cubre solo color y el contrato de la fabrica. No existe ninguna constante de token para espaciado, radios, tipografia, elevacion, movimiento ni z-index. Verificado 2026-07-17: 95 archivos de `src/` codifican `borderRadius` con literales; los tamanos, sombras y capas se deciden ad hoc por pantalla. La tipografia solo escala donde se llamo `scaled()` a mano (3 archivos). El movimiento en la app usa hoy el API `Animated` de RN (p. ej. `AnimatedTopPill`, `Toast`) sin una primitiva estandar de reduce-motion; el plan 1.9.4 propone `AccessibilityInfo.isReduceMotionEnabled` (asincrono). La preferencia in-app `reduceMotion` existe pero ningun helper la combina con el ajuste del SO.

## Comportamiento objetivo

- Seis grupos de tokens definidos en `src/themes/` y reexportados por `tokens.ts`, consumibles desde la fabrica `getStyles` sin cambiar su contrato.
- Tipografia base multiplicada por `FontSizeContext` via `scaleType(token, scaled)`.
- Elevacion en 3 niveles que toma su sombra de `colors.shadowBlue`/`shadowBlueLift` (difiere claro/oscuro).
- Movimiento con `duration` (150/250ms), springs y `reduceMotionPolicy = ReduceMotion.System`; hook `useReducedMotionPreference()` = SO (`useReducedMotion`) OR in-app (`reduceMotion`), con la salvedad del SO documentada.
- z-index nombrado y ascendente.
- Previews de los tokens como evidencia visual.
- Sin dependencias nuevas: `expo-blur` y la fuente de marca quedan diferidas por escrito.

## Compatibilidad legacy

- Ninguna pantalla consume aun los tokens: agregar los modulos no cambia ni el aspecto ni el comportamiento de ninguna pantalla existente. La fundacion es puramente aditiva.
- `COLORS` y la regla de lint de #78 no se tocan; el barrel `tokens.ts` no reexporta `COLORS`.
- Los contratos publicos de `ThemeContext`, `FontSizeContext` y `DaltonismoContext` no cambian.
- `AccessibilityPreferencesContext` no se modifica: `useReducedMotionPreference` solo lee su `reduceMotion` existente.
- Las claves de AsyncStorage (`APP_REDUCE_MOTION`, `APP_THEME_MODE`, `APP_FONT_SIZE_MODE`, `APP_DALTONISMO_MODE`) y las legacy `@planearia:*` no se leen ni escriben distinto.
- El API `Animated` de las pantallas actuales sigue funcionando; migrarlas a los tokens de movimiento es trabajo de otros changes.

## Owner de spec y contexto

- Bounded context owner: **Experiencia y Preferencias** (posee tema, fuente, daltonismo, accesibilidad y el sistema de tokens).
- Spec nueva: `design-tokens` (que tokens existen y como se consumen).
- Spec vecina, no modificada: `theming-runtime-propagation` (contrato de la fabrica `getStyles`) y `settings-accessibility-preferences` (que preferencias se guardan).
- Issue owner: [#80](https://github.com/RitualBoat/PlanearIA/issues/80).

## Evidencia actual

- Antecedente archivado: `theming-runtime` (#78) dejo la fabrica `getStyles` y `useAppTheme`; `breakpoints-reactivos` (#79) agrego `breakpoint?` a `ThemedStylesInput`. Ambos cerrados.
- Auditoria #76: `Documentacion/03-validacion/auditoria-plan-maestro-uxui-ola1/` (H9 refinamiento de reduce-motion, H15; investigacion-web F4).
- Context7 (`/software-mansion/react-native-reanimated`, 2026-07-17): `useReducedMotion` sincrono sin re-render al cambiar el SO; `ReducedMotionConfig`/`ReduceMotion.System|Always|Never`.
- Conteo verificado 2026-07-17: 95 archivos de `src/` con `borderRadius` literal; `src/themes/` sin tokens no-color.
- Senal de tests vigente: la suite del repo debe quedar en verde tras agregar las suites nuevas de tokens, sin regresion.

## Fuera de alcance

- Migrar pantallas a los tokens: es trabajo de `componentes-base` (Ola 1) y de cada change de pantalla.
- Instalar `expo-blur` o adoptar una fuente de marca: diferido por escrito hasta medicion (regla 1.9.4).
- Montar `ReducedMotionConfig` en `App.tsx`: innecesario (default de reanimated ya es `System`); documentado como opcion futura.
- Cambiar el API `Animated` de las pantallas actuales por reanimated: no lo pide este change.
- Navegacion, `App.tsx` y AppShell: son `app-shell-navegacion` (#81).
- Normalizar mojibake fuera de la superficie tocada: R5 aplica al tocar cada archivo.
