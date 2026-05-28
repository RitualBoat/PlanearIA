import * as Print from "expo-print";
import * as FileSystem from "expo-file-system/legacy";
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import type { InstrumentoEvaluacion, PlaneacionDocumento, Sesion } from "../../types/planeacionV2";

export interface PdfExportOptions {
  portada: boolean;
  actividades?: boolean;
  evaluacion: boolean;
  observaciones: boolean;
  infoInstitucional?: boolean;
  datosGenerales?: boolean;
  curricular?: boolean;
  sesiones?: boolean;
  firmas?: boolean;
}

export interface ExportedPdfFile {
  uri: string;
  name: string;
  sizeBytes: number;
}

interface NormalizedExportOptions {
  portada: boolean;
  infoInstitucional: boolean;
  datosGenerales: boolean;
  curricular: boolean;
  sesiones: boolean;
  evaluacion: boolean;
  observaciones: boolean;
  firmas: boolean;
}

const resolveOptions = (options: PdfExportOptions): NormalizedExportOptions => ({
  portada: options.portada,
  infoInstitucional: options.infoInstitucional ?? options.portada,
  datosGenerales: options.datosGenerales ?? true,
  curricular: options.curricular ?? true,
  sesiones: options.sesiones ?? options.actividades ?? true,
  evaluacion: options.evaluacion,
  observaciones: options.observaciones,
  firmas: options.firmas ?? true,
});

const toSafeText = (value: string | number | undefined | null): string =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const slugify = (value: string | undefined | null): string =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48) || "planeacion";

const decodeBasicHtmlEntities = (value: string): string =>
  value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

const stripHtml = (html?: string | null): string => {
  if (!html) return "";
  return decodeBasicHtmlEntities(html)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<[^>]*>?/gm, "")
    .trim();
};

const normalizePlainText = (value: string): string =>
  value
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

const collectTipTapText = (node: unknown): string => {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(collectTipTapText).join("");
  if (typeof node !== "object") return "";

  const record = node as Record<string, unknown>;
  if (typeof record.text === "string") return record.text;
  if (record.type === "hardBreak") return "\n";

  const childText = Array.isArray(record.content)
    ? record.content.map(collectTipTapText).join("")
    : "";

  if (record.type === "paragraph" || record.type === "heading") {
    return childText.trim() ? `${childText.trim()}\n` : "\n";
  }

  if (record.type === "listItem") {
    return childText.trim() ? `- ${childText.trim()}\n` : "";
  }

  return childText;
};

const richTextToPlainText = (value?: string | null): string => {
  const raw = String(value ?? "").trim();
  if (!raw) return "";

  if (raw.startsWith("{") || raw.startsWith("[")) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      const parsedText = normalizePlainText(collectTipTapText(parsed));
      if (parsedText) return parsedText;
    } catch {
      // Fall back to HTML/plain-text handling below.
    }
  }

  return normalizePlainText(stripHtml(raw));
};

const richTextToHtml = (value?: string | null): string => {
  const text = richTextToPlainText(value);
  if (!text) return "";
  return `<p>${toSafeText(text).replace(/\n/g, "<br/>")}</p>`;
};

const linesToHtml = (value?: string | null): string => {
  const text = normalizePlainText(value || "");
  if (!text) return "";
  return toSafeText(text).replace(/\n/g, "<br/>");
};

const stringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item ?? "").trim()).filter(Boolean);
};

const joinValues = (values: Array<string | undefined | null>, fallback = "Sin dato"): string => {
  const joined = values
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .join(" ");
  return joined || fallback;
};

const formatDateRange = (inicio?: string, fin?: string): string => {
  const start = inicio?.slice(0, 10) || "";
  const end = fin?.slice(0, 10) || "";
  if (start && end) return `${start} al ${end}`;
  return start || end || "Sin periodo";
};

const formatInstrumentType = (tipo?: string): string =>
  String(tipo || "sin_tipo").replace(/_/g, " ");

const renderInfoCard = (label: string, value: string): string => `
  <div class="card">
    <p class="label">${toSafeText(label)}</p>
    <p class="value">${toSafeText(value || "Sin dato")}</p>
  </div>
`;

const renderList = (items: string[], emptyText: string): string => {
  if (!items.length) return `<p>${toSafeText(emptyText)}</p>`;
  return `<ul>${items.map((item) => `<li>${toSafeText(item)}</li>`).join("")}</ul>`;
};

