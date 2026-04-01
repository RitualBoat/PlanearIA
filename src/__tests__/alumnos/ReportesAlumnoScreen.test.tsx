import React from "react";
import { fireEvent, render } from "@testing-library/react-native";

const mockSetPeriodo = jest.fn();
const mockRecargar = jest.fn();
const mockGoBack = jest.fn();
const mockExportar = jest.fn().mockResolvedValue(true);

jest.mock("../../components/WebScrollView", () => {
  const React = require("react");
  const { ScrollView } = require("react-native");
  return ({ children }: { children: React.ReactNode }) => <ScrollView>{children}</ScrollView>;
});

jest.mock("react-native-chart-kit", () => ({
  LineChart: () => null,
  ProgressChart: () => null,
}));

jest.mock("@expo/vector-icons/MaterialIcons", () => {
  const React = require("react");
  return () => React.createElement("MaterialIcons");
});

const mockUseReportesAlumnoViewModel = jest.fn();

jest.mock("../../hooks/useReportesAlumnoViewModel", () => ({
  useReportesAlumnoViewModel: () => mockUseReportesAlumnoViewModel(),
}));

const ReportesAlumnoScreen = require("../../screens/alumnos/ReportesAlumnoScreen").default;

describe("ReportesAlumnoScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza estado success con tabla y graficas", () => {
    mockUseReportesAlumnoViewModel.mockReturnValue({
      alumnoNombre: "Juan Perez",
      grupoNombre: "Grupo 4-A",
      periodo: "Mes",
      setPeriodo: mockSetPeriodo,
      estado: "success",
      errorCodigo: "",
      estadisticas: {
        promedioGeneral: 8.8,
        indiceAsistencia: 92,
        indiceEntregasATiempo: 78,
        indiceEntregasTarde: 12,
        indiceNoEntregadas: 10,
        totalCalificaciones: 3,
        totalAsistencias: 10,
        totalEntregasEsperadas: 12,
        totalEntregasRealizadas: 10,
      },
      promedioGrupo: 8.1,
      diferenciaVsGrupo: 0.7,
      serieRendimiento: [70, 75, 80, 88],
      tablaCalificaciones: [
        {
          id: 1,
          periodo: "P1",
          promedio: 8.4,
          estado: "aprobado",
          fechaRegistro: new Date("2026-03-01"),
        },
      ],
      tareasResumen: [
        {
          id: 1,
          titulo: "Matemáticas Avanzadas",
          entregadas: 10,
          esperadas: 12,
          promedio: 9.4,
          estado: "perfecto",
        },
      ],
      recargar: mockRecargar,
      exportarReporte: mockExportar,
      goBack: mockGoBack,
    });

    const { getByText } = render(<ReportesAlumnoScreen />);

    expect(getByText("Estadísticas del alumno")).toBeTruthy();
    expect(getByText("Progreso mensual")).toBeTruthy();
    expect(getByText("Estado de tareas")).toBeTruthy();
    expect(getByText("Liderando el aula")).toBeTruthy();
  });

  it("renderiza estado empty", () => {
    mockUseReportesAlumnoViewModel.mockReturnValue({
      alumnoNombre: "Juan Perez",
      grupoNombre: "Grupo 4-A",
      periodo: "Mes",
      setPeriodo: mockSetPeriodo,
      estado: "empty",
      errorCodigo: "",
      estadisticas: {
        promedioGeneral: 0,
        indiceAsistencia: 0,
        indiceEntregasATiempo: 0,
        indiceEntregasTarde: 0,
        indiceNoEntregadas: 0,
        totalCalificaciones: 0,
        totalAsistencias: 0,
        totalEntregasEsperadas: 0,
        totalEntregasRealizadas: 0,
      },
      promedioGrupo: 0,
      diferenciaVsGrupo: 0,
      serieRendimiento: [0, 0, 0, 0],
      tablaCalificaciones: [],
      tareasResumen: [],
      recargar: mockRecargar,
      exportarReporte: mockExportar,
      goBack: mockGoBack,
    });

    const { getByText } = render(<ReportesAlumnoScreen />);

    expect(getByText("Sin datos registrados")).toBeTruthy();
  });

  it("cambia periodo al tocar chip", () => {
    mockUseReportesAlumnoViewModel.mockReturnValue({
      alumnoNombre: "Juan Perez",
      grupoNombre: "Grupo 4-A",
      periodo: "Mes",
      setPeriodo: mockSetPeriodo,
      estado: "success",
      errorCodigo: "",
      estadisticas: {
        promedioGeneral: 8.8,
        indiceAsistencia: 92,
        indiceEntregasATiempo: 78,
        indiceEntregasTarde: 12,
        indiceNoEntregadas: 10,
        totalCalificaciones: 3,
        totalAsistencias: 10,
        totalEntregasEsperadas: 12,
        totalEntregasRealizadas: 10,
      },
      promedioGrupo: 8.1,
      diferenciaVsGrupo: 0.7,
      serieRendimiento: [70, 75, 80, 88],
      tablaCalificaciones: [],
      tareasResumen: [],
      recargar: mockRecargar,
      exportarReporte: mockExportar,
      goBack: mockGoBack,
    });

    const { getByText } = render(<ReportesAlumnoScreen />);

    fireEvent.press(getByText("Bimestre"));
    expect(mockSetPeriodo).toHaveBeenCalledWith("Bimestre");
  });
});
