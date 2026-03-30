import { buildPlaneacionPdfHtml } from "../../services/planeacionExportService";

describe("planeacionExportService", () => {
  const planeacionBase = {
    id: "p1",
    nivelAcademico: "secundaria",
    asignatura: "Matemáticas",
    grado: "3°",
    grupo: "A",
    fecha: "2026-03-29T00:00:00.000Z",
    horaInicio: "08:00",
    duracionTotal: 50,
    unidadTematica: "Álgebra",
    temaSesion: "Ecuaciones lineales",
    aprendizajesEsperados: ["Resuelve ecuaciones"],
    actividades: [
      { tipo: "inicio" as const, descripcion: "Activación", duracion: 10 },
      { tipo: "desarrollo" as const, descripcion: "Ejercicios", duracion: 30 },
    ],
    recursos: ["Libro"],
    evaluacion: "Lista de cotejo",
    evidencias: ["Cuaderno"],
    observaciones: "Sin observaciones",
    fechaCreacion: "2026-03-29T00:00:00.000Z",
    fechaModificacion: "2026-03-29T00:00:00.000Z",
    competenciasDisciplinares: [],
  } as any;

  it("genera HTML de PDF con secciones seleccionadas", () => {
    const html = buildPlaneacionPdfHtml(planeacionBase, {
      portada: true,
      actividades: true,
      evaluacion: true,
      observaciones: false,
    });

    expect(html).toContain("Planeación Didáctica");
    expect(html).toContain("Matemáticas");
    expect(html).toContain("Ecuaciones lineales");
    expect(html).toContain("Actividades");
    expect(html).toContain("Evaluación");
    expect(html).not.toContain("<h2>Observaciones</h2>");
  });

  it("escapa caracteres HTML peligrosos", () => {
    const html = buildPlaneacionPdfHtml(
      {
        ...planeacionBase,
        asignatura: "Mate <script>alert(1)</script>",
      },
      {
        portada: true,
        actividades: true,
        evaluacion: true,
        observaciones: true,
      }
    );

    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).not.toContain("<script>alert(1)</script>");
  });
});
