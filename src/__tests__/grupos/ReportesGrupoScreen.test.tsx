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

const mockUseReportesGrupoViewModel = jest.fn();

jest.mock("../../hooks/useReportesGrupoViewModel", () => ({
  useReportesGrupoViewModel: () => mockUseReportesGrupoViewModel(),
}));

const ReportesGrupoScreen = require("../../screens/grupos/ReportesGrupoScreen").default;

describe("ReportesGrupoScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza estado success con tarjetas y bloques de reporte", () => {
    mockUseReportesGrupoViewModel.mockReturnValue({
      grupoNombre: "3A Secundaria",
      periodo: "Mes",
      setPeriodo: mockSetPeriodo,
      estado: "success",
      errorCodigo: "",
      estadisticas: {
        promedioGeneral: 8.4,
        indiceAprobacion: 92,
        indiceReprobacion: 8,
        indiceAsistencia: 95,
        indiceEntregasATiempo: 75,
        indiceEntregasTarde: 15,
        indiceNoEntregadas: 10,
        totalEsperadas: 100,
      },
      serieTendencia: [68, 70, 74, 76],
      recargar: mockRecargar,
      exportarReporte: mockExportar,
      goBack: mockGoBack,
    });

    const { getByText } = render(<ReportesGrupoScreen />);

    expect(getByText("Reportes del Grupo")).toBeTruthy();
    expect(getByText("Asistencia vs Aprobación")).toBeTruthy();
    expect(getByText("Distribución de Entregas")).toBeTruthy();
    expect(getByText("PROMEDIO GENERAL")).toBeTruthy();
  });

  it("renderiza estado empty y permite cambiar filtros", () => {
    mockUseReportesGrupoViewModel.mockReturnValue({
      grupoNombre: "3A Secundaria",
      periodo: "Mes",
      setPeriodo: mockSetPeriodo,
      estado: "empty",
      errorCodigo: "",
      estadisticas: {
        promedioGeneral: 0,
        indiceAprobacion: 0,
        indiceReprobacion: 0,
        indiceAsistencia: 0,
        indiceEntregasATiempo: 0,
        indiceEntregasTarde: 0,
        indiceNoEntregadas: 0,
        totalEsperadas: 0,
      },
      serieTendencia: [0, 0, 0, 0],
      recargar: mockRecargar,
      exportarReporte: mockExportar,
      goBack: mockGoBack,
    });

    const { getByText } = render(<ReportesGrupoScreen />);

    fireEvent.press(getByText("Cambiar filtros"));
    expect(mockSetPeriodo).toHaveBeenCalledWith("Bimestre");
  });
});
