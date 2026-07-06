## 1. AccessibilityPreferencesContext (persistencia de los 3 toggles)

- [x] 1.1 Crear `src/context/AccessibilityPreferencesContext.tsx` con `highContrast`, `voiceReading`, `reduceMotion` (default false), setters que persistan en AsyncStorage (`APP_HIGH_CONTRAST`, `APP_VOICE_READING`, `APP_REDUCE_MOTION`), hidratacion en `useEffect` y hook `useAccessibilityPreferences` que lance fuera del provider.
- [x] 1.2 Montar `AccessibilityPreferencesProvider` en `App.tsx` junto a Theme/FontSize/Daltonismo.

## 2. CuentaScreen consume el tema en runtime

- [x] 2.1 Convertir `const styles = StyleSheet.create({...})` en `const getStyles = (DT, isDark, scaled, highContrast) => StyleSheet.create({...})`; mapear los `COLORS.*` y los hex estructurales (fondo/superficie/texto/borde) a tokens `DT.*`.
- [x] 2.2 En el componente: `const { colors, isDark } = useTheme(); const { scaled } = useFontSize(); const { applyDaltonismo } = useDaltonismo(); const DT = applyDaltonismo(colors); const styles = getStyles(DT, isDark, scaled, highContrast);` y actualizar `StatusBar`/usos sueltos de `COLORS` a `DT`.
- [x] 2.3 Envolver los `fontSize`/`lineHeight` de la fabrica con `scaled(base)` (solo tipografia, no geometria de layout).

## 3. Efecto real / honesto de los 3 toggles

- [x] 3.1 Reemplazar los `useState(true)` locales por `useAccessibilityPreferences`; conectar cada toggle a su setter persistido.
- [x] 3.2 Reducir movimiento: cuando on, renderizar el pill superior estatico (omitir la animacion ligada a `scrollY`).
- [x] 3.3 Contraste alto: en `getStyles`, cuando on, reforzar texto secundario -> token de texto principal y bordes -> `borderStrong`.
- [x] 3.4 Lectura de voz: persistir preferencia y mostrar subtitulo "Proximamente"; sin simular TTS.

## 4. Tests

- [x] 4.1 Test del `AccessibilityPreferencesProvider`: defaults off, persistencia y restauracion desde AsyncStorage, valor invalido -> default off.
- [x] 4.2 Test de `CuentaScreen`: al render con tema oscuro usa tokens oscuros; con daltonismo aplica `applyDaltonismo`; los 3 toggles reflejan el context (no `useState` local).

## 5. Evidencia y gate visual

- [x] 5.1 `npm run typecheck` en verde.
- [x] 5.2 `npm run lint -- --quiet` en verde.
- [x] 5.3 Tests afectados en verde (`src/__tests__/settings/`).
- [x] 5.4 Gate visual (Playwright MCP en web): levantar `expo start --web`, esperar bundler listo, navegar a Configuracion y capturar claro vs oscuro y fuente Medio vs Grande por breakpoint (movil <768, tablet 768-1279, web >=1280); adjuntar evidencia al issue #34.

---

Evidencia (2026-07-06):
- 1.x / 2.x / 3.x: `src/context/AccessibilityPreferencesContext.tsx` (nuevo), `App.tsx` (provider montado), `src/screens/cuenta/CuentaScreen.tsx` (fabrica `getStyles(DT, isDark, scaled, highContrast)`, `scaled()` en tipografia, `applyDaltonismo(colors)`, 3 toggles desde context, reduce-motion estatico, contraste alto por tokens, lectura de voz "Proximamente").
- 4.x: `npx jest src/__tests__/settings --runInBand` -> 3 suites, 15 tests en verde.
- 5.1: `npx tsc --noEmit` -> exit 0.
- 5.2: `npx eslint <archivos cambiados> --quiet` -> exit 0.
- 5.4: QA visual con Playwright MCP (9 capturas, 3 breakpoints) documentada en `Documentacion/03-validacion/openspec-sdd-cuenta-2026-07-06/` y adjunta a issue #34 (comment 4890938605). Criterios 1-7 verificados.
