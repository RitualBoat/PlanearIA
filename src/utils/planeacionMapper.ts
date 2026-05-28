import {
  NivelAcademico,
  Planeacion,
  PlaneacionPrimaria,
  PlaneacionSecundaria,
  PlaneacionPreparatoria,
  PlaneacionUniversidad,
} from "../../types/planeacionLegacy";

export const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

export const toIsoDate = (value: unknown): string => {
  const parsed = new Date(typeof value === "string" ? value : "");

  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }

  return parsed.toISOString();
};

export const normalizeModalidad = (value: unknown): "presencial" | "hibrida" | "virtual" => {
  const modalidad = String(value || "presencial").toLowerCase();

  if (modalidad === "hibrida" || modalidad === "virtual") {
    return modalidad;
  }

  return "presencial";
};

export const normalizeActividades = (value: unknown) => {
  const defaults = {
    inicio: {
      tipo: "inicio" as const,
      descripcion: "Activación de conocimientos previos",
      duracion: 10,
    },
    desarrollo: { tipo: "desarrollo" as const, descripcion: "Desarrollo del tema", duracion: 30 },
    cierre: { tipo: "cierre" as const, descripcion: "Cierre y retroalimentación", duracion: 10 },
  };

  if (!Array.isArray(value)) {
    return [defaults.inicio, defaults.desarrollo, defaults.cierre];
  }

  const byTipo: Record<
    "inicio" | "desarrollo" | "cierre",
    { tipo: "inicio" | "desarrollo" | "cierre"; descripcion: string; duracion: number }
  > = { ...defaults };

  for (const item of value) {
    const tipo = (item as { tipo?: string })?.tipo;

    if (tipo !== "inicio" && tipo !== "desarrollo" && tipo !== "cierre") {
      continue;
    }

    const descripcion = String((item as { descripcion?: unknown })?.descripcion || "").trim();
    const duracion = Number((item as { duracion?: unknown })?.duracion);

    byTipo[tipo] = {
      tipo,
      descripcion: descripcion || defaults[tipo].descripcion,
      duracion: Number.isFinite(duracion) && duracion > 0 ? duracion : defaults[tipo].duracion,
    };
  }

  return [byTipo.inicio, byTipo.desarrollo, byTipo.cierre];
};

export const mapResponseToPlaneacion = (
  value: unknown,
  nivelAcademico: NivelAcademico,
  prompt: string
): Planeacion => {
  const source = (value || {}) as Record<string, unknown>;
  const nowIso = new Date().toISOString();
  const actividades = normalizeActividades(source.actividades);

  const base = {
    id: String(source.id || `ia_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`),
    nivelAcademico,
    asignatura: String(source.asignatura || "Asignatura por definir"),
    grado: String(source.grado || "Grado por definir"),
    grupo: String(source.grupo || ""),
    fecha: toIsoDate(source.fecha),
    horaInicio: String(source.horaInicio || "08:00"),
    duracionTotal:
      Number(source.duracionTotal) ||
      actividades.reduce((sum, actividad) => sum + actividad.duracion, 0),
    unidadTematica: String(source.unidadTematica || "Unidad temática generada con IA"),
    temaSesion: String(source.temaSesion || `Planeación generada: ${prompt.slice(0, 80)}`),
    aprendizajesEsperados: toStringArray(source.aprendizajesEsperados),
    actividades,
    recursos: toStringArray(source.recursos),
    evaluacion: String(source.evaluacion || "Evaluación formativa"),
    evidencias: toStringArray(source.evidencias),
    observaciones: String(source.observaciones || ""),
    fechaCreacion: toIsoDate(source.fechaCreacion || nowIso),
    fechaModificacion: toIsoDate(source.fechaModificacion || nowIso),
  };

  if (nivelAcademico === NivelAcademico.PRIMARIA) {
    const planeacion: PlaneacionPrimaria = {
      ...base,
      nivelAcademico: NivelAcademico.PRIMARIA,
      campoFormativo: String(source.campoFormativo || "Lenguaje y Comunicación"),
    };

    return planeacion;
  }

  if (nivelAcademico === NivelAcademico.SECUNDARIA) {
    const planeacion: PlaneacionSecundaria = {
      ...base,
      nivelAcademico: NivelAcademico.SECUNDARIA,
      competenciasDisciplinares: toStringArray(source.competenciasDisciplinares),
    };

    return planeacion;
  }

  if (nivelAcademico === NivelAcademico.PREPARATORIA) {
    const planeacion: PlaneacionPreparatoria = {
      ...base,
      nivelAcademico: NivelAcademico.PREPARATORIA,
      competenciasGenericas: toStringArray(source.competenciasGenericas),
      competenciasDisciplinares: toStringArray(source.competenciasDisciplinares),
      bibliografia: toStringArray(source.bibliografia),
    };

    return planeacion;
  }

  const planeacion: PlaneacionUniversidad = {
    ...base,
    nivelAcademico: NivelAcademico.UNIVERSIDAD,
    competenciasProfesionales: toStringArray(source.competenciasProfesionales),
    objetivosAprendizaje: toStringArray(source.objetivosAprendizaje),
    bibliografia: toStringArray(source.bibliografia),
    modalidad: normalizeModalidad(source.modalidad),
  };

  return planeacion;
};
