import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import RetoResultadoScreen from "../../screens/feed/RetoResultadoScreen";

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
      onSurface: "#181c1f",
      onSurfaceVariant: "#43474e",
      outlineVariant: "#c0c7d4",
      primaryContainer: "#0576d2",
      error: "#ba1a1a",
    },
  }),
}));

describe("RetoResultadoScreen", () => {
  const mockNavigation = {
    goBack: jest.fn(),
    navigate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza el header con título 'Resultado'", () => {
    const { getByText } = render(
      <RetoResultadoScreen navigation={mockNavigation} />
    );
    expect(getByText("Resultado")).toBeTruthy();
  });

  it("muestra el puntaje demo por defecto (2/3)", () => {
    const { getByText } = render(
      <RetoResultadoScreen navigation={mockNavigation} />
    );
    // Default sample: 2 correct out of 3
    expect(getByText("2/3")).toBeTruthy();
    expect(getByText("67% correcto")).toBeTruthy();
  });

  it("muestra puntaje personalizado desde route params", () => {
    const route = {
      params: { correctas: 8, total: 10, tiempo: 503 },
    };
    const { getByText } = render(
      <RetoResultadoScreen route={route} navigation={mockNavigation} />
    );
    expect(getByText("8/10")).toBeTruthy();
    expect(getByText("80% correcto")).toBeTruthy();
    expect(getByText("8:23")).toBeTruthy();
  });

  it("muestra el mensaje correcto según porcentaje", () => {
    const route = { params: { correctas: 9, total: 10 } };
    const { getByText } = render(
      <RetoResultadoScreen route={route} navigation={mockNavigation} />
    );
    expect(getByText("¡Excelente trabajo!")).toBeTruthy();
  });

  it("muestra análisis de preguntas (correctas e incorrectas)", () => {
    const { getByText } = render(
      <RetoResultadoScreen navigation={mockNavigation} />
    );
    expect(getByText("Análisis de Desempeño")).toBeTruthy();
    expect(getByText("Pregunta 01")).toBeTruthy();
    expect(getByText("Pregunta 02")).toBeTruthy();
    expect(getByText("Pregunta 03")).toBeTruthy();
  });

  it("muestra respuesta correcta para pregunta incorrecta", () => {
    const { getByText } = render(
      <RetoResultadoScreen navigation={mockNavigation} />
    );
    expect(getByText("Uso de colores primarios")).toBeTruthy();
    expect(getByText("Punto de fuga único")).toBeTruthy();
  });

  it("muestra 3 botones de acción en el footer", () => {
    const { getByText } = render(
      <RetoResultadoScreen navigation={mockNavigation} />
    );
    expect(getByText("Volver al feed")).toBeTruthy();
    expect(getByText("Guardar en biblioteca")).toBeTruthy();
    expect(getByText("Compartir")).toBeTruthy();
  });

  it("navega hacia atrás al presionar 'Volver al feed'", () => {
    const { getByText } = render(
      <RetoResultadoScreen navigation={mockNavigation} />
    );
    fireEvent.press(getByText("Volver al feed"));
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });
});
