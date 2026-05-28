import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { CrearNuevoModal } from "../../components/CrearNuevoModal";

jest.mock("@expo/vector-icons/MaterialIcons", () => "MaterialIcons");
jest.mock("expo-linear-gradient", () => ({
  LinearGradient: "LinearGradient",
}));

describe("CrearNuevoModal", () => {
  const mockOnClose = jest.fn();
  const mockOnNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderModal = (visible = true) =>
    render(<CrearNuevoModal visible={visible} onClose={mockOnClose} onNavigate={mockOnNavigate} />);

  it("no renderiza contenido cuando visible=false", () => {
    const { queryByText } = renderModal(false);
    expect(queryByText("Crear nuevo")).toBeNull();
  });

  it("renderiza secciones y opciones principales", () => {
    const { getByText } = renderModal();
    expect(getByText("PLANEACIONES")).toBeTruthy();
    expect(getByText("CONTENIDO")).toBeTruthy();
    expect(getByText("Planeacion")).toBeTruthy();
    expect(getByText("Escanear plantilla")).toBeTruthy();
    expect(getByText("Recurso")).toBeTruthy();
    expect(getByText("Entregable")).toBeTruthy();
    expect(getByText("Plantilla")).toBeTruthy();
  });

  it("cierra modal al presionar boton cerrar", () => {
    const { getByLabelText } = renderModal();
    fireEvent.press(getByLabelText("Cerrar"));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("navega a CrearPlaneacion sin selector de nivel", () => {
    const { getByLabelText } = renderModal();
    fireEvent.press(getByLabelText("Planeacion"));
    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnNavigate).toHaveBeenCalledWith("CrearPlaneacion", undefined);
  });

  it("navega a EscanerPlantilla", () => {
    const { getByLabelText } = renderModal();
    fireEvent.press(getByLabelText("Escanear plantilla"));
    expect(mockOnNavigate).toHaveBeenCalledWith("EscanerPlantilla", undefined);
  });

  it("navega a ImportarPlaneacion al importar archivo", () => {
    const { getByLabelText } = renderModal();
    fireEvent.press(getByLabelText("Importar desde archivo"));
    expect(mockOnNavigate).toHaveBeenCalledWith("ImportarPlaneacion", undefined);
  });
});
