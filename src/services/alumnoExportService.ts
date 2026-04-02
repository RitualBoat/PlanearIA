import { Platform } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import * as XLSX from "xlsx";
import type { Alumno } from "../../types";

export type AlumnoExportFormat = "pdf" | "excel";

export interface AlumnoExportData {
  alumnos: Alumno[];
}

export interface ExportarAlumnosArchivoParams extends AlumnoExportData {
  formato: AlumnoExportFormat;
}

const escapeHtml = (value: unknown): string => {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const formatDate = (value: Date): string => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const buildFileBaseName = (): string => {
  const stamp = formatDate(new Date());
  return `alumnos_${stamp}`;
};

export const buildAlumnoExportRows = (alumnos: Alumno[]): Record<string, unknown>[] => {
  return alumnos.map((alumno, index) => ({
    No: index + 1,
    Nombre: alumno.nombre || "",
    Apellidos: alumno.apellidos || "",
    NumeroControl: alumno.numeroControl || "",
    Carrera: alumno.carrera || "",
    Email: alumno.email || "",
    Telefono: alumno.telefono || "",
    Escuela: alumno.escuela || "",
    Estado: alumno.estado || "",
  }));
};

export const buildAlumnoWorkbook = (alumnos: Alumno[]): XLSX.WorkBook => {
  const rows = buildAlumnoExportRows(alumnos);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{ Mensaje: "Sin alumnos" }]),
    "Alumnos"
  );

  return workbook;
};

export const buildAlumnoExportHtml = (alumnos: Alumno[]): string => {
  const rows = alumnos
    .map(
      (alumno, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(`${alumno.nombre || ""} ${alumno.apellidos || ""}`.trim())}</td>
          <td>${escapeHtml(alumno.numeroControl || "")}</td>
          <td>${escapeHtml(alumno.carrera || "")}</td>
          <td>${escapeHtml(alumno.email || "-")}</td>
          <td>${escapeHtml(alumno.telefono || "-")}</td>
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
        <title>Exportación de Alumnos</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; color: #1E2A3A; }
          h1 { margin: 0 0 8px 0; color: #0C63B8; }
          .subtitle { color: #5D708A; margin-bottom: 18px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #DCE3EE; padding: 8px; font-size: 12px; text-align: left; }
          th { background: #F1F6FC; text-transform: uppercase; color: #4D627F; }
          .empty { margin-top: 8px; color: #71829A; }
          .footer { margin-top: 20px; color: #8392A8; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>Lista de Alumnos</h1>
        <div class="subtitle">Total: ${alumnos.length} alumnos • ${formatDate(new Date())}</div>

        ${
          alumnos.length === 0
            ? '<div class="empty">No hay alumnos registrados.</div>'
            : `<table>
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nombre completo</th>
                    <th>Número de control</th>
                    <th>Carrera</th>
                    <th>Email</th>
                    <th>Teléfono</th>
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

const exportarAlumnosExcel = async (data: AlumnoExportData): Promise<boolean> => {
  const workbook = buildAlumnoWorkbook(data.alumnos);
  const fileBaseName = buildFileBaseName();

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
      dialogTitle: "Compartir alumnos en Excel",
      UTI: ".xlsx",
    });
  }

  return true;
};

const exportarAlumnosPdf = async (data: AlumnoExportData): Promise<boolean> => {
  const html = buildAlumnoExportHtml(data.alumnos);

  if (Platform.OS === "web") {
    const win = window.open("", "_blank");
    if (!win) return false;
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
    return true;
  }

  const fileBaseName = buildFileBaseName();
  const { uri } = await Print.printToFileAsync({ html });
  const shareUri = `${FileSystem.cacheDirectory || ""}${fileBaseName}.pdf`;

  await FileSystem.copyAsync({ from: uri, to: shareUri });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(shareUri, {
      mimeType: "application/pdf",
      dialogTitle: "Compartir alumnos en PDF",
      UTI: ".pdf",
    });
  }

  return true;
};

export const exportarAlumnosArchivo = async ({
  formato,
  ...data
}: ExportarAlumnosArchivoParams): Promise<boolean> => {
  if (formato === "excel") {
    return exportarAlumnosExcel(data);
  }
  return exportarAlumnosPdf(data);
};
