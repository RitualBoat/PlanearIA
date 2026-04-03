import React from "react";
import { fireEvent, render, act } from "@testing-library/react-native";
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

  it("renderiza el título 'Crear nuevo'", () => {
    const { getByText } = renderModal();
    expect(getByText("Crear nuevo")).toBeTruthy();
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
    expect(getByText("Importar desde archivo")).toBeTruthy();
  });

  it("renderiza subtítulos en opciones de planeación", () => {
    const { getByText } = renderModal();
    // Mobile subtitles (default dimension < 900)
    expect(getByText("Configura paso a paso tus objetivos.")).toBeTruthy();
    expect(getByText("Genera propuestas inteligentes al instante.")).toBeTruthy();
  });

  it("renderiza subtítulos en opciones de contenido", () => {
    const { getByText } = renderModal();
    expect(getByText("Sube archivos, lecturas o multimedia.")).toBeTruthy();
    expect(getByText("Define tareas y criterios de evaluación.")).toBeTruthy();
    expect(getByText("Guarda este formato para uso futuro.")).toBeTruthy();
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
    fireEvent.press(getByLabelText("Importar desde archivo"));
    expect(mockOnNavigate).toHaveBeenCalledWith("ImportarPlaneacion", undefined);
  });

  // ─── Nivel selector flow ───
  it("muestra selector de nivel al seleccionar Planeación manual", () => {
    const { getByLabelText, getByText } = renderModal();
    fireEvent.press(getByLabelText("Planeación manual"));
    expect(getByText("Selecciona el nivel")).toBeTruthy();
    expect(getByText("Primaria")).toBeTruthy();
    expect(getByText("Secundaria")).toBeTruthy();
    expect(getByText("Preparatoria")).toBeTruthy();
    expect(getByText("Universidad")).toBeTruthy();
  });

  it("muestra selector de nivel al seleccionar Planeación con IA", () => {
    const { getByLabelText, getByText } = renderModal();
    fireEvent.press(getByLabelText("Planeación con IA"));
    expect(getByText("Selecciona el nivel")).toBeTruthy();
  });

  it("navega con nivel seleccionado para planeación manual", () => {
    const { getByLabelText } = renderModal();
    fireEvent.press(getByLabelText("Planeación manual"));
    fireEvent.press(getByLabelText("Primaria"));
    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnNavigate).toHaveBeenCalledWith("CrearPlaneacion", {
      nivel: "primaria",
    });
  });

  it("navega con nivel seleccionado para planeación con IA", () => {
    const { getByLabelText } = renderModal();
    fireEvent.press(getByLabelText("Planeación con IA"));
    fireEvent.press(getByLabelText("Secundaria"));
    expect(mockOnNavigate).toHaveBeenCalledWith("GenerarPlaneacionIA", {
      nivel: "secundaria",
    });
  });

  it("vuelve al menú al presionar Cancelar en selector de nivel", () => {
    const { getByLabelText, getByText } = renderModal();
    fireEvent.press(getByLabelText("Planeación manual"));
    expect(getByText("Selecciona el nivel")).toBeTruthy();
    fireEvent.press(getByText("Cancelar"));
    expect(getByText("Crear nuevo")).toBeTruthy();
  });

  it("renderiza los 4 niveles con etiquetas correctas", () => {
    const { getByLabelText, getByText } = renderModal();
    fireEvent.press(getByLabelText("Planeación manual"));
    expect(getByText("Primaria")).toBeTruthy();
    expect(getByText("Secundaria")).toBeTruthy();
    expect(getByText("Preparatoria")).toBeTruthy();
    expect(getByText("Universidad")).toBeTruthy();
  });
});
