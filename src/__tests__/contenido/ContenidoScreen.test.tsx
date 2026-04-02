import React from "react";
import { Alert } from "react-native";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import ContenidoScreen from "../../screens/contenido/ContenidoScreen";
import {
  ContenidoItem,
  CategoriaContenido,
  ContenidoViewModel,
} from "../../hooks/useContenidoViewModel";

jest.mock("@expo/vector-icons/MaterialIcons", () => "MaterialIcons");

jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  return {
    SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  };
});

const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

const mockIsAvailableAsync = jest.fn().mockResolvedValue(true);
const mockShareAsync = jest.fn().mockResolvedValue(undefined);
jest.mock("expo-sharing", () => ({
  isAvailableAsync: () => mockIsAvailableAsync(),
  shareAsync: (...args: unknown[]) => mockShareAsync(...args),
}));

const mockExportPdf = jest
  .fn()
  .mockResolvedValue({ uri: "file:///tmp/plan.pdf", name: "plan.pdf", sizeBytes: 1024 });
const mockExportDocx = jest
  .fn()
  .mockResolvedValue({ uri: "file:///tmp/plan.docx", name: "plan.docx", sizeBytes: 2048 });
jest.mock("../../services/planeacionExportService", () => ({
  exportPlaneacionToPdf: (...args: unknown[]) => mockExportPdf(...args),
  exportPlaneacionToDocx: (...args: unknown[]) => mockExportDocx(...args),
}));

// ─── ViewModel mock ───

const mockSetCategoriaActiva = jest.fn();
const mockSetSearchQuery = jest.fn();
const mockSetFiltroTipo = jest.fn();
const mockSetFiltroFecha = jest.fn();
const mockSetFiltroEstado = jest.fn();
const mockLimpiarFiltros = jest.fn();
const mockEliminarItem = jest.fn();
const mockDuplicarItem = jest.fn();

const mockItems: ContenidoItem[] = [
  {
    id: "plan-1",
    tipo: "planeaciones",
    titulo: "Fracciones equivalentes",
    subtitulo: "Matemáticas · 3° A",
    fechaModificacion: "2024-06-10T12:00:00.000Z",
    esBorrador: false,
    progreso: 100,
    raw: { id: "plan-1", nivelAcademico: "primaria" } as any,
  },
  {
    id: "rec-1",
    tipo: "recursos",
    titulo: "Video de Historia",
    subtitulo: "Video",
    tipoRecurso: "video",
    fechaModificacion: "2024-06-08T00:00:00.000Z",
    esBorrador: false,
    raw: { id: 1 } as any,
  },
];

const mockBorradores: ContenidoItem[] = [
  {
    id: "plan-borr",
    tipo: "planeaciones",
    titulo: "Borrador historia",
    subtitulo: "Historia · 2° B",
    fechaModificacion: "2024-06-09T00:00:00.000Z",
    esBorrador: true,
    progreso: 33,
    raw: { id: "plan-borr", nivelAcademico: "secundaria" } as any,
  },
];

const defaultVm: ContenidoViewModel = {
  items: mockItems,
  borradores: mockBorradores,
  totalItems: 3,
  isLoading: false,
  categoriaActiva: "todo",
  setCategoriaActiva: mockSetCategoriaActiva,
  searchQuery: "",
  setSearchQuery: mockSetSearchQuery,
  filtroTipo: "",
  setFiltroTipo: mockSetFiltroTipo,
  filtroFecha: "",
  setFiltroFecha: mockSetFiltroFecha,
  filtroEstado: "",
  setFiltroEstado: mockSetFiltroEstado,
  filtrosActivos: 0,
  limpiarFiltros: mockLimpiarFiltros,
  conteos: { todo: 3, planeaciones: 2, recursos: 1, entregables: 0, plantillas: 0 },
  eliminarItem: mockEliminarItem,
  duplicarItem: mockDuplicarItem,
};

let mockCurrentVm = { ...defaultVm };

jest.mock("../../hooks/useContenidoViewModel", () => ({
  useContenidoViewModel: () => mockCurrentVm,
  CategoriaContenido: {},
  ContenidoItem: {},
}));

