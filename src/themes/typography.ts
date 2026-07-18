import type { TextStyle } from "react-native";

export interface TypeToken {
  fontSize: number;
  lineHeight: number;
  fontWeight: TextStyle["fontWeight"];
  letterSpacing?: number;
}

/**
 * Escala tipografica base (nunca pre-escalada). Los tamanos se alinean con el lenguaje
 * visual vigente de la app (p. ej. titulo 29/34, subtitulo 15/20), no inventan una escala
 * nueva. No se fija `fontFamily`: hoy se usa la fuente del sistema. Adoptar una fuente de
 * marca via expo-font queda diferido (licencia libre + medicion); la costura es agregar
 * `fontFamily` al token o al helper sin cambiar la escala.
 */
export const typography = {
  display: { fontSize: 40, lineHeight: 44, fontWeight: "800", letterSpacing: -0.5 },
  title: { fontSize: 29, lineHeight: 34, fontWeight: "800", letterSpacing: -0.45 },
  heading: { fontSize: 22, lineHeight: 28, fontWeight: "700" },
  subtitle: { fontSize: 18, lineHeight: 24, fontWeight: "600" },
  body: { fontSize: 15, lineHeight: 20, fontWeight: "400" },
  bodyStrong: { fontSize: 15, lineHeight: 20, fontWeight: "600" },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: "400" },
  overline: { fontSize: 11, lineHeight: 16, fontWeight: "600", letterSpacing: 0.5 },
} satisfies Record<string, TypeToken>;

export type TypographyToken = keyof typeof typography;

/**
 * Multiplica un token tipografico por el factor de `FontSizeContext` (via `scaled`).
 *
 * Escala `fontSize` y `lineHeight`; conserva `fontWeight` y `letterSpacing`, porque el
 * interletrado es un ajuste optico del trazo, no del tamano. Se consume dentro de la
 * fabrica `getStyles`, que ya recibe `scaled`: `title: scaleType(typography.title, scaled)`.
 */
export function scaleType(token: TypeToken, scaled: (baseSize: number) => number): TextStyle {
  return {
    fontSize: scaled(token.fontSize),
    lineHeight: scaled(token.lineHeight),
    fontWeight: token.fontWeight,
    ...(token.letterSpacing !== undefined ? { letterSpacing: token.letterSpacing } : {}),
  };
}
