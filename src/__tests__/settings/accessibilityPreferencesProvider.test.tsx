import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react-native";

import {
  AccessibilityPreferencesProvider,
} from "../../context/AccessibilityPreferencesContext";
import { useAccessibilityPreferences } from "../../hooks/useAccessibilityPreferences";

const mockMultiGet = jest.fn();
const mockSetItem = jest.fn();

jest.mock("@react-native-async-storage/async-storage", () => ({
  multiGet: (...args: unknown[]) => mockMultiGet(...args),
  setItem: (...args: unknown[]) => mockSetItem(...args),
}));

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AccessibilityPreferencesProvider>{children}</AccessibilityPreferencesProvider>
);

describe("AccessibilityPreferencesProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMultiGet.mockResolvedValue([
      ["APP_HIGH_CONTRAST", null],
      ["APP_VOICE_READING", null],
      ["APP_REDUCE_MOTION", null],
    ]);
    mockSetItem.mockResolvedValue(undefined);
  });

  it("defaults every preference to off when nothing is stored", async () => {
    const { result } = renderHook(() => useAccessibilityPreferences(), { wrapper });

    await waitFor(() => expect(mockMultiGet).toHaveBeenCalled());

    expect(result.current.highContrast).toBe(false);
    expect(result.current.voiceReading).toBe(false);
    expect(result.current.reduceMotion).toBe(false);
  });

  it("persists a toggle change to local storage", async () => {
    const { result } = renderHook(() => useAccessibilityPreferences(), { wrapper });

    await waitFor(() => expect(mockMultiGet).toHaveBeenCalled());

    act(() => {
      result.current.setReduceMotion(true);
    });

    await waitFor(() => expect(result.current.reduceMotion).toBe(true));
    expect(mockSetItem).toHaveBeenCalledWith("APP_REDUCE_MOTION", "true");
  });

  it("restores stored enabled preferences on start", async () => {
    mockMultiGet.mockResolvedValue([
      ["APP_HIGH_CONTRAST", "true"],
      ["APP_VOICE_READING", null],
      ["APP_REDUCE_MOTION", "true"],
    ]);

    const { result } = renderHook(() => useAccessibilityPreferences(), { wrapper });

    await waitFor(() => expect(result.current.highContrast).toBe(true));
    expect(result.current.reduceMotion).toBe(true);
    expect(result.current.voiceReading).toBe(false);
  });

  it("falls back to off for invalid stored values", async () => {
    mockMultiGet.mockResolvedValue([
      ["APP_HIGH_CONTRAST", "yes"],
      ["APP_VOICE_READING", "1"],
      ["APP_REDUCE_MOTION", "on"],
    ]);

    const { result } = renderHook(() => useAccessibilityPreferences(), { wrapper });

    await waitFor(() => expect(mockMultiGet).toHaveBeenCalled());

    expect(result.current.highContrast).toBe(false);
    expect(result.current.voiceReading).toBe(false);
    expect(result.current.reduceMotion).toBe(false);
  });
});
