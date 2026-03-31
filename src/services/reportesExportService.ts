import { Platform } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import type { EstadisticasGrupo } from "./grupoReportesService";

interface ExportParams {
  grupoNombre: string;
  periodo: string;
  estadisticas: EstadisticasGrupo;
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
