import { Platform } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import type { EstadisticasGrupo } from "./grupoReportesService";
import type { EstadisticasAlumno } from "./alumnoReportesService";

interface ExportParams {
  grupoNombre: string;
  periodo: string;
  estadisticas: EstadisticasGrupo;
}

interface CalificacionResumen {
  periodo: string;
  promedio: number;
  estado: string;
}

interface AlumnoExportParams {
  alumnoNombre: string;
  periodo: string;
  estadisticas: EstadisticasAlumno;
  calificaciones: CalificacionResumen[];
}

const buildReportHtml = ({ grupoNombre, periodo, estadisticas }: ExportParams): string => {
  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Reporte del Grupo</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; color: #1E2A3A; }
          h1 { margin: 0 0 8px 0; color: #0C63B8; }
          .subtitle { color: #63738C; margin-bottom: 20px; }
          .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
          .card { border: 1px solid #DDE7F5; border-radius: 10px; padding: 12px; background: #F8FBFF; }
          .label { font-size: 12px; color: #70829C; text-transform: uppercase; }
          .value { font-size: 28px; font-weight: bold; margin-top: 4px; }
          .footer { margin-top: 24px; color: #8A97AA; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>Reportes del Grupo</h1>
        <div class="subtitle">${grupoNombre} • Periodo: ${periodo}</div>

        <div class="grid">
          <div class="card">
            <div class="label">Promedio General</div>
            <div class="value">${estadisticas.promedioGeneral.toFixed(1)}</div>
          </div>
          <div class="card">
            <div class="label">Aprobacion</div>
            <div class="value">${Math.round(estadisticas.indiceAprobacion)}%</div>
          </div>
          <div class="card">
            <div class="label">Reprobacion</div>
            <div class="value">${Math.round(estadisticas.indiceReprobacion)}%</div>
          </div>
          <div class="card">
            <div class="label">Asistencia</div>
            <div class="value">${Math.round(estadisticas.indiceAsistencia)}%</div>
          </div>
          <div class="card">
            <div class="label">Entregas a tiempo</div>
            <div class="value">${Math.round(estadisticas.indiceEntregasATiempo)}%</div>
          </div>
          <div class="card">
            <div class="label">Entregas tarde</div>
            <div class="value">${Math.round(estadisticas.indiceEntregasTarde)}%</div>
          </div>
        </div>

        <div class="footer">Generado por PlanearIA</div>
      </body>
    </html>
  `;
};

export const exportarReporteGrupoPDF = async (params: ExportParams): Promise<boolean> => {
  const html = buildReportHtml(params);

  if (Platform.OS === "web") {
    const win = window.open("", "_blank");
    if (!win) return false;
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
    return true;
  }

  const { uri } = await Print.printToFileAsync({ html });
  const canShare = await Sharing.isAvailableAsync();

  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: "Compartir reporte del grupo",
      UTI: ".pdf",
    });
  }

  return true;
};

const buildAlumnoReportHtml = ({
  alumnoNombre,
  periodo,
  estadisticas,
  calificaciones,
}: AlumnoExportParams): string => {
  const rows = calificaciones
    .slice(0, 10)
    .map(
      (item) => `
      <tr>
        <td>${item.periodo}</td>
        <td>${item.promedio.toFixed(1)}</td>
        <td>${item.estado}</td>
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
        <title>Reporte del Alumno</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; color: #1E2A3A; }
          h1 { margin: 0 0 8px 0; color: #0C63B8; }
          .subtitle { color: #63738C; margin-bottom: 20px; }
          .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-bottom: 16px; }
          .card { border: 1px solid #DDE7F5; border-radius: 10px; padding: 12px; background: #F8FBFF; }
          .label { font-size: 12px; color: #70829C; text-transform: uppercase; }
          .value { font-size: 28px; font-weight: bold; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #DCE3EE; padding: 8px; text-align: left; font-size: 12px; }
          th { background: #F1F6FC; color: #4D627F; }
          .footer { margin-top: 24px; color: #8A97AA; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>Reporte del Alumno</h1>
        <div class="subtitle">${alumnoNombre} • Periodo: ${periodo}</div>

        <div class="grid">
          <div class="card">
            <div class="label">Promedio general</div>
            <div class="value">${estadisticas.promedioGeneral.toFixed(1)}</div>
          </div>
          <div class="card">
            <div class="label">Asistencia</div>
            <div class="value">${Math.round(estadisticas.indiceAsistencia)}%</div>
          </div>
          <div class="card">
            <div class="label">Entregas a tiempo</div>
            <div class="value">${Math.round(estadisticas.indiceEntregasATiempo)}%</div>
          </div>
          <div class="card">
            <div class="label">No entregadas</div>
            <div class="value">${Math.round(estadisticas.indiceNoEntregadas)}%</div>
          </div>
        </div>

        <h3>Tabla de calificaciones</h3>
        <table>
          <thead>
            <tr>
              <th>Periodo</th>
              <th>Promedio</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="3">Sin calificaciones en el periodo seleccionado</td></tr>'}
          </tbody>
        </table>

        <div class="footer">Generado por PlanearIA</div>
      </body>
    </html>
  `;
};

const exportarReporteAlumnoPDF = async (params: AlumnoExportParams): Promise<boolean> => {
  const html = buildAlumnoReportHtml(params);

  if (Platform.OS === "web") {
    const win = window.open("", "_blank");
    if (!win) return false;
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
    return true;
  }

  const { uri } = await Print.printToFileAsync({ html });
  const canShare = await Sharing.isAvailableAsync();

  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: "Compartir reporte del alumno",
      UTI: ".pdf",
    });
  }

  return true;
};

const buildAlumnoReportSvg = ({
  alumnoNombre,
  periodo,
  estadisticas,
}: AlumnoExportParams): string => {
  const p = (n: number) => Math.round(Math.max(0, Math.min(100, n)));
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#EEF3FA" />
  <rect x="36" y="36" width="1128" height="558" rx="22" fill="#FFFFFF" />
  <text x="72" y="98" font-family="Arial" font-size="44" font-weight="700" fill="#0C63B8">Reporte del Alumno</text>
  <text x="72" y="140" font-family="Arial" font-size="24" fill="#60748F">${alumnoNombre} • ${periodo}</text>

  <rect x="72" y="184" width="240" height="150" rx="14" fill="#F8FBFF" stroke="#DDE7F5" />
  <text x="92" y="224" font-family="Arial" font-size="20" fill="#74839A">Promedio</text>
  <text x="92" y="292" font-family="Arial" font-size="62" font-weight="700" fill="#1E2A3A">${estadisticas.promedioGeneral.toFixed(1)}</text>

  <rect x="336" y="184" width="240" height="150" rx="14" fill="#F8FBFF" stroke="#DDE7F5" />
  <text x="356" y="224" font-family="Arial" font-size="20" fill="#74839A">Asistencia</text>
  <text x="356" y="292" font-family="Arial" font-size="56" font-weight="700" fill="#1E2A3A">${p(estadisticas.indiceAsistencia)}%</text>

  <rect x="600" y="184" width="240" height="150" rx="14" fill="#F8FBFF" stroke="#DDE7F5" />
  <text x="620" y="224" font-family="Arial" font-size="20" fill="#74839A">A tiempo</text>
  <text x="620" y="292" font-family="Arial" font-size="56" font-weight="700" fill="#1E2A3A">${p(estadisticas.indiceEntregasATiempo)}%</text>

  <rect x="864" y="184" width="240" height="150" rx="14" fill="#F8FBFF" stroke="#DDE7F5" />
  <text x="884" y="224" font-family="Arial" font-size="20" fill="#74839A">No entregadas</text>
  <text x="884" y="292" font-family="Arial" font-size="56" font-weight="700" fill="#1E2A3A">${p(estadisticas.indiceNoEntregadas)}%</text>

  <text x="72" y="404" font-family="Arial" font-size="24" font-weight="700" fill="#2A3B56">Distribución de entregas</text>
  <text x="72" y="448" font-family="Arial" font-size="22" fill="#0C63B8">• A tiempo: ${p(estadisticas.indiceEntregasATiempo)}%</text>
  <text x="72" y="488" font-family="Arial" font-size="22" fill="#F58026">• Tarde: ${p(estadisticas.indiceEntregasTarde)}%</text>
  <text x="72" y="528" font-family="Arial" font-size="22" fill="#C62828">• No entregadas: ${p(estadisticas.indiceNoEntregadas)}%</text>
</svg>`;
};

const exportarReporteAlumnoImagen = async (params: AlumnoExportParams): Promise<boolean> => {
  const svg = buildAlumnoReportSvg(params);

  if (Platform.OS === "web") {
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "reporte_alumno.svg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  }

  const uri = `${FileSystem.cacheDirectory || ""}reporte_alumno.svg`;
  await FileSystem.writeAsStringAsync(uri, svg, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: "image/svg+xml",
      dialogTitle: "Compartir reporte del alumno",
      UTI: ".svg",
    });
  }

  return true;
};

export const exportarReporteAlumno = async (
  params: AlumnoExportParams & { formato: "pdf" | "image" }
): Promise<boolean> => {
  if (params.formato === "image") {
    return exportarReporteAlumnoImagen(params);
  }
  return exportarReporteAlumnoPDF(params);
};
