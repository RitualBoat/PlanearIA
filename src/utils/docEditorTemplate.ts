import type { PlaneacionDocumento, Sesion } from "../../types/planeacionV2";

type TipTapNode = Record<string, unknown>;

const textNode = (text: string): TipTapNode => ({
  type: "text",
  text,
});

const asParagraph = (text: string): TipTapNode => ({
  type: "paragraph",
  content: text.trim().length
    ? [textNode(text)]
    : [],
});

const asHeading = (text: string, level = 2): TipTapNode => ({
  type: "heading",
  attrs: { level },
  content: [textNode(text)],
});

const asCell = (value: string | string[], header = false): TipTapNode => {
  const lines = Array.isArray(value) ? value : [value];
  return {
    type: header ? "tableHeader" : "tableCell",
    content: lines.map((line) => asParagraph(line)),
  };
};

const asTable = (rows: Array<Array<string | string[]>>, headerRows = 0): TipTapNode => ({
  type: "table",
  content: rows.map((row, rowIndex) => ({
    type: "tableRow",
    content: row.map((cell) => asCell(cell, rowIndex < headerRows)),
  })),
});

const buildDefaultLogoSlots = () => [
  {
    id: "tecnm",
    label: "Logo izquierdo",
    maxWidthPx: 1300,
    maxHeightPx: 400,
  },
  {
    id: "institucion",
    label: "Logo derecho",
    maxWidthPx: 500,
    maxHeightPx: 500,
  },
];

const parseRichTextToPlain = (value?: string): string => {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed) as {
        content?: Array<{ type?: string; content?: Array<{ text?: string }> }>;
      };
      return (parsed.content || [])
        .flatMap((node) => node.content || [])
        .map((node) => node.text || "")
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
    } catch {
      return trimmed.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    }
  }

  return trimmed.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
};

const sesionLines = (sesion: Sesion): string[] => {
  if (sesion.tipo === "suspension") {
    return [`Sesion ${sesion.numero}: suspension`, `Motivo: ${sesion.motivo || "Pendiente"}`];
  }

  return [
    `Sesion ${sesion.numero}`,
    `Inicio: ${parseRichTextToPlain(sesion.inicio) || "Pendiente"}`,
    `Desarrollo: ${parseRichTextToPlain(sesion.desarrollo) || "Pendiente"}`,
    `Cierre: ${parseRichTextToPlain(sesion.cierre) || "Pendiente"}`,
    `Tarea: ${parseRichTextToPlain(sesion.tarea) || "Pendiente"}`,
  ];
};

