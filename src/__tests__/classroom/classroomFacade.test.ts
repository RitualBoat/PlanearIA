jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
  },
}));

import { createClassroomFacade } from "../../services/classroom/classroomFacade";
import { CLASSROOM_STORAGE_KEYS, MemoryClassroomStorage } from "../../services/classroom/classroomStorage";
import type { Alumno, Asistencia, Calificacion, EntregaTarea, Grupo, Recurso, Tarea } from "../../../types";

const grupo: Partial<Grupo> = {
  id: 1,
  nombre: "3A Programacion",
  materia: "Programacion",
  carrera: "ISC",
  semestre: 3,
  periodo: "2026-A",
  profesorId: 7,
  cantidadAlumnos: 1,
  estado: "activo",
  fechaCreacion: new Date("2026-01-01T10:00:00.000Z"),
};

const alumno: Alumno = {
  id: 10,
  nombre: "Ana",
  apellidos: "Lopez",
  numeroControl: "A-1",
  grupoId: 1,
  carrera: "ISC",
  fechaIngreso: new Date("2026-01-02T10:00:00.000Z"),
  estado: "activo",
};

const tarea: Tarea = {
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
  profesorId: 7,
  permitirEntregaTardia: false,
};

const recurso: Recurso = {
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
  profesorId: 7,
  versionActual: 1,
};

const asistencia: Asistencia = {
  id: 40,
  alumnoId: 10,
  grupoId: 1,
  fecha: new Date("2026-02-05T10:00:00.000Z"),
  estado: "presente",
};

const calificacion: Calificacion = {
  id: 50,
  alumnoId: 10,
  grupoId: 1,
  periodo: "2026-A",
  promedio: 95,
  estado: "aprobado",
  fechaRegistro: new Date("2026-02-06T10:00:00.000Z"),
};

const entrega: EntregaTarea = {
  id: 60,
  tareaId: 20,
  alumnoId: 10,
  fechaEntrega: new Date("2026-02-08T10:00:00.000Z"),
  calificada: false,
  estado: "entregada",
  intentos: 1,
};

describe("classroomFacade", () => {
  it("construye modelo de Classroom desde storage local por grupo", async () => {
    const storage = new MemoryClassroomStorage({
      [CLASSROOM_STORAGE_KEYS.grupos]: [grupo, { ...grupo, id: 2, nombre: "Grupo externo" }],
      [CLASSROOM_STORAGE_KEYS.alumnos]: [alumno, { ...alumno, id: 11, grupoId: 2 }],
      [CLASSROOM_STORAGE_KEYS.tareas]: [tarea, { ...tarea, id: 21, grupoId: 2 }],
      [CLASSROOM_STORAGE_KEYS.recursos]: [recurso],
      [CLASSROOM_STORAGE_KEYS.asistencias]: [asistencia],
      [CLASSROOM_STORAGE_KEYS.calificaciones]: [calificacion],
      [CLASSROOM_STORAGE_KEYS.entregas]: [entrega],
    });
    const facade = createClassroomFacade(storage);

    const model = await facade.getClassroomModel(1);

    expect(model?.grupo.nombre).toBe("3A Programacion");
    expect(model?.resumen).toMatchObject({
      grupoId: 1,
      totalAlumnos: 1,
      totalActividades: 1,
      totalMateriales: 1,
      promedioGrupo: 95,
    });
    expect(model?.pendientes).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "pendiente-entrega-60" })]),
    );
  });

  it("usa fallback legacy de tareas sin acoplar pantallas a AsyncStorage", async () => {
    const storage = new MemoryClassroomStorage({
      [CLASSROOM_STORAGE_KEYS.grupos]: [grupo],
      [CLASSROOM_STORAGE_KEYS.tareasLegacy]: [tarea],
    });
    const facade = createClassroomFacade(storage);

    await expect(facade.getActividadesByGrupoId(1)).resolves.toHaveLength(1);
  });

  it("devuelve null si el grupo no existe", async () => {
    const storage = new MemoryClassroomStorage({
      [CLASSROOM_STORAGE_KEYS.grupos]: [grupo],
    });
    const facade = createClassroomFacade(storage);

    await expect(facade.getClassroomModel(999)).resolves.toBeNull();
  });

  it("lista resumenes de grupos como entrada para futuros ViewModels", async () => {
    const storage = new MemoryClassroomStorage({
      [CLASSROOM_STORAGE_KEYS.grupos]: [grupo],
      [CLASSROOM_STORAGE_KEYS.alumnos]: [alumno],
      [CLASSROOM_STORAGE_KEYS.tareas]: [tarea],
    });
    const facade = createClassroomFacade(storage);

    const resumenes = await facade.listGruposResumen();

    expect(resumenes).toHaveLength(1);
    expect(resumenes[0].resumen.totalActividades).toBe(1);
  });

  it("gestiona secciones de trabajo de clase sin acoplarlas a pantallas legacy", async () => {
    const storage = new MemoryClassroomStorage({
      [CLASSROOM_STORAGE_KEYS.grupos]: [grupo],
      [CLASSROOM_STORAGE_KEYS.tareas]: [tarea],
      [CLASSROOM_STORAGE_KEYS.recursos]: [recurso],
    });
    const facade = createClassroomFacade(storage);

    const unidad = await facade.createUnidad(1, "Unidad 1 - Introduccion");
    const unidades = await facade.getUnidadesByGrupoId(1);
    const dataset = await facade.getDatasetByGrupoId(1);

    expect(unidades).toHaveLength(1);
    expect(dataset?.unidades?.[0]).toMatchObject({
      id: unidad.id,
      nombre: "Unidad 1 - Introduccion",
      colapsada: false,
    });

    await facade.updateUnidad(unidad.id, { nombre: "Unidad 1", colapsada: true });
    await expect(facade.getUnidadesByGrupoId(1)).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ nombre: "Unidad 1", colapsada: true })]),
    );

    await facade.deleteUnidad(unidad.id);
    await expect(facade.getUnidadesByGrupoId(1)).resolves.toHaveLength(0);
  });
});
