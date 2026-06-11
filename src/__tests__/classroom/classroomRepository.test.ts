jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
  },
}));

import { createClassroomRepository } from "../../services/classroom/classroomRepository";
import { CLASSROOM_STORAGE_KEYS, MemoryClassroomStorage } from "../../services/classroom/classroomStorage";
import type { Alumno, EntregaTarea, Grupo, Tarea } from "../../../types";

const grupo: Partial<Grupo> = {
  id: 1,
  nombre: "1A Matematicas",
  materia: "Matematicas",
  periodo: "2026-A",
  estado: "activo",
};

const alumno: Alumno = {
  id: 10,
  nombre: "Ana",
  apellidos: "Demo",
  numeroControl: "A-10",
  grupoId: 1,
  carrera: "ISC",
  fechaIngreso: new Date("2026-01-01T10:00:00.000Z"),
  estado: "activo",
};

const tareaLegacy: Tarea = {
  id: 20,
  titulo: "Actividad legacy",
  descripcion: "Tarea guardada en clave legacy",
  tipo: "tarea",
  grupoId: 1,
  fechaAsignacion: new Date("2026-02-01T10:00:00.000Z"),
  fechaEntrega: new Date("2026-02-10T10:00:00.000Z"),
  valor: 10,
  instrucciones: "Resolver",
  estado: "asignada",
  calificacionMaxima: 100,
  profesorId: 7,
  permitirEntregaTardia: false,
};

const entrega: EntregaTarea = {
  id: 30,
  tareaId: 20,
  alumnoId: 10,
  fechaEntrega: new Date("2026-02-08T10:00:00.000Z"),
  calificada: false,
  estado: "entregada",
  intentos: 1,
};

describe("classroomRepository", () => {
  it("normaliza datasets academicos y filtra por grupo", async () => {
    const storage = new MemoryClassroomStorage({
      [CLASSROOM_STORAGE_KEYS.grupos]: [grupo, { ...grupo, id: 2, nombre: "Grupo externo" }],
      [CLASSROOM_STORAGE_KEYS.alumnos]: [alumno, { ...alumno, id: 11, grupoId: 2 }],
      [CLASSROOM_STORAGE_KEYS.tareasLegacy]: [tareaLegacy],
      [CLASSROOM_STORAGE_KEYS.entregas]: [entrega],
    });
    const repository = createClassroomRepository(storage);

    const dataset = await repository.getDatasetByGrupoId(1);

    expect(dataset?.grupo.nombre).toBe("1A Matematicas");
    expect(dataset?.alumnos).toEqual([alumno]);
    expect(dataset?.actividades).toEqual([tareaLegacy]);
    expect(dataset?.entregas).toEqual([entrega]);
  });

  it("mantiene una sola actividad cuando existe en clave nueva y legacy", async () => {
    const storage = new MemoryClassroomStorage({
      [CLASSROOM_STORAGE_KEYS.grupos]: [grupo],
      [CLASSROOM_STORAGE_KEYS.tareas]: [tareaLegacy],
      [CLASSROOM_STORAGE_KEYS.tareasLegacy]: [{ ...tareaLegacy, titulo: "Duplicada" }],
    });
    const repository = createClassroomRepository(storage);

    const actividades = await repository.getActividadesByGrupoId(1);

    expect(actividades).toHaveLength(1);
    expect(actividades[0].titulo).toBe("Actividad legacy");
  });

  it("reemplaza alumnos desde el puerto de storage sin exponer AsyncStorage a pantallas", async () => {
    const storage = new MemoryClassroomStorage({
      [CLASSROOM_STORAGE_KEYS.alumnos]: [alumno],
    });
    const repository = createClassroomRepository(storage);

    await repository.replaceAlumnos([{ ...alumno, id: 12, nombre: "Luis" }]);

    await expect(storage.readArray<Alumno>(CLASSROOM_STORAGE_KEYS.alumnos)).resolves.toEqual([
      expect.objectContaining({ id: 12, nombre: "Luis" }),
    ]);
  });
});
