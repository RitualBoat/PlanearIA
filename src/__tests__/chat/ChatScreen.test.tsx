import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import ChatScreen from "../../screens/chat/ChatScreen";

jest.mock("@expo/vector-icons/MaterialIcons", () => "MaterialIcons");

jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  return {
    SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  };
});

const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn() }),
}));

const mockMensajesContext = {
  conversaciones: [
    {
      id: 1,
      participantes: ["user-ana", "user-maria"],
      contactoId: 10,
      contactoNombre: "María Hernández López",
      contactoColor: "#4A90D9",
      contactoEnLinea: true,
      ultimoMensaje: "¡Hola! Te comparto la planeación de fracciones",
      ultimoMensajeTipo: "texto" as const,
      fechaUltimoMensaje: new Date().toISOString(),
      mensajesNoLeidos: 3,
      fechaCreacion: "2025-01-01T00:00:00.000Z",
      fechaModificacion: new Date().toISOString(),
    },
    {
      id: 2,
      participantes: ["user-ana", "user-jose"],
      contactoId: 20,
      contactoNombre: "José Ramírez Castillo",
      contactoColor: "#E67E22",
      contactoEnLinea: false,
      ultimoMensaje: "Gracias por el material",
      ultimoMensajeTipo: "texto" as const,
      fechaUltimoMensaje: new Date(Date.now() - 86400000).toISOString(),
      mensajesNoLeidos: 0,
      fechaCreacion: "2025-01-01T00:00:00.000Z",
      fechaModificacion: new Date().toISOString(),
    },
    {
      id: 3,
      participantes: ["user-ana", "user-laura"],
      contactoId: 30,
      contactoNombre: "Laura Pérez Morales",
      contactoColor: "#27AE60",
      contactoEnLinea: false,
      ultimoMensaje: "📎 Planeación_Español_S3.pdf",
      ultimoMensajeTipo: "archivo" as const,
      fechaUltimoMensaje: new Date(Date.now() - 3 * 86400000).toISOString(),
      mensajesNoLeidos: 0,
      fechaCreacion: "2025-01-01T00:00:00.000Z",
      fechaModificacion: new Date().toISOString(),
    },
  ],
  mensajes: [],
  isLoading: false,
  error: null,
  eliminarConversacion: jest.fn(),
  refreshMensajes: jest.fn(),
  crearConversacion: jest.fn(),
  getConversacion: jest.fn(),
  getConversacionByContacto: jest.fn(),
  enviarMensaje: jest.fn(),
  getMensajesDeConversacion: jest.fn(() => []),
  marcarComoLeido: jest.fn(),
  reintentarMensaje: jest.fn(),
};

jest.mock("../../context/MensajesContext", () => ({
  useMensajes: () => mockMensajesContext,
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

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

describe("ChatScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza el header con título Mensajes", () => {
    const { getByText } = render(<ChatScreen />);
    expect(getByText("Mensajes")).toBeTruthy();
  });

  it("muestra la lista de conversaciones", () => {
    const { getByText } = render(<ChatScreen />);
    expect(getByText("María Hernández López")).toBeTruthy();
    expect(getByText("José Ramírez Castillo")).toBeTruthy();
    expect(getByText("Laura Pérez Morales")).toBeTruthy();
  });

  it("muestra el badge de no leídos", () => {
    const { getByText } = render(<ChatScreen />);
    expect(getByText("3")).toBeTruthy();
  });

  it("muestra los chips de filtro", () => {
    const { getByText } = render(<ChatScreen />);
    expect(getByText("Todos")).toBeTruthy();
    expect(getByText("No leídos")).toBeTruthy();
    expect(getByText("Con archivos")).toBeTruthy();
  });

  it("filtra por no leídos al presionar el chip", () => {
    const { getByText, queryByText } = render(<ChatScreen />);

    fireEvent.press(getByText("No leídos"));

    // Only María should be visible (has 3 unread)
    expect(getByText("María Hernández López")).toBeTruthy();
    expect(queryByText("José Ramírez Castillo")).toBeNull();
  });

  it("filtra por archivos al presionar el chip", () => {
    const { getByText, queryByText } = render(<ChatScreen />);

    fireEvent.press(getByText("Con archivos"));

    // Only Laura should be visible (has archivo type)
    expect(getByText("Laura Pérez Morales")).toBeTruthy();
    expect(queryByText("María Hernández López")).toBeNull();
  });

  it("navega a la conversación al presionar una", () => {
    const { getByText } = render(<ChatScreen />);

    fireEvent.press(getByText("María Hernández López"));

    expect(mockNavigate).toHaveBeenCalledWith("Conversacion", { conversacionId: 1 });
  });

  it("muestra el campo de búsqueda", () => {
    const { getByPlaceholderText } = render(<ChatScreen />);
    expect(getByPlaceholderText("Buscar conversación...")).toBeTruthy();
  });

  it("filtra conversaciones con la búsqueda", () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<ChatScreen />);

    const searchInput = getByPlaceholderText("Buscar conversación...");
    fireEvent.changeText(searchInput, "María");

    expect(getByText("María Hernández López")).toBeTruthy();
    expect(queryByText("José Ramírez Castillo")).toBeNull();
  });

  it("muestra estado vacío cuando no hay resultados de búsqueda", () => {
    const { getByPlaceholderText, getByText } = render(<ChatScreen />);

    const searchInput = getByPlaceholderText("Buscar conversación...");
    fireEvent.changeText(searchInput, "zzzzz");

    expect(getByText("Sin resultados")).toBeTruthy();
  });
});
