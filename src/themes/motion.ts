import { ReduceMotion } from "react-native-reanimated";
import type { WithSpringConfig, WithTimingConfig } from "react-native-reanimated";

/**
 * Duraciones de movimiento en milisegundos. El plan UX/UI fija 150/250 como base del
 * catalogo de micro-interacciones; `instant` y `slow` acotan los extremos.
 */
export const duration = {
  instant: 0,
  fast: 150,
  base: 250,
  slow: 400,
} as const;

/**
 * Politica de reduce-motion por defecto para los configs de reanimated.
 *
 * `ReduceMotion.System` = reanimated honra el ajuste de "reducir movimiento" del sistema
 * operativo en la capa worklet, colapsando la animacion a su valor final cuando esta
 * activo. Es el default de reanimated; se declara explicito para que cada preset lo lleve
 * consigo y para que la decision quede documentada en un solo lugar.
 */
export const reduceMotionPolicy = ReduceMotion.System;

/**
 * Presets de spring (rigidez/amortiguacion) para `withSpring`. Cada preset honra el
 * ajuste del sistema via `reduceMotionPolicy`.
 */
export const spring = {
  standard: { damping: 18, stiffness: 180, mass: 1, reduceMotion: reduceMotionPolicy },
  gentle: { damping: 22, stiffness: 120, mass: 1, reduceMotion: reduceMotionPolicy },
  snappy: { damping: 15, stiffness: 260, mass: 1, reduceMotion: reduceMotionPolicy },
} satisfies Record<string, WithSpringConfig>;

/**
 * Presets de timing (duracion + reduce-motion) para `withTiming`.
 */
export const timing = {
  fast: { duration: duration.fast, reduceMotion: reduceMotionPolicy },
  base: { duration: duration.base, reduceMotion: reduceMotionPolicy },
  slow: { duration: duration.slow, reduceMotion: reduceMotionPolicy },
} satisfies Record<string, WithTimingConfig>;

export type DurationToken = keyof typeof duration;
export type SpringToken = keyof typeof spring;
export type TimingToken = keyof typeof timing;
