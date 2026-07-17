# Propagar tema, fuente y daltonismo en runtime

Issue: [#78](https://github.com/RitualBoat/PlanearIA/issues/78).
Plan: `Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md`, change `theming-runtime` (Ola 0).
Origen: auditoria #76 (H1, H2, H12a, H13).

## Why

El docente cambia tema, tamano de fuente o daltonismo en preferencias y espera que la app entera lo refleje al instante. Hoy no ocurre, y el motivo no es que falte estado: los cuatro proveedores (`ThemeContext`, `FontSizeContext`, `DaltonismoContext`, `AccessibilityPreferencesContext`) estan montados en `App.tsx` y funcionan. Lo que falta es el consumo.

La revalidacion del inventario (2026-07-17, sobre `src/` + `App.tsx`) matiza el dimensionamiento heredado:

| Metrica | Plan | Verificado hoy |
| --- | --- | --- |
| Archivos que importan `COLORS` estatico | 60 | **65** |
| Pantallas que llaman `useTheme` | 18 | **18** |
| Pantallas que aplican daltonismo | no citado | **1** |
| Archivos que usan `scaled()` | no citado | **3** |
| Archivos con fabrica `getStyles` | no citado | **7** |

El dato de "18 pantallas reactivas" es correcto pero solo cubre **tema**. De esas 18, diecisiete son ciegas al daltonismo y quince no escalan tipografia. La causa es de contrato: `useTheme()` devuelve `colors` sin daltonismo aplicado y el filtro vive aparte en `applyDaltonismo(colors)`, asi que cada pantalla debe componer a mano tres o cuatro hooks en el orden correcto. Solo `CuentaScreen` lo hace. Dicho de otro modo: dos de los tres criterios de aceptacion del plan se cumplen hoy en una sola pantalla de 57.

Esto no contradice al plan: sigue siendo desplegar un patron probado. Precisa **que** desplegar. Si el rollout se hiciera repitiendo la composicion manual, se estaria propagando el defecto: 65 oportunidades de olvidar `applyDaltonismo`.

Ademas, la auditoria reporta en H12a que el rollout de theming no tiene mecanismo de rastreo definido para los archivos restantes. Sin el, "un lote demostrativo y el resto rastreado" no es verificable: nadie sabe cuanto falta ni puede impedir que un archivo nuevo nazca en deuda.

## What

1. **Hook compuesto `useAppTheme()`**: devuelve `colors` con daltonismo ya aplicado, mas `isDark`, `scaled` y `highContrast`, memoizado. Una llamada en vez de cuatro. `useTheme`, `useFontSize` y `useDaltonismo` quedan intactos y siguen exportandose.
2. **Contrato de fabrica `getStyles(tokens)`** con parametro objeto, para que `breakpoints-reactivos` agregue `width` sin reabrir archivos migrados.
3. **Regla de lint como trinquete**: `no-restricted-imports` prohibe `COLORS` salvo en una lista explicita de archivos legacy autorizados.
4. **La lista legacy es el mecanismo de rastreo del rollout** (resuelve H12a): artefacto unico, versionado, verificado por CI, cuyo largo es el trabajo restante.
5. **Lote demostrativo**: los 3 archivos de `src/screens/cuenta/` que aun importan `COLORS`, mas la adaptacion del piloto `CuentaScreen` a la firma nueva. Deja el modulo `cuenta` entero migrado y baja los importadores de 65 a 62.

## No objetivos

- No migrar los 65 archivos en un solo change: el plan lo declara anti-patron. El resto queda como rollout rastreado por la lista del lint.
- No introducir `useBreakpoint()` ni el parametro `width`: eso es `breakpoints-reactivos` (#79). Aqui solo se deja la firma preparada.
- No crear tokens, escalas ni primitives nuevas: eso es `tokens-completos`.
- No tocar navegacion, `App.tsx` ni el AppShell (#81).
- No cambiar el contrato publico de `ThemeContext`, `FontSizeContext` ni `DaltonismoContext`.
- No modificar `useTheme` para que aplique daltonismo (ver `design.md`, decision 1).
- No normalizar los 6 archivos con mojibake que este lote no toca (R5 aplica al tocar cada archivo).
- No redisenar visualmente las pantallas del lote: es migracion de mecanismo, no cambio de aspecto.
- No editar el Plan Maestro ni corregir sus conteos: los vigentes viven en #78 (H2).
