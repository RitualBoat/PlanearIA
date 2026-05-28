import type { DocumentPickerAsset } from "expo-document-picker";
import { NivelAcademico as NivelAcademicoLegacy, type Actividad } from "../../types/planeacion";
import {
  NivelAcademico,
  type InstrumentoEvaluacion,
  type PlaneacionDocumento,
  type Sesion,
} from "../../types/planeacionV2";
import type { PlantillaDocumento } from "../../types/plantillaDocumento";
import type { Usuario } from "../context/AuthContext";
import { apiRequest } from "../utils/apiClient";
import { buildPlaneacionDocumentoBase } from "../utils/createPlaneacionDocumentoBase";

export type PlaneacionImportParseMode = "planeacion" | "plantilla";

export interface PlaneacionImportDraft {
  asignatura: string;
  grado: string;
  grupo: string;
  unidadTematica: string;
  temaSesion: string;
  aprendizajesEsperados: string[];
  actividades: Actividad[];
  recursos: string[];
  evaluacion: string;
  evidencias: string[];
  observaciones: string;
  nivelAcademico: NivelAcademico;
  sourceTextLength: number;
}

export interface ExtractedPlaneacionText {
  fileName: string;
  extension: string;
  rawText: string;
  fallbackSubject: string;
  nivelAcademico: NivelAcademico;
}

export interface PlantillaImportResult {
  parseMode: "plantilla";
  fileName: string;
  rawText: string;
  nivelAcademico: NivelAcademico;
  plantilla: PlantillaDocumento;
  sourceTextLength: number;
}

export interface ParseImportedFileOptions {
  parseMode?: PlaneacionImportParseMode;
  nivelAcademico?: NivelAcademico;
  userId?: string;
}

const DEFAULT_ACTIVIDADES: Actividad[] = [
  {
    tipo: "inicio",
    descripcion: "Activacion de conocimientos previos.",
    duracion: 10,
  },
  {
    tipo: "desarrollo",
    descripcion: "Desarrollo del tema con actividades guiadas.",
    duracion: 30,
  },
  {
    tipo: "cierre",
    descripcion: "Cierre, retroalimentacion y conclusiones.",
    duracion: 10,
  },
];

const DEFAULT_DRAFT: PlaneacionImportDraft = {
  asignatura: "",
  grado: "",
  grupo: "",
  unidadTematica: "",
  temaSesion: "",
  aprendizajesEsperados: [],
  actividades: DEFAULT_ACTIVIDADES,
  recursos: [],
  evaluacion: "",
  evidencias: [],
  observaciones: "",
  nivelAcademico: NivelAcademico.PRIMARIA,
  sourceTextLength: 0,
};

const cleanText = (value: string): string => {
  return value.replace(/\r/g, "").replace(/\t/g, " ").replace(/\u00A0/g, " ");
};

const readLabelValue = (text: string, labels: string[]): string => {
  const escaped = labels.map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const regex = new RegExp(`(?:${escaped})\\s*[:\\-]\\s*(.+)`, "i");
  const match = text.match(regex);

  if (!match?.[1]) return "";
  return match[1].split("\n")[0].trim();
};

const readSectionItems = (text: string, sectionTitles: string[]): string[] => {
  for (const title of sectionTitles) {
    const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`${escaped}\\s*[:\\-]?\\s*([\\s\\S]{0,900})`, "i");
    const sectionMatch = text.match(regex);

    if (!sectionMatch?.[1]) continue;

    const sectionText = sectionMatch[1]
      .split(/\n\s*\n/)[0]
      .split(
        /(?:\n\s*(?:asignatura|materia|tema|evaluacion|recursos|evidencias|observaciones)\s*[:-])/i
      )[0];

    const candidates = sectionText
      .split(/\n|;|\u2022|-/)
      .map((item) => item.replace(/^\s*\d+[.)]?\s*/, "").trim())
      .filter((item) => item.length > 2)
      .slice(0, 12);

    if (candidates.length > 0) return candidates;
  }

  return [];
};

