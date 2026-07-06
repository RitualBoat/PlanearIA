import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HIGH_CONTRAST_KEY = "APP_HIGH_CONTRAST";
const VOICE_READING_KEY = "APP_VOICE_READING";
const REDUCE_MOTION_KEY = "APP_REDUCE_MOTION";

interface AccessibilityPreferencesData {
  highContrast: boolean;
  voiceReading: boolean;
  reduceMotion: boolean;
  setHighContrast: (value: boolean) => void;
  setVoiceReading: (value: boolean) => void;
  setReduceMotion: (value: boolean) => void;
}

const AccessibilityPreferencesContext = createContext<AccessibilityPreferencesData | undefined>(
  undefined
);

// Un solo valor persistido "true" cuenta como activado; cualquier otra cosa
// (ausente o invalido) cae al default seguro off.
const readStoredFlag = (value: string | null): boolean => value === "true";

export const AccessibilityPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [highContrast, setHighContrastState] = useState(false);
  const [voiceReading, setVoiceReadingState] = useState(false);
  const [reduceMotion, setReduceMotionState] = useState(false);

  useEffect(() => {
    AsyncStorage.multiGet([HIGH_CONTRAST_KEY, VOICE_READING_KEY, REDUCE_MOTION_KEY]).then(
      (entries) => {
        const stored = Object.fromEntries(entries);
        setHighContrastState(readStoredFlag(stored[HIGH_CONTRAST_KEY]));
        setVoiceReadingState(readStoredFlag(stored[VOICE_READING_KEY]));
        setReduceMotionState(readStoredFlag(stored[REDUCE_MOTION_KEY]));
      }
    );
  }, []);

  const setHighContrast = useCallback((value: boolean) => {
    setHighContrastState(value);
    AsyncStorage.setItem(HIGH_CONTRAST_KEY, String(value));
  }, []);

  const setVoiceReading = useCallback((value: boolean) => {
    setVoiceReadingState(value);
    AsyncStorage.setItem(VOICE_READING_KEY, String(value));
  }, []);

  const setReduceMotion = useCallback((value: boolean) => {
    setReduceMotionState(value);
    AsyncStorage.setItem(REDUCE_MOTION_KEY, String(value));
  }, []);

  return (
    <AccessibilityPreferencesContext.Provider
      value={{
        highContrast,
        voiceReading,
        reduceMotion,
        setHighContrast,
        setVoiceReading,
        setReduceMotion,
      }}
    >
      {children}
    </AccessibilityPreferencesContext.Provider>
  );
};

export function useAccessibilityPreferences(): AccessibilityPreferencesData {
  const ctx = useContext(AccessibilityPreferencesContext);
  if (!ctx)
    throw new Error(
      "useAccessibilityPreferences must be used within AccessibilityPreferencesProvider"
    );
  return ctx;
}
