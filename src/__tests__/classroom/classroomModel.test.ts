import {
  buildClassroomActividadReciente,
  buildClassroomModel,
  buildClassroomPendientes,
  buildClassroomResumen,
} from "../../services/classroom/classroomModel";
import type {
  Alumno,
  Asistencia,
  Calificacion,
  EntregaTarea,
  Grupo,
  Recurso,
  Tarea,
} from "../../../types";

describe("classroomModel", () => {
  const grupo: Grupo = {
    id: 1,
    nombre: "3A Programacion",
    materia: "Programacion",
    carrera: "ISC",
    semestre: 3,
    periodo: "2026-A",
    profesorId: 99,
    cantidadAlumnos: 2,
    estado: "activo",
    fechaCreacion: new Date("2026-01-01T10:00:00.000Z"),
  };

  const alumnos: Alumno[] = [
    {
      id: 10,
      nombre: "Ana",
      apellidos: "Lopez",
      email: "ana@example.com",
      numeroControl: "A-1",
      grupoId: 1,
      carrera: "ISC",
      telefono: "5551111111",
      fechaIngreso: new Date("2026-01-02T10:00:00.000Z"),
      estado: "activo",
    },
    {
      id: 11,
      nombre: "Luis",
      apellidos: "Perez",
      email: "luis@example.com",
      numeroControl: "A-2",
      grupoId: 1,
      carrera: "ISC",
      telefono: "5552222222",
      fechaIngreso: new Date("2026-01-02T10:00:00.000Z"),
      estado: "activo",
    },
    {
      id: 12,
      nombre: "Fuera",
      apellidos: "Grupo",
      email: "fuera@example.com",
      numeroControl: "B-1",
      grupoId: 2,
      carrera: "ISC",
      telefono: "5553333333",
      fechaIngreso: new Date("2026-01-02T10:00:00.000Z"),
      estado: "activo",
    },
  ];

  const actividades: Tarea[] = [
    {
      id: 20,
      titulo: "Proyecto web",
      descripcion: "Landing page",
      tipo: "proyecto",
      grupoId: 1,
      fechaAsignacion: new Date("2026-02-01T10:00:00.000Z"),
      fechaEntrega: new Date("2026-02-10T10:00:00.000Z"),
      valor: 30,
      instrucciones: "Crear y presentar",
      estado: "asignada",
      calificacionMaxima: 100,
      profesorId: 99,
      permitirEntregaTardia: false,
    },
    {
      id: 21,
      titulo: "Examen diagnostico",
      descripcion: "Conceptos base",
      tipo: "examen",
      grupoId: 1,
      fechaAsignacion: new Date("2026-01-15T10:00:00.000Z"),
      fechaEntrega: new Date("2026-01-16T10:00:00.000Z"),
      valor: 10,
      instrucciones: "Responder en clase",
      estado: "finalizada",
      calificacionMaxima: 100,
      profesorId: 99,
      permitirEntregaTardia: false,
    },
    {
      id: 22,
      titulo: "Otro grupo",
      descripcion: "No debe contar",
      tipo: "tarea",
      grupoId: 2,
      fechaAsignacion: new Date("2026-02-20T10:00:00.000Z"),
      fechaEntrega: new Date("2026-02-22T10:00:00.000Z"),
      valor: 10,
      instrucciones: "Ignorar",
      estado: "asignada",
      calificacionMaxima: 100,
      profesorId: 99,
      permitirEntregaTardia: false,
    },
  ];

  const materiales: Recurso[] = [
    {
      id: 30,
      titulo: "Guia HTML",
      tipo: "documento",
      descripcion: "Lectura base",
      grupoId: 1,
      asignadoComoTarea: false,
      tags: ["html"],
      fechaCreacion: new Date("2026-02-02T10:00:00.000Z"),
      fechaModificacion: new Date("2026-02-03T10:00:00.000Z"),
      acceso: "privado",
      origen: "manual",
      profesorId: 99,
      versionActual: 1,
    },
  ];

  const asistencias: Asistencia[] = [
    {
      id: 40,
      alumnoId: 10,
      grupoId: 1,
      fecha: new Date("2026-02-05T10:00:00.000Z"),
      estado: "presente",
    },
    {
      id: 41,
      alumnoId: 11,
      grupoId: 1,
      fecha: new Date("2026-02-05T10:01:00.000Z"),
      estado: "ausente",
    },
  ];

  const calificaciones: Calificacion[] = [
    {
      id: 50,
      alumnoId: 10,
      grupoId: 1,
      periodo: "2026-A",
      promedio: 90,
      estado: "aprobado",
      fechaRegistro: new Date("2026-02-06T10:00:00.000Z"),
    },
    {
      id: 51,
      alumnoId: 11,
      grupoId: 1,
      periodo: "2026-A",
      promedio: 70,
      estado: "pendiente",
      observaciones: "Falta evidencia",
      fechaRegistro: new Date("2026-02-07T10:00:00.000Z"),
    },
  ];

  const entregas: EntregaTarea[] = [
    {
      id: 60,
      tareaId: 20,
      alumnoId: 10,
      fechaEntrega: new Date("2026-02-08T10:00:00.000Z"),
      comentarioAlumno: "Entrega inicial",
      calificada: false,
      estado: "entregada",
      intentos: 1,
    },
  ];

  it("construye resumen con Grupo como raiz y filtra entidades externas", () => {
    const resumen = buildClassroomResumen({
      grupo,
      alumnos,
      actividades,
      materiales,
      asistencias,
      calificaciones,
    });

    expect(resumen).toMatchObject({
      grupoId: 1,
      grupoNombre: "3A Programacion",
      totalAlumnos: 2,
      totalActividades: 2,
      actividadesPendientes: 1,
      totalMateriales: 1,
      porcentajeAsistencia: 50,
      promedioGrupo: 80,
    });
  });

  it("ordena actividad reciente por fecha y mantiene origen de entidad", () => {
    const actividadReciente = buildClassroomActividadReciente({
      grupo,
      actividades,
      materiales,
      asistencias,
      calificaciones,
    });

    expect(actividadReciente[0]).toMatchObject({
      id: "calificacion-51",
      entidadOrigen: "calificacion",
    });
    expect(actividadReciente.some((actividad) => actividad.id === "tarea-22")).toBe(false);
  });

  it("detecta pendientes academicos y entregas sin calificar", () => {
    const pendientes = buildClassroomPendientes({
      grupo,
      actividades,
      calificaciones,
      entregas,
    });

    expect(pendientes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "pendiente-tarea-20", tipo: "entrega_pendiente" }),
        expect.objectContaining({ id: "pendiente-calificacion-51", tipo: "calificacion_pendiente" }),
        expect.objectContaining({ id: "pendiente-entrega-60", tipo: "actividad_sin_calificar" }),
      ]),
    );
  });

  it("agrupa contratos principales en un modelo listo para ViewModels", () => {
    const model = buildClassroomModel({
      grupo,
      alumnos,
      actividades,
      materiales,
      asistencias,
      calificaciones,
      entregas,
    });

    expect(model.grupo.totalAlumnos).toBe(2);
    expect(model.resumen.totalActividades).toBe(2);
    expect(model.actividadReciente.length).toBeGreaterThan(0);
    expect(model.pendientes.length).toBeGreaterThan(0);
  });
});
