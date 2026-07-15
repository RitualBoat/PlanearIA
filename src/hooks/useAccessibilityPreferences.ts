import { useContext } from "react";
import { AccessibilityPreferencesContext, type AccessibilityPreferencesData } from "../context/AccessibilityPreferencesContext";

export function useAccessibilityPreferences(): AccessibilityPreferencesData {
  const ctx = useContext(AccessibilityPreferencesContext);
  if (!ctx)
    throw new Error(
      "useAccessibilityPreferences must be used within AccessibilityPreferencesProvider"
    );
  return ctx;
}
