/**
 * Barrel de los tokens de presentacion de PlanearIA.
 *
 * Reune los seis grupos (espaciado, radios, tipografia, elevacion, movimiento, z-index)
 * y la primitiva de reduce-motion. No reexporta `COLORS`: el color se consume via
 * `useAppTheme`/`getStyles`, y `COLORS` sigue restringido por la regla de lint de #78.
 */
export { spacing, type SpacingToken } from "./spacing";
export { radii, type RadiusToken } from "./radii";
export { zIndex, type ZIndexToken } from "./zIndex";
export {
  typography,
  scaleType,
  type TypeToken,
  type TypographyToken,
} from "./typography";
export { getElevation, type ElevationLevels } from "./elevation";
export {
  duration,
  spring,
  timing,
  reduceMotionPolicy,
  type DurationToken,
  type SpringToken,
  type TimingToken,
} from "./motion";
export { useReducedMotionPreference } from "./useReducedMotionPreference";
