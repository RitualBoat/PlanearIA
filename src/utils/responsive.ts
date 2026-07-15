import { Dimensions, Platform } from "react-native";

/**
 * Obtiene las dimensiones de la pantalla
 */
export const getScreenDimensions = () => {
  const { width, height } = Dimensions.get("window");
  return { width, height };
};

/**
 * Determina si es una pantalla grande (tablet o web)
 */
const isLargeScreen = (): boolean => {
  const { width } = getScreenDimensions();
  return width >= 768;
};

/**
 * Determina si es web
 */
export const isWeb = (): boolean => {
  return Platform.OS === "web";
};

/**
 * Retorna un valor responsivo basado en el tamaño de pantalla
 */
export const responsive = (
  mobile: number,
  tablet: number,
  web?: number
): number => {
  const { width } = getScreenDimensions();

  if (Platform.OS === "web" && web !== undefined) {
    return web;
  }

  if (width >= 768) {
    return tablet;
  }

  return mobile;
};
