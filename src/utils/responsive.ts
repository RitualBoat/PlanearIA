import { Platform } from "react-native";

/**
 * Helper de plataforma. Responde por `Platform.OS`, constante en runtime: NO es una
 * dimension de ancho. Para responsividad por ancho (que debe reaccionar a resize y
 * rotacion) usar `useBreakpoint()` de `src/hooks/useBreakpoint`, no este helper.
 *
 * Las funciones `responsive()` y `getScreenDimensions()` que vivian aqui se jubilaron
 * en el change `breakpoints-reactivos` (#79): leian `Dimensions.get()` (una foto que se
 * congelaba al importar dentro de un `StyleSheet.create`). Su reemplazo reactivo es
 * `useBreakpoint()` + `resolveResponsive()`.
 */
export const isWeb = (): boolean => {
  return Platform.OS === "web";
};
