# Brownfield baseline: theming-runtime

Alcance de este documento: solo la superficie que el change toca. No inventaria la app.

## Superficies tocadas

- `src/themes/useAppTheme.ts` (nuevo): hook compuesto de consumo.
- `src/themes/types.ts`: tipo del parametro de la fabrica de estilos.
- `.eslintrc.cjs`: regla `no-restricted-imports` y lista legacy autorizada.
- `src/screens/cuenta/CuentaScreen.tsx`: piloto, adaptado a la firma nueva.
- `src/screens/cuenta/TerminosScreen.tsx`, `SesionesActivasScreen.tsx`, `AdminRolesScreen.tsx`: lote migrado.
- `src/__tests__/`: pruebas del hook compuesto.

No se tocan: `App.tsx`, `src/navigation/`, `src/sync/`, `backend/`, ni las 61 pantallas fuera del lote.

## Fuentes de verdad actuales

- `src/context/ThemeContext.tsx`: `theme`, `colors`, `isDark`, `toggleTheme`, `setTheme`. Clave `APP_THEME_MODE`.
- `src/context/FontSizeContext.tsx`: `fontSizeMode`, `scaleFactor`, `scaled()`. Clave `APP_FONT_SIZE_MODE`.
- `src/context/DaltonismoContext.tsx`: `daltonismoMode`, `applyDaltonismo(colors)`. Clave `APP_DALTONISMO_MODE`.
- `src/context/AccessibilityPreferencesContext.tsx`: `highContrast` y toggles.
- `src/themes/colors.ts`: `lightTheme`, `darkTheme` y `COLORS` estatico legacy.
- Spec vigente: `openspec/specs/settings-accessibility-preferences/spec.md` (contrato de preferencias, issue #34).
- Plan: `Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md`, change `theming-runtime`.

## Comportamiento vigente

Los cuatro proveedores estan montados en `App.tsx:22-25` y funcionan; las preferencias se guardan y se restauran desde AsyncStorage. El consumo es parcial y desigual (verificado 2026-07-17):

- 65 archivos importan `COLORS` estatico: son inmunes a las tres preferencias.
- 18 pantallas llaman `useTheme`: reaccionan solo al tema.
- 1 pantalla (`CuentaScreen`) aplica daltonismo; 3 archivos usan `scaled()`; 7 tienen fabrica `getStyles`.
- Los importadores de `COLORS` y los consumidores de `useTheme` son conjuntos disjuntos: 0 archivos hibridos.

Causa raiz: `useTheme()` devuelve `colors` sin daltonismo; el filtro vive aparte en `applyDaltonismo`. Componer las preferencias es responsabilidad manual de cada pantalla, y solo `CuentaScreen:99-113` lo hace. La fabrica del piloto es posicional: `getStyles(DT, isDark, scaled, highContrast)`.

No existe mecanismo de rastreo del rollout pendiente (H12a). No existe regla de lint contra `COLORS`.

## Comportamiento objetivo

- Un punto de consumo unico (`useAppTheme`) entrega colores con daltonismo aplicado, `isDark`, `scaled` y `highContrast`, memoizado.
- La fabrica recibe un objeto, para que `breakpoints-reactivos` agregue `width` sin reabrir archivos migrados.
- El lint prohibe `COLORS` fuera de una lista legacy explicita, y esa lista es el registro rastreable del rollout: 62 archivos tras este change.
- El modulo `cuenta` queda migrado por completo: las tres preferencias se propagan en sus 4 pantallas sin reiniciar.
- Los tres contextos conservan su contrato publico sin cambios.

## Compatibilidad legacy

- `COLORS` permanece exportado y valido como fallback. Las 61 pantallas no migradas no cambian de comportamiento ni de aspecto.
- `useTheme`, `useFontSize` y `useDaltonismo` siguen exportados con la misma firma: las 17 pantallas que hoy usan `useTheme` no se tocan y siguen funcionando igual.
- Las claves de AsyncStorage (`APP_THEME_MODE`, `APP_FONT_SIZE_MODE`, `APP_DALTONISMO_MODE`) no se leen ni escriben distinto: un revert no altera preferencias guardadas del docente.
- Las claves legacy `@planearia:*` no se tocan.
- La spec `settings-accessibility-preferences` permanece vigente y sin modificar; la capacidad nueva se apoya en ella.

## Owner de spec y contexto

- Bounded context owner de las decisiones: **Experiencia y Preferencias**.
- Superficie tocada en **Identidad y Cuenta** (`SesionesActivasScreen`, `AdminRolesScreen`) solo como consumidora de presentacion: no se toca `Usuario`, `Rol`, `Sesion` ni `AuthContext`, y no se requiere contrato cruzado nuevo (ver `design.md`).
- Spec nueva: `theming-runtime-propagation` (como se consume).
- Spec vecina, no modificada: `settings-accessibility-preferences` (que se guarda y como se restaura).
- Issue owner: [#78](https://github.com/RitualBoat/PlanearIA/issues/78).

## Evidencia actual

- Antecedente archivado: change `apply-cuenta-runtime-accessibility` (issue #34), que pilote el patron en `CuentaScreen` con QA Playwright en 3 breakpoints. Su evidencia es historica y externalizada; **no cuenta como evidencia vigente** de este change, que genera la suya.
- Auditoria #76: `Documentacion/03-validacion/auditoria-plan-maestro-uxui-ola1/matriz-hallazgos.md`, hallazgos H1, H2, H12 (a) y H13.
- Conteos revalidados 2026-07-17 sobre `src/` + `App.tsx`, registrados en #78.
- Senal de tests vigente (H14): 93 suites y 608 tests en verde al 2026-07-16; este change no debe degradarla.

## Fuera de alcance

- Los 62 archivos legacy restantes: quedan como rollout rastreado por la lista del lint.
- `useBreakpoint()`, el parametro `width` y jubilar `responsive.ts`: son `breakpoints-reactivos` (#79).
- Tokens, escalas, radios, elevacion y motion: son `tokens-completos`.
- Navegacion, `App.tsx` y AppShell: son `app-shell-navegacion` (#81).
- Los 6 archivos con mojibake: ninguno cae en el lote; R5 aplica al tocar cada archivo.
- Rediseno visual de las pantallas del lote: este change migra mecanismo, no aspecto.
