import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import type { Planeacion } from "../../types/planeacion";

export interface PdfExportOptions {
  portada: boolean;
  actividades: boolean;
  evaluacion: boolean;
  observaciones: boolean;
}

export interface ExportedPdfFile {
  uri: string;
  name: string;
  sizeBytes: number;
}

const toSafeText = (value: string): string =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48) || "planeacion";

export const buildPlaneacionPdfHtml = (
  planeacion: Planeacion,
  options: PdfExportOptions,
): string => {
  const fecha = new Date(planeacion.fecha).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const actividadesHtml = planeacion.actividades
    .map(
      (actividad) => `
      <li>
        <strong>${toSafeText(actividad.tipo.toUpperCase())}</strong>
        <span>${toSafeText(actividad.descripcion)}</span>
        <em>${actividad.duracion} min</em>
      </li>`,
    )
    .join("");

  const recursosHtml = planeacion.recursos
    .map((recurso) => `<li>${toSafeText(recurso)}</li>`)
    .join("");

  const evidenciasHtml = planeacion.evidencias
    .map((evidencia) => `<li>${toSafeText(evidencia)}</li>`)
    .join("");

  return `
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <style>
      body { font-family: Arial, sans-serif; color: #1e2a3a; margin: 24px; }
      .top { border-bottom: 3px solid #1676d2; padding-bottom: 12px; margin-bottom: 16px; }
      .title { font-size: 24px; margin: 0; }
      .subtitle { font-size: 13px; color: #5c6e86; margin-top: 4px; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0; }
      .card { background: #f4f8ff; border: 1px solid #dbe8f8; border-radius: 8px; padding: 10px; }
      .label { font-size: 11px; letter-spacing: .6px; color: #5c6e86; margin: 0 0 4px; }
      .value { margin: 0; font-size: 14px; font-weight: 700; }
      h2 { margin-top: 18px; font-size: 16px; color: #123d6b; }
      ul { margin: 8px 0 0 18px; padding: 0; }
      li { margin-bottom: 8px; }
      li span { display: block; margin-top: 2px; }
      li em { display: block; color: #5c6e86; font-size: 12px; margin-top: 2px; }
      .footer { margin-top: 20px; font-size: 11px; color: #7a8ba3; border-top: 1px solid #e2e8f1; padding-top: 8px; }
    </style>
  </head>
  <body>
    ${
      options.portada
        ? `<div class="top">
      <h1 class="title">Planeación Didáctica</h1>
      <p class="subtitle">Generado por PlanearIA • ${toSafeText(fecha)}</p>
    </div>`
        : ""
    }

    <div class="grid">
      <div class="card">
        <p class="label">ASIGNATURA</p>
        <p class="value">${toSafeText(planeacion.asignatura)}</p>
      </div>
      <div class="card">
        <p class="label">GRADO Y GRUPO</p>
        <p class="value">${toSafeText(`${planeacion.grado} ${planeacion.grupo || ""}`)}</p>
      </div>
      <div class="card">
        <p class="label">TEMA DE SESIÓN</p>
        <p class="value">${toSafeText(planeacion.temaSesion)}</p>
      </div>
      <div class="card">
        <p class="label">UNIDAD TEMÁTICA</p>
        <p class="value">${toSafeText(planeacion.unidadTematica)}</p>
      </div>
    </div>

    <h2>Aprendizajes Esperados</h2>
    <ul>
      ${(planeacion.aprendizajesEsperados || []).map((item) => `<li>${toSafeText(item)}</li>`).join("") || "<li>Sin aprendizajes capturados</li>"}
    </ul>

    ${
      options.actividades
        ? `<h2>Actividades</h2>
    <ul>${actividadesHtml || "<li>Sin actividades registradas</li>"}</ul>`
        : ""
    }

    <h2>Recursos</h2>
    <ul>${recursosHtml || "<li>Sin recursos registrados</li>"}</ul>

    ${
      options.evaluacion
        ? `<h2>Evaluación</h2>
    <p>${toSafeText(planeacion.evaluacion || "Sin evaluación definida")}</p>`
        : ""
    }

    <h2>Evidencias</h2>
    <ul>${evidenciasHtml || "<li>Sin evidencias registradas</li>"}</ul>

    ${
      options.observaciones
        ? `<h2>Observaciones</h2>
    <p>${toSafeText(planeacion.observaciones || "Sin observaciones")}</p>`
        : ""
    }

    <p class="footer">Documento generado automáticamente por PlanearIA.</p>
  </body>
</html>`;
};

