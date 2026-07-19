/**
 * Traduccion de tono de sincronizacion a tokens de color (change sync-status-ui, #83).
 *
 * Vive aparte de los componentes para que el chip, el badge y la etiqueta de guardado no
 * puedan divergir en color, igual que no divergen en texto. Es el mismo criterio que usa
 * `Banner` de la biblioteca base, aplicado a la escala de tonos de sync.
 *
 * `TonoSync` no admite "error" a proposito: ningun estado de sincronizacion se pinta de
 * rojo. El rojo lo aporta `SaveStateLabel` unicamente para el fallo de guardado local.
 */

import type { ColorTokens } from "../../themes/types";
import type { TonoSync } from "../../hooks/syncPresentation";

export interface PaletaTono {
  fondo: keyof ColorTokens;
  acento: keyof ColorTokens;
}

export const TONOS_SYNC: Record<TonoSync, PaletaTono> = {
  neutro: { fondo: "surfaceTertiary", acento: "textSecondary" },
  info: { fondo: "primaryTint", acento: "primary" },
  exito: { fondo: "successLight", acento: "success" },
  aviso: { fondo: "warningTint", acento: "warning" },
};
