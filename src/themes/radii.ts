/**
 * Radios de esquina (plan UX/UI: 8/12/16/pill).
 *
 * `pill` es un radio grande para formas totalmente redondeadas (chips, botones pill);
 * se mantiene finito (no Infinity) para que sea serializable y valido como estilo.
 */
export const radii = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  pill: 9999,
} as const;

export type RadiusToken = keyof typeof radii;
