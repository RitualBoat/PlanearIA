import type { Breakpoint } from "../hooks/useBreakpoint";

export interface ShellNavigationOptions {
  tabBarPosition: "bottom" | "left";
  tabBarVariant: "uikit" | "material";
  tabBarLabelPosition: "below-icon" | "beside-icon";
  animation: "none" | "shift";
}

/**
 * Deriva la presentacion de la navegacion primaria del breakpoint reactivo.
 *
 * Vive en su propio modulo (sin importar pantallas) para que el test del shell
 * adaptativo pueda afirmar la regla M3 "nunca navigation bar y rail simultaneos"
 * sin montar los cinco hubs: una sola barra, una sola posicion por ancho.
 * Movil: barra inferior (uikit). Tablet: rail izquierdo (material, etiqueta bajo
 * el icono). Escritorio: sidebar izquierda (material, etiqueta junto al icono).
 * Con reduce-motion activo la transicion entre tabs se apaga.
 */
export function getShellNavigationOptions(
  breakpoint: Breakpoint,
  reduceMotion: boolean
): ShellNavigationOptions {
  const isMobile = breakpoint === "mobile";
  return {
    tabBarPosition: isMobile ? "bottom" : "left",
    tabBarVariant: isMobile ? "uikit" : "material",
    tabBarLabelPosition: breakpoint === "desktop" ? "beside-icon" : "below-icon",
    animation: reduceMotion ? "none" : "shift",
  };
}
