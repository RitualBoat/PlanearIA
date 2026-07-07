import { Platform } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import * as XLSX from "xlsx";
import { escapeHtml, openHtmlForPrint } from "../utils/htmlEscape";
import type { Alumno, Grupo } from "../../types";

export type GrupoExportFormat = "pdf" | "excel";

export interface GrupoExportData {
  grupo: Pick<
    Grupo,
    "id" | "nombre" | "materia" | "carrera" | "semestre" | "periodo" | "cantidadAlumnos"
  > &
    Partial<Pick<Grupo, "horario" | "estado">>;
  alumnos: Alumno[];
}

export interface ExportarGrupoArchivoParams extends GrupoExportData {
  formato: GrupoExportFormat;
}

const slugify = (value: string): string => {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
};

const formatDate = (value: Date): string => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const buildFileBaseName = (grupoNombre: string): string => {
  const stamp = formatDate(new Date());
  const safeName = slugify(grupoNombre || "grupo");
  return `grupo_${safeName || "general"}_${stamp}`;
};

export const buildGrupoExportRows = ({
  grupo,
  alumnos,
}: GrupoExportData): Record<string, unknown>[] => {
  return alumnos.map((alumno, index) => ({
    No: index + 1,
    Nombre: `${alumno.nombre || ""} ${alumno.apellidos || ""}`.trim(),
    NumeroControl: alumno.numeroControl || "",
    Carrera: alumno.carrera || "",
    Email: alumno.email || "",
    Telefono: alumno.telefono || "",
    Estado: alumno.estado || "",
    Grupo: grupo.nombre,
    Materia: grupo.materia,
    Periodo: grupo.periodo,
  }));
};

export const buildGrupoWorkbook = ({ grupo, alumnos }: GrupoExportData): XLSX.WorkBook => {
  const resumenRows = [
    { Campo: "ID", Valor: grupo.id },
    { Campo: "Nombre", Valor: grupo.nombre },
    { Campo: "Materia", Valor: grupo.materia },
    { Campo: "Carrera", Valor: grupo.carrera },
    { Campo: "Semestre", Valor: grupo.semestre },
    { Campo: "Periodo", Valor: grupo.periodo },
    { Campo: "Horario", Valor: grupo.horario || "Sin horario" },
    { Campo: "Estado", Valor: grupo.estado || "activo" },
    { Campo: "Cantidad alumnos", Valor: alumnos.length },
  ];

  const alumnosRows = buildGrupoExportRows({ grupo, alumnos });
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(resumenRows), "Grupo");
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(alumnosRows.length > 0 ? alumnosRows : [{ Mensaje: "Sin alumnos" }]),
    "Alumnos"
  );

  return workbook;
};

export const buildGrupoExportHtml = ({ grupo, alumnos }: GrupoExportData): string => {
  const rows = alumnos
    .map(
      (alumno, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(`${alumno.nombre || ""} ${alumno.apellidos || ""}`.trim())}</td>
          <td>${escapeHtml(alumno.numeroControl || "")}</td>
          <td>${escapeHtml(alumno.carrera || "")}</td>
          <td>${escapeHtml(alumno.email || "-")}</td>
          <td>${escapeHtml(alumno.estado || "")}</td>
        </tr>
      `
    )
    .join("");

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Exportación de Grupo</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; color: #1E2A3A; }
          h1 { margin: 0 0 8px 0; color: #0C63B8; }
          .subtitle { color: #5D708A; margin-bottom: 18px; }
          .meta { background: #F5FAFF; border: 1px solid #DCE8F8; border-radius: 8px; padding: 12px; margin-bottom: 16px; }
          .meta p { margin: 4px 0; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #DCE3EE; padding: 8px; font-size: 12px; text-align: left; }
          th { background: #F1F6FC; text-transform: uppercase; color: #4D627F; }
          .empty { margin-top: 8px; color: #71829A; }
          .footer { margin-top: 20px; color: #8392A8; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>Exportación de Grupo</h1>
        <div class="subtitle">${escapeHtml(grupo.nombre)} • ${escapeHtml(grupo.periodo)}</div>

        <div class="meta">
          <p><strong>Materia:</strong> ${escapeHtml(grupo.materia)}</p>
          <p><strong>Carrera:</strong> ${escapeHtml(grupo.carrera)}</p>
          <p><strong>Semestre:</strong> ${escapeHtml(grupo.semestre)}</p>
          <p><strong>Horario:</strong> ${escapeHtml(grupo.horario || "Sin horario")}</p>
          <p><strong>Total de alumnos:</strong> ${alumnos.length}</p>
        </div>

        ${
          alumnos.length === 0
            ? '<div class="empty">No hay alumnos registrados para este grupo.</div>'
            : `<table>
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nombre completo</th>
                    <th>Número de control</th>
                    <th>Carrera</th>
                    <th>Email</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>`
        }

        <div class="footer">Generado por PlanearIA</div>
      </body>
    </html>
  `;
};

const exportarGrupoExcel = async (data: GrupoExportData): Promise<boolean> => {
  const workbook = buildGrupoWorkbook(data);
  const fileBaseName = buildFileBaseName(data.grupo.nombre);

  if (Platform.OS === "web") {
    const bytes = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([bytes], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileBaseName}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  }

  const uri = `${FileSystem.cacheDirectory || ""}${fileBaseName}.xlsx`;
  const base64 = XLSX.write(workbook, { bookType: "xlsx", type: "base64" });

  await FileSystem.writeAsStringAsync(uri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      dialogTitle: "Compartir grupo en Excel",
      UTI: ".xlsx",
    });
  }

  return true;
};

const exportarGrupoPdf = async (data: GrupoExportData): Promise<boolean> => {
  const html = buildGrupoExportHtml(data);

  if (Platform.OS === "web") {
    return openHtmlForPrint(html);
  }

  const fileBaseName = buildFileBaseName(data.grupo.nombre);
  const { uri } = await Print.printToFileAsync({ html });
  const shareUri = `${FileSystem.cacheDirectory || ""}${fileBaseName}.pdf`;

  await FileSystem.copyAsync({ from: uri, to: shareUri });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(shareUri, {
      mimeType: "application/pdf",
      dialogTitle: "Compartir grupo en PDF",
      UTI: ".pdf",
    });
  }

  return true;
};

export const exportarGrupoArchivo = async ({ formato, ...data }: ExportarGrupoArchivoParams) => {
  if (formato === "excel") {
    return exportarGrupoExcel(data);
  }
  return exportarGrupoPdf(data);
};
