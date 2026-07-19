# Brownfield baseline: componentes-base

Documenta unicamente la superficie que este change toca. No inventaria la app ni sustituye la spec.

## Superficies tocadas

- `src/components/base/` (nueva): diez componentes presentacionales y su barrel.
- `src/screens/mas/CatalogoComponentesScreen.tsx` (nueva): catalogo de previews bajo `__DEV__`.
- `src/navigation/stacks/MasStack.tsx` (edicion minima): registro condicional de la ruta del catalogo.
- `src/__tests__/components/base/` (nueva): pruebas de estados, accesibilidad, area tactil y reduce-motion.
- Configuracion de lint: se extiende el alcance de la regla que prohibe `COLORS` para cubrir la carpeta nueva.

Fuera de estas rutas el change no edita codigo.

## Fuentes de verdad actuales

- `openspec/specs/design-tokens/spec.md` (#80): los seis grupos de tokens y la primitiva de reduce-motion que la biblioteca consume.
- `openspec/specs/theming-runtime-propagation/spec.md` (#78): contrato de la fabrica `getStyles` y de `useAppTheme`.
- `openspec/specs/reactive-breakpoints/spec.md` (#79): fuente reactiva de breakpoints.
- `openspec/specs/adaptive-app-shell/spec.md` (#81): shell adaptativo, navegacion primaria unica y limite de rutas en la raiz.
- `qa/golden-journeys.json`: contrato de QA visual por breakpoint y secciones obligatorias de evidencia.
- `Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md`: secciones 1.4, 1.9.2, 1.9.3 y 1.9.4.
- Codigo real: `src/themes/`, `src/hooks/useBreakpoint.ts`, `src/navigation/`, `src/components/`.

## Comportamiento vigente

- No existe biblioteca base. `src/components/` contiene 44 componentes acoplados a modulos concretos.
- Medicion sobre `src/` el 2026-07-19: 196 archivos `.tsx`; 99 con `TouchableOpacity`/`Pressable`; 93 con `borderRadius` literal; 25 con `accessibilityRole`; 24 con `ActivityIndicator`; 6 importan `themes/tokens`.
- Los estados de pantalla se improvisan: el loading suele ser un `ActivityIndicator` suelto, y no hay tratamiento uniforme de vacio, error ni sin conexion.
- No hay criterio uniforme de area tactil ni tratamiento explicito del foco en web.
- Los tokens de #80 existen pero solo los consumen el shell de #81 y sus cuatro hubs.

## Comportamiento objetivo

- Diez componentes presentacionales disponibles desde un barrel unico, todos consumiendo tokens en runtime.
- Estados normal, presionado, deshabilitado y cargando presentes y declarados en el estado de accesibilidad.
- Los cuatro estados de pantalla cubiertos con salida accionable: esqueleto para carga, y un componente de estado con variantes vacio, error y sin conexion.
- Area tactil de 44x44 puntos garantizada, extendida sin alterar el tamano visual en los controles compactos.
- Rol y etiqueta en todo control; foco visible en web derivado de los tokens del tema.
- Toda animacion con variante estatica equivalente bajo reduccion de movimiento.
- Catalogo verificable en desarrollo, ausente en produccion.
- Ninguna pantalla existente cambia de aspecto ni de comportamiento.

## Compatibilidad legacy

- **Componentes que se solapan y se conservan intactos:** `src/components/Toast.tsx` (hex hardcodeados, sin tema ni daltonismo), `src/components/ConfirmDialog.tsx` (modal con estilos fijos), `src/components/SyncStatusBanner.tsx` (consume `COLORS` estatico) y `src/components/StatCard.tsx` (componente de datos). Ninguno se borra ni se reescribe; su migracion es un change posterior y queda declarada, no silenciada.
- **Colision de nombres:** resuelta por carpeta (`base/Toast.tsx` frente a `components/Toast.tsx`), sin renombrar los legacy ni tocar sus llamadores.
- **Contextos protegidos:** `ThemeContext`, `FontSizeContext`, `DaltonismoContext` y `AccessibilityPreferencesContext` se consumen sin cambiar su contrato publico.
- **Shell de #81:** no se modifica. La unica edicion en navegacion es el registro condicional de una ruta dentro de `MasStack`, que no altera la raiz ni la superficie de navegacion primaria.
- **Almacenamiento:** sin cambios. No se leen ni escriben distinto las claves `@planearia:*` ni las de preferencias; el change no toca `src/sync`, backend ni esquema.
- **Dependencias:** sin altas. `expo-blur` y la fuente de marca siguen diferidas por la decision escrita en #80.

## Owner de spec y contexto

- Owner del change y de la spec: Ignacio Barboza Espinoza (RitualBoat), desarrollador unico del proyecto.
- Capacidad nueva: `base-component-library`, creada por este change.
- Capacidades consumidas sin modificar: `design-tokens`, `theming-runtime-propagation`, `reactive-breakpoints`, `adaptive-app-shell`.
- Issue de origen: [#82](https://github.com/RitualBoat/PlanearIA/issues/82), enriquecido el 2026-07-19; gate `openspec:ready:propose` en PASS.

## Evidencia actual

- Gate `npm run harness:doctor`: PASS el 2026-07-19 (unico WARN conocido: `expo` y `figma` requieren OAuth interactivo, ajeno a este change).
- Gate `npm run openspec:ready:propose -- --issue 82`: PASS el 2026-07-19.
- Linea base de pruebas heredada de #80: 98 suites / 646 tests en verde.
- Conteos de la superficie medidos sobre `src/` el 2026-07-19 y citados en el issue enriquecido.
- Evidencia pendiente de generar durante apply: capturas por breakpoint a 375/768/1280 del catalogo, checklist Nielsen, checklist anti-slop 1.9.3 y revision adversarial previa a archive.

## Fuera de alcance

- Migrar pantallas o llamadores existentes a la biblioteca.
- Reconstruir `AppShell`, `TabBar`, `SidebarRail` o `TopBar` (entregados en #81).
- Crear componentes de datos (`DataTable`, `KpiCard`, `Chart`), de IA (`AiSuggestionChip`, `ChatBubble`, `AiActionBar`, `ProviderStatusPill`, `BackgroundTaskCard`) o de sincronizacion (`SyncStatusChip`, `SaveStateLabel`, `PendingBadge`, `ConflictSheet`).
- Borrar o reescribir los componentes legacy que se solapan.
- Unificar el mecanismo imperativo de notificaciones sobre el `Toast` base.
- Instalar `expo-blur` o adoptar una fuente de marca.
- Editar el Plan Maestro, sus conteos o cualquier issue ajeno al #82.
