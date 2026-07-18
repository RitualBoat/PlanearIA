import type { ViewStyle } from "react-native";
import type { ColorTokens } from "./types";

export interface ElevationLevels {
  level1: ViewStyle;
  level2: ViewStyle;
  level3: ViewStyle;
}

/**
 * Elevacion en 3 niveles theme-aware.
 *
 * La sombra toma su color de los tokens de sombra del tema activo (`shadowBlue` para los
 * niveles bajos, `shadowBlueLift` para el mas alto), asi cambia entre tema claro (azul
 * tenue) y oscuro (negro). Usa `boxShadow`, soportado cross-platform en RN 0.81 con New
 * Architecture y ya en uso en el repo (AnimatedTopPill), en vez de ramas `shadow*`/
 * `elevation` por plataforma. offset y difuminado crecen por nivel para que sean
 * distinguibles.
 */
export function getElevation(
  colors: Pick<ColorTokens, "shadowBlue" | "shadowBlueLift">
): ElevationLevels {
  return {
    level1: { boxShadow: `0px 1px 3px ${colors.shadowBlue}` },
    level2: { boxShadow: `0px 4px 12px ${colors.shadowBlue}` },
    level3: { boxShadow: `0px 10px 24px ${colors.shadowBlueLift}` },
  };
}