export const exportPlaneacionToPdf = async (
  planeacion: Planeacion,
  options: PdfExportOptions,
): Promise<ExportedPdfFile> => {
  const html = buildPlaneacionPdfHtml(planeacion, options);
  const printResult = await Print.printToFileAsync({ html });

  const info = (await FileSystem.getInfoAsync(printResult.uri)) as { size?: number };
  const sizeBytes = typeof info.size === "number" ? info.size : 0;

  const timestamp = new Date().toISOString().slice(0, 10);
  const name = `planeacion_${slugify(planeacion.asignatura)}_${timestamp}.pdf`;

  return {
    uri: printResult.uri,
    name,
    sizeBytes,
  };
};

export const exportPlaneacionToDocx = async (
  planeacion: Planeacion,
  options: PdfExportOptions,
): Promise<ExportedPdfFile> => {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          ...(options.portada
            ? [
                new Paragraph({
                  text: "Planeación Didáctica",
                  heading: HeadingLevel.HEADING_1,
                }),
                new Paragraph({
                  children: [new TextRun(`Generado por PlanearIA • ${new Date().toLocaleString("es-MX")}`)],
                }),
              ]
            : []),
          new Paragraph({ text: " " }),
          new Paragraph({ text: `Asignatura: ${planeacion.asignatura}`, heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: `Grado y grupo: ${planeacion.grado} ${planeacion.grupo || ""}` }),
          new Paragraph({ text: `Unidad temática: ${planeacion.unidadTematica}` }),
          new Paragraph({ text: `Tema de sesión: ${planeacion.temaSesion}` }),
          new Paragraph({ text: " " }),
          new Paragraph({ text: "Aprendizajes esperados", heading: HeadingLevel.HEADING_2 }),
          ...((planeacion.aprendizajesEsperados || []).map(
            (item) => new Paragraph({ text: `• ${item}` }),
          ) || [new Paragraph({ text: "• Sin aprendizajes capturados" })]),
          ...(options.actividades
            ? [
                new Paragraph({ text: " " }),
                new Paragraph({ text: "Actividades", heading: HeadingLevel.HEADING_2 }),
                ...((planeacion.actividades || []).map(
                  (item) =>
                    new Paragraph({
                      text: `• ${item.tipo.toUpperCase()}: ${item.descripcion} (${item.duracion} min)`,
                    }),
                ) || [new Paragraph({ text: "• Sin actividades registradas" })]),
              ]
            : []),
          new Paragraph({ text: " " }),
          new Paragraph({ text: "Recursos", heading: HeadingLevel.HEADING_2 }),
          ...((planeacion.recursos || []).map((item) => new Paragraph({ text: `• ${item}` })) || [
            new Paragraph({ text: "• Sin recursos registrados" }),
          ]),
          ...(options.evaluacion
            ? [
                new Paragraph({ text: " " }),
                new Paragraph({ text: "Evaluación", heading: HeadingLevel.HEADING_2 }),
                new Paragraph({ text: planeacion.evaluacion || "Sin evaluación definida" }),
              ]
            : []),
          new Paragraph({ text: " " }),
          new Paragraph({ text: "Evidencias", heading: HeadingLevel.HEADING_2 }),
          ...((planeacion.evidencias || []).map((item) => new Paragraph({ text: `• ${item}` })) || [
            new Paragraph({ text: "• Sin evidencias registradas" }),
          ]),
          ...(options.observaciones
            ? [
                new Paragraph({ text: " " }),
                new Paragraph({ text: "Observaciones", heading: HeadingLevel.HEADING_2 }),
                new Paragraph({ text: planeacion.observaciones || "Sin observaciones" }),
              ]
            : []),
        ],
      },
    ],
  });

  const timestamp = new Date().toISOString().slice(0, 10);
  const name = `planeacion_${slugify(planeacion.asignatura)}_${timestamp}.docx`;
  const uri = `${FileSystem.cacheDirectory || ""}${name}`;

  const base64 = await Packer.toBase64String(doc);
  await FileSystem.writeAsStringAsync(uri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const info = (await FileSystem.getInfoAsync(uri)) as { size?: number };
  const sizeBytes = typeof info.size === "number" ? info.size : 0;

  return { uri, name, sizeBytes };
};
