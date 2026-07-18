# Design: tokens-completos

## Contextos delimitados afectados

Fuente: `Documentacion/00-fundamentos/MAPA_DDD_ESTRATEGICO_LIGERO.md`.

- **Owner unico: Experiencia y Preferencias.** Posee tema, fuente, daltonismo, accesibilidad y ahora el sistema de tokens de presentacion. Todo lo que este change define (los 6 grupos de tokens, el helper de tipografia, la fabrica de elevacion, el hook de reduce-motion) pertenece a este contexto.

**Afecta un solo contexto: no requiere contrato cruzado nuevo.** Los tokens son primitivas de presentacion que cualquier contexto podra consumir despues, pero este change no las inyecta en ninguna pantalla ni cambia ningun flujo de datos. No lee, escribe ni deriva datos de otros contextos.

Invariantes: `userId` no aplica (los tokens son constantes de presentacion, no dato multiusuario). `src/sync` no aplica (no hay dato academico). Confirmacion IA no aplica (no hay IA). Los tokens no persisten nada; el unico estado que se consume (`reduceMotion` in-app) ya vive en `AccessibilityPreferencesContext` y no se modifica.

## Ground truth visual

**No aplica como bloqueo.** El plan declara paridad **funcional** para este change (backlog `tokens-completos`). No hay frame Figma de referencia: los valores base de los tokens se derivan del lenguaje visual ya presente en el codigo (p. ej. titulo 29/34 y subtitulo 15/20 en `AnimatedTopPill.tsx`, `boxShadow` azul en tarjetas) y de la escala 4pt que fija el plan. La evidencia visual es la **pagina de preview** de los tokens, no una pantalla de la app (ninguna se migra).

## Decision 1: un modulo por grupo mas un barrel `tokens.ts`

**Contexto.** `src/themes/` hoy tiene `colors.ts`, `types.ts`, `useAppTheme.ts`. Los consumidores importan directo (`../themes/colors`, `../themes/useAppTheme`) y `COLORS` desde el barrel `types`.

**Decision.** Un archivo por grupo (`spacing.ts`, `radii.ts`, `typography.ts`, `elevation.ts`, `motion.ts`, `zIndex.ts`) y un barrel `src/themes/tokens.ts` que los reexporta. Los grupos sin dependencia de runtime son constantes `as const` (tipos literales, autocompletado). Los que dependen de runtime no se congelan en modulo:

- **Tipografia** necesita `scaled` (de `FontSizeContext`): se define base y se multiplica en consumo con `scaleType(token, scaled)`.
- **Elevacion** necesita `colors` (de `ThemeContext`): se produce con `getElevation(colors)`.

**Alternativa rechazada: un unico objeto `tokens` gigante themeado.** Obligaria a pasar `colors` para leer un radio estatico y acoplaria lo estatico con lo runtime. Separar por naturaleza (estatico vs dependiente de tema/fuente) mantiene los estaticos importables sin contexto y evita recomputo.

**Consecuencia.** Los tokens estaticos se importan en cualquier parte (incluido codigo no-React); los dependientes de runtime se consumen dentro de la fabrica `getStyles`, que ya recibe `colors` y `scaled`. No cambia el contrato de `ThemedStylesInput`.

## Decision 2: tipografia escalable por `FontSizeContext`

**Contexto.** El criterio de aceptacion exige "tipografia multiplicada por `FontSizeContext`". `FontSizeContext` expone `scaled(baseSize) = round(baseSize * factor)` memoizado por `fontSizeMode` (factores `small` 0.85, `medium` 1, `large` 1.2, `xlarge` 1.4). `useAppTheme` ya entrega `scaled`.

**Decision.** Tokens tipograficos como tamanos **base** (nunca escalados en la constante) y un helper puro:

```ts
export function scaleType(token: TypeToken, scaled: (n: number) => number): TextStyle {
  return {
    fontSize: scaled(token.fontSize),
    lineHeight: scaled(token.lineHeight),
    fontWeight: token.fontWeight,
    ...(token.letterSpacing !== undefined ? { letterSpacing: token.letterSpacing } : {}),
  };
}
```

