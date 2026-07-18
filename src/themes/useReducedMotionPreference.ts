import { useReducedMotion } from "react-native-reanimated";
import { useAccessibilityPreferences } from "../context/AccessibilityPreferencesContext";

/**
 * Fuente unica de la decision de reduce-motion.
 *
 * Combina dos senales:
 * - El ajuste del sistema operativo, leido con `useReducedMotion()` de reanimated. Es
 *   sincrono, sin el parpadeo de `AccessibilityInfo.isReduceMotionEnabled` (asincrono).
 * - La preferencia in-app `reduceMotion` de `AccessibilityPreferencesContext`, que es
 *   estado de React y por tanto reactiva.
 *
 * Devuelve `true` si cualquiera de las dos pide reducir movimiento; el consumidor debe
 * mostrar entonces la variante estatica equivalente.
 *
 * Salvedad (por que no basta el hook del sistema): `useReducedMotion()` captura el valor
 * al montar y NO re-renderiza si el ajuste del sistema cambia con la app abierta. La
 * mitigacion es doble: la preferencia in-app SI es reactiva, y los tokens de movimiento
 * llevan `ReduceMotion.System`, asi que reanimated honra el sistema en la capa worklet
 * aunque este valor de JS no se actualice. Los cambios de accesibilidad del sistema a
 * mitad de sesion son poco frecuentes.
 */
export function useReducedMotionPreference(): boolean {
  const systemReduceMotion = useReducedMotion();
  const { reduceMotion } = useAccessibilityPreferences();
  return systemReduceMotion || reduceMotion;
}
