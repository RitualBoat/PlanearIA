import { NivelAcademico } from "../../../types/planeacionV2";
import { sugerirActividades, mejorarTexto } from "../../services/copilotoService";
import { buildPlaneacionDocumentoBase } from "../../utils/createPlaneacionDocumentoBase";
import { apiRequest } from "../../utils/apiClient";
import { isAPIConfigured } from "../../sync/config/apiConfig";

jest.mock("../../utils/apiClient", () => ({
  apiRequest: jest.fn(),
}));

jest.mock("../../sync/config/apiConfig", () => ({
  isAPIConfigured: jest.fn(),
}));

const buildDoc = () =>
  buildPlaneacionDocumentoBase({
    nivelAcademico: NivelAcademico.SECUNDARIA,
    userId: "user-test",
    asignatura: "Matematicas",
    grado: "3",
  });

describe("copilotoService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("uses local heuristic fallback when API is not configured", async () => {
    (isAPIConfigured as jest.Mock).mockReturnValue(false);

    const response = await sugerirActividades(buildDoc());

    expect(apiRequest).not.toHaveBeenCalled();
    expect(response.provider).toBe("heuristic_fallback");
    expect(response.resultado.actividades.inicio).toContain("Activar saberes previos");
  });

  it("falls back locally when backend returns non JSON text", async () => {
    (isAPIConfigured as jest.Mock).mockReturnValue(true);
    (apiRequest as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "The backend returned an HTML error page",
    });

    const response = await mejorarTexto(buildDoc(), "Resolver ecuaciones", "curricular");

    expect(apiRequest).toHaveBeenCalledTimes(2);
    expect(response.provider).toBe("heuristic_fallback");
    expect(response.resultado.textoMejorado).toContain("Version mejorada");
  });
});
