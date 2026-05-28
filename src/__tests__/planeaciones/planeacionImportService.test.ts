jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

import { buildPlaneacionFromImportDraft } from "../../services/planeacionImportService";
import { NivelAcademico } from "../../../types/planeacionV2";

describe("planeacionImportService", () => {
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
});