Consumo dentro de la fabrica: `title: scaleType(typography.title, scaled)`. Asi la fuente escala donde sea que el token se use, sin que cada pantalla recuerde multiplicar. `letterSpacing` no se escala (es un ajuste optico del trazo, no del tamano).

**Costura de fuente de marca (diferida).** `TypeToken` no fija `fontFamily`: hoy usa la fuente del sistema. Adoptar una fuente de marca (via `expo-font`, ya instalada) se difiere hasta elegir una con licencia libre y medirla; cuando ocurra, se agrega `fontFamily` al token o al helper sin cambiar la escala.

## Decision 3: elevacion theme-aware en 3 niveles

**Contexto.** El plan pide "3 niveles con `shadowBlue`". `colors.shadowBlue` (azul tenue en claro `rgba(0,93,168,0.06)`, negro en oscuro) y `colors.shadowBlueLift` ya existen y difieren por tema. `AnimatedTopPill.tsx:150` ya usa `boxShadow` string.

**Decision.** `getElevation(colors)` devuelve 3 `ViewStyle` con `boxShadow` que varian offset/blur por nivel y toman el color del tema:

```ts
level1: { boxShadow: `0px 1px 3px ${colors.shadowBlue}` }
level2: { boxShadow: `0px 4px 12px ${colors.shadowBlue}` }
level3: { boxShadow: `0px 10px 24px ${colors.shadowBlueLift}` }
```

`boxShadow` esta soportado cross-platform en RN 0.81 con New Architecture (y ya en uso en el repo), asi que un solo campo cubre iOS/Android/web. La sombra cambia con el tema porque el color viene de `colors`.

**Alternativa rechazada: `shadow*` nativos + `elevation` Android por separado.** Mas campos y ramas por plataforma para el mismo resultado que `boxShadow` ya da en New Arch. Se mantiene el patron existente del repo.

## Decision 4: reduce-motion sobre reanimated v4 (resuelve H9) — decision tecnica verificable

**Contexto.** El plan 1.9.4 dice "toda animacion respeta reducir movimiento (`AccessibilityInfo.isReduceMotionEnabled`): version estatica equivalente". Esa API es **asincrona**: al montar, el valor llega tarde y la animacion puede parpadear antes de apagarse. Ademas hay una segunda senal, la preferencia in-app `reduceMotion` de `AccessibilityPreferencesContext` (reactiva). No existe primitiva que las unifique.

**APIs vigentes (verificadas con Context7 `/software-mansion/react-native-reanimated`, 2026-07-17):**

- `useReducedMotion(): boolean` — lee el ajuste del SO de forma **sincrona**; el valor se determina al iniciar la app. Docs: "Changing the reduced motion system setting does not trigger a re-render" y "Unlike `AccessibilityInfo.isReduceMotionEnabled()`, `useReducedMotion` provides the value synchronously".
- `ReduceMotion` enum: `System = 'system'`, `Always = 'always'`, `Never = 'never'`.
- `ReducedMotionConfig` — componente global; con `mode={ReduceMotion.System}` reanimated colapsa sus animaciones al valor final cuando el SO tiene reduce-motion activo. El default de reanimated ya es `System`.
- Cada config (`withTiming`/`withSpring`) y las layout animations aceptan la opcion `reduceMotion`.

**Decision (dos capas):**

1. **Capa worklet (default global):** los presets de `motion.ts` llevan `reduceMotionPolicy = ReduceMotion.System`, y los configs de spring/timing incluyen `reduceMotion: ReduceMotion.System`. Asi reanimated honra el ajuste del SO en el hilo de UI, aun sin re-render en JS. No se monta `ReducedMotionConfig` en `App.tsx` porque el default de reanimated ya es `System`: montarlo seria un cambio de runtime con delta de comportamiento cero, que exigiria QA propia sin ganancia. Se documenta como opcion futura si alguna vez hace falta forzar `Always`/`Never` globalmente.
2. **Capa JS (decision de variante):** `useReducedMotionPreference(): boolean` devuelve `useReducedMotion() || reduceMotion` (SO OR in-app). Es la fuente unica para que un componente elija **no** correr una animacion decorativa y mostrar la variante estatica equivalente, mas alla de solo colapsarla.

