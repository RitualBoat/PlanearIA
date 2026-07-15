import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react-native";

import { DaltonismoProvider, useDaltonismo } from "../../context/DaltonismoContext";
import { FontSizeProvider, useFontSize } from "../../context/FontSizeContext";
import { ThemeProvider, useTheme } from "../../context/ThemeContext";
import { darkTheme, lightTheme } from "../../themes/colors";

const mockGetItem = jest.fn();
const mockSetItem = jest.fn();

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: (...args: unknown[]) => mockGetItem(...args),
  setItem: (...args: unknown[]) => mockSetItem(...args),
}));

const wrapWith =
  (Provider: React.FC<{ children: React.ReactNode }>): React.FC<{ children: React.ReactNode }> =>
  ({ children }) => <Provider>{children}</Provider>;

describe("accessibility preference contexts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetItem.mockResolvedValue(null);
    mockSetItem.mockResolvedValue(undefined);
  });

  describe("ThemeProvider", () => {
    it("changes to dark mode at runtime and persists the preference", async () => {
      const { result } = renderHook(() => useTheme(), { wrapper: wrapWith(ThemeProvider) });

      await waitFor(() => expect(mockGetItem).toHaveBeenCalledWith("APP_THEME_MODE"));

      act(() => {
        result.current.setTheme("dark");
      });

      await waitFor(() => expect(result.current.theme).toBe("dark"));
      expect(result.current.isDark).toBe(true);
      expect(result.current.colors.primary).toBe(darkTheme.primary);
      expect(mockSetItem).toHaveBeenCalledWith("APP_THEME_MODE", "dark");
    });

    it("restores a stored valid theme preference", async () => {
      mockGetItem.mockResolvedValue("dark");

      const { result } = renderHook(() => useTheme(), { wrapper: wrapWith(ThemeProvider) });

      await waitFor(() => expect(result.current.theme).toBe("dark"));
      expect(result.current.isDark).toBe(true);
      expect(result.current.colors.background).toBe(darkTheme.background);
    });
  });

  describe("FontSizeProvider", () => {
    it("changes font size at runtime and persists the preference", async () => {
      const { result } = renderHook(() => useFontSize(), { wrapper: wrapWith(FontSizeProvider) });

      await waitFor(() => expect(mockGetItem).toHaveBeenCalledWith("APP_FONT_SIZE_MODE"));

      act(() => {
        result.current.setFontSizeMode("large");
      });

      await waitFor(() => expect(result.current.fontSizeMode).toBe("large"));
      expect(result.current.scaleFactor).toBe(1.2);
      expect(result.current.scaled(10)).toBe(12);
      expect(mockSetItem).toHaveBeenCalledWith("APP_FONT_SIZE_MODE", "large");
    });

    it("restores a stored valid font size preference", async () => {
      mockGetItem.mockResolvedValue("xlarge");

      const { result } = renderHook(() => useFontSize(), { wrapper: wrapWith(FontSizeProvider) });

      await waitFor(() => expect(result.current.fontSizeMode).toBe("xlarge"));
      expect(result.current.scaleFactor).toBe(1.4);
      expect(result.current.scaled(10)).toBe(14);
    });
  });

  describe("DaltonismoProvider", () => {
    it("changes daltonism mode at runtime and persists the preference", async () => {
      const { result } = renderHook(() => useDaltonismo(), {
        wrapper: wrapWith(DaltonismoProvider),
      });

      await waitFor(() => expect(mockGetItem).toHaveBeenCalledWith("APP_DALTONISMO_MODE"));

      act(() => {
        result.current.setDaltonismoMode("protanopia");
      });

      await waitFor(() => expect(result.current.daltonismoMode).toBe("protanopia"));

      const adjusted = result.current.applyDaltonismo(lightTheme);
      expect(adjusted.error).toBe("#D4A017");
      expect(adjusted.success).toBe("#2196F3");
      expect(mockSetItem).toHaveBeenCalledWith("APP_DALTONISMO_MODE", "protanopia");
    });

    it("restores a stored valid daltonism preference", async () => {
      mockGetItem.mockResolvedValue("deuteranopia");

      const { result } = renderHook(() => useDaltonismo(), {
        wrapper: wrapWith(DaltonismoProvider),
      });

      await waitFor(() => expect(result.current.daltonismoMode).toBe("deuteranopia"));

      const adjusted = result.current.applyDaltonismo(lightTheme);
      expect(adjusted.success).toBe("#2196F3");
      expect(adjusted.error).toBe("#E67E22");
    });

    it("leaves colors unchanged when the default mode is active", async () => {
      const { result } = renderHook(() => useDaltonismo(), {
        wrapper: wrapWith(DaltonismoProvider),
      });

      await waitFor(() => expect(mockGetItem).toHaveBeenCalledWith("APP_DALTONISMO_MODE"));

      expect(result.current.daltonismoMode).toBe("none");
      expect(result.current.applyDaltonismo(lightTheme)).toBe(lightTheme);
    });
  });

  it("keeps safe defaults when stored values are invalid", async () => {
    mockGetItem.mockResolvedValue("invalid");

    const theme = renderHook(() => useTheme(), { wrapper: wrapWith(ThemeProvider) });
    const fontSize = renderHook(() => useFontSize(), { wrapper: wrapWith(FontSizeProvider) });
    const daltonismo = renderHook(() => useDaltonismo(), {
      wrapper: wrapWith(DaltonismoProvider),
    });

    await waitFor(() => expect(mockGetItem).toHaveBeenCalledTimes(3));

    expect(theme.result.current.theme).toBe("light");
    expect(theme.result.current.colors.background).toBe(lightTheme.background);
    expect(fontSize.result.current.fontSizeMode).toBe("medium");
    expect(fontSize.result.current.scaleFactor).toBe(1);
    expect(daltonismo.result.current.daltonismoMode).toBe("none");
    expect(daltonismo.result.current.applyDaltonismo(darkTheme)).toBe(darkTheme);
  });
});
