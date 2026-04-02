import type { Alumno, Calificacion } from "../../types";

export interface PromedioAlumno {
  alumnoId: number;
  nombre: string;
  apellidos: string;
  numeroControl: string;
  parcial1?: number;
  parcial2?: number;
  parcial3?: number;
  promedio: number;
  estado: "aprobado" | "reprobado" | "pendiente";
}

export interface PromedioGrupal {
  promedioGeneral: number;
  totalAlumnos: number;
  aprobados: number;
  reprobados: number;
  pendientes: number;
  porcentajeAprobacion: number;
  promediosPorParcial: {
    parcial1: number | null;
    parcial2: number | null;
    parcial3: number | null;
  };
}

export const calcularPromedioAlumno = (calificacion: Calificacion): number => {
  const parciales = [calificacion.parcial1, calificacion.parcial2, calificacion.parcial3].filter(
    (v): v is number => v !== undefined && v !== null
  );
  if (parciales.length === 0) return 0;
  return Math.round((parciales.reduce((a, b) => a + b, 0) / parciales.length) * 10) / 10;
};

export const calcularPromediosAlumnos = (
  calificaciones: Calificacion[],
  alumnos: Alumno[]
): PromedioAlumno[] => {
  return alumnos.map((alumno) => {
    const cal = calificaciones.find((c) => c.alumnoId === alumno.id);

    if (!cal) {
      return {
        alumnoId: alumno.id,
        nombre: alumno.nombre,
        apellidos: alumno.apellidos,
        numeroControl: alumno.numeroControl,
        promedio: 0,
        estado: "pendiente" as const,
      };
    }

    const promedio = calcularPromedioAlumno(cal);
    const tieneTodasParciales =
      cal.parcial1 !== undefined && cal.parcial2 !== undefined && cal.parcial3 !== undefined;

    let estado: "aprobado" | "reprobado" | "pendiente" = "pendiente";
    if (tieneTodasParciales) {
      estado = promedio >= 60 ? "aprobado" : "reprobado";
    }

    return {
      alumnoId: alumno.id,
      nombre: alumno.nombre,
      apellidos: alumno.apellidos,
      numeroControl: alumno.numeroControl,
      parcial1: cal.parcial1,
      parcial2: cal.parcial2,
      parcial3: cal.parcial3,
      promedio,
      estado,
    };
  });
};

export const calcularPromedioGrupal = (promedios: PromedioAlumno[]): PromedioGrupal => {
  const totalAlumnos = promedios.length;

  if (totalAlumnos === 0) {
    return {
      promedioGeneral: 0,
      totalAlumnos: 0,
      aprobados: 0,
      reprobados: 0,
      pendientes: 0,
      porcentajeAprobacion: 0,
      promediosPorParcial: { parcial1: null, parcial2: null, parcial3: null },
    };
  }

  const aprobados = promedios.filter((p) => p.estado === "aprobado").length;
  const reprobados = promedios.filter((p) => p.estado === "reprobado").length;
  const pendientes = promedios.filter((p) => p.estado === "pendiente").length;

  const conCalificacion = promedios.filter((p) => p.promedio > 0);
  const promedioGeneral =
    conCalificacion.length > 0
      ? Math.round(
          (conCalificacion.reduce((acc, p) => acc + p.promedio, 0) / conCalificacion.length) * 10
        ) / 10
      : 0;

  const calcParcialPromedio = (key: "parcial1" | "parcial2" | "parcial3"): number | null => {
    const valores = promedios.filter((p) => p[key] !== undefined).map((p) => p[key] as number);
    if (valores.length === 0) return null;
    return Math.round((valores.reduce((a, b) => a + b, 0) / valores.length) * 10) / 10;
  };

  return {
    promedioGeneral,
    totalAlumnos,
    aprobados,
    reprobados,
    pendientes,
    porcentajeAprobacion: totalAlumnos > 0 ? Math.round((aprobados / totalAlumnos) * 100) : 0,
    promediosPorParcial: {
      parcial1: calcParcialPromedio("parcial1"),
      parcial2: calcParcialPromedio("parcial2"),
      parcial3: calcParcialPromedio("parcial3"),
    },
  };
};
