import React from "react";
import { Text } from "react-native";
import { render } from "@testing-library/react-native";
import ListaPlaneacionesScreen from "../../screens/planeaciones/ListaPlaneacionesScreen";

jest.mock("@expo/vector-icons/MaterialIcons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return () => <Text>Icon</Text>;
});

jest.mock("../../components/BottomNavBar", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return () => <Text>BottomNavBar</Text>;
});

jest.mock("../../components/SyncIndicator", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return () => <Text>SyncIndicator</Text>;
});

jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  return {
    SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  };
});

jest.mock("../../hooks/useListaPlaneacionesViewModel", () => ({
  useListaPlaneacionesViewModel: () => ({
    planeaciones: [
      {
        id: "p1",
        nivelAcademico: "primaria",
        asignatura: "Matemáticas",
        grado: "3°",
        grupo: "A",
        temaSesion: "Fracciones",
        fecha: "2024-06-10T00:00:00.000Z",
        horaInicio: "08:00",
        duracionTotal: 50,
      },
      {
        id: "p2",
        nivelAcademico: "secundaria",
        asignatura: "Historia",
        grado: "1°",
        grupo: "B",
        temaSesion: "Independencia",
        fecha: "2024-06-11T00:00:00.000Z",
        horaInicio: "09:00",
        duracionTotal: 60,
      },
    ],
    planeacionesFiltradas: [
      {
        id: "p1",
        nivelAcademico: "primaria",
        asignatura: "Matemáticas",
        grado: "3°",
        grupo: "A",
        temaSesion: "Fracciones",
        fecha: "2024-06-10T00:00:00.000Z",
        horaInicio: "08:00",
        duracionTotal: 50,
      },
      {
        id: "p2",
        nivelAcademico: "secundaria",
        asignatura: "Historia",
        grado: "1°",
        grupo: "B",
        temaSesion: "Independencia",
        fecha: "2024-06-11T00:00:00.000Z",
        horaInicio: "09:00",
        duracionTotal: 60,
      },
    ],
    showFiltros: false,
    menuVisible: null,
    filtroNivel: undefined,
    filtroAsignatura: "",
    filtroGrado: "",
    setShowFiltros: jest.fn(),
    setMenuVisible: jest.fn(),
    setFiltroNivel: jest.fn(),
    setFiltroAsignatura: jest.fn(),
    setFiltroGrado: jest.fn(),
    aplicarFiltros: jest.fn(),
    limpiarFiltros: jest.fn(),
    formatearFecha: jest.fn(() => "10 jun 2024"),
    getColorNivel: jest.fn(() => "#4CAF50"),
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

    expect(getByText("Matemáticas")).toBeTruthy();
    expect(getByText("Historia")).toBeTruthy();
    expect(getByText("Fracciones")).toBeTruthy();
    expect(getByText("Independencia")).toBeTruthy();
  });
});
