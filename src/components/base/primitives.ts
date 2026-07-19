import { useCallback, useState } from "react";
import type { Insets } from "react-native";

/**
 * Primitivas internas compartidas por la biblioteca base.
 *
 * No se exportan desde el barrel publico: son el pegamento entre los componentes y los
 * tokens, no parte del contrato que consumen las pantallas.
 */

/**
 * Area tactil minima, en puntos.
 *
 * El plan fija 44pt. Es mas estricto que WCAG 2.2 SC 2.5.8 (24px, nivel AA) y coincide
 * con SC 2.5.5 (nivel AAA) y con las guias de iOS y Android. Se mantiene el criterio
 * estricto porque el docente usa la app con una mano y en movimiento.
 */
export const MIN_TOUCH_TARGET = 44;

/**
 * Extiende el area tactil de un control cuya forma visual mide menos de 44pt.
 *
 * Devuelve el `hitSlop` que falta por lado para llegar a 44x44 sin tocar el tamano
 * visual. Separar area tactil de tamano visual es justo el proposito de `hitSlop`:
 * inflar cada chip a 44pt de alto romperia la densidad en movil.
 *
 * Devuelve `undefined` cuando el control ya cubre el minimo, para no ensuciar el arbol
 * con props inertes.
 */
export function hitSlopToMinTarget(width: number, height: number): Insets | undefined {
  const horizontal = Math.max(0, (MIN_TOUCH_TARGET - width) / 2);
  const vertical = Math.max(0, (MIN_TOUCH_TARGET - height) / 2);
  if (horizontal === 0 && vertical === 0) return undefined;
  return { top: vertical, bottom: vertical, left: horizontal, right: horizontal };
}

export interface FocusRing {
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
}

/**
 * Estado de foco explicito para el anillo visible en web.
 *
 * No se delega al `outline` del navegador: ese indicador no conoce el tema activo, no se
 * puede verificar en prueba y desaparece si alguien aplica `outline: none`. Un estado
 * propio produce un anillo theme-aware, identico en los tres breakpoints, y observable
 * desde las pruebas.
 */
export function useFocusRing(): FocusRing {
  const [focused, setFocused] = useState(false);
  const onFocus = useCallback(() => setFocused(true), []);
  const onBlur = useCallback(() => setFocused(false), []);
  return { focused, onFocus, onBlur };
}

/** Tono semantico compartido por Banner, Toast y los estados de Input. */
export type ToneVariant = "info" | "success" | "warning" | "error";

/** Jerarquia visual de accion, compartida por Button y las acciones de EmptyState. */
export type ActionVariant = "primary" | "secondary" | "ghost" | "destructive";
