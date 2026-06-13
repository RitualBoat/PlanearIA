import React from "react";
import { Text } from "react-native";
import { render } from "@testing-library/react-native";
import ListaPlaneacionesScreen from "../../screens/planeaciones/ListaPlaneacionesScreen";

jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    MaterialIcons: ({ name }: { name: string }) => <Text>{name}</Text>,
  };
});

jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  return {
    SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  };
});

// Presentational back button uses useNavigation; stub it (no NavigationContainer here)
jest.mock("../../components/ScreenBackButton", () => "ScreenBackButton");

jest.mock("../../context/ThemeContext", () => ({
  useTheme: () => ({
    colors: {
      background: "#fff",
      onSurface: "#111",
      onSurfaceVariant: "#666",
      surfaceContainerLowest: "#fff",
      surfaceContainerLow: "#f5f5f5",
      borderLight: "#ddd",
      shadowBlue: "#000",
      primary: "#2563eb",
      primaryContainer: "#dbeafe",
      textMuted: "#999",
      error: "#dc2626",
      surface: "#fff",
    },
  }),
}));

jest.mock("../../hooks/useListaPlaneacionesViewModel", () => ({
  useListaPlaneacionesViewModel: () => ({
    documentos: [
      {
        id: "p1",
        nivelAcademico: "primaria",
        datosGenerales: {
          asignatura: "Matematicas",
          grado: "3",
          grupos: ["A"],
          semanas: [10],
        },
        fechaModificacion: "2026-05-01T10:00:00.000Z",
      },
      {
        id: "p2",
        nivelAcademico: "secundaria",
        datosGenerales: {
          asignatura: "Historia",
          grado: "1",
          grupos: ["B"],
          semanas: [11],
        },
        fechaModificacion: "2026-05-02T10:00:00.000Z",
      },
    ],
    documentosFiltrados: [
      {
        id: "p1",
        nivelAcademico: "primaria",
        datosGenerales: {
          asignatura: "Matematicas",
          grado: "3",
          grupos: ["A"],
          semanas: [10],
        },
        fechaModificacion: "2026-05-01T10:00:00.000Z",
      },
      {
        id: "p2",
        nivelAcademico: "secundaria",
        datosGenerales: {
          asignatura: "Historia",
          grado: "1",
          grupos: ["B"],
          semanas: [11],
        },
        fechaModificacion: "2026-05-02T10:00:00.000Z",
      },
    ],
    planeaciones: [],
    planeacionesFiltradas: [],
    showFiltros: false,
    menuVisible: null,
    searchQuery: "",
    filtroNivel: undefined,
    filtroAsignatura: "",
    filtroGrado: "",
    filtroFechaInicio: "",
    filtroFechaFin: "",
    syncStatus: "idle",
    pendingCount: 0,
    isOnline: true,
    setShowFiltros: jest.fn(),
    setMenuVisible: jest.fn(),
    setSearchQuery: jest.fn(),
    setFiltroNivel: jest.fn(),
    setFiltroAsignatura: jest.fn(),
    setFiltroGrado: jest.fn(),
    setFiltroFechaInicio: jest.fn(),
    setFiltroFechaFin: jest.fn(),
    aplicarFiltros: jest.fn(),
    limpiarFiltros: jest.fn(),
    formatFecha: jest.fn(() => "10 may 2026"),
    formatearFecha: jest.fn(() => "10 may 2026"),
    getColorNivel: jest.fn(() => "#4caf50"),
    getTextoNivel: jest.fn((nivel) => (nivel === "primaria" ? "Primaria" : "Secundaria")),
    handleEditar: jest.fn(),
    handleClonar: jest.fn(),
    handleEliminar: jest.fn(),
    handleExportar: jest.fn(),
    handleCrearNueva: jest.fn(),
  }),
}));

describe("ListaPlaneacionesScreen", () => {
  it("renderiza lista de planeaciones", () => {
    const { getByText } = render(<ListaPlaneacionesScreen />);

    expect(getByText("Matematicas")).toBeTruthy();
    expect(getByText("Historia")).toBeTruthy();
    expect(getByText("Semanas 10")).toBeTruthy();
    expect(getByText("Semanas 11")).toBeTruthy();
  });
});
