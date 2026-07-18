# Completar el sistema de tokens: espaciado, tipografia, radios, elevacion, movimiento y z-index

Issue: [#80](https://github.com/RitualBoat/PlanearIA/issues/80).
Plan: `Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md`, change `tokens-completos` (Ola 0).
Origen: auditoria #76 (H9, H15; investigacion-web F4). Depende de: `theming-runtime` (#78, cerrado).

## Why

`src/themes/` es la fundacion de presentacion de PlanearIA, pero hoy solo cubre **color**. Estado revalidado 2026-07-17:

| Archivo en `src/themes/` | Que aporta |
| --- | --- |
| `colors.ts` | `lightTheme`, `darkTheme`, `COLORS` estatico legacy |
| `types.ts` | `ColorTokens`, `ThemedStylesInput` (`colors`, `isDark`, `scaled`, `highContrast`, `breakpoint?`) |
| `useAppTheme.ts` | hook compuesto `{ colors, isDark, theme, scaled, highContrast }` (#78) |

Faltan los **6 grupos de tokens** que el plan (Ola 0) exige: espaciado (escala 4pt), radios (8/12/16/pill), tipografia escalable por `FontSizeContext`, elevacion (3 niveles con `shadowBlue`), movimiento (150/250ms + configs de spring) y z-index nombrado. Sin ellos, cada pantalla decide tamanos, radios y sombras a mano: **95 archivos** de `src/` codifican `borderRadius` con literales, sin una sola constante compartida. Esa es la "decision ad hoc" que la historia quiere eliminar.

La fundacion ya expone los enganches, asi que no hay que reabrir contratos: la fabrica `getStyles({ colors, isDark, scaled, highContrast, breakpoint? })` (#78 + #79) ya entrega `scaled` (para tipografia) y `colors` (para elevacion theme-aware); `colors.shadowBlue`/`shadowBlueLift` ya difieren por tema.

Ademas hay una brecha tecnica en movimiento (H9). Existen **dos** senales de reduce-motion pero ninguna primitiva que las unifique:

- `AccessibilityPreferencesContext` ya persiste una preferencia **in-app reactiva** `reduceMotion` (clave `APP_REDUCE_MOTION`).
- El ajuste del **SO** no tiene consumo estandar; el plan 1.9.4 cita `AccessibilityInfo.isReduceMotionEnabled` (asincrono, parpadea al montar).

`react-native-reanimated` v4.1.2 ya instalada ofrece una primitiva mejor (verificado con Context7 2026-07-17): `useReducedMotion()` sincrono, `ReduceMotion.System|Always|Never` y `ReducedMotionConfig`. La salvedad honesta: `useReducedMotion()` captura el valor al montar y no re-renderiza si el SO cambia con la app abierta.

## What

1. **Un modulo por grupo, mas un barrel.** `spacing.ts`, `radii.ts`, `typography.ts`, `elevation.ts`, `motion.ts`, `zIndex.ts` en `src/themes/`, reexportados por `src/themes/tokens.ts`. Los grupos estaticos (espaciado, radios, movimiento, z-index) son constantes de modulo; los dependientes de runtime se consumen desde `getStyles`.
2. **Tipografia multiplicada por `FontSizeContext`.** Tokens base (`display/title/heading/subtitle/body/bodyStrong/caption/overline`) con `fontSize`, `lineHeight`, `fontWeight`, `letterSpacing`; helper `scaleType(token, scaled)` multiplica `fontSize` y `lineHeight` por el factor activo. Los valores base se alinean con el lenguaje visual vigente, no inventan una escala.
3. **Elevacion theme-aware, 3 niveles.** `getElevation(colors)` devuelve `{ level1, level2, level3 }` como `ViewStyle` con `boxShadow` (cross-platform en RN 0.81 New Arch, ya usado en `AnimatedTopPill`) tomando el color de `colors.shadowBlue`/`shadowBlueLift`.
4. **Movimiento con reduce-motion verificable (resuelve H9).** `motion.ts` exporta `duration` (`fast:150`, `base:250`, `instant`, `slow`), presets de `spring` (rigidez/amortiguacion) y `reduceMotionPolicy = ReduceMotion.System` que los configs llevan por defecto. Hook unico `useReducedMotionPreference()` = `useReducedMotion()` (SO) `||` `reduceMotion` (in-app reactivo): fuente unica para elegir la variante estatica.
5. **Previews de los tokens.** Pagina de preview (espaciado/radios/tipografia/elevacion/movimiento/z-index) como evidencia documentada, capturada por breakpoint.
6. **Decisiones diferidas por escrito.** `expo-blur` se difiere (no se instala; fallback solido). Fuente de marca via `expo-font` se difiere (tokens agnosticos de `fontFamily`, con costura para adoptarla despues bajo licencia libre y medicion).

## No objetivos

- No migrar pantallas: este change define y documenta tokens, no reescribe UI. El plan lo declara asi y el issue lo confirma.
- No instalar `expo-blur` ni adoptar una fuente de marca sin medir (regla 1.9.4): solo se documenta la decision y se deja la costura.
- No introducir blur ni animaciones costosas.
- No modificar `ThemeContext`, `FontSizeContext` ni `DaltonismoContext` en su contrato publico.
- No tocar `AccessibilityPreferencesContext`: solo se consume su `reduceMotion` ya existente.
- No montar `ReducedMotionConfig` en `App.tsx` ni tocar navegacion/AppShell (#81): el default de reanimated ya es `System`.
- No crear componentes base (`componentes-base`, Ola 1) ni consumir los tokens en pantallas existentes.
- No editar el Plan Maestro ni corregir sus conteos.
- No normalizar archivos con mojibake fuera de la superficie tocada (R5 aplica al tocar cada archivo).