**Salvedad documentada (la que pide H9).** `useReducedMotion()` captura el valor al montar y no re-renderiza si el SO cambia con la app abierta. Mitigacion: (a) la preferencia in-app SI es reactiva, asi que el toggle del docente surte efecto sin reiniciar; (b) reanimated honra el SO en la capa worklet via `ReduceMotion.System` aunque el hook JS no se actualice; (c) los cambios de ajustes de accesibilidad del SO a mitad de sesion son poco frecuentes. La salvedad se documenta en el JSDoc del hook.

**Alternativa rechazada: seguir con `AccessibilityInfo.isReduceMotionEnabled`.** Asincrona (parpadeo al montar) y sin integracion con la capa worklet de reanimated; obligaria a estado y suscripcion manual para algo que reanimated ya resuelve. H9 pide explicitamente la primitiva de reanimated.

## Decision 5: `expo-blur` diferido, no instalado

**Contexto.** El plan 1.9.2 lista glassmorphism como "superficies translucidas con tokens + `expo-blur` (dep opcional a evaluar en `tokens-completos`) SOLO en overlays/modales/dock; fallback solido en Android de gama baja". 1.9.4 exige medir blur antes de adoptarlo. Hoy `expo-blur` no esta instalada (correcto).

**Decision.** No instalar `expo-blur` en este change. No hay superficie concreta que lo pida todavia (overlays/modales/dock llegan con `componentes-base`/`app-shell`), y adoptarlo sin una medicion en Android gama media violaria 1.9.4. Se deja la costura: un token de superficie de overlay que hoy es solido, y que un change futuro puede volver translucido tras medir, degradando a solido donde el FPS caiga. La decision queda escrita para que no se relea como olvido.

## Decision 6: z-index nombrado y ascendente

Escala nombrada `zIndex = { base, raised, dropdown, sticky, banner, overlay, modal, toast, tooltip }` con valores ascendentes espaciados (p. ej. multiplos de 100/1000). Elimina los numeros magicos de capa y fija el orden de apilamiento de forma verificable (cada capa mayor que la anterior).

## Estandar de Excelencia Visual (seccion 1.9)

Aplica de forma acotada: este change **no redisena** y no consume presupuesto de animacion en pantalla. Lo que sostiene y habilita:

- **Motion solo via reanimated** (regla de frontend): los tokens de movimiento se expresan en la API de reanimated y su reduce-motion, no en `Animated` de RN ni en librerias DOM.
- **Reduce-motion respetado**: es el corazon de la Decision 4; la primitiva queda lista para que toda animacion futura la use.
- **Presupuesto Android gama media**: durations cortas (150/250ms) y springs con amortiguacion estandar; `expo-blur` diferido justo para no arriesgar FPS.
- **Tipografia intencional desde tokens**: la escala con jerarquia (display...overline) es la base del checklist anti-slop 1.9.3, disponible para las pantallas que vengan.

## Evidencia y validacion

- **Tests unitarios (proporcionales):** forma y valores de cada grupo (espaciado 4pt, radios 8/12/16/pill, z-index ascendente, durations 150/250, springs con amortiguacion); `scaleType` multiplica `fontSize`/`lineHeight` por el factor; `getElevation` produce 3 niveles distintos y difiere claro vs oscuro; `useReducedMotionPreference` cumple el OR (SO true, in-app true, ambos false).
- **Preview:** pagina de preview de tokens capturada por breakpoint (movil <768, tablet 768-1279, web >=1280) como evidencia de "documentados con previews".
- **APIs de libreria verificadas en Context7** antes de escribir codigo (reanimated), como exige la regla de frontend.
- `npm run typecheck`, `npm run lint -- --quiet`, `npm test -- --runInBand` en verde; `openspec validate --all --strict` en verde.
