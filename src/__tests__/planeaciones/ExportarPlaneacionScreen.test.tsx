import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import ExportarPlaneacionScreen from "../../screens/planeaciones/ExportarPlaneacionScreen";
import {
  exportPlaneacionToPdf,
  exportPlaneacionToDocx,
} from "../../services/planeacionExportService";
import * as Sharing from "expo-sharing";

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

jest.mock("../../context/PlaneacionesContext", () => ({
  usePlaneaciones: () => ({
    documentos: [
      {
        id: "p1",
        nivelAcademico: "secundaria",
        datosGenerales: {
          asignatura: "Matematicas",
          grado: "3 Secundaria",
          grupos: ["Grupo B"],
          semanas: [12],
        },
        elementosCurriculares: {
          pda: "Ecuaciones Cuadraticas",
        },
        sesiones: [{ id: "s1" }],
        evaluacionFinal: { criterios: [{ id: "c1" }] },
      },
    ],
    obtenerDocumento: () => ({
      id: "p1",
      nivelAcademico: "secundaria",
      datosGenerales: {
        asignatura: "Matematicas",
        grado: "3 Secundaria",
        grupos: ["Grupo B"],
        semanas: [12],
      },
      elementosCurriculares: {
        pda: "Ecuaciones Cuadraticas",
      },
      sesiones: [{ id: "s1" }],
      evaluacionFinal: { criterios: [{ id: "c1" }] },
    }),
  }),
}));

jest.mock("@expo/vector-icons/MaterialIcons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return ({ name }: { name: string }) => <Text>{name}</Text>;
});

jest.mock("../../services/planeacionExportService", () => ({
  exportPlaneacionToPdf: jest.fn(),
  exportPlaneacionToDocx: jest.fn(),
}));

jest.mock("expo-sharing", () => ({
  isAvailableAsync: jest.fn(),
  shareAsync: jest.fn(),
}));

describe("ExportarPlaneacionScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (exportPlaneacionToPdf as jest.Mock).mockResolvedValue({
      uri: "file://tmp/planeacion.pdf",
      name: "planeacion_matematicas_2026-03-29.pdf",
      sizeBytes: 1_250_000,
    });
    (exportPlaneacionToDocx as jest.Mock).mockResolvedValue({
      uri: "file://tmp/planeacion.docx",
      name: "planeacion_matematicas_2026-03-29.docx",
      sizeBytes: 980_000,
    });
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
    (Sharing.shareAsync as jest.Mock).mockResolvedValue(undefined);
  });

  it("renderiza secciones principales", () => {
    const { getByText } = render(<ExportarPlaneacionScreen />);

    expect(getByText("Exportar PlaneaciÃ³n")).toBeTruthy();
    expect(getByText("Seleccionar formato")).toBeTruthy();
    expect(getByText("Opciones de contenido")).toBeTruthy();
    expect(getByText("Vista previa")).toBeTruthy();
    expect(getByText("Exportar")).toBeTruthy();
    expect(getByText("Compartir")).toBeTruthy();
  });

  it("muestra flujo visual de generaciÃ³n y Ã©xito", async () => {
    const { getByText, queryByText } = render(<ExportarPlaneacionScreen />);

    fireEvent.press(getByText("Exportar"));

    expect(getByText("Generando archivo...")).toBeTruthy();

    await waitFor(
      () => {
        expect(queryByText("Generando archivo...")).toBeNull();
        expect(getByText("Â¡PlaneaciÃ³n exportada!")).toBeTruthy();
      },
      {
        timeout: 3000,
      }
    );

    expect(exportPlaneacionToPdf).toHaveBeenCalled();
  });

  it("exporta en formato Word cuando se selecciona DOCX", async () => {
    const { getByText } = render(<ExportarPlaneacionScreen />);

    fireEvent.press(getByText("Documento Word (.docx)"));
    fireEvent.press(getByText("Exportar"));

    await waitFor(
      () => {
        expect(exportPlaneacionToDocx).toHaveBeenCalled();
        expect(getByText("Â¡PlaneaciÃ³n exportada!")).toBeTruthy();
      },
      { timeout: 3000 }
    );
  });

  it("comparte el archivo generado", async () => {
    const { getByText, getAllByText } = render(<ExportarPlaneacionScreen />);

    fireEvent.press(getByText("Exportar"));

    await waitFor(
      () => {
        expect(getByText("Â¡PlaneaciÃ³n exportada!")).toBeTruthy();
      },
      { timeout: 3000 }
    );

    fireEvent.press(getAllByText("Compartir")[0]);

    await waitFor(() => {
      expect(Sharing.isAvailableAsync).toHaveBeenCalled();
      expect(Sharing.shareAsync).toHaveBeenCalled();
    });
  });
});
