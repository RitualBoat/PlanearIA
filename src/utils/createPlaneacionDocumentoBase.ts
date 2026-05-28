import type { Usuario } from "../context/AuthContext";
import { NivelAcademico, type PlaneacionDocumento, type Sesion } from "../../types/planeacionV2";

const nowIso = () => new Date().toISOString();

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

const buildSesion = (): Sesion => {
  return {
    id: `sesion_${Date.now()}_1`,
    numero: 1,
    tipo: "regular",
    inicio: toRichTextString(""),
    desarrollo: toRichTextString(""),
    cierre: toRichTextString(""),
    tarea: toRichTextString(""),
  };
};

export interface BuildDocOptions {
  nivelAcademico: NivelAcademico;
  userId: string;
  usuario?: Usuario | null;
  asignatura?: string;
  grado?: string;
  grupos?: string[];
}

export const buildPlaneacionDocumentoBase = (options: BuildDocOptions): PlaneacionDocumento => {
  const now = nowIso();
  const maestro =
    [options.usuario?.nombre, options.usuario?.apellidos].filter(Boolean).join(" ").trim() || "";

  return {
    id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    version: 2,
    userId: options.userId,
    nivelAcademico: options.nivelAcademico,
    infoInstitucional: {
      institucion: "",
      subsistema: "",
      cicloEscolar: "",
      lugar: "",
    },
    datosGenerales: {
      maestro,
      asignatura: options.asignatura || "",
      fechaInicio: now.slice(0, 10),
      fechaFin: now.slice(0, 10),
      semanas: [],
      trimestre: undefined,
      grado: options.grado || "",
      grupos: options.grupos || [],
    },
    elementosCurriculares: {
      proposito: "",
      producto: "",
      contenido: "",
      pda: "",
      campoFormativo: "",
      ejeArticulador: "",
      rasgosPerfilEgreso: [],
      instrumentoEvaluacion: "",
    },
    sesiones: [buildSesion()],
    evaluacionInicial: undefined,
    evaluacionFinal: {
      tipo: "rubrica",
      escala: [],
      criterios: [{ id: `crit_${Date.now()}`, descripcion: "" }],
    },
    observaciones: [{ texto: "", categoria: "general" }],
    firmas: [
      {
        rol: "Docente",
        nombre: maestro,
      },
    ],
    contenidoRaw: "",
    fechaCreacion: now,
    fechaModificacion: now,
    camposNivel: {},
  };
};

