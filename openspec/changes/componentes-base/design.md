## Context

PlanearIA tiene tokens pero no componentes. La fundacion esta completa y con contratos estables:

| Pieza | Origen | Contrato que este change consume |
| --- | --- | --- |
| `useAppTheme()` | #78 | `{ colors, isDark, theme, scaled, highContrast }` |
| Fabrica `getStyles(input)` | #78 + #79 | `ThemedStylesInput` (`colors`, `isDark`, `scaled`, `highContrast`, `breakpoint?`) |
| `useBreakpoint()` | #79 | `mobile` <768, `tablet` 768-1279, `desktop` >=1280 |
| `spacing`, `radii`, `zIndex` | #80 | constantes de modulo, sin contexto |
| `typography` + `scaleType(token, scaled)` | #80 | tamanos base multiplicados por `FontSizeContext` |
| `getElevation(colors)` | #80 | `level1/2/3` con `boxShadow` theme-aware |
| `spring`, `timing`, `duration` | #80 | presets con `reduceMotion: ReduceMotion.System` |
| `useReducedMotionPreference()` | #80 | booleano efectivo = SO OR preferencia in-app |
| `AppShell`, `AppTopBar` | #81 | shell adaptativo ya entregado |

La medicion sobre `src/` el 2026-07-19 muestra el hueco: 99 de 196 archivos `.tsx` componen su propio control tactil, 93 usan `borderRadius` literal, solo 6 importan `themes/tokens` y solo 25 declaran `accessibilityRole`.

Restriccion de fondo: **el change debe ser aditivo**. Ninguna pantalla existente puede cambiar de aspecto ni de comportamiento, igual que en #80 y #81.

## Goals / Non-Goals

**Goals:**

- Entregar diez componentes presentacionales que traduzcan los tokens de #80 en UI ensamblable.
- Hacer que loading, empty, error y offline sean estados con componente, no improvisaciones por pantalla.
- Garantizar accesibilidad por construccion: rol, etiqueta, estado, area tactil de 44pt y foco visible en web.
- Que toda animacion tenga variante estatica equivalente bajo reduce-motion.
- Dar una superficie real para QA visual por breakpoint sin tocar pantallas de produccion.

**Non-Goals:**

- Migrar pantallas o llamadores existentes a la biblioteca.
- Reconstruir el shell de #81 ni los componentes IA, sync o de datos.
- Borrar o reescribir los componentes legacy que se solapan.
- Instalar dependencias nuevas (`expo-blur`, fuente de marca).
- Construir un sistema imperativo de notificaciones (cola/provider de Toast).

## Decisions

### D1. Namespace propio `src/components/base/` con barrel

Un archivo por componente mas `index.ts`. **Por que:** `src/components/` ya tiene 44 componentes de feature, incluidos `Toast.tsx` y `ConfirmDialog.tsx`, cuyos nombres colisionan con la base. La carpeta separa lo presentacional reutilizable de lo acoplado a un modulo y hace que la regla "cero `COLORS` aqui" sea verificable por ruta.

*Alternativas:* (a) `src/ui/` — descartada por introducir una tercera raiz de UI sin precedente en el repo; (b) renombrar los legacy (`ToastLegacy`) — descartada por tocar llamadores en produccion, violando la regla aditiva.

### D2. Diez componentes, con el shell excluido

`Screen`, `Card`, `Button`, `Input`, `Chip`, `Sheet`, `Toast`, `Banner`, `EmptyState`, `Skeleton`.

**Por que se excluye el shell:** la lista del plan 1.4 nombra `AppShell/TabBar/SidebarRail/TopBar`, pero #81 ya los entrego con `createBottomTabNavigator` y su comportamiento esta congelado en `openspec/specs/adaptive-app-shell/`. Reimplementarlos duplicaria un componente existente y arriesgaria el requisito "exactamente una superficie de navegacion primaria a cualquier ancho".

### D3. Los cuatro estados se cubren con dos componentes, no cuatro

`Skeleton` cubre **loading**. `EmptyState` cubre **empty**, **error** y **offline** por `variant`, cada variante con icono, mensaje y CTA de salida propios. Ademas `Button` expone `loading` e `Input` expone `error`, de modo que el estado tambien vive dentro del control.

