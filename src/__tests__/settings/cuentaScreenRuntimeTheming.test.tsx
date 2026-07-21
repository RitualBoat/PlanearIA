import React from "react";
import { StyleSheet } from "react-native";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import CuentaScreen from "../../screens/cuenta/CuentaScreen";
import { ThemeProvider } from "../../context/ThemeContext";
import { FontSizeProvider } from "../../context/FontSizeContext";
import { DaltonismoProvider } from "../../context/DaltonismoContext";
import { AccessibilityPreferencesProvider } from "../../context/AccessibilityPreferencesContext";
import { darkTheme, lightTheme } from "../../themes/colors";

const store: Record<string, string | null> = {};

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: (key: string) => Promise.resolve(store[key] ?? null),
  setItem: (key: string, value: string) => {
    store[key] = value;
    return Promise.resolve();
  },
  multiGet: (keys: string[]) => Promise.resolve(keys.map((k) => [k, store[k] ?? null])),
}));

jest.mock("@react-navigation/native", () => {
  const actual = jest.requireActual("@react-navigation/native");
  return { ...actual, useNavigation: () => ({ navigate: jest.fn() }) };
});

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: "es" } }),
}));

jest.mock("../../locales/i18n", () => ({ changeLanguage: jest.fn() }));

jest.mock("../../hooks/useCuentaViewModel", () => ({
  useCuentaViewModel: () => ({
    usuario: { nombre: "Ana", apellidos: "Docente", rol: "docente" },
    handleEditarPerfil: jest.fn(),
    handleCambiarContrasena: jest.fn(),
    handleCerrarSesion: jest.fn(),
    handleEliminarCuenta: jest.fn(),
  }),
}));

jest.mock("../../hooks/usePermission", () => ({
  usePermission: () => ({ can: () => false }),
}));

jest.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ actualizarPreferencias: jest.fn(), isGuest: false }),
  PREFERENCIAS_DEFAULT: {},
}));

// El glow animado (JS-driven, ~1.5s) sigue disparando actualizaciones de
// Animated.View despues de cada test; no interviene en lo que esta suite
// afirma (tokens de tema y contraste), igual que en NotificacionesIntegration.
jest.mock("../../components/AnimatedTopPill", () => "AnimatedTopPill");

const renderScreen = () =>
  render(
    <ThemeProvider>
      <FontSizeProvider>
        <DaltonismoProvider>
          <AccessibilityPreferencesProvider>
            <CuentaScreen />
          </AccessibilityPreferencesProvider>
        </DaltonismoProvider>
      </FontSizeProvider>
    </ThemeProvider>
  );

describe("CuentaScreen runtime theming and accessibility", () => {
  beforeEach(() => {
    for (const key of Object.keys(store)) delete store[key];
  });

  it("repaints the screen with dark theme tokens when dark mode is stored", async () => {
    store["APP_THEME_MODE"] = "dark";

    renderScreen();

    await waitFor(() => {
      const root = screen.getByTestId("cuenta-root");
      const flat = StyleSheet.flatten(root.props.style);
      expect(flat.backgroundColor).toBe(darkTheme.background);
    });
  });

  it("renders with light tokens by default", async () => {
    renderScreen();

    await waitFor(() => {
      const root = screen.getByTestId("cuenta-root");
      const flat = StyleSheet.flatten(root.props.style);
      expect(flat.backgroundColor).toBe(lightTheme.background);
    });
  });

  it("drives the accessibility toggles from context with a safe off default", async () => {
    renderScreen();

    // Open the Accesibilidad accordion to reveal the toggles.
    fireEvent.press(screen.getByText("Accesibilidad"));

    await waitFor(() => expect(screen.getByLabelText("Reducir movimiento")).toBeTruthy());

    expect(screen.getByLabelText("Contraste alto").props.accessibilityState.checked).toBe(false);
    expect(
      screen.getByLabelText("Lectura de voz (proximamente)").props.accessibilityState.checked
    ).toBe(false);
    expect(screen.getByLabelText("Reducir movimiento").props.accessibilityState.checked).toBe(
      false
    );
  });

  it("strengthens secondary text contrast when 'Contraste alto' is enabled", async () => {
    renderScreen();

    fireEvent.press(screen.getByText("Accesibilidad"));

    await waitFor(() => expect(screen.getByText("Mejora la legibilidad del texto")).toBeTruthy());

    const subtitleOff = screen.getByText("Mejora la legibilidad del texto");
    expect(StyleSheet.flatten(subtitleOff.props.style).color).toBe(lightTheme.textSecondary);

    fireEvent.press(screen.getByLabelText("Contraste alto"));

    await waitFor(() => {
      const subtitleOn = screen.getByText("Mejora la legibilidad del texto");
      expect(StyleSheet.flatten(subtitleOn.props.style).color).toBe(lightTheme.text);
    });
  });
});
