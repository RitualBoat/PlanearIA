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

    expect(raw).toContain("Planeacion");
    expect(raw).toContain("Secundaria Tecnica 1");
    expect(raw).toContain("Matematicas");
    expect(raw).toContain("Representa y resuelve ecuaciones de primer grado");
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
    expect(enriched.contenidoRaw).toContain("Planeacion");
  });
});