**Por que:** `ErrorState` y `OfflineState` serian casi identicos a `EmptyState` (icono + titulo + descripcion + accion). Tres componentes gemelos invitan a divergir. Una variante discriminada mantiene un contrato unico y hace imposible que una pantalla "olvide" el caso offline: esta en el mismo `type`.

*Alternativa:* cuatro componentes independientes — descartada por duplicacion.

### D4. Estilos por fabrica memoizada, tokens en runtime

Cada componente declara su `getStyles(input: ThemedStylesInput): StyleSheet` a nivel de modulo y la consume con `useMemo` sobre los valores de `useAppTheme()` (mas `breakpoint` cuando el layout lo requiere). Color desde `colors`, nunca `COLORS`; espaciado/radios/z-index desde las constantes; tipografia con `scaleType(typography.X, scaled)`; sombra con `getElevation(colors)`.

**Por que:** es el contrato exacto que #78/#79 establecieron y que el shell de #81 ya usa. No se amplia `ThemedStylesInput`.

### D5. Area tactil de 44pt: `minHeight`/`minWidth` para controles grandes, `hitSlop` para los pequenos

Botones, inputs y filas presionables fijan `minHeight: 44`. Los controles cuya forma visual es menor (chip compacto, boton de icono, cerrar de `Toast`/`Sheet`) conservan su tamano visual y expanden el area con `hitSlop` hasta cubrir 44x44.

**Por que:** el issue confirma (fuente F3) que el criterio del repo es mas estricto que WCAG 2.2 SC 2.5.8 (24px, AA), coincide con SC 2.5.5 (AAA) y con las guias de plataforma; **se mantiene 44pt**. Inflar visualmente cada chip a 44pt romperia la densidad del breakpoint movil, asi que `hitSlop` separa area tactil de tamano visual, que es justo su proposito.

### D6. Foco en web por estado explicito, no por `outline` del navegador

Cada control enfocable mantiene estado `focused` via `onFocus`/`onBlur` y aplica un anillo derivado de `colors.primary` (borde/`boxShadow` por token). No se usa `outline: none` sin reemplazo.

**Por que:** un anillo propio se ve igual en los tres breakpoints y en ambos temas, es theme-aware por construccion y es verificable en prueba (el estado es observable), a diferencia del `outline` nativo que depende del navegador. Es tambien el unico camino que sirve si mas adelante se necesita foco en nativo.

*Alternativa:* confiar en el `outline` por defecto de RN Web — descartada por no ser theme-aware ni testeable.

### D7. Micro-interacciones con reanimated y variante estatica obligatoria

Del catalogo 1.9.2: `scale 0.97` al presionar (`Button`, `Card` presionable, `Chip`), shimmer sutil en `Skeleton`, entrada/salida por spring en `Toast` y `Sheet`, desvanecido al descartar en `Chip`. Se usan `useSharedValue` + `useAnimatedStyle` + `withSpring(spring.snappy)` / `withTiming(timing.fast)`, con `Animated.createAnimatedComponent(Pressable)` donde haga falta.

Cada componente animado consulta `useReducedMotionPreference()`. Cuando reporta activo, **asigna el valor final directamente** en vez de animarlo (y `Skeleton` renderiza un bloque solido sin shimmer).

**Por que la doble proteccion:** los presets ya llevan `ReduceMotion.System`, que cubre el ajuste del sistema en la capa worklet, pero no cubre la preferencia **in-app** de `AccessibilityPreferencesContext`. El hook combina ambas senales y es la unica fuente que decide la variante estatica.

Prohibidos: GSAP, Framer Motion, Tailwind (DOM-only, rompen la app RN).

### D8. `Toast` presentacional, sin cola ni provider

El `Toast` base recibe `visible`, `variant`, `message` y `onDismiss`. No gestiona cola, timers globales ni contexto.

**Por que:** el legacy `src/components/Toast.tsx` ya tiene una forma imperativa con llamadores en produccion. Construir un segundo sistema de notificaciones seria la duplicacion que el issue prohibe. La base aporta solo la superficie visual por tokens; unificar el mecanismo imperativo es un change de migracion posterior.

### D9. `Sheet` sin blur, con overlay solido

`Sheet` monta el `Modal` de RN con `transparent`, un fondo con el token `overlay` y el panel con `getElevation`.

