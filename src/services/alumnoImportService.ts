import * as DocumentPicker from "expo-document-picker";
import * as XLSX from "xlsx";
import type { Alumno, Carrera } from "../../types";

const SUPPORTED_EXTENSIONS = ["csv", "xlsx", "xls"] as const;
const VALID_CARRERAS: Carrera[] = ["ISC", "IGE", "ARQ", "ITICS"];

export interface AlumnoImportRowDraft {
  nombre: string;
  apellidos: string;
  numeroControl: string;
  carrera: string;
  email: string;
  telefono: string;
  escuela: string;
}

export interface AlumnoImportErrorRow {
  rowIndex: number;
  draft: AlumnoImportRowDraft;
  errors: string[];
}

export interface AlumnoImportResult {
  fileName: string;
  validRows: AlumnoImportRowDraft[];
  errorRows: AlumnoImportErrorRow[];
  previewRows: AlumnoImportRowDraft[];
}

const normalizeHeader = (header: string): string => {
  return header
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "");
};

const getByAliases = (row: Record<string, unknown>, aliases: string[]): string => {
  for (const alias of aliases) {
    const key = Object.keys(row).find((candidate) => normalizeHeader(candidate) === alias);
    if (!key) continue;

    const value = row[key];
    if (value === undefined || value === null) return "";
    return String(value).trim();
  }

  return "";
};

export const mapRawRowToDraft = (row: Record<string, unknown>): AlumnoImportRowDraft => {
  return {
    nombre: getByAliases(row, ["nombre", "name", "nombres", "primernombre"]),
    apellidos: getByAliases(row, [
      "apellidos",
      "apellido",
      "lastname",
      "apellidopaterno",
      "surnames",
    ]),
    numeroControl: getByAliases(row, [
      "numerocontrol",
      "numerodecontrol",
      "matricula",
      "controlnumber",
      "nocontrol",
      "id",
    ]),
    carrera: getByAliases(row, ["carrera", "programa", "programaacademico", "career"]),
    email: getByAliases(row, ["email", "correo", "correoelectronico", "mail"]),
    telefono: getByAliases(row, ["telefono", "tel", "phone", "celular", "movil"]),
    escuela: getByAliases(row, ["escuela", "institucion", "school", "plantel"]),
  };
};

const normalizeCarrera = (value: string): Carrera | null => {
  const upper = value.trim().toUpperCase();

  if (VALID_CARRERAS.includes(upper as Carrera)) {
    return upper as Carrera;
  }

  if (upper.includes("SIST") || upper.includes("SOFT") || upper.includes("COMP")) {
    return "ISC";
  }

  if (upper.includes("GEST")) {
    return "IGE";
  }

  if (upper.includes("ARQ")) {
    return "ARQ";
  }

  if (upper.includes("TEC") || upper.includes("TIC")) {
    return "ITICS";
  }

  return null;
};

export const validateAlumnoImportDraft = (draft: AlumnoImportRowDraft): string[] => {
  const errors: string[] = [];

  if (!draft.nombre.trim()) errors.push("Nombre requerido");
  if (!draft.apellidos.trim()) errors.push("Apellidos requeridos");
  if (!draft.numeroControl.trim()) errors.push("Número de control requerido");

  const carrera = normalizeCarrera(draft.carrera);
  if (!carrera) errors.push("Carrera inválida");

  if (draft.email.trim()) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(draft.email.trim())) {
      errors.push("Email inválido");
    }
  }

  return errors;
};

export const buildAlumnoFromDraft = (
  draft: AlumnoImportRowDraft,
  id: number,
  grupoId?: number
): Omit<Alumno, "id"> & { id: number } => {
  const carrera = normalizeCarrera(draft.carrera) || "ISC";

  return {
    id,
    nombre: draft.nombre.trim(),
    apellidos: draft.apellidos.trim(),
    numeroControl: draft.numeroControl.trim(),
    carrera,
    email: draft.email.trim() || undefined,
    telefono: draft.telefono.trim() || undefined,
    escuela: draft.escuela.trim() || undefined,
    grupoId,
    fechaIngreso: new Date(),
    estado: "activo",
  };
};

const parseWorkbookToRows = (arrayBuffer: ArrayBuffer): Record<string, unknown>[] => {
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    return [];
  }

  const sheet = workbook.Sheets[firstSheetName];
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });
};

const getFileExtension = (fileName: string): string => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  return ext || "";
};

const assertSupportedFile = (fileName: string): void => {
  const ext = getFileExtension(fileName);
  if (!SUPPORTED_EXTENSIONS.includes(ext as (typeof SUPPORTED_EXTENSIONS)[number])) {
    throw new Error("Formato no soportado. Usa .csv o .xlsx");
  }
};

const readAssetAsArrayBuffer = async (
  asset: DocumentPicker.DocumentPickerAsset
): Promise<ArrayBuffer> => {
  const response = await fetch(asset.uri);
  if (!response.ok) {
    throw new Error("No se pudo leer el archivo seleccionado.");
  }

  return response.arrayBuffer();
};

export const parseAlumnosFromAsset = async (
  asset: DocumentPicker.DocumentPickerAsset
): Promise<AlumnoImportResult> => {
  const fileName = asset.name || "alumnos.csv";
  assertSupportedFile(fileName);

  const arrayBuffer = await readAssetAsArrayBuffer(asset);
  const rows = parseWorkbookToRows(arrayBuffer);

  const validRows: AlumnoImportRowDraft[] = [];
  const errorRows: AlumnoImportErrorRow[] = [];

  rows.forEach((row, index) => {
    const draft = mapRawRowToDraft(row);
    const errors = validateAlumnoImportDraft(draft);

    if (errors.length === 0) {
      validRows.push(draft);
      return;
    }

    errorRows.push({
      rowIndex: index + 2,
      draft,
      errors,
    });
  });

  return {
    fileName,
    validRows,
    errorRows,
    previewRows: [...validRows.slice(0, 4), ...errorRows.slice(0, 2).map((item) => item.draft)],
  };
};
