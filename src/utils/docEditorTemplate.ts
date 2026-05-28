import type { PlaneacionDocumento, Sesion } from "../../types/planeacionV2";

type TipTapNode = Record<string, unknown>;

const asParagraph = (text: string): TipTapNode => ({
  type: "paragraph",
  content: text.trim().length
    ? [{ type: "text", text }]
    : [],
});

const asHeading = (text: string, level = 2): TipTapNode => ({
  type: "heading",
  attrs: { level },
  content: [{ type: "text", text }],
});

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
    .map((item) => item.texto.trim())
    .filter(Boolean)
    .join(" | ");
  const criterios = doc.evaluacionFinal?.criterios
    .map((item) => item.descripcion.trim())
    .filter(Boolean)
    .join(" | ");
  const firmaDocente = doc.firmas.find((firma) => firma.rol.toLowerCase().includes("docente"))?.nombre || "";

  const content: TipTapNode[] = [
    asHeading("Planeacion"),
    asParagraph(`Institucion: ${doc.infoInstitucional.institucion || "Pendiente"}`),
    asParagraph(`Ciclo escolar: ${doc.infoInstitucional.cicloEscolar || "Pendiente"}`),
    asParagraph(`Asignatura: ${doc.datosGenerales.asignatura || "Pendiente"}`),
    asParagraph(`Grado: ${doc.datosGenerales.grado || "Pendiente"} | Grupo(s): ${grupos}`),
    asParagraph(
      `Fecha: ${doc.datosGenerales.fechaInicio || "Pendiente"} a ${doc.datosGenerales.fechaFin || "Pendiente"} | Semanas: ${semanas}`
    ),
    asHeading("Elementos curriculares", 3),
    asParagraph(`Proposito: ${doc.elementosCurriculares.proposito || "Pendiente"}`),
    asParagraph(`Contenido: ${doc.elementosCurriculares.contenido || "Pendiente"}`),
    asParagraph(`PDA: ${doc.elementosCurriculares.pda || "Pendiente"}`),
    asParagraph(`Campo formativo: ${doc.elementosCurriculares.campoFormativo || "Pendiente"}`),
    asParagraph(`Eje articulador: ${doc.elementosCurriculares.ejeArticulador || "Pendiente"}`),
    asHeading("Sesiones", 3),
    ...doc.sesiones.flatMap((sesion) => sesionLines(sesion).map((line) => asParagraph(line))),
    asHeading("Evaluacion", 3),
    asParagraph(`Instrumento: ${doc.elementosCurriculares.instrumentoEvaluacion || "Pendiente"}`),
    asParagraph(`Criterios: ${criterios || "Pendiente"}`),
    asHeading("Observaciones", 3),
    asParagraph(observaciones || "Pendiente"),
    asHeading("Firmas", 3),
    asParagraph(`Docente: ${firmaDocente || doc.datosGenerales.maestro || "Pendiente"}`),
  ];

  return JSON.stringify({
    type: "doc",
    content,
  });
};

export const ensureDocumentoContenidoRaw = (doc: PlaneacionDocumento): PlaneacionDocumento => {
  if (doc.contenidoRaw && doc.contenidoRaw.trim().length > 0) {
    return doc;
  }

  return {
    ...doc,
    contenidoRaw: buildContenidoRawFromDocumento(doc),
  };
};

