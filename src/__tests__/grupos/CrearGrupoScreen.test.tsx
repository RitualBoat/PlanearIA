import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import CrearGrupoScreen from "../../screens/grupos/CrearGrupoScreen";

jest.mock("@expo/vector-icons/MaterialIcons", () => "MaterialIcons");

const mockHandleCrearGrupo = jest.fn().mockResolvedValue(undefined);
const mockHandleCancelar = jest.fn();
const mockSincronizarGrupos = jest.fn().mockResolvedValue(undefined);

jest.mock("../../hooks/useCrearGrupoViewModel", () => ({
  useCrearGrupoViewModel: () => ({
    modo: "crear",
    nombre: "",
    setNombre: jest.fn(),
    materia: "",
    setMateria: jest.fn(),
    carrera: "ISC",
    setCarrera: jest.fn(),
    semestre: "",
    setSemestre: jest.fn(),
    periodo: "",
    setPeriodo: jest.fn(),
    horario: "",
    setHorario: jest.fn(),
    validationError: "",
    isSaving: false,
    handleCrearGrupo: mockHandleCrearGrupo,
    handleCancelar: mockHandleCancelar,
  }),
}));

jest.mock("../../hooks/useGrupos", () => ({
  useGrupos: () => ({
    syncStatus: "synced",
    pendingSyncCount: 0,
    isOnline: true,
    sincronizarGrupos: mockSincronizarGrupos,
  }),
}));

describe("CrearGrupoScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza el formulario de creación", () => {
    const { getByText, getByPlaceholderText } = render(<CrearGrupoScreen />);

    expect(getByText("Crear Nuevo Grupo")).toBeTruthy();
    expect(getByText("Nombre del Grupo *")).toBeTruthy();
    expect(getByText("Materia *")).toBeTruthy();
    expect(getByPlaceholderText("Ej: Enero-Junio 2024")).toBeTruthy();
    expect(getByText("Crear Grupo")).toBeTruthy();
    expect(getByText("Sincronizado")).toBeTruthy();
  });

  it("ejecuta guardado al presionar crear", () => {
    const { getByText } = render(<CrearGrupoScreen />);

    fireEvent.press(getByText("Crear Grupo"));

    expect(mockHandleCrearGrupo).toHaveBeenCalledTimes(1);
  });
});
