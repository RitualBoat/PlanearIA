import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import RetoResolucionScreen from "../../screens/feed/RetoResolucionScreen";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@expo/vector-icons/MaterialIcons", () => "MaterialIcons");

jest.mock("expo-linear-gradient", () => {
  const { View } = require("react-native");
  return { LinearGradient: View };
});

jest.mock("react-native-safe-area-context", () => {
  const { View } = require("react-native");
  return { SafeAreaView: View };
});

jest.mock("../../context/ThemeContext", () => ({
  useTheme: () => ({
    theme: "light",
    isDark: false,
    colors: {
      primary: "#1676D2",
      background: "#f8f9fb",
      surfaceContainerLowest: "#FFFFFF",
      surfaceContainerLow: "#f1f4f8",
      surfaceContainerHigh: "#e3e6ea",
      onSurface: "#181c1f",
      onSurfaceVariant: "#43474e",
      outlineVariant: "#c0c7d4",
      primaryContainer: "#0576d2",
    },
  }),
}));

describe("RetoResolucionScreen", () => {
  const mockNavigation = {
    goBack: jest.fn(),
    navigate: jest.fn(),
  };

  const route = {
    params: {
      titulo: "Reto de Historia",
      tiempoLimite: 10,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renderiza el título del reto", () => {
    const { getByText } = render(
      <RetoResolucionScreen route={route} navigation={mockNavigation} />
    );
    expect(getByText("Reto de Historia")).toBeTruthy();
  });

  it("muestra el progreso de preguntas", () => {
    const { getByText } = render(
      <RetoResolucionScreen route={route} navigation={mockNavigation} />
    );
    // Text may be split across nodes, use regex
    expect(getByText(/Pregunta/)).toBeTruthy();
    expect(getByText(/completado/)).toBeTruthy();
  });

  it("muestra el texto de la primera pregunta", () => {
    const { getByText } = render(
      <RetoResolucionScreen route={route} navigation={mockNavigation} />
    );
    expect(getByText("¿En qué año inició la Revolución Mexicana?")).toBeTruthy();
  });

  it("muestra las opciones de respuesta", () => {
    const { getByText } = render(
      <RetoResolucionScreen route={route} navigation={mockNavigation} />
    );
    expect(getByText("1910")).toBeTruthy();
    expect(getByText("1917")).toBeTruthy();
    expect(getByText("1810")).toBeTruthy();
    expect(getByText("1920")).toBeTruthy();
  });

  it("avanza a la siguiente pregunta con el botón 'Siguiente'", () => {
    const { getByText } = render(
      <RetoResolucionScreen route={route} navigation={mockNavigation} />
    );
    fireEvent.press(getByText("Siguiente"));
    // Second question: Venustiano Carranza (true/false)
    expect(getByText(/Venustiano Carranza/)).toBeTruthy();
  });

  it("muestra botón 'Anterior' funcional en la segunda pregunta", () => {
    const { getByText } = render(
      <RetoResolucionScreen route={route} navigation={mockNavigation} />
    );
    fireEvent.press(getByText("Siguiente"));
    expect(getByText(/Venustiano Carranza/)).toBeTruthy();
    fireEvent.press(getByText("Anterior"));
    expect(getByText(/Revolución Mexicana/)).toBeTruthy();
  });

  it("muestra título por defecto cuando no hay params", () => {
    const { getByText } = render(
      <RetoResolucionScreen navigation={mockNavigation} />
    );
    expect(getByText("Resolver Reto")).toBeTruthy();
  });
});
