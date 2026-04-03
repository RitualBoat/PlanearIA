import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ReportPostModal from "../../components/ReportPostModal";

jest.mock("@expo/vector-icons/MaterialIcons", () => "MaterialIcons");

jest.mock("expo-linear-gradient", () => ({
  LinearGradient: ({ children }: any) => children,
}));

jest.mock("../../context/ThemeContext", () => ({
  useTheme: () => ({
    theme: "light",
    isDark: false,
    colors: {
      primary: "#1676D2",
      primaryContainer: "#0576d2",
      surfaceContainerLowest: "#FFFFFF",
      surfaceContainerLow: "#f1f4f8",
      surfaceContainerHigh: "#e3e8ef",
      onSurface: "#181c1f",
      onSurfaceVariant: "#43474e",
      outlineVariant: "#c0c7d4",
      error: "#BA1A1A",
    },
  }),
}));

describe("ReportPostModal", () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("muestra título y opciones de reporte", () => {
    const { getByText } = render(
      <ReportPostModal visible={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    expect(getByText("Reportar publicación")).toBeTruthy();
    expect(getByText("Spam")).toBeTruthy();
    expect(getByText("Contenido inapropiado")).toBeTruthy();
    expect(getByText("Información falsa")).toBeTruthy();
    expect(getByText("Otro")).toBeTruthy();
  });

  it("muestra botón Enviar reporte", () => {
    const { getByText } = render(
      <ReportPostModal visible={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    expect(getByText("Enviar reporte")).toBeTruthy();
  });

  it("muestra botón Cancelar", () => {
    const { getByText } = render(
      <ReportPostModal visible={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    expect(getByText("Cancelar")).toBeTruthy();
    fireEvent.press(getByText("Cancelar"));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("permite seleccionar una razón y enviar", () => {
    const { getByText } = render(
      <ReportPostModal visible={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    fireEvent.press(getByText("Spam"));
    fireEvent.press(getByText("Enviar reporte"));
    expect(mockOnSubmit).toHaveBeenCalledWith("Spam");
  });

  it("permite cambiar razón seleccionada", () => {
    const { getByText } = render(
      <ReportPostModal visible={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    fireEvent.press(getByText("Spam"));
    fireEvent.press(getByText("Otro"));
    fireEvent.press(getByText("Enviar reporte"));
    expect(mockOnSubmit).toHaveBeenCalledWith("Otro");
  });

  it("no envía si no hay razón seleccionada", () => {
    const { getByText } = render(
      <ReportPostModal visible={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    fireEvent.press(getByText("Enviar reporte"));
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("muestra subtítulo informativo", () => {
    const { getByText } = render(
      <ReportPostModal visible={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    expect(getByText(/Tu reporte es anónimo/)).toBeTruthy();
  });
});
