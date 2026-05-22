import React from "react";
import { Alert } from "react-native";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import SocialScreen from "../../screens/social/SocialScreen";

jest.mock("@expo/vector-icons/MaterialIcons", () => "MaterialIcons");

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

jest.mock("../../context/ThemeContext", () => ({
  useTheme: () => ({
    theme: "light",
    isDark: false,
    colors: {
      primary: "#1676D2",
      background: "#EEF3FA",
      surfaceContainerLowest: "#FFFFFF",
      surfaceContainerLow: "#f1f4f8",
      surfaceContainer: "#ebeef2",
      surfaceContainerHigh: "#e3e8ef",
      onSurface: "#181c1f",
      onSurfaceVariant: "#43474e",
      outlineVariant: "#c0c7d4",
      primaryContainer: "#0576d2",
      error: "#BA1A1A",
      shadowBlue: "rgba(0,93,168,0.06)",
    },
  }),
}));

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
}));

jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  return {
    SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  };
});

jest.mock("expo-linear-gradient", () => {
  const React = require("react");
  return {
    LinearGradient: ({ children, style }: any) => React.createElement("View", { style }, children),
  };
});

jest.mock("../../components/AnimatedTopPill", () => {
  const React = require("react");
  return ({ title, subtitle }: any) =>
    React.createElement(
      "View",
      { testID: "animated-top-pill" },
      React.createElement("Text", null, title),
      subtitle ? React.createElement("Text", null, subtitle) : null
    );
});

// ─── ViewModel mock ───

const mockHandleTabChange = jest.fn();
const mockSetSearchQuery = jest.fn();
const mockHandleRefresh = jest.fn();
const mockHandleAceptarSolicitud = jest.fn();
const mockHandleRechazarSolicitud = jest.fn();
const mockHandleEliminarContacto = jest.fn();
const mockHandleEnviarSolicitud = jest.fn();
const mockHandleSelectContacto = jest.fn();
const mockSetSolicitudesSubTab = jest.fn();

const defaultVm = {
  activeTab: "contactos" as const,
  searchQuery: "",
  isLoading: false,
  isRefreshing: false,
  error: null,
  selectedContacto: null,
  solicitudesSubTab: "recibidas" as const,
  contactos: [
    {
      id: 1,
      usuarioId: "u1",
      nombre: "María",
      apellidos: "Hernández",
      email: "maria@test.com",
      materia: "Investigación Académica",
      estado: "aceptada",
      enLinea: true,
      fechaConexion: "2025-01-01",
      fechaModificacion: "2025-01-01",
    },
    {
      id: 2,
      usuarioId: "u2",
      nombre: "José",
      apellidos: "Ramírez",
      email: "jose@test.com",
      materia: "Ciencias Aplicadas",
      estado: "aceptada",
      enLinea: true,
      fechaConexion: "2025-01-01",
      fechaModificacion: "2025-01-01",
    },
  ],
  solicitudesRecibidas: [
    {
      id: 100,
      deUsuarioId: "u3",
      deUsuarioNombre: "Roberto González",
      deUsuarioMateria: "Matemáticas",
      paraUsuarioId: "u1",
      mensaje: "Hola, quiero colaborar",
      estado: "pendiente",
      fechaCreacion: "2025-02-01",
      fechaModificacion: "2025-02-01",
    },
  ],
  solicitudesEnviadas: [],
  stats: { totalContactos: 2, totalGrupos: 0, pendientes: 1 },
  userId: "u1",
  userName: "Test User",
  isGuest: false,
  handleTabChange: mockHandleTabChange,
  setSearchQuery: mockSetSearchQuery,
  handleRefresh: mockHandleRefresh,
  handleAceptarSolicitud: mockHandleAceptarSolicitud,
  handleRechazarSolicitud: mockHandleRechazarSolicitud,
  handleEliminarContacto: mockHandleEliminarContacto,
  handleEnviarSolicitud: mockHandleEnviarSolicitud,
  handleSelectContacto: mockHandleSelectContacto,
  setSolicitudesSubTab: mockSetSolicitudesSubTab,
};

let mockCurrentVm = { ...defaultVm };

jest.mock("../../hooks/useSocialViewModel", () => ({
  useSocialViewModel: () => mockCurrentVm,
}));

