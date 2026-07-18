import { useMemo } from "react";
import { useWindowDimensions } from "react-native";

/**
 * Rangos responsivos de PlanearIA. El bucket superior se llama `desktop` y no `web`
 * para no confundirse con `isWeb()` de `utils/responsive`, que responde por plataforma
 * (`Platform.OS === "web"`) y no por ancho: una tablet nativa de 1300px es `desktop`
 * pero no es web, y una ventana web de 500px es `mobile` pero si es web. Mezclar ambos
 * conceptos es el bug que este modulo evita.
 */
export type Breakpoint = "mobile" | "tablet" | "desktop";

/**
 * Limites inferiores de cada rango, en puntos de ancho.
 * movil `<768`, tablet `768-1279`, escritorio `>=1280`.
 */
export const BREAKPOINTS = { tablet: 768, desktop: 1280 } as const;

/**
 * Clasifica un ancho en su rango. Es puro para poder usarse dentro de una fabrica
 * de estilos, donde no se puede invocar un hook.
 */
export function getBreakpoint(width: number): Breakpoint {
  if (width >= BREAKPOINTS.desktop) return "desktop";
  if (width >= BREAKPOINTS.tablet) return "tablet";
  return "mobile";
}

/**
 * Elige un valor por rango. Reemplazo reactivo de `responsive()`: en vez de leer
 * `Dimensions.get()` al importar (una foto congelada), recibe el breakpoint vigente
 * que el consumidor obtiene de `useBreakpoint()`. Si se omite el valor de escritorio
 * cae al de tablet, igual que el `web?` opcional del helper anterior.
 */
export function resolveResponsive<T>(
  breakpoint: Breakpoint,
  mobile: T,
  tablet: T,
  desktop?: T
): T {
  if (breakpoint === "desktop") return desktop ?? tablet;
  if (breakpoint === "tablet") return tablet;
  return mobile;
}

export interface BreakpointInfo {
  width: number;
  height: number;
  fontScale: number;
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

/**
 * Fuente reactiva unica de dimensiones y rango.
 *
 * Envuelve `useWindowDimensions()`, que se actualiza en resize del navegador y en
 * rotacion del dispositivo; asi ningun estilo queda clavado a una foto tomada al
 * importar el modulo. Expone `fontScale` para coordinar con `FontSizeContext` sin
 * acoplarlos. El objeto se memoiza por sus valores para no cambiar de identidad
 * mientras las dimensiones no cambian.
 */
export function useBreakpoint(): BreakpointInfo {
  const { width, height, fontScale } = useWindowDimensions();
  return useMemo(() => {
    const breakpoint = getBreakpoint(width);
    return {
      width,
      height,
      fontScale,
      breakpoint,
      isMobile: breakpoint === "mobile",
      isTablet: breakpoint === "tablet",
      isDesktop: breakpoint === "desktop",
    };
  }, [width, height, fontScale]);
}
