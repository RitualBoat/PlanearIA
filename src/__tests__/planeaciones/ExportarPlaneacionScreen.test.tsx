import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import ExportarPlaneacionScreen from "../../screens/planeaciones/ExportarPlaneacionScreen";

const mockGoBack = jest.fn();
const mockNavigate = jest.fn();

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
    navigate: mockNavigate,
  }),
  useRoute: () => ({
    params: { planeacionId: "p1" },
  }),
}));

jest.mock("../../sync/providers/SyncProvider", () => ({
  usePlaneaciones: () => ({
    planeaciones: [
      {
        id: "p1",
        asignatura: "Matemáticas",
        grado: "3° Secundaria",
        grupo: "Grupo B",
        temaSesion: "Ecuaciones Cuadráticas",
      },
    ],
    obtenerPlaneacion: () => ({
      id: "p1",
      asignatura: "Matemáticas",
      grado: "3° Secundaria",
      grupo: "Grupo B",
      temaSesion: "Ecuaciones Cuadráticas",
    }),
  }),
}));

jest.mock("@expo/vector-icons/MaterialIcons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return ({ name }: { name: string }) => <Text>{name}</Text>;
});

describe("ExportarPlaneacionScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza secciones principales", () => {
    const { getByText } = render(<ExportarPlaneacionScreen />);

    expect(getByText("Exportar Planeación")).toBeTruthy();
    expect(getByText("Seleccionar formato")).toBeTruthy();
    expect(getByText("Opciones de contenido")).toBeTruthy();
    expect(getByText("Vista previa")).toBeTruthy();
    expect(getByText("Exportar")).toBeTruthy();
    expect(getByText("Compartir")).toBeTruthy();
  });

  it("muestra flujo visual de generación y éxito", async () => {
    const { getByText, queryByText } = render(<ExportarPlaneacionScreen />);

    fireEvent.press(getByText("Exportar"));

    expect(getByText("Generando archivo...")).toBeTruthy();

    await waitFor(() => {
      expect(queryByText("Generando archivo...")).toBeNull();
      expect(getByText("¡Planeación exportada!")).toBeTruthy();
    }, {
      timeout: 3000,
    });
  });
});