**Por que:** #80 dejo `expo-blur` diferido por escrito hasta medir en Android de gama media (regla 1.9.4). El token `overlay` ya existe en `ColorTokens` y es el fallback solido que aquella decision previo. La costura para adoptar blur despues es sustituir el `View` de fondo, sin tocar el contrato del componente.

### D10. Catalogo en el hub Mas, montado solo bajo `__DEV__`

`CatalogoComponentesScreen` renderiza cada componente con todos sus estados. Se registra en `MasStack` dentro de una guarda `__DEV__`.

**Por que:** #80 valido con una preview HTML porque entregaba constantes; aqui se entregan componentes RN, y medir HTML no probaria nada del comportamiento real. `expo start --web` corre en modo desarrollo, asi que el catalogo esta disponible para Playwright y ausente del bundle de produccion. Vive dentro de `MasStack`, no en la raiz, respetando el limite de 10 rutas hermanas de #81.

*Alternativa:* Storybook — descartada por agregar dependencia y toolchain a un proyecto de presupuesto cero.

## Risks / Trade-offs

- **El barrel arrastra reanimated y contextos a cualquier consumidor** → Mitigacion: cada componente sigue siendo importable por su ruta directa; el barrel es conveniencia, no obligacion. Es el mismo trade-off aceptado y documentado en la revision adversarial de #80.
- **`hitSlop` no es medible en el DOM por Playwright** → Mitigacion: el area tactil se verifica con pruebas deterministas sobre las props/estilos del componente; Playwright cubre reflujo, contraste y foco, no `hitSlop`.
- **La guarda `__DEV__` podria filtrar el catalogo a produccion si el bundler no la elimina** → Mitigacion: prueba explicita que verifica que la ruta no se registra cuando `__DEV__` es falso; el catalogo no contiene datos reales ni acciones destructivas, asi que una filtracion seria cosmetica.
- **Diez componentes en un solo change son superficie amplia (costo L)** → Mitigacion: `tasks.md` los agrupa en tandas pequenas con validacion por tanda; cada componente es independiente y el orden va de primitivas (`Screen`, `Card`) a compuestos (`Sheet`, `EmptyState`).
- **La biblioteca nace sin consumidores, con riesgo de divergir de la necesidad real** → Mitigacion: el catalogo obliga a renderizar cada estado antes de cerrar, y la adopcion pantalla por pantalla llegara en los changes de Ola 2, que podran ajustar contratos con evidencia de uso.
- **Duplicacion percibida frente a `Toast.tsx` y `ConfirmDialog.tsx` legacy** → Mitigacion: la justificacion queda escrita (D8): los legacy no son theme-aware ni accesibles por construccion, y se conservan intactos hasta un change de migracion explicito.
- **La preferencia in-app de reduce-motion no re-renderiza ante un cambio del SO a mitad de sesion** → Mitigacion: salvedad ya documentada y aceptada en #80; los presets honran el SO en la capa worklet.

## Migration Plan

No hay migracion de datos ni de esquema: el change es aditivo y no toca almacenamiento, backend, `src/sync` ni claves `@planearia:*`.

**Despliegue:** los componentes entran sin consumidores de produccion; el unico punto de montaje es la ruta de catalogo bajo `__DEV__` en `MasStack`.

**Rollback:** revertir el commit del PR elimina `src/components/base/`, sus pruebas, la pantalla de catalogo y su registro. Como ninguna pantalla de produccion consume la biblioteca, no hay superficie de usuario que regresione y el shell de #81 queda intacto. Desactivacion parcial: basta con no importar un componente concreto, o retirar solo el registro del catalogo, sin revertir el resto.

## Open Questions

- **OQ1.** Cuando llegue el change de migracion, se unifica el mecanismo imperativo de notificaciones sobre el `Toast` base o se conserva el legacy para los llamadores actuales? Se decide con la evidencia de uso de Ola 2, no aqui.
- **OQ2.** `expo-blur` para `Sheet` sigue diferido; se reabre solo cuando una superficie concreta lo pida y se mida en Android de gama media (1.9.4).
- **OQ3.** El catalogo podria volverse una pantalla de documentacion permanente para el equipo en vez de una guarda `__DEV__`. Se evalua cuando exista mas de una persona desarrollando.
