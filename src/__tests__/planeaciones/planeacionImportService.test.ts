import { buildPlaneacionFromImportDraft } from "../../services/planeacionImportService";
import { NivelAcademico } from "../../../types/planeacion";

describe("planeacionImportService", () => {
  it("mapea un draft importado a una planeación válida", () => {
    const draft = {
      asignatura: "Historia",
      grado: "2°",
      grupo: "A",
      unidadTematica: "Revolución Mexicana",
      temaSesion: "Causas y consecuencias",
      aprendizajesEsperados: ["Analiza hechos históricos"],
      actividades: [
        { tipo: "inicio" as const, descripcion: "Línea del tiempo", duracion: 10 },
        { tipo: "desarrollo" as const, descripcion: "Análisis de fuentes", duracion: 30 },
        { tipo: "cierre" as const, descripcion: "Conclusiones", duracion: 10 },
      ],
      recursos: ["Libro", "Proyector"],
      evaluacion: "Rúbrica",
      evidencias: ["Mapa conceptual"],
      observaciones: "",
      sourceTextLength: 600,
    };

    const planeacion = buildPlaneacionFromImportDraft(draft, "historia_2a.docx");

    expect(planeacion.nivelAcademico).toBe(NivelAcademico.SECUNDARIA);
    expect(planeacion.asignatura).toBe("Historia");
    expect(planeacion.temaSesion).toBe("Causas y consecuencias");
    expect(planeacion.actividades).toHaveLength(3);
    expect(planeacion.duracionTotal).toBe(50);
    expect(planeacion.id).toBeTruthy();
  });
});
