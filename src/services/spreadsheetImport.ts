import * as DocumentPicker from "expo-document-picker";
import * as XLSX from "xlsx";

// Endurecimiento de la ruta de LECTURA de archivos no confiables (issue #133).
// El build 0.20.3 corrige las advisories conocidas y el tope evita agotar recursos
// con archivos enormes. Ninguna de las dos medidas puede interrumpir un bloqueo
// sincrono dentro de XLSX.read; ese riesgo residual se gobierna en el registro de deuda.
// La exportacion no pasa por aqui: opera sobre datos propios de la app.
export const MAX_IMPORT_BYTES = 5 * 1024 * 1024; // 5 MB

export const SUPPORTED_IMPORT_EXTENSIONS = ["csv", "xlsx", "xls"] as const;

// Error de dominio para fallos que lanzan una excepcion. Un bloqueo sincrono del
// parser no devuelve el control a JavaScript y, por tanto, no entra en este contrato.
export class SpreadsheetImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SpreadsheetImportError";
  }
}

const getFileExtension = (fileName: string): string => {
  return fileName.split(".").pop()?.toLowerCase() || "";
};

export const assertSupportedFile = (fileName: string): void => {
  const ext = getFileExtension(fileName);
  if (!SUPPORTED_IMPORT_EXTENSIONS.includes(ext as (typeof SUPPORTED_IMPORT_EXTENSIONS)[number])) {
    throw new SpreadsheetImportError("Formato no soportado. Usa .csv o .xlsx");
  }
};

const assertWithinSizeLimit = (bytes: number): void => {
  if (bytes > MAX_IMPORT_BYTES) {
    throw new SpreadsheetImportError("El archivo es demasiado grande. El limite es de 5 MB.");
  }
};

const parseWorkbookToRows = (arrayBuffer: ArrayBuffer): Record<string, unknown>[] => {
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(arrayBuffer, { type: "array" });
  } catch {
    // Solo las excepciones lanzadas se convierten en un error controlado.
    throw new SpreadsheetImportError("El archivo no es una hoja de calculo valida.");
  }

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    return [];
  }

  const sheet = workbook.Sheets[firstSheetName];
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });
};

// Lee un asset elegido por el docente y devuelve sus filas como objetos.
// Valida el tamano dos veces: contra el tamano informado por el selector (antes de
// leer nada de red/disco) y contra el tamano real leido (el selector puede omitirlo).
export const readSpreadsheetRows = async (
  asset: DocumentPicker.DocumentPickerAsset
): Promise<Record<string, unknown>[]> => {
  if (typeof asset.size === "number") {
    assertWithinSizeLimit(asset.size);
  }

  const response = await fetch(asset.uri);
  if (!response.ok) {
    throw new SpreadsheetImportError("No se pudo leer el archivo seleccionado.");
  }

  const arrayBuffer = await response.arrayBuffer();
  assertWithinSizeLimit(arrayBuffer.byteLength);

  return parseWorkbookToRows(arrayBuffer);
};
