jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
  },
}));

jest.mock("expo-sqlite", () => ({
  __esModule: true,
  openDatabaseAsync: jest.fn(),
}));

import { CLASSROOM_STORAGE_KEYS, MemoryClassroomStorage } from "../../services/classroom/classroomStorage";
import {
  buildClassroomMigrationSnapshot,
  migrateClassroomAsyncStorageToSQLite,
  serializeClassroomMigrationSnapshot,
} from "../../services/classroom/sqlite/classroomSqliteMigration";
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

const tarea: Tarea = {
  id: 20,
  titulo: "Actividad migrada",
  descripcion: "Prueba de migracion",
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

describe("classroomSqliteMigration", () => {
  it("crea snapshot JSON de claves academicas antes de migrar", async () => {
    const source = new MemoryClassroomStorage({
      [CLASSROOM_STORAGE_KEYS.grupos]: [grupo],
      [CLASSROOM_STORAGE_KEYS.alumnos]: [alumno],
    });

    const snapshot = await buildClassroomMigrationSnapshot(source, "2026-06-11T10:00:00.000Z");
    const serialized = serializeClassroomMigrationSnapshot(snapshot);

    expect(snapshot.keys[CLASSROOM_STORAGE_KEYS.grupos]).toEqual([grupo]);
    expect(serialized).toContain("classroom-sqlite-migration-v1");
    expect(serialized).toContain("@planearia:grupos");
  });

  it("migra dataset normalizado hacia el storage destino sin borrar origen", async () => {
    const source = new MemoryClassroomStorage({
      [CLASSROOM_STORAGE_KEYS.grupos]: [grupo],
      [CLASSROOM_STORAGE_KEYS.alumnos]: [alumno],
      [CLASSROOM_STORAGE_KEYS.tareasLegacy]: [tarea],
      [CLASSROOM_STORAGE_KEYS.entregas]: [entrega],
    });
    const target = new MemoryClassroomStorage();

    const result = await migrateClassroomAsyncStorageToSQLite({
      sourceStorage: source,
      targetStorage: target,
      now: () => new Date("2026-06-11T10:00:00.000Z"),
    });

    expect(result.counts).toMatchObject({
      grupos: 1,
      alumnos: 1,
      tareas: 1,
      entregas: 1,
    });
    await expect(target.readArray(CLASSROOM_STORAGE_KEYS.grupos)).resolves.toEqual([grupo]);
    await expect(target.readArray(CLASSROOM_STORAGE_KEYS.tareasLegacy)).resolves.toEqual([tarea]);
    await expect(source.readArray(CLASSROOM_STORAGE_KEYS.grupos)).resolves.toEqual([grupo]);
  });
});
