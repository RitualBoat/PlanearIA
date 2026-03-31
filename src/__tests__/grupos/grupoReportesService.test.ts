import { calcularEstadisticasGrupo } from "../../services/grupoReportesService";

describe("grupoReportesService", () => {
  it("calcula promedio, aprobacion, reprobacion y asistencia", () => {
    const result = calcularEstadisticasGrupo({
      alumnos: [
        {
          id: 1,
          nombre: "Ana",
          apellidos: "L",
          numeroControl: "A1",
          carrera: "ISC",
          fechaIngreso: new Date(),
          estado: "activo",
          grupoId: 7,
        },
        {
          id: 2,
          nombre: "Luis",
          apellidos: "P",
          numeroControl: "A2",
          carrera: "ISC",
          fechaIngreso: new Date(),
          estado: "activo",
          grupoId: 7,
        },
      ],
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
        { id: 2, alumnoId: 2, grupoId: 7, fecha: new Date(), estado: "ausente" },
      ],
      tareas: [
        {
          id: 10,
          titulo: "Tarea",
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

    expect(result.promedioGeneral).toBe(7.5);
    expect(Math.round(result.indiceAprobacion)).toBe(50);
    expect(Math.round(result.indiceReprobacion)).toBe(50);
    expect(Math.round(result.indiceAsistencia)).toBe(50);
    expect(result.totalEsperadas).toBe(2);
    expect(Math.round(result.indiceEntregasATiempo)).toBe(50);
    expect(Math.round(result.indiceNoEntregadas)).toBe(50);
  });

  it("distingue entregas tarde por estado o por fecha", () => {
    const result = calcularEstadisticasGrupo({
      alumnos: [
        {
          id: 1,
          nombre: "Ana",
          apellidos: "L",
          numeroControl: "A1",
          carrera: "ISC",
          fechaIngreso: new Date(),
          estado: "activo",
          grupoId: 7,
        },
      ],
      calificaciones: [],
      asistencias: [],
      tareas: [
        {
          id: 11,
          titulo: "Proyecto",
          descripcion: "",
          tipo: "proyecto",
          grupoId: 7,
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
          tareaId: 11,
          alumnoId: 1,
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
