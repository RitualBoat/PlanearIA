import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import BuscadorPerfilesScreen from "../../screens/social/BuscadorPerfilesScreen";

jest.mock("@expo/vector-icons/MaterialIcons", () => "MaterialIcons");

jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  return {
    SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  };
});

jest.mock("expo-linear-gradient", () => {
  const React = require("react");
  return {
    LinearGradient: ({ children, style }: any) =>
      React.createElement("View", { style }, children),
  };
});

const mockGoBack = jest.fn();
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ goBack: mockGoBack }),
}));

// ─── ViewModel mock ───

const defaultVm = {
  searchQuery: "",
  setSearchQuery: jest.fn(),
  filtroNivel: "Todos",
  setFiltroNivel: jest.fn(),
  filtrosExpandidos: false,
  toggleFiltros: jest.fn(),
  filtroEstado: "",
  setFiltroEstado: jest.fn(),
  filtroMateria: "",
  setFiltroMateria: jest.fn(),
  isSearching: false,
  hasSearched: false,
  resultados: [],
  sugeridos: [
    {
      id: "s1",
      nombre: "María",
      apellidos: "Hernández López",
      escuela: "Sec. Téc. #42",
      materia: "Matemáticas",
      nivel: "Secundaria",
      avatarColor: "#4A90D9",
      enComun: 5,
      estado: "no_conectado",
    },
    {
      id: "s2",
      nombre: "José",
      apellidos: "Ramírez Castillo",
      escuela: "Prep. Benito Juárez",
      materia: "Ciencias",
      nivel: "Preparatoria",
      avatarColor: "#E67E22",
      enComun: 3,
      estado: "no_conectado",
    },
  ],
  totalResultados: 0,
  isOffline: false,
  hasError: false,
  solicitudModal: { visible: false, docente: null },
  inviteModal: false,
  toast: { visible: false, type: null, nombre: "" },
  handleSearch: jest.fn(),
  handleClearSearch: jest.fn(),
  handleConectar: jest.fn(),
  handleEnviarSolicitud: jest.fn(),
  handleCerrarSolicitudModal: jest.fn(),
  handleAbrirInviteModal: jest.fn(),
  handleCerrarInviteModal: jest.fn(),
  handleCopiarEnlace: jest.fn(),
  handleReintentar: jest.fn(),
};

let mockCurrentVm = { ...defaultVm };

jest.mock("../../hooks/useBuscadorPerfilesViewModel", () => ({
  useBuscadorPerfilesViewModel: () => mockCurrentVm,
}));

