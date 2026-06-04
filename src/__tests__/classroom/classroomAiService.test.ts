import { apiRequest } from "../../utils/apiClient";
import { isAPIConfigured } from "../../sync/config/apiConfig";
import {
  generarRubricaClassroom,
  resumirProgresoClassroom,
  sugerirActividadClassroom,
} from "../../services/classroom/classroomAiService";

jest.mock("../../utils/apiClient", () => ({
  apiRequest: jest.fn(),
}));

jest.mock("../../sync/config/apiConfig", () => ({
  isAPIConfigured: jest.fn(),
}));

const contextoBase = {
  grupo: {
    id: 1,
    nombre: "3A",
    materia: "Matematicas",
    periodo: "2026",
  },
  resumen: {
    totalAlumnos: 25,
    totalActividades: 2,
    actividadesPendientes: 1,
    totalMateriales: 3,
    porcentajeAsistencia: 78,
    promedioGrupo: 8.2,
    ultimaActualizacion: "2026-06-04T00:00:00.000Z",
  },
};

describe("classroomAiService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("uses local heuristic fallback when API is not configured", async () => {
    (isAPIConfigured as jest.Mock).mockReturnValue(false);

    const response = await sugerirActividadClassroom(contextoBase);

    expect(apiRequest).not.toHaveBeenCalled();
    expect(response.provider).toBe("heuristic_fallback");
    expect(response.resultado.actividad.titulo).toContain("Matematicas");
  });

  it("returns backend success and keeps dev warning metadata", async () => {
    (isAPIConfigured as jest.Mock).mockReturnValue(true);
    (apiRequest as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          success: true,
          data: {
            provider: "groq",
            model: "llama-test",
            accion: "resumir_progreso",
            usage: {
              limit: 100,
              remaining: 99,
              resetAt: "2026-06-05T00:00:00.000Z",
              mode: "dev",
              warning: "Modo dev IA activo",
            },
            resultado: {
              mensaje: "Resumen generado",
              resumen: "Grupo estable con una alerta de asistencia.",
              hallazgos: [
                {
                  tipo: "riesgo",
                  prioridad: "alta",
                  descripcion: "Asistencia baja.",
                },
              ],
            },
          },
        }),
    });

    const response = await resumirProgresoClassroom(contextoBase);

    expect(apiRequest).toHaveBeenCalledWith("/api/classroom/copiloto", expect.objectContaining({ method: "POST" }));
    expect(response.provider).toBe("groq");
    expect(response.usage?.warning).toBe("Modo dev IA activo");
    expect(response.resultado.hallazgos[0].descripcion).toBe("Asistencia baja.");
  });

  it("falls back locally when backend returns non JSON text", async () => {
    (isAPIConfigured as jest.Mock).mockReturnValue(true);
    (apiRequest as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "<html>Backend error</html>",
    });

    const response = await generarRubricaClassroom(contextoBase);

    expect(apiRequest).toHaveBeenCalledTimes(2);
    expect(response.provider).toBe("heuristic_fallback");
    expect(response.resultado.rubrica.criterios.length).toBeGreaterThan(0);
  });
});
