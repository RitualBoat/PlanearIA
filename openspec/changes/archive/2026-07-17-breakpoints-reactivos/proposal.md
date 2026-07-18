# Fuente reactiva unica de breakpoints

Issue: [#79](https://github.com/RitualBoat/PlanearIA/issues/79).
Plan: `Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md`, change `breakpoints-reactivos` (Ola 0, resuelve R2 tecnico).
Depende de: [#78](https://github.com/RitualBoat/PlanearIA/issues/78) (`theming-runtime`, cerrado).
Origen: auditoria #76 (H2; investigacion-web F7).

## Why

El docente espera que la interfaz se reacomode al instante al rotar la tablet o redimensionar el navegador. El estado de dimensiones no falta: `useWindowDimensions()` se actualiza en resize/rotacion. Lo que falla es el mecanismo.

Revalidacion del inventario (2026-07-17, sobre `src/`):

| Metrica | Plan | Verificado hoy |
| --- | --- | --- |
| Consumidores de `utils/responsive` | 11 | **10** |
| Que importan `responsive()` (dependiente de ancho) | no citado | **1** (`LoginScreen`) |
| Que importan solo `isWeb()` (plataforma) | no citado | **9** |
| Usos de `Dimensions.get()` en todo `src/` | no citado | **solo `responsive.ts`** |

El congelamiento real esta en un solo sitio. `src/utils/responsive.ts` expone `responsive(mobile, tablet, web?)` y `getScreenDimensions()`, ambos sobre `Dimensions.get("window")`: una foto de un instante. `LoginScreen.tsx:134-178` llama `responsive()` **dentro de un `StyleSheet.create` a nivel de modulo**, evaluado una sola vez al importar. Al redimensionar web o rotar tablet, el tamano del logo, la tipografia del titulo/subtitulo y el `maxWidth` del formulario quedan clavados en el valor del arranque.

Los otros nueve consumidores importan solo `isWeb()`, que lee `Platform.OS` (constante en runtime): no es un bug de resize. Sus usos son `paddingBottom: isWeb() ? 28 : 110`, una decision de plataforma, no de ancho.

Los 6 archivos que "mezclan estrategias" (`ListaRecursosScreen`, `RecursosDidacticosScreen`, `CuentaScreen`, `CrearGrupoScreen`, `ListaGruposScreen`, `ListaPlantillasScreen`) ya leen `width` via `useWindowDimensions()` inline con umbrales propios (900/920/1080) y **ya se reacomodan**. Su "mezcla" es tener dos fuentes de verdad: el hook reactivo mas el import congelado (pero benigno) de `isWeb`.

Esto no contradice al plan: sigue siendo instaurar una fuente reactiva unica y jubilar el helper congelado. Precisa **que** el bug de resize vive en `LoginScreen`, que `isWeb()` es plataforma y se conserva, y que la unificacion de los mixtos es de fuente de verdad, no de comportamiento.

#78 dejo `ThemedStylesInput` como objeto **a proposito**, para que este change agregue la dimension sin reabrir los archivos ya migrados ("tocar cada archivo UNA sola vez").

## What

1. **Fuente reactiva unica `useBreakpoint()`** sobre `useWindowDimensions()`: devuelve `{ width, height, fontScale, breakpoint, isMobile, isTablet, isDesktop }`, reactiva a resize/rotacion. Rangos: movil `<768`, tablet `768-1279`, escritorio `>=1280`. Incluye helpers puros `getBreakpoint(width)` y `resolveResponsive(breakpoint, mobile, tablet, desktop?)`.
2. **`ThemedStylesInput` gana `breakpoint?` opcional**: cumple la promesa de #78 (agregar la dimension al contrato de la fabrica) como bucket memoizable, sin forzar cambios en las 3 fabricas themeadas ajenas.
3. **Migrar `LoginScreen`** (el congelamiento real): su `StyleSheet` de modulo pasa a fabrica `getStyles(breakpoint)` con `COLORS`/`FONT_SIZES` estaticos (sin migrar tema); `responsive()` pasa a `resolveResponsive(breakpoint, ...)`.
4. **Migrar los 6 mixtos a la fuente unica**: cambiar `useWindowDimensions()` por `useBreakpoint()` para leer `width`, conservando sus umbrales propios.
5. **Jubilar el API congelado**: quitar `responsive()` y `getScreenDimensions()` de `responsive.ts` (con ello desaparece todo `Dimensions.get()` de `src/`); conservar `isWeb()` como helper de plataforma.

## No objetivos

- No crear tokens, escalas ni primitives: eso es `tokens-completos`.
- No migrar el tema en runtime de `LoginScreen` ni de los mixtos: conservan `COLORS` estatico donde ya lo usan. La migracion de theming pertenece a #78/`tokens-completos`.
- No tocar navegacion, `App.tsx` ni el AppShell (#81).
- No redisenar visualmente ninguna pantalla: es migracion de mecanismo responsive, no cambio de aspecto.
- No cambiar los umbrales propios de los 6 mixtos (900/920/1080).
- No introducir archivos `.web.tsx`/`.native.tsx`.
- No tocar `isWeb()` en su semantica de plataforma ni reemplazarlo por el bucket de ancho.
- No editar el Plan Maestro ni corregir sus conteos: los vigentes viven en #79.
