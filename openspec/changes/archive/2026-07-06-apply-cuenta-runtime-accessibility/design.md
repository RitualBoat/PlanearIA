## Context

`CuentaScreen` (`src/screens/cuenta/CuentaScreen.tsx`) ya lee los contexts reales (`useTheme`, `useFontSize`, `useDaltonismo`) y estos ya persisten en AsyncStorage (`APP_THEME_MODE`, `APP_FONT_SIZE_MODE`, `APP_DALTONISMO_MODE`). El defecto es que la vista no consume esos valores para pintarse: su `StyleSheet.create` referencia el `COLORS` estatico (que es exactamente `lightTheme`, ver `src/themes/colors.ts:73`), los tamanos de fuente estan hardcodeados y `applyDaltonismo` no se invoca. Ademas, tres toggles ("Contraste alto", "Lectura de voz", "Reducir movimiento") son `useState(true)` locales, sin persistencia ni efecto.

El codebase ya tiene un patron establecido para consumir el tema en runtime: `ChatScreen`, `SocialScreen` y `BuscadorPerfilesScreen` usan `const { colors, isDark } = useTheme(); const DT = getThemeTokens(colors); const styles = getStyles(DT, isDark);` con la fabrica `getStyles(DT, isDark) => StyleSheet.create({...})`. Este change replica ese patron en `CuentaScreen`, extendiendolo con `scaled()` (fuente) y `applyDaltonismo(colors)` (daltonismo), ya que esta es la pantalla que edita esas mismas preferencias.

Ground truth visual: no hay Figma nuevo para este change; el objetivo es paridad de comportamiento, no rediseno. El layout, copy y estructura actuales de `CuentaScreen` se conservan; solo cambia el origen de colores/tamanos (estatico -> tokens de tema en runtime). Por eso no se declara bloqueo de ground truth: no se inventa UI nueva.

Responsive: `CuentaScreen` ya es una pantalla madre compartida con `wideLayout = width >= 1080` (columna derecha web). El change no altera breakpoints; la QA visual capturara movil (<768), tablet (768-1279) y web (>=1280) en claro y oscuro.

## Goals / Non-Goals

**Goals:**
- Que Modo oscuro, tamano de fuente y daltonismo re-pinten `CuentaScreen` de verdad en runtime, via tokens de `src/themes`.
- Persistir "Contraste alto", "Lectura de voz" y "Reducir movimiento" con default off, con efecto real u honestidad explicita ("Proximamente").
- Mantener la vista delgada (MVVM): lectura/escritura de preferencias en contexts, no en la vista.
- Cero regresiones visuales en modo claro (los tokens claros son identicos al `COLORS` actual).

**Non-Goals:**
- Rediseno visual de `CuentaScreen`.
- Migrar el resto de pantallas a `useTheme` (eso es el change `theming-runtime` completo).
- TTS real para "Lectura de voz".
- Tocar `src/sync`, backend, o llaves legacy `@planearia:*`.

## Decisions

### Decision 1: Fabrica de estilos por tema `getStyles(DT, isDark, scaled)` en vez de `StyleSheet.create` estatico
Se convierte el `const styles = StyleSheet.create({...})` en `const getStyles = (DT, isDark, scaled) => StyleSheet.create({...})`, y en el componente `const styles = getStyles(DT, isDark, scaled)` con `DT = applyDaltonismo(colors)`.
- **Por que:** es el patron ya vivo en `ChatScreen`/`SocialScreen`; consistente, revisable y de bajo riesgo. `COLORS === lightTheme`, asi que en claro el resultado es identico pixel a pixel.
- **Alternativa descartada:** `useMemo` + hoja de estilos memoizada. Los screens existentes NO memoizan (llaman `getStyles` en cada render); se sigue esa convencion para leer como el codigo vecino. El costo de `StyleSheet.create` por render es marginal en esta pantalla.
- **Hex hardcodeados:** los literales estructurales (fondos/bordes/textos principales) se mapean al token de tema equivalente para que el modo oscuro funcione; los acentos decorativos de marca (p. ej. banners promo, estrellas) se conservan como estan cuando no tienen token, porque no afectan legibilidad y estan fuera del alcance de este piloto.

