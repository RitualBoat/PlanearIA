import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DaltonismoMode, ColorTokens } from "../themes/types";

const DALTONISMO_KEY = "APP_DALTONISMO_MODE";

/**
 * Filtros de daltonismo: ajustan ciertos colores clave para mejorar
 * la distinguibilidad manteniendo el resto del tema intacto.
 */
const daltonismoFilters: Record<Exclude<DaltonismoMode, "none">, Partial<ColorTokens>> = {
  protanopia: {
    // Rojos → naranja/amarillo, verdes → azul
    error: "#D4A017",
    errorLight: "#E6B422",
    danger: "#D4A017",
    dangerDark: "#B8860B",
    success: "#2196F3",
    successLight: "#1976D2",
    warning: "#FFD700",
    nivelPrimaria: "#2196F3",
  },
  deuteranopia: {
    // Verdes → azul, rojos → naranja
    success: "#2196F3",
    successLight: "#1976D2",
    nivelPrimaria: "#42A5F5",
    error: "#E67E22",
    errorLight: "#F39C12",
    danger: "#E67E22",
    dangerDark: "#D35400",
  },
  tritanopia: {
    // Azules → cian, amarillos → rosa
    primary: "#00ACC1",
    primaryDark: "#00838F",
    primaryLight: "#26C6DA",
    warning: "#E91E63",
    warningTint: "#FCE4EC",
    amber: "#E91E63",
    nivelPreparatoria: "#E91E63",
  },
};

interface DaltonismoContextData {
  daltonismoMode: DaltonismoMode;
  setDaltonismoMode: (mode: DaltonismoMode) => void;
  applyDaltonismo: (colors: ColorTokens) => ColorTokens;
}

const DaltonismoContext = createContext<DaltonismoContextData | undefined>(undefined);

export const DaltonismoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [daltonismoMode, setModeState] = useState<DaltonismoMode>("none");

  useEffect(() => {
    AsyncStorage.getItem(DALTONISMO_KEY).then((stored) => {
      if (stored && (stored === "none" || stored in daltonismoFilters)) {
        setModeState(stored as DaltonismoMode);
      }
    });
  }, []);

  const setDaltonismoMode = useCallback((mode: DaltonismoMode) => {
    setModeState(mode);
    AsyncStorage.setItem(DALTONISMO_KEY, mode);
  }, []);

  const applyDaltonismo = useCallback(
    (colors: ColorTokens): ColorTokens => {
      if (daltonismoMode === "none") return colors;
      return { ...colors, ...daltonismoFilters[daltonismoMode] };
    },
    [daltonismoMode]
  );

  return (
    <DaltonismoContext.Provider value={{ daltonismoMode, setDaltonismoMode, applyDaltonismo }}>
      {children}
    </DaltonismoContext.Provider>
  );
};

export function useDaltonismo(): DaltonismoContextData {
  const ctx = useContext(DaltonismoContext);
  if (!ctx) throw new Error("useDaltonismo must be used within DaltonismoProvider");
  return ctx;
}
