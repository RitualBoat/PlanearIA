import type { DocumentPickerAsset } from "expo-document-picker";
import {
  NivelAcademico,
  Planeacion,
  PlaneacionSecundaria,
  PlaneacionBase,
  Actividad,
} from "../../types/planeacion";

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
  sourceTextLength: number;
}

const DEFAULT_ACTIVIDADES: Actividad[] = [
  {
    tipo: "inicio",
    descripcion: "Activación de conocimientos previos.",
    duracion: 10,
  },
  {
    tipo: "desarrollo",
    descripcion: "Desarrollo del tema con actividades guiadas.",
    duracion: 30,
  },
  {
    tipo: "cierre",
    descripcion: "Cierre, retroalimentación y conclusiones.",
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
  sourceTextLength: 0,
};

const cleanText = (value: string): string => {
  return value
    .replace(/\r/g, "")
    .replace(/\t/g, " ")
    .replace(/\u00A0/g, " ");
};

const readLabelValue = (text: string, labels: string[]): string => {
  const escaped = labels.map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");

  const regex = new RegExp(`(?:${escaped})\\s*[:\\-]\\s*(.+)`, "i");
  const match = text.match(regex);

  if (!match?.[1]) {
    return "";
  }

  return match[1].split("\n")[0].trim();
};

const readSectionItems = (text: string, sectionTitles: string[]): string[] => {
  for (const title of sectionTitles) {
    const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`${escaped}\\s*[:\\-]?\\s*([\\s\\S]{0,900})`, "i");
    const sectionMatch = text.match(regex);

    if (!sectionMatch?.[1]) {
      continue;
    }

    const sectionText = sectionMatch[1]
      .split(/\n\s*\n/)[0]
      .split(
        /(?:\n\s*(?:asignatura|tema|evaluacion|recursos|evidencias|observaciones)\s*[:-])/i
      )[0];

    const candidates = sectionText
      .split(/\n|;|\u2022|-/)
      .map((item) => item.replace(/^\s*\d+[.)]?\s*/, "").trim())
      .filter((item) => item.length > 2)
      .slice(0, 12);

    if (candidates.length > 0) {
      return candidates;
    }
  }

  return [];
};

const inferActividades = (text: string): Actividad[] => {
  const extractByTipo = (tipo: Actividad["tipo"], labels: string[]): Actividad => {
    const description = readLabelValue(text, labels);

    const defaultItem =
      DEFAULT_ACTIVIDADES.find((item) => item.tipo === tipo) || DEFAULT_ACTIVIDADES[0];

    return {
      tipo,
      descripcion: description || defaultItem.descripcion,
      duracion: defaultItem.duracion,
    };
  };

  const inicio = extractByTipo("inicio", ["inicio", "apertura"]);
  const desarrollo = extractByTipo("desarrollo", ["desarrollo", "actividad principal"]);
  const cierre = extractByTipo("cierre", ["cierre", "conclusion", "conclusión"]);

  return [inicio, desarrollo, cierre];
};

const inferNivel = (text: string): NivelAcademico => {
  const lower = text.toLowerCase();

  if (lower.includes("universidad") || lower.includes("licenciatura")) {
    return NivelAcademico.UNIVERSIDAD;
  }

  if (lower.includes("preparatoria") || lower.includes("bachillerato")) {
    return NivelAcademico.PREPARATORIA;
  }

  if (lower.includes("primaria")) {
    return NivelAcademico.PRIMARIA;
  }

  return NivelAcademico.SECUNDARIA;
};

const fallbackSubjectFromFileName = (fileName: string): string => {
  return fileName
    .replace(/\.(pdf|docx|doc)$/i, "")
    .replace(/[-_]+/g, " ")
    .trim();
};