### Decision 2: `scaled()` sobre tamanos de fuente de la pantalla
Los `fontSize` de la hoja pasan a `scaled(base)` dentro de la fabrica (`getStyles` recibe `scaled`). Se escala tipografia; no se escalan iconos ni geometria de layout, para evitar romper el diseno con "Grande".
- **Por que:** `scaled` es la API oficial de `FontSizeContext` (multiplica por el factor y redondea). Escalar solo texto es el minimo seguro y demostrable.

### Decision 3: Nuevo `AccessibilityPreferencesContext` para los 3 toggles
Se crea `src/context/AccessibilityPreferencesContext.tsx` con `{ highContrast, voiceReading, reduceMotion, setHighContrast, setVoiceReading, setReduceMotion }`, persistido en AsyncStorage con llaves nuevas (`APP_HIGH_CONTRAST`, `APP_VOICE_READING`, `APP_REDUCE_MOTION`), default `false`. Se monta como provider en `App.tsx` junto a los otros tres.
- **Por que:** replica el patron de un-context-por-preocupacion que ya usan Theme/FontSize/Daltonismo. No es dato academico sincronizable, asi que NO usa `src/sync` (regla de oro).
- **Alternativa descartada:** extender `ThemeContext`. Se rechaza para no ensuciar el contrato de tema con banderas de accesibilidad no relacionadas y no invalidar sus 100 consumidores.

### Decision 4: Efecto por toggle (honestidad sobre decoracion)
- **Reducir movimiento -> efecto real:** cuando esta on, `CuentaScreen` renderiza el pill superior estatico (se omite la interpolacion `opacity`/`translateY` ligada a `scrollY`). Contenido y layout intactos.
- **Contraste alto -> efecto real y ligero:** en la fabrica de estilos, cuando esta on, el texto secundario usa el token de texto principal y los bordes usan `borderStrong`. Solo tokens; sin colores inventados.
- **Lectura de voz -> "Proximamente" honesto:** se persiste la preferencia y el subtitulo del control dice "Proximamente"; no se simula TTS.
- **Por que:** el criterio 4 del issue #34 admite "efecto real o marcado honestamente"; esto elimina el problema raiz (switches decorativos) sin sobre-ingenieria.

## Risks / Trade-offs

- [Regresion visual en modo claro] -> Mitigacion: `COLORS === lightTheme`; el mapeo token-a-token deja el claro identico. QA con capturas claro antes/despues por breakpoint.
- [Hex hardcodeados que no repintan en oscuro] -> Mitigacion: se mapean los estructurales (fondo, superficie, texto, borde) a tokens; se documenta cuales acentos de marca se dejan intencionalmente. El criterio 1 exige que "toda la pantalla" se re-pinte, entendido como fondos/tarjetas/textos, no cada acento promocional.
- [`scaled()` rompe el layout con "Grande"] -> Mitigacion: escalar solo `fontSize`, no dimensiones de contenedores; `lineHeight` se ajusta donde sea critico. QA compara Medio vs Grande.
- [Nuevo provider olvidado en el arbol] -> Mitigacion: `useAccessibilityPreferences` lanza si se usa fuera del provider; test de humo del provider y montaje en `App.tsx` verificado en typecheck.
- [Doble fuente de verdad de "isDark"] -> Mitigacion: `isDark` viene solo de `useTheme`; el contexto de accesibilidad no duplica estado de tema.

## Migration Plan

- Cambio aditivo y reversible. Llaves nuevas en AsyncStorage; no se tocan ni migran llaves existentes. Rollback = revertir el commit (los datos nuevos quedan huerfanos e inertes, default off). Sin migracion de datos requerida.
