import {
  buildGrupoExportHtml,
  buildGrupoExportRows,
  buildGrupoWorkbook,
} from "../../services/grupoExportService";

describe("grupoExportService", () => {
  const data = {
    grupo: {
      id: 7,
      nombre: "3A <Sec>",
      materia: "Matemáticas",
      carrera: "ISC" as const,
      semestre: 3,
      periodo: "Enero-Junio 2026",
      cantidadAlumnos: 2,
      horario: "Lun-Mie 7:00-9:00",
      estado: "activo" as const,
    },
    alumnos: [
      {
        id: 1,
        nombre: "Ana",
        apellidos: "López",
        numeroControl: "A001",
        grupoId: 7,
        carrera: "ISC" as const,
        email: "ana@example.com",
        fechaIngreso: new Date("2026-01-01T00:00:00.000Z"),
        estado: "activo" as const,
      },
      {
        id: 2,
        nombre: "Luis",
        apellidos: "Pérez",
        numeroControl: "A002",
        grupoId: 7,
        carrera: "ISC" as const,
        fechaIngreso: new Date("2026-01-01T00:00:00.000Z"),
        estado: "inactivo" as const,
      },
    ],
  };

  it("construye filas de alumnos para exportación", () => {
    const rows = buildGrupoExportRows(data);

    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual(
      expect.objectContaining({
        No: 1,
        Nombre: "Ana López",
        NumeroControl: "A001",
        Grupo: "3A <Sec>",
      })
    );
  });

  it("genera workbook con hojas Grupo y Alumnos", () => {
    const workbook = buildGrupoWorkbook(data);

    expect(workbook.SheetNames).toEqual(["Grupo", "Alumnos"]);
    expect(workbook.Sheets.Grupo).toBeDefined();
    expect(workbook.Sheets.Alumnos).toBeDefined();
  });

  it("genera HTML escapando caracteres peligrosos", () => {
    const html = buildGrupoExportHtml(data);

    expect(html).toContain("Exportación de Grupo");
    expect(html).toContain("3A &lt;Sec&gt;");
    expect(html).toContain("Ana López");
    expect(html).not.toContain("3A <Sec>");
  });
});
