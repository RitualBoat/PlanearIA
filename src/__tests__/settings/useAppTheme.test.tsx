import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react-native";

import {
  AccessibilityPreferencesProvider,
  useAccessibilityPreferences,
} from "../../context/AccessibilityPreferencesContext";
import { DaltonismoProvider, useDaltonismo } from "../../context/DaltonismoContext";
import { FontSizeProvider, useFontSize } from "../../context/FontSizeContext";
import { ThemeProvider, useTheme } from "../../context/ThemeContext";
import { COLORS, darkTheme, lightTheme } from "../../themes/colors";
import { useAppTheme } from "../../themes/useAppTheme";

const mockGetItem = jest.fn();
const mockSetItem = jest.fn();
const mockMultiGet = jest.fn();

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: (...args: unknown[]) => mockGetItem(...args),
  setItem: (...args: unknown[]) => mockSetItem(...args),
  multiGet: (...args: unknown[]) => mockMultiGet(...args),
}));

const AllProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <FontSizeProvider>
      <DaltonismoProvider>
        <AccessibilityPreferencesProvider>{children}</AccessibilityPreferencesProvider>
      </DaltonismoProvider>
    </FontSizeProvider>
  </ThemeProvider>
);

// Orden invertido a proposito: los contextos de preferencia no deben depender entre si.
const ReversedProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AccessibilityPreferencesProvider>
    <DaltonismoProvider>
      <FontSizeProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </FontSizeProvider>
    </DaltonismoProvider>
  </AccessibilityPreferencesProvider>
);

describe("useAppTheme", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetItem.mockResolvedValue(null);
    mockSetItem.mockResolvedValue(undefined);
    mockMultiGet.mockResolvedValue([]);
  });

  it("entrega los tokens del tema claro sin daltonismo por defecto", async () => {
    const { result } = renderHook(() => useAppTheme(), { wrapper: AllProviders });

    await waitFor(() => expect(mockGetItem).toHaveBeenCalledWith("APP_THEME_MODE"));

    expect(result.current.theme).toBe("light");
    expect(result.current.isDark).toBe(false);
    expect(result.current.colors.background).toBe(lightTheme.background);
    expect(result.current.highContrast).toBe(false);
  });

  it("la migracion no cambia nada en tema claro: COLORS es lightTheme", async () => {
    const { result } = renderHook(() => useAppTheme(), { wrapper: AllProviders });

    await waitFor(() => expect(mockGetItem).toHaveBeenCalledWith("APP_THEME_MODE"));

    // Sostiene el escenario "sin cambio visual en tema claro" de la spec: sustituir
    // COLORS.x por colors.x en un archivo migrado devuelve el mismo valor.
    expect(result.current.colors).toEqual(COLORS);
  });

  it("aplica el filtro de daltonismo sobre el tema activo", async () => {
    const { result } = renderHook(
      () => ({ app: useAppTheme(), daltonismo: useDaltonismo() }),
      { wrapper: AllProviders }
    );

    await waitFor(() => expect(mockGetItem).toHaveBeenCalledWith("APP_DALTONISMO_MODE"));
    expect(result.current.app.colors.success).toBe(lightTheme.success);

    act(() => {
      result.current.daltonismo.setDaltonismoMode("deuteranopia");
    });

    await waitFor(() => expect(result.current.app.colors.success).toBe("#2196F3"));
    // El resto del tema no se toca: el filtro solo ajusta colores de estado.
    expect(result.current.app.colors.background).toBe(lightTheme.background);
  });

  it("combina tema oscuro y daltonismo sin que uno anule al otro", async () => {
    const { result } = renderHook(
      () => ({ app: useAppTheme(), theme: useTheme(), daltonismo: useDaltonismo() }),
      { wrapper: AllProviders }
    );

    await waitFor(() => expect(mockGetItem).toHaveBeenCalledWith("APP_THEME_MODE"));

    act(() => {
      result.current.theme.setTheme("dark");
      result.current.daltonismo.setDaltonismoMode("protanopia");
    });

    await waitFor(() => expect(result.current.app.isDark).toBe(true));

    // Tema oscuro donde el daltonismo no interviene.
    expect(result.current.app.colors.background).toBe(darkTheme.background);
    // Daltonismo encima del tema oscuro donde si interviene.
    expect(result.current.app.colors.error).toBe("#D4A017");
    expect(result.current.app.colors.error).not.toBe(darkTheme.error);
  });

  it("escala la tipografia segun el modo de fuente activo", async () => {
    const { result } = renderHook(() => ({ app: useAppTheme(), fontSize: useFontSize() }), {
      wrapper: AllProviders,
    });

    await waitFor(() => expect(mockGetItem).toHaveBeenCalledWith("APP_FONT_SIZE_MODE"));
    expect(result.current.app.scaled(16)).toBe(16);

    act(() => {
      result.current.fontSize.setFontSizeMode("xlarge");
    });

    await waitFor(() => expect(result.current.app.scaled(16)).toBe(22));
  });

  it("expone el alto contraste del contexto de accesibilidad", async () => {
    const { result } = renderHook(
      () => ({ app: useAppTheme(), a11y: useAccessibilityPreferences() }),
      { wrapper: AllProviders }
    );

    await waitFor(() => expect(mockMultiGet).toHaveBeenCalled());

    act(() => {
      result.current.a11y.setHighContrast(true);
    });

    await waitFor(() => expect(result.current.app.highContrast).toBe(true));
  });

  it("conserva la identidad de colors mientras las preferencias no cambian", async () => {
    const { result, rerender } = renderHook(() => useAppTheme(), { wrapper: AllProviders });

    await waitFor(() => expect(mockGetItem).toHaveBeenCalledWith("APP_THEME_MODE"));

    const first = result.current.colors;
    rerender({});

    // Si esta identidad cambiara, cada getStyles memoizado recrearia su StyleSheet
    // en cada render: es la garantia que hace viable la fabrica memoizada.
    expect(result.current.colors).toBe(first);
  });

  it("no exige un orden de proveedores: los contextos son independientes", async () => {
    const { result } = renderHook(() => useAppTheme(), { wrapper: ReversedProviders });

    await waitFor(() => expect(mockGetItem).toHaveBeenCalledWith("APP_THEME_MODE"));

    expect(result.current.colors.background).toBe(lightTheme.background);
    expect(result.current.isDark).toBe(false);
  });

  it("preserva el contrato publico de los contextos que compone", async () => {
    const { result } = renderHook(
      () => ({
        theme: useTheme(),
        fontSize: useFontSize(),
        daltonismo: useDaltonismo(),
      }),
      { wrapper: AllProviders }
    );

    await waitFor(() => expect(mockGetItem).toHaveBeenCalledWith("APP_THEME_MODE"));

    // useTheme sigue entregando color crudo, sin daltonismo: el hook compuesto no lo muta.
    act(() => {
      result.current.daltonismo.setDaltonismoMode("deuteranopia");
    });

    await waitFor(() => expect(result.current.daltonismo.daltonismoMode).toBe("deuteranopia"));
    expect(result.current.theme.colors.success).toBe(lightTheme.success);
    expect(typeof result.current.theme.toggleTheme).toBe("function");
    expect(typeof result.current.fontSize.scaled).toBe("function");
    expect(result.current.fontSize.scaleFactor).toBe(1);
  });
});
