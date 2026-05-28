import { buildPlaneacionPdfHtml } from "../../services/planeacionExportService";
import { NivelAcademico, type PlaneacionDocumento } from "../../../types/planeacionV2";

const richTextJson = JSON.stringify({
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [{ type: "text", text: "Activacion de saberes previos" }],
    },
  ],
});

describe("planeacionExportService", () => {
  const planeacionBase: PlaneacionDocumento = {
    id: "p1",
    version: 2,
    userId: "user-1",
    nivelAcademico: NivelAcademico.SECUNDARIA,
    infoInstitucional: {
      institucion: "Escuela Secundaria PlanearIA",
      subsistema: "General",
      cicloEscolar: "2026-2027",
      lugar: "CDMX",
    },
    datosGenerales: {
      maestro: "Docente Demo",
      asignatura: "Matematicas",
      fechaInicio: "2026-03-29T00:00:00.000Z",
      fechaFin: "2026-04-05T00:00:00.000Z",
      semanas: [33],
      trimestre: 2,
      grado: "3",
      grupos: ["A"],
    },
    elementosCurriculares: {
      proposito: "Resolver ecuaciones de primer grado.",
      producto: "Cuaderno de evidencias",
      contenido: "Algebra",
      pda: "Ecuaciones lineales",
      campoFormativo: "Saberes y pensamiento cientifico",
      ejeArticulador: "Pensamiento critico",
      rasgosPerfilEgreso: ["Analiza problemas"],
      instrumentoEvaluacion: "Lista de cotejo",
    },
    sesiones: [
      {
        id: "s1",
        numero: 1,
        tipo: "regular",
        inicio: richTextJson,
        desarrollo: "<p>Ejercicios guiados</p>",
        cierre: "Socializacion de resultados",
        tarea: "Resolver 5 problemas",
      },
    ],
    evaluacionFinal: {
      tipo: "lista_cotejo",
      escala: [],
      criterios: [{ id: "c1", descripcion: "Resuelve ecuaciones" }],
    },
    observaciones: [{ texto: "Ajustar tiempos", categoria: "general" }],
    firmas: [{ rol: "Docente", nombre: "Docente Demo" }],
    camposNivel: {
      recursos: ["Libro"],
    },
    fechaCreacion: "2026-03-29T00:00:00.000Z",
    fechaModificacion: "2026-03-29T00:00:00.000Z",
  };

  it("genera HTML de PDF con secciones V2 seleccionadas", () => {
    const html = buildPlaneacionPdfHtml(planeacionBase, {
      portada: true,
      sesiones: true,
      evaluacion: true,
      observaciones: false,
    });

    expect(html).toContain("Planeacion Didactica");
    expect(html).toContain("Matematicas");
    expect(html).toContain("Ecuaciones lineales");
    expect(html).toContain("Desarrollo de sesiones");
    expect(html).toContain("Evaluacion");
    expect(html).not.toContain("<h2>Observaciones</h2>");
  });

  it("convierte contenido Tiptap/HTML a texto legible sin exportar JSON crudo", () => {
    const html = buildPlaneacionPdfHtml(planeacionBase, {
      portada: true,
      sesiones: true,
      evaluacion: false,
      observaciones: false,
    });

    expect(html).toContain("Activacion de saberes previos");
    expect(html).toContain("Ejercicios guiados");
    expect(html).not.toContain('"type":"doc"');
  });

  it("escapa caracteres HTML peligrosos", () => {
    const html = buildPlaneacionPdfHtml(
      {
        ...planeacionBase,
        datosGenerales: {
          ...planeacionBase.datosGenerales,
          asignatura: "Mate <script>alert(1)</script>",
        },
      },
      {
        portada: true,
        sesiones: true,
        evaluacion: true,
        observaciones: true,
      }
    );

    expect(html).toContain("Mate &lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).not.toContain("<script>alert(1)</script>");
  });
});