export const buildContenidoRawFromDocumento = (doc: PlaneacionDocumento): string => {
  const grupos = doc.datosGenerales.grupos.length ? doc.datosGenerales.grupos.join(", ") : "Pendiente";
  const semanas = doc.datosGenerales.semanas.length ? doc.datosGenerales.semanas.join(", ") : "Pendiente";
  const observaciones = doc.observaciones
    .flatMap((item) => {
      const text = item.texto.trim();
      return text ? [text] : [];
    })
    .join(" | ");
  const criterios = doc.evaluacionFinal?.criterios
    .flatMap((item) => {
      const text = item.descripcion.trim();
      return text ? [text] : [];
    })
    .join(" | ");
  const firmaDocente = doc.firmas.find((firma) => firma.rol.toLowerCase().includes("docente"))?.nombre || "";
  const competencia = doc.elementosCurriculares.pda || doc.elementosCurriculares.proposito || "Pendiente";
  const caracterizacion =
    doc.elementosCurriculares.contenido ||
    "Describe el contexto de la asignatura, su aportacion al perfil de egreso y su relacion con otras unidades de aprendizaje.";
  const intencion =
    doc.elementosCurriculares.proposito ||
    "Explica la organizacion didactica, el enfoque de trabajo, las actividades practicas y el rol del docente durante el proceso.";

  const content: TipTapNode[] = [
    asParagraph("[Logo izquierdo]                                                                 [Logo derecho]"),
    asHeading(doc.infoInstitucional.institucion || "Tecnologico Nacional de Mexico", 3),
    asParagraph(doc.infoInstitucional.subsistema || "Subdireccion Academica"),
    asHeading("Instrumentacion Didactica para la Formacion y Desarrollo de Competencias Profesionales", 3),
    asParagraph(`Periodo: ${doc.datosGenerales.fechaInicio || "Pendiente"} - ${doc.datosGenerales.fechaFin || "Pendiente"}`),
    asTable([
      ["Nombre de la Asignatura", doc.datosGenerales.asignatura || "Pendiente"],
      ["Plan de Estudios", String(doc.camposNivel?.planEstudios || "Pendiente")],
      ["Clave de la Asignatura", String(doc.camposNivel?.claveAsignatura || "Pendiente")],
      ["Horas teoria-practica-creditos", String(doc.camposNivel?.horasCreditos || "Pendiente")],
      ["Grado / Grupo(s)", `${doc.datosGenerales.grado || "Pendiente"} / ${grupos}`],
      ["Semana(s)", semanas],
    ]),
    asHeading("1. Caracterizacion de la asignatura", 3),
    asTable([[caracterizacion]]),
    asHeading("2. Intencion didactica", 3),
    asTable([[intencion]]),
    asHeading("3. Competencia de la asignatura", 3),
    asTable([[competencia]]),
    asHeading("4. Analisis por competencias especificas", 3),
    asTable(
      [
        ["Competencia No.", "Descripcion", "DESCRIPCION"],
        ["uno", doc.elementosCurriculares.contenido || "Pendiente", competencia],
        [
          "Temas y subtemas para desarrollar la competencia especifica",
          "Actividades de aprendizaje",
          "Actividades de ensenanza",
          "Desarrollo de competencias genericas",
          "Horas teorico-practica",
        ],
        [
          doc.elementosCurriculares.contenido || "Pendiente",
          doc.sesiones
            .map((sesion) => `Sesion ${sesion.numero}: ${parseRichTextToPlain(sesion.desarrollo) || "Pendiente"}`)
            .join("\n"),
          doc.sesiones
            .map((sesion) => `Inicio/cierre ${sesion.numero}: ${parseRichTextToPlain(sesion.inicio) || "Pendiente"}`)
            .join("\n"),
          doc.elementosCurriculares.rasgosPerfilEgreso.join("\n") || "Pendiente",
          String(doc.camposNivel?.horasCompetencia || "Pendiente"),
        ],
      ],
      1
    ),
    asHeading("Indicadores de alcance", 3),
    asTable(
      [
        ["Indicadores de Alcance", "Valor de Indicador"],
        ["A. Se adapta a situaciones y contextos complejos.\nB. Hace aportaciones a las actividades academicas desarrolladas.\nC. Propone soluciones o procedimientos.\nD. Incorpora recursos y experiencias de pensamiento critico.\nE. Trabaja de manera autonoma y autorregulada.", "95-100"],
        ["B. Cumple cuatro de los indicadores definidos en desempeno excelente.", "85-94"],
        ["C. Cumple tres de los indicadores definidos en desempeno excelente.", "75-84"],
        ["D. Cumple dos de los indicadores definidos en desempeno excelente.", "70-74"],
      ],
      1
    ),
    asHeading("Niveles de desempeno", 3),
    asTable(
      [
        ["Desempeno", "Nivel de desempeno", "Indicadores de alcance", "Valoracion numerica"],
        ["Competencia alcanzada", "Excelente", "Cumple al menos cinco indicadores.", "95-100"],
        ["Competencia alcanzada", "Notable", "Cumple cuatro indicadores.", "85-94"],
        ["Competencia alcanzada", "Bueno", "Cumple tres indicadores.", "75-84"],
        ["Competencia no alcanzada", "Insuficiente", "No cumple evidencias minimas.", "NA"],
      ],
      1
    ),
    asHeading("Matriz de evaluacion", 3),
    asTable(
      [
        ["Evidencia de aprendizaje", "%", "A", "B", "C", "D", "E", "F", "Evaluacion formativa"],
        ["Reporte / producto", "40%", "", "", "", "", "", "", "Coevaluacion"],
        ["Ejercicios practicos", "30%", "", "", "", "", "", "", "Autoevaluacion"],
        ["Cuestionario / rubrica", "30%", "", "", "", "", "", "", "Heteroevaluacion"],
        ["Total", "100%", "", "", "", "", "", "", criterios || "Pendiente"],
      ],
      1
    ),
    asHeading("Sesiones", 3),
    asTable(
      [
        ["Sesion", "Inicio", "Desarrollo", "Cierre", "Tarea/Evidencia"],
        ...doc.sesiones.map((sesion) => [
          `Sesion ${sesion.numero}`,
          parseRichTextToPlain(sesion.inicio) || "Pendiente",
          parseRichTextToPlain(sesion.desarrollo) || "Pendiente",
          parseRichTextToPlain(sesion.cierre) || "Pendiente",
          parseRichTextToPlain(sesion.tarea) || "Pendiente",
        ]),
      ],
      1
    ),
    asHeading("Observaciones", 3),
    asTable([[observaciones || "Pendiente"]]),
    asHeading("Firmas", 3),
    asTable([
      ["Docente", "Coordinacion / Revision"],
      [firmaDocente || doc.datosGenerales.maestro || "Pendiente", String(doc.camposNivel?.firmaRevision || "Pendiente")],
    ], 1),
  ];

  return JSON.stringify({
    type: "doc",
    content,
  });
};

const hasRobustTemplateShape = (raw: string): boolean => {
  if (!raw.trim()) return false;
  try {
    const parsed = JSON.parse(raw) as unknown;
    const serialized = JSON.stringify(parsed);
    return serialized.includes('"type":"table"') && serialized.includes("Instrumentacion Didactica");
  } catch {
    return false;
  }
};

const isLegacyGeneratedTemplate = (raw: string): boolean => {
  if (!raw.trim()) return true;
  if (hasRobustTemplateShape(raw)) return false;
  return raw.includes("Planeacion") && raw.includes("Institucion:") && raw.includes("Elementos curriculares");
};

export const ensureDocumentoContenidoRaw = (doc: PlaneacionDocumento): PlaneacionDocumento => {
  const camposNivel = {
    ...(doc.camposNivel || {}),
    plantillaVisualVersion: 2,
    plantillaLogos: Array.isArray(doc.camposNivel?.plantillaLogos)
      ? doc.camposNivel?.plantillaLogos
      : buildDefaultLogoSlots(),
  };

  if (doc.contenidoRaw && doc.contenidoRaw.trim().length > 0 && !isLegacyGeneratedTemplate(doc.contenidoRaw)) {
    return {
      ...doc,
      camposNivel,
    };
  }

  return {
    ...doc,
    camposNivel,
    contenidoRaw: buildContenidoRawFromDocumento(doc),
  };
};