describe("ContenidoScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentVm = { ...defaultVm };
  });

  it("renderiza el header con título y conteo", () => {
    const { getByText } = render(<ContenidoScreen />);

    expect(getByText("Mi Contenido")).toBeTruthy();
    expect(getByText("3 elementos")).toBeTruthy();
  });

  it("renderiza la barra de búsqueda", () => {
    const { getByPlaceholderText } = render(<ContenidoScreen />);

    expect(getByPlaceholderText("Buscar planeaciones, recursos, tareas...")).toBeTruthy();
  });

  it("renderiza las pills de categoría", () => {
    const { getByText } = render(<ContenidoScreen />);

    expect(getByText("Todo")).toBeTruthy();
    expect(getByText("Planeaciones")).toBeTruthy();
    expect(getByText("Recursos")).toBeTruthy();
    expect(getByText("Entregables")).toBeTruthy();
    expect(getByText("Plantillas")).toBeTruthy();
  });

  it("renderiza los items de contenido", () => {
    const { getByText } = render(<ContenidoScreen />);

    expect(getByText("Fracciones equivalentes")).toBeTruthy();
    expect(getByText("Video de Historia")).toBeTruthy();
  });

  it("renderiza la sección de borradores", () => {
    const { getByText } = render(<ContenidoScreen />);

    expect(getByText("Borradores")).toBeTruthy();
    expect(getByText("Borrador historia")).toBeTruthy();
  });

  it("renderiza badges de conteo en pills", () => {
    const { getByText } = render(<ContenidoScreen />);

    // Conteos: planeaciones 2, recursos 1, entregables 0, plantillas 0
    expect(getByText("2")).toBeTruthy();
    expect(getByText("1")).toBeTruthy();
  });

  it("muestra estado vacío cuando no hay contenido", () => {
    mockCurrentVm = { ...defaultVm, items: [], borradores: [], totalItems: 0 };

    const { getByText } = render(<ContenidoScreen />);

    expect(getByText("Tu contenido aparecerá aquí")).toBeTruthy();
    expect(getByText("Crear planeación")).toBeTruthy();
    expect(getByText("Subir recurso")).toBeTruthy();
    expect(getByText("Ver plantillas")).toBeTruthy();
  });

  it("navega a Planeaciones al presionar 'Crear planeación' en empty state", () => {
    mockCurrentVm = { ...defaultVm, items: [], borradores: [], totalItems: 0 };

    const { getByText } = render(<ContenidoScreen />);
    fireEvent.press(getByText("Crear planeación"));

    expect(mockNavigate).toHaveBeenCalledWith("Planeaciones");
  });

  it("muestra skeleton cuando isLoading", () => {
    mockCurrentVm = { ...defaultVm, isLoading: true };

    const { getByText, queryByText } = render(<ContenidoScreen />);

    expect(getByText("Mi Contenido")).toBeTruthy();
    // Should NOT show content items in loading state
    expect(queryByText("Fracciones equivalentes")).toBeNull();
  });

  it("ejecuta búsqueda al escribir en el campo", () => {
    const { getByPlaceholderText } = render(<ContenidoScreen />);

    fireEvent.changeText(
      getByPlaceholderText("Buscar planeaciones, recursos, tareas..."),
      "historia"
    );

    expect(mockSetSearchQuery).toHaveBeenCalledWith("historia");
  });

  it("muestra sección Reciente con conteo de elementos", () => {
    const { getByText } = render(<ContenidoScreen />);

    expect(getByText("Reciente")).toBeTruthy();
    expect(getByText("2 elementos")).toBeTruthy();
  });

  it("no muestra borradores cuando la lista de borradores está vacía", () => {
    mockCurrentVm = { ...defaultVm, borradores: [] };

    const { queryByText } = render(<ContenidoScreen />);

    expect(queryByText("Borradores")).toBeNull();
  });

  it("muestra badge BORRADOR en draft cards", () => {
    const { getByText } = render(<ContenidoScreen />);

    expect(getByText("BORRADOR")).toBeTruthy();
  });

  it("muestra porcentaje de progreso en borradores", () => {
    const { getByText } = render(<ContenidoScreen />);

    expect(getByText("33%")).toBeTruthy();
    expect(getByText("PROGRESO")).toBeTruthy();
  });

  // ─── Context menu export/share tests ───

  it("muestra opciones Compartir y Exportar en el context menu", () => {
    const { getAllByLabelText, getByText } = render(<ContenidoScreen />);

    const moreButtons = getAllByLabelText("Más opciones");
    fireEvent.press(moreButtons[0]);

    expect(getByText("Compartir")).toBeTruthy();
    expect(getByText("Exportar")).toBeTruthy();
  });

  it("compartir planeación genera PDF y abre sharing", async () => {
    const { getAllByLabelText, getByText } = render(<ContenidoScreen />);

    const moreButtons = getAllByLabelText("Más opciones");
    fireEvent.press(moreButtons[0]);
    fireEvent.press(getByText("Compartir"));

    await waitFor(() => {
      expect(mockExportPdf).toHaveBeenCalled();
      expect(mockShareAsync).toHaveBeenCalledWith(
        "file:///tmp/plan.pdf",
        expect.objectContaining({ mimeType: "application/pdf" })
      );
    });
  });

  it("compartir recurso muestra alerta Próximamente", () => {
    const alertSpy = jest.spyOn(Alert, "alert");
    // Use a VM with only a recurso item
    mockCurrentVm = {
      ...defaultVm,
      items: [mockItems[1]], // recurso only
      borradores: [],
    };

    const { getAllByLabelText, getByText } = render(<ContenidoScreen />);

    const moreButtons = getAllByLabelText("Más opciones");
    fireEvent.press(moreButtons[0]);
    fireEvent.press(getByText("Compartir"));

    expect(alertSpy).toHaveBeenCalledWith(
      "Próximamente",
      expect.stringContaining("próxima actualización")
    );
    alertSpy.mockRestore();
  });

  it("exportar planeación muestra selector de formato PDF/Word", () => {
    const alertSpy = jest.spyOn(Alert, "alert");

    const { getAllByLabelText, getByText } = render(<ContenidoScreen />);

    const moreButtons = getAllByLabelText("Más opciones");
    fireEvent.press(moreButtons[0]);
    fireEvent.press(getByText("Exportar"));

    expect(alertSpy).toHaveBeenCalledWith(
      "Exportar planeación",
      "Selecciona el formato de exportación",
      expect.arrayContaining([
        expect.objectContaining({ text: "PDF" }),
        expect.objectContaining({ text: "Word (.docx)" }),
        expect.objectContaining({ text: "Cancelar" }),
      ])
    );
    alertSpy.mockRestore();
  });
});
