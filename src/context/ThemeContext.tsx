import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { lightTheme, darkTheme } from "../themes/colors";
import { ColorTokens, ThemeMode } from "../themes/types";

const THEME_KEY = "APP_THEME_MODE";

interface ThemeContextData {
  theme: ThemeMode;
  colors: ColorTokens;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextData | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>("light");

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((stored) => {
      if (stored === "dark" || stored === "light") {
        setThemeState(stored);
      }
    });
  }, []);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
    AsyncStorage.setItem(THEME_KEY, mode);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === "light" ? "dark" : "light";
      AsyncStorage.setItem(THEME_KEY, next);
      return next;
    });
  }, []);

  const colors = theme === "dark" ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider
      value={{ theme, colors, isDark: theme === "dark", toggleTheme, setTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextData {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
