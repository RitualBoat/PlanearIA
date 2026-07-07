jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock("../../sync/config/apiConfig", () => ({
  isAPIConfigured: jest.fn(),
}));

jest.mock("../../utils/apiClient", () => ({
  apiRequest: jest.fn(),
}));

jest.mock("../../services/pdfTextExtractor", () => ({
  extractTextFromPdf: jest.fn(),
}));

import {
  buildPlaneacionFromImportDraft,
  extractRawTextFromImportedFile,
  scanPlantillaFromRawText,
} from "../../services/planeacionImportService";
import { apiRequest } from "../../utils/apiClient";
import { isAPIConfigured } from "../../sync/config/apiConfig";
import { extractTextFromPdf } from "../../services/pdfTextExtractor";
import { NivelAcademico } from "../../../types/planeacionV2";

describe("planeacionImportService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("extrae texto de PDF usando el extractor dedicado", async () => {
    const arrayBuffer = new ArrayBuffer(8);
    (global as typeof globalThis & { fetch: jest.Mock }).fetch = jest.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => arrayBuffer,
    });
    (extractTextFromPdf as jest.Mock).mockResolvedValue(
      "Asignatura: Matematicas\nTema: Fracciones\nPrimaria"
    );

    const result = await extractRawTextFromImportedFile({
      name: "planeacion_fracciones.pdf",
      uri: "file://planeacion_fracciones.pdf",
    } as any);

    expect(extractTextFromPdf).toHaveBeenCalledWith(arrayBuffer);
    expect(result.extension).toBe("pdf");
    expect(result.rawText).toContain("Matematicas");
    expect(result.fallbackSubject).toBe("planeacion fracciones");
  });

  it("mapea un draft importado a un PlaneacionDocumento V2 valido", () => {
    const draft = {
      asignatura: "Historia",
      grado: "2",
      grupo: "A",
      unidadTematica: "Revolucion Mexicana",
      temaSesion: "Causas y consecuencias",
      aprendizajesEsperados: ["Analiza hechos historicos"],
      actividades: [
        { tipo: "inicio" as const, descripcion: "Linea del tiempo", duracion: 10 },
        { tipo: "desarrollo" as const, descripcion: "Analisis de fuentes", duracion: 30 },
        { tipo: "cierre" as const, descripcion: "Conclusiones", duracion: 10 },
      ],
      recursos: ["Libro", "Proyector"],
      evaluacion: "Rubrica",
      evidencias: ["Mapa conceptual"],
      observaciones: "",
      nivelAcademico: NivelAcademico.SECUNDARIA,
      sourceTextLength: 600,
    };

    const planeacion = buildPlaneacionFromImportDraft(draft, "historia_2a.docx");

    expect(planeacion.nivelAcademico).toBe(NivelAcademico.SECUNDARIA);
    expect(planeacion.datosGenerales.asignatura).toBe("Historia");
    expect(planeacion.datosGenerales.grado).toBe("2");
    expect(planeacion.datosGenerales.grupos).toEqual(["A"]);
    expect(planeacion.elementosCurriculares.pda).toBe("Causas y consecuencias");
    expect(planeacion.sesiones).toHaveLength(1);
    expect(planeacion.camposNivel?.duracionTotal).toBe(50);
    expect(planeacion.evaluacionFinal?.criterios[0]?.descripcion).toBe("Rubrica");
    expect(planeacion.id).toBeTruthy();
  });

  it("escanea plantilla con fallback local si no hay backend IA configurado", async () => {
    (isAPIConfigured as jest.Mock).mockReturnValue(false);

    const plantilla = await scanPlantillaFromRawText(
      "Tecnologico Nacional de Mexico\nInstrumentacion Didactica\nDatos generales\nEvaluacion\nFirmas",
      { nivelAcademico: NivelAcademico.UNIVERSIDAD, userId: "user-test" }
    );

    expect(apiRequest).not.toHaveBeenCalled();
    expect(plantilla.origen).toBe("escaner");
    expect(plantilla.nivelAcademico).toBe(NivelAcademico.UNIVERSIDAD);
    expect(plantilla.secciones.some((section) => section.tipo === "evaluacion")).toBe(true);
    expect(plantilla.descripcion).toContain("reglas locales");
  });

  it("escanea plantilla con fallback local cuando el backend responde texto no JSON", async () => {
    (isAPIConfigured as jest.Mock).mockReturnValue(true);
    (apiRequest as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "The backend returned an HTML error page",
    });

    const plantilla = await scanPlantillaFromRawText(
      "Subdireccion Academica\nInstrumentacion Didactica para Competencias Profesionales\nPeriodo\nAgosto-diciembre 2022\nNombre de la Asignatura",
      { nivelAcademico: NivelAcademico.UNIVERSIDAD, userId: "user-test" }
    );

    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(plantilla.nombre).toMatch(/Plantilla/);
    expect(plantilla.secciones.length).toBeGreaterThanOrEqual(7);
    expect(plantilla.secciones.map((section) => section.tipo)).toContain("datos_generales");
  });
});