const renderRichBlock = (title: string, value?: string | null): string => {
  const html = richTextToHtml(value);
  return html ? `<h4>${toSafeText(title)}</h4><div class="rich-text">${html}</div>` : "";
};

const buildSesionesHtml = (sesiones: Sesion[]): string => {
  if (!sesiones.length) return "<p>Sin sesiones registradas.</p>";

  return sesiones
    .map((sesion) => {
      const tipo = sesion.tipo !== "regular" ? ` (${formatInstrumentType(sesion.tipo)})` : "";
      const motivo = sesion.motivo
        ? `<p><strong>Motivo:</strong> ${toSafeText(sesion.motivo)}</p>`
        : "";
      const blocks = [
        renderRichBlock("Inicio", sesion.inicio),
        renderRichBlock("Desarrollo", sesion.desarrollo),
        renderRichBlock("Cierre", sesion.cierre),
        renderRichBlock("Tarea/Evidencia", sesion.tarea),
      ].join("");

      return `
        <article class="sesion">
          <h3>Sesion ${toSafeText(sesion.numero)}${toSafeText(tipo)}</h3>
          ${motivo}
          ${blocks || "<p>Sin actividades registradas.</p>"}
        </article>
      `;
    })
    .join("");
};

const buildInstrumentoHtml = (
  title: string,
  instrumento: InstrumentoEvaluacion | undefined
): string => {
  if (!instrumento || !instrumento.criterios?.length) return "";

  const escala = instrumento.escala || [];
  if (escala.length > 0) {
    return `
      <section class="instrumento">
        <h3>${toSafeText(title)}</h3>
        <p><strong>Tipo:</strong> ${toSafeText(formatInstrumentType(instrumento.tipo))}</p>
        <table class="eval-table">
          <thead>
            <tr>
              <th>Criterio</th>
              ${escala.map((nivel) => `<th>${toSafeText(nivel.etiqueta)}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${instrumento.criterios
              .map(
                (criterio) => `
                  <tr>
                    <td>
                      ${toSafeText(criterio.descripcion)}
                      ${
                        criterio.mejora
                          ? `<br/><small>Mejora: ${toSafeText(criterio.mejora)}</small>`
                          : ""
                      }
                    </td>
                    ${escala.map(() => '<td class="checkbox-cell">[ ]</td>').join("")}
                  </tr>
                `
              )
              .join("")}
          </tbody>
        </table>
      </section>
    `;
  }

  return `
    <section class="instrumento">
      <h3>${toSafeText(title)}</h3>
      <p><strong>Tipo:</strong> ${toSafeText(formatInstrumentType(instrumento.tipo))}</p>
      <ul>
        ${instrumento.criterios
          .map(
            (criterio) => `
              <li>
                ${toSafeText(criterio.descripcion)}
                ${criterio.mejora ? `<br/><small>Mejora: ${toSafeText(criterio.mejora)}</small>` : ""}
              </li>
            `
          )
          .join("")}
      </ul>
    </section>
  `;
};

const buildEvaluacionHtml = (planeacion: PlaneacionDocumento): string => {
  const instrumentos = [
    buildInstrumentoHtml("Evaluacion inicial", planeacion.evaluacionInicial),
    buildInstrumentoHtml("Evaluacion final", planeacion.evaluacionFinal),
  ].filter(Boolean);

  if (instrumentos.length) return instrumentos.join("");

  const instrumentoTexto = planeacion.elementosCurriculares?.instrumentoEvaluacion;
  return instrumentoTexto
    ? `<p>${toSafeText(instrumentoTexto)}</p>`
    : "<p>Sin evaluacion definida.</p>";
};

const buildObservacionesHtml = (planeacion: PlaneacionDocumento): string => {
  if (!planeacion.observaciones?.length) return "<p>Sin observaciones registradas.</p>";

  return `
    <ul>
      ${planeacion.observaciones
        .map(
          (obs) => `
            <li>
              ${toSafeText(obs.texto)}
              ${obs.categoria ? `<span class="tag">${toSafeText(obs.categoria)}</span>` : ""}
            </li>
          `
        )
        .join("")}
    </ul>
  `;
};

const buildFirmasHtml = (planeacion: PlaneacionDocumento): string => {
  if (!planeacion.firmas?.length) return "<p>Sin firmas registradas.</p>";

  return `
    <div class="firmas-grid">
      ${planeacion.firmas
        .map(
          (firma) => `
            <div class="firma-caja">
              <div class="firma-linea"></div>
              <p class="firma-nombre">${toSafeText(firma.nombre)}</p>
              <p class="firma-rol">${toSafeText(firma.rol)}</p>
            </div>
          `
        )
        .join("")}
    </div>
  `;
};

export const buildPlaneacionPdfHtml = (
  planeacion: PlaneacionDocumento,
  options: PdfExportOptions
): string => {
  const resolved = resolveOptions(options);
  const fecha = new Date().toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const { datosGenerales, elementosCurriculares, infoInstitucional } = planeacion;
  const recursos = stringArray(planeacion.camposNivel?.recursos);
  const grupos = datosGenerales?.grupos || [];

  const sections: string[] = [];

  if (resolved.portada) {
    sections.push(`
      <header class="top">
        <p class="eyebrow">PlanearIA</p>
        <h1 class="title">Planeacion Didactica</h1>
        <p class="subtitle">${toSafeText(planeacion.nivelAcademico.toUpperCase())}</p>
      </header>
    `);
  }

  if (resolved.infoInstitucional) {
    sections.push(`
      <section class="section centered">
        <h2>Informacion institucional</h2>
        <p class="institution">${toSafeText(infoInstitucional?.institucion || "Sin institucion")}</p>
        ${infoInstitucional?.subsistema ? `<p>${toSafeText(infoInstitucional.subsistema)}</p>` : ""}
        <p>Ciclo escolar: ${toSafeText(infoInstitucional?.cicloEscolar || "Sin ciclo")}</p>
        ${infoInstitucional?.lugar ? `<p>Lugar: ${toSafeText(infoInstitucional.lugar)}</p>` : ""}
      </section>
    `);
  }

  if (resolved.datosGenerales) {
    sections.push(`
      <section class="section">
        <h2>Datos generales</h2>
        <div class="grid">
          ${renderInfoCard("Docente", datosGenerales?.maestro || "")}
          ${renderInfoCard("Asignatura", datosGenerales?.asignatura || "")}
          ${renderInfoCard("Grado y grupo(s)", joinValues([datosGenerales?.grado, grupos.join(", ")], "Sin grupo"))}
          ${renderInfoCard("Periodo", formatDateRange(datosGenerales?.fechaInicio, datosGenerales?.fechaFin))}
          ${renderInfoCard("Semanas", (datosGenerales?.semanas || []).join(", ") || "Sin semanas")}
          ${renderInfoCard("Trimestre", datosGenerales?.trimestre ? String(datosGenerales.trimestre) : "Sin trimestre")}
        </div>
      </section>
    `);
  }

  if (resolved.curricular) {
    sections.push(`
      <section class="section">
        <h2>Elementos curriculares</h2>
        <div class="content-block">
          <p><strong>Contenido:</strong> ${toSafeText(elementosCurriculares?.contenido || "Sin contenido")}</p>
          <p><strong>PDA:</strong><br/>${linesToHtml(elementosCurriculares?.pda) || "Sin PDA"}</p>
          <p><strong>Proposito:</strong><br/>${linesToHtml(elementosCurriculares?.proposito) || "Sin proposito"}</p>
          ${
            elementosCurriculares?.campoFormativo
              ? `<p><strong>Campo formativo:</strong> ${toSafeText(elementosCurriculares.campoFormativo)}</p>`
              : ""
          }
          ${
            elementosCurriculares?.ejeArticulador
              ? `<p><strong>Eje articulador:</strong> ${toSafeText(elementosCurriculares.ejeArticulador)}</p>`
              : ""
          }
          ${
            elementosCurriculares?.producto
              ? `<p><strong>Producto final:</strong><br/>${linesToHtml(elementosCurriculares.producto)}</p>`
              : ""
          }
          ${
            elementosCurriculares?.rasgosPerfilEgreso?.length
              ? `<h3>Rasgos del perfil de egreso</h3>${renderList(
                  elementosCurriculares.rasgosPerfilEgreso,
                  "Sin rasgos registrados."
                )}`
              : ""
          }
          ${
            recursos.length
              ? `<h3>Recursos</h3>${renderList(recursos, "Sin recursos registrados.")}`
              : ""
          }
        </div>
      </section>
    `);
  }

  if (resolved.sesiones) {
    sections.push(`
      <section class="section">
        <h2>Desarrollo de sesiones</h2>
        ${buildSesionesHtml(planeacion.sesiones || [])}
      </section>
    `);
  }

  if (resolved.evaluacion) {
    sections.push(`
      <section class="section">
        <h2>Evaluacion</h2>
        ${buildEvaluacionHtml(planeacion)}
      </section>
    `);
  }

  if (resolved.observaciones) {
    sections.push(`
      <section class="section">
        <h2>Observaciones</h2>
        ${buildObservacionesHtml(planeacion)}
      </section>
    `);
  }

  if (resolved.firmas) {
    sections.push(`
      <section class="section firmas-section">
        <h2>Firmas</h2>
        ${buildFirmasHtml(planeacion)}
      </section>
    `);
  }

  return `
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <style>
      @page { margin: 24px; }
      body {
        font-family: Arial, sans-serif;
        color: #1e2a3a;
        margin: 0;
        line-height: 1.5;
        background: #ffffff;
      }
      .top {
        border-bottom: 4px solid #1676d2;
        padding: 8px 0 16px;
        margin-bottom: 18px;
        text-align: center;
      }
      .eyebrow {
        color: #1676d2;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1.4px;
        margin: 0 0 6px;
        text-transform: uppercase;
      }
      .title {
        font-size: 26px;
        margin: 0;
        color: #123d6b;
        text-transform: uppercase;
      }
      .subtitle {
        font-size: 13px;
        color: #5c6e86;
        margin: 6px 0 0;
      }
      .section {
        margin-top: 20px;
        break-inside: avoid;
      }
      .centered {
        text-align: center;
      }
      .institution {
        font-weight: 700;
        color: #123d6b;
        margin-bottom: 4px;
      }
      .grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-top: 12px;
      }
      .card {
        background: #f4f8ff;
        border: 1px solid #dbe8f8;
        border-radius: 8px;
        padding: 10px;
      }
      .label {
        font-size: 10px;
        letter-spacing: .6px;
        color: #5c6e86;
        margin: 0 0 4px;
        font-weight: bold;
        text-transform: uppercase;
      }
      .value {
        margin: 0;
        font-size: 14px;
        font-weight: 700;
        color: #123d6b;
      }
      h2 {
        margin: 0 0 10px;
        font-size: 18px;
        color: #1676d2;
        border-bottom: 1px solid #dbe8f8;
        padding-bottom: 5px;
      }
      h3 {
        margin: 14px 0 6px;
        font-size: 15px;
        color: #123d6b;
      }
      h4 {
        margin: 10px 0 4px;
        font-size: 12px;
        color: #3a4a5e;
        letter-spacing: 0.5px;
        text-transform: uppercase;
      }
      .content-block p,
      .rich-text p {
        margin: 5px 0 9px;
        font-size: 14px;
      }
      .sesion {
        border-left: 3px solid #1676d2;
        padding-left: 12px;
        margin: 0 0 18px;
        break-inside: avoid;
      }
      ul {
        margin-top: 4px;
        padding-left: 20px;
      }
      table.eval-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 8px;
        font-size: 12px;
      }
      table.eval-table th,
      table.eval-table td {
        border: 1px solid #dbe8f8;
        padding: 8px;
        text-align: left;
        vertical-align: top;
      }
      table.eval-table th {
        background: #f4f8ff;
        color: #123d6b;
      }
      .checkbox-cell {
        text-align: center;
        white-space: nowrap;
      }
      .tag {
        display: inline-block;
        margin-left: 6px;
        padding: 1px 6px;
        border-radius: 999px;
        background: #eef5ff;
        color: #315d89;
        font-size: 11px;
      }
      .firmas-section {
        break-inside: avoid;
      }
      .firmas-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
        gap: 34px;
        margin-top: 42px;
        text-align: center;
      }
      .firma-caja {
        margin-top: 16px;
      }
      .firma-linea {
        border-bottom: 1px solid #1e2a3a;
        margin-bottom: 8px;
      }
      .firma-nombre {
        margin: 0;
        font-weight: bold;
        font-size: 13px;
      }
      .firma-rol {
        margin: 0;
        font-size: 12px;
        color: #5c6e86;
      }
      .footer {
        margin-top: 32px;
        font-size: 10px;
        color: #7a8ba3;
        border-top: 1px solid #e2e8f1;
        padding-top: 8px;
        text-align: center;
      }
    </style>
  </head>
  <body>
    ${sections.join("\n")}
    <p class="footer">Documento generado automaticamente por PlanearIA el ${toSafeText(fecha)}.</p>
  </body>