const parseRawTextToDraft = (rawText: string, fileName: string): PlaneacionImportDraft => {
  const text = cleanText(rawText);

  const asignatura =
    readLabelValue(text, ["asignatura", "materia"]) || fallbackSubjectFromFileName(fileName);
  const grado = readLabelValue(text, ["grado", "nivel", "semestre"]);
  const grupo = readLabelValue(text, ["grupo", "salon", "salón"]);
  const unidadTematica = readLabelValue(text, ["unidad tematica", "unidad temática", "unidad"]);
  const temaSesion =
    readLabelValue(text, ["tema de la sesion", "tema de la sesión", "tema"]) || unidadTematica;
  const evaluacion = readLabelValue(text, [
    "evaluacion",
    "evaluación",
    "instrumento de evaluacion",
  ]);
  const observaciones = readLabelValue(text, ["observaciones", "notas"]);

  const aprendizajesEsperados = readSectionItems(text, [
    "aprendizajes esperados",
    "objetivos",
    "resultados de aprendizaje",
  ]);

  const recursos = readSectionItems(text, ["recursos", "materiales", "material didactico"]);
  const evidencias = readSectionItems(text, ["evidencias", "productos", "entregables"]);

  return {
    asignatura,
    grado,
    grupo,
    unidadTematica,
    temaSesion,
    aprendizajesEsperados,
    actividades: inferActividades(text),
    recursos,
    evaluacion,
    evidencias,
    observaciones,
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

    if (text) {
      pages.push(text);
    }
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

export const parseImportedPlaneacionFile = async (
  asset: DocumentPickerAsset
): Promise<PlaneacionImportDraft> => {
  const fileName = asset.name || "planeacion";
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (!extension || !["pdf", "docx", "doc"].includes(extension)) {
    throw new Error("Formato no compatible. Usa PDF o DOCX.");
  }

  const arrayBuffer = await readAssetAsArrayBuffer(asset);

  let rawText = "";

  if (extension === "pdf") {
    rawText = await extractTextFromPdf(arrayBuffer);
  }

  if (extension === "docx" || extension === "doc") {
    rawText = await extractTextFromDocx(arrayBuffer);
  }

  if (!rawText.trim()) {
    return {
      ...DEFAULT_DRAFT,
      asignatura: fallbackSubjectFromFileName(fileName),
    };
  }

  return parseRawTextToDraft(rawText, fileName);
};

const normalizeDuracion = (actividades: Actividad[]): number => {
  const total = actividades.reduce((sum, item) => sum + (Number(item.duracion) || 0), 0);
  return total > 0 ? total : 50;
};

const toSecundariaPlaneacion = (draft: PlaneacionImportDraft): PlaneacionSecundaria => {
  const now = new Date().toISOString();

  const base: PlaneacionBase = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    nivelAcademico: NivelAcademico.SECUNDARIA,
    asignatura: draft.asignatura || "",
    grado: draft.grado || "",
    grupo: draft.grupo || "",
    fecha: now,
    horaInicio: "08:00",
    duracionTotal: normalizeDuracion(draft.actividades),
    unidadTematica: draft.unidadTematica || "",
    temaSesion: draft.temaSesion || draft.unidadTematica || "",
    aprendizajesEsperados: draft.aprendizajesEsperados,
    actividades: draft.actividades,
    recursos: draft.recursos,
    evaluacion: draft.evaluacion || "",
    evidencias: draft.evidencias,
    observaciones: draft.observaciones || "",
    fechaCreacion: now,
    fechaModificacion: now,
  };

  return {
    ...base,
    nivelAcademico: NivelAcademico.SECUNDARIA,
    competenciasDisciplinares: [],
  };
};

export const buildPlaneacionFromImportDraft = (
  draft: PlaneacionImportDraft,
  sourceText?: string
): Planeacion => {
  const inferredNivel = inferNivel(sourceText || "");

  // Se guarda como secundaria por compatibilidad del flujo actual; el nivel inferido se conserva para siguiente iteración.
  if (inferredNivel !== NivelAcademico.SECUNDARIA) {
    return toSecundariaPlaneacion(draft);
  }

  return toSecundariaPlaneacion(draft);
};
