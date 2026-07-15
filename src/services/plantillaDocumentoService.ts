import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PlantillaDocumento } from "../../types/plantillaDocumento";
import { NivelAcademico, type PlaneacionDocumento } from "../../types/planeacionV2";
import type { Usuario } from "../context/AuthContext";
import { buildPlaneacionDocumentoBase } from "../utils/createPlaneacionDocumentoBase";

const PLANTILLAS_DOCUMENTO_KEY = "@planearia:plantillas_documento_v2";

const safeParse = (value: string | null): PlantillaDocumento[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as PlantillaDocumento[]) : [];
  } catch {
    return [];
  }
};

const normalizePlantilla = (plantilla: PlantillaDocumento, userId: string): PlantillaDocumento => {
  const now = new Date().toISOString();
  return {
    ...plantilla,
    id: plantilla.id || `plantilla_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    userId: plantilla.userId || userId,
    origen: plantilla.origen || "escaner",
    secciones: Array.isArray(plantilla.secciones) ? plantilla.secciones : [],
    fechaCreacion: plantilla.fechaCreacion || now,
    fechaModificacion: now,
  };
};

export const listPlantillasDocumento = async (userId: string): Promise<PlantillaDocumento[]> => {
  const raw = await AsyncStorage.getItem(PLANTILLAS_DOCUMENTO_KEY);
  const all = safeParse(raw);
  return all.filter((plantilla) => plantilla.userId === userId || plantilla.origen === "comunidad");
};

export const getPlantillaDocumento = async (
  id: string,
  userId: string
): Promise<PlantillaDocumento | undefined> => {
  const plantillas = await listPlantillasDocumento(userId);
  return plantillas.find((plantilla) => plantilla.id === id);
};

export const savePlantillaDocumento = async (
  plantilla: PlantillaDocumento,
  userId: string
): Promise<PlantillaDocumento> => {
  const raw = await AsyncStorage.getItem(PLANTILLAS_DOCUMENTO_KEY);
  const current = safeParse(raw);
  const normalized = normalizePlantilla(plantilla, userId);
  const next = [
    ...current.filter((item) => item.id !== normalized.id),
    normalized,
  ].sort((a, b) => b.fechaModificacion.localeCompare(a.fechaModificacion));

  await AsyncStorage.setItem(PLANTILLAS_DOCUMENTO_KEY, JSON.stringify(next));
  return normalized;
};

const deletePlantillaDocumento = async (id: string, userId: string): Promise<void> => {
  const raw = await AsyncStorage.getItem(PLANTILLAS_DOCUMENTO_KEY);
  const current = safeParse(raw);
  const next = current.filter((plantilla) => !(plantilla.id === id && plantilla.userId === userId));
  await AsyncStorage.setItem(PLANTILLAS_DOCUMENTO_KEY, JSON.stringify(next));
};

const mergeDefaultsIntoDoc = (
  base: PlaneacionDocumento,
  defaults?: Partial<PlaneacionDocumento>
): PlaneacionDocumento => {
  if (!defaults) return base;

  return {
    ...base,
    infoInstitucional: {
      ...base.infoInstitucional,
      ...defaults.infoInstitucional,
    },
    datosGenerales: {
      ...base.datosGenerales,
      ...defaults.datosGenerales,
    },
    elementosCurriculares: {
      ...base.elementosCurriculares,
      ...defaults.elementosCurriculares,
    },
    sesiones: defaults.sesiones?.length ? defaults.sesiones : base.sesiones,
    evaluacionInicial: defaults.evaluacionInicial ?? base.evaluacionInicial,
    evaluacionFinal: defaults.evaluacionFinal ?? base.evaluacionFinal,
    observaciones: defaults.observaciones?.length ? defaults.observaciones : base.observaciones,
    firmas: defaults.firmas?.length ? defaults.firmas : base.firmas,
    camposNivel: {
      ...base.camposNivel,
      ...defaults.camposNivel,
    },
    contenidoRaw: defaults.contenidoRaw ?? base.contenidoRaw,
  };
};

export const buildDocumentoFromPlantilla = (
  plantilla: PlantillaDocumento,
  options: {
    userId: string;
    usuario?: Usuario | null;
    asignatura?: string;
    grado?: string;
    grupos?: string[];
  }
): PlaneacionDocumento => {
  const now = new Date().toISOString();
  const base = buildPlaneacionDocumentoBase({
    nivelAcademico: plantilla.nivelAcademico || NivelAcademico.PRIMARIA,
    userId: options.userId,
    usuario: options.usuario,
    asignatura: options.asignatura,
    grado: options.grado,
    grupos: options.grupos,
  });

  const merged = mergeDefaultsIntoDoc(base, plantilla.defaults);

  return {
    ...merged,
    id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    version: 2,
    userId: options.userId,
    plantillaId: plantilla.id,
    nivelAcademico: plantilla.nivelAcademico || NivelAcademico.PRIMARIA,
    datosGenerales: {
      ...merged.datosGenerales,
      asignatura: options.asignatura || merged.datosGenerales.asignatura,
      grado: options.grado || merged.datosGenerales.grado,
      grupos: options.grupos?.length ? options.grupos : merged.datosGenerales.grupos,
    },
    camposNivel: {
      ...merged.camposNivel,
      plantillaNombre: plantilla.nombre,
      plantillaSecciones: plantilla.secciones,
    },
    fechaCreacion: now,
    fechaModificacion: now,
  };
};
