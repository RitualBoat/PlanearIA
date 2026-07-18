/**
 * Escala de z-index nombrada por rol de capa, estrictamente ascendente.
 *
 * Elimina los numeros magicos de apilamiento y fija el orden de forma verificable:
 * cada capa vale mas que la anterior en su orden de declaracion.
 */
export const zIndex = {
  base: 0,
  raised: 1,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  toast: 1500,
  tooltip: 1600,
} as const;

export type ZIndexToken = keyof typeof zIndex;
