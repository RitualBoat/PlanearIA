import * as DocumentPicker from "expo-document-picker";
import * as XLSX from "xlsx";
import type { Carrera, Grupo } from "../../types";

const SUPPORTED_EXTENSIONS = ["csv", "xlsx", "xls"] as const;
const VALID_CARRERAS: Carrera[] = ["ISC", "IGE", "ARQ", "ITICS"];

export interface GrupoImportRowDraft {
  nombre: string;
  materia: string;
  carrera: string;
  semestre: string;
  periodo: string;
  cantidadAlumnos: string;
}

export interface GrupoImportErrorRow {
  rowIndex: number;
  draft: GrupoImportRowDraft;
  errors: string[];
}

export interface GrupoImportResult {
  fileName: string;
  validRows: GrupoImportRowDraft[];
  errorRows: GrupoImportErrorRow[];
  previewRows: GrupoImportRowDraft[];
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

export const mapRawRowToDraft = (row: Record<string, unknown>): GrupoImportRowDraft => {
  return {
    nombre: getByAliases(row, ["nombre", "grupo", "groupname", "nombredelgrupo"]),
    materia: getByAliases(row, ["materia", "asignatura", "subject"]),
    carrera: getByAliases(row, ["carrera", "programa", "programaacademico"]),
    semestre: getByAliases(row, ["semestre", "grado", "semester"]),
    periodo: getByAliases(row, ["periodo", "ciclo", "period", "cuatrimestre"]),
    cantidadAlumnos: getByAliases(row, ["cantidadalumnos", "alumnos", "students", "totalalumnos"]),
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

export const validateImportDraft = (draft: GrupoImportRowDraft): string[] => {
  const errors: string[] = [];

  if (!draft.nombre.trim()) errors.push("Nombre de grupo requerido");
  if (!draft.materia.trim()) errors.push("Materia requerida");

  const carrera = normalizeCarrera(draft.carrera);
  if (!carrera) errors.push("Carrera inválida");

  const semestre = Number(draft.semestre);
  if (!Number.isFinite(semestre) || semestre <= 0) {
    errors.push("Semestre inválido");
  }

  return errors;
};

export const buildGrupoFromDraft = (
  draft: GrupoImportRowDraft,
  id: number,
  profesorId = 1
): Partial<Grupo> => {
  const carrera = normalizeCarrera(draft.carrera) || "ISC";
  const semestreRaw = Number(draft.semestre);
  const semestre = Number.isFinite(semestreRaw) && semestreRaw > 0 ? Math.floor(semestreRaw) : 1;
  const cantidadRaw = Number(draft.cantidadAlumnos);

  return {
    id,
    nombre: draft.nombre.trim(),
    materia: draft.materia.trim(),
    carrera,
    semestre,
    periodo: draft.periodo.trim() || "Enero-Junio 2026",
    profesorId,
    cantidadAlumnos: Number.isFinite(cantidadRaw) && cantidadRaw >= 0 ? Math.floor(cantidadRaw) : 0,
    estado: "activo",
    fechaCreacion: new Date(),
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

export const parseGruposFromAsset = async (
  asset: DocumentPicker.DocumentPickerAsset
): Promise<GrupoImportResult> => {
  const fileName = asset.name || "grupos.csv";
  assertSupportedFile(fileName);

  const arrayBuffer = await readAssetAsArrayBuffer(asset);
  const rows = parseWorkbookToRows(arrayBuffer);

  const validRows: GrupoImportRowDraft[] = [];
  const errorRows: GrupoImportErrorRow[] = [];

  rows.forEach((row, index) => {
    const draft = mapRawRowToDraft(row);
    const errors = validateImportDraft(draft);

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
