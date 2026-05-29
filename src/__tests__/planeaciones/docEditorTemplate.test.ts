import { NivelAcademico } from "../../../types/planeacionV2";
import { buildPlaneacionDocumentoBase } from "../../utils/createPlaneacionDocumentoBase";
import {
  buildContenidoRawFromDocumento,
  ensureDocumentoContenidoRaw,
} from "../../utils/docEditorTemplate";

describe("docEditorTemplate", () => {
  it("genera contenido base con estructura visible tipo documento", () => {
    const base = buildPlaneacionDocumentoBase({
      nivelAcademico: NivelAcademico.SECUNDARIA,
      userId: "user-1",
      asignatura: "Matematicas",
      grado: "3",
      grupos: ["B"],
    });

    const raw = buildContenidoRawFromDocumento({
      ...base,
      infoInstitucional: {
        ...base.infoInstitucional,
        institucion: "Secundaria Tecnica 1",
        cicloEscolar: "2026-2027",
      },
      elementosCurriculares: {
        ...base.elementosCurriculares,
        proposito: "Resolver problemas con ecuaciones lineales",
        pda: "Representa y resuelve ecuaciones de primer grado",
      },
    });

    expect(raw).toContain("Instrumentacion Didactica");
    expect(raw).toContain("Secundaria Tecnica 1");
    expect(raw).toContain("Matematicas");
    expect(raw).toContain("Representa y resuelve ecuaciones de primer grado");
    expect(raw).toContain('"type":"table"');
    expect(raw).toContain("Indicadores de alcance");
    expect(raw).toContain("Matriz de evaluacion");
    expect(raw).toContain("Sesiones");
  });

  it("inyecta contenidoRaw cuando viene vacio", () => {
    const base = buildPlaneacionDocumentoBase({
      nivelAcademico: NivelAcademico.PRIMARIA,
      userId: "user-2",
    });

    const enriched = ensureDocumentoContenidoRaw({
      ...base,
      contenidoRaw: "",
    });

    expect(enriched.contenidoRaw).toBeTruthy();
    expect(enriched.contenidoRaw).toContain("Instrumentacion Didactica");
    expect(enriched.contenidoRaw).toContain('"type":"table"');
  });

  it("regenera plantillas legacy generadas sin estructura robusta", () => {
    const base = buildPlaneacionDocumentoBase({
      nivelAcademico: NivelAcademico.PRIMARIA,
      userId: "user-3",
    });

    const enriched = ensureDocumentoContenidoRaw({
      ...base,
      contenidoRaw:
        '{"type":"doc","content":[{"type":"heading","content":[{"type":"text","text":"Planeacion"}]},{"type":"paragraph","content":[{"type":"text","text":"Institucion: Escuela Demo"}]},{"type":"heading","content":[{"type":"text","text":"Elementos curriculares"}]}]}',
    });

    expect(enriched.contenidoRaw).toContain("Instrumentacion Didactica");
    expect(enriched.contenidoRaw).toContain('"type":"table"');
    expect(enriched.camposNivel.plantillaVisualVersion).toBe(2);
  });
});
