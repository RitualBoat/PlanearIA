import React from "react";
import { fireEvent, render, act } from "@testing-library/react-native";
import { CrearNuevoModal } from "../../components/CrearNuevoModal";

jest.mock("@expo/vector-icons/MaterialIcons", () => "MaterialIcons");

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
    // Modal with visible=false should not show content
    expect(queryByText("Crear Nuevo")).toBeNull();
  });

  it("renderiza el título 'Crear Nuevo'", () => {
    const { getByText } = renderModal();
    expect(getByText("Crear Nuevo")).toBeTruthy();
  });

  it("renderiza las dos secciones: PLANEACIONES y CONTENIDO", () => {
    const { getByText } = renderModal();
    expect(getByText("PLANEACIONES")).toBeTruthy();
    expect(getByText("CONTENIDO")).toBeTruthy();
  });

  it("renderiza las opciones de planeación", () => {
    const { getByText } = renderModal();
    expect(getByText("Planeación manual")).toBeTruthy();
    expect(getByText("Planeación con IA")).toBeTruthy();
  });

  it("renderiza las opciones de contenido", () => {
    const { getByText } = renderModal();
    expect(getByText("Recurso")).toBeTruthy();
    expect(getByText("Entregable")).toBeTruthy();
    expect(getByText("Plantilla")).toBeTruthy();
  });

  it("renderiza el badge IA", () => {
    const { getByText } = renderModal();
    expect(getByText("IA")).toBeTruthy();
  });

  it("renderiza el botón de importar", () => {
    const { getByText } = renderModal();
    expect(getByText("Importar planeación")).toBeTruthy();
  });

  it("llama onClose al presionar botón de cerrar", () => {
    const { getByLabelText } = renderModal();
    fireEvent.press(getByLabelText("Cerrar"));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("navega a CrearRecurso al seleccionar Recurso", () => {
    const { getByLabelText } = renderModal();
    fireEvent.press(getByLabelText("Recurso"));
    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnNavigate).toHaveBeenCalledWith("CrearRecurso", undefined);
  });

  it("navega a ListaEntregables al seleccionar Entregable", () => {
    const { getByLabelText } = renderModal();
    fireEvent.press(getByLabelText("Entregable"));
    expect(mockOnNavigate).toHaveBeenCalledWith("ListaEntregables", undefined);
  });

  it("navega a EditorPlantilla al seleccionar Plantilla", () => {
    const { getByLabelText } = renderModal();
    fireEvent.press(getByLabelText("Plantilla"));
    expect(mockOnNavigate).toHaveBeenCalledWith("EditorPlantilla", undefined);
  });

  it("navega a ImportarPlaneacion al importar", () => {
    const { getByLabelText } = renderModal();
    fireEvent.press(getByLabelText("Importar planeación"));
    expect(mockOnNavigate).toHaveBeenCalledWith("ImportarPlaneacion", undefined);
  });

  // ─── Nivel selector flow ───
  it("muestra selector de nivel al seleccionar Planeación manual", () => {
    const { getByLabelText, getByText } = renderModal();
    fireEvent.press(getByLabelText("Planeación manual"));
    // Should switch to nivel selector
    expect(getByText("Selecciona el nivel")).toBeTruthy();
    expect(getByText("PRIMARIA")).toBeTruthy();
    expect(getByText("SECUNDARIA")).toBeTruthy();
    expect(getByText("PREPARATORIA")).toBeTruthy();
    expect(getByText("UNIVERSIDAD")).toBeTruthy();
  });

  it("muestra selector de nivel al seleccionar Planeación con IA", () => {
    const { getByLabelText, getByText } = renderModal();
    fireEvent.press(getByLabelText("Planeación con IA"));
    expect(getByText("Selecciona el nivel")).toBeTruthy();
  });

  it("navega con nivel seleccionado para planeación manual", () => {
    const { getByLabelText } = renderModal();
    // Go to level selector
    fireEvent.press(getByLabelText("Planeación manual"));
    // Select Primaria
    fireEvent.press(getByLabelText("PRIMARIA"));
    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnNavigate).toHaveBeenCalledWith("CrearPlaneacion", {
      nivel: "primaria",
    });
  });

  it("navega con nivel seleccionado para planeación con IA", () => {
    const { getByLabelText } = renderModal();
    fireEvent.press(getByLabelText("Planeación con IA"));
    fireEvent.press(getByLabelText("SECUNDARIA"));
    expect(mockOnNavigate).toHaveBeenCalledWith("GenerarPlaneacionIA", {
      nivel: "secundaria",
    });
  });

  it("vuelve al menú al presionar Cancelar en selector de nivel", () => {
    const { getByLabelText, getByText } = renderModal();
    fireEvent.press(getByLabelText("Planeación manual"));
    expect(getByText("Selecciona el nivel")).toBeTruthy();
    // Press Cancelar
    fireEvent.press(getByText("Cancelar"));
    expect(getByText("Crear Nuevo")).toBeTruthy();
  });

  it("renderiza los 4 niveles con etiquetas correctas", () => {
    const { getByLabelText, getByText } = renderModal();
    fireEvent.press(getByLabelText("Planeación manual"));
    expect(getByText("PRIMARIA")).toBeTruthy();
    expect(getByText("SECUNDARIA")).toBeTruthy();
    expect(getByText("PREPARATORIA")).toBeTruthy();
    expect(getByText("UNIVERSIDAD")).toBeTruthy();
  });
});