const inferActividades = (text: string): Actividad[] => {
  const extractByTipo = (tipo: Actividad["tipo"], labels: string[]): Actividad => {
    const description = readLabelValue(text, labels);
    const defaultItem = DEFAULT_ACTIVIDADES.find((item) => item.tipo === tipo) || DEFAULT_ACTIVIDADES[0];

    return {
      tipo,
      descripcion: description || defaultItem.descripcion,
      duracion: defaultItem.duracion,
    };
  };

  return [
    extractByTipo("inicio", ["inicio", "apertura"]),
    extractByTipo("desarrollo", ["desarrollo", "actividad principal"]),
    extractByTipo("cierre", ["cierre", "conclusion", "conclusión"]),
  ];
};

export const inferNivel = (text: string): NivelAcademico => {
  const lower = text.toLowerCase();

  if (lower.includes("universidad") || lower.includes("licenciatura")) return NivelAcademico.UNIVERSIDAD;
  if (lower.includes("preparatoria") || lower.includes("bachillerato")) return NivelAcademico.PREPARATORIA;
  if (lower.includes("secundaria")) return NivelAcademico.SECUNDARIA;
  if (lower.includes("primaria")) return NivelAcademico.PRIMARIA;

  const gradoMatch = lower.match(/\b([1-6])\s*(?:°|o|er|to)?\s*grado\b/);
  if (gradoMatch) return NivelAcademico.PRIMARIA;

  return NivelAcademico.PRIMARIA;
};

const fallbackSubjectFromFileName = (fileName: string): string => {
  return fileName.replace(/\.(pdf|docx|doc)$/i, "").replace(/[-_]+/g, " ").trim();
};

const parseRawTextToDraft = (
  rawText: string,
  fileName: string,
  nivelAcademico?: NivelAcademico
): PlaneacionImportDraft => {
  const text = cleanText(rawText);
  const inferredNivel = nivelAcademico || inferNivel(`${text}\n${fileName}`);

  const asignatura = readLabelValue(text, ["asignatura", "materia"]) || fallbackSubjectFromFileName(fileName);
  const grado = readLabelValue(text, ["grado", "nivel", "semestre"]);
  const grupo = readLabelValue(text, ["grupo", "salon", "salón"]);
  const unidadTematica = readLabelValue(text, ["unidad tematica", "unidad temática", "unidad"]);
  const temaSesion = readLabelValue(text, ["tema de la sesion", "tema de la sesión", "tema"]) || unidadTematica;
  const evaluacion = readLabelValue(text, ["evaluacion", "evaluación", "instrumento de evaluacion"]);
  const observaciones = readLabelValue(text, ["observaciones", "notas"]);

  return {
    asignatura,
    grado,
    grupo,
    unidadTematica,
    temaSesion,
    aprendizajesEsperados: readSectionItems(text, [
      "aprendizajes esperados",
      "objetivos",
      "resultados de aprendizaje",
      "pda",
    ]),
    actividades: inferActividades(text),
    recursos: readSectionItems(text, ["recursos", "materiales", "material didactico"]),
    evaluacion,
    evidencias: readSectionItems(text, ["evidencias", "productos", "entregables"]),
    observaciones,
    nivelAcademico: inferredNivel,
    sourceTextLength: text.trim().length,
  };
};

const extractTextFromDocx = async (arrayBuffer: ArrayBuffer): Promise<string> => {
  const mammothModule = (await import("mammoth/mammoth.browser")) as {
    extractRawText?: (input: { arrayBuffer: ArrayBuffer }) => Promise<{ value?: string }>;
    default?: {
      extractRawText?: (input: { arrayBuffer: ArrayBuffer }) => Promise<{ value?: string }>;
    };
  };
  const mammothApi = mammothModule.default || mammothModule;

  if (!mammothApi.extractRawText) {
    throw new Error("No se pudo inicializar el parser DOCX.");
  }

  const result = await mammothApi.extractRawText({ arrayBuffer });
  return result.value || "";
};

const extractTextFromPdf = async (arrayBuffer: ArrayBuffer): Promise<string> => {
  const pdfjs = (await import("pdfjs-dist/legacy/build/pdf.mjs")) as {
    getDocument: (options: Record<string, unknown>) => { promise: Promise<any> };
  };

  const data = new Uint8Array(arrayBuffer);
  const documentTask = pdfjs.getDocument({ data, disableWorker: true });
  const pdf = await documentTask.promise;
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = (content.items || [])
      .map((item: { str?: string }) => item?.str || "")
      .join(" ")
      .trim();

    if (text) pages.push(text);
  }

  return pages.join("\n");
};

