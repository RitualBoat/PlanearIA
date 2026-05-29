import { NivelAcademico, PlaneacionDocumento } from "./planeacionV2";

export interface CampoPlantilla {
  id: string;
  etiqueta: string;
  tipo:
    | "text"
    | "richtext"
    | "number"
    | "date"
    | "select"
    | "multiselect"
    | "table"
    | "checkbox_list";
  requerido: boolean;
  opciones?: string[];
  valorDefecto?: string;
}

export interface SeccionPlantilla {
  id: string;
  tipo:
    | "info_institucional"
    | "datos_generales"
    | "curricular"
    | "sesiones"
    | "evaluacion"
    | "observaciones"
    | "firmas"
    | "custom";
  titulo: string;
  visible: boolean;
  campos: CampoPlantilla[];
}

export interface PlantillaDocumento {
  id: string;
  userId: string;
  nombre: string;
  descripcion?: string;
  nivelAcademico: NivelAcademico;
  origen: "manual" | "escaner" | "ia" | "comunidad";
  secciones: SeccionPlantilla[];

  // Metadata for local selector (Phase 9) and future online gallery (Phase 10).
  etiquetas?: string[];
  miniaturaUri?: string;
  compatibilidad?: {
    web?: boolean;
    android?: boolean;
    ios?: boolean;
  };

  // Default values to prefill generated documents.
  defaults?: Partial<PlaneacionDocumento>;

  fechaCreacion: string;
  fechaModificacion: string;
}
