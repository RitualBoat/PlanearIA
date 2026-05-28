import { Platform, useWindowDimensions } from "react-native";

export type EditorMode = "standard" | "mobile";

export interface UseEditorModeOptions {
  breakpoint?: number;
}

export interface EditorModeResult {
  mode: EditorMode;
  isTablet: boolean;
  breakpoint: number;
  width: number;
  height: number;
}

const DEFAULT_BREAKPOINT = 768;

export const useEditorMode = (options: UseEditorModeOptions = {}): EditorModeResult => {
  const { width, height } = useWindowDimensions();
  const breakpoint = options.breakpoint ?? DEFAULT_BREAKPOINT;
  const platformData = Platform as typeof Platform & { isPad?: boolean };
  const isPad = Platform.OS === "ios" && platformData.isPad === true;

  const isTablet = isPad || width >= breakpoint;
  const mode: EditorMode = isTablet ? "standard" : "mobile";

  return {
    mode,
    isTablet,
    breakpoint,
    width,
    height,
  };
};

