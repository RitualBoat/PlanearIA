/**
 * Escala de espaciado con ritmo 4pt (plan UX/UI, seccion Ola 0).
 *
 * Nombrada para eliminar los tamanos magicos: hoy decenas de archivos codifican
 * separaciones con literales sueltos. Los valores distintos de cero son multiplos de 4,
 * y la escala es estrictamente ascendente.
 */
export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export type SpacingToken = keyof typeof spacing;
