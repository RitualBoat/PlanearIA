## Why

Las Olas 0 y 1 dejaron tokens (#80), theming en runtime (#78), breakpoints reactivos (#79) y el shell adaptativo (#81), pero no hay capa entre los tokens y las pantallas: 99 de 196 archivos `.tsx` de `src/` componen su propio control tactil, 93 codifican `borderRadius` con literales y solo 6 importan `themes/tokens`. Sin biblioteca base, cada pantalla nueva vuelve a decidir estilos, y solo 25 de 196 archivos declaran `accessibilityRole`: la accesibilidad depende de que cada autor la recuerde.

Esta es la pieza que convierte los tokens de #80 en UI ensamblable y hace que los estados loading, empty, error y offline dejen de improvisarse pantalla por pantalla.

## What Changes

- Se crea `src/components/base/` con diez componentes presentacionales y un barrel unico: `Screen`, `Card`, `Button`, `Input`, `Chip`, `Sheet`, `Toast`, `Banner`, `EmptyState` y `Skeleton`.
- Cada componente interactivo expone los estados normal, pressed, disabled y loading segun aplique, y los refleja en `accessibilityState`.
- Los cuatro estados de pantalla quedan cubiertos por dos componentes: `Skeleton` para loading y `EmptyState` con variantes `empty`, `error` y `offline`, cada una con salida accionable. `Button` aporta `loading` e `Input` aporta `error` dentro del control.
- Todo componente consume tokens en runtime por la fabrica `getStyles` de #78/#79; ningun archivo de la carpeta importa `COLORS` estatico.
- Todo control interactivo declara `accessibilityRole` y `accessibilityLabel`, respeta area tactil minima de 44x44 pt y muestra foco visible en web.
- Cada componente con animacion usa `react-native-reanimated` con los presets de #80 y sirve una variante estatica equivalente cuando `useReducedMotionPreference()` reporta activo.
- Se agrega una pantalla catalogo dentro del hub Mas, montada solo bajo `__DEV__`, que renderiza cada componente con sus estados y sirve de superficie para la QA visual por breakpoint.
- **No hay cambios de comportamiento para el docente:** ninguna pantalla existente consume aun la biblioteca. El change es aditivo, como #80.

## Capabilities

### New Capabilities

- `base-component-library`: biblioteca de componentes presentacionales base de PlanearIA. Cubre que componentes existen, que estados presentan, como consumen tokens en runtime, que garantiza su accesibilidad (rol, etiqueta, area tactil, foco en web) y como respetan la reduccion de movimiento.

### Modified Capabilities

Ninguna. `theming-runtime-propagation`, `reactive-breakpoints`, `design-tokens` y `adaptive-app-shell` se consumen sin cambiar sus requisitos: este change agrega una capa encima de sus contratos.

## Impact

**Codigo nuevo**

- `src/components/base/`: diez componentes, su barrel y sus fabricas de estilo.
- `src/screens/mas/CatalogoComponentesScreen.tsx`: catalogo de previews bajo `__DEV__`.
- `src/__tests__/components/base/`: pruebas de estados, accesibilidad, area tactil y reduce-motion.

**Codigo tocado minimamente**

- `src/navigation/stacks/MasStack.tsx`: registro condicional de la ruta del catalogo. No altera la raiz de navegacion ni el limite de 10 rutas hermanas de #81.

**Sin impacto**

- Sin dependencias nuevas: no se instala `expo-blur` (diferido por escrito en #80; `Sheet` usa el token `overlay` solido) ni fuente de marca.
- Sin cambios en `ThemeContext`, `FontSizeContext`, `DaltonismoContext` ni `AccessibilityPreferencesContext`.
- Sin cambios en `src/sync`, backend, almacenamiento, esquema ni claves `@planearia:*`.
- Los componentes legacy `Toast.tsx`, `ConfirmDialog.tsx`, `SyncStatusBanner.tsx` y `StatCard.tsx` quedan intactos; su migracion es un change posterior.

## No objetivos

- No redisenar pantallas existentes ni migrar sus llamadores a la biblioteca: este change la crea, no la adopta.
- No reconstruir `AppShell`, `TabBar`, `SidebarRail` ni `TopBar`: los entrego #81 y su comportamiento vive en `openspec/specs/adaptive-app-shell/`.
- No crear componentes de datos (`DataTable`, `KpiCard`, `Chart`), de IA (`AiSuggestionChip`, `ChatBubble`, `AiActionBar`, `ProviderStatusPill`, `BackgroundTaskCard`) ni de sync (`SyncStatusChip`, `SaveStateLabel`, `PendingBadge`, `ConflictSheet`): cada grupo tiene su change en el plan 1.4.
- No borrar ni reescribir los componentes legacy que se solapan.
- No instalar `expo-blur` ni adoptar fuente de marca.
- No agregar rutas a la raiz de navegacion ni editar el Plan Maestro y sus conteos.

## Referencias

- Issue: [#82](https://github.com/RitualBoat/PlanearIA/issues/82) (enriquecido; gate `openspec:ready:propose` en PASS el 2026-07-19).
- Plan maestro: `Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md`, secciones 1.4 (biblioteca base), 1.9.2 (catalogo de motion), 1.9.3 (checklist anti-slop) y 1.9.4 (presupuesto de motion y accesibilidad).
- Dependencia cerrada: #80 `tokens-completos` (spec `design-tokens`).
