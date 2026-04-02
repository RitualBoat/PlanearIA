import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import BibliotecaPlantillasScreen from "../../screens/plantillas/BibliotecaPlantillasScreen";
import type { Plantilla } from "../../../types";

jest.mock("@expo/vector-icons/MaterialIcons", () => "MaterialIcons");

jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  return {
    SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  };
});

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
}));

const basePlantilla: Plantilla = {
  id: 1,
  nombre: "Examen Álgebra",
  tipo: "examen",
  categoria: "examenes",
  descripcion: "Examen parcial de álgebra",
  contenido: "{}",
  tags: ["Matemáticas", "3° Primaria"],
  esDelSistema: true,
  fechaCreacion: new Date("2024-06-01"),
  fechaModificacion: new Date("2024-06-10"),
  usosCount: 12,
};

const mockPlantillas: Plantilla[] = [
  basePlantilla,
  {
    ...basePlantilla,
    id: 2,
    nombre: "Presentación Ciencias",
    tipo: "presentacion",
    categoria: "diapositivas",
    esDelSistema: false,
    usosCount: 5,
    tags: [],
  },
  {
    ...basePlantilla,
    id: 3,
    nombre: "Mapa Mental Biología",
    tipo: "mapa_mental",
    categoria: "mapas_mentales",
    usosCount: 0,
    tags: [],
  },
];

const mockEliminarPlantilla = jest.fn();

let mockContextValue = {
  plantillas: mockPlantillas,
  isLoading: false,
  error: null,
  eliminarPlantilla: mockEliminarPlantilla,
  reloadPlantillas: jest.fn(),
  crearPlantilla: jest.fn(),
  actualizarPlantilla: jest.fn(),
  obtenerPlantillaPorId: jest.fn(),
  obtenerPlantillasPorCategoria: jest.fn(),
};

jest.mock("../../context/PlantillasContext", () => ({
  usePlantillas: () => mockContextValue,
}));

