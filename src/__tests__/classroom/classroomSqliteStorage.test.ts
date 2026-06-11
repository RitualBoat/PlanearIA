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

import { CLASSROOM_STORAGE_KEYS } from "../../services/classroom/classroomStorage";
import {
  CLASSROOM_SQLITE_SCHEMA,
  CLASSROOM_SQLITE_TABLE_BY_KEY,
} from "../../services/classroom/sqlite/classroomSqliteSchema";
import {
  ExpoSQLiteClassroomStorage,
  type ClassroomSQLiteDatabaseLike,
} from "../../services/classroom/sqlite/classroomSqliteStorage";
import type { Alumno, Grupo, Tarea } from "../../../types";

class FakeSQLiteDatabase implements ClassroomSQLiteDatabaseLike {
  execStatements: string[] = [];
  runCalls: Array<{ source: string; params: Record<string, string | number | null> }> = [];
  rowsByTable: Record<string, Array<{ payload_json: string }>> = {};

  async execAsync(source: string): Promise<void> {
    this.execStatements.push(source);
  }

  async runAsync(source: string, params: Record<string, string | number | null>): Promise<void> {
    this.runCalls.push({ source, params });
  }

  async getAllAsync<T>(source: string): Promise<T[]> {
    const table = source.match(/FROM\s+([a-z_]+)/i)?.[1] ?? "";
    return (this.rowsByTable[table] ?? []) as T[];
  }
}

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
  titulo: "Actividad SQLite",
  descripcion: "Prueba de adapter",
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

describe("classroomSqliteStorage", () => {
  it("declara schema con tablas e indices academicos esperados", () => {
    expect(CLASSROOM_SQLITE_SCHEMA).toContain("CREATE TABLE IF NOT EXISTS groups");
    expect(CLASSROOM_SQLITE_SCHEMA).toContain("CREATE TABLE IF NOT EXISTS students");
    expect(CLASSROOM_SQLITE_SCHEMA).toContain("CREATE TABLE IF NOT EXISTS sync_queue");
    expect(CLASSROOM_SQLITE_SCHEMA).toContain("idx_students_group_id");
    expect(CLASSROOM_SQLITE_SCHEMA).toContain("idx_sync_queue_entity_created_at");
  });

  it("mapea claves AsyncStorage academicas hacia tablas SQLite", () => {
    expect(CLASSROOM_SQLITE_TABLE_BY_KEY[CLASSROOM_STORAGE_KEYS.grupos]?.table).toBe("groups");
    expect(CLASSROOM_SQLITE_TABLE_BY_KEY[CLASSROOM_STORAGE_KEYS.alumnos]?.table).toBe("students");
    expect(CLASSROOM_SQLITE_TABLE_BY_KEY[CLASSROOM_STORAGE_KEYS.tareasLegacy]?.table).toBe("tasks");
    expect(CLASSROOM_SQLITE_TABLE_BY_KEY[CLASSROOM_STORAGE_KEYS.entregas]?.table).toBe("submissions");
  });

  it("inicializa schema una sola vez y escribe filas normalizadas", async () => {
    const db = new FakeSQLiteDatabase();
    const storage = new ExpoSQLiteClassroomStorage(db);

    await storage.writeArray(CLASSROOM_STORAGE_KEYS.grupos, [grupo]);
    await storage.writeArray(CLASSROOM_STORAGE_KEYS.alumnos, [alumno]);
    await storage.writeArray(CLASSROOM_STORAGE_KEYS.tareas, [tarea]);

    expect(db.execStatements).toHaveLength(1);
    expect(db.runCalls).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: expect.stringContaining("DELETE FROM groups"),
        }),
        expect.objectContaining({
          source: expect.stringContaining("INSERT OR REPLACE INTO groups"),
          params: expect.objectContaining({ $id: 1, $name: "1A Matematicas" }),
        }),
        expect.objectContaining({
          source: expect.stringContaining("INSERT OR REPLACE INTO students"),
          params: expect.objectContaining({ $id: 10, $groupId: 1 }),
        }),
        expect.objectContaining({
          source: expect.stringContaining("INSERT OR REPLACE INTO tasks"),
          params: expect.objectContaining({ $id: 20, $groupId: 1 }),
        }),
      ]),
    );
  });

  it("lee payload_json desde la tabla asociada a la clave", async () => {
    const db = new FakeSQLiteDatabase();
    db.rowsByTable.students = [{ payload_json: JSON.stringify(alumno) }];
    const storage = new ExpoSQLiteClassroomStorage(db);

    const result = await storage.readArray<Alumno>(CLASSROOM_STORAGE_KEYS.alumnos);

    expect(result).toEqual([expect.objectContaining({ id: 10, nombre: "Ana" })]);
  });
});