describe("SocialScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentVm = { ...defaultVm };
  });

  it("renderiza el header 'Social'", () => {
    const { getByText } = render(<SocialScreen />);
    expect(getByText("Social")).toBeTruthy();
  });

  it("renderiza las 3 tabs", () => {
    const { getByText } = render(<SocialScreen />);
    expect(getByText("Contactos")).toBeTruthy();
    expect(getByText("Solicitudes")).toBeTruthy();
    expect(getByText("Buscar")).toBeTruthy();
  });

  it("renderiza stats row con valores correctos", () => {
    const { getByText } = render(<SocialScreen />);
    expect(getByText("2 Contactos")).toBeTruthy();
    expect(getByText("1 Pendientes")).toBeTruthy();
    expect(getByText("0 Mensajes")).toBeTruthy();
  });

  it("renderiza contactos en la tab Contactos", () => {
    const { getByText } = render(<SocialScreen />);
    expect(getByText("MIS CONTACTOS")).toBeTruthy();
    expect(getByText("María Hernández")).toBeTruthy();
    expect(getByText("José Ramírez")).toBeTruthy();
    expect(getByText("Investigación Académica")).toBeTruthy();
  });

  it("cambia de tab al presionar Solicitudes", () => {
    const { getByText } = render(<SocialScreen />);
    fireEvent.press(getByText("Solicitudes"));
    expect(mockHandleTabChange).toHaveBeenCalledWith("solicitudes");
  });

  it("cambia de tab al presionar Buscar", () => {
    const { getByText } = render(<SocialScreen />);
    fireEvent.press(getByText("Buscar"));
    expect(mockHandleTabChange).toHaveBeenCalledWith("buscar");
  });

  it("renderiza solicitudes recibidas en tab Solicitudes", () => {
    mockCurrentVm = {
      ...defaultVm,
      activeTab: "solicitudes",
    };
    const { getByText } = render(<SocialScreen />);
    expect(getByText("Recibidas")).toBeTruthy();
    expect(getByText("Enviadas")).toBeTruthy();
    expect(getByText("Roberto González")).toBeTruthy();
    expect(getByText("Hola, quiero colaborar")).toBeTruthy();
    expect(getByText("Aceptar")).toBeTruthy();
    expect(getByText("Rechazar")).toBeTruthy();
  });

  it("llama aceptarSolicitud al presionar Aceptar", () => {
    mockCurrentVm = {
      ...defaultVm,
      activeTab: "solicitudes",
    };
    const { getByText } = render(<SocialScreen />);
    fireEvent.press(getByText("Aceptar"));
    expect(mockHandleAceptarSolicitud).toHaveBeenCalledWith(100);
  });

  it("llama rechazarSolicitud al presionar Rechazar", () => {
    mockCurrentVm = {
      ...defaultVm,
      activeTab: "solicitudes",
    };
    const { getByText } = render(<SocialScreen />);
    fireEvent.press(getByText("Rechazar"));
    expect(mockHandleRechazarSolicitud).toHaveBeenCalledWith(100);
  });

  it("renderiza búsqueda con search bar en tab Buscar", () => {
    mockCurrentVm = { ...defaultVm, activeTab: "buscar" };
    const { getByPlaceholderText } = render(<SocialScreen />);
    expect(getByPlaceholderText("Buscar por nombre, email o escuela...")).toBeTruthy();
  });

  it("renderiza filter chips en tab Buscar", () => {
    mockCurrentVm = { ...defaultVm, activeTab: "buscar" };
    const { getByText } = render(<SocialScreen />);
    expect(getByText("Todos")).toBeTruthy();
    expect(getByText("Primaria")).toBeTruthy();
    expect(getByText("Secundaria")).toBeTruthy();
    expect(getByText("Preparatoria")).toBeTruthy();
    expect(getByText("Universidad")).toBeTruthy();
  });

  it("muestra estado vacío cuando no hay contactos", () => {
    mockCurrentVm = {
      ...defaultVm,
      contactos: [],
      stats: { totalContactos: 0, totalGrupos: 0, pendientes: 0 },
    };
    const { getByText } = render(<SocialScreen />);
    expect(getByText("Aún no tienes contactos")).toBeTruthy();
  });

  it("muestra estado vacío de solicitudes", () => {
    mockCurrentVm = {
      ...defaultVm,
      activeTab: "solicitudes",
      solicitudesRecibidas: [],
    };
    const { getByText } = render(<SocialScreen />);
    expect(getByText("Sin solicitudes pendientes")).toBeTruthy();
  });

  it("muestra skeleton de carga", () => {
    mockCurrentVm = { ...defaultVm, isLoading: true };
    const { queryByText, toJSON } = render(<SocialScreen />);
    // Skeleton loading has no text - just placeholder shapes
    expect(queryByText("Cargando...")).toBeNull();
    expect(toJSON()).toBeTruthy();
  });

  it("renderiza sub-tabs Recibidas/Enviadas con badge", () => {
    mockCurrentVm = { ...defaultVm, activeTab: "solicitudes" };
    const { getByText } = render(<SocialScreen />);
    expect(getByText("Recibidas")).toBeTruthy();
    expect(getByText("Enviadas")).toBeTruthy();
  });

  it("cambia sub-tab de solicitudes al presionar Enviadas", () => {
    mockCurrentVm = { ...defaultVm, activeTab: "solicitudes" };
    const { getByText } = render(<SocialScreen />);
    fireEvent.press(getByText("Enviadas"));
    expect(mockSetSolicitudesSubTab).toHaveBeenCalledWith("enviadas");
  });
});