</html>`;
};

export const exportPlaneacionToPdf = async (
  planeacion: PlaneacionDocumento,
  options: PdfExportOptions
): Promise<ExportedPdfFile> => {
  const html = buildPlaneacionPdfHtml(planeacion, options);
  const printResult = await Print.printToFileAsync({ html });

  const info = (await FileSystem.getInfoAsync(printResult.uri)) as { size?: number };
  const sizeBytes = typeof info.size === "number" ? info.size : 0;

  const timestamp = new Date().toISOString().slice(0, 10);
  const subject = planeacion.datosGenerales?.asignatura || "planeacion";
  const name = `${slugify(subject)}_${timestamp}.pdf`;

  return {
    uri: printResult.uri,
    name,
    sizeBytes,
  };
};

const spacer = (): Paragraph => new Paragraph({ text: "" });

const heading = (
  text: string,
  level: (typeof HeadingLevel)[keyof typeof HeadingLevel]
): Paragraph => new Paragraph({ text, heading: level });

const fieldParagraph = (label: string, value?: string | number | null): Paragraph =>
  new Paragraph({
    children: [
      new TextRun({ text: `${label}: `, bold: true }),
      new TextRun(String(value || "Sin dato")),
    ],
  });

const textParagraph = (text: string): Paragraph => new Paragraph({ text });

const listParagraphs = (items: string[], emptyText: string): Paragraph[] =>
  items.length ? items.map((item) => textParagraph(`- ${item}`)) : [textParagraph(emptyText)];

const richTextParagraphs = (label: string, value?: string | null): Paragraph[] => {
  const text = richTextToPlainText(value);
  if (!text) return [];
  return [
    new Paragraph({ children: [new TextRun({ text: label, bold: true })] }),
    ...text.split("\n").filter(Boolean).map(textParagraph),
  ];
};

const buildInstrumentoDocx = (
  title: string,
  instrumento: InstrumentoEvaluacion | undefined
): Paragraph[] => {
  if (!instrumento || !instrumento.criterios?.length) return [];

  const escala = instrumento.escala
    ?.map((nivel) => nivel.etiqueta)
    .filter(Boolean)
    .join(", ");
  return [
    heading(title, HeadingLevel.HEADING_3),
    fieldParagraph("Tipo", formatInstrumentType(instrumento.tipo)),
    ...(escala ? [fieldParagraph("Escala", escala)] : []),
    ...instrumento.criterios.map((criterio) =>
      textParagraph(
        `- ${criterio.descripcion}${criterio.mejora ? ` | Mejora: ${criterio.mejora}` : ""}`
      )
    ),
  ];
};

const buildDocxChildren = (
  planeacion: PlaneacionDocumento,
  options: PdfExportOptions
): Paragraph[] => {
  const resolved = resolveOptions(options);
  const { datosGenerales, elementosCurriculares, infoInstitucional } = planeacion;
  const recursos = stringArray(planeacion.camposNivel?.recursos);
  const children: Paragraph[] = [];

  if (resolved.portada) {
    children.push(
      heading("Planeacion Didactica", HeadingLevel.HEADING_1),
      textParagraph(`Generado por PlanearIA - ${new Date().toLocaleString("es-MX")}`),
      fieldParagraph("Nivel", planeacion.nivelAcademico),
      spacer()
    );
  }

  if (resolved.infoInstitucional) {
    children.push(
      heading("Informacion institucional", HeadingLevel.HEADING_2),
      fieldParagraph("Institucion", infoInstitucional?.institucion),
      fieldParagraph("Subsistema", infoInstitucional?.subsistema),
      fieldParagraph("Ciclo escolar", infoInstitucional?.cicloEscolar),
      fieldParagraph("Lugar", infoInstitucional?.lugar),
      spacer()
    );
  }

  if (resolved.datosGenerales) {
    children.push(
      heading("Datos generales", HeadingLevel.HEADING_2),
      fieldParagraph("Docente", datosGenerales?.maestro),
      fieldParagraph("Asignatura", datosGenerales?.asignatura),
      fieldParagraph(
        "Grado y grupo(s)",
        joinValues([datosGenerales?.grado, (datosGenerales?.grupos || []).join(", ")])
      ),
      fieldParagraph(
        "Periodo",
        formatDateRange(datosGenerales?.fechaInicio, datosGenerales?.fechaFin)
      ),
      fieldParagraph("Semanas", (datosGenerales?.semanas || []).join(", ") || "Sin semanas"),
      fieldParagraph("Trimestre", datosGenerales?.trimestre || "Sin trimestre"),
      spacer()
    );
  }

  if (resolved.curricular) {
    children.push(
      heading("Elementos curriculares", HeadingLevel.HEADING_2),
      fieldParagraph("Contenido", elementosCurriculares?.contenido),
      fieldParagraph("PDA", elementosCurriculares?.pda),
      fieldParagraph("Proposito", elementosCurriculares?.proposito),
      fieldParagraph("Campo formativo", elementosCurriculares?.campoFormativo),
      fieldParagraph("Eje articulador", elementosCurriculares?.ejeArticulador),
      fieldParagraph("Producto final", elementosCurriculares?.producto),
      heading("Rasgos del perfil de egreso", HeadingLevel.HEADING_3),
      ...listParagraphs(elementosCurriculares?.rasgosPerfilEgreso || [], "Sin rasgos registrados."),
      heading("Recursos", HeadingLevel.HEADING_3),
      ...listParagraphs(recursos, "Sin recursos registrados."),
      spacer()
    );
  }

  if (resolved.sesiones) {
    children.push(heading("Desarrollo de sesiones", HeadingLevel.HEADING_2));
    if (planeacion.sesiones?.length) {
      planeacion.sesiones.forEach((sesion) => {
        const tipo = sesion.tipo !== "regular" ? ` (${formatInstrumentType(sesion.tipo)})` : "";
        children.push(
          heading(`Sesion ${sesion.numero}${tipo}`, HeadingLevel.HEADING_3),
          ...(sesion.motivo ? [fieldParagraph("Motivo", sesion.motivo)] : []),
          ...richTextParagraphs("Inicio", sesion.inicio),
          ...richTextParagraphs("Desarrollo", sesion.desarrollo),
          ...richTextParagraphs("Cierre", sesion.cierre),
          ...richTextParagraphs("Tarea/Evidencia", sesion.tarea),
          spacer()
        );
      });
    } else {
      children.push(textParagraph("Sin sesiones registradas."), spacer());
    }
  }

  if (resolved.evaluacion) {
    const evaluacion = [
      ...buildInstrumentoDocx("Evaluacion inicial", planeacion.evaluacionInicial),
      ...buildInstrumentoDocx("Evaluacion final", planeacion.evaluacionFinal),
    ];
    children.push(
      heading("Evaluacion", HeadingLevel.HEADING_2),
      ...(evaluacion.length
        ? evaluacion
        : [
            textParagraph(
              elementosCurriculares?.instrumentoEvaluacion || "Sin evaluacion definida."
            ),
          ]),
      spacer()
    );
  }

  if (resolved.observaciones) {
    children.push(
      heading("Observaciones", HeadingLevel.HEADING_2),
      ...listParagraphs(
        (planeacion.observaciones || []).map(
          (obs) => `${obs.texto}${obs.categoria ? ` (${obs.categoria})` : ""}`
        ),
        "Sin observaciones registradas."
      ),
      spacer()
    );
  }

  if (resolved.firmas) {
    children.push(
      heading("Firmas", HeadingLevel.HEADING_2),
      ...listParagraphs(
        (planeacion.firmas || []).map((firma) => `${firma.rol}: ${firma.nombre}`),
        "Sin firmas registradas."
      )
    );
  }

  return children.length ? children : [textParagraph("Planeacion sin contenido para exportar.")];
};

export const exportPlaneacionToDocx = async (
  planeacion: PlaneacionDocumento,
  options: PdfExportOptions
): Promise<ExportedPdfFile> => {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: buildDocxChildren(planeacion, options),
      },
    ],
  });

  const timestamp = new Date().toISOString().slice(0, 10);
  const subject = planeacion.datosGenerales?.asignatura || "planeacion";
  const name = `${slugify(subject)}_${timestamp}.docx`;
  const uri = `${FileSystem.cacheDirectory || ""}${name}`;

  const base64 = await Packer.toBase64String(doc);
  await FileSystem.writeAsStringAsync(uri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const info = (await FileSystem.getInfoAsync(uri)) as { size?: number };
  const sizeBytes = typeof info.size === "number" ? info.size : 0;

  return { uri, name, sizeBytes };
};
