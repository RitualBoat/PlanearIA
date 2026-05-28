import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import ImportarPlaneacionScreen from "../../screens/planeaciones/ImportarPlaneacionScreen";
import * as DocumentPicker from "expo-document-picker";
import {
  buildPlaneacionFromImportDraft,
  parseImportedPlaneacionFile,
} from "../../services/planeacionImportService";

const mockGoBack = jest.fn();
const mockNavigate = jest.fn();
const mockAgregarPlaneacion = jest.fn();
const mockForceSync = jest.fn();

const mockAsset = {
  name: "matematicas_3b.docx",
  mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  uri: "file://tmp/matematicas_3b.docx",
};

const mockImportDraft = {
  asignatura: "Matemáticas",
  grado: "3°",
  grupo: "B",
  unidadTematica: "Ecuaciones",
  temaSesion: "Ecuaciones lineales",
  aprendizajesEsperados: ["Resuelve ecuaciones básicas"],
  actividades: [
    { tipo: "inicio" as const, descripcion: "Activación", duracion: 10 },
    { tipo: "desarrollo" as const, descripcion: "Ejercicios", duracion: 30 },
    { tipo: "cierre" as const, descripcion: "Retro", duracion: 10 },
  ],
  recursos: ["Libro de texto"],
  evaluacion: "Lista de cotejo",
  evidencias: ["Cuaderno"],
  observaciones: "",
  sourceTextLength: 1200,
};

const mockPlaneacion = {
  id: "pl-123",
  nivelAcademico: "secundaria",
  asignatura: "Matemáticas",
  grado: "3°",
  grupo: "B",
  fecha: "2026-03-29T00:00:00.000Z",
  horaInicio: "08:00",
  duracionTotal: 50,
  unidadTematica: "Ecuaciones",
  temaSesion: "Ecuaciones lineales",
  aprendizajesEsperados: ["Resuelve ecuaciones básicas"],
  actividades: mockImportDraft.actividades,
  recursos: ["Libro de texto"],
  evaluacion: "Lista de cotejo",
  evidencias: ["Cuaderno"],
  observaciones: "",
  fechaCreacion: "2026-03-29T00:00:00.000Z",
  fechaModificacion: "2026-03-29T00:00:00.000Z",
  competenciasDisciplinares: [],
};

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
    navigate: mockNavigate,
  }),
}));

jest.mock("../../context/PlaneacionesContext", () => ({
  usePlaneaciones: () => ({
    agregarPlaneacion: mockAgregarPlaneacion,
    forceSync: mockForceSync,
  }),
}));

jest.mock("expo-document-picker", () => ({
  getDocumentAsync: jest.fn(),
}));

jest.mock("../../services/planeacionImportService", () => ({
  parseImportedPlaneacionFile: jest.fn(),
  buildPlaneacionFromImportDraft: jest.fn(),
}));

jest.mock("@expo/vector-icons/MaterialIcons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return () => <Text>Icon</Text>;
});

describe("ImportarPlaneacionScreen", () => {
  const pressSelectFileButton = (getAllByText: (text: string) => any[]) => {
    const selectButtons = getAllByText("Seleccionar archivo");
    fireEvent.press(selectButtons[selectButtons.length - 1]);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [mockAsset],
    });
    (parseImportedPlaneacionFile as jest.Mock).mockResolvedValue(mockImportDraft);
    (buildPlaneacionFromImportDraft as jest.Mock).mockReturnValue(mockPlaneacion);
    mockAgregarPlaneacion.mockResolvedValue(undefined);
    mockForceSync.mockResolvedValue(undefined);
  });

  it("renderiza secciones principales del diseño", () => {
    const { getByText, getAllByText } = render(<ImportarPlaneacionScreen />);

    expect(getByText("Importar Planeación")).toBeTruthy();
    expect(getAllByText("Seleccionar archivo").length).toBeGreaterThan(0);
    expect(getByText("Arrastra o selecciona un archivo")).toBeTruthy();
    expect(getByText("Vista previa")).toBeTruthy();
    expect(getByText("Importar y continuar")).toBeTruthy();
    expect(getByText("Cancelar")).toBeTruthy();
  });

  it("selecciona archivo y muestra datos parseados en la vista previa", async () => {
    const { getAllByText, getByText } = render(<ImportarPlaneacionScreen />);

    pressSelectFileButton(getAllByText);

    await waitFor(() => {
      expect(DocumentPicker.getDocumentAsync).toHaveBeenCalled();
      expect(parseImportedPlaneacionFile).toHaveBeenCalledWith(mockAsset);
    });

    expect(getByText("matematicas_3b.docx")).toBeTruthy();
    expect(getByText("Matemáticas")).toBeTruthy();
    expect(getByText("Ecuaciones lineales")).toBeTruthy();
  });

  it("guarda y sincroniza la planeación importada", async () => {
    const { getAllByText, getByText } = render(<ImportarPlaneacionScreen />);

    pressSelectFileButton(getAllByText);

    await waitFor(() => {
      expect(parseImportedPlaneacionFile).toHaveBeenCalledTimes(1);
    });

    fireEvent.press(getByText("Importar y continuar"));

    await waitFor(() => {
      expect(buildPlaneacionFromImportDraft).toHaveBeenCalledWith(
        mockImportDraft,
        "matematicas_3b.docx"
      );
      expect(mockAgregarPlaneacion).toHaveBeenCalledWith(mockPlaneacion);
      expect(mockForceSync).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("ListaPlaneaciones");
    });
  });
});
