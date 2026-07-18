import { renderHook } from "@testing-library/react-native";

import { useReducedMotionPreference } from "../../themes/useReducedMotionPreference";
import { useReducedMotion } from "react-native-reanimated";
import { useAccessibilityPreferences } from "../../context/AccessibilityPreferencesContext";

jest.mock("react-native-reanimated", () => ({
  useReducedMotion: jest.fn(),
}));

jest.mock("../../context/AccessibilityPreferencesContext", () => ({
  useAccessibilityPreferences: jest.fn(),
}));

const mockUseReducedMotion = useReducedMotion as jest.Mock;
const mockUsePreferences = useAccessibilityPreferences as jest.Mock;

describe("useReducedMotionPreference", () => {
  beforeEach(() => jest.clearAllMocks());

  const setup = (systemReduceMotion: boolean, inAppReduceMotion: boolean) => {
    mockUseReducedMotion.mockReturnValue(systemReduceMotion);
    mockUsePreferences.mockReturnValue({ reduceMotion: inAppReduceMotion });
    return renderHook(() => useReducedMotionPreference());
  };

  it("es true si el sistema pide reducir movimiento", () => {
    const { result } = setup(true, false);
    expect(result.current).toBe(true);
  });

  it("es true si la preferencia in-app pide reducir movimiento", () => {
    const { result } = setup(false, true);
    expect(result.current).toBe(true);
  });

  it("es true si ambas senales lo piden", () => {
    const { result } = setup(true, true);
    expect(result.current).toBe(true);
  });

  it("es false cuando ninguna senal lo pide", () => {
    const { result } = setup(false, false);
    expect(result.current).toBe(false);
  });
});
