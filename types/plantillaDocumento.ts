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
  opciones?: string[]; // Para select/multiselect
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

  // Estructura: qué secciones y campos contiene la plantilla
  secciones: SeccionPlantilla[];

  // Valores por defecto (metadata institucional, firmas, etc.)
  defaults?: Partial<PlaneacionDocumento>;

  fechaCreacion: string;
  fechaModificacion: string;
}
