import { act, renderHook, waitFor } from "@testing-library/react-native";
import { useReportesAlumnoViewModel } from "../../hooks/useReportesAlumnoViewModel";

const mockGetItem = jest.fn();
const mockGoBack = jest.fn();
const mockExportarReporteAlumno = jest.fn().mockResolvedValue(true);

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: (...args: unknown[]) => mockGetItem(...args),
}));

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
  useRoute: () => ({
    params: {
      alumnoId: 10,
      alumnoNombre: "Alumno Mock",
    },
  }),
}));

jest.mock("../../services/reportesExportService", () => ({
  exportarReporteAlumno: (...args: unknown[]) => mockExportarReporteAlumno(...args),
}));

describe("useReportesAlumnoViewModel", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    const date15DaysAgo = new Date(Date.now() - 15 * 86400000).toISOString();
    const date5DaysAgo = new Date(Date.now() - 5 * 86400000).toISOString();
    const date2DaysAgo = new Date(Date.now() - 2 * 86400000).toISOString();
    const date6DaysAgo = new Date(Date.now() - 6 * 86400000).toISOString();

    mockGetItem.mockImplementation((key: string) => {
      if (key === "@planearia:alumnos") {
        return Promise.resolve(
          JSON.stringify([
            {
              id: 10,
              nombre: "Ana",
              apellidos: "Lopez",
              numeroControl: "A010",
              carrera: "ISC",
              grupoId: 7,
              fechaIngreso: "2026-01-01T00:00:00.000Z",
              estado: "activo",
            },
          ])
        );
      }
      if (key === "@planearia:tareas") {
        return Promise.resolve(
          JSON.stringify([
            {
              id: 200,
              titulo: "Tarea 1",
              descripcion: "",
              tipo: "tarea",
              grupoId: 7,
              fechaAsignacion: date15DaysAgo,
              fechaEntrega: date5DaysAgo,
              valor: 20,
              instrucciones: "",
              estado: "asignada",
              calificacionMaxima: 10,
              profesorId: 1,
              permitirEntregaTardia: true,
            },
          ])
        );
      }
      if (key === "@planearia:asistencias") {
        return Promise.resolve(
          JSON.stringify([
            {
              id: 1,
              alumnoId: 10,
              grupoId: 7,
              fecha: date5DaysAgo,
              estado: "presente",
            },
          ])
        );
      }
      if (key === "@planearia:calificaciones") {
        return Promise.resolve(
          JSON.stringify([
            {
              id: 1,
              alumnoId: 10,
              grupoId: 7,
              periodo: "P1",
              promedio: 9.4,
              estado: "aprobado",
              fechaRegistro: date2DaysAgo,
            },
          ])
        );
      }
      if (key === "@planearia:entregas") {
        return Promise.resolve(
          JSON.stringify([
            {
              id: 1,
              tareaId: 200,
              alumnoId: 10,
              fechaEntrega: date6DaysAgo,
              calificada: false,
              estado: "entregada",
              intentos: 1,
            },
          ])
        );
      }
      if (key === "@planearia:entregables") {
        return Promise.resolve("[]");
      }
      return Promise.resolve(null);
    });
  });

  it("carga datos y calcula estado success", async () => {
    const { result } = renderHook(() => useReportesAlumnoViewModel());

    await waitFor(() => {
      expect(result.current.estado).toBe("success");
    });

    expect(result.current.alumnoNombre).toBe("Ana Lopez");
    expect(result.current.estadisticas.promedioGeneral).toBeCloseTo(9.4);
    expect(Math.round(result.current.estadisticas.indiceAsistencia)).toBe(100);
    expect(result.current.tablaCalificaciones).toHaveLength(1);
  });

  it("expone exportarReporte y delega parametros", async () => {
    const { result } = renderHook(() => useReportesAlumnoViewModel());

    await waitFor(() => {
      expect(result.current.estado).toBe("success");
    });

    await act(async () => {
      await result.current.exportarReporte("pdf");
    });

    expect(mockExportarReporteAlumno).toHaveBeenCalledWith(
      expect.objectContaining({
        formato: "pdf",
        alumnoNombre: "Ana Lopez",
        periodo: "Mes",
      })
    );
  });

  it("queda en empty cuando no hay datos del alumno", async () => {
    mockGetItem.mockResolvedValue("[]");

    const { result } = renderHook(() => useReportesAlumnoViewModel());

    await waitFor(() => {
      expect(result.current.estado).toBe("empty");
    });

    expect(result.current.tablaCalificaciones).toHaveLength(0);
  });
});