describe("BibliotecaPlantillasScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockContextValue = {
      plantillas: mockPlantillas,
      isLoading: false,
      error: null,
      eliminarPlantilla: mockEliminarPlantilla,
      reloadPlantillas: jest.fn(),
      crearPlantilla: jest.fn(),
      actualizarPlantilla: jest.fn(),
      obtenerPlantillaPorId: jest.fn(),
      obtenerPlantillasPorCategoria: jest.fn(),
    };
  });

  it("renderiza el header con título 'Plantillas'", () => {
    const { getByText } = render(<BibliotecaPlantillasScreen />);
    expect(getByText("Plantillas")).toBeTruthy();
  });

  it("renderiza las pills de categoría", () => {
    const { getByText } = render(<BibliotecaPlantillasScreen />);
    expect(getByText("TODAS")).toBeTruthy();
    expect(getByText("EXÁMENES")).toBeTruthy();
    expect(getByText("PRESENTACIONES")).toBeTruthy();
  });

  it("renderiza la sección Destacadas cuando hay plantillas con usos", () => {
    const { getByText } = render(<BibliotecaPlantillasScreen />);
    expect(getByText("Destacadas")).toBeTruthy();
  });

  it("renderiza nombres de plantillas en el grid", () => {
    const { getAllByText } = render(<BibliotecaPlantillasScreen />);
    expect(getAllByText("Examen Álgebra").length).toBeGreaterThanOrEqual(1);
    expect(getAllByText("Presentación Ciencias").length).toBeGreaterThanOrEqual(1);
  });

  it("muestra 'Por PlanearIA' para plantillas del sistema", () => {
    const { getAllByText } = render(<BibliotecaPlantillasScreen />);
    expect(getAllByText("Por PlanearIA").length).toBeGreaterThanOrEqual(1);
  });

  it("muestra 'Personal' para plantillas del usuario", () => {
    const { getByText } = render(<BibliotecaPlantillasScreen />);
    expect(getByText("Personal")).toBeTruthy();
  });

  it("muestra estado vacío cuando no hay plantillas", () => {
    mockContextValue = { ...mockContextValue, plantillas: [] };
    const { getByText } = render(<BibliotecaPlantillasScreen />);
    expect(getByText("Aún no tienes plantillas")).toBeTruthy();
  });

  it("muestra botones CTA en estado vacío", () => {
    mockContextValue = { ...mockContextValue, plantillas: [] };
    const { getByText } = render(<BibliotecaPlantillasScreen />);
    expect(getByText("Explorar plantillas del sistema")).toBeTruthy();
    expect(getByText("Crear plantilla")).toBeTruthy();
  });

  it("muestra skeleton cuando está cargando", () => {
    mockContextValue = { ...mockContextValue, isLoading: true };
    const { queryByText } = render(<BibliotecaPlantillasScreen />);
    // Should not show content
    expect(queryByText("Examen Álgebra")).toBeNull();
  });

  it("navega a EditorPlantilla al presionar FAB", () => {
    const { getByLabelText } = render(<BibliotecaPlantillasScreen />);
    fireEvent.press(getByLabelText("Crear plantilla"));
    expect(mockNavigate).toHaveBeenCalledWith("EditorPlantilla");
  });

  it("navega hacia atrás al presionar botón back", () => {
    const { getByLabelText } = render(<BibliotecaPlantillasScreen />);
    fireEvent.press(getByLabelText("Volver"));
    expect(mockGoBack).toHaveBeenCalled();
  });

  it("filtra plantillas por categoría al seleccionar pill", () => {
    const { getByText, getAllByText } = render(<BibliotecaPlantillasScreen />);

    // Press Exámenes pill
    fireEvent.press(getByText("EXÁMENES"));

    // Should show exam plantilla, but filter grid
    // The grid section shows filtered content
    expect(getAllByText("Examen Álgebra").length).toBeGreaterThanOrEqual(1);
  });

  it("muestra modal de detalle al presionar una plantilla", () => {
    const { getAllByText, getByText } = render(<BibliotecaPlantillasScreen />);
    // Grid card press — pick the first instance
    fireEvent.press(getAllByText("Examen Álgebra")[0]);
    // Detail modal should appear
    expect(getByText("Usar plantilla")).toBeTruthy();
    expect(getByText("Duplicar y editar")).toBeTruthy();
    expect(getByText("Eliminar")).toBeTruthy();
  });

  it("muestra badges de tipo y sistema en modal de detalle", () => {
    const { getAllByText, getByText } = render(<BibliotecaPlantillasScreen />);
    fireEvent.press(getAllByText("Examen Álgebra")[0]);
    expect(getByText("EXAMEN")).toBeTruthy();
    expect(getByText("DEL SISTEMA")).toBeTruthy();
  });

  it("muestra info del autor y usos en modal de detalle", () => {
    const { getAllByText, getByText } = render(<BibliotecaPlantillasScreen />);
    fireEvent.press(getAllByText("Examen Álgebra")[0]);
    expect(getByText("Usado 12 veces")).toBeTruthy();
  });

  it("muestra tags en modal de detalle", () => {
    const { getAllByText, getByText } = render(<BibliotecaPlantillasScreen />);
    fireEvent.press(getAllByText("Examen Álgebra")[0]);
    expect(getByText("Matemáticas")).toBeTruthy();
    expect(getByText("3° Primaria")).toBeTruthy();
  });

  it("navega a EditorPlantilla al usar plantilla desde detalle", () => {
    const { getAllByText, getByText } = render(<BibliotecaPlantillasScreen />);
    fireEvent.press(getAllByText("Examen Álgebra")[0]);
    fireEvent.press(getByText("Usar plantilla"));
    expect(mockNavigate).toHaveBeenCalledWith("EditorPlantilla", {
      plantillaId: 1,
    });
  });

  it("muestra conteo de usos en grid card", () => {
    const { getByText } = render(<BibliotecaPlantillasScreen />);
    expect(getByText("12 usos")).toBeTruthy();
  });

  it("navega a ListaPlantillas desde estado vacío CTA", () => {
    mockContextValue = { ...mockContextValue, plantillas: [] };
    const { getByText } = render(<BibliotecaPlantillasScreen />);
    fireEvent.press(getByText("Explorar plantillas del sistema"));
    expect(mockNavigate).toHaveBeenCalledWith("ListaPlantillas");
  });

  it("navega a EditorPlantilla desde estado vacío CTA", () => {
    mockContextValue = { ...mockContextValue, plantillas: [] };
    const { getByText } = render(<BibliotecaPlantillasScreen />);
    fireEvent.press(getByText("Crear plantilla"));
    expect(mockNavigate).toHaveBeenCalledWith("EditorPlantilla");
  });
});