const readAssetAsArrayBuffer = async (asset: DocumentPickerAsset): Promise<ArrayBuffer> => {
  const response = await fetch(asset.uri);
  if (!response.ok) {
    throw new Error("No se pudo leer el archivo seleccionado.");
  }

  return response.arrayBuffer();
};

export const extractRawTextFromImportedFile = async (
  asset: DocumentPickerAsset
): Promise<ExtractedPlaneacionText> => {
  const fileName = asset.name || "planeacion";
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (!extension || !["pdf", "docx", "doc"].includes(extension)) {
    throw new Error("Formato no compatible. Usa PDF o DOCX.");
  }

  const arrayBuffer = await readAssetAsArrayBuffer(asset);
  let rawText = "";

  if (extension === "pdf") rawText = await extractTextFromPdf(arrayBuffer);
  if (extension === "docx" || extension === "doc") rawText = await extractTextFromDocx(arrayBuffer);

  const fallbackSubject = fallbackSubjectFromFileName(fileName);
  const cleanRaw = cleanText(rawText);

  return {
    fileName,
    extension,
    rawText: cleanRaw,
    fallbackSubject,
    nivelAcademico: inferNivel(`${cleanRaw}\n${fileName}`),
  };
};

const normalizePlantillaFromApi = (
  value: PlantillaDocumento,
  userId: string,
  nivelAcademico: NivelAcademico
): PlantillaDocumento => {
  const now = new Date().toISOString();
  return {
    ...value,
    id: value.id || `plantilla_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    userId: value.userId || userId,
    nivelAcademico: value.nivelAcademico || nivelAcademico,
    origen: value.origen || "escaner",
    secciones: Array.isArray(value.secciones) ? value.secciones : [],
    fechaCreacion: value.fechaCreacion || now,
    fechaModificacion: value.fechaModificacion || now,
  };
};

export const scanPlantillaFromRawText = async (
  textoRaw: string,
  options: { nivelAcademico?: NivelAcademico; userId?: string } = {}
): Promise<PlantillaDocumento> => {
  const text = textoRaw.trim();
  if (text.length < 30) {
    throw new Error("El texto extraido es demasiado corto para escanear una plantilla.");
  }

  const nivelAcademico = options.nivelAcademico || inferNivel(text);
  const response = await apiRequest("/api/planeaciones/escanear-plantilla", {
    method: "POST",
    body: JSON.stringify({
      textoRaw: text,
      nivelAcademico,
    }),
  });

  const payload = await response.json();
  if (!response.ok || !payload?.success || !payload?.data?.plantilla) {
    throw new Error(payload?.error || "No se pudo escanear la plantilla.");
  }

  return normalizePlantillaFromApi(
    payload.data.plantilla as PlantillaDocumento,
    options.userId || "guest",
    nivelAcademico
  );
};

export function parseImportedPlaneacionFile(asset: DocumentPickerAsset): Promise<PlaneacionImportDraft>;
export function parseImportedPlaneacionFile(
  asset: DocumentPickerAsset,
  options: ParseImportedFileOptions & { parseMode: "planeacion" }
): Promise<PlaneacionImportDraft>;
export function parseImportedPlaneacionFile(
  asset: DocumentPickerAsset,
  options: ParseImportedFileOptions & { parseMode: "plantilla" }
): Promise<PlantillaImportResult>;
export async function parseImportedPlaneacionFile(
  asset: DocumentPickerAsset,
  options: ParseImportedFileOptions = {}
): Promise<PlaneacionImportDraft | PlantillaImportResult> {
  const extracted = await extractRawTextFromImportedFile(asset);
  const nivelAcademico = options.nivelAcademico || extracted.nivelAcademico;

  if (!extracted.rawText.trim()) {
    if (options.parseMode === "plantilla") {
      throw new Error("No se pudo extraer texto del archivo para escanear la plantilla.");
    }

    return {
      ...DEFAULT_DRAFT,
      asignatura: extracted.fallbackSubject,
      nivelAcademico,
    };
  }

  if (options.parseMode === "plantilla") {
    const plantilla = await scanPlantillaFromRawText(extracted.rawText, {
      nivelAcademico,
      userId: options.userId,
    });

    return {
      parseMode: "plantilla",
      fileName: extracted.fileName,
      rawText: extracted.rawText,
      nivelAcademico,
      plantilla,
      sourceTextLength: extracted.rawText.trim().length,
    };
  }

  return parseRawTextToDraft(extracted.rawText, extracted.fileName, nivelAcademico);
}

const toRichTextString = (plainText = ""): string => {
  return JSON.stringify({
    type: "doc",
    content: plainText
      ? [
          {
            type: "paragraph",
            content: [{ type: "text", text: plainText }],
          },
        ]
      : [{ type: "paragraph" }],
  });
};

const normalizeDuracion = (actividades: Actividad[]): number => {
  const total = actividades.reduce((sum, item) => sum + (Number(item.duracion) || 0), 0);
  return total > 0 ? total : 50;
};

const buildSesionFromDraft = (draft: PlaneacionImportDraft): Sesion => {
  const byType = new Map<Actividad["tipo"], Actividad>();
  draft.actividades.forEach((actividad) => byType.set(actividad.tipo, actividad));

  return {
    id: `sesion_${Date.now()}_1`,
    numero: 1,
    tipo: "regular",
    inicio: toRichTextString(byType.get("inicio")?.descripcion || ""),
    desarrollo: toRichTextString(byType.get("desarrollo")?.descripcion || ""),
    cierre: toRichTextString(byType.get("cierre")?.descripcion || ""),
    tarea: "",
  };
};

const normalizeEvaluacion = (value: string): InstrumentoEvaluacion | undefined => {
  const text = value.trim();
  if (!text) return undefined;
  return {
    tipo: "otro",
    escala: [],
    criterios: [{ id: `crit_${Date.now()}`, descripcion: text }],
  };
};

export const buildPlaneacionDocumentoFromImportDraft = (
  draft: PlaneacionImportDraft,
  options: {
    sourceText?: string;
    userId?: string;
    usuario?: Usuario | null;
  } = {}
): PlaneacionDocumento => {
  const nivelAcademico = draft.nivelAcademico || inferNivel(options.sourceText || "");
  const doc = buildPlaneacionDocumentoBase({
    nivelAcademico,
    userId: options.userId || "guest",
    usuario: options.usuario,
    asignatura: draft.asignatura,
    grado: draft.grado,
    grupos: draft.grupo ? [draft.grupo] : [],
  });

  return {
    ...doc,
    datosGenerales: {
      ...doc.datosGenerales,
      fechaInicio: doc.datosGenerales.fechaInicio,
      fechaFin: doc.datosGenerales.fechaFin,
    },
    elementosCurriculares: {
      ...doc.elementosCurriculares,
      proposito: draft.aprendizajesEsperados.join("\n"),
      producto: draft.evidencias.join("\n"),
      contenido: draft.unidadTematica || draft.temaSesion,
      pda: draft.temaSesion || draft.unidadTematica,
      instrumentoEvaluacion: draft.evaluacion,
    },
    sesiones: [buildSesionFromDraft(draft)],
    evaluacionFinal: normalizeEvaluacion(draft.evaluacion) || doc.evaluacionFinal,
    observaciones: draft.observaciones
      ? [{ texto: draft.observaciones, categoria: "general" }]
      : doc.observaciones,
    camposNivel: {
      ...doc.camposNivel,
      duracionTotal: normalizeDuracion(draft.actividades),
      recursos: draft.recursos,
      sourceTextLength: draft.sourceTextLength,
    },
  };
};

export const buildPlaneacionFromImportDraft = (
  draft: PlaneacionImportDraft,
  sourceText?: string
): PlaneacionDocumento => {
  return buildPlaneacionDocumentoFromImportDraft(draft, { sourceText });
};

export const toLegacyNivel = (nivel: NivelAcademico): NivelAcademicoLegacy => {
  if (nivel === NivelAcademico.SECUNDARIA) return NivelAcademicoLegacy.SECUNDARIA;
  if (nivel === NivelAcademico.PREPARATORIA) return NivelAcademicoLegacy.PREPARATORIA;
  if (nivel === NivelAcademico.UNIVERSIDAD) return NivelAcademicoLegacy.UNIVERSIDAD;
  return NivelAcademicoLegacy.PRIMARIA;
};
