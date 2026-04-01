const mockPrintToFileAsync = jest.fn();
const mockIsAvailableAsync = jest.fn();
const mockShareAsync = jest.fn();
const mockWriteAsStringAsync = jest.fn();

jest.mock("react-native", () => ({
  Platform: { OS: "ios" },
}));

jest.mock("expo-print", () => ({
  printToFileAsync: (...args: unknown[]) => mockPrintToFileAsync(...args),
}));

jest.mock("expo-sharing", () => ({
  isAvailableAsync: (...args: unknown[]) => mockIsAvailableAsync(...args),
  shareAsync: (...args: unknown[]) => mockShareAsync(...args),
}));

jest.mock("expo-file-system/legacy", () => ({
  cacheDirectory: "file:///tmp/",
  EncodingType: { UTF8: "utf8" },
  writeAsStringAsync: (...args: unknown[]) => mockWriteAsStringAsync(...args),
}));

import { exportarReporteAlumno } from "../../services/reportesExportService";

describe("reportesExportService (alumno)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrintToFileAsync.mockResolvedValue({ uri: "file:///tmp/reporte.pdf" });
    mockIsAvailableAsync.mockResolvedValue(true);
    mockShareAsync.mockResolvedValue(undefined);
    mockWriteAsStringAsync.mockResolvedValue(undefined);
  });

  it("exporta reporte de alumno en PDF", async () => {
    const ok = await exportarReporteAlumno({
      formato: "pdf",
      alumnoNombre: "Ana Lopez",
      periodo: "Mes",
      estadisticas: {
        promedioGeneral: 9.1,
        indiceAsistencia: 95,
        indiceEntregasATiempo: 80,
        indiceEntregasTarde: 10,
        indiceNoEntregadas: 10,
        totalCalificaciones: 3,
        totalAsistencias: 10,
        totalEntregasEsperadas: 12,
        totalEntregasRealizadas: 10,
      },
      calificaciones: [{ periodo: "P1", promedio: 9.1, estado: "aprobado" }],
    });

    expect(ok).toBe(true);
    expect(mockPrintToFileAsync).toHaveBeenCalled();
    expect(mockShareAsync).toHaveBeenCalledWith(
      "file:///tmp/reporte.pdf",
      expect.objectContaining({
        mimeType: "application/pdf",
      })
    );
  });

  it("exporta reporte de alumno en imagen", async () => {
    const ok = await exportarReporteAlumno({
      formato: "image",
      alumnoNombre: "Ana Lopez",
      periodo: "Mes",
      estadisticas: {
        promedioGeneral: 8.4,
        indiceAsistencia: 90,
        indiceEntregasATiempo: 70,
        indiceEntregasTarde: 20,
        indiceNoEntregadas: 10,
        totalCalificaciones: 2,
        totalAsistencias: 8,
        totalEntregasEsperadas: 10,
        totalEntregasRealizadas: 9,
      },
      calificaciones: [],
    });

    expect(ok).toBe(true);
    expect(mockWriteAsStringAsync).toHaveBeenCalledWith(
      "file:///tmp/reporte_alumno.svg",
      expect.stringContaining("Reporte del Alumno"),
      expect.objectContaining({ encoding: "utf8" })
    );
    expect(mockShareAsync).toHaveBeenCalledWith(
      "file:///tmp/reporte_alumno.svg",
      expect.objectContaining({
        mimeType: "image/svg+xml",
      })
    );
  });
});
