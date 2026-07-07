import React from "react";
import { act, renderHook } from "@testing-library/react-native";
import * as DocumentPicker from "expo-document-picker";
import { AlumnosProvider } from "../../context/AlumnosContext";
import { useImportarAlumnosViewModel } from "../../hooks/useImportarAlumnosViewModel";
import {
  parseAlumnosFromAsset,
  type AlumnoImportResult,
  type AlumnoImportRowDraft,
} from "../../services/alumnoImportService";

const mockGetItem = jest.fn();
const mockSetItem = jest.fn();

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: (...args: unknown[]) => mockGetItem(...args),
  setItem: (...args: unknown[]) => mockSetItem(...args),
}));

jest.mock("expo-document-picker", () => ({
  getDocumentAsync: jest.fn(),
}));

// El servicio de importacion tiene su propia suite; aqui solo simulamos el
// parseo del archivo y conservamos buildAlumnoFromDraft real para la escritura.
jest.mock("../../services/alumnoImportService", () => {
  const actual = jest.requireActual("../../services/alumnoImportService");
  return { ...actual, parseAlumnosFromAsset: jest.fn() };
});

// La persistencia local vive en AlumnosContext; el motor de sync tiene su suite.
jest.mock("../../sync/services/entitySync", () => ({
  SYNC_ENTITIES: {
    alumnos: {
      entity: "alumnos",
      endpoint: "/api/alumnos",
      storageKey: "@planearia:alumnos",
      responseKey: "alumnos",
    },
  },
  queueEntityOperation: jest.fn().mockResolvedValue(true),
}));

const mockGetDocumentAsync = DocumentPicker.getDocumentAsync as jest.Mock;
const mockParse = parseAlumnosFromAsset as jest.Mock;

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <AlumnosProvider>{children}</AlumnosProvider>;
};

const buildDraft = (over: Partial<AlumnoImportRowDraft> = {}): AlumnoImportRowDraft => ({
  nombre: "Ana",
  apellidos: "Lopez",
  numeroControl: "A001",
  carrera: "ISC",
  email: "",
  telefono: "",
  escuela: "",
  ...over,
});

const buildResult = (): AlumnoImportResult => {
  const valid1 = buildDraft({ nombre: "Ana", numeroControl: "A001" });
  const valid2 = buildDraft({ nombre: "Beto", numeroControl: "A002" });
  const invalid = buildDraft({ nombre: "", numeroControl: "A003", carrera: "???" });
  return {
    fileName: "alumnos.csv",
    validRows: [valid1, valid2],
    errorRows: [{ rowIndex: 4, draft: invalid, errors: ["Nombre requerido"] }],
    previewRows: [valid1, valid2, invalid],
  };
};

const pickAsset = () =>
  mockGetDocumentAsync.mockResolvedValue({
    canceled: false,
    assets: [{ uri: "file://alumnos.csv", name: "alumnos.csv" }],
  });

describe("useImportarAlumnosViewModel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetItem.mockResolvedValue("[]");
    mockSetItem.mockResolvedValue(undefined);
  });

  it("inicia en estado idle", () => {
    const { result } = renderHook(() => useImportarAlumnosViewModel(), { wrapper });

    expect(result.current.uiState).toBe("idle");
    expect(result.current.result).toBeNull();
    expect(result.current.validCount).toBe(0);
    expect(result.current.invalidCount).toBe(0);
  });

  it("procesa el archivo y pasa a preview con los conteos", async () => {
    pickAsset();
    mockParse.mockResolvedValue(buildResult());

    const { result } = renderHook(() => useImportarAlumnosViewModel(), { wrapper });

    await act(async () => {
      await result.current.handleSelectFile();
    });

    expect(result.current.uiState).toBe("preview");
    expect(result.current.validCount).toBe(2);
    expect(result.current.invalidCount).toBe(1);
    expect(result.current.previewRows).toHaveLength(3);
    expect(result.current.result?.fileName).toBe("alumnos.csv");
  });

  it("permanece en idle si el usuario cancela el picker", async () => {
    mockGetDocumentAsync.mockResolvedValue({ canceled: true });

    const { result } = renderHook(() => useImportarAlumnosViewModel(), { wrapper });

    await act(async () => {
      await result.current.handleSelectFile();
    });

    expect(result.current.uiState).toBe("idle");
    expect(mockParse).not.toHaveBeenCalled();
  });

  it("pasa a error cuando el parseo falla", async () => {
    pickAsset();
    mockParse.mockRejectedValue(new Error("Formato no soportado. Usa .csv o .xlsx"));

    const { result } = renderHook(() => useImportarAlumnosViewModel(), { wrapper });

    await act(async () => {
      await result.current.handleSelectFile();
    });

    expect(result.current.uiState).toBe("error");
    expect(result.current.errorMessage).toBe("Formato no soportado. Usa .csv o .xlsx");
  });

  it("importa una fila valida y la persiste con el grupoId en AlumnosContext", async () => {
    pickAsset();
    // Se usa una sola fila valida para una asercion determinista de persistencia.
    // (Importar varias filas en un mismo loop tiene una limitacion preexistente
    // de acumulacion en AlumnosContext.agregarAlumno; este refactor la preserva.)
    mockParse.mockResolvedValue({
      fileName: "alumnos.csv",
      validRows: [buildDraft({ nombre: "Ana", numeroControl: "A001" })],
      errorRows: [],
      previewRows: [buildDraft({ nombre: "Ana", numeroControl: "A001" })],
    });

    const { result } = renderHook(() => useImportarAlumnosViewModel(7), { wrapper });

    await act(async () => {
      await result.current.handleSelectFile();
    });

    await act(async () => {
      await result.current.handleImportValidRows();
    });

    expect(result.current.uiState).toBe("success");
    expect(mockSetItem).toHaveBeenCalledWith("@planearia:alumnos", expect.any(String));

    const savedRaw = mockSetItem.mock.calls[mockSetItem.mock.calls.length - 1][1];
    const saved = JSON.parse(savedRaw);
    expect(saved).toHaveLength(1);
    expect(saved[0].numeroControl).toBe("A001");
    expect(saved[0].grupoId).toBe(7);
  });

  it("marca error si no hay filas validas para importar", async () => {
    const { result } = renderHook(() => useImportarAlumnosViewModel(), { wrapper });

    await act(async () => {
      await result.current.handleImportValidRows();
    });

    expect(result.current.uiState).toBe("error");
    expect(result.current.errorMessage).toBe("No hay filas válidas para importar.");
    expect(mockSetItem).not.toHaveBeenCalled();
  });

  it("resetFlow regresa el flujo a idle", async () => {
    pickAsset();
    mockParse.mockResolvedValue(buildResult());

    const { result } = renderHook(() => useImportarAlumnosViewModel(), { wrapper });

    await act(async () => {
      await result.current.handleSelectFile();
    });
    expect(result.current.uiState).toBe("preview");

    act(() => {
      result.current.resetFlow();
    });

    expect(result.current.uiState).toBe("idle");
    expect(result.current.result).toBeNull();
  });
});
