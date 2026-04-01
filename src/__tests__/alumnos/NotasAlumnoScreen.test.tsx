import React from "react";
import { fireEvent, render } from "@testing-library/react-native";

const mockGoBack = jest.fn();
const mockSetFiltro = jest.fn();
const mockSetNotaDraft = jest.fn();
const mockGuardarNota = jest.fn().mockResolvedValue(true);
const mockIniciarEdicion = jest.fn();
const mockEliminarNota = jest.fn().mockResolvedValue(undefined);
const mockRecargar = jest.fn().mockResolvedValue(undefined);
const mockCancelarEdicion = jest.fn();

jest.mock("../../components/WebScrollView", () => {
  const React = require("react");
  const { ScrollView } = require("react-native");
  return ({ children }: { children: React.ReactNode }) => <ScrollView>{children}</ScrollView>;
});

jest.mock("@expo/vector-icons/MaterialIcons", () => {
  const React = require("react");
  return () => React.createElement("MaterialIcons");
});

const mockUseNotasAlumnoViewModel = jest.fn();

jest.mock("../../hooks/useNotasAlumnoViewModel", () => ({
  useNotasAlumnoViewModel: () => mockUseNotasAlumnoViewModel(),
}));

const NotasAlumnoScreen = require("../../screens/alumnos/NotasAlumnoScreen").default;

describe("NotasAlumnoScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza estado success con historial", () => {
    mockUseNotasAlumnoViewModel.mockReturnValue({
      alumnoNombre: "Mateo Sánchez",
      grupoNombre: "Grupo 10-A",
      estado: "success",
      errorCodigo: "",
      guardando: false,
      notaDraft: "",
      categoria: "academico",
      filtro: "todas",
      notas: [
        {
          id: 1,
          alumnoId: 10,
          grupoId: 1,
          profesorId: 1,
          comentario: "Mejora significativa en resolución lógica.",
          tipo: "logro",
          privado: true,
          fecha: "2026-03-31T14:30:00.000Z",
          fechaCreacion: "2026-03-31T14:30:00.000Z",
          fechaModificacion: "2026-03-31T14:30:00.000Z",
          fechaDate: new Date("2026-03-31T14:30:00.000Z"),
        },
      ],
      totalNotas: 1,
      notaEnEdicionId: null,
      contador: 0,
      maxCaracteres: 500,
      syncMensaje: "",
      setNotaDraft: mockSetNotaDraft,
      setCategoria: jest.fn(),
      setFiltro: mockSetFiltro,
      guardarNota: mockGuardarNota,
      iniciarEdicion: mockIniciarEdicion,
      cancelarEdicion: mockCancelarEdicion,
      eliminarNota: mockEliminarNota,
      recargar: mockRecargar,
      goBack: mockGoBack,
    });

    const { getByText } = render(<NotasAlumnoScreen />);

    expect(getByText("Nueva Observación")).toBeTruthy();
    expect(getByText("HISTORIAL DE NOTAS")).toBeTruthy();
    expect(getByText("Mejora significativa en resolución lógica.")).toBeTruthy();
  });

  it("renderiza estado empty", () => {
    mockUseNotasAlumnoViewModel.mockReturnValue({
      alumnoNombre: "Mateo Sánchez",
      grupoNombre: "Grupo 10-A",
      estado: "empty",
      errorCodigo: "",
      guardando: false,
      notaDraft: "",
      categoria: "academico",
      filtro: "todas",
      notas: [],
      totalNotas: 0,
      notaEnEdicionId: null,
      contador: 0,
      maxCaracteres: 500,
      syncMensaje: "",
      setNotaDraft: mockSetNotaDraft,
      setCategoria: jest.fn(),
      setFiltro: mockSetFiltro,
      guardarNota: mockGuardarNota,
      iniciarEdicion: mockIniciarEdicion,
      cancelarEdicion: mockCancelarEdicion,
      eliminarNota: mockEliminarNota,
      recargar: mockRecargar,
      goBack: mockGoBack,
    });

    const { getByText } = render(<NotasAlumnoScreen />);

    expect(getByText("Aún no tienes notas para este alumno")).toBeTruthy();
    expect(getByText("Empezar a escribir")).toBeTruthy();
  });

  it("renderiza estado error y permite reintentar", () => {
    mockUseNotasAlumnoViewModel.mockReturnValue({
      alumnoNombre: "Mateo Sánchez",
      grupoNombre: "Grupo 10-A",
      estado: "error",
      errorCodigo: "503_ATELIER_SYNC",
      guardando: false,
      notaDraft: "",
      categoria: "academico",
      filtro: "todas",
      notas: [],
      totalNotas: 0,
      notaEnEdicionId: null,
      contador: 0,
      maxCaracteres: 500,
      syncMensaje: "",
      setNotaDraft: mockSetNotaDraft,
      setCategoria: jest.fn(),
      setFiltro: mockSetFiltro,
      guardarNota: mockGuardarNota,
      iniciarEdicion: mockIniciarEdicion,
      cancelarEdicion: mockCancelarEdicion,
      eliminarNota: mockEliminarNota,
      recargar: mockRecargar,
      goBack: mockGoBack,
    });

    const { getByText } = render(<NotasAlumnoScreen />);

    fireEvent.press(getByText("Reintentar"));
    expect(mockRecargar).toHaveBeenCalled();
    expect(getByText("CÓDIGO DE ERROR: 503_ATELIER_SYNC")).toBeTruthy();
  });
});
