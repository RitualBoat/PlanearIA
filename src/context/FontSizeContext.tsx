import React, { createContext, useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontSizeMode } from "../themes/types";

const FONT_SIZE_KEY = "APP_FONT_SIZE_MODE";

const SCALE_FACTORS: Record<FontSizeMode, number> = {
  small: 0.85,
  medium: 1,
  large: 1.2,
  xlarge: 1.4,
};

interface FontSizeContextData {
  fontSizeMode: FontSizeMode;
  scaleFactor: number;
  setFontSizeMode: (mode: FontSizeMode) => void;
  scaled: (baseSize: number) => number;
}

const FontSizeContext = createContext<FontSizeContextData | undefined>(undefined);
export { FontSizeContext, type FontSizeContextData };

export const FontSizeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontSizeMode, setModeState] = useState<FontSizeMode>("medium");

  useEffect(() => {
    AsyncStorage.getItem(FONT_SIZE_KEY).then((stored) => {
      if (stored && stored in SCALE_FACTORS) {
        setModeState(stored as FontSizeMode);
      }
    });
  }, []);

  const setFontSizeMode = useCallback((mode: FontSizeMode) => {
    setModeState(mode);
    AsyncStorage.setItem(FONT_SIZE_KEY, mode);
  }, []);

  const scaleFactor = SCALE_FACTORS[fontSizeMode];

  const scaled = useCallback(
    (baseSize: number) => Math.round(baseSize * SCALE_FACTORS[fontSizeMode]),
    [fontSizeMode]
  );

  return (
    <FontSizeContext.Provider value={{ fontSizeMode, scaleFactor, setFontSizeMode, scaled }}>
      {children}
    </FontSizeContext.Provider>
  );
};
