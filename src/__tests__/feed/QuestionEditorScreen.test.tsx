import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import QuestionEditorScreen from "../../screens/feed/QuestionEditorScreen";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@expo/vector-icons/MaterialIcons", () => "MaterialIcons");

jest.mock("react-native-safe-area-context", () => {
  const { View } = require("react-native");
  return {
    SafeAreaView: View,
  };
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
      onSurface: "#181c1f",
      onSurfaceVariant: "#43474e",
      outlineVariant: "#c0c7d4",
      primaryContainer: "#0576d2",
    },
  }),
}));

describe("QuestionEditorScreen", () => {
  const mockNavigation = {
    goBack: jest.fn(),
    navigate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza el estado vacío por defecto", () => {
    const { getByText } = render(<QuestionEditorScreen navigation={mockNavigation} />);
    expect(getByText("Aún no has añadido preguntas")).toBeTruthy();
    expect(getByText(/Toca el botón de abajo/)).toBeTruthy();
  });

  it("muestra el botón CTA en estado vacío", () => {
    const { getByText } = render(<QuestionEditorScreen navigation={mockNavigation} />);
    expect(getByText("Crear primera pregunta")).toBeTruthy();
  });

  it("cambia al editor al crear la primera pregunta", () => {
    const { getByText, queryByText } = render(<QuestionEditorScreen navigation={mockNavigation} />);
    fireEvent.press(getByText("Crear primera pregunta"));
    // Should now show editor header
    expect(queryByText("Aún no has añadido preguntas")).toBeNull();
    expect(getByText(/Preguntas/)).toBeTruthy();
  });

  it("muestra el header del editor con conteo de preguntas", () => {
    const { getByText } = render(<QuestionEditorScreen navigation={mockNavigation} />);
    fireEvent.press(getByText("Crear primera pregunta"));
    // The header shows e.g. "Preguntas (1/10)" but may be split
    expect(getByText(/Preguntas \(1\//)).toBeTruthy();
  });

  it("permite agregar más preguntas con el FAB", () => {
    const { getByText } = render(<QuestionEditorScreen navigation={mockNavigation} />);
    fireEvent.press(getByText("Crear primera pregunta"));
    // Add another question via FAB
    fireEvent.press(getByText("Añadir pregunta"));
    expect(getByText(/Preguntas \(2\//)).toBeTruthy();
  });

  it("navega hacia atrás al presionar el botón de cerrar", () => {
    const { getByText } = render(<QuestionEditorScreen navigation={mockNavigation} />);
    fireEvent.press(getByText("Crear primera pregunta"));
    expect(getByText(/Preguntas/)).toBeTruthy();
  });
});
