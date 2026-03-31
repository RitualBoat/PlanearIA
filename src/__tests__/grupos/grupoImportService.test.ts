import {
  buildGrupoFromDraft,
  mapRawRowToDraft,
  validateImportDraft,
} from "../../services/grupoImportService";

describe("grupoImportService", () => {
  it("mapea columnas conocidas a draft", () => {
    const draft = mapRawRowToDraft({
      Nombre: "3A Secundaria",
      Materia: "Matemáticas",
      Carrera: "ISC",
      Semestre: "3",
      Periodo: "Enero-Junio 2026",
      CantidadAlumnos: "28",
    });

    expect(draft.nombre).toBe("3A Secundaria");
    expect(draft.materia).toBe("Matemáticas");
    expect(draft.carrera).toBe("ISC");
    expect(draft.semestre).toBe("3");
    expect(draft.periodo).toBe("Enero-Junio 2026");
    expect(draft.cantidadAlumnos).toBe("28");
  });

  it("valida draft invalido", () => {
    const errors = validateImportDraft({
      nombre: "",
      materia: "",
      carrera: "Biologia",
      semestre: "0",
      periodo: "",
      cantidadAlumnos: "",
    });

    expect(errors).toContain("Nombre de grupo requerido");
    expect(errors).toContain("Materia requerida");
    expect(errors).toContain("Carrera inválida");
    expect(errors).toContain("Semestre inválido");
  });

  it("construye grupo con defaults correctos", () => {
    const grupo = buildGrupoFromDraft(
      {
        nombre: "3A Secundaria",
        materia: "Matemáticas",
        carrera: "sistemas",
        semestre: "2",
        periodo: "",
        cantidadAlumnos: "30",
      },
      101
    );

    expect(grupo.id).toBe(101);
    expect(grupo.nombre).toBe("3A Secundaria");
    expect(grupo.carrera).toBe("ISC");
    expect(grupo.periodo).toBe("Enero-Junio 2026");
    expect(grupo.cantidadAlumnos).toBe(30);
    expect(grupo.estado).toBe("activo");
  });
});