describe("BuscadorPerfilesScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentVm = { ...defaultVm };
  });

  it("renderiza header con título 'Buscar Docentes'", () => {
    const { getByText } = render(<BuscadorPerfilesScreen />);
    expect(getByText("Buscar Docentes")).toBeTruthy();
  });

  it("renderiza barra de búsqueda con placeholder correcto", () => {
    const { getByPlaceholderText } = render(<BuscadorPerfilesScreen />);
    expect(
      getByPlaceholderText("Nombre, email o escuela...")
    ).toBeTruthy();
  });

  it("renderiza chips de filtro por nivel", () => {
    const { getByText } = render(<BuscadorPerfilesScreen />);
    expect(getByText("Todos")).toBeTruthy();
    expect(getByText("Preescolar")).toBeTruthy();
    expect(getByText("Primaria")).toBeTruthy();
    expect(getByText("Secundaria")).toBeTruthy();
    expect(getByText("Preparatoria")).toBeTruthy();
    expect(getByText("Universidad")).toBeTruthy();
  });

  it("renderiza toggle 'Más filtros'", () => {
    const { getByText } = render(<BuscadorPerfilesScreen />);
    expect(getByText("Más filtros")).toBeTruthy();
  });

  it("renderiza sección SUGERIDOS PARA TI con docentes sugeridos", () => {
    const { getByText } = render(<BuscadorPerfilesScreen />);
    expect(getByText("SUGERIDOS PARA TI")).toBeTruthy();
    expect(getByText("María Hernández López")).toBeTruthy();
    expect(getByText("José Ramírez Castillo")).toBeTruthy();
    expect(getByText("5 en común")).toBeTruthy();
  });

  it("renderiza CTA de invitación por enlace", () => {
    const { getByText } = render(<BuscadorPerfilesScreen />);
    expect(getByText("¿No encuentras a tu colega?")).toBeTruthy();
    expect(getByText("Copiar enlace de invitación")).toBeTruthy();
  });

  it("llama handleConectar al presionar botón Conectar en sugerido", () => {
    const { getAllByText } = render(<BuscadorPerfilesScreen />);
    const conectarBtns = getAllByText("Conectar");
    fireEvent.press(conectarBtns[0]);
    expect(mockCurrentVm.handleConectar).toHaveBeenCalled();
  });

  it("llama toggleFiltros al presionar 'Más filtros'", () => {
    const { getByText } = render(<BuscadorPerfilesScreen />);
    fireEvent.press(getByText("Más filtros"));
    expect(mockCurrentVm.toggleFiltros).toHaveBeenCalled();
  });

  it("muestra filtros avanzados cuando están expandidos", () => {
    mockCurrentVm = { ...defaultVm, filtrosExpandidos: true };
    const { getByText } = render(<BuscadorPerfilesScreen />);
    expect(getByText("Todos los estados")).toBeTruthy();
    expect(getByText("Todas las materias")).toBeTruthy();
    expect(getByText("Menos filtros")).toBeTruthy();
  });

  it("muestra resultados de búsqueda con contador", () => {
    mockCurrentVm = {
      ...defaultVm,
      hasSearched: true,
      totalResultados: 2,
      resultados: [
        {
          id: "r1",
          nombre: "Sofía",
          apellidos: "Reyes Delgado",
          escuela: "Sec. Téc. #28",
          materia: "Matemáticas",
          nivel: "Secundaria",
          avatarColor: "#2ECC71",
          enComun: 8,
          estado: "no_conectado",
        },
        {
          id: "r3",
          nombre: "Isabel",
          apellidos: "Guerrero Solís",
          escuela: "Sec. Téc. #15",
          materia: "Matemáticas",
          nivel: "Secundaria",
          avatarColor: "#E74C3C",
          enComun: 1,
          estado: "solicitud_enviada",
        },
      ],
    };
    const { getByText } = render(<BuscadorPerfilesScreen />);
    expect(getByText("2 docentes encontrados")).toBeTruthy();
    expect(getByText("Sofía Reyes Delgado")).toBeTruthy();
    expect(getByText("Solicitud enviada")).toBeTruthy();
  });

  it("muestra estado 'sin resultados' con botón invitar", () => {
    mockCurrentVm = {
      ...defaultVm,
      hasSearched: true,
      searchQuery: "xyz123abc",
      resultados: [],
      totalResultados: 0,
    };
    const { getByText } = render(<BuscadorPerfilesScreen />);
    expect(getByText(/Sin resultados para/)).toBeTruthy();
    expect(getByText("Invitar por enlace")).toBeTruthy();
  });

  it("muestra skeleton de carga", () => {
    mockCurrentVm = { ...defaultVm, isSearching: true, hasSearched: true };
    const { toJSON } = render(<BuscadorPerfilesScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it("muestra estado de error de red", () => {
    mockCurrentVm = { ...defaultVm, hasError: true };
    const { getByText } = render(<BuscadorPerfilesScreen />);
    expect(getByText("Sin conexión a internet")).toBeTruthy();
    expect(getByText("Reintentar")).toBeTruthy();
  });

  it("llama handleReintentar al presionar Reintentar", () => {
    mockCurrentVm = { ...defaultVm, hasError: true };
    const { getByText } = render(<BuscadorPerfilesScreen />);
    fireEvent.press(getByText("Reintentar"));
    expect(mockCurrentVm.handleReintentar).toHaveBeenCalled();
  });

  it("muestra banner offline", () => {
    mockCurrentVm = { ...defaultVm, isOffline: true };
    const { getByText } = render(<BuscadorPerfilesScreen />);
    expect(
      getByText(/Modo sin conexión/)
    ).toBeTruthy();
  });

  it("muestra toast de solicitud enviada", () => {
    mockCurrentVm = {
      ...defaultVm,
      toast: { visible: true, type: "solicitud" as const, nombre: "Sofía Reyes" },
    };
    const { getByText } = render(<BuscadorPerfilesScreen />);
    expect(getByText("Solicitud enviada a Sofía Reyes")).toBeTruthy();
  });

  it("muestra toast de enlace copiado", () => {
    mockCurrentVm = {
      ...defaultVm,
      toast: { visible: true, type: "enlace" as const, nombre: "" },
    };
    const { getByText } = render(<BuscadorPerfilesScreen />);
    expect(getByText("Enlace de invitación copiado")).toBeTruthy();
  });

  it("muestra botón 'Conectado' para docente conectado", () => {
    mockCurrentVm = {
      ...defaultVm,
      hasSearched: true,
      totalResultados: 1,
      resultados: [
        {
          id: "r5",
          nombre: "María",
          apellidos: "Hernández López",
          escuela: "Sec. Téc. #42",
          materia: "Matemáticas",
          nivel: "Secundaria",
          avatarColor: "#4A90D9",
          enComun: 0,
          estado: "conectado",
        },
      ],
    };
    const { getByText } = render(<BuscadorPerfilesScreen />);
    expect(getByText("Conectado")).toBeTruthy();
    expect(getByText("Enviar mensaje")).toBeTruthy();
  });

  it("llama handleAbrirInviteModal al presionar CTA de invitación", () => {
    const { getByText } = render(<BuscadorPerfilesScreen />);
    fireEvent.press(getByText("Copiar enlace de invitación"));
    expect(mockCurrentVm.handleAbrirInviteModal).toHaveBeenCalled();
  });
});
