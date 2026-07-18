# Brownfield baseline: breakpoints-reactivos

Alcance de este documento: solo la superficie que el change toca. No inventaria la app.

## Superficies tocadas

- `src/hooks/useBreakpoint.ts` (nuevo): fuente reactiva unica + helpers puros.
- `src/themes/types.ts`: `ThemedStylesInput` gana `breakpoint?` opcional.
- `src/utils/responsive.ts`: se retiran `responsive()` y `getScreenDimensions()`; se conserva `isWeb()`.
- `src/screens/auth/LoginScreen.tsx`: fabrica `getStyles(breakpoint)`; `responsive()` -> `resolveResponsive`.
- `src/screens/biblioteca/ListaRecursosScreen.tsx`, `RecursosDidacticosScreen.tsx`: fuente de `width` unificada.
- `src/screens/grupos/CrearGrupoScreen.tsx`, `ListaGruposScreen.tsx`: fuente de `width` unificada.
- `src/screens/plantillas/ListaPlantillasScreen.tsx`: fuente de `width` unificada.
- `src/screens/cuenta/CuentaScreen.tsx`: fuente de `width` unificada (piloto themeado).
- `src/__tests__/hooks/`, `src/__tests__/auth/`: pruebas nuevas del hook y del reflow de `LoginScreen`.

No se tocan: `App.tsx`, `src/navigation/`, `src/sync/`, `backend/`, `useAppTheme.ts`, las 3 fabricas themeadas ajenas (`Terminos`, `SesionesActivas`, `AdminRoles`) ni las pantallas que solo usan `isWeb()` de plataforma.

## Fuentes de verdad actuales

- `src/utils/responsive.ts:1-37`: `getScreenDimensions()` y `responsive(mobile, tablet, web?)` sobre `Dimensions.get("window")`; `isWeb()` sobre `Platform.OS`.
- `src/themes/types.ts:75-87`: `ThemedStylesInput` (objeto, preparado por #78 para admitir la dimension).
- `src/themes/useAppTheme.ts`: hook compuesto de tema (no se modifica).
- API reactiva de dimensiones: `useWindowDimensions()` de `react-native`.
- Spec vecina: `openspec/specs/theming-runtime-propagation/spec.md` (#78, contrato de consumo de tema).
- Plan: `Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md`, change `breakpoints-reactivos` (R2 tecnico).

## Comportamiento vigente

Verificado 2026-07-17 sobre `src/`:

- 10 archivos consumen `utils/responsive`. Nueve importan solo `isWeb()` (plataforma, `paddingBottom: isWeb() ? 28 : 110`); uno (`LoginScreen`) importa `responsive()`.
- `Dimensions.get()` aparece unicamente en `responsive.ts` (via `responsive()` y `getScreenDimensions()`).
- `LoginScreen.tsx:134-178` llama `responsive()` dentro de un `StyleSheet.create` de modulo: los estilos de ancho (logo, titulo, subtitulo, `maxWidth` del formulario) se congelan al importar y no responden a resize/rotacion.
- Los 6 mixtos (`ListaRecursosScreen`, `RecursosDidacticosScreen`, `CuentaScreen`, `CrearGrupoScreen`, `ListaGruposScreen`, `ListaPlantillasScreen`) ya leen `width` via `useWindowDimensions()` inline con umbrales propios (900/920/1080) y ya se reacomodan; su unica deuda es leer de dos fuentes de verdad.
- `getScreenDimensions()` no tiene consumidores externos.
- `ThemedStylesInput` lo consumen 4 fabricas (`Cuenta`, `Terminos`, `SesionesActivas`, `AdminRoles`); ninguna tiene estilo dependiente de ancho.

## Comportamiento objetivo

- `useBreakpoint()` es la fuente reactiva unica sobre `useWindowDimensions()`: expone `width`, `height`, `fontScale`, `breakpoint` (movil `<768`, tablet `768-1279`, escritorio `>=1280`) y flags, mas helpers puros `getBreakpoint`/`resolveResponsive`.
- `LoginScreen` se reacomoda al instante al redimensionar/rotar; sus estilos de ancho se evaluan con el ancho vigente.
- Los 6 mixtos leen `width` desde `useBreakpoint()` conservando sus umbrales y comportamiento.
- `ThemedStylesInput` admite `breakpoint?` opcional para fabricas themeadas futuras, sin forzar a las actuales.
- No queda `Dimensions.get()` en `src/`.

## Compatibilidad legacy

- `isWeb()` permanece exportado con su semantica de plataforma; los 9 imports que solo lo usan no cambian.
- `LoginScreen` conserva `COLORS`/`FONT_SIZES` estaticos: no se migra su tema (eso es `tokens-completos`); a igual ancho se ve igual.
- Los umbrales propios de los 6 mixtos (900/920/1080) no cambian: mismo comportamiento, distinta fuente de lectura.
- `useAppTheme` y las 3 fabricas themeadas ajenas quedan intactas; `ThemedStylesInput.breakpoint` es opcional, asi que compilan sin cambios.
- No se tocan claves de AsyncStorage, `@planearia:*`, esquema, config remota ni proyecto nativo: un revert no altera datos ni preferencias.

## Owner de spec y contexto

- Bounded context owner: **Experiencia y Preferencias**.
- Superficie tocada en otros modulos (`biblioteca`, `grupos`, `plantillas`, `auth`) solo como consumidora de presentacion: no se toca dominio, `userId`, `src/sync` ni `AuthContext`; no requiere contrato cruzado (ver `design.md`).
- Spec nueva: `reactive-breakpoints` (como se reacciona al ancho).
- Spec vecina, no modificada: `theming-runtime-propagation` (#78, como se consume el tema).
- Issue owner: [#79](https://github.com/RitualBoat/PlanearIA/issues/79).

## Evidencia actual

- Inventario revalidado 2026-07-17 sobre `src/`, registrado en #79: 10 consumidores, `LoginScreen` unico con `responsive()`, `Dimensions.get()` solo en `responsive.ts`, 6 mixtos con umbral propio.
- Antecedente: #78 `theming-runtime` (cerrado) dejo `ThemedStylesInput` como objeto para admitir la dimension sin reabrir archivos migrados.
- Auditoria #76: `Documentacion/03-validacion/auditoria-plan-maestro-uxui-ola1/` (H2; investigacion-web F7).
- Senal de tests vigente: suite en verde al cierre de #78; este change no debe degradarla.

## Fuera de alcance

- Migrar el tema en runtime de `LoginScreen` o de los mixtos: es `tokens-completos`.
- Tokens, escalas, radios, elevacion y motion: `tokens-completos`.
- Navegacion, `App.tsx` y AppShell: `app-shell-navegacion` (#81).
- Mover `isWeb()` a un `platform.ts` y borrar `responsive.ts`: limpieza opcional diferida (evita tocar 10 imports por un cambio de ruta).
- Cambiar los umbrales propios (900/920/1080) de los 6 mixtos: rediseno, no mecanismo.
- Rediseno visual de cualquier pantalla.
