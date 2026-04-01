import { calcularEstadisticasAlumno } from "../../services/alumnoReportesService";

describe("alumnoReportesService", () => {
  it("calcula promedio, asistencia y entregas por alumno", () => {
    const result = calcularEstadisticasAlumno(1, {
      calificaciones: [
        {
          id: 1,
          alumnoId: 1,
          grupoId: 7,
          periodo: "P1",
          promedio: 9,
          estado: "aprobado",
          fechaRegistro: new Date(),
        },
        {
          id: 2,
          alumnoId: 1,
          grupoId: 7,
          periodo: "P2",
          promedio: 8,
          estado: "aprobado",
          fechaRegistro: new Date(),
        },
        {
          id: 3,
          alumnoId: 2,
          grupoId: 7,
          periodo: "P1",
          promedio: 6,
          estado: "reprobado",
          fechaRegistro: new Date(),
        },
      ],
      asistencias: [
        { id: 1, alumnoId: 1, grupoId: 7, fecha: new Date(), estado: "presente" },
        { id: 2, alumnoId: 1, grupoId: 7, fecha: new Date(), estado: "ausente" },
        { id: 3, alumnoId: 2, grupoId: 7, fecha: new Date(), estado: "presente" },
      ],
      tareas: [
        {
          id: 10,
          titulo: "Tarea 1",
          descripcion: "",
          tipo: "tarea",
          grupoId: 7,
          fechaAsignacion: new Date("2026-03-01"),
          fechaEntrega: new Date("2026-03-10"),
          valor: 20,
          instrucciones: "",
          estado: "asignada",
          calificacionMaxima: 10,
          profesorId: 1,
          permitirEntregaTardia: true,
        },
        {
          id: 11,
          titulo: "Tarea 2",
          descripcion: "",
          tipo: "proyecto",
          grupoId: 7,
          fechaAsignacion: new Date("2026-03-01"),
          fechaEntrega: new Date("2026-03-12"),
          valor: 20,
          instrucciones: "",
          estado: "asignada",
          calificacionMaxima: 10,
          profesorId: 1,
          permitirEntregaTardia: true,
        },
      ],
      entregas: [
        {
          id: 100,
          tareaId: 10,
          alumnoId: 1,
          fechaEntrega: new Date("2026-03-09"),
          calificada: false,
          estado: "entregada",
          intentos: 1,
        },
      ],
    });

    expect(result.promedioGeneral).toBe(8.5);
    expect(Math.round(result.indiceAsistencia)).toBe(50);
    expect(result.totalEntregasEsperadas).toBe(2);
    expect(result.totalEntregasRealizadas).toBe(1);
    expect(Math.round(result.indiceEntregasATiempo)).toBe(50);
    expect(Math.round(result.indiceNoEntregadas)).toBe(50);
  });

  it("marca entrega tarde por estado o por fecha", () => {
    const result = calcularEstadisticasAlumno(3, {
      calificaciones: [],
      asistencias: [],
      tareas: [
        {
          id: 12,
          titulo: "Proyecto final",
          descripcion: "",
          tipo: "proyecto",
          grupoId: 9,
          fechaAsignacion: new Date("2026-03-01"),
          fechaEntrega: new Date("2026-03-10"),
          valor: 30,
          instrucciones: "",
          estado: "asignada",
          calificacionMaxima: 10,
          profesorId: 1,
          permitirEntregaTardia: true,
        },
      ],
      entregas: [
        {
          id: 101,
          tareaId: 12,
          alumnoId: 3,
          fechaEntrega: new Date("2026-03-12"),
          calificada: false,
          estado: "entregada",
          intentos: 1,
        },
      ],
    });

    expect(Math.round(result.indiceEntregasTarde)).toBe(100);
    expect(Math.round(result.indiceEntregasATiempo)).toBe(0);
    expect(Math.round(result.indiceNoEntregadas)).toBe(0);
  });
});
