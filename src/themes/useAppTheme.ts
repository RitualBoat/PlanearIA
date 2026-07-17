import { useMemo } from "react";
import { useTheme } from "../context/ThemeContext";
import { useFontSize } from "../context/FontSizeContext";
import { useDaltonismo } from "../context/DaltonismoContext";
import { useAccessibilityPreferences } from "../context/AccessibilityPreferencesContext";
import { ColorTokens, ThemeMode, ThemedStylesInput } from "./types";

export interface AppThemeData extends ThemedStylesInput {
  theme: ThemeMode;
}

/**
 * Punto de consumo unico de las preferencias de presentacion.
 *
 * Existe porque `useTheme()` entrega `colors` sin el filtro de daltonismo, que vive
 * aparte en `applyDaltonismo()`. Sin este hook cada pantalla debe componer cuatro
 * contextos en el orden correcto, y olvidar `applyDaltonismo` deja la pantalla ciega
 * al daltonismo sin ningun error visible. Componer aqui una sola vez elimina esa clase
 * de bug del rollout.
 *
 * No modifica los contextos: los compone. `useTheme`, `useFontSize`, `useDaltonismo` y
 * `useAccessibilityPreferences` siguen disponibles y con el mismo contrato para las
 * pantallas aun no migradas.
 */
export function useAppTheme(): AppThemeData {
  const { theme, colors, isDark } = useTheme();
  const { scaled } = useFontSize();
  const { applyDaltonismo } = useDaltonismo();
  const { highContrast } = useAccessibilityPreferences();

  // `lightTheme`/`darkTheme` son constantes de modulo y `applyDaltonismo` esta memoizado
  // por `daltonismoMode`, asi que la identidad de `colors` solo cambia cuando el docente
  // cambia de tema o de modo daltonismo. Eso permite que las fabricas `getStyles` que
  // dependen de este valor no recreen su StyleSheet en cada render.
  const themedColors = useMemo<ColorTokens>(
    () => applyDaltonismo(colors),
    [applyDaltonismo, colors]
  );

  return useMemo(
    () => ({ colors: themedColors, isDark, theme, scaled, highContrast }),
    [themedColors, isDark, theme, scaled, highContrast]
  );
}
